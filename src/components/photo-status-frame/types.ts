export type AspectRatio = '1:1' | '4:5' | '9:16';

export type StatusCategoryId =
  | 'motivational'
  | 'islamic'
  | 'friendship'
  | 'love'
  | 'family'
  | 'sad'
  | 'attitude'
  | 'life'
  | 'success'
  | 'patience'
  | 'funny'
  | 'birthday'
  | 'inspirational'
  | 'social'
  | 'professional'
  | 'custom';

export type WritingTone =
  | 'friendly'
  | 'emotional'
  | 'deep'
  | 'professional'
  | 'islamic'
  | 'motivational'
  | 'funny'
  | 'stylish';

export type StatusLength = 'short' | 'medium' | 'long';

export interface StatusCategory {
  id: StatusCategoryId;
  nameBn: string;
  nameEn: string;
  iconName: string;
  badge: string;
  description: string;
  defaultTone: WritingTone;
}

export type FrameCategoryId = string;

export type FrameLayoutType = string;

export interface FrameTemplate {
  id: string;
  nameBn: string;
  nameEn: string;
  category: FrameCategoryId;
  layoutType: FrameLayoutType;
  badge: string;
  accentColor: string;
  bgGradient: string;
  textColor: string;
  quoteColor: string;
  borderStyle: string;
  tagline: string;
  description: string;
  recommendedFont: string;
  defaultAlign: 'left' | 'center' | 'right';
  hasDecorativeQuote: boolean;
  hasCornerOrnaments: boolean;
  hasPhotoVignette: boolean;
  photoPosition: 'top' | 'right' | 'left' | 'center' | 'bottom' | 'background';
}

export interface PhotoTransform {
  zoom: number; // 40 to 250
  boxScale?: number; // 50 to 180 (Resize photo container frame)
  posX: number; // -150 to 150
  posY: number; // -150 to 150
  rotate: number; // -180 to 180
}

export interface PosterCustomization {
  statusText: string;
  highlightText?: string;
  authorName: string;
  designation?: string;
  categoryBadge: string;
  watermark: string;
  showAuthor: boolean;
  showDesignation: boolean;
  showCategoryBadge: boolean;
  showWatermark: boolean;
  showQuoteMarks: boolean;
  showDate: boolean;
  showBangladeshFlagBg: boolean;
  dateText: string;
  fontSize: number; // 18 to 54
  textAlign: 'left' | 'center' | 'right';
  textOffsetX?: number; // Manual move text left/right (-300 to 300)
  textOffsetY?: number; // Manual move text up/down (-400 to 400)
  customTextColor?: string; // Text color change
  customBgColor?: string; // Background color change
  customCardBgColor?: string; // Card background color change
  customFontFamily: string;
  customQuoteColor?: string; // Quote / highlight color change
}
