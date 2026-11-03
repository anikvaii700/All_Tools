// NID Correction Assistant (NID সংশোধন সহায়ক)
import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  RotateCcw,
  FileCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { NidCorrectionTypeId, DetectionResult } from '../types';
import {
  NID_CORRECTION_RULES,
  DEMO_TEST_CHIPS,
  DemoTestChip,
} from '../knowledgeBase/electionCommissionData';
import { detectCorrectionType } from './SmartCorrectionDetector';
import { CorrectionResultCard } from './CorrectionResultCard';

interface NidCorrectionAssistantProps {
  onShowToast: (msg: string, icon?: string) => void;
  onNavigateToTab?: (tabId: string) => void;
}

export const NidCorrectionAssistant: React.FC<NidCorrectionAssistantProps> = ({
  onShowToast,
  onNavigateToTab,
}) => {
  const [existingInfo, setExistingInfo] = useState<string>('মোসাঃ তানজিনা আক্তার');
  const [correctedInfo, setCorrectedInfo] = useState<string>('মোসাম্মৎ তানজিনা আক্তার');
  const [selectedType, setSelectedType] = useState<NidCorrectionTypeId | ''>('');
  const [detectionResult, setDetectionResult] = useState<DetectionResult>(() =>
    detectCorrectionType('মোসাঃ তানজিনা আক্তার', 'মোসাম্মৎ তানজিনা আক্তার')
  );
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(true);

  // Run analysis when inputs or explicit type changes
  const runAnalysis = (overrideType?: NidCorrectionTypeId) => {
    const typeToUse = overrideType !== undefined ? overrideType : (selectedType || undefined);
    const result = detectCorrectionType(existingInfo, correctedInfo, typeToUse);
    setDetectionResult(result);
    setIsAnalyzed(true);
  };

  const handleApplyDemoChip = (chip: DemoTestChip) => {
    setExistingInfo(chip.existingInfo);
    setCorrectedInfo(chip.correctedInfo);
    setSelectedType(chip.targetType);
    const result = detectCorrectionType(chip.existingInfo, chip.correctedInfo, chip.targetType);
    setDetectionResult(result);
    setIsAnalyzed(true);
    onShowToast(`নমুনা তথ্য লোড হয়েছে: ${chip.label}`, '✨');
  };

  const handleReset = () => {
    setExistingInfo('');
    setCorrectedInfo('');
    setSelectedType('');
    const emptyResult = detectCorrectionType('', '');
    setDetectionResult(emptyResult);
    setIsAnalyzed(false);
    onShowToast('তথ্য রিসেট করা হয়েছে', '🔄');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingInfo.trim() && !correctedInfo.trim() && !selectedType) {
      onShowToast('অনুগ্রহ করে বিদ্যমান বা কাঙ্ক্ষিত তথ্য লিখুন অথবা ধরন বাছাই করুন', '⚠️');
      return;
    }
    runAnalysis();
    onShowToast('সংশোধনের সরকারি নিয়ম ও ফি যাচাই সম্পন্ন!', '✅');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-indigo-50 border border-rose-200/80 rounded-3xl p-5 sm:p-6 text-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                স্মার্ট NID সহায়িকা
              </span>
              <span className="text-xs text-slate-500">বাংলাদেশ নির্বাচন কমিশন বিধিমালা অনুযায়ী</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              কীভাবে সংশোধন করবেন? আগে যাচাই করুন সরকারি নিয়ম, ফি ও প্রয়োজনীয় দলিল
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              আপনার বর্তমান জাতীয় পরিচয়পত্রের তথ্য এবং আপনি যা সংশোধন করতে চান তা লিখুন। আমাদের স্মার্ট
              অ্যালগরিদম স্বয়ংক্রিয়ভাবে ক্যাটাগরি, প্রযোজ্য ফি, ভ্যাট এবং অনুমোদিত নথির চেকলিস্ট তৈরি
              করে দেবে।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-left md:text-right hidden sm:block">
              <span className="text-[11px] text-slate-500 block">সরকারি হেল্পলাইন</span>
              <span className="text-sm font-bold text-indigo-700 font-mono">১০৫ (টোল ফ্রি)</span>
            </div>
          </div>
        </div>

        {/* Quick Demo Test Chips */}
        <div className="mt-4 pt-3.5 border-t border-rose-200/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>দ্রুত পরীক্ষা করতে ক্লিক করুন (নমুনা তথ্য):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_TEST_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleApplyDemoChip(chip)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-medium border border-slate-200 hover:border-rose-300 transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{chip.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">({chip.badge})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3-Column Input Form (Desktop 3 Cols, Mobile Stacked) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
        <form onSubmit={handleSearchSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Column 1: Existing Info */}
            <div className="flex flex-col">
              <label className="text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>১. বর্তমানে বিদ্যমান তথ্য (ভুল তথ্য)</span>
                <span className="text-[11px] text-slate-400 font-normal">যেমন: NID তে যা আছে</span>
              </label>
              <textarea
                value={existingInfo}
                onChange={(e) => setExistingInfo(e.target.value)}
                placeholder="উদাহরণ: মোসাঃ তানজিনা আক্তার বা ১৫/০৮/১৯৯৬"
                rows={3}
                className="w-full p-3 rounded-2xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs sm:text-sm text-slate-800 transition outline-none resize-none"
              />
              <span className="text-[11px] text-slate-400 mt-1">
                আপনার বর্তমান এনআইডি কার্ডে মুদ্রিত তথ্যটি এখানে দিন।
              </span>
            </div>

            {/* Column 2: Corrected Info */}
            <div className="flex flex-col">
              <label className="text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>২. কাঙ্ক্ষিত সংশোধিত তথ্য (সঠিক তথ্য)</span>
                <span className="text-[11px] text-slate-400 font-normal">যেমন: সনদে যা আছে</span>
              </label>
              <textarea
                value={correctedInfo}
                onChange={(e) => setCorrectedInfo(e.target.value)}
                placeholder="উদাহরণ: মোসাম্মৎ তানজিনা আক্তার বা ১২/১০/১৯৯৮"
                rows={3}
                className="w-full p-3 rounded-2xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs sm:text-sm text-slate-800 transition outline-none resize-none"
              />
              <span className="text-[11px] text-slate-400 mt-1">
                আপনি যে সঠিক তথ্য দিয়ে পরিবর্তন করতে চান তা লিখুন।
              </span>
            </div>

            {/* Column 3: Correction Type (Auto-detected or Manual Selection) */}
            <div className="flex flex-col">
              <label className="text-xs sm:text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>৩. সংশোধনের ধরন (১২টি প্রকারভেদ)</span>
                <span className="text-[11px] text-indigo-600 font-medium">অটো বা ড্রপডাউন</span>
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  const val = e.target.value as NidCorrectionTypeId | '';
                  setSelectedType(val);
                  if (val) {
                    runAnalysis(val);
                  }
                }}
                className="w-full p-3 rounded-2xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs sm:text-sm text-slate-800 bg-white transition outline-none"
              >
                <option value="">স্বয়ংক্রিয় সনাক্ত করুন (স্মার্ট ডিটেকশন)</option>
                {Object.values(NID_CORRECTION_RULES).map((rule) => (
                  <option key={rule.id} value={rule.id}>
                    {rule.numericId}. {rule.titleBn} ({rule.categoryCode} ক্যাটাগরি)
                  </option>
                ))}
              </select>
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">সনাক্ত ক্যাটাগরি: </span>
                <span className="text-rose-700 font-bold">
                  {detectionResult.rule.categoryCode} ({detectionResult.rule.titleBn})
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>গেজেট ২০২৪-২০২৫ অনুযায়ী শতভাগ নির্ভুল ও আপডেটেড নিয়ম</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>যাচাই করুন ও নিয়ম জানুন</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Result Display Card (Sections A, B, C, D, E, F) */}
      {isAnalyzed && (
        <CorrectionResultCard result={detectionResult} onShowToast={onShowToast} />
      )}
    </div>
  );
};
