import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRightLeft,
  Copy,
  Download,
  Trash2,
  Sparkles,
  RefreshCw,
  FileText,
  Binary,
  CheckCircle2,
  AlertTriangle,
  History,
  SlidersHorizontal,
  Split,
  BarChart3,
  Check,
  ClipboardPaste,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  ConverterDirection,
  CleanerOptions,
  FormatterOptions,
  ConversionHistoryItem,
} from './types';
import {
  convertUnicodeToBijoy,
  convertBijoyToUnicode,
} from './unicodeBijoyMap';
import {
  convertEnglishDigitsToBengali,
  convertBengaliDigitsToEnglish,
} from './numberConverter';
import {
  cleanBengaliText,
  DEFAULT_CLEANER_OPTIONS,
  CleanResult,
} from './textCleaner';
import { formatText } from './textFormatter';
import { calculateTextStatistics } from './textStatistics';
import { compareTexts } from './textDiff';
import { ConversionHistory } from './ConversionHistory';

interface BanglaTextConverterProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

type ActiveTab =
  | 'converter'
  | 'number'
  | 'cleaner'
  | 'formatter'
  | 'comparison'
  | 'stats-history';

const SAMPLE_TEXTS = [
  {
    label: 'জাতীয় সঙ্গীত',
    text: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি। চিরদিন তোমার আকাশ, তোমার বাতাস, আমার প্রাণে বাজায় বাঁশি।',
  },
  {
    label: 'মাতৃভাষা দিবস',
    text: 'একুশে ফেব্রুয়ারি আন্তর্জাতিক মাতৃভাষা দিবস। বাংলা আমাদের অহংকার ও মাতৃভাষা।',
  },
  {
    label: 'যুক্তবর্ণ ও বিজ্ঞান',
    text: 'বিজ্ঞান ও প্রযুক্তির উৎকর্ষে বাংলাদেশ এগিয়ে চলেছে। জ্ঞান ও প্রজ্ঞাই জাতির আসল শক্তি।',
  },
  {
    label: 'মিশ্র সংখ্যা ও লেখা',
    text: 'আমার বয়স 25 বছর। গত 2026 সালের 15ই মে অনুষ্ঠিত পরীক্ষায় প্রাপ্ত নম্বর ছিল 98।',
  },
  {
    label: 'বিজয় টেক্সট (নমুনা)',
    text: 'Avgvi †mvbvi evsjv, Avwg †Zvgvq fv‡jvevwm| wPiw`b †Zvgvi AvKvk, †Zvgvi evZvm, Avgvi cÖv‡Y evRvq euvwk|',
  },
];

const LOCAL_STORAGE_KEY = 'mosafa_bangla_converter_history_v1';

export const BanglaTextConverter: React.FC<BanglaTextConverterProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('converter');

  // Converter States
  const [direction, setDirection] = useState<ConverterDirection>('unicode-to-bijoy');
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [outputText, setOutputText] = useState<string>('');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [unmappedWarnings, setUnmappedWarnings] = useState<string[]>([]);
  const [copiedInput, setCopiedInput] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);

  // Number Converter States
  const [numberDirection, setNumberDirection] = useState<'en-to-bn' | 'bn-to-en'>('en-to-bn');

  // Cleaner States
  const [cleanerOptions, setCleanerOptions] = useState<CleanerOptions>(DEFAULT_CLEANER_OPTIONS);
  const [cleanerDetails, setCleanerDetails] = useState<string[]>([]);

  // Formatter States
  const [formatterOptions, setFormatterOptions] = useState<FormatterOptions>({
    action: 'none',
    caseOption: 'none',
  });

  // Diff / Comparison States
  const [diffTextA, setDiffTextA] = useState<string>(
    'আমি বাংলায় গান গাই। আমি বাংলার গান গাই।'
  );
  const [diffTextB, setDiffTextB] = useState<string>(
    'আমি বাংলায় গান গাই। আমি বাংলায় সুর খুঁজি এবং বাংলার গান গাই।'
  );

  // History State
  const [history, setHistory] = useState<ConversionHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Save history to localStorage
  const saveToHistory = (
    src: string,
    conv: string,
    dir: ConversionHistoryItem['direction'],
    label: string
  ) => {
    if (!src.trim() || !conv.trim() || src === conv) return;

    setHistory((prev) => {
      // Avoid immediate duplicate
      if (prev.length > 0 && prev[0].sourceText === src && prev[0].convertedText === conv) {
        return prev;
      }
      const newItem: ConversionHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        sourceText: src,
        convertedText: conv,
        direction: dir,
        directionLabel: label,
        timestamp: Date.now(),
      };
      const updated = [newItem, ...prev].slice(0, 50);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // quota exceeded fallback
      }
      return updated;
    });
  };

  // Perform Conversion logic based on active tab
  const handlePerformConversion = (textToConvert = inputText, recordHistory = false) => {
    if (!textToConvert.trim()) {
      setOutputText('');
      setUnmappedWarnings([]);
      return;
    }

    if (activeTab === 'converter') {
      if (direction === 'unicode-to-bijoy') {
        const report = convertUnicodeToBijoy(textToConvert);
        setOutputText(report.result);
        setUnmappedWarnings(report.warnings);
        if (recordHistory) {
          saveToHistory(textToConvert, report.result, 'unicode-to-bijoy', 'Unicode ➔ Bijoy');
        }
      } else {
        const report = convertBijoyToUnicode(textToConvert);
        setOutputText(report.result);
        setUnmappedWarnings(report.warnings);
        if (recordHistory) {
          saveToHistory(textToConvert, report.result, 'bijoy-to-unicode', 'Bijoy ➔ Unicode');
        }
      }
    } else if (activeTab === 'number') {
      let res = '';
      if (numberDirection === 'en-to-bn') {
        res = convertEnglishDigitsToBengali(textToConvert);
        if (recordHistory) saveToHistory(textToConvert, res, 'number-en-to-bn', 'English ➔ বাংলা সংখ্যা');
      } else {
        res = convertBengaliDigitsToEnglish(textToConvert);
        if (recordHistory) saveToHistory(textToConvert, res, 'number-bn-to-en', 'বাংলা ➔ English Numbers');
      }
      setOutputText(res);
      setUnmappedWarnings([]);
    } else if (activeTab === 'cleaner') {
      const result: CleanResult = cleanBengaliText(textToConvert, cleanerOptions);
      setOutputText(result.cleanedText);
      setCleanerDetails(result.details);
      setUnmappedWarnings([]);
      if (recordHistory) {
        saveToHistory(textToConvert, result.cleanedText, 'text-clean', 'বাংলা টেক্সট ক্লিনার');
      }
    } else if (activeTab === 'formatter') {
      const res = formatText(textToConvert, formatterOptions);
      setOutputText(res);
      setUnmappedWarnings([]);
      if (recordHistory) {
        saveToHistory(textToConvert, res, 'text-format', 'টেক্সট ফরম্যাটার');
      }
    }
  };

  // Automatic live update when in Live Mode or options change
  useEffect(() => {
    if (isLiveMode) {
      handlePerformConversion(inputText, false);
    }
  }, [
    inputText,
    activeTab,
    direction,
    numberDirection,
    cleanerOptions,
    formatterOptions,
    isLiveMode,
  ]);

  // Live Statistics for Input
  const inputStats = useMemo(() => calculateTextStatistics(inputText), [inputText]);
  const outputStats = useMemo(() => calculateTextStatistics(outputText), [outputText]);

  // Diff result calculation
  const diffResult = useMemo(() => compareTexts(diffTextA, diffTextB), [diffTextA, diffTextB]);

  // Swap input and output
  const handleSwap = () => {
    if (activeTab === 'converter') {
      setDirection((prev) => (prev === 'unicode-to-bijoy' ? 'bijoy-to-unicode' : 'unicode-to-bijoy'));
    } else if (activeTab === 'number') {
      setNumberDirection((prev) => (prev === 'en-to-bn' ? 'bn-to-en' : 'en-to-bn'));
    }
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    onShowToast('টেক্সটের দিক পরিবর্তন করা হয়েছে! 🔄', '✨');
  };

  // Copy helpers
  const handleCopy = (text: string, isInput = false) => {
    if (!text) {
      onShowToast('কপি করার মতো কোনো টেক্সট নেই!', '⚠️');
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (isInput) {
          setCopiedInput(true);
          setTimeout(() => setCopiedInput(false), 2000);
        } else {
          setCopiedOutput(true);
          setTimeout(() => setCopiedOutput(false), 2000);
        }
        onShowToast('সফলভাবে কপি হয়েছে! 📋', '✅');
      })
      .catch(() => {
        onShowToast('কপি করা সম্ভব হয়নি। নিজে সিলেক্ট করে কপি করুন।', '⚠️');
      });
  };

  // Paste helper
  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setInputText(clipText);
        onShowToast('ক্লিপবোর্ড থেকে পেস্ট করা হয়েছে! 📥', '📋');
      }
    } catch {
      inputRef.current?.focus();
      onShowToast('অনুগ্রহ করে কিবোর্ড থেকে Ctrl+V চেপে পেস্ট করুন।', 'ℹ️');
    }
  };

  // Download TXT in UTF-8 format (with UTF-8 BOM so Windows Notepad reads Bengali properly)
  const handleDownload = (text: string, filename = 'converted-text.txt') => {
    if (!text) {
      onShowToast('ডাউনলোড করার কোনো টেক্সট নেই!', '⚠️');
      return;
    }
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('TXT ফাইল ডাউনলোড শুরু হয়েছে! 💾', '✅');
  };

  // Clear helper
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setUnmappedWarnings([]);
    onShowToast('ইনপুট মুছে ফেলা হয়েছে! 🧹', '✨');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-20 font-sans">
      {/* Top Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="সকল টুলসে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">সকল টুলস</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    MoSaFa Bangla Text Converter
                  </h1>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    বাংলা লেখার সহকারী ✍️
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  ইউনিকোড ও বিজয় রূপান্তর, সংখ্যা কনভার্টার, টেক্সট ক্লিনার ও বিস্তারিত পরিসংখ্যান
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>১০০% ক্লায়েন্ট সাইড</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'converter'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ইউনিকোড ↔ বিজয়</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('number')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'number'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>সংখ্যা রূপান্তরকারী</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cleaner')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'cleaner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>টেক্সট ক্লিনার</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formatter')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'formatter'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>টেক্সট ফরম্যাটার</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>টেক্সট তুলনা (Diff)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats-history')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'stats-history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>পরিসংখ্যান ও হিস্ট্রি ({history.length})</span>
          </button>
        </div>

        {/* Tab Specific Options / Controls Header */}
        {activeTab === 'converter' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">রূপান্তরের ধরণ:</span>
              <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDirection('unicode-to-bijoy')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    direction === 'unicode-to-bijoy'
                      ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unicode ➔ Bijoy (SutonnyMJ)
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('bijoy-to-unicode')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    direction === 'bijoy-to-unicode'
                      ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bijoy (SutonnyMJ) ➔ Unicode
                </button>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1 text-xs cursor-pointer"
                title="দিক ও টেক্সট অদল-বদল করুন"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>অদল-বদল (Swap)</span>
              </button>
            </div>

            {/* Live Mode Toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isLiveMode}
                  onChange={(e) => setIsLiveMode(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>লাইভ রূপান্তর (Live Typing)</span>
              </label>

              {!isLiveMode && (
                <button
                  type="button"
                  onClick={() => handlePerformConversion(inputText, true)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>কনভার্ট করুন</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'number' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">সংখ্যা কনভার্ট মোড:</span>
              <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setNumberDirection('en-to-bn')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    numberDirection === 'en-to-bn'
                      ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English Digits (0-9) ➔ বাংলা (০-৯)
                </button>
                <button
                  type="button"
                  onClick={() => setNumberDirection('bn-to-en')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    numberDirection === 'bn-to-en'
                      ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  বাংলা সংখ্যা (০-৯) ➔ English (0-9)
                </button>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1 text-xs cursor-pointer"
                title="দিক অদল-বদল করুন"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>Swap</span>
              </button>
            </div>

            <p className="text-xs text-slate-500">
              * লেখার মধ্যকার শুধু সংখ্যাগুলো পরিবর্তিত হবে, মূল টেক্সট অক্ষত থাকবে।
            </p>
          </div>
        )}

        {activeTab === 'cleaner' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>টেক্সট ক্লিনিং অপশনসমূহ নির্বাচন করুন:</span>
              </h3>
              <button
                type="button"
                onClick={() => handlePerformConversion(inputText, true)}
                className="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>ক্লিন করুন ও সেভ করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-slate-700">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanerOptions.removeExtraSpaces}
                  onChange={(e) =>
                    setCleanerOptions({ ...cleanerOptions, removeExtraSpaces: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>অতিরিক্ত ফাঁকা স্পেস মুছুন</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanerOptions.removeLeadingTrailing}
                  onChange={(e) =>
                    setCleanerOptions({ ...cleanerOptions, removeLeadingTrailing: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>শুরু ও শেষের স্পেস ছাঁটাই</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanerOptions.removeDuplicateBlankLines}
                  onChange={(e) =>
                    setCleanerOptions({
                      ...cleanerOptions,
                      removeDuplicateBlankLines: e.target.checked,
                    })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>একাধিক খালি লাইন কমান</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanerOptions.normalizeLineBreaks}
                  onChange={(e) =>
                    setCleanerOptions({ ...cleanerOptions, normalizeLineBreaks: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>লাইন ব্রেক স্বাভাবিক করুন</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanerOptions.removeInvisibleChars}
                  onChange={(e) =>
                    setCleanerOptions({ ...cleanerOptions, removeInvisibleChars: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>অদৃশ্য ক্যারেক্টার অপসারণ</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanerOptions.fixBengaliPunctuation}
                  onChange={(e) =>
                    setCleanerOptions({ ...cleanerOptions, fixBengaliPunctuation: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>দাঁড়ি ও যতিচিহ্ন স্পেস ঠিক করুন</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanerOptions.removeDuplicateWords}
                  onChange={(e) =>
                    setCleanerOptions({ ...cleanerOptions, removeDuplicateWords: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>পাশাপাশি দ্বৈত শব্দ ছাঁটাই</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={cleanerOptions.removeBlankLines}
                  onChange={(e) =>
                    setCleanerOptions({ ...cleanerOptions, removeBlankLines: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>সকল খালি লাইন মুছুন</span>
              </label>
            </div>

            {cleanerDetails.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>সম্পন্ন কার্যক্রম: {cleanerDetails.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'formatter' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>ফরম্যাটিং অপারেশন নির্বাচন করুন:</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'add-line-numbers-bn' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                  formatterOptions.action === 'add-line-numbers-bn'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>১. লাইনে বাংলা নম্বর যুক্ত করুন (১., ২.)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'add-line-numbers-en' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                  formatterOptions.action === 'add-line-numbers-en'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>2. লাইনে ইংরেজি নম্বর দিন (1., 2.)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'remove-line-numbers' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                  formatterOptions.action === 'remove-line-numbers'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>❌ লাইনের সব নম্বর মুছে ফেলুন</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'join-lines' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                  formatterOptions.action === 'join-lines'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>🔗 সব লাইন একত্রিত করে প্যারাগ্রাফ বানান</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'split-sentences' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                  formatterOptions.action === 'split-sentences'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>✂️ বাক্য অনুযায়ী প্রতিটি লাইনে ভাগ করুন</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'remove-duplicate-lines' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                  formatterOptions.action === 'remove-duplicate-lines'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>🧹 একই রকম ডুপ্লিকেট লাইন মুছুন</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'sort-lines-asc' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                  formatterOptions.action === 'sort-lines-asc'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>🔤 বর্ণানুক্রমিক সাজান (A-Z / ক-হ)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'reverse-lines' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition cursor-pointer ${
                  formatterOptions.action === 'reverse-lines'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>🔄 লাইনের ক্রম বিপরীত (Reverse) করুন</span>
              </button>

              <button
                type="button"
                onClick={() => setFormatterOptions({ ...formatterOptions, action: 'none' })}
                className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-left transition cursor-pointer"
              >
                <span>↺ সাধারণ অবস্থা (রিসেট)</span>
              </button>
            </div>

            {/* Case formatting for English content */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-700">ইংরেজি লেখার কেস (Case):</span>
              {(['none', 'uppercase', 'lowercase', 'titlecase', 'sentencecase'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormatterOptions({ ...formatterOptions, caseOption: c })}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer ${
                    formatterOptions.caseOption === c
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {c === 'none' && 'স্বাভাবিক'}
                  {c === 'uppercase' && 'UPPERCASE'}
                  {c === 'lowercase' && 'lowercase'}
                  {c === 'titlecase' && 'Title Case'}
                  {c === 'sentencecase' && 'Sentence case'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison (Diff) Tab View */}
        {activeTab === 'comparison' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Diff Box A */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">১ম টেক্সট (Original):</span>
                  <button
                    type="button"
                    onClick={() => setDiffTextA('')}
                    className="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    ক্লিয়ার
                  </button>
                </div>
                <textarea
                  value={diffTextA}
                  onChange={(e) => setDiffTextA(e.target.value)}
                  placeholder="প্রথম টেক্সটটি এখানে পেস্ট করুন..."
                  rows={8}
                  className="w-full flex-1 p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs sm:text-sm leading-relaxed"
                />
              </div>

              {/* Diff Box B */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">২য় টেক্সট (Modified):</span>
                  <button
                    type="button"
                    onClick={() => setDiffTextB('')}
                    className="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    ক্লিয়ার
                  </button>
                </div>
                <textarea
                  value={diffTextB}
                  onChange={(e) => setDiffTextB(e.target.value)}
                  placeholder="দ্বিতীয় টেক্সটটি এখানে পেস্ট করুন..."
                  rows={8}
                  className="w-full flex-1 p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs sm:text-sm leading-relaxed"
                />
              </div>
            </div>

            {/* Comparison Metrics & Result */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-800">তুলনা ফলাফল:</span>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    মিল: {diffResult.similarityPercentage}%
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-700 font-bold">
                    + যোগ হয়েছে: {diffResult.addedWordsCount} শব্দ
                  </span>
                  <span className="text-rose-600 font-bold">
                    - বাদ গেছে: {diffResult.removedWordsCount} শব্দ
                  </span>
                  <span className="text-slate-600 font-bold">
                    অপরিবর্তিত: {diffResult.unchangedWordsCount} শব্দ
                  </span>
                </div>
              </div>

              {/* Visual Diff View */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-2">লাইভ ভিজ্যুয়াল ডিফারেন্স:</span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm leading-relaxed min-h-[100px] flex flex-wrap gap-1 items-center">
                  {diffResult.segments.length === 0 ? (
                    <span className="text-slate-400 italic">উভয় টেক্সটেই কিছু লিখুন বা পেস্ট করুন...</span>
                  ) : (
                    diffResult.segments.map((seg, idx) => {
                      if (seg.type === 'added') {
                        return (
                          <span
                            key={idx}
                            className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-1.5 py-0.5 rounded"
                            title="নতুন যোগ হয়েছে"
                          >
                            {seg.value}
                          </span>
                        );
                      }
                      if (seg.type === 'removed') {
                        return (
                          <span
                            key={idx}
                            className="bg-rose-100 text-rose-800 border border-rose-300 line-through px-1.5 py-0.5 rounded opacity-80"
                            title="বাদ দেওয়া হয়েছে"
                          >
                            {seg.value}
                          </span>
                        );
                      }
                      return <span key={idx} className="text-slate-800">{seg.value}</span>;
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats & History Tab View */}
        {activeTab === 'stats-history' && (
          <div className="space-y-6">
            {/* Live Text Statistics Cards */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>বর্তমান ইনপুট টেক্সটের বিস্তারিত পরিসংখ্যান</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-bold block">মোট অক্ষর (Chars)</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {inputStats.totalChars}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-bold block">স্পেস ছাড়া অক্ষর</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
                    {inputStats.charsNoSpaces}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-bold block">মোট শব্দ (Words)</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1 block">
                    {inputStats.totalWords}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-bold block">মোট লাইন (Lines)</span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-700 font-mono mt-1 block">
                    {inputStats.totalLines}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-bold block">প্যারাগ্রাফ (Paragraphs)</span>
                  <span className="text-xl sm:text-2xl font-black text-purple-700 font-mono mt-1 block">
                    {inputStats.totalParagraphs}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 font-bold block">বাংলা অক্ষর</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono mt-1 block">
                    {inputStats.banglaChars}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[11px] text-blue-800 font-bold block">ইংরেজি অক্ষর</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-950 font-mono mt-1 block">
                    {inputStats.englishChars}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <span className="text-[11px] text-amber-800 font-bold block">বাংলা সংখ্যা (০-৯)</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-950 font-mono mt-1 block">
                    {inputStats.banglaDigits}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200">
                  <span className="text-[11px] text-purple-800 font-bold block">ইংরেজি সংখ্যা (0-9)</span>
                  <span className="text-xl sm:text-2xl font-black text-purple-950 font-mono mt-1 block">
                    {inputStats.englishDigits}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200">
                  <span className="text-[11px] text-rose-800 font-bold block">পড়ার আনুমানিক সময়</span>
                  <span className="text-xl sm:text-2xl font-black text-rose-950 font-mono mt-1 block">
                    ~{inputStats.readingTimeMinutes} মি.
                  </span>
                </div>
              </div>
            </div>

            {/* Local Storage History Component */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <ConversionHistory
                history={history}
                onSelect={(item) => {
                  setInputText(item.sourceText);
                  setOutputText(item.convertedText);
                  onShowToast('হিস্ট্রি থেকে টেক্সট লোড করা হয়েছে! 🔄', '📋');
                  setActiveTab('converter');
                }}
                onDelete={(id) => {
                  setHistory((prev) => {
                    const filtered = prev.filter((h) => h.id !== id);
                    try {
                      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
                    } catch {}
                    return filtered;
                  });
                  onShowToast('হিস্ট্রি আইটেম মুছে ফেলা হয়েছে', '🗑️');
                }}
                onClearAll={() => {
                  setHistory([]);
                  try {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                  } catch {}
                  onShowToast('সকল হিস্ট্রি মুছে ফেলা হয়েছে', '🧹');
                }}
                onShowToast={onShowToast}
              />
            </div>
          </div>
        )}

        {/* Dual Text Area Panels (Shown on converter, number, cleaner, formatter) */}
        {activeTab !== 'comparison' && activeTab !== 'stats-history' && (
          <div className="space-y-4">
            {/* Quick Sample Text Selection Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 font-semibold text-[11px]">দ্রুত টেস্ট স্যাম্পল:</span>
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(sample.text);
                    if (sample.label.includes('বিজয়')) {
                      setDirection('bijoy-to-unicode');
                    } else {
                      setDirection('unicode-to-bijoy');
                    }
                    onShowToast(`"${sample.label}" স্যাম্পল লোড করা হয়েছে!`, '✨');
                  }}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition shadow-2xs cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Warnings if any unmapped characters */}
            {unmappedWarnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">সতর্কবার্তা:</p>
                  <p>{unmappedWarnings.join('. ')}</p>
                </div>
              </div>
            )}

            {/* Side-by-side or Stacked Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Left: Input Text Panel */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        ইনপুট টেক্সট (Input Text)
                      </h3>
                      {direction === 'unicode-to-bijoy' && activeTab === 'converter' && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                          Unicode
                        </span>
                      )}
                      {direction === 'bijoy-to-unicode' && activeTab === 'converter' && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                          Bijoy ANSI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePaste}
                        className="px-2 py-1 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="ক্লিপবোর্ড থেকে পেস্ট করুন"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">পেস্ট</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="সব টেক্সট মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="এখানে আপনার টেক্সট লিখুন বা পেস্ট করুন..."
                    rows={12}
                    className="w-full p-3 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs sm:text-sm leading-relaxed resize-y font-mono"
                  />
                </div>

                {/* Input Panel Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-3">
                    <span>অক্ষর: <strong className="font-mono text-slate-800">{inputStats.totalChars}</strong></span>
                    <span>শব্দ: <strong className="font-mono text-slate-800">{inputStats.totalWords}</strong></span>
                    <span>লাইন: <strong className="font-mono text-slate-800">{inputStats.totalLines}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(inputText, true)}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-bold cursor-pointer"
                  >
                    {copiedInput ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInput ? 'কপি হয়েছে' : 'ইনপুট কপি'}</span>
                  </button>
                </div>
              </div>

              {/* Right: Output Text Panel */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        রূপান্তরিত টেক্সট (Converted Output)
                      </h3>
                      {direction === 'unicode-to-bijoy' && activeTab === 'converter' && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                          Bijoy ANSI
                        </span>
                      )}
                      {direction === 'bijoy-to-unicode' && activeTab === 'converter' && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                          Unicode
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(outputText, false)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                        title="ফলাফল কপি করুন"
                      >
                        {copiedOutput ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedOutput ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(outputText, `mosafa-${direction}.txt`)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="TXT ফাইল ডাউনলোড করুন"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span className="hidden sm:inline">TXT ডাউনলোড</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    value={outputText}
                    placeholder="রূপান্তরিত টেক্সট এখানে প্রদর্শিত হবে..."
                    rows={12}
                    className="w-full p-3 sm:p-4 rounded-2xl border border-slate-200 bg-emerald-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-xs sm:text-sm leading-relaxed resize-y font-mono font-medium text-slate-900"
                  />
                </div>

                {/* Output Panel Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-3">
                    <span>অক্ষর: <strong className="font-mono text-emerald-800">{outputStats.totalChars}</strong></span>
                    <span>শব্দ: <strong className="font-mono text-emerald-800">{outputStats.totalWords}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ UTF-8 ও Bijoy রেডি
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="bg-slate-100/70 rounded-2xl p-3.5 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>টিপস:</strong> Bijoy টেক্সট ফটোশপ, ইলাস্ট্রেটর বা ওয়ার্ডে ব্যবহার করতে হলে টেক্সট কপি করে আপনার পছন্দের SutonnyMJ বা Bijoy ফন্ট সিলেক্ট করুন।
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handlePerformConversion(inputText, true);
                  onShowToast('হিস্ট্রিতে নতুন রূপান্তর সংরক্ষণ করা হয়েছে! 💾', '✅');
                }}
                className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                হিস্ট্রিতে সংরক্ষণ করুন 💾
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
