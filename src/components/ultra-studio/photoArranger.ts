import { jsPDF } from 'jspdf';
import {
  StudioPhotoItem,
  SheetSettings,
  ArrangedPage,
  ArrangedPhotoSlot,
  PHOTO_PRESETS,
} from './photoStudioTypes';
import { DPI_300_PX_PER_MM } from './clientImageProcessor';
import { PAPER_DIMENSIONS_MM } from './types';

/**
 * Universal Native Print Engine
 * Injects high-resolution printable pages into a print container on the main document
 * and invokes native window.print() so all installed printers (Epson, Canon, HP, Brother, PDF)
 * appear directly in the user's printer selection dialog.
 */
export function triggerUniversalPrint(
  pageImages: string[],
  settings: { paperSize: string; orientation: string },
  onShowToast?: (msg: string, icon?: string) => void
) {
  if (onShowToast) {
    onShowToast('প্রিন্টার তালিকা ওপেন হচ্ছে... আপনার প্রিন্টার নির্বাচন করে প্রিন্ট করুন।', '🖨️');
  }

  // Remove any existing print root
  const existingRoot = document.getElementById('mosafa-universal-print-root');
  if (existingRoot) existingRoot.remove();

  const printRoot = document.createElement('div');
  printRoot.id = 'mosafa-universal-print-root';

  const paper = settings.paperSize.toLowerCase();
  const orientation = settings.orientation;

  printRoot.innerHTML = `
    <style id="mosafa-print-dynamic-style">
      @media screen {
        #mosafa-universal-print-root {
          display: none !important;
        }
      }
      @media print {
        @page {
          size: ${paper} ${orientation};
          margin: 0mm !important;
        }
        body > *:not(#mosafa-universal-print-root) {
          display: none !important;
        }
        html, body {
          width: 100% !important;
          height: auto !important;
          min-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          overflow: visible !important;
        }
        #mosafa-universal-print-root {
          display: block !important;
          position: static !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          z-index: 9999999 !important;
        }
        .mosafa-print-page {
          width: 100vw !important;
          height: 100vh !important;
          page-break-after: always !important;
          break-after: page !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }
        .mosafa-print-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        .mosafa-print-page img {
          max-width: 100% !important;
          max-height: 100% !important;
          width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
          display: block !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
    ${pageImages
      .map(
        (dataUrl, i) => `
        <div class="mosafa-print-page">
          <img src="${dataUrl}" alt="Photo Sheet Page ${i + 1}" />
        </div>
      `
      )
      .join('')}
  `;

  document.body.appendChild(printRoot);

  const imgs = printRoot.querySelectorAll('img');
  let loaded = 0;
  const total = imgs.length;

  let printCalled = false;
  const launchPrint = () => {
    if (printCalled) return;
    printCalled = true;
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn('Native window.print() failed:', e);
    }
    // Cleanup after print dialog
    setTimeout(() => {
      const root = document.getElementById('mosafa-universal-print-root');
      if (root) root.remove();
    }, 2500);
  };

  if (total === 0) {
    launchPrint();
    return;
  }

  // Check if all images (data URLs) are already complete in memory
  let allComplete = true;
  imgs.forEach((img) => {
    if (!img.complete) allComplete = false;
  });

  if (allComplete) {
    // Synchronous execution retains the browser's user activation token!
    launchPrint();
  } else {
    imgs.forEach((img) => {
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === total) {
          launchPrint();
        }
      };
    });
    // Fallback safety timeout
    setTimeout(launchPrint, 200);
  }
}

/**
 * Creates a standalone clean HTML Blob URL that can be opened in a new tab or iframe.
 * Never blocked by iframe sandboxes, and triggers the printer dialog with 100% actual scale!
 */
export function createPrintableHtmlBlobUrl(
  pageImages: string[],
  settings: { paperSize: string; orientation: string }
): string {
  const paper = settings.paperSize.toLowerCase();
  const orientation = settings.orientation;
  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>MoSaFa Digital Studio — Print Ready Sheet</title>
  <style>
    @page {
      size: ${paper} ${orientation};
      margin: 0mm !important;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .print-page {
      width: 100vw;
      height: 100vh;
      page-break-after: always;
      break-after: page;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .print-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    img {
      max-width: 100%;
      max-height: 100%;
      width: 100%;
      height: auto;
      object-fit: contain;
      display: block;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media screen {
      body {
        background: #1e293b;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
      }
      .toolbar {
        position: sticky;
        top: 16px;
        z-index: 999;
        background: #0f172a;
        color: #ffffff;
        border: 1px solid #334155;
        padding: 10px 24px;
        border-radius: 9999px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      }
      .btn {
        background: #059669;
        color: white;
        font-weight: 700;
        padding: 8px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(5,150,105,0.4);
      }
      .btn:hover {
        background: #047857;
      }
      .print-page {
        width: 210mm;
        height: 297mm;
        background: white;
        margin-bottom: 24px;
        box-shadow: 0 10px 35px rgba(0,0,0,0.3);
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span style="font-weight: bold; font-size: 14px;">🖨️ MoSaFa Tools • আল্ট্রা ডিজিটাল স্টুডিও প্রিন্ট</span>
    <button class="btn" onclick="window.focus(); window.print();">🖨️ এখনই প্রিন্ট করুন (Ctrl + P)</button>
  </div>
  ${pageImages
    .map(
      (src, idx) => `
    <div class="print-page">
      <img src="${src}" alt="Page ${idx + 1}" />
    </div>
  `
    )
    .join('')}
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.focus();
        window.print();
      }, 150);
    });
  </script>
</body>
</html>`;
  return URL.createObjectURL(new Blob([html], { type: 'text/html' }));
}

/**
 * Packs multiple photographs with independent quantities and sizes onto printable sheets.
 * Automatically generates Page 1, Page 2, etc. when photos exceed a single page.
 */
export function calculatePhotoPages(
  photos: StudioPhotoItem[],
  settings: SheetSettings
): ArrangedPage[] {
  const paper = PAPER_DIMENSIONS_MM[settings.paperSize];
  const isLandscape = settings.orientation === 'landscape';

  const pageWidthMm = isLandscape ? Math.max(paper.width, paper.height) : Math.min(paper.width, paper.height);
  const pageHeightMm = isLandscape ? Math.min(paper.width, paper.height) : Math.max(paper.width, paper.height);

  const margin = settings.marginMm;
  const gap = settings.gapMm;

  const printableW = Math.max(10, pageWidthMm - margin * 2);
  const printableH = Math.max(10, pageHeightMm - margin * 2);

  // 1. Flatten all photo copies into individual queue items
  interface QueueItem {
    photoId: string;
    copyIndex: number;
    wMm: number;
    hMm: number;
  }

  const queue: QueueItem[] = [];

  for (const photo of photos) {
    const preset = PHOTO_PRESETS[photo.preset];
    let wMm = photo.preset === 'custom' ? photo.customWidthMm : preset.widthMm;
    let hMm = photo.preset === 'custom' ? photo.customHeightMm : preset.heightMm;

    // Special handling for a4-full: take full printable width & height of current page
    if (photo.preset === 'a4-full') {
      wMm = printableW;
      hMm = printableH;
    }

    const copies = Math.max(1, photo.quantity);

    for (let c = 0; c < copies; c++) {
      queue.push({
        photoId: photo.id,
        copyIndex: c + 1,
        wMm,
        hMm,
      });
    }
  }

  if (queue.length === 0) {
    return [{ pageIndex: 0, slots: [] }];
  }

  // 2. Multi-page grid packing
  const pages: ArrangedPage[] = [];
  let currentPageSlots: ArrangedPhotoSlot[] = [];

  let curX = margin;
  let curY = margin;
  let rowMaxHeight = 0;

  for (const item of queue) {
    // If photo is wider than printable width, cap to printable width
    const itemW = Math.min(item.wMm, printableW);
    const itemH = Math.min(item.hMm, printableH);

    // If current page is NOT empty, check if item fits in current row
    if (currentPageSlots.length > 0 && curX + itemW > pageWidthMm - margin + 0.1) {
      // Move to next row
      curX = margin;
      curY += rowMaxHeight + gap;
      rowMaxHeight = 0;
    }

    // If current page is NOT empty, check if item fits vertically on current page
    if (currentPageSlots.length > 0 && curY + itemH > pageHeightMm - margin + 0.1) {
      // Finalize current page and start next page
      pages.push({
        pageIndex: pages.length,
        slots: currentPageSlots,
      });
      currentPageSlots = [];
      curX = margin;
      curY = margin;
      rowMaxHeight = 0;
    }

    // Place photo in current slot (always succeeds on an empty page)
    currentPageSlots.push({
      photoId: item.photoId,
      copyIndex: item.copyIndex,
      xMm: Math.round(curX * 100) / 100,
      yMm: Math.round(curY * 100) / 100,
      wMm: Math.round(itemW * 100) / 100,
      hMm: Math.round(itemH * 100) / 100,
    });

    curX += itemW + gap;
    if (itemH > rowMaxHeight) {
      rowMaxHeight = itemH;
    }
  }

  // Push remaining slots of the last page
  if (currentPageSlots.length > 0 || pages.length === 0) {
    pages.push({
      pageIndex: pages.length,
      slots: currentPageSlots,
    });
  }

  return pages;
}

/**
 * Renders an arranged page onto a 300 DPI HTML5 Canvas
 */
export function renderArrangedPageToCanvas(
  page: ArrangedPage,
  photosMap: Map<string, StudioPhotoItem>,
  settings: SheetSettings
): HTMLCanvasElement {
  const paper = PAPER_DIMENSIONS_MM[settings.paperSize];
  const isLandscape = settings.orientation === 'landscape';

  const pageWidthMm = isLandscape ? Math.max(paper.width, paper.height) : Math.min(paper.width, paper.height);
  const pageHeightMm = isLandscape ? Math.min(paper.width, paper.height) : Math.max(paper.width, paper.height);

  const canvasW = Math.round(pageWidthMm * DPI_300_PX_PER_MM);
  const canvasH = Math.round(pageHeightMm * DPI_300_PX_PER_MM);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Fill clean white sheet background
  ctx.fillStyle = settings.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 2. Draw each photo slot
  for (const slot of page.slots) {
    const photo = photosMap.get(slot.photoId);
    if (!photo) continue;

    const pxX = Math.round(slot.xMm * DPI_300_PX_PER_MM);
    const pxY = Math.round(slot.yMm * DPI_300_PX_PER_MM);
    const pxW = Math.round(slot.wMm * DPI_300_PX_PER_MM);
    const pxH = Math.round(slot.hMm * DPI_300_PX_PER_MM);

    // Render photo canvas or fallback img
    if (photo.processedCanvas) {
      ctx.drawImage(photo.processedCanvas, pxX, pxY, pxW, pxH);
    } else if (photo.imgElement) {
      ctx.drawImage(photo.imgElement, pxX, pxY, pxW, pxH);
    }

    // Optional 0.3pt subtle cut outline for scissors
    if (settings.showCutBorder) {
      ctx.save();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(pxX, pxY, pxW, pxH);
      ctx.restore();
    }

    // Optional L-bracket crop marks
    if (settings.showCropMarks) {
      drawCropMarks(ctx, pxX, pxY, pxW, pxH);
    }
  }

  // 3. Optional small footer metadata notice
  if (settings.showFooterInfo) {
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.font = `normal ${Math.round(2.6 * DPI_300_PX_PER_MM)}px 'Hind Siliguri', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `The MoSaFa Tools • Digital Photo Studio • Page ${page.pageIndex + 1} • 100% Actual Scale • Paper: ${settings.paperSize} (${settings.orientation})`,
      canvasW / 2,
      canvasH - Math.round(5 * DPI_300_PX_PER_MM)
    );
    ctx.restore();
  }

  return canvas;
}

/**
 * Draws precision corner L-brackets (crop marks) around photo
 */
function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const markLen = Math.round(3.0 * DPI_300_PX_PER_MM);
  const markOffset = Math.round(1.0 * DPI_300_PX_PER_MM);

  ctx.save();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.0;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(x - markOffset - markLen, y);
  ctx.lineTo(x - markOffset, y);
  ctx.moveTo(x, y - markOffset - markLen);
  ctx.lineTo(x, y - markOffset);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(x + w + markOffset + markLen, y);
  ctx.lineTo(x + w + markOffset, y);
  ctx.moveTo(x + w, y - markOffset - markLen);
  ctx.lineTo(x + w, y - markOffset);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(x - markOffset - markLen, y + h);
  ctx.lineTo(x - markOffset, y + h);
  ctx.moveTo(x, y + h + markOffset + markLen);
  ctx.lineTo(x, y + h + markOffset);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(x + w + markOffset + markLen, y + h);
  ctx.lineTo(x + w + markOffset, y + h);
  ctx.moveTo(x + w, y + h + markOffset + markLen);
  ctx.lineTo(x + w, y + h + markOffset);
  ctx.stroke();

  ctx.restore();
}

/**
 * Exports all arranged pages into a millimeter-exact multi-page vector PDF
 */
export function exportStudioMultiPagePdf(
  pages: ArrangedPage[],
  photosMap: Map<string, StudioPhotoItem>,
  settings: SheetSettings,
  filename = 'MoSaFa_Photo_Studio_A4.pdf'
) {
  const paper = PAPER_DIMENSIONS_MM[settings.paperSize];
  const isLandscape = settings.orientation === 'landscape';

  const pageWidthMm = isLandscape ? Math.max(paper.width, paper.height) : Math.min(paper.width, paper.height);
  const pageHeightMm = isLandscape ? Math.min(paper.width, paper.height) : Math.max(paper.width, paper.height);

  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.paperSize.toLowerCase() as any,
  });

  pages.forEach((page, pageIdx) => {
    if (pageIdx > 0) {
      pdf.addPage(settings.paperSize.toLowerCase() as any, settings.orientation);
    }

    for (const slot of page.slots) {
      const photo = photosMap.get(slot.photoId);
      if (!photo) continue;

      const sourceCanvas = photo.processedCanvas;
      if (!sourceCanvas) continue;

      const imgData = sourceCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', slot.xMm, slot.yMm, slot.wMm, slot.hMm);

      if (settings.showCutBorder) {
        pdf.setDrawColor(200, 210, 220);
        pdf.setLineWidth(0.15);
        pdf.rect(slot.xMm, slot.yMm, slot.wMm, slot.hMm, 'S');
      }

      if (settings.showCropMarks) {
        drawPdfCropMarks(pdf, slot.xMm, slot.yMm, slot.wMm, slot.hMm);
      }
    }

    if (settings.showFooterInfo) {
      pdf.setTextColor(150, 165, 180);
      pdf.setFontSize(7);
      pdf.text(
        `The MoSaFa Tools - Digital Photo Studio | Page ${pageIdx + 1} of ${pages.length} | 100% Actual Scale`,
        pageWidthMm / 2,
        pageHeightMm - 5,
        { align: 'center' }
      );
    }
  });

  pdf.save(filename);
}

/**
 * Draws precision vector crop marks in PDF
 */
function drawPdfCropMarks(pdf: jsPDF, x: number, y: number, w: number, h: number) {
  const markLen = 3.0; // 3mm
  const offset = 1.0; // 1mm

  pdf.setDrawColor(100, 115, 130);
  pdf.setLineWidth(0.15);

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
 * Triggers native printing for multi-page photo sheets using the universal print engine
 */
export function triggerStudioMultiPagePrint(
  pages: ArrangedPage[],
  photosMap: Map<string, StudioPhotoItem>,
  settings: SheetSettings,
  onShowToast?: (msg: string, icon?: string) => void
) {
  const pageImages: string[] = pages.map((page) => {
    const canvas = renderArrangedPageToCanvas(page, photosMap, settings);
    return canvas.toDataURL('image/jpeg', 0.98);
  });

  triggerUniversalPrint(
    pageImages,
    { paperSize: settings.paperSize, orientation: settings.orientation },
    onShowToast
  );
}
