import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Save,
  RotateCw,
  Sparkles,
  Download,
  CheckCircle,
  AlertTriangle,
  Building,
  Target,
  DollarSign,
  Calendar,
  Layers,
} from 'lucide-react';
import { BusinessProject, BusinessPlanDocument } from '../../types/entrepreneur';
import { EntrepreneurAiService } from '../../services/entrepreneurAiService';

interface BusinessPlanViewProps {
  project: BusinessProject;
  onUpdateProject: (updater: (prev: BusinessProject) => BusinessProject) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const BusinessPlanView: React.FC<BusinessPlanViewProps> = ({
  project,
  onUpdateProject,
  onShowToast,
}) => {
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanDocument>(project.businessPlan);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await EntrepreneurAiService.generateBusinessPlan({
        businessName: project.name,
        ideaDescription: project.primaryDescription,
        targetLocation: project.validationPlan.targetAudience || 'ঢাকা ও বাংলাদেশ',
        monthlyIncomeGoal: project.financeData.monthlyRevenueGoalBDT || 30000,
      });

      if (res.success && res.data) {
        const merged: BusinessPlanDocument = {
          ...businessPlan,
          businessName: project.name,
          tagline: project.tagline,
          executiveSummary: res.data.executiveSummary || businessPlan.executiveSummary,
          businessDescription: res.data.businessDescription || businessPlan.businessDescription,
          problemAndSolution: res.data.problemAndSolution || businessPlan.problemAndSolution,
          targetCustomerProfile: res.data.targetCustomerProfile || businessPlan.targetCustomerProfile,
          marketResearchAndOpportunity: res.data.marketResearchAndOpportunity || businessPlan.marketResearchAndOpportunity,
          competitorAnalysis: res.data.competitorAnalysis || businessPlan.competitorAnalysis,
          productsAndPricing: res.data.productsAndPricing || businessPlan.productsAndPricing,
          marketingAndAcquisitionPlan: res.data.marketingAndAcquisitionPlan || businessPlan.marketingAndAcquisitionPlan,
          salesAndConversionProcess: res.data.salesAndConversionProcess || businessPlan.salesAndConversionProcess,
          operationsAndDailyWorkflow: res.data.operationsAndDailyWorkflow || businessPlan.operationsAndDailyWorkflow,
          financialProjections: res.data.financialProjections || businessPlan.financialProjections,
          risksAndMitigation: res.data.risksAndMitigation || businessPlan.risksAndMitigation,
          thirtyDayMilestones: res.data.thirtyDayMilestones || businessPlan.thirtyDayMilestones,
          ninetyDayVision: res.data.ninetyDayVision || businessPlan.ninetyDayVision,
          lastUpdated: new Date().toISOString(),
        };

        setBusinessPlan(merged);
        onShowToast('সম্পূর্ণ বিজনেস প্ল্যান সফলভাবে জেনারেট হয়েছে! 📜', '✨');
      }
    } catch (e) {
      onShowToast('প্ল্যান জেনারেট করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।', '⚠️');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onUpdateProject((prev) => ({
      ...prev,
      businessPlan: {
        ...businessPlan,
        lastUpdated: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    }));
    onShowToast('বিজনেস প্ল্যান সফলভাবে সেভ হয়েছে! 💾', '✅');
  };

  const copyFullMarkdown = () => {
    const md = `# ${businessPlan.businessName} — পূর্ণাঙ্গ ব্যবসায়িক পরিকল্পনা
ট্যাগলাইন: ${businessPlan.tagline}
তারিখ: ${new Date().toLocaleDateString('bn-BD')}

## ১. নির্বাহী সারসংক্ষেপ (Executive Summary)
${businessPlan.executiveSummary}

## ২. ব্যবসার বিবরণ (Business Description)
${businessPlan.businessDescription}

## ৩. সমস্যা ও সমাধান (Problem & Solution)
${businessPlan.problemAndSolution}

## ৪. লক্ষ্যভুক্ত গ্রাহক (Target Customer)
${businessPlan.targetCustomerProfile}

## ৫. বাজার সম্ভাবনা (Market Research)
${businessPlan.marketResearchAndOpportunity}

## ৬. প্রতিযোগী পর্যালোচনা (Competitor Analysis)
${businessPlan.competitorAnalysis}

## ৭. পণ্য ও সেবা মূল্যতালিকা (Products & Pricing)
${businessPlan.productsAndPricing}

## ৮. মার্কেটিং ও সেলস পরিকল্পনা (Marketing & Sales)
${businessPlan.marketingAndAcquisitionPlan}

## ৯. দৈনিক কার্যক্রম ও পরিচালনা (Operations)
${businessPlan.operationsAndDailyWorkflow}

## ১০. আর্থিক প্রক্ষেপণ (Financial Projections)
- প্রাথমিক পুঁজি: ৳${businessPlan.financialProjections.startingCapitalNeeded}
- মাসিক পরিচালন ব্যয়: ৳${businessPlan.financialProjections.monthlyOverhead}
- ১ম মাসের বিক্রয় লক্ষ্য: ৳${businessPlan.financialProjections.month1RevenueTarget}
- ৩য় মাসের বিক্রয় লক্ষ্য: ৳${businessPlan.financialProjections.month3RevenueTarget}

## ১১. ঝুঁকি ও মোকাবিলা (Risks & Mitigation)
${businessPlan.risksAndMitigation}

## ১২. ৩০ দিনের মাইলস্টোন ও ৯০ দিনের স্বপ্ন
${businessPlan.thirtyDayMilestones.join('\n')}
${businessPlan.ninetyDayVision}
`;
    navigator.clipboard.writeText(md);
    onShowToast('সম্পূর্ণ প্ল্যান কপি করা হয়েছে! 📋', '📋');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>মডিউল ৬: বিজনেস প্ল্যান জেনারেটর</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {businessPlan.businessName || project.name} — ব্যবসায়িক পরিকল্পনা
          </h2>
          <p className="text-xs text-slate-500">
            ব্যাংক লোন, পার্টনারশিপ বা আত্মবিশ্বাসের সাথে লক্ষ্য অর্জনের জন্য ১২টি সুনির্দিষ্ট অধ্যায়।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGeneratePlan}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isGenerating ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isGenerating ? 'জেনারেট হচ্ছে...' : 'AI দিয়ে প্ল্যান তৈরি'}</span>
          </button>

          <button
            type="button"
            onClick={copyFullMarkdown}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>কপি</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 প্রিন্ট / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>সেভ</span>
          </button>
        </div>
      </div>

      {/* Printable Document Sheet Container */}
      <div id="printable-business-plan" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
            THE MOSAFA ENTREPRENEUR WORKSPACE — OFFICIAL BUSINESS PLAN
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {businessPlan.businessName}
          </h1>
          <p className="text-sm font-medium text-slate-600 italic">{businessPlan.tagline}</p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-1">
            <span>প্রস্তুতকারী: {project.name}</span>
            <span>•</span>
            <span>তারিখ: {new Date(businessPlan.lastUpdated).toLocaleDateString('bn-BD')}</span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">1</span>
            <span>১. নির্বাহী সারসংক্ষেপ (Executive Summary)</span>
          </h3>
          <textarea
            rows={3}
            value={businessPlan.executiveSummary}
            onChange={(e) => setBusinessPlan({ ...businessPlan, executiveSummary: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Section 2: Problem & Solution */}
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">2</span>
            <span>২. বিদ্যমান সমস্যা ও আমাদের সমাধান (Problem & Solution)</span>
          </h3>
          <textarea
            rows={3}
            value={businessPlan.problemAndSolution}
            onChange={(e) => setBusinessPlan({ ...businessPlan, problemAndSolution: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Section 3: Target Customer & Market */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              <span>৩. লক্ষ্যভুক্ত গ্রাহক (Target Customer)</span>
            </h3>
            <textarea
              rows={3}
              value={businessPlan.targetCustomerProfile}
              onChange={(e) => setBusinessPlan({ ...businessPlan, targetCustomerProfile: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">4</span>
              <span>৪. বাজার গবেষণা (Market Opportunity)</span>
            </h3>
            <textarea
              rows={3}
              value={businessPlan.marketResearchAndOpportunity}
              onChange={(e) => setBusinessPlan({ ...businessPlan, marketResearchAndOpportunity: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Section 5: Products, Pricing & Competitor */}
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">5</span>
            <span>৫. সেবা প্যাকেজ ও মূল্যতালিকা (Products & Pricing)</span>
          </h3>
          <textarea
            rows={3}
            value={businessPlan.productsAndPricing}
            onChange={(e) => setBusinessPlan({ ...businessPlan, productsAndPricing: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Section 6: Marketing, Acquisition & Operations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">6</span>
              <span>৬. কাস্টমার প্রাপ্তি কৌশল (Marketing & Sales)</span>
            </h3>
            <textarea
              rows={3}
              value={businessPlan.marketingAndAcquisitionPlan}
              onChange={(e) => setBusinessPlan({ ...businessPlan, marketingAndAcquisitionPlan: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">7</span>
              <span>৭. পরিচালনা ও দৈনিক রুটিন (Operations)</span>
            </h3>
            <textarea
              rows={3}
              value={businessPlan.operationsAndDailyWorkflow}
              onChange={(e) => setBusinessPlan({ ...businessPlan, operationsAndDailyWorkflow: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Section 8: Financial Projections Table */}
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">8</span>
            <span>৮. আর্থিক প্রক্ষেপণ ও প্রজেকশন (Financial Plan)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">প্রাথমিক মূলধন প্রয়োজন:</span>
              <span className="text-base font-black text-slate-900">
                ৳{businessPlan.financialProjections.startingCapitalNeeded.toLocaleString('bn-BD')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">মাসিক ওভারহেড খরচ:</span>
              <span className="text-base font-black text-rose-700">
                ৳{businessPlan.financialProjections.monthlyOverhead.toLocaleString('bn-BD')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">১ম মাসের বিক্রয় লক্ষ্য:</span>
              <span className="text-base font-black text-indigo-700">
                ৳{businessPlan.financialProjections.month1RevenueTarget.toLocaleString('bn-BD')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">৩য় মাসের বিক্রয় লক্ষ্য:</span>
              <span className="text-base font-black text-emerald-700">
                ৳{businessPlan.financialProjections.month3RevenueTarget.toLocaleString('bn-BD')}
              </span>
            </div>
          </div>
        </div>

        {/* Section 9: 30-Day Milestones */}
        <div className="space-y-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">9</span>
            <span>৯. ৩০ দিনের অ্যাকশন মাইলস্টোন ও ৯০ দিনের স্বপ্ন</span>
          </h3>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-700">
            <ul className="space-y-1 list-disc pl-4">
              {businessPlan.thirtyDayMilestones.map((m, i) => (
                <li key={i} className="font-medium">
                  {m}
                </li>
              ))}
            </ul>
            <p className="pt-2 border-t border-slate-200 text-indigo-900 font-bold">
              ৯০ দিনের লক্ষ্য: {businessPlan.ninetyDayVision}
            </p>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
          <p>
            * এই ব্যবসায়িক পরিকল্পনাটি The MoSaFa Tools-এর Entrepreneur Journey দ্বারা প্রস্তুতকৃত। এতে প্রদর্শিত আর্থিক সংখ্যা ও ভবিষ্যৎ প্রক্ষেপণসমূহ প্রাক্কলিত অনুমান।
          </p>
          <p>© {new Date().getFullYear()} {businessPlan.businessName}. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </div>
  );
};
