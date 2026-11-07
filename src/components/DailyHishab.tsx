import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Wallet,
  CheckSquare,
  FileText,
  Target,
  HandCoins,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Download,
  Copy,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Pin,
  Sparkles,
  Cloud,
  CloudCheck,
  RefreshCw,
  LogIn,
  UserCheck,
  Filter,
  FileSpreadsheet,
  PieChart,
  Tag,
  Share2,
  ArrowRight,
  Flame,
  Droplets,
  BookOpen,
  Moon,
  Footprints,
  Edit2,
  ChevronRight,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface DailyHishabProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
  onOpenAuthModal?: () => void;
}

export type MainTab = 'hishab' | 'todo' | 'notes' | 'habits' | 'debts';

// ----------------- Data Interfaces -----------------
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account: 'cash' | 'bkash' | 'nagad' | 'bank' | 'rocket';
  date: string;
  note?: string;
}

export interface TodoTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  category: 'personal' | 'work' | 'study' | 'shopping' | 'family' | 'health' | 'other';
  dueDate: string;
  dueTime?: string;
  isCompleted: boolean;
  completedAt?: string;
  note?: string;
  isPinned?: boolean;
}

export interface DailyNote {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'memo' | 'reminder' | 'phone' | 'diary' | 'work';
  date: string;
  isPinned?: boolean;
}

export interface DebtRecord {
  id: string;
  type: 'give' | 'take'; // give: আমি পাবো (দেনা), take: আমি দেবো (পাওনা)
  personName: string;
  personPhone?: string;
  amount: number;
  date: string;
  dueDate?: string;
  isSettled: boolean;
  note?: string;
}

export interface HabitDefinition {
  id: string;
  title: string;
  iconName: 'water' | 'prayer' | 'exercise' | 'read' | 'sleep' | 'hishab';
  target: string;
}

// ----------------- Static Data & Maps -----------------
const DEFAULT_HABITS: HabitDefinition[] = [
  { id: 'water', title: '৮ গ্লাস বিশুদ্ধ পানি পান', iconName: 'water', target: 'প্রতিদিন ২-৩ লিটার' },
  { id: 'prayer', title: '৫ ওয়াক্ত নামাজ / প্রার্থনা', iconName: 'prayer', target: 'আত্মিক প্রশান্তি' },
  { id: 'exercise', title: '৩০ মিনিট হাঁটা বা ব্যায়াম', iconName: 'exercise', target: 'সুস্বাস্থ্য ও ফিটনেস' },
  { id: 'read', title: 'বই / কোরআন / জ্ঞানচর্চা', iconName: 'read', target: 'কমপক্ষে ১৫-২০ মিনিট' },
  { id: 'hishab', title: 'দৈনিক আয়-ব্যয় এন্ট্রি দেওয়া', iconName: 'hishab', target: 'আর্থিক শৃঙ্খলা' },
  { id: 'sleep', title: 'সময়মতো ঘুমাতে যাওয়া', iconName: 'sleep', target: '৭+ ঘণ্টা নিরবচ্ছিন্ন ঘুম' },
];

const CATEGORY_ICONS: Record<string, string> = {
  'বেতন (Salary)': '💼',
  'ব্যবসা (Business)': '🏪',
  'ফ্রিল্যান্সিং (Freelancing)': '💻',
  'উপহার / বোনাস (Gift)': '🎁',
  'খাদ্য ও বাজার (Food)': '🍲',
  'যাতায়াত (Transport)': '🚗',
  'বিল ও ইউটিলিটি (Bills)': '💡',
  'কেনাকাটা (Shopping)': '🛍️',
  'চিকিৎসা ও ওষুধ (Health)': '💊',
  'শিক্ষা ও বই (Education)': '📚',
  'বিনোদন ও আড্ডা (Fun)': '☕',
  'বাসা ভাড়া (Rent)': '🏠',
  'অন্যান্য (Other)': '📝',
};

const ACCOUNT_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  cash: { label: 'নগদ ক্যাশ (Cash)', icon: <Banknote className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  bkash: { label: 'বিকাশ (bKash)', icon: <Smartphone className="w-3.5 h-3.5" />, color: 'bg-pink-50 text-pink-700 border-pink-200' },
  nagad: { label: 'নগদ (Nagad)', icon: <Smartphone className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  bank: { label: 'ব্যাংক একাউন্ট (Bank)', icon: <Building className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  rocket: { label: 'রকেট (Rocket)', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const TASK_CATEGORIES: Record<string, { label: string; color: string }> = {
  personal: { label: 'ব্যক্তিগত', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  work: { label: 'কাজ / অফিস', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  study: { label: 'পড়াশোনা', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  shopping: { label: 'বাজার / কেনাকাটা', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  family: { label: 'পারিবারিক', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  health: { label: 'স্বাস্থ্য', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  other: { label: 'অন্যান্য', color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const NOTE_CATEGORIES: Record<string, { label: string; icon: string }> = {
  general: { label: 'সাধারণ নোট', icon: '📝' },
  memo: { label: 'জরুরি মেমো', icon: '📌' },
  reminder: { label: 'রিমাইন্ডার / স্মরণীয়', icon: '⏰' },
  phone: { label: 'জরুরি নাম্বার ও ঠিকানা', icon: '📞' },
  diary: { label: 'দৈনিক ডায়েরি ও ভাবনা', icon: '📖' },
  work: { label: 'কাজের তথ্য ও হিসাব', icon: '💼' },
};

const toBanglaNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)] || d);
};

export const DailyHishab: React.FC<DailyHishabProps> = ({
  onBackToHub: _onBackToHub,
  onShowToast,
  onOpenAuthModal,
}) => {
  const { user, isLoggedIn, loginWithGoogle } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<MainTab>('hishab');

  // Cloud Sync State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // 1. Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txFilterType, setTxFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [txSearchQuery, setTxSearchQuery] = useState<string>('');

  // 2. To-Do Tasks State
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'high'>('all');
  const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');

  // 3. Daily Notes State
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>('');
  const [noteCategoryFilter, setNoteCategoryFilter] = useState<string>('all');

  // 4. Habits Log State (date string -> habitId -> boolean)
  const [habitsLog, setHabitsLog] = useState<Record<string, Record<string, boolean>>>({});
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedHabitDate, setSelectedHabitDate] = useState<string>(todayDateStr);

  // 5. Debt (দেনা-পাওনা) State
  const [debts, setDebts] = useState<DebtRecord[]>([]);

  // Modals
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState<boolean>(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState<boolean>(false);
  const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState<boolean>(false);

  // Form states for Transactions
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('খাদ্য ও বাজার (Food)');
  const [txAccount, setTxAccount] = useState<'cash' | 'bkash' | 'nagad' | 'bank' | 'rocket'>('cash');
  const [txDate, setTxDate] = useState<string>(todayDateStr);
  const [txNote, setTxNote] = useState<string>('');

  // Form states for Tasks
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskCategory, setTaskCategory] = useState<TodoTask['category']>('personal');
  const [taskDueDate, setTaskDueDate] = useState<string>(todayDateStr);
  const [taskDueTime, setTaskDueTime] = useState<string>('');
  const [taskNote, setTaskNote] = useState<string>('');

  // Form states for Notes
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteCategory, setNoteCategory] = useState<DailyNote['category']>('general');
  const [notePinned, setNotePinned] = useState<boolean>(false);

  // Form states for Debts
  const [debtType, setDebtType] = useState<'give' | 'take'>('give');
  const [debtPersonName, setDebtPersonName] = useState<string>('');
  const [debtPersonPhone, setDebtPersonPhone] = useState<string>('');
  const [debtAmount, setDebtAmount] = useState<string>('');
  const [debtDueDate, setDebtDueDate] = useState<string>('');
  const [debtNote, setDebtNote] = useState<string>('');

  const reportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Storage key helpers
  const getLocalStorageKey = (userId?: string | null) => {
    return userId ? `mosafa_daily_manager_${userId}` : 'mosafa_daily_manager_guest_data';
  };

  // ----------------- Initial Load & Cloud Sync Listener -----------------
  useEffect(() => {
    const localKey = getLocalStorageKey(user?.uid);
    try {
      const localData = localStorage.getItem(localKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.habitsLog) setHabitsLog(parsed.habitsLog);
        if (parsed.debts) setDebts(parsed.debts);
      } else if (!user?.uid) {
        // Fallback to legacy hishab data if exists
        const oldHishab = localStorage.getItem('mosafa_daily_hishab_user_data');
        if (oldHishab) {
          const oldTx = JSON.parse(oldHishab);
          if (Array.isArray(oldTx)) {
            setTransactions(oldTx.map((t: any) => ({ ...t, account: t.account || 'cash' })));
          }
        }
      }
    } catch (e) {
      console.warn('Local data load warning:', e);
    }

    // If logged in, attach live Firestore listener
    if (user?.uid) {
      setSyncStatus('syncing');
      const docRef = doc(db, 'users', user.uid, 'dailyManager', 'store');

      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data.transactions)) setTransactions(data.transactions);
            if (Array.isArray(data.tasks)) setTasks(data.tasks);
            if (Array.isArray(data.notes)) setNotes(data.notes);
            if (data.habitsLog && typeof data.habitsLog === 'object') setHabitsLog(data.habitsLog);
            if (Array.isArray(data.debts)) setDebts(data.debts);
            if (data.updatedAt) {
              setLastSyncTime(new Date(data.updatedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }));
            }
            setSyncStatus('synced');
          } else {
            // First time cloud user: if local data exists, sync to cloud immediately
            syncAllToCloud(true);
            setSyncStatus('synced');
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}/dailyManager/store`);
          setSyncStatus('offline');
        }
      );

      return () => unsubscribe();
    } else {
      setSyncStatus('offline');
    }
  }, [user?.uid]);

  // Save changes to localStorage & trigger Firestore debounce save
  const persistChanges = (
    newTransactions = transactions,
    newTasks = tasks,
    newNotes = notes,
    newHabits = habitsLog,
    newDebts = debts
  ) => {
    const payload = {
      transactions: newTransactions,
      tasks: newTasks,
      notes: newNotes,
      habitsLog: newHabits,
      debts: newDebts,
      updatedAt: new Date().toISOString(),
    };

    const localKey = getLocalStorageKey(user?.uid);
    try {
      localStorage.setItem(localKey, JSON.stringify(payload));
    } catch {}

    if (user?.uid) {
      setSyncStatus('syncing');
      const docRef = doc(db, 'users', user.uid, 'dailyManager', 'store');
      setDoc(
        docRef,
        {
          userId: user.uid,
          userDisplayName: user.displayName,
          ...payload,
        },
        { merge: true }
      )
        .then(() => {
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }));
        })
        .catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/dailyManager/store`);
          setSyncStatus('offline');
        });
    }
  };

  const syncAllToCloud = async (isInitial = false) => {
    if (!user?.uid) {
      if (!isInitial) {
        if (onOpenAuthModal) onOpenAuthModal();
        else loginWithGoogle().catch(() => {});
      }
      return;
    }

    try {
      setSyncStatus('syncing');
      const docRef = doc(db, 'users', user.uid, 'dailyManager', 'store');
      await setDoc(
        docRef,
        {
          userId: user.uid,
          userDisplayName: user.displayName,
          transactions,
          tasks,
          notes,
          habitsLog,
          debts,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }));
      if (!isInitial) {
        onShowToast('ক্লাউড একাউন্টে ডেটা সফলভাবে সিঙ্ক হয়েছে! ☁️', '✅');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/dailyManager/store`);
      setSyncStatus('offline');
      if (!isInitial) {
        onShowToast('সিঙ্ক করতে সমস্যা হয়েছে, লোকাল কপি সংরক্ষিত রয়েছে', '⚠️');
      }
    }
  };

  // ----------------- Financial Calculations -----------------
  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  const expenseByCategory: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = txFilterType === 'all' || t.type === txFilterType;
      const matchesQuery =
        !txSearchQuery.trim() ||
        t.category.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
        (t.note && t.note.toLowerCase().includes(txSearchQuery.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [transactions, txFilterType, txSearchQuery]);

  // ----------------- To-Do Tasks Calculations -----------------
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.isCompleted), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.isCompleted), [tasks]);
  const todayTasks = useMemo(() => tasks.filter((t) => t.dueDate === todayDateStr), [tasks, todayDateStr]);
  const completedTodayTasks = useMemo(() => todayTasks.filter((t) => t.isCompleted), [todayTasks]);

  const todayProgressPercent = todayTasks.length > 0 ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) : 0;

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (taskFilter === 'pending') list = list.filter((t) => !t.isCompleted);
    else if (taskFilter === 'completed') list = list.filter((t) => t.isCompleted);
    else if (taskFilter === 'today') list = list.filter((t) => t.dueDate === todayDateStr);
    else if (taskFilter === 'high') list = list.filter((t) => t.priority === 'high' && !t.isCompleted);

    if (taskSearchQuery.trim()) {
      const q = taskSearchQuery.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q)));
    }

    // Sort: Pinned first, then incomplete before completed, then high priority
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;
      const pOrder = { high: 0, medium: 1, low: 2 };
      return pOrder[a.priority] - pOrder[b.priority];
    });
  }, [tasks, taskFilter, taskSearchQuery, todayDateStr]);

  // ----------------- Filtered Notes -----------------
  const filteredNotes = useMemo(() => {
    let list = [...notes];
    if (noteCategoryFilter !== 'all') {
      list = list.filter((n) => n.category === noteCategoryFilter);
    }
    if (noteSearchQuery.trim()) {
      const q = noteSearchQuery.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    return list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [notes, noteCategoryFilter, noteSearchQuery]);

  // ----------------- Habits for Selected Date -----------------
  const habitsForDate = useMemo(() => {
    return habitsLog[selectedHabitDate] || {};
  }, [habitsLog, selectedHabitDate]);

  const completedHabitsCount = useMemo(() => {
    return DEFAULT_HABITS.filter((h) => habitsForDate[h.id]).length;
  }, [habitsForDate]);

  // ----------------- Actions: Transactions -----------------
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(txAmount);
    if (!val || val <= 0) {
      alert('সঠিক টাকার অঙ্ক লিখুন');
      return;
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: txType,
      amount: val,
      category: txCategory,
      account: txAccount,
      date: txDate,
      note: txNote.trim(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    persistChanges(updated, tasks, notes, habitsLog, debts);

    setTxAmount('');
    setTxNote('');
    setIsAddTxModalOpen(false);
    onShowToast(`৳ ${val.toLocaleString('bn-BD')} (${txType === 'income' ? 'আয়' : 'ব্যয়'}) এন্ট্রি সম্পন্ন!`, '✅');
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    persistChanges(updated, tasks, notes, habitsLog, debts);
    onShowToast('হিসাব রেকর্ড মুছে ফেলা হয়েছে', '🗑️');
  };

  // ----------------- Actions: To-Do Tasks -----------------
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      alert('টাস্কের শিরোনাম লিখুন');
      return;
    }

    const newTask: TodoTask = {
      id: `task_${Date.now()}`,
      title: taskTitle.trim(),
      priority: taskPriority,
      category: taskCategory,
      dueDate: taskDueDate || todayDateStr,
      dueTime: taskDueTime || undefined,
      isCompleted: false,
      note: taskNote.trim() || undefined,
      isPinned: false,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    persistChanges(transactions, updated, notes, habitsLog, debts);

    setTaskTitle('');
    setTaskNote('');
    setTaskDueTime('');
    setIsAddTaskModalOpen(false);
    onShowToast('নতুন করণীয় টাস্ক সফলভাবে যোগ হয়েছে! 📋', '🎯');
  };

  const toggleTaskCompletion = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    const willComplete = !target?.isCompleted;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          isCompleted: willComplete,
          completedAt: willComplete ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    setTasks(updated);
    persistChanges(transactions, updated, notes, habitsLog, debts);

    if (willComplete) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      onShowToast('টাস্ক সম্পন্ন হয়েছে! চমৎকার! 🎉', '✨');
    }
  };

  const toggleTaskPin = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, isPinned: !t.isPinned } : t));
    setTasks(updated);
    persistChanges(transactions, updated, notes, habitsLog, debts);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    persistChanges(transactions, updated, notes, habitsLog, debts);
    onShowToast('টাস্ক মুছে ফেলা হয়েছে', '🗑️');
  };

  // ----------------- Actions: Notes -----------------
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) {
      alert('নোটের শিরোনাম বা বিবরণ লিখুন');
      return;
    }

    const newNote: DailyNote = {
      id: `note_${Date.now()}`,
      title: noteTitle.trim() || 'শিরোনামহীন নোট',
      content: noteContent.trim(),
      category: noteCategory,
      date: todayDateStr,
      isPinned: notePinned,
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    persistChanges(transactions, tasks, updated, habitsLog, debts);

    setNoteTitle('');
    setNoteContent('');
    setNotePinned(false);
    setIsAddNoteModalOpen(false);
    onShowToast('দৈনন্দিন নোট ও তথ্য সংরক্ষিত হয়েছে! 📝', '✅');
  };

  const deleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    persistChanges(transactions, tasks, updated, habitsLog, debts);
    onShowToast('নোট মুছে ফেলা হয়েছে', '🗑️');
  };

  const copyNoteContent = async (note: DailyNote) => {
    const text = `${note.title}\n${note.content}\n\n[সংরক্ষিত: The MoSaFa Daily Manager]`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('নোটের লেখা ক্লিপবোর্ডে কপি হয়েছে! 📋', '✅');
    } catch {
      onShowToast('কপি ব্যর্থ হয়েছে', '⚠️');
    }
  };

  // ----------------- Actions: Habits -----------------
  const toggleHabit = (habitId: string) => {
    const currentForDate = habitsLog[selectedHabitDate] || {};
    const updatedForDate = {
      ...currentForDate,
      [habitId]: !currentForDate[habitId],
    };

    const newHabitsLog = {
      ...habitsLog,
      [selectedHabitDate]: updatedForDate,
    };

    setHabitsLog(newHabitsLog);
    persistChanges(transactions, tasks, notes, newHabitsLog, debts);

    if (updatedForDate[habitId]) {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
      });
      onShowToast('অভ্যাস সম্পন্ন হয়েছে! চালিয়ে যান! 🌟', '🎯');
    }
  };

  // ----------------- Actions: Debts (দেনা-পাওনা) -----------------
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(debtAmount);
    if (!debtPersonName.trim() || !val || val <= 0) {
      alert('ব্যক্তির নাম ও সঠিক টাকার অঙ্ক লিখুন');
      return;
    }

    const newDebt: DebtRecord = {
      id: `debt_${Date.now()}`,
      type: debtType,
      personName: debtPersonName.trim(),
      personPhone: debtPersonPhone.trim() || undefined,
      amount: val,
      date: todayDateStr,
      dueDate: debtDueDate || undefined,
      isSettled: false,
      note: debtNote.trim() || undefined,
    };

    const updated = [newDebt, ...debts];
    setDebts(updated);
    persistChanges(transactions, tasks, notes, habitsLog, updated);

    setDebtPersonName('');
    setDebtPersonPhone('');
    setDebtAmount('');
    setDebtDueDate('');
    setDebtNote('');
    setIsAddDebtModalOpen(false);
    onShowToast('দেনা-পাওনা রেকর্ড সফলভাবে যোগ হয়েছে! 🤝', '✅');
  };

  const toggleDebtSettled = (debtId: string) => {
    const updated = debts.map((d) => (d.id === debtId ? { ...d, isSettled: !d.isSettled } : d));
    setDebts(updated);
    persistChanges(transactions, tasks, notes, habitsLog, updated);
    onShowToast('হিসাব সমন্বয় করা হয়েছে! 🤝', '✅');
  };

  const deleteDebt = (debtId: string) => {
    const updated = debts.filter((d) => d.id !== debtId);
    setDebts(updated);
    persistChanges(transactions, tasks, notes, habitsLog, updated);
    onShowToast('রেকর্ড মুছে ফেলা হয়েছে', '🗑️');
  };

  // ----------------- Export Functions -----------------
  const exportHishabToCsv = () => {
    if (transactions.length === 0) return;
    const headers = 'আইডি,ধরণ,পরিমাণ (টাকা),ক্যাটাগরি,অ্যাকাউন্ট,তারিখ,মন্তব্য\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.type === 'income' ? 'আয়' : 'ব্যয়'}","${t.amount}","${t.category}","${
            ACCOUNT_INFO[t.account]?.label || t.account
          }","${t.date}","${t.note || ''}"`
      )
      .join('\n');

    const csvBlob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoSaFa-Daily-Hishab-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('হিসাব বিবরণী (CSV) ডাউনলোড সম্পন্ন! 📊', '✅');
  };

  const downloadSummaryCard = () => {
    const canvas = reportCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 900;
    canvas.width = W;
    canvas.height = H;

    // Dark emerald finance theme
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.5, '#047857');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The MoSaFa ডেইলি ম্যানেজার ও হিসাব বিবরণী', W / 2, 85);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '16px "Hind Siliguri", sans-serif';
    const ownerName = user?.displayName || 'ব্যক্তিগত একাউন্ট';
    ctx.fillText(`ব্যবহারকারী: ${ownerName} • তারিখ: ${new Date().toLocaleDateString('bn-BD')}`, W / 2, 120);

    // Summary 3 Cards
    const drawCard = (x: number, y: number, title: string, amount: number, color: string) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(x, y, 210, 105, 16);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, x + 105, y + 38);

      ctx.fillStyle = color;
      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillText(`৳ ${toBanglaNum(amount.toLocaleString('en-US'))}`, x + 105, y + 78);
    };

    drawCard(60, 160, 'মোট আয় (Income)', totalIncome, '#34d399');
    drawCard(295, 160, 'মোট ব্যয় (Expense)', totalExpense, '#f87171');
    drawCard(530, 160, 'উদ্বৃত্ত ব্যালেন্স', balance, '#38bdf8');

    // To-Do & Task Status
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('📋 আজকের করণীয় ও টাস্ক অগ্রগতি:', 60, 315);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillText(`• মোট টাস্ক: ${toBanglaNum(tasks.length)}টি | বাকি: ${toBanglaNum(pendingTasks.length)}টি | সম্পন্ন: ${toBanglaNum(completedTasks.length)}টি`, 75, 350);

    // Expense Breakdown
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('📊 খাতভিত্তিক ব্যয়ের পরিসংখ্যান:', 60, 410);

    let rowY = 450;
    ctx.font = '15px "Hind Siliguri", sans-serif';
    Object.entries(expenseByCategory).slice(0, 5).forEach(([cat, amt]) => {
      const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`• ${cat}:`, 75, rowY);
      ctx.fillStyle = '#f87171';
      ctx.fillText(`৳ ${toBanglaNum(amt.toLocaleString('en-US'))} (${toBanglaNum(pct)}%)`, 420, rowY);
      rowY += 34;
    });

    // Recent transactions header
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('📝 সাম্প্রতিক লেনদেন:', 60, rowY + 20);
    rowY += 55;

    transactions.slice(0, 3).forEach((t) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px "Hind Siliguri", sans-serif';
      const sign = t.type === 'income' ? '+' : '-';
      ctx.fillText(`${t.date} | ${t.category} (${t.note || 'নোট নেই'})`, 75, rowY);
      ctx.fillStyle = t.type === 'income' ? '#34d399' : '#f87171';
      ctx.fillText(`${sign}৳ ${toBanglaNum(t.amount.toLocaleString('en-US'))}`, 600, rowY);
      rowY += 28;
    });

    // Footer
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The MoSaFa Tools • ডেইলি লাইফ ও হিসাব ম্যানেজার', W / 2, H - 40);

    const link = document.createElement('a');
    link.download = `MoSaFa-Daily-Summary-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('সামারি কার্ড সফলভাবে ডাউনলোড হয়েছে! ৳', '🎉');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70">
      {/* ---------------- Top Studio Header ---------------- */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Daily Hishab &amp; To-Do
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  অল-ইন-ওয়ান লাইফ ম্যানেজার
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                ব্যক্তিগত হিসাব-নিকাশ, করণীয় টাস্ক ও দৈনন্দিন তথ্যের খাতা
              </p>
            </div>
          </div>

          {/* User Account & Cloud Sync Controls */}
          <div className="flex items-center gap-2">
            {isLoggedIn && user ? (
              <div className="flex items-center gap-2 bg-slate-100/80 px-2.5 py-1.5 rounded-2xl border border-slate-200 text-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full object-cover border border-emerald-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user.displayName.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <span className="font-bold text-slate-900 text-xs block leading-tight truncate max-w-[120px]">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    <span>ক্লাউড সিঙ্কড {lastSyncTime ? `(${lastSyncTime})` : ''}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => syncAllToCloud(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                  title="এখনই সিঙ্ক করুন"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => (onOpenAuthModal ? onOpenAuthModal() : loginWithGoogle().catch(() => {}))}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>একাউন্টে লগইন</span>
                </button>
              </div>
            )}

            {/* Quick Action Add Button */}
            <div className="flex items-center gap-1">
              {activeTab === 'hishab' && (
                <button
                  onClick={() => setIsAddTxModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ হিসাব</span>
                </button>
              )}
              {activeTab === 'todo' && (
                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ টাস্ক</span>
                </button>
              )}
              {activeTab === 'notes' && (
                <button
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ নোট</span>
                </button>
              )}
              {activeTab === 'debts' && (
                <button
                  onClick={() => setIsAddDebtModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ দেনা-পাওনা</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- Navigation Tabs ---------------- */}
        <div className="max-w-6xl mx-auto px-4 border-t border-slate-100 flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('hishab')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'hishab'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>হিসাব-নিকাশ</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'hishab' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              ৳{toBanglaNum(balance)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('todo')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'todo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>টু-ডু লিস্ট ও টাস্ক</span>
            {pendingTasks.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'todo' ? 'bg-indigo-700 text-white' : 'bg-rose-100 text-rose-700'}`}>
                {toBanglaNum(pendingTasks.length)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>দৈনন্দিন নোট ও ডায়েরি</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'notes' ? 'bg-violet-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {toBanglaNum(notes.length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'habits'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>অভ্যাস ট্র্যাকার</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'habits' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {toBanglaNum(completedHabitsCount)}/{toBanglaNum(DEFAULT_HABITS.length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('debts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'debts'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <HandCoins className="w-4 h-4" />
            <span>দেনা-পাওনা (বাকি)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'debts' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {toBanglaNum(debts.filter((d) => !d.isSettled).length)}
            </span>
          </button>
        </div>
      </header>

      {/* ---------------- Logged-in / Guest Status Banner ---------------- */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-b border-amber-200/50 py-2.5 px-4 text-xs">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>সাইটের ইউজার একাউন্ট সংযুক্ত করুন:</strong> আপনার প্রতিদিনের হিসাব, টু-ডু ও নোটসমূহ ক্লাউডে আজীবনের জন্য সুরক্ষিত রাখুন এবং যেকোনো মোবাইল ও ল্যাপটপে এক ক্লিকে পান।
              </span>
            </div>
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal() : loginWithGoogle().catch(() => {}))}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition"
            >
              গুগল দিয়ে লগইন করুন 🚀
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Main Content Body ---------------- */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex-1">
        {/* ============================================================== */}
        {/* 1. TAB: HISHAB (হিসাব-নিকাশ)                                     */}
        {/* ============================================================== */}
        {activeTab === 'hishab' && (
          <div className="space-y-6">
            {/* 3 Main Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90 mb-1">
                    মোট আয় (Income)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black">
                    ৳ {toBanglaNum(totalIncome.toLocaleString('en-US'))}
                  </span>
                  <p className="text-[11px] text-emerald-100 mt-1">
                    মোট {toBanglaNum(transactions.filter((t) => t.type === 'income').length)}টি আয়ের উৎস
                  </p>
                </div>
                <TrendingUp className="w-16 h-16 absolute -right-2 -bottom-2 opacity-15" />
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-pink-700 p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90 mb-1">
                    মোট ব্যয় (Expense)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black">
                    ৳ {toBanglaNum(totalExpense.toLocaleString('en-US'))}
                  </span>
                  <p className="text-[11px] text-rose-100 mt-1">
                    মোট {toBanglaNum(transactions.filter((t) => t.type === 'expense').length)}টি ব্যয়ের খাত
                  </p>
                </div>
                <TrendingDown className="w-16 h-16 absolute -right-2 -bottom-2 opacity-15" />
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90 mb-1">
                    অবশিষ্ট ব্যালেন্স (Balance)
                  </span>
                  <span className={`text-2xl sm:text-3xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ৳ {toBanglaNum(balance.toLocaleString('en-US'))}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {balance >= 0 ? 'আর্থিক সঞ্চয় ইতিবাচক 👍' : 'ব্যয় আয়ের চেয়ে বেশি! ⚠️'}
                  </p>
                </div>
                <Wallet className="w-16 h-16 absolute -right-2 -bottom-2 opacity-15 text-indigo-400" />
              </div>
            </div>

            {/* Category Breakdown Bars */}
            {totalExpense > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    <span>খাতভিত্তিক ব্যয়ের হার (Category Breakdown):</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ব্যয় হয়েছে {toBanglaNum(Object.keys(expenseByCategory).length)}টি খাতে
                  </span>
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(expenseByCategory).map(([cat, amt]) => {
                    const pct = Math.round((amt / totalExpense) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span>{CATEGORY_ICONS[cat] || '📝'}</span>
                            <span>{cat}</span>
                          </span>
                          <span>
                            ৳ {toBanglaNum(amt.toLocaleString('en-US'))} ({toBanglaNum(pct)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-rose-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter Controls, Search & Export Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setTxFilterType('all')}
                  className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    txFilterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  সব লেনদেন ({toBanglaNum(transactions.length)})
                </button>
                <button
                  onClick={() => setTxFilterType('income')}
                  className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    txFilterType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  শুধুমাত্র আয়
                </button>
                <button
                  onClick={() => setTxFilterType('expense')}
                  className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    txFilterType === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  শুধুমাত্র ব্যয়
                </button>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-52">
                  <input
                    type="text"
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    placeholder="হিসাব খুঁজুন..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>

                {transactions.length > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={exportHishabToCsv}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="CSV এক্সপোর্ট"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadSummaryCard}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="রিপোর্ট কার্ড ডাউনলোড"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">কার্ড</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => {
                const icon = CATEGORY_ICONS[tx.category] || '💸';
                const accountObj = ACCOUNT_INFO[tx.account] || ACCOUNT_INFO.cash;
                return (
                  <div
                    key={tx.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                          tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{tx.category}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${accountObj.color}`}>
                            {accountObj.icon}
                            <span>{accountObj.label.split(' ')[0]}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{toBanglaNum(tx.date)}</span>
                          {tx.note && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 truncate max-w-[220px]">{tx.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-base font-black ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}৳ {toBanglaNum(tx.amount.toLocaleString('en-US'))}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">আপনার হিসাব খাতা সম্পূর্ণ প্রস্তুত</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    কোনো ডেমো ডাটা রাখা হয়নি। আপনার নতুন লেনদেন সুরক্ষিত রাখতে নিচের বাটনে ক্লিক করে আয় বা ব্যয় যুক্ত করুন।
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddTxModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ প্রথম হিসাব যোগ করুন</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. TAB: TO-DO LIST & TASK MANAGER (টু-ডু লিস্ট)                  */}
        {/* ============================================================== */}
        {activeTab === 'todo' && (
          <div className="space-y-6">
            {/* Today's Progress Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                      আজকের করণীয় টাস্ক
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black">
                      {todayTasks.length > 0
                        ? `${toBanglaNum(completedTodayTasks.length)} / ${toBanglaNum(todayTasks.length)} সম্পন্ন হয়েছে`
                        : 'আজকের কোনো কাজ বাকি নেই!'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ নতুন টাস্ক যোগ করুন</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-indigo-200">
                    <span>আজকের অগ্রগতি ({toBanglaNum(todayProgressPercent)}%)</span>
                    <span>{toBanglaNum(pendingTasks.length)}টি টাস্ক বাকি আছে</span>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${todayProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Task Filters & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    taskFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  সব টাস্ক ({toBanglaNum(tasks.length)})
                </button>
                <button
                  onClick={() => setTaskFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    taskFilter === 'pending' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  বাকি কাজ ({toBanglaNum(pendingTasks.length)})
                </button>
                <button
                  onClick={() => setTaskFilter('today')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    taskFilter === 'today' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  আজকের ({toBanglaNum(todayTasks.length)})
                </button>
                <button
                  onClick={() => setTaskFilter('high')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    taskFilter === 'high' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  জরুরি 🚨
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    taskFilter === 'completed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  সম্পন্ন ({toBanglaNum(completedTasks.length)})
                </button>
              </div>

              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  placeholder="টাস্ক খুঁজুন..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-2.5">
              {filteredTasks.map((t) => {
                const categoryObj = TASK_CATEGORIES[t.category] || TASK_CATEGORIES.other;
                const isOverdue = !t.isCompleted && t.dueDate < todayDateStr;

                return (
                  <div
                    key={t.id}
                    className={`bg-white p-4 rounded-2xl border transition flex items-start justify-between gap-3 shadow-xs ${
                      t.isCompleted
                        ? 'border-slate-200 bg-slate-50/50 opacity-75'
                        : t.isPinned
                        ? 'border-indigo-300 ring-1 ring-indigo-100 bg-indigo-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTaskCompletion(t.id)}
                        className={`mt-0.5 p-1 rounded-xl transition cursor-pointer shrink-0 ${
                          t.isCompleted ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-indigo-600'
                        }`}
                      >
                        {t.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-100 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-5 h-5 stroke-[2]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4
                            className={`text-sm font-bold text-slate-900 break-words ${
                              t.isCompleted ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {t.title}
                          </h4>

                          {/* Priority badge */}
                          {t.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                              জরুরি (High)
                            </span>
                          )}
                          {t.priority === 'medium' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              মাঝারি
                            </span>
                          )}

                          {/* Category badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryObj.color}`}>
                            {categoryObj.label}
                          </span>

                          {t.isPinned && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5 fill-indigo-700" />
                              <span>পিন করা</span>
                            </span>
                          )}
                        </div>

                        {t.note && (
                          <p className={`text-xs text-slate-600 mt-1 line-clamp-2 ${t.isCompleted ? 'text-slate-400' : ''}`}>
                            {t.note}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {isOverdue ? 'দেরি হয়ে গেছে: ' : ''}
                              {toBanglaNum(t.dueDate)}
                            </span>
                          </span>

                          {t.dueTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{t.dueTime}</span>
                            </span>
                          )}

                          {t.isCompleted && t.completedAt && (
                            <span className="text-emerald-700 font-semibold">
                              ✓ সম্পন্ন হয়েছে: {new Date(t.completedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleTaskPin(t.id)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          t.isPinned ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-slate-600'
                        }`}
                        title={t.isPinned ? 'আনপিন করুন' : 'উপরে পিন করুন'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(t.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <CheckSquare className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">আপনার টু-ডু তালিকা সম্পূর্ণ ফাঁকা</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    আজকের যে-কোনো কাজ, অফিস বা পড়াশোনার রুটিন বা জরুরি দায়িত্ব যোগ করে শৃঙ্খলা বজায় রাখুন।
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ প্রথম টাস্ক যোগ করুন</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. TAB: DAILY NOTES & MEMOS (দৈনন্দিন নোট ও ডায়েরি)              */}
        {/* ============================================================== */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-600" />
                  <span>দৈনন্দিন নোটস ও ব্যক্তিগত তথ্য ভাণ্ডার</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  গুরুত্বপূর্ণ মেমো, আইডি ও পাসওয়ার্ড রিমাইন্ডার, জরুরি ফোন নাম্বার ও ডায়েরি
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNoteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ নতুন নোট যোগ করুন</span>
              </button>
            </div>

            {/* Note search and category filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setNoteCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    noteCategoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  সব নোট ({toBanglaNum(notes.length)})
                </button>
                {Object.entries(NOTE_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setNoteCategoryFilter(key)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                      noteCategoryFilter === key ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  placeholder="নোট বা তথ্য খুঁজুন..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => {
                const catObj = NOTE_CATEGORIES[note.category] || NOTE_CATEGORIES.general;
                return (
                  <div
                    key={note.id}
                    className={`bg-white p-5 rounded-3xl border transition flex flex-col justify-between shadow-xs hover:shadow-md ${
                      note.isPinned ? 'border-violet-300 ring-1 ring-violet-200 bg-violet-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                          {catObj.icon} {catObj.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {note.isPinned && <Pin className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />}
                          <button
                            type="button"
                            onClick={() => copyNoteContent(note)}
                            className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="কপি করুন"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteNote(note.id)}
                            className="p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mb-2 break-words">{note.title}</h4>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed break-words font-normal">
                        {note.content}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>সংরক্ষিত: {toBanglaNum(note.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredNotes.length === 0 && (
              <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">আপনার নোটবুক সম্পূর্ণ প্রস্তুত</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  আপনার দৈনন্দিন প্রয়োজনীয় যে-কোনো তথ্য, মেমো, আইডি ও পাসওয়ার্ড রিমাইন্ডার বা ব্যক্তিগত ডায়েরি লিখে রাখুন।
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ প্রথম নোট যোগ করুন</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. TAB: HABIT TRACKER (দৈনিক অভ্যাস ট্র্যাকার)                 */}
        {/* ============================================================== */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
                    দৈনন্দিন অভ্যাস ও রুটিন
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black">
                    আজকের স্কোর: {toBanglaNum(completedHabitsCount)} / {toBanglaNum(DEFAULT_HABITS.length)} সম্পন্ন
                  </h3>
                  <p className="text-xs text-teal-200 mt-1">
                    ছোট ছোট ইতিবাচক অভ্যাস প্রতিদিন বজায় রেখে জীবনকে সুন্দর ও সফল করুন।
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl text-xs font-bold">
                  <Calendar className="w-4 h-4 text-teal-300" />
                  <input
                    type="date"
                    value={selectedHabitDate}
                    onChange={(e) => setSelectedHabitDate(e.target.value)}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Habit Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEFAULT_HABITS.map((h) => {
                const isDone = Boolean(habitsForDate[h.id]);
                return (
                  <div
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`p-5 rounded-3xl border transition cursor-pointer select-none flex items-center justify-between gap-3 shadow-xs active:scale-[0.98] ${
                      isDone
                        ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition ${
                          isDone ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {h.iconName === 'water' && <Droplets className="w-6 h-6" />}
                        {h.iconName === 'prayer' && <Sparkles className="w-6 h-6" />}
                        {h.iconName === 'exercise' && <Footprints className="w-6 h-6" />}
                        {h.iconName === 'read' && <BookOpen className="w-6 h-6" />}
                        {h.iconName === 'hishab' && <Wallet className="w-6 h-6" />}
                        {h.iconName === 'sleep' && <Moon className="w-6 h-6" />}
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold ${isDone ? 'text-teal-900' : 'text-slate-900'}`}>
                          {h.title}
                        </h4>
                        <span className="text-[11px] text-slate-500 block mt-0.5">{h.target}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isDone ? (
                        <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          ✓
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. TAB: DEBTS & LENDING (দেনা-পাওনা / বাকি হিসাব)                */}
        {/* ============================================================== */}
        {activeTab === 'debts' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">
                  দেনা-পাওনা ও ধার-কর্জ খাতা
                </span>
                <h3 className="text-xl sm:text-2xl font-black">
                  বাকি ও ঋণের স্পষ্ট হিসাব
                </h3>
                <p className="text-xs text-amber-100 mt-1">
                  কার কাছে কত টাকা পাবেন আর কাকে কত টাকা দিতে হবে তার নির্ভুল হিসাব রাখুন।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddDebtModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs shadow-sm hover:bg-amber-50 transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ দেনা-পাওনা যোগ করুন</span>
              </button>
            </div>

            {/* Debt Cards */}
            <div className="space-y-3">
              {debts.map((d) => (
                <div
                  key={d.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 shadow-xs ${
                    d.isSettled ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 font-bold ${
                        d.type === 'give' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {d.type === 'give' ? '📥' : '📤'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{d.personName}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            d.type === 'give'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {d.type === 'give' ? 'আমি পাবো (পাওনা)' : 'আমাকে দিতে হবে (দেনা)'}
                        </span>
                        {d.isSettled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                            পরিশোধিত ✓
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                        {d.personPhone && <span>ফোন: {d.personPhone}</span>}
                        {d.dueDate && <span>• পরিশোধের তারিখ: {toBanglaNum(d.dueDate)}</span>}
                        {d.note && <span>• {d.note}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-base font-black ${
                        d.type === 'give' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      ৳ {toBanglaNum(d.amount.toLocaleString('en-US'))}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleDebtSettled(d.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        d.isSettled ? 'bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {d.isSettled ? 'অসম্পূর্ণ করুন' : 'পরিশোধিত ✓'}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteDebt(d.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {debts.length === 0 && (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                    <HandCoins className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">কোনো দেনা-পাওনা বাকি নেই</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    কারো কাছে টাকা পেলে বা কাউকে টাকা দেওয়ার প্রতিশ্রুতি থাকলে তা লিখে রাখুন।
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddDebtModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ রেকর্ড যোগ করুন</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Hidden Canvas for Summary Card Export */}
      <canvas ref={reportCanvasRef} className="hidden" />

      {/* ============================================================== */}
      {/* MODAL 1: Add Transaction                                       */}
      {/* ============================================================== */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">নতুন হিসাব লিপিবদ্ধ করুন</h3>
            <form onSubmit={handleAddTransaction} className="space-y-3.5 text-xs">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl font-bold">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    txType === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  ব্যয় (Expense)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    txType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  আয় (Income)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">টাকার পরিমাণ (৳):</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="যেমন: ৫০০"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base font-bold text-slate-900"
                />
                <div className="flex gap-1.5 mt-2">
                  {[50, 100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTxAmount(String((parseFloat(txAmount) || 0) + amt))}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                    >
                      +৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি:</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
                  >
                    {txType === 'income' ? (
                      <>
                        <option value="বেতন (Salary)">💼 বেতন (Salary)</option>
                        <option value="ব্যবসা (Business)">🏪 ব্যবসা (Business)</option>
                        <option value="ফ্রিল্যান্সিং (Freelancing)">💻 ফ্রিল্যান্সিং (Freelancing)</option>
                        <option value="উপহার / বোনাস (Gift)">🎁 উপহার / বোনাস (Gift)</option>
                        <option value="অন্যান্য (Other)">📝 অন্যান্য আয় (Other)</option>
                      </>
                    ) : (
                      <>
                        <option value="খাদ্য ও বাজার (Food)">🍲 খাদ্য ও বাজার (Food)</option>
                        <option value="যাতায়াত (Transport)">🚗 যাতায়াত (Transport)</option>
                        <option value="বিল ও ইউটিলিটি (Bills)">💡 বিল ও ইউটিলিটি (Bills)</option>
                        <option value="বাসা ভাড়া (Rent)">🏠 বাসা ভাড়া (Rent)</option>
                        <option value="কেনাকাটা (Shopping)">🛍️ কেনাকাটা (Shopping)</option>
                        <option value="চিকিৎসা ও ওষুধ (Health)">💊 চিকিৎসা ও ওষুধ (Health)</option>
                        <option value="শিক্ষা ও বই (Education)">📚 শিক্ষা ও বই (Education)</option>
                        <option value="বিনোদন ও আড্ডা (Fun)">☕ বিনোদন ও আড্ডা (Fun)</option>
                        <option value="অন্যান্য (Other)">📝 অন্যান্য ব্যয় (Other)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">অ্যাকাউন্ট / মাধ্যম:</label>
                  <select
                    value={txAccount}
                    onChange={(e: any) => setTxAccount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
                  >
                    <option value="cash">💵 নগদ ক্যাশ (Cash)</option>
                    <option value="bkash">📱 বিকাশ (bKash)</option>
                    <option value="nagad">📱 নগদ (Nagad)</option>
                    <option value="bank">🏦 ব্যাংক (Bank)</option>
                    <option value="rocket">💳 রকেট (Rocket)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">তারিখ:</label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোট / বিবরণ (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder="যেমন: স্বপ্ন সুপারশপ বাজার..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Add To-Do Task                                        */}
      {/* ============================================================== */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <span>নতুন করণীয় টাস্ক যোগ করুন</span>
            </h3>
            <form onSubmit={handleAddTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">টাস্কের শিরোনাম (Title):</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="যেমন: বিকেলের মধ্যে বিদ্যুৎ বিল দেওয়া..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">গুরুত্ব (Priority):</label>
                  <select
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">🚨 জরুরি (High)</option>
                    <option value="medium">⚡ মাঝারি (Medium)</option>
                    <option value="low">☕ সাধারণ (Low)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি:</label>
                  <select
                    value={taskCategory}
                    onChange={(e: any) => setTaskCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="personal">ব্যক্তিগত</option>
                    <option value="work">কাজ / অফিস</option>
                    <option value="study">পড়াশোনা</option>
                    <option value="shopping">বাজার / কেনাকাটা</option>
                    <option value="family">পারিবারিক</option>
                    <option value="health">স্বাস্থ্য</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">তারিখ (Due Date):</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সময় (ঐচ্ছিক):</label>
                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোট বা বিস্তারিত তথ্য (ঐচ্ছিক):</label>
                <textarea
                  rows={2}
                  value={taskNote}
                  onChange={(e) => setTaskNote(e.target.value)}
                  placeholder="টাস্কের জন্য প্রয়োজনীয় নির্দেশনা বা বিবরণ..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  টাস্ক সেভ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Add Note & Daily Info                                 */}
      {/* ============================================================== */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" />
              <span>দৈনন্দিন তথ্য বা নোট যোগ করুন</span>
            </h3>
            <form onSubmit={handleAddNote} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">শিরোনাম (Title):</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="যেমন: বাসা ভাড়ার চুক্তি রিমাইন্ডার..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি:</label>
                <select
                  value={noteCategory}
                  onChange={(e: any) => setNoteCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="general">📝 সাধারণ নোট</option>
                  <option value="memo">📌 জরুরি মেমো</option>
                  <option value="reminder">⏰ রিমাইন্ডার</option>
                  <option value="phone">📞 জরুরি নাম্বার ও ঠিকানা</option>
                  <option value="diary">📖 দৈনিক ডায়েরি</option>
                  <option value="work">💼 কাজের তথ্য</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোটের বিস্তারিত বিষয়বস্তু:</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="এখানে আপনার যেকোনো তথ্য, চিন্তা, হিসাবের খসড়া বা ফোন নাম্বার লিখে রাখুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinNote"
                  checked={notePinned}
                  onChange={(e) => setNotePinned(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600"
                />
                <label htmlFor="pinNote" className="font-bold text-slate-700 cursor-pointer">
                  উপরে পিন করে রাখুন (Pin to top)
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold cursor-pointer"
                >
                  নোট সংরক্ষণ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: Add Debt (দেনা-পাওনা)                                   */}
      {/* ============================================================== */}
      {isAddDebtModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-amber-600" />
              <span>দেনা-পাওনা রেকর্ড যুক্ত করুন</span>
            </h3>
            <form onSubmit={handleAddDebt} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl font-bold">
                <button
                  type="button"
                  onClick={() => setDebtType('give')}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    debtType === 'give' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  আমি পাবো (পাওনা)
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType('take')}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    debtType === 'take' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  আমাকে দিতে হবে (দেনা)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ব্যক্তির নাম:</label>
                <input
                  type="text"
                  required
                  value={debtPersonName}
                  onChange={(e) => setDebtPersonName(e.target.value)}
                  placeholder="যেমন: রহিম ভাই"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">টাকার পরিমাণ (৳):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    placeholder="যেমন: ২০০০"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">মোবাইল নাম্বার (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={debtPersonPhone}
                    onChange={(e) => setDebtPersonPhone(e.target.value)}
                    placeholder="০১XXXXXXXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পরিশোধের সম্ভাব্য তারিখ (ঐচ্ছিক):</label>
                <input
                  type="date"
                  value={debtDueDate}
                  onChange={(e) => setDebtDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোট / কারণ (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={debtNote}
                  onChange={(e) => setDebtNote(e.target.value)}
                  placeholder="যেমন: জরুরি প্রয়োজনে ধার নেওয়া..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  রেকর্ড সংরক্ষণ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddDebtModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
