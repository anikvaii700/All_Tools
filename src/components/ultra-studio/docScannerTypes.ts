import { Point, CardCorners } from './types';

export type DocProcessingStage =
  | 'uploading'
  | 'detecting'
  | 'straightening'
  | 'cleaning'
  | 'preparing'
  | 'completed'
  | 'needs_adjustment'
  | 'error';

export type DocColorMode = 'color' | 'bw' | 'grayscale' | 'original';

export type DocScalingMode = 'fit' | 'fill' | 'original';

export type DocA4Orientation = 'auto' | 'portrait' | 'landscape';

export interface ScannedDocPage {
  id: string;
  file: File | null;
  fileName: string;
  fileSize: number;
  rawUrl: string;
  imgElement: HTMLImageElement | null;
  naturalWidth: number;
  naturalHeight: number;

  // 4 corners in original image coordinates
  corners: CardCorners;
  autoDetectedCorners: CardCorners;
  confidence: number; // 0-100%

  // Transforms & Rotations
  rotation: number; // 0, 90, 180, 270

  // Status & Pipeline
  stage: DocProcessingStage;
  statusMessage: string;
  progressPercent: number; // 0-100%

  // Visual Enhancements
  colorMode: DocColorMode;
  brightness: number; // -50 to +50 (default 0)
  contrast: number; // -50 to +50 (default 0)
  sharpness: number; // 0 to 100 (default 35)
  removeShadows: boolean; // default true
  shadowRemovalStrength: number; // 0 to 100 (default 65)

  // A4 placement preferences for this specific page
  scalingMode: DocScalingMode;
  a4Orientation: DocA4Orientation;

  // Rendered artifacts
  processedWarpCanvas: HTMLCanvasElement | null;
  processedEnhanceCanvas: HTMLCanvasElement | null;
  finalA4Canvas: HTMLCanvasElement | null;
  previewA4Url: string | null;

  createdAt: number;
}

export interface DocScannerGlobalSettings {
  defaultColorMode: DocColorMode;
  globalOrientation: DocA4Orientation;
  globalScaling: DocScalingMode;
  marginMm: number; // default 8 mm
  targetDpi: number; // 150, 200, 300 (default 300)
  showPageNumbers: boolean;
  pageNumberPosition: 'bottom-center' | 'bottom-right';
  showSubtleBorder: boolean;
  paperSize: 'A4';
}

export const DEFAULT_DOC_SCANNER_SETTINGS: DocScannerGlobalSettings = {
  defaultColorMode: 'color',
  globalOrientation: 'auto',
  globalScaling: 'fit',
  marginMm: 8,
  targetDpi: 300,
  showPageNumbers: false,
  pageNumberPosition: 'bottom-center',
  showSubtleBorder: false,
  paperSize: 'A4',
};

// Standard A4 constants in millimeters and pixels
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const A4_ASPECT_RATIO = A4_HEIGHT_MM / A4_WIDTH_MM; // ~1.4142

// Pixel dimensions at 300 DPI
export const A4_WIDTH_PX_300DPI = 2480;
export const A4_HEIGHT_PX_300DPI = 3508;

// Pixel dimensions for fast preview canvas (150 DPI)
export const A4_WIDTH_PX_PREVIEW = 1240;
export const A4_HEIGHT_PX_PREVIEW = 1754;
