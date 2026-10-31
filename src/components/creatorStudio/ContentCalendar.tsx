import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Tag,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Youtube,
  Globe,
  Video,
  Check,
} from 'lucide-react';
import { CalendarTask, CreatorPlatform } from '../../types/creatorStudio';
import { CreatorStorage } from '../../services/creatorStorage';

interface ContentCalendarProps {
  onShowToast?: (msg: string, icon?: string) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({ onShowToast }) => {
  const [tasks, setTasks] = useState<CalendarTask[]>(() => CreatorStorage.getCalendarTasks());
  const [activeView, setActiveView] = useState<'7days' | '30days' | 'roadmap' | 'old_updates'>('30days');
  const [platformFilter, setPlatformFilter] = useState<'all' | CreatorPlatform>('all');

  // New task form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPlatform, setTaskPlatform] = useState<CreatorPlatform>('youtube');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskStatus, setTaskStatus] = useState<CalendarTask['status']>('scheduled');
  const [taskNotes, setTaskNotes] = useState('');
  const [isOldContent, setIsOldContent] = useState(false);

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: CalendarTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      platform: taskPlatform,
      date: taskDate,
      status: taskStatus,
      notes: taskNotes,
      isOldContentUpdate: isOldContent,
      tags: [taskPlatform],
    };

    CreatorStorage.addCalendarTask(newTask);
    setTasks(CreatorStorage.getCalendarTasks());
    setIsAddModalOpen(false);
    setTaskTitle('');
    setTaskNotes('');
    if (onShowToast) {
      onShowToast('ক্যালেন্ডারে নতুন টাস্ক যুক্ত হয়েছে!', '📅');
    }
  };

  const handleToggleStatus = (task: CalendarTask) => {
    const nextStatus: CalendarTask['status'] =
      task.status === 'published' ? 'scheduled' : 'published';
    const updated = { ...task, status: nextStatus };
    CreatorStorage.updateCalendarTask(updated);
    setTasks(CreatorStorage.getCalendarTasks());
    if (onShowToast) {
      onShowToast(
        nextStatus === 'published' ? 'টাস্ক সম্পন্ন হয়েছে! 🎉' : 'স্ট্যাটাস আপডেট হয়েছে',
        '✅'
      );
    }
  };

  const handleDeleteTask = (id: string) => {
    CreatorStorage.deleteCalendarTask(id);
    setTasks(CreatorStorage.getCalendarTasks());
    if (onShowToast) {
      onShowToast('টাস্ক মুছে ফেলা হয়েছে', '🗑️');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeView === 'old_updates') return t.isOldContentUpdate;
    if (platformFilter !== 'all') return t.platform === platformFilter;
    return true;
  });

  const getStatusBadge = (status: CalendarTask['status']) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">পাবলিশড ✓</span>;
      case 'scheduled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">নির্ধারিত (Scheduled)</span>;
      case 'in_production':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">প্রোডাকশনে</span>;
      case 'draft':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">ড্রাফট</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">আইডিয়া</span>;
    }
  };

  const getPlatformIcon = (p: CreatorPlatform) => {
    switch (p) {
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5 text-red-500" />;
      case 'blog':
        return <Globe className="w-3.5 h-3.5 text-emerald-600" />;
      case 'facebook':
        return <Video className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                কনটেন্ট ক্যালেন্ডার ও শিডিউলার 📅
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                ৭ দিন, ৩০ দিন ও ৯০ দিনের গ্রোথ শিডিউল, টাস্ক ট্র্যাকিং ও কন্টেন্ট আপডেট চেকলিস্ট
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শিডিউল যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveView('7days')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeView === '7days' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ৭ দিনের স্প্রিন্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveView('30days')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeView === '30days' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ৩০ দিনের ক্যালেন্ডার
          </button>
          <button
            type="button"
            onClick={() => setActiveView('roadmap')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeView === 'roadmap' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ৬০-৯০ দিনের রোডম্যাপ
          </button>
          <button
            type="button"
            onClick={() => setActiveView('old_updates')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
              activeView === 'old_updates' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>পুরাতন কন্টেন্ট রিফ্রেশ</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">ফিল্টার:</span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-hidden"
          >
            <option value="all">সকল প্ল্যাটফর্ম</option>
            <option value="youtube">ইউটিউব</option>
            <option value="blog">ব্লগ</option>
            <option value="facebook">ফেসবুক</option>
          </select>
        </div>
      </div>

      {/* Main Roadmap & Calendar Tasks Display */}
      {activeView === 'roadmap' ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">
              🚀 ৯০ দিনের ক্রিয়েটর সাকসেস মাইলস্টোন
            </h3>
            <p className="text-xs text-slate-500">
              ইউটিউব চ্যানেল বা ব্লগের দীর্ঘমেয়াদী সফলতার জন্য প্রমাণিত গ্রোথ ফ্রেমওয়ার্ক
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                মাস ১: ভিত গড়া (Foundation)
              </span>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                <li>প্রথম ৫-১০টি মূল ভিডিও/ব্লগ পোস্ট পাবলিশ</li>
                <li>থাম্বনেইল ও ব্র্যান্ড স্টাইল গাইডলাইন চূড়ান্ত করা</li>
                <li>নিয়মিত আপলোড রুটিন তৈরি (সপ্তাহে ২-৩টি)</li>
                <li>প্রথম ১০০ সাবস্ক্রাইবার বা ভিজিটর টার্গেট</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
              <span className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs">
                মাস ২: গতি বৃদ্ধি (Momentum)
              </span>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                <li>শর্টস ও রিলসের মাধ্যমে অর্গানিক রিচ দ্বিগুণ করা</li>
                <li>অডিয়েন্স কমেন্ট বিশ্লেষণ ও চাহিদা অনুযায়ী টপিক নির্বাচন</li>
                <li>এসইও অপ্টিমাইজড মেটা ট্যাগ ও কিওয়ার্ড রিভিশন</li>
                <li>প্রথম ৫০০-১০০০ সাবস্ক্রাইবার ও নিয়মিত এনগেজমেন্ট</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                মাস ৩: স্কেলিং ও মনিটাইজেশন
              </span>
              <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
                <li>গুগল অ্যাডসেন্স আবেদন ও পলিসি রিভিউ</li>
                <li>অ্যাফিলিয়েট প্রোডাক্ট রিকমেন্ডেশন শুরু</li>
                <li>সফল কন্টেন্টের রি-পারপাসিং (ব্লগ থেকে রিলস ও কারোসেল)</li>
                <li>স্থায়ী ও প্যাসিভ আয়ের কাঠামো প্রস্তুত</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900">
              নির্ধারিত টাস্ক তালিকা ({filteredTasks.length}টি)
            </span>
            <span className="text-xs text-slate-400">ক্লিক করে সম্পন্ন মার্ক করুন</span>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'published';
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition cursor-pointer ${
                        isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getPlatformIcon(task.platform)}
                        <span className={`text-xs sm:text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        {task.isOldContentUpdate && (
                          <span className="px-2 py-0.2 rounded-md text-[9px] font-bold bg-rose-100 text-rose-700">
                            রিফ্রেশ প্রয়োজন
                          </span>
                        )}
                      </div>
                      {task.notes && (
                        <p className="text-xs text-slate-500 line-clamp-1">{task.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs text-slate-400 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {task.date}
                    </span>
                    {getStatusBadge(task.status)}
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                কোনো নির্ধারিত কন্টেন্ট বা শিডিউল নেই। নতুন শিডিউল যোগ করুন বাটনে ক্লিক করুন।
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTask}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">নতুন কন্টেন্ট শিডিউল</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কন্টেন্ট শিরোনাম (Title)
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="যেমন: ওয়ার্ডপ্রেস প্লাগইন সেটআপ ভিডিও..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্ল্যাটফর্ম
                </label>
                <select
                  value={taskPlatform}
                  onChange={(e) => setTaskPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="youtube">ইউটিউব</option>
                  <option value="blog">ব্লগ</option>
                  <option value="facebook">ফেসবুক</option>
                  <option value="multi">মাল্টি-প্ল্যাটফর্ম</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  তারিখ
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                স্ট্যাটাস
              </label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="idea">আইডিয়া পর্যায়ে</option>
                <option value="draft">ড্রাফট তৈরি</option>
                <option value="in_production">প্রোডাকশনে (শুটিং/এডিটিং)</option>
                <option value="scheduled">নির্ধারিত (Scheduled)</option>
                <option value="published">পাবলিশড (Published)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                নোট বা করণীয় বিবরণী
              </label>
              <textarea
                rows={2}
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="যেমন: থাম্বনেইল ডিজাইন বাকি, ডেসক্রিপশনে লিংক দিতে হবে..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="oldContent"
                checked={isOldContent}
                onChange={(e) => setIsOldContent(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <label htmlFor="oldContent" className="text-xs text-slate-700 font-bold">
                এটি কি কোনো পূর্ববর্তী কন্টেন্টের আপডেট/রিফ্রেশ?
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                যুক্ত করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
