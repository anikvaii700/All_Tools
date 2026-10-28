// MoSaFa Golpo Ghor - Data Schema & Content Repository
// 100% Client-side, verified copyright & public domain compliance

export type ContentType = 'classic' | 'original' | 'licensed' | 'external-link' | 'user-written';
export type CopyrightStatus =
  | 'verified-public-domain'
  | 'permission-granted'
  | 'licensed'
  | 'external-link-only'
  | 'pending-review';

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string[]; // Array of paragraphs for clean reading typography
}

export interface StoryMetadata {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  categorySlug: string;
  language: 'bn';
  shortDescription: string;
  coverGradient: string; // Dynamic visual aesthetic cover
  coverIcon: string;
  contentType: ContentType;
  copyrightStatus: CopyrightStatus;
  sourceName: string;
  sourceUrl?: string;
  licenseName: string;
  permissionNote: string;
  publicationYear?: number | string;
  authorBio?: string;
  chapters: StoryChapter[];
  estimatedReadingMinutes: number;
  tags: string[];
  featured?: boolean;
  editorialPick?: boolean;
  publicationStatus: 'published' | 'draft' | 'archived';
}

export interface StoryCategory {
  id: string;
  name: string;
  englishName: string;
  icon: string;
  description: string;
  color: string;
}

// ১২টি সুনির্দিষ্ট ক্যাটাগরি
export const STORY_CATEGORIES: StoryCategory[] = [
  {
    id: 'romance',
    name: 'প্রেম ও রোমান্টিক গল্প',
    englishName: 'Love & Romance',
    icon: '❤️',
    description: 'হৃদয়ের না বলা কথা, স্নিগ্ধ অনুভূতি ও চিরন্তন ভালোবাসার কাহিনি।',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'horror',
    name: 'ভৌতিক গল্প',
    englishName: 'Horror & Paranormal',
    icon: '👻',
    description: 'নিশুতি রাতের গা ছমছমে রোমাঞ্চ ও অলৌকিক ঘটনার গল্প।',
    color: 'from-slate-700 to-slate-900',
  },
  {
    id: 'mystery',
    name: 'রহস্য ও গোয়েন্দা',
    englishName: 'Mystery & Detective',
    icon: '🔍',
    description: 'রহস্যের জট খোলা, ক্লু অনুসন্ধান ও বুদ্ধিদীপ্ত অনুসন্ধানী কাহিনি।',
    color: 'from-amber-600 to-amber-800',
  },
  {
    id: 'thriller',
    name: 'থ্রিলার ও অ্যাডভেঞ্চার',
    englishName: 'Thriller & Adventure',
    icon: '⚡',
    description: 'উদ্বেগ, টানটান উত্তেজনা ও রোমাঞ্চকর অভিযানের গল্প।',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'comedy',
    name: 'হাসির গল্প',
    englishName: 'Humor & Comedy',
    icon: '😄',
    description: 'নির্মল আনন্দ, হাস্যকৌতুক ও নির্মল বিনোদনের মজার গল্প।',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    id: 'family',
    name: 'পারিবারিক ও সামাজিক গল্প',
    englishName: 'Family & Social',
    icon: '🏡',
    description: 'সংসার, রক্তের বন্ধন, সম্পর্কের টানাপোড়েন ও সমাজের বাস্তব চিত্র।',
    color: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'inspirational',
    name: 'শিক্ষামূলক ও অনুপ্রেরণামূলক',
    englishName: 'Inspirational & Educational',
    icon: '💡',
    description: 'মনোবল বৃদ্ধি, জীবনের বড় শিক্ষা ও সাফল্যের পথপ্রদর্শক গল্প।',
    color: 'from-blue-500 to-indigo-700',
  },
  {
    id: 'children',
    name: 'শিশু-কিশোরদের গল্প',
    englishName: 'Children & Young Adults',
    icon: '🎈',
    description: 'কল্পনার রঙিন জগৎ, রূপকথা, পক্ষীরাজ ও কিশোর অ্যাডভেঞ্চার।',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'moral',
    name: 'নৈতিক ও মূল্যবোধভিত্তিক',
    englishName: 'Moral & Values',
    icon: '⚖️',
    description: 'সততা, পরোপকার, ন্যায়পরায়ণতা ও বিবেক জাগানিয়া উপাখ্যান।',
    color: 'from-cyan-600 to-blue-800',
  },
  {
    id: 'classic',
    name: 'বাংলা ক্লাসিক সাহিত্য',
    englishName: 'Bengali Classic Literature',
    icon: '📜',
    description: 'রবীন্দ্রনাথ, শরৎচন্দ্র, বঙ্কিমচন্দ্রের মতো অমর সাহিত্যিকদের ধ্রুপদী সৃষ্টি।',
    color: 'from-amber-700 to-orange-950',
  },
  {
    id: 'short-story',
    name: 'ছোটগল্প',
    englishName: 'Short Stories',
    icon: '📖',
    description: 'এক বসায় পড়ে ফেলার মতো চটজলদি আকর্ষণীয় ও চমৎকার ছোটগল্প।',
    color: 'from-violet-600 to-purple-800',
  },
  {
    id: 'novel-series',
    name: 'ধারাবাহিক গল্প ও উপন্যাস',
    englishName: 'Serialized Novels',
    icon: '📚',
    description: 'অধ্যায়ভিত্তিক বড় ক্যানভাসের ধারাবাহিক কাহিনি ও উপন্যাস।',
    color: 'from-teal-600 to-emerald-800',
  },
];

import { ALL_STORIES } from './stories';

// পূর্ণাঙ্গ, মানসম্মত ও যাচাইকৃত গল্পের ডেটাসেট (প্রতি ক্যাটাগরিতে ২০টি করে মোট ২৪০টি সমৃদ্ধ গল্প)
export const STORIES_DATA: StoryMetadata[] = ALL_STORIES;

