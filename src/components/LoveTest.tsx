import React from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  MessageCircle,
  Scale,
  Compass,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import { ToolVisualLogo } from './ToolVisualLogo';

interface LoveTestProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
  onNavigateToTool?: (toolId: string) => void;
}

const CORE_PILLARS = [
  {
    icon: ShieldCheck,
    accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    title: 'পারস্পরিক বিশ্বাস ও সততা',
    body: 'যেকোনো দীর্ঘস্থায়ী সম্পর্কের প্রথম ভিত্তি হলো স্বচ্ছতা ও বিশ্বাস। ছোটখাটো বিষয় লুকানো বা অযথা সন্দেহ সম্পর্ককে দুর্বল করে; বিপরীতে সৎ ও খোলামেলা আচরণ দুজনের মধ্যে নিরাপদ মানসিক আশ্রয় তৈরি করে।',
  },
  {
    icon: MessageCircle,
    accent: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    title: 'সুস্থ ও মনোযোগী যোগাযোগ',
    body: 'কেবল নিজের কথা বলা নয়, সঙ্গীর অনুভূতি ও দৃষ্টিভঙ্গি মনোযোগ দিয়ে শোনাও সমান জরুরি। অভিযোগের সুরে না বলে নিজের অনুভূতি শান্তভাবে প্রকাশ করলে ভুল বোঝাবুঝি দ্রুত কমে।',
  },
  {
    icon: Scale,
    accent: 'text-amber-700 bg-amber-50 border-amber-200',
    title: 'সম্মান ও ব্যক্তিস্বাধীনতা',
    body: 'ভালোবাসা মানে কাউকে নিয়ন্ত্রণ করা নয়। একে অপরের মতামত, ব্যক্তিগত সময়, পড়াশোনা, ক্যারিয়ার ও পরিবারের প্রতি শ্রদ্ধাশীল থাকাই সুস্থ সম্পর্কের পরিচয়।',
  },
  {
    icon: HeartHandshake,
    accent: 'text-rose-700 bg-rose-50 border-rose-200',
    title: 'মতবিরোধের শান্তিপূর্ণ সমাধান',
    body: 'দুজন মানুষের চিন্তাভাবনা সবসময় এক হবে না—এটাই স্বাভাবিক। রাগের মাথায় কটূক্তি বা নীরব অভিমান ধরে না রেখে শান্ত হয়ে সমস্যার সমাধান খোঁজাই পরিণত মানসিকতার লক্ষণ।',
  },
  {
    icon: Compass,
    accent: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    title: 'ভবিষ্যৎ লক্ষ্য ও মূল্যবোধের মিল',
    body: 'জীবনযাপন, অর্থনৈতিক দায়িত্ববোধ, পরিবার ও ভবিষ্যৎ পরিকল্পনা নিয়ে স্পষ্ট ধারণা থাকলে সম্পর্কের পথচলা সহজ হয়। বড় সিদ্ধান্তগুলো একসাথে আলোচনা করে নেওয়া উচিত।',
  },
  {
    icon: Users,
    accent: 'text-violet-700 bg-violet-50 border-violet-200',
    title: 'কঠিন সময়ে পাশে থাকা',
    body: 'সুখের সময়ের চেয়েও মানসিক চাপ, অসুস্থতা বা ব্যর্থতার মুহূর্তে একে অপরের পাশে দাঁড়ানোই সম্পর্কের প্রকৃত গভীরতা ও আন্তরিকতা প্রমাণ করে।',
  },
];

const HEALTHY_SIGNS = [
  'একে অপরের সামনে নিজের মনের কথা বলতে কোনো ভয় বা সংকোচ কাজ করে না।',
  'ভুল হলে দুজনেই অহংকার ছেড়ে আন্তরিকভাবে দুঃখ প্রকাশ ও সংশোধন করেন।',
  'সঙ্গীর সাফল্যে ঈর্ষা নয়, বরং গর্ব ও অনুপ্রেরণা অনুভব করা হয়।',
  'দুজনের ব্যক্তিগত সীমারেখা (Boundaries) ও পরিবারের প্রতি সম্মান বজায় থাকে।',
  'দৈনন্দিন দায়িত্ব ও সিদ্ধান্তে পারস্পরিক সহযোগিতা ও ভারসাম্য থাকে।',
];

const WARNING_SIGNS = [
  'অতিরিক্ত সন্দেহ, ফোন বা ব্যক্তিগত বিষয়ে সার্বক্ষণিক নজরদারি ও নিয়ন্ত্রণের চেষ্টা।',
  'কথায় কথায় অবমূল্যায়ন, অপমান বা মানসিক চাপে ফেলা।',
  'সমস্যা নিয়ে আলোচনার বদলে দোষারোপ করা বা দীর্ঘদিন যোগাযোগ বন্ধ রাখা।',
  'একতরফা ত্যাগ আশা করা এবং সঙ্গীর অনুভূতিকে গুরুত্ব না দেওয়া।',
  'ভবিষ্যৎ পরিকল্পনা বা প্রতিশ্রুতি নিয়ে অস্পষ্টতা ও বারবার বিশ্বাসভঙ্গ।',
];

const PRACTICAL_HABITS = [
  {
    step: '১',
    title: 'নিয়মিত মানসম্মত সময় কাটান',
    detail: 'ব্যস্ততার মাঝেও প্রতিদিন অন্তত কিছুটা সময় মোবাইল সরিয়ে রেখে একে অপরের দিনকাল ও অনুভূতি জানুন।',
  },
  {
    step: '২',
    title: 'কৃতজ্ঞতা ও প্রশংসা প্রকাশ করুন',
    detail: 'ছোট ছোট যত্ন ও সহযোগিতার জন্য ধন্যবাদ জানানো এবং সঙ্গীর ভালো গুণের প্রশংসা করা ভালোবাসাকে সতেজ রাখে।',
  },
  {
    step: '৩',
    title: 'অনুমান নয়, সরাসরি জিজ্ঞেস করুন',
    detail: 'কোনো বিষয় নিয়ে মন খারাপ হলে মনে মনে ধারণা তৈরি না করে শান্ত ভাষায় সরাসরি আলোচনা করুন।',
  },
  {
    step: '৪',
    title: 'ক্ষমা ও ধৈর্যের চর্চা করুন',
    detail: 'অতীতের মীমাংসিত ভুল বারবার টেনে না এনে বর্তমান ও ভবিষ্যৎ সুন্দর করার দিকে মনোযোগ দিন।',
  },
];

const FAQS = [
  {
    q: 'কোনো অনলাইন টেস্ট বা স্কোর দিয়ে কি ভালোবাসার সত্যতা যাচাই করা যায়?',
    a: 'না, কোনো স্বয়ংক্রিয় স্কোর বা অ্যালগরিদম মানুষের বাস্তব অনুভূতি ও সম্পর্কের গভীরতা মাপতে পারে না। বাস্তব সম্পর্কের মানদণ্ড হলো পারস্পরিক বিশ্বাস, সম্মান, সততা এবং দায়িত্বশীল আচরণ।',
  },
  {
    q: 'সম্পর্কের সামঞ্জস্যতা (Relationship Compatibility) কীভাবে বোঝা যায়?',
    a: 'জীবনের মূল মূল্যবোধ, যোগাযোগের সাবলীলতা, মতবিরোধের সময় একে অপরের প্রতি শ্রদ্ধা, পারিবারিক ও ভবিষ্যৎ লক্ষ্য নিয়ে বোঝাপড়া—এই বাস্তব বিষয়গুলোর মাধ্যমেই প্রকৃত সামঞ্জস্যতা বোঝা যায়।',
  },
  {
    q: 'এই পেজে কি কোনো ব্যক্তিগত তথ্য বা নাম সংরক্ষণ করা হয়?',
    a: 'না, আপনার গোপনীয়তা সম্পূর্ণ সুরক্ষিত। এখানে কোনো ব্যক্তিগত তথ্য, নাম বা ইনপুট সংগ্রহ কিংবা ডেটাবেজে সংরক্ষণ করা হয় না।',
  },
  {
    q: 'সম্পর্কে ভুল বোঝাবুঝি হলে প্রথমে কী করা উচিত?',
    a: 'উত্তেজিত অবস্থায় তর্ক না করে দুজনেই কিছুটা সময় নিয়ে শান্ত হন, এরপর দোষারোপের বদলে নিজের অনুভূতি পরিষ্কারভাবে প্রকাশ করুন এবং উভয়ের কথা মন দিয়ে শুনুন।',
  },
];

const RELATED_TOOLS = [
  {
    id: 'bangla-status',
    href: '/tools/bangla-status',
    name: 'বাংলা স্ট্যাটাস ও ক্যাপশন হাব',
  },
  {
    id: 'name-reveal',
    href: '/tools/name-reveal',
    name: 'নামের অর্থ ও উৎস (Name Reveal)',
  },
  {
    id: 'golpo-ghor',
    href: '/tools/golpo-ghor',
    name: 'গল্পের ঘর (বাংলা গল্প লাইব্রেরি)',
  },
  {
    id: 'age-calc',
    href: '/tools/age-calc',
    name: 'বয়স ক্যালকুলেটর (Age Calculator)',
  },
  {
    id: 'bangla-quiz',
    href: '/tools/bangla-quiz',
    name: 'বাংলা ধাঁধা ও সাধারণ জ্ঞান কুইজ',
  },
  {
    id: 'poster-studio',
    href: '/tools/poster-studio',
    name: 'MoSaFa AI Photo Status & Frame Studio',
  },
];

export const LoveTest: React.FC<LoveTestProps> = ({
  onBackToHub,
  onNavigateToTool,
}) => {
  const handleRelatedClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    toolId: string
  ) => {
    if (onNavigateToTool) {
      e.preventDefault();
      onNavigateToTool(toolId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Editorial Hero Section */}
      <section className="bg-gradient-to-b from-rose-50/80 via-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between gap-3 mb-6">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onBackToHub();
              }}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-indigo-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>সকল টুলস দেখুন</span>
            </a>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
              <BookOpen className="w-3.5 h-3.5" />
              <span>সম্পর্ক ও সুস্থ ভালোবাসা গাইড</span>
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              সম্পর্কের সামঞ্জস্যতা ও সুস্থ ভালোবাসার বাস্তব নির্দেশিকা
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              একটি সুন্দর ও দীর্ঘস্থায়ী সম্পর্ক কোনো কাকতালীয় সংখ্যা বা অনলাইন স্কোরের ওপর নির্ভর করে না।
              পারস্পরিক বিশ্বাস, সম্মান, স্বচ্ছ যোগাযোগ এবং জীবনের লক্ষ্য নিয়ে সচেতন বোঝাপড়াই দুটি মানুষের
              মধ্যে প্রকৃত সামঞ্জস্যতা গড়ে তোলে।
            </p>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-600 leading-relaxed shadow-2xs">
              <strong className="text-slate-900">তথ্য বিজ্ঞপ্তি:</strong> পূর্বের ইন্টারঅ্যাক্টিভ লাভ টেস্ট
              কুইজ ফিচারটি বন্ধ করা হয়েছে। তার পরিবর্তে সম্পর্ক, সামঞ্জস্যতা ও সুস্থ ভালোবাসা বিষয়ক এই
              নির্ভরযোগ্য নির্দেশিকাটি সবার জন্য উন্মুক্ত রাখা হয়েছে।
            </div>
          </div>
        </div>
      </section>

      {/* Main Informative Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Section 1: Understanding Relationship Compatibility */}
        <article className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            সম্পর্কের সামঞ্জস্যতা (Relationship Compatibility) বলতে কী বোঝায়?
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            অনেকেই মনে করেন দুজন মানুষের পছন্দ-অপছন্দ হুবহু এক হলেই সম্পর্ক সবচেয়ে ভালো হয়। বাস্তবে
            সামঞ্জস্যতা মানে সব বিষয়ে একমত হওয়া নয়; বরং ভিন্ন মত ও ব্যক্তিত্ব নিয়েও একে অপরকে সম্মান করে
            একসাথে এগিয়ে চলার সক্ষমতা।
          </p>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            জীবনের মৌলিক মূল্যবোধ—যেমন সততা, পারিবারিক দায়িত্ববোধ, একে অপরের মানসিক স্বাস্থ্যের প্রতি
            যত্ন এবং ভবিষ্যৎ পরিকল্পনায় স্বচ্ছতা—যখন মিলে যায়, তখন সম্পর্ক স্বাভাবিকভাবেই নিরাপদ ও
            শান্তিময় হয়ে ওঠে।
          </p>
        </article>

        {/* Section 2: 6 Core Pillars */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              সুস্থ ও দীর্ঘস্থায়ী সম্পর্কের ৬টি মূল স্তম্ভ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              যেকোনো দাম্পত্য, পারিবারিক বা ঘনিষ্ঠ সম্পর্ককে মজবুত রাখতে এই ছয়টি গুণ সবচেয়ে কার্যকর।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CORE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${pillar.accent}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Healthy vs Warning Signs */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl border border-emerald-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2 className="text-lg font-extrabold text-slate-900">
                সুস্থ সম্পর্কের ইতিবাচক লক্ষণ
              </h2>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {HEALTHY_SIGNS.map((sign) => (
                <li key={sign} className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-amber-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h2 className="text-lg font-extrabold text-slate-900">
                সতর্ক হওয়ার মতো লক্ষণসমূহ
              </h2>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {WARNING_SIGNS.map((sign) => (
                <li key={sign} className="flex items-start gap-2.5">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 4: Daily Habits */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <h2 className="text-xl font-extrabold text-slate-900">
              সম্পর্ক দৃঢ় রাখার ৪টি বাস্তব অভ্যাস
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRACTICAL_HABITS.map((habit) => (
              <div
                key={habit.step}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {habit.step}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {habit.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {habit.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Frequently Asked Questions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <h2 className="text-xl font-extrabold text-slate-900">
              সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-1.5"
              >
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {item.q}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Relevant Existing Tools */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              আমাদের অন্যান্য জনপ্রিয় অনলাইন টুলস
            </h2>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onBackToHub();
              }}
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 no-underline"
            >
              সব টুলস দেখুন →
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {RELATED_TOOLS.map((tool) => (
              <a
                key={tool.id}
                href={tool.href}
                onClick={(e) => handleRelatedClick(e, tool.id)}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="mb-3 flex items-center justify-center">
                  <ToolVisualLogo
                    toolId={tool.id}
                    className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                  {tool.name}
                </h3>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
