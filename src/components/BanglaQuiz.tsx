import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Share2,
  Shuffle,
  BookOpen,
  Copy,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BanglaQuizProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export interface QuizQuestion {
  id: string;
  category: 'riddle' | 'gk' | 'literature' | 'science';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MASTER_QUESTION_BANK: QuizQuestion[] = [
  // ১. ধাঁধা ও আইকিউ (Riddles & IQ)
  {
    id: 'q1',
    category: 'riddle',
    question: 'কাটলে বাড়ে, না কাটলে ছোট থাকে—বলুন তো এটি কী?',
    options: ['গাছ', 'পেন্সিল', 'পুকুর', 'নখ'],
    correctIndex: 2,
    explanation: 'পুকুর মাটি কেটে খনন করলে তা আয়তনে বাড়ে, আর না কাটলে ভরাট হয়ে ছোট হয়ে যায়!',
  },
  {
    id: 'q2',
    category: 'riddle',
    question: 'মাঠে চরে সবুজ ঘাস খায়, ঘরে এলে সাদা দুধ দেয়—কিন্তু সে কোনো প্রাণী নয়। কী সেটা?',
    options: ['নারিকেল গাছ', 'চা পাতা', 'সুপারি গাছ', 'ধান গাছ'],
    correctIndex: 0,
    explanation: 'নারিকেল গাছে সবুজ পাতা ধরে এবং নারিকেলের ভেতর সুস্বাদু সাদা দুধ/পানি পাওয়া যায়।',
  },
  {
    id: 'q3',
    category: 'riddle',
    question: 'কোন জিনিস যত বেশি টানবেন, তত বেশি ছোট হবে?',
    options: ['দড়ি', 'সিগারেট / বিড়ি', 'রাবার', 'সুতো'],
    correctIndex: 1,
    explanation: 'সিগারেট যত বেশি টানা হয়, আগুনে পুড়ে তা তত বেশি ছোট হয়ে যায়।',
  },
  {
    id: 'q4',
    category: 'riddle',
    question: 'পাখা নেই কিন্তু ওড়ে, চোখ নেই কিন্তু কাঁদে—বলুন তো আমি কে?',
    options: ['বাতাস', 'মেঘ', 'ঘুড়ি', 'বিমান'],
    correctIndex: 1,
    explanation: 'মেঘ আকাশে উড়ে বেড়ায় এবং বৃষ্টির রূপ নিয়ে অঝোর ধারায় কাঁদে!',
  },
  {
    id: 'q5',
    category: 'riddle',
    question: 'মুখ আছে কিন্তু কথা বলে না, বিছানা আছে কিন্তু ঘুমায় না—সে কে?',
    options: ['নদী', 'পাহাড়', 'আয়না', 'দেয়াল'],
    correctIndex: 0,
    explanation: 'নদীর মুখ (মোহনা) থাকে এবং নদীগর্ভকে Riverbed বা নদীর বিছানা বলা হয়।',
  },
  {
    id: 'q6',
    category: 'riddle',
    question: 'হাত আছে পা নেই, পেট আছে মাথা নেই—বলুন তো আমি কী?',
    options: ['শার্ট / জামা', 'ঘড়ি', 'বোতল', 'চেয়ার'],
    correctIndex: 0,
    explanation: 'শার্টের দুটি হাতা থাকে এবং পেটের অংশ থাকে, কিন্তু পা বা মাথা নেই!',
  },
  {
    id: 'q7',
    category: 'riddle',
    question: 'দিনের বেলা ঘুমায় কিন্তু রাতের বেলা কাঁদে—সে কী?',
    options: ['প্যাঁচা', 'মোমবাতি', 'বাদুড়', 'চাঁদ'],
    correctIndex: 1,
    explanation: 'মোমবাতি রাতে জ্বলে এবং গলে গলে মোমের অশ্রু ফেলে!',
  },
  {
    id: 'q8',
    category: 'riddle',
    question: 'এক গাছে বারো ফল, কোনোটা মিষ্টি কোনোটা জল—কী সেটা?',
    options: ['১২ মাস', 'নারিকেল গাছ', 'আম গাছ', 'ঘড়ি'],
    correctIndex: 0,
    explanation: 'বছরের বারোটি মাসের ঋতুভেদকে রূপকভাবে এই ধাঁধায় প্রকাশ করা হয়েছে।',
  },
  {
    id: 'q9',
    category: 'riddle',
    question: 'তিন অক্ষরের নাম তার জলে বাস করে, প্রথম অক্ষর কেটে দিলে ডালে উড়ে যায়—কী সেটা?',
    options: ['চিংড়ি', 'ইলিশ', 'কৈ মাছ', 'চিতল'],
    correctIndex: 0,
    explanation: 'চিংড়ি এর প্রথম অক্ষর ‘চ’ বাদ দিলে থাকে ‘ইংড়ি’ (বা রূপক অর্থে পাখি/পতঙ্গ)।',
  },
  {
    id: 'q10',
    category: 'riddle',
    question: 'কোন জিনিস কিনতে গেলে কালো, পোড়ালে লাল, আর ফেলে দিলে ছাই?',
    options: ['কয়লা', 'লোহা', 'কাঠ', 'প্লাস্টিক'],
    correctIndex: 0,
    explanation: 'কয়লা সাধারণ অবস্থায় কালো, আগুনে জ্বললে লাল বর্ণ ধারণ করে এবং পুড়ে গেলে সাদা ছাই হয়।',
  },
  {
    id: 'q11',
    category: 'riddle',
    question: 'কোন জিনিস সবসময় বাড়ে বা উপরে ওঠে, কিন্তু কখনোই নিচে নামে না?',
    options: ['বয়স', 'গাছ', 'বেলুন', 'উচ্চতা'],
    correctIndex: 0,
    explanation: 'মানুষের বয়স প্রতিনিয়ত বাড়তে থাকে, কখনো কমে না!',
  },
  {
    id: 'q12',
    category: 'riddle',
    question: 'এমন কী জিনিস যা ভাঙলে সবার আগে বেশি কাজে লাগে?',
    options: ['ডিম', 'কাচ', 'প্রতিশ্রুতি', 'কলম'],
    correctIndex: 0,
    explanation: 'ডিম না ভেঙে রান্না করা বা খাওয়া যায় না, তাই ভাঙার পরেই এটি কাজে লাগে!',
  },
  {
    id: 'q13',
    category: 'riddle',
    question: 'কোন জিনিস যত বেশি মুছবেন বা শুকাবেন, তত বেশি ভিজে যাবে?',
    options: ['তোয়ালে / গামছা', 'স্পঞ্জ', 'কাগজ', 'সাবান'],
    correctIndex: 0,
    explanation: 'তোয়ালে দিয়ে ভেজা শরীর মুছলে তোয়ালে নিজে ভিজে যায়!',
  },
  {
    id: 'q14',
    category: 'riddle',
    question: 'কোন ঘরে কোনো দরজা বা জানালা নেই?',
    options: ['মাশরুম / ব্যাঙের ছাতা', 'মসজিদ', 'গুহা', 'কবরের ঘর'],
    correctIndex: 0,
    explanation: 'মাশরুম বা ব্যাঙের ছাতার কোনো দরজা-জানালা থাকে না।',
  },
  {
    id: 'q15',
    category: 'riddle',
    question: 'কোন পাখি উড়তে পারে না, কিন্তু সাঁতার কাটতে খুব পারদর্শী?',
    options: ['পেঙ্গুইন', 'উটপাখি', 'কাকাতুয়া', 'ময়ূর'],
    correctIndex: 0,
    explanation: 'পেঙ্গুইন ডানা দিয়ে উড়তে পারে না, তবে পানির নিচে দ্রুত সাঁতার কাটে।',
  },
  {
    id: 'q16',
    category: 'riddle',
    question: 'এক থালা সুপারি, গুনতে পারে কোন বেপারী?',
    options: ['আকাশের তারা', 'ধানের শিষ', 'বৃষ্টির ফোঁটা', 'বালির কণা'],
    correctIndex: 0,
    explanation: 'আকাশ রূপী থালায় তারার সুপারি কেউ গণনা করে শেষ করতে পারে না।',
  },

  // ২. সাধারণ জ্ঞান (General Knowledge)
  {
    id: 'q17',
    category: 'gk',
    question: 'বাংলাদেশের জাতীয় পতাকার দৈর্ঘ্য ও প্রস্থের সরকারি সঠিক অনুপাত কত?',
    options: ['৩:২', '৫:৩', '১০:৬ (বা ৫:৩)', '৪:৩'],
    correctIndex: 2,
    explanation: 'বাংলাদেশের জাতীয় পতাকার সরকারি অনুপাত ১০:৬ (বা সরল অনুপাতে ৫:৩)।',
  },
  {
    id: 'q18',
    category: 'gk',
    question: 'পৃথিবীর বৃহত্তম ম্যানগ্রোভ বন সুন্দরবনের কত শতাংশ অংশ বাংলাদেশে অবস্থিত?',
    options: ['৪০%', '৫০%', '৬০%', '৭০%'],
    correctIndex: 2,
    explanation: 'সুন্দরবনের মোট আয়তনের প্রায় ৬০% বাংলাদেশে এবং বাকি ৪০% ভারতে অবস্থিত।',
  },
  {
    id: 'q19',
    category: 'gk',
    question: 'বাংলাদেশের সংবিধান কত তারিখে গণপরিষদে গৃহীত হয়?',
    options: ['৪ নভেম্বর ১৯৭২', '১৬ ডিসেম্বর ১৯৭২', '২৬ মার্চ ১৯৭২', '৭ মার্চ ১৯৭২'],
    correctIndex: 0,
    explanation: '১৯৭২ সালের ৪ নভেম্বর সংবিধান গৃহীত হয় এবং একই বছরের ১৬ ডিসেম্বর থেকে কার্যকর হয়।',
  },
  {
    id: 'q20',
    category: 'gk',
    question: 'আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে ২১শে ফেব্রুয়ারিকে স্বীকৃতি দেয় কোন সংস্থা?',
    options: ['ইউনিসেফ', 'ইউনেস্কো', 'ইউএনও', 'বিশ্বব্যাংক'],
    correctIndex: 1,
    explanation: '১৯৯৯ সালের ১৭ নভেম্বর ইউনেস্কো ২১শে ফেব্রুয়ারিকে আন্তর্জাতিক মাতৃভাষা দিবস ঘোষণা করে।',
  },
  {
    id: 'q21',
    category: 'gk',
    question: 'বাংলাদেশের একমাত্র প্রাকৃতিক প্রবাল দ্বীপ কোনটি?',
    options: ['মহেশখালী', 'সেন্টমার্টিন', 'হাতিয়া', 'মনপুরা'],
    correctIndex: 1,
    explanation: 'সেন্টমার্টিন দ্বীপ বাংলাদেশের একমাত্র প্রাকৃতিক প্রবাল দ্বীপ।',
  },
  {
    id: 'q22',
    category: 'gk',
    question: 'পদ্মা সেতুর মোট দৈর্ঘ্য কত কিলোমিটার?',
    options: ['৪.৮ কিমি', '৫.১৫ কিমি', '৬.১৫ কিমি', '৭.২ কিমি'],
    correctIndex: 2,
    explanation: 'পদ্মা সেতুর মূল কাঠামোর দৈর্ঘ্য ৬.১৫ কিলোমিটার এবং মোট ৪১টি স্প্যান রয়েছে।',
  },
  {
    id: 'q23',
    category: 'gk',
    question: 'বাংলাদেশের সর্বউত্তরের জেলার নাম কী?',
    options: ['ঠাকুরগাঁও', 'পঞ্চগড়', 'নীলফামারী', 'কুড়িগ্রাম'],
    correctIndex: 1,
    explanation: 'পঞ্চগড় জেলা বাংলাদেশের সর্বউত্তরে অবস্থিত (বাংলাবান্ধা জিরো পয়েন্ট)।',
  },
  {
    id: 'q24',
    category: 'gk',
    question: 'বঙ্গবন্ধু স্যাটেলাইট-১ কত সালে মহাকাশে সফলভাবে উৎক্ষেপণ করা হয়?',
    options: ['২০১৬', '২০১৭', '২০১৮', '২০১৯'],
    correctIndex: 2,
    explanation: '২০১৮ সালের ১২ মে যুক্তরাষ্ট্রের ফ্লোরিডার কেনেডি স্পেস সেন্টার থেকে এটি উৎক্ষেপিত হয়।',
  },
  {
    id: 'q25',
    category: 'gk',
    question: 'মুক্তিযুদ্ধে অসামান্য বীরত্বের জন্য বীরশ্রেষ্ঠ উপাধি দেওয়া হয় কতজনকে?',
    options: ['৭ জন', '৮ জন', '১২ জন', '৬৮ জন'],
    correctIndex: 0,
    explanation: 'মুক্তিযুদ্ধে জীবন উৎসর্গকারী ৭ জন বীর মুক্তিযোদ্ধাকে বীরশ্রেষ্ঠ খেতাব প্রদান করা হয়।',
  },
  {
    id: 'q26',
    category: 'gk',
    question: 'বিশ্বের বৃহত্তম ব-দ্বীপ (Delta) কোনটি?',
    options: ['নীলনদ বদ্বীপ', 'বাংলাদেশ (গঙ্গা-ব্রহ্মপুত্র বদ্বীপ)', 'আমাজন বদ্বীপ', 'মিসিসিপি'],
    correctIndex: 1,
    explanation: 'বাংলাদেশ পৃথিবীর সর্ববৃহৎ সক্রিয় ব-দ্বীপ হিসেবে আন্তর্জাতিকভাবে স্বীকৃত।',
  },

  // ৩. সাহিত্য ও ভাষা (Literature & Language)
  {
    id: 'q27',
    category: 'literature',
    question: '‘গীতাঞ্জলি’ কাব্যগ্রন্থের জন্য রবীন্দ্রনাথ ঠাকুর কত সালে নোবেল পুরস্কার পান?',
    options: ['১৯১১', '১৯১৩', '১৯১৫', '১৯২১'],
    correctIndex: 1,
    explanation: '১৯১৩ সালে সাহিত্যের প্রথম এশীয় হিসেবে রবীন্দ্রনাথ ঠাকুর নোবেল জয় করেন।',
  },
  {
    id: 'q28',
    category: 'literature',
    question: 'বাংলা সাহিত্যের প্রথম মহাকাব্য কোনটি?',
    options: ['পদ্মাবতী', 'মেঘনাদবধ কাব্য', 'অন্নদামঙ্গল', 'মনসামঙ্গল'],
    correctIndex: 1,
    explanation: 'মাইকেল মধুসূদন দত্ত রচিত ‘মেঘনাদবধ কাব্য’ বাংলা সাহিত্যের প্রথম সার্থক মহাকাব্য।',
  },
  {
    id: 'q29',
    category: 'literature',
    question: 'কাজী নজরুল ইসলামের বিখ্যাত ‘বিদ্রোহী’ কবিতাটি কোন কাব্যগ্রন্থের অন্তর্ভুক্ত?',
    options: ['অগ্নিবীণা', 'বিষের বাঁশী', 'সাম্যবাদী', 'সর্বহারা'],
    correctIndex: 0,
    explanation: '১৯২২ সালে প্রকাশিত ‘অগ্নিবীণা’ কাব্যগ্রন্থের দ্বিতীয় কবিতা ছিল ‘বিদ্রোহী’।',
  },
  {
    id: 'q30',
    category: 'literature',
    question: '‘লালসালু’ উপন্যাসের রচয়িতা কে?',
    options: ['শওকত ওসমান', 'সৈয়দ ওয়ালীউল্লাহ', 'হুমায়ূন আহমেদ', 'জহির রায়হান'],
    correctIndex: 1,
    explanation: 'মজিদ চরিত্রকে কেন্দ্র করে কুসংস্কারের চিত্র তুলে ধরে সৈয়দ ওয়ালীউল্লাহ ‘লালসালু’ রচনা করেন।',
  },
  {
    id: 'q31',
    category: 'literature',
    question: 'বাংলা বর্ণমালায় মোট কয়টি মাত্রাহীন বর্ণ রয়েছে?',
    options: ['৮টি', '১০টি', '১২টি', '৭টি'],
    correctIndex: 1,
    explanation: 'বাংলা বর্ণমালায় মাত্রাহীন বর্ণ রয়েছে মোট ১০টি (স্বরবর্ণ ৪টি, ব্যঞ্জনবর্ণ ৬টি)।',
  },
  {
    id: 'q32',
    category: 'literature',
    question: '‘পদ্মা নদীর মাঝি’ কালজয়ী উপন্যাসের রচয়িতা কে?',
    options: ['মানিক বন্দ্যোপাধ্যায়', 'তারাশঙ্কর বন্দ্যোপাধ্যায়', 'বিভূতিভূষণ বন্দ্যোপাধ্যায়', 'শরৎচন্দ্র চট্টোপাধ্যায়'],
    correctIndex: 0,
    explanation: 'কুবের ও কপিলা চরিত্রকে উপজীব্য করে মানিক বন্দ্যোপাধ্যায় ‘পদ্মা নদীর মাঝি’ রচনা করেন।',
  },
  {
    id: 'q33',
    category: 'literature',
    question: 'বাংলা সাহিত্যের প্রাচীনতম নিদর্শন ‘চর্যাপদ’ কে আবিষ্কার করেন?',
    options: ['ড. মুহম্মদ শহীদুল্লাহ', 'হরপ্রসাদ শাস্ত্রী', 'সুনীতিকুমার চট্টোপাধ্যায়', 'ঈশ্বরচন্দ্র বিদ্যাসাগর'],
    correctIndex: 1,
    explanation: '১৯০৭ সালে নেপালের রাজদরবারের রয়্যাল লাইব্রেরি থেকে মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী এটি আবিষ্কার করেন।',
  },
  {
    id: 'q34',
    category: 'literature',
    question: 'কাজী নজরুল ইসলামকে কত সালে বাংলাদেশের জাতীয় কবি ঘোষণা করা হয়?',
    options: ['১৯৭২ সালে', '১৯৭১ সালে', '১৯৭৫ সালে', '১৯৭৬ সালে'],
    correctIndex: 0,
    explanation: '১৯৭২ সালের ২৪ মে কবিকে ঢাকায় আনা হয় এবং জাতীয় কবির মর্যাদা দেওয়া হয়।',
  },
  {
    id: 'q35',
    category: 'literature',
    question: '‘কবর’ নাটকের পটভূমি কী ছিল?',
    options: ['ভাষা আন্দোলন ১৯৫২', 'মুক্তিযুদ্ধ ১৯৭১', 'তেভাগা আন্দোলন', 'ছয় দফা ১৯৬৬'],
    correctIndex: 0,
    explanation: 'মুনীর চৌধুরী ১৯৫২ সালের ভাষা আন্দোলনের পটভূমিতে জেলে বসে ‘কবর’ নাটক রচনা করেন।',
  },

  // ৪. বিজ্ঞান ও প্রযুক্তি (Science & Tech)
  {
    id: 'q36',
    category: 'science',
    question: 'সূর্য থেকে পৃথিবীতে আলো পৌঁছাতে আনুমানিক কত সময় লাগে?',
    options: ['৫ মিনিট', '৮ মিনিট ২০ সেকেন্ড', '১০ মিনিট', '১২ মিনিট'],
    correctIndex: 1,
    explanation: 'সূর্য থেকে পৃথিবীতে আলো পৌঁছাতে প্রায় ৫০০ সেকেন্ড বা ৮ মিনিট ২০ সেকেন্ড সময় লাগে।',
  },
  {
    id: 'q37',
    category: 'science',
    question: 'মানবদেহের সবচেয়ে বড় অঙ্গ (Organ) কোনটি?',
    options: ['যকৃৎ (Liver)', 'ত্বক (Skin)', 'ফুসফুস', 'হৃদপিণ্ড'],
    correctIndex: 1,
    explanation: 'মানবদেহের বহিরাঙ্গ হিসেবে ত্বক (Skin) হলো সবচেয়ে বড় অঙ্গ।',
  },
  {
    id: 'q38',
    category: 'science',
    question: 'কম্পিউটারের মস্তিষ্ক হিসেবে পরিচিত কোন যন্ত্রাংশটি?',
    options: ['র‍্যাম (RAM)', 'সিপিইউ (CPU)', 'হার্ডডিস্ক', 'মাদারবোর্ড'],
    correctIndex: 1,
    explanation: 'CPU (Central Processing Unit) সমস্ত ডাটা ও নির্দেশনা প্রসেস করে বলে একে মস্তিষ্ক বলা হয়।',
  },
  {
    id: 'q39',
    category: 'science',
    question: 'বায়ুমণ্ডলে সর্বাধিক পরিমাণে বিদ্যমান গ্যাস কোনটি?',
    options: ['অক্সিজেন', 'কার্বন ডাই অক্সাইড', 'নাইট্রোজেন', 'হাইড্রোজেন'],
    correctIndex: 2,
    explanation: 'বায়ুমণ্ডলে প্রায় ৭৮.০৯% নাইট্রোজেন গ্যাস বিদ্যমান।',
  },
  {
    id: 'q40',
    category: 'science',
    question: 'পানিতে দ্রবণীয় ভিটামিন কোনটি?',
    options: ['ভিটামিন A', 'ভিটামিন D', 'ভিটামিন C', 'ভিটামিন K'],
    correctIndex: 2,
    explanation: 'ভিটামিন B এবং ভিটামিন C পানিতে দ্রবণীয়; বাকি ভিটামিন চর্বিতে দ্রবণীয়।',
  },
  {
    id: 'q41',
    category: 'science',
    question: 'কোন রক্ত গ্রুপকে সর্বজনীন দাতা (Universal Donor) বলা হয়?',
    options: ['A+', 'B+', 'AB+', 'O- (বা O গ্রুপ)'],
    correctIndex: 3,
    explanation: 'O নেগেটিভ রক্তে কোনো অ্যান্টিজেন থাকে না, তাই এটি যে কাউকে দেওয়া যায়।',
  },
  {
    id: 'q42',
    category: 'science',
    question: 'গাছের পাতা সবুজ দেখায় কোন রঞ্জক পদার্থের কারণে?',
    options: ['হিমোগ্লোবিন', 'ক্লোরোফিল', 'ক্যারোটিন', 'মেলানিন'],
    correctIndex: 1,
    explanation: 'ক্লোরোফিলের কারণে উদ্ভিদ সবুজ দেখায় এবং সালোকসংশ্লেষণ প্রক্রিয়ায় খাদ্য তৈরি করে।',
  },
  {
    id: 'q43',
    category: 'science',
    question: 'বিদ্যুতের সর্বোত্তম সুপরিবাহী ধাতু কোনটি?',
    options: ['লোহা', 'তামা (কপার)', 'রূপা (সিলভার)', 'স্বর্ণ'],
    correctIndex: 2,
    explanation: 'রূপা বা সিলভার ধাতুর রোধ সবচেয়ে কম হওয়ায় এটি বিদ্যুতের শ্রেষ্ঠ পরিবাহী।',
  },
  {
    id: 'q44',
    category: 'science',
    question: 'চাঁদে কোনো বস্তুর ওজন পৃথিবীর তুলনায় কত গুণ হয়?',
    options: ['সমান', '১/৬ গুণ', 'দ্বিগুণ', '১/২ গুণ'],
    correctIndex: 1,
    explanation: 'চাঁদের অভিকর্ষ বল পৃথিবীর প্রায় ৬ ভাগের ১ ভাগ হওয়ায় সেখানে ওজন কমে যায়।',
  },
  {
    id: 'q45',
    category: 'science',
    question: 'পরমাণুর নিউক্লিয়াসে কোন দুটি মৌলিক কণা থাকে?',
    options: ['ইলেকট্রন ও প্রোটন', 'প্রোটন ও নিউট্রন', 'ইলেকট্রন ও নিউট্রন', 'শুধু প্রোটন'],
    correctIndex: 1,
    explanation: 'পরমাণুর কেন্দ্রে প্রোটন ও নিউট্রন থাকে, আর ইলেকট্রনগুলো বাইরে কক্ষপথে ঘোরে।',
  },
];

// Helper to shuffle array randomly
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const toBanglaNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const BanglaQuiz: React.FC<BanglaQuizProps> = ({ onBackToHub, onShowToast }) => {
  const [category, setCategory] = useState<string>('all');
  const [activeQuestionSet, setActiveQuestionSet] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);

  // Load high score
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mosafa_quiz_high_score');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  // Initialize and randomize question set - guarantees fresh 10 questions every round!
  const loadFreshQuestions = (cat = category) => {
    const filtered = MASTER_QUESTION_BANK.filter((q) =>
      cat === 'all' ? true : q.category === cat
    );
    // Shuffle pool completely
    const randomized = shuffleArray(filtered);
    // Take a random batch of 10 questions (or all if fewer)
    const batch = randomized.slice(0, 10);
    // Also randomize options order for each question
    const finalSet = batch.map((q) => {
      const correctText = q.options[q.correctIndex];
      const shuffledOpts = shuffleArray(q.options);
      return {
        ...q,
        options: shuffledOpts,
        correctIndex: shuffledOpts.indexOf(correctText),
      };
    });

    setActiveQuestionSet(finalSet);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  useEffect(() => {
    loadFreshQuestions(category);
  }, [category]);

  const activeQuestion = activeQuestionSet[currentIndex] || activeQuestionSet[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !activeQuestion) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === activeQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestionSet.length) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsQuizFinished(true);
    const finalScore = selectedOption === activeQuestion?.correctIndex ? score + 1 : score;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('mosafa_quiz_high_score', String(finalScore));
      } catch {}
    }

    if (finalScore >= Math.floor(activeQuestionSet.length * 0.7)) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const downloadCertificate = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // Background Gradient - Golden Amber Intellectual Theme
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, '#b45309');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Ornate Border
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 5;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(35, 35, W - 70, H - 70);

    // Header
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE MOSAFA TOOLS • মেধা ও বুদ্ধিদীপ্ত কুইজ চ্যালেঞ্জ', W / 2, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
    ctx.fillText('বাংলা কুইজ মেধা সনদপত্র 🏆', W / 2, 130);

    // Score box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(80, 180, W - 160, 260, 24);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 64px "Hind Siliguri", sans-serif';
    ctx.fillText(`${toBanglaNum(score)} / ${toBanglaNum(activeQuestionSet.length)}`, W / 2, 280);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
    const pct = Math.round((score / Math.max(1, activeQuestionSet.length)) * 100);
    ctx.fillText(`সফলতার হার: ${toBanglaNum(pct)}%`, W / 2, 335);

    const titleText =
      pct >= 80 ? '🌟 অসাধারণ জিনিয়াস! শীর্ষস্থানীয় মেধার অধিকারী!' :
      pct >= 50 ? '👏 প্রশংসনীয় পারফরম্যান্স! ভালো জ্ঞান ও বুদ্ধিমত্তা!' :
      '💪 নিয়মিত অনুশীলনে আরও ভালো ফলাফল সম্ভব!';
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 17px "Hind Siliguri", sans-serif';
    ctx.fillText(titleText, W / 2, 385);

    // Footer info
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px "Hind Siliguri", sans-serif';
    ctx.fillText(`ক্যাটাগরি: ${category === 'all' ? 'সকল বিষয়' : category === 'riddle' ? 'ধাঁধা' : category === 'gk' ? 'সাধারণ জ্ঞান' : category === 'literature' ? 'সাহিত্য' : 'বিজ্ঞান'} • তারিখ: ${new Date().toLocaleDateString('bn-BD')}`, W / 2, 500);

    ctx.fillText('The MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল', W / 2, 730);

    const link = document.createElement('a');
    link.download = `MoSaFa-Quiz-Certificate-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('কুইজ সনদ কার্ড ডাউনলোড সম্পন্ন! 🏆', '🎉');
  };

  const copyQuizScore = async () => {
    const text = `🧩 বাংলা কুইজ চ্যালেঞ্জ (The MoSaFa Tools):\n` +
      `আমার স্কোর: ${toBanglaNum(score)} / ${toBanglaNum(activeQuestionSet.length)}\n` +
      `সফলতার হার: ${toBanglaNum(Math.round((score / Math.max(1, activeQuestionSet.length)) * 100))}%\n` +
      `ক্যাটাগরি: ${category === 'all' ? 'সকল বিষয়' : category}\n` +
      `আপনিও আপনার বুদ্ধিমত্তা যাচাই করুন The MoSaFa Tools-এ!`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('কুইজের স্কোর কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('কুইজের স্কোর কপি হয়েছে! 📋', '✅');
    }
  };

  const handleRestartFresh = () => {
    loadFreshQuestions(category);
    onShowToast('নতুন ভিন্ন প্রশ্নের সেট লোড হয়েছে! 🔀', '✨');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-amber-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Bangla Riddles & Quiz
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                র‍্যান্ডম প্রশ্ন চ্যালেঞ্জ 🔀
              </span>
            </div>
            <p className="text-xs text-slate-500">প্রতিবার নতুন ও ভিন্ন ভিন্ন ধাঁধা, সাধারণ জ্ঞান ও আইকিউ প্রশ্ন</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>সেরা স্কোর: {toBanglaNum(highScore)}</span>
          </div>
          <button
            onClick={handleRestartFresh}
            className="px-3 py-1.5 rounded-xl bg-white text-amber-800 hover:bg-amber-50 border border-slate-200 text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
            title="নতুন প্রশ্ন সেট লোড করুন"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span>ভিন্ন প্রশ্ন 🔀</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        {!isQuizFinished && activeQuestion ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            {/* Category Filter Pills & Progress */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {[
                  { id: 'all', label: 'সকল' },
                  { id: 'riddle', label: 'ধাঁধা' },
                  { id: 'gk', label: 'সাধারণ জ্ঞান' },
                  { id: 'literature', label: 'সাহিত্য' },
                  { id: 'science', label: 'বিজ্ঞান' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategory(c.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      category === c.id ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-slate-700">
                  {toBanglaNum(currentIndex + 1)} / {toBanglaNum(activeQuestionSet.length)}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  স্কোর: {toBanglaNum(score)}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 mb-2 inline-block">
                {activeQuestion.category === 'riddle'
                  ? 'মজার ধাঁধা 🤔'
                  : activeQuestion.category === 'gk'
                  ? 'সাধারণ জ্ঞান 🌍'
                  : activeQuestion.category === 'literature'
                  ? 'সাহিত্য ও ভাষা 📖'
                  : 'বিজ্ঞান ও প্রযুক্তি 🔬'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {activeQuestion.question}
              </h3>
            </div>

            {/* Option Choices */}
            <div className="space-y-2.5 mb-6">
              {activeQuestion.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                if (isAnswered) {
                  if (idx === activeQuestion.correctIndex) {
                    btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 font-bold';
                  } else {
                    btnStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswered && idx === activeQuestion.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== activeQuestion.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {isAnswered && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 animate-in fade-in duration-200">
                <span className="font-bold block mb-1">
                  {selectedOption === activeQuestion.correctIndex ? '🎉 দারুণ! সঠিক উত্তর!' : '❌ ভুল উত্তর!'}
                </span>
                <p className="leading-relaxed font-medium">ব্যাখ্যা: {activeQuestion.explanation}</p>
              </div>
            )}

            {/* Next / Submit Button */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-200 transition active:scale-95 cursor-pointer"
              >
                {currentIndex + 1 < activeQuestionSet.length ? 'পরবর্তী প্রশ্ন ➡️' : 'ফলাফল দেখুন 🏆'}
              </button>
            )}
          </div>
        ) : (
          /* Result Summary Card */
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Award className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">কুইজ সম্পন্ন হয়েছে!</h3>
            <p className="text-xs text-slate-500 mb-5">আপনার প্রাপ্ত স্কোর ও বুদ্ধিমত্তার ফলাফল</p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">প্রাপ্ত স্কোর</span>
                <span className="text-2xl font-black text-amber-800">
                  {toBanglaNum(score)} / {toBanglaNum(activeQuestionSet.length)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">সফলতার হার</span>
                <span className="text-2xl font-black text-emerald-800">
                  {toBanglaNum(Math.round((score / Math.max(1, activeQuestionSet.length)) * 100))}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleRestartFresh}
                className="py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-200 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Shuffle className="w-4 h-4" />
                <span>ভিন্ন প্রশ্ন সেট 🔀</span>
              </button>
              <button
                onClick={copyQuizScore}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Copy className="w-4 h-4 text-amber-600" />
                <span>স্কোর কপি</span>
              </button>
              <button
                onClick={downloadCertificate}
                className="py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 text-white font-bold text-xs shadow-md shadow-amber-200 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>সনদপত্র (PNG)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Hidden canvas for certificate download */}
      <canvas ref={certCanvasRef} className="hidden" />
    </div>
  );
};
