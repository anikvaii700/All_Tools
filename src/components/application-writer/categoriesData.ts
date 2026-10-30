import { CategoryId, DocumentTypeInfo } from './types';
import { ALL_150_DOCUMENT_TYPES } from './applicationsData150';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  nameEn: string;
  iconName: string;
  description: string;
  accentColor: string;
  badge: string;
  serialRange: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'police',
    name: 'থানা ও পুলিশ সংক্রান্ত আবেদন',
    nameEn: 'Police & Law Enforcement',
    iconName: 'ShieldAlert',
    description: 'সাধারণ ডায়েরি (জিডি), হারানো বিজ্ঞপ্তি, লিখিত অভিযোগ ও সাইবার অপরাধ সংক্রান্ত আবেদনপত্র',
    accentColor: 'from-blue-700 to-indigo-800',
    badge: '১৫টি আবেদন',
    serialRange: '১ - ১৫',
  },
  {
    id: 'municipal',
    name: 'ইউপি, পৌরসভা ও সিটি কর্পোরেশন',
    nameEn: 'Union Parishad & Municipal',
    iconName: 'Landmark',
    description: 'নাগরিকত্ব, চারিত্রিক, ওয়ারিশ, পারিবারিক সনদ, জন্মনিবন্ধন সংশোধন ও ট্রেড লাইসেন্স আবেদন',
    accentColor: 'from-emerald-700 to-teal-800',
    badge: '২০টি আবেদন',
    serialRange: '১৬ - ৩৫',
  },
  {
    id: 'education',
    name: 'স্কুল, কলেজ ও শিক্ষা প্রতিষ্ঠান',
    nameEn: 'Schools, Colleges & Universities',
    iconName: 'GraduationCap',
    description: 'ছুটি, জরিমানা মওকুফ, প্রশংসাপত্র, টিসি, প্রবেশপত্র হারানো ও পুনঃভর্তির আবেদনপত্র',
    accentColor: 'from-sky-600 to-blue-700',
    badge: '২০টি আবেদন',
    serialRange: '৩৬ - ৫৫',
  },
  {
    id: 'office',
    name: 'চাকরি ও অফিস সংক্রান্ত দরখাস্ত',
    nameEn: 'Office, Jobs & Employment',
    iconName: 'Briefcase',
    description: 'চাকরির আবেদন, পদত্যাগপত্র, নৈমিত্তিক/মাতৃত্বকালীন ছুটি, বেতন বৃদ্ধি, বদলি ও যোগদানপত্র',
    accentColor: 'from-purple-700 to-indigo-700',
    badge: '২০টি আবেদন',
    serialRange: '৫৬ - ৭৫',
  },
  {
    id: 'land',
    name: 'জমি, সম্পত্তি ও ভূমি অফিস',
    nameEn: 'Land, Property & AC Land Office',
    iconName: 'Home',
    description: 'নামজারি/মিউটেশন, পর্চা/খতিয়ান, দাগ সংশোধন, সীমানা নির্ধারণ ও অবৈধ দখলমুক্তির আবেদন',
    accentColor: 'from-amber-600 to-amber-800',
    badge: '১২টি আবেদন',
    serialRange: '৭৬ - ৮৭',
  },
  {
    id: 'bank',
    name: 'ব্যাংক, আর্থিক প্রতিষ্ঠান ও ঋণ',
    nameEn: 'Banking & Financial Institutions',
    iconName: 'CreditCard',
    description: 'অ্যাকাউন্ট খোলা/বন্ধ, এটিএম কার্ড হারানো, ব্যাংক স্টেটমেন্ট, সলভেন্সি ও ভুল লেনদেন ফেরত',
    accentColor: 'from-cyan-700 to-teal-800',
    badge: '১৩টি আবেদন',
    serialRange: '৮৮ - ১০০',
  },
  {
    id: 'utility',
    name: 'বিদ্যুৎ, গ্যাস, পানি ও ইউটিলিটি',
    nameEn: 'Electricity, Water & Utilities',
    iconName: 'Zap',
    description: 'নতুন বিদ্যুৎ সংযোগ, মিটার পরিবর্তন, প্রিপেইড মিটার অভিযোগ, অতিরিক্ত বিল সংশোধন ও গ্যাস/পানি',
    accentColor: 'from-yellow-600 to-amber-700',
    badge: '১১টি আবেদন',
    serialRange: '১০১ - ১১১',
  },
  {
    id: 'personal',
    name: 'ব্যক্তিগত ও পারিবারিক প্রয়োজনে দরখাস্ত',
    nameEn: 'Personal & Family Petitions',
    iconName: 'Users',
    description: 'নাম পরিবর্তন, জন্মতারিখ সংশোধন, NID সংশোধন, বিবাহ সনদ ও পারিবারিক বিরোধ নিষ্পত্তি',
    accentColor: 'from-rose-600 to-pink-700',
    badge: '১৩টি আবেদন',
    serialRange: '১১২ - ১২৪',
  },
  {
    id: 'business',
    name: 'ব্যবসা-বাণিজ্য ও দোকানপাট সংক্রান্ত',
    nameEn: 'Business & Commercial Petitions',
    iconName: 'Building2',
    description: 'ট্রেড লাইসেন্স নবায়ন, দোকান ভাড়ার চুক্তি, বকেয়া আদায়ের তাগাদা ও সাপ্লায়ারদের নোটিশ',
    accentColor: 'from-slate-700 to-slate-900',
    badge: '১১টি আবেদন',
    serialRange: '১২৫ - ১৩৫',
  },
  {
    id: 'other',
    name: 'অন্যান্য দরকারি আবেদনপত্র',
    nameEn: 'Government Relief, RTI & Other Petitions',
    iconName: 'FileCheck',
    description: 'সরকারি অনুদান, বয়স্ক/বিধবা ভাতা, তথ্য অধিকার (RTI), ভোক্তা অধিকার ও সাধারণ দরখাস্ত',
    accentColor: 'from-violet-600 to-purple-800',
    badge: '১৫টি আবেদন',
    serialRange: '১৩৬ - ১৫০',
  },
  {
    id: 'custom',
    name: 'কাস্টম আবেদন (মুক্ত ফরম্যাট)',
    nameEn: 'Custom Freehand Application',
    iconName: 'PenTool',
    description: 'যেকোনো ব্যক্তিগত, প্রাতিষ্ঠানিক বা অফিসিয়াল চিঠি নিজের মতো লিখে নিন',
    accentColor: 'from-slate-800 to-black',
    badge: 'মুক্ত ফরম্যাট',
    serialRange: 'কাস্টম',
  },
];

export const DOCUMENT_TYPES: DocumentTypeInfo[] = ALL_150_DOCUMENT_TYPES;

export const POPULAR_DOCUMENT_IDS = [
  'gd-general',
  'police-complaint-written',
  'gd-mobile-lost',
  'gd-nid-lost',
  'gd-passport-lost',
  'mun-citizenship-cert',
  'mun-character-cert',
  'mun-warish-cert',
  'mun-birth-cert-correction',
  'mun-trade-license-new',
  'school-leave',
  'fee-waiver',
  'testimonial-request',
  'transfer-certificate',
  'job-application-cover',
  'resignation-letter',
  'office-casual-leave',
  'land-mutation-request',
  'bank-statement-request',
  'util-bill-correction',
];

export function getDocumentTypeById(id: string): DocumentTypeInfo | undefined {
  return DOCUMENT_TYPES.find((doc) => doc.id === id);
}

export function getDocumentTypeBySerial(serial: number): DocumentTypeInfo | undefined {
  return DOCUMENT_TYPES.find((doc) => doc.serialNo === serial);
}
