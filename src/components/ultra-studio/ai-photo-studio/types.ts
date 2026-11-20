export type StudioWorkspaceTab =
  | 'styles'
  | 'backgrounds'
  | 'enhance'
  | 'passport'
  | 'print';

export type StyleCategoryId =
  | 'professional-portrait'
  | 'passport-visa'
  | 'corporate-headshot'
  | 'formal-business'
  | 'traditional-clothing'
  | 'islamic-formal'
  | 'casual-portrait'
  | 'studio-portrait'
  | 'wedding-photography'
  | 'cinematic-portrait'
  | 'fashion-photography'
  | 'creative-portrait'
  | 'artistic-photography'
  | 'graduation-portrait'
  | 'govt-job-photo'
  | 'professional-cv';

export interface StyleCategoryMeta {
  id: StyleCategoryId;
  nameEn: string;
  nameBn: string;
  accentHex: string;
}

export interface StyleColorParams {
  exposure: number; // -40 to 40
  contrast: number; // -40 to 50
  saturation: number; // -100 to 60
  temperature: number; // -40 (cool) to 40 (warm)
  tint: number; // -30 (green) to 30 (magenta)
  highlights: number; // -30 to 30
  shadows: number; // -30 to 35
  clarity: number; // 0 to 100 (unsharp mask)
  skinSmooth: number; // 0 to 100 (gentle portrait softening)
  studioLight: number; // 0 to 100 (radial softbox key light)
  vignette: number; // 0 to 80
  grain: number; // 0 to 45
  sepia: number; // 0 to 100
  monochrome: boolean;
  splitHighlight?: [number, number, number]; // RGB tint for highlights
  splitShadow?: [number, number, number]; // RGB tint for shadows
  splitStrength?: number; // 0 to 0.35
  frameBorder?: 'none' | 'thin-white' | 'studio-mat' | 'editorial-dark' | 'gold-hairline';
}

export interface StudioStylePreset {
  id: string;
  nameEn: string;
  nameBn: string;
  categoryId: StyleCategoryId;
  descriptionBn: string;
  swatchGradient: string;
  swatchAccent: string;
  recommendedBgId?: string;
  recommendedAttireId?: AttireOverlayId;
  params: StyleColorParams;
  keywords: string[];
}

export type BackgroundCategoryId =
  | 'pure-white'
  | 'light-blue'
  | 'sky-blue'
  | 'red'
  | 'gray'
  | 'office'
  | 'corporate-studio'
  | 'gradient'
  | 'photography-studio'
  | 'wedding'
  | 'nature'
  | 'islamic-architecture'
  | 'indoor-studio'
  | 'outdoor'
  | 'custom';

export interface BackgroundCategoryMeta {
  id: BackgroundCategoryId;
  nameEn: string;
  nameBn: string;
}

export interface StudioBackgroundItem {
  id: string;
  nameEn: string;
  nameBn: string;
  categoryId: BackgroundCategoryId;
  mode: 'original' | 'transparent' | 'solid' | 'gradient' | 'image';
  solidHex?: string;
  gradientStops?: Array<{ offset: number; color: string }>;
  gradientType?: 'linear' | 'radial';
  imageUrl?: string;
  cropInset?: number; // 0 to 0.25 inset crop to exclude edges/stands
  tintOverlay?: string; // optional rgba tint overlay
  defaultBlur?: number; // 0 to 16 px soft depth-of-field blur
  previewCss: string;
}

export type AttireOverlayId =
  | 'none'
  | 'black-business-suit'
  | 'navy-blazer-red-tie'
  | 'charcoal-suit-blue-tie'
  | 'crisp-shirt-tie'
  | 'white-classic-panjabi'
  | 'cream-embroidered-panjabi'
  | 'maroon-festive-panjabi'
  | 'graduation-gown';

export interface AttireOverlayConfig {
  id: AttireOverlayId;
  scale: number; // 0.6 to 1.6
  offsetX: number; // -30 to 30 (% of width)
  offsetY: number; // -30 to 40 (% of height)
  opacity: number; // 0.5 to 1.0
}

export type PassportPresetId =
  | 'original-free'
  | 'bd-passport-45x55'
  | 'bd-standard-35x45'
  | 'us-visa-51x51'
  | 'schengen-uk-35x45'
  | 'india-saudi-51x51'
  | 'canada-visa-50x70'
  | 'bd-stamp-20x25'
  | 'govt-job-300x300'
  | 'cv-portrait-40x50'
  | 'photo-3r'
  | 'photo-4r'
  | 'full-a4'
  | 'custom';

export interface PassportPresetSpec {
  id: PassportPresetId;
  nameEn: string;
  nameBn: string;
  authorityNote: string;
  widthMm: number;
  heightMm: number;
  fixedPxWidth?: number;
  fixedPxHeight?: number;
  recommendedBgId?: string;
  isPassportStyle: boolean;
  headRatioMin?: number; // e.g. 0.62
  headRatioMax?: number; // e.g. 0.78
}

export type PrintPaperSizeId = '4R' | '5R' | 'A4' | 'A5' | 'Letter' | 'custom';

export interface PrintSheetConfig {
  paperSize: PrintPaperSizeId;
  customWidthMm: number;
  customHeightMm: number;
  orientation: 'portrait' | 'landscape';
  marginMm: number;
  gapMm: number;
  showCutBorder: boolean;
  showCropMarks: boolean;
  showFooterInfo: boolean;
  sheetBgColor: string;
  fitAllOnOneSheet: boolean;
}

export interface ManualAdjustments {
  exposure: number; // -40 to 40
  contrast: number; // -40 to 40
  saturation: number; // -60 to 60
  temperature: number; // -40 to 40
  clarity: number; // 0 to 80
  skinSmooth: number; // 0 to 80
  studioLight: number; // 0 to 80
  autoRestore: boolean;
  autoLighting: boolean;
}

export interface CropTransform {
  zoom: number; // 0.8 to 4.5
  panX: number; // -250 to 250
  panY: number; // -250 to 250
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
}

export interface CutoutSettings {
  enabled: boolean;
  method: 'none' | 'mediapipe-wasm' | 'offline-floodfill';
  threshold: number; // 0.2 to 0.85
  feather: number; // 0 to 10
  defringe: number; // 0 to 100
  bgBlur: number; // 0 to 14
}

export interface PhotoEditSnapshot {
  styleId: string | null;
  backgroundId: string;
  customBgUrl: string | null;
  customBgColor: string;
  adjustments: ManualAdjustments;
  cutout: CutoutSettings;
  attire: AttireOverlayConfig;
  crop: CropTransform;
  passportPreset: PassportPresetId;
  customWidthMm: number;
  customHeightMm: number;
  customUnit: 'mm' | 'px';
  customPxWidth: number;
  customPxHeight: number;
}

export interface StudioPhotoEntry {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  originalUrl: string;
  imgElement: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
  copies: number;
  // Cached neural or offline soft alpha mask (Float32Array 0..1 or canvas)
  maskData: {
    width: number;
    height: number;
    alpha: Float32Array;
    engine: 'mediapipe-wasm' | 'offline-floodfill';
  } | null;
  edit: PhotoEditSnapshot;
  history: PhotoEditSnapshot[];
  historyIndex: number;
}

export const DEFAULT_MANUAL_ADJUSTMENTS: ManualAdjustments = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  clarity: 0,
  skinSmooth: 0,
  studioLight: 0,
  autoRestore: false,
  autoLighting: false,
};

export const DEFAULT_CROP: CropTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  flipH: false,
};

export const DEFAULT_CUTOUT: CutoutSettings = {
  enabled: false,
  method: 'none',
  threshold: 0.48,
  feather: 3,
  defringe: 45,
  bgBlur: 0,
};

export const DEFAULT_ATTIRE: AttireOverlayConfig = {
  id: 'none',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  opacity: 0.96,
};

export const DEFAULT_PRINT_SHEET_CONFIG: PrintSheetConfig = {
  paperSize: '4R',
  customWidthMm: 102,
  customHeightMm: 152,
  orientation: 'portrait',
  marginMm: 3,
  gapMm: 2,
  showCutBorder: true,
  showCropMarks: false,
  showFooterInfo: false,
  sheetBgColor: '#ffffff',
  fitAllOnOneSheet: false,
};

export const PAPER_SIZE_SPECS: Record<
  PrintPaperSizeId,
  { widthMm: number; heightMm: number; nameEn: string; nameBn: string }
> = {
  '4R': { widthMm: 102, heightMm: 152, nameEn: '4R Photo Paper (4 × 6 in)', nameBn: '4R ফটো পেপার (৪ × ৬ ইঞ্চি)' },
  '5R': { widthMm: 127, heightMm: 178, nameEn: '5R Photo Paper (5 × 7 in)', nameBn: '5R ফটো পেপার (৫ × ৭ ইঞ্চি)' },
  A4: { widthMm: 210, heightMm: 297, nameEn: 'A4 Sheet (210 × 297 mm)', nameBn: 'A4 পেপার (২১০ × ২৯৭ মিমি)' },
  A5: { widthMm: 148, heightMm: 210, nameEn: 'A5 Sheet (148 × 210 mm)', nameBn: 'A5 পেপার (১৪৮ × ২১০ মিমি)' },
  Letter: { widthMm: 215.9, heightMm: 279.4, nameEn: 'Letter (8.5 × 11 in)', nameBn: 'লেটার সাইজ (৮.৫ × ১১ ইঞ্চি)' },
  custom: { widthMm: 102, heightMm: 152, nameEn: 'Custom Paper Size', nameBn: 'কাস্টম পেপার সাইজ (মিমি)' },
};

export const PASSPORT_PRESET_SPECS: PassportPresetSpec[] = [
  {
    id: 'original-free',
    nameEn: 'Original Aspect (Free)',
    nameBn: 'মূল অনুপাত (ফ্রি এডিট)',
    authorityNote: 'কোনো ক্রপ ছাড়াই মূল ছবির অনুপাত বজায় রাখবে',
    widthMm: 102,
    heightMm: 152,
    isPassportStyle: false,
  },
  {
    id: 'bd-passport-45x55',
    nameEn: 'Bangladesh Passport (45 × 55 mm)',
    nameBn: 'বাংলাদেশ পাসপোর্ট (৪৫ × ৫৫ মিমি)',
    authorityNote: 'ই-পাসপোর্ট / বাংলাদেশ পাসপোর্ট প্রমিত মাপ (সাদা ব্যাকগ্রাউন্ড প্রস্তাবিত — কর্তৃপক্ষের বর্তমান শর্ত যাচাই করুন)',
    widthMm: 45,
    heightMm: 55,
    recommendedBgId: 'bg-pure-white',
    isPassportStyle: true,
    headRatioMin: 0.62,
    headRatioMax: 0.76,
  },
  {
    id: 'bd-standard-35x45',
    nameEn: 'Standard Passport (35 × 45 mm)',
    nameBn: 'স্ট্যান্ডার্ড পাসপোর্ট (৩৫ × ৪৫ মিমি)',
    authorityNote: 'সাধারণ অফিস, ব্যাংক, ভর্তি ও আন্তর্জাতিক প্রমিত পাসপোর্ট সাইজ',
    widthMm: 35,
    heightMm: 45,
    recommendedBgId: 'bg-light-blue-classic',
    isPassportStyle: true,
    headRatioMin: 0.65,
    headRatioMax: 0.78,
  },
  {
    id: 'us-visa-51x51',
    nameEn: 'US Visa / DV (2 × 2 inch)',
    nameBn: 'ইউএস ভিসা / ২×২ ইঞ্চি (৫১ × ৫১ মিমি)',
    authorityNote: 'আমেরিকান ভিসা ও ডিভি লটারির বর্গাকার ফরম্যাট (সাদা ব্যাকগ্রাউন্ড)',
    widthMm: 51,
    heightMm: 51,
    recommendedBgId: 'bg-pure-white',
    isPassportStyle: true,
    headRatioMin: 0.56,
    headRatioMax: 0.69,
  },
  {
    id: 'schengen-uk-35x45',
    nameEn: 'Schengen / UK Visa (35 × 45 mm)',
    nameBn: 'শেনজেন / ইউকে ভিসা (৩৫ × ৪৫ মিমি)',
    authorityNote: 'ইউরোপীয় শেনজেন ও ইউকে ভিসার জন্য হালকা গ্রে বা সাদা ব্যাকগ্রাউন্ড প্রযোজ্য হতে পারে',
    widthMm: 35,
    heightMm: 45,
    recommendedBgId: 'bg-gray-pearl',
    isPassportStyle: true,
    headRatioMin: 0.70,
    headRatioMax: 0.80,
  },
  {
    id: 'india-saudi-51x51',
    nameEn: 'India / Saudi Visa (2 × 2 inch)',
    nameBn: 'ভারত / সৌদি ভিসা (২ × ২ ইঞ্চি)',
    authorityNote: 'ভারতীয় ও সৌদি ভিসা আবেদনের বর্গাকার সাইজ — দূতাবাসের নির্দেশিকা যাচাই করুন',
    widthMm: 51,
    heightMm: 51,
    recommendedBgId: 'bg-pure-white',
    isPassportStyle: true,
    headRatioMin: 0.60,
    headRatioMax: 0.72,
  },
  {
    id: 'canada-visa-50x70',
    nameEn: 'Canada Visa (50 × 70 mm)',
    nameBn: 'কানাডা ভিসা / পিআর (৫০ × ৭০ মিমি)',
    authorityNote: 'কানাডা ইমিগ্রেশন ও ভিসা প্রিন্ট প্রিসেট (৫০ × ৭০ মিমি)',
    widthMm: 50,
    heightMm: 70,
    recommendedBgId: 'bg-pure-white',
    isPassportStyle: true,
    headRatioMin: 0.52,
    headRatioMax: 0.62,
  },
  {
    id: 'bd-stamp-20x25',
    nameEn: 'Stamp Size (20 × 25 mm)',
    nameBn: 'স্ট্যাম্প সাইজ (২০ × ২৫ মিমি)',
    authorityNote: 'অ্যাডমিট কার্ড, প্রত্যয়নপত্র ও অফিস ফরমের ছোট স্ট্যাম্প ছবি',
    widthMm: 20,
    heightMm: 25,
    recommendedBgId: 'bg-light-blue-classic',
    isPassportStyle: true,
    headRatioMin: 0.66,
    headRatioMax: 0.80,
  },
  {
    id: 'govt-job-300x300',
    nameEn: 'BD Govt Job / Teletalk (300 × 300 px)',
    nameBn: 'সরকারি চাকরি / টেলিটক (৩০০ × ৩০০ পিক্সেল)',
    authorityNote: 'বিসিএস ও টেলিটক অনলাইন চাকরির আবেদনের প্রমিত ৩০০×৩০০ পিক্সেল ফরম্যাট',
    widthMm: 35,
    heightMm: 35,
    fixedPxWidth: 300,
    fixedPxHeight: 300,
    recommendedBgId: 'bg-light-blue-classic',
    isPassportStyle: true,
    headRatioMin: 0.60,
    headRatioMax: 0.72,
  },
  {
    id: 'cv-portrait-40x50',
    nameEn: 'Professional CV Portrait (40 × 50 mm)',
    nameBn: 'প্রফেশনাল সিভি / বায়োডাটা (৪০ × ৫০ মিমি)',
    authorityNote: 'কর্পোরেট সিভি, লিংকডইন ও বায়োডাটার জন্য আদর্শ পোর্ট্রেট অনুপাত',
    widthMm: 40,
    heightMm: 50,
    recommendedBgId: 'bg-gray-neutral',
    isPassportStyle: true,
  },
  {
    id: 'photo-3r',
    nameEn: '3R Studio Print (89 × 127 mm)',
    nameBn: '3R স্টুডিও প্রিন্ট (৩.৫ × ৫ ইঞ্চি)',
    authorityNote: 'অ্যালবাম ও পারিবারিক পোর্ট্রেট প্রিন্ট',
    widthMm: 89,
    heightMm: 127,
    isPassportStyle: false,
  },
  {
    id: 'photo-4r',
    nameEn: '4R Postcard Print (102 × 152 mm)',
    nameBn: '4R পোস্টকার্ড প্রিন্ট (৪ × ৬ ইঞ্চি)',
    authorityNote: 'স্ট্যান্ডার্ড ডিজিটাল স্টুডিও ফটো প্রিন্ট',
    widthMm: 102,
    heightMm: 152,
    isPassportStyle: false,
  },
  {
    id: 'full-a4',
    nameEn: 'Full A4 Portrait (200 × 287 mm)',
    nameBn: 'ফুল A4 পেজ পোর্ট্রেট (২০০ × ২৮৭ মিমি)',
    authorityNote: 'সম্পূর্ণ A4 পেজে বড় একক ছবি প্রিন্ট',
    widthMm: 200,
    heightMm: 287,
    isPassportStyle: false,
  },
  {
    id: 'custom',
    nameEn: 'Custom Dimensions (mm / px)',
    nameBn: 'কাস্টম মাপ (মিমি বা পিক্সেল)',
    authorityNote: 'সংশ্লিষ্ট প্রতিষ্ঠানের নির্দেশনা অনুযায়ী নিজের মাপ নির্ধারণ করুন',
    widthMm: 45,
    heightMm: 55,
    isPassportStyle: true,
  },
];
