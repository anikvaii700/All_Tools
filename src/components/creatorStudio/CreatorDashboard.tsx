import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Video,
  FileText,
  Calendar,
  Image as ImageIcon,
  Film,
  Search,
  Share2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FolderOpen,
  Youtube,
  Globe,
  Check,
  ChevronRight,
  Compass,
  Zap,
} from 'lucide-react';
import { CreatorProject, CalendarTask } from '../../types/creatorStudio';

interface CreatorDashboardProps {
  projects: CreatorProject[];
  activeProject: CreatorProject | null;
  tasks: CalendarTask[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onNavigateTab: (tabId: string) => void;
  onToggleTask: (taskId: string) => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  projects,
  activeProject,
  tasks,
  onSelectProject,
  onCreateProject,
  onNavigateTab,
  onToggleTask,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'youtube' | 'blog' | 'facebook'>('all');

  const filteredProjects = projects.filter((p) => {
    if (platformFilter === 'all') return true;
    if (platformFilter === 'youtube') return p.platform === 'youtube' || p.platform === 'multi';
    if (platformFilter === 'blog') return p.platform === 'blog' || p.platform === 'multi';
    if (platformFilter === 'facebook') return p.platform === 'facebook' || p.platform === 'multi';
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter((t) => t.date === todayStr);

  const quickStudios = [
    {
      id: 'niche',
      title: 'নিশ ফাইন্ডার',
      desc: 'লাভজনক ক্যাটাগরি ও ৩০ দিনের প্ল্যান খুঁজুন',
      icon: <Compass className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    },
    {
      id: 'topic',
      title: 'টপিক ও কিওয়ার্ড ল্যাব',
      desc: 'ইউটিউব ও ব্লগের ভাইরাল টপিক জেনারেটর',
      icon: <Search className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    },
    {
      id: 'script',
      title: 'স্ক্রিপ্ট ও আর্টিকেল স্টুডিও',
      desc: 'ব্লগ ও ইউটিউব ভিডিওর সম্পূর্ণ স্ক্রিপ্ট',
      icon: <FileText className="w-5 h-5 text-rose-600" />,
      color: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    },
    {
      id: 'video_ai',
      title: 'এআই ভিডিও প্রোডাকশন',
      desc: 'স্টোরিবোর্ড, দৃশ্য বিভাজন ও শট ডিরেকশন',
      icon: <Video className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    },
    {
      id: 'video_editor',
      title: 'ব্রাউজার ভিডিও এডিটর',
      desc: 'ট্রিম, স্প্লিট, টেক্সট, অডিও ও রেন্ডার',
      icon: <Film className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    },
    {
      id: 'thumbnail',
      title: 'থাম্বনেইল স্টুডিও',
      desc: 'হাই-সিটিআর বাংলা থাম্বনেইল ক্যানভাস',
      icon: <ImageIcon className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    },
    {
      id: 'repurpose',
      title: 'কন্টেন্ট রি-পারপাসার',
      desc: '১টি কনটেন্ট থেকে ৯টি ফরম্যাটে রূপান্তর',
      icon: <Share2 className="w-5 h-5 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
    },
    {
      id: 'seo',
      title: 'এসইও ও গ্রোথ স্টুডিও',
      desc: 'টাইটেল অডিট, মেটা ট্যাগ ও অ্যাডসেন্স চেকলিস্ট',
      icon: <TrendingUp className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>আইডিয়া থেকে প্রকাশনা — সম্পূর্ণ ক্রিয়েটর ওয়ার্কস্পেস</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              স্বাগতম MoSaFa Content Creator Studio-তে! 🎬
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              ব্লগার, ইউটিউবার ও ফেসবুক ক্রিয়েটরদের জন্য অল-ইন-ওয়ান সহকারী। নিশ রিসার্চ থেকে ভিডিও স্ক্রিপ্ট, ব্রাউজার ভিডিও এডিটর, থাম্বনেইল ও এসইও—সবকিছু এক প্ল্যাটফর্মে।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateProject}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রজেক্ট তৈরি করুন</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('calendar')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-indigo-300" />
              <span>ক্যালেন্ডার ও শিডিউল</span>
            </button>
          </div>
        </div>

        {/* Active Project Highlight */}
        {activeProject && (
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">বর্তমান প্রজেক্ট:</span>
              <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-xl border border-white/20 flex items-center gap-1.5">
                {activeProject.platform === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-400" />}
                {activeProject.platform === 'blog' && <Globe className="w-3.5 h-3.5 text-emerald-400" />}
                {activeProject.platform === 'facebook' && <Video className="w-3.5 h-3.5 text-blue-400" />}
                {activeProject.platform === 'multi' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                <span>{activeProject.name}</span>
              </span>
              <span className="text-indigo-200 hidden sm:inline">({activeProject.niche})</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {activeProject.status === 'in_progress' ? 'চলমান প্রজেক্ট' : activeProject.status}
            </span>
          </div>
        )}
      </div>

      {/* Quick Action Studios Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>ক্রিয়েটর স্টুডিও মডিউলসমূহ</span>
          </h2>
          <span className="text-xs text-slate-500">৮টি ডেডিকেটেড ওয়ার্কস্পেস</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStudios.map((studio) => (
            <div
              key={studio.id}
              onClick={() => onNavigateTab(studio.id)}
              className={`p-4 rounded-3xl border ${studio.color} transition cursor-pointer hover:shadow-md active:scale-98 flex flex-col justify-between group`}
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center group-hover:scale-105 transition">
                  {studio.icon}
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition">
                  {studio.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{studio.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-indigo-600">
                <span>প্রবেশ করুন</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Today's Tasks & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Projects Manager */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-indigo-600" />
                  <span>আমার প্রজেক্ট ও চ্যানেলসমূহ</span>
                </h3>
                <p className="text-xs text-slate-500">আপনার বিভিন্ন ব্লগ, ইউটিউব ও ফেসবুক পেজ</p>
              </div>

              {/* Platform Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPlatformFilter('all')}
                  className={`px-2.5 py-1 rounded-xl transition ${
                    platformFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সবগুলো
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformFilter('youtube')}
                  className={`px-2.5 py-1 rounded-xl transition ${
                    platformFilter === 'youtube' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ইউটিউব
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformFilter('blog')}
                  className={`px-2.5 py-1 rounded-xl transition ${
                    platformFilter === 'blog' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ব্লগ
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformFilter('facebook')}
                  className={`px-2.5 py-1 rounded-xl transition ${
                    platformFilter === 'facebook' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ফেসবুক
                </button>
              </div>
            </div>

            {/* Projects Cards List */}
            <div className="space-y-3">
              {filteredProjects.map((p) => {
                const isActive = activeProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'border-indigo-400 bg-indigo-50/40 ring-1 ring-indigo-400 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{p.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                          {p.platform}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.description || p.niche}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(p.id);
                          onNavigateTab('script');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 text-xs font-bold text-slate-700 transition"
                      >
                        কনটেন্ট তৈরি করুন
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  কোনো প্রজেক্ট পাওয়া যায়নি। &quot;নতুন প্রজেক্ট তৈরি করুন&quot; বাটনে ক্লিক করে প্রথম প্রজেক্ট শুরু করুন।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Tasks & Progress */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>আজকের করণীয় টাস্ক</span>
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {todaysTasks.length}টি
              </span>
            </div>

            <div className="space-y-2.5">
              {todaysTasks.map((t) => {
                const isDone = t.status === 'published';
                return (
                  <div
                    key={t.id}
                    onClick={() => onToggleTask(t.id)}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex items-start gap-2.5 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition ${
                        isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold leading-snug ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-800 group-hover:text-indigo-600'
                        }`}
                      >
                        {t.title}
                      </p>
                      <span className="text-[10px] text-slate-400 block">{t.platform}</span>
                    </div>
                  </div>
                );
              })}

              {todaysTasks.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  আজকের জন্য কোনো নির্ধারিত টাস্ক নেই।
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('calendar')}
              className="w-full py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>সম্পূর্ণ ক্যালেন্ডার ও শিডিউলার দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
