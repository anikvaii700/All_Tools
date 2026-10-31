import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Save,
  MessageSquare,
  Clock,
  Award,
} from 'lucide-react';
import { BusinessProject, DailyMentorTask } from '../../types/entrepreneur';

interface DailyMentorProps {
  project: BusinessProject;
  onUpdateProject: (updater: (prev: BusinessProject) => BusinessProject) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const DAILY_WISDOM_QUOTES = [
  {
    quote: 'ব্যবসা শুরু করতে কোটি টাকার দরকার হয় না, দরকার হয় ১ জন সন্তুষ্ট কাস্টমার এবং তার মুখে মুখে পাওয়া প্রশংসা।',
    author: 'মোসাফা উদ্যোক্তা গাইড',
  },
  {
    quote: 'পারফেক্ট সময়ের অপেক্ষায় বসে থাকবেন না। অপূর্ণ আইডিয়া নিয়ে মাঠে নেমে শুরু করাই বড় পারফেকশন।',
    author: 'উদ্যোক্তা নীতিকথা',
  },
  {
    quote: 'বিক্রির আগে বিশ্বাস তৈরি করুন। কাস্টমারকে নিঃস্বার্থভাবে সাহায্য করুন, বিক্রি আপনা-আপনি হবে।',
    author: 'বিজনেস মেন্টর',
  },
];

export const DailyMentor: React.FC<DailyMentorProps> = ({
  project,
  onUpdateProject,
  onShowToast,
}) => {
  const [tasks, setTasks] = useState<DailyMentorTask[]>(project.dailyTasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [journalNote, setJournalNote] = useState('');

  // Daily Habit Checkboxes (stored in local state / today's session)
  const todayDate = new Date().toISOString().split('T')[0];
  const [habitOutreach, setHabitOutreach] = useState(false);
  const [habitFinance, setHabitFinance] = useState(false);
  const [habitSupport, setHabitSupport] = useState(false);

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.isCompleted;
        if (nextState) {
          onShowToast(`কাজটি সম্পন্ন হয়েছে! সাবাশ! 🎯`, '⭐');
        }
        return {
          ...t,
          isCompleted: nextState,
          completionDate: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    setTasks(updated);
    onUpdateProject((prev) => ({
      ...prev,
      dailyTasks: updated,
      updatedAt: new Date().toISOString(),
    }));
  };

  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: DailyMentorTask = {
      id: `task-${Date.now()}`,
      dayNumber: tasks.length + 1,
      category: 'outreach',
      title: newTaskTitle.trim(),
      banglaTitle: newTaskTitle.trim(),
      description: 'ব্যক্তিগতভাবে যুক্ত করা দৈনন্দিন করণীয়।',
      estimatedMinutes: 20,
      isCompleted: false,
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    onUpdateProject((prev) => ({
      ...prev,
      dailyTasks: updated,
      updatedAt: new Date().toISOString(),
    }));
    setNewTaskTitle('');
    onShowToast('নতুন করণীয় কাজ যুক্ত হয়েছে! 📝', '✅');
  };

  const removeTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    onUpdateProject((prev) => ({
      ...prev,
      dailyTasks: updated,
      updatedAt: new Date().toISOString(),
    }));
    onShowToast('কাজ মুছে ফেলা হয়েছে।', '🗑️');
  };

  const handleSaveJournal = () => {
    if (!journalNote.trim()) return;
    const newEntry = {
      id: `note-${Date.now()}`,
      date: todayDate,
      note: journalNote.trim(),
    };

    onUpdateProject((prev) => ({
      ...prev,
      notesAndJournal: [newEntry, ...(prev.notesAndJournal || [])],
      updatedAt: new Date().toISOString(),
    }));

    setJournalNote('');
    onShowToast('আজকের ডায়রি ও আত্মপর্যালোচনা সেভ হয়েছে! 📖', '✨');
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const quote = DAILY_WISDOM_QUOTES[Math.floor(Math.random() * DAILY_WISDOM_QUOTES.length)];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>মডিউল ১২: দৈনিক উদ্যোক্তা মেন্টর ও অ্যাকশন ড্যাশবোর্ড</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          আজকের সুনির্দিষ্ট করণীয় ও প্রতিদিনের ব্যবসায়িক শৃঙ্খলা
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl">
          বড় স্বপ্ন দেখার চেয়ে ছোট পদক্ষেপে কাজ শেষ করা জরুরি। প্রতিদিনের ৩টি কাজ শেষ করুন এবং ব্যবসায়িক অগ্রগতি পর্যবেক্ষণ করুন।
        </p>

        {/* Motivational Quote */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-rose-50 rounded-2xl border border-amber-200 text-xs text-slate-800 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="italic font-medium">"{quote.quote}"</p>
            <span className="text-[10px] text-slate-500 block mt-1">— {quote.author}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Checklist (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>আজকের কর্মতালিকা ({completedCount}/{tasks.length} সম্পন্ন)</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">তারিখ: {todayDate}</span>
          </div>

          {/* Add task bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNewTask()}
              placeholder="নতুন কোনো করণীয় যোগ করুন..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={addNewTask}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যোগ করুন</span>
            </button>
          </div>

          {/* Task list */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                  task.isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold block ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.banglaTitle || task.title}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{task.description}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      ⏱️ আনুমানিক সময়: {task.estimatedMinutes} মিনিট
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="text-slate-300 hover:text-rose-500 transition p-1 shrink-0"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Habits & Journal (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Daily 3 Non-Negotiable Habits */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>দৈনিক ৩টি সোনালী নিয়ম (Daily Habits):</span>
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={habitOutreach}
                  onChange={(e) => setHabitOutreach(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                />
                <span className={habitOutreach ? 'line-through text-slate-400' : 'text-slate-800'}>
                  ৫ জন নতুন ব্যক্তির সাথে কথা বলা / স্যাম্পল দেখানো
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={habitFinance}
                  onChange={(e) => setHabitFinance(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                />
                <span className={habitFinance ? 'line-through text-slate-400' : 'text-slate-800'}>
                  দৈনিক আয়-ব্যয়ের হিসাব ও ক্যাশ ব্যালেন্স আপডেট করা
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={habitSupport}
                  onChange={(e) => setHabitSupport(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                />
                <span className={habitSupport ? 'line-through text-slate-400' : 'text-slate-800'}>
                  কাস্টমারের সব মেসেজ ও মন্তব্যের দ্রুত আন্তরিক উত্তর দেওয়া
                </span>
              </label>
            </div>
          </div>

          {/* Daily Reflection Journal */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>আজকের আত্মপর্যালোচনা ও শেখা বিষয় (Journal):</span>
            </h4>

            <textarea
              rows={3}
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              placeholder="আজ সারাদিনে ব্যবসা নিয়ে আপনার সবচেয়ে বড় অভিজ্ঞতা বা শিক্ষা কী ছিল? সংক্ষেপে লিখুন..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />

            <button
              type="button"
              onClick={handleSaveJournal}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ডায়রিতে সেভ করুন</span>
            </button>

            {/* Previous entries */}
            {project.notesAndJournal && project.notesAndJournal.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2 max-h-40 overflow-y-auto">
                <span className="text-[10px] text-slate-400 font-bold block">পূর্ববর্তী ডায়রি নোট:</span>
                {project.notesAndJournal.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700">
                    <span className="text-[9px] text-slate-400 font-mono block">{item.date}</span>
                    <p className="mt-0.5">{item.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
