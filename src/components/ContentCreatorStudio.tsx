import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  LayoutDashboard,
  Compass,
  Search,
  FileText,
  Video,
  Film,
  Image as ImageIcon,
  FolderOpen,
  Share2,
  TrendingUp,
  Calendar,
  Layers,
  Plus,
  X,
  Youtube,
  Globe,
  Tag,
  Check,
} from 'lucide-react';
import { CreatorProject, CreatorPlatform, CreatorLanguage, CalendarTask } from '../types/creatorStudio';
import { CreatorStorage } from '../services/creatorStorage';

// Modules
import { CreatorDashboard } from './creatorStudio/CreatorDashboard';
import { NicheFinder } from './creatorStudio/NicheFinder';
import { TopicKeywordLab } from './creatorStudio/TopicKeywordLab';
import { ArticleScriptStudio } from './creatorStudio/ArticleScriptStudio';
import { ContentCalendar } from './creatorStudio/ContentCalendar';
import { ThumbnailStudio } from './creatorStudio/ThumbnailStudio';
import { MediaImport } from './creatorStudio/MediaImport';
import { VideoEditor } from './creatorStudio/VideoEditor';
import { AiVideoProduction } from './creatorStudio/AiVideoProduction';
import { SeoGrowthStudio } from './creatorStudio/SeoGrowthStudio';
import { ContentRepurposer } from './creatorStudio/ContentRepurposer';
import { ProjectWorkspace } from './creatorStudio/ProjectWorkspace';

interface ContentCreatorStudioProps {
  onBackToHub: () => void;
  onShowToast?: (msg: string, icon?: string) => void;
}

export const ContentCreatorStudio: React.FC<ContentCreatorStudioProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [projects, setProjects] = useState<CreatorProject[]>(() => CreatorStorage.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => CreatorStorage.getActiveProjectId());
  const [tasks, setTasks] = useState<CalendarTask[]>(() => CreatorStorage.getCalendarTasks());

  // Cross-module state sharing
  const [targetTopic, setTargetTopic] = useState<string>('');
  const [targetRepurposeText, setTargetRepurposeText] = useState<string>('');
  const [activeMediaClip, setActiveMediaClip] = useState<any>(null);

  // New Project Modal State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjPlatform, setNewProjPlatform] = useState<CreatorPlatform>('youtube');
  const [newProjLang, setNewProjLang] = useState<CreatorLanguage>('bn');
  const [newProjNiche, setNewProjNiche] = useState('');
  const [newProjAudience, setNewProjAudience] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  const refreshData = () => {
    setProjects(CreatorStorage.getProjects());
    setTasks(CreatorStorage.getCalendarTasks());
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    CreatorStorage.setActiveProjectId(id);
    if (onShowToast) {
      const p = projects.find((item) => item.id === id);
      onShowToast(`"${p?.name || 'প্রজেক্ট'}" সক্রিয় করা হয়েছে`, '📁');
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newProject: CreatorProject = {
      id: `proj-${Date.now()}`,
      name: newProjName,
      platform: newProjPlatform,
      language: newProjLang,
      niche: newProjNiche || 'জেনারেল ক্রিয়েটর',
      targetAudience: newProjAudience || 'সাধারণ অডিয়েন্স',
      description: newProjDesc,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextProjects = [newProject, ...projects];
    CreatorStorage.saveProjects(nextProjects);
    setProjects(nextProjects);
    handleSelectProject(newProject.id);

    setIsNewProjectModalOpen(false);
    setNewProjName('');
    setNewProjNiche('');
    setNewProjDesc('');

    if (onShowToast) {
      onShowToast(`"${newProject.name}" প্রজেক্ট সফলভাবে তৈরি হয়েছে! 🎉`, '✨');
    }
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const nextStatus = task.status === 'published' ? 'scheduled' : 'published';
      CreatorStorage.updateCalendarTask({ ...task, status: nextStatus });
      setTasks(CreatorStorage.getCalendarTasks());
      if (onShowToast) {
        onShowToast(nextStatus === 'published' ? 'টাস্ক সম্পন্ন হয়েছে!' : 'স্ট্যাটাস আপডেট হয়েছে', '✓');
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'niche', label: 'নিশ ফাইন্ডার', icon: <Compass className="w-4 h-4" /> },
    { id: 'topic', label: 'টপিক ও কিওয়ার্ড', icon: <Search className="w-4 h-4" /> },
    { id: 'script', label: 'স্ক্রিপ্ট ও আর্টিকেল', icon: <FileText className="w-4 h-4" /> },
    { id: 'video_ai', label: 'ভিডিও স্টোরিবোর্ড', icon: <Video className="w-4 h-4" /> },
    { id: 'video_editor', label: 'ভিডিও এডিটর', icon: <Film className="w-4 h-4" /> },
    { id: 'thumbnail', label: 'থাম্বনেইল স্টুডিও', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'media', label: 'মিডিয়া লাইব্রেরি', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'repurpose', label: 'কন্টেন্ট রূপান্তর', icon: <Share2 className="w-4 h-4" /> },
    { id: 'seo', label: 'এসইও ও গ্রোথ', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'calendar', label: 'ক্যালেন্ডার ও টাস্ক', icon: <Calendar className="w-4 h-4" /> },
    { id: 'workspace', label: 'প্রজেক্ট ও ব্যাকআপ', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">মূল হাব-এ ফিরে যান</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xs">
                <Video className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  MoSaFa Content Creator Studio
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 hidden xs:block">
                  আইডিয়া থেকে প্রকাশনা—কনটেন্ট তৈরির সম্পূর্ণ স্টুডিও
                </p>
              </div>
            </div>
          </div>

          {/* Active Project Switcher Pill */}
          <div className="flex items-center gap-2">
            {activeProject && (
              <div
                onClick={() => setIsNewProjectModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold cursor-pointer hover:bg-indigo-100 transition"
                title="প্রজেক্ট পরিবর্তন বা নতুন প্রজেক্ট তৈরি করুন"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="truncate max-w-[140px]">{activeProject.name}</span>
                <span className="text-[10px] bg-white px-1.5 py-0.2 rounded-md border border-indigo-200">
                  {activeProject.platform}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">নতুন প্রজেক্ট</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto py-2 flex items-center gap-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <CreatorDashboard
            projects={projects}
            activeProject={activeProject}
            tasks={tasks}
            onSelectProject={handleSelectProject}
            onCreateProject={() => setIsNewProjectModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onToggleTask={handleToggleTask}
          />
        )}

        {activeTab === 'niche' && (
          <NicheFinder
            onShowToast={onShowToast}
            onApplyNicheToProject={(nicheTitle) => {
              if (activeProject) {
                const updated = { ...activeProject, niche: nicheTitle };
                const nextList = projects.map((p) => (p.id === activeProject.id ? updated : p));
                CreatorStorage.saveProjects(nextList);
                setProjects(nextList);
              }
              setTargetTopic(nicheTitle);
              setActiveTab('topic');
              if (onShowToast) {
                onShowToast('নিশটি টপিক ল্যাবে পাঠানো হয়েছে!', '🎯');
              }
            }}
          />
        )}

        {activeTab === 'topic' && (
          <TopicKeywordLab
            activeNiche={targetTopic || activeProject?.niche}
            onShowToast={onShowToast}
            onSendToScriptStudio={(topic) => {
              setTargetTopic(topic);
              setActiveTab('script');
              if (onShowToast) {
                onShowToast('টপিকটি স্ক্রিপ্ট স্টুডিওতে পাঠানো হয়েছে!', '✍️');
              }
            }}
          />
        )}

        {activeTab === 'script' && (
          <ArticleScriptStudio
            initialTopic={targetTopic}
            initialType={activeProject?.platform === 'blog' ? 'blog_article' : 'youtube_long'}
            onShowToast={onShowToast}
            onSendToRepurposer={(text) => {
              setTargetRepurposeText(text);
              setActiveTab('repurpose');
            }}
            onSendToVideoProduction={(topic) => {
              setTargetTopic(topic);
              setActiveTab('video_ai');
            }}
          />
        )}

        {activeTab === 'video_ai' && (
          <AiVideoProduction
            initialTopic={targetTopic}
            onShowToast={onShowToast}
            onSendToVideoEditor={(plan) => {
              setActiveTab('video_editor');
              if (onShowToast) {
                onShowToast('স্টোরিবোর্ড ভিডিও এডিটরে পাঠানো হয়েছে!', '🎬');
              }
            }}
          />
        )}

        {activeTab === 'video_editor' && (
          <VideoEditor
            initialAsset={activeMediaClip}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'thumbnail' && (
          <ThumbnailStudio
            initialTitle={targetTopic}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'media' && (
          <MediaImport
            onShowToast={onShowToast}
            onSendToVideoEditor={(asset) => {
              setActiveMediaClip(asset);
              setActiveTab('video_editor');
              if (onShowToast) {
                onShowToast('মিডিয়াটি ভিডিও এডিটরে যুক্ত করা হয়েছে!', '🎬');
              }
            }}
          />
        )}

        {activeTab === 'repurpose' && (
          <ContentRepurposer
            initialSourceText={targetRepurposeText}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'seo' && (
          <SeoGrowthStudio onShowToast={onShowToast} />
        )}

        {activeTab === 'calendar' && (
          <ContentCalendar onShowToast={onShowToast} />
        )}

        {activeTab === 'workspace' && (
          <ProjectWorkspace
            projects={projects}
            activeProject={activeProject}
            onSelectProject={handleSelectProject}
            onRefreshData={refreshData}
            onShowToast={onShowToast}
          />
        )}
      </main>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProject}
            className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">নতুন ক্রিয়েটর প্রজেক্ট তৈরি করুন</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                প্রজেক্ট বা চ্যানেলের নাম *
              </label>
              <input
                type="text"
                required
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                placeholder="যেমন: টেক বিডি মাস্টার / আমার রান্নাঘর"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রধান প্ল্যাটফর্ম
                </label>
                <select
                  value={newProjPlatform}
                  onChange={(e) => setNewProjPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="youtube">ইউটিউব চ্যানেল (YouTube)</option>
                  <option value="blog">ব্লগ ও ওয়েবসাইট (Blog)</option>
                  <option value="facebook">ফেসবুক পেজ (Facebook)</option>
                  <option value="multi">মাল্টি-প্ল্যাটফর্ম (Multi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ভাষা
                </label>
                <select
                  value={newProjLang}
                  onChange={(e) => setNewProjLang(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English</option>
                  <option value="bilingual">দ্বিভাষিক (Banglish)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                নিশ বা বিষয়বস্তু (Niche)
              </label>
              <input
                type="text"
                value={newProjNiche}
                onChange={(e) => setNewProjNiche(e.target.value)}
                placeholder="যেমন: ফ্রিল্যান্সিং ও অনলাইন ইনকাম"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                টার্গেট অডিয়েন্স
              </label>
              <input
                type="text"
                value={newProjAudience}
                onChange={(e) => setNewProjAudience(e.target.value)}
                placeholder="যেমন: ১৮-৩০ বছর বয়সী বাংলাদেশি তরুণরা"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সংক্ষিপ্ত বিবরণ (Optional)
              </label>
              <textarea
                rows={2}
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="প্রজেক্টের লক্ষ্য ও উদ্দেশ্য সম্পর্কে দুই লাইন লিখুন..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                প্রজেক্ট শুরু করুন 🚀
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
