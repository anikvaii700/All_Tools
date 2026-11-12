import jsPDF from 'jspdf';
import JSZip from 'jszip';
import {
  ScannedDocPage,
  DocScannerGlobalSettings,
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  A4_WIDTH_PX_300DPI,
  A4_HEIGHT_PX_300DPI,
  A4_WIDTH_PX_PREVIEW,
  A4_HEIGHT_PX_PREVIEW,
  DocA4Orientation,
} from './docScannerTypes';

/**
 * Resolves effective A4 orientation for a document page
 */
export function resolveEffectiveOrientation(
  page: ScannedDocPage,
  settings: DocScannerGlobalSettings
): 'portrait' | 'landscape' {
  const chosen = page.a4Orientation !== 'auto' ? page.a4Orientation : settings.globalOrientation;

  if (chosen === 'portrait') return 'portrait';
  if (chosen === 'landscape') return 'landscape';

  // Auto-detect from enhanced document aspect ratio
  const canvas = page.processedEnhanceCanvas || page.processedWarpCanvas;
  if (canvas && canvas.width > canvas.height * 1.08) {
    return 'landscape';
  }
  return 'portrait';
}

/**
 * Renders a scanned document page onto an A4 Canvas
 */
export function renderScannedDocToA4Canvas(
  page: ScannedDocPage,
  settings: DocScannerGlobalSettings,
  isPrintQuality = false,
  pageNumber?: number,
  totalPages?: number
): HTMLCanvasElement {
  const orientation = resolveEffectiveOrientation(page, settings);
  const isLandscape = orientation === 'landscape';

  const baseW = isPrintQuality ? A4_WIDTH_PX_300DPI : A4_WIDTH_PX_PREVIEW;
  const baseH = isPrintQuality ? A4_HEIGHT_PX_300DPI : A4_HEIGHT_PX_PREVIEW;

  const canvasW = isLandscape ? baseH : baseW;
  const canvasH = isLandscape ? baseW : baseH;

  const a4Canvas = document.createElement('canvas');
  a4Canvas.width = canvasW;
  a4Canvas.height = canvasH;
  const ctx = a4Canvas.getContext('2d');
  if (!ctx) return a4Canvas;

  // 1. Pure White A4 Paper Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  const docCanvas = page.processedEnhanceCanvas || page.processedWarpCanvas;
  if (!docCanvas || docCanvas.width <= 0 || docCanvas.height <= 0) {
    return a4Canvas;
  }

  // 2. Compute Printable Margin
  const pxPerMm = canvasW / (isLandscape ? A4_HEIGHT_MM : A4_WIDTH_MM);
  const marginPx = Math.round(settings.marginMm * pxPerMm);

  const availW = canvasW - marginPx * 2;
  const availH = canvasH - marginPx * 2;

  const docW = docCanvas.width;
  const docH = docCanvas.height;
  const docRatio = docW / docH;

  let drawW: number;
  let drawH: number;

  const scaling = page.scalingMode || settings.globalScaling;

  if (scaling === 'fill') {
    // Fill printable area while maintaining aspect ratio
    const scale = Math.min(availW / docW, availH / docH);
    drawW = Math.round(docW * scale);
    drawH = Math.round(docH * scale);
  } else if (scaling === 'original') {
    // Preserve natural capture scale if it fits, otherwise scale down
    const maxAllowedScale = Math.min(availW / docW, availH / docH);
    const naturalScale = Math.min(1.0, maxAllowedScale);
    drawW = Math.round(docW * naturalScale);
    drawH = Math.round(docH * naturalScale);
  } else {
    // 'fit' (Standard): Fit nicely within printable bounds with clean margins
    const scale = Math.min(availW / docW, availH / docH);
    drawW = Math.round(docW * scale);
    drawH = Math.round(docH * scale);
  }

  // Center document on A4 sheet
  const drawX = Math.round(marginPx + (availW - drawW) / 2);
  const drawY = Math.round(marginPx + (availH - drawH) / 2);

  // 3. Draw Document with Crisp Smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(docCanvas, drawX, drawY, drawW, drawH);

  // 4. Optional Subtle Document Paper Border
  if (settings.showSubtleBorder) {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = Math.max(1, Math.round(pxPerMm * 0.2));
    ctx.strokeRect(drawX, drawY, drawW, drawH);
  }

  // 5. Optional Page Numbering
  if (settings.showPageNumbers && pageNumber && totalPages) {
    ctx.font = `bold ${Math.round(pxPerMm * 3.5)}px sans-serif`;
    ctx.fillStyle = '#64748b';
    const pageStr = `পৃষ্ঠা ${pageNumber} / ${totalPages}`;
    const textW = ctx.measureText(pageStr).width;

    const numY = canvasH - Math.round(marginPx * 0.4);
    const numX = settings.pageNumberPosition === 'bottom-right'
      ? canvasW - marginPx - textW
      : (canvasW - textW) / 2;

    ctx.fillText(pageStr, numX, numY);
  }

  return a4Canvas;
}

/**
 * Exports all scanned pages as a pristine multi-page A4 PDF using jsPDF
 */
export async function exportScannedDocsToPdf(
  pages: ScannedDocPage[],
  settings: DocScannerGlobalSettings,
  fileName = 'MoSaFa_Scanned_Document_A4.pdf'
): Promise<void> {
  if (pages.length === 0) return;

  const validPages = pages.filter(
    (p) => p.processedEnhanceCanvas || p.processedWarpCanvas
  );
  if (validPages.length === 0) return;

  // Initialize jsPDF with first page's orientation
  const firstOrientation = resolveEffectiveOrientation(validPages[0], settings);
  const pdf = new jsPDF({
    orientation: firstOrientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < validPages.length; i++) {
    const page = validPages[i];
    const orientation = resolveEffectiveOrientation(page, settings);
    const isLandscape = orientation === 'landscape';

    if (i > 0) {
      pdf.addPage('a4', orientation);
    }

    // Render 300 DPI high-resolution canvas for print fidelity
    const a4Canvas = renderScannedDocToA4Canvas(
      page,
      settings,
      true,
      i + 1,
      validPages.length
    );

    const imgData = a4Canvas.toDataURL('image/jpeg', 0.94);
    const pageW = isLandscape ? A4_HEIGHT_MM : A4_WIDTH_MM;
    const pageH = isLandscape ? A4_WIDTH_MM : A4_HEIGHT_MM;

    pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
  }

  pdf.save(fileName);
}

/**
 * Downloads single page as high-resolution 300 DPI JPG
 */
export function downloadA4PageAsJpg(
  page: ScannedDocPage,
  pageIndex: number,
  settings: DocScannerGlobalSettings,
  customName?: string
): void {
  const highResCanvas = renderScannedDocToA4Canvas(page, settings, true);
  const dataUrl = highResCanvas.toDataURL('image/jpeg', 0.95);

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = customName || `MoSaFa_Doc_Page_${pageIndex + 1}_A4.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads all pages packed into a single ZIP file containing 300 DPI A4 JPEGs
 */
export async function downloadAllPagesAsZip(
  pages: ScannedDocPage[],
  settings: DocScannerGlobalSettings,
  zipFileName = 'MoSaFa_Scanned_Documents_A4.zip'
): Promise<void> {
  const validPages = pages.filter(
    (p) => p.processedEnhanceCanvas || p.processedWarpCanvas
  );
  if (validPages.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder('Scanned_Documents_A4') || zip;

  for (let i = 0; i < validPages.length; i++) {
    const page = validPages[i];
    const highResCanvas = renderScannedDocToA4Canvas(
      page,
      settings,
      true,
      i + 1,
      validPages.length
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      highResCanvas.toBlob(resolve, 'image/jpeg', 0.94)
    );

    if (blob) {
      const padIndex = String(i + 1).padStart(2, '0');
      folder.file(`Page_${padIndex}_${page.fileName.replace(/\.[^/.]+$/, '')}.jpg`, blob);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = url;
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Direct Browser Print of Scanned A4 Pages with Isolated Print View
 */
export function triggerScannedDocsPrint(
  pages: ScannedDocPage[],
  settings: DocScannerGlobalSettings
): void {
  const validPages = pages.filter(
    (p) => p.processedEnhanceCanvas || p.processedWarpCanvas
  );
  if (validPages.length === 0) return;

  // Clean up any old print container
  const oldRoot = document.getElementById('doc-scanner-print-root');
  if (oldRoot) {
    oldRoot.remove();
  }

  const printRoot = document.createElement('div');
  printRoot.id = 'doc-scanner-print-root';
  printRoot.style.position = 'fixed';
  printRoot.style.left = '0';
  printRoot.style.top = '0';
  printRoot.style.width = '100vw';
  printRoot.style.zIndex = '999999';
  printRoot.style.background = '#ffffff';

  validPages.forEach((page, idx) => {
    const canvas = renderScannedDocToA4Canvas(
      page,
      settings,
      true,
      idx + 1,
      validPages.length
    );
    const imgUrl = canvas.toDataURL('image/jpeg', 0.94);
    const orientation = resolveEffectiveOrientation(page, settings);

    const pageWrapper = document.createElement('div');
    pageWrapper.className = 'doc-print-page';
    pageWrapper.style.width = '100%';
    pageWrapper.style.boxSizing = 'border-box';
    pageWrapper.style.pageBreakAfter = idx < validPages.length - 1 ? 'always' : 'auto';
    pageWrapper.style.breakAfter = idx < validPages.length - 1 ? 'page' : 'auto';
    pageWrapper.style.display = 'flex';
    pageWrapper.style.justifyContent = 'center';
    pageWrapper.style.alignItems = 'center';
    pageWrapper.style.background = '#ffffff';

    const img = document.createElement('img');
    img.src = imgUrl;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.display = 'block';

    pageWrapper.appendChild(img);
    printRoot.appendChild(pageWrapper);
  });

  document.body.appendChild(printRoot);

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      printRoot.remove();
    }, 1500);
  }, 350);
}
