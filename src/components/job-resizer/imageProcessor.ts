// Image Processing Utility for MoSaFa Job Photo & Signature Resizer
// 100% Client-Side Canvas Processing & JPEG Compression

import JSZip from 'jszip';

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  sizeKB: number;
  width: number;
  height: number;
  format: 'image/jpeg';
  qualityUsed: number;
}

export interface PhotoCropSettings {
  zoom: number; // 1.0 to 2.0
  offsetY: number; // -50 to +50 (vertical shift for face centering)
}

/**
 * Loads a File into an HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('দয়া করে একটি সঠিক ইমেজ ফাইল নির্বাচন করুন (JPG, PNG বা WEBP)।'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('ছবিটি লোড করা সম্ভব হয়নি। ফাইলটি ক্ষতিগ্রস্ত হতে পারে।'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('ফাইলটি পড়তে সমস্যা হয়েছে।'));
    reader.readAsDataURL(file);
  });
}

/**
 * Iteratively compresses an HTMLCanvasElement to a JPEG Blob <= maxKB
 */
export function compressCanvasToJpeg(
  canvas: HTMLCanvasElement,
  maxKB: number,
  initialQuality = 0.95
): Promise<{ blob: Blob; qualityUsed: number }> {
  return new Promise((resolve, reject) => {
    let quality = initialQuality;
    const maxBytes = maxKB * 1024;
    const minQuality = 0.25;
    const step = 0.05;

    const attempt = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('ক্যানভাস থেকে ছবি রূপান্তর ব্যর্থ হয়েছে।'));
            return;
          }

          // If blob size meets target or we reached lowest acceptable quality
          if (blob.size <= maxBytes || quality <= minQuality) {
            resolve({ blob, qualityUsed: quality });
          } else {
            quality = Math.max(minQuality, quality - step);
            attempt();
          }
        },
        'image/jpeg',
        quality
      );
    };

    attempt();
  });
}

/**
 * Processes an applicant photograph:
 * - Square target dimensions (default 300x300)
 * - Intelligent center/face crop (prioritizing upper-middle portrait)
 * - White background fill behind any transparent pixels
 * - Never stretches face
 * - Iterative JPEG compression <= maxKB (default 100KB)
 */
export async function processApplicantPhoto(
  img: HTMLImageElement,
  targetWidth = 300,
  targetHeight = 300,
  maxKB = 100,
  cropSettings: PhotoCropSettings = { zoom: 1.0, offsetY: 0 }
): Promise<ProcessedImageResult> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('ব্রাউজার ক্যানভাস ইনিশিয়ালাইজ করতে ব্যর্থ হয়েছে।');
  }

  // Pure white base to handle any transparency (e.g. from PNG/WEBP)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // High quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // Calculate crop rectangle preserving aspect ratio (fill target canvas without distortion)
  const targetAspect = targetWidth / targetHeight;
  const origAspect = origW / origH;

  let srcW = origW;
  let srcH = origH;
  let srcX = 0;
  let srcY = 0;

  if (origAspect > targetAspect) {
    // Image is wider than target: crop left & right
    srcW = origH * targetAspect;
    srcH = origH;
    srcX = (origW - srcW) / 2;
    srcY = 0;
  } else {
    // Image is taller than target: crop top & bottom
    srcW = origW;
    srcH = origW / targetAspect;
    srcX = 0;
    // For human portraits, head is usually in top 20-40% so default crop sits higher than pure middle
    const naturalHeadShift = (origH - srcH) * 0.25;
    srcY = Math.max(0, Math.min(origH - srcH, naturalHeadShift));
  }

  // Apply user crop settings (zoom & manual offsetY)
  const zoom = Math.max(1.0, Math.min(2.5, cropSettings.zoom));
  const finalSrcW = srcW / zoom;
  const finalSrcH = srcH / zoom;

  // Center based on zoom
  let finalSrcX = srcX + (srcW - finalSrcW) / 2;
  let finalSrcY = srcY + (srcH - finalSrcH) / 2;

  // Apply manual vertical shift (percent of available vertical range)
  if (cropSettings.offsetY !== 0) {
    const shiftRange = origH * 0.2;
    finalSrcY += (cropSettings.offsetY / 50) * shiftRange;
  }

  // Bound within source image dimensions
  finalSrcX = Math.max(0, Math.min(origW - finalSrcW, finalSrcX));
  finalSrcY = Math.max(0, Math.min(origH - finalSrcH, finalSrcY));

  // Draw onto target canvas
  ctx.drawImage(img, finalSrcX, finalSrcY, finalSrcW, finalSrcH, 0, 0, targetWidth, targetHeight);

  // Compress to target maxKB JPEG
  const { blob, qualityUsed } = await compressCanvasToJpeg(canvas, maxKB);
  const dataUrl = canvas.toDataURL('image/jpeg', qualityUsed);
  const sizeKB = Number((blob.size / 1024).toFixed(2));

  return {
    blob,
    dataUrl,
    sizeKB,
    width: targetWidth,
    height: targetHeight,
    format: 'image/jpeg',
    qualityUsed,
  };
}

/**
 * Processes an applicant signature:
 * - Target dimensions (default 300x80)
 * - Fits signature naturally within target box preserving exact aspect ratio
 * - Never crops away any part of the signature!
 * - Never distorts or stretches the strokes
 * - Solid pure white background (#FFFFFF)
 * - Iterative JPEG compression <= maxKB (default 60KB)
 */
export async function processApplicantSignature(
  img: HTMLImageElement,
  targetWidth = 300,
  targetHeight = 80,
  maxKB = 60
): Promise<ProcessedImageResult> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('ব্রাউজার ক্যানভাস ইনিশিয়ালাইজ করতে ব্যর্থ হয়েছে।');
  }

  // 1. Fill canvas with pure white background (required by Teletalk/recruitment systems)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // 2. Fit signature completely inside canvas with sensible margins (so edges are never cut off)
  const paddingX = 8;
  const paddingY = 6;
  const availableW = targetWidth - paddingX * 2;
  const availableH = targetHeight - paddingY * 2;

  const scale = Math.min(availableW / origW, availableH / origH);
  const drawW = origW * scale;
  const drawH = origH * scale;

  // Center inside canvas
  const drawX = (targetWidth - drawW) / 2;
  const drawY = (targetHeight - drawH) / 2;

  ctx.drawImage(img, 0, 0, origW, origH, drawX, drawY, drawW, drawH);

  // 3. Compress to JPEG <= maxKB
  const { blob, qualityUsed } = await compressCanvasToJpeg(canvas, maxKB);
  const dataUrl = canvas.toDataURL('image/jpeg', qualityUsed);
  const sizeKB = Number((blob.size / 1024).toFixed(2));

  return {
    blob,
    dataUrl,
    sizeKB,
    width: targetWidth,
    height: targetHeight,
    format: 'image/jpeg',
    qualityUsed,
  };
}

/**
 * Triggers a direct browser file download for a Blob
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Bundles both processed images into a ZIP archive and triggers download
 */
export async function downloadBothAsZip(
  photoBlob: Blob,
  sigBlob: Blob,
  zipFilename = 'mosafa-job-application-files.zip'
): Promise<void> {
  const zip = new JSZip();

  zip.file('mosafa-job-photo.jpg', photoBlob);
  zip.file('mosafa-job-signature.jpg', sigBlob);

  const instructionsText = `MoSaFa Job Photo & Signature Resizer
=========================================
সরকারি ও অন্যান্য চাকরির আবেদনের জন্য আপনার ছবি ও স্বাক্ষর প্রস্তুত করা হয়েছে।

ফাইলগুলোর বিবরণ:
1. mosafa-job-photo.jpg (পাসপোর্ট সাইজ ছবি, ৩০০ x ৩০০ পিক্সেল, ১০০ KB এর কম)
2. mosafa-job-signature.jpg (স্বাক্ষর, ৩০০ x ৮০ পিক্সেল, ৬০ KB এর কম)

টেলিটক ও অন্যান্য সরকারি নিয়োগ পোর্টালে এই ফাইলগুলো সরাসরি আপলোড করতে পারবেন।
ওয়েবসাইট: The MoSaFa Tools
`;
  zip.file('instructions.txt', instructionsText);

  const zipContent = await zip.generateAsync({ type: 'blob' });
  triggerFileDownload(zipContent, zipFilename);
}
