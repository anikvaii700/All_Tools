// Comprehensive Knowledge Base for Bangladesh Election Commission (NID Corrections & Services)
import { NidCorrectionRule, NidCorrectionTypeId } from '../types';

export const ELECTION_COMMISSION_METADATA = {
  officeNameBn: 'বাংলাদেশ নির্বাচন কমিশন',
  subBranch: 'জাতীয় পরিচয় নিবন্ধন অনুবিভাগ (NID Wing)',
  portalUrl: 'https://services.nidw.gov.bd',
  helpline: '১০৫',
  smsService: 'NID <space> FormNumber <space> DD-MM-YYYY লিখে ১০৫ এ পাঠান',
  lastGazetteNotice: 'নির্বাচন কমিশন সচিবালয় বিধিমালা ও পরিপত্র ২০২৪-২০২৫',
  disclaimer:
    'এই সহায়কে প্রদর্শিত সকল ফি, প্রয়োজনীয় ডকুমেন্ট ও নিয়মাবলী বাংলাদেশ নির্বাচন কমিশনের সর্বশেষ গেজেট ও পরিপত্র অনুযায়ী প্রণীত। আপনার মামলার বিশেষ প্রেক্ষাপটে সংশ্লিষ্ট নির্বাচন কর্মকর্তা অতিরিক্ত কোনো প্রাসঙ্গিক দলিলের সত্যায়িত কপি চাইতে পারেন।',
};

// General fee matrix for NID corrections based on Election Commission rules
// ব্যক্তিগত তথ্য সংশোধন (ক্যাটাগরি-১): ১ম বার ২০০+ভ্যাট=২৩০, ২য় বার ৩০০+ভ্যাট=৩৪৫, ৩য় বার ৫০০+ভ্যাট=৫৭৫
// অন্যান্য তথ্য সংশোধন (ক্যাটাগরি-২): ১ম বার ১০০+ভ্যাট=১১৫, ২য় বার ২০০+ভ্যাট=২৩০, ৩য় বার ৩০০+ভ্যাট=৩৪৫
// উভয় তথ্য (ব্যক্তিগত + অন্যান্য): ১ম বার ৩০০+ভ্যাট=৩৪৫, ২য় বার ৫০০+ভ্যাট=৫৭৫, ৩য় বার ৭০০+ভ্যাট=৮০৫
export const STANDARD_FEE_TIERS = {
  personalInfo: [
    {
      times: '১ম বার আবেদন',
      baseFee: 200,
      vatPercent: 15,
      vatAmount: 30,
      totalFee: 230,
      urgentBaseFee: 400,
      urgentVatAmount: 60,
      urgentTotalFee: 460,
    },
    {
      times: '২য় বার আবেদন',
      baseFee: 300,
      vatPercent: 15,
      vatAmount: 45,
      totalFee: 345,
      urgentBaseFee: 600,
      urgentVatAmount: 90,
      urgentTotalFee: 690,
    },
    {
      times: '৩য় ও পরবর্তী বার',
      baseFee: 500,
      vatPercent: 15,
      vatAmount: 75,
      totalFee: 575,
      urgentBaseFee: 1000,
      urgentVatAmount: 150,
      urgentTotalFee: 1150,
    },
  ],
  otherInfo: [
    {
      times: '১ম বার আবেদন',
      baseFee: 100,
      vatPercent: 15,
      vatAmount: 15,
      totalFee: 115,
      urgentBaseFee: 200,
      urgentVatAmount: 30,
      urgentTotalFee: 230,
    },
    {
      times: '২য় বার আবেদন',
      baseFee: 200,
      vatPercent: 15,
      vatAmount: 30,
      totalFee: 230,
      urgentBaseFee: 400,
      urgentVatAmount: 60,
      urgentTotalFee: 460,
    },
    {
      times: '৩য় ও পরবর্তী বার',
      baseFee: 300,
      vatPercent: 15,
      vatAmount: 45,
      totalFee: 345,
      urgentBaseFee: 600,
      urgentVatAmount: 90,
      urgentTotalFee: 690,
    },
  ],
  bothInfo: [
    {
      times: '১ম বার আবেদন',
      baseFee: 300,
      vatPercent: 15,
      vatAmount: 45,
      totalFee: 345,
      urgentBaseFee: 600,
      urgentVatAmount: 90,
      urgentTotalFee: 690,
    },
    {
      times: '২য় বার আবেদন',
      baseFee: 500,
      vatPercent: 15,
      vatAmount: 75,
      totalFee: 575,
      urgentBaseFee: 1000,
      urgentVatAmount: 150,
      urgentTotalFee: 1150,
    },
    {
      times: '৩য় ও পরবর্তী বার',
      baseFee: 700,
      vatPercent: 15,
      vatAmount: 105,
      totalFee: 805,
      urgentBaseFee: 1400,
      urgentVatAmount: 210,
      urgentTotalFee: 1610,
    },
  ],
};

export const NID_CORRECTION_RULES: Record<NidCorrectionTypeId, NidCorrectionRule> = {
  self_name_correction: {
    id: 'self_name_correction',
    numericId: 1,
    titleBn: 'নিজের নাম সংশোধন (সাধারণ বানান ও উচ্চারণগত)',
    subtitleBn: 'বাংলা বা ইংরেজি নামের বর্ণগত ভুল সংশোধন',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি)',
    averageWorkingDays: '৭ থেকে ১৫ কার্যদিবস',
    keywords: ['নাম', 'বানান', 'spelling', 'ইংরেজি নাম', 'name correction', 'নাম সংশোধন', 'অক্ষর'],
    description:
      'জাতীয় পরিচয়পত্রে নিজের নামের বানান ভুল, অক্ষরের অদলবদল বা বাংলা ও ইংরেজি রূপান্তরের অসঙ্গতি সংশোধনের জন্য প্রযোজ্য। এটি মূলত "ক" ক্যাটাগরির সাধারণ আবেদন।',
    mandatoryDocs: [
      {
        id: 'ssc_or_academic',
        title: 'এসএসসি / সমমানের শিক্ষাগত সনদ বা প্রাথমিক শিক্ষা সমাপনী সনদ',
        description:
          'অনলাইন ভেরিফায়েড বোর্ড সনদ অথবা বোর্ড প্রদত্ত মূল সনদের স্পষ্ট স্ক্যান কপি। (শিক্ষিত নাগরিকদের জন্য বাধ্যতামূলক)',
        type: 'mandatory',
      },
      {
        id: 'online_birth_cert',
        title: 'অনলাইন ডিজিটাল ১৭ ডিজিটের জন্ম নিবন্ধন সনদ',
        description: 'BDRIS সিস্টেমে নিবন্ধিত এবং অনলাইনে ইংরেজিসহ যাচাইযোগ্য জন্ম সনদ।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'valid_passport',
        title: 'বৈধ পাসপোর্ট (যদি থাকে)',
        description: 'পাসপোর্টের তথ্য পৃষ্ঠার স্ক্যান কপি যাতে সঠিক নাম দৃশ্যমান থাকে।',
        type: 'supporting',
      },
      {
        id: 'service_book',
        title: 'চাকরির সার্ভিস বুক বা পিআরএল আদেশ (চাকরিজীবীদের ক্ষেত্রে)',
        description: 'নিয়োগকারী কর্তৃপক্ষ কর্তৃক সত্যায়িত কপি।',
        type: 'supporting',
      },
      {
        id: 'driving_license',
        title: 'ড্রাইভিং লাইসেন্স বা ব্যাংক হিসাব বিবরণী',
        description: 'সহায়ক পরিচয়পত্র হিসেবে উপস্থাপনের জন্য।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [
      {
        id: 'first_class_magistrate_affidavit',
        title: '১ম শ্রেণীর ম্যাজিস্ট্রেট কোর্ট বা নোটারি পাবলিক এফিডেভিট',
        description: 'যদি শিক্ষাগত সনদ না থাকে এবং নামের উল্লেখযোগ্য রূপান্তর ঘটে থাকে।',
        type: 'conditional',
        conditionNote: 'অশিক্ষিত বা সনদহীন ব্যক্তিদের ক্ষেত্রে আবশ্যক।',
      },
      {
        id: 'nikahnama_or_gazette',
        title: 'সরকারি গেজেট বিজ্ঞপ্তি বা জাতীয় পত্রিকায় বিজ্ঞপ্তি',
        description: 'নাম রূপান্তরের সমর্থনে প্রকাশিত গণবিজ্ঞপ্তির কাটিং।',
        type: 'conditional',
        conditionNote: 'উল্লেখযোগ্য পরিবর্তনের ক্ষেত্রে প্রযোজ্য।',
      },
    ],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ (bKash)', 'রকেট (Rocket)', 'নগদ (Nagad)', 'ওকে ওয়ালেট (OK Wallet)'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'NID পোর্টালে লগইন ও ফেস ভেরিফিকেশন',
        instruction:
          'services.nidw.gov.bd পোর্টালে যান। এনআইডি নম্বর ও জন্মতারিখ দিয়ে লগইন করুন এবং মোবাইলে "NID Wallet" অ্যাপের মাধ্যমে ফেস স্ক্যান সম্পন্ন করুন।',
        portalAction: 'লগইন ও প্রোফাইল ওপেন',
      },
      {
        stepNumber: 2,
        title: 'প্রোফাইল থেকে "এডিট" মোড চালু ও ফি জমা',
        instruction:
          'প্রোফাইলের ওপরের ডানপাশে "এডিট" বাটনে ক্লিক করুন। ব্যক্তিগত তথ্য সেকশনে নাম সংশোধন করতে নির্ধারিত ফি (২৩০ টাকা) বিকাশ/রকেটের মাধ্যমে "NID Service Fee" কোডে পরিশোধ করুন।',
        portalAction: 'ফি পরিশোধ নিশ্চিতকরণ',
      },
      {
        stepNumber: 3,
        title: 'সংশোধিত নাম টাইপ করুন',
        instruction:
          'বাংলা ও ইংরেজি ঘরে শিক্ষাগত সনদ অথবা জন্ম সনদের হুবহু বানান টাইপ করুন। কোনো অতিরিক্ত উপাধি যোগ করবেন না।',
        portalAction: 'তথ্য এন্ট্রি',
      },
      {
        stepNumber: 4,
        title: 'প্রয়োজনীয় কাগজপত্র আপলোড',
        instruction:
          'এসএসসি সনদ ও অনলাইন জন্ম সনদের পরিষ্কার স্ক্যান কপি (PDF/JPG, সর্বোচ্চ 1MB) সংযুক্তি অপশনে আপলোড করুন।',
        portalAction: 'ডকুমেন্ট আপলোড',
      },
      {
        stepNumber: 5,
        title: 'আবেদন রিভিউ ও সাবমিট',
        instruction:
          'সকল তথ্য মিলিয়ে চূড়ান্ত সাবমিট করুন। আবেদনপত্র (Form-2 সংশোধিত কপি) ডাউনলোড করে প্রিন্ট নিয়ে সংরক্ষণ করুন।',
        portalAction: 'চূড়ান্ত সাবমিশন',
      },
    ],
    statutoryWarnings: [
      'মিথ্যা তথ্য বা জাল সনদ দিলে জাতীয় পরিচয় নিবন্ধন আইন ২০১০ অনুযায়ী ৩ বছরের কারাদণ্ড বা অনধিক ২০,০০০ টাকা অর্থদণ্ড হতে পারে।',
      'এসএসসি বা বোর্ড সনদে থাকা নাম অপরিবর্তিত রেখে এনআইডিতে ভিন্ন নাম লেখার আবেদন বাতিলযোগ্য।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন প্রজ্ঞাপন নং-১৮/২০১৫ ও কার্যপরিধি বিধিমালা ২০২৪',
      circularNo: 'ECS/NID/CR-2024/09',
      lastVerifiedDate: '১৫ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  name_partial_change: {
    id: 'name_partial_change',
    numericId: 2,
    titleBn: 'নামের আংশিক পরিবর্তন (যুক্তবর্ণ, পদবী বা উপাধি যোগ/বিয়োগ)',
    subtitleBn: 'যেমন: "মোসাঃ" থেকে "মোসাম্মৎ", "আক্তার" বাদ বা যোগ করা',
    categoryCode: 'খ',
    authority: 'জেলা নির্বাচন অফিসার ("খ" ক্যাটাগরি)',
    averageWorkingDays: '১৫ থেকে ৩০ কার্যদিবস',
    keywords: ['আংশিক', 'পদবী', 'উপাধি', 'আক্তার', 'বেগম', 'মোসাঃ', 'মোসাম্মৎ', 'চৌধুরী', 'খান'],
    description:
      'নামের মূল অংশ অপরিবর্তিত রেখে নামের আগে বা পরে কোনো পদবী, উপাধি বা ডাকনাম সংযোজন অথবা বিয়োজনের ক্ষেত্রে প্রযোজ্য।',
    mandatoryDocs: [
      {
        id: 'ssc_or_highest_academic',
        title: 'এসএসসি / এইচএসসি বা সর্বোচ্চ শিক্ষাগত যোগ্যতার মূল সনদ',
        description: 'যেখানে আপনার কাঙ্ক্ষিত আংশিক পদবী বা উপাধিসহ পুরো নাম প্রদর্শিত আছে।',
        type: 'mandatory',
      },
      {
        id: 'magistrate_affidavit_partial',
        title: '১ম শ্রেণীর ম্যাজিস্ট্রেট কোর্ট কর্তৃক প্রদত্ত হলফনামা (Affidavit)',
        description:
          'যেখানে ঘোষণা থাকবে যে উভয় ব্যক্তি একই সত্তা এবং পদবী সংযোজন/বিয়োজনের যৌক্তিক কারণ উল্লেখ থাকবে।',
        type: 'mandatory',
      },
      {
        id: 'online_birth_cert',
        title: '১৭ ডিজিটের অনলাইন জন্ম নিবন্ধন সনদ',
        description: 'অনলাইনে তথ্য হালনাগাদ করা সনদপত্র।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'parents_nid',
        title: 'পিতা ও মাতার জাতীয় পরিচয়পত্রের ফটোকপি',
        description: 'পারিবারিক পদবী প্রমাণের জন্য (প্রযোজ্য ক্ষেত্রে)।',
        type: 'supporting',
      },
      {
        id: 'newspaper_publication',
        title: 'বহুল প্রচারিত জাতীয় দৈনিকে প্রকাশিত বিজ্ঞপ্তির মূল কপি',
        description: 'নামের পদবী সংশোধন সংক্রান্ত গণবিজ্ঞপ্তি।',
        type: 'supporting',
      },
      {
        id: 'bank_statement_or_tin',
        title: 'ব্যাংক হিসাব বিবরণী বা ই-টিন সার্টিফিকেট',
        description: 'নামের ধারাবাহিক ব্যবহারের প্রমাণ হিসেবে।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [
      {
        id: 'marriage_cert_for_female',
        title: 'বিবাহিত নারীদের ক্ষেত্রে নিকাহনামা বা বিবাহ সনদ',
        description: 'স্বামীর পদবী বা নিজের পদবী পুনর্বিন্যাসের ক্ষেত্রে।',
        type: 'conditional',
        conditionNote: 'মহিলাদের ক্ষেত্রে পদবী পরিবর্তনের সময় প্রযোজ্য।',
      },
    ],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'কোর্ট এফিডেভিট ও বিজ্ঞপ্তি সম্পন্ন করুন',
        instruction:
          'অনলাইনে আবেদনের পূর্বেই ১ম শ্রেণীর ম্যাজিস্ট্রেট কোর্ট থেকে হলফনামা এবং জাতীয় দৈনিকে নাম সংশোধন সংক্রান্ত বিজ্ঞাপন প্রকাশ করিয়ে পেপার কাটিং সংগ্রহে রাখুন।',
        portalAction: 'পূর্ব প্রস্তুতি',
      },
      {
        stepNumber: 2,
        title: 'nidw পোর্টালে লগইন ও আবেদন পূরণ',
        instruction:
          'services.nidw.gov.bd-তে লগইন করে প্রোফাইলের নাম ফিল্ডে নতুন পদবীসহ কাঙ্ক্ষিত রূপ লিখুন।',
        portalAction: 'তথ্য এন্ট্রি',
      },
      {
        stepNumber: 3,
        title: 'ফি প্রদান ও সকল প্রমাণপত্র আপলোড',
        instruction:
          'বিকাশ বা রকেটে ফি পরিশোধ করে এফিডেভিট, শিক্ষাগত সনদ এবং পেপার কাটিং স্পষ্ট স্ক্যান করে আপলোড করুন।',
        portalAction: 'আপলোড ও সাবমিশন',
      },
      {
        stepNumber: 4,
        title: 'জেলা নির্বাচন অফিসে শুনানিতে অংশগ্রহণ (যদি আহ্বান করা হয়)',
        instruction:
          'আবেদন "খ" ক্যাটাগরির অন্তর্ভুক্ত হওয়ায় জেলা নির্বাচন কর্মকর্তা মূল কাগজপত্রসহ সশরীরে শুনানির জন্য ডাকতে পারেন। এসএমএস লক্ষ্য রাখুন।',
        portalAction: 'শুনানি ও ভেরিফিকেশন',
      },
    ],
    statutoryWarnings: [
      'পারিবারিক সম্পত্তি বা ওয়ারিশান সংক্রান্ত জটিলতা এড়াতে পিতার জাতীয় পরিচয়পত্রের সাথে নামের পদবীর সামঞ্জস্য থাকা বাঞ্ছনীয়।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন সার্কুলার পরিপত্র নং-১৫/২০২২ (খ ক্যাটাগরি অনুমোদন)',
      circularNo: 'ECS/NID/REG-B/114',
      lastVerifiedDate: '১০ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  name_full_change: {
    id: 'name_full_change',
    numericId: 3,
    titleBn: 'সম্পূর্ণ নাম পরিবর্তন (বিশেষ ক্ষেত্র)',
    subtitleBn: 'যেমন: "আব্দুল করিম" থেকে সম্পূর্ণ ভিন্ন "মোহাম্মদ ফারহান চৌধুরী"',
    categoryCode: 'গ',
    authority: 'আঞ্চলিক নির্বাচন কর্মকর্তা ("গ" ক্যাটাগরি)',
    averageWorkingDays: '৩০ থেকে ৬০ কার্যদিবস',
    keywords: ['সম্পূর্ণ নাম পরিবর্তন', 'পুরো নাম পরিবর্তন', 'নতুন নাম', 'name change', 'আমূল পরিবর্তন'],
    description:
      'পূর্বের নামের সাথে কোনো মিল না রেখে সম্পূর্ণ নতুন নামে এনআইডি পরিবর্তনের আবেদন। এটি কঠোর তদন্ত সাপেক্ষে "গ" ক্যাটাগরির মাধ্যমে নিষ্পত্তি হয়।',
    mandatoryDocs: [
      {
        id: 'first_class_magistrate_deed',
        title: '১ম শ্রেণীর ম্যাজিস্ট্রেট কোর্ট কর্তৃক সম্পাদিত সুস্পষ্ট হলফনামা (Affidavit)',
        description: 'পূর্বের পরিচয় ও বর্তমান পরিচয়ের সম্পূর্ণ প্রেক্ষাপট ও কারণ লিপিবদ্ধ থাকতে হবে।',
        type: 'mandatory',
      },
      {
        id: 'national_dailies_2_notice',
        title: '২টি বহুল প্রচারিত জাতীয় দৈনিক পত্রিকায় (একটি বাংলা, একটি ইংরেজি) প্রকাশিত বিজ্ঞপ্তি',
        description: 'পত্রিকার পুরো পাতার মূল কপি বা স্পষ্ট কাটিং যেখানে প্রকাশের তারিখ ও পৃষ্ঠা সুস্পষ্ট।',
        type: 'mandatory',
      },
      {
        id: 'bangladesh_gazette',
        title: 'বাংলাদেশ সরকারি গেজেট (BG Press) প্রকাশনার কপি',
        description: 'নাম পরিবর্তন সম্পর্কিত সরকারি গেজেট প্রজ্ঞাপন।',
        type: 'mandatory',
      },
      {
        id: 'board_sanad_all',
        title: 'বোর্ড থেকে সংশোধিত শিক্ষাগত সনদ (যদি প্রযোজ্য হয়)',
        description: 'যেখানে শিক্ষা বোর্ড কর্তৃক নতুন নামটি অনুমোদন করা হয়েছে।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'police_clearance',
        title: 'পুলিশ ক্লিয়ারেন্স সার্টিফিকেট (Police Clearance)',
        description: 'আবেদনকারীর বিরুদ্ধে পূর্বের পরিচয়ে কোনো ফৌজদারি মামলা বা দণ্ড নেই মর্মে রিপোর্ট।',
        type: 'supporting',
      },
      {
        id: 'up_or_ward_certificate',
        title: 'ইউনিয়ন পরিষদ চেয়ারম্যান / ওয়ার্ড কাউন্সিলর কর্তৃক প্রত্যয়নপত্র',
        description: 'ছবি সত্যায়িত সম্বলিত বিশেষ পরিচিতি প্রত্যয়ন।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [
      {
        id: 'religious_conversion_cert',
        title: 'ধর্ম পরিবর্তনের ক্ষেত্রে সংশ্লিষ্ট ধর্মীয় প্রতিষ্ঠানের সনদ ও হলফনামা',
        description: 'যদি ধর্ম পরিবর্তনের কারণে নাম পরিবর্তন ঘটে থাকে।',
        type: 'conditional',
        conditionNote: 'কেবলমাত্র ধর্ম পরিবর্তনের কারণে নাম পরিবর্তনের ক্ষেত্রে আবশ্যক।',
      },
    ],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'কোর্ট এফিডেভিট ও সরকারি গেজেট সম্পাদন',
        instruction:
          'ম্যাজিস্ট্রেট কোর্টে হলফনামা তৈরি করে দুটি জাতীয় দৈনিকে বিজ্ঞাপন দিন। এরপর বাংলাদেশ গভর্নমেন্ট প্রেস (BG Press) থেকে সরকারি গেজেট প্রকাশ করান।',
        portalAction: 'আইনি প্রক্রিয়া সম্পন্নকরণ',
      },
      {
        stepNumber: 2,
        title: 'অনলাইন আবেদন সাবমিট',
        instruction:
          'services.nidw.gov.bd-তে নতুন নামটি টাইপ করে এফিডেভিট, গেজেট ও পুলিশ ক্লিয়ারেন্সের স্পষ্ট পিডিএফ আপলোড করুন।',
        portalAction: 'অনলাইন সাবমিশন',
      },
      {
        stepNumber: 3,
        title: 'আঞ্চলিক নির্বাচন কর্মকর্তার নিকট সশরীরে শুনানি',
        instruction:
          'আবেদনটি আঞ্চলিক নির্বাচন কর্মকর্তা ("গ" ক্যাটাগরি) যাচাই করবেন। তদন্ত সাপেক্ষে আপনাকে সাক্ষ্য ও মূল দলিলসহ শুনানিতে উপস্থিত হতে হবে।',
        portalAction: 'সশরীরে শুনানি',
      },
    ],
    statutoryWarnings: [
      'কোনো অপরাধমূলক কর্মকাণ্ড, ঋণখেলাপ বা আদালতের পরোয়ানা এড়াতে সম্পূর্ণ নাম পরিবর্তন করা একটি ফৌজদারি অপরাধ। এ ধরনের চেষ্টা ধরা পড়লে আইনি ব্যবস্থা নেওয়া হবে।',
    ],
    sourceReference: {
      citation: 'বাংলাদেশ নির্বাচন কমিশন প্রজ্ঞাপন নং-৯৪/২০২৩ (গ ও ঘ ক্যাটাগরি বিধিমালা)',
      circularNo: 'ECS/NID/CAT-C/2023-88',
      lastVerifiedDate: '০৫ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  parents_name_correction: {
    id: 'parents_name_correction',
    numericId: 4,
    titleBn: 'পিতা বা মাতার নাম সংশোধন',
    subtitleBn: 'বাবার বা মায়ের নামের বানান ভুল, পরিবর্তন বা সংযোজন',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি)',
    averageWorkingDays: '৭ থেকে ২০ কার্যদিবস',
    keywords: ['পিতার নাম', 'মাতার নাম', 'বাবার নাম', 'মায়ের নাম', 'father name', 'mother name', 'পিতা মাতা'],
    description:
      'আপনার জাতীয় পরিচয়পত্রে পিতা বা মাতার নামের বানান ভুল অথবা বাদ পড়া অংশ সংশোধনের প্রক্রিয়া।',
    mandatoryDocs: [
      {
        id: 'parents_actual_nid',
        title: 'পিতা ও মাতার মূল জাতীয় পরিচয়পত্রের ফটোকপি / অনলাইন কপি',
        description:
          'পিতা/মাতার এনআইডিতে যে নাম আছে, আপনার এনআইডিতে পিতার নামের ঘরে হুবহু সেটাই বসবে।',
        type: 'mandatory',
      },
      {
        id: 'applicant_academic_or_birth',
        title: 'আবেদনকারীর এসএসসি সনদ অথবা অনলাইন জন্ম নিবন্ধন সনদ',
        description: 'যেখানে পিতা/মাতার নাম সঠিকভাবে মুদ্রিত রয়েছে।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'parents_death_cert',
        title: 'পিতা বা মাতা মৃত হলে ডিজিটাল মৃত্যু সনদ',
        description: 'যদি পিতা বা মাতা পূর্বে ইন্তেকাল করে থাকেন এবং এনআইডি না থাকে।',
        type: 'supporting',
      },
      {
        id: 'siblings_nid',
        title: 'অন্যান্য ভাই-বোনের জাতীয় পরিচয়পত্র',
        description: 'পারিবারিক ধারাবাহিকতা নিশ্চিতকরণের উদ্দেশ্যে।',
        type: 'supporting',
      },
      {
        id: 'parents_passport_or_pension',
        title: 'পিতা/মাতার পাসপোর্ট, পেনশন বই বা সার্ভিস বুক',
        description: 'সরকারি কর্মকর্তা বা প্রবাসীদের ক্ষেত্রে।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [
      {
        id: 'parents_first_class_magistrate',
        title: 'পিতা/মাতা বেঁচে না থাকলে ও কোনো সনদ না থাকলে ওয়ারিশান সনদ ও কোর্ট এফিডেভিট',
        description: 'ইউপি চেয়ারম্যান/কাউন্সিলর কর্তৃক প্রদত্ত ওয়ারিশান সনদ।',
        type: 'conditional',
        conditionNote: 'পিতা/মাতার এনআইডি না থাকলে আবশ্যক।',
      },
    ],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'পিতা/মাতার NID নম্বর সংগ্রহ ও যাচাই',
        instruction:
          'পিতা বা মাতার জাতীয় পরিচয়পত্রে যেভাবে নাম লেখা আছে (স্পেস ও বানান সহ), আবেদন করার সময় ঠিক সেভাবেই লিখতে হবে।',
        portalAction: 'তথ্য যাচাই',
      },
      {
        stepNumber: 2,
        title: 'পোর্টালে পিতা/মাতার ঘরে তথ্য সংশোধন',
        instruction:
          'services.nidw.gov.bd-তে ব্যক্তিগত তথ্য ট্যাবে পিতা অথবা মাতার নামের ফিল্ডে সঠিক নাম টাইপ করুন।',
        portalAction: 'তথ্য এন্ট্রি',
      },
      {
        stepNumber: 3,
        title: 'ডকুমেন্ট আপলোড ও ফি জমা',
        instruction:
          'পিতা/মাতার এনআইডির স্পষ্ট কপি এবং আপনার এসএসসি সনদ বা জন্ম সনদ আপলোড করে ফি পরিশোধ করুন।',
        portalAction: 'ডকুমেন্ট ও ফি',
      },
    ],
    statutoryWarnings: [
      'পিতা/মাতা জীবিত থাকা অবস্থায় তাদের এনআইডি কার্ডের নামের সাথে আবেদনকারীর ফর্মে পিতার নামের অসঙ্গতি থাকলে আবেদন নামঞ্জুর হবে। আগে পিতা/মাতার নিজের এনআইডি সংশোধন করিয়ে নেওয়া উত্তম।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন নির্দেশিকা নং-০২/২০২২ (পিতা-মাতার তথ্য সংশোধন)',
      circularNo: 'ECS/NID/PAR-02/22',
      lastVerifiedDate: '১২ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  spouse_name_correction: {
    id: 'spouse_name_correction',
    numericId: 5,
    titleBn: 'স্বামী বা স্ত্রীর নাম সংশোধন / সংযোজন / বিয়োজন',
    subtitleBn: 'বিবাহ, তালাক বা তথ্য সংশোধনের কারণে নাম সংযোজন বা পরিবর্তন',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি)',
    averageWorkingDays: '৫ থেকে ১২ কার্যদিবস',
    keywords: ['স্বামী', 'স্ত্রী', 'husband', 'wife', 'বিবাহ', 'তালাক', 'নিকাহনামা', 'spouse', 'বউ'],
    description:
      'বিয়ের পর স্বামীর নাম যুক্ত করা, তালাক বা বিচ্ছেদের পর স্বামীর নাম কর্তন করা, কিংবা স্বামী/স্ত্রীর নামের ভুল বানান সংশোধনের জন্য।',
    mandatoryDocs: [
      {
        id: 'nikahnama_or_marriage_cert',
        title: 'মুসলিমদের ক্ষেত্রে নিকাহনামা ও কাজী অফিস কর্তৃক রেজিষ্ট্রেশন সনদ / কাবিননামা',
        description: 'অন্যান্য ধর্মের ক্ষেত্রে আদালতের ম্যারেজ সার্টিফিকেট বা পুরোহিত/যাজকের সনদ।',
        type: 'mandatory',
      },
      {
        id: 'spouse_nid',
        title: 'স্বামী বা স্ত্রীর জাতীয় পরিচয়পত্রের ফটোকপি / অনলাইন কপি',
        description: 'স্বামী/স্ত্রীর এনআইডি কার্ডের স্পষ্ট কপি।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'divorce_deed_or_talaqnama',
        title: 'তালাক বা বিচ্ছেদের ক্ষেত্রে তালাকনামা / ডিভোর্স পেপার (যদি বিয়োজন হয়)',
        description: 'সিটি কর্পোরেশন/ইউপি চেয়ারম্যান কর্তৃক ইস্যুকৃত ৯০ দিনের কার্যকারিতা প্রত্যয়নপত্র।',
        type: 'supporting',
      },
      {
        id: 'spouse_death_cert',
        title: 'স্বামী/স্ত্রী মৃত হলে সরকারি মৃত্যু সনদ',
        description: 'যদি বিধবা বা বিপত্নীক হিসেবে তথ্য হালনাগাদ করা হয়।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [
      {
        id: 'special_marriage_act',
        title: 'স্পেশাল ম্যারেজ অ্যাক্ট রেজিস্ট্রি সার্টিফিকেট',
        description: 'বিশেষ বা ভিন্ন ধর্মীয় বিবাহের ক্ষেত্রে।',
        type: 'conditional',
        conditionNote: 'আন্তঃধর্মীয় বিবাহের ক্ষেত্রে প্রযোজ্য।',
      },
    ],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'নিকাহনামা ও স্বামী/স্ত্রীর এনআইডি প্রস্তুত রাখুন',
        instruction:
          'কাবিননামার সরকারি ভলিউম নম্বর ও কাজীর সিলমোহরযুক্ত কপি স্ক্যান করে প্রস্তুত রাখুন।',
        portalAction: 'দলিল প্রস্তুত',
      },
      {
        stepNumber: 2,
        title: 'পোর্টালে বৈবাহিক অবস্থা নির্বাচন ও নাম প্রদান',
        instruction:
          'services.nidw.gov.bd-তে বৈবাহিক অবস্থা "বিবাহিত" নির্বাচন করে স্বামী/স্ত্রীর নাম ও এনআইডি নম্বর ইনপুট দিন।',
        portalAction: 'তথ্য পূরণ',
      },
      {
        stepNumber: 3,
        title: 'ফি পরিশোধ ও আবেদন সাবমিট',
        instruction: 'বিকাশ বা রকেটে ২৩০ টাকা ফি পরিশোধ করে নিকাহনামার পাতাগুলো আপলোড করে সাবমিট করুন।',
        portalAction: 'সাবমিশন',
      },
    ],
    statutoryWarnings: [
      'তালাকপ্রাপ্ত হওয়ার পরও তথ্য গোপন রাখা বা দ্বিতীয় বিয়ের ক্ষেত্রে মিথ্যা তথ্য প্রদান শাস্তিযোগ্য অপরাধ।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন বিধিমালা (নাগরিক তথ্য ও বৈবাহিক অবস্থা হালনাগাদ)',
      circularNo: 'ECS/NID/MRG-10',
      lastVerifiedDate: '০৮ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  dob_correction: {
    id: 'dob_correction',
    numericId: 6,
    titleBn: 'জন্মতারিখ সংশোধন',
    subtitleBn: 'জাতীয় পরিচয়পত্রে বয়সের ভুল, দিন-মাস-বছর সংশোধন',
    categoryCode: 'গ',
    authority: 'আঞ্চলিক নির্বাচন কর্মকর্তা ("গ" ক্যাটাগরি) / ডিজি (ঘ ক্যাটাগরি - ৫ বছরের বেশি হলে)',
    averageWorkingDays: '৩০ থেকে ৭৫ কার্যদিবস',
    keywords: [
      'জন্মতারিখ',
      'বয়স',
      'তারিখ',
      'সাল',
      'date of birth',
      'dob',
      'বয়স কমানো',
      'বয়স বাড়ানো',
      'জন্মসাল',
    ],
    description:
      'জাতীয় পরিচয়পত্রে জন্মতারিখ বা বয়স সংশোধনের আবেদন নির্বাচন কমিশনের সবচেয়ে স্পর্শকাতর ক্যাটাগরি। বয়সের ব্যবধানের ওপর ভিত্তি করে এটি জেলা, আঞ্চলিক কর্মকর্তা অথবা মহাপরিচালক (DG) মহোদয়ের অনুমোদন সাপেক্ষে সম্পন্ন হয়।',
    mandatoryDocs: [
      {
        id: 'ssc_or_board_certificate',
        title: 'এসএসসি / দাখিল / সমমানের মূল শিক্ষা বোর্ড সনদপত্র (শিক্ষিতদের জন্য বাধ্যতামূলক)',
        description:
          'অনলাইন ভেরিফায়েড বোর্ড রোল ও রেজিষ্ট্রেশন সম্বলিত মূল সনদের স্পষ্ট রঙিন স্ক্যান কপি। কোনো মার্কশিট বা প্রশংসাপত্র গ্রহণযোগ্য নয়।',
        type: 'mandatory',
      },
      {
        id: 'bdris_digital_birth_cert',
        title: 'অনলাইন ডিজিটাল ১৭ ডিজিটের জন্ম নিবন্ধন সনদ',
        description: 'BDRIS পোর্টালে পিতা-মাতার এনআইডি যাচাইকৃত সনদপত্র।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'passport_first_page',
        title: 'পাসপোর্ট (যদি থাকে)',
        description: 'পুরাতন বা বর্তমান মেশিন রিডেবল / ই-পাসপোর্টের কপি।',
        type: 'supporting',
      },
      {
        id: 'service_book_for_job',
        title: 'চাকরির সার্ভিস বুক / পিআরএল আদেশ (চাকরিজীবী হলে)',
        description: 'সরকারি/আধা-সরকারি কর্মকর্তা-কর্মচারীদের চাকরির প্রথম যোগদানের সার্ভিস বহির কপি।',
        type: 'supporting',
      },
      {
        id: 'siblings_age_proof',
        title: 'বড় ও ছোট ভাই-বোনের জাতীয় পরিচয়পত্রের কপি',
        description: 'পারিবারিক বয়সের ধারাবাহিকতা (Age Sequence) প্রমাণের জন্য।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [
      {
        id: 'civil_surgeon_medical_board',
        title: 'সিভিল সার্জন কর্তৃক মেডিকেল বোর্ড বয়স নির্ধারণ প্রত্যয়নপত্র',
        description:
          'সম্পূর্ণ অশিক্ষিত বা যারা কখনো কোনো প্রাতিষ্ঠানিক শিক্ষা গ্রহণ করেননি তাদের ক্ষেত্রে জেলা সিভিল সার্জন অফিসের এক্স-রে ও শারীরিক পরীক্ষা সনদ।',
        type: 'conditional',
        conditionNote: 'কোনো শিক্ষাগত সনদ না থাকলে সিভিল সার্জন রিপোর্ট বাধ্যতামূলক।',
      },
      {
        id: 'magistrate_dob_affidavit',
        title: '১ম শ্রেণীর ম্যাজিস্ট্রেট কোর্ট কর্তৃক বয়স হলফনামা',
        description: 'বয়সের যৌক্তিক কারণ ব্যাখ্যা করে এফিডেভিট।',
        type: 'conditional',
        conditionNote: 'শিক্ষা সনদহীনদের ক্ষেত্রে প্রযোজ্য।',
      },
    ],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'শিক্ষা সনদ যাচাই নিশ্চিত করুন',
        instruction:
          'আপনার এসএসসি বা সমমানের সনদে যে জন্মতারিখ রয়েছে, এনআইডিতে কেবল সেটাই সংশোধন সম্ভব। সনদের তারিখের বাইরে মনগড়া কোনো তারিখ দিয়ে আবেদন গ্রহণযোগ্য হবে না।',
        portalAction: 'সনদ যাচাই',
      },
      {
        stepNumber: 2,
        title: 'পোর্টালে জন্মতারিখ এডিট ও ফি জমা',
        instruction:
          'services.nidw.gov.bd পোর্টালে জন্মতারিখের ঘরে দিন, মাস ও বছর নির্বাচন করুন। বিকাশ/রকেটে ফি ২৩০ টাকা জমা দিন।',
        portalAction: 'তারিখ ইনপুট',
      },
      {
        stepNumber: 3,
        title: 'সনদ ও ভাই-বোনের এনআইডি আপলোড',
        instruction:
          'এসএসসি মূল সনদ, অনলাইন জন্ম সনদ এবং বয়সের পার্থক্য যাচাইয়ের জন্য বড় বা ছোট ভাই-বোনের এনআইডি কপি আপলোড করুন।',
        portalAction: 'ডকুমেন্ট আপলোড',
      },
      {
        stepNumber: 4,
        title: 'শুনানিতে সশরীরে অংশগ্রহণ (যদি ডাকা হয়)',
        instruction:
          'বয়স সংশোধনের ব্যবধান ১ বছরের বেশি হলে আঞ্চলিক নির্বাচন কর্মকর্তার অফিসে মূল শিক্ষাগত সনদ ও কাগজপত্রসহ শুনানিতে ডাক পড়তে পারে।',
        portalAction: 'শুনানি ও নিষ্পত্তি',
      },
    ],
    statutoryWarnings: [
      'চাকরি বা পেনশন সুবিধা লাভের উদ্দেশ্যে সরকারি কর্মচারীদের বয়স কমানোর আবেদন কঠোর নজরদারিতে থাকে। নির্বাচন কমিশন প্রয়োজনে চাকরির রেকর্ড ও নিয়োগকারী কর্তৃপক্ষের অনাপত্তি তলব করতে পারে।',
      'বড় ভাই বা বোনের চেয়ে নিজের বয়স বেশি হয়ে গেলে অথবা ছোট ভাই-বোনের সাথে অযৌক্তিক ব্যবধান হলে আবেদন সরাসরি বাতিল হবে।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন সচিবালয় গেজেট পরিপত্র (বয়স সংশোধন সংক্রান্ত বিশেষ নীতিমালা)',
      circularNo: 'ECS/NID/DOB-REV/2024-03',
      lastVerifiedDate: '০৩ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  birthplace_correction: {
    id: 'birthplace_correction',
    numericId: 7,
    titleBn: 'জন্মস্থান সংশোধন (জেলা বা দেশ)',
    subtitleBn: 'জন্মস্থান হিসেবে ভুল জেলা বা তথ্য সংশোধন',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি)',
    averageWorkingDays: '৭ থেকে ১৫ কার্যদিবস',
    keywords: ['জন্মস্থান', 'জেলা', 'জন্মের জেলা', 'birth place', 'birth district'],
    description: 'জাতীয় পরিচয়পত্রে জন্মস্থান (জেলা) ভুল লিপিবদ্ধ হলে তা সংশোধন করার প্রক্রিয়া।',
    mandatoryDocs: [
      {
        id: 'online_birth_cert_district',
        title: '১৭ ডিজিটের অনলাইন জন্ম নিবন্ধন সনদ',
        description: 'যেখানে জন্মের সঠিক জেলা ও দেশ সুস্পষ্টভাবে মুদ্রিত রয়েছে।',
        type: 'mandatory',
      },
      {
        id: 'ssc_cert_or_passport',
        title: 'এসএসসি সনদ অথবা পাসপোর্ট',
        description: 'জন্মস্থানের স্বপক্ষে প্রমাণক।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'parents_permanent_nid',
        title: 'পিতা/মাতার স্থায়ী ঠিকানার এনআইডি কার্ড',
        description: 'পৈতৃক এলাকা প্রমাণের জন্য।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'জন্ম সনদে জেলা মিলিয়ে নিন',
        instruction: 'জন্ম নিবন্ধন সনদের সাথে মিলিয়ে পোর্টালে জন্মস্থান জেলার ড্রপডাউন নির্বাচন করুন।',
        portalAction: 'তথ্য নির্বাচন',
      },
      {
        stepNumber: 2,
        title: 'ফি জমা ও আবেদন দাখিল',
        instruction: 'নির্ধারিত ফি পরিশোধ করে অনলাইন জন্ম সনদ আপলোড করে আবেদন সাবমিট করুন।',
        portalAction: 'সাবমিট',
      },
    ],
    statutoryWarnings: [
      'জেলা কোটা সুবিধা নেওয়ার অসৎ উদ্দেশ্যে অসত্য জন্মস্থান দিলে আবেদন বাতিলসহ শাস্তিমূলক ব্যবস্থা নেওয়া হতে পারে।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন বিধিমালা (নাগরিক ব্যক্তিগত তথ্য সংশোধন)',
      circularNo: 'ECS/NID/GEN-07',
      lastVerifiedDate: '১০ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  address_correction: {
    id: 'address_correction',
    numericId: 8,
    titleBn: 'ঠিকানা সংশোধন (বর্তমান বা স্থায়ী ঠিকানা)',
    subtitleBn: 'বাসার হোল্ডিং, গ্রাম, রোড, ডাকঘর বা ওয়ার্ড সংশোধন',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি)',
    averageWorkingDays: '৭ থেকে ১৫ কার্যদিবস',
    keywords: [
      'ঠিকানা',
      'address',
      'বর্তমান ঠিকানা',
      'স্থায়ী ঠিকানা',
      'গ্রাম',
      'রোড',
      'হোল্ডিং',
      'পোস্ট কোড',
      'ডাকঘর',
      'বাড়ি',
    ],
    description:
      'বর্তমান ঠিকানা বা স্থায়ী ঠিকানার বানান, হোল্ডিং নম্বর, রোড নম্বর, ডাকঘর বা গ্রাম সংশোধন করার প্রক্রিয়া। (বি: দ্র: ভোটার এলাকা পরিবর্তনের জন্য ফরম-১৩ ব্যবহার করতে হয়)',
    mandatoryDocs: [
      {
        id: 'holding_tax_or_utility_bill',
        title: 'ইউনিয়ন পরিষদ / পৌরসভা / সিটি কর্পোরেশনের হোল্ডিং ট্যাক্সের রসিদ বা বিদ্যুৎ/গ্যাস বিলের কপি',
        description: 'সর্বশেষ ৩ মাসের পরিশোধিত ইউটিলিটি বিল অথবা পৌর করের মূল রসিদের কপি।',
        type: 'mandatory',
      },
      {
        id: 'chairman_ward_citizen_cert',
        title: 'চেয়ারম্যান বা ওয়ার্ড কাউন্সিলর প্রদত্ত নাগরিক সনদপত্র (প্রত্যয়নপত্র)',
        description: 'যেখানে সঠিক ঠিকানা সুস্পষ্টভাবে উল্লেখ রয়েছে।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'land_khatiyan_or_deed',
        title: 'জমির খতিয়ান / দলিলের কপি (স্থায়ী ঠিকানার ক্ষেত্রে)',
        description: 'আবেদনকারী বা তার পিতা/মাতার নামে থাকা ভূমির পর্চা/খতিয়ান।',
        type: 'supporting',
      },
      {
        id: 'house_rent_agreement',
        title: 'বাসা ভাড়ার চুক্তিপত্র (বর্তমান ঠিকানার ক্ষেত্রে)',
        description: 'ভাড়াটিয়ার ক্ষেত্রে বাড়ির মালিকের সাথে সম্পাদিত চুক্তি।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [],
    feeStructure: {
      categoryType: 'অন্যান্য তথ্য / ঠিকানা',
      regularFee: 100,
      vat: 15,
      totalRegular: 115,
      urgentFee: 200,
      urgentVat: 30,
      totalUrgent: 230,
      tiers: STANDARD_FEE_TIERS.otherInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'নাগরিক প্রত্যয়ন ও বিলের কপি সংগ্রহ',
        instruction:
          'স্থানীয় ওয়ার্ড কাউন্সিলর বা ইউপি চেয়ারম্যান কার্যালয় থেকে সঠিক ঠিকানাবিশিষ্ট নাগরিক সনদ সংগ্রহ করুন।',
        portalAction: 'কাগজপত্র সংগ্রহ',
      },
      {
        stepNumber: 2,
        title: 'পোর্টালে ঠিকানা এডিট ও ফি প্রদান',
        instruction:
          'services.nidw.gov.bd-তে ঠিকানা ট্যাবে গিয়ে বর্তমান বা স্থায়ী ঠিকানার ফিল্ডগুলো সঠিক করুন। ফি ১১৫ টাকা বিকাশ বা রকেটে পরিশোধ করুন।',
        portalAction: 'তথ্য এন্ট্রি ও ফি',
      },
      {
        stepNumber: 3,
        title: 'প্রত্যয়ন আপলোড ও সাবমিশন',
        instruction: 'চেয়ারম্যান সনদ ও বিদ্যুৎ বিলের কপি আপলোড করে আবেদন চূড়ান্ত করুন।',
        portalAction: 'সাবমিট',
      },
    ],
    statutoryWarnings: [
      'ভোটার এলাকা পরিবর্তন করতে চাইলে এই অপশন নয়; বরং "ভোটার এলাকা স্থানান্তর ফরম-১৩" অনলাইনে অথবা নির্বাচন অফিসে অফলাইনে জমা দিতে হবে।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন এনআইডি বিধিমালা (ঠিকানা ও আবাসন তথ্য পরিপত্র)',
      circularNo: 'ECS/NID/ADDR-11',
      lastVerifiedDate: '০৫ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  photo_change: {
    id: 'photo_change',
    numericId: 9,
    titleBn: 'ছবি পরিবর্তন (পুনরায় ছবি তোলা)',
    subtitleBn: 'অস্পষ্ট ছবি, বয়সের কারণে চেহারা পরিবর্তন বা ত্রুটিপূর্ণ ছবি প্রতিস্থাপন',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি - বায়োমেট্রিক সশরীরে)',
    averageWorkingDays: '১০ থেকে ২০ কার্যদিবস',
    keywords: ['ছবি', 'photo', 'ছবি পরিবর্তন', 'ছবি ঝাপসা', 'অস্পষ্ট ছবি', 'নতুন ছবি'],
    description:
      'জাতীয় পরিচয়পত্রের ছবি অত্যন্ত ঝাপসা, কালো বা চিনতে সমস্যা হলে নির্বাচন অফিসে সশরীরে উপস্থিত হয়ে নতুন করে বায়োমেট্রিক ছবি তোলার আবেদন।',
    mandatoryDocs: [
      {
        id: 'applicant_physical_presence',
        title: 'সংশ্লিষ্ট উপজেলা/থানা নির্বাচন অফিসে সশরীরে উপস্থিতি',
        description: 'অনলাইনে ছবি আপলোড করে এনআইডির ছবি পরিবর্তন করা যায় না। সশরীরে ক্যামেরা ফেসিং আবশ্যক।',
        type: 'mandatory',
      },
      {
        id: 'original_nid_card',
        title: 'বিদ্যমান মূল জাতীয় পরিচয়পত্র বা লেমিনেটেড কার্ড',
        description: 'পূর্বের কার্ডটি জমা দিতে হতে পারে।',
        type: 'mandatory',
      },
      {
        id: 'ssc_or_passport_photo_id',
        title: 'ছবিযুক্ত শিক্ষাগত সনদ, পাসপোর্ট অথবা সরকারি পরিচয়পত্র',
        description: 'আবেদনকারীর চেহারা ও পরিচয়ের সত্যতা যাচাইয়ের জন্য।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'councillor_photo_attested_cert',
        title: 'চেয়ারম্যান/কাউন্সিলর কর্তৃক ছবি সত্যায়িত প্রত্যয়নপত্র',
        description: 'আবেদনকারীর পাসপোর্ট সাইজের রঙিন ছবি সত্যায়ন করে প্রত্যয়ন।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'অনলাইনে ছবি পরিবর্তনের আবেদন ও ফি প্রদান',
        instruction:
          'services.nidw.gov.bd-তে লগইন করে অন্যান্য/ছবি সংশোধন অপশন নির্বাচন করে ফি ২৩০ টাকা জমা দিন।',
        portalAction: 'অনলাইন আবেদন',
      },
      {
        stepNumber: 2,
        title: 'আবেদনপত্র ডাউনলোড ও প্রিন্ট',
        instruction: 'অনলাইন থেকে প্রিন্ট করা আবেদন কপি এবং চেয়ারম্যান প্রত্যয়নপত্র সংগ্রহ করুন।',
        portalAction: 'প্রিন্ট সংরক্ষণ',
      },
      {
        stepNumber: 3,
        title: 'নির্বাচন অফিসে সশরীরে ছবি তোলা',
        instruction:
          'প্রিন্ট কপি ও মূল কাগজপত্র নিয়ে উপজেলা বা থানা নির্বাচন অফিসে বায়োমেট্রিক ডেস্কে যান এবং লাইভ ছবি তুলুন।',
        portalAction: 'বায়োমেট্রিক ক্যাপচার',
      },
    ],
    statutoryWarnings: [
      'ছবি পরিবর্তনের জন্য কোনো তৃতীয় পক্ষের দালালের শরণাপন্ন হবেন না। বায়োমেট্রিক ছবি কেবলমাত্র সরকারি নির্বাচন কর্মকর্তার সামনেই লাইভ ক্যামেরায় গ্রহণ করা হয়।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন বায়োমেট্রিক ও ফটোগ্রাফি স্ট্যান্ডার্ড নির্দেশিকা',
      circularNo: 'ECS/BIO/PHOTO-2023',
      lastVerifiedDate: '০৪ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  signature_change: {
    id: 'signature_change',
    numericId: 10,
    titleBn: 'স্বাক্ষর পরিবর্তন (দস্তখত বা টিপসহি সংশোধন)',
    subtitleBn: 'পূর্বের স্বাক্ষরের পরিবর্তন বা টিপসহির পরিবর্তে স্বাক্ষর প্রদান',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি - সশরীরে)',
    averageWorkingDays: '১০ থেকে ২০ কার্যদিবস',
    keywords: ['স্বাক্ষর', 'দস্তখত', 'signature', 'টিপসহি', 'স্বাক্ষর পরিবর্তন', 'sign'],
    description:
      'জাতীয় পরিচয়পত্রে থাকা স্বাক্ষর পরিবর্তন করতে চাইলে কিংবা পূর্বে অশিক্ষিত অবস্থায় টিপসহি দিয়ে বর্তমানে শিক্ষিত হয়ে নিয়মিত হস্তাক্ষরে স্বাক্ষর দিতে চাইলে এই আবেদন প্রযোজ্য।',
    mandatoryDocs: [
      {
        id: 'presence_for_signature_pad',
        title: 'নির্বাচন অফিসে ডিজিটাল সিগনেচার প্যাডে সশরীরে স্বাক্ষর প্রদান',
        description: 'অনলাইনে ফাইল আপলোডের পাশাপাশি সরাসরি ডিজিটাল প্যাডে স্বাক্ষর করতে হবে।',
        type: 'mandatory',
      },
      {
        id: 'ssc_or_educational_cert_sign',
        title: 'এসএসসি বা শিক্ষাগত সনদ অথবা পাসপোর্ট',
        description: 'যেখানে আপনার নিয়মিত ব্যবহৃত নতুন স্বাক্ষর বিদ্যমান রয়েছে।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'bank_signature_specimen',
        title: 'ব্যাংক হিসাবের সত্যায়িত স্বাক্ষর বা নমুনা কার্ডের কপি',
        description: 'স্বাক্ষরের বাস্তব ব্যবহারের প্রমাণ হিসেবে।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [],
    feeStructure: {
      categoryType: 'ব্যক্তিগত তথ্য',
      regularFee: 200,
      vat: 30,
      totalRegular: 230,
      urgentFee: 400,
      urgentVat: 60,
      totalUrgent: 460,
      tiers: STANDARD_FEE_TIERS.personalInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'পোর্টালে স্বাক্ষর পরিবর্তনের রিকোয়েস্ট ও ফি',
        instruction: 'অনলাইনে আবেদন সাবমিট করে নির্ধারিত ২৩০ টাকা ফি পরিশোধ করুন।',
        portalAction: 'অনলাইন রিকোয়েস্ট',
      },
      {
        stepNumber: 2,
        title: 'নির্বাচন অফিসে উপস্থিতি',
        instruction:
          'আবেদন ফরম প্রিন্ট নিয়ে উপজেলা নির্বাচন অফিসে যান এবং ডিজিটাল প্যাডে নতুন স্বাক্ষর প্রদান করুন।',
        portalAction: 'স্বাক্ষর ক্যাপচার',
      },
    ],
    statutoryWarnings: [
      'ব্যাংক বা অন্যান্য আর্থিক প্রতিষ্ঠানে ব্যবহৃত স্বাক্ষরের সাথে সামঞ্জস্য রক্ষা করা জরুরি, অন্যথায় আর্থিক লেনদেনে জটিলতা হতে পারে।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন অনুবিভাগ পরিপত্র (স্বাক্ষর ও বায়োমেট্রিক তথ্য)',
      circularNo: 'ECS/NID/SIG-04',
      lastVerifiedDate: '০৬ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  blood_group_correction: {
    id: 'blood_group_correction',
    numericId: 11,
    titleBn: 'রক্তের গ্রুপ সংশোধন / সংযোজন',
    subtitleBn: 'ব্লাড গ্রুপ ভুল লিপিবদ্ধ হলে বা নতুন যুক্ত করতে চাইলে',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি)',
    averageWorkingDays: '৩ থেকে ৭ কার্যদিবস',
    keywords: [
      'রক্তের গ্রুপ',
      'ব্লাড গ্রুপ',
      'blood group',
      'a+',
      'b+',
      'o+',
      'ab+',
      'পজিটিভ',
      'নেগেটিভ',
      'রক্ত',
    ],
    description:
      'এনআইডি কার্ডে রক্তের গ্রুপ ভুল থাকলে কিংবা খালি থাকলে সঠিক রক্তের গ্রুপ যুক্ত করার প্রক্রিয়া। এটি অত্যন্ত দ্রুত ও সহজে নিষ্পত্তিযোগ্য।',
    mandatoryDocs: [
      {
        id: 'authorized_lab_blood_report',
        title: 'অনুমোদিত ডায়াগনস্টিক সেন্টার বা প্যাথলজিস্ট কর্তৃক প্রদত্ত রক্তের গ্রুপ পরীক্ষার মূল রিপোর্ট',
        description:
          'মেডিকেল টেকনোলজিস্ট ও চিকিৎসকের সিল-স্বাক্ষর সম্বলিত ল্যাবরেটরি টেস্ট রিপোর্ট।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [
      {
        id: 'driving_license_or_donor_card',
        title: 'ড্রাইভিং লাইসেন্স বা রেড ক্রিসেন্ট রক্তদাতা কার্ড (যদি থাকে)',
        description: 'অতিরিক্ত সহায়ক প্রমাণ হিসেবে।',
        type: 'supporting',
      },
    ],
    conditionalDocs: [],
    feeStructure: {
      categoryType: 'অন্যান্য তথ্য / ঠিকানা',
      regularFee: 100,
      vat: 15,
      totalRegular: 115,
      urgentFee: 200,
      urgentVat: 30,
      totalUrgent: 230,
      tiers: STANDARD_FEE_TIERS.otherInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'রক্ত পরীক্ষা সম্পন্ন করুন',
        instruction: 'যেকোনো রেজিস্টার্ড ল্যাব থেকে রক্তের গ্রুপ টেস্টের সিলযুক্ত রিপোর্ট গ্রহণ করুন।',
        portalAction: 'ল্যাব টেস্ট',
      },
      {
        stepNumber: 2,
        title: 'পোর্টালে ব্লাড গ্রুপ নির্বাচন ও ফি প্রদান',
        instruction:
          'services.nidw.gov.bd-তে অন্যান্য তথ্য ট্যাবে ব্লাড গ্রুপ ড্রপডাউন থেকে সঠিক গ্রুপ নির্বাচন করুন এবং বিকাশ/রকেটে ১১৫ টাকা ফি দিন।',
        portalAction: 'তথ্য ও ফি',
      },
      {
        stepNumber: 3,
        title: 'ল্যাব রিপোর্ট আপলোড',
        instruction: 'রক্ত পরীক্ষার মূল স্লিপটির স্পষ্ট রঙিন স্ক্যান কপি আপলোড করে সাবমিট করুন।',
        portalAction: 'আপলোড ও সাবমিট',
      },
    ],
    statutoryWarnings: [
      'ভুল রক্তের গ্রুপ কোনো দুর্ঘটনা বা জরুরি চিকিৎসার ক্ষেত্রে প্রাণঘাতী ঝুঁকি তৈরি করতে পারে। নিশ্চিত না হয়ে অনুমান করে রক্তের গ্রুপ দেবেন না।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন নাগরিক তথ্য হালনাগাদ নির্দেশনা (স্বাস্থ্য ও চিকিৎসা ডাটা)',
      circularNo: 'ECS/NID/MED-BLD/2022',
      lastVerifiedDate: '১২ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },

  other_info_correction: {
    id: 'other_info_correction',
    numericId: 12,
    titleBn: 'অন্যান্য তথ্য সংশোধন (শিক্ষাগত যোগ্যতা, পেশা, ধর্ম, ইত্যাদি)',
    subtitleBn: 'পেশা পরিবর্তন, শিক্ষাগত যোগ্যতার ধাপ বৃদ্ধি বা ব্যক্তিগত সাধারণ তথ্য',
    categoryCode: 'ক',
    authority: 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি)',
    averageWorkingDays: '৫ থেকে ১২ কার্যদিবস',
    keywords: [
      'পেশা',
      'শিক্ষাগত যোগ্যতা',
      'ধর্ম',
      'অন্যান্য তথ্য',
      'occupation',
      'education',
      'degree',
      'চাকরি',
    ],
    description:
      'এনআইডির ব্যাকএন্ডে সংরক্ষিত পেশা (যেমন ছাত্র থেকে চাকরিজীবী বা ব্যবসায়ী), শিক্ষাগত যোগ্যতা (স্নাতক বা স্নাতকোত্তর) অথবা ধর্মের তথ্য সংশোধনের আবেদন।',
    mandatoryDocs: [
      {
        id: 'academic_certificate_highest',
        title: 'সর্বোচ্চ শিক্ষাগত যোগ্যতার মূল সনদ (শিক্ষাগত যোগ্যতার পরিবর্তনের ক্ষেত্রে)',
        description: 'বিশ্ববিদ্যালয় বা বোর্ড কর্তৃক প্রদত্ত সনদপত্র।',
        type: 'mandatory',
      },
      {
        id: 'office_id_or_trade_license',
        title: 'অফিস আইডি কার্ড বা ট্রেড লাইসেন্স (পেশা পরিবর্তনের ক্ষেত্রে)',
        description: 'চাকরিজীবীদের ক্ষেত্রে অফিস আইডি ও ব্যবসায়ীদের ক্ষেত্রে হালনাগাদ ট্রেড লাইসেন্স।',
        type: 'mandatory',
      },
    ],
    supportingDocs: [],
    conditionalDocs: [],
    feeStructure: {
      categoryType: 'অন্যান্য তথ্য / ঠিকানা',
      regularFee: 100,
      vat: 15,
      totalRegular: 115,
      urgentFee: 200,
      urgentVat: 30,
      totalUrgent: 230,
      tiers: STANDARD_FEE_TIERS.otherInfo,
      paymentMethods: ['বিকাশ', 'রকেট', 'নগদ', 'ওকে ওয়ালেট'],
    },
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'পোর্টালে অন্যান্য তথ্য সেকশনে যান',
        instruction: 'services.nidw.gov.bd-তে অন্যান্য তথ্য ট্যাবে প্রয়োজনীয় ফিল্ড সিলেক্ট করুন।',
        portalAction: 'তথ্য এন্ট্রি',
      },
      {
        stepNumber: 2,
        title: 'ফি জমা ও সনদপত্র আপলোড',
        instruction: 'বিকাশ/রকেটে ১১৫ টাকা ফি দিয়ে ট্রেড লাইসেন্স বা সার্টিফিকেট আপলোড করুন।',
        portalAction: 'ফি ও সাবমিট',
      },
    ],
    statutoryWarnings: [
      'শিক্ষাগত যোগ্যতা বা পেশা পরিবর্তনের পর নতুন প্লাস্টিক কার্ড রি-ইস্যু করার প্রয়োজন নাও হতে পারে, কারণ এই তথ্যগুলো কেবল সার্ভারের চিপে সংরক্ষিত থাকে।',
    ],
    sourceReference: {
      citation: 'নির্বাচন কমিশন তথ্য হালনাগাদ সার্কুলার ২০২৪',
      circularNo: 'ECS/NID/OTH-2024',
      lastVerifiedDate: '০৭ জানুয়ারি ২০২৫',
      needsVerification: false,
    },
  },
};

// Ready-to-test Demo Data Chips requested by user
export interface DemoTestChip {
  id: string;
  label: string;
  badge: string;
  existingInfo: string;
  correctedInfo: string;
  targetType: NidCorrectionTypeId;
}

export const DEMO_TEST_CHIPS: DemoTestChip[] = [
  {
    id: 'spelling_demo',
    label: 'নামের বানান ভুল (Spelling)',
    badge: 'ক ক্যাটাগরি',
    existingInfo: 'মোসাঃ তানজিনা আক্তার',
    correctedInfo: 'মোসাম্মৎ তানজিনা আক্তার',
    targetType: 'name_partial_change',
  },
  {
    id: 'full_name_demo',
    label: 'সম্পূর্ণ নাম পরিবর্তন (নতুন নাম)',
    badge: 'গ ক্যাটাগরি',
    existingInfo: 'আব্দুল করিম',
    correctedInfo: 'মোহাম্মদ ফারহান চৌধুরী',
    targetType: 'name_full_change',
  },
  {
    id: 'dob_demo',
    label: 'জন্মতারিখ সংশোধন (DOB)',
    badge: 'গ ক্যাটাগরি',
    existingInfo: '15/08/1996',
    correctedInfo: '12/10/1998',
    targetType: 'dob_correction',
  },
  {
    id: 'blood_demo',
    label: 'রক্তের গ্রুপ সংশোধন',
    badge: 'ক ক্যাটাগরি',
    existingInfo: 'B- (ভুল লিপিবদ্ধ)',
    correctedInfo: 'O+ (পরীক্ষিত রিপোর্ট)',
    targetType: 'blood_group_correction',
  },
  {
    id: 'father_demo',
    label: 'পিতার নাম সংশোধন',
    badge: 'ক ক্যাটাগরি',
    existingInfo: 'আলী হোসেন',
    correctedInfo: 'মোঃ আলী হোসেন ভূঁইয়া',
    targetType: 'parents_name_correction',
  },
  {
    id: 'address_demo',
    label: 'ঠিকানা সংশোধন (বাসা/রোড)',
    badge: 'ক ক্যাটাগরি',
    existingInfo: 'গ্রাম: চরকালীপুর, ডাকঘর: বাজারঘাট',
    correctedInfo: 'বাসা: ৪২, রোড: ০৭, সেক্টর: ০৩, উত্তরা, ঢাকা',
    targetType: 'address_correction',
  },
];
