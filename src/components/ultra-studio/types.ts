export interface Point {
  x: number;
  y: number;
}

export interface CardCorners {
  tl: Point; // Top-Left
  tr: Point; // Top-Right
  br: Point; // Bottom-Right
  bl: Point; // Bottom-Left
}

export type PaperSize = 'A4' | 'A5' | 'Letter' | 'Legal';
export type PageOrientation = 'portrait' | 'landscape';
export type CardLayout = 'side-by-side' | 'stacked';
export type PageAlignment = 'center' | 'top-left';

export interface CardImageState {
  file: File | null;
  rawUrl: string | null;
  imgElement: HTMLImageElement | null;
  naturalWidth: number;
  naturalHeight: number;
  corners: CardCorners | null;
  processedUrl: string | null;
  processedCanvas: HTMLCanvasElement | null;
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  brightness: number; // -50 to 50, default 0
  contrast: number; // -50 to 50, default 0
  sharpness: boolean;
  isProcessing: boolean;
  error: string | null;
}

export interface PageLayoutSettings {
  paperSize: PaperSize;
  orientation: PageOrientation;
  layout: CardLayout;
  alignment: PageAlignment;
  cardWidthMm: number; // Standard: 85.6 mm
  cardHeightMm: number; // Standard: 53.98 mm
  marginMm: number; // 10, 15, 20, 25
  gapMm: number; // 5, 10, 15, 20
  scalePercent: number; // 100% = actual size, 120% = large
  showCutBorder: boolean; // 0.5pt subtle outline
  showCropMarks: boolean; // L-shaped cutting guidelines
  showFooterInfo: boolean; // Optional small note
  swapSides: boolean; // If true, Back side on Left/Top
  backgroundColor: string; // Default #ffffff
}

export const PAPER_DIMENSIONS_MM: Record<PaperSize, { width: number; height: number; name: string; banglaName: string }> = {
  A4: { width: 210, height: 297, name: 'A4 (210 × 297 mm)', banglaName: 'A4 সাইজ (প্রমিত অফিস পেপার)' },
  A5: { width: 148, height: 210, name: 'A5 (148 × 210 mm)', banglaName: 'A5 সাইজ (হাফ সাইজ পেপার)' },
  Letter: { width: 215.9, height: 279.4, name: 'Letter (8.5 × 11 in)', banglaName: 'লেটার সাইজ (৮.৫ × ১১ ইঞ্চি)' },
  Legal: { width: 215.9, height: 355.6, name: 'Legal (8.5 × 14 in)', banglaName: 'লিগ্যাল সাইজ (৮.৫ × ১৪ ইঞ্চি)' },
};

// Standard ISO/IEC 7810 ID-1 Physical Card Dimensions
export const STANDARD_ID_CARD = {
  widthMm: 85.6,
  heightMm: 53.98,
  aspectRatio: 85.6 / 53.98, // ~ 1.58577
};
