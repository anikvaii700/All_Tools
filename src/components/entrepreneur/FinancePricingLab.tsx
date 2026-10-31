import React, { useState } from 'react';
import {
  DollarSign,
  Calculator,
  Save,
  HelpCircle,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  PieChart,
  ArrowRight,
} from 'lucide-react';
import { BusinessProject, FinanceData } from '../../types/entrepreneur';

interface FinancePricingLabProps {
  project: BusinessProject;
  onUpdateProject: (updater: (prev: BusinessProject) => BusinessProject) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const FinancePricingLab: React.FC<FinancePricingLabProps> = ({
  project,
  onUpdateProject,
  onShowToast,
}) => {
  const [financeData, setFinanceData] = useState<FinanceData>(project.financeData);

  // Unit Cost fields
  const [productName, setProductName] = useState(financeData.unitCostCalc.productOrServiceName);
  const [rawMaterials, setRawMaterials] = useState(financeData.unitCostCalc.rawMaterialsCost);
  const [packaging, setPackaging] = useState(financeData.unitCostCalc.packagingCost);
  const [laborHours, setLaborHours] = useState(financeData.unitCostCalc.laborHoursPerUnit);
  const [laborRate, setLaborRate] = useState(financeData.unitCostCalc.laborRatePerHour);
  const [delivery, setDelivery] = useState(financeData.unitCostCalc.deliveryCost);
  const [paymentFeePercent, setPaymentFeePercent] = useState(financeData.unitCostCalc.platformOrPaymentFeePercent);
  const [sellingPrice, setSellingPrice] = useState(financeData.unitCostCalc.sellingPriceBDT);

  // Monthly Overhead
  const [monthlyOverhead, setMonthlyOverhead] = useState(
    financeData.monthlyExpenses.reduce((sum, e) => sum + e.monthlyCostBDT, 0) || 2000
  );
  const [targetNetIncome, setTargetNetIncome] = useState(financeData.ownerSalaryGoalBDT || 25000);
  const [reinvestmentPercent, setReinvestmentPercent] = useState(financeData.reinvestmentRatePercent || 20);

  // --- Accurate Formulas ---
  // Direct variable cost
  const paymentFeeBDT = Math.round((sellingPrice * paymentFeePercent) / 100);
  const laborCostTotal = laborHours * laborRate;
  const totalUnitCost = rawMaterials + packaging + laborCostTotal + delivery + paymentFeeBDT;

  // Gross profit & margins
  const unitGrossProfit = sellingPrice - totalUnitCost;
  const grossMarginPercent = sellingPrice > 0 ? Math.round((unitGrossProfit / sellingPrice) * 100) : 0;
  const markupPercent = totalUnitCost > 0 ? Math.round((unitGrossProfit / totalUnitCost) * 100) : 0;

  // Break-even
  const contributionMargin = unitGrossProfit;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(monthlyOverhead / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * sellingPrice;

  // Monthly Revenue Target to achieve Owner Salary + Reinvestment
  // Net Needed = Owner Salary + (Reinvestment % of Profit)
  // Target Net Profit before reinvestment = Owner Salary / (1 - Reinvestment%)
  const totalNetProfitNeeded =
    reinvestmentPercent < 100 ? Math.round(targetNetIncome / (1 - reinvestmentPercent / 100)) : targetNetIncome;

  const totalGrossProfitNeeded = totalNetProfitNeeded + monthlyOverhead;
  const unitsNeededToHitGoal = contributionMargin > 0 ? Math.ceil(totalGrossProfitNeeded / contributionMargin) : 0;
  const monthlyRevenueTarget = unitsNeededToHitGoal * sellingPrice;
  const weeklyUnitsNeeded = Math.ceil(unitsNeededToHitGoal / 4);

  const handleSaveFinance = () => {
    onUpdateProject((prev) => ({
      ...prev,
      financeData: {
        ...prev.financeData,
        unitCostCalc: {
          productOrServiceName: productName,
          rawMaterialsCost: rawMaterials,
          packagingCost: packaging,
          laborHoursPerUnit: laborHours,
          laborRatePerHour: laborRate,
          platformOrPaymentFeePercent: paymentFeePercent,
          deliveryCost: delivery,
          sellingPriceBDT: sellingPrice,
        },
        monthlyRevenueGoalBDT: monthlyRevenueTarget,
        ownerSalaryGoalBDT: targetNetIncome,
        reinvestmentRatePercent: reinvestmentPercent,
      },
      updatedAt: new Date().toISOString(),
    }));
    onShowToast('ফাইন্যান্স ও প্রাইসিং তথ্য সফলভাবে সংরক্ষিত হয়েছে! 🧮', '✅');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Calculator className="w-3.5 h-3.5" />
          <span>মডিউল ৮: বিজনেস ফাইন্যান্স ও প্রাইসিং ল্যাব</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          বিক্রি মানেই লাভ নয় — সঠিক আর্থিক হিসাব ও ব্রেক-ইভেন নির্ধারণ
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl">
          অনেকেই পণ্য বিক্রি করে ভাবেন প্রচুর লাভ হচ্ছে, কিন্তু ডেলিভারি ও প্যাকেজিং বাদ দিলে দেখা যায় লোকসান হচ্ছে। এখানে নিখুঁত সূত্রের সাহায্যে হিসাব করুন।
        </p>
      </div>

      {/* Main Grid: Calculator Inputs & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            ১. একক পণ্য বা সেবার খরচ (Unit Cost Calculation)
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পণ্য বা সেবার নাম:</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="যেমন: ১টি পোশাক / ১ মাসের সোশ্যাল মিডিয়া সার্ভিস"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">কাঁচামাল খরচ (৳):</label>
              <input
                type="number"
                value={rawMaterials}
                onChange={(e) => setRawMaterials(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">প্যাকেজিং খরচ (৳):</label>
              <input
                type="number"
                value={packaging}
                onChange={(e) => setPackaging(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">ডেলিভারি খরচ (৳):</label>
              <input
                type="number"
                value={delivery}
                onChange={(e) => setDelivery(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <label className="block text-slate-600 mb-1">শ্রমের সময় (ঘণ্টা):</label>
              <input
                type="number"
                value={laborHours}
                onChange={(e) => setLaborHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">প্রতি ঘণ্টা রেট (৳):</label>
              <input
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">পেমেন্ট গেটওয়ে ফি (%):</label>
              <input
                type="number"
                step="0.1"
                value={paymentFeePercent}
                onChange={(e) => setPaymentFeePercent(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              প্রস্তাবিত বিক্রয়মূল্য (Selling Price ৳):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-lg font-black text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 pt-3">
            ২. মাসিক ফিক্সড খরচ ও ব্যক্তিগত আয়ের লক্ষ্য
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1">মাসিক ফিক্সড খরচ (৳):</label>
              <input
                type="number"
                value={monthlyOverhead}
                onChange={(e) => setMonthlyOverhead(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">মালিকের বেতন/মুনাফা (৳):</label>
              <input
                type="number"
                value={targetNetIncome}
                onChange={(e) => setTargetNetIncome(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">ব্যবসায় রিইনভেস্ট (%):</label>
              <input
                type="number"
                value={reinvestmentPercent}
                onChange={(e) => setReinvestmentPercent(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Unit Profitability */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-700 block">একক ইউনিট মুনাফা ও মার্জিন:</span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">বিক্রয়মূল্য:</span>
                <span className="font-bold text-slate-900">৳{sellingPrice.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">মোট খরচ (উৎপাদন + শ্রম + ফি):</span>
                <span className="font-bold text-rose-600">৳{totalUnitCost.toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-bold bg-emerald-50 px-2 rounded-xl text-emerald-800">
                <span>গ্রস লাভ (Gross Profit):</span>
                <span>৳{unitGrossProfit.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">প্রফিট মার্জিন:</span>
                <span className={`text-base font-black ${grossMarginPercent >= 30 ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {grossMarginPercent}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">মার্কআপ (Markup):</span>
                <span className="text-base font-black text-indigo-700">{markupPercent}%</span>
              </div>
            </div>
          </div>

          {/* Card: Break-Even & Sales Target */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg space-y-4">
            <div>
              <span className="text-[11px] text-emerald-300 font-bold block">ব্রেক-ইভেন অ্যানালাইসিস</span>
              <h4 className="text-lg font-black text-white">লোকসান এড়াতে কত বিক্রি লাগবে?</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-slate-300 block text-[10px]">ব্রেক-ইভেন বিক্রি:</span>
                <span className="text-lg font-black text-emerald-400">{breakEvenUnits}টি ইউনিট</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">মাসিক পরিচালন তুলতে</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                <span className="text-slate-300 block text-[10px]">ব্রেক-ইভেন রাজস্ব:</span>
                <span className="text-lg font-black text-amber-400">৳{breakEvenRevenue.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">আয়ের লক্ষ্য পূরণে মাসিক বিক্রি দরকার:</span>
                <span className="font-black text-emerald-300">{unitsNeededToHitGoal}টি ক্লায়েন্ট/পণ্য</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">সাপ্তাহিক টার্গেট:</span>
                <span className="font-bold text-amber-300">সপ্তাহে মাত্র {weeklyUnitsNeeded}টি</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-300">মোট মাসিক রাজস্ব টার্গেট:</span>
                <span className="font-black text-white">৳{monthlyRevenueTarget.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveFinance}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>ফাইন্যান্স ডাটা সেভ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
