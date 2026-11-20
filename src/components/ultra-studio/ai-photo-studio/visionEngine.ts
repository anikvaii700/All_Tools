import type {
  ImageSegmenter as MPImageSegmenter,
  FaceDetector as MPFaceDetector,
} from '@mediapipe/tasks-vision';
import { removeImageBackground } from '../../../utils/imageCutout';
import { CropTransform, PassportPresetSpec } from './types';

const WASM_CDN_BASE = '/mediapipe-wasm';
const WASM_CDN_FALLBACK =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm';

const SELFIE_SEGMENTER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

const FACE_DETECTOR_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

type MediaPipeVisionModule = typeof import('@mediapipe/tasks-vision');

let mpModulePromise: Promise<MediaPipeVisionModule> | null = null;
let visionResolverPromise: Promise<any> | null = null;
let segmenterPromise: Promise<MPImageSegmenter> | null = null;
let faceDetectorPromise: Promise<MPFaceDetector> | null = null;

async function loadMediaPipeVision(): Promise<MediaPipeVisionModule> {
  if (!mpModulePromise) {
    mpModulePromise = import('@mediapipe/tasks-vision').catch((err) => {
      mpModulePromise = null;
      throw err;
    });
  }
  return mpModulePromise;
}

async function getVisionResolver() {
  if (!visionResolverPromise) {
    visionResolverPromise = (async () => {
      const { FilesetResolver } = await loadMediaPipeVision();
      return FilesetResolver.forVisionTasks(WASM_CDN_BASE).catch(() =>
        FilesetResolver.forVisionTasks(WASM_CDN_FALLBACK)
      );
    })().catch((err) => {
      visionResolverPromise = null;
      throw err;
    });
  }
  return visionResolverPromise;
}

async function getImageSegmenter(): Promise<MPImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const [{ ImageSegmenter }, vision] = await Promise.all([
        loadMediaPipeVision(),
        getVisionResolver(),
      ]);
      try {
        return await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: SELFIE_SEGMENTER_MODEL,
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch {
        return await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: SELFIE_SEGMENTER_MODEL,
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      }
    })().catch((err) => {
      segmenterPromise = null;
      throw err;
    });
  }
  return segmenterPromise;
}

async function getFaceDetector(): Promise<MPFaceDetector> {
  if (!faceDetectorPromise) {
    faceDetectorPromise = (async () => {
      const [{ FaceDetector }, vision] = await Promise.all([
        loadMediaPipeVision(),
        getVisionResolver(),
      ]);
      try {
        return await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FACE_DETECTOR_MODEL,
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          minDetectionConfidence: 0.45,
        });
      } catch {
        return await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FACE_DETECTOR_MODEL,
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          minDetectionConfidence: 0.45,
        });
      }
    })().catch((err) => {
      faceDetectorPromise = null;
      throw err;
    });
  }
  return faceDetectorPromise;
}

export interface PortraitMaskResult {
  width: number;
  height: number;
  alpha: Float32Array;
  engine: 'mediapipe-wasm' | 'offline-floodfill';
}

/**
 * Generates a high-resolution soft foreground person alpha mask (0..1)
 * completely free in the browser using MediaPipe WASM Selfie Segmenter,
 * with automatic offline flood-fill cutout fallback.
 */
export async function segmentPortraitMask(
  imgElement: HTMLImageElement,
  onProgress?: (stage: string) => void
): Promise<PortraitMaskResult> {
  const natW = imgElement.naturalWidth || imgElement.width;
  const natH = imgElement.naturalHeight || imgElement.height;

  // Prepare an appropriately sized input canvas (max 1024px) for fast high-precision neural inference
  const maxDim = 1024;
  let procW = natW;
  let procH = natH;
  if (Math.max(natW, natH) > maxDim) {
    const scale = maxDim / Math.max(natW, natH);
    procW = Math.max(64, Math.round(natW * scale));
    procH = Math.max(64, Math.round(natH * scale));
  }

  const inputCanvas = document.createElement('canvas');
  inputCanvas.width = procW;
  inputCanvas.height = procH;
  const inputCtx = inputCanvas.getContext('2d');
  if (inputCtx) {
    inputCtx.drawImage(imgElement, 0, 0, procW, procH);
  }

  // Primary engine: Free MediaPipe WASM Neural Selfie Segmenter
  try {
    onProgress?.('ফ্রি লোকাল নিউরাল মডেল লোড হচ্ছে (প্রথমবার ২-৩ সেকেন্ড)...');
    const segmenter = await getImageSegmenter();
    onProgress?.('ছবির ব্যাকগ্রাউন্ড ও সাবজেক্ট আলাদা করা হচ্ছে...');

    const result = segmenter.segment(inputCanvas);
    const masks = result.confidenceMasks;

    if (masks && masks.length > 0) {
      // Selfie segmenter emits either 1 mask (person) or 2 masks ([background, person])
      const targetMask = masks.length >= 2 ? masks[1] : masks[0];
      const maskW = targetMask.width;
      const maskH = targetMask.height;
      const rawFloat = targetMask.getAsFloat32Array();
      const alpha = new Float32Array(rawFloat.length);

      // Copy values and verify orientation (foreground should have higher confidence in center than top corners)
      let borderSum = 0;
      let borderCount = 0;
      let centerSum = 0;
      let centerCount = 0;

      const cornerSizeX = Math.max(4, Math.floor(maskW * 0.1));
      const cornerSizeY = Math.max(4, Math.floor(maskH * 0.1));

      for (let y = 0; y < cornerSizeY; y++) {
        for (let x = 0; x < cornerSizeX; x++) {
          borderSum += rawFloat[y * maskW + x];
          borderSum += rawFloat[y * maskW + (maskW - 1 - x)];
          borderCount += 2;
        }
      }

      const cStartX = Math.floor(maskW * 0.35);
      const cEndX = Math.floor(maskW * 0.65);
      const cStartY = Math.floor(maskH * 0.25);
      const cEndY = Math.floor(maskH * 0.7);
      for (let y = cStartY; y < cEndY; y += 2) {
        for (let x = cStartX; x < cEndX; x += 2) {
          centerSum += rawFloat[y * maskW + x];
          centerCount++;
        }
      }

      const borderAvg = borderCount > 0 ? borderSum / borderCount : 0;
      const centerAvg = centerCount > 0 ? centerSum / centerCount : 1;
      const shouldInvert = borderAvg > centerAvg + 0.12;

      for (let i = 0; i < rawFloat.length; i++) {
        const v = Math.max(0, Math.min(1, rawFloat[i]));
        alpha[i] = shouldInvert ? 1 - v : v;
      }

      // Close MediaPipe WebGL textures to prevent memory leaks
      result.close();

      return {
        width: maskW,
        height: maskH,
        alpha,
        engine: 'mediapipe-wasm',
      };
    }

    result.close();
  } catch (err) {
    console.warn('MediaPipe WASM segmentation unavailable, switching to offline cutout engine:', err);
  }

  // Fallback engine: 100% offline flood-fill cutout from existing imageCutout utility
  onProgress?.('অফলাইন কাটআউট ইঞ্জিন দিয়ে ব্যাকগ্রাউন্ড সরানো হচ্ছে...');
  const cutoutDataUrl = await removeImageBackground(inputCanvas.toDataURL('image/png'), {
    tolerance: 44,
    feather: true,
    defringe: true,
  });

  const cutoutImg = await loadImageAsync(cutoutDataUrl);
  const w = cutoutImg.naturalWidth || procW;
  const h = cutoutImg.naturalHeight || procH;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const alpha = new Float32Array(w * h);

  if (ctx) {
    ctx.drawImage(cutoutImg, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let i = 0; i < w * h; i++) {
      alpha[i] = data[i * 4 + 3] / 255;
    }
  } else {
    alpha.fill(1);
  }

  return {
    width: w,
    height: h,
    alpha,
    engine: 'offline-floodfill',
  };
}

export interface DetectedFaceBox {
  // Normalized coordinates (0..1 relative to image dimensions)
  x: number;
  y: number;
  width: number;
  height: number;
  eyeY: number;
  centerX: number;
  headTopY: number;
  chinY: number;
  engine: 'mediapipe-wasm' | 'mask-silhouette' | 'heuristic';
}

/**
 * Inspects a foreground segmentation mask to find the true top of the head
 * (preserving hair, turban, hijab, or cap) and horizontal center of the head region.
 */
function analyzeHeadFromMask(
  mask: PortraitMaskResult,
  faceHint?: { x: number; y: number; width: number; height: number }
): { headTopY: number; headBottomY: number; centerX: number; headWidth: number } | null {
  const { width: mw, height: mh, alpha } = mask;
  if (mw <= 4 || mh <= 4 || alpha.length !== mw * mh) return null;

  const xMin = faceHint
    ? Math.max(0, Math.floor((faceHint.x - faceHint.width * 0.25) * mw))
    : Math.floor(mw * 0.05);
  const xMax = faceHint
    ? Math.min(mw - 1, Math.ceil((faceHint.x + faceHint.width * 1.25) * mw))
    : Math.floor(mw * 0.95);
  const ySearchBottom = faceHint
    ? Math.min(mh - 1, Math.ceil((faceHint.y + faceHint.height * 0.6) * mh))
    : mh - 1;

  // Find topmost row with meaningful foreground pixels inside the column band
  let topRow = -1;
  const minPixelsInRow = Math.max(2, Math.round((xMax - xMin + 1) * 0.08));
  for (let y = 0; y <= ySearchBottom; y++) {
    let fgCount = 0;
    const rowOff = y * mw;
    for (let x = xMin; x <= xMax; x++) {
      if (alpha[rowOff + x] > 0.45) fgCount++;
    }
    if (fgCount >= minPixelsInRow) {
      topRow = y;
      break;
    }
  }

  if (topRow < 0) return null;

  // Find bottommost row of the person in the whole mask
  let bottomRow = mh - 1;
  for (let y = mh - 1; y >= topRow; y--) {
    let fgCount = 0;
    const rowOff = y * mw;
    for (let x = 0; x < mw; x++) {
      if (alpha[rowOff + x] > 0.45) fgCount++;
    }
    if (fgCount >= Math.max(3, Math.round(mw * 0.04))) {
      bottomRow = y;
      break;
    }
  }

  const personSpanH = Math.max(8, bottomRow - topRow);

  // Measure horizontal center & width near the head band (top 8%..28% of person or around faceHint)
  const bandStart = faceHint
    ? Math.max(topRow, Math.floor(faceHint.y * mh))
    : Math.min(mh - 1, Math.round(topRow + personSpanH * 0.06));
  const bandEnd = faceHint
    ? Math.min(mh - 1, Math.ceil((faceHint.y + faceHint.height) * mh))
    : Math.min(mh - 1, Math.round(topRow + personSpanH * 0.28));

  let sumX = 0;
  let countX = 0;
  let minFgX = mw;
  let maxFgX = 0;
  for (let y = bandStart; y <= bandEnd; y++) {
    const rowOff = y * mw;
    for (let x = xMin; x <= xMax; x++) {
      if (alpha[rowOff + x] > 0.48) {
        sumX += x;
        countX++;
        if (x < minFgX) minFgX = x;
        if (x > maxFgX) maxFgX = x;
      }
    }
  }

  const centerX = countX > 0 ? sumX / countX / mw : 0.5;
  const headWidth = countX > 0 ? Math.max(0.1, (maxFgX - minFgX) / mw) : 0.35;
  const headTopY = topRow / mh;
  // Estimate chin if no face hint: roughly 1.25 * headWidth in aspect-corrected terms, bounded by person height
  const estHeadH = Math.min(personSpanH / mh * 0.65, Math.max(0.16, headWidth * 1.15));
  const headBottomY = Math.min(0.95, headTopY + estHeadH);

  return { headTopY, headBottomY, centerX, headWidth };
}

/**
 * Detects the primary human face in any photo (WhatsApp, phone camera, full-body, or selfie)
 * using MediaPipe BlazeFace (free WASM) + optional segmentation mask head-top measurement
 * so passport/ID framing automatically crops & centers head and shoulders cleanly.
 */
export async function detectPrimaryFace(
  imgElement: HTMLImageElement,
  maskData?: PortraitMaskResult | null
): Promise<DetectedFaceBox> {
  const natW = imgElement.naturalWidth || imgElement.width || 600;
  const natH = imgElement.naturalHeight || imgElement.height || 750;

  try {
    const detector = await getFaceDetector();
    const maxDim = 768;
    let w = natW;
    let h = natH;
    if (Math.max(natW, natH) > maxDim) {
      const s = maxDim / Math.max(natW, natH);
      w = Math.round(natW * s);
      h = Math.round(natH * s);
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgElement, 0, 0, w, h);
      const res = detector.detect(canvas);
      if (res.detections && res.detections.length > 0) {
        // Choose largest / most prominent face bounding box
        let best = res.detections[0];
        let bestArea = 0;
        for (const d of res.detections) {
          const b = d.boundingBox;
          if (!b) continue;
          const area = b.width * b.height;
          if (area > bestArea) {
            bestArea = area;
            best = d;
          }
        }

        const bb = best.boundingBox;
        if (bb) {
          const normX = bb.originX / w;
          const normY = bb.originY / h;
          const normW = bb.width / w;
          const normH = bb.height / h;

          // Estimate eye Y from keypoints (0 = right eye, 1 = left eye) if available
          let eyeY = normY + normH * 0.36;
          if (best.keypoints && best.keypoints.length >= 2) {
            eyeY = (best.keypoints[0].y + best.keypoints[1].y) / 2;
          }

          // Refine headTopY using segmentation mask (protects hair, turban, hijab, cap from being cropped)
          let headTopY = Math.max(0, normY - normH * 0.34);
          const chinY = Math.min(0.98, normY + normH * 1.05);
          if (maskData) {
            const maskHead = analyzeHeadFromMask(maskData, {
              x: normX,
              y: normY,
              width: normW,
              height: normH,
            });
            if (maskHead && maskHead.headTopY < normY && normY - maskHead.headTopY < normH * 1.15) {
              headTopY = Math.min(headTopY, maskHead.headTopY);
            }
          }

          return {
            x: normX,
            y: normY,
            width: normW,
            height: normH,
            eyeY,
            centerX: normX + normW / 2,
            headTopY,
            chinY,
            engine: 'mediapipe-wasm',
          };
        }
      }
    }
  } catch (err) {
    console.warn('MediaPipe face detector fallback:', err);
  }

  // Secondary smart fallback: use foreground segmentation mask silhouette
  if (maskData) {
    const maskHead = analyzeHeadFromMask(maskData);
    if (maskHead) {
      const hSpan = Math.max(0.18, maskHead.headBottomY - maskHead.headTopY);
      return {
        x: Math.max(0, maskHead.centerX - maskHead.headWidth / 2),
        y: maskHead.headTopY + hSpan * 0.18,
        width: maskHead.headWidth,
        height: hSpan * 0.78,
        eyeY: maskHead.headTopY + hSpan * 0.48,
        centerX: maskHead.centerX,
        headTopY: maskHead.headTopY,
        chinY: maskHead.headBottomY,
        engine: 'mask-silhouette',
      };
    }
  }

  // Graceful heuristic portrait center fallback
  return {
    x: 0.28,
    y: 0.16,
    width: 0.44,
    height: 0.38,
    eyeY: 0.34,
    centerX: 0.5,
    headTopY: 0.08,
    chinY: 0.56,
    engine: 'heuristic',
  };
}

/**
 * Computes studio-grade passport/ID CropTransform (zoom, panX, panY) so ANY photo
 * (full-body WhatsApp photo, wide landscape shot, or phone selfie) automatically crops
 * cleanly to official head-and-shoulders passport proportions without slicing hair or turbans.
 */
export function computePassportAutoCrop(
  face: DetectedFaceBox,
  preset: PassportPresetSpec,
  naturalW: number,
  naturalH: number
): CropTransform {
  const targetAspect = preset.widthMm / preset.heightMm;
  const imgAspect = naturalW / Math.max(1, naturalH);

  // In cover-aspect framing:
  // If imgAspect > targetAspect -> baseDrawH = targetH, baseDrawW = targetH * imgAspect
  // Else -> baseDrawW = targetW, baseDrawH = targetW / imgAspect
  const baseScaleW = imgAspect > targetAspect ? imgAspect / targetAspect : 1;
  const baseScaleH = imgAspect > targetAspect ? 1 : targetAspect / imgAspect;

  // Full head span from crown/hair/turban top to chin
  const fullHeadHeightNorm = Math.min(
    0.88,
    Math.max(0.08, face.chinY - face.headTopY)
  );

  // Target full-head height fraction inside the passport frame (typically 54%–62% so crown sits at ~10% and chin at ~68%, leaving clean shoulders below)
  const targetHeadRatio =
    preset.headRatioMin && preset.headRatioMax
      ? Math.min(0.64, Math.max(0.48, (preset.headRatioMin + preset.headRatioMax) * 0.43))
      : 0.56;

  // Current head height fraction of target frame at zoom = 1
  const currentHeadFraction = fullHeadHeightNorm * baseScaleH;

  // Allow up to 4.5x zoom so full-body WhatsApp / phone shots crop right onto head & shoulders!
  // Also allow zooming slightly out to 0.92 if the source selfie is super close-up.
  const desiredZoom = Math.min(4.5, Math.max(0.92, targetHeadRatio / Math.max(0.05, currentHeadFraction)));

  const drawWRatio = baseScaleW * desiredZoom;
  const drawHRatio = baseScaleH * desiredZoom;

  // Dynamic pan limits (so faces near the top of a standing full-body photo can pan all the way into center!)
  const maxPanX = Math.min(250, Math.max(100, Math.round((drawWRatio - 1) * 100 + 30)));
  const maxPanY = Math.min(250, Math.max(100, Math.round((drawHRatio - 1) * 100 + 35)));

  // Center X horizontally -> face.centerX maps to 0.50
  const rawPanX = (0.5 - face.centerX) * drawWRatio * 200;
  const panX = Math.max(-maxPanX, Math.min(maxPanX, rawPanX));

  // Position top of head/turban cleanly at ~10% from top edge (or keep eyes around ~40% from top)
  const targetHeadTopPos = 0.1;
  const panYFromTop = (targetHeadTopPos - 0.5 + (0.5 - face.headTopY) * drawHRatio) * 200;
  const targetEyePos = 0.41;
  const panYFromEye = (targetEyePos - 0.5 + (0.5 - face.eyeY) * drawHRatio) * 200;

  // Blend headTop anchor and eye anchor, ensuring crown never gets clipped above y = 0.06
  let rawPanY = panYFromTop * 0.6 + panYFromEye * 0.4;
  const resultingTopY = 0.5 + rawPanY / 200 + (face.headTopY - 0.5) * drawHRatio;
  if (resultingTopY < 0.07) {
    rawPanY += (0.07 - resultingTopY) * 200;
  }

  const panY = Math.max(-maxPanY, Math.min(maxPanY, rawPanY));

  return {
    zoom: Math.round(desiredZoom * 100) / 100,
    panX: Math.round(panX),
    panY: Math.round(panY),
    rotation: 0,
    flipH: false,
  };
}

function loadImageAsync(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
