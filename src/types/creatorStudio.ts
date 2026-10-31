export type CreatorPlatform = 'youtube' | 'blog' | 'facebook' | 'multi';
export type CreatorLanguage = 'bn' | 'en' | 'bilingual';
export type ProjectStatus = 'planning' | 'in_progress' | 'published' | 'archived';

export interface CreatorProject {
  id: string;
  name: string;
  platform: CreatorPlatform;
  language: CreatorLanguage;
  targetAudience: string;
  niche: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NicheIdea {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  targetAudience: string;
  monetizationMethods: string[];
  recommendedFormats: string[];
  competitionLevel: 'Low' | 'Medium' | 'High';
  profitPotential: 'Moderate' | 'High' | 'Very High';
  roadmap30Days: { day: string; task: string }[];
}

export interface TopicKeywordItem {
  id: string;
  title: string;
  platform: CreatorPlatform;
  searchIntent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  category: string;
  difficultyEstimate: string;
  relatedKeywords: string[];
  suggestedAngles: string[];
  faqs?: { q: string; a: string }[];
  isSaved?: boolean;
}

export interface ContentDraft {
  id: string;
  projectId?: string;
  title: string;
  type: 'blog_article' | 'youtube_long' | 'youtube_shorts' | 'facebook_reel' | 'storytelling' | 'tutorial' | 'product_review' | 'voiceover';
  content: string;
  outline?: string[];
  metaDescription?: string;
  tags?: string[];
  wordCount: number;
  estimatedDurationMinutes: number;
  tone: string;
  language: CreatorLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarTask {
  id: string;
  projectId?: string;
  title: string;
  platform: CreatorPlatform;
  date: string; // YYYY-MM-DD
  status: 'idea' | 'draft' | 'in_production' | 'scheduled' | 'published';
  notes?: string;
  tags?: string[];
  isOldContentUpdate?: boolean;
}

export interface StoryboardScene {
  sceneNumber: number;
  durationSeconds: number;
  visualPrompt: string;
  voiceover: string;
  onScreenText: string;
  bRollSuggestion: string;
  musicMood: string;
}

export interface VideoProductionPlan {
  id: string;
  title: string;
  topic: string;
  platform: CreatorPlatform;
  durationEstimate: string;
  hook: string;
  scenes: StoryboardScene[];
  titleIdeas: string[];
  description: string;
  hashtags: string[];
  callToAction: string;
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  sizeBytes: number;
  dataUrl?: string; // object URL or data URL
  durationSeconds?: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface ThumbnailConfig {
  width: number;
  height: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  headline: string;
  subheadline: string;
  badgeText: string;
  bgColor: string;
  bgGradient: string;
  textColor: string;
  badgeBgColor: string;
  fontFamily: string;
  fontSize: number;
  watermarkText: string;
  overlayImage?: string;
}

export interface RepurposedPackage {
  sourceText: string;
  blogArticle: string;
  facebookPost: string;
  youtubeScript: string;
  shortsScript: string;
  carouselSlides: string[];
  linkedinPost: string;
  newsletterDraft: string;
  quoteCard: string;
  pinterestDescription: string;
}
