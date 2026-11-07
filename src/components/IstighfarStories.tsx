import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  Plus,
  Search,
  Share2,
  Copy,
  Check,
  Heart,
  Volume2,
  VolumeX,
  RotateCcw,
  Trash2,
  Edit3,
  X,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Award,
  Bookmark,
  BookmarkCheck,
  Calendar,
  User,
  Sliders,
  Flame,
  Info,
} from 'lucide-react';
import { storySubmissionService } from '../services/storySubmissionService';
import { StorySubmissionModal } from './StorySubmissionModal';

export interface IstighfarStory {
  id: string;
  title: string;
  category: 'rizq' | 'shifa' | 'dua_accepted' | 'child' | 'distress' | 'general';
  categoryLabel: string;
  narrator: string;
  sourceType: 'hadith_athar' | 'real_experience' | 'classical';
  amalDescription: string;
  content: string[];
  lesson: string;
  reference?: string;
  createdAt: number;
  isUserAdded?: boolean;
}

// 6 Curated Authentic & Inspiring Stories
const DEFAULT_ISTIGHFAR_STORIES: IstighfarStory[] = [
  {
    id: 'story-ahmad-baker',
    title: 'ইমাম আহমদ ইবনে হাম্বল (রহ.) ও রুটি প্রস্তুতকারকের অলৌকিক দোয়া কবুল',
    category: 'dua_accepted',
    categoryLabel: 'অসম্ভব দোয়া কবুল',
    narrator: 'হাদিস ও ইতিহাসের বিখ্যাত ঘটনা',
    sourceType: 'classical',
    amalDescription: 'প্রতিটি কাজের সাথে অবিরাম "আস্তাগফিরুল্লাহ" পাঠ',
    reference: 'আল-বিদায়া ওয়ান নিহায়া ও সিফাতুস সাফওয়া',
    createdAt: 1,
    content: [
      'ইসলামের অন্যতম শ্রেষ্ঠ ইমাম, ইমাম আহমদ ইবনে হাম্বল (রহ.) একবার কোনো এক দূরবর্তী শহরে সফরে গেলেন। গভীর রাতে তিনি সেখানকার এক মসজিদে এশার নামাজ আদায় করলেন এবং রাত কাটানোর জন্য মসজিদের এক কোণে শুয়ে পড়লেন।',
      'কিন্তু মসজিদের প্রহরীরা তাঁকে চিনতে পারেনি। তারা এসে ইমাম আহমদকে মসজিদ থেকে বের হয়ে যেতে বলল। তিনি বললেন, "আমি একজন বৃদ্ধ মুসাফির, রাতটুকু এখানে একটু ঘুমিয়ে সকালে চলে যাব।" কিন্তু প্রহরীরা কর্কশ ব্যবহার করে তাঁকে হাত ধরে টেনে মসজিদের বাইরে রাস্তায় নামিয়ে দিল।',
      'ঠিক সেই সময় রাস্তার উল্টো পাশে থাকা একটি রুটির দোকানের মালিক বিষয়টি দেখছিলেন। তিনি এগিয়ে এসে ইমাম আহমদকে পরম শ্রদ্ধার সাথে বললেন, "হে সম্মানিত বৃদ্ধ, আপনি আমার ঘরে চলুন। আজ রাতটুকু আমার দোকানেই আরাম করুন।"',
      'ইমাম আহমদ রুটি বিক্রেতার দোকানে গিয়ে বসলেন। তিনি লক্ষ্য করলেন, রুটি প্রস্তুতকারী যখনই আটার খামির তৈরি করছেন, রুটি বেলছেন বা চুলায় দিচ্ছেন—প্রতিটি সেকেন্ডে তার ঠোঁট অবিরাম নড়ছে এবং তিনি ভক্তিভরে পাঠ করছেন: "আস্তাগফিরুল্লাহ... আস্তাগফিরুল্লাহ..."।',
      'সারা রাত ধরে এই দৃশ্য দেখে অবাক হয়ে ভোরে ইমাম আহমদ তাঁকে জিজ্ঞাসা করলেন, "হে ভাই! আমি লক্ষ্য করলাম আপনি রাতভর অবিরাম ইস্তেগফার করছেন। আপনি কি এই আমলের কোনো বিশেষ বরকত ও ফল নিজের জীবনে দেখতে পেয়েছেন?"',
      'রুটি বিক্রেতা স্মিত হেসে উত্তর দিলেন, "আলহামদুলিল্লাহ! আল্লাহর শপথ, জীবনে আমি আল্লাহর কাছে যত দোয়া চেয়েছি—তিনি আমার প্রতিটি দোয়াই কবুল করেছেন। শুধু একটি মাত্র দোয়া এখনো বাকি আছে।"',
      'ইমাম আহমদ কৌতূহলী হয়ে জিজ্ঞাসা করলেন, "সেই কোন দোয়াটি যা এখনো কবুল হয়নি?"',
      'রুটি বিক্রেতা বললেন, "আমি বহু বছর ধরে প্রতি রাতে আল্লাহর কাছে একটিই ফরিয়াদ করে আসছি—হে আল্লাহ! মৃত্যুর আগে যেন আমি উম্মতের শ্রেষ্ঠ আলেম ও মুহাদ্দিস ইমাম আহমদ ইবনে হাম্বলের সাথে একবার মোলাকাত করতে পারি! কিন্তু আমি গরিব মানুষ, বাগদাদে যাওয়ার সামর্থ্য আমার নেই।"',
      'একথা শুনে ইমাম আহমদ ইবনে হাম্বলের চোখ দিয়ে অশ্রু গড়িয়ে পড়ল। তিনি আবেগাপ্লুত কণ্ঠে বললেন, "সুবহানাল্লাহ! আপনার দোয়া কেবল কবুলই হয়নি, বরং স্বয়ং আল্লাহ তায়ালা সেই আহমদ ইবনে হাম্বলকে টেনে-হিঁচড়ে আপনার দরজায় এনে হাজির করেছেন! আমিই সেই আহমদ ইবনে হাম্বল!"',
      'রুটি বিক্রেতা আনন্দে কান্নায় ভেঙে পড়লেন এবং ইমাম আহমদকে জড়িয়ে ধরলেন। সার্বক্ষণিক ইস্তেগফারের শক্তিতে এক সাধারণ রুটিওয়ালার দোয়ায় উম্মতের শ্রেষ্ঠ ইমাম তার বাড়িতে চলে এসেছিলেন।'
    ],
    lesson: 'সার্বক্ষণিক ইস্তেগফারের মাধ্যমে এমন সব দরজা খুলে যায় যা মানুষ কল্পনাও করতে পারে না। যে ব্যক্তি ইস্তেগফারকে নিজের সঙ্গী বানায়, আল্লাহ তার সকল দোয়া কবুল করেন।'
  },
  {
    id: 'story-hasan-basri',
    title: 'হাসান আল-বসরী (রহ.) ও চার ব্যক্তির চার সমস্যার এক মহা সমাধান',
    category: 'rizq',
    categoryLabel: 'রিজিক ও অভাব দূর',
    narrator: 'ইমাম হাসান আল-বসরী (রহ.)-এর ঘটনা',
    sourceType: 'hadith_athar',
    amalDescription: 'দৈনিক ইস্তেগফারের ধারাবাহিক আমল (সূরা নূহ: ১০-১২)',
    reference: 'তাফসিরে কুরতুবি (সূরা নূহের তাফসির)',
    createdAt: 2,
    content: [
      'একবার বিশিষ্ট তাবেয়ী হজরত হাসান আল-বসরী (রহ.)-এর মজলিসে এক ব্যক্তি এসে অত্যন্ত ব্যথিত হয়ে বলল, "হে ইমাম! আমাদের এলাকায় দীর্ঘদিন ধরে তীব্র খরা ও অনাবৃষ্টি চলছে। মাঠ-ঘাট ফেটে চৌচির, ফসল নষ্ট হয়ে যাচ্ছে। আমরা পানির জন্য হাহাকার করছি। এর থেকে মুক্তির কোনো দোয়া বা আমল বাতলে দিন।" হাসান আল-বসরী (রহ.) বললেন, "তুমি আল্লাহর কাছে খাঁটি দিলে ইস্তেগফার করো।"',
      'কিছুক্ষণ পর দ্বিতীয় এক ব্যক্তি এসে বলল, "হে শায়খ! আমি দীর্ঘদিন ধরে চরম দারিদ্র্য ও ঋণের বোঝায় জর্জরিত। আমার পরিবারে অভাবের শেষ নেই। আমাকে এমন কোনো পথ দেখান যাতে আমার রিজিক বৃদ্ধি পায়।" হাসান আল-বসরী (রহ.) তাকেও একই উত্তর দিলেন: "তুমি আল্লাহর কাছে বেশি বেশি ইস্তেগফার করো।"',
      'এরপর তৃতীয় এক ব্যক্তি এসে ফরিয়াদ জানাল, "হে ইমাম! বিয়ের বহু বছর পেরিয়ে গেলেও আমাদের কোনো সন্তান হচ্ছে না। আমার কোল শূন্য। আল্লাহর কাছে একটি নেক সন্তানের জন্য কী আমল করব?" হাসান আল-বসরী (রহ.) তাকেও বললেন, "তুমি ও তোমার স্ত্রী বেশি বেশি ইস্তেগফার করো।"',
      'অতঃপর চতুর্থ আরেক ব্যক্তি এসে বলল, "হে সম্মানিত শায়খ! আমার ফলের বাগানে কোনো বরকত নেই। গাছপালা শুকিয়ে যাচ্ছে, ফলন হচ্ছে না।" হাসান আল-বসরী (রহ.) তাকেও বললেন, "তুমি আল্লাহর কাছে ইস্তেগফার করো।"',
      'মজলিসে উপস্থিত শিষ্য হজরত রবী ইবনে সুবাইহ (রহ.) অবাক হয়ে বললেন, "হে ইমাম! চারজন ব্যক্তি ভিন্ন ভিন্ন চারটি গুরুতর সমস্যার কথা নিয়ে আপনার কাছে এলো—অনাবৃষ্টি, দারিদ্র্য, নিঃসন্তানতা ও ফসলের অভাব। অথচ আপনি সবাইকে একই উপদেশ দিলেন: কেবল ইস্তেগফার করতে! এর রহস্য কী?"',
      'হাসান আল-বসরী (রহ.) মুচকি হেসে বললেন, "আমি তো আমার নিজের মনগড়া কোনো কথা বলিনি। স্বয়ং আল্লাহ তায়ালা পবিত্র কুরআনে সূরা নূহের ১০ থেকে ১২ নম্বর আয়াতে কী ঘোষণা করেছেন তা কি তোমরা শোননি?"',
      'এরপর তিনি তিলাওয়াত করলেন: "অতঃপর আমি বলেছি, তোমরা তোমাদের প্রতিপালকের কাছে ক্ষমা প্রার্থনা করো (ইস্তেগফার করো), নিশ্চয় তিনি মহাক্ষমাশীল। তিনি তোমাদের জন্য আকাশ থেকে প্রচুর বৃষ্টি বর্ষণ করবেন, এবং তোমাদের ধন-সম্পদ ও সন্তান-সন্ততি দ্বারা সাহায্য করবেন, আর তোমাদের জন্য স্থাপন করবেন উদ্যান এবং প্রবাহিত করবেন নহর।" (সূরা নূহ: ১০-১২)'
    ],
    lesson: 'পবিত্র কুরআন স্বয়ং সাক্ষ্য দেয়—রিজিক বৃদ্ধি, ধন-সম্পদ লাভ, উত্তম সন্তান লাভ এবং অনাবৃষ্টি ও সংকট থেকে মুক্তির একমাত্র অমোঘ চাবিকাঠি হলো ইস্তেগফার।'
  },
  {
    id: 'story-debt-relief-miracle',
    title: 'কোটি টাকার ঋণে জর্জরিত ব্যবসায়ীর অলৌকিক মুক্তি ও অভাবনীয় বরকত',
    category: 'rizq',
    categoryLabel: 'রিজিক ও অভাব দূর',
    narrator: 'সমকালীন এক মুসলিম ব্যবসায়ীর বাস্তব অভিজ্ঞতা',
    sourceType: 'real_experience',
    amalDescription: 'প্রতিদিন ৩০০০ থেকে ৫০০০ বার "আস্তাগফিরুল্লাহ"',
    reference: 'সমকালীন সত্য অভিজ্ঞতা',
    createdAt: 3,
    content: [
      'ব্যবসায়িক পার্টনারের বিশ্বাসঘাতকতা এবং আকস্মিক বাজার ধ্বসের কারণে ঢাকার এক সাধারণ কাপড়ের ব্যবসায়ী এক নিমেষে প্রায় ৬০ লাখ টাকার ঋণের জালে ফেঁসে যান। পাওনাদারদের প্রতিনিয়ত অপমান, মামলার হুমকি এবং ব্যাংক নোটিশে তার স্বাভাবিক জীবন সম্পূর্ণ স্তব্ধ হয়ে যায়।',
      'মানসিক চাপ এতটাই বেড়ে গিয়েছিল যে তিনি ঘরের বাইরে বের হতে পারতেন না। আত্মীয়-স্বজন সবাই মুখ ফিরিয়ে নিয়েছিল। এমন এক দুঃসময়ে তিনি এক বয়োবৃদ্ধ আলেমের পরামর্শে শরণাপন্ন হন।',
      'সেই বুজুর্গ আলেম তাকে বললেন, "হে ভাই, মানুষের দরজায় হাত পেতে কোনো সমাধান পাবে না। আজ থেকে সমস্ত অভিযোগ আল্লাহর দরবারে পেশ করো এবং দৈনিক অন্তত ৩ হাজার থেকে ৫ হাজার বার অর্থ বুঝে একমনে ইস্তেগফার পাঠ করো।"',
      'ব্যবসায়ী ভাইটি দৃঢ় সংকল্প করলেন। তিনি তাহাজ্জুদের নামাজে দাঁড়িয়ে কান্নাকাটি করতেন এবং দিনের প্রতিটি মুহূর্তে গাড়িতে চলাফেরা, দোকানে বসা বা অবসর সময়ে অবিরাম জপতেন: "আস্তাগফিরুল্লাহাল আজীম আল্লাজি লা ইলাহা ইল্লা হুয়াল হাইয়্যুল কাইয়্যুম ওয়া আতুবু ইলাইহ"।',
      'প্রথম এক মাস কোনো পরিবর্তন দেখা যায়নি, কিন্তু তার অন্তরে এক অদ্ভুত প্রশান্তি আসতে শুরু করল। দ্বিতীয় মাসের মাথায় এক দূরবর্তী পরিচিত বিদেশি বায়ার হঠাৎ তার সাথে যোগাযোগ করে এবং এক বড় গার্মেন্টস লটের স্টক সম্পূর্ণ ক্যাশ টাকায় কিনে নেয়।',
      'এরপর এক অবিশ্বাস্য ঘটনার মতো একের পর এক বন্ধ দরজা খুলে যেতে লাগল। মাত্র চার মাসের মধ্যে তিনি তার সমস্ত ঋণ পাই টু পাই পরিশোধ করতে সক্ষম হন এবং পুনরায় সম্মানের সাথে নিজের ব্যবসা সম্প্রসারণ করেন।'
    ],
    lesson: 'মানুষ যখন পার্থিব সকল ভরসা ত্যাগ করে ইস্তেগফারের মাধ্যমে আল্লাহর ওপর তাওয়াক্কুল করে, তখন আল্লাহ তায়ালা আসমান ও জমিনের অদৃশ্য ভাণ্ডার থেকে তার রিজিকের ব্যবস্থা করে দেন।'
  },
  {
    id: 'story-childless-couple-miracle',
    title: '১৪ বছর নিঃসন্তান থাকার পর ইস্তেগফারের বরকতে ফুটফুটে যমজ সন্তান',
    category: 'child',
    categoryLabel: 'সন্তান লাভ ও পরিবার',
    narrator: 'এক দম্পতির বাস্তব জীবনের হৃদয়স্পর্শী সত্য কাহিনী',
    sourceType: 'real_experience',
    amalDescription: 'স্বামী-স্ত্রী উভয়ের তাহাজ্জুদে ১০০০ বার ইস্তেগফার ও দোয়া',
    reference: 'বাস্তব জীবনের সত্য ঘটনা',
    createdAt: 4,
    content: [
      'বিয়ের পর টানা ১৪টি বছর কেঁটে গেছে। দেশে-বিদেশে নামী-দামী ডাক্তার, টেস্ট-টিউব বেবি এবং বহু চিকিৎসার পরও কোনো ফল আসেনি। চিকিৎসকরা সাফ জানিয়ে দিয়েছিলেন যে তাদের সন্তান হওয়ার কোনো বৈজ্ঞানিক সম্ভাবনা আর অবশিষ্ট নেই।',
      'সমাজের কটু কথা এবং শূন্য ঘরের নীরবতা স্ত্রীকে মানসিকভাবে প্রচণ্ড ভেঙে ফেলেছিল। একদিন এক জুমার খুতবায় ইমাম সাহেব আলোচনা করছিলেন সূরা নূহের সেই ফজিলত নিয়ে—যেখানে আল্লাহ তায়ালা ইস্তেগফারের মাধ্যমে সন্তান-সন্ততি দানের সুসংবাদ দিয়েছেন।',
      'স্বামী-স্ত্রী দুজনে সেই দিনই প্রতিজ্ঞা করলেন, মানুষের তৈরি নিয়মের বাইরে গিয়ে তারা আসমানের মালিকের কাছে চাইবেন। তারা নিয়ম করে প্রতিদিন তাহাজ্জুদে উঠতেন। দুই রাকাত নামাজ পড়ে চোখের পানিতে জায়নামাজ ভিজিয়ে দুজনে মিলে অন্তত ১০০০ বার ইস্তেগফার পাঠ করতেন: "রাব্বিগফিরলি ওয়া তূব আলাইয়া ইন্নাকা আনতাত তাওয়াবুর রাহীম"।',
      'টানা ৫ মাস এই আমল চলার পর অলৌকিকভাবে স্ত্রী অসুস্থ বোধ করেন। ডাক্তারের কাছে নিয়ে পরীক্ষা করার পর স্বয়ং চিকিৎসকরা হতবাক হয়ে যান! রিপোর্ট পজিটিভ আসে।',
      'নয় মাস পর আল্লাহ তায়ালা তাদের কোল জুড়ে একটি নয়, দুটি ফুটফুটে সুস্থ যমজ সন্তান (একটি পুত্র ও একটি কন্যা) দান করেন। আজ তাদের সেই ঘর হাসিতে ভরপুর।'
    ],
    lesson: 'মেডিকেল সায়েন্স যেখানে অসম্ভব বলে হাল ছেড়ে দেয়, সেখানে আল্লাহর কুদরতের শুরু হয়। ইস্তেগফার আল্লাহর রহমতের সেই বন্ধ দরজাকে উন্মুক্ত করে দেয়।'
  },
  {
    id: 'story-cancer-healing',
    title: 'ডাক্তারদের জবাব দেওয়া জটিল রোগ থেকে অলৌকিক শিফা ও পুনর্জীবন',
    category: 'shifa',
    categoryLabel: 'কঠিন রোগ ও শিফা',
    narrator: 'রোগীর আত্মজৈবনিক সত্য স্মৃতি',
    sourceType: 'real_experience',
    amalDescription: 'প্রতিদিন পানিতে দম করে ইস্তেগফার ও সাইয়্যিদুল ইস্তেগফার পাঠ',
    reference: 'বাস্তব জীবনের সত্য ঘটনা',
    createdAt: 5,
    content: [
      'এক ভদ্রমহিলা দীর্ঘদিন ধরে পেটের তীব্র ব্যথায় ভুগছিলেন। বিভিন্ন মেডিকেল পরীক্ষার পর ধরা পড়ে তিনি অ্যাডভান্সড স্টেজের জটিল টিউমার ও ইনফেকশনে আক্রান্ত। চিকিৎসকরা অস্ত্রোপচারের ঝুঁকি নিতে সাহস পাচ্ছিলেন না এবং পরিষ্কার জানিয়েছিলেন আর মাত্র কয়েক মাসের আয়ু বাকি।',
      'মৃত্যুভয়ে তিনি যখন নিঃস্ব, তখন তার এক দ্বীনি বোন তাকে উপদেশ দিলেন: "বোন, রোগ দিয়েছেন আল্লাহ, শেফা দেওয়ার মালিকও তিনি। গুনাহের কারণে বিপদ আসে, আর তাওবা ও ইস্তেগফারের মাধ্যমে তা দূর হয়। তুমি চিকিৎসাও চালাও, কিন্তু রুহের ওষুধ হিসেবে ইস্তেগফারকে গ্রহণ করো।"',
      'তিনি নিয়মিত ওষুধের পাশাপাশি প্রতিদিন সকালে ও সন্ধ্যায় এক গ্লাস পানি নিয়ে তাতে ১০০ বার "আস্তাগফিরুল্লাহ" এবং ৩ বার সাইয়্যিদুল ইস্তেগফার পড়ে ফুঁ দিয়ে সেই পানি পান করতেন। সারাদিন অজু অবস্থায় জিহ্বাকে ইস্তেগফারে সিক্ত রাখতেন।',
      'তিন মাস পর যখন তিনি পুনরায় বায়োপসি ও সিটি স্ক্যান করাতে গেলেন, হাসপাতালের হেড সার্জন রিপোর্ট দেখে বিশ্বাসই করতে পারছিলেন না! টিউমারের চিহ্ন পর্যন্ত সম্পূর্ণ মিলিয়ে গেছে এবং ভেতরের অঙ্গসমূহ সম্পূর্ণ সুস্থ হয়ে উঠেছে।',
      'ডাক্তার সাহেব বললেন, "এটা কোনো সাধারণ চিকিৎসা নয়, এটা এক অলৌকিক মোজেজা!"'
    ],
    lesson: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি সর্বদা ইস্তেগফার করবে, আল্লাহ তাকে সকল সংকট থেকে উত্তরণের পথ দেখাবেন এবং সকল দুঃখ-কষ্ট থেকে মুক্তি দেবেন।" (আবু দাউদ)'
  },
  {
    id: 'story-terrible-accident-rescue',
    title: 'সাইয়্যিদুল ইস্তেগফারের অলৌকিক সুরক্ষায় পাহাড়ি খাদে বাস দুর্ঘটনার রক্ষা',
    category: 'distress',
    categoryLabel: 'বিপদ ও পেরেশানি উদ্ধার',
    narrator: 'এক যাত্রীর চোখের দেখা সত্য কাহিনী',
    sourceType: 'real_experience',
    amalDescription: 'সন্ধ্যায় বিশ্বাসসহ "সাইয়্যিদুল ইস্তেগফার" তিলাওয়াত',
    reference: 'বুখারী শরীফের হাদিসের বরকত ও বাস্তব ঘটনা',
    createdAt: 6,
    content: [
      'চট্টগ্রাম-কক্সবাজার মহাসড়কে এক গভীর রাতে বৃষ্টির মধ্যে দ্রুতগতিতে চলছিল একটি যাত্রীবাহী নৈশকোচ। বাসের জানালার পাশে বসেছিলেন এক যুবক, যিনি প্রতিদিন মাগরিবের পর মনোযোগ দিয়ে সাইয়্যিদুল ইস্তেগফার পড়ার অভ্যাস বজায় রেখেছিলেন।',
      'সেদিনও তিনি মনে মনে খুব ভক্তি দিয়ে বলছিলেন: "আল্লাহুম্মা আনতা রাব্বী লা ইলাহা ইল্লা আনতা, খালাকতানী ওয়া আনা আবদুকা..."।',
      'রাত প্রায় আড়াইটায় এক বিপজ্জনক বাঁকে চাকা পিছলে বাসটি নিয়ন্ত্রণ হারিয়ে প্রায় ৬০ ফুট গভীর পাহাড়ি খাদে উল্টে পড়ে যায়। চারিদিকে আর্তনাদ, কাঁচ ভাঙার শব্দ আর হাহাকার।',
      'বাসটির অধিকাংশ অংশ চূর্ণবিচূর্ণ হয়ে গিয়েছিল। কিন্তু অলৌকিকভাবে সেই যুবকটির গায়ে সামান্য একটি আঁচড় পর্যন্ত লাগেনি! এমনকি তিনি নিজ হাতে বাসের ভাঙা জানালা দিয়ে অন্য তিনজনকে টেনে বের করে জীবন বাঁচাতে সাহায্য করেছিলেন।',
      'পরবর্তীতে তিনি স্মরণ করেন রাসূলুল্লাহ (সা.)-এর সেই বরকতময় হাদিস—যে ব্যক্তি সন্ধ্যায় বিশ্বাসসহ সাইয়্যিদুল ইস্তেগফার পাঠ করবে, সে রাতে মারা গেলেও জান্নাতি হবে এবং আল্লাহ তাকে হেফাজত করবেন।'
    ],
    lesson: 'ইস্তেগফার কেবল গুনাহই মাফ করে না, বরং বান্দার জান-মাল ও ইজ্জতের জন্য আল্লাহর পক্ষ থেকে এক অদৃশ্য সুরক্ষাবলয় তৈরি করে।'
  }
];

// Sayyidul Istighfar Full Reference
const SAYYIDUL_ISTIGHFAR = {
  arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
  banglaPhonetic: 'আল্লাহুম্মা আনতা রাব্বী, লা ইলাহা ইল্লা আনতা, খালাক্বতানী ওয়া আনা ‘আবদুকা, ওয়া আনা ‘আলা ‘আহদিকা ওয়া ওয়া‘দিকা মাসতাত্বা‘তু, আ‘ঊযু বিকা মিন শাররি মা ছানা‘তু, আবূউ লাকা বিনি‘মাতিকা ‘আলাইয়া, ওয়া আবূউ লাকা বিযাম্বী, ফাগফির লী, ফাইন্নাহূ লা ইয়াগফিরুয যুনূবা ইল্লা আনতা।',
  meaning: 'হে আল্লাহ! আপনি আমার প্রতিপালক। আপনি ছাড়া কোনো সত্য উপাস্য নেই। আপনি আমাকে সৃষ্টি করেছেন এবং আমি আপনার বান্দা। আমি আমার সাধ্যমতো আপনার অঙ্গীকার ও প্রতিশ্রুতির ওপর কায়েম আছি। আমি আমার কৃতকর্মের অনিষ্ট থেকে আপনার কাছে আশ্রয় চাই। আমার ওপর আপনার যে নিয়ামত রয়েছে তা স্বীকার করছি এবং আমার অপরাধও স্বীকার করছি। অতএব আপনি আমাকে ক্ষমা করে দিন; কেননা আপনি ছাড়া আর কেউ পাপ ক্ষমা করতে পারে না।',
  hadithSource: 'সহিহ বুখারি (হাদিস নং: ৬৩০৬)',
  virtue: 'যে ব্যক্তি দৃঢ় বিশ্বাসের সাথে দিনে এটি পাঠ করবে এবং সন্ধ্যার আগেই মারা যাবে, সে জান্নাতীদের অন্তর্ভুক্ত হবে। আর যে ব্যক্তি রাতে পাঠ করবে এবং সকাল হওয়ার আগেই মারা যাবে, সেও জান্নাতী হবে।'
};

interface IstighfarStoriesProps {
  onShowToast: (message: string, icon?: string) => void;
  onBackToLibrary?: () => void;
}

export const IstighfarStories: React.FC<IstighfarStoriesProps> = ({ onShowToast, onBackToLibrary }) => {
  // Stories Storage
  const [stories, setStories] = useState<IstighfarStory[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_istighfar_stories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_ISTIGHFAR_STORIES;
  });

  // Active Story for Detailed Reading Modal
  const [selectedStory, setSelectedStory] = useState<IstighfarStory | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_istighfar_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Digital Tasbih State
  const [isTasbihOpen, setIsTasbihOpen] = useState(false);
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState<number>(100);
  const [selectedZikrIndex, setSelectedZikrIndex] = useState(0);

  // Sayyidul Istighfar Modal
  const [isSayyidulOpen, setIsSayyidulOpen] = useState(false);

  // User Story Submission Modal (with pending/approval flow)
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  // Manual Story Creation / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<IstighfarStory['category']>('rizq');
  const [formNarrator, setFormNarrator] = useState('');
  const [formAmal, setFormAmal] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formLesson, setFormLesson] = useState('');
  const [formReference, setFormReference] = useState('');

  // Reader Customization in Detailed Modal
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync approved Islamic stories from storySubmissionService
  useEffect(() => {
    const unsub = storySubmissionService.subscribe((allSubmissions) => {
      const approvedIslamic = allSubmissions.filter(
        (s) => s.status === 'approved' && s.storyType === 'islamic'
      );
      if (approvedIslamic.length > 0) {
        setStories((prev) => {
          const newItems: IstighfarStory[] = [];
          approvedIslamic.forEach((item) => {
            if (!prev.some((p) => p.id === item.id)) {
              newItems.push({
                id: item.id,
                title: item.title,
                category: (item.category as any) || 'rizq',
                categoryLabel: item.categoryLabel || 'ইস্তেগফার আমল',
                narrator: item.author,
                sourceType: 'real_experience',
                amalDescription: item.lessonOrAmal || 'ইস্তেগফার আমল',
                content: item.content,
                lesson: item.lessonOrAmal || 'ইস্তেগফারের মাধ্যমে সকল সংকট দূর হয়।',
                reference: item.reference,
                createdAt: item.submittedAt,
                isUserAdded: true,
              });
            }
          });
          return newItems.length > 0 ? [...newItems, ...prev] : prev;
        });
      }
    });
    return () => unsub();
  }, []);

  // Save stories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_istighfar_stories', JSON.stringify(stories));
    } catch {}
  }, [stories]);

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_istighfar_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  // Audio cancel on cleanup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedStory]);

  // Categories definition
  const categories = [
    { id: 'all', label: '🌟 সকল গল্প', count: stories.length },
    { id: 'rizq', label: '💰 রিজিক ও বরকত', count: stories.filter(s => s.category === 'rizq').length },
    { id: 'dua_accepted', label: '🤲 অসম্ভব দোয়া কবুল', count: stories.filter(s => s.category === 'dua_accepted').length },
    { id: 'shifa', label: '🩺 কঠিন রোগ ও শিফা', count: stories.filter(s => s.category === 'shifa').length },
    { id: 'child', label: '👶 সন্তান লাভ', count: stories.filter(s => s.category === 'child').length },
    { id: 'distress', label: '🛡️ পেরেশানি ও বিপদমুক্তি', count: stories.filter(s => s.category === 'distress').length },
  ];

  // Filtered stories
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchCat = activeCategory === 'all' || story.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        story.title.toLowerCase().includes(q) ||
        story.narrator.toLowerCase().includes(q) ||
        story.lesson.toLowerCase().includes(q) ||
        story.content.some(p => p.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [stories, activeCategory, searchQuery]);

  // Open Form for Adding New Story (User submission for review)
  const handleOpenAddForm = () => {
    setIsSubmissionModalOpen(true);
  };

  // Open Form for Editing Story
  const handleOpenEditForm = (story: IstighfarStory) => {
    setEditingStoryId(story.id);
    setFormTitle(story.title);
    setFormCategory(story.category);
    setFormNarrator(story.narrator);
    setFormAmal(story.amalDescription);
    setFormContent(story.content.join('\n\n'));
    setFormLesson(story.lesson);
    setFormReference(story.reference || '');
    setIsFormOpen(true);
  };

  // Save / Update Story
  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      onShowToast('দয়া করে গল্পের শিরোনাম ও বিস্তারিত বিবরণ পূরণ করুন!', '⚠️');
      return;
    }

    const paragraphs = formContent
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const categoryLabels: Record<string, string> = {
      rizq: 'রিজিক ও অভাব দূর',
      shifa: 'কঠিন রোগ ও শিফা',
      dua_accepted: 'অসম্ভব দোয়া কবুল',
      child: 'সন্তান লাভ ও পরিবার',
      distress: 'বিপদ ও পেরেশানি উদ্ধার',
      general: 'সাধারণ ইস্তেগফার আমল'
    };

    if (editingStoryId) {
      // Update existing
      setStories(prev =>
        prev.map(s => {
          if (s.id === editingStoryId) {
            return {
              ...s,
              title: formTitle.trim(),
              category: formCategory,
              categoryLabel: categoryLabels[formCategory] || 'ইস্তেগফার আমল',
              narrator: formNarrator.trim() || 'বাস্তব অভিজ্ঞতা',
              amalDescription: formAmal.trim() || 'নিয়মিত ইস্তেগফার পাঠ',
              content: paragraphs,
              lesson: formLesson.trim() || 'ইস্তেগফারের মাধ্যমে আল্লাহ তায়ালা সংকট দূর করে দেন।',
              reference: formReference.trim() || undefined,
            };
          }
          return s;
        })
      );
      onShowToast('গল্পটি সফলভাবে আপডেট করা হয়েছে! ✨', '✅');
    } else {
      // Add new
      const newStory: IstighfarStory = {
        id: `istighfar-custom-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel: categoryLabels[formCategory] || 'ইস্তেগফার আমল',
        narrator: formNarrator.trim() || 'বাস্তব অভিজ্ঞতা',
        sourceType: 'real_experience',
        amalDescription: formAmal.trim() || 'নিয়মিত ইস্তেগফার পাঠ',
        content: paragraphs,
        lesson: formLesson.trim() || 'ইস্তেগফারের মাধ্যমে আল্লাহ তায়ালা সংকট দূর করে দেন।',
        reference: formReference.trim() || undefined,
        createdAt: Date.now(),
        isUserAdded: true,
      };
      setStories(prev => [newStory, ...prev]);
      onShowToast('আপনার ইস্তেগফার আমলের গল্পটি সফলভাবে প্রকাশিত হয়েছে! 📿', '🎉');
    }

    setIsFormOpen(false);
  };

  // Delete Story
  const handleDeleteStory = (id: string, title: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${title}" গল্পটি মুছে ফেলতে চান?`)) {
      setStories(prev => prev.filter(s => s.id !== id));
      if (selectedStory?.id === id) {
        setSelectedStory(null);
      }
      onShowToast('গল্পটি সফলভাবে মুছে ফেলা হয়েছে।', '🗑️');
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    if (bookmarks.includes(id)) {
      setBookmarks(prev => prev.filter(item => item !== id));
      onShowToast('বুকমার্ক থেকে সরানো হয়েছে', '🔖');
    } else {
      setBookmarks(prev => [...prev, id]);
      onShowToast('গল্পটি বুকমার্ক করা হয়েছে! 🌟', '🔖');
    }
  };

  // Copy Full Story Text
  const handleCopyStory = (story: IstighfarStory) => {
    const textToCopy = `📿 ${story.title}\n\nবিষয়: ${story.categoryLabel}\nবর্ণনাকারী/উৎস: ${story.narrator}\nআমল: ${story.amalDescription}\n\n${story.content.join('\n\n')}\n\n💡 শিক্ষণীয় বার্তা: ${story.lesson}\n${story.reference ? `রেফারেন্স: ${story.reference}\n` : ''}\n— সংগৃহীত: MoSaFa Tools • ইস্তেগফার আমলের গল্প\nhttps://tools.mosafabd.com`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(story.id);
    onShowToast('সম্পূর্ণ গল্পটি সুন্দর ফরম্যাটে কপি হয়েছে! ফেসবুকে বা হোয়াটসঅ্যাপে শেয়ার করুন।', '📋');
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Share to WhatsApp
  const handleShareWhatsApp = (story: IstighfarStory) => {
    const text = `*📿 ${story.title}*\n\n_${story.categoryLabel}_\n\n${story.content.slice(0, 2).join('\n\n')}...\n\n👉 সম্পূর্ণ গল্পটি পড়ুন MoSaFa Tools-এ:\nhttps://tools.mosafabd.com/?tool=golpo-ghor`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Text To Speech Audio
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      onShowToast('আপনার ব্রাউজারে স্পিচ সিন্থেসিস সমর্থিত নয়!', '⚠️');
      return;
    }

    if (isAudioPlaying) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      return;
    }

    if (!selectedStory) return;

    window.speechSynthesis.cancel();
    const fullText = `${selectedStory.title}। ${selectedStory.content.join('। ')}। শিক্ষণীয় বিষয়: ${selectedStory.lesson}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.95;

    utterance.onend = () => setIsAudioPlaying(false);
    utterance.onerror = () => setIsAudioPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsAudioPlaying(true);
    onShowToast('বাংলা ভাষায় গল্পটি পাঠ করে শোনানো হচ্ছে... 🔊', '🎙️');
  };

  // Tasbih Phrases
  const tasbihPhrases = [
    { arabic: 'أَسْتَغْفِرُ اللّٰهَ', bangla: 'আস্তাগফিরুল্লাহ', meaning: 'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি।' },
    { arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', bangla: 'আস্তাগফিরুল্লাহ ওয়া আতূবু ইলাইহি', meaning: 'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি এবং তাঁর কাছে তওবা করছি।' },
    { arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', bangla: 'রাব্বিগফিরলী ওয়া তূব আলাইয়া, ইন্নাকা আনতাত তাওয়াবুর রাহীম', meaning: 'হে আমার প্রতিপালক, আমাকে ক্ষমা করুন এবং আমার তওবা কবুল করুন; নিশ্চয় আপনি তওবা কবুলকারী, পরম দয়ালু।' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Islamic Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-emerald-800/60">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Bismillah Header */}
          <div className="text-center space-y-1">
            <p className="font-serif text-amber-300 text-lg sm:text-2xl tracking-widest opacity-95">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
              পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-2">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-amber-300 text-xs font-bold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>বাস্তব অভিজ্ঞতা, অলৌকিক বরকত ও বিশুদ্ধ কাহিনী</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                ইস্তেগফার আমলের গল্প
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                যেখানে সমস্ত পার্থিব আশা নিঃশেষ হয়ে যায়, সেখানে সার্বক্ষণিক ইস্তেগফার আসমানের দরজা খুলে দেয়। পড়ুন সত্য জীবনের অভাবনীয় মোজেজা ও বরকতের কাহিনী, এবং আপনার নিজের অভিজ্ঞতাও শেয়ার করুন।
              </p>
            </div>

            {/* Action Buttons in Hero */}
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={handleOpenAddForm}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-emerald-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition transform hover:scale-102 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>নতুন গল্প শেয়ার করুন ✍️</span>
              </button>

              <button
                onClick={() => setIsTasbihOpen(true)}
                className="px-4 py-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-600/40 text-emerald-100 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer backdrop-blur-xs"
              >
                <span className="text-base">📿</span>
                <span>ডিজিটাল তাসবীহ</span>
              </button>

              <button
                onClick={() => setIsSayyidulOpen(true)}
                className="px-4 py-3 rounded-2xl bg-teal-900/60 hover:bg-teal-800/80 border border-teal-600/40 text-teal-100 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer backdrop-blur-xs"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>সাইয়্যিদুল ইস্তেগফার</span>
              </button>
            </div>
          </div>

          {/* Quranic Verse Box */}
          <div className="bg-black/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 text-emerald-100 text-xs sm:text-sm leading-relaxed text-center sm:text-left relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                📖
              </div>
              <div>
                <p className="font-semibold text-amber-200">
                  “অতঃপর আমি বলেছি, তোমরা তোমাদের রবের নিকট ক্ষমা প্রার্থনা করো, নিশ্চয় তিনি পরম ক্ষমাশীল। তিনি তোমাদের জন্য আকাশ থেকে প্রচুর বৃষ্টি বর্ষণ করবেন এবং ধন-সম্পদ ও সন্তান-সন্ততি দ্বারা তোমাদের সমৃদ্ধ করবেন...”
                </p>
                <p className="text-[11px] text-emerald-300/80 mt-1 font-medium">
                  — আল-কুরআন, সূরা নূহ: ১০-১২
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Category Bar */}
      <section className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ইস্তেগফারের গল্প খুঁজুন... যেমন: ইমাম আহমদ, ঋণমুক্তি, রোগমুক্তি, সন্তান, রুটি বিক্রেতা"
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id
                    ? 'bg-emerald-900/60 text-emerald-100'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Stories Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              ইস্তেগফার আমলের বাস্তব কাহিনীসমূহ
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {filteredStories.length}টি গল্প
            </span>
          </div>

          <button
            onClick={handleOpenAddForm}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন গল্প শেয়ার</span>
          </button>
        </div>

        {filteredStories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
              📿
            </div>
            <h4 className="text-base font-bold text-slate-800">কোনো গল্প পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনার খোঁজা বিষয়ের কোনো গল্প এখনো যুক্ত করা হয়নি। আপনি চাইলে নিজেই একটি নতুন ইস্তেগফার আমলের গল্প শেয়ার করতে পারেন!
            </p>
            <button
              onClick={handleOpenAddForm}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer"
            >
              ➕ নতুন গল্প যোগ করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredStories.map((story) => {
              const isBookmarked = bookmarks.includes(story.id);

              return (
                <div
                  key={story.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition duration-200 flex flex-col justify-between group relative"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      📿 {story.categoryLabel}
                    </span>

                    <div className="flex items-center gap-1">
                      {story.isUserAdded && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ব্যবহারকারীর শেয়ারকৃত
                        </span>
                      )}

                      <button
                        onClick={() => handleToggleBookmark(story.id)}
                        className={`p-1.5 rounded-xl transition cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isBookmarked ? 'বুকমার্ক সরানো' : 'বুকমার্ক করুন'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title & Preview */}
                  <div className="space-y-2 mb-4">
                    <h4
                      onClick={() => setSelectedStory(story)}
                      className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition cursor-pointer"
                    >
                      {story.title}
                    </h4>

                    {/* Amal Pill */}
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-xl border border-amber-200/70">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold truncate">আমল: {story.amalDescription}</span>
                    </div>

                    {/* First Paragraph Snippet */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mt-2 text-justify">
                      {story.content[0]}
                    </p>
                  </div>

                  {/* Moral / Lesson Box */}
                  <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100 mb-4 text-[11px] sm:text-xs text-emerald-950 flex items-start gap-2">
                    <span className="text-emerald-700 font-black shrink-0">💡 শিক্ষা:</span>
                    <span className="line-clamp-2 leading-relaxed">{story.lesson}</span>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{story.narrator}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Copy */}
                      <button
                        onClick={() => handleCopyStory(story)}
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                        title="গল্পটি কপি করুন"
                      >
                        {copiedId === story.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => handleShareWhatsApp(story)}
                        className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                        title="হোয়াটসঅ্যাপে শেয়ার করুন"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {/* Edit / Delete for user-added stories */}
                      {story.isUserAdded && (
                        <>
                          <button
                            onClick={() => handleOpenEditForm(story)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStory(story.id, story.title)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Read Full Button */}
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>সম্পূর্ণ পড়ুন</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MODAL: Detailed Story Reader Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-emerald-950 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-800 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">📿</span>
                <div>
                  <h3 className="text-sm sm:text-base font-black truncate max-w-xs sm:max-w-md">
                    {selectedStory.title}
                  </h3>
                  <span className="text-[11px] text-amber-300 font-semibold">
                    {selectedStory.categoryLabel} • {selectedStory.narrator}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Audio Reader */}
                <button
                  onClick={handleToggleAudio}
                  className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    isAudioPlaying
                      ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                      : 'bg-emerald-900/60 border-emerald-700 text-emerald-200 hover:bg-emerald-800'
                  }`}
                  title={isAudioPlaying ? 'পাঠ বন্ধ করুন' : '🔊 বাংলায় শুনুন'}
                >
                  {isAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Font Size Toggle */}
                <button
                  onClick={() =>
                    setReaderFontSize(prev => (prev === 'normal' ? 'large' : prev === 'large' ? 'xl' : 'normal'))
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-bold transition cursor-pointer"
                  title="ফন্ট সাইজ পরিবর্তন করুন"
                >
                  ফন্ট {readerFontSize === 'normal' ? 'ক' : readerFontSize === 'large' ? 'ক+' : 'ক++'}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedStory(null);
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsAudioPlaying(false);
                  }}
                  className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-900 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800">
              {/* Bismillah Card in Reader */}
              <div className="text-center py-2 border-b border-slate-100">
                <p className="font-serif text-emerald-800 text-xl font-bold tracking-widest">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
                <div className="w-12 h-1 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full mx-auto mt-2" />
              </div>

              {/* Story Title & Amal Description */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {selectedStory.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    📿 {selectedStory.categoryLabel}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold">
                    আমল: {selectedStory.amalDescription}
                  </span>
                  {selectedStory.reference && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                      সূত্র: {selectedStory.reference}
                    </span>
                  )}
                </div>
              </div>

              {/* Story Content Paragraphs */}
              <article
                className={`space-y-4 text-justify leading-relaxed select-text ${
                  readerFontSize === 'normal'
                    ? 'text-sm'
                    : readerFontSize === 'large'
                    ? 'text-base'
                    : 'text-lg'
                }`}
              >
                {selectedStory.content.map((paragraph, idx) => (
                  <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-emerald-800 first-letter:mr-0.5">
                    {paragraph}
                  </p>
                ))}
              </article>

              {/* Moral / Lesson Box */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200/80 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>আমলের গভীর শিক্ষা ও উপদেশ:</span>
                </h4>
                <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                  {selectedStory.lesson}
                </p>
              </div>

              {/* Quick Action to Pray Istighfar Now */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="text-center sm:text-left">
                  <h5 className="text-xs sm:text-sm font-bold text-amber-300">
                    এখনই ইস্তেগফারের আমল শুরু করতে চান?
                  </h5>
                  <p className="text-[11px] text-emerald-200">
                    আমাদের ডিজিটাল তাসবীহ দিয়ে এখনই ১০০ বার আস্তাগফিরুল্লাহ পাঠ করুন।
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsTasbihOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs transition cursor-pointer shrink-0 shadow-sm"
                >
                  📿 তাসবীহ খুলুন
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyStory(selectedStory)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === selectedStory.id ? 'কপি হয়েছে!' : 'লেখা কপি'}</span>
                </button>

                <button
                  onClick={() => handleShareWhatsApp(selectedStory)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>হোয়াটসঅ্যাপ</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Manual Story Submission / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <h3 className="text-base font-black">
                  {editingStoryId ? 'ইস্তেগফার গল্প সম্পাদনা করুন' : 'নতুন ইস্তেগফার আমলের গল্প শেয়ার করুন'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-emerald-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  গল্পের শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="যেমন: প্রতিদিন ১০০০ বার ইস্তেগফারের পর আমার জীবনে যা ঘটেছিল"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ক্যাটাগরি / বিষয় *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="rizq">💰 রিজিক ও বরকত</option>
                    <option value="dua_accepted">🤲 অসম্ভব দোয়া কবুল</option>
                    <option value="shifa">🩺 কঠিন রোগ ও শিফা</option>
                    <option value="child">👶 সন্তান লাভ ও পরিবার</option>
                    <option value="distress">🛡️ বিপদ ও পেরেশানি উদ্ধার</option>
                    <option value="general">📿 সাধারণ ইস্তেগফার আমল</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    বর্ণনাকারী / উৎস
                  </label>
                  <input
                    type="text"
                    value={formNarrator}
                    onChange={(e) => setFormNarrator(e.target.value)}
                    placeholder="যেমন: আমার নিজের বাস্তব অভিজ্ঞতা / কোনো দ্বীনি ভাইয়ের ঘটনা"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  কোন আমলটি করা হয়েছিল?
                </label>
                <input
                  type="text"
                  value={formAmal}
                  onChange={(e) => setFormAmal(e.target.value)}
                  placeholder="যেমন: ফজর ও মাগরিবের পর ১০০ বার সাইয়্যিদুল ইস্তেগফার পাঠ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  সম্পূর্ণ গল্প ও ঘটনার বিবরণ * (নতুন অনুচ্ছেদের জন্য Enter দিন)
                </label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="গল্পের শুরুর প্রেক্ষাপট, কি সমস্যা ছিল, কিভাবে ইস্তেগফারের আমল শুরু করলেন এবং পরবর্তীতে আল্লাহর রহমতে কি সমাধান বা বরকত এলো বিস্তারিত লিখুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  শিক্ষণীয় বার্তা / উপদেশ
                </label>
                <input
                  type="text"
                  value={formLesson}
                  onChange={(e) => setFormLesson(e.target.value)}
                  placeholder="যেমন: আল্লাহর ওপর তাওয়াক্কুল ও অবিরাম ইস্তেগফারে কোনো দোয়া ফিরিয়ে দেওয়া হয় না।"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  রেফারেন্স বা হাদীস সূত্র (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                  placeholder="যেমন: সহিহ বুখারী / সূরা নূহ ১০-১২ / বাস্তব অভিজ্ঞতা"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black cursor-pointer shadow-md"
                >
                  {editingStoryId ? 'আপডেট করুন ✨' : 'গল্পটি প্রকাশ করুন 📿'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Digital Tasbih Counter */}
      {isTasbihOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-emerald-600/50 flex flex-col items-center text-center space-y-5 relative">
            <button
              onClick={() => setIsTasbihOpen(false)}
              className="absolute right-4 top-4 text-emerald-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-amber-300 text-xs font-bold border border-emerald-500/30">
              <span>📿 ডিজিটাল ইস্তেগফার তাসবীহ</span>
            </div>

            {/* Zikr Selector */}
            <div className="w-full space-y-1">
              <p className="font-serif text-xl sm:text-2xl text-amber-300 leading-relaxed font-bold">
                {tasbihPhrases[selectedZikrIndex].arabic}
              </p>
              <p className="text-sm font-bold text-emerald-200">
                {tasbihPhrases[selectedZikrIndex].bangla}
              </p>
              <p className="text-[11px] text-emerald-300/80 italic">
                {tasbihPhrases[selectedZikrIndex].meaning}
              </p>
            </div>

            {/* Quick Switch Buttons */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {tasbihPhrases.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedZikrIndex(idx);
                    setTasbihCount(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    selectedZikrIndex === idx
                      ? 'bg-amber-400 text-emerald-950'
                      : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
                  }`}
                >
                  দোয়া {idx + 1}
                </button>
              ))}
            </div>

            {/* Big Interactive Counter Button */}
            <div className="relative my-2">
              <button
                onClick={() => {
                  const newCount = tasbihCount + 1;
                  setTasbihCount(newCount);
                  if (newCount === tasbihTarget) {
                    onShowToast(`মাশাআল্লাহ! আপনি ${tasbihTarget} বার ইস্তেগফার সম্পন্ন করেছেন! 🌟`, '🎉');
                    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
                  } else {
                    if ('vibrate' in navigator) navigator.vibrate(30);
                  }
                }}
                className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 text-emerald-950 shadow-2xl shadow-emerald-500/30 flex flex-col items-center justify-center active:scale-95 transition transform border-4 border-emerald-300/40 cursor-pointer select-none"
              >
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                  {tasbihCount}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-200 mt-1">
                  ক্লিক করুন
                </span>
              </button>
            </div>

            {/* Target and Progress */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold px-1">
                <span>লক্ষ্য: {tasbihTarget} বার</span>
                <span>{Math.min(100, Math.round((tasbihCount / tasbihTarget) * 100))}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-950 border border-emerald-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, (tasbihCount / tasbihTarget) * 100)}%` }}
                />
              </div>

              {/* Target Selector */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {[33, 100, 500, 1000].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTasbihTarget(num)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition ${
                      tasbihTarget === num
                        ? 'bg-amber-400 text-emerald-950'
                        : 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => setTasbihCount(0)}
              className="text-xs font-bold text-emerald-300/80 hover:text-white flex items-center gap-1 cursor-pointer pt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট (০ করুন)</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. MODAL: Sayyidul Istighfar Full Card */}
      {isSayyidulOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black">সাইয়্যিদুল ইস্তেগফার (শ্রেষ্ঠ তওবা)</h3>
              </div>
              <button
                onClick={() => setIsSayyidulOpen(false)}
                className="text-emerald-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-5 text-slate-800 overflow-y-auto max-h-[80vh]">
              {/* Arabic Box */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 text-center space-y-2">
                <p className="font-serif text-lg sm:text-xl font-bold text-emerald-950 leading-loose select-text">
                  {SAYYIDUL_ISTIGHFAR.arabic}
                </p>
              </div>

              {/* Bangla Pronunciation */}
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  শুদ্ধ বাংলা উচ্চারণ:
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 select-text">
                  {SAYYIDUL_ISTIGHFAR.banglaPhonetic}
                </p>
              </div>

              {/* Bangla Meaning */}
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  বাংলা অনুবাদ ও অর্থ:
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 select-text">
                  {SAYYIDUL_ISTIGHFAR.meaning}
                </p>
              </div>

              {/* Virtue & Hadith Reference */}
              <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>অসীম ফজিলত ({SAYYIDUL_ISTIGHFAR.hadithSource}):</span>
                </div>
                <p className="text-emerald-100/90 leading-relaxed">
                  {SAYYIDUL_ISTIGHFAR.virtue}
                </p>
              </div>

              {/* Copy Sayyidul Istighfar */}
              <button
                onClick={() => {
                  const text = `👑 সাইয়্যিদুল ইস্তেগফার (শ্রেষ্ঠ ক্ষমা প্রার্থনা)\n\nআরবি:\n${SAYYIDUL_ISTIGHFAR.arabic}\n\nউচ্চারণ:\n${SAYYIDUL_ISTIGHFAR.banglaPhonetic}\n\nঅর্থ:\n${SAYYIDUL_ISTIGHFAR.meaning}\n\nফজিলত: ${SAYYIDUL_ISTIGHFAR.virtue}\nসূত্র: ${SAYYIDUL_ISTIGHFAR.hadithSource}\n— MoSaFa Tools`;
                  navigator.clipboard.writeText(text);
                  onShowToast('সাইয়্যিদুল ইস্তেগফার সম্পূর্ণ টেক্সট কপি হয়েছে!', '📋');
                }}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <Copy className="w-4 h-4" />
                <span>সম্পূর্ণ দোয়া ও অর্থ কপি করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Islamic Story Submission Modal (Reviewed by Admin) */}
      <StorySubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onShowToast={onShowToast}
        defaultType="islamic"
      />
    </div>
  );
};
