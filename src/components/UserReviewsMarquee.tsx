import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

export interface UserReview {
  id: number;
  name: string;
  location: string;
  role: string;
  rating: number;
  comment: string;
  toolUsed: string;
  avatarColor: string;
}

export const USER_REVIEWS_DATA: UserReview[] = [
  {
    id: 1,
    name: 'তানভীর আহমেদ',
    location: 'ঢাকা',
    role: 'শিক্ষার্থী',
    rating: 5,
    comment: 'Application Writer দিয়ে মাত্র ২ মিনিটে ছুটির আবেদনপত্র লিখে প্রিন্ট করেছি। একদম প্রমিত দাপ্তরিক ফরম্যাট!',
    toolUsed: 'MoSaFa Application Writer',
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 2,
    name: 'জান্নাতুল ফেরদৌস',
    location: 'চট্টগ্রাম',
    role: 'এইচএসসি পরীক্ষার্থী',
    rating: 5,
    comment: 'StudyMate BD-এর AI টিউটর যে-কোনো কঠিন অঙ্কের সমাধান এত সুন্দরভাবে বাংলায় বুঝিয়ে দেয়, সত্যিই অসাধারণ!',
    toolUsed: 'StudyMate BD 🎓',
    avatarColor: 'from-rose-500 to-pink-600',
  },
  {
    id: 3,
    name: 'মো. শফিকুল ইসলাম',
    location: 'রাজশাহী',
    role: 'ব্যবসায়ী',
    rating: 5,
    comment: 'MoSaFa Invoice Maker দিয়ে আমার ইলেকট্রনিক্স দোকানের ক্যাশ মেমো ও বিল বানিয়ে দিচ্ছি। ব্যবসার অনেক সময় বাঁচে।',
    toolUsed: 'MoSaFa Invoice Maker',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 4,
    name: 'ফারহানা হক',
    location: 'সিলেট',
    role: 'চাকরিপ্রার্থী',
    rating: 5,
    comment: 'সিভি মেকার থেকে প্রফেশনাল ফরম্যাটে ২ পেজের সুন্দর সিভি বানিয়ে জবে এপ্লাই করেছি। কোনো ঝামেলা ছাড়াই সম্পূর্ণ ফ্রি!',
    toolUsed: 'The MoSaFa CV Maker',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 5,
    name: 'আরিফুল ইসলাম',
    location: 'খুলনা',
    role: 'ডিটিপি ও প্রেস অপারেটর',
    rating: 5,
    comment: 'বাংলা টেক্সট কনভার্টারে বিজয় থেকে ইউনিকোড নিমেষেই কনভার্ট হয়ে যায়। ফন্ট ভাঙার কোনো সমস্যা হয় না।',
    toolUsed: 'বাংলা টেক্সট কনভার্টার',
    avatarColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 6,
    name: 'মেহেদী হাসান',
    location: 'বরিশাল',
    role: 'চাকরিজীবী',
    rating: 5,
    comment: 'ভোটার এলাকা পরিবর্তনের ফরম-১৩ পূরণ করা নিয়ে চিন্তায় ছিলাম, এখানে খুব সহজে সব তথ্য দিয়ে নির্ভুল অটো ফরম পেয়ে গেলাম।',
    toolUsed: 'ভোটার স্থানান্তর ফরম (Form-13)',
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: 7,
    name: 'সাদিয়া আক্তার',
    location: 'কুমিল্লা',
    role: 'গৃহিণী',
    rating: 5,
    comment: 'দৈনিক হিসাব খাতায় প্রতিদিনের সংসারের আয়-ব্যয় লিখে রাখি। মাস শেষে কত টাকা খরচ হলো সহজে দেখা যায়।',
    toolUsed: 'দৈনিক হিসাব খাতা',
    avatarColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 8,
    name: 'রফিকুল আলম',
    location: 'বগুড়া',
    role: 'শিক্ষক',
    rating: 5,
    comment: 'বিদ্যুৎ প্রিপেইড মিটার হেল্পার সত্যিই দারুণ! কয় টাকা রিচার্জে কত ইউনিট পাবো আগেই সঠিক হিসাব মিলে যায়।',
    toolUsed: 'প্রিপেইড মিটার সহকারী',
    avatarColor: 'from-teal-500 to-emerald-600',
  },
  {
    id: 9,
    name: 'শারমিন সুলতানা',
    location: 'ময়মনসিংহ',
    role: 'বইপ্রেমী',
    rating: 5,
    comment: 'গল্পের ঘর টুলসে হুমায়ূন আহমেদ ও শরৎচন্দ্রের এত সুন্দর গল্প ও বই পড়ার ব্যবস্থা রয়েছে, মন ভরে গেল।',
    toolUsed: 'গল্পের ঘর',
    avatarColor: 'from-violet-500 to-purple-600',
  },
  {
    id: 10,
    name: 'নাজমুল হুদা',
    location: 'রংপুর',
    role: 'ফ্রিল্যান্সার',
    rating: 5,
    comment: 'লিপি টাইপিং টেস্ট দিয়ে প্রতিদিন টাইপিং স্পিড প্র্যাকটিস করি। বাংলা টাইপিংয়ের গতি বাড়ানোর জন্য সেরা টুল।',
    toolUsed: 'লিপি টাইপিং স্পিড টেস্ট',
    avatarColor: 'from-blue-600 to-indigo-700',
  },
  {
    id: 11,
    name: 'তাসনিম জাহান',
    location: 'গাজীপুর',
    role: 'কন্টেন্ট ক্রিয়েটর',
    rating: 5,
    comment: 'পোস্টার স্টুডিও দিয়ে চমৎকার বাংলা ইসলামিক বাণী ও ফেসবুক পোস্টার বানিয়ে ফ্রেন্ডদের সাথে শেয়ার করি।',
    toolUsed: 'MoSaFa Poster Studio',
    avatarColor: 'from-rose-500 to-pink-500',
  },
  {
    id: 12,
    name: 'ইশতিয়াক চৌধুরী',
    location: 'কক্সবাজার',
    role: 'ভ্রমণপিপাসু',
    rating: 5,
    comment: 'বাস ভাড়া তালিকা থাকায় দূরপাল্লার যাতায়াতের আগে সঠিক সরকারি ভাড়ার হিসাবটা সহজে দেখে নেওয়া যায়।',
    toolUsed: 'ঢাকা ও আন্তঃজেলা বাস ভাড়া',
    avatarColor: 'from-sky-500 to-blue-600',
  },
  {
    id: 13,
    name: 'জান্নাত আরা',
    location: 'নারায়ণগঞ্জ',
    role: 'কলেজ শিক্ষার্থী',
    rating: 5,
    comment: 'দৈনিক লাকি স্পিন করে কয়েন জমার সিস্টেমটা বেশ আকর্ষণীয়। প্রতিদিন এসে স্পিন করতে খুব ভালো লাগে।',
    toolUsed: 'দৈনিক লাকি স্পিনার ও কয়েন',
    avatarColor: 'from-amber-400 to-orange-500',
  },
  {
    id: 14,
    name: 'কবির হোসেন',
    location: 'পাবনা',
    role: 'অভিভাবক',
    rating: 5,
    comment: 'ফ্যামিলি ট্রি দিয়ে আমাদের ৪ প্রজন্মের বংশলতিকা বানিয়েছি। পরিবারের সবাই দেখে অনেক খুশি ও আবেগাপ্লুত হয়েছে।',
    toolUsed: 'ফ্যামিলি ট্রি বিল্ডার',
    avatarColor: 'from-emerald-600 to-teal-700',
  },
  {
    id: 15,
    name: 'মাহমুদা খাতুন',
    location: 'যশোর',
    role: 'বিশ্ববিদ্যালয় শিক্ষার্থী',
    rating: 5,
    comment: 'নামের গোপন রহস্য টুলসে নিজের নামের বিশ্লেষণ দেখে অবাক হয়েছি, বন্ধুদের সাথে শেয়ার করে অনেক মজা পেয়েছি।',
    toolUsed: 'নামের গোপন রহস্য',
    avatarColor: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 16,
    name: 'সৈকত রায়',
    location: 'দিনাজপুর',
    role: 'বিসিএস পরীক্ষার্থী',
    rating: 5,
    comment: 'বাংলা সাধারণ জ্ঞান ও মেধা কুইজ দিয়ে প্রতিদিন প্রস্তুতি ঝালাই করি। চাকরির প্রস্তুতির জন্য বেশ সহায়ক।',
    toolUsed: 'বাংলা মেধা কুইজ',
    avatarColor: 'from-indigo-500 to-violet-600',
  },
  {
    id: 17,
    name: 'শায়লা পারভীন',
    location: 'টাঙ্গাইল',
    role: 'শিক্ষিকা',
    rating: 5,
    comment: 'একদম ১০০% ফ্রি এবং কোনো বিজ্ঞাপন নেই। প্রয়োজনীয় প্রায় সকল অনলাইন টুলস এক ছাতার নিচে পেয়ে কৃতজ্ঞ।',
    toolUsed: 'The MoSaFa Tools পোর্টাল',
    avatarColor: 'from-teal-500 to-cyan-600',
  },
  {
    id: 18,
    name: 'তানজিমুল হক',
    location: 'ফেনী',
    role: 'অফিস সহকারী',
    rating: 5,
    comment: 'Application Writer-এ বাংলায় দরখাস্ত লিখলে সঠিক দাপ্তরিক ফরম্যাট বজায় থাকে। অফিসের কাজে নিয়মিত ব্যবহার করছি।',
    toolUsed: 'MoSaFa Application Writer',
    avatarColor: 'from-blue-600 to-indigo-600',
  },
  {
    id: 19,
    name: 'নুসরাত জাহান',
    location: 'ব্রাহ্মণবাড়িয়া',
    role: 'শিক্ষার্থী',
    rating: 5,
    comment: 'প্রেম টেস্ট বন্ধুদের সাথে দারুণ সময় কাটানোর চমৎকার মাধ্যম! বাস্তবসম্মত কুইজ ও আকর্ষণীয় সার্টিফিকেট পাওয়া যায়।',
    toolUsed: 'প্রেম টেস্ট (বাস্তব পরীক্ষা ও সনদপত্র)',
    avatarColor: 'from-rose-500 to-red-600',
  },
  {
    id: 20,
    name: 'কামরুল হাসান',
    location: 'কুষ্টিয়া',
    role: 'আইটি কর্মী',
    rating: 5,
    comment: 'মোবাইল ও ল্যাপটপ উভয় ডিভাইসেই খুব স্মুথলি কাজ করে। ডেভেলপারকে অসংখ্য ধন্যবাদ এমন দারুণ উদ্যোগের জন্য।',
    toolUsed: 'The MoSaFa Tools',
    avatarColor: 'from-slate-700 to-slate-900',
  },
  {
    id: 21,
    name: 'রোকসানা ইতি',
    location: 'সিরাজগঞ্জ',
    role: 'ব্যাংকার',
    rating: 5,
    comment: 'বয়স ক্যালকুলেটরে জন্মদিনের বাকি দিন ও মোট সপ্তাহ এত নিখুঁতভাবে দেখায় যা সচরাচর অন্য কোথাও মেলে না।',
    toolUsed: 'বয়স ক্যালকুলেটর',
    avatarColor: 'from-cyan-600 to-teal-600',
  },
  {
    id: 22,
    name: 'ইমরান নাজির',
    location: 'নোয়াখালী',
    role: 'উদ্যোক্তা',
    rating: 5,
    comment: 'সব প্রয়োজনীয় টুলস এক জায়গায় পেয়ে ব্রাউজারে বুকমার্ক করে রেখেছি। প্রতিদিনের কাজে এটা খুবই দরকারি।',
    toolUsed: 'The MoSaFa Tools পোর্টাল',
    avatarColor: 'from-violet-600 to-indigo-600',
  },
];

export const UserReviewsMarquee: React.FC = () => {
  // Duplicate array for an infinite loop with CSS marquee
  const duplicatedReviews = [...USER_REVIEWS_DATA, ...USER_REVIEWS_DATA];

  return (
    <div className="w-full py-6 overflow-hidden relative">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
            ব্যবহারকারীদের মতামত ও রিভিউ ({USER_REVIEWS_DATA.length}+ টি ফিডব্যাক)
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
          ← ডান থেকে বামে স্ক্রল হচ্ছে • হোভার করলে থামবে
        </span>
      </div>

      {/* Marquee Wrapper with soft edge gradients */}
      <div className="relative w-full overflow-hidden">
        {/* Left Fade Gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
        {/* Right Fade Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

        {/* Moving Track */}
        <div className="animate-marquee-slow flex gap-3.5 sm:gap-4 py-2 px-4 cursor-default">
          {duplicatedReviews.map((review, idx) => (
            <div
              key={`${review.id}-${idx}`}
              className="w-72 sm:w-80 shrink-0 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between text-left group"
            >
              <div>
                {/* Header: User Info & Stars */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${review.avatarColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs text-slate-900 leading-tight">
                          {review.name}
                        </span>
                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {review.location} • {review.role}
                      </span>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-[11px] sm:text-xs text-slate-700 font-medium leading-relaxed mb-3">
                  "{review.comment}"
                </p>
              </div>

              {/* Tool badge footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">ব্যবহৃত টুল:</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full truncate max-w-[170px]">
                  {review.toolUsed}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
