// Comprehensive Result Box component displaying all sections A through F
import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  CreditCard,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
  Calendar,
  CheckSquare,
  Square,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { DetectionResult } from '../types';

interface CorrectionResultCardProps {
  result: DetectionResult;
  onApplyForCorrection?: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const CorrectionResultCard: React.FC<CorrectionResultCardProps> = ({
  result,
  onShowToast,
}) => {
  const { rule, reasoning, confidence, highlightDifference } = result;

  // Selected fee tier: 0 = 1st time, 1 = 2nd time, 2 = 3rd time
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(0);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  // Document checklist completion state
  const allDocs = [
    ...rule.mandatoryDocs.map((d) => ({ ...d, group: 'বাধ্যতামূলক' })),
    ...rule.supportingDocs.map((d) => ({ ...d, group: 'সহায়ক দলিল' })),
    ...rule.conditionalDocs.map((d) => ({ ...d, group: 'পরিস্থিতিভেদে' })),
  ];
  const [checkedDocIds, setCheckedDocIds] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const toggleDoc = (id: string) => {
    setCheckedDocIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalDocsCount = allDocs.length;
  const checkedDocsCount = Object.values(checkedDocIds).filter(Boolean).length;
  const readinessPercent =
    totalDocsCount > 0 ? Math.round((checkedDocsCount / totalDocsCount) * 100) : 0;

  const currentTier = rule.feeStructure.tiers[selectedTierIndex] || rule.feeStructure.tiers[0];
  const finalBase = isUrgent && currentTier.urgentBaseFee ? currentTier.urgentBaseFee : currentTier.baseFee;
  const finalVat =
    isUrgent && currentTier.urgentVatAmount ? currentTier.urgentVatAmount : currentTier.vatAmount;
  const finalTotal =
    isUrgent && currentTier.urgentTotalFee ? currentTier.urgentTotalFee : currentTier.totalFee;

  const toBn = (n: number | string): string => {
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/\d/g, (d) => bn[Number(d)]);
  };

  const handleCopySummary = () => {
    const summaryText = `[MoSaFa NID Assistant]
সংশোধনের বিষয়: ${rule.titleBn}
ক্যাটাগরি: ${rule.categoryCode} (${rule.authority})
মোট ফি: ৳ ${toBn(finalTotal)} (ভ্যাটসহ)
প্রয়োজনীয় মূল দলিল: ${rule.mandatoryDocs.map((d) => d.title).join(', ')}
অফিসিয়াল পোর্টাল: services.nidw.gov.bd`;

    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    onShowToast('সংশোধনের বিবরণ ও চেকলিস্ট ক্লিপবোর্ডে কপি হয়েছে!', '📋');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300">
      {/* Result Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-7 relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono">
                ক্যাটাগরি {rule.categoryCode}
              </span>
              <span className="text-xs text-slate-300">
                {confidence === 'high' ? 'স্মার্ট সনাক্তকরণ: নিশ্চিত' : 'সনাক্তকরণ: সম্ভাব্য'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {rule.averageWorkingDays}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5 text-wrap">
              {rule.titleBn}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {rule.subtitleBn}
            </p>

            {highlightDifference && (
              <div className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-rose-200 font-mono inline-block">
                {highlightDifference}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="তথ্য কপি করুন"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'কপি হয়েছে' : 'তথ্য কপি'}</span>
            </button>
            <a
              href="https://services.nidw.gov.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <span>অফিসিয়াল পোর্টাল</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Smart Reasoning Strip */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-indigo-200">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{reasoning}</span>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-7">
        {/* SECTION A: Authority & Category Overview */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>ক. সংশোধনের ধরন ও অনুমোদনকারী কর্তৃপক্ষ</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block mb-0.5">সরকারি ক্যাটাগরি কোড</span>
              <span className="text-sm font-bold text-slate-800">ক্যাটাগরি-"{rule.categoryCode}"</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 sm:col-span-2">
              <span className="text-[11px] text-slate-500 block mb-0.5">অনুমোদনকারী দপ্তর</span>
              <span className="text-sm font-bold text-indigo-900">{rule.authority}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{rule.description}</p>
        </div>

        {/* SECTION B: Required Documents Checklist with Readiness Tracker */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" />
                <span>খ. প্রয়োজনীয় ডকুমেন্ট চেকলিস্ট</span>
              </h3>
              <span className="text-xs text-slate-500">
                আপনার কাছে থাকা কাগজপত্র টিক চিহ্ন দিন এবং প্রস্তুতির অগ্রগতি দেখুন
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
              <span className="text-xs text-slate-600 font-medium">প্রস্তুতি:</span>
              <span className="text-xs font-bold font-mono text-indigo-700">
                {toBn(readinessPercent)}% ({toBn(checkedDocsCount)}/{toBn(totalDocsCount)})
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          <div className="space-y-4">
            {/* Mandatory Docs */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>১. বাধ্যতামূলক ডকুমেন্ট (Mandatory)</span>
              </div>
              <div className="space-y-2">
                {rule.mandatoryDocs.map((doc) => {
                  const isChecked = !!checkedDocIds[doc.id];
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-rose-50/60 border-rose-300 text-slate-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-rose-600 shrink-0 cursor-pointer"
                        aria-label="Toggle document"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-rose-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isChecked ? 'text-rose-950 line-through opacity-80' : 'text-slate-900'
                            }`}
                          >
                            {doc.title}
                          </span>
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                            অবশ্যই লাগবে
                          </span>
                        </div>
                        {doc.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supporting Docs */}
            {rule.supportingDocs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>২. সহায়ক ডকুমেন্ট (Supporting)</span>
                </div>
                <div className="space-y-2">
                  {rule.supportingDocs.map((doc) => {
                    const isChecked = !!checkedDocIds[doc.id];
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-indigo-50/60 border-indigo-300 text-slate-900'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-indigo-600 shrink-0 cursor-pointer"
                          aria-label="Toggle document"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-xs sm:text-sm font-medium ${
                              isChecked
                                ? 'text-indigo-950 line-through opacity-80'
                                : 'text-slate-900'
                            }`}
                          >
                            {doc.title}
                          </span>
                          {doc.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conditional Docs */}
            {rule.conditionalDocs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>৩. পরিস্থিতিভেদে প্রযোজ্য (Conditional)</span>
                </div>
                <div className="space-y-2">
                  {rule.conditionalDocs.map((doc) => {
                    const isChecked = !!checkedDocIds[doc.id];
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-amber-50/60 border-amber-300 text-slate-900'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-amber-600 shrink-0 cursor-pointer"
                          aria-label="Toggle document"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium text-slate-900">
                              {doc.title}
                            </span>
                            {doc.conditionNote && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                                {doc.conditionNote}
                              </span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION C: Official Fee Structure & Calculator */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl p-5 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>গ. সরকারি সংশোধন ফি ও ভ্যাট হিসাব</span>
              </h3>
              <span className="text-xs text-slate-500">
                ১৫% ভ্যাটসহ নির্বাচন কমিশনের সর্বশেষ নির্ধারিত সরকারি ট্রেজারি ফি
              </span>
            </div>

            {/* Delivery mode toggle */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setIsUrgent(false)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  !isUrgent ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সাধারণ
              </button>
              <button
                type="button"
                onClick={() => setIsUrgent(true)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  isUrgent ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                জরুরি ডেলিভারি
              </button>
            </div>
          </div>

          {/* Tier Buttons: 1st time, 2nd time, 3rd time */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {rule.feeStructure.tiers.map((tier, idx) => (
              <button
                key={tier.times}
                type="button"
                onClick={() => setSelectedTierIndex(idx)}
                className={`p-2.5 rounded-xl text-center border transition cursor-pointer ${
                  selectedTierIndex === idx
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="block text-xs font-bold">{tier.times}</span>
                <span className="block text-[11px] opacity-80 mt-0.5">
                  ৳ {toBn(isUrgent && tier.urgentTotalFee ? tier.urgentTotalFee : tier.totalFee)}
                </span>
              </button>
            ))}
          </div>

          {/* Fee Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="p-3 flex justify-between items-center text-slate-600">
              <span>মূল সংশোধন আবেদন ফি:</span>
              <span className="font-mono font-medium text-slate-900">৳ {toBn(finalBase)}.০০</span>
            </div>
            <div className="p-3 flex justify-between items-center text-slate-600">
              <span>সরকারি ১৫% ভ্যাট (VAT):</span>
              <span className="font-mono font-medium text-slate-900">৳ {toBn(finalVat)}.০০</span>
            </div>
            <div className="p-3.5 flex justify-between items-center bg-indigo-50/70 text-indigo-950 font-bold text-sm sm:text-base">
              <span>সর্বমোট সরকারি ফি (Total):</span>
              <span className="font-mono text-rose-600">৳ {toBn(finalTotal)}.০০ টাকা</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">ফি প্রদানের অনুমোদিত মাধ্যম:</span>
            {rule.feeStructure.paymentMethods.map((pm) => (
              <span key={pm} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                {pm}
              </span>
            ))}
          </div>
        </div>

        {/* SECTION D: Step-by-Step Application Guide */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-3.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ঘ. ধাপে ধাপে অনলাইন আবেদন নির্দেশিকা (services.nidw.gov.bd)</span>
          </h3>

          <div className="space-y-3">
            {rule.stepByStepGuide.map((step) => (
              <div
                key={step.stepNumber}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {toBn(step.stepNumber)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{step.title}</h4>
                    {step.portalAction && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {step.portalAction}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {step.instruction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION E: Statutory Warnings & Caution */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border border-rose-200">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs sm:text-sm mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>ঙ. গুরুত্বপূর্ণ নোটিশ ও সরকারি সতর্কবার্তা</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-900 list-disc list-inside">
            {rule.statutoryWarnings.map((warn, i) => (
              <li key={i} className="leading-relaxed">
                {warn}
              </li>
            ))}
          </ul>
        </div>

        {/* SECTION F: Sources and Last Verified Date */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              উৎস: <span className="font-medium text-slate-700">{rule.sourceReference.citation}</span>
              {rule.sourceReference.circularNo && ` (${rule.sourceReference.circularNo})`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>সর্বশেষ তথ্য হালনাগাদ: {rule.sourceReference.lastVerifiedDate}</span>
            {rule.sourceReference.needsVerification && (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                তথ্য যাচাই প্রয়োজন
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
