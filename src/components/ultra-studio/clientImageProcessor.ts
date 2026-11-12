import { StudioPhotoItem, PHOTO_PRESETS } from './photoStudioTypes';

/**
 * 300 DPI conversion constant:
 * 1 inch = 25.4 mm
 * 300 dots / 25.4 mm = 11.81102 pixels per millimeter
 */
export const DPI_300_PX_PER_MM = 300 / 25.4;

/**
 * Renders an individual cropped, color-adjusted, and background-processed photo
 * to an HTML5 Canvas at high 300 DPI resolution.
 */
export function processPhotoItem(photo: StudioPhotoItem): { canvas: HTMLCanvasElement; url: string } {
  const presetDef = PHOTO_PRESETS[photo.preset];
  const widthMm = photo.preset === 'custom' ? photo.customWidthMm : presetDef.widthMm;
  const heightMm = photo.preset === 'custom' ? photo.customHeightMm : presetDef.heightMm;

  // Target canvas dimensions at 300 DPI
  const targetW = Math.round(widthMm * DPI_300_PX_PER_MM);
  const targetH = Math.round(heightMm * DPI_300_PX_PER_MM);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { canvas, url: photo.rawUrl };
  }

  // 1. Fill base background color
  if (photo.bgColor !== 'transparent') {
    ctx.fillStyle = photo.bgColor === 'original' ? '#ffffff' : photo.bgColor;
    ctx.fillRect(0, 0, targetW, targetH);
  }

  const img = photo.imgElement;
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  if (imgW <= 0 || imgH <= 0) {
    return { canvas, url: canvas.toDataURL('image/jpeg', 0.95) };
  }

  // 2. Offscreen canvas for rotation and color replacement if requested
  const workCanvas = document.createElement('canvas');
  workCanvas.width = imgW;
  workCanvas.height = imgH;
  const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });

  if (workCtx) {
    workCtx.drawImage(img, 0, 0);

    // Apply background color replacement if requested (and not 'original')
    if (photo.bgColor !== 'original') {
      applyStudioBackgroundReplacement(workCtx, imgW, imgH, photo.bgColor);
    }
  }

  const sourceDrawable = workCtx ? workCanvas : img;

  // 3. Calculate framing (Cover fill maintaining aspect ratio + user zoom & pan)
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Rotation if needed
  if (photo.crop.rotation !== 0) {
    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate((photo.crop.rotation * Math.PI) / 180);
    ctx.translate(-targetW / 2, -targetH / 2);
  }

  // Cover aspect ratio calculation
  const targetAspect = targetW / targetH;
  const imgAspect = imgW / imgH;

  let baseDrawW: number;
  let baseDrawH: number;

  if (imgAspect > targetAspect) {
    // Image is wider than target frame: fit to height
    baseDrawH = targetH;
    baseDrawW = targetH * imgAspect;
  } else {
    // Image is taller than target frame: fit to width
    baseDrawW = targetW;
    baseDrawH = targetW / imgAspect;
  }

  // Apply user zoom (1.0 to 3.0)
  const drawW = baseDrawW * photo.crop.zoom;
  const drawH = baseDrawH * photo.crop.zoom;

  // User Pan Offset (percentage-based)
  const panPxX = (photo.crop.panX / 100) * (targetW * 0.5);
  const panPxY = (photo.crop.panY / 100) * (targetH * 0.5);

  const drawX = (targetW - drawW) / 2 + panPxX;
  const drawY = (targetH - drawH) / 2 + panPxY;

  ctx.drawImage(sourceDrawable, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 4. Apply brightness and contrast adjustments
  if (photo.brightness !== 0 || photo.contrast !== 0) {
    applyBrightnessContrast(ctx, targetW, targetH, photo.brightness, photo.contrast);
  }

  const url = canvas.toDataURL(photo.bgColor === 'transparent' ? 'image/png' : 'image/jpeg', 0.95);
  return { canvas, url };
}

/**
 * Client-side Studio Background Replacement:
 * Samples border/corner pixels to identify the backdrop, computes color delta,
 * and seamlessly blends the chosen studio color with soft edge feathering.
 */
function applyStudioBackgroundReplacement(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  newBgColor: string
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample corner pixel colors (Top-Left, Top-Right, corners are usually background)
  const sampleIndices = [0, (w - 1) * 4, ((h - 1) * w) * 4, ((h - 1) * w + (w - 1)) * 4];
  let bgR = 0, bgG = 0, bgB = 0;
  for (const idx of sampleIndices) {
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR = Math.round(bgR / 4);
  bgG = Math.round(bgG / 4);
  bgB = Math.round(bgB / 4);

  // Parse destination RGB
  let destR = 255, destG = 255, destB = 255;
  if (newBgColor === '#0284c7') {
    destR = 2; destG = 132; destB = 199;
  } else if (newBgColor === '#0369a1') {
    destR = 3; destG = 105; destB = 161;
  } else if (newBgColor === '#e0f2fe') {
    destR = 224; destG = 242; destB = 254;
  } else if (newBgColor === '#f1f5f9') {
    destR = 241; destG = 245; destB = 249;
  }

  const isTransparent = newBgColor === 'transparent';
  const tolerance = 48; // Euclidean RGB distance threshold
  const feather = 18;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

    if (dist < tolerance) {
      // Full background replacement
      if (isTransparent) {
        data[i + 3] = 0;
      } else {
        data[i] = destR;
        data[i + 1] = destG;
        data[i + 2] = destB;
      }
    } else if (dist < tolerance + feather) {
      // Feathered edge transition for natural hair and collar blending
      const factor = (dist - tolerance) / feather;
      if (isTransparent) {
        data[i + 3] = Math.round(255 * factor);
      } else {
        data[i] = Math.round(destR * (1 - factor) + r * factor);
        data[i + 1] = Math.round(destG * (1 - factor) + g * factor);
        data[i + 2] = Math.round(destB * (1 - factor) + b * factor);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * High-performance brightness and contrast adjustment
 */
function applyBrightnessContrast(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brightness: number,
  contrast: number
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] + brightness;
    let g = data[i + 1] + brightness;
    let b = data[i + 2] + brightness;

    if (contrast !== 0) {
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;
    }

    data[i] = Math.min(255, Math.max(0, Math.round(r)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Creates a clean, realistic Demo Studio Portrait (for 1-click test of multiple copies)
 */
export async function createDemoStudioPhotoFile(label = 'Demo Person'): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Studio Blue Gradient Backdrop
  const bg = ctx.createLinearGradient(0, 0, 600, 750);
  bg.addColorStop(0, '#e0f2fe');
  bg.addColorStop(0.5, '#bae6fd');
  bg.addColorStop(1, '#7dd3fc');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 600, 750);

  // Soft studio light aura
  const radial = ctx.createRadialGradient(300, 320, 40, 300, 320, 260);
  radial.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, 600, 750);

  // Draw Shoulders & Suit
  ctx.fillStyle = '#1e293b'; // Formal dark navy blazer
  ctx.beginPath();
  ctx.ellipse(300, 680, 240, 160, 0, 0, Math.PI * 2);
  ctx.fill();

  // White formal shirt collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(250, 520);
  ctx.lineTo(300, 590);
  ctx.lineTo(350, 520);
  ctx.closePath();
  ctx.fill();

  // Red tie
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.moveTo(290, 550);
  ctx.lineTo(310, 550);
  ctx.lineTo(315, 660);
  ctx.lineTo(300, 680);
  ctx.lineTo(285, 660);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(270, 460, 60, 80);

  // Face Oval
  ctx.fillStyle = '#fce7f3';
  ctx.beginPath();
  ctx.ellipse(300, 350, 110, 135, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(300, 280, 115, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(260, 345, 8, 0, Math.PI * 2);
  ctx.arc(340, 345, 8, 0, Math.PI * 2);
  ctx.fill();

  // Friendly Smile
  ctx.strokeStyle = '#9d174d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 410, 30, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Studio label tag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fillRect(100, 690, 400, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`MoSaFa Studio • ${label}`, 300, 717);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], `Studio_Sample_${label.replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.95);
  });
}
