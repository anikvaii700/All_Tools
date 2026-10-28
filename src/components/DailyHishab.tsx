import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Filter,
  FileSpreadsheet,
  PieChart,
  Search,
  Download,
  CheckCircle,
  Tag,
  Copy,
  RotateCcw,
} from 'lucide-react';

interface DailyHishabProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

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
  'বিনোদন ও আড্ডা (Fun)': '☕',
  'অন্যান্য (Other)': '📝',
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    type: 'income',
    amount: 35000,
    category: 'বেতন (Salary)',
    date: new Date().toISOString().split('T')[0],
    note: 'মাসিক বেতন',
  },
  {
    id: 'tx_2',
    type: 'expense',
    amount: 5200,
    category: 'খাদ্য ও বাজার (Food)',
    date: new Date().toISOString().split('T')[0],
    note: 'সাপ্তাহিক পারিবারিক বাজার',
  },
  {
    id: 'tx_3',
    type: 'expense',
    amount: 1450,
    category: 'বিল ও ইউটিলিটি (Bills)',
    date: new Date().toISOString().split('T')[0],
    note: 'ইন্টারনেট ও বিদ্যুৎ বিল',
  },
  {
    id: 'tx_4',
    type: 'expense',
    amount: 850,
    category: 'যাতায়াত (Transport)',
    date: new Date().toISOString().split('T')[0],
    note: 'অফিস যাতায়াত রিকশা ভাড়া',
  },
];

const toBanglaNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const DailyHishab: React.FC<DailyHishabProps> = ({ onBackToHub, onShowToast }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('খাদ্য ও বাজার (Food)');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [txNote, setTxNote] = useState<string>('');

  const reportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mosafa_daily_hishab_v2');
      if (stored) setTransactions(JSON.parse(stored));
    } catch {}
  }, []);

  const saveTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
    try {
      localStorage.setItem('mosafa_daily_hishab_v2', JSON.stringify(updated));
    } catch {}
  };

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
      date: txDate,
      note: txNote.trim(),
    };

    const updated = [newTx, ...transactions];
    saveTransactions(updated);
    setTxAmount('');
    setTxNote('');
    setIsAddModalOpen(false);
    onShowToast(`৳ ${val.toLocaleString('bn-BD')} হিসাব যুক্ত হয়েছে!`, '✅');
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    saveTransactions(updated);
    onShowToast('লেনদেন মুছে ফেলা হয়েছে', '🗑️');
  };

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Category Breakdown
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

  // Filtered List
  const filteredList = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesQuery =
      !searchQuery.trim() ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  });

  // Export CSV
  const exportToCsv = () => {
    if (transactions.length === 0) return;
    const headers = 'আইডি,ধরণ,পরিমাণ (টাকা),ক্যাটাগরি,তারিখ,মন্তব্য\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.type === 'income' ? 'আয়' : 'ব্যয়'}","${t.amount}","${t.category}","${t.date}","${
            t.note || ''
          }"`
      )
      .join('\n');

    const csvBlob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Daily-Hishab-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('হিসাব বিবরণী (CSV) ডাউনলোড সম্পন্ন! 📊', '✅');
  };

  // Export Monthly Summary Card (PNG)
  const downloadSummaryCard = () => {
    const canvas = reportCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 880;
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
    ctx.font = 'bold 32px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('মাসিক আর্থিক হিসাব বিবরণী ৳', W / 2, 85);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillText(`মোট লেনদেন: ${toBanglaNum(transactions.length)} টি • তারিখ: ${new Date().toLocaleDateString('bn-BD')}`, W / 2, 120);

    // Summary 3 Cards
    const drawCard = (x: number, y: number, title: string, amount: number, color: string) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(x, y, 210, 110, 16);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, x + 105, y + 40);

      ctx.fillStyle = color;
      ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
      ctx.fillText(`৳ ${toBanglaNum(amount.toLocaleString('en-US'))}`, x + 105, y + 80);
    };

    drawCard(60, 160, 'মোট আয় (Income)', totalIncome, '#34d399');
    drawCard(295, 160, 'মোট ব্যয় (Expense)', totalExpense, '#f87171');
    drawCard(530, 160, 'অবশিষ্ট ব্যালেন্স', balance, '#38bdf8');

    // Expense Breakdown
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('📊 খাতভিত্তিক খরচের পরিসংখ্যান:', 60, 325);

    let rowY = 370;
    ctx.font = '16px "Hind Siliguri", sans-serif';
    Object.entries(expenseByCategory).slice(0, 6).forEach(([cat, amt]) => {
      const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`• ${cat}:`, 75, rowY);

      ctx.fillStyle = '#f87171';
      ctx.fillText(`৳ ${toBanglaNum(amt.toLocaleString('en-US'))} (${toBanglaNum(pct)}%)`, 420, rowY);
      rowY += 38;
    });

    // Recent transactions header
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('📝 সাম্প্রতিক লেনদেনসমূহ:', 60, rowY + 20);
    rowY += 55;

    transactions.slice(0, 4).forEach((t) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px "Hind Siliguri", sans-serif';
      const sign = t.type === 'income' ? '+' : '-';
      ctx.fillText(`${t.date} | ${t.category} (${t.note || 'নোট নেই'})`, 75, rowY);

      ctx.fillStyle = t.type === 'income' ? '#34d399' : '#f87171';
      ctx.fillText(`${sign}৳ ${toBanglaNum(t.amount.toLocaleString('en-US'))}`, 600, rowY);
      rowY += 30;
    });

    // Footer
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The MoSaFa Tools • ডেইলি হিসাব ও বাজেট ট্র্যাকার', W / 2, H - 40);

    const link = document.createElement('a');
    link.download = `MoSaFa-Hishab-Summary-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('হিসাব কার্ড সফলভাবে ডাউনলোড হয়েছে! ৳', '🎉');
  };

  const copyHishabSummary = async () => {
    let text = `৳ Daily Hishab সামারি (The MoSaFa Tools):\n` +
      `তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n` +
      `মোট আয়: ৳ ${toBanglaNum(totalIncome.toLocaleString('en-US'))}\n` +
      `মোট ব্যয়: ৳ ${toBanglaNum(totalExpense.toLocaleString('en-US'))}\n` +
      `বর্তমান উদ্বৃত্ত ব্যালেন্স: ৳ ${toBanglaNum(balance.toLocaleString('en-US'))}\n` +
      `মোট লেনদেন: ${toBanglaNum(transactions.length)}টি\n` +
      `The MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('হিসাবের সারসংক্ষেপ কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('হিসাবের সারসংক্ষেপ কপি হয়েছে! 📋', '✅');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-emerald-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">Daily Hishab (ডেইলি হিসাব)</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                ব্যক্তিগত ফিন্যান্স
              </span>
            </div>
            <p className="text-xs text-slate-500">স্টাইলিশ ও কার্যকরী আয়-ব্যয় ট্র্যাকিং (টাকা ৳)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyHishabSummary}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            title="হিসাব সামারি কপি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">কপি সামারি</span>
          </button>
          <button
            onClick={exportToCsv}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            title="CSV এক্সপোর্ট"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={downloadSummaryCard}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="রিপোর্ট কার্ড ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">কার্ড PNG</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>হিসাব যোগ</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex-1">
        {/* Modern Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90 mb-1">
                মোট আয় (Income)
              </span>
              <span className="text-2xl sm:text-3xl font-black">
                ৳ {toBanglaNum(totalIncome.toLocaleString('en-US'))}
              </span>
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
            </div>
            <Wallet className="w-16 h-16 absolute -right-2 -bottom-2 opacity-15 text-indigo-400" />
          </div>
        </div>

        {/* Expense Category Breakdown Bars */}
        {totalExpense > 0 && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs mb-6">
            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span>খাতভিত্তিক ব্যয়ের হার (Category Breakdown):</span>
            </h3>
            <div className="space-y-2.5">
              {Object.entries(expenseByCategory).map(([cat, amt]) => {
                const pct = Math.round((amt / totalExpense) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat}</span>
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

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs mb-5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              সবকিছু ({toBanglaNum(transactions.length)})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              শুধুমাত্র আয়
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              শুধুমাত্র ব্যয়
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="খোঁজ করুন..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2.5">
          {filteredList.map((tx) => {
            const icon = CATEGORY_ICONS[tx.category] || '💸';
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
                    <h4 className="text-sm font-bold text-slate-900">{tx.category}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{toBanglaNum(tx.date)}</span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 truncate max-w-[200px]">{tx.note}</span>
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

          {filteredList.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <p>কোনো হিসাব পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      </main>

      {/* Hidden Canvas for Report Card */}
      <canvas ref={reportCanvasRef} className="hidden" />

      {/* Add Transaction Modal with Quick Buttons */}
      {isAddModalOpen && (
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
                {/* Quick Add Amount Buttons */}
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
                      <option value="কেনাকাটা (Shopping)">🛍️ কেনাকাটা (Shopping)</option>
                      <option value="চিকিৎসা ও ওষুধ (Health)">💊 চিকিৎসা ও ওষুধ (Health)</option>
                      <option value="বিনোদন ও আড্ডা (Fun)">☕ বিনোদন ও আড্ডা (Fun)</option>
                      <option value="অন্যান্য (Other)">📝 অন্যান্য ব্যয় (Other)</option>
                    </>
                  )}
                </select>
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
                  onClick={() => setIsAddModalOpen(false)}
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
