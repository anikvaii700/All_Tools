// Main Government Offices Hub (সকল সরকারি অফিস)
// Designed in exact accordance with user sketch: 3 lines, each line 3 offices (3x3 grid) with large logos and office names.
import React, { useState } from 'react';
import {
  ArrowLeft,
  Home,
  Building2,
  Vote,
  BookMarked,
  Landmark,
  Baby,
  Receipt,
  Car,
  HeartHandshake,
  Shield,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Phone,
  FileCheck2,
  CreditCard,
  BookOpen,
  HelpCircle,
  X,
  LayoutGrid,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
} from 'lucide-react';
import { GOV_OFFICES_REGISTRY } from './knowledgeBase/officesRegistry';
import { GovOffice, OfficeId } from './types';
import { GovOfficeLogo } from './GovOfficeLogo';
import { NidSimpleFormat } from './nid-assistant/NidSimpleFormat';

interface GovOfficesHubProps {
  onBackToHub: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const GovOfficesHub: React.FC<GovOfficesHubProps> = ({ onBackToHub, onShowToast }) => {
  // View mode: 'grid' displays the 3x3 offices diagram; 'office-detail' displays the selected office services
  const [viewMode, setViewMode] = useState<'grid' | 'office-detail'>('grid');
  const [selectedOfficeId, setSelectedOfficeId] = useState<OfficeId>('election-commission');
  const [upcomingOfficeModal, setUpcomingOfficeModal] = useState<GovOffice | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentOffice =
    GOV_OFFICES_REGISTRY.find((o) => o.id === selectedOfficeId) || GOV_OFFICES_REGISTRY[0];

  const handleOfficeCardClick = (office: GovOffice) => {
    if (office.id === 'election-commission') {
      setSelectedOfficeId('election-commission');
      setViewMode('office-detail');
      onShowToast('বাংলাদেশ নির্বাচন কমিশন সেবায় আপনাকে স্বাগতম!', '🗳️');
    } else {
      setUpcomingOfficeModal(office);
    }
  };

  const filteredOffices = GOV_OFFICES_REGISTRY.filter((office) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      office.displayGridTitle.toLowerCase().includes(q) ||
      office.nameBn.toLowerCase().includes(q) ||
      office.nameEn.toLowerCase().includes(q) ||
      office.shortName.toLowerCase().includes(q) ||
      office.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Universal Top Bar: শুধুমাত্র ২টি বাটন: ১। "পিছনে যান" এবং ২। "হোম পেইজ" */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            {/* ১। পিছনে যান */}
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'office-detail') {
                  setViewMode('grid');
                } else {
                  onBackToHub();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer border border-slate-200 shadow-2xs"
              title="পূর্ববর্তী পৃষ্ঠায় ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5] text-slate-700" />
              <span>পিছনে যান</span>
            </button>

            {/* ২। হোম পেইজ */}
            <button
              type="button"
              onClick={onBackToHub}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-xs"
              title="হোম পেইজে ফিরে যান"
            >
              <Home className="w-4 h-4 stroke-[2.5] text-white" />
              <span>হোম পেইজ</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 1. PRIMARY VIEW: 3 LINES × 3 OFFICES GRID (EXACT SKETCH) */}
      {/* ========================================================= */}
      {viewMode === 'grid' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full space-y-8">
          {/* Top Banner / Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার • স্মার্ট সরকারি অফিস সেবা হাব</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              প্রতিটি সরকারি অফিসের নাম ও বড় লোগো
            </h2>
            <p className="text-sm text-slate-600">
              নিচের ৩টি লাইনে সাজানো ৯টি গুরুত্বপূর্ণ সরকারি দপ্তর থেকে আপনার কাঙ্ক্ষিত অফিস নির্বাচন করুন।
            </p>

            {/* Quick Search Bar */}
            <div className="pt-2 max-w-md mx-auto relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="অফিসের নাম দিয়ে খুঁজুন... যেমন: নির্বাচন, পাসপোর্ট, ভূমি, জন্ম"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 shadow-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* 3×3 Grid Container matching user sketch:
              3 lines, each line 3 offices on desktop/tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredOffices.map((office, idx) => {
              const isActive = office.status === 'active';
              return (
                <div
                  key={office.id}
                  onClick={() => handleOfficeCardClick(office)}
                  className={`group relative bg-white rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                    isActive
                      ? 'border-emerald-500/80 ring-2 ring-emerald-100 hover:border-emerald-600'
                      : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {/* Active Status Badge in Top-Right */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>সক্রিয় সেবা</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>শীঘ্রই আসছে</span>
                      </span>
                    )}
                  </div>

                  {/* Top Office Number / Line Indicator */}
                  <div className="absolute top-3.5 left-4 z-10">
                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* 1. TOP PORTION: BIG LOGO (EXACT USER DRAWING "লোগো") */}
                  <div className="h-44 sm:h-48 w-full bg-gradient-to-b from-slate-50/90 to-slate-100/60 flex flex-col items-center justify-center p-6 relative group-hover:from-white group-hover:to-slate-50 transition-colors">
                    <div className="transform transition-transform duration-300 group-hover:scale-110">
                      <GovOfficeLogo officeId={office.id} size="lg" />
                    </div>
                  </div>

                  {/* HORIZONTAL DIVIDING BORDER (AS DRAWN IN USER SKETCH) */}
                  <div className="w-full border-t-2 border-slate-200 group-hover:border-slate-300 transition-colors" />

                  {/* 2. BOTTOM PORTION: OFFICE NAME (AS DRAWN IN USER SKETCH) */}
                  <div className="p-4 sm:p-5 bg-white flex flex-col justify-between flex-1 text-center">
                    <div>
                      {/* Bold prominent office name as in sketch (e.g. "নির্বাচন অফিস", "সমাজ সেবা অফিস", "পাসপোর্ট অফিস") */}
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors tracking-tight">
                        {office.displayGridTitle}
                      </h3>

                      {/* Official Department Name */}
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {office.nameBn}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {office.description}
                      </p>
                    </div>

                    {/* Action button bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-rose-500" />
                        <span>{office.helpline || 'হেল্পলাইন'}</span>
                      </span>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                          <span>সেবা শুরু করুন</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                          <span>বিবরণ দেখুন</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice Info */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <p className="leading-relaxed">
                <span className="font-bold">সক্রিয় সেবা:</span> বর্তমানে বাংলাদেশ নির্বাচন কমিশনের সম্পূর্ণ NID সংশোধন সহকারী, ফি চার্ট ও আবেদন বিধিমালা লাইভ রয়েছে। অন্যান্য দপ্তরগুলোর সরকারি ডেটা পর্যায়ক্রমে যুক্ত হচ্ছে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedOfficeId('election-commission');
                setViewMode('office-detail');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold whitespace-nowrap transition cursor-pointer active:scale-95 shadow-xs"
            >
              নির্বাচন অফিসে যান →
            </button>
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* 2. ELECTION COMMISSION WORKSPACE (FULL NID CORRECTION SUITE) */}
      {/* ========================================================= */}
      {viewMode === 'office-detail' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
          {/* Active Office Status Indicator */}
          <div className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>সরকারি সেবা ডেস্ক</span>
            </div>

            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>সক্রিয় দপ্তর: বাংলাদেশ নির্বাচন কমিশন</span>
            </span>
          </div>

          {/* Selected Office Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-md">
                  <GovOfficeLogo officeId={currentOffice.id} size="md" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {currentOffice.nameBn}
                    </h2>
                    <span className="text-xs text-slate-500">({currentOffice.nameEn})</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded">
                      ১২টি সংশোধন সেবা প্রস্তুত
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                    {currentOffice.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <a
                  href={currentOffice.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <span>services.nidw.gov.bd</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Clean Wireframe Format (Exact match to user sketch image_a0424efe.png) */}
          <NidSimpleFormat onShowToast={onShowToast} />
        </main>
      )}

      {/* Upcoming Office Roadmap Modal */}
      {upcomingOfficeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setUpcomingOfficeModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0">
                <GovOfficeLogo officeId={upcomingOfficeModal.id} size="md" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  পরিকল্পনাধীন দপ্তর
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {upcomingOfficeModal.nameBn}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {upcomingOfficeModal.displayGridTitle}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {upcomingOfficeModal.description}
            </p>

            {upcomingOfficeModal.helpline && (
              <div className="mb-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <span className="font-semibold">অফিসিয়াল হেল্পলাইন:</span>
                <span className="font-mono font-bold text-amber-950">{upcomingOfficeModal.helpline}</span>
              </div>
            )}

            {upcomingOfficeModal.upcomingFeatures && upcomingOfficeModal.upcomingFeatures.length > 0 && (
              <div className="mb-5 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  পরবর্তী আপডেটে যে সেবাগুলো যুক্ত হবে:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {upcomingOfficeModal.upcomingFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              {upcomingOfficeModal.officialPortalUrl && (
                <a
                  href={upcomingOfficeModal.officialPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>অফিসিয়াল পোর্টালে সরাসরি যান</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setUpcomingOfficeModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            The MoSaFa Tools • সকল সরকারি অফিস হাব — তথ্যের নির্ভরযোগ্যতা ও নাগরিক সেবায় নিবেদিত।
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            তথ্যের উৎস: বাংলাদেশ নির্বাচন কমিশন, জাতীয় ই-গভর্নেন্স ও সংশ্লিষ্ট সরকারি গেজেট ও প্রজ্ঞাপনসমূহ।
          </p>
        </div>
      </footer>
    </div>
  );
};
