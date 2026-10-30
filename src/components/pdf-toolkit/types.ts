export type PDFSubTool =
  | 'dashboard'
  | 'edit-text'
  | 'merge'
  | 'split'
  | 'compress'
  | 'images-to-pdf'
  | 'pdf-to-images'
  | 'rotate'
  | 'organize'
  | 'page-numbers'
  | 'watermark'
  | 'metadata';

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  previewUrl?: string;
  dataBuffer?: Uint8Array;
}

export interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
  rotation: number;
  selected: boolean;
}

export interface ImageToPdfOptions {
  pageSize: 'a4' | 'letter' | 'legal' | 'original';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'small' | 'normal';
  fit: 'fit' | 'fill' | 'original';
}

export interface PageNumberOptions {
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  format: 'number' | 'page-n' | 'page-n-of-total';
  startFrom: number;
  fontSize: number;
  color: string;
  allPages: boolean;
  selectedRange?: string;
}

export interface WatermarkOptions {
  type: 'text' | 'image';
  text: string;
  fontSize: number;
  fontColor: string;
  opacity: number;
  rotation: number;
  imageFile?: File | null;
  imageDataUrl?: string;
  imageScale: number;
  allPages: boolean;
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
}

export interface CompressionResult {
  originalSize: number;
  newSize: number;
  savedBytes: number;
  savedPercent: number;
  pdfData: Uint8Array;
}
