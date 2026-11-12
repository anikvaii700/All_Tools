import { Point, CardCorners, STANDARD_ID_CARD } from './types';

/**
 * Intelligent client-side Card Corner & Boundary Detector
 * Analyzes contrast, edge gradients, and rectangular contours on an offscreen canvas.
 */
export function detectCardCorners(img: HTMLImageElement): CardCorners {
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;

  // Safe fallback if dimensions are missing
  if (naturalW <= 0 || naturalH <= 0) {
    return getDefaultCorners(1000, 630);
  }

  try {
    // 1. Render scaled-down copy for fast analysis (max 480px width)
    const scale = Math.min(1, 480 / naturalW);
    const w = Math.round(naturalW * scale);
    const h = Math.round(naturalH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return getDefaultCorners(naturalW, naturalH);

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // 2. Convert to grayscale & compute brightness variance
    const gray = new Uint8Array(w * h);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }

    // 3. Sobel gradient magnitude detection
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

    // 4. Threshold edges and project along X and Y to locate card boundaries
    const threshold = Math.max(35, maxGrad * 0.22);
    const projX = new Float32Array(w);
    const projY = new Float32Array(h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (edge[y * w + x] > threshold) {
          projX[x]++;
          projY[y]++;
        }
      }
    }

    // 5. Scan inwards from borders to locate the 4 card edges
    const marginMinX = Math.round(w * 0.05);
    const marginMaxX = Math.round(w * 0.95);
    const marginMinY = Math.round(h * 0.05);
    const marginMaxY = Math.round(h * 0.95);

    let left = marginMinX;
    let right = marginMaxX;
    let top = marginMinY;
    let bottom = marginMaxY;

    const peakX = Math.max(...projX);
    const peakY = Math.max(...projY);
    const cutoffX = Math.max(1, peakX * 0.20);
    const cutoffY = Math.max(1, peakY * 0.20);

    for (let x = marginMinX; x < w * 0.45; x++) {
      if (projX[x] > cutoffX) {
        left = x;
        break;
      }
    }
    for (let x = marginMaxX; x > w * 0.55; x--) {
      if (projX[x] > cutoffX) {
        right = x;
        break;
      }
    }
    for (let y = marginMinY; y < h * 0.45; y++) {
      if (projY[y] > cutoffY) {
        top = y;
        break;
      }
    }
    for (let y = marginMaxY; y > h * 0.55; y--) {
      if (projY[y] > cutoffY) {
        bottom = y;
        break;
      }
    }

    // 6. Validate detected bounding box aspect ratio and size
    const detectedW = (right - left) / scale;
    const detectedH = (bottom - top) / scale;
    const detectedRatio = detectedW / (detectedH || 1);

    // If detected area is too small (< 25% of image) or ratio is abnormal (< 1.15 or > 2.2),
    // use optimal centered card framing matching ISO standard 1.586
    if (
      detectedW < naturalW * 0.30 ||
      detectedH < naturalH * 0.20 ||
      detectedRatio < 1.15 ||
      detectedRatio > 2.2
    ) {
      return getDefaultCorners(naturalW, naturalH);
    }

    // Scale back to natural dimensions
    const realL = Math.max(0, left / scale);
    const realR = Math.min(naturalW, right / scale);
    const realT = Math.max(0, top / scale);
    const realB = Math.min(naturalH, bottom / scale);

    const rawCorners: CardCorners = {
      tl: { x: Math.round(realL), y: Math.round(realT) },
      tr: { x: Math.round(realR), y: Math.round(realT) },
      br: { x: Math.round(realR), y: Math.round(realB) },
      bl: { x: Math.round(realL), y: Math.round(realB) },
    };

    // Apply CamScanner / Doc Scanner smart safe inset (~2.2%) to shave off table & finger edges
    return applyCamScannerSafeInset(rawCorners, 0.022);
  } catch (err) {
    console.warn('Card detection fallback:', err);
    return getDefaultCorners(naturalW, naturalH);
  }
}

/**
 * CamScanner / Doc Scanner Style Inward Safe Inset
 * Pulls card corners 1.5% - 2.5% inward towards the center to cleanly eliminate
 * background desk, finger tips, shadows, and reflection bleed on card edges.
 */
export function applyCamScannerSafeInset(corners: CardCorners, insetRatio = 0.022): CardCorners {
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
 * Returns centered default corners matching standard ID card ratio (85.6 / 54 = ~1.586)
 * Tuned for mobile camera captures with CamScanner-grade border tightness.
 */
export function getDefaultCorners(w: number, h: number): CardCorners {
  const targetRatio = STANDARD_ID_CARD.aspectRatio; // ~1.58577
  const imgRatio = w / h;

  let cardW: number;
  let cardH: number;

  if (imgRatio >= targetRatio) {
    // Landscape photo: card constrained by height (~82% to avoid edge bleed)
    cardH = h * 0.82;
    cardW = cardH * targetRatio;
  } else {
    // Portrait photo (e.g. mobile phone photo 900x1600): card is held horizontally
    cardW = w * 0.78;
    cardH = cardW / targetRatio;
  }

  // Ensure card fits inside image boundaries
  if (cardW > w * 0.94) {
    cardW = w * 0.94;
    cardH = cardW / targetRatio;
  }
  if (cardH > h * 0.94) {
    cardH = h * 0.94;
    cardW = cardH * targetRatio;
  }

  const left = (w - cardW) / 2;
  const top = (h - cardH) / 2;
  const right = left + cardW;
  const bottom = top + cardH;

  const raw: CardCorners = {
    tl: { x: Math.round(left), y: Math.round(top) },
    tr: { x: Math.round(right), y: Math.round(top) },
    br: { x: Math.round(right), y: Math.round(bottom) },
    bl: { x: Math.round(left), y: Math.round(bottom) },
  };

  return applyCamScannerSafeInset(raw, 0.018);
}

/**
 * 4-Point Projective Perspective Warp with Bilinear Texture Interpolation
 * Uses Heckbert Projective Homography: maps source quad (tl, tr, br, bl) onto
 * rectangular destination canvas.
 * Guarantees crisp pixels, zero warping artifacts, and NEVER produces black output!
 */
export function warpPerspective(
  source: HTMLImageElement | HTMLCanvasElement,
  corners: CardCorners,
  targetWidth = 1000,
  targetHeight = 630
): HTMLCanvasElement {
  const outCanvas = document.createElement('canvas');
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return outCanvas;

  // Initialize with crisp white background (never black)
  outCtx.fillStyle = '#ffffff';
  outCtx.fillRect(0, 0, targetWidth, targetHeight);

  // Get source dimensions
  const srcW = 'naturalWidth' in source ? source.naturalWidth || source.width : source.width;
  const srcH = 'naturalHeight' in source ? source.naturalHeight || source.height : source.height;

  if (srcW <= 0 || srcH <= 0) {
    return outCanvas;
  }

  // Render source to offscreen canvas to obtain raw pixel buffer
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) {
    outCtx.drawImage(source, 0, 0, targetWidth, targetHeight);
    return outCanvas;
  }

  srcCtx.drawImage(source, 0, 0, srcW, srcH);
  const srcImgData = srcCtx.getImageData(0, 0, srcW, srcH);
  const srcData = srcImgData.data;

  // Prepare destination ImageData
  const outImgData = outCtx.createImageData(targetWidth, targetHeight);
  const outData = outImgData.data;

  // Four corner points in source image coordinate space
  const p0 = corners.tl;
  const p1 = corners.tr;
  const p2 = corners.br;
  const p3 = corners.bl;

  // Heckbert Projective Transform mapping destination (u/W, v/H) in [0,1]^2 to source (x, y)
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const dy3 = p0.y - p1.y + p2.y - p3.y;

  const D = dx1 * dy2 - dx2 * dy1;

  let a11: number, a12: number, a13: number;
  let a21: number, a22: number, a23: number;
  let a31: number, a32: number;

  if (Math.abs(D) < 1e-7) {
    // Affine / Parallelogram
    a11 = p1.x - p0.x;
    a12 = p3.x - p0.x;
    a13 = p0.x;
    a21 = p1.y - p0.y;
    a22 = p3.y - p0.y;
    a23 = p0.y;
    a31 = 0;
    a32 = 0;
  } else {
    // Full Projective Perspective
    a31 = (dx3 * dy2 - dx2 * dy3) / D;
    a32 = (dx1 * dy3 - dx3 * dy1) / D;
    a11 = p1.x - p0.x + a31 * p1.x;
    a12 = p3.x - p0.x + a32 * p3.x;
    a13 = p0.x;
    a21 = p1.y - p0.y + a31 * p1.y;
    a22 = p3.y - p0.y + a32 * p3.y;
    a23 = p0.y;
  }

  const W = targetWidth;
  const H = targetHeight;
  const maxSrcX = srcW - 1.0001;
  const maxSrcY = srcH - 1.0001;

  // Fast projective mapping with bilinear interpolation
  for (let v = 0; v < H; v++) {
    const vNorm = v / H;
    let dstIdx = v * W * 4;

    for (let u = 0; u < W; u++) {
      const uNorm = u / W;
      const wPrime = a31 * uNorm + a32 * vNorm + 1;
      const invW = Math.abs(wPrime) > 1e-9 ? 1 / wPrime : 1;

      const srcX = (a11 * uNorm + a12 * vNorm + a13) * invW;
      const srcY = (a21 * uNorm + a22 * vNorm + a23) * invW;

      // Clamp to source image boundaries
      const clampedX = Math.max(0, Math.min(maxSrcX, srcX));
      const clampedY = Math.max(0, Math.min(maxSrcY, srcY));

      // Bilinear interpolation
      const x0 = Math.floor(clampedX);
      const y0 = Math.floor(clampedY);
      const x1 = Math.min(srcW - 1, x0 + 1);
      const y1 = Math.min(srcH - 1, y0 + 1);

      const fx = clampedX - x0;
      const fy = clampedY - y0;
      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;

      const idx00 = (y0 * srcW + x0) * 4;
      const idx10 = (y0 * srcW + x1) * 4;
      const idx01 = (y1 * srcW + x0) * 4;
      const idx11 = (y1 * srcW + x1) * 4;

      outData[dstIdx] = Math.round(
        w00 * srcData[idx00] + w10 * srcData[idx10] + w01 * srcData[idx01] + w11 * srcData[idx11]
      );
      outData[dstIdx + 1] = Math.round(
        w00 * srcData[idx00 + 1] + w10 * srcData[idx10 + 1] + w01 * srcData[idx01 + 1] + w11 * srcData[idx11 + 1]
      );
      outData[dstIdx + 2] = Math.round(
        w00 * srcData[idx00 + 2] + w10 * srcData[idx10 + 2] + w01 * srcData[idx01 + 2] + w11 * srcData[idx11 + 2]
      );
      outData[dstIdx + 3] = 255; // Always fully opaque

      dstIdx += 4;
    }
  }

  outCtx.putImageData(outImgData, 0, 0);
  return outCanvas;
}

/**
 * Apply post-processing enhancements: rotation, flip, brightness, contrast, sharpening
 */
export function applyImageAdjustments(
  canvas: HTMLCanvasElement,
  rotation = 0,
  flipH = false,
  flipV = false,
  brightness = 0,
  contrast = 0,
  sharpness = false
): HTMLCanvasElement {
  const is90or270 = rotation % 180 !== 0;
  const outW = is90or270 ? canvas.height : canvas.width;
  const outH = is90or270 ? canvas.width : canvas.height;

  const result = document.createElement('canvas');
  result.width = outW;
  result.height = outH;
  const ctx = result.getContext('2d');
  if (!ctx) return canvas;

  // Background white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outW, outH);

  ctx.save();
  // Move to center
  ctx.translate(outW / 2, outH / 2);

  // Apply rotation
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Apply flips
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  // Draw original image centered
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  ctx.restore();

  // Apply color adjustments if modified
  if (brightness !== 0 || contrast !== 0 || sharpness) {
    const imgData = ctx.getImageData(0, 0, outW, outH);
    const data = imgData.data;

    // Contrast factor
    const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      // Brightness & Contrast
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (brightness !== 0) {
        r += brightness;
        g += brightness;
        b += brightness;
      }

      if (contrast !== 0) {
        r = cFactor * (r - 128) + 128;
        g = cFactor * (g - 128) + 128;
        b = cFactor * (b - 128) + 128;
      }

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);

    // Mild unsharp mask filter for clarity if requested
    if (sharpness) {
      applyUnsharpMask(ctx, outW, outH);
    }
  }

  return result;
}

/**
 * 3x3 unsharp mask for gentle document text sharpening
 */
function applyUnsharpMask(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;
  const output = ctx.createImageData(w, h);
  const dst = output.data;

  // Copy entire src array first so borders and untouched pixels are preserved
  dst.set(src);

  // Sharpen kernel
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const val =
          3 * src[idx + c] -
          0.5 * src[idx - w * 4 + c] -
          0.5 * src[idx + w * 4 + c] -
          0.5 * src[idx - 4 + c] -
          0.5 * src[idx + 4 + c];
        dst[idx + c] = Math.min(255, Math.max(0, Math.round(val)));
      }
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Generates a clean, realistic Demo ID Card (Front or Back) for instant 1-click test
 */
export async function createDemoIdCardFile(side: 'front' | 'back'): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  // Background gradient: Smart NID style (Light green/teal subtle security guilloche texture)
  const bgGrad = ctx.createLinearGradient(0, 0, 1000, 630);
  bgGrad.addColorStop(0, '#f0fdf4');
  bgGrad.addColorStop(0.5, '#e0f2fe');
  bgGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1000, 630);

  // Border outline with rounded corners
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 980, 610);

  // Top header band
  ctx.fillStyle = '#047857';
  ctx.fillRect(10, 10, 980, 90);

  // Government Emblem placeholder circle
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(60, 55, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', 60, 62);

  if (side === 'front') {
    // Front Side
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', 110, 48);
    ctx.font = '18px sans-serif';
    ctx.fillText('Government of the People\'s Republic of Bangladesh', 110, 78);

    // Chip & Hologram
    ctx.fillStyle = '#eab308';
    ctx.fillRect(60, 130, 90, 80);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 130, 90, 80);

    // Photo Box
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(60, 240, 200, 260);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👤', 160, 390);

    // Details text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('নাম: মোসাফা ইউজার (নমুনা)', 300, 170);
    ctx.font = '20px sans-serif';
    ctx.fillText('Name: MOSAFA SAMPLE USER', 300, 210);
    ctx.fillText('পিতা: আবদুল করিম', 300, 260);
    ctx.fillText('মাতা: ফাতেমা বেগম', 300, 310);
    ctx.fillText('Date of Birth: 15 Oct 1996', 300, 360);

    // NID Number in bold red
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('NID No: 1996 2611 7432 2470', 300, 430);

    // Signature Box
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(60, 520, 200, 70);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'italic bold 22px cursive, sans-serif';
    ctx.fillText('MosafaUser', 100, 560);

    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('স্বাক্ষর / Signature', 300, 540);
  } else {
    // Back Side
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('জাতীয় পরিচয়পত্র (পেছনের অংশ / Back Side)', 110, 55);

    // Address
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('ঠিকানা (Address):', 60, 160);
    ctx.font = '20px sans-serif';
    ctx.fillText('বাসা/হোল্ডিং: ১২/এ, রোড: ০৪, ব্লক: বি', 60, 200);
    ctx.fillText('গ্রাম/রাস্তা: ধানমন্ডি আ/এ, ডাকঘর: ধানমন্ডি-১২০৫', 60, 240);
    ctx.fillText('উপজেলা/থানা: ধানমন্ডি, জেলা: ঢাকা', 60, 280);

    // Blood Group
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('রক্তের গ্রুপ / Blood Group: O (+ve)', 60, 340);

    // Issue date
    ctx.fillStyle = '#0f172a';
    ctx.font = '18px sans-serif';
    ctx.fillText('প্রদানের তারিখ / Issue Date: 10/02/2021', 60, 390);

    // Barcode Simulation
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(60, 430, 880, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = '26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('||| | | |||| | ||| | ||||| || | |||| ||| | ||||| | |||', 500, 475);

    // Machine Readable Zone (MRZ) Simulation
    ctx.fillStyle = '#0f172a';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('I<BGD1996261174322470<<<<<<<<<<<<<<<', 60, 545);
    ctx.fillText('9610158M3102105BGD<<<<<<<<<<<<<<<2', 60, 580);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const fileName = side === 'front' ? 'MoSaFa_Sample_ID_Front.jpg' : 'MoSaFa_Sample_ID_Back.jpg';
      resolve(new File([blob!], fileName, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.95);
  });
}
