import React, { useState } from 'react';
import {
  Download,
  Upload,
  Copy,
  CheckCircle2,
  AlertTriangle,
  X,
  FileJson,
  RefreshCw,
} from 'lucide-react';
import { EntrepreneurStorage } from '../../services/entrepreneurStorage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadData: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onReloadData,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [importJsonText, setImportJsonText] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  const handleDownloadBackup = () => {
    try {
      const dataStr = EntrepreneurStorage.exportFullBackup();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mosafa-entrepreneur-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onShowToast('ব্যাকআপ ফাইল ডাউনলোড হয়েছে! 💾', '✅');
    } catch (e: any) {
      onShowToast('ব্যাকআপ তৈরিতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  const handleCopyBackup = () => {
    const dataStr = EntrepreneurStorage.exportFullBackup();
    navigator.clipboard.writeText(dataStr);
    onShowToast('ব্যাকআপ JSON ডাটা কপি করা হয়েছে! 📋', '📋');
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      onShowToast('অনুগ্রহ করে ব্যাকআপ JSON ডাটা পেস্ট করুন!', '⚠️');
      return;
    }

    const result = EntrepreneurStorage.importFullBackup(importJsonText.trim());
    if (result.success) {
      onShowToast(result.message, '🎉');
      onReloadData();
      onClose();
    } else {
      onShowToast(result.message, '⚠️');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        const result = EntrepreneurStorage.importFullBackup(content);
        if (result.success) {
          onShowToast(result.message, '🎉');
          onReloadData();
          onClose();
        } else {
          onShowToast(result.message, '⚠️');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">ডাটা ব্যাকআপ ও রিস্টোর (Backup & Restore)</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'export' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📥 এক্সপোর্ট ব্যাকআপ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'import' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📤 ব্যাকআপ রিস্টোর
          </button>
        </div>

        {/* Local Storage limitation warning */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            বিজ্ঞপ্তি: এই অ্যাপের সমস্ত ব্যবসায়িক ডাটা আপনার ব্রাউজারের লোকাল স্টোরেজে থাকে। ব্রাউজার ক্যাশ বা হিস্টোরি ক্লিয়ার করলে ডাটা যেন হারিয়ে না যায়, সেজন্য নিয়মিত ব্যাকআপ ডাউনলোড করে নিরাপদে রাখুন।
          </span>
        </div>

        {activeTab === 'export' ? (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              আপনার সকল তৈরি করা প্রজেক্ট, কাস্টমার লিস্ট, অর্ডার খাতা ও বিজনেস প্ল্যান একটি সিঙ্গেল JSON ফাইল হিসেবে ডাউনলোড করুন।
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>JSON ফাইল ডাউনলোড</span>
              </button>

              <button
                type="button"
                onClick={handleCopyBackup}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>ক্লিপবোর্ডে কপি</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              পূর্বে ডাউনলোড করা কোনো JSON ব্যাকআপ ফাইল আপলোড করুন অথবা নিচে পেস্ট করুন:
            </p>

            <div>
              <label className="block p-3 rounded-xl border border-dashed border-slate-300 text-center hover:bg-slate-50 transition cursor-pointer font-medium text-slate-600">
                <Upload className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
                <span>ফাইল সিলেক্ট করুন (.json)</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">অথবা JSON কোড পেস্ট করুন:</label>
              <textarea
                rows={3}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"version": "1.0", "projects": [...]}'
                className="w-full p-2 rounded-xl border border-slate-300 font-mono text-[11px]"
              />
            </div>

            <button
              type="button"
              onClick={handleImportJson}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ডাটা রিস্টোর করুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
