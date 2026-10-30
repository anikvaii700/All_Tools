import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import {
  ImageToPdfOptions,
  PageNumberOptions,
  WatermarkOptions,
  PdfMetadata,
  CompressionResult,
} from './types';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker using same-origin Vite bundled asset
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

/**
 * Format bytes into human-readable string (KB, MB)
 */
export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Read File as Uint8Array
 */
export const readFileAsArrayBuffer = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Read File as Data URL
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('ফাইল কনভার্ট করতে ব্যর্থ হয়েছে'));
    reader.readAsDataURL(file);
  });
};

/**
 * Download file in browser
 */
export const downloadFile = (data: Uint8Array | Blob, filename: string, mimeType = 'application/pdf') => {
  const blob = data instanceof Blob ? data : new Blob([data as any], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Get PDF Page Count
 */
export const getPdfPageCount = async (buffer: Uint8Array): Promise<number> => {
  try {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch {
    return 0;
  }
};

// Polyfill Promise.try if not natively present in environment
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function (fn: any, ...args: any[]) {
    return new Promise((resolve) => resolve(fn(...args)));
  };
}

/**
 * Render and extract text items from a PDF page in a single efficient pass
 */
export const renderAndExtractPdfPage = async (
  pdfData: Uint8Array,
  pageNumber: number,
  scale = 2.0
): Promise<{
  canvas: HTMLCanvasElement;
  viewportWidth: number;
  viewportHeight: number;
  items: DetectedPdfTextItem[];
}> => {
  const safeData = new Uint8Array(
    pdfData.buffer.slice(pdfData.byteOffset, pdfData.byteOffset + pdfData.byteLength)
  );

  const loadingTask = pdfjsLib.getDocument({
    data: safeData,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('ক্যানভাস তৈরি করা যায়নি');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // Fill canvas with white background initially
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  } as any).promise;

  // Extract text items
  const items: DetectedPdfTextItem[] = [];
  try {
    const textContent = await page.getTextContent();
    for (let i = 0; i < textContent.items.length; i++) {
      const item: any = textContent.items[i];
      if (!item.str || !item.str.trim()) continue;

      const tx = item.transform[4];
      const ty = item.transform[5];
      const [vx, vy] = viewport.convertToViewportPoint(tx, ty);

      const fontHeight = Math.hypot(item.transform[2], item.transform[3]) * scale;
      const width = (item.width || 20) * scale;
      const height = Math.max(fontHeight, 14);

      items.push({
        id: `detected_${pageNumber}_${i}`,
        str: item.str,
        x: Math.max(0, vx),
        y: Math.max(0, vy - height),
        width: Math.max(width, 16),
        height: height + 2,
        fontSize: Math.max(10, Math.round(fontHeight)),
      });
    }
  } catch (err) {
    console.warn('Text extraction warning:', err);
  }

  return {
    canvas,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    items,
  };
};

/**
 * Render PDF Page to Canvas using PDF.js
 */
export const renderPdfPageToCanvas = async (
  pdfData: Uint8Array,
  pageNumber: number,
  scale = 1.0
): Promise<HTMLCanvasElement> => {
  const result = await renderAndExtractPdfPage(pdfData, pageNumber, scale);
  return result.canvas;
};

export interface DetectedPdfTextItem {
  id: string;
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

/**
 * Extract all text fragments with their bounding boxes on a page for in-place editing
 */
export const extractPdfPageTextItems = async (
  pdfData: Uint8Array,
  pageNumber: number,
  scale = 2.0
): Promise<{ viewportWidth: number; viewportHeight: number; items: DetectedPdfTextItem[] }> => {
  const result = await renderAndExtractPdfPage(pdfData, pageNumber, scale);
  return {
    viewportWidth: result.viewportWidth,
    viewportHeight: result.viewportHeight,
    items: result.items,
  };
};

/**
 * Render all page thumbnails of a PDF
 */
export const renderPdfThumbnails = async (
  pdfData: Uint8Array,
  maxPages = 30
): Promise<{ pageNumber: number; dataUrl: string }[]> => {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    const total = Math.min(pdfDoc.numPages, maxPages);
    const thumbnails: { pageNumber: number; dataUrl: string }[] = [];

    for (let i = 1; i <= total; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.35 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport, canvas } as any).promise;
        thumbnails.push({
          pageNumber: i,
          dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        });
      }
    }
    return thumbnails;
  } catch (err) {
    console.error('Error rendering thumbnails:', err);
    return [];
  }
};

/**
 * 1. MERGE PDFs
 */
export const mergePDFs = async (files: Uint8Array[]): Promise<Uint8Array> => {
  if (files.length === 0) throw new Error('মার্জ করার জন্য কোনো ফাইল পাওয়া যায়নি');
  const mergedPdf = await PDFDocument.create();

  for (const fileBytes of files) {
    const doc = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
};

/**
 * 2. SPLIT PDF
 */
export const splitPDF = async (
  fileBytes: Uint8Array,
  mode: 'all' | 'range' | 'selected',
  rangeStr?: string
): Promise<{ name: string; data: Uint8Array }[]> => {
  const srcDoc = await PDFDocument.load(fileBytes);
  const totalPages = srcDoc.getPageCount();
  const results: { name: string; data: Uint8Array }[] = [];

  if (mode === 'all') {
    for (let i = 0; i < totalPages; i++) {
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copiedPage);
      const data = await newDoc.save();
      results.push({ name: `page-${i + 1}.pdf`, data });
    }
  } else if (mode === 'range' && rangeStr) {
    // e.g. "1-3, 5, 8-10"
    const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);
    let partIdx = 1;

    for (const part of parts) {
      const newDoc = await PDFDocument.create();
      let pagesToCopy: number[] = [];

      if (part.includes('-')) {
        const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          const s = Math.max(1, Math.min(start, end));
          const e = Math.min(totalPages, Math.max(start, end));
          for (let p = s; p <= e; p++) {
            pagesToCopy.push(p - 1);
          }
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pagesToCopy.push(pageNum - 1);
        }
      }

      if (pagesToCopy.length > 0) {
        const copied = await newDoc.copyPages(srcDoc, pagesToCopy);
        copied.forEach((cp) => newDoc.addPage(cp));
        const data = await newDoc.save();
        results.push({ name: `part-${partIdx}_pages-${part}.pdf`, data });
        partIdx++;
      }
    }
  } else if (mode === 'selected' && rangeStr) {
    // e.g. "2, 4, 7"
    const pageNums = rangeStr
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= totalPages);

    if (pageNums.length === 0) throw new Error('কোনো সঠিক পৃষ্ঠা নম্বর নির্বাচন করা হয়নি');

    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(
      srcDoc,
      pageNums.map((n) => n - 1)
    );
    copied.forEach((cp) => newDoc.addPage(cp));
    const data = await newDoc.save();
    results.push({ name: `extracted-pages.pdf`, data });
  }

  if (results.length === 0) {
    throw new Error('পৃষ্ঠা বিভাজন করা সম্ভব হয়নি। সঠিক পৃষ্ঠা নম্বর প্রদান করুন।');
  }

  return results;
};

/**
 * 3. COMPRESS PDF
 */
export const compressPDF = async (
  fileBytes: Uint8Array,
  level: 'low' | 'medium' | 'high'
): Promise<CompressionResult> => {
  const originalSize = fileBytes.length;

  if (level === 'low') {
    // Stream re-organization & object stream compression
    const doc = await PDFDocument.load(fileBytes);
    const newBytes = await doc.save({ useObjectStreams: true });
    const savedBytes = originalSize - newBytes.length;
    const savedPercent = Math.max(0, Math.round((savedBytes / originalSize) * 100));

    return {
      originalSize,
      newSize: newBytes.length,
      savedBytes,
      savedPercent,
      pdfData: newBytes,
    };
  }

  // Medium / High: Canvas re-encoding with optimized quality
  try {
    const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
    const pdfDoc = await loadingTask.promise;
    const totalPages = pdfDoc.numPages;

    const newDoc = await PDFDocument.create();
    const quality = level === 'medium' ? 0.72 : 0.52;
    const scale = level === 'medium' ? 1.3 : 1.0;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

      const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
      const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
      const embeddedImg = await newDoc.embedJpg(imgBytes);

      // Preserve original aspect ratio
      const origViewport = page.getViewport({ scale: 1.0 });
      const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
      newPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: origViewport.width,
        height: origViewport.height,
      });
    }

    const compressedBytes = await newDoc.save({ useObjectStreams: true });
    const savedBytes = originalSize - compressedBytes.length;
    const savedPercent = Math.max(0, Math.round((savedBytes / originalSize) * 100));

    return {
      originalSize,
      newSize: compressedBytes.length,
      savedBytes,
      savedPercent,
      pdfData: compressedBytes,
    };
  } catch (err) {
    console.warn('Raster compression failed, falling back to object stream:', err);
    const doc = await PDFDocument.load(fileBytes);
    const fallbackBytes = await doc.save({ useObjectStreams: true });
    return {
      originalSize,
      newSize: fallbackBytes.length,
      savedBytes: originalSize - fallbackBytes.length,
      savedPercent: 0,
      pdfData: fallbackBytes,
    };
  }
};

/**
 * 4. ROTATE PDF PAGES
 */
export const rotatePDFPages = async (
  fileBytes: Uint8Array,
  angle: number,
  selectedPages?: number[]
): Promise<Uint8Array> => {
  const doc = await PDFDocument.load(fileBytes);
  const total = doc.getPageCount();

  for (let i = 0; i < total; i++) {
    if (!selectedPages || selectedPages.includes(i + 1)) {
      const page = doc.getPage(i);
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angle) % 360));
    }
  }

  return await doc.save();
};

/**
 * 5. ORGANIZE PDF (Reorder & Delete & Extract)
 */
export const organizePDFPages = async (
  fileBytes: Uint8Array,
  newOrderOneBased: number[]
): Promise<Uint8Array> => {
  const srcDoc = await PDFDocument.load(fileBytes);
  const total = srcDoc.getPageCount();

  // Validate indices
  const validIndices = newOrderOneBased
    .filter((n) => n >= 1 && n <= total)
    .map((n) => n - 1);

  if (validIndices.length === 0) {
    throw new Error('সব পৃষ্ঠা মুছে ফেলা সম্ভব নয়। অন্তত একটি পৃষ্ঠা রাখুন।');
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  return await newDoc.save();
};

/**
 * 6. IMAGES TO PDF
 */
export const convertImagesToPDF = async (
  images: { dataUrl: string; width: number; height: number }[],
  options: ImageToPdfOptions
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();

  // Dimensions in points (72 points = 1 inch)
  const SIZES: Record<string, [number, number]> = {
    a4: [595.28, 841.89],
    letter: [612, 792],
    legal: [612, 1008],
  };

  for (const imgItem of images) {
    let img;
    if (imgItem.dataUrl.startsWith('data:image/png')) {
      img = await pdfDoc.embedPng(imgItem.dataUrl);
    } else {
      img = await pdfDoc.embedJpg(imgItem.dataUrl);
    }

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'original') {
      pageWidth = imgItem.width;
      pageHeight = imgItem.height;
    } else {
      const base = SIZES[options.pageSize] || SIZES.a4;
      if (options.orientation === 'landscape') {
        pageWidth = Math.max(base[0], base[1]);
        pageHeight = Math.min(base[0], base[1]);
      } else {
        pageWidth = Math.min(base[0], base[1]);
        pageHeight = Math.max(base[0], base[1]);
      }
    }

    const marginVal = options.margin === 'none' ? 0 : options.margin === 'small' ? 20 : 40;
    const availWidth = pageWidth - marginVal * 2;
    const availHeight = pageHeight - marginVal * 2;

    let drawW = availWidth;
    let drawH = availHeight;
    let drawX = marginVal;
    let drawY = marginVal;

    if (options.fit === 'fit') {
      const scale = Math.min(availWidth / imgItem.width, availHeight / imgItem.height);
      drawW = imgItem.width * scale;
      drawH = imgItem.height * scale;
      drawX = marginVal + (availWidth - drawW) / 2;
      drawY = marginVal + (availHeight - drawH) / 2;
    } else if (options.fit === 'original') {
      drawW = Math.min(imgItem.width, availWidth);
      drawH = Math.min(imgItem.height, availHeight);
      drawX = marginVal + (availWidth - drawW) / 2;
      drawY = marginVal + (availHeight - drawH) / 2;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(img, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });
  }

  return await pdfDoc.save();
};

/**
 * 7. PDF TO IMAGES
 */
export const convertPdfToImages = async (
  fileBytes: Uint8Array,
  format: 'png' | 'jpg',
  scale = 1.5,
  selectedPages?: number[]
): Promise<{ pageNumber: number; dataUrl: string }[]> => {
  const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
  const pdfDoc = await loadingTask.promise;
  const total = pdfDoc.numPages;
  const results: { pageNumber: number; dataUrl: string }[] = [];

  for (let i = 1; i <= total; i++) {
    if (!selectedPages || selectedPages.includes(i)) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mime, format === 'jpg' ? 0.9 : 1.0);
      results.push({ pageNumber: i, dataUrl });
    }
  }

  return results;
};

/**
 * 8. CREATE ZIP ARCHIVE
 */
export const createZipArchive = async (
  files: { filename: string; data: Uint8Array | Blob }[]
): Promise<Blob> => {
  const zip = new JSZip();
  files.forEach((f) => {
    zip.file(f.filename, f.data);
  });
  return await zip.generateAsync({ type: 'blob' });
};

/**
 * 9. ADD PAGE NUMBERS
 */
export const addPageNumbers = async (
  fileBytes: Uint8Array,
  options: PageNumberOptions
): Promise<Uint8Array> => {
  const doc = await PDFDocument.load(fileBytes);
  const total = doc.getPageCount();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  // Parse color hex to rgb
  const hex = options.color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;

  for (let i = 0; i < total; i++) {
    const pageNum = i + options.startFrom;
    let label = `${pageNum}`;
    if (options.format === 'page-n') label = `Page ${pageNum}`;
    else if (options.format === 'page-n-of-total') label = `Page ${pageNum} of ${total}`;

    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    let x = 30;
    let y = 30;

    if (options.position.includes('center')) {
      x = (width - textWidth) / 2;
    } else if (options.position.includes('right')) {
      x = width - textWidth - 30;
    }

    if (options.position.startsWith('top')) {
      y = height - textHeight - 25;
    } else {
      y = 25;
    }

    page.drawText(label, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(r, g, b),
    });
  }

  return await doc.save();
};

/**
 * 10. ADD WATERMARK
 */
export const addWatermark = async (
  fileBytes: Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> => {
  const doc = await PDFDocument.load(fileBytes);
  const total = doc.getPageCount();

  if (options.type === 'text') {
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const hex = options.fontColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 0.6;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 0.6;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 0.6;

    for (let i = 0; i < total; i++) {
      const page = doc.getPage(i);
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);

      page.drawText(options.text, {
        x: width / 2 - textWidth / 2 + 30,
        y: height / 2,
        size: options.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: options.opacity,
        rotate: degrees(options.rotation),
      });
    }
  } else if (options.type === 'image' && options.imageDataUrl) {
    let img;
    if (options.imageDataUrl.startsWith('data:image/png')) {
      img = await doc.embedPng(options.imageDataUrl);
    } else {
      img = await doc.embedJpg(options.imageDataUrl);
    }

    const imgDims = img.scale(options.imageScale || 0.4);

    for (let i = 0; i < total; i++) {
      const page = doc.getPage(i);
      const { width, height } = page.getSize();

      page.drawImage(img, {
        x: (width - imgDims.width) / 2,
        y: (height - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height,
        opacity: options.opacity,
      });
    }
  }

  return await doc.save();
};

/**
 * 11. PDF METADATA
 */
export const getPDFMetadata = async (fileBytes: Uint8Array): Promise<PdfMetadata> => {
  const doc = await PDFDocument.load(fileBytes);
  return {
    title: doc.getTitle() || '',
    author: doc.getAuthor() || '',
    subject: doc.getSubject() || '',
    keywords: doc.getKeywords() || '',
    creator: doc.getCreator() || '',
    producer: doc.getProducer() || '',
  };
};

export const editPDFMetadata = async (
  fileBytes: Uint8Array,
  metadata: PdfMetadata
): Promise<Uint8Array> => {
  const doc = await PDFDocument.load(fileBytes);
  if (metadata.title !== undefined) doc.setTitle(metadata.title);
  if (metadata.author !== undefined) doc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) doc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) doc.setKeywords([metadata.keywords]);
  if (metadata.creator !== undefined) doc.setCreator(metadata.creator);
  if (metadata.producer !== undefined) doc.setProducer(metadata.producer);

  return await doc.save();
};
