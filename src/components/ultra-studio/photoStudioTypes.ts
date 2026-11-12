import { Point } from './types';

export type PhotoSizePreset =
  | 'passport-bd' // 45 x 35 mm (Bangladesh standard passport)
  | 'passport-intl' // 40 x 50 mm (International passport / 2x2 in)
  | 'stamp' // 20 x 25 mm (Bangladesh standard stamp size)
  | 'us-visa' // 51 x 51 mm (2x2 inch square)
  | 'schengen' // 35 x 45 mm (Schengen European visa)
  | '3r' // 89 x 127 mm (3.5 x 5 inch)
  | '4r' // 102 x 152 mm (4 x 6 inch postcard)
  | 'a4-full' // 200 x 287 mm (Full A4 print)
  | 'custom'; // Custom mm size

export interface PhotoPresetDefinition {
  id: PhotoSizePreset;
  name: string;
  banglaName: string;
  widthMm: number;
  heightMm: number;
  description: string;
  tag: string;
}

export const PHOTO_PRESETS: Record<PhotoSizePreset, PhotoPresetDefinition> = {
  'passport-bd': {
    id: 'passport-bd',
    name: 'Passport (BD Standard)',
    banglaName: 'পাসপোর্ট সাইজ (বাংলাদেশ প্রমিত)',
    widthMm: 35,
    heightMm: 45,
    description: '৩৫ × ৪৫ মিমি (চাকরি, ব্যাংক, পাসপোর্ট ও সরকারি ফর্মের জন্য সর্বাধিক ব্যবহৃত)',
    tag: 'জনপ্রিয়',
  },
  'passport-intl': {
    id: 'passport-intl',
    name: 'Passport (International 40x50mm)',
    banglaName: 'পাসপোর্ট সাইজ (আন্তর্জাতিক ৪০×৫০ মিমি)',
    widthMm: 40,
    heightMm: 50,
    description: '৪০ × ৫০ মিমি (আন্তর্জাতিক পাসপোর্ট ও ভিসা আবেদনের জন্য প্রমিত সাইজ)',
    tag: 'স্ট্যান্ডার্ড',
  },
  stamp: {
    id: 'stamp',
    name: 'Stamp Size',
    banglaName: 'স্ট্যাম্প সাইজ ছবি',
    widthMm: 20,
    heightMm: 25,
    description: '২০ × ২৫ মিমি (এডমিট কার্ড, অফিস রেজিস্টার ও প্রত্যয়নপত্রের ছোট সাইজ)',
    tag: 'প্রয়োজনীয়',
  },
  'us-visa': {
    id: 'us-visa',
    name: 'US Visa (2x2 inch)',
    banglaName: 'ইউএস ভিসা (২ × ২ ইঞ্চি স্কয়ার)',
    widthMm: 51,
    heightMm: 51,
    description: '৫১ × ৫১ মিমি (আমেরিকান ভিসা ও ডিভি লটারি আবেদনের বর্গাকার সাইজ)',
    tag: 'ভিসা',
  },
  schengen: {
    id: 'schengen',
    name: 'Schengen / UK Visa',
    banglaName: 'শেনজেন / ইউকে ভিসা',
    widthMm: 35,
    heightMm: 45,
    description: '৩৫ × ৪৫ মিমি (৮০% ফেস কভারেজ সহ ইউরোপিয়ান ইউনিয়ন ভিসা সাইজ)',
    tag: 'ভিসা',
  },
  '3r': {
    id: '3r',
    name: '3R Photo (3.5x5 inch)',
    banglaName: '৩R ছবি (৩.৫ × ৫ ইঞ্চি)',
    widthMm: 89,
    heightMm: 127,
    description: '৮৯ × ১২৭ মিমি (অ্যালবাম ও পোর্ট্রেট প্রিন্ট)',
    tag: 'প্রিন্ট',
  },
  '4r': {
    id: '4r',
    name: '4R Photo (4x6 inch)',
    banglaName: '৪R পোস্টকার্ড সাইজ (৪ × ৬ ইঞ্চি)',
    widthMm: 102,
    heightMm: 152,
    description: '১০২ × ১৫২ মিমি (ফ্যামিলি ও প্রফেশনাল স্টুডিও প্রিন্ট)',
    tag: 'স্টুডিও',
  },
  'a4-full': {
    id: 'a4-full',
    name: 'Full A4 Page',
    banglaName: 'সম্পূর্ণ A4 পেইজ প্রিন্ট',
    widthMm: 200,
    heightMm: 287,
    description: '২০০ × ২৮৭ মিমি (সম্পূর্ণ A4 পেজে বড় একক ছবি প্রিন্ট)',
    tag: 'ফুল পেজ',
  },
  custom: {
    id: 'custom',
    name: 'Custom Size',
    banglaName: 'কাস্টম সাইজ (নিজের মতো মাপ)',
    widthMm: 35,
    heightMm: 45,
    description: 'প্রয়োজন অনুযায়ী দৈর্ঘ্য ও প্রস্থ মিলিমিটারে নির্ধারণ করুন',
    tag: 'কাস্টম',
  },
};

export type StudioBgColor =
  | 'original' // Keep original photo background
  | '#ffffff' // Studio Clean White
  | '#0284c7' // Studio Classic Blue (Cyan 600)
  | '#0369a1' // Dark Royal Blue (Sky 700)
  | '#e0f2fe' // Soft Sky Blue (Sky 100)
  | '#f1f5f9' // Soft Neutral Gray (Slate 100)
  | 'transparent'; // Transparent PNG

export interface StudioPhotoItem {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  rawUrl: string;
  imgElement: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  preset: PhotoSizePreset;
  customWidthMm: number;
  customHeightMm: number;
  quantity: number; // Number of copies to arrange on sheet
  crop: {
    zoom: number; // 1 to 3
    panX: number; // -100 to 100
    panY: number; // -100 to 100
    rotation: number; // 0, 90, 180, 270
  };
  brightness: number; // -50 to 50
  contrast: number; // -50 to 50
  bgColor: StudioBgColor;
  processedCanvas: HTMLCanvasElement | null;
  processedUrl: string | null;
}

export interface SheetSettings {
  paperSize: 'A4' | 'A5' | 'Letter';
  orientation: 'portrait' | 'landscape';
  marginMm: number; // Outer page padding in mm (default 8mm)
  gapMm: number; // Gap between photos in mm (default 4mm)
  showCutBorder: boolean; // Subtle 0.3pt border for easy scissor cutting
  showCropMarks: boolean; // Corner L-bracket guidelines
  showFooterInfo: boolean; // Footer scale and date notice
  backgroundColor: string; // Default #ffffff
}

export interface ArrangedPhotoSlot {
  photoId: string;
  copyIndex: number;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
}

export interface ArrangedPage {
  pageIndex: number;
  slots: ArrangedPhotoSlot[];
}

export interface TwoPersonSettings {
  photo1: StudioPhotoItem | null;
  photo2: StudioPhotoItem | null;
  layout: 'side-by-side' | 'stacked';
  targetWidthMm: number;
  targetHeightMm: number;
  spacingMm: number;
  name1: string;
  name2: string;
  showNames: boolean;
  frameBorder: boolean;
  quantity: number;
}
