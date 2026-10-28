import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Trophy,
  Zap,
  Edit3,
  Check,
  X,
  FileText,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TYPING_PASSAGES, getPassageForDuration } from '../data/typingPassages';
import {
  playCorrectKeySound,
  playSpaceKeySound,
  playWrongKeySound,
  playBackspaceSound,
} from '../utils/typingAudio';

interface TypingTestProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const TypingTest: React.FC<TypingTestProps> = ({ onBackToHub, onShowToast }) => {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [duration, setDuration] = useState<number>(60);
  const [passageIndex, setPassageIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Custom passage support
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customPassageText, setCustomPassageText] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customInputDraft, setCustomInputDraft] = useState<string>('');

  // Live Stats
  const [wpm, setWpm] = useState<number>(0);
  const [cpm, setCpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // Audio Feedback: কিবোর্ড সাউন্ড (সঠিকের জন্য ক্লিক/স্পেস ও ভুলের জন্য সতর্কতা সাউন্ড)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const promptBoxRef = useRef<HTMLDivElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derive current passage based on custom mode and duration
  const currentPassage = useMemo(() => {
    if (isCustomMode && customPassageText.trim().length > 0) {
      return customPassageText.trim();
    }
    return getPassageForDuration(lang, passageIndex, duration);
  }, [isCustomMode, customPassageText, lang, passageIndex, duration]);

  const toBanglaNum = (num: number | string): string => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnDigits[Number(d)]);
  };

  const resetTest = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsStarted(false);
    setIsFinished(false);
    setUserInput('');
    setTimeLeft(duration);
    setWpm(0);
    setCpm(0);
    setAccuracy(100);
    setMistakes(0);
    setCorrectCount(0);
    if (inputRef.current) {
      inputRef.current.disabled = false;
      inputRef.current.focus();
    }
  };

  // Change duration, passage, lang or custom mode resets test
  useEffect(() => {
    resetTest();
  }, [duration, passageIndex, lang, isCustomMode, customPassageText]);

  // Keep active word in view when typing long passages
  useEffect(() => {
    if (!promptBoxRef.current) return;
    const activeEl = promptBoxRef.current.querySelector('#active-typing-word');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [userInput]);

  // Handle Typing Input
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    const value = e.target.value;
    const prevLen = userInput.length;
    const newLen = value.length;

    if (!isStarted && newLen > 0) {
      setIsStarted(true);
      startTimer();
    }

    // Audio feedback: সঠিক বর্ণের জন্য মেকানিক্যাল কিবোর্ড সাউন্ড এবং ভুল হলে ভিন্ন সতর্কতামূলক সাউন্ড
    if (soundEnabled) {
      if (newLen > prevLen) {
        const lastIdx = newLen - 1;
        const typedChar = value[lastIdx];
        const targetChar = currentPassage[lastIdx];

        if (typedChar === targetChar) {
          if (typedChar === ' ') {
            playSpaceKeySound();
          } else {
            playCorrectKeySound();
          }
        } else {
          // ভুল অক্ষরের জন্য ভিন্ন রকম সাউন্ড
          playWrongKeySound();
        }
      } else if (newLen < prevLen) {
        // ব্যাকস্পেস সাউন্ড
        playBackspaceSound();
      }
    }

    setUserInput(value);
    calculateStats(value);

    // If passage complete
    if (value.length >= currentPassage.length && currentPassage.length > 0) {
      finishTest(value);
    }
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const calculateStats = (input: string) => {
    let correct = 0;
    let wrong = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === currentPassage[i]) {
        correct++;
      } else {
        wrong++;
      }
    }

    setCorrectCount(correct);
    setMistakes(wrong);

    const timeSpent = Math.max(1, duration - timeLeft);
    const minutes = timeSpent / 60;
    const grossWpm = Math.round(correct / 5 / minutes) || 0;
    const liveCpm = Math.round(correct / minutes) || 0;
    const acc = input.length > 0 ? Math.max(0, Math.round(((input.length - wrong) / input.length) * 100)) : 100;

    setWpm(grossWpm);
    setCpm(liveCpm);
    setAccuracy(acc);
  };

  const finishTest = (finalInput?: string) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsFinished(true);
    if (inputRef.current) inputRef.current.disabled = true;

    const input = finalInput !== undefined ? finalInput : userInput;
    let correct = 0;
    let wrong = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === currentPassage[i]) correct++;
      else wrong++;
    }
    const timeSpent = Math.max(1, duration - timeLeft);
    const minutes = timeSpent / 60;
    const finalWpm = Math.round(correct / 5 / minutes) || 0;

    if (finalWpm >= 30) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const nextPassage = () => {
    if (isCustomMode) {
      setIsCustomMode(false);
    }
    const total = TYPING_PASSAGES[lang].length;
    setPassageIndex((prev) => (prev + 1) % total);
  };

  const prevPassage = () => {
    if (isCustomMode) {
      setIsCustomMode(false);
    }
    const total = TYPING_PASSAGES[lang].length;
    setPassageIndex((prev) => (prev - 1 + total) % total);
  };

  const randomPassage = () => {
    if (isCustomMode) {
      setIsCustomMode(false);
    }
    const total = TYPING_PASSAGES[lang].length;
    const r = Math.floor(Math.random() * total);
    setPassageIndex(r);
  };

  // Custom passage handlers
  const handleOpenCustomModal = () => {
    setCustomInputDraft(customPassageText || '');
    setShowCustomModal(true);
  };

  const handleApplyCustomPassage = () => {
    const trimmed = customInputDraft.trim();
    if (!trimmed) {
      onShowToast('অনুগ্রহ করে কিছু লেখা পেস্ট বা টাইপ করুন!', '⚠️');
      return;
    }
    setCustomPassageText(trimmed);
    setIsCustomMode(true);
    setShowCustomModal(false);
    onShowToast('কাস্টম প্যাসেজ যুক্ত হয়েছে!', '✍️');
  };

  const handleExitCustomMode = () => {
    setIsCustomMode(false);
    onShowToast('ডিফল্ট প্যাসেজে ফিরে এসেছে।', '🔄');
  };

  // Rank badge
  let rankText = 'শিক্ষানবিস টাইপিস্ট 🥉';
  if (wpm >= 60) rankText = 'গতিদানব / মাস্টার টাইপিস্ট ⚡';
  else if (wpm >= 45) rankText = 'প্রো সুপারফাস্ট টাইপিস্ট 🚀';
  else if (wpm >= 30) rankText = 'দক্ষ পেশাদার টাইপিস্ট 🏅';
  else if (wpm >= 20) rankText = 'মধ্যম মানের টাইপিস্ট 👍';

  // Tokenize passage by words and whitespace so Bengali fonts never break across characters!
  const renderedTokens = useMemo(() => {
    // Regex splits by whitespace while preserving delimiters
    const tokens = currentPassage.split(/(\s+)/);
    let cumulativeLength = 0;

    return tokens.map((token, tIdx) => {
      const startIdx = cumulativeLength;
      const endIdx = cumulativeLength + token.length;
      cumulativeLength = endIdx;

      // Whitespace token
      if (/^\s+$/.test(token)) {
        const isTyped = userInput.length >= endIdx;
        const isCurrent = userInput.length >= startIdx && userInput.length < endIdx;
        return (
          <span
            key={tIdx}
            className={
              isCurrent
                ? 'bg-indigo-300 text-indigo-900 font-bold border-b-2 border-indigo-600 animate-pulse'
                : ''
            }
          >
            {token}
          </span>
        );
      }

      // Completed word (fully typed past this word)
      if (userInput.length >= endIdx) {
        const typedSlice = userInput.slice(startIdx, endIdx);
        const isExactMatch = typedSlice === token;
        return (
          <span
            key={tIdx}
            className={`font-semibold rounded-xs transition-colors ${
              isExactMatch
                ? 'text-emerald-700 bg-emerald-100/70'
                : 'text-rose-700 bg-rose-200/90 underline'
            }`}
          >
            {token}
          </span>
        );
      }

      // Future word (cursor hasn't reached this word yet) -> Entire word intact, ZERO broken fonts!
      if (userInput.length <= startIdx) {
        return (
          <span key={tIdx} className="text-slate-700">
            {token}
          </span>
        );
      }

      // Currently active word being typed!
      // In Bengali and complex scripts, splitting characters into separate spans breaks ligatures
      // and causes combining marks (like a-kar, i-kar, hasanta) to render with dotted circles (e.g. ◌া).
      // Rendering the token intact guarantees 100% flawless Bengali ligature shaping!
      const userWordTyped = userInput.slice(startIdx);
      const isPrefixMatch = token.startsWith(userWordTyped);

      return (
        <span
          key={tIdx}
          id="active-typing-word"
          className={`inline-block px-1.5 py-0.5 rounded-lg font-bold transition-all mx-0.5 shadow-2xs ${
            isPrefixMatch
              ? 'bg-indigo-100 text-indigo-950 border-b-2 border-indigo-600 ring-2 ring-indigo-400/40'
              : 'bg-rose-100 text-rose-900 border-b-2 border-rose-500 ring-2 ring-rose-400/40'
          }`}
        >
          {token}
        </span>
      );
    });
  }, [currentPassage, userInput]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                লিপি টাইপিং টেস্ট (LipiTyping)
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                💻 কীবোর্ড উপযোগী
              </span>
            </div>
            <p className="text-xs text-slate-500">
              বাংলা ও ইংরেজি প্যাসেজ সহ লাইভ টাইপিং স্পিড ট্রেইনার
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* কিবোর্ড সাউন্ড বাটন */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              onShowToast(
                next ? 'কিবোর্ড সাউন্ড চালু করা হয়েছে 🔊' : 'সাউন্ড বন্ধ করা হয়েছে 🔇',
                next ? '🔊' : '🔇'
              );
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'কিবোর্ড সাউন্ড বন্ধ করুন' : 'কিবোর্ড সাউন্ড চালু করুন'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">সাউন্ড</span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md font-bold">অন</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">সাউন্ড</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">অফ</span>
              </>
            )}
          </button>

          {!isCustomMode && (
            <button
              onClick={nextPassage}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="অন্য প্যাসেজ দেখুন"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">প্যাসেজ</span>
            </button>
          )}
          <button
            onClick={resetTest}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিস্টার্ট</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex-1">
        {/* Prominent Large Headline Banner (as requested: "এই লিপি টাইপিং টেস্ট শুধুমাত্র কম্পিউটার/ল্যাপটপ কথাটা বড় করে লেখা থাকবে") */}
        <div className="mb-5 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md border-2 border-amber-400/80 flex items-center gap-4 sm:gap-5">
          <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
            <Monitor className="w-7 sm:w-9 h-7 sm:h-9 text-white drop-shadow-xs" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-xs">
              এই লিপি টাইপিং টেস্ট শুধুমাত্র কম্পিউটার / ল্যাপটপ
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1 leading-snug">
              ফিজিক্যাল কীবোর্ডে আঙুলের গতি ও নির্ভুলতা বাড়ানোর জন্য তৈরি। প্রথম অক্ষর টাইপ করলেই ঘড়ি শুরু হবে। (মোবাইল ও কম্পিউটার উভয়েই ব্রাউজ করা যায়)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 space-y-5">
          {/* LINE 1 (উপরের লাইন): ভাষা পরিবর্তন, টাইম ও প্যাসেজ এই ৩টি উপাদান */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
            {/* 1. ভাষা পরিবর্তন */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">ভাষা:</span>
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setLang('bn')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lang === 'bn'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lang === 'en'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* 2. টাইম (৩০ সে, ১ মি, ২ মি, ৫ মি, ১০ মি) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">টাইম:</span>
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
                {[30, 60, 120, 300, 600].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setDuration(sec)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      duration === sec
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {sec === 30 && (lang === 'bn' ? '৩০ সে.' : '30s')}
                    {sec === 60 && (lang === 'bn' ? '১ মি.' : '1m')}
                    {sec === 120 && (lang === 'bn' ? '২ মি.' : '2m')}
                    {sec === 300 && (lang === 'bn' ? '৫ মি.' : '5m')}
                    {sec === 600 && (lang === 'bn' ? '১০ মি.' : '10m')}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. প্যাসেজ ও কাস্টম লেখা */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">প্যাসেজ:</span>
              {!isCustomMode ? (
                <div className="flex items-center gap-1.5">
                  <select
                    value={Number.isNaN(passageIndex) ? 0 : passageIndex}
                    onChange={(e) => setPassageIndex(parseInt(e.target.value, 10) || 0)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                  >
                    {TYPING_PASSAGES[lang].map((_, idx) => (
                      <option key={idx} value={idx}>
                        {lang === 'bn'
                          ? `প্যাসেজ ${toBanglaNum(idx + 1)}`
                          : `Passage ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleOpenCustomModal}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="নিজের পছন্দের লেখা কপি-পেস্ট করে টাইপ করুন"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>কাস্টম লেখা</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কাস্টম প্যাসেজ চালু</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenCustomModal}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>এডিট</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExitCustomMode}
                    className="p-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                    title="ডিফল্ট প্যাসেজে ফিরুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* LINE 2 (নিজের আলাদা লাইন): সময় বাকি, WPM, নির্ভুলতা, অক্ষর */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {/* সময় বাকি */}
            <div className="bg-indigo-50/90 border border-indigo-200/80 p-3 rounded-2xl shadow-2xs flex flex-col justify-center">
              <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider">
                সময় বাকি
              </span>
              <span className="text-xl sm:text-2xl font-black text-indigo-800 mt-0.5">
                {lang === 'bn' ? `${toBanglaNum(timeLeft)} সে.` : `${timeLeft}s`}
              </span>
            </div>

            {/* WPM (শব্দ/মি) */}
            <div className="bg-emerald-50/90 border border-emerald-200/80 p-3 rounded-2xl shadow-2xs flex flex-col justify-center">
              <span className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                WPM (শব্দ/মি)
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">
                {lang === 'bn' ? toBanglaNum(wpm) : wpm}
              </span>
            </div>

            {/* নির্ভুলতা */}
            <div className="bg-amber-50/90 border border-amber-200/80 p-3 rounded-2xl shadow-2xs flex flex-col justify-center">
              <span className="text-[11px] text-amber-600 font-bold uppercase tracking-wider">
                নির্ভুলতা
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-800 mt-0.5">
                {lang === 'bn' ? `${toBanglaNum(accuracy)}%` : `${accuracy}%`}
              </span>
            </div>

            {/* অক্ষর (CPM) */}
            <div className="bg-purple-50/90 border border-purple-200/80 p-3 rounded-2xl shadow-2xs flex flex-col justify-center">
              <span className="text-[11px] text-purple-600 font-bold uppercase tracking-wider">
                অক্ষর (CPM)
              </span>
              <span className="text-xl sm:text-2xl font-black text-purple-800 mt-0.5">
                {lang === 'bn' ? toBanglaNum(cpm) : cpm}
              </span>
            </div>
          </div>

          {/* Passage Display Box - Completely unbroken font rendering */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                দেখে দেখে টাইপ করুন:{' '}
                <span className="text-indigo-600 font-black">
                  {isCustomMode
                    ? 'কাস্টম নিজস্ব প্যাসেজ'
                    : lang === 'bn'
                    ? `প্যাসেজ ${toBanglaNum(passageIndex + 1)}/${toBanglaNum(
                        TYPING_PASSAGES[lang].length
                      )} (${duration >= 600 ? '১০ মিনিট স্পেশাল বড় প্যাসেজ' : duration >= 300 ? '৫ মিনিট প্যাসেজ' : duration >= 120 ? '২ মিনিট প্যাসেজ' : duration === 60 ? '১ মিনিট প্যাসেজ' : '৩০ সেকেন্ড প্যাসেজ'})`
                    : `Passage ${passageIndex + 1}/${TYPING_PASSAGES[lang].length}`}
                </span>
              </p>
              {!isCustomMode && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <button
                    onClick={prevPassage}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center"
                    title="আগের প্যাসেজ"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={nextPassage}
                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center"
                    title="পরের প্যাসেজ"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={randomPassage}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center gap-1"
                    title="এলোমেলো প্যাসেজ"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>র‍্যান্ডম</span>
                  </button>
                </div>
              )}
            </div>

            {/* Prompt Box with intact font ligatures */}
            <div
              ref={promptBoxRef}
              style={{
                fontFamily:
                  "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', system-ui, sans-serif",
                fontFeatureSettings: '"liga" 1, "clig" 1',
              }}
              className="p-4 sm:p-6 rounded-2xl bg-slate-50/90 border border-slate-200 text-slate-800 text-base sm:text-lg lg:text-xl leading-relaxed select-none min-h-[120px] max-h-[260px] overflow-y-auto tracking-normal"
            >
              {renderedTokens}
            </div>
          </div>

          {/* Typing Input Box */}
          <div>
            <textarea
              ref={inputRef}
              rows={3}
              value={userInput}
              onChange={handleInput}
              style={{
                fontFamily:
                  "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', system-ui, sans-serif",
                fontFeatureSettings: '"liga" 1, "clig" 1',
              }}
              placeholder="এখানে টাইপ করা শুরু করুন... (প্রথম কী চাপলেই টাইমার শুরু হবে)"
              className="w-full p-4 rounded-2xl border-2 border-indigo-200 focus:border-indigo-600 focus:outline-none text-base sm:text-lg text-slate-900 transition bg-white shadow-2xs"
            />
          </div>

          {/* Bottom Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-2 font-medium">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isStarted ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span>
                {isStarted
                  ? 'টাইপিং চলছে... গতি বাড়িয়ে চলুন!'
                  : soundEnabled
                  ? 'টাইপ শুরু করুন (সঠিক বর্ণের জন্য কিবোর্ড ক্লিক ও ভুল হলে ভিন্ন সতর্কতা সাউন্ড)'
                  : 'টাইপ শুরু করুন, স্বয়ংক্রিয়ভাবে স্পিড ও সময় হিসাব হবে।'}
              </span>
            </span>
            <div className="flex items-center gap-3 font-semibold">
              <span>
                সঠিক বর্ণ:{' '}
                <strong className="text-emerald-600 font-bold">
                  {lang === 'bn' ? toBanglaNum(correctCount) : correctCount}
                </strong>
              </span>
              <span>
                ভুল বর্ণ:{' '}
                <strong className="text-rose-600 font-bold">
                  {lang === 'bn' ? toBanglaNum(mistakes) : mistakes}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Passage Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  ✍️
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    কাস্টম প্যাসেজ বা নিজস্ব লেখা
                  </h3>
                  <p className="text-xs text-slate-500">
                    আপনার যেকোনো পছন্দের লেখা বা অনুচ্ছেদ এখানে কপি-পেস্ট করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                লেখা বা প্যাসেজ পেস্ট করুন:
              </label>
              <textarea
                rows={6}
                value={customInputDraft}
                onChange={(e) => setCustomInputDraft(e.target.value)}
                placeholder="এখানে আপনার নিজস্ব বাংলা বা ইংরেজি লেখা পেস্ট করুন..."
                className="w-full p-3.5 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:outline-none text-sm leading-relaxed text-slate-800"
                style={{
                  fontFamily:
                    "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif",
                }}
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>
                  শব্দ সংখ্যা:{' '}
                  <strong className="text-slate-600 font-bold">
                    {
                      customInputDraft
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length
                    }
                  </strong>
                </span>
                <span>
                  মোট অক্ষর:{' '}
                  <strong className="text-slate-600 font-bold">
                    {customInputDraft.trim().length}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleApplyCustomPassage}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>এই লেখা নিয়ে টাইপ শুরু করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              অভিনন্দন! টেস্ট সম্পন্ন হয়েছে
            </h3>
            <p className="text-xs font-bold text-indigo-600 mb-4 px-3 py-1 rounded-full bg-indigo-50 inline-block">
              {rankText}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5 text-left">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">
                  গতি (WPM)
                </span>
                <span className="text-2xl font-black text-emerald-800">
                  {lang === 'bn' ? `${toBanglaNum(wpm)} শব্দ/মি.` : `${wpm} WPM`}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">
                  নির্ভুলতা
                </span>
                <span className="text-2xl font-black text-amber-800">
                  {lang === 'bn' ? `${toBanglaNum(accuracy)}%` : `${accuracy}%`}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-600 uppercase block">
                  মোট অক্ষর (CPM)
                </span>
                <span className="text-xl font-black text-purple-800">
                  {lang === 'bn' ? toBanglaNum(cpm) : cpm}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">
                  ভুল কীস্ট্রোক
                </span>
                <span className="text-xl font-black text-rose-800">
                  {lang === 'bn' ? toBanglaNum(mistakes) : mistakes}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetTest}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition cursor-pointer"
              >
                🔄 আবার টেস্ট দিন
              </button>
              <button
                onClick={() => {
                  nextPassage();
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                পরবর্তী প্যাসেজ ➡️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
