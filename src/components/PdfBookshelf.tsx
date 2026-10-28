import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  FileUp,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Download,
  X,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  Check,
  AlertCircle,
  Eye,
  Edit3,
} from 'lucide-react';
import {
  PdfBookItem,
  DEFAULT_PDF_BOOKS,
  savePdfBlob,
  getPdfBlob,
  deletePdfBlob,
} from '../utils/pdfStorage';
import { STORY_CATEGORIES } from '../data/golpoGhorData';

interface PdfBookshelfProps {
  onShowToast: (message: string, icon?: string) => void;
}

const PDF_GRADIENTS = [
  'from-amber-700 via-orange-900 to-amber-950',
  'from-rose-600 via-pink-700 to-rose-950',
  'from-blue-700 via-indigo-900 to-slate-950',
  'from-emerald-700 via-teal-800 to-slate-900',
  'from-purple-800 via-indigo-950 to-black',
];

export const PdfBookshelf: React.FC<PdfBookshelfProps> = ({ onShowToast }) => {
  // Books list state
  const [pdfBooks, setPdfBooks] = useState<PdfBookItem[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_pdf_books');
      return saved ? JSON.parse(saved) : DEFAULT_PDF_BOOKS;
    } catch {
      return DEFAULT_PDF_BOOKS;
    }
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add PDF Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<'local-file' | 'web-url'>('local-file');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('বাংলা ক্লাসিক সাহিত্য');
  const [webUrl, setWebUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Reading PDF Viewer Modal
  const [activeBook, setActiveBook] = useState<PdfBookItem | null>(null);
  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);

  // Personal Notes per PDF Book
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('mosafa_pdf_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerModalRef = useRef<HTMLDivElement | null>(null);

  // Sync pdfBooks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_pdf_books', JSON.stringify(pdfBooks));
    } catch {}
  }, [pdfBooks]);

  // Sync notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_pdf_notes', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // Clean up object URL when closing reader
  useEffect(() => {
    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [activeBlobUrl]);

  // Open PDF Reader
  const handleOpenPdf = async (book: PdfBookItem) => {
    setActiveBook(book);
    setIsNotesOpen(false);

    if (book.sourceType === 'local-file') {
      setIsLoadingBlob(true);
      try {
        const blob = await getPdfBlob(book.id);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setActiveBlobUrl(url);
        } else {
          onShowToast('লোকাল পিডিএফ ফাইলটি খুঁজে পাওয়া যায়নি!', '⚠️');
          setActiveBlobUrl(null);
        }
      } catch (err) {
        onShowToast('পিডিএফ ফাইল লোড করতে সমস্যা হয়েছে।', '⚠️');
      } finally {
        setIsLoadingBlob(false);
      }
    } else {
      setActiveBlobUrl(book.webUrl || null);
    }
  };

  // Close PDF Reader
  const handleClosePdf = () => {
    if (activeBlobUrl && activeBook?.sourceType === 'local-file') {
      URL.revokeObjectURL(activeBlobUrl);
    }
    setActiveBook(null);
    setActiveBlobUrl(null);
    setIsFullscreen(false);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        onShowToast('শুধুমাত্র PDF ফাইল আপলোড করা যাবে!', '⚠️');
        return;
      }
      setSelectedFile(file);
      // Auto-populate title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  // Save new PDF
  const handleAddPdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      onShowToast('বইয়ের শিরোনাম লিখুন!', '⚠️');
      return;
    }

    if (sourceType === 'local-file' && !selectedFile) {
      onShowToast('অনুগ্রহ করে একটি PDF ফাইল নির্বাচন করুন!', '⚠️');
      return;
    }

    if (sourceType === 'web-url' && !webUrl.trim()) {
      onShowToast('অনুগ্রহ করে পিডিএফ ওয়েব লিংক দিন!', '⚠️');
      return;
    }

    setIsSubmitting(true);
    const newId = `pdf-user-${Date.now()}`;
    const randomGradient = PDF_GRADIENTS[Math.floor(Math.random() * PDF_GRADIENTS.length)];

    try {
      if (sourceType === 'local-file' && selectedFile) {
        // Store blob in IndexedDB
        await savePdfBlob(newId, selectedFile);
      }

      const newBook: PdfBookItem = {
        id: newId,
        title: title.trim(),
        author: author.trim() || 'অজ্ঞাত লেখক',
        category,
        sourceType,
        webUrl: sourceType === 'web-url' ? webUrl.trim() : undefined,
        fileName: selectedFile?.name,
        fileSizeBytes: selectedFile?.size,
        dateAdded: Date.now(),
        coverGradient: randomGradient,
        coverIcon: '📑',
      };

      setPdfBooks((prev) => [newBook, ...prev]);
      onShowToast('পিডিএফ বইটি সফলভাবে আপনার বইঘরে যোগ করা হয়েছে! 📚', '✅');

      // Reset and close
      setIsAddModalOpen(false);
      setTitle('');
      setAuthor('');
      setWebUrl('');
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      onShowToast('পিডিএফ সংরক্ষণ করতে ব্যর্থ হয়েছে।', '⚠️');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete PDF
  const handleDeletePdf = async (bookId: string, title: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${title}" বইটি আপনার শেলফ থেকে মুছতে চান?`)) {
      await deletePdfBlob(bookId);
      setPdfBooks((prev) => prev.filter((b) => b.id !== bookId));
      onShowToast('পিডিএফ বইটি মুছে ফেলা হয়েছে।', '🗑️');
    }
  };

  // Filtered Books
  const filteredBooks = pdfBooks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Bookshelf Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-bold backdrop-blur-xs">
              <span>📑 ডিজিটাল পিডিএফ বইঘর ও ই-বুক রিডার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              আপনার ব্যক্তিগত পিডিএফ লাইব্রেরি
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ডিভাইস থেকে যেকোনো পিডিএফ বই যুক্ত করে ব্রাউজারে সরাসরি পড়ুন, সংরক্ষণ করুন অথবা ধ্রুপদী বাংলা বইয়ের পিডিএফ সংগ্রহ উপভোগ করুন।
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>নতুন পিডিএফ বই যোগ করুন</span>
          </button>
        </div>
      </section>

      {/* Search and Category Filter Toolbar */}
      <section className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পিডিএফ বই বা লেখকের নাম দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0">বিভাগ:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">সকল বিভাগ ({pdfBooks.length})</option>
            {STORY_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Books Grid */}
      <section>
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <span className="text-5xl block">📑</span>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              কোনো পিডিএফ বই পাওয়া যায়নি!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনার পছন্দের কোনো বইয়ের পিডিএফ ফাইল আপলোড করতে উপরের বাটনে ক্লিক করুন।
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer hover:bg-slate-800"
            >
              পিডিএফ যোগ করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => {
              const isDefault = book.id.startsWith('pdf-default-');
              return (
                <div
                  key={book.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Card Top: Cover & Tags */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-16 h-22 rounded-2xl bg-gradient-to-tr ${
                          book.coverGradient || 'from-indigo-600 to-slate-900'
                        } text-white flex flex-col items-center justify-center shadow-md shrink-0 p-2 text-center group-hover:scale-105 transition`}
                      >
                        <span className="text-2xl mb-1">{book.coverIcon || '📑'}</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-80">
                          PDF
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60">
                            {book.category}
                          </span>
                          {book.fileSizeBytes && (
                            <span className="text-[10px] font-bold text-slate-400">
                              {(book.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 transition truncate">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          লেখক: {book.author}
                        </p>
                      </div>
                    </div>

                    {book.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenPdf(book)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>পিডিএফ পড়ুন</span>
                    </button>

                    {!isDefault && (
                      <button
                        onClick={() => handleDeletePdf(book.id, book.title)}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="পিডিএফ মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add PDF Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <FileUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  নতুন বইয়ের পিডিএফ যোগ করুন
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSourceType('local-file')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sourceType === 'local-file'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>ডিভাইস থেকে ফাইল</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('web-url')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  sourceType === 'web-url'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>অনলাইন লিংক / URL</span>
              </button>
            </div>

            <form onSubmit={handleAddPdfSubmit} className="space-y-4 text-xs">
              {sourceType === 'local-file' ? (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    পিডিএফ ফাইল নির্বাচন করুন *
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="w-full p-2.5 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 text-slate-700 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      ✓ নির্বাচিত: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    পিডিএফ ওয়েব লিংক (URL) *
                  </label>
                  <input
                    type="url"
                    required
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="https://example.com/books/mybook.pdf"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  বইয়ের শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: শ্রীকান্ত (প্রথম খণ্ড)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    লেখকের নাম
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="যেমন: শরৎচন্দ্র চট্টোপাধ্যায়"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    বিভাগ
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STORY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'শেলফে যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Embedded PDF Reader Modal */}
      {activeBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            ref={readerModalRef}
            className={`bg-white dark:bg-slate-900 w-full rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden transition-all duration-300 ${
              isFullscreen ? 'fixed inset-0 rounded-none z-50 h-screen' : 'max-w-5xl h-[90vh]'
            }`}
          >
            {/* Reader Toolbar */}
            <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold truncate">
                    {activeBook.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {activeBook.author} • {activeBook.category}
                  </p>
                </div>
              </div>

              {/* Toolbar Buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Notes Toggle */}
                <button
                  onClick={() => setIsNotesOpen(!isNotesOpen)}
                  className={`p-2 rounded-xl border transition cursor-pointer text-xs flex items-center gap-1 ${
                    isNotesOpen
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="পাঠকের নোটস"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">নোটস</span>
                </button>

                {/* Open in New Window */}
                {activeBlobUrl && (
                  <a
                    href={activeBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
                    title="নতুন ট্যাবে খুলুন"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* Download PDF */}
                {activeBlobUrl && (
                  <a
                    href={activeBlobUrl}
                    download={`${activeBook.title}.pdf`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
                    title="পিডিএফ ডাউনলোড"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                  title={isFullscreen ? 'সাধারণ ভিউ' : 'ফুলস্ক্রিন ভিউ'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={handleClosePdf}
                  className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition cursor-pointer ml-1"
                  title="রিডার বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reader Content Body + Notes Drawer */}
            <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden bg-slate-100 dark:bg-slate-950">
              {/* Embedded PDF Viewer */}
              <div className="flex-1 h-full w-full relative">
                {isLoadingBlob ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-slate-500">পিডিএফ লোড হচ্ছে...</p>
                  </div>
                ) : activeBlobUrl ? (
                  <iframe
                    src={`${activeBlobUrl}#toolbar=1&navpanes=1`}
                    className="w-full h-full border-0"
                    title={activeBook.title}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                    <AlertCircle className="w-12 h-12 text-rose-500" />
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      পিডিএফটি প্রিভিউ করা সম্ভব হয়নি!
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      ব্রাউজারের নিরাপত্তা পলিসির কারণে এক্সটার্নাল লিংক সরাসরি আইফ্রেমে ব্লক হতে পারে। নিচে ক্লিক করে নতুন ট্যাবে খুলুন।
                    </p>
                    {activeBook.webUrl && (
                      <a
                        href={activeBook.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                      >
                        মূল ওয়েবসাইটে পিডিএফ পড়ুন ↗
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Personal Notes Drawer */}
              {isNotesOpen && (
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shrink-0 h-64 md:h-full animate-in slide-in-from-right duration-200">
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>পাঠকের নিজস্ব নোটস</span>
                      </span>
                      <button
                        onClick={() => setIsNotesOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        বন্ধ
                      </button>
                    </div>
                    <textarea
                      value={notes[activeBook.id] || ''}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [activeBook.id]: e.target.value }))
                      }
                      placeholder="বইটি পড়ার সময় আপনার গুরুত্বপূর্ণ উদ্ধৃতি বা ব্যক্তিগত মন্তব্য এখানে লিখে রাখুন..."
                      className="w-full flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-sans"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-right">
                    ✓ স্বয়ংক্রিয়ভাবে সংরক্ষিত
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
