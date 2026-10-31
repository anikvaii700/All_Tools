import {
  EntrepreneurProfile,
  BusinessProject,
  ValidationPlan,
  BusinessOfferDraft,
  BusinessPlanDocument,
  FinanceData,
  DailyMentorTask,
} from '../types/entrepreneur';

const STORAGE_KEYS = {
  PROFILE: 'mosafa_entrepreneur_profile_v1',
  PROJECTS: 'mosafa_entrepreneur_projects_v1',
  ACTIVE_PROJECT_ID: 'mosafa_entrepreneur_active_project_id_v1',
};

export const DEFAULT_PROFILE: EntrepreneurProfile = {
  name: 'নতুন উদ্যোক্তা',
  locationDistrict: 'ঢাকা',
  locationDivision: 'ঢাকা',
  education: 'স্নাতক / এইচএসসি',
  skills: ['স্মার্টফোন পরিচালনা', 'বাংলা ও ইংরেজি সাধারণ যোগাযোগ', 'ক্যানভা ডিজাইন'],
  interests: ['অনলাইন ব্যবসা', 'সার্ভিস প্রদান', 'ডিজিটাল প্রোডাক্ট'],
  workExperience: 'ফ্রেশার / কোনো পূর্ব অভিজ্ঞতা নেই',
  availableHoursPerWeek: 15,
  availableCapital: 'zero',
  equipment: {
    hasSmartphone: true,
    hasLaptopOrPC: false,
    hasReliableInternet: true,
  },
  experienceLevel: 'beginner',
  preference: 'online',
  monthlyIncomeGoal: 30000,
  isProfileComplete: false,
  updatedAt: new Date().toISOString(),
};

export const INITIAL_TASKS_TEMPLATE: DailyMentorTask[] = [
  {
    id: 'task-1',
    dayNumber: 1,
    category: 'customer_discovery',
    title: 'Discover 3 Real Problems',
    banglaTitle: 'আশেপাশের ৩টি মানুষের বাস্তব সমস্যা চিহ্নিত করুন',
    description: 'আপনার পরিচিত বন্ধু, দোকানদার বা প্রতিবেশীর সাথে কথা বলুন—তাদের প্রতিদিনের কোন কাজটি করতে বিরক্তি লাগে বা কষ্ট হয়?',
    estimatedMinutes: 30,
    isCompleted: false,
  },
  {
    id: 'task-2',
    dayNumber: 2,
    category: 'offer_creation',
    title: 'Draft a Simple Offer',
    banglaTitle: 'মাত্র ১ লাইনের একটি পরিষ্কার অফার লিখুন',
    description: 'আমি [কাদেরকে] [কী ফলাফল] দিই মাত্র [কত টাকা]তে এবং [কত দিনে]। যেমন: "আমি এলাকার নতুন কাপড়ের দোকানকে মাসে ২০টি পোস্টার ও রিলস বানিয়ে দিই মাত্র ৩,৫০০ টাকায়।"',
    estimatedMinutes: 20,
    isCompleted: false,
  },
  {
    id: 'task-3',
    dayNumber: 3,
    category: 'outreach',
    title: 'Reach Out to 5 People',
    banglaTitle: '৫ জন সম্ভাব্য ক্রেতা বা পরিচিতকে সালাম দিয়ে বার্তা দিন',
    description: 'সরাসরি কিছু বিক্রি করবেন না! শুধু বলুন: "আমি নতুন একটি উদ্যোগ নিয়েছি। আপনি কি একটু দেখে আপনার মূল্যবান পরামর্শ দেবেন?"',
    estimatedMinutes: 40,
    isCompleted: false,
  },
  {
    id: 'task-4',
    dayNumber: 4,
    category: 'customer_discovery',
    title: 'Customer Interview',
    banglaTitle: 'অন্তত ২ জনের সাথে ১০ মিনিট কথা বলে নোট নিন',
    description: 'তারা বর্তমানে এই সমস্যা সমাধানে কত টাকা খরচ করেন এবং তাদের প্রধান অসন্তোষ কী তা শুনুন।',
    estimatedMinutes: 30,
    isCompleted: false,
  },
  {
    id: 'task-5',
    dayNumber: 5,
    category: 'offer_creation',
    title: 'Create 1 Free Sample / Demo',
    banglaTitle: '১টি নিখরচায় নমুনা বা ডেমো প্রস্তুত করুন',
    description: 'ক্যানভা বা কাগজে আপনার কাজের একটি জীবন্ত নমুনা রেডি করুন যা দেখলে যে-কেউ আপনার দক্ষতার ওপর আস্থা পাবে।',
    estimatedMinutes: 45,
    isCompleted: false,
  },
  {
    id: 'task-6',
    dayNumber: 6,
    category: 'outreach',
    title: 'Offer Free Trial to 1 Client',
    banglaTitle: '১ জন ব্যক্তিকে ৩ দিনের ফ্রি ট্রায়াল দিন',
    description: 'বলুন: "আমার কাজের কোয়ালিটি যাচাই করতে আগামী ৩ দিন আপনার জন্য কোনো ফি ছাড়া কাজ করে দিচ্ছি।"',
    estimatedMinutes: 25,
    isCompleted: false,
  },
  {
    id: 'task-7',
    dayNumber: 7,
    category: 'learning',
    title: 'Weekly Review & Learning',
    banglaTitle: '১ম সপ্তাহের কাজের পর্যালোচনা ও শিক্ষা লিপিবদ্ধ করুন',
    description: 'কী কাজ করল, কী করল না? কাস্টমারের কোন আপত্তিগুলো সবচেয়ে বেশি আসল? নোটবুকে লিখুন।',
    estimatedMinutes: 20,
    isCompleted: false,
  },
  {
    id: 'task-8',
    dayNumber: 8,
    category: 'outreach',
    title: 'Ask for Honest Feedback',
    banglaTitle: 'ফ্রি ট্রায়াল নেওয়া ব্যক্তির কাছ থেকে লিখিত মতামত নিন',
    description: 'তাদের জিজ্ঞেস করুন: "আমার কাজে আপনি কতটা সন্তুষ্ট? ১০-এ কত নম্বর দেবেন?" তাদের ভালো কমেন্টটি স্ক্রিনশট নিন।',
    estimatedMinutes: 15,
    isCompleted: false,
  },
  {
    id: 'task-9',
    dayNumber: 9,
    category: 'outreach',
    title: 'First Paid Pitch',
    banglaTitle: 'প্রথম পেইড অফার পেশ করুন',
    description: 'যিনি ফ্রি ট্রায়ালে সন্তুষ্ট হয়েছেন, তাকে বিশেষ ২০% প্রারম্ভিক ছাড়ে পুরো মাসের চুক্তিতে আসার প্রস্তাব দিন।',
    estimatedMinutes: 20,
    isCompleted: false,
  },
  {
    id: 'task-10',
    dayNumber: 10,
    category: 'finance',
    title: 'Setup Finance Ledger',
    banglaTitle: 'ব্যবসায়িক হিসাবের খাতা বা অ্যাপ চালু করুন',
    description: 'ব্যক্তিগত টাকা ও ব্যবসার টাকা সম্পূর্ণ আলাদা রাখুন। প্রতিটি প্রাপ্তি ও খরচের রসিদ লিখে রাখার অভ্যাস করুন।',
    estimatedMinutes: 15,
    isCompleted: false,
  },
];

export const INITIAL_DEMO_PROJECT: BusinessProject = {
  id: 'proj-demo-zero-1',
  name: 'ডিজিটাল লোকাল বুস্টিং ও ডিজাইন স্টুডিও',
  businessType: 'service',
  tagline: 'এলাকার দোকান ও অনলাইন পেজের বিশ্বস্ত সোশ্যাল মিডিয়া পার্টনার',
  primaryDescription: 'স্মার্টফোন ব্যবহার করে স্থানীয় দোকানদারদের জন্য ফেসবুক পেজ ম্যানেজমেন্ট, ক্যানভা পোস্টার ডিজাইন ও শর্ট রিলস তৈরির সেবা।',
  targetAudience: 'এলাকার কাপড়ের দোকান, রেস্তোরাঁ ও নতুন অনলাইন উদ্যোক্তারা',
  capitalAllocatedBDT: 0,
  stage: 'first_customers',
  validationPlan: {
    id: 'val-1',
    ideaDescription: 'লোকাল দোকান ও এফ-কমার্স উদ্যোক্তারা পেজে প্রতিদিন সময়মতো পোস্ট দিতে পারেন না। আমি মাসিক ৩,৫০০ টাকায় এই দায়িত্ব নেব।',
    customerProblem: 'দোকানদাররা ফেসবুক চালাতে জানেন কিন্তু ক্যানভায় সুন্দর ব্যানার বানাতে বা নিয়মিত পোস্ট দিতে সময়ের অভাবে পারেন না। ফলে কাস্টমার কমে যায়।',
    targetAudience: 'ঢাকার মিরপুর ও আশেপাশের এলাকার ৫০টি ছোট-মাঝারি দোকান ও বুটিক হাউস।',
    valueProposition: 'বড় এজেন্সির বিশাল খরচের তুলনায় স্থানীয় ভাষায় দৈনিক ১টি চমৎকার পোস্টার ও ইনবক্স রিপ্লাই সাপোর্ট মাত্র ৩,৫০০ টাকায়।',
    competitors: [
      {
        name: 'বড় ডিজিটাল এজেন্সি',
        pricingEstimate: '৳১৫,০০০ - ২৫,০০০ / মাস',
        strengths: 'বড় টিম, ভিডিও ক্যামেরা',
        weaknesses: 'ছোট দোকানের কথা শোনে না, অতিরিক্ত চার্জ',
        ourAdvantage: 'ব্যক্তিগত যত্ন, স্থানীয় উপস্থিতি, সাশ্রয়ী বাজেট',
      },
    ],
    interviewQuestions: [
      {
        id: 'iq-1',
        question: 'আপনার দোকানের ফেসবুক পেজে সপ্তাহে কয়দিন পোস্ট করতে পারেন?',
        purpose: 'তাদের সময়ের অভাব ও নিয়মিততার সমস্যা চিহ্নিত করা',
        sampleAnswer: 'মাসে ২-১ দিন দিই, সময় পাই না ভাই।',
      },
      {
        id: 'iq-2',
        question: 'সুন্দর ব্যানার বা পোস্ট তৈরি করতে আপনার প্রধান সমস্যা কী?',
        purpose: 'ডিজাইন স্কিলের সীমাবদ্ধতা বোঝা',
        sampleAnswer: 'মোবাইলে সাধারণ ছবি তুলি, সুন্দর করে সাজাতে পারি না।',
      },
      {
        id: 'iq-3',
        question: 'যদি কেউ প্রতিদিন আপনার পেজের যত্ন নেয়, আপনি কত খরচ করতে প্রস্তুত?',
        purpose: 'মূল্য সংবেদনশীলতা ও বাজেট নির্ধারণ',
        sampleAnswer: '৩-৪ হাজার টাকা হলে দিতে পারি।',
      },
    ],
    mvpPlan: {
      scope: '৩টি ডেমো পোস্টার ও ১টি ১৫ সেকেন্ডের রিলস ভিডিও',
      format: 'WhatsApp Catalog & Canva Link',
      timeToBuildDays: 2,
      budgetBDT: 0,
    },
    experiments: [
      {
        name: '১০টি দোকানে সরাসরি ডেমো প্রদর্শন',
        method: 'ফোনে ডেমো পোস্টার নিয়ে দোকানদারের সাথে ৫ মিনিট কথা বলা',
        successMetric: '১০ জনের মধ্যে অন্তত ২ জন ফ্রি ট্রায়াল নিতে রাজি হবে',
        status: 'passed',
      },
    ],
    identifiedRisks: [
      'দোকানদাররা সবসময় বুস্টিং খরচ দিতে চাইবে না—অর্গানিক কোয়ালিটি দিয়ে বিক্রি বাড়াতে হবে',
      'মাস শেষে বিল তুলতে বিলম্ব হওয়া—শুরুতেই ৫০% অগ্রিম নিতে হবে',
    ],
    nextActions: [
      'বর্তমান ২ জন ট্রায়াল ক্লায়েন্টকে সফল ডেলিভারি দেওয়া',
      'তাদের রিভিউ নিয়ে এলাকার আরও ৫টি দোকানে রেফারেন্স দেওয়া',
    ],
    updatedAt: new Date().toISOString(),
  },
  offerDraft: {
    brandNameIdeas: ['লোকাল ক্লিক স্টুডিও', 'ব্র্যান্ড বুস্ট বিডি', 'শপ সাথী ডিজাইন'],
    selectedBrandName: 'ব্র্যান্ড বুস্ট বিডি',
    tagline: 'আপনার দোকানের পরিচিতি হোক আরও বড়',
    coreValueProp: 'স্মার্টফোন থেকেই আপনার ব্যবসাকে আকর্ষণীয় ব্র্যান্ডে রূপান্তর করি।',
    packages: [
      {
        id: 'pkg-1',
        tierName: 'স্টার্টার প্যাক (Starter)',
        tagline: 'নতুন ও ছোট পেজের জন্য আদর্শ',
        priceBDT: 2500,
        deliverables: ['১৫টি ক্যানভা ডিজাইন পোস্টার', 'আকর্ষণীয় বাংলা ক্যাপশন', 'সাপ্তাহিক রিপোর্ট'],
        deliveryTimeDays: 30,
        revisionsAllowed: '২ বার',
        idealFor: 'নতুন শুরু করা হোমমেড কেক বা কাপড়ের পেজ',
      },
      {
        id: 'pkg-2',
        tierName: 'গ্রোথ প্যাক (Growth - Best Value)',
        tagline: 'নিয়মিত বিক্রি ও রিলস ভিউয়ের জন্য',
        priceBDT: 4500,
        deliverables: [
          '২৫টি আকর্ষণীয় পোস্টার',
          '৪টি শর্ট রিলস ভিডিও এডিটিং',
          'কাস্টমার ইনবক্স মেসেজ রেডি টেমপ্লেট',
          'ফেসবুক কভার ডিজাইন',
        ],
        deliveryTimeDays: 30,
        revisionsAllowed: 'আনলিমিটেড মাইনর',
        idealFor: 'ব্যস্ত দোকানদার ও আউটলেট',
      },
    ],
    guaranteePolicy: 'প্রথম ৭ দিনের মধ্যে কাজের মান পছন্দ না হলে পুরো অগ্রিম টাকা ফেরত দেওয়া হবে।',
    salesHookLines: [
      'দোকানে কাস্টমার কম? ফেসবুক পেজ কি ঘুমিয়ে আছে?',
      'মাসে লাখ টাকার শোরুম চালাচ্ছেন, অথচ ফেসবুক পেজে শেষ পোস্ট ১ মাস আগে?',
      'মাত্র ৩,৫০০ টাকায় আপনার দোকানে প্রতিদিন নতুন কাস্টমার টানার সোশ্যাল মিডিয়া পাওয়ার।',
    ],
    callToAction: 'আজই ফ্রি ১টি স্যাম্পল পোস্টার পেতে ইনবক্স করুন অথবা হোয়াটসঅ্যাপে নক দিন: 01XXXXXXXXX',
  },
  businessPlan: {
    id: 'bp-1',
    businessName: 'ব্র্যান্ড বুস্ট বিডি',
    tagline: 'লোকাল ব্যবসায়ের ডিজিটাল পার্টনার',
    lastUpdated: new Date().toISOString(),
    executiveSummary:
      'ব্র্যান্ড বুস্ট বিডি একটি জিরো-ক্যাপিটাল সার্ভিস ভিত্তিক সোশ্যাল মিডিয়া এজেন্সি। আমরা বাংলাদেশের ছোট দোকানদার ও অনলাইন বিক্রেতাদের জন্য স্বল্পমূল্যে আকর্ষণীয় গ্রাফিক্স ও শর্ট ভিডিও সেবা প্রদান করি।',
    businessDescription:
      'আমরা স্মার্টফোন ও ক্যানভা ব্যবহার করে স্থানীয় ব্যবসায়ীদের ডিজিটাল উপস্থিতিকে পেশাদার রূপ দিই। কোনো ভারী ইনভেস্টমেন্ট ছাড়াই ক্লায়েন্টদের অগ্রিম ফি থেকে অপারেশনাল খরচ বহন করা হয়।',
    problemAndSolution:
      'সমস্যা: ঐতিহ্যবাহী ব্যবসায়ীরা সোশ্যাল মিডিয়ার গুরুত্ব বুঝলেও নিয়মিত কনটেন্ট তৈরিতে অপারগ। সমাধান: সাশ্রয়ী মাসিক সাবস্ক্রিপশনে কমপ্লিট সোশ্যাল মিডিয়া হ্যান্ডলিং।',
    targetCustomerProfile:
      'বাংলাদেশের জেলা ও উপজেলার কাপড়, খাবার, জুয়েলারি ও ইলেকট্রনিক্স শপ মালিকরা যারা পেজ থেকে বিক্রি বাড়াতে আগ্রহী।',
    marketResearchAndOpportunity:
      'বাংলাদেশে ফেসবুক ব্যবহারকারীর সংখ্যা ৪ কোটির বেশি। কিন্তু ৮০% স্থানীয় দোকানের কোনো ডিজিটাল সক্রিয়তা নেই। এখানে বিপুল বাজার চাহিদা রয়েছে।',
    competitorAnalysis:
      'বড় এজেন্সিগুলো সাধারণত বড় ব্র্যান্ড নিয়ে ব্যস্ত থাকে এবং তাদের চার্জ ছোট ব্যবসায়ীদের নাগালের বাইরে। আমরা হাইপার-লোকাল পার্সোনালাইজড সাপোর্ট দিয়ে এগিয়ে থাকব।',
    productsAndPricing:
      'স্টার্টার প্যাক ৳২,৫০০/মাস, গ্রোথ প্যাক ৳৪,৫০০/মাস। প্রথম ৫ জন ক্লায়েন্ট থেকেই ৳১৫,০০০+ রেভিনিউ নিশ্চিত।',
    marketingAndAcquisitionPlan:
      'সরাসরি দোকান ভিজিট করে ডেমো প্রদর্শন, সন্তুষ্ট ক্লায়েন্টদের রেফারাল এবং ফেসবুক গ্রুপে শিক্ষণীয় কনটেন্ট পোস্ট।',
    salesAndConversionProcess:
      'ফ্রি স্যাম্পল প্রদান → ৩ দিনের ট্রায়াল রান → ৫০% অগ্রিম নিয়ে মান্থলি কন্ট্রাক্ট ক্লোজ।',
    operationsAndDailyWorkflow:
      'সকাল: শিডিউল পোস্ট যাচাই ও মেসেজ ব্যাক। দুপুর: নতুন পোস্টার ও ভিডিও তৈরি। বিকেল: ক্লায়েন্ট ফিডব্যাক ও নতুন পিচ।',
    financialProjections: {
      startingCapitalNeeded: 0,
      monthlyOverhead: 1000, // Internet & Mobile recharge
      estimatedBreakEvenMonths: 1,
      month1RevenueTarget: 15000,
      month3RevenueTarget: 45000,
    },
    risksAndMitigation:
      'ঝুঁকি: ক্লায়েন্ট ড্রপআউট। প্রতিকার: প্রতি সপ্তাহে কাজের স্পষ্ট রিপোর্ট দেওয়া এবং কাস্টমার ইনবক্স রেসপন্স উন্নত রাখা।',
    thirtyDayMilestones: [
      'দিন ৭: ১০টি সেরা পোর্টফোলিও ডিজাইন প্রস্তুত করা',
      'দিন ১৫: প্রথম ৩ জন পেইড ক্লায়েন্ট অনবোর্ড করা',
      'দিন ২২: ক্লায়েন্টদের পজেটিভ রিভিউ স্ক্রিনশট সংগ্রহ করা',
      'দিন ৩০: মোট ৫ জন নিয়মিত ক্লায়েন্ট থেকে ৳১৮,০০০+ আয় স্পর্শ করা',
    ],
    ninetyDayVision:
      '৩ মাস পর একজন পার্ট-টাইম সহকারী ডিজাইনার যুক্ত করে ক্লায়েন্ট সংখ্যা ১৫-তে উন্নীত করা এবং মাসিক ৬০,০০০+ টাকায় পৌঁছানো।',
  },
  financeData: {
    startupExpenses: [
      { id: 'se-1', title: 'মোবাইল ইন্টারনেট ডাটা প্যাক', category: 'other', amountBDT: 500, isEssential: true },
      { id: 'se-2', title: 'ক্যানভা প্রো সাবস্ক্রিপশন (ঐচ্ছিক)', category: 'other', amountBDT: 400, isEssential: false },
    ],
    monthlyExpenses: [
      { id: 'me-1', title: 'মোবাইল রিচার্জ ও ব্রডব্যান্ড বিল', category: 'internet_phone', monthlyCostBDT: 1000 },
      { id: 'me-2', title: 'যাতায়াত ও ক্লায়েন্ট মিটিং', category: 'other', monthlyCostBDT: 800 },
    ],
    unitCostCalc: {
      productOrServiceName: '১টি ক্লায়েন্টের মাসিক প্যাকেজ (২৫টি পোস্ট + ৪টি রিলস)',
      rawMaterialsCost: 0,
      packagingCost: 0,
      laborHoursPerUnit: 15,
      laborRatePerHour: 100,
      platformOrPaymentFeePercent: 1.85, // bKash cashout fee
      deliveryCost: 0, // digital delivery
      sellingPriceBDT: 3500,
    },
    monthlyRevenueGoalBDT: 30000,
    reinvestmentRatePercent: 20,
    ownerSalaryGoalBDT: 24000,
  },
  leads: [
    {
      id: 'lead-1',
      name: 'আহমেদ ভাই (আল-মদিনা ক্লথ স্টোর)',
      phoneOrWhatsApp: '01711000000',
      district: 'ঢাকা',
      status: 'converted',
      source: 'offline_visit',
      interestedInProduct: 'গ্রোথ প্যাক (৳৪,৫০০)',
      potentialValueBDT: 4500,
      notes: 'ঈদের কালেকশন চলছে। শাড়ির ছবির জন্য নিয়মিত রিলস দরকার।',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'lead-2',
      name: 'নাসরিন আপু (হোমমেড কেক কর্নার)',
      phoneOrWhatsApp: '01819000000',
      district: 'ঢাকা',
      status: 'negotiating',
      source: 'facebook_group',
      interestedInProduct: 'স্টার্টার প্যাক (৳২,৫০০)',
      potentialValueBDT: 2500,
      notes: 'স্যাম্পল ব্যানার খুব পছন্দ হয়েছে। কাল অগ্রিম পাঠাবেন বলেছেন।',
      createdAt: new Date().toISOString(),
    },
  ],
  orders: [
    {
      id: 'ord-1',
      orderNumber: 'ORD-101',
      customerName: 'আল-মদিনা ক্লথ স্টোর',
      customerPhone: '01711000000',
      customerAddress: 'মিরপুর-১০, ঢাকা',
      itemsOrdered: 'সোশ্যাল মিডিয়া গ্রোথ প্যাক (মাসিক)',
      totalAmountBDT: 4500,
      advancePaidBDT: 2500,
      dueAmountBDT: 2000,
      paymentStatus: 'partial',
      deliveryStatus: 'in_progress',
      orderDate: new Date().toISOString().split('T')[0],
      notes: 'অগ্রিম বিকাশে পরিশোধিত। প্রতিদিন ১টি পোস্ট দেওয়া হচ্ছে।',
    },
  ],
  dailyTasks: INITIAL_TASKS_TEMPLATE,
  notesAndJournal: [
    {
      id: 'note-1',
      date: new Date().toISOString().split('T')[0],
      note: 'আজ আল-মদিনা ক্লথ স্টোরের প্রথম রিলসটি পাবলিশ করলাম। ২০ মিনিটের মধ্যে ১১টি কমেন্ট এসেছে! আহমেদ ভাই অনেক খুশি।',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class EntrepreneurStorage {
  // Profile
  static getProfile(): EntrepreneurProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read entrepreneur profile from localStorage:', e);
    }
    return DEFAULT_PROFILE;
  }

  static saveProfile(profile: EntrepreneurProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not save entrepreneur profile to localStorage:', e);
    }
  }

  // Projects
  static getProjects(): BusinessProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read entrepreneur projects from localStorage:', e);
    }
    // Return initial default demo project
    return [INITIAL_DEMO_PROJECT];
  }

  static saveProjects(projects: BusinessProject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Could not save entrepreneur projects to localStorage:', e);
    }
  }

  static getActiveProjectId(): string {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
      if (id) return id;
    } catch (e) {
      // fallback
    }
    return INITIAL_DEMO_PROJECT.id;
  }

  static setActiveProjectId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    } catch (e) {
      // fallback
    }
  }

  static getActiveProject(): BusinessProject {
    const projects = this.getProjects();
    const activeId = this.getActiveProjectId();
    const found = projects.find((p) => p.id === activeId);
    return found || projects[0] || INITIAL_DEMO_PROJECT;
  }

  static updateActiveProject(updater: (prev: BusinessProject) => BusinessProject): BusinessProject {
    const projects = this.getProjects();
    const activeId = this.getActiveProjectId();
    const index = projects.findIndex((p) => p.id === activeId);

    if (index === -1) {
      const updated = updater(INITIAL_DEMO_PROJECT);
      projects.push(updated);
      this.saveProjects(projects);
      return updated;
    }

    const updated = updater({
      ...projects[index],
      updatedAt: new Date().toISOString(),
    });
    projects[index] = updated;
    this.saveProjects(projects);
    return updated;
  }

  static createNewProject(params: {
    name: string;
    businessType: BusinessProject['businessType'];
    tagline: string;
    targetAudience: string;
    capitalAllocatedBDT: number;
  }): BusinessProject {
    const newProject: BusinessProject = {
      ...INITIAL_DEMO_PROJECT,
      id: `proj-${Date.now()}`,
      name: params.name,
      businessType: params.businessType,
      tagline: params.tagline,
      targetAudience: params.targetAudience,
      capitalAllocatedBDT: params.capitalAllocatedBDT,
      stage: 'idea_stage',
      leads: [],
      orders: [],
      dailyTasks: INITIAL_TASKS_TEMPLATE.map((t) => ({ ...t, id: `task-${Date.now()}-${t.dayNumber}`, isCompleted: false })),
      notesAndJournal: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projects = this.getProjects();
    projects.unshift(newProject);
    this.saveProjects(projects);
    this.setActiveProjectId(newProject.id);
    return newProject;
  }

  static deleteProject(projectId: string): boolean {
    const projects = this.getProjects();
    if (projects.length <= 1) {
      return false; // don't delete last remaining project
    }
    const filtered = projects.filter((p) => p.id !== projectId);
    this.saveProjects(filtered);
    this.setActiveProjectId(filtered[0].id);
    return true;
  }

  // Backup & Restore
  static exportFullBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      projects: this.getProjects(),
      activeProjectId: this.getActiveProjectId(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.projects)) {
        return { success: false, message: 'ফাইলটিতে সঠিক মোসাফা ব্যাকআপ ডাটা পাওয়া যায়নি।' };
      }

      if (data.profile) {
        this.saveProfile(data.profile);
      }
      this.saveProjects(data.projects);
      if (data.activeProjectId) {
        this.setActiveProjectId(data.activeProjectId);
      } else if (data.projects.length > 0) {
        this.setActiveProjectId(data.projects[0].id);
      }

      return { success: true, message: `${data.projects.length}টি বিজনেস প্রজেক্ট সফলভাবে রিস্টোর হয়েছে!` };
    } catch (e: any) {
      return { success: false, message: `ব্যাকআপ ফাইলটি পড়তে ব্যর্থ হয়েছে: ${e?.message || 'ইনভ্যালিড JSON'}` };
    }
  }
}
