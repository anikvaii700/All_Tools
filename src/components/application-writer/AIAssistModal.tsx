import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Check,
  Languages,
  Scissors,
  Maximize2,
  ShieldCheck,
  Wand2,
  ArrowRight,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Language, Tone } from './types';

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onApplyEnhancedText: (newText: string) => void;
  language: Language;
  documentTypeName: string;
}

export const AIAssistModal: React.FC<AIAssistModalProps> = ({
  isOpen,
  onClose,
  currentContent,
  onApplyEnhancedText,
  language,
  documentTypeName,
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('improve');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'improve',
      label: 'আরও মার্জিত ও সুন্দর করুন',
      desc: 'শব্দচয়ন উন্নত করে পেশাদারিত্ব বাড়ান',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
    },
    {
      id: 'formal',
      label: 'কড়া অফিসিয়াল / ফরমাল করুন',
      desc: 'দাপ্তরিক ও আইনি প্রশাসনিক মানদণ্ডে রূপান্তর',
      icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'short',
      label: 'সংক্ষিপ্ত ও টু-দ্য-পয়েন্ট করুন',
      desc: 'অনাবশ্যক অংশ কমিয়ে মূল কথা গুছিয়ে আনুন',
      icon: <Scissors className="w-4 h-4 text-amber-600" />,
    },
    {
      id: 'detailed',
      label: 'আরও বিস্তারিত ও তথ্যবহুল করুন',
      desc: 'সম্মানজনক অতিরিক্ত প্রাতিষ্ঠানিক যুক্তি যোগ করুন',
      icon: <Maximize2 className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'grammar',
      label: 'বানান ও ব্যাকরণ ত্রুটি সংশোধন',
      desc: 'বানান, যতিচিহ্ন ও বাক্যগঠন প্রমিত করুন',
      icon: <Wand2 className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: 'translate-en',
      label: 'ইংরেজি অফিসিয়াল লেটারে অনুবাদ',
      desc: 'British / International Formal English Format',
      icon: <Languages className="w-4 h-4 text-rose-600" />,
    },
    {
      id: 'translate-bn',
      label: 'বাংলা প্রমিত দরখাস্তে অনুবাদ',
      desc: 'প্রমিত দাপ্তরিক বাংলা রীতিতে রূপান্তর',
      icon: <Languages className="w-4 h-4 text-teal-600" />,
    },
    {
      id: 'simple-bn',
      label: 'সহজ ও সাবলীল প্রমিত বাংলা',
      desc: 'সহজে বোধগম্য সাধারণ শব্দ ও বাক্যে পুনর্লিখন',
      icon: <FileText className="w-4 h-4 text-slate-700" />,
    },
  ];

  const handleRunAiAssist = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/application-writer/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentContent,
          action: selectedAction,
          documentType: documentTypeName,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.enhancedText) {
        setResultText(data.enhancedText);
      } else {
        setErrorMessage(data.message || 'AI পরিমার্জন করা যায়নি। পুনরায় চেষ্টা করুন।');
      }
    } catch (err: any) {
      setErrorMessage('নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (resultText) {
      onApplyEnhancedText(resultText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Gemini AI রাইটিং অ্যাসিস্ট্যান্ট</span>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                  PRO ASSIST
                </span>
              </h3>
              <p className="text-[11px] text-white/80">
                দরখাস্তের মার্জিত ভাব, সঠিক বানান এবং প্রাতিষ্ঠানিক গুরুত্ব বৃদ্ধি করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Actions grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              কীভাবে আপনার দরখাস্ত পরিমার্জন করতে চান?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {actions.map((act) => {
                const isSelected = selectedAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => {
                      setSelectedAction(act.id);
                      setResultText('');
                      setErrorMessage(null);
                    }}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-300 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5">{act.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900">{act.label}</div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        {act.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger Button */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleRunAiAssist}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-200 hover:opacity-95 disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>AI প্রসেস হচ্ছে... দয়া করে অপেক্ষা করুন</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI রূপান্তর শুরু করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Generated Result Preview */}
          {resultText && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>AI প্রস্তুতকৃত নতুন ড্রাফট:</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {resultText.split('\n').filter((l) => l.trim()).length} লাইন
                </span>
              </div>
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                rows={10}
                className="w-full p-3 text-xs leading-relaxed font-sans bg-emerald-50/40 border border-emerald-300 rounded-xl text-slate-900 focus:outline-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            * AI পরিমার্জন করলে তারিখ, নাম ও প্লেসহোল্ডারগুলো সংরক্ষিত থাকে।
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!resultText}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>মূল এডিটরে যুক্ত করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
