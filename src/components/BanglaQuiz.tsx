import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  Shuffle,
  Copy,
  Download,
  BookOpen,
  Brain,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MASTER_1000_QUIZ_QUESTIONS, QuizQuestion } from '../data/banglaQuizData';

export type { QuizQuestion };

interface BanglaQuizProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

// Helper to shuffle array randomly
const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const toBanglaNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const BanglaQuiz: React.FC<BanglaQuizProps> = ({ onBackToHub, onShowToast }) => {
  const [category, setCategory] = useState<string>('all');
  const [activeQuestionSet, setActiveQuestionSet] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);

  // Load high score
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mosafa_quiz_high_score');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  // Initialize and randomize question set - guarantees fresh 10 questions every round from the 1000-question pool!
  const loadFreshQuestions = (cat = category) => {
    const filtered = MASTER_1000_QUIZ_QUESTIONS.filter((q) =>
      cat === 'all' ? true : q.category === cat
    );

    // Shuffle pool completely
    const randomized = shuffleArray(filtered);

    // Take a random batch of exactly 10 questions (or all if fewer available)
    const batch = randomized.slice(0, 10);

    // Also randomize options order for each question
    const finalSet = batch.map((q) => {
      const correctText = q.options[q.correctIndex];
      const shuffledOpts = shuffleArray(q.options);
      return {
        ...q,
        options: shuffledOpts,
        correctIndex: shuffledOpts.indexOf(correctText),
      };
    });

    setActiveQuestionSet(finalSet);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  useEffect(() => {
    loadFreshQuestions(category);
  }, [category]);

  const activeQuestion = activeQuestionSet[currentIndex] || activeQuestionSet[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !activeQuestion) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === activeQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestionSet.length) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsQuizFinished(true);
    const finalScore = selectedOption === activeQuestion?.correctIndex ? score + 1 : score;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('mosafa_quiz_high_score', String(finalScore));
      } catch {}
    }

    if (finalScore >= Math.floor(activeQuestionSet.length * 0.7)) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const downloadCertificate = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // Background Gradient - Golden Amber Intellectual Theme
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, '#b45309');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Ornate Border
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 5;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(35, 35, W - 70, H - 70);

    // Header
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE MOSAFA TOOLS • মেধা ও বুদ্ধিদীপ্ত কুইজ চ্যালেঞ্জ', W / 2, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
    ctx.fillText('বাংলা কুইজ মেধা সনদপত্র 🏆', W / 2, 130);

    // Score box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(80, 180, W - 160, 260, 24);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 64px "Hind Siliguri", sans-serif';
    ctx.fillText(`${toBanglaNum(score)} / ${toBanglaNum(activeQuestionSet.length)}`, W / 2, 280);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
    const pct = Math.round((score / Math.max(1, activeQuestionSet.length)) * 100);
    ctx.fillText(`সফলতার হার: ${toBanglaNum(pct)}%`, W / 2, 335);

    const titleText =
      pct >= 80 ? '🌟 অসাধারণ জিনিয়াস! শীর্ষস্থানীয় মেধার অধিকারী!' :
      pct >= 50 ? '👏 প্রশংসনীয় পারফরম্যান্স! ভালো জ্ঞান ও বুদ্ধিমত্তা!' :
      '💪 নিয়মিত অনুশীলনে আরও ভালো ফলাফল সম্ভব!';
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 17px "Hind Siliguri", sans-serif';
    ctx.fillText(titleText, W / 2, 385);

    // Footer info
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px "Hind Siliguri", sans-serif';
    const catLabel =
      category === 'all' ? 'সকল ১,০০০+ প্রশ্ন ব্যাংক' :
      category === 'riddle' ? 'ধাঁধা' :
      category === 'gk' ? 'সাধারণ জ্ঞান' :
      category === 'literature' ? 'সাহিত্য' :
      category === 'science' ? 'বিজ্ঞান' :
      category === 'history' ? 'ইতিহাস' :
      category === 'geography' ? 'ভূগোল' :
      category === 'sports' ? 'খেলাধুলা' : 'আইকিউ';

    ctx.fillText(`ক্যাটাগরি: ${catLabel} • রাউন্ড: ১০টি র‍্যান্ডম প্রশ্ন • তারিখ: ${new Date().toLocaleDateString('bn-BD')}`, W / 2, 500);
    ctx.fillText('The MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল', W / 2, 730);

    const link = document.createElement('a');
    link.download = `MoSaFa-Quiz-Certificate-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('কুইজ সনদ কার্ড ডাউনলোড সম্পন্ন! 🏆', '🎉');
  };

  const copyQuizScore = async () => {
    const text = `🧩 বাংলা কুইজ চ্যালেঞ্জ (The MoSaFa Tools):\n` +
      `আমার স্কোর: ${toBanglaNum(score)} / ${toBanglaNum(activeQuestionSet.length)}\n` +
      `সফলতার হার: ${toBanglaNum(Math.round((score / Math.max(1, activeQuestionSet.length)) * 100))}%\n` +
      `১,০০০টি প্রশ্নের সুবিশাল ব্যাংক থেকে ১০টি র‍্যান্ডম কুইজ!\n` +
      `আপনিও আপনার বুদ্ধিমত্তা যাচাই করুন The MoSaFa Tools-এ!`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('কুইজের স্কোর কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('কুইজের স্কোর কপি হয়েছে! 📋', '✅');
    }
  };

  const handleRestartFresh = () => {
    loadFreshQuestions(category);
    onShowToast('১,০০০ প্রশ্নের ব্যাংক থেকে নতুন ১০টি ভিন্ন প্রশ্ন লোড হয়েছে! 🔀', '✨');
  };

  const categories = [
    { id: 'all', label: 'সকল (১০০০+)' },
    { id: 'riddle', label: 'ধাঁধা' },
    { id: 'gk', label: 'সাধারণ জ্ঞান' },
    { id: 'literature', label: 'সাহিত্য' },
    { id: 'science', label: 'বিজ্ঞান' },
    { id: 'history', label: 'ইতিহাস' },
    { id: 'geography', label: 'ভূগোল' },
    { id: 'sports', label: 'খেলাধুলা' },
    { id: 'iq', label: 'আইকিউ' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-amber-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Bangla Riddles & Quiz
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                <Brain className="w-3 h-3 text-amber-600" />
                <span>১,০০০+ প্রশ্ন ব্যাংক • ১০টি র‍্যান্ডম 🔀</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ১,০০০টি প্রশ্নের সুবিশাল ব্যাংক থেকে প্রতিবার সম্পূর্ণ নতুন ও ভিন্ন ১০টি কুইজ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>সেরা স্কোর: {toBanglaNum(highScore)}</span>
          </div>
          <button
            onClick={handleRestartFresh}
            className="px-3 py-1.5 rounded-xl bg-white text-amber-800 hover:bg-amber-50 border border-slate-200 text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1 active:scale-95"
            title="১,০০০ প্রশ্নের ব্যাংক থেকে নতুন ১০টি ভিন্ন প্রশ্ন লোড করুন"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span>ভিন্ন প্রশ্ন 🔀</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        {!isQuizFinished && activeQuestion ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            {/* Category Filter Pills & Progress */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategory(c.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs ${
                      category === c.id ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-slate-700">
                  {toBanglaNum(currentIndex + 1)} / {toBanglaNum(activeQuestionSet.length)}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">
                  স্কোর: {toBanglaNum(score)}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 mb-2 inline-block">
                {activeQuestion.category === 'riddle'
                  ? 'মজার ধাঁধা 🤔'
                  : activeQuestion.category === 'gk'
                  ? 'সাধারণ জ্ঞান 🌍'
                  : activeQuestion.category === 'literature'
                  ? 'সাহিত্য ও ভাষা 📖'
                  : activeQuestion.category === 'science'
                  ? 'বিজ্ঞান ও প্রযুক্তি 🔬'
                  : activeQuestion.category === 'history'
                  ? 'ইতিহাস ও মুক্তিযুদ্ধ 🇧🇩'
                  : activeQuestion.category === 'geography'
                  ? 'ভূগোল ও বিশ্ব 🗺️'
                  : activeQuestion.category === 'sports'
                  ? 'খেলাধুলা 🏏'
                  : 'আইকিউ ও যুক্তি 💡'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {activeQuestion.question}
              </h3>
            </div>

            {/* Option Choices */}
            <div className="space-y-2.5 mb-6">
              {activeQuestion.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                if (isAnswered) {
                  if (idx === activeQuestion.correctIndex) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between text-xs sm:text-sm cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-xs shrink-0 text-slate-600">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswered && idx === activeQuestion.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== activeQuestion.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation when answered */}
            {isAnswered && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 animate-in fade-in duration-200">
                <span className="font-bold block mb-1">
                  {selectedOption === activeQuestion.correctIndex ? '🎉 দারুণ! সঠিক উত্তর!' : '❌ ভুল উত্তর!'}
                </span>
                <p className="leading-relaxed font-medium">ব্যাখ্যা: {activeQuestion.explanation}</p>
              </div>
            )}

            {/* Next / Submit Button */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-200 transition active:scale-95 cursor-pointer"
              >
                {currentIndex + 1 < activeQuestionSet.length ? 'পরবর্তী প্রশ্ন ➡️' : 'ফলাফল দেখুন 🏆'}
              </button>
            )}
          </div>
        ) : (
          /* Result Summary Card */
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Award className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">কুইজ সম্পন্ন হয়েছে!</h3>
            <p className="text-xs text-slate-500 mb-2">
              ১,০০০টি প্রশ্নের সুবিশাল ব্যাংক থেকে এই রাউন্ডের ১০টি প্রশ্নের ফলাফল
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">প্রাপ্ত স্কোর</span>
                <span className="text-2xl font-black text-amber-800">
                  {toBanglaNum(score)} / {toBanglaNum(activeQuestionSet.length)}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">সফলতার হার</span>
                <span className="text-2xl font-black text-emerald-800">
                  {toBanglaNum(Math.round((score / Math.max(1, activeQuestionSet.length)) * 100))}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleRestartFresh}
                className="py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-200 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Shuffle className="w-4 h-4" />
                <span>নতুন ১০টি প্রশ্ন 🔀</span>
              </button>
              <button
                onClick={copyQuizScore}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Copy className="w-4 h-4 text-amber-600" />
                <span>স্কোর কপি</span>
              </button>
              <button
                onClick={downloadCertificate}
                className="py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 text-white font-bold text-xs shadow-md shadow-amber-200 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>সনদপত্র (PNG)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Hidden canvas for certificate download */}
      <canvas ref={certCanvasRef} className="hidden" />
    </div>
  );
};
