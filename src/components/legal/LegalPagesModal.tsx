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
  Globe,
  Award,
} from 'lucide-react';
import { LEGAL_PAGES_DATA, LegalTab, VERIFIED_PLATFORM_INFO } from '../../data/legalPagesContent';

export type { LegalTab };

interface LegalPageBodyProps {
  activeTab: LegalTab;
  onOpenDeveloperModal?: () => void;
}

export const LegalPageBody: React.FC<LegalPageBodyProps> = ({
  activeTab,
  onOpenDeveloperModal,
}) => {
  const pageData = LEGAL_PAGES_DATA[activeTab];

  const bannerStyles: Record<LegalTab, { bg: string; border: string; icon: React.ReactNode }> = {
    about: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      icon: <Globe className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />,
    },
    contact: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      icon: <PhoneCall className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />,
    },
    privacy: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-100',
      icon: <Lock className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />,
    },
    terms: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      icon: <FileText className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />,
    },
  };

  const style = bannerStyles[activeTab];

  return (
    <div className="space-y-5 text-slate-700 text-sm leading-relaxed">
      <div className={`p-4 sm:p-5 rounded-2xl ${style.bg} border ${style.border} flex items-start gap-3`}>
        {style.icon}
        <div>
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg mb-1">{pageData.title}</h2>
          <p className="text-xs sm:text-sm text-slate-600">{pageData.subtitle}</p>
        </div>
      </div>

      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">হোয়াটসঅ্যাপ ও ফোন</span>
              <a
                href={`tel:${VERIFIED_PLATFORM_INFO.phoneDisplay.replace(/\s+/g, '')}`}
                className="text-sm font-extrabold text-slate-900 hover:text-emerald-700 transition"
              >
                {VERIFIED_PLATFORM_INFO.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">অফিসিয়াল ইমেইল</span>
              <a
                href={`mailto:${VERIFIED_PLATFORM_INFO.email}`}
                className="text-sm font-extrabold text-slate-900 hover:text-rose-700 transition break-all"
              >
                {VERIFIED_PLATFORM_INFO.email}
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">ওয়েবসাইট ডোমেইন</span>
              <a
                href={VERIFIED_PLATFORM_INFO.domain}
                className="text-sm font-extrabold text-slate-900 hover:text-indigo-700 transition break-all"
              >
                {VERIFIED_PLATFORM_INFO.domain}
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">ডেভেলপার ও পরিচালক</span>
              <p className="text-sm font-extrabold text-slate-900">
                {VERIFIED_PLATFORM_INFO.operatorName} ({VERIFIED_PLATFORM_INFO.siteName})
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {pageData.sections.map((section, index) => (
          <section key={index} className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{section.heading}</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{section.body}</p>
            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 pt-1">
                {section.bullets.map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {pageData.disclaimer && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
          {pageData.disclaimer}
        </div>
      )}

      {activeTab === 'contact' && onOpenDeveloperModal && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenDeveloperModal}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>সরাসরি হোয়াটসঅ্যাপ সাপোর্ট ফরম ওপেন করুন</span>
          </button>
        </div>
      )}
    </div>
  );
};

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
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                MoSaFa Tools লিগ্যাল ও তথ্য কেন্দ্র
              </h3>
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
        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          <LegalPageBody
            activeTab={activeTab}
            onOpenDeveloperModal={
              onOpenDeveloperModal
                ? () => {
                    onClose();
                    onOpenDeveloperModal();
                  }
                : undefined
            }
          />
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
