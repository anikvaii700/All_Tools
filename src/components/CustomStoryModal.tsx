import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Clock,
  Layers,
  Save,
  Check,
  Type,
} from 'lucide-react';
import { StoryMetadata, STORY_CATEGORIES } from '../data/golpoGhorData';

interface CustomStoryModalProps {
  isOpen: boolean;
  editingStory: StoryMetadata | null;
  onClose: () => void;
  onSave: (story: StoryMetadata) => void;
  onShowToast: (message: string, icon?: string) => void;
}

interface ChapterInput {
  title: string;
  content: string; // newline-separated paragraphs
}

const GRADIENT_PRESETS = [
  { name: 'গোলাপী ও লাল', value: 'from-rose-500 via-pink-600 to-rose-700' },
  { name: 'নীল ও বেগুনি', value: 'from-blue-600 via-indigo-700 to-purple-800' },
  { name: 'সবুজ ও টিল', value: 'from-emerald-600 via-teal-700 to-slate-900' },
  { name: 'সোনালী ও অম্বর', value: 'from-amber-600 via-orange-700 to-amber-900' },
  { name: 'গাঢ় ভেলভেট', value: 'from-purple-950 via-slate-900 to-black' },
];

const ICON_PRESETS = ['✍️', '📖', '❤️', '🌙', '🍂', '📜', '✨', '☕', '🌹', '🕊️'];

export const CustomStoryModal: React.FC<CustomStoryModalProps> = ({
  isOpen,
  editingStory,
  onClose,
  onSave,
  onShowToast,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [categorySlug, setCategorySlug] = useState('romance');
  const [shortDescription, setShortDescription] = useState('');
  const [coverGradient, setCoverGradient] = useState(GRADIENT_PRESETS[0].value);
  const [coverIcon, setCoverIcon] = useState(ICON_PRESETS[0]);
  const [chapters, setChapters] = useState<ChapterInput[]>([
    { title: 'প্রথম অধ্যায়: সূচনা', content: '' },
  ]);

  // Load existing story data if editing
  useEffect(() => {
    if (editingStory) {
      setTitle(editingStory.title);
      setAuthor(editingStory.author);
      setCategorySlug(editingStory.categorySlug || 'romance');
      setShortDescription(editingStory.shortDescription);
      setCoverGradient(editingStory.coverGradient || GRADIENT_PRESETS[0].value);
      setCoverIcon(editingStory.coverIcon || ICON_PRESETS[0]);
      if (editingStory.chapters && editingStory.chapters.length > 0) {
        setChapters(
          editingStory.chapters.map((ch) => ({
            title: ch.title,
            content: ch.content.join('\n\n'),
          }))
        );
      }
    } else {
      // Reset defaults
      setTitle('');
      setAuthor('');
      setCategorySlug('romance');
      setShortDescription('');
      setCoverGradient(GRADIENT_PRESETS[0].value);
      setCoverIcon(ICON_PRESETS[0]);
      setChapters([{ title: 'প্রথম অধ্যায়: সূচনা', content: '' }]);
    }
  }, [editingStory, isOpen]);

  if (!isOpen) return null;

  // Add new chapter
  const handleAddChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        title: `${prev.length + 1}-তম অধ্যায়: নতুন পর্ব`,
        content: '',
      },
    ]);
  };

  // Remove chapter
  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) {
      onShowToast('গল্পে কমপক্ষে একটি অধ্যায় থাকতে হবে!', '⚠️');
      return;
    }
    setChapters((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update chapter field
  const handleChapterChange = (index: number, field: 'title' | 'content', value: string) => {
    setChapters((prev) =>
      prev.map((ch, idx) => (idx === index ? { ...ch, [field]: value } : ch))
    );
  };

  // Calculate total words and estimated minutes
  const totalWords = chapters.reduce((acc, ch) => {
    return acc + ch.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const estimatedReadingTime = Math.max(3, Math.ceil(totalWords / 120));

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      onShowToast('অনুগ্রহ করে গল্পের শিরোনাম লিখুন!', '⚠️');
      return;
    }
    if (!author.trim()) {
      onShowToast('অনুগ্রহ করে লেখকের নাম দিন!', '⚠️');
      return;
    }
    if (chapters.some((ch) => !ch.content.trim())) {
      onShowToast('অধ্যায়ের মূল লেখা খালি রাখা যাবে না!', '⚠️');
      return;
    }

    const matchedCat = STORY_CATEGORIES.find((c) => c.id === categorySlug);
    const categoryName = matchedCat ? matchedCat.name : 'ছোটগল্প';

    const formattedChapters = chapters.map((ch, idx) => {
      const paragraphs = ch.content
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      return {
        id: `custom-${Date.now()}-ch-${idx + 1}`,
        chapterNumber: idx + 1,
        title: ch.title.trim() || `অধ্যায় ${idx + 1}`,
        content: paragraphs.length > 0 ? paragraphs : ['(কোনো বিষয়বস্তু নেই)'],
      };
    });

    const storySlug = editingStory
      ? editingStory.slug
      : `custom-story-${Date.now()}-${encodeURIComponent(
          title.toLowerCase().replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '-').slice(0, 40)
        )}`;

    const newCustomStory: StoryMetadata = {
      id: editingStory ? editingStory.id : `custom-${Date.now()}`,
      slug: storySlug,
      title: title.trim(),
      author: author.trim(),
      category: categoryName,
      categorySlug: categorySlug,
      language: 'bn',
      shortDescription:
        shortDescription.trim() ||
        `${title} — ${author}-এর স্বরচিত বাংলা সাহিত্য সৃষ্টি।`,
      coverGradient,
      coverIcon,
      contentType: 'original',
      copyrightStatus: 'permission-granted',
      sourceName: 'The MoSaFa কমিউনিটি লেখক মঞ্চ',
      licenseName: 'ক্রিয়েটিভ কমন্স (CC BY-NC 4.0)',
      permissionNote: 'The MoSaFa প্ল্যাটফর্মে পাঠকের জন্য স্বরচিত উন্মুক্ত রচনা।',
      publicationYear: new Date().getFullYear(),
      authorBio: `${author} — গল্পের ঘরের একজন সৃষ্টিশীল সাহিত্য অনুরাগী লেখক।`,
      estimatedReadingMinutes: estimatedReadingTime,
      tags: [categoryName, author.trim(), 'স্বরচিত গল্প', 'গল্পের ঘর'],
      featured: true,
      editorialPick: false,
      publicationStatus: 'published',
      chapters: formattedChapters,
    };

    onSave(newCustomStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {editingStory ? 'গল্প সম্পাদনা করুন' : '✍️ নিজের গল্প লিখুন ও প্রকাশ করুন'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                আপনার মনের গল্পটি ডিজিটাল বই আকারে সংরক্ষণ ও সবার সাথে শেয়ার করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-5 flex-1 pr-1">
          {/* Row 1: Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                গল্পের শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: কুয়াশাচ্ছন্ন শীতের এক রাত..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                লেখকের নাম *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="আপনার নাম বা ছদ্মনাম"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
            </div>
          </div>

          {/* Row 2: Category & Short Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                গল্পের বিভাগ নির্বাচন করুন *
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer transition"
              >
                {STORY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                সংক্ষিপ্ত সারমর্ম / বিবরণ
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="গল্পের মূল ভাব বা ২ লাইনের আকর্ষণীয় সারাংশ..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
            </div>
          </div>

          {/* Row 3: Cover Styling & Icon */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              বইয়ের কভার থিম ও আইকন নির্বাচন:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">কালার:</span>
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.value}
                  onClick={() => setCoverGradient(preset.value)}
                  className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${preset.value} cursor-pointer transition ${
                    coverGradient === preset.value
                      ? 'ring-3 ring-rose-500 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={preset.name}
                />
              ))}

              <span className="text-[11px] font-semibold text-slate-500 ml-3">আইকন:</span>
              {ICON_PRESETS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setCoverIcon(icon)}
                  className={`w-7 h-7 rounded-xl border flex items-center justify-center text-sm cursor-pointer transition ${
                    coverIcon === icon
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm scale-110'
                      : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Story Chapters & Content Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>গল্পের অধ্যায় ও মূল লেখা</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  মোট শব্দ: {totalWords} • আনুমানিক পড়ার সময়: {estimatedReadingTime} মিনিট
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddChapter}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন অধ্যায় যোগ</span>
              </button>
            </div>

            {chapters.map((ch, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={ch.title}
                    onChange={(e) => handleChapterChange(idx, 'title', e.target.value)}
                    placeholder={`অধ্যায় ${idx + 1}-এর শিরোনাম...`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-bold bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChapter(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="অধ্যায় মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <textarea
                  required
                  rows={6}
                  value={ch.content}
                  onChange={(e) => handleChapterChange(idx, 'content', e.target.value)}
                  placeholder={`এই অধ্যায়ের সম্পূর্ণ বিস্তারিত লেখা এখানে লিখুন...\n(প্রতিটি অনুচ্ছেদ আলাদা করতে Enter চেপে নতুন লাইন শুরু করুন। বড় ও সমৃদ্ধ গল্প লিখুন যেন মানুষ সময় নিয়ে পড়ে)`}
                  className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
                />
              </div>
            ))}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-rose-200 dark:shadow-none transition cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingStory ? 'আপডেট সংরক্ষণ করুন' : 'গল্পটি প্রকাশ করুন 🚀'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
