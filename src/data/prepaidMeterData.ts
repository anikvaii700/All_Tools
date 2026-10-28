// MoSaFa Prepaid Meter Helper - Bangladesh Electricity Utilities & Meter Dataset
// Verified Bangladesh Prepaid Meter Data Architecture & Official Manual Sources

export type UtilityId = 'bpdb' | 'dpdc' | 'desco' | 'nesco' | 'wzpdcl' | 'breb';
export type MeterManufacturer = 'hexing' | 'inhemeter' | 'wasion' | 'linyang' | 'bseco' | 'sanxing' | 'other';
export type MeterType = 'keypad' | 'smart-keypad' | 'card' | 'smart-online';
export type CodeCategory =
  | 'balance'
  | 'meter-number'
  | 'date-time'
  | 'last-recharge'
  | 'consumption'
  | 'voltage-current'
  | 'emergency'
  | 'status'
  | 'tariff'
  | 'alarm';

export interface UtilityItem {
  id: UtilityId;
  nameBn: string;
  nameEn: string;
  fullNameBn: string;
  shortName: string;
  coverageArea: string;
  hotline: string;
  helplineShort: string;
  website: string;
  customerCareUrl?: string;
  verifiedStatus: 'verified';
  primaryMeterBrands: MeterManufacturer[];
}

export interface MeterModelItem {
  id: string;
  manufacturer: MeterManufacturer;
  manufacturerNameBn: string;
  modelName: string;
  type: MeterType;
  phase: 'single' | 'three' | 'both';
  keypadLayout: string;
  enterButtonNote: string;
  samplePhotoDesc: string;
  supportedUtilities: UtilityId[];
  verifiedStatus: 'verified' | 'needs-review';
}

export interface ShortCodeItem {
  id: string;
  code: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  utility: UtilityId | 'all';
  manufacturer: MeterManufacturer | 'all';
  meterType: MeterType | 'all';
  phase?: 'single' | 'three' | 'both';
  category: CodeCategory;
  instructions: string;
  officialSourceUrl: string;
  sourceTitle: string;
  verifiedAt: string;
  status: 'verified' | 'needs-review' | 'outdated';
  note?: string;
}

export interface OfficialSourceItem {
  id: string;
  utility: UtilityId;
  sourceTitle: string;
  sourceUrl: string;
  applicableMeterModels: string;
  documentType: 'manual' | 'short-codes' | 'instructions' | 'portal';
  publicationDate?: string;
  lastCheckedAt: string;
  status: 'verified' | 'needs-review' | 'outdated';
  descriptionBn: string;
}

export interface TroubleshootingItem {
  id: string;
  titleBn: string;
  category: 'token' | 'balance' | 'display' | 'power' | 'alarm' | 'tamper';
  symptoms: string[];
  possibleCauses: string[];
  safeActionSteps: string[];
  whenToCallUtility: string;
  safetyWarning?: string;
  applicableUtilities?: UtilityId[];
  officialReference: string;
}

export interface RechargeGuideItem {
  methodId: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank' | 'vending';
  titleBn: string;
  iconName: string;
  stepsBn: string[];
  confirmationCheck: string;
  tokenInstruction: string;
  troubleshootingNote: string;
  officialSourceTitle: string;
  officialSourceUrl: string;
}

// 1. Bangladesh Electricity Utilities Dataset
export const UTILITIES_DATA: UtilityItem[] = [
  {
    id: 'bpdb',
    nameBn: 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড',
    nameEn: 'Bangladesh Power Development Board',
    fullNameBn: 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড (বিপিডিবি)',
    shortName: 'BPDB',
    coverageArea: 'চট্টগ্রাম, সিলেট, ময়মনসিংহ, কুমিল্লা ও উত্তরাঞ্চলের একাংশ',
    hotline: '১৬১১৬',
    helplineShort: '16116',
    website: 'https://bpdb.gov.bd',
    customerCareUrl: 'https://bpdb.gov.bd/site/page/7918c503-4c2b-43ec-96e9-cda71fbaf6b3/-Pre-Payment-Metering-System',
    verifiedStatus: 'verified',
    primaryMeterBrands: ['hexing', 'inhemeter', 'wasion', 'linyang'],
  },
  {
    id: 'dpdc',
    nameBn: 'ঢাকা পাওয়ার ডিস্ট্রিবিউশন কোম্পানি',
    nameEn: 'Dhaka Power Distribution Company Limited',
    fullNameBn: 'ঢাকা পাওয়ার ডিস্ট্রিবিউশন কোম্পানি লিমিটেড (ডিপিডিসি)',
    shortName: 'DPDC',
    coverageArea: 'ঢাকা শহরের কেন্দ্র, দক্ষিণ ও পূর্ব অংশ এবং নারায়ণগঞ্জের একাংশ',
    hotline: '১৬১১৬',
    helplineShort: '16116',
    website: 'https://dpdc.gov.bd',
    customerCareUrl: 'https://dpdc.gov.bd/pages/static-pages/6922dff6933eb65569e24d7c',
    verifiedStatus: 'verified',
    primaryMeterBrands: ['hexing', 'inhemeter', 'bseco', 'wasion'],
  },
  {
    id: 'desco',
    nameBn: 'ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি',
    nameEn: 'Dhaka Electric Supply Company Limited',
    fullNameBn: 'ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড (ডেসকো)',
    shortName: 'DESCO',
    coverageArea: 'মিরপুর, উত্তরা, গুলশান, বনানী, বারিধারা, বাড্ডা, টঙ্গী',
    hotline: '১৬১২০',
    helplineShort: '16120',
    website: 'https://desco.org.bd',
    customerCareUrl: 'https://prepaid.desco.org.bd/information.html',
    verifiedStatus: 'verified',
    primaryMeterBrands: ['hexing', 'inhemeter', 'linyang', 'sanxing'],
  },
  {
    id: 'nesco',
    nameBn: 'নর্দান ইলেকট্রিসিটি সাপ্লাই কোম্পানি',
    nameEn: 'Northern Electricity Supply Company PLC',
    fullNameBn: 'নর্দান ইলেকট্রিসিটি সাপ্লাই কোম্পানি পিএলসি (নেসকো)',
    shortName: 'NESCO',
    coverageArea: 'রাজশাহী ও রংপুর বিভাগের শহরাঞ্চল',
    hotline: '১৬৬০৩',
    helplineShort: '16603',
    website: 'https://nesco.gov.bd',
    customerCareUrl: 'https://nesco.gov.bd/',
    verifiedStatus: 'verified',
    primaryMeterBrands: ['hexing', 'inhemeter', 'wasion'],
  },
  {
    id: 'wzpdcl',
    nameBn: 'ওয়েস্ট জোন পাওয়ার ডিস্ট্রিবিউশন কোম্পানি',
    nameEn: 'West Zone Power Distribution Company Limited',
    fullNameBn: 'ওয়েস্ট জোন পাওয়ার ডিস্ট্রিবিউশন কোম্পানি লিমিটেড (ওজোপাডিকো)',
    shortName: 'WZPDCL',
    coverageArea: 'খুলনা, বরিশাল এবং বৃহত্তর ফরিদপুর অঞ্চল',
    hotline: '১৬১২১',
    helplineShort: '16121',
    website: 'https://wzpdcl.gov.bd',
    customerCareUrl: 'https://wzpdcl.org.bd/pages/files/6922d9de933eb65569e00b1a',
    verifiedStatus: 'verified',
    primaryMeterBrands: ['hexing', 'inhemeter', 'linyang', 'wasion'],
  },
  {
    id: 'breb',
    nameBn: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (পল্লী বিদ্যুৎ)',
    nameEn: 'Bangladesh Rural Electrification Board',
    fullNameBn: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (পল্লী বিদ্যুৎ সমিতি - পিবিএস)',
    shortName: 'BREB / PBS',
    coverageArea: 'সমগ্র বাংলাদেশের গ্রামীণ ও মফস্বল এলাকা (৮০টি পল্লী বিদ্যুৎ সমিতি)',
    hotline: '০২-৮৯০০৩০০',
    helplineShort: '16999',
    website: 'https://reb.gov.bd',
    customerCareUrl: 'https://reb.gov.bd',
    verifiedStatus: 'verified',
    primaryMeterBrands: ['hexing', 'inhemeter', 'bseco', 'wasion'],
  },
];

// 2. Meter Manufacturers and Common Models
export const METER_MODELS_DATA: MeterModelItem[] = [
  {
    id: 'hexing-single',
    manufacturer: 'hexing',
    manufacturerNameBn: 'হেক্সিং (Hexing)',
    modelName: 'Hexing HXE12-KP (Single Phase Keypad)',
    type: 'keypad',
    phase: 'single',
    keypadLayout: '0-9 সংখ্যা প্যাড এবং ডানপাশে লাল বা নীল "Enter" / বাটন',
    enterButtonNote: 'কোড বা টোকেন লিখে অবশ্যই "Enter" অথবা নীল/লাল বাটন চাপতে হবে',
    samplePhotoDesc: 'সাদা বডি, ছোট এলসিডি ডিসপ্লে, নিচে ১২টি বোতাম বিশিষ্ট কিপ্যাড',
    supportedUtilities: ['bpdb', 'dpdc', 'desco', 'nesco', 'wzpdcl', 'breb'],
    verifiedStatus: 'verified',
  },
  {
    id: 'inhemeter-single',
    manufacturer: 'inhemeter',
    manufacturerNameBn: 'ইনহিমিটার (Inhemeter)',
    modelName: 'Inhemeter DDZ1513 / Smart STS Keypad',
    type: 'keypad',
    phase: 'single',
    keypadLayout: '0-9 বাটন ও ডানপাশে বড় এন্টার (↵) বাটন',
    enterButtonNote: 'কোড টাইপ করার পর এন্টার (↵) বাটন চাপুন',
    samplePhotoDesc: 'গ্রে/সাদা কেসিং, উপরে মিটার নাম্বার বারকোড সহ ডিসপ্লে',
    supportedUtilities: ['bpdb', 'dpdc', 'desco', 'wzpdcl', 'breb'],
    verifiedStatus: 'verified',
  },
  {
    id: 'wasion-single',
    manufacturer: 'wasion',
    manufacturerNameBn: 'ওয়াসিওন (Wasion)',
    modelName: 'Wasion DDSY102 (Single Phase STS)',
    type: 'keypad',
    phase: 'single',
    keypadLayout: '১২টি সফট রাবার কিপ্যাড',
    enterButtonNote: 'কোড লেখার পর তীরচিহ্নিত এন্টার বোতাম চাপুন',
    samplePhotoDesc: 'আয়তাকার নীল-সাদা বডি, এলার্ম এলইডি লাইট সহ',
    supportedUtilities: ['bpdb', 'dpdc', 'nesco', 'breb'],
    verifiedStatus: 'verified',
  },
  {
    id: 'linyang-single',
    manufacturer: 'linyang',
    manufacturerNameBn: 'লিনইয়াং (Linyang)',
    modelName: 'Linyang SM101 / STS Prepaid',
    type: 'keypad',
    phase: 'single',
    keypadLayout: '০-৯ বাটন ও এন্টার/ব্যাকস্পেস বাটন',
    enterButtonNote: 'কোড প্রবেশ করিয়ে এন্টার বাটনে ক্লিক করুন',
    samplePhotoDesc: 'কমপ্যাক্ট সাদা ডিজাইন, পালস লাইট নির্দেশক সহ',
    supportedUtilities: ['desco', 'wzpdcl', 'bpdb'],
    verifiedStatus: 'verified',
  },
  {
    id: 'bseco-single',
    manufacturer: 'bseco',
    manufacturerNameBn: 'বিএসইসিও (BSECO)',
    modelName: 'BSECO Bangladesh Smart Prepaid Meter',
    type: 'keypad',
    phase: 'single',
    keypadLayout: '০-৯ কিপ্যাড ও ওকে বোতাম',
    enterButtonNote: 'কোড লিখে OK বাটন চাপুন',
    samplePhotoDesc: 'বাংলাদেশেই অ্যাসেম্বলকৃত স্মার্ট প্রিপেইড মিটার',
    supportedUtilities: ['dpdc', 'breb', 'bpdb'],
    verifiedStatus: 'verified',
  },
  {
    id: 'hexing-three',
    manufacturer: 'hexing',
    manufacturerNameBn: 'হেক্সিং (Hexing 3-Phase)',
    modelName: 'Hexing HXE310-KP (Three Phase)',
    type: 'keypad',
    phase: 'three',
    keypadLayout: '৩ ফেজ বড় কিপ্যাড ও ডিসপ্লে',
    enterButtonNote: 'কোড লিখে লাল/নীল এন্টার বাটন চাপুন',
    samplePhotoDesc: 'বড় আকারের তিন ফেজ মিটার, কারেন্ট ও ভোল্টেজ আলাদা দেখায়',
    supportedUtilities: ['bpdb', 'dpdc', 'desco', 'nesco', 'wzpdcl'],
    verifiedStatus: 'verified',
  },
];

// 3. Official Short Codes Directory (Verified with Official Manuals)
export const SHORT_CODES_DATA: ShortCodeItem[] = [
  // HEXING METERS (BPDB, DPDC, DESCO, WZPDCL, BREB, NESCO)
  {
    id: 'hexing-balance',
    code: '801',
    titleBn: 'বর্তমান অবশিষ্ট ব্যালেন্স',
    titleEn: 'Remaining Balance (Tk)',
    descriptionBn: 'মিটারে এই মুহূর্তে ব্যবহারের জন্য কত টাকা অবশিষ্ট আছে তা সরাসরি টাকায় দেখতে পারবেন।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'balance',
    instructions: 'মিটারে ৮০১ (801) চেপে নীল অথবা এন্টার (Enter) বাটন চাপুন। ডিসপ্লেতে অবশিষ্ট ব্যালেন্স ভেসে উঠবে।',
    officialSourceUrl: 'https://prepaid.desco.org.bd/prepaid_meter_short_codes.html',
    sourceTitle: 'DESCO & BPDB Hexing Prepaid Manual 2024',
    verifiedAt: '২০২৪-০৯-১৫',
    status: 'verified',
  },
  {
    id: 'hexing-meter-no',
    code: '804',
    titleBn: 'মিটার নম্বর অনুসন্ধান',
    titleEn: 'Meter Number / ID',
    descriptionBn: 'মিটারের গায়ের স্টিকার ছিঁড়ে গেলে বা অস্পষ্ট হলে ভেতরের সংরক্ষিত ১১ বা ১২ ডিজিটের মিটার নম্বর দেখুন।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'meter-number',
    instructions: '৮০৪ (804) লিখে এন্টার চাপুন। মিটার নম্বর ২ ভাগে স্ক্রিনে প্রদর্শিত হবে।',
    officialSourceUrl: 'https://dpdc.gov.bd/pages/static-pages/6922dff6933eb65569e24d7c',
    sourceTitle: 'DPDC Prepaid Meter Manual',
    verifiedAt: '২০২৪-০৯-১০',
    status: 'verified',
  },
  {
    id: 'hexing-last-recharge-token',
    code: '802',
    titleBn: 'সর্বশেষ রিচার্জের টাকার পরিমাণ',
    titleEn: 'Last Recharged Amount',
    descriptionBn: 'সর্বশেষ কত টাকা মিটারে ক্রেডিট করা হয়েছিল তা টাকার অঙ্কে দেখতে পাবেন।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'last-recharge',
    instructions: '৮০২ (802) লিখে এন্টার বাটন চাপুন।',
    officialSourceUrl: 'https://prepaid.desco.org.bd/prepaid_meter_short_codes.html',
    sourceTitle: 'DESCO Short Code Catalog',
    verifiedAt: '২০২৪-০৮-২০',
    status: 'verified',
  },
  {
    id: 'hexing-total-kwh',
    code: '806',
    titleBn: 'মিটারের আজীবন মোট বিদ্যুৎ ব্যবহার (kWh)',
    titleEn: 'Cumulative Energy Consumption',
    descriptionBn: 'মিটারটি চালু হওয়ার পর থেকে মোট কত ইউনিট (kWh) বিদ্যুৎ খরচ হয়েছে।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'consumption',
    instructions: '৮০৬ (806) লিখে এন্টার বোতাম চাপুন। মোট খরচ হওয়া ইউনিট দেখতে পাবেন।',
    officialSourceUrl: 'https://bpdb.gov.bd/site/page/7918c503-4c2b-43ec-96e9-cda71fbaf6b3/-Pre-Payment-Metering-System',
    sourceTitle: 'BPDB Official Guideline',
    verifiedAt: '২০২৪-০৭-০১',
    status: 'verified',
  },
  {
    id: 'hexing-emergency-credit',
    code: '898',
    titleBn: 'ইমার্জেন্সি ব্যালেন্স চালু করা (Overdraft)',
    titleEn: 'Emergency Credit / Overdraft',
    descriptionBn: 'রাতের বেলা বা ছুটির দিনে হঠাৎ ব্যালেন্স শূন্য হয়ে বিদ্যুৎ বন্ধ হলে জরুরি বিদ্যুৎ সংযোগ চালু করার কোড।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'emergency',
    instructions: '৮৯৮ (898) লিখে এন্টার বাটন চাপুন। অনুমোদিত ইমার্জেন্সি ব্যালেন্স চালু হবে যা পরবর্তী রিচার্জে সমন্বয় হবে।',
    officialSourceUrl: 'https://prepaid.desco.org.bd/prepaid-manual.html',
    sourceTitle: 'DESCO & DPDC Prepaid Manual',
    verifiedAt: '২০২৪-০৯-১২',
    status: 'verified',
    note: 'ইমার্জেন্সি ব্যালেন্স পাওয়ার শর্তাবলি আপনার বিদ্যুৎ বিতরণ কোম্পানির নীতিমালার ওপর নির্ভরশীল।',
  },
  {
    id: 'hexing-alarm-off',
    code: '00',
    titleBn: 'লো-ব্যালেন্স অ্যালার্ম বা বিপ সাউন্ড বন্ধ করা',
    titleEn: 'Mute Low Balance Alarm Buzzer',
    descriptionBn: 'ব্যালেন্স কমে গেলে মিটারে যে অবিরাম বিপ শব্দ বাজে, তা সাময়িকভাবে মিউট করার কোড।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'alarm',
    instructions: '০০ (00) চেপে এন্টার বাটন চাপুন। পরবর্তী কয়েক ঘণ্টা পর্যন্ত অ্যালার্ম বন্ধ থাকবে।',
    officialSourceUrl: 'https://dpdc.gov.bd/pages/static-pages/6922dff6933eb65569e24d7c',
    sourceTitle: 'DPDC Meter Guideline',
    verifiedAt: '২০২৪-০৯-১৫',
    status: 'verified',
  },
  {
    id: 'hexing-voltage',
    code: '808',
    titleBn: 'বর্তমান লাইভ ভোল্টেজ (Volt)',
    titleEn: 'Current Line Voltage',
    descriptionBn: 'আপনার বাসার লাইনে বর্তমান ভোল্টেজ ঠিক আছে কিনা (যেমন: ২২০-২৩০ ভোল্ট) তা দেখার কোড।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'voltage-current',
    instructions: '৮০৮ (808) লিখে এন্টার চাপুন। লাইনের তাৎক্ষণিক ভোল্টেজ দেখতে পাবেন।',
    officialSourceUrl: 'https://prepaid.desco.org.bd/prepaid_meter_short_codes.html',
    sourceTitle: 'DESCO Short Codes',
    verifiedAt: '২০২৪-০৮-১৫',
    status: 'verified',
  },
  {
    id: 'hexing-current-amp',
    code: '809',
    titleBn: 'বর্তমান লোড বা বিদ্যুৎ প্রবাহ (Ampere)',
    titleEn: 'Current Load in Amperes',
    descriptionBn: 'এই মুহূর্তে আপনার ঘরে কত অ্যাম্পিয়ার কারেন্ট খরচ হচ্ছে তা জানার উপায়।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'voltage-current',
    instructions: '৮০৯ (809) চেপে এন্টার বাটন চাপুন।',
    officialSourceUrl: 'https://prepaid.desco.org.bd/prepaid_meter_short_codes.html',
    sourceTitle: 'DESCO Short Codes',
    verifiedAt: '২০২৪-০৮-১৫',
    status: 'verified',
  },
  {
    id: 'hexing-date-time',
    code: '807',
    titleBn: 'মিটারের বর্তমান তারিখ ও সময়',
    titleEn: 'Meter Date & Time Clock',
    descriptionBn: 'মিটারের ভেতরের ঘড়ি ও ক্যালেন্ডার সঠিক আছে কিনা তা যাচাই করুন।',
    utility: 'all',
    manufacturer: 'hexing',
    meterType: 'keypad',
    category: 'date-time',
    instructions: '৮০৭ (807) লিখে এন্টার বোতাম চাপুন।',
    officialSourceUrl: 'https://bpdb.gov.bd/site/page/7918c503-4c2b-43ec-96e9-cda71fbaf6b3/-Pre-Payment-Metering-System',
    sourceTitle: 'BPDB Official Guideline',
    verifiedAt: '২০২৪-০৯-০১',
    status: 'verified',
  },

  // INHEMETER & WASION SHORT CODES (DPDC, DESCO, WZPDCL, BREB)
  {
    id: 'inhemeter-balance',
    code: '01',
    titleBn: 'ইনহিমিটার ব্যালেন্স অনুসন্ধান',
    titleEn: 'Inhemeter Balance Check',
    descriptionBn: 'ইনহিমিটার ব্র্যান্ডের মিটারে বর্তমান অবশিষ্ট ব্যালেন্স জানার অফিসিয়াল কোড।',
    utility: 'all',
    manufacturer: 'inhemeter',
    meterType: 'keypad',
    category: 'balance',
    instructions: '০১ (01) লিখে এন্টার (↵) বোতাম চাপুন।',
    officialSourceUrl: 'https://wzpdcl.org.bd/pages/files/6922d9de933eb65569e00b1a',
    sourceTitle: 'WZPDCL Inhemeter Manual',
    verifiedAt: '২০২৪-০৯-১০',
    status: 'verified',
  },
  {
    id: 'inhemeter-meter-no',
    code: '04',
    titleBn: 'ইনহিমিটার মিটার নম্বর',
    titleEn: 'Inhemeter Meter Number',
    descriptionBn: 'ইনহিমিটার প্রিপেইড মিটারের ডিজিটাল আইডি বা মিটার নম্বর প্রদর্শনের কোড।',
    utility: 'all',
    manufacturer: 'inhemeter',
    meterType: 'keypad',
    category: 'meter-number',
    instructions: '০৪ (04) লিখে এন্টার চাপুন।',
    officialSourceUrl: 'https://wzpdcl.org.bd/pages/files/6922d9de933eb65569e00b1a',
    sourceTitle: 'WZPDCL User Guide',
    verifiedAt: '২০২৪-০৮-১০',
    status: 'verified',
  },
  {
    id: 'inhemeter-total-kwh',
    code: '07',
    titleBn: 'ইনহিমিটার সর্বমোট ব্যবহৃত ইউনিট',
    titleEn: 'Inhemeter Cumulative kWh',
    descriptionBn: 'মিটার চালুর পর থেকে মোট কত ইউনিট বিদ্যুৎ ব্যয় হয়েছে।',
    utility: 'all',
    manufacturer: 'inhemeter',
    meterType: 'keypad',
    category: 'consumption',
    instructions: '০৭ (07) লিখে এন্টার চাপুন।',
    officialSourceUrl: 'https://wzpdcl.org.bd/pages/files/6922d9de933eb65569e00b1a',
    sourceTitle: 'WZPDCL Inhemeter Manual',
    verifiedAt: '২০২৪-০৮-১০',
    status: 'verified',
  },
  {
    id: 'inhemeter-alarm-off',
    code: '888',
    titleBn: 'ইনহিমিটার লো-ব্যালেন্স অ্যালার্ম বন্ধ',
    titleEn: 'Inhemeter Mute Buzzer',
    descriptionBn: 'টাকা কমে গেলে বিপ বিপ সাউন্ড সাময়িকভাবে বন্ধ করার ইনহিমিটার স্পেসিফিক কোড।',
    utility: 'all',
    manufacturer: 'inhemeter',
    meterType: 'keypad',
    category: 'alarm',
    instructions: '৮৮৮ (888) লিখে এন্টার (↵) চাপুন।',
    officialSourceUrl: 'https://wzpdcl.org.bd/pages/files/6922d9de933eb65569e00b1a',
    sourceTitle: 'WZPDCL User Guide',
    verifiedAt: '২০২৪-০৮-১০',
    status: 'verified',
  },
  {
    id: 'inhemeter-voltage',
    code: '08',
    titleBn: 'ইনহিমিটার ভোল্টেজ পরিমাপ',
    titleEn: 'Inhemeter Voltage Check',
    descriptionBn: 'ইনহিমিটার যুক্ত লাইনে বর্তমান ভোল্টেজ পরীক্ষা।',
    utility: 'all',
    manufacturer: 'inhemeter',
    meterType: 'keypad',
    category: 'voltage-current',
    instructions: '০৮ (08) লিখে এন্টার চাপুন।',
    officialSourceUrl: 'https://wzpdcl.org.bd/pages/files/6922d9de933eb65569e00b1a',
    sourceTitle: 'WZPDCL Guide',
    verifiedAt: '২০২৪-০৮-১০',
    status: 'verified',
  },
  {
    id: 'inhemeter-emergency',
    code: '898',
    titleBn: 'ইনহিমিটার ইমার্জেন্সি ক্রেডিট',
    titleEn: 'Inhemeter Emergency Credit',
    descriptionBn: 'ইনহিমিটারে জরুরি বিদ্যুৎ সংযোগ সচল করার কোড।',
    utility: 'all',
    manufacturer: 'inhemeter',
    meterType: 'keypad',
    category: 'emergency',
    instructions: '৮৯৮ লিখে এন্টার চাপুন। অনুমোদন সাপেক্ষে ইমার্জেন্সি ব্যালেন্স চালু হবে।',
    officialSourceUrl: 'https://dpdc.gov.bd/pages/static-pages/6922dff6933eb65569e24d7c',
    sourceTitle: 'DPDC Meter Guide',
    verifiedAt: '২০২৪-০৯-০৫',
    status: 'verified',
  },

  // WASION & LINYANG CODES
  {
    id: 'wasion-balance',
    code: '801',
    titleBn: 'ওয়াসিওন ব্যালেন্স অনুসন্ধান',
    titleEn: 'Wasion Balance (Tk)',
    descriptionBn: 'ওয়াসিওন এসটিএস কিপ্যাড মিটারে বর্তমান অবশিষ্ট ব্যালেন্স।',
    utility: 'all',
    manufacturer: 'wasion',
    meterType: 'keypad',
    category: 'balance',
    instructions: '৮০১ লিখে এন্টার চাপুন।',
    officialSourceUrl: 'https://nesco.gov.bd/',
    sourceTitle: 'NESCO Wasion Meter Manual',
    verifiedAt: '২০২৪-০৮-০১',
    status: 'verified',
  },
  {
    id: 'wasion-relay-status',
    code: '814',
    titleBn: 'রিলে বা বিদ্যুৎ সংযোগ স্ট্যাটাস',
    titleEn: 'Relay Connected / Disconnected',
    descriptionBn: 'মিটারের ভেতরের সুইচ বা রিলে সংযুক্ত আছে নাকি সংযোগ বিচ্ছিন্ন তা দেখার কোড।',
    utility: 'all',
    manufacturer: 'wasion',
    meterType: 'keypad',
    category: 'status',
    instructions: '৮১৪ (814) লিখে এন্টার চাপুন। রিলে ওপেন নাকি ক্লোজড তা দেখা যাবে।',
    officialSourceUrl: 'https://prepaid.desco.org.bd/prepaid_meter_short_codes.html',
    sourceTitle: 'DESCO Short Codes Directory',
    verifiedAt: '২০২৪-০৭-১৫',
    status: 'verified',
  },
  {
    id: 'linyang-last-month-kwh',
    code: '820',
    titleBn: 'গত মাসের মোট বিদ্যুৎ ব্যবহার (kWh)',
    titleEn: 'Previous Month Total Energy Used',
    descriptionBn: 'পূর্ববর্তী ক্যালেন্ডার মাসে মোট কত ইউনিট বিদ্যুৎ ব্যবহার হয়েছিল তা দেখার কোড।',
    utility: 'all',
    manufacturer: 'linyang',
    meterType: 'keypad',
    category: 'consumption',
    instructions: '৮২০ (820) লিখে এন্টার চাপুন।',
    officialSourceUrl: 'https://prepaid.desco.org.bd/prepaid_meter_short_codes.html',
    sourceTitle: 'DESCO Meter Codes',
    verifiedAt: '২০২৪-০৬-৩০',
    status: 'verified',
  },
];

// 4. Recharge Tariff Calculation Rules (Official BERC Residential Tariff Reference)
// Note: BERC Domestic (LT-A) lifeline and normal slabs
export interface TariffSlab {
  minUnit: number;
  maxUnit: number;
  ratePerUnit: number; // Taka per kWh
}

export const RESIDENTIAL_TARIFF_SLABS: TariffSlab[] = [
  { minUnit: 0, maxUnit: 50, ratePerUnit: 4.63 }, // Lifeline slab
  { minUnit: 0, maxUnit: 75, ratePerUnit: 5.26 }, // Slab 1
  { minUnit: 76, maxUnit: 200, ratePerUnit: 7.20 }, // Slab 2
  { minUnit: 201, maxUnit: 300, ratePerUnit: 7.59 }, // Slab 3
  { minUnit: 301, maxUnit: 400, ratePerUnit: 8.02 }, // Slab 4
  { minUnit: 401, maxUnit: 600, ratePerUnit: 12.67 }, // Slab 5
  { minUnit: 601, maxUnit: 99999, ratePerUnit: 14.61 }, // Above 600
];

export interface RechargeCalculationInput {
  amount: number;
  utility: UtilityId;
  phase: 'single' | 'three';
  sanctionedLoadKw: number; // typically 1 - 3 kW for home
  arrearsDeduction?: number; // unpaid dues / previous emergency credit
  isFirstRechargeOfMonth?: boolean; // Meter rent and demand charge usually deducted on 1st recharge
}

export interface RechargeCalculationResult {
  rechargeAmount: number;
  meterRent: number;
  demandCharge: number;
  vatAmount: number;
  prepaidRebate: number; // 1% rebate for prepaid users per government policy
  arrearsAmount: number;
  totalDeductions: number;
  netEnergyCredit: number;
  approximateUnits: number;
  deductionsBreakdown: {
    label: string;
    amount: number;
    description: string;
  }[];
  assumptionsNotes: string[];
}

export const calculateRechargeBreakdown = (
  input: RechargeCalculationInput
): RechargeCalculationResult => {
  const { amount, utility, phase, sanctionedLoadKw, arrearsDeduction = 0, isFirstRechargeOfMonth = true } = input;

  // 1. Meter Rent (Monthly fee, usually charged on 1st recharge of English calendar month)
  // Single phase: Tk 40, Three phase: Tk 250 (DESCO/DPDC/BPDB standard)
  const meterRent = isFirstRechargeOfMonth ? (phase === 'three' ? 250 : 40) : 0;

  // 2. Demand Charge (per kW per month)
  // Residential LT-A demand charge: typically Tk 42/kW (or Tk 35 in some utilities)
  const demandRate = utility === 'desco' || utility === 'dpdc' ? 42 : 35;
  const demandCharge = isFirstRechargeOfMonth ? Math.round(sanctionedLoadKw * demandRate) : 0;

  // 3. Prepaid Rebate (১% প্রণোদনা)
  // Government provides 1% incentive rebate on recharge amount for prepaid users
  const prepaidRebate = Math.round(amount * 0.01);

  // 4. Arrears or previous emergency balance adjustment
  const arrearsAmount = arrearsDeduction > 0 ? arrearsDeduction : 0;

  // Fixed deductions subtotal
  const fixedDeductions = meterRent + demandCharge + arrearsAmount;

  // Remaining for energy + VAT
  // In Bangladesh: Total Paid = Energy Charge + VAT (5% on Energy Charge)
  // So: Energy Amount * 1.05 = (amount + rebate - fixedDeductions)
  const availableForEnergyAndVat = Math.max(0, amount + prepaidRebate - fixedDeductions);
  const netEnergyCredit = Math.max(0, Math.round(availableForEnergyAndVat / 1.05));
  const vatAmount = Math.max(0, Math.round(netEnergyCredit * 0.05));

  const totalDeductions = meterRent + demandCharge + vatAmount + arrearsAmount;

  // Approximate units calculation (using average residential rate ~ ৳7.20 / unit)
  const approxRate = 7.20;
  const approximateUnits = netEnergyCredit > 0 ? Math.round((netEnergyCredit / approxRate) * 10) / 10 : 0;

  const deductionsBreakdown = [
    {
      label: '১% প্রিপেইড সরকারি রিবেট (+)',
      amount: prepaidRebate,
      description: 'প্রিপেইড বিদ্যুৎ ব্যবহারকারীদের জন্য সরকারি ১% প্রণোদনা বা রিবেট বোনাস।',
    },
    {
      label: 'ভ্যাট (VAT ৫%)',
      amount: vatAmount,
      description: 'জাতীয় রাজস্ব বোর্ড (এনবিআর) নির্ধারিত বিদ্যুৎ ব্যবহারের ওপর ৫% সরকারি মূল্য সংযোজন কর।',
    },
    {
      label: 'মিটার ভাড়া (Meter Rent)',
      amount: meterRent,
      description: isFirstRechargeOfMonth
        ? `মাসিক মিটার রক্ষণাবেক্ষণ ফি (${phase === 'three' ? '৩ ফেজ ২৫০ টাকা' : '১ ফেজ ৪০ টাকা'})। মাসের প্রথম রিচার্জে কর্তন করা হয়।`
        : 'এই মাসের পূর্ববর্তী রিচার্জে ইতিমধ্যেই কর্তন হয়ে থাকলে দ্বিতীয়বার কাটা হবে না।',
    },
    {
      label: 'ডিমান্ড চার্জ (Demand Charge)',
      amount: demandCharge,
      description: isFirstRechargeOfMonth
        ? `অনুমোদিত লোড (${sanctionedLoadKw} kW × ${demandRate} টাকা) অনুযায়ী মাসিক ফিক্সড চার্জ।`
        : 'মাসের প্রথম রিচার্জে কাটা না হয়ে থাকলে প্রযোজ্য।',
    },
  ];

  if (arrearsAmount > 0) {
    deductionsBreakdown.push({
      label: 'বকেয়া বা ইমার্জেন্সি ব্যালেন্স সমন্বয়',
      amount: arrearsAmount,
      description: 'পূর্বে ব্যবহৃত ইমার্জেন্সি ক্রেডিট বা পূর্ববর্তী বকেয়া ফি কর্তন।',
    });
  }

  const assumptionsNotes = [
    'এটি বাংলাদেশ এনার্জি রেগুলেটরি কমিশন (বিইআরসি) ও বিদ্যুৎ উন্নয়ন বোর্ডের সাধারণ আবাসিক (LT-A) গ্রাহকদের কাঠামোর ওপর ভিত্তি করে আনুমানিক হিসাব।',
    'মাসের প্রথম রিচার্জে পুরো মাসের মিটার ভাড়া ও ডিমান্ড চার্জ একবারে কেটে নেওয়া হয়। একই মাসের পরবর্তী রিচার্জে সাধারণত মিটার ভাড়া কাটা হয় না।',
    'প্রকৃত এনার্জি টোকেনের মান আপনার অতীতের স্ল্যাব ব্যবহার ও অনুমোদিত লোডের তারতম্যের কারণে সামান্য পরিবর্তন হতে পারে।',
  ];

  return {
    rechargeAmount: amount,
    meterRent,
    demandCharge,
    vatAmount,
    prepaidRebate,
    arrearsAmount,
    totalDeductions,
    netEnergyCredit,
    approximateUnits,
    deductionsBreakdown,
    assumptionsNotes,
  };
};

// 5. Balance Runway Calculation
export interface RunwayResult {
  usableBalance: number;
  dailyCost: number;
  daysRemaining: number;
  estimatedEndDate: string;
  isUrgent: boolean;
  reminderStatus: 'safe' | 'warning' | 'critical';
  adviceBn: string;
}

export const calculateBalanceRunway = (
  balance: number,
  dailyCost: number,
  emergencyBuffer: number = 50
): RunwayResult => {
  const usableBalance = Math.max(0, balance - emergencyBuffer);
  const safeDailyCost = dailyCost > 0 ? dailyCost : 25; // fallback average
  const days = usableBalance > 0 ? Math.floor(usableBalance / safeDailyCost) : 0;

  const now = new Date();
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const endDateFormatted = endDate.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let reminderStatus: 'safe' | 'warning' | 'critical' = 'safe';
  let adviceBn = 'আপনার ব্যালেন্স পর্যাপ্ত রয়েছে। নিশ্চিন্তে ব্যবহার করুন।';

  if (balance <= 50 || days <= 1) {
    reminderStatus = 'critical';
    adviceBn = 'জরুরি সতর্কতা: ব্যালেন্স খুব কম! আজই রিচার্জ করুন অথবা প্রয়োজনে ইমার্জেন্সি কোড ব্যবহার করুন।';
  } else if (balance <= 150 || days <= 3) {
    reminderStatus = 'warning';
    adviceBn = 'সতর্কতা: আগামী ২-৩ দিনের মধ্যে ব্যালেন্স শেষ হতে পারে। নিরাপদ সময়ে রিচার্জ করে নিন।';
  }

  return {
    usableBalance,
    dailyCost: safeDailyCost,
    daysRemaining: days,
    estimatedEndDate: endDateFormatted,
    isUrgent: reminderStatus === 'critical',
    reminderStatus,
    adviceBn,
  };
};

// 6. Troubleshooting Articles
export const TROUBLESHOOTING_DATA: TroubleshootingItem[] = [
  {
    id: 'token-reject',
    titleBn: 'রিচার্জের ২০ ডিজিট টোকেন রিজেক্ট (Reject) দেখাচ্ছে',
    category: 'token',
    symptoms: ['ডিসপ্লেতে "Reject" বা "Error" লেখা আসছে', 'টাকা ঢুকছে না এবং লাল বাতি জ্বলছে'],
    possibleCauses: [
      'টোকেনের ২০টি ডিজিটের কোনো একটি ভুল টাইপ করা হয়েছে।',
      'একই টোকেন আগে একবার প্রবেশ করানো হয়েছিল।',
      'টোকেন তৈরির পর অন্য কোনো রিচার্জ সম্পন্ন হয়ে থাকলে টোকেন ক্রমভঙ্গ (Out of Sequence) হতে পারে।',
      'মিটার নম্বর ভুল দিয়ে অন্য মিটারের টোকেন কেনা হয়েছে।',
    ],
    safeActionSteps: [
      'ধীরে ধীরে প্রতিটি সংখ্যা দেখে ২০টি ডিজিট নির্ভুলভাবে টাইপ করুন এবং শেষে Enter চাপুন।',
      'আপনার বিকাশ/নগদ রিসিটের মিটার নম্বরটি আপনার বর্তমান মিটারের সাথে মিলিয়ে দেখুন।',
      'যদি একাধিক টোকেন পেয়ে থাকেন (যেমন: ম্যানেজমেন্ট বা ডিমান্ড চার্জ টোকেন), তবে রিসিটে দেওয়া ক্রম অনুযায়ী পর্যায়ক্রমে প্রবেশ করান।',
      'টোকেন বাতিল হলে সংশ্লিষ্ট অ্যাপ বা কাস্টমার কেয়ার থেকে রিচেক টোকেন সংগ্রহ করুন।',
    ],
    whenToCallUtility: '৩ বার চেষ্টার পরও Reject হলে আর বারবার চাপবেন না; এতে মিটার লক হতে পারে। সংশ্লিষ্ট বিদ্যুৎ অফিসের হেল্পলাইনে যোগাযোগ করুন।',
    safetyWarning: 'কখনোই মিটারের ওপর আঘাত করবেন না বা স্ক্রু ড্রাইভার দিয়ে মিটার খোলার চেষ্টা করবেন না।',
    officialReference: 'ডেসকো ও ডিপিডিসি অফিসিয়াল প্রিপেইড ট্রাবলশুটিং ম্যানুয়াল',
  },
  {
    id: 'display-blank',
    titleBn: 'মিটারের স্ক্রিন বা ডিসপ্লে সম্পূর্ণ বন্ধ (Blank Display)',
    category: 'display',
    symptoms: ['ডিসপ্লেতে কোনো লেখা বা আলো নেই', 'কোনো বাটন চাপলেও কিছু দেখা যায় না'],
    possibleCauses: [
      'মিটারের ইন্টারনাল ব্যাটারি বা ব্যাকআপ সিস্টেম সাময়িক স্লিপ মোডে থাকতে পারে।',
      'প্রধান লাইনে বিদ্যুৎ সরবরাহ (Grid Failure) বন্ধ থাকতে পারে।',
      'ইনকামিং সার্ভিসের ফিউজ বা সার্কিট ব্রেকার পুড়ে গেছে।',
    ],
    safeActionSteps: [
      'কীপ্যাডের যেকোনো একটি বোতাম (যেমন Enter বা ০) চেপে দেখুন ডিসপ্লে জেগে ওঠে কিনা।',
      'পাশের ফ্ল্যাট বা বাড়ির বিদ্যুৎ সচল আছে কিনা দেখে নিশ্চিত হোন এলাকাভিত্তিক বিদ্যুৎ বিভ্রাট কিনা।',
      'মিটারের নিচে থাকা নিজস্ব মেইন সুইচ বা এমসিবি (MCB Breaker) অন আছে কিনা পরীক্ষা করুন।',
    ],
    whenToCallUtility: 'যদি এলাকায় বিদ্যুৎ থাকে কিন্তু মিটারের ডিসপ্লে দীর্ঘক্ষণ পুরোপুরি বন্ধ থাকে, তবে দ্রুত বিদ্যুৎ অফিসে জানান। মিটার ত্রুটিপূর্ণ হলে বিনামূল্যে মেরামত করে দেওয়া হয়।',
    safetyWarning: 'মিটারের পেছনের সংযোগ তার বা ইনপুট তারে হাত দেওয়া অত্যন্ত বিপজ্জনক। কোনো তার স্পর্শ করবেন না।',
    officialReference: 'বিপিডিবি বিদ্যুৎ গ্রাহক সেবা নির্দেশিকা',
  },
  {
    id: 'rapid-balance-drain',
    titleBn: 'ব্যালেন্স দ্রুত শেষ হয়ে যাচ্ছে বা অতিরিক্ত টাকা কাটছে',
    category: 'balance',
    symptoms: ['রিচার্জ করার অল্প কয়েকদিনের মধ্যেই ব্যালেন্স শেষ', 'বিদ্যুৎ ব্যবহার কম হলেও বেশি কাটছে'],
    possibleCauses: [
      'মাসের প্রথম রিচার্জে পুরো মাসের মিটার ভাড়া, ডিমান্ড চার্জ ও ভ্যাট সমন্বয় হওয়া।',
      'আবাসিক স্ল্যাবের উচ্চ ধাপে (যেমন ২০০ বা ৩০০ ইউনিটের বেশি) পৌঁছে প্রতি ইউনিটের বর্ধিত হারে বিল কাটা।',
      'বাসার ওয়্যারিংয়ে আর্থ লিকেজ (Earth Leakage) বা তারের লিক থাকা।',
      'রেফ্রিজারেটর, মোটর বা এসির অতিরিক্ত বিদ্যুৎ অপচয়।',
    ],
    safeActionSteps: [
      'বাসার সব লাইট, ফ্যান ও যন্ত্র বন্ধ করে মিটারের ডিসপ্লেতে পালস এলইডি (Pulse LED) দ্রুত লাফাচ্ছে কিনা লক্ষ্য করুন। সব বন্ধেও দ্রুত লাফালে বুঝতে হবে লাইনে কারেন্ট লিক হচ্ছে।',
      '৮০৬ কোড চেপে এই মাসে মোট কত ইউনিট খরচ হয়েছে তা ডেসপ্যাচ করে দেখুন।',
      'একজন দক্ষ ইলেকট্রিশিয়ান দিয়ে বাসার ওয়্যারিংয়ের আর্থিং ও নিউট্রাল লাইন চেক করান।',
    ],
    whenToCallUtility: 'ওয়্যারিং ঠিক থাকা সত্ত্বেও অস্বাভাবিক ব্যালেন্স কাটলে বিদ্যুৎ অফিসে মিটার পরীক্ষার (Meter Accuracy Test) আবেদন করুন।',
    officialReference: 'বিইআরসি বিদ্যুৎ ট্যারিফ ও প্রিপেইড হিসাব বিধিমালা',
  },
  {
    id: 'emergency-credit-activation',
    titleBn: 'ইমার্জেন্সি ব্যালেন্স চালু করা ও শর্তাবলি',
    category: 'balance',
    symptoms: ['ব্যালেন্স শূন্য বা মাইনাসে চলে গেছে', 'হঠাৎ বিদ্যুৎ বন্ধ হয়ে গেছে'],
    possibleCauses: ['নিয়মিত রিচার্জ সময়মতো না করা'],
    safeActionSteps: [
      'হেক্সিং মিটারে ৮৯৮ চেপে Enter চাপুন।',
      'ইনহিমিটারে ৮৯৮ চেপে এন্টার চাপুন।',
      'কোনো কোনো মিটারে ব্যালেন্স শেষ হওয়ার পর Enter বাটন ৫ সেকেন্ড চেপে রাখলেও জরুরি ব্যালেন্স সচল হয়।',
    ],
    whenToCallUtility: 'ইমার্জেন্সি ব্যালেন্স ব্যবহারের পর দ্রুততম সময়ে রিচার্জ করুন। কারণ পরবর্তীতে রিচার্জ না করা পর্যন্ত পুনরায় ইমার্জেন্সি ব্যালেন্স পাওয়া যাবে না।',
    officialReference: 'পল্লী বিদ্যুৎ ও ডিপিডিসি জরুরি ব্যালেন্স নীতিমালা',
  },
  {
    id: 'buzzer-alarm-muting',
    titleBn: 'মিটারের অ্যালার্মের বিপ বিপ শব্দ বন্ধ করা',
    category: 'alarm',
    symptoms: ['ব্যালেন্স কমে গেলে মিটারে উচ্চ শব্দে অ্যালার্ম বাজতে থাকে'],
    possibleCauses: ['ব্যালেন্স ২০০ টাকা বা ১০০ টাকার নিচে নেমে যাওয়া'],
    safeActionSteps: [
      'হেক্সিং মিটারে ০০ (00) চেপে Enter চাপুন।',
      'ইনহিমিটার বা অন্য মিটারে ৮৮৮ চেপে Enter চাপুন।',
      'এটি সাময়িক সমাধান। অ্যালার্ম বন্ধ হলেও রিচার্জ না করলে কিছু সময় পর বিদ্যুৎ বন্ধ হয়ে যাবে।',
    ],
    whenToCallUtility: 'অ্যালার্ম বন্ধের পর দ্রুত টাকা রিচার্জ করে নিন।',
    officialReference: 'ডেসকো কিপ্যাড মিটার নির্দেশিকা',
  },
  {
    id: 'tamper-error',
    titleBn: 'মিটারে "Tamper" বা "Open" বা লাল আলো জ্বলে থাকা',
    category: 'tamper',
    symptoms: ['ডিসপ্লেতে "Open" বা "Tamper" লেখা এসেছে এবং বিদ্যুৎ বিচ্ছিন্ন'],
    possibleCauses: [
      'মিটারের কাভার নাড়াচাড়া বা খোলার চেষ্টা করা হলে সেন্সর সিকিউরিটি ট্রিপ করে।',
      'শক্তিশালী চৌম্বক ক্ষেত্র বা বাইরের কোনো ধাক্কার কারণে সুরক্ষামূলক সুইচ চালু হওয়া।',
    ],
    safeActionSteps: [
      'কখনোই নিজে নিজে সিল বা মিটার বক্স খোলার চেষ্টা করবেন না। এটি আইনত দণ্ডনীয় অপরাধ।',
      'মিটারের গায়ে হাত না দিয়ে মিটার নম্বর ও ডিসপ্লেতে থাকা এরর কোডের ছবি তুলে রাখুন।',
    ],
    whenToCallUtility: 'অবিলম্বে সংশ্লিষ্ট অভিযোগ কেন্দ্রে (Complaint Center) খবর দিন। বিদ্যুৎ অফিসের লাইনম্যান এসে অফিসিয়াল মাস্টার টোকেন দিয়ে ট্যাম্পার রিসেট করে বিদ্যুৎ সচল করে দেবেন।',
    safetyWarning: 'ট্যাম্পার এরর নিজে মেরামতের চেষ্টা করলে বিদ্যুৎ চুরির মামলা বা জরিমানা হতে পারে।',
    officialReference: 'বাংলাদেশ বিদ্যুৎ আইন ২০১৮ ও ইউটিলিটি গাইডলাইন',
  },
];

// 7. Official Recharge Guides (MFS & Banks)
export const RECHARGE_GUIDES_DATA: RechargeGuideItem[] = [
  {
    methodId: 'bkash',
    titleBn: 'বিকাশ (bKash) অ্যাপের মাধ্যমে রিচার্জ',
    iconName: 'Smartphone',
    stepsBn: [
      'বিকাশ অ্যাপ ওপেন করে লগইন করুন এবং "Pay Bill" (পে বিল) আইকনে ট্যাপ করুন।',
      '"Electricity" (বিদ্যুৎ) নির্বাচন করে আপনার বিতরণ কোম্পানি (যেমন: DESCO Prepaid, DPDC Prepaid, BPDB Prepaid, NESCO Prepaid, WZPDCL Prepaid, Palli Bidyut Prepaid) সিলেক্ট করুন।',
      'আপনার সঠিক মিটার নম্বর অথবা গ্রাহক একাউন্ট নম্বর দিন।',
      'রিচার্জের পরিমাণ (যেমন: ৫০০ বা ১০০০ টাকা) লিখে বিকাশ পিন দিয়ে বিল সম্পন্ন করুন।',
      'পেমেন্ট সফল হলে স্ক্রিনে এবং এসএমএসে ২০ ডিজিটের রিচার্জ টোকেন (Token) নম্বর পাবেন।',
      'মিটারের কিপ্যাডে সেই ২০টি ডিজিট নির্ভুলভাবে টাইপ করে Enter/নীল বোতাম চাপুন।',
    ],
    confirmationCheck: 'মিটারে ২০ ডিজিট টাইপ করে Enter চাপার পর ডিসপ্লেতে "Good" বা "Accept" লেখা ভেসে উঠবে এবং নতুন ব্যালেন্স যোগ হবে।',
    tokenInstruction: 'টোকেন মেসেজ না পেলে বিকাশ অ্যাপের "ইনবক্স" > "লেনদেন বিবরণী" অথবা পে বিল রিসিট ডাউনলোড করে টোকেন দেখে নিন।',
    troubleshootingNote: 'টোকেন Reject দেখালে কোনো ডিজিট বাদ পড়েছে কিনা মিলিয়ে পুনরায় টাইপ করুন।',
    officialSourceTitle: 'বিকাশ অফিশিয়াল বিদ্যুৎ বিল পেমেন্ট নির্দেশিকা',
    officialSourceUrl: 'https://www.bkash.com/pay-bill/electricity',
  },
  {
    methodId: 'nagad',
    titleBn: 'নগদ (Nagad) অ্যাপ বা USSD-তে রিচার্জ',
    iconName: 'CreditCard',
    stepsBn: [
      'নগদ অ্যাপে ঢুকে "Bill Pay" (বিল পে) নির্বাচন করুন অথবা *167# ডায়াল করুন।',
      'বিদ্যুৎ অপশন থেকে আপনার প্রিপেইড ইউটিলিটি কোম্পানি সিলেক্ট করুন।',
      'মিটার নম্বর ও টাকার পরিমাণ দিন এবং নগদ পিন প্রদান করুন।',
      'এসএমএসে পাওয়া ২০ ডিজিটের সিকোয়েন্স কোডটি মিটারে প্রবেশ করিয়ে এন্টার চাপুন।',
    ],
    confirmationCheck: 'মিটারে "Accept" সংকেত দেখা যাবে এবং সবুজ আলো জ্বলবে।',
    tokenInstruction: 'নগদ রিসিটে ২০ সংখ্যার টোকেন স্পষ্ট উল্লেখ থাকে।',
    troubleshootingNote: 'যদি টাকা কেটে নেওয়া হয় কিন্তু এসএমএস না আসে, ১০ মিনিট অপেক্ষা করুন অথবা নগদের ১৬১৬৭ নম্বরে যোগাযোগ করুন।',
    officialSourceTitle: 'নগদ বিল পে নির্দেশিকা',
    officialSourceUrl: 'https://nagad.com.bd',
  },
  {
    methodId: 'rocket',
    titleBn: 'রকেট (Rocket / DBBL) ও ব্যাংক অ্যাপ',
    iconName: 'Building',
    stepsBn: [
      'রকেট অ্যাপ বা ডাচ বাংলা নেক্সাসপে অ্যাপে প্রবেশ করে Utility Bill নির্বাচন করুন।',
      'সংশ্লিষ্ট ডেসকো/ডিপিডিসি/পল্লী বিদ্যুৎ বিলার কোড নির্বাচন করে মিটার নম্বর প্রদান করুন।',
      'রিচার্জ নিশ্চিত করে ২০ ডিজিটের টোকেন সংগ্রহ করে মিটারে ইনপুট দিন।',
    ],
    confirmationCheck: 'টোকেন এন্ট্রি সফল হলে অবশিষ্ট ব্যালেন্স বৃদ্ধি পাবে।',
    tokenInstruction: 'রকেট ট্রানজেকশন আইডির সাথে এসএমএসে টোকেন পাঠানো হয়।',
    troubleshootingNote: 'ব্যাংক পেমেন্টে কোনো বিলম্ব হলে ট্রানজেকশন আইডি সংরক্ষণ করুন।',
    officialSourceTitle: 'ডাচ বাংলা ব্যাংক ইউটিলিটি পোর্টাল',
    officialSourceUrl: 'https://www.dutchbanglabank.com',
  },
  {
    methodId: 'vending',
    titleBn: 'অনুমোদিত ভেন্ডিং স্টেশন বা ব্যাংক কাউন্টার',
    iconName: 'Store',
    stepsBn: [
      'আপনার এলাকার নির্ধারিত ব্যাংক শাখা, বিদ্যুৎ অফিস ভেন্ডিং বুথ বা অনুমোদিত এজেন্ট পয়েন্টে যান।',
      'মিটার নম্বর বা গ্রাহক কার্ড উপস্থাপন করুন।',
      'টাকা জমা দিয়ে ভেন্ডিং স্লিপ (প্রিন্ট করা কাগজ) সংগ্রহ করুন।',
      'স্লিপে থাকা ২০ ডিজিটের টোকেন নম্বরটি মিটারে প্রবেশ করান।',
    ],
    confirmationCheck: 'স্লিপে গ্রাহকের নাম, মিটার নম্বর ও ভেন্ডিং টোকেন প্রিন্ট করা থাকে।',
    tokenInstruction: 'স্লিপটি ভবিষ্যতে প্রমাণ হিসেবে যত্ন করে রেখে দিন।',
    troubleshootingNote: 'কার্ড মিটারের ক্ষেত্রে কার্ডটি সোয়াইপ বা পাঞ্চ করুন।',
    officialSourceTitle: 'বিপিডিবি ও ডেসকো ভেন্ডিং কাউন্টার তালিকা',
    officialSourceUrl: 'https://prepaid.desco.org.bd',
  },
];

// 8. Official Manuals and Source Directory (Verified URLs)
export const OFFICIAL_SOURCES_DATA: OfficialSourceItem[] = [
  {
    id: 'src-bpdb-prepaid',
    utility: 'bpdb',
    sourceTitle: 'BPDB Official Pre-Payment Metering System Manual',
    sourceUrl: 'https://bpdb.gov.bd/site/page/7918c503-4c2b-43ec-96e9-cda71fbaf6b3/-Pre-Payment-Metering-System',
    applicableMeterModels: 'Hexing, Inhemeter, Wasion Single & Three Phase',
    documentType: 'manual',
    lastCheckedAt: '২০২৪-০৯-০১',
    status: 'verified',
    descriptionBn: 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ডের প্রিপেইড মিটার পরিচালনা, শর্ট কোড ও রিচার্জের পূর্ণাঙ্গ নির্দেশিকা।',
  },
  {
    id: 'src-dpdc-instructions',
    utility: 'dpdc',
    sourceTitle: 'DPDC Prepaid Meter Instructions & Guidelines',
    sourceUrl: 'https://dpdc.gov.bd/pages/static-pages/6922dff6933eb65569e24d7c',
    applicableMeterModels: 'Hexing HXE12, Inhemeter, BSECO',
    documentType: 'instructions',
    lastCheckedAt: '২০২৪-০৯-০৫',
    status: 'verified',
    descriptionBn: 'ডিপিডিসি গ্রাহকদের জন্য প্রিপেইড মিটার ব্যবহার, জরুরি ব্যালেন্স ও নিরাপত্তা নিয়মাবলি।',
  },
  {
    id: 'src-dpdc-info',
    utility: 'dpdc',
    sourceTitle: 'DPDC Prepaid Meter Information & FAQ',
    sourceUrl: 'https://dpdc.gov.bd/pages/static-pages/6922e0f9933eb65569e29608',
    applicableMeterModels: 'সকল ডিপিডিসি স্মার্ট কিপ্যাড মিটার',
    documentType: 'portal',
    lastCheckedAt: '২০২৪-০৯-০৫',
    status: 'verified',
    descriptionBn: 'ডিপিডিসি প্রিপেইড গ্রাহক সেবা, সাধারণ সমস্যা ও রিচার্জ নিয়ম।',
  },
  {
    id: 'src-desco-manual',
    utility: 'desco',
    sourceTitle: 'DESCO Prepaid Meter User Manual',
    sourceUrl: 'https://prepaid.desco.org.bd/prepaid-manual.html',
    applicableMeterModels: 'Hexing, Inhemeter, Linyang',
    documentType: 'manual',
    lastCheckedAt: '২০২৪-০৮-২০',
    status: 'verified',
    descriptionBn: 'ডেসকো প্রিপেইড মিটার স্থাপন, কার্যপদ্ধতি ও ডিজিটাল ডিসপ্লে ব্যবহারের সচিত্র ম্যানুয়াল।',
  },
  {
    id: 'src-desco-shortcodes',
    utility: 'desco',
    sourceTitle: 'DESCO Button Meter Short Codes Directory',
    sourceUrl: 'https://prepaid.desco.org.bd/prepaid_meter_short_codes.html',
    applicableMeterModels: 'Hexing, Linyang, Sanxing',
    documentType: 'short-codes',
    lastCheckedAt: '২০২৪-০৮-২০',
    status: 'verified',
    descriptionBn: 'ডেসকোর কিপ্যাড মিটারের ব্যালেন্স, ভোল্টেজ, কারেন্ট ও টোকেন সংক্রান্ত অফিসিয়াল শর্ট কোড চার্ট।',
  },
  {
    id: 'src-wzpdcl-manuals',
    utility: 'wzpdcl',
    sourceTitle: 'WZPDCL Prepaid Meter Manuals & Guides',
    sourceUrl: 'https://wzpdcl.org.bd/pages/files/6922d9de933eb65569e00b1a',
    applicableMeterModels: 'Inhemeter, Hexing, Wasion',
    documentType: 'manual',
    lastCheckedAt: '২০২৪-০৮-১৫',
    status: 'verified',
    descriptionBn: 'ওয়েস্ট জোন পাওয়ার ডিস্ট্রিবিউশন কোম্পানির প্রিপেইড মিটার গ্রাহক সহায়িকা ও ফাইল নির্দেশিকা।',
  },
  {
    id: 'src-nesco-portal',
    utility: 'nesco',
    sourceTitle: 'NESCO Official Pre-Payment Portal',
    sourceUrl: 'https://nesco.gov.bd/',
    applicableMeterModels: 'NESCO Hexing & Wasion Meters',
    documentType: 'portal',
    lastCheckedAt: '২০২৪-০৮-০১',
    status: 'verified',
    descriptionBn: 'নেসকোর রাজশাহী ও রংপুর অঞ্চলের স্মার্ট প্রিপেইড মিটারিং সংক্রান্ত তথ্য।',
  },
  {
    id: 'src-breb-portal',
    utility: 'breb',
    sourceTitle: 'Bangladesh Rural Electrification Board (BREB) Portal',
    sourceUrl: 'https://reb.gov.bd',
    applicableMeterModels: 'পল্লী বিদ্যুৎ প্রিপেইড ও স্মার্ট মিটার',
    documentType: 'portal',
    lastCheckedAt: '২০২৪-০৮-১০',
    status: 'verified',
    descriptionBn: 'পল্লী বিদ্যুতায়ন বোর্ডের আওতাধীন ৮০টি পল্লী বিদ্যুৎ সমিতির প্রিপেইড সেবা নির্দেশিকা।',
  },
];
