import { jsPDF } from 'jspdf';
import { PageLayoutSettings, PAPER_DIMENSIONS_MM, STANDARD_ID_CARD } from './types';
import { triggerUniversalPrint } from './photoArranger';

// 300 DPI conversion: 1 inch = 25.4 mm, 300 / 25.4 = 11.81102 px/mm
export const PIXELS_PER_MM_300DPI = 300 / 25.4;

export interface CardPlacement {
  firstRect: { x: number; y: number; w: number; h: number };
  secondRect: { x: number; y: number; w: number; h: number };
  pageWidthMm: number;
  pageHeightMm: number;
}

/**
 * Calculates physical millimeter bounding rectangles for both cards on the chosen page
 */
export function calculateCardPlacements(settings: PageLayoutSettings): CardPlacement {
  const paper = PAPER_DIMENSIONS_MM[settings.paperSize];
  const isLandscape = settings.orientation === 'landscape';

  const pageWidthMm = isLandscape ? Math.max(paper.width, paper.height) : Math.min(paper.width, paper.height);
  const pageHeightMm = isLandscape ? Math.min(paper.width, paper.height) : Math.max(paper.width, paper.height);

  const cardW = settings.cardWidthMm * (settings.scalePercent / 100);
  const cardH = settings.cardHeightMm * (settings.scalePercent / 100);
  const gap = settings.gapMm;
  const margin = settings.marginMm;

  let firstRect = { x: 0, y: 0, w: cardW, h: cardH };
  let secondRect = { x: 0, y: 0, w: cardW, h: cardH };

  if (settings.layout === 'side-by-side') {
    const totalW = cardW * 2 + gap;
    const startX = settings.alignment === 'center' ? (pageWidthMm - totalW) / 2 : margin;
    const startY = settings.alignment === 'center' ? (pageHeightMm - cardH) / 2 : margin;

    firstRect = { x: Math.max(margin, startX), y: Math.max(margin, startY), w: cardW, h: cardH };
    secondRect = { x: Math.max(margin, startX + cardW + gap), y: Math.max(margin, startY), w: cardW, h: cardH };
  } else {
    // Vertically Stacked
    const totalH = cardH * 2 + gap;
    const startX = settings.alignment === 'center' ? (pageWidthMm - cardW) / 2 : margin;
    const startY = settings.alignment === 'center' ? (pageHeightMm - totalH) / 2 : margin;

    firstRect = { x: Math.max(margin, startX), y: Math.max(margin, startY), w: cardW, h: cardH };
    secondRect = { x: Math.max(margin, startX), y: Math.max(margin, startY + cardH + gap), w: cardW, h: cardH };
  }

  return { firstRect, secondRect, pageWidthMm, pageHeightMm };
}

/**
 * Renders the entire combined printable page onto a high-res (300 DPI) HTML5 Canvas
 */
export function renderCombinedPageToCanvas(
  frontCanvas: HTMLCanvasElement | null,
  backCanvas: HTMLCanvasElement | null,
  settings: PageLayoutSettings
): HTMLCanvasElement {
  const { firstRect, secondRect, pageWidthMm, pageHeightMm } = calculateCardPlacements(settings);

  // Canvas pixel dimensions at 300 DPI
  const canvasW = Math.round(pageWidthMm * PIXELS_PER_MM_300DPI);
  const canvasH = Math.round(pageHeightMm * PIXELS_PER_MM_300DPI);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Fill clean white page
  ctx.fillStyle = settings.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 2. Identify First and Second cards based on swapSides toggle
  const firstCard = settings.swapSides ? backCanvas : frontCanvas;
  const secondCard = settings.swapSides ? frontCanvas : backCanvas;
  const firstLabel = settings.swapSides ? 'পেছনের অংশ (Back Side)' : 'সামনের অংশ (Front Side)';
  const secondLabel = settings.swapSides ? 'সামনের অংশ (Front Side)' : 'পেছনের অংশ (Back Side)';

  // Helper to render single card at millimeter position
  const drawSingleCard = (
    cardCvs: HTMLCanvasElement | null,
    rect: { x: number; y: number; w: number; h: number },
    label: string
  ) => {
    const pxX = Math.round(rect.x * PIXELS_PER_MM_300DPI);
    const pxY = Math.round(rect.y * PIXELS_PER_MM_300DPI);
    const pxW = Math.round(rect.w * PIXELS_PER_MM_300DPI);
    const pxH = Math.round(rect.h * PIXELS_PER_MM_300DPI);
    const cornerRadiusPx = Math.round(3.0 * PIXELS_PER_MM_300DPI); // Standard ~3mm corner radius of ID-1 card

    if (cardCvs) {
      ctx.save();
      // Clip with smooth rounded corners matching ISO standard ID card
      drawRoundedRectPath(ctx, pxX, pxY, pxW, pxH, cornerRadiusPx);
      ctx.clip();
      ctx.drawImage(cardCvs, pxX, pxY, pxW, pxH);
      ctx.restore();
    } else {
      // Empty placeholder outline
      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      drawRoundedRectPath(ctx, pxX, pxY, pxW, pxH, cornerRadiusPx);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = `500 ${Math.round(4.0 * PIXELS_PER_MM_300DPI)}px 'Hind Siliguri', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${label} (ছবি আপলোড করুন)`, pxX + pxW / 2, pxY + pxH / 2);
      ctx.restore();
    }

    // Optional 0.5pt subtle outline for easy scissor/cutter trimming
    if (settings.showCutBorder) {
      ctx.save();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      drawRoundedRectPath(ctx, pxX, pxY, pxW, pxH, cornerRadiusPx);
      ctx.stroke();
      ctx.restore();
    }

    // Optional printable crop marks (L-shaped crosshairs at 4 corners)
    if (settings.showCropMarks) {
      drawCropMarks(ctx, pxX, pxY, pxW, pxH);
    }
  };

  drawSingleCard(firstCard, firstRect, firstLabel);
  drawSingleCard(secondCard, secondRect, secondLabel);

  // 3. Optional footer watermark & information note
  if (settings.showFooterInfo) {
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.font = `normal ${Math.round(2.8 * PIXELS_PER_MM_300DPI)}px 'Hind Siliguri', -apple-system, sans-serif`;
    ctx.textAlign = 'center';

    const scaleNotice =
      settings.scalePercent === 100
        ? '১০০% আসল স্কেল (৮৫.৬ × ৫৪ মিমি - প্রিন্ট ও ল্যামিনেশনের জন্য উপযুক্ত)'
        : `${settings.scalePercent}% কাস্টম স্কেল`;

    ctx.fillText(
      `The MoSaFa Tools • Ultra Digital Studio • ${scaleNotice} • Paper: ${settings.paperSize} (${settings.orientation})`,
      canvasW / 2,
      canvasH - Math.round(8 * PIXELS_PER_MM_300DPI)
    );
    ctx.restore();
  }

  return canvas;
}

/**
 * Draws rounded rectangle path on canvas
 */
function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws precision corner L-brackets (crop marks) around card
 */
function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const markLen = Math.round(4.0 * PIXELS_PER_MM_300DPI);
  const markOffset = Math.round(1.5 * PIXELS_PER_MM_300DPI);

  ctx.save();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.0;
  ctx.setLineDash([]);

  // Top-Left mark
  ctx.beginPath();
  ctx.moveTo(x - markOffset - markLen, y);
  ctx.lineTo(x - markOffset, y);
  ctx.moveTo(x, y - markOffset - markLen);
  ctx.lineTo(x, y - markOffset);
  ctx.stroke();

  // Top-Right mark
  ctx.beginPath();
  ctx.moveTo(x + w + markOffset + markLen, y);
  ctx.lineTo(x + w + markOffset, y);
  ctx.moveTo(x + w, y - markOffset - markLen);
  ctx.lineTo(x + w, y - markOffset);
  ctx.stroke();

  // Bottom-Left mark
  ctx.beginPath();
  ctx.moveTo(x - markOffset - markLen, y + h);
  ctx.lineTo(x - markOffset, y + h);
  ctx.moveTo(x, y + h + markOffset + markLen);
  ctx.lineTo(x, y + h + markOffset);
  ctx.stroke();

  // Bottom-Right mark
  ctx.beginPath();
  ctx.moveTo(x + w + markOffset + markLen, y + h);
  ctx.lineTo(x + w + markOffset, y + h);
  ctx.moveTo(x + w, y + h + markOffset + markLen);
  ctx.lineTo(x + w, y + h + markOffset);
  ctx.stroke();

  ctx.restore();
}

/**
 * Export high-resolution JPG file to user's downloads
 */
export function downloadCanvasAsJpg(canvas: HTMLCanvasElement, filename = 'MoSaFa_ID_Card_Joiner.jpg') {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export millimeter-exact vector PDF using jsPDF
 */
export function exportToPdf(
  frontCanvas: HTMLCanvasElement | null,
  backCanvas: HTMLCanvasElement | null,
  settings: PageLayoutSettings,
  filename = 'MoSaFa_ID_Card_Joiner_A4.pdf'
) {
  const { firstRect, secondRect, pageWidthMm, pageHeightMm } = calculateCardPlacements(settings);

  // Initialize jsPDF with exact millimetre units and chosen paper format
  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.paperSize.toLowerCase() as any,
  });

  const firstCard = settings.swapSides ? backCanvas : frontCanvas;
  const secondCard = settings.swapSides ? frontCanvas : backCanvas;

  // Add First card image
  if (firstCard) {
    const imgData = firstCard.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', firstRect.x, firstRect.y, firstRect.w, firstRect.h);

    if (settings.showCutBorder) {
      pdf.setDrawColor(180, 190, 205);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(firstRect.x, firstRect.y, firstRect.w, firstRect.h, 3, 3, 'S');
    }

    if (settings.showCropMarks) {
      drawPdfCropMarks(pdf, firstRect.x, firstRect.y, firstRect.w, firstRect.h);
    }
  }

  // Add Second card image
  if (secondCard) {
    const imgData = secondCard.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', secondRect.x, secondRect.y, secondRect.w, secondRect.h);

    if (settings.showCutBorder) {
      pdf.setDrawColor(180, 190, 205);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(secondRect.x, secondRect.y, secondRect.w, secondRect.h, 3, 3, 'S');
    }

    if (settings.showCropMarks) {
      drawPdfCropMarks(pdf, secondRect.x, secondRect.y, secondRect.w, secondRect.h);
    }
  }

  // Optional footer note
  if (settings.showFooterInfo) {
    pdf.setTextColor(140, 155, 175);
    pdf.setFontSize(8);
    const scaleNotice =
      settings.scalePercent === 100
        ? '100% Real Scale: 85.6mm x 54mm'
        : `${settings.scalePercent}% Custom Scale`;

    pdf.text(
      `The MoSaFa Tools - Ultra Digital Studio | ${scaleNotice} | Paper: ${settings.paperSize} (${settings.orientation})`,
      pageWidthMm / 2,
      pageHeightMm - 8,
      { align: 'center' }
    );
  }

  pdf.save(filename);
}

/**
 * Draws precision vector crop marks in PDF
 */
function drawPdfCropMarks(pdf: jsPDF, x: number, y: number, w: number, h: number) {
  const markLen = 4; // 4mm
  const offset = 1.5; // 1.5mm

  pdf.setDrawColor(80, 95, 115);
  pdf.setLineWidth(0.2);

  // Top-Left
  pdf.line(x - offset - markLen, y, x - offset, y);
  pdf.line(x, y - offset - markLen, x, y - offset);

  // Top-Right
  pdf.line(x + w + offset, y, x + w + offset + markLen, y);
  pdf.line(x + w, y - offset - markLen, x + w, y - offset);

  // Bottom-Left
  pdf.line(x - offset - markLen, y + h, x - offset, y + h);
  pdf.line(x, y + h + offset, x, y + h + offset + markLen);

  // Bottom-Right
  pdf.line(x + w + offset, y + h, x + w + offset + markLen, y + h);
  pdf.line(x + w, y + h + offset, x + w, y + h + offset + markLen);
}

/**
 * Direct Print triggering native browser/system printer selection dialog.
 * Opens the system print window showing all installed printers (HP, Canon, Epson, Brother, PDF, etc.).
 * Prints ONLY the 100% scale clean page without any web headers, footers, or margins.
 */
export function triggerDirectPrint(
  frontCanvas: HTMLCanvasElement | null,
  backCanvas: HTMLCanvasElement | null,
  settings: PageLayoutSettings
) {
  // 1. Render combined printable page at full 300 DPI
  const canvas = renderCombinedPageToCanvas(frontCanvas, backCanvas, settings);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

  const paper = settings.paperSize.toLowerCase();
  const orientation = settings.orientation;

// 2. Trigger native universal print
  triggerUniversalPrint([dataUrl], {
    paperSize: settings.paperSize,
    orientation: settings.orientation,
  });
}
