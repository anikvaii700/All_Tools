import { Point, CardCorners } from './types';
import { DocColorMode } from './docScannerTypes';

/**
 * Calculates Euclidean distance between two points
 */
function dist(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Intelligent Document Boundary & 4-Corner Detection Algorithm
 * Detects paper edges on desks, tables, or uneven backgrounds.
 */
export function detectDocumentCorners(
  img: HTMLImageElement
): { corners: CardCorners; confidence: number; isAutoDetected: boolean } {
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;

  if (naturalW <= 0 || naturalH <= 0) {
    const defaultCorners = getDefaultDocCorners(1000, 1400);
    return { corners: defaultCorners, confidence: 50, isAutoDetected: false };
  }

  try {
    // 1. Scaled down offscreen canvas for fast analysis (max 520px)
    const scale = Math.min(1, 520 / Math.max(naturalW, naturalH));
    const w = Math.round(naturalW * scale);
    const h = Math.round(naturalH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return { corners: getDefaultDocCorners(naturalW, naturalH), confidence: 50, isAutoDetected: false };
    }

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // 2. Grayscale & Luminance Calculation
    const gray = new Uint8Array(w * h);
    let totalLuminance = 0;
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      gray[j] = lum;
      totalLuminance += lum;
    }
    const avgLuminance = totalLuminance / (w * h);

    // 3. Sobel Edge Gradient Magnitude
    const edge = new Uint8Array(w * h);
    let maxGrad = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        // Horizontal Sobel
        const gx =
          -gray[idx - w - 1] + gray[idx - w + 1] +
          -2 * gray[idx - 1] + 2 * gray[idx + 1] +
          -gray[idx + w - 1] + gray[idx + w + 1];
        // Vertical Sobel
        const gy =
          -gray[idx - w - 1] - 2 * gray[idx - w] - gray[idx - w + 1] +
          gray[idx + w - 1] + 2 * gray[idx + w] + gray[idx + w + 1];

        const mag = Math.abs(gx) + Math.abs(gy);
        edge[idx] = mag > 255 ? 255 : mag;
        if (mag > maxGrad) maxGrad = mag;
      }
    }

    // 4. Document Paper Mask: Papers are typically brighter than background tables
    // or exhibit sharp boundary transitions
    const thresholdGrad = Math.max(28, maxGrad * 0.20);
    const isBrightPaper = avgLuminance > 85;

    // Scan edge points with high gradient or brightness change
    const edgePoints: Point[] = [];
    const step = 2; // sample every 2px for speed
    for (let y = Math.round(h * 0.03); y < h * 0.97; y += step) {
      for (let x = Math.round(w * 0.03); x < w * 0.97; x += step) {
        const idx = y * w + x;
        const isEdge = edge[idx] > thresholdGrad;
        const isPaperBoundary = isBrightPaper && Math.abs(gray[idx] - avgLuminance) > 25;
        if (isEdge || isPaperBoundary) {
          edgePoints.push({ x, y });
        }
      }
    }

    // 5. If insufficient edge points, fall back to safe default
    if (edgePoints.length < 50) {
      return {
        corners: getDefaultDocCorners(naturalW, naturalH),
        confidence: 45,
        isAutoDetected: false,
      };
    }

    // 6. Find Extreme Quadrilateral Vertices:
    // Top-Left: minimizes (x + y)
    // Top-Right: maximizes (x - y)
    // Bottom-Right: maximizes (x + y)
    // Bottom-Left: minimizes (x - y)
    let minSum = Infinity;
    let maxSum = -Infinity;
    let maxDiff = -Infinity;
    let minDiff = Infinity;

    let tl = { x: w * 0.05, y: h * 0.05 };
    let tr = { x: w * 0.95, y: h * 0.05 };
    let br = { x: w * 0.95, y: h * 0.95 };
    let bl = { x: w * 0.05, y: h * 0.95 };

    for (const p of edgePoints) {
      const sum = p.x + p.y;
      const diff = p.x - p.y;

      if (sum < minSum) {
        minSum = sum;
        tl = p;
      }
      if (sum > maxSum) {
        maxSum = sum;
        br = p;
      }
      if (diff > maxDiff) {
        maxDiff = diff;
        tr = p;
      }
      if (diff < minDiff) {
        minDiff = diff;
        bl = p;
      }
    }

    // 7. Validate detected quad geometry:
    // Scale coordinates back to original natural resolution
    const realTL: Point = { x: Math.round(tl.x / scale), y: Math.round(tl.y / scale) };
    const realTR: Point = { x: Math.round(tr.x / scale), y: Math.round(tr.y / scale) };
    const realBR: Point = { x: Math.round(br.x / scale), y: Math.round(br.y / scale) };
    const realBL: Point = { x: Math.round(bl.x / scale), y: Math.round(bl.y / scale) };

    const widthTop = dist(realTL, realTR);
    const widthBottom = dist(realBL, realBR);
    const heightLeft = dist(realTL, realBL);
    const heightRight = dist(realTR, realBR);

    const avgW = (widthTop + widthBottom) / 2;
    const avgH = (heightLeft + heightRight) / 2;
    const detectedArea = avgW * avgH;
    const totalArea = naturalW * naturalH;
    const areaRatio = detectedArea / (totalArea || 1);

    // Validate aspect ratio (documents are usually between 0.4 and 2.6)
    const ratio = avgW / (avgH || 1);
    const isValidRatio = ratio >= 0.4 && ratio <= 2.6;
    const isValidArea = areaRatio >= 0.18 && areaRatio <= 0.98;

    if (!isValidRatio || !isValidArea) {
      return {
        corners: getDefaultDocCorners(naturalW, naturalH),
        confidence: 50,
        isAutoDetected: false,
      };
    }

    // Apply CamScanner safe inward inset (1.8%) to shave off table borders and background bleed
    const detectedCorners: CardCorners = {
      tl: realTL,
      tr: realTR,
      br: realBR,
      bl: realBL,
    };

    const finalCorners = applyDocSafeInset(detectedCorners, 0.018);
    const confidence = Math.round(Math.min(95, Math.max(65, areaRatio * 100)));

    return {
      corners: finalCorners,
      confidence,
      isAutoDetected: true,
    };
  } catch (e) {
    console.warn('Doc corner detection fallback:', e);
    return {
      corners: getDefaultDocCorners(naturalW, naturalH),
      confidence: 45,
      isAutoDetected: false,
    };
  }
}

/**
 * Returns clean default document corners with standard margins
 */
export function getDefaultDocCorners(w: number, h: number): CardCorners {
  const marginX = Math.round(w * 0.04);
  const marginY = Math.round(h * 0.04);

  return {
    tl: { x: marginX, y: marginY },
    tr: { x: w - marginX, y: marginY },
    br: { x: w - marginX, y: h - marginY },
    bl: { x: marginX, y: h - marginY },
  };
}

/**
 * Inset document corners inward towards center to shave off unwanted background
 */
export function applyDocSafeInset(corners: CardCorners, insetRatio = 0.018): CardCorners {
  const cx = (corners.tl.x + corners.tr.x + corners.br.x + corners.bl.x) / 4;
  const cy = (corners.tl.y + corners.tr.y + corners.br.y + corners.bl.y) / 4;
  const factor = 1 - insetRatio;

  return {
    tl: {
      x: Math.round(cx + (corners.tl.x - cx) * factor),
      y: Math.round(cy + (corners.tl.y - cy) * factor),
    },
    tr: {
      x: Math.round(cx + (corners.tr.x - cx) * factor),
      y: Math.round(cy + (corners.tr.y - cy) * factor),
    },
    br: {
      x: Math.round(cx + (corners.br.x - cx) * factor),
      y: Math.round(cy + (corners.br.y - cy) * factor),
    },
    bl: {
      x: Math.round(cx + (corners.bl.x - cx) * factor),
      y: Math.round(cy + (corners.bl.y - cy) * factor),
    },
  };
}

/**
 * Projective Homography Perspective Transformation (Deskew & Straighten)
 * Uses Heckbert 4-point projective mapping with bilinear interpolation.
 */
export function warpDocumentPerspective(
  source: HTMLImageElement | HTMLCanvasElement,
  corners: CardCorners,
  targetWidth?: number,
  targetHeight?: number
): HTMLCanvasElement {
  const widthTop = dist(corners.tl, corners.tr);
  const widthBottom = dist(corners.bl, corners.br);
  const heightLeft = dist(corners.tl, corners.bl);
  const heightRight = dist(corners.tr, corners.br);

  let destW = targetWidth || Math.round(Math.max(widthTop, widthBottom));
  let destH = targetHeight || Math.round(Math.max(heightLeft, heightRight));

  // Cap dimensions to avoid mobile GPU memory crashes (max 2800px on long edge)
  const maxDim = 2800;
  if (destW > maxDim || destH > maxDim) {
    const scale = maxDim / Math.max(destW, destH);
    destW = Math.round(destW * scale);
    destH = Math.round(destH * scale);
  }

  destW = Math.max(300, destW);
  destH = Math.max(300, destH);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = destW;
  outCanvas.height = destH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return outCanvas;

  // Source canvas to read pixels
  const srcW = 'naturalWidth' in source ? source.naturalWidth || source.width : source.width;
  const srcH = 'naturalHeight' in source ? source.naturalHeight || source.height : source.height;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) return outCanvas;

  srcCtx.drawImage(source, 0, 0);
  const srcImageData = srcCtx.getImageData(0, 0, srcW, srcH);
  const srcData = srcImageData.data;

  // Output image data
  const outImageData = outCtx.createImageData(destW, destH);
  const outData = outImageData.data;

  // Compute Homography matrix mapping destination (x, y) back to source quad (u, v)
  const H = getProjectiveHomography(
    { x: 0, y: 0 },
    { x: destW, y: 0 },
    { x: destW, y: destH },
    { x: 0, y: destH },
    corners.tl,
    corners.tr,
    corners.br,
    corners.bl
  );

  // Fast pixel loop with bilinear interpolation
  for (let dy = 0; dy < destH; dy++) {
    for (let dx = 0; dx < destW; dx++) {
      const denom = H[6] * dx + H[7] * dy + H[8];
      if (Math.abs(denom) < 1e-9) continue;

      const sx = (H[0] * dx + H[1] * dy + H[2]) / denom;
      const sy = (H[3] * dx + H[4] * dy + H[5]) / denom;

      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = x0 + 1;
      const y1 = y0 + 1;

      if (x0 < 0 || x1 >= srcW || y0 < 0 || y1 >= srcH) {
        // Pixel is slightly outside boundary: clamp to edge pixel
        const cx = Math.max(0, Math.min(srcW - 1, Math.round(sx)));
        const cy = Math.max(0, Math.min(srcH - 1, Math.round(sy)));
        const srcIdx = (cy * srcW + cx) * 4;
        const outIdx = (dy * destW + dx) * 4;
        outData[outIdx] = srcData[srcIdx];
        outData[outIdx + 1] = srcData[srcIdx + 1];
        outData[outIdx + 2] = srcData[srcIdx + 2];
        outData[outIdx + 3] = 255;
        continue;
      }

      const fx = sx - x0;
      const fy = sy - y0;
      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;

      const idx00 = (y0 * srcW + x0) * 4;
      const idx10 = (y0 * srcW + x1) * 4;
      const idx01 = (y1 * srcW + x0) * 4;
      const idx11 = (y1 * srcW + x1) * 4;

      const outIdx = (dy * destW + dx) * 4;
      outData[outIdx] = Math.round(
        srcData[idx00] * w00 + srcData[idx10] * w10 + srcData[idx01] * w01 + srcData[idx11] * w11
      );
      outData[outIdx + 1] = Math.round(
        srcData[idx00 + 1] * w00 + srcData[idx10 + 1] * w10 + srcData[idx01 + 1] * w01 + srcData[idx11 + 1] * w11
      );
      outData[outIdx + 2] = Math.round(
        srcData[idx00 + 2] * w00 + srcData[idx10 + 2] * w10 + srcData[idx01 + 2] * w01 + srcData[idx11 + 2] * w11
      );
      outData[outIdx + 3] = 255;
    }
  }

  outCtx.putImageData(outImageData, 0, 0);
  return outCanvas;
}

/**
 * Computes 3x3 projective homography matrix mapping quad1 -> quad2
 */
function getProjectiveHomography(
  p0: Point, p1: Point, p2: Point, p3: Point,
  q0: Point, q1: Point, q2: Point, q3: Point
): number[] {
  // Map unit square to quad2
  const H2 = squareToQuad(q0, q1, q2, q3);
  // Map unit square to quad1
  const H1 = squareToQuad(p0, p1, p2, p3);
  // Invert H1
  const H1Inv = invertMatrix3x3(H1);
  // Multiply H2 * H1Inv
  return multiplyMatrix3x3(H2, H1Inv);
}

function squareToQuad(p0: Point, p1: Point, p2: Point, p3: Point): number[] {
  const dx1 = p1.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dx2 = p3.x - p2.x;
  const dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;

  if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) {
    return [p1.x - p0.x, p2.x - p1.x, p0.x, p1.y - p0.y, p2.y - p1.y, p0.y, 0, 0, 1];
  }

  const det = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(det) < 1e-9) {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  const g = (sx * dy2 - sy * dx2) / det;
  const h = (dx1 * sy - dy1 * sx) / det;
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;

  return [a, b, p0.x, d, e, p0.y, g, h, 1];
}

function invertMatrix3x3(m: number[]): number[] {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const H_val = -(a * f - c * d);
  const I_val = a * e - b * d;

  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];

  const invDet = 1 / det;
  return [
    A * invDet, D * invDet, G * invDet,
    B * invDet, E * invDet, H_val * invDet,
    C * invDet, F * invDet, I_val * invDet,
  ];
}

function multiplyMatrix3x3(A: number[], B: number[]): number[] {
  const C = new Array(9).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      C[r * 3 + c] =
        A[r * 3 + 0] * B[0 * 3 + c] +
        A[r * 3 + 1] * B[1 * 3 + c] +
        A[r * 3 + 2] * B[2 * 3 + c];
    }
  }
  return C;
}

/**
 * Intelligent Document Cleaning, Shadow Removal & Enhancement Pipeline
 */
export function enhanceDocumentImage(
  sourceCanvas: HTMLCanvasElement,
  options: {
    colorMode: DocColorMode;
    brightness: number; // -50 to +50
    contrast: number; // -50 to +50
    sharpness: number; // 0 to 100
    removeShadows: boolean;
    shadowRemovalStrength: number; // 0 to 100
  }
): HTMLCanvasElement {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return sourceCanvas;

  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) return sourceCanvas;

  const srcImgData = srcCtx.getImageData(0, 0, w, h);
  const src = srcImgData.data;

  const outImgData = outCtx.createImageData(w, h);
  const out = outImgData.data;

  // 1. Calculate Background Illumination Surface for Shadow Removal
  let bgMap: Float32Array | null = null;
  if (options.removeShadows && options.shadowRemovalStrength > 0) {
    bgMap = estimateBackgroundIllumination(src, w, h);
  }

  // Precalculate contrast and brightness multipliers
  const cFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const bDelta = options.brightness * 1.5;
  const shadowWeight = (options.shadowRemovalStrength / 100) * 0.95;

  // 2. Pixel Transformation Loop
  for (let i = 0; i < src.length; i += 4) {
    let r = src[i];
    let g = src[i + 1];
    let b = src[i + 2];
    const a = src[i + 3];

    // Shadow Normalization
    if (bgMap && options.removeShadows) {
      const pIdx = i / 4;
      const bgLum = bgMap[pIdx];
      if (bgLum > 15) {
        // Normalize against illumination map to eliminate shadows
        const normFactor = 250 / bgLum;
        const blendFactor = Math.min(1.8, 1 + (normFactor - 1) * shadowWeight);
        r = Math.min(255, r * blendFactor);
        g = Math.min(255, g * blendFactor);
        b = Math.min(255, b * blendFactor);
      }
    }

    // Apply Brightness & Contrast
    r = Math.max(0, Math.min(255, cFactor * (r - 128) + 128 + bDelta));
    g = Math.max(0, Math.min(255, cFactor * (g - 128) + 128 + bDelta));
    b = Math.max(0, Math.min(255, cFactor * (b - 128) + 128 + bDelta));

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (options.colorMode === 'original') {
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = a;
    } else if (options.colorMode === 'grayscale') {
      // Grayscale with clean paper background
      const boostedLum = Math.min(255, lum > 200 ? lum + (255 - lum) * 0.7 : lum);
      out[i] = boostedLum;
      out[i + 1] = boostedLum;
      out[i + 2] = boostedLum;
      out[i + 3] = a;
    } else if (options.colorMode === 'bw') {
      // High-contrast clean B&W document / photocopy
      // Threshold: paper background becomes pure 255 white, dark ink becomes 0 black
      const threshold = 175;
      const val = lum < threshold ? (lum < 75 ? 0 : 35) : 255;
      out[i] = val;
      out[i + 1] = val;
      out[i + 2] = val;
      out[i + 3] = a;
    } else {
      // 'color': Enhanced clean color document
      // Whitens paper highlights while keeping signatures, stamps, inks and photos rich
      if (lum > 205) {
        const whiteBoost = (lum - 205) / 50;
        r = Math.min(255, r + (255 - r) * whiteBoost * 0.85);
        g = Math.min(255, g + (255 - g) * whiteBoost * 0.85);
        b = Math.min(255, b + (255 - b) * whiteBoost * 0.85);
      }
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = a;
    }
  }

  // 3. Unsharp Mask Sharpness Boost
  if (options.sharpness > 0) {
    applyUnsharpMask(out, w, h, options.sharpness / 100);
  }

  outCtx.putImageData(outImgData, 0, 0);
  return outCanvas;
}

/**
 * Estimates background illumination by downscaling, computing local maximum luminance,
 * and upscaling back using smooth bilinear interpolation.
 */
function estimateBackgroundIllumination(
  data: Uint8ClampedArray,
  w: number,
  h: number
): Float32Array {
  // Downscale grid (step = 16px)
  const step = 16;
  const gridW = Math.ceil(w / step);
  const gridH = Math.ceil(h / step);
  const grid = new Float32Array(gridW * gridH);

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      let maxL = 0;
      const startX = gx * step;
      const startY = gy * step;
      const endX = Math.min(w, startX + step);
      const endY = Math.min(h, startY + step);

      for (let y = startY; y < endY; y += 2) {
        for (let x = startX; x < endX; x += 2) {
          const idx = (y * w + x) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          if (lum > maxL) maxL = lum;
        }
      }
      grid[gy * gridW + gx] = maxL || 200;
    }
  }

  // Bilinear interpolation back to full pixel array
  const fullMap = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const gy = (y / step);
    const y0 = Math.floor(gy);
    const y1 = Math.min(gridH - 1, y0 + 1);
    const fy = gy - y0;

    for (let x = 0; x < w; x++) {
      const gx = (x / step);
      const x0 = Math.floor(gx);
      const x1 = Math.min(gridW - 1, x0 + 1);
      const fx = gx - x0;

      const v00 = grid[y0 * gridW + x0];
      const v10 = grid[y0 * gridW + x1];
      const v01 = grid[y1 * gridW + x0];
      const v11 = grid[y1 * gridW + x1];

      const illum = (1 - fx) * (1 - fy) * v00 +
                    fx * (1 - fy) * v10 +
                    (1 - fx) * fy * v01 +
                    fx * fy * v11;

      fullMap[y * w + x] = illum;
    }
  }

  return fullMap;
}

/**
 * Fast 3x3 unsharp mask sharpening
 */
function applyUnsharpMask(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  strength: number
): void {
  const copy = new Uint8ClampedArray(data);
  const amount = Math.min(1.5, strength * 1.2);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const val = copy[idx + c];
        // 3x3 Laplacian edge kernel
        const laplacian =
          -copy[((y - 1) * w + x) * 4 + c] -
          copy[((y + 1) * w + x) * 4 + c] -
          copy[(y * w + (x - 1)) * 4 + c] -
          copy[(y * w + (x + 1)) * 4 + c] +
          4 * val;

        const sharpVal = val + amount * (laplacian / 4);
        data[idx + c] = Math.max(0, Math.min(255, Math.round(sharpVal)));
      }
    }
  }
}

/**
 * Creates realistic sample document images for immediate testing
 */
export async function createDemoDocumentFile(
  type: 'official_application' | 'nid_certificate' | 'memo'
): Promise<File> {
  const canvas = document.createElement('canvas');
  // High-res realistic mobile capture canvas: 1200x1600 on wood background with tilt
  const w = 1200;
  const h = 1600;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  // 1. Draw Wooden Desk Background with Shadows
  const woodGrad = ctx.createLinearGradient(0, 0, w, h);
  woodGrad.addColorStop(0, '#593a22');
  woodGrad.addColorStop(0.5, '#402715');
  woodGrad.addColorStop(1, '#2c190c');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle wood planks
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 3;
  for (let y = 80; y < h; y += 140) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y + (Math.sin(y) * 15));
    ctx.stroke();
  }

  // 2. Draw Tilted Document with Realistic Cast Shadow
  ctx.save();
  ctx.translate(w / 2, h / 2);
  const tiltAngle = type === 'nid_certificate' ? -0.06 : 0.045; // ~2.5 - 3.5 degrees realistic tilt
  ctx.rotate(tiltAngle);

  const docW = 860;
  const docH = 1220;

  // Cast shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 18;
  ctx.shadowOffsetY = 24;

  // Paper fill
  ctx.fillStyle = '#fbfcf8'; // Off-white realistic paper
  ctx.fillRect(-docW / 2, -docH / 2, docW, docH);
  ctx.restore();

  // Draw Document Details on rotated paper
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(tiltAngle);

  const left = -docW / 2 + 50;
  let curY = -docH / 2 + 60;

  if (type === 'official_application') {
    // Official Application
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
    ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', left + 180, curY);
    curY += 36;
    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('উপজেলা নির্বাহী কর্মকর্তার কার্যালয়, সোনারগাঁ, নারায়ণগঞ্জ', left + 140, curY);

    curY += 50;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, curY);
    ctx.lineTo(left + docW - 100, curY);
    ctx.stroke();

    curY += 45;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('বিষয়: জাতীয় পরিচয়পত্র সংশোধন ও প্রত্যয়ন পত্র প্রাপ্তির আবেদন।', left, curY);

    curY += 40;
    ctx.font = '17px "Hind Siliguri", sans-serif';
    ctx.fillText('জনাব,', left, curY);
    curY += 32;
    ctx.font = '15px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী একজন স্থায়ী নাগরিক। আমার জাতীয় পরিচয়পত্রের', left, curY);
    curY += 28;
    ctx.fillText('নামের বানানে অনিচ্ছাকৃত করণিক ত্রুটি পরিলক্ষিত হয়েছে। উক্ত সংশোধনের লক্ষ্যে প্রয়োজনীয়', left, curY);
    curY += 28;
    ctx.fillText('এসএসসি সনদপত্র, জন্ম নিবন্ধন ও নাগরিকত্ব প্রত্যয়নপত্র এতদসঙ্গে সংযুক্ত করা হলো।', left, curY);

    curY += 40;
    ctx.fillText('অতএব, মহোদয়ের নিকট আকুল প্রার্থনা— উল্লেখিত প্রমাণাদি বিবেচনাপূর্বক আমার আবেদনটি', left, curY);
    curY += 28;
    ctx.fillText('অনুমোদনে সদয় মর্জি হয়।', left, curY);

    // Official Red Stamp
    curY += 90;
    ctx.save();
    ctx.strokeStyle = '#dc2626';
    ctx.fillStyle = 'rgba(220, 38, 38, 0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(left + 140, curY + 40, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('VERIFIED & SEALED', left + 88, curY + 36);
    ctx.fillText('OFFICIAL COPY', left + 96, curY + 52);
    ctx.restore();

    // Blue Signature
    ctx.save();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(left + docW - 260, curY + 45);
    ctx.bezierCurveTo(left + docW - 230, curY + 10, left + docW - 200, curY + 65, left + docW - 160, curY + 25);
    ctx.bezierCurveTo(left + docW - 130, curY + 70, left + docW - 100, curY + 30, left + docW - 80, curY + 50);
    ctx.stroke();
    ctx.font = '13px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('আবেদনকারীর স্বাক্ষর ও তারিখ', left + docW - 230, curY + 75);
    ctx.restore();
  } else {
    // Certificate / Memo
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
    ctx.fillText('নাগরিক সনদপত্র ও প্রত্যয়ন', left + 220, curY);
    curY += 40;
    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText('ইউনিয়ন পরিষদ কার্যালয় • গণপ্রজাতন্ত্রী বাংলাদেশ', left + 200, curY);

    curY += 60;
    ctx.fillStyle = '#0f172a';
    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillText('এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মো. রফিকুল ইসলাম, পিতা: মো. আব্দুল করিম,', left, curY);
    curY += 30;
    ctx.fillText('গ্রাম: শান্তিনগর, ডাকঘর: রূপগঞ্জ। তিনি এই ইউনিয়নের একজন স্থায়ী ও সম্মানিত নাগরিক।', left, curY);
    curY += 30;
    ctx.fillText('আমার জানামতে তিনি কোনো রাষ্ট্রবিরোধী বা সমাজবিরোধী কার্যকলাপের সাথে জড়িত নন।', left, curY);

    // Green Union Parishad Seal
    curY += 100;
    ctx.save();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(left + 150, curY + 40, 54, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText('UNION PARISHAD', left + 96, curY + 36);
    ctx.fillText('SEAL OF APPROVAL', left + 88, curY + 52);
    ctx.restore();

    // Signature
    ctx.save();
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(left + docW - 240, curY + 35);
    ctx.bezierCurveTo(left + docW - 200, curY + 5, left + docW - 170, curY + 60, left + docW - 120, curY + 20);
    ctx.stroke();
    ctx.font = '13px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('ইউপি চেয়ারম্যানের স্বাক্ষর', left + docW - 220, curY + 70);
    ctx.restore();
  }

  ctx.restore();

  // Uneven ambient lighting shadow across the photo (e.g. hand shadow)
  const shadowGrad = ctx.createRadialGradient(w * 0.8, h * 0.2, 50, w * 0.8, h * 0.2, 700);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(0, 0, w, h);

  // Convert canvas to File object
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const file = new File([blob || ''], `${type}_sample_camera_photo.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(file);
      },
      'image/jpeg',
      0.92
    );
  });
}
