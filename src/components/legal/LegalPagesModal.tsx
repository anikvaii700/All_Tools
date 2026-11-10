import React, { useState } from 'react';
import {
  X,
  Shield,
  FileText,
  Info,
  PhoneCall,
  Mail,
  MessageSquare,
  Lock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Globe,
  Award,
} from 'lucide-react';

export type LegalTab = 'about' | 'contact' | 'privacy' | 'terms';

interface LegalPagesModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  onOpenDeveloperModal?: () => void;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  initialTab = 'about',
  onClose,
  onOpenDeveloperModal,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl bg-white rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-rose-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  MoSaFa Tools লিগ্যাল ও তথ্য কেন্দ্র
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                অফিসিয়াল নীতি ও ব্যবহারের তথ্যাবলি • tools.mosafabd.com
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
            aria-label="পপআপ বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'about'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Info className="w-4 h-4 text-indigo-600" />
            <span>আমাদের সম্পর্কে (About)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'contact'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>যোগাযোগ (Contact Us)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'privacy'
                ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Lock className="w-4 h-4 text-rose-600" />
            <span>গোপনীয়তা নীতি (Privacy)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'terms'
                ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>শর্তাবলী (Terms & Conditions)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 text-slate-700 text-sm leading-relaxed space-y-6">
          {/* TAB 1: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                <Globe className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1">
                    MoSaFa Tools (মুফাসসিরুল ইসলাম টুলস) সম্পর্কে
                  </h4>
                  <p className="text-xs text-slate-600">
                    একটি আধুনিক, বহুমুখী বাংলাদেশি ডিজিটাল অনলাইন সফটওয়্যার প্ল্যাটফর্ম।
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-2">আমাদের লক্ষ্য ও উদ্দেশ্য</h5>
                <p>
                  বাংলাদেশের সাধারণ নাগরিক, ছাত্র-ছাত্রী, চাকরিপ্রার্থী, উদ্যোক্তা ও দাপ্তরিক কর্মীদের দৈনন্দিন গুরুত্বপূর্ণ অনলাইন কাজসমূহকে এক ঠিকানায় সহজ, সাবলীল ও নির্ভুলভাবে সম্পন্ন করার জন্য <strong>The MoSaFa Tools</strong> গড়ে তোলা হয়েছে।
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-2">প্ল্যাটফর্মের মূল সেবাসমূহ</h5>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                  <li><strong>সরকারি ও নাগরিক ফরম ফিলআপ:</strong> ভোটার এলাকা স্থানান্তর ফরম-১৩, বাসা ভাড়ার রসিদ ও ২৪টি প্রমিত আবেদন ফরম জেনারেটর।</li>
                  <li><strong>শিক্ষা ও ক্যারিয়ার সহায়তা:</strong> StudyMate BD AI প্রাইভেট টিউটর, প্রফেশনাল CV ও রেজুমি মেকার, চাকরির ছবি ও স্বাক্ষর রিসাইজার।</li>
                  <li><strong>দাপ্তরিক ও ব্যবসায়িক টুলস:</strong> ইনভয়েস মেকার, মানি রিসিট, বাংলা টেক্সট কনভার্টার (ইউনিকোড ও বিজয়), পিএইচডি লেভেল অ্যাপ্লিকেশন রাইটার ও PDF টুলকিট।</li>
                  <li><strong>সৃজনশীল ও লাইফস্টাইল হাব:</strong> কনটেন্ট ক্রিয়েটর স্টুডিও, এন্টারপ্রেনার জার্নি, বাংলা গল্প ও উপন্যাস লাইব্রেরি (গল্প ঘর), এবং বয়স ও দৈনন্দিন হিসাব ক্যালকুলেটর।</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>ঘোষণাপত্র (Disclaimer):</strong> MoSaFa Tools কোনো সরকারি সংস্থা বা বাংলাদেশ সরকারের দাপ্তরিক ওয়েবসাইট নয়। এটি একটি স্বাধীন সফটওয়্যার পোর্টাল যা নাগরিকদের অফিসিয়াল ফর্ম তৈরি ও তথ্য পাওয়ার কাজকে সহজ করার জন্য উন্মুক্ত গাইডলাইন ও ডিজিটাল টুলস প্রদান করে।
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <PhoneCall className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1">
                    সরাসরি যোগাযোগ ও সহায়তা
                  </h4>
                  <p className="text-xs text-slate-600">
                    যেকোনো পরামর্শ, টেকনিক্যাল প্রশ্ন বা সহায়তায় আমাদের টিম আপনার পাশে রয়েছে।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">হোয়াটসঅ্যাপ সাপোর্ট</span>
                    <p className="text-sm font-extrabold text-slate-900">+880 1868-775577</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">অফিসিয়াল ইমেইল</span>
                    <p className="text-sm font-extrabold text-slate-900">mofassir4700@gmail.com</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">ওয়েবসাইট ডোমেইন</span>
                    <p className="text-sm font-extrabold text-slate-900">https://tools.mosafabd.com</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">ডেভেলপার ও ডিজাইনার</span>
                    <p className="text-sm font-extrabold text-slate-900">মুফাসসিরুল ইসলাম (The MoSaFa)</p>
                  </div>
                </div>
              </div>

              {onOpenDeveloperModal && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDeveloperModal();
                    }}
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>ডেভেলপার মেসেজিং উইন্ডো ওপেন করুন</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
                <Lock className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1">
                    গোপনীয়তা নীতিমালা (Privacy Policy)
                  </h4>
                  <p className="text-xs text-slate-600">
                    সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬ • আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা আমাদের অঙ্গীকার।
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <h6 className="font-bold text-slate-900 mb-1">১. সংগৃহীত তথ্য ও ব্যবহার</h6>
                  <p className="text-slate-600">
                    MoSaFa Tools ব্যবহারের সময় ব্যবহারকারীর সুবিধার্থে নাম, মোবাইল নম্বর অথবা ইমেইল ঠিকানা সংরক্ষণ করা হয় শুধুমাত্র অ্যাকাউন্ট ব্যবস্থাপনা, ব্যালেন্স ট্র্যাকিং এবং পয়েন্ট রিওয়ার্ড সংরক্ষণের উদ্দেশ্যে। ব্যবহারকারীর সম্মতি ব্যতিরেকে কোনো ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রয় বা শেয়ার করা হয় না।
                  </p>
                </div>

                <div>
                  <h6 className="font-bold text-slate-900 mb-1">২. ক্লাউড ডেটাবেজ ও নিরাপত্তা (Firestore & Firebase Auth)</h6>
                  <p className="text-slate-600">
                    আমাদের সিস্টেম গুগল ক্লাউড ফায়ারস্টোর (Google Cloud Firestore) এবং ফায়ারবেস অথেন্টিকেশন দ্বারা সুরক্ষিত। প্রতিটি ব্যবহারকারীর ব্যক্তিগত তথ্য এবং ট্রানজেকশন কঠোর রোল-ভিত্তিক সিকিউরিটি রুলস (Least-Privilege ABAC Rules) দ্বারা সংরক্ষিত, যাতে একজন ব্যবহারকারী কেবল নিজের রেকর্ডই দেখতে ও নিয়ন্ত্রণ করতে পারেন।
                  </p>
                </div>

                <div>
                  <h6 className="font-bold text-slate-900 mb-1">৩. কুকিজ ও লোকাল স্টোরেজ</h6>
                  <p className="text-slate-600">
                    দ্রুত ব্রাউজিং, অফলাইন প্রোগ্রেসিভ ওয়েব অ্যাপ (PWA) সমর্থন এবং রিফ্রেশের পর সেশন সচল রাখার জন্য ব্রাউজারের লোকাল স্টোরেজ ও টেকনিক্যাল সেশন কুকিজ ব্যবহার করা হয়।
                  </p>
                </div>

                <div>
                  <h6 className="font-bold text-slate-900 mb-1">৪. গুগল অ্যানালিটিক্স ও এডসেন্স নীতি</h6>
                  <p className="text-slate-600">
                    সাইটের পারফরম্যান্স ও ট্রাফিক বিশ্লেষণের জন্য আমরা Google Analytics 4 (GA4) ব্যবহার করি, যা কোনো সংবেদনশীল ব্যক্তিগত ডেটা সংগ্রহ করে না। আমরা Google AdSense ও ওয়েবমাস্টারদের কনটেন্ট পলিসি কঠোরভাবে মেনে চলি।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                <FileText className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1">
                    ব্যবহারের শর্তাবলী (Terms & Conditions)
                  </h4>
                  <p className="text-xs text-slate-600">
                    সর্বশেষ কার্যকর: নভেম্বর ২০২৬ • প্ল্যাটফর্ম ব্যবহারের সাধারণ বিধিমালার বিবরণী।
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <h6 className="font-bold text-slate-900 mb-1">১. সম্মতি প্রদান</h6>
                  <p className="text-slate-600">
                    MoSaFa Tools-এ প্রবেশ বা এর যেকোনো টুল ব্যবহার করার মাধ্যমে আপনি এই ব্যবহারের শর্তাবলী ও নীতিমালার প্রতি সম্মতি জ্ঞাপন করছেন।
                  </p>
                </div>

                <div>
                  <h6 className="font-bold text-slate-900 mb-1">২. কয়েন, ওয়ালেট ও রিওয়ার্ড ব্যবহারের নিয়ম</h6>
                  <p className="text-slate-600">
                    নতুন অ্যাকাউন্ট রেজিস্ট্রেশনে ৫০ কয়েন স্বয়ংক্রিয় ওয়েলকাম বোনাস প্রদান করা হয়। ব্যবহারকারী প্রতিদিন একবার ফ্রি লাকি স্পিনের মাধ্যমে রিওয়ার্ড অর্জন করতে পারেন (১ ক্যালেন্ডার দিনে ১ বার)। প্রতি ১০০ কয়েন সমান ১ টাকা মূল ব্যালেন্সে কনভার্ট করার সুবিধা প্রযোজ্য।
                  </p>
                </div>

                <div>
                  <h6 className="font-bold text-slate-900 mb-1">৩. ফরম ও ডকুমেন্টের নির্ভুলতা</h6>
                  <p className="text-slate-600">
                    অনলাইন আবেদন ফরম, ভোটার স্থানান্তর বা বাসা ভাড়ার রসিদে প্রবেশকৃত তথ্যের সত্যতা ও সঠিকতার পূর্ণ দায় ব্যবহারকারীর নিজের। প্ল্যাটফর্মের কোনো ফর্মের ভুল বা অসত্য তথ্যের কারণে সৃষ্ট সমস্যার দায়ভার প্ল্যাটফর্মের ওপর বর্তাবে না।
                  </p>
                </div>

                <div>
                  <h6 className="font-bold text-slate-900 mb-1">৪. নীতিমালার সংশোধন</h6>
                  <p className="text-slate-600">
                    কর্তৃপক্ষ যেকোনো সময়ে এই শর্তাবলী হালনাগাদ বা পরিবর্তন করার অধিকার সংরক্ষণ করে। পরিবর্তনসমূহ ওয়েবসাইটে প্রকাশের সাথে সাথে কার্যকর হবে।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close Bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            MoSaFa Tools • সকল নাগরিক অনলাইন সমাধান
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
