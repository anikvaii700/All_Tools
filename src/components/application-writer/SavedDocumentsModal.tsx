import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  Copy,
  Trash2,
  Download,
  Upload,
  Calendar,
  Clock,
  ExternalLink,
  Edit2,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
} from 'lucide-react';
import { SavedDocument } from './types';
import { exportToDocx } from './docxExporter';

interface SavedDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDocuments: SavedDocument[];
  onOpenDocument: (doc: SavedDocument) => void;
  onDuplicateDocument: (doc: SavedDocument) => void;
  onRenameDocument: (id: string, newTitle: string) => void;
  onDeleteDocument: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onClearAll: () => void;
}

export const SavedDocumentsModal: React.FC<SavedDocumentsModalProps> = ({
  isOpen,
  onClose,
  savedDocuments,
  onOpenDocument,
  onDuplicateDocument,
  onRenameDocument,
  onDeleteDocument,
  onExportBackup,
  onImportBackup,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newTitleText, setNewTitleText] = useState('');

  if (!isOpen) return null;

  const filteredDocs = savedDocuments.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartRename = (doc: SavedDocument) => {
    setRenamingId(doc.id);
    setNewTitleText(doc.title);
  };

  const handleSaveRename = (id: string) => {
    if (newTitleText.trim()) {
      onRenameDocument(id, newTitleText.trim());
    }
    setRenamingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-rose-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>সংরক্ষিত ডকুমেন্টস আর্কাইভ</span>
                <span className="text-xs bg-rose-500/30 text-rose-300 font-semibold px-2 py-0.5 rounded-full border border-rose-500/40">
                  {savedDocuments.length}টি সংরক্ষিত
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                যেকোনো সময় পূর্বের ড্রাফট খুলুন, এডিট করুন বা ব্যাকআপ ফাইল সংরক্ষণ করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিরোনাম বা বিষয়বস্তু দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-rose-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onExportBackup}
              disabled={savedDocuments.length === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
              title="সকল ডকুমেন্টের JSON ব্যাকআপ ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>ব্যাকআপ এক্সপোর্ট</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>ইমপোর্ট ব্যাকআপ</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Privacy Note Banner */}
        <div className="px-6 py-2 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-900 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>
            আপনার তৈরি করা ডকুমেন্ট এই ডিভাইসের ব্রাউজারে সংরক্ষিত থাকে। প্রয়োজন হলে ব্যাকআপ ডাউনলোড করে রাখুন।
          </span>
        </div>

        {/* Document List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const isDeleting = confirmDeleteId === doc.id;
              const isRenaming = renamingId === doc.id;

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    {isRenaming ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          value={newTitleText}
                          onChange={(e) => setNewTitleText(e.target.value)}
                          className="px-2 py-1 text-xs font-bold border border-rose-300 rounded-lg focus:outline-rose-500 w-full max-w-sm"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(doc.id)}
                          className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-lg font-bold"
                        >
                          সংরক্ষণ
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingId(null)}
                          className="px-2 py-1 text-xs text-slate-500"
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {doc.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleStartRename(doc)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                          title="নাম পরিবর্তন করুন"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                          {doc.language === 'bn' ? 'বাংলা' : 'English'}
                        </span>
                        {doc.isAiEnhanced && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                            ✨ AI
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-mono text-[11px]">
                      {doc.content.replace(/\n+/g, ' ').slice(0, 100)}...
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>আপডেট: {new Date(doc.updatedAt).toLocaleDateString('bn-BD')}</span>
                      </span>
                      <span>•</span>
                      <span>{doc.content.length} অক্ষর</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1.5 rounded-xl animate-in fade-in duration-100">
                        <span className="text-[11px] font-bold text-rose-700 px-1">মুছে ফেলবেন?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteDocument(doc.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                        >
                          হ্যাঁ
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                        >
                          না
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenDocument(doc);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          title="এই ডকুমেন্টটি এডিটরে খুলুন"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>খুলুন</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDuplicateDocument(doc)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          title="ডুপ্লিকেট কপি তৈরি করুন"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => exportToDocx(doc.title, doc.content, `${doc.title}.docx`)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-blue-50 text-blue-700 transition cursor-pointer"
                          title="Word (.docx) ডাউনলোড করুন"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(doc.id)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">কোনো সংরক্ষিত ডকুমেন্ট নেই</p>
              <p className="text-xs text-slate-400 mt-1">
                দরখাস্ত তৈরি করে ‘ডকুমেন্ট সংরক্ষণ করুন’ বোতামে ক্লিক করলে এখানে জমা থাকবে।
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {savedDocuments.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              সবগুলো মুছুন (Clear All)
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
