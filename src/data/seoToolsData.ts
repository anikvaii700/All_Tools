import { TOOLS_RICH_CONTENT } from './seoToolsContent.ts';

export interface ToolSeoInfo {
  id: string;
  slug: string;
  title: string;
  h1: string;
  description: string;
  path: string;
  canonicalUrl: string;
  ogImage: string;
  category: string;
  applicationCategory: string;
  keywords: string[];
}

export const SITE_BASE_URL = 'https://tools.mosafabd.com';
export const SITE_NAME = 'MoSaFa Tools';
export const DEFAULT_OG_IMAGE = 'https://tools.mosafabd.com/og-image.jpg?v=7.0.0';

export const HOMEPAGE_SEO: ToolSeoInfo = {
  id: 'home',
  slug: '',
  title: 'MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল',
  h1: 'আপনার প্রয়োজনীয় সকল অনলাইন টুলস এক জায়গায়',
  description: 'অনলাইন সেবার দারুন প্লাটফর্ম, আপনিও আপনার বন্ধু বান্ধবের মাঝে এখনি  শেয়ার করুন',
  path: '/',
  canonicalUrl: 'https://tools.mosafabd.com/',
  ogImage: DEFAULT_OG_IMAGE,
  category: 'Utilities',
  applicationCategory: 'UtilitiesApplication',
  keywords: [
    'MoSaFa Tools',
    'online tools',
    'bangla tools',
    'অনলাইন টুলস',
    'বাংলা সফটওয়্যার',
    'সিভি মেকার',
    'টাইপিং টেস্ট',
    'চাকরির ছবি সাইজার',
    'পোস্টার মেকার',
  ],
};

export const TOOLS_SEO_REGISTRY: Record<string, ToolSeoInfo> = {
  'bd-online-portal': {
    id: 'bd-online-portal',
    slug: 'bd-online-portal',
    title: 'BD Online Portal – সরকারি সেবা ও চাকরির ওয়েবসাইট',
    h1: 'BD Online Portal – সরকারি সেবা ও চাকরির ওয়েবসাইট',
    description:
      'বাংলাদেশের সরকারি ও বেসরকারি অনলাইন সেবা, চাকরির ওয়েবসাইট, NID সহায়তা এবং প্রয়োজনীয় ডিজিটাল সেবা খুঁজুন এক জায়গায়।',
    path: '/tools/bd-online-portal',
    canonicalUrl: 'https://tools.mosafabd.com/tools/bd-online-portal',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Government & Portal',
    applicationCategory: 'GovernmentServiceApplication',
    keywords: ['bd online portal', 'সরকারি সেবা', 'চাকরির ওয়েবসাইট', 'nid সহায়তা', 'ডিজিটাল সেবা বাংলাদেশ'],
  },
  'studymate-bd': {
    id: 'studymate-bd',
    slug: 'studymate-bd',
    title: 'StudyMate BD – AI অনলাইন শিক্ষক ও পড়াশোনার সহকারী',
    h1: 'StudyMate BD – AI অনলাইন শিক্ষক ও পড়াশোনার সহকারী',
    description:
      'ষষ্ঠ থেকে দ্বাদশ শ্রেণি, SSC, HSC, ভর্তি পরীক্ষা ও BCS প্রস্তুতির জন্য AI দিয়ে প্রশ্নের সমাধান, MCQ কুইজ এবং পড়ার রুটিন তৈরি করুন।',
    path: '/tools/studymate-bd',
    canonicalUrl: 'https://tools.mosafabd.com/tools/studymate-bd',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Education & AI',
    applicationCategory: 'EducationalApplication',
    keywords: ['studymate bd', 'ai অনলাইন শিক্ষক', 'ssc hsc প্রস্তুতি', 'mcq কুইজ', 'পড়ার রুটিন'],
  },
  'all-form-fillup': {
    id: 'all-form-fillup',
    slug: 'all-form-fillup',
    title: 'All Form Fillup – অনলাইন ফরম ও রসিদ তৈরি',
    h1: 'All Form Fillup – অনলাইন ফরম ও রসিদ তৈরি',
    description:
      'প্রয়োজনীয় অনলাইন ফরম, বাসা ভাড়ার রসিদ, চুক্তিপত্র, ক্যাশ মেমো ও কাস্টম ফরম তৈরি করুন এবং PDF ডাউনলোড করুন।',
    path: '/tools/all-form-fillup',
    canonicalUrl: 'https://tools.mosafabd.com/tools/all-form-fillup',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Business & Legal',
    applicationCategory: 'BusinessApplication',
    keywords: ['all form fillup', 'অনলাইন ফরম', 'বাসা ভাড়ার রসিদ', 'চুক্তিপত্র', 'ক্যাশ মেমো'],
  },
  'love-test': {
    id: 'love-test',
    slug: 'love-test',
    title: 'Love Test – প্রেম ও সম্পর্কের মজার পরীক্ষা',
    h1: 'Love Test – প্রেম ও সম্পর্কের মজার পরীক্ষা',
    description:
      'দুজনের নাম ও বিভিন্ন প্রশ্নের মাধ্যমে মজার Love Test খেলুন। আকর্ষণীয় ফলাফল কার্ড তৈরি করে বন্ধুদের সঙ্গে শেয়ার করুন।',
    path: '/tools/love-test',
    canonicalUrl: 'https://tools.mosafabd.com/tools/love-test',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Entertainment',
    applicationCategory: 'EntertainmentApplication',
    keywords: ['love test', 'প্রেম পরীক্ষা', 'ভালোবাসার পরীক্ষা', 'love calculator', 'সম্পর্কের কুইজ'],
  },
  'typing-test': {
    id: 'typing-test',
    slug: 'typing-test',
    title: 'Bangla Typing Test – বাংলা টাইপিং স্পিড পরীক্ষা',
    h1: 'Bangla Typing Test – বাংলা টাইপিং স্পিড পরীক্ষা',
    description:
      'অনলাইনে বাংলা টাইপিংয়ের গতি ও নির্ভুলতা পরীক্ষা করুন। WPM, CPM, Accuracy এবং তাৎক্ষণিক টাইপিং ফলাফল দেখুন।',
    path: '/tools/typing-test',
    canonicalUrl: 'https://tools.mosafabd.com/tools/typing-test',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Productivity',
    applicationCategory: 'EducationalApplication',
    keywords: ['bangla typing test', 'বাংলা টাইপিং স্পিড', 'typing speed test', 'wpm cpm', 'টাইপিং অনুশীলন'],
  },
  'age-calc': {
    id: 'age-calc',
    slug: 'age-calc',
    title: 'Age Calculator – বয়স হিসাব করুন বছর মাস ও দিনে',
    h1: 'Age Calculator – বয়স হিসাব করুন বছর মাস ও দিনে',
    description:
      'জন্মতারিখ দিয়ে নিজের সঠিক বয়স বছর, মাস ও দিনে হিসাব করুন। মোট সপ্তাহ, দিন এবং পরবর্তী জন্মদিনের কাউন্টডাউন জানুন।',
    path: '/tools/age-calc',
    canonicalUrl: 'https://tools.mosafabd.com/tools/age-calc',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Calculator',
    applicationCategory: 'UtilitiesApplication',
    keywords: ['age calculator', 'বয়স হিসাব', 'বয়স ক্যালকুলেটর', 'জন্মতারিখ দিয়ে বয়স', 'পরবর্তী জন্মদিন'],
  },
  'bangla-status': {
    id: 'bangla-status',
    slug: 'bangla-status',
    title: 'Bangla Status – বাংলা ক্যাপশন ও ফেসবুক স্ট্যাটাস',
    h1: 'Bangla Status – বাংলা ক্যাপশন ও ফেসবুক স্ট্যাটাস',
    description:
      'ভালোবাসা, কষ্ট, ইসলামিক, বন্ধুত্ব, মোটিভেশন ও ফানি সহ বিভিন্ন বিষয়ের বাংলা স্ট্যাটাস ও ক্যাপশন খুঁজুন এবং শেয়ার করুন।',
    path: '/tools/bangla-status',
    canonicalUrl: 'https://tools.mosafabd.com/tools/bangla-status',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Social & Quotes',
    applicationCategory: 'SocialNetworkingApplication',
    keywords: ['bangla status', 'বাংলা ক্যাপশন', 'ফেসবুক স্ট্যাটাস', 'ইসলামিক স্ট্যাটাস', 'ভালোবাসার স্ট্যাটাস'],
  },
  'poster-studio': {
    id: 'poster-studio',
    slug: 'poster-studio',
    title: 'AI Poster Maker – ছবি ও সোশ্যাল মিডিয়া পোস্টার তৈরি',
    h1: 'AI Poster Maker – ছবি ও সোশ্যাল মিডিয়া পোস্টার তৈরি',
    description:
      'নিজের ছবি ও আকর্ষণীয় ডিজাইন ব্যবহার করে সোশ্যাল মিডিয়ার পোস্টার তৈরি করুন। ইসলামিক, মোটিভেশনাল ও অন্যান্য পোস্টার ডিজাইন করুন।',
    path: '/tools/poster-studio',
    canonicalUrl: 'https://tools.mosafabd.com/tools/poster-studio',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Design & Graphics',
    applicationCategory: 'DesignApplication',
    keywords: ['ai poster maker', 'সোশ্যাল মিডিয়া পোস্টার', 'পোস্টার তৈরি', 'ইসলামিক পোস্টার', 'ছবি এডিটর'],
  },
  'random-picker': {
    id: 'random-picker',
    slug: 'random-picker',
    title: 'Random Picker Wheel – অনলাইন র্যান্ডম নাম নির্বাচন',
    h1: 'Random Picker Wheel – অনলাইন র্যান্ডম নাম নির্বাচন',
    description:
      'নাম, সংখ্যা বা পছন্দের তালিকা দিয়ে Random Picker Wheel তৈরি করুন। চাকা ঘুরিয়ে লটারির ফলাফল ও দৈনন্দিন সিদ্ধান্ত নিন।',
    path: '/tools/random-picker',
    canonicalUrl: 'https://tools.mosafabd.com/tools/random-picker',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Utilities',
    applicationCategory: 'UtilitiesApplication',
    keywords: ['random picker wheel', 'র্যান্ডম নাম নির্বাচন', 'লটারি চাকা', 'ডিসিশন হুইল', 'random spin'],
  },
  'bangla-quiz': {
    id: 'bangla-quiz',
    slug: 'bangla-quiz',
    title: 'Bangla Quiz – বাংলা ধাঁধা ও সাধারণ জ্ঞান কুইজ',
    h1: 'Bangla Quiz – বাংলা ধাঁধা ও সাধারণ জ্ঞান কুইজ',
    description:
      'বাংলা ধাঁধা, সাধারণ জ্ঞান, বিজ্ঞান ও সাহিত্যভিত্তিক মজার অনলাইন কুইজ খেলুন। নিজের স্কোর যাচাই করুন।',
    path: '/tools/bangla-quiz',
    canonicalUrl: 'https://tools.mosafabd.com/tools/bangla-quiz',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Education & Quiz',
    applicationCategory: 'GameApplication',
    keywords: ['bangla quiz', 'বাংলা ধাঁধা', 'সাধারণ জ্ঞান কুইজ', 'quiz bangla', 'বুদ্ধির খেলা'],
  },
  'daily-hishab': {
    id: 'daily-hishab',
    slug: 'daily-hishab',
    title: 'Daily Hishab – দৈনিক আয় ব্যয় ও কাজের হিসাব',
    h1: 'Daily Hishab – দৈনিক আয় ব্যয় ও কাজের হিসাব',
    description:
      'প্রতিদিনের আয়-ব্যয়, To-Do List, নোট এবং অভ্যাসের হিসাব এক জায়গায় রাখুন।',
    path: '/tools/daily-hishab',
    canonicalUrl: 'https://tools.mosafabd.com/tools/daily-hishab',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Finance & Productivity',
    applicationCategory: 'FinanceApplication',
    keywords: ['daily hishab', 'দৈনিক আয় ব্যয়', 'কাজের হিসাব', 'to-do list', 'হিসাব খাতা'],
  },
  'life-receipt': {
    id: 'life-receipt',
    slug: 'life-receipt',
    title: 'Life Receipt – আপনার জীবনের হিসাব ও রিসিট',
    h1: 'Life Receipt – আপনার জীবনের হিসাব ও রিসিট',
    description:
      'ঘুম, কাজ, মোবাইল ব্যবহার ও অবসরের হিসাব দিয়ে জীবনের সময়ের একটি মজার ডিজিটাল রিসিট তৈরি করুন।',
    path: '/tools/life-receipt',
    canonicalUrl: 'https://tools.mosafabd.com/tools/life-receipt',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Entertainment',
    applicationCategory: 'EntertainmentApplication',
    keywords: ['life receipt', 'জীবনের হিসাব', 'ডিজিটাল রিসিট', 'লাইফ রিসিট', 'সময় হিসাব'],
  },
  'name-reveal': {
    id: 'name-reveal',
    slug: 'name-reveal',
    title: 'Name Meaning – নামের অর্থ ও উৎস জানুন',
    h1: 'Name Meaning – নামের অর্থ ও উৎস জানুন',
    description:
      'নিজের নামের অর্থ, উৎপত্তি ও নামভিত্তিক মজার তথ্য জানুন। আকর্ষণীয় Name Reveal ফলাফল কার্ড তৈরি করুন।',
    path: '/tools/name-reveal',
    canonicalUrl: 'https://tools.mosafabd.com/tools/name-reveal',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Lifestyle',
    applicationCategory: 'UtilitiesApplication',
    keywords: ['name meaning', 'নামের অর্থ', 'নামের উৎস', 'name reveal', 'ইসলামিক নাম'],
  },
  'golpo-ghor': {
    id: 'golpo-ghor',
    slug: 'golpo-ghor',
    title: 'Golpo Ghor – বাংলা গল্প ও উপন্যাসের অনলাইন লাইব্রেরি',
    h1: 'Golpo Ghor – বাংলা গল্প ও উপন্যাসের অনলাইন লাইব্রেরি',
    description:
      'বিভিন্ন ধরনের বাংলা গল্প, রহস্য, রোমান্টিক ও শিক্ষামূলক গল্প অনলাইনে পড়ুন।',
    path: '/tools/golpo-ghor',
    canonicalUrl: 'https://tools.mosafabd.com/tools/golpo-ghor',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Literature & Books',
    applicationCategory: 'EducationalApplication',
    keywords: ['golpo ghor', 'বাংলা গল্প', 'উপন্যাস লাইব্রেরি', 'রহস্য গল্প', 'বাংলা সাহিত্য'],
  },
  'prepaid-meter': {
    id: 'prepaid-meter',
    slug: 'prepaid-meter',
    title: 'Prepaid Meter Helper – প্রিপেইড মিটার কোড ও হিসাব',
    h1: 'Prepaid Meter Helper – প্রিপেইড মিটার কোড ও হিসাব',
    description:
      'বাংলাদেশের প্রিপেইড মিটারের শর্ট কোড, রিচার্জ হিসাব, ব্যালেন্স ও বিদ্যুৎ ব্যবহারের প্রয়োজনীয় তথ্য জানুন।',
    path: '/tools/prepaid-meter',
    canonicalUrl: 'https://tools.mosafabd.com/tools/prepaid-meter',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Utilities',
    applicationCategory: 'UtilitiesApplication',
    keywords: ['prepaid meter helper', 'প্রিপেইড মিটার কোড', 'বিদ্যুৎ মিটার হিসাব', 'মিটার ব্যালেন্স', 'নেসকো ডেসকো'],
  },
  'bangladesh-map': {
    id: 'bangladesh-map',
    slug: 'bangladesh-map',
    title: 'Bangladesh Map – বাংলাদেশের ৬৪ জেলার ইন্টারেক্টিভ ম্যাপ',
    h1: 'Bangladesh Map – বাংলাদেশের ৬৪ জেলার ইন্টারেক্টিভ ম্যাপ',
    description:
      'বাংলাদেশের ৬৪ জেলার ইন্টারেক্টিভ মানচিত্র দেখুন। নিজের পছন্দের জেলা নির্বাচন করে আকর্ষণীয় পোস্টার তৈরি করুন।',
    path: '/tools/bangladesh-map',
    canonicalUrl: 'https://tools.mosafabd.com/tools/bangladesh-map',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Geography & Travel',
    applicationCategory: 'EducationalApplication',
    keywords: ['bangladesh map', '৬৪ জেলার ম্যাপ', 'বাংলাদেশের মানচিত্র', 'জেলা ভিত্তিক পোস্টার', 'bd map'],
  },
  'voter-transfer-form': {
    id: 'voter-transfer-form',
    slug: 'voter-transfer-form',
    title: 'Voter Transfer Form – ভোটার স্থানান্তর ফরম ১৩',
    h1: 'Voter Transfer Form – ভোটার স্থানান্তর ফরম ১৩',
    description:
      'ভোটার এলাকা পরিবর্তনের জন্য প্রয়োজনীয় ভোটার স্থানান্তর ফরম প্রস্তুত করুন এবং প্রিন্ট করুন।',
    path: '/tools/voter-transfer-form',
    canonicalUrl: 'https://tools.mosafabd.com/tools/voter-transfer-form',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Government & Legal',
    applicationCategory: 'GovernmentServiceApplication',
    keywords: ['voter transfer form', 'ভোটার স্থানান্তর ফরম ১৩', 'ভোটার এলাকা পরিবর্তন', 'ফরম ১৩ ডাউনলোড', 'নির্বাচন কমিশন ফরম'],
  },
  'cv-maker': {
    id: 'cv-maker',
    slug: 'cv-maker',
    title: 'CV Maker – প্রফেশনাল CV ও Resume তৈরি করুন',
    h1: 'CV Maker – প্রফেশনাল CV ও Resume তৈরি করুন',
    description:
      'প্রফেশনাল CV ও Resume তৈরি করুন। প্রয়োজন অনুযায়ী টেমপ্লেট ব্যবহার করে নিজের জীবনবৃত্তান্ত PDF ডাউনলোড করুন।',
    path: '/tools/cv-maker',
    canonicalUrl: 'https://tools.mosafabd.com/tools/cv-maker',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Career & Jobs',
    applicationCategory: 'BusinessApplication',
    keywords: ['cv maker', 'resume তৈরি', 'জীবনবৃত্তান্ত বানানোর ওয়েবসাইট', 'professional cv pdf', 'চাকরির সিভি'],
  },
  'invoice-maker': {
    id: 'invoice-maker',
    slug: 'invoice-maker',
    title: 'Invoice Maker – অনলাইন ইনভয়েস ও মানি রিসিট তৈরি',
    h1: 'Invoice Maker – অনলাইন ইনভয়েস ও মানি রিসিট তৈরি',
    description:
      'ব্যবসার জন্য প্রফেশনাল ইনভয়েস, বিল ও মানি রিসিট তৈরি করুন। হিসাবসহ PDF ডাউনলোড ও প্রিন্ট করুন।',
    path: '/tools/invoice-maker',
    canonicalUrl: 'https://tools.mosafabd.com/tools/invoice-maker',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Business & Finance',
    applicationCategory: 'FinanceApplication',
    keywords: ['invoice maker', 'অনলাইন ইনভয়েস', 'মানি রিসিট তৈরি', 'ক্যাশ বিল মেমো', 'invoice pdf'],
  },
  'bangla-text-converter': {
    id: 'bangla-text-converter',
    slug: 'bangla-text-converter',
    title: 'Bangla Text Converter – বাংলা ইংরেজি লেখা কনভার্টার',
    h1: 'Bangla Text Converter – বাংলা ইংরেজি লেখা কনভার্টার',
    description:
      'বাংলা ও ইংরেজি সংখ্যা রূপান্তর, বাংলা লেখা সাজানো এবং সমর্থিত টেক্সট ফরম্যাট কনভার্ট করুন।',
    path: '/tools/bangla-text-converter',
    canonicalUrl: 'https://tools.mosafabd.com/tools/bangla-text-converter',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Text & Language',
    applicationCategory: 'UtilitiesApplication',
    keywords: ['bangla text converter', 'বাংলা ইংরেজি কনভার্টার', 'বিজয় টু ইউনিকোড', 'সংখ্যা কনভার্ট', 'বাংলা টেক্সট'],
  },
  'application-writer': {
    id: 'application-writer',
    slug: 'application-writer',
    title: 'Application Writer – বাংলা ও ইংরেজি দরখাস্ত লিখুন',
    h1: 'Application Writer – বাংলা ও ইংরেজি দরখাস্ত লিখুন',
    description:
      'ছুটির আবেদন, চাকরির আবেদন, অভিযোগপত্র ও অফিসিয়াল দরখাস্ত বাংলা বা ইংরেজিতে তৈরি করুন।',
    path: '/tools/application-writer',
    canonicalUrl: 'https://tools.mosafabd.com/tools/application-writer',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Office & Writing',
    applicationCategory: 'BusinessApplication',
    keywords: ['application writer', 'বাংলা দরখাস্ত', 'ছুটির আবেদন', 'অফিসিয়াল দরখাস্ত', 'চাকরির আবেদনপত্র'],
  },
  'pdf-toolkit': {
    id: 'pdf-toolkit',
    slug: 'pdf-toolkit',
    title: 'PDF Toolkit – PDF Merge, Split ও Compress Online',
    h1: 'PDF Toolkit – PDF Merge, Split ও Compress Online',
    description:
      'অনলাইনে PDF Merge, Split, Compress, Rotate, Image to PDF এবং PDF থেকে ছবি তৈরি করুন।',
    path: '/tools/pdf-toolkit',
    canonicalUrl: 'https://tools.mosafabd.com/tools/pdf-toolkit',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'PDF & Documents',
    applicationCategory: 'UtilitiesApplication',
    keywords: ['pdf toolkit', 'pdf merge', 'pdf split', 'pdf compress online', 'image to pdf'],
  },
  'palmistry-ai': {
    id: 'palmistry-ai',
    slug: 'palmistry-ai',
    title: 'Palmistry AI – AI দিয়ে হাতের রেখা বিশ্লেষণ',
    h1: 'Palmistry AI – AI দিয়ে হাতের রেখা বিশ্লেষণ',
    description:
      'হাতের ছবি দিয়ে AI-এর মাধ্যমে হৃদয়রেখা, মস্তিষ্করেখা, জীবনরেখা ও ভাগ্যরেখার বিনোদনমূলক বিশ্লেষণ দেখুন।',
    path: '/tools/palmistry-ai',
    canonicalUrl: 'https://tools.mosafabd.com/tools/palmistry-ai',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Entertainment & AI',
    applicationCategory: 'EntertainmentApplication',
    keywords: ['palmistry ai', 'হাতের রেখা বিশ্লেষণ', 'হাত দেখা ai', 'palm reading', 'ভাগ্যরেখা'],
  },
  'job-photo-signature-resizer': {
    id: 'job-photo-signature-resizer',
    slug: 'job-photo-signature-resizer',
    title: 'Job Photo Resizer – চাকরির ছবি ও স্বাক্ষর সাইজ',
    h1: 'Job Photo Resizer – চাকরির ছবি ও স্বাক্ষর সাইজ',
    description:
      'চাকরির আবেদন ও সরকারি ফরমের জন্য ছবি এবং স্বাক্ষরের সাইজ পরিবর্তন করুন। প্রয়োজনীয় মাপ অনুযায়ী ছবি তৈরি করুন।',
    path: '/tools/job-photo-signature-resizer',
    canonicalUrl: 'https://tools.mosafabd.com/tools/job-photo-signature-resizer',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Photo & Government',
    applicationCategory: 'UtilitiesApplication',
    keywords: ['job photo resizer', 'চাকরির ছবি সাইজ', 'স্বাক্ষর সাইজ', '৩০০x৩০০ ছবি', 'টেলিটক ছবি সাইজার'],
  },
  'content-creator-studio': {
    id: 'content-creator-studio',
    slug: 'content-creator-studio',
    title: 'Content Creator Studio – AI কনটেন্ট তৈরির টুল',
    h1: 'Content Creator Studio – AI কনটেন্ট তৈরির টুল',
    description:
      'ব্লগার, ইউটিউবার ও ফেসবুক ক্রিয়েটরদের জন্য কনটেন্ট আইডিয়া, স্ক্রিপ্ট, থাম্বনেইল ও প্রকাশনার সহায়ক টুল ব্যবহার করুন।',
    path: '/tools/content-creator-studio',
    canonicalUrl: 'https://tools.mosafabd.com/tools/content-creator-studio',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Media & Creation',
    applicationCategory: 'DesignApplication',
    keywords: ['content creator studio', 'ai কনটেন্ট তৈরির টুল', 'ইউটিউব স্ক্রিপ্ট', 'থাম্বনেইল আইডিয়া', 'ভিডিও মেকার'],
  },
  'entrepreneur-journey': {
    id: 'entrepreneur-journey',
    slug: 'entrepreneur-journey',
    title: 'Entrepreneur Journey – ব্যবসা শুরু করার গাইড',
    h1: 'Entrepreneur Journey – ব্যবসা শুরু করার গাইড',
    description:
      'ব্যবসার আইডিয়া, পরিকল্পনা, বাজেট, ফাইন্যান্স ও উদ্যোক্তা হওয়ার প্রয়োজনীয় গাইডলাইন পান।',
    path: '/tools/entrepreneur-journey',
    canonicalUrl: 'https://tools.mosafabd.com/tools/entrepreneur-journey',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Business & Startup',
    applicationCategory: 'BusinessApplication',
    keywords: ['entrepreneur journey', 'ব্যবসা শুরু করার গাইড', 'উদ্যোক্তা সহকারী', 'বিজনেস আইডিয়া', 'ব্যবসার পরিকল্পনা'],
  },
  'ultra-digital-studio': {
    id: 'ultra-digital-studio',
    slug: 'ultra-digital-studio',
    title: 'Ultra Digital Studio (আল্ট্রা ডিজিটাল স্টুডিও) – ফটো ও ডকুমেন্ট স্টুডিও',
    h1: 'Ultra Digital Studio (আল্ট্রা ডিজিটাল স্টুডিও)',
    description:
      'ডিজিটাল ফটো স্টুডিও ও ফটোকপির দোকানের জন্য এআই ভিত্তিক অল-ইন-ওয়ান স্টুডিও — আইডি কার্ড জয়নার, ডকুমেন্ট স্ক্যানার ও প্রিন্ট প্রস্তুত টুলস।',
    path: '/tools/ultra-digital-studio',
    canonicalUrl: 'https://tools.mosafabd.com/tools/ultra-digital-studio',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Digital Studio & Photos',
    applicationCategory: 'UtilitiesApplication',
    keywords: [
      'ultra digital studio',
      'id card maker',
      'id card joiner',
      'nid card print',
      'front and back id card',
      'স্মার্ট কার্ড প্রিন্ট এক পেজে',
      'আইডি কার্ড জয়নার',
      'nid front and back a4',
    ],
  },
  'id-card-joiner': {
    id: 'id-card-joiner',
    slug: 'id-card-joiner',
    title: 'AI ID Card Maker – আইডি কার্ডের উভয় পাশ এক পেজে সাজান',
    h1: 'AI ID Card Maker – আইডি কার্ডের উভয় পাশ এক পেজে সাজান',
    description:
      'যেকোনো আইডি কার্ডের সামনের ও পেছনের ছবি অটো শনাক্ত ও ক্রপ করে এক ক্লিকে এক পেজে সাজান এবং হাই-রেজুলেশন JPG বা PDF ডাউনলোড করুন।',
    path: '/tools/id-card-joiner',
    canonicalUrl: 'https://tools.mosafabd.com/tools/id-card-joiner',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Digital Studio & Photos',
    applicationCategory: 'UtilitiesApplication',
    keywords: [
      'ai id card maker',
      'id card joiner',
      'nid front back',
      'আইডি কার্ড এক পেজে',
      'স্মার্ট কার্ড প্রিন্ট',
    ],
  },
  'about': {
    id: 'about',
    slug: 'about',
    title: 'আমাদের সম্পর্কে (About Us) – MoSaFa Tools',
    h1: 'আমাদের সম্পর্কে – MoSaFa Tools ডিজিটাল প্ল্যাটফর্ম',
    description: 'MoSaFa Tools প্ল্যাটফর্মের পরিচিতি, উদ্দেশ্য ও নাগরিক সেবাসমূহ। সরকারি ফর্ম, ক্যারিয়ার ও এডুকেশন টুলস।',
    path: '/about',
    canonicalUrl: 'https://tools.mosafabd.com/about',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'About & Information',
    applicationCategory: 'WebApplication',
    keywords: ['about mosafa tools', 'আমাদের সম্পর্কে', 'মুফাসসিরুল ইসলাম টুলস', 'ডিজিটাল টুলস পরিচিতি'],
  },
  'contact': {
    id: 'contact',
    slug: 'contact',
    title: 'যোগাযোগ (Contact Us) – MoSaFa Tools',
    h1: 'যোগাযোগ ও সাপোর্ট – MoSaFa Tools',
    description: 'MoSaFa Tools-এর অফিশিয়াল সাপোর্ট টিম ও ডেভেলপারের সাথে সরাসরি হোয়াটসঅ্যাপ ও ইমেইলে যোগাযোগ করুন।',
    path: '/contact',
    canonicalUrl: 'https://tools.mosafabd.com/contact',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Contact & Support',
    applicationCategory: 'WebApplication',
    keywords: ['contact mosafa tools', 'যোগাযোগ', 'মুফাসসিরুল ইসলাম যোগাযোগ', 'সাপোর্ট হোয়াটসঅ্যাপ'],
  },
  'privacy': {
    id: 'privacy',
    slug: 'privacy',
    title: 'গোপনীয়তা নীতিমালা (Privacy Policy) – MoSaFa Tools',
    h1: 'গোপনীয়তা নীতিমালা – MoSaFa Tools',
    description: 'MoSaFa Tools গোপনীয়তা নীতি। ডাটা নিরাপত্তা, ফায়ারবেস অথেন্টিকেশন, ক্লাউড ফায়ারস্টোর ও কুকিজ নীতিমালা।',
    path: '/privacy',
    canonicalUrl: 'https://tools.mosafabd.com/privacy',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Privacy & Security',
    applicationCategory: 'WebApplication',
    keywords: ['privacy policy', 'গোপনীয়তা নীতি', 'ডাটা সুরক্ষা', 'ফায়ারবেস নিরাপত্তা'],
  },
  'terms': {
    id: 'terms',
    slug: 'terms',
    title: 'ব্যবহারের শর্তাবলী (Terms & Conditions) – MoSaFa Tools',
    h1: 'ব্যবহারের শর্তাবলী – MoSaFa Tools',
    description: 'MoSaFa Tools ওয়েবসাইট ও ডিজিটাল টুল ব্যবহারের নিয়মাবলী, পয়েন্ট পলিসি ও শর্তাবলী।',
    path: '/terms',
    canonicalUrl: 'https://tools.mosafabd.com/terms',
    ogImage: DEFAULT_OG_IMAGE,
    category: 'Legal & Terms',
    applicationCategory: 'WebApplication',
    keywords: ['terms and conditions', 'ব্যবহারের শর্তাবলী', 'নিয়মাবলী', 'পয়েন্ট পলিসি'],
  },
};

export const ALL_TOOL_SLUGS = Object.keys(TOOLS_SEO_REGISTRY);

export function getToolSeoData(slugOrId: string | null | undefined): ToolSeoInfo {
  if (!slugOrId) return HOMEPAGE_SEO;
  const clean = slugOrId.toLowerCase().trim();
  return TOOLS_SEO_REGISTRY[clean] || HOMEPAGE_SEO;
}

export function getAllSeoTools(): ToolSeoInfo[] {
  return Object.values(TOOLS_SEO_REGISTRY);
}

/**
 * Generates Schema.org JSON-LD for a specific tool or homepage
 */
export function generateSchemaJsonLd(info: ToolSeoInfo): Record<string, any> {
  const isHome = info.id === 'home';

  const baseSchema: { '@context': string; '@graph': any[] } = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_BASE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_BASE_URL}/logo.png`,
          width: 1024,
          height: 1024,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_BASE_URL}/#website`,
        url: SITE_BASE_URL,
        name: SITE_NAME,
        description: 'অনলাইন সেবার দারুন প্লাটফর্ম, আপনিও আপনার বন্ধু বান্ধবের মাঝে এখনি শেয়ার করুন',
        publisher: {
          '@id': `${SITE_BASE_URL}/#organization`,
        },
        inLanguage: 'bn',
      },
    ],
  };

  if (!isHome) {
    baseSchema['@graph'].push({
      '@type': 'WebApplication',
      '@id': `${info.canonicalUrl}#webapp`,
      name: info.title,
      url: info.canonicalUrl,
      description: info.description,
      applicationCategory: info.applicationCategory || 'UtilitiesApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BDT',
      },
      inLanguage: 'bn',
      isPartOf: {
        '@id': `${SITE_BASE_URL}/#website`,
      },
    });

    // Add BreadcrumbList for rich snippet navigation in Google Search
    baseSchema['@graph'].push({
      '@type': 'BreadcrumbList',
      '@id': `${info.canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_BASE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: info.title.split('–')[0].trim(),
          item: info.canonicalUrl,
        },
      ],
    });

    // Add FAQPage schema for rich snippet accordions in Google search
    const richContent = TOOLS_RICH_CONTENT[info.slug];
    if (richContent && richContent.faqs && richContent.faqs.length > 0) {
      baseSchema['@graph'].push({
        '@type': 'FAQPage',
        '@id': `${info.canonicalUrl}#faq`,
        mainEntity: richContent.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      });
    }
  }

  return baseSchema;
}
