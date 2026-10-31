import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Compass,
  Sparkles,
  User,
  FolderPlus,
  FileJson,
  LayoutDashboard,
  Sprout,
  FlaskConical,
  Target,
  Package,
  FileText,
  Megaphone,
  Calculator,
  Users,
  ShieldCheck,
  TrendingUp,
  Calendar,
  X,
  Share2,
} from 'lucide-react';
import { EntrepreneurStorage } from '../services/entrepreneurStorage';
import { BusinessProject, EntrepreneurProfile, ZeroCapitalIdea } from '../types/entrepreneur';

// Sub components
import { ProfileModal } from './entrepreneur/ProfileModal';
import { WorkspaceDashboard } from './entrepreneur/WorkspaceDashboard';
import { ZeroCapitalFinder } from './entrepreneur/ZeroCapitalFinder';
import { IdeaValidator } from './entrepreneur/IdeaValidator';
import { FirstCustomerFinder } from './entrepreneur/FirstCustomerFinder';
import { OfferBuilder } from './entrepreneur/OfferBuilder';
import { BusinessPlanView } from './entrepreneur/BusinessPlanView';
import { MarketingSalesStudio } from './entrepreneur/MarketingSalesStudio';
import { FinancePricingLab } from './entrepreneur/FinancePricingLab';
import { CustomerOrderManager } from './entrepreneur/CustomerOrderManager';
import { BangladeshBusinessGuide } from './entrepreneur/BangladeshBusinessGuide';
import { GrowthRoadmap } from './entrepreneur/GrowthRoadmap';
import { DailyMentor } from './entrepreneur/DailyMentor';
import { BackupModal } from './entrepreneur/BackupModal';

export type EntrepreneurTabId =
  | 'dashboard'
  | 'finder'
  | 'validator'
  | 'first-customers'
  | 'offer-builder'
  | 'business-plan'
  | 'marketing'
  | 'finance'
  | 'crm'
  | 'bd-guide'
  | 'growth'
  | 'daily-mentor';

interface EntrepreneurJourneyProps {
  onBackToHub: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const EntrepreneurJourney: React.FC<EntrepreneurJourneyProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<EntrepreneurTabId>('dashboard');
  const [profile, setProfile] = useState<EntrepreneurProfile>(() => EntrepreneurStorage.getProfile());
  const [projects, setProjects] = useState<BusinessProject[]>(() => EntrepreneurStorage.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => EntrepreneurStorage.getActiveProjectId());

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // New Project Form
  const [newProjName, setNewProjName] = useState('');
  const [newProjTagline, setNewProjTagline] = useState('');
  const [newProjAudience, setNewProjAudience] = useState('');
  const [newProjCapital, setNewProjCapital] = useState(0);

  // Active Project Reference
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleUpdateProject = (updater: (prev: BusinessProject) => BusinessProject) => {
    const updated = EntrepreneurStorage.updateActiveProject(updater);
    setProjects(EntrepreneurStorage.getProjects());
  };

  const handleSelectProject = (id: string) => {
    EntrepreneurStorage.setActiveProjectId(id);
    setActiveProjectId(id);
    onShowToast(`বিজনেস প্রজেক্ট পরিবর্তন হয়েছে 📁`, '🔄');
  };

  const handleCreateNewProject = () => {
    if (!newProjName.trim()) {
      onShowToast('অনুগ্রহ করে ব্যবসার নাম দিন!', '⚠️');
      return;
    }

    const created = EntrepreneurStorage.createNewProject({
      name: newProjName.trim(),
      businessType: 'service',
      tagline: newProjTagline.trim() || 'নতুন ব্যবসায়িক উদ্যোগ',
      targetAudience: newProjAudience.trim() || 'বাংলাদেশের ক্রেতা ও পরিবার',
      capitalAllocatedBDT: Number(newProjCapital) || 0,
    });

    setProjects(EntrepreneurStorage.getProjects());
    setActiveProjectId(created.id);
    setIsNewProjectModalOpen(false);
    setNewProjName('');
    setNewProjTagline('');
    setNewProjAudience('');
    onShowToast(`"${created.name}" প্রজেক্ট সফলভাবে তৈরি হয়েছে! 🚀`, '✨');
  };

  const handleApplyIdeaToProject = (idea: ZeroCapitalIdea) => {
    handleUpdateProject((prev) => ({
      ...prev,
      name: idea.banglaTitle,
      tagline: idea.tagline,
      primaryDescription: idea.valueProposition,
      targetAudience: idea.targetCustomersInBD.join(', '),
      businessType: idea.category,
      validationPlan: {
        ...prev.validationPlan,
        ideaDescription: idea.valueProposition,
        valueProposition: idea.valueProposition,
        customerProblem: 'গ্রাহকরা মানসম্মত ও সাশ্রয়ী সেবা পাচ্ছেন না।',
        targetAudience: idea.targetCustomersInBD.join(', '),
        nextActions: idea.validationSteps,
      },
      offerDraft: {
        ...prev.offerDraft,
        selectedBrandName: idea.banglaTitle,
        tagline: idea.tagline,
        packages: [
          {
            id: 'pkg-init',
            tierName: idea.firstOfferDraft.name,
            tagline: idea.firstOfferDraft.description,
            priceBDT: parseInt(idea.firstOfferDraft.suggestedPrice.replace(/[^0-9]/g, '')) || 3500,
            deliverables: idea.requiredSkills,
            deliveryTimeDays: 7,
            revisionsAllowed: '২ বার',
            idealFor: 'প্রথম ক্রেতা',
          },
        ],
      },
      updatedAt: new Date().toISOString(),
    }));

    setActiveTab('validator');
  };

  const handleReloadFromBackup = () => {
    setProfile(EntrepreneurStorage.getProfile());
    setProjects(EntrepreneurStorage.getProjects());
    setActiveProjectId(EntrepreneurStorage.getActiveProjectId());
  };

  // Nav Items
  const NAV_TABS = [
    { id: 'dashboard', label: 'ওয়ার্কস্পেস', icon: LayoutDashboard },
    { id: 'finder', label: 'জিরো ক্যাপিটাল', icon: Sprout },
    { id: 'validator', label: 'আইডিয়া যাচাই', icon: FlaskConical },
    { id: 'first-customers', label: 'প্রথম ১০ ক্রেতা', icon: Target },
    { id: 'offer-builder', label: 'অফার ও প্যাকেজ', icon: Package },
    { id: 'business-plan', label: 'বিজনেস প্ল্যান', icon: FileText },
    { id: 'marketing', label: 'মার্কেটিং ও সেলস', icon: Megaphone },
    { id: 'finance', label: 'ফাইন্যান্স ল্যাব', icon: Calculator },
    { id: 'crm', label: 'কাস্টমার ও অর্ডার', icon: Users },
    { id: 'bd-guide', label: 'বাংলাদেশ গাইড', icon: ShieldCheck },
    { id: 'growth', label: '৩০ দিনের চ্যালেঞ্জ', icon: TrendingUp },
    { id: 'daily-mentor', label: 'দৈনিক মেন্টর', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16">
      {/* Top Workspace Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBackToHub}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
              title="সকল টুলসে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h1 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 truncate">
                  <span>MoSaFa Entrepreneur Journey</span>
                  <span className="hidden sm:inline-block text-[10px] bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40">
                    Zero to 1
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 truncate hidden md:block">
                  শূন্য থেকে নিজের ব্যবসা গড়ার পূর্ণাঙ্গ গাইড • {activeProject?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
              title="নতুন ব্যবসা যোগ করুন"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>নতুন প্রজেক্ট</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition cursor-pointer"
              title="ডাটা ব্যাকআপ ও রিস্টোর"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ব্যাকআপ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{profile.name}</span>
            </button>
          </div>
        </div>

        {/* Tab Scroller Navigation */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 py-1.5 min-w-max">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as EntrepreneurTabId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace View Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-5 sm:pt-6 w-full flex-1">
        {activeTab === 'dashboard' && (
          <WorkspaceDashboard
            project={activeProject}
            profile={profile}
            projectsList={projects}
            onSelectProject={handleSelectProject}
            onCreateNewProject={() => setIsNewProjectModalOpen(true)}
            onNavigateTab={(tab) => {
              setActiveTab(tab as EntrepreneurTabId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {activeTab === 'finder' && (
          <ZeroCapitalFinder
            activeProject={activeProject}
            onApplyIdeaToProject={handleApplyIdeaToProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'validator' && (
          <IdeaValidator
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'first-customers' && (
          <FirstCustomerFinder
            project={activeProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'offer-builder' && (
          <OfferBuilder
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'business-plan' && (
          <BusinessPlanView
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'marketing' && (
          <MarketingSalesStudio
            project={activeProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'finance' && (
          <FinancePricingLab
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'crm' && (
          <CustomerOrderManager
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'bd-guide' && <BangladeshBusinessGuide />}

        {activeTab === 'growth' && (
          <GrowthRoadmap
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'daily-mentor' && (
          <DailyMentor
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onShowToast={onShowToast}
          />
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={(updated) => {
          setProfile(updated);
          EntrepreneurStorage.saveProfile(updated);
        }}
        onShowToast={onShowToast}
      />

      {/* Backup Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onReloadData={handleReloadFromBackup}
        onShowToast={onShowToast}
      />

      {/* Create New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">নতুন ব্যবসা প্রজেক্ট তৈরি করুন</h3>
              <button type="button" onClick={() => setIsNewProjectModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ব্যবসার নাম:</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="যেমন: গ্রিন ফুড বিডি / ডিজিটাল ক্লিক"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ট্যাগলাইন / এক লাইনে বিবরণ:</label>
                <input
                  type="text"
                  value={newProjTagline}
                  onChange={(e) => setNewProjTagline(e.target.value)}
                  placeholder="যেমন: খাঁটি পণ্যের বিশ্বস্ত ঠিকানা"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">টার্গেট গ্রাহক:</label>
                <input
                  type="text"
                  value={newProjAudience}
                  onChange={(e) => setNewProjAudience(e.target.value)}
                  placeholder="যেমন: ঢাকার স্বাস্থ্যসচেতন পরিবার"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">প্রাথমিক বরাদ্দকৃত পুঁজি (টাকা):</label>
                <input
                  type="number"
                  value={newProjCapital}
                  onChange={(e) => setNewProjCapital(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  জিরো ক্যাপিটাল হলে 0 রাখুন।
                </span>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleCreateNewProject}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
              >
                প্রজেক্ট তৈরি করুন 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
