import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Camera,
  Upload,
  Send,
  Sparkles,
  BookOpen,
  Calculator,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  FileText,
  Copy,
  ChevronRight,
  Clock,
  Target,
  Award,
  Lightbulb,
  AlertCircle,
  ArrowLeft,
  X,
  Volume2,
  Check,
  BrainCircuit,
  Calendar,
  Layers,
  FileQuestion,
  ZoomIn,
  Smartphone,
  Download,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: {
    data: string;
    mimeType: string;
    previewUrl?: string;
  };
  timestamp: string;
  actionTag?: string;
  mcqData?: {
    questions: Array<{
      id: number;
      question: string;
      options: { [key: string]: string };
      correct?: string;
      explanation?: string;
      userAnswer?: string;
    }>;
  };
}

interface StudentProfile {
  name: string;
  educationLevel: string;
  classGroup?: string;
  currentSubject?: string;
  isOnboarded: boolean;
}

interface StudyMateBDProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
  onOpenMobileInstall?: () => void;
}

const CLASS_OPTIONS = [
  { id: 'class-6-10', label: 'ষষ্ঠ–দশম শ্রেণি (Class 6–10 / SSC)', tag: 'SSC' },
  { id: 'class-11-12', label: 'একাদশ–দ্বাদশ শ্রেণি (HSC Science/Arts/Commerce)', tag: 'HSC' },
  { id: 'admission', label: 'বিশ্ববিদ্যালয় / মেডিকেল / ইঞ্জিনিয়ারিং ভর্তি পরীক্ষা (Admission)', tag: 'ভর্তি' },
  { id: 'bcs-job', label: 'বিসিএস / সরকারি-বেসরকারি চাকরির প্রস্তুতি (BCS / Job Prep)', tag: 'BCS' },
  { id: 'madrasa', label: 'মাদ্রাসা (দাখিল/আলিম) / কারিগরি শিক্ষা', tag: 'মাদ্রাসা' },
  { id: 'skills', label: 'ইংরেজি, গণিত ও বিশেষ দক্ষতা বৃদ্ধি', tag: 'স্কিলস' },
];

const QUICK_GOALS = [
  { id: 'explain_topic', label: '📚 কোনো নির্দিষ্ট বিষয় বা অধ্যায় বুঝতে চাই', query: 'আমি একটি নির্দিষ্ট বিষয় সহজ ভাষায় ভালো করে বুঝতে চাই।' },
  { id: 'solve_math', label: '✍️ গণিত বা বিজ্ঞানের কঠিন অঙ্ক সমাধান করতে চাই', query: 'একটি কঠিন অঙ্কের ধাপে ধাপে সহজ সমাধান ও ব্যাখ্যা চাই।' },
  { id: 'mcq_test', label: '📝 ৫টি MCQ কুইজ দিয়ে প্রস্তুতি যাচাই করতে চাই', query: 'আমার বর্তমান শ্রেণির বিষয় অনুযায়ী ৫টি গুরুত্বপূর্ণ MCQ কুইজ দাও।' },
  { id: 'short_suggestion', label: '🎯 পরীক্ষার গুরুত্বপূর্ণ টপিক ও শর্ট সাজেশন চাই', query: 'আসন্ন পরীক্ষার জন্য অধ্যায়ভিত্তিক গুরুত্বপূর্ণ টপিক ও শর্ট সাজেশন দাও।' },
  { id: 'study_routine', label: '📅 পড়ার রুটিন ও পরীক্ষার প্রস্তুতির পরিকল্পনা চাই', query: 'দৈনিক পড়ার একটি কার্যকর রুটিন ও পরীক্ষার প্রস্তুতির প্ল্যান তৈরি করে দাও।' },
  { id: 'cq_practice', label: '✍️ সৃজনশীল প্রশ্ন (CQ) ও লেখার কৌশল অনুশীলন', query: 'পরীক্ষার উপযোগী সৃজনশীল প্রশ্ন (ক, খ, গ, ঘ) ও মানসম্মত উত্তর শিখতে চাই।' },
  { id: 'formula_sheet', label: '💡 গুরুত্বপূর্ণ সূত্র (Formulas) ও শর্টকাট কৌশল', query: 'আমার শ্রেণির পরীক্ষার জন্য প্রয়োজনীয় সূত্র ও শর্টনোটস দাও।' },
  { id: 'mistake_fix', label: '🔄 নিজের পড়ার ভুল চিহ্নিত ও রিভিশন করতে চাই', query: 'আমি সাধারণত যে বিষয়গুলোতে ভুল করি তা সমাধান ও রিভিশন করতে চাই।' },
];

export const StudyMateBD: React.FC<StudyMateBDProps> = ({
  onBackToHub,
  onShowToast,
  onOpenMobileInstall,
}) => {
  // Student Profile state
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('mosafa_studymate_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      name: '',
      educationLevel: '',
      classGroup: '',
      currentSubject: '',
      isOnboarded: false,
    };
  });

  // Conversation messages state
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('mosafa_studymate_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: `স্বাগতম 'The MoSaFa StudyMate BD'-তে! 🎓\n\nআমি তোমার অল-ইন-ওয়ান AI প্রাইভেট টিউটর। পড়াশোনা সহজ করা, কঠিন বিষয় বুঝিয়ে দেওয়া, কুইজ নেওয়া এবং পরীক্ষার প্রস্তুতিতে তোমাকে ধাপে ধাপে সাহায্য করব।\n\nতোমার পরীক্ষার সেরা প্রস্তুতির জন্য আমাকে সাহায্য করো। তুমি বর্তমানে কোন ক্লাসে বা কোন কোর্সে পড়ছো?\n\n১. ষষ্ঠ–দশম শ্রেণি (Class 6–10 / SSC)\n২. একাদশ–দ্বাদশ শ্রেণি (HSC)\n৩. বিশ্ববিদ্যালয় / মেডিকেল / ইঞ্জিনিয়ারিং ভর্তি পরীক্ষা (Admission)\n৪. বিসিএস / সরকারি-বেসরকারি চাকরির প্রস্তুতি (BCS / Job Prep)\n৫. মাদ্রাসা / কারিগরি শিক্ষা\n৬. অন্য কোনো পরীক্ষা বা কোর্স\n\nশুধু তোমার ক্লাস বা পরীক্ষার নাম লিখলেই হবে। 😊`,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // Active Tool Tabs: 'chat' | 'visual_solver' | 'mcq_quiz' | 'study_routine' | 'formula_book'
  const [activeTab, setActiveTab] = useState<'chat' | 'visual_solver' | 'mcq_quiz' | 'study_routine' | 'formula_book'>('chat');

  // Input states
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDifficultQuestion, setIsDifficultQuestion] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    file: File | null;
    base64: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // MCQ Interactive state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [qIndex: number]: string }>({});

  // Study Routine Generator state
  const [routineDays, setRoutineDays] = useState('30');
  const [routineDailyHours, setRoutineDailyHours] = useState('5');
  const [routineWeakTopics, setRoutineWeakTopics] = useState('গণিত ও ইংরেজি');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Save profile and messages
  useEffect(() => {
    localStorage.setItem('mosafa_studymate_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('mosafa_studymate_messages', JSON.stringify(messages));
  }, [messages]);

  // Clipboard paste handler for screenshots, images & text
  const handlePaste = (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for image in clipboard items (e.g. Snipping tool / screenshot Ctrl+V)
    const items = clipboardData.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = () => {
              setSelectedImage({
                file,
                base64: reader.result as string,
                mimeType: file.type || 'image/png',
                previewUrl: URL.createObjectURL(file),
              });
              onShowToast('ক্লিপবোর্ড থেকে ছবি / স্ক্রিনশট পেস্ট হয়েছে! 📸', '✅');
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }
    }

    // Check files array
    if (clipboardData.files && clipboardData.files.length > 0) {
      const file = clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage({
            file,
            base64: reader.result as string,
            mimeType: file.type || 'image/png',
            previewUrl: URL.createObjectURL(file),
          });
          onShowToast('ক্লিপবোর্ড থেকে ছবি / স্ক্রিনশট পেস্ট হয়েছে! 📸', '✅');
        };
        reader.readAsDataURL(file);
        return;
      }
    }
    // Normal text is pasted naturally by the browser
  };

  // Handle image upload from file or camera
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      onShowToast('অনুগ্রহ করে ছবি (JPG/PNG/WEBP) আপলোড করুন', '⚠️');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage({
        file,
        base64,
        mimeType: file.type || 'image/jpeg',
        previewUrl: URL.createObjectURL(file),
      });
      onShowToast('প্রশ্ন বা অঙ্কটির ছবি যোগ হয়েছে! 📸', '✅');
    };
    reader.readAsDataURL(file);
  };

  // Handle textarea input change and auto-adjust height
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  // Send message to Server
  const sendMessage = async (
    customText?: string,
    actionType: string = 'chat',
    customImage?: { base64: string; mimeType: string } | null
  ) => {
    const textToSend = customText !== undefined ? customText : inputText;
    const imgToSend = customImage !== undefined ? customImage : selectedImage;

    if (!textToSend.trim() && !imgToSend) return;

    // Detect if this is a difficult or complex problem requiring deep analysis
    const isComplex = Boolean(
      imgToSend ||
      actionType === 'solve' ||
      actionType === 'find_mistake' ||
      actionType === 'exam_write' ||
      actionType === 'rule' ||
      /[\+\-\*\/=\^√∑∫πθλ≠≤≥%]/.test(textToSend) ||
      /অঙ্ক|অংক|সমাধান|কঠিন|জটিল|মান নির্ণয়|প্রমাণ|সমীকরণ|উৎপাদক|জ্যামিতি|ত্রিকোণমিতি|ক্যালকুলাস|পদার্থ|রসায়ন|রসায়ন|জীববিজ্ঞান|সৃজনশীল|CQ|গতি|বল|কাজ|শক্তি|তড়িৎ|সার্কিট|মোল|জারণ|বিজারণ|হিসাববিজ্ঞান|লগ|সূচক|বৃত্ত|ক্ষেত্রফল|উপপাদ্য|ডেরিভেটিভ|সমাকলন|ভেক্টর|ব্রেক-ইভেন|রেওয়ামিল|যোজনী|পর্যায় সারণি|equation|integral|derivative|vector|friction|acceleration/i.test(textToSend)
    );
    setIsDifficultQuestion(isComplex);

    // Build user message
    const userMessage: Message = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    if (imgToSend) {
      userMessage.image = {
        data: imgToSend.base64,
        mimeType: imgToSend.mimeType,
        previewUrl: selectedImage?.previewUrl,
      };
    }

    // Auto-detect class level if not set yet
    let activeLevel = profile.educationLevel;
    if (!activeLevel) {
      if (/দশম|১০|10|ssc|ক্লাস\s*টেন/i.test(textToSend)) {
        activeLevel = 'ষষ্ঠ–দশম শ্রেণি (Class 6–10 / SSC)';
      } else if (/নবম|৯|9/i.test(textToSend)) {
        activeLevel = 'ষষ্ঠ–দশম শ্রেণি (Class 6–10 / SSC)';
      } else if (/একাদশ|দ্বাদশ|hsc|11|12|এইচএসসি/i.test(textToSend)) {
        activeLevel = 'একাদশ–দ্বাদশ শ্রেণি (HSC)';
      } else if (/ভর্তি|মেডিকেল|ইঞ্জিনিয়ারিং|বুয়েট|admission/i.test(textToSend)) {
        activeLevel = 'ভর্তি পরীক্ষা (Admission)';
      } else if (/বিসিএস|bcs|চাকরি/i.test(textToSend)) {
        activeLevel = 'বিসিএস / চাকরি প্রস্তুতি (BCS)';
      }
      if (activeLevel) {
        setProfile((prev) => ({ ...prev, educationLevel: activeLevel, isOnboarded: true }));
      }
    }

    const modelMsgId = 'model-' + Date.now();
    const modelPlaceholder: Message = {
      id: modelMsgId,
      role: 'model',
      text: '',
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, modelPlaceholder]);
    setInputText('');
    setSelectedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/studymate/chat?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
            image: m.image ? { data: m.image.data, mimeType: m.image.mimeType } : undefined,
          })),
          studentName: profile.name,
          studentClass: activeLevel || profile.educationLevel,
          currentSubject: profile.currentSubject,
          actionType: actionType,
          imageBase64: imgToSend?.base64,
          imageMimeType: imgToSend?.mimeType,
        }),
      });

      if (response.body && response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === modelMsgId ? { ...m, text: accumulatedText } : m))
                );
              }
            } catch {
              // skip incomplete chunk
            }
          }
        }

        if (!accumulatedText.trim()) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === modelMsgId
                ? {
                    ...m,
                    text: `দারুণ! পড়াশোনা ও পরীক্ষার প্রস্তুতিতে আমি তোমার পাশে আছি। তুমি কোন বিষয়ে সাহায্য চাও বা তোমার প্রশ্নটি বিস্তারিত লিখে জানাও।\n\n---\n*শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓*`,
                  }
                : m
            )
          );
        }
      } else {
        const data = await response.json();
        if (data.reply) {
          setMessages((prev) =>
            prev.map((m) => (m.id === modelMsgId ? { ...m, text: data.reply } : m))
          );
        } else {
          throw new Error(data.error || 'No reply received');
        }
      }
    } catch (err: any) {
      console.error('StudyMate error:', err);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === modelMsgId) {
            if (m.text && m.text.trim()) {
              return m;
            }
            return {
              ...m,
              text: `দুঃখিত, সংযোগে সামান্য সমস্যা হয়েছে। কিন্তু চিন্তার কিছু নেই!\n\n${
                profile.name ? `প্রিয় ${profile.name}! ` : ''
              }তুমি আবার প্রশ্নটি পাঠাও অথবা নিচে থেকে তোমার কাঙ্ক্ষিত বিষয় নির্বাচন করো।\n\nশেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓`,
            };
          }
          return m;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy message text to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast('টেক্সট কপি করা হয়েছে! 📋', '✅');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-To-Speech reader
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      onShowToast('আপনার ব্রাউজারে স্পিচ সাপোর্ট নেই', '⚠️');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    onShowToast('পড়ে শোনানো হচ্ছে... 🔊', '🎙️');
  };

  // Reset conversation
  const handleResetChat = () => {
    if (confirm('আপনি কি পূর্বের সকল কথোপকথন মুছে নতুন করে শুরু করতে চান?')) {
      const initial: Message = {
        id: 'msg-welcome-fresh',
        role: 'model',
        text: `স্বাগতম 'StudyMate BD'-তে! 🎓\n\nআমি তোমার অল-ইন-ওয়ান AI প্রাইভেট টিউটর। পড়াশোনা সহজ করা, কঠিন বিষয় বুঝিয়ে দেওয়া, কুইজ নেওয়া এবং পরীক্ষার প্রস্তুতিতে তোমাকে ধাপে ধাপে সাহায্য করব।\n\nতোমার পরীক্ষার সেরা প্রস্তুতির জন্য আমাকে সাহায্য করো। তুমি বর্তমানে কোন ক্লাসে বা কোন কোর্সে পড়ছো? 😊`,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initial]);
      localStorage.removeItem('mosafa_studymate_messages');
      onShowToast('কথোপকথন রিস্টার্ট করা হয়েছে', '🔄');
    }
  };

  // Setup Class Profile
  const handleSelectClass = (levelLabel: string) => {
    setProfile((prev) => ({
      ...prev,
      educationLevel: levelLabel,
      isOnboarded: true,
    }));

    const greeting = profile.name ? `আমার নাম ${profile.name} এবং আমি ${levelLabel}-এ পড়ছি।` : `আমি ${levelLabel}-এর শিক্ষার্থী।`;

    sendMessage(greeting, 'chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHub}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">সকল টুলস</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                    The MoSaFa StudyMate BD 🎓
                  </h1>
                  <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
                    AI টিউটর
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                  বাংলাদেশের অল-ইন-ওয়ান AI প্রাইভেট টিউটর ও প্রশ্ন সমাধানকারী
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>⚡ টার্বো স্পিড সক্রিয়</span>
            </div>

            {profile.name && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                <span>👤 {profile.name}</span>
                {profile.educationLevel && <span className="text-indigo-400">|</span>}
                <span className="text-slate-600 truncate max-w-[140px]">{profile.educationLevel}</span>
              </div>
            )}

            {onOpenMobileInstall && (
              <button
                onClick={onOpenMobileInstall}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95 text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs active:scale-95"
                title="মোবাইল অ্যাপ ইনস্টল ও APK ডাউনলোড"
              >
                <Smartphone className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">মোবাইল অ্যাপ (APK)</span>
                <span className="sm:hidden">APK</span>
              </button>
            )}

            <button
              onClick={handleResetChat}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="নতুন সেশন শুরু করুন"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">রিসেট</span>
            </button>
          </div>
        </div>

        {/* Feature Tabs Bar */}
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI চ্যাট টিউটর</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('visual_solver');
              fileInputRef.current?.click();
            }}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'visual_solver'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📸 ফটো অঙ্ক ও প্রশ্ন সমাধান (OCR)</span>
          </button>

          <button
            onClick={() => setActiveTab('mcq_quiz')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'mcq_quiz'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>📝 MCQ কুইজ চ্যালেঞ্জ</span>
          </button>

          <button
            onClick={() => setActiveTab('study_routine')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'study_routine'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>📅 স্টাডি রুটিন প্ল্যানার</span>
          </button>

          <button
            onClick={() => setActiveTab('formula_book')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'formula_book'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>💡 সূত্র ও শর্টকাট বুক</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 flex flex-col gap-4">
        {/* Onboarding Quick Card if student profile is empty */}
        {(!profile.name || !profile.educationLevel) && (
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-rose-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-indigo-100/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🎓</span>
              <h2 className="text-base sm:text-lg font-bold">
                তোমার ক্লাসের উপযোগী সেরা প্রস্তুতি শুরু করো!
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
              তোমার নাম ও শ্রেণি নির্ধারণ করলে টিউটর তোমার সিলেবাস অনুযায়ী সঠিক সমাধান ও কুইজ প্রদান করবে।
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-indigo-100 mb-1">
                  তোমার নাম:
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="যেমন: মোফাচ্ছির / রাহিম"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-indigo-100 mb-1">
                  তোমার শ্রেণি বা পরীক্ষা নির্বাচন করো:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CLASS_OPTIONS.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => handleSelectClass(cls.label)}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-indigo-900 border border-white/30 text-xs font-bold transition cursor-pointer"
                    >
                      {cls.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Specialized Tab Panels */}
        {activeTab === 'mcq_quiz' && (
          <div className="bg-white rounded-3xl p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  📝
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    লাইভ MCQ কুইজ ইঞ্জিন
                  </h3>
                  <p className="text-xs text-slate-500">
                    ৫টি স্ট্যান্ডার্ড প্রশ্ন, ক, খ, গ, ঘ বিকল্প এবং তাৎক্ষণিক মূল্যায়ন
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sendMessage(
                    `${profile.educationLevel || 'সাধারণ'} পরীক্ষার জন্য ৫টি গুরুত্বপূর্ণ MCQ কুইজ তৈরি করো। বিকল্প দাও ক, খ, গ, ঘ। শুরুতে উত্তর গোপন রাখো যাতে আমি পরীক্ষা দিতে পারি।`,
                    'mcq'
                  );
                  setActiveTab('chat');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>নতুন কুইজ শুরু করো 🚀</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
              <button
                onClick={() => {
                  sendMessage('গণিতের ত্রিকোণমিতি ও জ্যামিতি থেকে ৫টি MCQ কুইজ নাও।', 'mcq');
                  setActiveTab('chat');
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition text-left cursor-pointer"
              >
                📐 গণিত কুইজ
              </button>
              <button
                onClick={() => {
                  sendMessage('পদার্থবিজ্ঞান ও রসায়নের গুরুত্বপূর্ণ অধ্যায় থেকে ৫টি MCQ নাও।', 'mcq');
                  setActiveTab('chat');
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition text-left cursor-pointer"
              >
                🧪 বিজ্ঞান কুইজ
              </button>
              <button
                onClick={() => {
                  sendMessage('English Grammar (Tense, Voice, Preposition) থেকে ৫টি MCQ দাও।', 'mcq');
                  setActiveTab('chat');
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition text-left cursor-pointer"
              >
                🇬🇧 English Grammar
              </button>
              <button
                onClick={() => {
                  sendMessage('বিসিএস ও চাকরির পরীক্ষার জন্য বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলির ৫টি MCQ দাও।', 'mcq');
                  setActiveTab('chat');
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition text-left cursor-pointer"
              >
                🇧🇩 বাংলাদেশ ও বিশ্ব
              </button>
            </div>
          </div>
        )}

        {activeTab === 'study_routine' && (
          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                📅
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  ব্যক্তিগত স্টাডি রুটিন ও পরীক্ষার প্রস্তুতি প্ল্যানার
                </h3>
                <p className="text-xs text-slate-500">
                  তোমার সময় ও দুর্বলতা অনুযায়ী বিজ্ঞানসম্মত দৈনিক ও সাপ্তাহিক পড়ার সূচি
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পরীক্ষার আর বাকি (দিন):
                </label>
                <input
                  type="number"
                  value={routineDays}
                  onChange={(e) => setRoutineDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  প্রতিদিন পড়ার সময় (ঘণ্টা):
                </label>
                <input
                  type="number"
                  value={routineDailyHours}
                  onChange={(e) => setRoutineDailyHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  যে বিষয়গুলোতে দুর্বলতা বেশি:
                </label>
                <input
                  type="text"
                  value={routineWeakTopics}
                  onChange={(e) => setRoutineWeakTopics(e.target.value)}
                  placeholder="যেমন: গণিত, রসায়ন, ইংরেজি"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  sendMessage(
                    `আমার আসন্ন পরীক্ষার আর বাকি ${routineDays} দিন। আমি দৈনিক গড়ে ${routineDailyHours} ঘণ্টা সময় দিতে পারি। আমার দুর্বল বিষয়গুলো হলো: ${routineWeakTopics}। আমার জন্য প্রতিদিনের পড়ার স্লট, বিষয় রোটেশন, রিভিশন সময় এবং সাপ্তাহিক সেলফ-টেস্ট সহ সম্পূর্ণ পড়ার রুটিন তৈরি করে দাও।`,
                    'chat'
                  );
                  setActiveTab('chat');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>আমার পড়ার রুটিন তৈরি করো ✨</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'formula_book' && (
          <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                💡
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  সূত্র ব্যাংক ও কুইক শর্টনোটস (Formula & Shortcuts)
                </h3>
                <p className="text-xs text-slate-500">
                  পরীক্ষার আগে এক নজরে চোখ বুলিয়ে নেওয়ার জন্য সকল প্রয়োজনীয় সূত্র
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
              {[
                { title: '📐 বীজগণিত ও পাটিগণিত', query: 'বীজগণিতের সকল প্রয়োজনীয় সূত্র (বর্গ, ঘন, উৎপাদক) এবং শর্টকাট উদাহরণ সহ লিখে দাও।' },
                { title: '📏 ত্রিকোণমিতি ও জ্যামিতি', query: 'ত্রিকোণমিতির সকল অনুপাত, সূত্র, মান সারণি এবং জ্যামিতির গুরুত্বপূর্ণ উপপাদ্য দাও।' },
                { title: '⚡ পদার্থবিজ্ঞান সূত্র', query: 'পদার্থবিজ্ঞানের গতি, বল, কাজ-শক্তি-ক্ষমতা এবং আলোর সকল সূত্র ও একক লিখে দাও।' },
                { title: '🧪 রসায়ন বিক্রিয়া ও নিয়ম', query: 'রসায়নের গুরুত্বপূর্ণ সংকেত, যোজনী, রাসায়নিক বিক্রিয়া ও মোলারিটির সূত্র দাও।' },
                { title: '🧬 জীববিজ্ঞানের ছক', query: 'জীববিজ্ঞানের গুরুত্বপূর্ণ চিত্রভিত্তিক নাম, বৈশিষ্ট্য ও শ্রেণিবিন্যাস সংক্ষেপে দাও।' },
                { title: '💻 ICT ও বাইনারি', query: 'ICT-এর সংখ্যা পদ্ধতির রূপান্তর (বাইনারি, ডেসিমাল, হেক্সাডেসিমাল) এবং লজিক গেটের সূত্র দাও।' },
                { title: '✍️ বাংলা ব্যাকরণ নিয়ম', query: 'বাংলা ২য় পত্রের সন্ধি, সমাস, কারক ও প্রত্যয়ের সহজ চেনার নিয়ম ও টেকনিক দাও।' },
                { title: '🇬🇧 English Grammar Rules', query: 'Right Form of Verbs, Narration এবং Transformation of Sentences এর গোল্ডেন রুলস দাও।' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sendMessage(item.query, 'chat');
                    setActiveTab('chat');
                  }}
                  className="p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-left transition cursor-pointer"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Learning Goals Strip */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-semibold">
          <span className="text-slate-400 shrink-0 text-[11px] font-bold uppercase tracking-wider pl-1">
            🎯 আজকের লক্ষ্য:
          </span>
          {QUICK_GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => sendMessage(goal.query, 'chat')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 shrink-0 transition cursor-pointer border border-transparent hover:border-indigo-200"
            >
              {goal.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Feed */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between min-h-[440px]">
          <div className="space-y-5 overflow-y-auto max-h-[560px] pr-1">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-bold text-slate-500">
                      {isUser ? (profile.name ? profile.name : 'তুমি') : 'StudyMate BD 🎓'}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[94%] sm:max-w-[85%] rounded-3xl px-4 sm:px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* If user attached an image */}
                    {msg.image && (
                      <div className="mb-3">
                        <div className="relative inline-block rounded-2xl overflow-hidden border border-white/20 max-h-64 shadow-md bg-black/10">
                          <img
                            src={msg.image.data.startsWith('data:') ? msg.image.data : `data:${msg.image.mimeType};base64,${msg.image.data}`}
                            alt="Uploaded question or handwritten math"
                            className="max-h-60 max-w-full object-contain cursor-pointer hover:opacity-95 transition"
                            onClick={() =>
                              setZoomImage(
                                msg.image?.data.startsWith('data:')
                                  ? msg.image.data
                                  : `data:${msg.image?.mimeType};base64,${msg.image?.data}`
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              setZoomImage(
                                msg.image?.data.startsWith('data:')
                                  ? msg.image.data
                                  : `data:${msg.image?.mimeType};base64,${msg.image?.data}`
                              )
                            }
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition"
                            title="বড় করে দেখুন"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-300 font-medium">
                          📸 আপলোডকৃত প্রশ্ন / অঙ্ক
                        </div>
                      </div>
                    )}

                    {/* Message Body Content */}
                    {!msg.text ? (
                      <div className="flex items-start gap-3 py-1.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                          {isDifficultQuestion ? '🧠' : '🎓'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm">
                            <span>
                              {isDifficultQuestion
                                ? 'প্রশ্নটির উত্তর গভীর মনোযোগে সমাধান হচ্ছে...'
                                : 'শিক্ষক প্রশ্নটি গভীরভাবে বুঝে উত্তর তৈরি করছেন...'}
                            </span>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            {isDifficultQuestion
                              ? '👨‍🏫 কোনো ভুল যেন না হয়, শিক্ষক প্রতিটি সূত্র, উপাত্ত ও গাণিতিক হিসাব পুঙ্খানুপুঙ্খ যাচাই করছেন...'
                              : '👨‍🏫 শিক্ষক তোমার প্রশ্নটি নিখুঁতভাবে বিশ্লেষণ করে সহজ ভাষায় উত্তর সাজাচ্ছেন...'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-sans space-y-2">
                        {msg.text}
                      </div>
                    )}

                    {/* Copy button on User message */}
                    {isUser && msg.text && (
                      <div className="mt-2 pt-1 border-t border-indigo-400/30 flex justify-end">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="px-2 py-0.5 rounded text-[10px] text-indigo-100 hover:text-white hover:bg-white/10 flex items-center gap-1 cursor-pointer transition font-medium"
                          title="লেখাটি কপি করুন"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-300" />
                              <span className="text-emerald-300">কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>কপি</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Tool Bar on Model Messages: Copy, TTS, Math Actions */}
                    {!isUser && msg.text && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                            title="কপি করুন"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">কপি হয়েছে</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>কপি</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleSpeak(msg.text)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                            title="পড়ে শোনান"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>শুনুন</span>
                          </button>
                        </div>

                        {/* Quick contextual follow-ups */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              sendMessage(
                                'এই নিয়মের ওপর আমাকে আরও ২টি সহজ অনুশীলন দাও যাতে বিষয়টি পরিষ্কার হয়।',
                                'chat'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition cursor-pointer"
                          >
                            + আরও ২টি অনুশীলন
                          </button>

                          <button
                            onClick={() =>
                              sendMessage(
                                'এই অধ্যায় থেকে ৫টি গুরুত্বপূর্ণ MCQ কুইজ দিয়ে আমার প্রস্তুতি যাচাই করো।',
                                'mcq'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold transition cursor-pointer"
                          >
                            MCQ কুইজ 📝
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (!messages.length || messages[messages.length - 1].role === 'user') && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 text-white flex items-center justify-center font-bold text-xs animate-pulse shrink-0">
                  {isDifficultQuestion ? '🧠' : '🎓'}
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3 border border-slate-200 flex flex-col gap-1 text-xs text-slate-700 shadow-2xs max-w-md">
                  <div className="flex items-center gap-2 font-bold text-indigo-950">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span>
                      {isDifficultQuestion
                        ? 'প্রশ্নটির উত্তর গভীর মনোযোগে সমাধান হচ্ছে...'
                        : 'শিক্ষক গভীর মনোযোগ দিয়ে প্রশ্নটি বিশ্লেষণ করছেন...'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isDifficultQuestion
                      ? 'শতভাগ নির্ভুলতা নিশ্চিত করতে শিক্ষক প্রতিটি সূত্র, উপাত্ত ও গণনা সতর্কতার সাথে প্রস্তুত করছেন 🔍'
                      : 'শিক্ষক সহজ ভাষায় নিখুঁত ব্যাখ্যা তৈরি করছেন ⚡'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Uploaded Image Card Pending Submission */}
          {selectedImage && (
            <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedImage.previewUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-indigo-300"
                  />
                  <div>
                    <div className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <span>📸 ছবির প্রশ্ন প্রস্তুত</span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded-md">
                        {selectedImage.file?.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700">
                      নিচে থেকে আপনার প্রয়োজন নির্বাচন করুন অথবা লিখে পাঠান:
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 rounded-full bg-indigo-200/80 hover:bg-rose-100 hover:text-rose-600 text-indigo-700 transition"
                  title="ছবি বাতিল"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mandatory 6 Quick Actions for Image as per prompt specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      'এই অঙ্কের/প্রশ্নের সবচেয়ে সহজ ও ধাপে ধাপে সম্পূর্ণ সমাধান (Step-by-Step Solution) তৈরি করো।',
                      'solve'
                    )
                  }
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 shadow-2xs transition text-left cursor-pointer flex items-center gap-1"
                >
                  <span>১. ✍️ সম্পূর্ণ সমাধান</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage('এই প্রশ্নটির সহজ ব্যাখ্যা ও মৌলিক ধারণা বুঝিয়ে দাও।', 'explain')
                  }
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 shadow-2xs transition text-left cursor-pointer flex items-center gap-1"
                >
                  <span>২. 📖 সহজ ব্যাখ্যা</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage('ছবির MCQ-এর সঠিক উত্তর এবং কেন এটি সঠিক তা বুঝিয়ে দাও।', 'mcq')
                  }
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 shadow-2xs transition text-left cursor-pointer flex items-center gap-1"
                >
                  <span>৩. 📝 MCQ উত্তর ও কারণ</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage('এই ছবিতে ব্যবহৃত সূত্র বা নিয়মাবলি বিস্তারিত বুঝিয়ে দাও।', 'rule')
                  }
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 shadow-2xs transition text-left cursor-pointer flex items-center gap-1"
                >
                  <span>৪. 💡 সূত্র ও নিয়ম</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      'ছবিতে আমার করা সমাধানের ভুল খুঁজে বের করো এবং কীভাবে সঠিক করতে হবে তা দেখাও।',
                      'find_mistake'
                    )
                  }
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 shadow-2xs transition text-left cursor-pointer flex items-center gap-1"
                >
                  <span>৫. 🔍 সমাধানের ভুল খোঁজা</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    sendMessage(
                      'পরীক্ষার খাতায় সর্বোচ্চ নম্বর পাওয়ার মতো পূর্ণাঙ্গ সৃজনশীল/লিখিত উত্তর তৈরি করো।',
                      'exam_write'
                    )
                  }
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 shadow-2xs transition text-left cursor-pointer flex items-center gap-1"
                >
                  <span>৬. 📚 পরীক্ষায় লেখার উত্তর</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Chat Input Area */}
          <div
            onPaste={handlePaste}
            className="mt-4 pt-3 border-t border-slate-100"
          >
            {/* Quick Tips / Keyboard hint */}
            <div className="flex items-center justify-between gap-2 px-1 pb-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                  Enter
                </span>
                <span>= সেন্ড</span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                  Shift + Enter
                </span>
                <span>= নিচের লাইন</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <span>ছবি বা লেখা সরাসরি</span>
                  <span className="font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                    Ctrl + V
                  </span>
                  <span>পেস্ট করুন</span>
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isLoading && (inputText.trim() || selectedImage)) {
                  sendMessage();
                }
              }}
              className="flex items-end gap-2"
            >
              {/* Hidden file input for image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition shrink-0 cursor-pointer mb-0.5"
                title="অঙ্ক বা বইয়ের পাতার ছবি তুলুন / আপলোড করুন (বা সরাসরি পেস্ট করুন)"
              >
                <Camera className="w-5 h-5" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (e.shiftKey) {
                        // Shift + Enter: Allow natural newline insertion without sending
                        return;
                      }
                      // Regular Enter: Send message
                      e.preventDefault();
                      if (!isLoading && (inputText.trim() || selectedImage)) {
                        sendMessage();
                      }
                    }
                  }}
                  placeholder={
                    selectedImage
                      ? 'ছবি সম্পর্কে কোনো নির্দিষ্ট প্রশ্ন থাকলে লিখুন... (Enter = সেন্ড, Shift+Enter = নিচের লাইন)'
                      : 'তোমার প্রশ্ন, অঙ্ক বা পড়ার বিষয় বাংলায় লিখো... (Enter = সেন্ড, Shift+Enter = নিচের লাইন)'
                  }
                  disabled={isLoading}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none min-h-[46px] max-h-36 overflow-y-auto leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:opacity-95 text-white shadow-md disabled:opacity-40 transition shrink-0 cursor-pointer mb-0.5"
                title="পাঠিয়ে দিন (Enter)"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {/* Mandatory Brand Footer */}
            <div className="mt-3 text-center">
              <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">
                  The MoSaFa StudyMate BD! 🎓
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto bg-black rounded-3xl p-2">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={zoomImage} alt="Zoomed view" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
