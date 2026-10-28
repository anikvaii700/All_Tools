import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  RotateCcw,
  Share2,
  Download,
  ShieldCheck,
  Award,
  Compass,
  HeartHandshake,
  Lightbulb,
  Brain,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PersonalityRevealProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export interface PersonalityQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    type: 'observer' | 'friend' | 'creative' | 'logical' | 'socializer' | 'explorer';
  }[];
}

const QUESTIONS: PersonalityQuestion[] = [
  {
    id: 1,
    question: 'ছুটির দিনে বন্ধুদের হঠাৎ বাইরে যাওয়ার দাওয়াত এলে আপনি কী করেন?',
    options: [
      { text: 'সবার আগে রাজি হয়ে প্ল্যান তৈরি শুরু করি! 🥳', type: 'socializer' },
      { text: 'একটু ভাবি, নিজের একাকীত্ব বেশি ভালো লাগলে বিনয়ের সাথে না বলি 🏡', type: 'observer' },
      { text: 'যদি বন্ধু মন খারাপ করে তবে তার খুশির জন্য যাই 💖', type: 'friend' },
      { text: 'নতুন কোনো জায়গা বা রোমাঞ্চকর এক্সপ্লোরেশন হলে অবশ্যই যাই! 🎒', type: 'explorer' },
    ],
  },
  {
    id: 2,
    question: 'কোনো জটিল সমস্যার মুখোমুখি হলে আপনার প্রথম প্রতিক্রিয়া কেমন হয়?',
    options: [
      { text: 'যুক্তি ও তথ্য বিশ্লেষণ করে ঠান্ডা মাথায় সমাধান খুঁজি 🧠', type: 'logical' },
      { text: 'আউট-অব-দ্য-বক্স এবং সৃজনশীল উপায়ে চিন্তা করি 💡', type: 'creative' },
      { text: 'পরিস্থিতি গভীরভাবে পর্যবেক্ষণ করে সঠিক সময়ের অপেক্ষা করি 👁️', type: 'observer' },
      { text: 'আশেপাশের অভিজ্ঞ মানুষের সাথে আলোচনা করে সিদ্ধান্ত নিই 🤝', type: 'socializer' },
    ],
  },
  {
    id: 3,
    question: 'বন্ধুমহলে আপনাকে বেশিরভাগ সময় কোন গুণে চেনা যায়?',
    options: [
      { text: 'বিশ্বস্ত ও বিপদে নিঃশব্দে পাশে থাকা সঙ্গী 🫂', type: 'friend' },
      { text: 'আড্ডার মধ্যমণি ও হাসিখুশি পরিবেশ তৈরি করা ব্যক্তি 🎉', type: 'socializer' },
      { text: 'শান্ত, পরিমিত কিন্তু গভীর চিন্তাশীল পরামর্শক 🧭', type: 'observer' },
      { text: 'নতুন আইডিয়া ও কল্পনার জাদুকর 🎨', type: 'creative' },
    ],
  },
  {
    id: 4,
    question: 'কোনো সিদ্ধান্ত নেওয়ার সময় আপনার কাছে কোনটি সবচেয়ে গুরুত্বপূর্ণ?',
    options: [
      { text: 'বাস্তবতা ও যৌক্তিক লাভ-ক্ষতি 📊', type: 'logical' },
      { text: 'মানুষের অনুভূতি ও সম্পর্কের মর্যাদা ❤️', type: 'friend' },
      { text: 'নিজের স্বাধীনতা ও নিজস্ব পথচলা 🦅', type: 'explorer' },
      { text: 'নতুন অভিজ্ঞতা ও আবিষ্কারের আনন্দ 🌟', type: 'creative' },
    ],
  },
  {
    id: 5,
    question: 'যখন আপনার মন খারাপ থাকে, আপনি সাধারণত কী করেন?',
    options: [
      { text: 'প্রিয় কোনো সৃষ্টিশীল কাজ (আঁকা, গান, লেখালেখি) করি 🎶', type: 'creative' },
      { text: 'নির্জন জায়গায় একা হেঁটে প্রকৃতির সাথে সময় কাটাই 🌲', type: 'explorer' },
      { text: 'সবচেয়ে কাছের বন্ধুর কাছে মন খুলে কথা বলি ☕', type: 'friend' },
      { text: 'কারণটা নিখুঁতভাবে চিহ্নিত করে সমাধানের চেষ্টা করি 📝', type: 'logical' },
    ],
  },
  {
    id: 6,
    question: 'নতুন মানুষের সাথে পরিচয় হলে আপনি কেমন অনুভব করেন?',
    options: [
      { text: 'খুব দ্রুত মিশে যাই এবং প্রাণবন্ত আড্ডা জমাই 🗣️', type: 'socializer' },
      { text: 'আগে তাদের স্বভাব ও আচরণ লক্ষ্য করি, তারপর কথা বলি 🔍', type: 'observer' },
      { text: 'সবার সাথেই মার্জিত ও যত্নশীল আচরণ করি 🌸', type: 'friend' },
      { text: 'তাদের জীবনের ভিন্ন দৃষ্টিভঙ্গি জানতে কৌতূহল বোধ করি 🗺️', type: 'explorer' },
    ],
  },
  {
    id: 7,
    question: 'কোন ধরনের কাজ করতে আপনি সবচেয়ে বেশি আনন্দ পান?',
    options: [
      { text: 'যেখানে নতুন কিছু তৈরি বা উদ্ভাবনের সুযোগ থাকে 🎨', type: 'creative' },
      { text: 'যেখানে হিসাব, অ্যালগরিদম ও নিখুঁত প্ল্যানিং থাকে 📈', type: 'logical' },
      { text: 'যেখানে মানুষের উপকারে আসা যায় বা সমাজসেবা হয় 🤲', type: 'friend' },
      { text: 'যেখানে ভ্রমণ ও নতুন চ্যালেঞ্জ নেওয়ার সুযোগ থাকে 🚀', type: 'explorer' },
    ],
  },
  {
    id: 8,
    question: 'কেউ আপনার সাথে অন্যায় বা তর্ক করলে আপনার অবস্থান কী?',
    options: [
      { text: 'অকাট্য প্রমাণ ও যুক্তি দিয়ে শান্তভাবে বক্তব্য তুলে ধরি ⚖️', type: 'logical' },
      { text: 'অপ্রয়োজনীয় বিবাদ এড়িয়ে দূরত্ব বজায় রাখি 🚶', type: 'observer' },
      { text: 'ক্ষমা করে দিয়ে সম্পর্ক টিকিয়ে রাখার চেষ্টা করি 🕊️', type: 'friend' },
      { text: 'নিজের আত্মমর্যাদা বজায় রেখে স্পষ্ট কথা বলি 🛡️', type: 'explorer' },
    ],
  },
  {
    id: 9,
    question: 'ভবিষ্যতের ব্যাপারে আপনার চিন্তাভাবনা কেমন?',
    options: [
      { text: 'সুনির্দিষ্ট লক্ষ্য ও ধাপভিত্তিক রোডম্যাপ তৈরি রাখি 🎯', type: 'logical' },
      { text: 'স্বপ্নের পেছনে ছুটে চলা এবং নিজের ইতিহাস তৈরি করা 🌈', type: 'creative' },
      { text: 'প্রিয় মানুষদের সাথে নিয়ে শান্তিময় সুখী জীবন কাটানো 🏡', type: 'friend' },
      { text: 'অজানা দিগন্তে ডানা মেলে রোমাঞ্চে বাঁচা 🌌', type: 'explorer' },
    ],
  },
  {
    id: 10,
    question: 'একটি শব্দে যদি নিজেকে প্রকাশ করতে হয়, আপনি কোনটি বেছে নেবেন?',
    options: [
      { text: 'গভীর পর্যবেক্ষক (Observer)', type: 'observer' },
      { text: 'বিশ্বস্ত মিত্র (Compassionate)', type: 'friend' },
      { text: 'সৃজনশীল ভাবুক (Creative)', type: 'creative' },
      { text: 'যুক্তিবাদী প্রজ্ঞাবান (Logical)', type: 'logical' },
    ],
  },
];

export interface PersonalityProfile {
  type: string;
  title: string;
  tagline: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  color: string;
}

const PROFILES: Record<string, PersonalityProfile> = {
  observer: {
    type: 'observer',
    title: 'দূরদর্শী পর্যবেক্ষক (Thoughtful Observer)',
    tagline: 'শান্ত চোখের অতল গভীরে লুকিয়ে থাকা গভীর প্রজ্ঞা',
    description:
      'আপনি কথা কম বলে বেশি শুনতে ও বুঝতে পছন্দ করেন। যেকোনো পরিস্থিতিতে তাড়াহুড়ো না করে ঠান্ডা মাথায় বাস্তবতা পর্যবেক্ষণ করেন। আপনার প্রজ্ঞা ও সতর্কতা আপনাকে যেকোনো ফাঁদ বা ভুল সিদ্ধান্ত থেকে দূরে রাখে।',
    strengths: ['গভীর পর্যবেক্ষণ ক্ষমতা', 'ধৈর্যশীল ও শান্ত স্বভাব', 'বিশ্বাসযোগ্য পরামর্শক'],
    growthAreas: ['মাঝে মাঝে মনের কথা খোলামেলা প্রকাশ করা', 'অতিরিক্ত চিন্তা এড়িয়ে দ্রুত সিদ্ধান্ত নেওয়া'],
    color: '#6366f1',
  },
  friend: {
    type: 'friend',
    title: 'মমতাময়ী ও বিশ্বস্ত বন্ধু (Caring Friend)',
    tagline: 'অন্যের মুখে হাসি ফোটানোতেই যার পরম আত্মতৃপ্তি',
    description:
      'আপনার হৃদয় অত্যন্ত স্নেহশীল ও অনুভূতিপ্রবণ। বন্ধুদের প্রয়োজনে আপনি যেকোনো ত্যাগে প্রস্তুত থাকেন। আপনি অহংকারহীন, সহমর্মী এবং সম্পর্কের মূল্য দিতে জানেন। মানুষ আপনার কাছে মানসিক আশ্রয় খুঁজে পায়।',
    strengths: ['নিখাদ নিঃস্বার্থ ভালোবাসা', 'অসাধারণ সহমর্মিতা', 'দৃঢ় পারিবারিক ও সামাজিক বিশ্বস্ততা'],
    growthAreas: ['অন্যকে ভালো রাখতে গিয়ে নিজের ভালো থাকা না ভোলা', 'প্রয়োজনে স্পষ্ট \'না\' বলার সাহস রাখা'],
    color: '#ec4899',
  },
  creative: {
    type: 'creative',
    title: 'সৃষ্টিশীল স্বপ্নবাজ (Creative Dreamer)',
    tagline: 'যার ভাবনার ক্যানভাসে জন্ম নেয় অনন্য সৃষ্টি',
    description:
      'প্রথাগত নিয়মের বাইরে গিয়ে নতুন কিছু ভাবাই আপনার স্বকীয়তা। আপনার কল্পনাশক্তির বিস্তার সীমাহীন। যেকোনো সাধারণ বিষয়ের মধ্যেও আপনি শিল্প ও সৌন্দর্য খুঁজে পান। আপনি ভবিষ্যতের স্বপ্ন দেখতে ভালোবাসেন।',
    strengths: ['অনন্য সৃজনশীলতা ও উদ্ভাবন', 'আউট-অব-দ্য-বক্স সমাধান', 'উচ্চ নান্দনিক দৃষ্টিভঙ্গি'],
    growthAreas: ['কল্পনার পাশাপাশি বাস্তবায়ন ও রুটিনে নিয়মিত মনোযোগ', 'হতাশায় কাজ থামিয়ে না দেওয়া'],
    color: '#8b5cf6',
  },
  logical: {
    type: 'logical',
    title: 'যুক্তিপূর্ণ চিন্তাবিদ (Logical Thinker)',
    tagline: 'বাস্তবতা ও তথ্যের ভিত্তিতে সঠিক সমাধানের কারিগর',
    description:
      'আবেগের চেয়ে যুক্তি ও বাস্তবতাকে প্রাধান্য দেওয়াই আপনার অন্যতম বৈশিষ্ট্য। যেকোনো চ্যালেঞ্জের মুখে আপনি মাথা ঠান্ডা রেখে বিশ্লেষণ করতে পারেন। আপনার সিদ্ধান্তগুলো সবসময় নির্ভরযোগ্য ও কার্যক্ষম হয়।',
    strengths: ['স্পষ্ট ও নিরপেক্ষ বিচারবোধ', 'কৌশলগত পরিকল্পনা', 'সমস্যা সমাধানের অনন্য দক্ষতা'],
    growthAreas: ['আবেগীয় অনুভূতিকে গুরুত্ব দেওয়া', 'কখনো কখনো সহনশীল ও নমনীয় হওয়া'],
    color: '#0ea5e9',
  },
  socializer: {
    type: 'socializer',
    title: 'প্রাণবন্ত সামাজিক (Energetic Socializer)',
    tagline: 'যাঁর উপস্থিতিতে আড্ডা আর পরিবেশ আলোকিত হয়ে ওঠে',
    description:
      'আপনি মানুষের সাথে মিশতে এবং পজিটিভ এনার্জি ছড়াতে ভালোবাসেন। আপনার হাসিমুখ ও অনুপ্রেরণামূলক কথা আশপাশের মানুষকে সহজে আকর্ষণ করে। যেকোনো একঘেয়ে পরিবেশকেও আপনি মুহূর্তেই আনন্দে রূপ দিতে পারেন।',
    strengths: ['চমৎকার যোগাযোগ দক্ষতা', 'অফুরন্ত জীবনীশক্তি', 'সহজে বন্ধু তৈরির গুণ'],
    growthAreas: ['নিজের জন্য নিরিবিলি সময় বরাদ্দ করা', 'সবাইকে সন্তুষ্ট করার অপ্রয়োজনীয় চাপ না নেওয়া'],
    color: '#f59e0b',
  },
  explorer: {
    type: 'explorer',
    title: 'স্বাধীন অভিযাত্রী (Independent Explorer)',
    tagline: 'মুক্ত বিহঙ্গের মতো আত্মবিশ্বাসী ও নির্ভীক পথচলা',
    description:
      'আপনি অন্যের অনুকরণ করতে পছন্দ করেন না; নিজের পথ নিজেই তৈরি করেন। ভ্রমণ, নতুন সংস্কৃতি ও নিত্যনতুন চ্যালেঞ্জ গ্রহণ করাই আপনার জীবনের স্পন্দন। আপনার স্বাধীনতা ও আত্মমর্যাদা আপনার সবচেয়ে বড় অহংকার।',
    strengths: ['অটল আত্মবিশ্বাস ও সাহস', 'অভিযোজন ক্ষমতা', 'দৃঢ় নেতৃত্ব ও স্বাবলম্বিতা'],
    growthAreas: ['মাঝে মাঝে প্রিয়জনদের পরামর্শ গ্রহণ করা', 'ধৈর্য ধরে কোনো কাজের দীর্ঘমেয়াদী স্থায়িত্ব বজায় রাখা'],
    color: '#10b981',
  },
};

export const PersonalityReveal: React.FC<PersonalityRevealProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userName, setUserName] = useState<string>('মোফাচ্ছির');
  const [answers, setAnswers] = useState<string[]>([]);
  const [resultProfile, setResultProfile] = useState<PersonalityProfile | null>(null);

  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleAnswer = (type: string) => {
    const updated = [...answers, type];
    setAnswers(updated);

    if (currentStep + 1 < QUESTIONS.length) {
      setCurrentStep((c) => c + 1);
    } else {
      calculateResult(updated);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    // Count frequencies
    const counts: Record<string, number> = {};
    finalAnswers.forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });

    let maxType = 'observer';
    let maxCount = 0;
    Object.entries(counts).forEach(([t, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxType = t;
      }
    });

    const prof = PROFILES[maxType] || PROFILES.observer;
    setResultProfile(prof);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const restartQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResultProfile(null);
  };

  const downloadResultCard = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas || !resultProfile) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = resultProfile.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PERSONALITY REVEAL • The MoSaFa Tools', W / 2, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Hind Siliguri", sans-serif';
    ctx.fillText(`${userName || 'আপনার'} ব্যক্তিত্বের রূপরেখা 🌟`, W / 2, 115);

    // Profile Title
    ctx.fillStyle = resultProfile.color;
    ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
    ctx.fillText(resultProfile.title, W / 2, 180);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'italic 16px "Hind Siliguri", sans-serif';
    ctx.fillText(`“${resultProfile.tagline}”`, W / 2, 215);

    // Description text wrapped
    ctx.fillStyle = '#f8fafc';
    ctx.font = '400 16px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';

    const words = resultProfile.description.split(' ');
    let line = '';
    let curY = 270;
    for (let i = 0; i < words.length; i++) {
      const test = line ? `${line} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > W - 120 && i > 0) {
        ctx.fillText(line, 60, curY);
        line = words[i];
        curY += 28;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 60, curY);

    curY += 45;

    // Strengths
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('🌟 প্রধান শক্তি ও সম্ভাবনা:', 60, curY);
    curY += 30;

    resultProfile.strengths.forEach((s) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '15px "Hind Siliguri", sans-serif';
      ctx.fillText(`• ${s}`, 80, curY);
      curY += 26;
    });

    // Privacy & Entertainment disclaimer
    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒 ব্যক্তিগত উত্তরের গোপনীয়তা সুরক্ষিত • বিনোদন ও আত্মোপলব্ধির উদ্দেশ্যে প্রণীত', W / 2, H - 45);

    const link = document.createElement('a');
    link.download = `Personality-Result-${userName}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('ব্যক্তিত্বের রেজাল্ট কার্ড ডাউনলোড হয়েছে! 🎨', '🎉');
  };

  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full max-w-3xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">MoSaFa Personality Reveal</h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                ব্যক্তিত্ব টেস্ট
              </span>
            </div>
            <p className="text-xs text-slate-500">১০টি মজাদার প্রশ্নে নিজের আসল স্বভাব ও শক্তি আবিষ্কার করুন</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resultProfile && (
            <button
              onClick={restartQuiz}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>পুনরায় টেস্ট</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        {!resultProfile ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            {/* Step progress & User Name */}
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">নাম:</span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="আপনার নাম..."
                  className="px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-indigo-600">
                  প্রশ্ন {currentStep + 1} / {QUESTIONS.length}
                </span>
                <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-5">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.type)}
                  className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/90 hover:border-indigo-300 text-left text-xs sm:text-sm font-medium text-slate-800 transition flex items-center justify-between cursor-pointer active:scale-98"
                >
                  <span>{opt.text}</span>
                  <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                </button>
              ))}
            </div>

            {/* Privacy note */}
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>আপনার ব্যক্তিগত উত্তরসমূহ কোনো সার্ভারে জমা হয় না, সম্পূর্ণ নিরাপদ।</span>
            </div>
          </div>
        ) : (
          /* Profile Result Reveal Card */
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="text-center pb-5 mb-5 border-b border-slate-100">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 tracking-wider uppercase mb-2 inline-block">
                ব্যক্তিত্ব উন্মোচন ফলাফল 🌟
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
                {userName || 'আপনার'} ফলাফল:{' '}
                <span style={{ color: resultProfile.color }}>{resultProfile.title}</span>
              </h2>
              <p className="text-xs text-slate-500 italic">“{resultProfile.tagline}”</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {resultProfile.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                <span className="font-bold text-emerald-800 flex items-center gap-1 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> আপনার প্রধান শক্তি:
                </span>
                <ul className="space-y-1 text-slate-700 font-medium">
                  {resultProfile.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-100">
                <span className="font-bold text-amber-800 flex items-center gap-1 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" /> আত্মউন্নয়ন পরামর্শ:
                </span>
                <ul className="space-y-1 text-slate-700 font-medium">
                  {resultProfile.growthAreas.map((g, i) => (
                    <li key={i}>• {g}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-400 text-center mb-6">
              * এই মূল্যায়নটি আত্মোপলব্ধি ও বিনোদনের জন্য প্রণীত, কোনো বৈজ্ঞানিক বা ক্লিনিক্যাল সাইকোলজিক্যাল সনদপত্র নয়।
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={downloadResultCard}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>ফলাফল কার্ড ডাউনলোড (PNG)</span>
              </button>
              <button
                onClick={restartQuiz}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                🔄 আবার দিন
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Hidden Canvas for PNG Card */}
      <canvas ref={cardCanvasRef} className="hidden" />
    </div>
  );
};
