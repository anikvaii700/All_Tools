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
import { StudioDashboard, StudioSection } from './StudioDashboard';
import { MultiPhotoStudioEditor } from './MultiPhotoStudioEditor';
import { TwoPersonStudioEditor } from './TwoPersonStudioEditor';
import { StudioBackgroundEditor } from './StudioBackgroundEditor';
import { SmartDocScannerStudio } from './SmartDocScannerStudio';
import { PhotoSizePreset, StudioBgColor } from './photoStudioTypes';

interface UltraDigitalStudioProps {
  onBackToHub?: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const UltraDigitalStudio: React.FC<UltraDigitalStudioProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  // Navigation state inside Ultra Digital Studio
  const [activeSection, setActiveSection] = useState<StudioSection>('dashboard');
  const [initialPreset, setInitialPreset] = useState<PhotoSizePreset | undefined>(undefined);

  // Handle switching sections
  const handleSelectSection = (section: StudioSection, preset?: PhotoSizePreset) => {
    setInitialPreset(preset);
    setActiveSection(section);
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

      {/* 2. Smart Document Scanner & Auto A4 Maker */}
      {activeSection === 'doc-scanner' && (
        <SmartDocScannerStudio
          onBackToDashboard={handleReturnToDashboard}
          onShowToast={onShowToast}
        />
      )}

      {/* 3. Multi-Photo Studio Editor (Passport, Stamp, Visa, 3R, 4R, Full A4, Custom) */}
      {activeSection === 'multi-photo' && (
        <MultiPhotoStudioEditor
          initialPreset={initialPreset}
          onBackToDashboard={handleReturnToDashboard}
          onShowToast={onShowToast}
        />
      )}

      {/* 3. ID Card Joiner (Front & Back on Single Page) */}
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

      {/* 4. Two-Person Joint Photo Studio Editor */}
      {activeSection === 'two-person' && (
        <TwoPersonStudioEditor
          onBackToDashboard={handleReturnToDashboard}
          onShowToast={onShowToast}
        />
      )}

      {/* 5. Studio Background Color Editor */}
      {activeSection === 'background-changer' && (
        <StudioBackgroundEditor
          onBackToDashboard={handleReturnToDashboard}
          onSendToPrintSheet={(file, bgColor) => {
            // Navigate to multi-photo editor with passport preset and notify user
            setActiveSection('multi-photo');
            setInitialPreset('passport-bd');
            onShowToast('ছবিটি প্রিন্ট স্টুডিওতে পাঠানো হয়েছে!', '✨');
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
