// Registry of 9 Government Offices in 3x3 layout for MoSaFa Tools
// Exactly matches the user sketch and uploaded official logos
import { GovOffice } from '../types';
import { GOV_OFFICE_LOGOS } from '../GovOfficeLogo';

export const GOV_OFFICES_REGISTRY: GovOffice[] = [
  // =================== LINE 1 ===================
  // 1. নির্বাচন অফিস (বাংলাদেশ নির্বাচন কমিশন - লাল ব্যালট বক্স "নি ক") - ACTIVE
  {
    id: 'election-commission',
    displayGridTitle: 'নির্বাচন অফিস',
    nameBn: 'বাংলাদেশ নির্বাচন কমিশন',
    nameEn: 'Bangladesh Election Commission',
    shortName: 'নির্বাচন কমিশন (ECS)',
    logoUrl: GOV_OFFICE_LOGOS['election-commission'].primary,
    iconName: 'Vote',
    colorScheme: {
      primary: 'from-emerald-700 via-rose-600 to-indigo-800',
      secondary: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      accent: 'text-emerald-700',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900',
    },
    status: 'active',
    description:
      'জাতীয় পরিচয়পত্র (NID) সংশোধন, ভোটার এলাকা স্থানান্তর, নতুন ভোটার নিবন্ধন, হারানো কার্ড রিইস্যু এবং নির্বাচন কমিশনের সকল বিধিমালা ও অফিশিয়াল প্রজ্ঞাপন।',
    officialPortalUrl: 'https://services.nidw.gov.bd',
    helpline: '১০৫ (টোল ফ্রি)',
    availableServicesCount: 12,
  },

  // 2. সমাজ সেবা অফিস (সমাজসেবা অধিদপ্তর - হাতে ধরা লাল হৃদয় প্রতীক)
  {
    id: 'social-services',
    displayGridTitle: 'সমাজ সেবা অফিস',
    nameBn: 'সমাজসেবা অধিদপ্তর',
    nameEn: 'Department of Social Services',
    shortName: 'সমাজসেবা অধিদপ্তর (DSS)',
    logoUrl: GOV_OFFICE_LOGOS['social-services'].primary,
    iconName: 'HeartHandshake',
    colorScheme: {
      primary: 'from-rose-600 via-pink-600 to-rose-800',
      secondary: 'bg-rose-50 text-rose-900 border-rose-300',
      accent: 'text-rose-600',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-900',
    },
    status: 'upcoming',
    description:
      'বয়স্ক ভাতা, বিধবা ও স্বামী নিগৃহীতা ভাতা, অসচ্ছল প্রতিবন্ধী ভাতা এবং সুবর্ণ নাগরিক কার্ড আবেদন ও যাচাই সহায়িকা।',
    officialPortalUrl: 'https://dss.gov.bd',
    helpline: '১০৯৮ / ১৬১০৯',
    availableServicesCount: 0,
    upcomingFeatures: [
      'ভাতা পাওয়ার যোগ্যতা ও বয়স যাচাইকারী',
      'প্রতিবন্ধী সুবর্ণ নাগরিক কার্ড আবেদন চেকলিস্ট',
      'ভাতা উত্তোলনের নগদ/বিকাশ লিংক পদ্ধতি',
      'ক্যান্সার, কিডনি ও লিভার সিরোসিস আর্থিক অনুদান গাইড',
    ],
  },

  // 3. পাসপোর্ট অফিস (বহিরাগমন ও পাসপোর্ট অধিদপ্তর / সরকারি গোল সিলমোহর)
  {
    id: 'passport-immigration',
    displayGridTitle: 'পাসপোর্ট অফিস',
    nameBn: 'বহিরাগমন ও পাসপোর্ট অধিদপ্তর',
    nameEn: 'Department of Immigration and Passports',
    shortName: 'ই-পাসপোর্ট অধিদপ্তর (DIP)',
    logoUrl: GOV_OFFICE_LOGOS['passport-immigration'].primary,
    iconName: 'BookMarked',
    colorScheme: {
      primary: 'from-emerald-600 via-teal-700 to-slate-900',
      secondary: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      accent: 'text-emerald-600',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-900',
    },
    status: 'upcoming',
    description:
      'নতুন ই-পাসপোর্ট আবেদন, পাসপোর্ট নবায়ন, নাম ও তথ্য সংশোধন, জরুরি ডেলিভারি ফি এবং পুলিশ ভেরিফিকেশন তথ্য।',
    officialPortalUrl: 'https://www.epassport.gov.bd',
    helpline: '০৯৬৬৬৭১৬৬৬৭',
    availableServicesCount: 0,
    upcomingFeatures: [
      '৪৮ পৃষ্ঠা বনাম ৬৪ পৃষ্ঠা সরকারি ফি ক্যালকুলেটর',
      '৫ বছর ও ১০ বছর মেয়াদি আবেদন নির্দেশিকা',
      'প্রয়োজনীয় কাগজপত্র অডিটর ও চেকলিস্ট',
      'জরুরি ও অতি-জরুরি ফি চার্জ ও ডেলিভারি ট্র্যাক',
    ],
  },

  // =================== LINE 2 ===================
  // 4. ভূমি অফিস (ভূমি মন্ত্রণালয় ও ভূমি রেকর্ড অফিস - "ভূমি" ও শস্যখেত)
  {
    id: 'land-ministry',
    displayGridTitle: 'ভূমি অফিস',
    nameBn: 'ভূমি মন্ত্রণালয় ও ভূমি রেকর্ড অফিস',
    nameEn: 'Ministry of Land & Land Records',
    shortName: 'ভূমি অফিস (e-Mutation & RS)',
    logoUrl: GOV_OFFICE_LOGOS['land-ministry'].primary,
    iconName: 'Landmark',
    colorScheme: {
      primary: 'from-amber-600 via-orange-600 to-amber-900',
      secondary: 'bg-amber-50 text-amber-900 border-amber-300',
      accent: 'text-amber-600',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-900',
    },
    status: 'upcoming',
    description:
      'ই-নামজারি (Mutation) আবেদন, খতিয়ান/পর্চা তল্লাশি ও সার্টিফাইড কপি, ভূমি উন্নয়ন কর (LDT) প্রদান এবং দাগের তথ্য।',
    officialPortalUrl: 'https://mutation.land.gov.bd',
    helpline: '১৬১২২ (টোল ফ্রি)',
    availableServicesCount: 0,
    upcomingFeatures: [
      'ই-নামজারি ২৮ দিনের টাইমলাইন ট্র্যাকার',
      'খতিয়ান পর্চা সার্টিফাইড কপি আবেদন সহায়ক',
      'ভূমি উন্নয়ন কর (LDT) ক্যালকুলেটর',
      'জমির দলিল ও মৌজা ম্যাপ সার্চ গাইড',
    ],
  },

  // 5. জন্ম ও মৃত্যু নিবন্ধন অফিস (রেজিস্ট্রার জেনারেলের কার্যালয়, BDRIS)
  {
    id: 'bdris-birth-death',
    displayGridTitle: 'জন্ম ও মৃত্যু নিবন্ধন',
    nameBn: 'জন্ম ও মৃত্যু নিবন্ধন কার্যালয়',
    nameEn: 'Office of the Registrar General, Birth and Death (BDRIS)',
    shortName: 'জন্ম ও মৃত্যু নিবন্ধন (BDRIS)',
    logoUrl: GOV_OFFICE_LOGOS['bdris-birth-death'].primary,
    iconName: 'Baby',
    colorScheme: {
      primary: 'from-cyan-600 via-blue-600 to-indigo-900',
      secondary: 'bg-cyan-50 text-cyan-900 border-cyan-300',
      accent: 'text-cyan-600',
      badgeBg: 'bg-cyan-100',
      badgeText: 'text-cyan-900',
    },
    status: 'upcoming',
    description:
      'অনলাইন ডিজিটাল জন্ম সনদ আবেদন, ইংরেজি নাম ও জন্মতারিখ সংশোধন, মৃত্যুর সনদ এবং বিলম্বিত নিবন্ধন প্রক্রিয়া।',
    officialPortalUrl: 'https://bdris.gov.bd',
    helpline: '০২-৫৫০০৬৮৬৩',
    availableServicesCount: 0,
    upcomingFeatures: [
      'নতুন ডিজিটাল জন্ম নিবন্ধন প্রস্তুতি সহায়িকা',
      'সনদের বানান ও তারিখ সংশোধন বিধিমালা',
      'পিতা-মাতার এনআইডি যাচাই নির্দেশিকা',
      'মৃত্যু সনদ আবেদন ও ফি ক্যালকুলেটর',
    ],
  },

  // 6. কর ও ভ্যাট অফিস (জাতীয় রাজস্ব বোর্ড / BANGLADESH CUSTOMS & VAT)
  {
    id: 'nbr-tax',
    displayGridTitle: 'কর ও ভ্যাট অফিস',
    nameBn: 'জাতীয় রাজস্ব বোর্ড (NBR)',
    nameEn: 'National Board of Revenue',
    shortName: 'এনবিআর কর ও ভ্যাট (NBR)',
    logoUrl: GOV_OFFICE_LOGOS['nbr-tax'].primary,
    iconName: 'Receipt',
    colorScheme: {
      primary: 'from-purple-600 via-indigo-700 to-slate-900',
      secondary: 'bg-purple-50 text-purple-900 border-purple-300',
      accent: 'text-purple-600',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-900',
    },
    status: 'upcoming',
    description:
      'ই-টিন (e-TIN) নিবন্ধন, অনলাইন আয়কর রিটার্ন দাখিল (e-Return), ট্যাক্স স্ল্যাব এবং ভ্যাট চালানের নিয়মাবলি।',
    officialPortalUrl: 'https://etaxnbr.gov.bd',
    helpline: '০৯৬১২৭১৭১৭১',
    availableServicesCount: 0,
    upcomingFeatures: [
      'জিরো রিটার্ন দাখিল চেকলিস্ট ও স্বয়ংক্রিয় গাইড',
      'ব্যক্তিগত আয়কর হিসাব সহায়ক',
      'টিন সার্টিফিকেট প্রিন্ট ও সংশোধন পদ্ধতি',
      'অনলাইন চালান যাচাইকরণ',
    ],
  },

  // =================== LINE 3 ===================
  // 7. বিআরটিএ অফিস (বাংলাদেশ রোড ট্রান্সপোর্ট অথরিটি - বিআরটিএ)
  {
    id: 'brta',
    displayGridTitle: 'বিআরটিএ অফিস',
    nameBn: 'বাংলাদেশ রোড ট্রান্সপোর্ট অথরিটি',
    nameEn: 'Bangladesh Road Transport Authority',
    shortName: 'বিআরটিএ (BRTA)',
    logoUrl: GOV_OFFICE_LOGOS['brta'].primary,
    iconName: 'Car',
    colorScheme: {
      primary: 'from-blue-600 via-sky-600 to-slate-900',
      secondary: 'bg-blue-50 text-blue-900 border-blue-300',
      accent: 'text-blue-600',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-900',
    },
    status: 'upcoming',
    description:
      'স্মার্ট কার্ড ড্রাইভিং লাইসেন্স আবেদন ও নবায়ন, লার্নার পাস, গাড়ির ফিটনেস ও ট্যাক্স টোকেন নবায়ন ফি।',
    officialPortalUrl: 'https://bsp.brta.gov.bd',
    helpline: '১৬১০৭',
    availableServicesCount: 0,
    upcomingFeatures: [
      'লার্নার টু স্মার্ট ড্রাইভিং লাইসেন্স রোডম্যাপ',
      'ফিটনেস ও ট্যাক্স টোকেন অনলাইন ফি চার্ট',
      'মালিকানা পরিবর্তন ও ডিজিটাল নাম্বারপ্লেট গাইড',
      'ড্রাইভিং টেস্ট নমুনা প্রশ্নোত্তর',
    ],
  },

  // 8. পুলিশ সেবা অফিস (বাংলাদেশ পুলিশ - শাপলা ও ধানের শীষ প্রতীক)
  {
    id: 'police-clearance',
    displayGridTitle: 'পুলিশ সেবা অফিস',
    nameBn: 'বাংলাদেশ পুলিশ (সেবা হাব)',
    nameEn: 'Bangladesh Police Service Hub',
    shortName: 'পুলিশ ক্লিয়ারেন্স ও জিডি (BP)',
    logoUrl: GOV_OFFICE_LOGOS['police-clearance'].primary,
    iconName: 'Shield',
    colorScheme: {
      primary: 'from-slate-800 via-slate-900 to-sky-900',
      secondary: 'bg-slate-50 text-slate-900 border-slate-300',
      accent: 'text-sky-600',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-900',
    },
    status: 'upcoming',
    description:
      'অনলাইন পুলিশ ক্লিয়ারেন্স সার্টিফিকেট আবেদন, থানা অনলাইন জিডি (General Diary), ওয়ান স্টপ সার্ভিস এবং ইমার্জেন্সি ৯৯৯ তথ্য।',
    officialPortalUrl: 'https://pcc.police.gov.bd',
    helpline: '৯৯৯ (জাতীয় জরুরি সেবা)',
    availableServicesCount: 0,
    upcomingFeatures: [
      'বিদেশগামীদের পুলিশ ক্লিয়ারেন্স আবেদন নির্দেশিকা',
      'অনলাইন জিডি (হারানো বা চুরি) দাখিল পদ্ধতি',
      'চালান ফি ৫০০ টাকা জমা দেওয়ার উপায়',
      'পুলিশ ভেরিফিকেশন স্ট্যাটাস ট্র্যাকার',
    ],
  },

  // 9. শিক্ষা বোর্ড অফিস (মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড - শিক্ষা শক্তি প্রগতি)
  {
    id: 'education-board',
    displayGridTitle: 'শিক্ষা বোর্ড অফিস',
    nameBn: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড',
    nameEn: 'Board of Intermediate and Secondary Education',
    shortName: 'শিক্ষা বোর্ড ও মন্ত্রণালয় (BISE)',
    logoUrl: GOV_OFFICE_LOGOS['education-board'].primary,
    iconName: 'GraduationCap',
    colorScheme: {
      primary: 'from-indigo-700 via-blue-800 to-purple-900',
      secondary: 'bg-indigo-50 text-indigo-900 border-indigo-300',
      accent: 'text-indigo-600',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-900',
    },
    status: 'upcoming',
    description:
      'এসএসসি ও এইচএসসি মূল সনদ, নম্বরপত্র সংশোধন, নাম ও পিতা-মাতার নাম সংশোধন, ডুপ্লিকেট সার্টিফিকেট এবং অনলাইন ই-পাস।',
    officialPortalUrl: 'https://dhakaeducationboard.gov.bd',
    helpline: '০২-৯৬৬৯৭৫২',
    availableServicesCount: 0,
    upcomingFeatures: [
      'সার্টিফিকেটের নাম ও বয়স সংশোধন আবেদন গাইড',
      'ডুপ্লিকেট সার্টিফিকেট ও নম্বরপত্র উত্তোলন পদ্ধতি',
      'বোর্ড ফি ক্যালকুলেটর ও ব্যাংক ড্রাফট নিয়ম',
      'নাম পরিবর্তন মিটিং শিডিউল ট্র্যাকার',
    ],
  },
];
