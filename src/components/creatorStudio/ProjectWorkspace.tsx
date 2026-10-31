import React, { useState } from 'react';
import {
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Bookmark,
  FileText,
  Video,
  Search,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  CreatorProject,
  NicheIdea,
  TopicKeywordItem,
  ContentDraft,
  VideoProductionPlan,
} from '../../types/creatorStudio';
import { CreatorStorage } from '../../services/creatorStorage';

interface ProjectWorkspaceProps {
  projects: CreatorProject[];
  activeProject: CreatorProject | null;
  onSelectProject: (id: string) => void;
  onRefreshData: () => void;
  onShowToast?: (msg: string, icon?: string) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onRefreshData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'drafts' | 'keywords' | 'niches' | 'backup'>('projects');

  const niches = CreatorStorage.getSavedNiches();
  const keywords = CreatorStorage.getSavedKeywords();
  const drafts = CreatorStorage.getDrafts();
  const videoPlans = CreatorStorage.getVideoPlans();

  const handleExportBackup = () => {
    const jsonStr = CreatorStorage.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mosafa_creator_studio_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('সম্পূর্ণ প্রজেক্ট ব্যাকআপ JSON ডাউনলোড হয়েছে!', '📥');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = CreatorStorage.importFullBackup(content);
      if (success) {
        onRefreshData();
        if (onShowToast) {
          onShowToast('ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!', '✅');
        }
      } else {
        if (onShowToast) {
          onShowToast('ব্যাকআপ ফাইলটি সঠিক নয়।', '⚠️');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteDraft = (id: string) => {
    CreatorStorage.deleteDraft(id);
    onRefreshData();
    if (onShowToast) {
      onShowToast('ড্রাফট মুছে ফেলা হয়েছে', '🗑️');
    }
  };

  const handleDeleteKeyword = (id: string) => {
    CreatorStorage.deleteKeyword(id);
    onRefreshData();
    if (onShowToast) {
      onShowToast('কিওয়ার্ড মুছে ফেলা হয়েছে', '🗑️');
    }
  };

  const handleDeleteNiche = (id: string) => {
    CreatorStorage.deleteNiche(id);
    onRefreshData();
    if (onShowToast) {
      onShowToast('নিশ মুছে ফেলা হয়েছে', '🗑️');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-300">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                প্রজেক্ট ও ফাইল রিপোজিটরি (Project Workspace) 🗂️
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                আপনার সকল প্রজেক্ট, সেভ করা নিশ, কিওয়ার্ড, ড্রাফট ও ব্যাকআপ ম্যানেজার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ব্যাকআপ এক্সপোর্ট (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'projects', label: `প্রজেক্টসমূহ (${projects.length})` },
          { id: 'drafts', label: `স্ক্রিপ্ট ও ড্রাফট (${drafts.length})` },
          { id: 'keywords', label: `কিওয়ার্ড ও আইডিয়া (${keywords.length})` },
          { id: 'niches', label: `সংরক্ষিত নিশ (${niches.length})` },
          { id: 'backup', label: 'ব্যাকআপ ও রিস্টোর' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => {
              const isActive = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-slate-900">{p.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {p.platform}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-700 font-medium">নিশ: {p.niche}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      অডিয়েন্স: {p.targetAudience}
                    </span>
                    {isActive ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        সক্রিয় প্রজেক্ট ✓
                      </span>
                    ) : (
                      <span className="text-indigo-600 font-bold hover:underline">
                        নির্বাচন করুন
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'drafts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-3">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="font-bold text-sm text-slate-900">{d.title}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>শব্দ: {d.wordCount}</span>
                    <span>•</span>
                    <span>ফরম্যাট: {d.type}</span>
                    <span>•</span>
                    <span>তারিখ: {new Date(d.createdAt).toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleDeleteDraft(d.id)}
                    className="p-2 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {drafts.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                কোনো ড্রাফট সেভ করা নেই। স্ক্রিপ্ট স্টুডিও থেকে ড্রাফট সেভ করুন।
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keywords.map((kw) => (
              <div
                key={kw.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{kw.title}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteKeyword(kw.id)}
                    className="p-1 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-bold text-blue-600">
                    {kw.searchIntent}
                  </span>
                  <span>{kw.difficultyEstimate}</span>
                </div>
              </div>
            ))}

            {keywords.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs col-span-2">
                কোনো সেভ করা কিওয়ার্ড নেই।
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'niches' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {niches.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-slate-900">{n.title}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNiche(n.id)}
                    className="p-1 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{n.description}</p>
                <div className="text-[10px] font-bold text-indigo-600">
                  পটেনশিয়াল: {n.profitPotential} • কম্পিটিশন: {n.competitionLevel}
                </div>
              </div>
            ))}

            {niches.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs col-span-2">
                কোনো সংরক্ষিত নিশ নেই। নিশ ফাইন্ডার থেকে পছন্দের নিশ সেভ করুন।
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">
              ডাটা ব্যাকআপ ও রিস্টোরেশন সেন্টার
            </h3>
            <p className="text-xs text-slate-500">
              আপনার সমস্ত প্রজেক্ট, স্ক্রিপ্ট, ক্যালেন্ডার টাস্ক এবং রিসার্চ ডেটা সম্পূর্ণ আপনার ডিভাইসে সংরক্ষিত থাকে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>ফুল ব্যাকআপ এক্সপোর্ট (JSON)</span>
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                আপনার ব্রাউজারের সমস্ত ক্রিয়েটর ডেটা একটি সিঙ্গেল JSON ফাইল হিসেবে ডাউনলোড করে নিরাপদে সংরক্ষণ করুন।
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                ব্যাকআপ ফাইল ডাউনলোড করুন
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>পূর্বের ব্যাকআপ রিস্টোর (JSON Import)</span>
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                পূর্বে সেভ করা যে কোনো JSON ব্যাকআপ ফাইল আপলোড করে এক ক্লিকে আপনার সমস্ত প্রজেক্ট পুনরুদ্ধার করুন।
              </p>
              <label className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5">
                <span>ব্যাকআপ ফাইল আপলোড করুন</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
