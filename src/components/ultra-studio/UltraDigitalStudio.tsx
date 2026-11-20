import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Sparkles,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Info,
  HelpCircle,
  Scissors,
  Camera,
  Image as ImageIcon,
  Users,
  Palette,
  LayoutGrid,
} from 'lucide-react';
import { IdCardJoiner } from './IdCardJoiner';
import { StudioDashboard, StudioLaunchOptions, StudioSection } from './StudioDashboard';
import { TwoPersonStudioEditor } from './TwoPersonStudioEditor';
import { SmartDocScannerStudio } from './SmartDocScannerStudio';
import { PhotoSizePreset } from './photoStudioTypes';
import { MoSaFaAIPhotoStudio } from './ai-photo-studio/MoSaFaAIPhotoStudio';
import { PassportPresetId, StudioWorkspaceTab } from './ai-photo-studio/types';

interface UltraDigitalStudioProps {
  onBackToHub?: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

function mapLegacyPresetToPassportId(preset?: PhotoSizePreset): PassportPresetId {
  switch (preset) {
    case 'passport-bd':
      return 'bd-standard-35x45';
    case 'passport-intl':
      return 'cv-portrait-40x50';
    case 'stamp':
      return 'bd-stamp-20x25';
    case 'us-visa':
      return 'us-visa-51x51';
    case 'schengen':
      return 'schengen-uk-35x45';
    case '3r':
      return 'photo-3r';
    case '4r':
      return 'photo-4r';
    case 'a4-full':
      return 'full-a4';
    case 'custom':
      return 'custom';
    default:
      return 'original-free';
  }
}

export const UltraDigitalStudio: React.FC<UltraDigitalStudioProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  // Navigation state inside Ultra Digital Studio
  const [activeSection, setActiveSection] = useState<StudioSection>('dashboard');
  const [aiStudioTab, setAiStudioTab] = useState<StudioWorkspaceTab>('backgrounds');
  const [aiPassportPreset, setAiPassportPreset] = useState<PassportPresetId>('original-free');

  // Handle switching sections
  const handleSelectSection = (
    section: StudioSection,
    preset?: PhotoSizePreset,
    launchOptions?: StudioLaunchOptions
  ) => {
    if (section === 'ai-photo-studio') {
      setAiStudioTab(launchOptions?.aiStudioTab || 'backgrounds');
      setAiPassportPreset(
        launchOptions?.aiPassportPreset || mapLegacyPresetToPassportId(preset)
      );
      setActiveSection('ai-photo-studio');
    } else if (section === 'multi-photo') {
      // Consolidated into MoSaFa AI Photo Studio – All-in-One
      setAiStudioTab('passport');
      setAiPassportPreset(mapLegacyPresetToPassportId(preset || 'passport-bd'));
      setActiveSection('ai-photo-studio');
    } else if (section === 'background-changer') {
      // Consolidated into MoSaFa AI Photo Studio – All-in-One
      setAiStudioTab('backgrounds');
      setAiPassportPreset('original-free');
      setActiveSection('ai-photo-studio');
    } else {
      setActiveSection(section);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToDashboard = () => {
    setActiveSection('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* 1. Main Studio Dashboard */}
      {activeSection === 'dashboard' && (
        <StudioDashboard
          onSelectSection={handleSelectSection}
          onBackToHome={onBackToHub}
        />
      )}

      {/* 2. MoSaFa AI Photo Studio – All-in-One (Merges Digital Photo & Print Studio + Studio Backdrop Changer) */}
      {(activeSection === 'ai-photo-studio' ||
        activeSection === 'multi-photo' ||
        activeSection === 'background-changer') && (
        <MoSaFaAIPhotoStudio
          key={`${aiStudioTab}-${aiPassportPreset}`}
          initialTab={aiStudioTab}
          initialPassportPreset={aiPassportPreset}
          onBackToDashboard={handleReturnToDashboard}
          onShowToast={onShowToast}
        />
      )}

      {/* 3. Smart Document Scanner & Auto A4 Maker (Kept Separate) */}
      {activeSection === 'doc-scanner' && (
        <SmartDocScannerStudio
          onBackToDashboard={handleReturnToDashboard}
          onShowToast={onShowToast}
        />
      )}

      {/* 4. ID Card Joiner (Front & Back on Single Page — Kept Separate) */}
      {activeSection === 'id-card' && (
        <div className="relative">
          {/* Quick back link to Ultra Digital Studio Hub */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
            <button
              onClick={handleReturnToDashboard}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              ← আল্ট্রা ডিজিটাল স্টুডিওর মূল তালিকায় ফিরুন
            </button>
            <span className="text-slate-500 hidden sm:inline">
              আল্ট্রা ডিজিটাল স্টুডিও / আইডি কার্ড জয়নার
            </span>
          </div>
          <IdCardJoiner onBackToHub={handleReturnToDashboard} onShowToast={onShowToast} />
        </div>
      )}

      {/* 5. Two-Person Joint Photo Studio Editor (Kept Separate) */}
      {activeSection === 'two-person' && (
        <TwoPersonStudioEditor
          onBackToDashboard={handleReturnToDashboard}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
