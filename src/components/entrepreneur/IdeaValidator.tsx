import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Save,
  RotateCw,
  Search,
  MessageSquare,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  FlaskConical,
} from 'lucide-react';
import { BusinessProject, ValidationPlan, CustomerInterviewQuestion } from '../../types/entrepreneur';
import { EntrepreneurAiService } from '../../services/entrepreneurAiService';

interface IdeaValidatorProps {
  project: BusinessProject;
  onUpdateProject: (updater: (prev: BusinessProject) => BusinessProject) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const IdeaValidator: React.FC<IdeaValidatorProps> = ({
  project,
  onUpdateProject,
  onShowToast,
}) => {
  const [ideaText, setIdeaText] = useState(project.validationPlan.ideaDescription || project.primaryDescription || '');
  const [targetLocation, setTargetLocation] = useState('ঢাকা ও পার্শ্ববর্তী এলাকা');
  const [isValidating, setIsValidating] = useState(false);
  const [validationPlan, setValidationPlan] = useState<ValidationPlan>(project.validationPlan);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!ideaText.trim()) {
      onShowToast('অনুগ্রহ করে আপনার ব্যবসার আইডিয়াটি সংক্ষেপে লিখুন!', '⚠️');
      return;
    }

    setIsValidating(true);
    setAiNote(null);

    try {
      const res = await EntrepreneurAiService.validateIdea({
        ideaDescription: ideaText,
        targetLocation,
        budget: project.capitalAllocatedBDT === 0 ? 'zero' : 'low',
        skills: ['বেসিক স্মার্টফোন ও বাংলা যোগাযোগ'],
      });

      if (res.success && res.data) {
        const merged: ValidationPlan = {
          ...validationPlan,
          ideaDescription: ideaText,
          customerProblem: res.data.customerProblem || validationPlan.customerProblem,
          targetAudience: res.data.targetAudience || validationPlan.targetAudience,
          valueProposition: res.data.valueProposition || validationPlan.valueProposition,
          competitors: res.data.competitors || validationPlan.competitors,
          interviewQuestions: res.data.interviewQuestions || validationPlan.interviewQuestions,
          mvpPlan: res.data.mvpPlan || validationPlan.mvpPlan,
          experiments: res.data.experiments || validationPlan.experiments,
          identifiedRisks: res.data.identifiedRisks || validationPlan.identifiedRisks,
          nextActions: res.data.nextActions || validationPlan.nextActions,
          updatedAt: new Date().toISOString(),
        };

        setValidationPlan(merged);
        if (res.isAiAvailable) {
          setAiNote('✨ AI অ্যানালাইসিসের মাধ্যমে বাস্তবসম্মত ভ্যালিডেশন প্রস্তুত হয়েছে।');
        } else {
          setAiNote('💡 মোসাফা লোকাল বিজনেস ফ্রেমওয়ার্ক অনুযায়ী ভ্যালিডেশন প্রস্তুত হয়েছে।');
        }
        onShowToast('বিজনেস আইডিয়া সফলভাবে যাচাই ও বিশ্লেষণ করা হয়েছে! 🎯', '✅');
      }
    } catch (e: any) {
      onShowToast('ভ্যালিডেশনে সাময়িক ত্রুটি হয়েছে, পুনরায় চেষ্টা করুন।', '⚠️');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveToProject = () => {
    onUpdateProject((prev) => ({
      ...prev,
      primaryDescription: ideaText,
      validationPlan,
      stage: 'validation',
      updatedAt: new Date().toISOString(),
    }));
    onShowToast('ভ্যালিডেশন প্ল্যান বর্তমান প্রজেক্টে সেভ হয়েছে! 💾', '🌟');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} কপি করা হয়েছে! 📋`, '📋');
  };

  return (
    <div className="space-y-6">
      {/* Input Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>মডিউল ৩: বিজনেস আইডিয়া ভ্যালিডেটর</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            টাকা খরচ করার আগে নিশ্চিত হোন মানুষ আপনার পণ্য কিনবে কি না
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            অধিকাংশ ব্যবসা বন্ধ হয়ে যায় কারণ তারা এমন জিনিস বানায় যার বাস্তবে কোনো কাস্টমার নেই। এই টুলের সাহায্যে কাস্টমার সমস্যা, প্রতিযোগী ও ৫টি প্রশ্ন দিয়ে আইডিয়া যাচাই করুন।
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আপনার ব্যবসার আইডিয়াটি সহজ বাংলায় সংক্ষেপে লিখুন:
            </label>
            <textarea
              rows={3}
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="যেমন: এলাকার ছোট কাপড়ের দোকান ও বুটিক হাউসের জন্য প্রতিদিন ১টি করে ফেসবুক পোস্টার ও রিলস বানিয়ে দেব যাতে তাদের বিক্রি বাড়ে..."
              className="w-full p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-800 bg-slate-50 leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-bold text-slate-700 mb-1">টার্গেট এলাকা / কাস্টমার লোকেশন:</label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                placeholder="যেমন: ঢাকা শহর / চট্টগ্রাম / জেলা শহর"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-4">
              <button
                type="button"
                disabled={isValidating}
                onClick={handleValidate}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>যাচাই ও বিশ্লেষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>আইডিয়া ভ্যালিডেট করুন 🚀</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {aiNote && (
            <div className="p-2.5 bg-indigo-50/80 rounded-xl border border-indigo-200 text-[11px] text-indigo-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{aiNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Validation Results Grid */}
      <div className="space-y-5">
        {/* Row 1: Problem vs Value Prop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>কাস্টমারের মূল সমস্যা (The Real Problem)</span>
            </div>
            <textarea
              rows={3}
              value={validationPlan.customerProblem}
              onChange={(e) => setValidationPlan({ ...validationPlan, customerProblem: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <span className="text-[10px] text-slate-400 block">
              টিপস: মানুষ পণ্য কেনে না, তারা নিজের কষ্ট দূর করতে বা স্বস্তি পেতে টাকা দেয়।
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>আপনার সমাধান ও ভ্যালু প্রপোজিশন (Value Proposition)</span>
            </div>
            <textarea
              rows={3}
              value={validationPlan.valueProposition}
              onChange={(e) => setValidationPlan({ ...validationPlan, valueProposition: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 block">
              টিপস: আপনি কীভাবে অন্যের চেয়ে দ্রুত, সাশ্রয়ী ও আন্তরিকভাবে সেবা দিচ্ছেন।
            </span>
          </div>
        </div>

        {/* Competitor Analysis Matrix */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>প্রতিযোগী গবেষণা ও আমাদের সুবিধা (Competitor Analysis)</span>
            </h3>
            <span className="text-xs text-slate-500">বাংলাদেশে বিদ্যমান বিকল্পসমূহ</span>
          </div>

          <div className="space-y-3">
            {validationPlan.competitors.map((comp, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>প্রতিযোগী {idx + 1}: {comp.name}</span>
                  <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    মূল্য আনুমানিক: {comp.pricingEstimate}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="font-bold text-slate-700 block">তাদের শক্তি:</span>
                    <span>{comp.strengths}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">তাদের দুর্বলতা:</span>
                    <span className="text-rose-600">{comp.weaknesses}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">আমাদের প্রধান সুবিধা:</span>
                    <span className="text-emerald-700 font-bold">{comp.ourAdvantage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Interview Questions (Crucial!) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>কাস্টমার ইন্টারভিউ প্রশ্নাবলী (কথা বলার ৫টি প্রশ্ন)</span>
              </h3>
              <p className="text-xs text-slate-500">মানুষকে সরাসরি অফার না দিয়ে এই প্রশ্নগুলো করুন যাতে তাদের আসল চাহিদা বোঝা যায়।</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const allQs = validationPlan.interviewQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n');
                copyToClipboard(allQs, 'সবগুলো প্রশ্ন');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>প্রশ্নগুলো কপি করুন</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {validationPlan.interviewQuestions.map((q, idx) => (
              <div key={q.id || idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900">
                    প্রশ্ন {idx + 1}: "{q.question}"
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(q.question, 'প্রশ্ন')}
                    className="text-slate-400 hover:text-slate-700 transition"
                    title="প্রশ্ন কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>🎯 উদ্দেশ্য: {q.purpose}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MVP Plan & Experiments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <span className="font-bold text-slate-900 text-xs block">ন্যূনতম কার্যকর প্রোডাক্ট (MVP প্ল্যান):</span>
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
              <div>
                <span className="text-slate-500">স্কোপ: </span>
                <span className="font-bold text-slate-800">{validationPlan.mvpPlan.scope}</span>
              </div>
              <div>
                <span className="text-slate-500">ফরম্যাট: </span>
                <span className="font-bold text-indigo-700">{validationPlan.mvpPlan.format}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>বানাতে সময়: {validationPlan.mvpPlan.timeToBuildDays} দিন</span>
                <span>বাজেট: ৳{validationPlan.mvpPlan.budgetBDT}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <span className="font-bold text-slate-900 text-xs block">পরবর্তী ৩টি বাস্তব পদক্ষেপ:</span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {validationPlan.nextActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg">
          <div>
            <h4 className="text-xs sm:text-sm font-bold">ভ্যালিডেশন সম্পন্ন হয়েছে?</h4>
            <p className="text-[11px] text-slate-400">আপনার বর্তমান প্রজেক্টে এই তথ্যগুলো সেভ করে পরবর্তী ধাপে এগিয়ে যান।</p>
          </div>
          <button
            type="button"
            onClick={handleSaveToProject}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>প্রজেক্টে সেভ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
