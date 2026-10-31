import React from 'react';
import {
  Sparkles,
  Zap,
  Target,
  DollarSign,
  Users,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  FolderPlus,
  Compass,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { BusinessProject, EntrepreneurProfile } from '../../types/entrepreneur';

interface WorkspaceDashboardProps {
  project: BusinessProject;
  profile: EntrepreneurProfile;
  projectsList: BusinessProject[];
  onSelectProject: (id: string) => void;
  onCreateNewProject: () => void;
  onNavigateTab: (tabId: string) => void;
  onOpenProfile: () => void;
}

export const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({
  project,
  profile,
  projectsList,
  onSelectProject,
  onCreateNewProject,
  onNavigateTab,
  onOpenProfile,
}) => {
  // Financial metrics
  const totalOrdersAmount = project.orders.reduce((sum, o) => sum + (o.totalAmountBDT || 0), 0);
  const totalPaid = project.orders.reduce((sum, o) => sum + (o.advancePaidBDT || 0), 0);
  const totalPendingDue = project.orders.reduce((sum, o) => sum + (o.dueAmountBDT || 0), 0);
  const totalPipeline = project.leads.reduce((sum, l) => sum + (l.potentialValueBDT || 0), 0);

  // Task metrics
  const totalTasks = project.dailyTasks.length;
  const completedTasks = project.dailyTasks.filter((t) => t.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stageLabels: Record<BusinessProject['stage'], { title: string; color: string }> = {
    idea_stage: { title: 'আইডিয়া পর্যায় (Idea Stage)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    validation: { title: 'ভ্যালিডেশন চলছে (Validation)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    first_offer: { title: 'অফার প্রস্তুতি (Offer Ready)', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    first_customers: { title: 'প্রথম কাস্টমার সন্ধান (First Clients)', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    active_sales: { title: 'নিয়মিত বিক্রি ও সেবা (Active Sales)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    scaling: { title: 'ব্যবসা স্কেলিং ও গ্রোথ (Scaling)', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Project Switcher Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              ব্যবসায়িক ওয়ার্কস্পেস
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stageLabels[project.stage].color}`}>
              {stageLabels[project.stage].title}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{project.name}</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">{project.tagline || project.primaryDescription}</p>
        </div>

        {/* Project Selector & Profile Button */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {projectsList.length > 1 && (
            <select
              value={project.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={onCreateNewProject}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer active:scale-95"
            title="নতুন কোনো ব্যবসার প্রজেক্ট শুরু করুন"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span>নতুন প্রজেক্ট</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer active:scale-95"
            title="প্রোফাইল ও দক্ষতা সম্পাদনা"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>প্রোফাইল ({profile.name})</span>
          </button>
        </div>
      </div>

      {/* 4 Financial & Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Monthly Goal */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold text-slate-600">মাসিক আয়ের লক্ষ্য</span>
            <Target className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">
              ৳{(profile.monthlyIncomeGoal || 30000).toLocaleString('bn-BD')}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              টার্গেট পূরণ: {totalPaid > 0 ? Math.round((totalPaid / (profile.monthlyIncomeGoal || 30000)) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Metric 2: Revenue Collected */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold text-slate-600">সংগৃহীত পেমেন্ট</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-emerald-700">
              ৳{totalPaid.toLocaleString('bn-BD')}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              বাকি পাওনা: ৳{totalPendingDue.toLocaleString('bn-BD')}
            </p>
          </div>
        </div>

        {/* Metric 3: Leads Pipeline */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold text-slate-600">সম্ভাব্য পাইপলাইন</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">
              {project.leads.length.toLocaleString('bn-BD')} জন লিড
            </div>
            <p className="text-[10px] text-indigo-600 font-medium mt-1">
              সম্ভাব্য মূল্য: ৳{totalPipeline.toLocaleString('bn-BD')}
            </p>
          </div>
        </div>

        {/* Metric 4: Roadmap Execution */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold text-slate-600">কার্যক্রম অগ্রগতি</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg sm:text-2xl font-black text-slate-900">{progressPercent}%</span>
              <span className="text-xs text-slate-500 font-bold">
                {completedTasks}/{totalTasks} সম্পন্ন
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Guided Action Pathways (Grid of 6 Core Workstations) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-rose-500" />
            <span>উদ্যোক্তা যাত্রার মূল মডিউলসমূহ (Action Hub)</span>
          </h3>
          <span className="text-xs text-slate-500">ধাপ অনুযায়ী ক্লিক করে কাজ শুরু করুন</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Card 1: Zero Capital Finder */}
          <div
            onClick={() => onNavigateTab('finder')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition">
                  🌱
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  জিরো ক্যাপিটাল
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                বিনা পুঁজিতে ব্যবসার সুযোগ খুঁজুন
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                সোশ্যাল মিডিয়া ম্যানেজমেন্ট, কপিরাইটিং, ভার্চুয়াল অ্যাসিস্ট্যান্স ও প্রি-অর্ডারসহ ১৪টি পরীক্ষিত আইডিয়া।
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>আইডিয়াগুলো দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Idea Validator */}
          <div
            onClick={() => onNavigateTab('validator')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition">
                  🔬
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  আইডিয়া যাচাই
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition">
                বিজনেস আইডিয়া ভ্যালিডেটর
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                কাস্টমার সমস্যা, প্রতিযোগী বিশ্লেষণ, কাস্টমার ইন্টারভিউ প্রশ্ন ও ন্যূনতম কার্যকরী প্রোডাক্ট (MVP) প্ল্যান।
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>আইডিয়া যাচাই করুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: First 10 Customers Finder */}
          <div
            onClick={() => onNavigateTab('first-customers')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-rose-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition">
                  🎯
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  প্রথম ক্রেতা
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition">
                প্রথম ১০ জন কাস্টমার সন্ধান
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                কাস্টমার পারসোনা, হোয়াটসঅ্যাপ ও ফেসবুক আউটরিচ মেসেজ স্ক্রিপ্ট এবং আপত্তি মোকাবিলার গাইড।
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
              <span>আউটরিচ স্ক্রিপ্ট দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Offer & Package Builder */}
          <div
            onClick={() => onNavigateTab('offer-builder')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-purple-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition">
                  📦
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  প্যাকেজ ও অফার
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition">
                বিজনেস অফার ও প্রোডাক্ট বিল্ডার
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ব্র্যান্ড নাম, ৩-স্তরবিশিষ্ট সার্ভিস প্যাকেজ (বেসিক/স্ট্যান্ডার্ড/প্রিমিয়াম), ভ্যালু প্রপ ও গ্যারান্টি পলিসি।
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>অফার সাজান</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 5: Business Plan Generator */}
          <div
            onClick={() => onNavigateTab('business-plan')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-amber-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition">
                  📜
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  A4 প্রিন্ট রেডি
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">
                পূর্ণাঙ্গ বিজনেস প্ল্যান জেনারেটর
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ১২-অধ্যায়ের প্রাতিষ্ঠানিক বিজনেস প্ল্যান তৈরি, এডিট এবং সরাসরি A4 ফরম্যাটে প্রিন্ট বা ডাউনলোড।
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>বিজনেস প্ল্যান খুলুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 6: Finance & Pricing Lab */}
          <div
            onClick={() => onNavigateTab('finance')}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition">
                  🧮
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  নিখুঁত হিসাব
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                ফাইন্যান্স ও প্রাইসিং ল্যাব
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ইউনিট কস্ট, সেলিং প্রাইস, প্রফিট মার্জিন, ব্রেক-ইভেন পয়েন্ট ও ক্যাশফ্লো ক্যালকুলেটর।
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>ক্যালকুলেটর ব্যবহার করুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Quick Access Bar (CRM, BD Guide, 30-Day Challenge) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-300">দৈনিক মেন্টর ও অ্যাকশন শিট</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold">আজকের প্রধান ৩টি ব্যবসায়িক করণীয়</h4>
          <p className="text-xs text-slate-300">প্রতিদিন ছোট ছোট বাস্তব পদক্ষেপই আপনার ব্যবসাকে সফল করে তুলবে।</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => onNavigateTab('daily-mentor')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>আজকের করণীয় দেখুন</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('crm')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-300" />
            <span>কাস্টমার ও অর্ডার খাতা ({project.orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('bd-guide')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>বাংলাদেশ আইনি গাইড</span>
          </button>
        </div>
      </div>
    </div>
  );
};
