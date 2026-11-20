import { jsPDF } from 'jspdf';
import { DPI_300_PX_PER_MM } from '../clientImageProcessor';
import { getBackgroundById } from './backgroundLibrary';
import { getStyleById } from './styleCatalog';
import {
  AttireOverlayConfig,
  PAPER_SIZE_SPECS,
  PASSPORT_PRESET_SPECS,
  PhotoEditSnapshot,
  PrintSheetConfig,
  StudioPhotoEntry,
  StyleColorParams,
} from './types';

// Cache loaded backdrop HTMLImageElements so rendering stays instant
const backdropImageCache = new Map<string, HTMLImageElement>();

export function loadBackdropImage(url: string): Promise<HTMLImageElement> {
  const existing = backdropImageCache.get(url);
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      backdropImageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export function getPhotoTargetDimensionsMm(
  edit: PhotoEditSnapshot,
  naturalW: number,
  naturalH: number
): { widthMm: number; heightMm: number } {
  if (edit.passportPreset === 'original-free') {
    const aspect = naturalW > 0 && naturalH > 0 ? naturalW / naturalH : 0.75;
    // Default physical print reference for free aspect: ~100mm tall or wide
    if (aspect >= 1) {
      return { widthMm: 120, heightMm: Math.round((120 / aspect) * 10) / 10 };
    }
    return { widthMm: Math.round(120 * aspect * 10) / 10, heightMm: 120 };
  }

  if (edit.passportPreset === 'custom') {
    if (edit.customUnit === 'px') {
      return {
        widthMm: Math.max(10, Math.round((edit.customPxWidth / DPI_300_PX_PER_MM) * 10) / 10),
        heightMm: Math.max(10, Math.round((edit.customPxHeight / DPI_300_PX_PER_MM) * 10) / 10),
      };
    }
    return {
      widthMm: Math.max(10, edit.customWidthMm || 45),
      heightMm: Math.max(10, edit.customHeightMm || 55),
    };
  }

  const preset =
    PASSPORT_PRESET_SPECS.find((p) => p.id === edit.passportPreset) ||
    PASSPORT_PRESET_SPECS[0];
  return { widthMm: preset.widthMm, heightMm: preset.heightMm };
}

export function getPhotoExportPixels(
  edit: PhotoEditSnapshot,
  naturalW: number,
  naturalH: number,
  dpi = 300
): { widthPx: number; heightPx: number } {
  const pxPerMm = dpi / 25.4;

  if (edit.passportPreset === 'original-free') {
    // Preserve high-res natural image dimensions (capped to 2400px for memory safety)
    const maxDim = 2400;
    if (Math.max(naturalW, naturalH) > maxDim) {
      const scale = maxDim / Math.max(naturalW, naturalH);
      return {
        widthPx: Math.max(64, Math.round(naturalW * scale)),
        heightPx: Math.max(64, Math.round(naturalH * scale)),
      };
    }
    return { widthPx: Math.max(64, naturalW), heightPx: Math.max(64, naturalH) };
  }

  if (edit.passportPreset === 'custom' && edit.customUnit === 'px') {
    return {
      widthPx: Math.max(64, Math.min(4000, Math.round(edit.customPxWidth || 600))),
      heightPx: Math.max(64, Math.min(4000, Math.round(edit.customPxHeight || 600))),
    };
  }

  const preset = PASSPORT_PRESET_SPECS.find((p) => p.id === edit.passportPreset);
  if (preset?.fixedPxWidth && preset?.fixedPxHeight) {
    return { widthPx: preset.fixedPxWidth, heightPx: preset.fixedPxHeight };
  }

  const { widthMm, heightMm } = getPhotoTargetDimensionsMm(edit, naturalW, naturalH);
  return {
    widthPx: Math.max(64, Math.round(widthMm * pxPerMm)),
    heightPx: Math.max(64, Math.round(heightMm * pxPerMm)),
  };
}

export interface RenderPhotoOptions {
  maxDimension?: number;
  targetPxW?: number;
  targetPxH?: number;
  showOriginalOnly?: boolean;
}

/**
 * Full client-side studio rendering pipeline:
 * 1. Backdrop (solid / gradient / bundled high-res photo / custom uploaded / transparent)
 * 2. Neural or offline soft-edge cutout compositing with edge feather & defringe
 * 3. Cover-aspect crop, zoom, pan, rotation, horizontal flip
 * 4. Optional free vector formal attire overlay (suits, ties, panjabis, graduation gown)
 * 5. Multi-stage color grading, auto-restore, auto-lighting, skin smoothing, clarity, studio key light, split-toning, vignette, grain, and frame borders
 */
export async function renderStudioPhotoToCanvas(
  photo: StudioPhotoEntry,
  options: RenderPhotoOptions = {}
): Promise<HTMLCanvasElement> {
  const { edit, imgElement, naturalWidth, naturalHeight } = photo;
  const exportPx = getPhotoExportPixels(edit, naturalWidth, naturalHeight, 300);

  let outW = options.targetPxW || exportPx.widthPx;
  let outH = options.targetPxH || exportPx.heightPx;

  if (options.maxDimension && Math.max(outW, outH) > options.maxDimension) {
    const scale = options.maxDimension / Math.max(outW, outH);
    outW = Math.max(48, Math.round(outW * scale));
    outH = Math.max(48, Math.round(outH * scale));
  }

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If rendering raw "Before" view for split slider: apply same crop geometry without filters/backdrop/attire
  if (options.showOriginalOnly) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
    drawTransformedSubject(ctx, imgElement, outW, outH, edit.crop);
    return canvas;
  }

  const bgItem = getBackgroundById(edit.backgroundId);
  const usingCustomBg = edit.backgroundId === 'bg-custom' && !!edit.customBgUrl;
  const usingCustomColor = edit.backgroundId === 'bg-custom-color';
  const shouldReplaceBg =
    edit.cutout.enabled &&
    photo.maskData !== null &&
    (usingCustomBg || usingCustomColor || bgItem.mode !== 'original');

  // STEP 1: Draw Background Layer
  if (shouldReplaceBg) {
    if (usingCustomColor) {
      ctx.fillStyle = edit.customBgColor || '#ffffff';
      ctx.fillRect(0, 0, outW, outH);
    } else if (usingCustomBg && edit.customBgUrl) {
      try {
        const bgImg = await loadBackdropImage(edit.customBgUrl);
        drawImageBackdrop(ctx, bgImg, outW, outH, 0, edit.cutout.bgBlur, undefined);
      } catch {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);
      }
    } else if (bgItem.mode === 'solid') {
      ctx.fillStyle = bgItem.solidHex || '#ffffff';
      ctx.fillRect(0, 0, outW, outH);
    } else if (bgItem.mode === 'gradient' && bgItem.gradientStops) {
      let grad: CanvasGradient;
      if (bgItem.gradientType === 'radial') {
        grad = ctx.createRadialGradient(
          outW * 0.5,
          outH * 0.42,
          outW * 0.05,
          outW * 0.5,
          outH * 0.45,
          Math.max(outW, outH) * 0.85
        );
      } else {
        grad = ctx.createLinearGradient(0, 0, outW * 0.7, outH);
      }
      bgItem.gradientStops.forEach((s) => grad.addColorStop(s.offset, s.color));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, outW, outH);
    } else if (bgItem.mode === 'image' && bgItem.imageUrl) {
      try {
        const bgImg = await loadBackdropImage(bgItem.imageUrl);
        const totalBlur = Math.max(0, edit.cutout.bgBlur + (bgItem.defaultBlur ?? 0));
        drawImageBackdrop(
          ctx,
          bgImg,
          outW,
          outH,
          bgItem.cropInset ?? 0,
          totalBlur,
          bgItem.tintOverlay
        );
      } catch {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, outW, outH);
      }
    }
    // Note: if mode === 'transparent', leave canvas transparent
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
  }

  // STEP 2: Prepare Subject (either cutout masked canvas or original image)
  let subjectSource: HTMLImageElement | HTMLCanvasElement = imgElement;
  if (shouldReplaceBg && photo.maskData) {
    subjectSource = buildMaskedSubjectCanvas(
      imgElement,
      photo.maskData,
      edit.cutout.threshold,
      edit.cutout.feather,
      edit.cutout.defringe
    );
  }

  // STEP 3: Composite Subject with Crop, Zoom, Pan, Rotate, Flip
  drawTransformedSubject(ctx, subjectSource, outW, outH, edit.crop);

  // STEP 4: Optional Free Local Formal Attire Overlay
  if (edit.attire.id !== 'none') {
    drawAttireOverlay(ctx, outW, outH, edit.attire);
  }

  // STEP 5: Merge Style Preset + Manual Adjustments & Apply Pixel Pipeline
  const stylePreset = edit.styleId ? getStyleById(edit.styleId) : undefined;
  const merged = mergeColorParams(stylePreset?.params, edit);

  const needsPixelPipeline =
    edit.adjustments.autoRestore ||
    edit.adjustments.autoLighting ||
    merged.exposure !== 0 ||
    merged.contrast !== 0 ||
    merged.saturation !== 0 ||
    merged.temperature !== 0 ||
    merged.tint !== 0 ||
    merged.highlights !== 0 ||
    merged.shadows !== 0 ||
    merged.sepia > 0 ||
    merged.monochrome ||
    (merged.splitStrength ?? 0) > 0 ||
    merged.grain > 0;

  // Skin smoothing (gentle blurred blend on skin-hue pixels before sharpening)
  if (merged.skinSmooth > 0) {
    applyPortraitSkinSmooth(ctx, outW, outH, merged.skinSmooth);
  }

  // Clarity / Unsharp Mask
  if (merged.clarity > 0) {
    applyClaritySharpen(ctx, outW, outH, merged.clarity);
  }

  // Tone, White Balance, Auto-Restore, Auto-Lighting, Split-Tone, Film Grain
  if (needsPixelPipeline) {
    applyColorGradingPipeline(
      ctx,
      outW,
      outH,
      merged,
      edit.adjustments.autoRestore,
      edit.adjustments.autoLighting
    );
  }

  // Studio Softbox Key Light (radial portrait illumination)
  if (merged.studioLight > 0) {
    applyStudioSoftboxLight(ctx, outW, outH, merged.studioLight);
  }

  // Vignette
  if (merged.vignette > 0) {
    applyVignette(ctx, outW, outH, merged.vignette);
  }

  // Optional Editorial / Gallery Frame Border
  if (merged.frameBorder && merged.frameBorder !== 'none') {
    applyFrameBorder(ctx, outW, outH, merged.frameBorder);
  }

  return canvas;
}

function drawImageBackdrop(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement,
  outW: number,
  outH: number,
  cropInset: number,
  blurPx: number,
  tintOverlay?: string
) {
  const srcW = bgImg.naturalWidth || bgImg.width;
  const srcH = bgImg.naturalHeight || bgImg.height;
  const insetX = srcW * cropInset;
  const insetY = srcH * cropInset;
  const usableW = srcW - insetX * 2;
  const usableH = srcH - insetY * 2;

  const targetAspect = outW / outH;
  const bgAspect = usableW / usableH;

  let sx = insetX;
  let sy = insetY;
  let sw = usableW;
  let sh = usableH;

  if (bgAspect > targetAspect) {
    sw = usableH * targetAspect;
    sx = insetX + (usableW - sw) / 2;
  } else {
    sh = usableW / targetAspect;
    sy = insetY + (usableH - sh) / 2;
  }

  ctx.save();
  if (blurPx > 0) {
    const scaledBlur = Math.max(0.5, (blurPx / 700) * Math.max(outW, outH));
    ctx.filter = `blur(${scaledBlur.toFixed(1)}px)`;
    // Slight bleed overscan so blur doesn't show transparent edges
    const bleed = Math.ceil(scaledBlur * 2.2);
    ctx.drawImage(bgImg, sx, sy, sw, sh, -bleed, -bleed, outW + bleed * 2, outH + bleed * 2);
  } else {
    ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, outW, outH);
  }
  ctx.restore();

  if (tintOverlay) {
    ctx.save();
    ctx.fillStyle = tintOverlay;
    ctx.fillRect(0, 0, outW, outH);
    ctx.restore();
  }
}

function buildMaskedSubjectCanvas(
  imgElement: HTMLImageElement,
  maskData: NonNullable<StudioPhotoEntry['maskData']>,
  threshold: number,
  feather: number,
  defringe: number
): HTMLCanvasElement {
  const natW = imgElement.naturalWidth || imgElement.width;
  const natH = imgElement.naturalHeight || imgElement.height;

  // Work at up to 1400px for crisp hair & shoulder matting
  const maxDim = 1400;
  let w = natW;
  let h = natH;
  if (Math.max(natW, natH) > maxDim) {
    const s = maxDim / Math.max(natW, natH);
    w = Math.round(natW * s);
    h = Math.round(natH * s);
  }

  // 1. Render soft alpha mask onto a small mask canvas, apply smooth threshold, then upscale with optional feather
  const mCanvas = document.createElement('canvas');
  mCanvas.width = maskData.width;
  mCanvas.height = maskData.height;
  const mCtx = mCanvas.getContext('2d');
  if (mCtx) {
    const mImg = mCtx.createImageData(maskData.width, maskData.height);
    const md = mImg.data;
    const band = 0.14; // Smooth sigmoid ramp width around threshold
    const low = Math.max(0.01, threshold - band);
    const high = Math.min(0.99, threshold + band);
    const invSpan = 1 / Math.max(0.02, high - low);

    for (let i = 0; i < maskData.alpha.length; i++) {
      const raw = maskData.alpha[i];
      let t = (raw - low) * invSpan;
      if (t <= 0) t = 0;
      else if (t >= 1) t = 1;
      else t = t * t * (3 - 2 * t); // smoothstep

      const a = Math.round(t * 255);
      const p = i * 4;
      md[p] = 255;
      md[p + 1] = 255;
      md[p + 2] = 255;
      md[p + 3] = a;
    }
    mCtx.putImageData(mImg, 0, 0);
  }

  // 2. Draw subject image and apply mask via destination-in
  const subjCanvas = document.createElement('canvas');
  subjCanvas.width = w;
  subjCanvas.height = h;
  const sCtx = subjCanvas.getContext('2d', { willReadFrequently: true });
  if (!sCtx) return subjCanvas;

  sCtx.drawImage(imgElement, 0, 0, w, h);

  // Upscale & feather alpha mask
  const scaledMask = document.createElement('canvas');
  scaledMask.width = w;
  scaledMask.height = h;
  const smCtx = scaledMask.getContext('2d');
  if (smCtx) {
    smCtx.imageSmoothingEnabled = true;
    smCtx.imageSmoothingQuality = 'high';
    if (feather > 0) {
      smCtx.filter = `blur(${(feather * 0.6).toFixed(1)}px)`;
    }
    smCtx.drawImage(mCanvas, 0, 0, w, h);
  }

  sCtx.globalCompositeOperation = 'destination-in';
  sCtx.drawImage(scaledMask, 0, 0, w, h);
  sCtx.globalCompositeOperation = 'source-over';

  // 3. Optional edge defringe (attenuates bright halo on semi-transparent boundary pixels)
  if (defringe > 0) {
    const imgData = sCtx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const strength = (defringe / 100) * 0.35;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a > 12 && a < 235) {
        const edgeFactor = 1 - (a / 255);
        const darken = 1 - edgeFactor * strength;
        d[i] = Math.round(d[i] * darken);
        d[i + 1] = Math.round(d[i + 1] * darken);
        d[i + 2] = Math.round(d[i + 2] * darken);
      }
    }
    sCtx.putImageData(imgData, 0, 0);
  }

  return subjCanvas;
}

function drawTransformedSubject(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  targetW: number,
  targetH: number,
  crop: PhotoEditSnapshot['crop']
) {
  const srcW =
    source instanceof HTMLImageElement ? source.naturalWidth || source.width : source.width;
  const srcH =
    source instanceof HTMLImageElement ? source.naturalHeight || source.height : source.height;
  if (srcW <= 0 || srcH <= 0) return;

  const isRotated90 = crop.rotation === 90 || crop.rotation === 270;
  const effectiveSrcW = isRotated90 ? srcH : srcW;
  const effectiveSrcH = isRotated90 ? srcW : srcH;

  const targetAspect = targetW / targetH;
  const imgAspect = effectiveSrcW / effectiveSrcH;

  let baseDrawW: number;
  let baseDrawH: number;
  if (imgAspect > targetAspect) {
    baseDrawH = targetH;
    baseDrawW = targetH * imgAspect;
  } else {
    baseDrawW = targetW;
    baseDrawH = targetW / imgAspect;
  }

  const drawW = baseDrawW * crop.zoom;
  const drawH = baseDrawH * crop.zoom;
  const panPxX = (crop.panX / 100) * (targetW * 0.5);
  const panPxY = (crop.panY / 100) * (targetH * 0.5);

  ctx.save();
  ctx.translate(targetW / 2 + panPxX, targetH / 2 + panPxY);
  if (crop.flipH) ctx.scale(-1, 1);
  if (crop.rotation !== 0) ctx.rotate((crop.rotation * Math.PI) / 180);

  if (isRotated90) {
    ctx.drawImage(source, -drawH / 2, -drawW / 2, drawH, drawW);
  } else {
    ctx.drawImage(source, -drawW / 2, -drawH / 2, drawW, drawH);
  }
  ctx.restore();
}

/**
 * Draws crisp, realistic shaded formal attire overlays (zero API cost)
 * anchored cleanly around the shoulders/collar zone and fully adjustable by user.
 */
function drawAttireOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  attire: AttireOverlayConfig
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0.4, Math.min(1, attire.opacity));

  const cx = w * (0.5 + attire.offsetX / 100);
  const neckY = h * (0.64 + attire.offsetY / 100);
  const scale = attire.scale;
  const u = w * 0.5 * scale; // horizontal half-unit

  ctx.translate(cx, neckY);

  const isPanjabi =
    attire.id === 'white-classic-panjabi' ||
    attire.id === 'cream-embroidered-panjabi' ||
    attire.id === 'maroon-festive-panjabi';

  if (attire.id === 'graduation-gown') {
    // Academic black gown + royal blue/gold stole
    const gownGrad = ctx.createLinearGradient(-u, 0, u, u * 1.1);
    gownGrad.addColorStop(0, '#1e293b');
    gownGrad.addColorStop(0.5, '#0f172a');
    gownGrad.addColorStop(1, '#020617');
    ctx.fillStyle = gownGrad;
    ctx.beginPath();
    ctx.moveTo(-u * 1.15, u * 1.25);
    ctx.quadraticCurveTo(-u * 1.02, u * 0.2, -u * 0.32, 0);
    ctx.lineTo(0, u * 0.32);
    ctx.lineTo(u * 0.32, 0);
    ctx.quadraticCurveTo(u * 1.02, u * 0.2, u * 1.15, u * 1.25);
    ctx.closePath();
    ctx.fill();

    // Inner white shirt V
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-u * 0.22, u * 0.02);
    ctx.lineTo(0, u * 0.38);
    ctx.lineTo(u * 0.22, u * 0.02);
    ctx.closePath();
    ctx.fill();

    // Royal blue academic hood stole with gold trim
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(-u * 0.42, u * 0.04);
    ctx.lineTo(-u * 0.24, u * 0.02);
    ctx.lineTo(-u * 0.02, u * 0.42);
    ctx.lineTo(-u * 0.2, u * 1.25);
    ctx.lineTo(-u * 0.48, u * 1.25);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(u * 0.42, u * 0.04);
    ctx.lineTo(u * 0.24, u * 0.02);
    ctx.lineTo(u * 0.02, u * 0.42);
    ctx.lineTo(u * 0.2, u * 1.25);
    ctx.lineTo(u * 0.48, u * 1.25);
    ctx.closePath();
    ctx.fill();

    // Gold academic trim
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = Math.max(2, u * 0.032);
    ctx.beginPath();
    ctx.moveTo(-u * 0.42, u * 0.04);
    ctx.lineTo(-u * 0.48, u * 1.25);
    ctx.moveTo(u * 0.42, u * 0.04);
    ctx.lineTo(u * 0.48, u * 1.25);
    ctx.stroke();

    ctx.restore();
    return;
  }

  if (isPanjabi) {
    const palette =
      attire.id === 'white-classic-panjabi'
        ? { main1: '#ffffff', main2: '#e2e8f0', trim: '#cbd5e1', accent: '#94a3b8' }
        : attire.id === 'cream-embroidered-panjabi'
        ? { main1: '#fffbeb', main2: '#f3e8c8', trim: '#d97706', accent: '#b45309' }
        : { main1: '#9f1239', main2: '#4c0519', trim: '#fbbf24', accent: '#fde68a' };

    // Panjabi shoulders & torso
    const grad = ctx.createLinearGradient(-u, 0, u, u * 1.1);
    grad.addColorStop(0, palette.main1);
    grad.addColorStop(0.55, palette.main1);
    grad.addColorStop(1, palette.main2);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-u * 1.12, u * 1.25);
    ctx.quadraticCurveTo(-u * 0.96, u * 0.22, -u * 0.26, u * 0.02);
    ctx.quadraticCurveTo(0, u * 0.14, u * 0.26, u * 0.02);
    ctx.quadraticCurveTo(u * 0.96, u * 0.22, u * 1.12, u * 1.25);
    ctx.closePath();
    ctx.fill();

    // Mandarin Band Collar
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = Math.max(2, u * 0.035);
    ctx.beginPath();
    ctx.moveTo(-u * 0.27, u * 0.02);
    ctx.quadraticCurveTo(0, u * 0.16, u * 0.27, u * 0.02);
    ctx.stroke();

    // Front Placket
    const placketW = u * 0.12;
    ctx.fillStyle = palette.main2;
    ctx.fillRect(-placketW / 2, u * 0.09, placketW, u * 0.82);
    ctx.strokeStyle = palette.trim;
    ctx.lineWidth = Math.max(1.5, u * 0.018);
    ctx.strokeRect(-placketW / 2, u * 0.09, placketW, u * 0.82);

    // Decorative buttons & embroidery motifs
    for (let i = 0; i < 4; i++) {
      const by = u * (0.22 + i * 0.17);
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.arc(0, by, Math.max(2, u * 0.024), 0, Math.PI * 2);
      ctx.fill();

      if (attire.id !== 'white-classic-panjabi') {
        ctx.strokeStyle = palette.trim;
        ctx.lineWidth = Math.max(1, u * 0.012);
        ctx.beginPath();
        ctx.moveTo(-placketW * 0.9, by);
        ctx.lineTo(-placketW * 0.55, by);
        ctx.moveTo(placketW * 0.55, by);
        ctx.lineTo(placketW * 0.9, by);
        ctx.stroke();
      }
    }

    ctx.restore();
    return;
  }

  // Formal Shirt & Suits
  const suitStyle =
    attire.id === 'black-business-suit'
      ? { jacket1: '#1e293b', jacket2: '#020617', lapel: '#0f172a', tie: '#1e3a8a', shirt: '#ffffff', hasJacket: true }
      : attire.id === 'navy-blazer-red-tie'
      ? { jacket1: '#1e3a8a', jacket2: '#172554', lapel: '#1e40af', tie: '#b91c1c', shirt: '#ffffff', hasJacket: true }
      : attire.id === 'charcoal-suit-blue-tie'
      ? { jacket1: '#475569', jacket2: '#1e293b', lapel: '#334155', tie: '#0284c7', shirt: '#f8fafc', hasJacket: true }
      : { jacket1: '#ffffff', jacket2: '#e2e8f0', lapel: '#f1f5f9', tie: '#1d4ed8', shirt: '#ffffff', hasJacket: false };

  // Shirt base
  const shirtGrad = ctx.createLinearGradient(-u, 0, u, u * 1.1);
  shirtGrad.addColorStop(0, suitStyle.shirt);
  shirtGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = shirtGrad;
  ctx.beginPath();
  ctx.moveTo(-u * 1.08, u * 1.25);
  ctx.quadraticCurveTo(-u * 0.92, u * 0.22, -u * 0.28, u * 0.01);
  ctx.lineTo(0, u * 0.14);
  ctx.lineTo(u * 0.28, u * 0.01);
  ctx.quadraticCurveTo(u * 0.92, u * 0.22, u * 1.08, u * 1.25);
  ctx.closePath();
  ctx.fill();

  // Shirt Collar flaps
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = Math.max(1.2, u * 0.014);
  ctx.beginPath();
  ctx.moveTo(-u * 0.28, u * 0.01);
  ctx.lineTo(-u * 0.14, u * 0.24);
  ctx.lineTo(0, u * 0.13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(u * 0.28, u * 0.01);
  ctx.lineTo(u * 0.14, u * 0.24);
  ctx.lineTo(0, u * 0.13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Silk Tie + Windsor Knot
  const tieGrad = ctx.createLinearGradient(0, u * 0.12, 0, u * 1.1);
  tieGrad.addColorStop(0, suitStyle.tie);
  tieGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = tieGrad;
  // Knot
  ctx.beginPath();
  ctx.moveTo(-u * 0.065, u * 0.13);
  ctx.lineTo(u * 0.065, u * 0.13);
  ctx.lineTo(u * 0.042, u * 0.26);
  ctx.lineTo(-u * 0.042, u * 0.26);
  ctx.closePath();
  ctx.fill();
  // Tie blade
  ctx.beginPath();
  ctx.moveTo(-u * 0.042, u * 0.26);
  ctx.lineTo(u * 0.042, u * 0.26);
  ctx.lineTo(u * 0.095, u * 1.15);
  ctx.lineTo(0, u * 1.25);
  ctx.lineTo(-u * 0.095, u * 1.15);
  ctx.closePath();
  ctx.fill();

  // Blazer / Suit Jacket over Shirt
  if (suitStyle.hasJacket) {
    const jGrad = ctx.createLinearGradient(-u, 0, u, u * 1.2);
    jGrad.addColorStop(0, suitStyle.jacket1);
    jGrad.addColorStop(0.5, suitStyle.jacket2);
    jGrad.addColorStop(1, suitStyle.jacket1);
    ctx.fillStyle = jGrad;

    // Left Jacket side
    ctx.beginPath();
    ctx.moveTo(-u * 1.16, u * 1.26);
    ctx.quadraticCurveTo(-u * 1.02, u * 0.2, -u * 0.34, 0);
    ctx.lineTo(-u * 0.26, u * 0.01);
    ctx.lineTo(0, u * 0.72);
    ctx.lineTo(-u * 0.03, u * 1.26);
    ctx.closePath();
    ctx.fill();

    // Right Jacket side
    ctx.beginPath();
    ctx.moveTo(u * 1.16, u * 1.26);
    ctx.quadraticCurveTo(u * 1.02, u * 0.2, u * 0.34, 0);
    ctx.lineTo(u * 0.26, u * 0.01);
    ctx.lineTo(0, u * 0.72);
    ctx.lineTo(u * 0.03, u * 1.26);
    ctx.closePath();
    ctx.fill();

    // Notched Lapels with subtle highlight stroke
    ctx.fillStyle = suitStyle.lapel;
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = Math.max(1.2, u * 0.012);

    ctx.beginPath();
    ctx.moveTo(-u * 0.34, 0);
    ctx.lineTo(-u * 0.45, u * 0.32);
    ctx.lineTo(-u * 0.35, u * 0.38);
    ctx.lineTo(-u * 0.42, u * 0.46);
    ctx.lineTo(0, u * 0.72);
    ctx.lineTo(-u * 0.26, u * 0.01);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(u * 0.34, 0);
    ctx.lineTo(u * 0.45, u * 0.32);
    ctx.lineTo(u * 0.35, u * 0.38);
    ctx.lineTo(u * 0.42, u * 0.46);
    ctx.lineTo(0, u * 0.72);
    ctx.lineTo(u * 0.26, u * 0.01);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function mergeColorParams(
  preset: StyleColorParams | undefined,
  edit: PhotoEditSnapshot
): StyleColorParams {
  const adj = edit.adjustments;
  const base: StyleColorParams = preset || {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    clarity: 0,
    skinSmooth: 0,
    studioLight: 0,
    vignette: 0,
    grain: 0,
    sepia: 0,
    monochrome: false,
    frameBorder: 'none',
  };

  return {
    ...base,
    exposure: clamp(base.exposure + adj.exposure, -50, 50),
    contrast: clamp(base.contrast + adj.contrast, -50, 65),
    saturation: clamp(base.saturation + adj.saturation, -100, 80),
    temperature: clamp(base.temperature + adj.temperature, -50, 50),
    clarity: clamp(base.clarity + adj.clarity, 0, 100),
    skinSmooth: clamp(base.skinSmooth + adj.skinSmooth, 0, 100),
    studioLight: clamp(base.studioLight + adj.studioLight, 0, 100),
  };
}

function applyPortraitSkinSmooth(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number
) {
  const strength = Math.min(0.65, (amount / 100) * 0.58);
  if (strength <= 0.02) return;

  // Create softly blurred copy
  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = w;
  blurCanvas.height = h;
  const bCtx = blurCanvas.getContext('2d', { willReadFrequently: true });
  if (!bCtx) return;

  const radius = Math.max(1.2, (Math.max(w, h) / 600) * 3.2);
  bCtx.filter = `blur(${radius.toFixed(1)}px)`;
  bCtx.drawImage(ctx.canvas, 0, 0);

  const orig = ctx.getImageData(0, 0, w, h);
  const soft = bCtx.getImageData(0, 0, w, h);
  const o = orig.data;
  const s = soft.data;

  // Blend blurred pixels gently where local detail difference is small (skin blemishes, not eyes/edges)
  for (let i = 0; i < o.length; i += 4) {
    if (o[i + 3] < 20) continue;
    const r = o[i];
    const g = o[i + 1];
    const b = o[i + 2];

    // Broad warm skin tone likelihood check + edge preservation
    const isSkinLike = r > 70 && g > 40 && b > 25 && r > g && r > b && r - b > 12;
    const diff = Math.abs(r - s[i]) + Math.abs(g - s[i + 1]) + Math.abs(b - s[i + 2]);
    if (isSkinLike && diff < 68) {
      const edgeWeight = 1 - diff / 68;
      const blend = strength * edgeWeight;
      o[i] = Math.round(r + (s[i] - r) * blend);
      o[i + 1] = Math.round(g + (s[i + 1] - g) * blend);
      o[i + 2] = Math.round(b + (s[i + 2] - b) * blend);
    }
  }

  ctx.putImageData(orig, 0, 0);
}

function applyClaritySharpen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  clarity: number
) {
  const amount = (clarity / 100) * 0.72;
  if (amount <= 0.02) return;

  const blurCanvas = document.createElement('canvas');
  blurCanvas.width = w;
  blurCanvas.height = h;
  const bCtx = blurCanvas.getContext('2d', { willReadFrequently: true });
  if (!bCtx) return;

  const radius = Math.max(0.8, Math.min(2.2, Math.max(w, h) / 700));
  bCtx.filter = `blur(${radius.toFixed(1)}px)`;
  bCtx.drawImage(ctx.canvas, 0, 0);

  const orig = ctx.getImageData(0, 0, w, h);
  const blur = bCtx.getImageData(0, 0, w, h);
  const o = orig.data;
  const b = blur.data;

  // Unsharp mask: orig + amount * (orig - blur)
  for (let i = 0; i < o.length; i += 4) {
    if (o[i + 3] < 20) continue;
    o[i] = clampByte(o[i] + (o[i] - b[i]) * amount);
    o[i + 1] = clampByte(o[i + 1] + (o[i + 1] - b[i + 1]) * amount);
    o[i + 2] = clampByte(o[i + 2] + (o[i + 2] - b[i + 2]) * amount);
  }

  ctx.putImageData(orig, 0, 0);
}

function applyColorGradingPipeline(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: StyleColorParams,
  autoRestore: boolean,
  autoLighting: boolean
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // Optional Auto-Restore / Auto-Lighting histogram statistics
  let minL = 0;
  let maxL = 255;
  let wbR = 1;
  let wbG = 1;
  let wbB = 1;
  let autoExpOffset = 0;
  let autoShadowLift = 0;

  if (autoRestore || autoLighting) {
    const hist = new Uint32Array(256);
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let count = 0;

    for (let i = 0; i < d.length; i += 16) {
      if (d[i + 3] < 128) continue;
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      hist[lum]++;
      sumR += r;
      sumG += g;
      sumB += b;
      count++;
    }

    if (count > 0) {
      const avgR = sumR / count;
      const avgG = sumG / count;
      const avgB = sumB / count;
      const avgLum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;

      if (autoRestore) {
        // 1.5% and 98.5% percentile auto-levels stretch
        const lowTarget = count * 0.015;
        const highTarget = count * 0.985;
        let acc = 0;
        for (let l = 0; l < 256; l++) {
          acc += hist[l];
          if (acc >= lowTarget) {
            minL = Math.min(48, l);
            break;
          }
        }
        acc = 0;
        for (let l = 255; l >= 0; l--) {
          acc += hist[l];
          if (acc >= count - highTarget) {
            maxL = Math.max(205, l);
            break;
          }
        }
        // Subtle gray-world color cast removal (35% blend so skin stays warm)
        const gray = (avgR + avgG + avgB) / 3;
        wbR = 1 + (gray / Math.max(1, avgR) - 1) * 0.35;
        wbG = 1 + (gray / Math.max(1, avgG) - 1) * 0.35;
        wbB = 1 + (gray / Math.max(1, avgB) - 1) * 0.35;
      }

      if (autoLighting) {
        if (avgLum < 125) {
          autoExpOffset = Math.min(26, (128 - avgLum) * 0.52);
          autoShadowLift = 18;
        } else if (avgLum > 175) {
          autoExpOffset = Math.max(-18, (165 - avgLum) * 0.35);
        } else {
          autoExpOffset = 6;
          autoShadowLift = 10;
        }
      }
    }
  }

  const levelSpan = Math.max(60, maxL - minL);
  const expOffset = p.exposure * 1.45 + autoExpOffset;
  const contrastVal = p.contrast * 1.4;
  const contrastFactor = (259 * (contrastVal + 255)) / (255 * (259 - contrastVal));
  const satFactor = 1 + p.saturation / 100;
  const tempShift = p.temperature * 0.85;
  const tintShift = p.tint * 0.65;
  const shadowsBoost = (p.shadows + autoShadowLift) * 0.012;
  const highlightsShift = p.highlights * 0.012;
  const sepiaAmt = p.sepia / 100;
  const splitStr = p.splitStrength ?? 0;
  const shCol = p.splitShadow;
  const hiCol = p.splitHighlight;
  const grainAmt = p.grain * 1.1;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;

    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];

    // 1. Auto-restore levels & white balance
    if (autoRestore) {
      r = ((r - minL) / levelSpan) * 255 * wbR;
      g = ((g - minL) / levelSpan) * 255 * wbG;
      b = ((b - minL) / levelSpan) * 255 * wbB;
    }

    // 2. Exposure, temperature, tint
    r += expOffset + tempShift + tintShift * 0.5;
    g += expOffset - tintShift * 0.5;
    b += expOffset - tempShift + tintShift * 0.5;

    // 3. Shadows & Highlights recovery
    const lumNorm = clamp((0.299 * r + 0.587 * g + 0.114 * b) / 255, 0, 1);
    if (shadowsBoost !== 0 && lumNorm < 0.55) {
      const wShadow = (0.55 - lumNorm) / 0.55;
      const lift = wShadow * wShadow * shadowsBoost * 85;
      r += lift;
      g += lift;
      b += lift;
    }
    if (highlightsShift !== 0 && lumNorm > 0.55) {
      const wHigh = (lumNorm - 0.55) / 0.45;
      const shift = wHigh * wHigh * highlightsShift * 75;
      r += shift;
      g += shift;
      b += shift;
    }

    // 4. Contrast
    if (contrastVal !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // 5. Monochrome or Saturation
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    if (p.monochrome) {
      r = luma;
      g = luma;
      b = luma;
    } else if (p.saturation !== 0) {
      r = luma + (r - luma) * satFactor;
      g = luma + (g - luma) * satFactor;
      b = luma + (b - luma) * satFactor;
    }

    // 6. Sepia toning
    if (sepiaAmt > 0) {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      r = r * (1 - sepiaAmt) + sr * sepiaAmt;
      g = g * (1 - sepiaAmt) + sg * sepiaAmt;
      b = b * (1 - sepiaAmt) + sb * sepiaAmt;
    }

    // 7. Split Toning (Shadows / Highlights)
    if (splitStr > 0) {
      const l = clamp((0.299 * r + 0.587 * g + 0.114 * b) / 255, 0, 1);
      if (shCol && l < 0.55) {
        const sw = ((0.55 - l) / 0.55) * splitStr;
        r = r * (1 - sw) + shCol[0] * sw;
        g = g * (1 - sw) + shCol[1] * sw;
        b = b * (1 - sw) + shCol[2] * sw;
      }
      if (hiCol && l > 0.45) {
        const hw = ((l - 0.45) / 0.55) * splitStr;
        r = r * (1 - hw) + hiCol[0] * hw;
        g = g * (1 - hw) + hiCol[1] * hw;
        b = b * (1 - hw) + hiCol[2] * hw;
      }
    }

    // 8. Subtle Film Grain (deterministic pseudo-noise)
    if (grainAmt > 0) {
      const n = ((((i * 1103515245 + 12345) >> 16) & 0xff) / 255 - 0.5) * grainAmt;
      r += n;
      g += n;
      b += n;
    }

    d[i] = clampByte(r);
    d[i + 1] = clampByte(g);
    d[i + 2] = clampByte(b);
  }

  ctx.putImageData(imgData, 0, 0);
}

function applyStudioSoftboxLight(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  studioLight: number
) {
  const alpha = Math.min(0.28, (studioLight / 100) * 0.24);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const grad = ctx.createRadialGradient(
    w * 0.5,
    h * 0.36,
    w * 0.04,
    w * 0.5,
    h * 0.4,
    Math.max(w, h) * 0.58
  );
  grad.addColorStop(0, `rgba(255, 253, 248, ${alpha.toFixed(3)})`);
  grad.addColorStop(0.55, `rgba(255, 252, 245, ${(alpha * 0.35).toFixed(3)})`);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function applyVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  vignette: number
) {
  const alpha = Math.min(0.75, (vignette / 80) * 0.65);
  ctx.save();
  const grad = ctx.createRadialGradient(
    w * 0.5,
    h * 0.48,
    Math.min(w, h) * 0.28,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.78
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.68, `rgba(10, 12, 18, ${(alpha * 0.25).toFixed(3)})`);
  grad.addColorStop(1, `rgba(8, 10, 16, ${alpha.toFixed(3)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function applyFrameBorder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  border: NonNullable<StyleColorParams['frameBorder']>
) {
  const minDim = Math.min(w, h);
  ctx.save();
  if (border === 'thin-white') {
    const bw = Math.max(4, Math.round(minDim * 0.025));
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = bw * 2;
    ctx.strokeRect(0, 0, w, h);
  } else if (border === 'studio-mat') {
    const bw = Math.max(8, Math.round(minDim * 0.05));
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = bw * 2;
    ctx.strokeRect(0, 0, w, h);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = Math.max(1, Math.round(minDim * 0.003));
    ctx.strokeRect(bw, bw, w - bw * 2, h - bw * 2);
  } else if (border === 'editorial-dark') {
    const bw = Math.max(6, Math.round(minDim * 0.032));
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = bw * 2;
    ctx.strokeRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = Math.max(1, Math.round(minDim * 0.0025));
    ctx.strokeRect(bw + 2, bw + 2, w - (bw + 2) * 2, h - (bw + 2) * 2);
  } else if (border === 'gold-hairline') {
    const inset = Math.max(6, Math.round(minDim * 0.03));
    ctx.strokeStyle = 'rgba(245, 198, 95, 0.85)';
    ctx.lineWidth = Math.max(1.5, Math.round(minDim * 0.004));
    ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  }
  ctx.restore();
}

// =========================================================================
// MULTI-COPY PRINT LAYOUT ENGINE (4R, 5R, A4, A5, Letter, Custom mm)
// =========================================================================

export interface StudioPrintSlot {
  photoId: string;
  copyIndex: number;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
}

export interface StudioPrintPage {
  pageIndex: number;
  pageWidthMm: number;
  pageHeightMm: number;
  slots: StudioPrintSlot[];
}

export function getPrintPaperDimensionsMm(config: PrintSheetConfig): {
  pageWidthMm: number;
  pageHeightMm: number;
} {
  const base =
    config.paperSize === 'custom'
      ? { widthMm: Math.max(50, config.customWidthMm), heightMm: Math.max(50, config.customHeightMm) }
      : PAPER_SIZE_SPECS[config.paperSize];

  const isLandscape = config.orientation === 'landscape';
  return {
    pageWidthMm: isLandscape
      ? Math.max(base.widthMm, base.heightMm)
      : Math.min(base.widthMm, base.heightMm),
    pageHeightMm: isLandscape
      ? Math.min(base.widthMm, base.heightMm)
      : Math.max(base.widthMm, base.heightMm),
  };
}

export function calculateStudioPrintPages(
  photos: StudioPhotoEntry[],
  config: PrintSheetConfig
): StudioPrintPage[] {
  const { pageWidthMm, pageHeightMm } = getPrintPaperDimensionsMm(config);
  const margin = Math.max(0, config.marginMm);
  const gap = Math.max(0, config.gapMm);
  const printableW = Math.max(10, pageWidthMm - margin * 2);
  const printableH = Math.max(10, pageHeightMm - margin * 2);

  interface QueueSlot {
    photoId: string;
    copyIndex: number;
    wMm: number;
    hMm: number;
    isOversizedFree: boolean;
  }

  const queue: QueueSlot[] = [];
  for (const photo of photos) {
    let { widthMm, heightMm } = getPhotoTargetDimensionsMm(
      photo.edit,
      photo.naturalWidth,
      photo.naturalHeight
    );
    const isFullPagePreset =
      photo.edit.passportPreset === 'full-a4' || photo.edit.passportPreset === 'original-free';
    if (photo.edit.passportPreset === 'full-a4' && photo.copies === 1 && !config.fitAllOnOneSheet) {
      widthMm = printableW;
      heightMm = printableH;
    }
    const copies = Math.max(1, Math.min(60, photo.copies));
    for (let c = 1; c <= copies; c++) {
      queue.push({
        photoId: photo.id,
        copyIndex: c,
        wMm: widthMm,
        hMm: heightMm,
        isOversizedFree: isFullPagePreset,
      });
    }
  }

  if (queue.length === 0) {
    return [{ pageIndex: 0, pageWidthMm, pageHeightMm, slots: [] }];
  }

  // If user requested "fit all on 1 sheet" OR has multiple copies of a free/full-page photo,
  // compute the optimal clean grid so ALL selected copies appear together on that single sheet!
  const allOversizedMulti = queue.length > 1 && queue.every((q) => q.isOversizedFree);
  if (config.fitAllOnOneSheet || allOversizedMulti) {
    const n = queue.length;
    const refAspect = queue[0].wMm / Math.max(1, queue[0].hMm);

    let bestCols = 1;
    let bestRows = n;
    let bestArea = -1;
    let bestW = 10;
    let bestH = 10;

    for (let cols = 1; cols <= n; cols++) {
      const rows = Math.ceil(n / cols);
      const cellW = (printableW - gap * (cols - 1)) / cols;
      const cellH = (printableH - gap * (rows - 1)) / rows;
      if (cellW <= 2 || cellH <= 2) continue;

      let drawW = cellW;
      let drawH = drawW / refAspect;
      if (drawH > cellH) {
        drawH = cellH;
        drawW = drawH * refAspect;
      }

      const area = drawW * drawH;
      if (area > bestArea) {
        bestArea = area;
        bestCols = cols;
        bestRows = rows;
        bestW = drawW;
        bestH = drawH;
      }
    }

    const totalGridW = bestCols * bestW + Math.max(0, bestCols - 1) * gap;
    const startX = margin + Math.max(0, (printableW - totalGridW) / 2);
    const slots: StudioPrintSlot[] = queue.map((item, idx) => {
      const r = Math.floor(idx / bestCols);
      const c = idx % bestCols;
      const itemAspect = item.wMm / Math.max(1, item.hMm);
      let wMm = bestW;
      let hMm = wMm / itemAspect;
      if (hMm > bestH) {
        hMm = bestH;
        wMm = hMm * itemAspect;
      }
      const cellX = startX + c * (bestW + gap) + (bestW - wMm) / 2;
      const cellY = margin + r * (bestH + gap) + (bestH - hMm) / 2;
      return {
        photoId: item.photoId,
        copyIndex: item.copyIndex,
        xMm: Math.round(cellX * 100) / 100,
        yMm: Math.round(cellY * 100) / 100,
        wMm: Math.round(wMm * 100) / 100,
        hMm: Math.round(hMm * 100) / 100,
      };
    });

    // Keep bestRows referenced cleanly
    void bestRows;
    return [{ pageIndex: 0, pageWidthMm, pageHeightMm, slots }];
  }

  // Exact real-world millimeter packing (100% true scale for Passport / Visa / Stamp / 3R / 4R)
  const pages: StudioPrintPage[] = [];
  let slots: StudioPrintSlot[] = [];
  let curX = margin;
  let curY = margin;
  let rowMaxH = 0;

  const finalizePage = (pageSlots: StudioPrintSlot[]) => {
    if (pageSlots.length > 0) {
      let maxRight = 0;
      for (const s of pageSlots) {
        if (s.xMm + s.wMm > maxRight) maxRight = s.xMm + s.wMm;
      }
      const usedW = maxRight - margin;
      const centerShiftX = Math.max(0, (printableW - usedW) / 2);
      if (centerShiftX > 0.2) {
        for (const s of pageSlots) {
          s.xMm = Math.round((s.xMm + centerShiftX) * 100) / 100;
        }
      }
    }
    pages.push({ pageIndex: pages.length, pageWidthMm, pageHeightMm, slots: pageSlots });
  };

  for (const item of queue) {
    const itemW = Math.min(item.wMm, printableW);
    const itemH = Math.min(item.hMm, printableH);

    if (slots.length > 0 && curX + itemW > pageWidthMm - margin + 0.15) {
      curX = margin;
      curY += rowMaxH + gap;
      rowMaxH = 0;
    }

    if (slots.length > 0 && curY + itemH > pageHeightMm - margin + 0.15) {
      finalizePage(slots);
      slots = [];
      curX = margin;
      curY = margin;
      rowMaxH = 0;
    }

    slots.push({
      photoId: item.photoId,
      copyIndex: item.copyIndex,
      xMm: Math.round(curX * 100) / 100,
      yMm: Math.round(curY * 100) / 100,
      wMm: Math.round(itemW * 100) / 100,
      hMm: Math.round(itemH * 100) / 100,
    });

    curX += itemW + gap;
    if (itemH > rowMaxH) rowMaxH = itemH;
  }

  if (slots.length > 0 || pages.length === 0) {
    finalizePage(slots);
  }

  return pages;
}

export function renderStudioPrintPageToCanvas(
  page: StudioPrintPage,
  renderedCanvases: Map<string, HTMLCanvasElement>,
  config: PrintSheetConfig,
  dpi = 300
): HTMLCanvasElement {
  const pxPerMm = dpi / 25.4;
  const canvasW = Math.round(page.pageWidthMm * pxPerMm);
  const canvasH = Math.round(page.pageHeightMm * pxPerMm);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = config.sheetBgColor || '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  for (const slot of page.slots) {
    const photoCanvas = renderedCanvases.get(slot.photoId);
    const x = Math.round(slot.xMm * pxPerMm);
    const y = Math.round(slot.yMm * pxPerMm);
    const w = Math.round(slot.wMm * pxPerMm);
    const h = Math.round(slot.hMm * pxPerMm);

    if (photoCanvas) {
      ctx.drawImage(photoCanvas, x, y, w, h);
    }

    if (config.showCutBorder) {
      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(1, dpi / 250);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }

    if (config.showCropMarks) {
      const mLen = Math.round(2.8 * pxPerMm);
      const mOff = Math.round(0.8 * pxPerMm);
      ctx.save();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = Math.max(1, dpi / 250);
      ctx.beginPath();
      // TL
      ctx.moveTo(x - mOff - mLen, y);
      ctx.lineTo(x - mOff, y);
      ctx.moveTo(x, y - mOff - mLen);
      ctx.lineTo(x, y - mOff);
      // TR
      ctx.moveTo(x + w + mOff, y);
      ctx.lineTo(x + w + mOff + mLen, y);
      ctx.moveTo(x + w, y - mOff - mLen);
      ctx.lineTo(x + w, y - mOff);
      // BL
      ctx.moveTo(x - mOff - mLen, y + h);
      ctx.lineTo(x - mOff, y + h);
      ctx.moveTo(x, y + h + mOff);
      ctx.lineTo(x, y + h + mOff + mLen);
      // BR
      ctx.moveTo(x + w + mOff, y + h);
      ctx.lineTo(x + w + mOff + mLen, y + h);
      ctx.moveTo(x + w, y + h + mOff);
      ctx.lineTo(x + w, y + h + mOff + mLen);
      ctx.stroke();
      ctx.restore();
    }
  }

  if (config.showFooterInfo) {
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.font = `normal ${Math.round(2.4 * pxPerMm)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `MoSaFa AI Photo Studio • Page ${page.pageIndex + 1} • ${config.paperSize} (${page.pageWidthMm}×${page.pageHeightMm} mm) • 100% Actual Scale`,
      canvasW / 2,
      canvasH - Math.round(3.5 * pxPerMm)
    );
    ctx.restore();
  }

  return canvas;
}

export function exportStudioPrintPdf(
  pages: StudioPrintPage[],
  renderedCanvases: Map<string, HTMLCanvasElement>,
  config: PrintSheetConfig,
  filename = 'MoSaFa_AI_Photo_Studio_Print_Sheet.pdf'
) {
  if (pages.length === 0) return;
  const first = pages[0];
  const orient = first.pageWidthMm > first.pageHeightMm ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation: orient,
    unit: 'mm',
    format: [first.pageWidthMm, first.pageHeightMm],
  });

  pages.forEach((page, idx) => {
    if (idx > 0) {
      pdf.addPage([page.pageWidthMm, page.pageHeightMm], orient);
    }

    for (const slot of page.slots) {
      const c = renderedCanvases.get(slot.photoId);
      if (!c) continue;
      const dataUrl = c.toDataURL('image/jpeg', 0.96);
      pdf.addImage(dataUrl, 'JPEG', slot.xMm, slot.yMm, slot.wMm, slot.hMm);

      if (config.showCutBorder) {
        pdf.setDrawColor(200, 210, 220);
        pdf.setLineWidth(0.15);
        pdf.rect(slot.xMm, slot.yMm, slot.wMm, slot.hMm, 'S');
      }

      if (config.showCropMarks) {
        const len = 2.8;
        const off = 0.8;
        pdf.setDrawColor(100, 115, 130);
        pdf.setLineWidth(0.15);
        // TL
        pdf.line(slot.xMm - off - len, slot.yMm, slot.xMm - off, slot.yMm);
        pdf.line(slot.xMm, slot.yMm - off - len, slot.xMm, slot.yMm - off);
        // TR
        pdf.line(slot.xMm + slot.wMm + off, slot.yMm, slot.xMm + slot.wMm + off + len, slot.yMm);
        pdf.line(slot.xMm + slot.wMm, slot.yMm - off - len, slot.xMm + slot.wMm, slot.yMm - off);
        // BL
        pdf.line(slot.xMm - off - len, slot.yMm + slot.hMm, slot.xMm - off, slot.yMm + slot.hMm);
        pdf.line(slot.xMm, slot.yMm + slot.hMm + off, slot.xMm, slot.yMm + slot.hMm + off + len);
        // BR
        pdf.line(slot.xMm + slot.wMm + off, slot.yMm + slot.hMm, slot.xMm + slot.wMm + off + len, slot.yMm + slot.hMm);
        pdf.line(slot.xMm + slot.wMm, slot.yMm + slot.hMm + off, slot.xMm + slot.wMm, slot.yMm + slot.hMm + off + len);
      }
    }

    if (config.showFooterInfo) {
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(7);
      pdf.text(
        `MoSaFa AI Photo Studio | Page ${idx + 1} of ${pages.length} | ${page.pageWidthMm}x${page.pageHeightMm} mm | 100% Scale`,
        page.pageWidthMm / 2,
        page.pageHeightMm - 3.5,
        { align: 'center' }
      );
    }
  });

  pdf.save(filename);
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function clampByte(v: number): number {
  const r = Math.round(v);
  return r < 0 ? 0 : r > 255 ? 255 : r;
}
