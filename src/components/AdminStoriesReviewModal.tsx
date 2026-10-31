import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  Search,
  Check,
  Send,
  User,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';
import {
  storySubmissionService,
  SubmittedStory,
} from '../services/storySubmissionService';

interface AdminStoriesReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const AdminStoriesReviewModal: React.FC<AdminStoriesReviewModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [stories, setStories] = useState<SubmittedStory[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'islamic' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewStory, setPreviewStory] = useState<SubmittedStory | null>(null);

  // Subscribe to story submissions
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = storySubmissionService.subscribe((list) => {
      setStories(list);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtered stories
  const filteredStories = stories.filter((story) => {
    const matchStatus = statusFilter === 'all' || story.status === statusFilter;
    const matchType = typeFilter === 'all' || story.storyType === typeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      story.title.toLowerCase().includes(q) ||
      story.author.toLowerCase().includes(q) ||
      story.categoryLabel.toLowerCase().includes(q);
    return matchStatus && matchType && matchSearch;
  });

  const pendingCount = stories.filter((s) => s.status === 'pending').length;
  const approvedCount = stories.filter((s) => s.status === 'approved').length;
  const rejectedCount = stories.filter((s) => s.status === 'rejected').length;

  // Approve Story Handler
  const handleApprove = async (story: SubmittedStory) => {
    try {
      await storySubmissionService.approveStory(story.id);
      onShowToast(`"${story.title}" গল্পটি সফলভাবে অনুমোদন দেওয়া হয়েছে! সাইটে লাইভ প্রকাশিত হয়েছে 🎉`, '✅');
      if (previewStory?.id === story.id) {
        setPreviewStory({ ...previewStory, status: 'approved' });
      }
    } catch {
      onShowToast('অনুমোদনে সমস্যা হয়েছে', '⚠️');
    }
  };

  // Reject Story Handler
  const handleReject = async (story: SubmittedStory) => {
    const reason = prompt('প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক):', 'নীতিমালার সাথে সামঞ্জস্যপূর্ণ নয়');
    if (reason === null) return;

    try {
      await storySubmissionService.rejectStory(story.id, reason);
      onShowToast(`"${story.title}" গল্পটি প্রত্যাখ্যান করা হয়েছে`, '❌');
      if (previewStory?.id === story.id) {
        setPreviewStory({ ...previewStory, status: 'rejected', rejectionReason: reason });
      }
    } catch {
      onShowToast('প্রত্যাখ্যানে সমস্যা হয়েছে', '⚠️');
    }
  };

  // Delete Story Handler
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${title}" গল্পটি সম্পূর্ণ মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      await storySubmissionService.deleteStory(id);
      onShowToast('গল্পটি মুছে ফেলা হয়েছে', '🗑️');
      if (previewStory?.id === id) {
        setPreviewStory(null);
      }
    } catch {
      onShowToast('মুছে ফেলতে সমস্যা হয়েছে', '⚠️');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black leading-tight">
                  এডমিন: জমা পড়া গল্প যাচাই ও অনুমোদন প্যানেল
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                    {pendingCount}টি পেন্ডিং
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                ইউজারদের লেখা ইসলামিক আমল ও স্বরচিত গল্প যাচাই করে লাইভ করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Header Statistics */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 grid grid-cols-3 gap-3 text-center">
          <div
            onClick={() => setStatusFilter('pending')}
            className={`p-2.5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase block">
              ⏳ পেন্ডিং (যাচাই বাকি)
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-600">
              {pendingCount}
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('approved')}
            className={`p-2.5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                : 'bg-white border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase block">
              ✅ অনুমোদিত (লাইভ)
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600">
              {approvedCount}
            </span>
          </div>

          <div
            onClick={() => setStatusFilter('all')}
            className={`p-2.5 rounded-2xl border transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/30'
                : 'bg-white border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase block">
              📚 মোট জমা পড়া
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-800">
              {stories.length}
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'pending', label: `⏳ পেন্ডিং (${pendingCount})` },
              { id: 'approved', label: `✅ লাইভ (${approvedCount})` },
              { id: 'rejected', label: `❌ বাতিল (${rejectedCount})` },
              { id: 'all', label: `সব (${stories.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">সকল ধরন</option>
              <option value="islamic">📿 শুধু ইসলামিক</option>
              <option value="general">📖 শুধু সাধারণ গল্প</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="গল্প বা লেখক খুঁজুন..."
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[160px]"
            />
          </div>
        </div>

        {/* Stories List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredStories.length === 0 ? (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-2">
              <span className="text-3xl block">📭</span>
              <h4 className="font-bold text-slate-700">কোনো গল্প পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-400">
                এই ক্যাটাগরিতে বর্তমানে কোনো জমা পড়া গল্প নেই।
              </p>
            </div>
          ) : (
            filteredStories.map((story) => (
              <div
                key={story.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  story.status === 'pending'
                    ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                    : story.status === 'approved'
                    ? 'bg-white border-emerald-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      {story.storyType === 'islamic' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <span>📿 ইসলামিক আমল</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                          <span>📖 স্বরচিত গল্প</span>
                        </span>
                      )}

                      <span className="text-xs font-semibold text-slate-600">
                        {story.categoryLabel}
                      </span>

                      {story.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950">
                          ⏳ পেন্ডিং
                        </span>
                      )}
                      {story.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                          ✅ লাইভ
                        </span>
                      )}
                      {story.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                          ❌ বাতিল
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">
                        • {new Date(story.submittedAt).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 leading-snug">
                      {story.title}
                    </h4>

                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-bold">লেখক: {story.author}</span>
                      {story.authorContact && (
                        <span className="text-slate-400">({story.authorContact})</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {story.shortDescription}
                    </p>

                    {story.lessonOrAmal && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block font-medium">
                        💡 {story.storyType === 'islamic' ? 'আমল: ' : 'শিক্ষা: '}
                        {story.lessonOrAmal}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => setPreviewStory(story)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="সম্পূর্ণ গল্পটি পড়ুন"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>গল্প পড়ুন</span>
                    </button>

                    {story.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(story)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-200 transition"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>অনুমোদন দিন (Live)</span>
                      </button>
                    )}

                    {story.status === 'pending' && (
                      <button
                        onClick={() => handleReject(story)}
                        className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>প্রত্যাখ্যান</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(story.id, story.title)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            * অনুমোদন (Approve) বাটনে চাপার সাথে সাথে গল্পটি লাইভ হবে এবং সাইটে নোটিফিকেশন যাবে।
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Preview Full Story Modal */}
      {previewStory && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative">
            <button
              onClick={() => setPreviewStory(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {previewStory.categoryLabel}
              </span>
              <h3 className="text-xl font-black text-slate-900">{previewStory.title}</h3>
              <p className="text-xs text-slate-500 font-semibold">
                লেখক: {previewStory.author} {previewStory.authorContact && `• ${previewStory.authorContact}`}
              </p>
            </div>

            <article className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-b border-slate-100 py-4">
              {previewStory.content.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </article>

            {previewStory.lessonOrAmal && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                <strong>আমল / শিক্ষা:</strong> {previewStory.lessonOrAmal}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              {previewStory.status !== 'approved' && (
                <button
                  onClick={() => handleApprove(previewStory)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>অনুমোদন দিন ও লাইভ করুন</span>
                </button>
              )}
              <button
                onClick={() => setPreviewStory(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
