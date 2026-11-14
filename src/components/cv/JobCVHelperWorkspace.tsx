import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Upload,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Save,
  Trash2,
  Copy,
  Download,
  Printer,
  Edit3,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Plus,
  SkipForward,
  RotateCcw,
  FolderOpen,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Camera,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ApplicantInterviewProfile,
  CVData,
  CVTailoringReport,
  CircularAnalysis,
  EducationItem,
  InterviewMessage,
  LanguageItem,
  ReferenceItem,
  SavedJobCV,
  WorkExperience,
} from '../../types/cvMaker';
import { CV_CATEGORIES, CV_TEMPLATES } from '../../data/cvTemplates';
import { CVRenderer } from './CVRenderer';
import { PassportPhotoCropper } from './PassportPhotoCropper';
import { exportCvToDocx } from '../../utils/cvDocxExport';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

interface JobCVHelperWorkspaceProps {
  onApplyToMainEditor: (cvData: CVData, templateId: string, openTab?: 'editor' | 'preview') => void;
  onTriggerPdfDownload: (cvData: CVData, templateId: string) => void;
  onTriggerPrint: (cvData: CVData, templateId: string) => void;
  onShowToast: (message: string, icon?: string) => void;
  initialView?: 'hub' | 'interview' | 'result' | 'saved' | 'profile';
}

const EMPTY_APPLICANT_PROFILE: ApplicantInterviewProfile = {
  fullName: '',
  fatherName: '',
  motherName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  presentAddress: '',
  permanentAddress: '',
  city: '',
  country: 'Bangladesh',
  nationality: 'Bangladeshi',
  linkedin: '',
  portfolio: '',
  github: '',
  photoUrl: '',
  signatureUrl: '',
  targetCompany: '',
  targetJobTitle: '',
  careerGoalNote: '',
  strongestQualities: '',
  hasWorkExperience: null,
  education: [],
  experience: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  trainings: [],
  awards: [],
  references: [],
  drivingLicense: '',
  professionalMembership: '',
  applyingAbroad: '',
  noticePeriod: '',
  expectedSalary: '',
  currentlyEmployed: '',
  preferredCvLanguage: 'en',
};

function getDraftStorageKey(uid?: string | null): string {
  return `mosafa_job_cv_helper_draft_${uid || 'guest'}_v1`;
}

function getLocalLibraryKey(uid?: string | null): string {
  return `mosafa_job_cv_helper_lib_${uid || 'guest'}_v1`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('ফাইল পড়া সম্ভব হয়নি।'));
    reader.readAsDataURL(file);
  });
}

function cleanUiErrorMessage(err: any, fallback: string): string {
  const raw = String(err?.message || err || '').trim();
  if (!raw) return fallback;
  const lower = raw.toLowerCase();
  if (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('429')
  ) {
    return 'AI সার্ভারে এই মুহূর্তে সাময়িক চাপ রয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পর "আবার চেষ্টা করুন" চাপুন।';
  }
  try {
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw);
      if (parsed?.error?.message) return String(parsed.error.message);
    }
  } catch {
    // ignore
  }
  return raw;
}

export const JobCVHelperWorkspace: React.FC<JobCVHelperWorkspaceProps> = ({
  onApplyToMainEditor,
  onTriggerPdfDownload,
  onTriggerPrint,
  onShowToast,
  initialView = 'hub',
}) => {
  const { user, isLoggedIn } = useAuth();
  const uid = user?.uid || null;

  const [view, setView] = useState<'hub' | 'interview' | 'result' | 'saved' | 'profile'>(initialView);
  const [uiLanguage, setUiLanguage] = useState<'bn' | 'en'>('bn');

  // Persistent Saved Profile & Saved CVs (Strictly isolated per uid)
  const [savedProfile, setSavedProfile] = useState<ApplicantInterviewProfile>(EMPTY_APPLICANT_PROFILE);
  const [savedCvs, setSavedCvs] = useState<SavedJobCV[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState<boolean>(false);

  // Interview Session State
  const [profile, setProfile] = useState<ApplicantInterviewProfile>(EMPTY_APPLICANT_PROFILE);
  const [circularAnalysis, setCircularAnalysis] = useState<CircularAnalysis | null>(null);
  const [pendingCircularReview, setPendingCircularReview] = useState<CircularAnalysis | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentStepKey, setCurrentStepKey] = useState<string>('personal_name');
  const [progressPercent, setProgressPercent] = useState<number>(5);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [allowSkip, setAllowSkip] = useState<boolean>(false);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState<boolean>(false);

  // Inputs & Modals inside Chat
  const [chatInput, setChatInput] = useState<string>('');
  const [circularPasteText, setCircularPasteText] = useState<string>('');
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);
  const [isAiBusy, setIsAiBusy] = useState<boolean>(false);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState<boolean>(false);
  const [isGeneratingCv, setIsGeneratingCv] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string>('');
  const [retryHandler, setRetryHandler] = useState<(() => void) | null>(null);

  // Inline Multi-Entry Draft States (Education, Certificate Extract, Experience, Skills, Languages, References)
  const [eduDraft, setEduDraft] = useState<Omit<EducationItem, 'id'>>({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    details: '',
  });
  const [pendingCertExtract, setPendingCertExtract] = useState<Omit<EducationItem, 'id'> | null>(null);

  const [expDraft, setExpDraft] = useState<Omit<WorkExperience, 'id'>>({
    jobTitle: '',
    employer: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: '',
  });

  const [skillDraft, setSkillDraft] = useState<string>('');
  const [langDraft, setLangDraft] = useState<{ language: string; proficiency: string }>({
    language: 'English',
    proficiency: 'Fluent',
  });
  const [refDraft, setRefDraft] = useState<Omit<ReferenceItem, 'id'>>({
    name: '',
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
  });

  // Undo / Back history stack of snapshots
  const [undoStack, setUndoStack] = useState<
    Array<{
      profile: ApplicantInterviewProfile;
      stepKey: string;
      progressPercent: number;
      messages: InterviewMessage[];
    }>
  >([]);

  // Generated Output State
  const [generatedCv, setGeneratedCv] = useState<CVData | null>(null);
  const [tailoringReport, setTailoringReport] = useState<CVTailoringReport | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl-01');
  const [cvLanguage, setCvLanguage] = useState<'en' | 'bn'>('en');
  const [activeResultCvId, setActiveResultCvId] = useState<string | null>(null);
  const [templateCatFilter, setTemplateCatFilter] = useState<string>('all');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [isDownloadingDocx, setIsDownloadingDocx] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Sync with initialView when parent switches explicitly
  useEffect(() => {
    setView(initialView);
    if (initialView === 'interview' && messages.length === 0) {
      startNewInterview(Boolean(savedProfile.fullName));
    }
  }, [initialView]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStepKey, pendingCircularReview, pendingCertExtract]);

  // Helper to get Bearer token
  const getAuthToken = async (): Promise<string | null> => {
    try {
      return (await auth.currentUser?.getIdToken()) || null;
    } catch {
      return null;
    }
  };

  // Load UID-isolated Library (Server + Firestore + Local cache)
  useEffect(() => {
    let cancelled = false;
    const loadLibrary = async () => {
      // Immediately clear previous user's view when UID changes
      setSavedProfile(EMPTY_APPLICANT_PROFILE);
      setSavedCvs([]);

      // Restore draft if present for this UID
      try {
        const draftRaw = localStorage.getItem(getDraftStorageKey(uid));
        if (draftRaw) {
          const parsedDraft = JSON.parse(draftRaw);
          if (parsedDraft?.profile) setProfile(parsedDraft.profile);
          if (parsedDraft?.circularAnalysis) setCircularAnalysis(parsedDraft.circularAnalysis);
          if (Array.isArray(parsedDraft?.messages)) setMessages(parsedDraft.messages);
          if (parsedDraft?.currentStepKey) setCurrentStepKey(parsedDraft.currentStepKey);
          if (typeof parsedDraft?.progressPercent === 'number') setProgressPercent(parsedDraft.progressPercent);
        }
      } catch {
        // ignore draft parse errors
      }

      // Restore UID-scoped local cache first
      try {
        const localLibRaw = localStorage.getItem(getLocalLibraryKey(uid));
        if (localLibRaw) {
          const localLib = JSON.parse(localLibRaw);
          if (localLib?.profile) setSavedProfile(localLib.profile);
          if (Array.isArray(localLib?.savedCvs)) setSavedCvs(localLib.savedCvs);
        }
      } catch {
        // ignore
      }

      if (!uid) return;
      setIsLibraryLoading(true);
      try {
        const token = await getAuthToken();
        if (token) {
          const resp = await fetch('/api/cv-helper/library', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            const json = await resp.json();
            if (!cancelled && json.success) {
              const nextProfile = json.profile || EMPTY_APPLICANT_PROFILE;
              const nextCvs = Array.isArray(json.savedCvs) ? json.savedCvs : [];
              setSavedProfile(nextProfile);
              setSavedCvs(nextCvs);
              localStorage.setItem(
                getLocalLibraryKey(uid),
                JSON.stringify({ profile: nextProfile, savedCvs: nextCvs })
              );
              setIsLibraryLoading(false);
              return;
            }
          }
        }

        // Fallback check Firestore directly for this UID
        const profSnap = await getDoc(doc(db, 'users', uid, 'cvProfile', 'main'));
        const cvsSnap = await getDocs(collection(db, 'users', uid, 'savedCvs'));
        if (!cancelled) {
          const fsProfile = profSnap.exists() ? (profSnap.data() as ApplicantInterviewProfile) : EMPTY_APPLICANT_PROFILE;
          const fsCvs = cvsSnap.docs.map((d) => d.data() as SavedJobCV);
          setSavedProfile(fsProfile);
          setSavedCvs(fsCvs);
        }
      } catch (err) {
        console.warn('[JobCVHelper] Load library note:', err);
      } finally {
        if (!cancelled) setIsLibraryLoading(false);
      }
    };

    loadLibrary();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Autosave interview draft per UID
  useEffect(() => {
    if (messages.length === 0 && !profile.fullName) return;
    try {
      localStorage.setItem(
        getDraftStorageKey(uid),
        JSON.stringify({
          profile,
          circularAnalysis,
          messages,
          currentStepKey,
          progressPercent,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [profile, circularAnalysis, messages, currentStepKey, progressPercent, uid]);

  // Save Profile privately to Server + Firestore + UID Local Cache
  const persistSavedProfile = async (nextProf: ApplicantInterviewProfile) => {
    setSavedProfile(nextProf);
    try {
      localStorage.setItem(
        getLocalLibraryKey(uid),
        JSON.stringify({ profile: nextProf, savedCvs })
      );
    } catch {
      // ignore
    }

    if (!uid) {
      onShowToast('প্রোফাইল ব্রাউজারে সেভ হয়েছে। সব ডিভাইসে সিঙ্ক করতে লগইন করুন।', '💾');
      return;
    }

    try {
      const token = await getAuthToken();
      if (token) {
        await fetch('/api/cv-helper/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profile: nextProf }),
        });
      }
      await setDoc(doc(db, 'users', uid, 'cvProfile', 'main'), {
        ...nextProf,
        userId: uid,
        updatedAt: new Date().toISOString(),
      });
      onShowToast('আপনার ব্যক্তিগত প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!', '✅');
    } catch (err) {
      console.warn('[JobCVHelper] Profile sync note:', err);
      onShowToast('প্রোফাইল স্থানীয়ভাবে সেভ হয়েছে।', '💾');
    }
  };

  // Save a Generated CV privately
  const persistSavedCv = async (cvToSave: SavedJobCV) => {
    const updatedList = [cvToSave, ...savedCvs.filter((c) => c.id !== cvToSave.id)];
    setSavedCvs(updatedList);
    try {
      localStorage.setItem(
        getLocalLibraryKey(uid),
        JSON.stringify({ profile: savedProfile, savedCvs: updatedList })
      );
    } catch {
      // ignore
    }

    if (!uid) {
      onShowToast('CV সংরক্ষণ হয়েছে! স্থায়ী ক্লাউড ব্যাকআপের জন্য লগইন করুন।', '💾');
      return;
    }

    try {
      const token = await getAuthToken();
      if (token) {
        await fetch(`/api/cv-helper/cvs/${encodeURIComponent(cvToSave.id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cv: cvToSave }),
        });
      }
      await setDoc(doc(db, 'users', uid, 'savedCvs', cvToSave.id), {
        ...cvToSave,
        userId: uid,
      });
      onShowToast('আপনার ব্যক্তিগত CV লাইব্রেরিতে সংরক্ষিত হয়েছে!', '✅');
    } catch (err) {
      console.warn('[JobCVHelper] Save CV sync note:', err);
      onShowToast('CV সংরক্ষিত হয়েছে।', '💾');
    }
  };

  const handleDeleteSavedCv = async (cvId: string) => {
    const updatedList = savedCvs.filter((c) => c.id !== cvId);
    setSavedCvs(updatedList);
    try {
      localStorage.setItem(
        getLocalLibraryKey(uid),
        JSON.stringify({ profile: savedProfile, savedCvs: updatedList })
      );
    } catch {
      // ignore
    }

    if (uid) {
      try {
        const token = await getAuthToken();
        if (token) {
          await fetch(`/api/cv-helper/cvs/${encodeURIComponent(cvId)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        await deleteDoc(doc(db, 'users', uid, 'savedCvs', cvId));
      } catch {
        // ignore
      }
    }
    onShowToast('CV মুছে ফেলা হয়েছে।', '🗑️');
  };

  // Start / Restart Conversational AI Interview
  const startNewInterview = (seedFromSavedProfile: boolean, customGreeting?: string) => {
    setErrorBanner('');
    const baseProfile: ApplicantInterviewProfile = seedFromSavedProfile
      ? {
          ...EMPTY_APPLICANT_PROFILE,
          ...savedProfile,
          // Reset job-specific fields for a fresh job application
          targetCompany: '',
          targetJobTitle: '',
          careerGoalNote: '',
        }
      : { ...EMPTY_APPLICANT_PROFILE };

    setProfile(baseProfile);
    setCircularAnalysis(null);
    setPendingCircularReview(null);
    setUndoStack([]);
    setGeneratedCv(null);
    setTailoringReport(null);
    setActiveResultCvId(null);
    setIsReadyToGenerate(false);
    setSuggestedSkills([]);

    const hasBasicPersonal = Boolean(baseProfile.fullName && (baseProfile.phone || baseProfile.email));
    const initialStep = hasBasicPersonal ? 'circular_or_role' : 'personal_name';
    const initialProgress = hasBasicPersonal ? 35 : 6;

    const welcomeMsg: InterviewMessage = {
      id: `ai-${Date.now()}`,
      role: 'ai',
      stepKey: initialStep,
      text:
        customGreeting ||
        (hasBasicPersonal
          ? uiLanguage === 'bn'
            ? `স্বাগতম ${baseProfile.fullName}! আপনার সংরক্ষিত প্রোফাইল থেকে ব্যক্তিগত, শিক্ষা ও অভিজ্ঞতার তথ্য লোড করা হয়েছে।\n\nএখন বলুন — আপনি কোন কোম্পানি বা প্রতিষ্ঠানে এবং কোন পদের জন্য আবেদন করতে চান? চাইলে নিচের "সার্কুলার আপলোড" বাটন থেকে চাকরির বিজ্ঞপ্তিটিও দিতে পারেন।`
            : `Welcome back, ${baseProfile.fullName}! Your saved personal, education, and experience profile is loaded.\n\nWhich company and job position are you applying for? You can also upload the job circular below.`
          : uiLanguage === 'bn'
          ? 'আসসালামু আলাইকুম / স্বাগতম! আমি আপনার AI ক্যারিয়ার কনসালট্যান্ট। একটি চাকরিভিত্তিক ও প্রফেশনাল CV তৈরিতে আমি আপনাকে ধাপে ধাপে সাহায্য করব।\n\nশুরুতেই জানতে চাই — আপনার পূর্ণ নাম কী?'
          : 'Welcome! I am your AI Career Consultant. I will guide you step-by-step to build a tailored, job-winning CV.\n\nTo begin, what is your full name?'),
      quickReplies: hasBasicPersonal
        ? ['সার্কুলার ছাড়াই পদ লিখব']
        : [],
      timestamp: new Date().toISOString(),
    };

    setCurrentStepKey(initialStep);
    setProgressPercent(initialProgress);
    setQuickReplies(welcomeMsg.quickReplies || []);
    setMessages([welcomeMsg]);
    setView('interview');
  };

  // Call Server AI Interview Step
  const advanceInterview = async (
    answerText: string,
    overrideProfile?: ApplicantInterviewProfile,
    overrideCircular?: CircularAnalysis | null,
    attachmentLabel?: { name: string; type: 'circular' | 'certificate' | 'photo' | 'signature' }
  ) => {
    const activeProfile = overrideProfile || profile;
    const activeCircular = overrideCircular !== undefined ? overrideCircular : circularAnalysis;
    const prevMessages = messages;

    setErrorBanner('');
    setRetryHandler(null);
    setUndoStack((prev) => [
      ...prev.slice(-12),
      { profile: activeProfile, stepKey: currentStepKey, progressPercent, messages: prevMessages },
    ]);

    const userMsg: InterviewMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: answerText,
      stepKey: currentStepKey,
      attachmentName: attachmentLabel?.name,
      attachmentType: attachmentLabel?.type,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...prevMessages, userMsg];
    setMessages(nextHistory);
    setChatInput('');
    setIsAiBusy(true);

    try {
      const resp = await fetch('/api/cv-helper/interview-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectedProfile: activeProfile,
          circularAnalysis: activeCircular,
          conversationHistory: nextHistory,
          lastStepKey: currentStepKey,
          userAnswer: answerText,
          uiLanguage,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.error || 'AI পরামর্শদাতার উত্তর পাওয়া যায়নি।');
      }

      const turn = json.turn || {};
      const updates = turn.profileUpdates || {};

      // Merge non-empty updates safely into activeProfile
      const mergedProfile: ApplicantInterviewProfile = { ...activeProfile };
      const stringFields: Array<keyof ApplicantInterviewProfile> = [
        'fullName',
        'fatherName',
        'motherName',
        'dateOfBirth',
        'phone',
        'email',
        'presentAddress',
        'permanentAddress',
        'city',
        'country',
        'nationality',
        'linkedin',
        'portfolio',
        'github',
        'targetCompany',
        'targetJobTitle',
        'careerGoalNote',
        'strongestQualities',
        'drivingLicense',
        'professionalMembership',
        'applyingAbroad',
        'noticePeriod',
        'expectedSalary',
        'currentlyEmployed',
      ];

      for (const field of stringFields) {
        const val = updates[field];
        if (typeof val === 'string' && val.trim()) {
          (mergedProfile as any)[field] = val.trim();
        }
      }

      if (updates.hasWorkExperienceStr === 'yes' || updates.hasWorkExperienceStr === 'true') {
        mergedProfile.hasWorkExperience = true;
      } else if (updates.hasWorkExperienceStr === 'no' || updates.hasWorkExperienceStr === 'false') {
        mergedProfile.hasWorkExperience = false;
      }

      if (updates.preferredCvLanguage === 'bn' || updates.preferredCvLanguage === 'en') {
        mergedProfile.preferredCvLanguage = updates.preferredCvLanguage;
        setCvLanguage(updates.preferredCvLanguage);
      }

      if (Array.isArray(updates.addSkills) && updates.addSkills.length > 0) {
        const existingNames = new Set(mergedProfile.skills.map((s) => s.name.toLowerCase()));
        for (const skName of updates.addSkills) {
          if (typeof skName === 'string' && skName.trim() && !existingNames.has(skName.trim().toLowerCase())) {
            mergedProfile.skills.push({
              id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: skName.trim(),
              category: 'technical',
            });
            existingNames.add(skName.trim().toLowerCase());
          }
        }
      }

      if (Array.isArray(updates.addTrainings) && updates.addTrainings.length > 0) {
        const setT = new Set(mergedProfile.trainings);
        updates.addTrainings.forEach((t: string) => t?.trim() && setT.add(t.trim()));
        mergedProfile.trainings = Array.from(setT);
      }

      if (Array.isArray(updates.addAwards) && updates.addAwards.length > 0) {
        const setA = new Set(mergedProfile.awards);
        updates.addAwards.forEach((a: string) => a?.trim() && setA.add(a.trim()));
        mergedProfile.awards = Array.from(setA);
      }

      setProfile(mergedProfile);

      const nextStep = turn.stepKey || currentStepKey;
      const aiMsg: InterviewMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: turn.assistantMessage || 'পরবর্তী তথ্যটি দিন।',
        stepKey: nextStep,
        quickReplies: Array.isArray(turn.quickReplies) ? turn.quickReplies : [],
        suggestedSkills: Array.isArray(turn.suggestedSkills) ? turn.suggestedSkills : [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setCurrentStepKey(nextStep);
      setProgressPercent(Math.min(100, Math.max(5, Number(turn.progressPercent) || progressPercent + 8)));
      setQuickReplies(aiMsg.quickReplies || []);
      setSuggestedSkills(aiMsg.suggestedSkills || []);
      setAllowSkip(Boolean(turn.allowSkip));
      setIsReadyToGenerate(Boolean(turn.isReadyToGenerate || nextStep === 'ready_to_generate'));
    } catch (err: any) {
      // Roll back optimistic message and undo snapshot so failed requests never leave duplicate bubbles
      setMessages(prevMessages);
      setUndoStack((prev) => prev.slice(0, -1));
      if (!attachmentLabel) {
        setChatInput(answerText);
      }
      setErrorBanner(cleanUiErrorMessage(err, 'সার্ভারের সাথে যোগাযোগ করতে সমস্যা হয়েছে।'));
      setRetryHandler(() => () => {
        void advanceInterview(answerText, overrideProfile, overrideCircular, attachmentLabel);
      });
    } finally {
      setIsAiBusy(false);
    }
  };

  // Undo / Back to Previous Question
  const handleStepBack = () => {
    if (undoStack.length === 0 || isAiBusy) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setProfile(prev.profile);
    setCurrentStepKey(prev.stepKey);
    setProgressPercent(prev.progressPercent);
    setMessages(prev.messages);
    const lastAi = [...prev.messages].reverse().find((m) => m.role === 'ai');
    setQuickReplies(lastAi?.quickReplies || []);
    setSuggestedSkills(lastAi?.suggestedSkills || []);
    setIsReadyToGenerate(false);
  };

  // Upload & Analyze Job Circular (PDF, Image, DOCX, TXT)
  const handleCircularUpload = async (file: File) => {
    setErrorBanner('');
    setIsAnalyzingDoc(true);
    try {
      const base64 = await fileToBase64(file);
      const resp = await fetch('/api/cv-helper/analyze-circular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          mimeType: file.type,
          fileName: file.name,
          uiLanguage,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.error || 'সার্কুলার বিশ্লেষণ করা যায়নি।');
      }
      setPendingCircularReview(json.analysis);
      onShowToast('চাকরির সার্কুলার বিশ্লেষণ সম্পন্ন হয়েছে! তথ্য নিশ্চিত করুন।', '📄');
    } catch (err: any) {
      setErrorBanner(err?.message || 'সার্কুলার পড়তে সমস্যা হয়েছে।');
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const handleAnalyzePastedCircular = async () => {
    if (!circularPasteText.trim()) return;
    setErrorBanner('');
    setIsAnalyzingDoc(true);
    try {
      const resp = await fetch('/api/cv-helper/analyze-circular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: circularPasteText.trim(),
          fileName: 'Pasted Circular Text',
          uiLanguage,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.error || 'সার্কুলার বিশ্লেষণ করা যায়নি।');
      }
      setPendingCircularReview(json.analysis);
      setShowPasteBox(false);
      setCircularPasteText('');
    } catch (err: any) {
      setErrorBanner(err?.message || 'সার্কুলার বিশ্লেষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const handleConfirmCircular = async () => {
    if (!pendingCircularReview) return;
    const confirmed = pendingCircularReview;
    setCircularAnalysis(confirmed);
    setPendingCircularReview(null);

    const updatedProf: ApplicantInterviewProfile = {
      ...profile,
      targetCompany: confirmed.organizationName || profile.targetCompany,
      targetJobTitle: confirmed.jobTitle || profile.targetJobTitle,
      preferredCvLanguage: confirmed.suggestedCvLanguage || 'en',
    };
    setProfile(updatedProf);
    setCvLanguage(updatedProf.preferredCvLanguage);

    const summaryText = `সার্কুলার নিশ্চিত করেছি: ${confirmed.jobTitle || 'Target Role'}${
      confirmed.organizationName ? ` (${confirmed.organizationName})` : ''
    }`;
    await advanceInterview(summaryText, updatedProf, confirmed, {
      name: confirmed.sourceFileName || 'Job Circular',
      type: 'circular',
    });
  };

  // Extract Education Certificate / Marksheet
  const handleCertificateUpload = async (file: File) => {
    setErrorBanner('');
    setIsAnalyzingDoc(true);
    try {
      const base64 = await fileToBase64(file);
      const resp = await fetch('/api/cv-helper/extract-education-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          mimeType: file.type,
          fileName: file.name,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.error || 'সার্টিফিকেট থেকে তথ্য পাওয়া যায়নি।');
      }
      const ex = json.education || {};
      setPendingCertExtract({
        degree: ex.degree || '',
        institution: ex.institution || '',
        fieldOfStudy: ex.fieldOfStudy || '',
        location: ex.location || '',
        startDate: ex.startDate || '',
        endDate: ex.endDate || '',
        gpa: ex.gpa || '',
        details: ex.details || '',
      });
      onShowToast('সার্টিফিকেটের তথ্য extracted হয়েছে! যাচাই করে যুক্ত করুন।', '🎓');
    } catch (err: any) {
      setErrorBanner(err?.message || 'সার্টিফিকেট পড়তে ব্যর্থ হয়েছে।');
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  // Confirm & Generate Final Tailored CV
  const handleGenerateFinalCv = async (langOverride?: 'en' | 'bn') => {
    const targetLang = langOverride || profile.preferredCvLanguage || cvLanguage || 'en';
    setErrorBanner('');
    setIsGeneratingCv(true);

    try {
      const resp = await fetch('/api/cv-helper/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          circularAnalysis,
          cvLanguage: targetLang,
          uiLanguage,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        throw new Error(json.error || 'CV জেনারেট করতে সমস্যা হয়েছে।');
      }

      const nextCv: CVData = json.cvData;
      const report: CVTailoringReport = json.tailoringReport;
      const bestTemplateId = report?.recommendedTemplateIds?.[0] || 'tmpl-01';

      setGeneratedCv(nextCv);
      setTailoringReport(report);
      setSelectedTemplateId(bestTemplateId);
      setCvLanguage(targetLang);

      const newId = activeResultCvId || `jobcv_${Date.now()}`;
      setActiveResultCvId(newId);

      // Persist both reusable master profile & this generated CV
      const cvRecord: SavedJobCV = {
        id: newId,
        title: `${profile.targetJobTitle || nextCv.personal.jobTitle || 'Professional CV'} — ${
          profile.targetCompany || circularAnalysis?.organizationName || 'General'
        }`,
        targetCompany: profile.targetCompany || circularAnalysis?.organizationName || '',
        targetJobTitle: profile.targetJobTitle || nextCv.personal.jobTitle || '',
        templateId: bestTemplateId,
        cvLanguage: targetLang,
        cvData: nextCv,
        circularSummary: circularAnalysis,
        tailoringReport: report,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await persistSavedProfile(profile);
      await persistSavedCv(cvRecord);

      setView('result');
      onShowToast('চাকরিভিত্তিক প্রফেশনাল CV সফলভাবে তৈরি হয়েছে!', '🎉');
    } catch (err: any) {
      setErrorBanner(err?.message || 'CV তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsGeneratingCv(false);
    }
  };

  const currentResultTemplate =
    CV_TEMPLATES.find((t) => t.id === selectedTemplateId) || CV_TEMPLATES[0];

  const filteredTemplatesForResult = CV_TEMPLATES.filter((t) => {
    const matchCat = templateCatFilter === 'all' || t.category === templateCatFilter;
    const q = templateSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.nameEn.toLowerCase().includes(q) ||
      t.nameBn.includes(templateSearch) ||
      t.number.toString().includes(q);
    return matchCat && matchSearch;
  });

  const handleDownloadDocxClick = async () => {
    if (!generatedCv) return;
    setIsDownloadingDocx(true);
    try {
      await exportCvToDocx(generatedCv, cvLanguage, currentResultTemplate.primaryColor);
      onShowToast('Word (.docx) CV সফলভাবে ডাউনলোড হয়েছে!', '📄');
    } catch (err) {
      onShowToast('DOCX ডাউনলোড করতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  // Add Education item helper
  const addEducationToProfile = (item: Omit<EducationItem, 'id'>) => {
    if (!item.degree.trim() && !item.institution.trim()) return;
    const nextItem: EducationItem = {
      ...item,
      id: `edu-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    setProfile((p) => ({ ...p, education: [...p.education, nextItem] }));
  };

  // Add Experience item helper
  const addExperienceToProfile = (item: Omit<WorkExperience, 'id'>) => {
    if (!item.jobTitle.trim() && !item.employer.trim()) return;
    const nextItem: WorkExperience = {
      ...item,
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    setProfile((p) => ({ ...p, hasWorkExperience: true, experience: [...p.experience, nextItem] }));
  };

  return (
    <div className="space-y-6">
      {/* ================= TOP FEATURE NAVIGATION STRIP ================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-indigo-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Job CV Making Helper</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold uppercase tracking-wider">
                AI Career Consultant
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              আপনার পছন্দের চাকরির জন্য AI দিয়ে তৈরি করুন প্রফেশনাল ও চাকরিভিত্তিক CV।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUiLanguage((l) => (l === 'bn' ? 'en' : 'bn'))}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition"
          >
            {uiLanguage === 'bn' ? '🌐 English UI' : '🌐 বাংলা UI'}
          </button>

          <button
            type="button"
            onClick={() => setView('saved')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border ${
              view === 'saved'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>আমার তৈরি CV ({savedCvs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setView('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border ${
              view === 'profile'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>আমার প্রোফাইল</span>
          </button>

          <button
            type="button"
            onClick={() => startNewInterview(Boolean(savedProfile.fullName))}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI দিয়ে CV তৈরি করুন</span>
          </button>
        </div>
      </div>

      {errorBanner && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <div className="flex items-center gap-2">
            {retryHandler && (
              <button
                type="button"
                onClick={() => {
                  const fn = retryHandler;
                  setRetryHandler(null);
                  setErrorBanner('');
                  fn();
                }}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
              >
                আবার চেষ্টা করুন
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setErrorBanner('');
                setRetryHandler(null);
              }}
              className="text-rose-600 hover:text-rose-800 font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW 1: HUB LANDING ================= */}
      {view === 'hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ধাপে ধাপে স্মার্ট AI ইন্টারভিউ</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                কথা বলুন AI ক্যারিয়ার কনসালট্যান্টের সাথে, তৈরি করুন চাকরির উপযোগী সেরা CV
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                একসাথে বড় ফরম পূরণের ঝামেলা ছাড়াই AI একটি করে সহজ প্রশ্ন করবে। চাকরির সার্কুলার (PDF, ছবি বা DOCX) আপলোড করলে AI স্বয়ংক্রিয়ভাবে পদ, যোগ্যতা ও কীওয়ার্ড বিশ্লেষণ করে ১০০টি প্রফেশনাল টেমপ্লেটে আপনার CV সাজিয়ে দেবে।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                <div className="font-bold text-indigo-200">১. সার্কুলার বিশ্লেষণ</div>
                <p className="text-[11px] text-slate-300">PDF, ছবি, DOCX থেকে পদের চাহিদা ও কীওয়ার্ড শনাক্তকরণ।</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                <div className="font-bold text-emerald-200">২. প্রোফাইল ও ছবি ক্রপ</div>
                <p className="text-[11px] text-slate-300">তথ্য সংরক্ষণ + পাসপোর্ট ছবি ক্রপ ও স্বাক্ষর ক্লিনার।</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                <div className="font-bold text-rose-200">৩. ১০০ টেমপ্লেট ও DOCX</div>
                <p className="text-[11px] text-slate-300">সব টেমপ্লেটে সুইচ + A4 PDF, Word (.docx) ও প্রিন্ট।</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => startNewInterview(Boolean(savedProfile.fullName))}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-500 hover:from-rose-600 hover:to-indigo-600 text-white text-sm font-black flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI দিয়ে CV তৈরি করুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setView('interview')}
                  className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/25 text-white text-xs font-bold cursor-pointer transition"
                >
                  আগের অসমাপ্ত ইন্টারভিউ চালিয়ে যান →
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>প্রোফাইল ও ব্যক্তিগত CV লাইব্রেরি</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {savedProfile.fullName
                  ? `স্বাগতম ${savedProfile.fullName}! আপনার প্রোফাইলে ${savedProfile.education.length}টি শিক্ষাগত যোগ্যতা এবং ${savedProfile.skills.length}টি স্কিল সেভ করা আছে।`
                  : 'আপনার ব্যক্তিগত তথ্য, শিক্ষা, অভিজ্ঞতা, ছবি ও স্বাক্ষর একবার প্রোফাইলে সেভ রাখলে পরবর্তীতে নতুন চাকরির CV বানাতে বারবার লিখতে হবে না।'}
              </p>

              {!isLoggedIn && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                  টিপস: একাউন্টে লগইন করলে আপনার তৈরি করা CV এবং প্রোফাইল সম্পূর্ণ ব্যক্তিগতভাবে ক্লাউডে সুরক্ষিত থাকবে।
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setView('profile')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-between cursor-pointer transition"
              >
                <span>আমার প্রোফাইল দেখুন / আপডেট করুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('saved')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between cursor-pointer transition"
              >
                <span>আমার তৈরি CV ({savedCvs.length}টি)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: CONVERSATIONAL AI INTERVIEW ================= */}
      {view === 'interview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chat Consultant Stream (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[620px] max-h-[82vh]">
            {/* Interview Top Bar with Real Progress */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleStepBack}
                  disabled={undoStack.length === 0 || isAiBusy}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-40 cursor-pointer"
                  title="পূর্বের প্রশ্নে ফিরে যান"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="text-xs font-black text-slate-900">AI ক্যারিয়ার কনসালট্যান্ট ইন্টারভিউ</div>
                  <div className="text-[11px] text-slate-500">
                    একটি করে সহজ প্রশ্নের উত্তর দিন • অগ্রগতি {progressPercent}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-28 sm:w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-rose-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => persistSavedProfile(profile)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="বর্তমান তথ্য সেভ করে রাখুন, পরে আবার শুরু করতে পারবেন"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  <span>সেভ ও পরে চালিয়ে যান</span>
                </button>
                <button
                  type="button"
                  onClick={() => startNewInterview(false)}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 cursor-pointer"
                  title="শুরু থেকে নতুন করে আরম্ভ করুন"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {m.role === 'ai' && (
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Career Consultant</span>
                      </div>
                    )}
                    {m.attachmentName && (
                      <div className="mb-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 text-[11px] font-bold">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{m.attachmentName}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-line">{m.text}</div>
                  </div>
                </div>
              ))}

              {/* Circular Confirmation Card */}
              {pendingCircularReview && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-indigo-400 shadow-md space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs sm:text-sm font-black text-indigo-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>সার্কুলার থেকে প্রাপ্ত তথ্য যাচাই করুন</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setPendingCircularReview(null)}
                      className="text-xs text-slate-500 hover:text-rose-600 font-bold cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 text-[11px]">প্রতিষ্ঠান / কোম্পানি:</label>
                      <input
                        type="text"
                        value={pendingCircularReview.organizationName}
                        onChange={(e) =>
                          setPendingCircularReview({ ...pendingCircularReview, organizationName: e.target.value })
                        }
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 text-[11px]">পদের নাম (Job Title):</label>
                      <input
                        type="text"
                        value={pendingCircularReview.jobTitle}
                        onChange={(e) =>
                          setPendingCircularReview({ ...pendingCircularReview, jobTitle: e.target.value })
                        }
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 text-[11px]">অভিজ্ঞতার চাহিদা:</label>
                      <input
                        type="text"
                        value={pendingCircularReview.experienceRequirements}
                        onChange={(e) =>
                          setPendingCircularReview({ ...pendingCircularReview, experienceRequirements: e.target.value })
                        }
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 text-[11px]">আবেদনের শেষ তারিখ:</label>
                      <input
                        type="text"
                        value={pendingCircularReview.deadline}
                        onChange={(e) =>
                          setPendingCircularReview({ ...pendingCircularReview, deadline: e.target.value })
                        }
                        className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  {pendingCircularReview.requiredSkills.length > 0 && (
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-700 text-[11px]">প্রয়োজনীয় স্কিলসমূহ:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {pendingCircularReview.requiredSkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingCircularReview.educationalRequirements.length > 0 && (
                    <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                      <strong>শিক্ষাগত যোগ্যতা: </strong>
                      {pendingCircularReview.educationalRequirements.join('; ')}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmCircular}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>তথ্য সঠিক — নিশ্চিত করে এগিয়ে যান</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Contextual Stage Helper Panels (One relevant tool at a time) */}
              {currentStepKey === 'circular_or_role' && !pendingCircularReview && (
                <div className="bg-white rounded-2xl p-4 border border-indigo-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <span>চাকরির সার্কুলার আপলোড / পেস্ট করুন (ঐচ্ছিক):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5">
                        {isAnalyzingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>PDF / ছবি / DOCX আপলোড</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleCircularUpload(f);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPasteBox((v) => !v)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        সার্কুলার টেক্সট পেস্ট
                      </button>
                    </div>
                  </div>
                  {showPasteBox && (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={4}
                        value={circularPasteText}
                        onChange={(e) => setCircularPasteText(e.target.value)}
                        placeholder="চাকরির বিজ্ঞপ্তির লেখা এখানে পেস্ট করুন..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                      <button
                        type="button"
                        disabled={isAnalyzingDoc || !circularPasteText.trim()}
                        onClick={handleAnalyzePastedCircular}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        {isAnalyzingDoc ? 'বিশ্লেষণ হচ্ছে...' : 'টেক্সট বিশ্লেষণ করুন'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Education Stage Multi-entry + Certificate Extractor */}
              {currentStepKey === 'education_prompt' && (
                <div className="bg-white rounded-2xl p-4 border border-emerald-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>শিক্ষাগত যোগ্যতা যুক্ত করুন (একাধিক যোগ করা যাবে):</span>
                    </span>
                    <label className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1.5">
                      {isAnalyzingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>সার্টিফিকেট / মার্কশিট আপলোড (AI Read)</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCertificateUpload(f);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {pendingCertExtract && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 text-xs">
                      <div className="font-bold text-emerald-900">সার্টিফিকেট থেকে পাওয়া তথ্য যাচাই করুন:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={pendingCertExtract.degree}
                          onChange={(e) => setPendingCertExtract({ ...pendingCertExtract, degree: e.target.value })}
                          placeholder="ডিগ্রি (যেমন: B.Sc / HSC / SSC)"
                          className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white"
                        />
                        <input
                          type="text"
                          value={pendingCertExtract.institution}
                          onChange={(e) => setPendingCertExtract({ ...pendingCertExtract, institution: e.target.value })}
                          placeholder="প্রতিষ্ঠান / বিশ্ববিদ্যালয় / বোর্ড"
                          className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white"
                        />
                        <input
                          type="text"
                          value={pendingCertExtract.fieldOfStudy}
                          onChange={(e) => setPendingCertExtract({ ...pendingCertExtract, fieldOfStudy: e.target.value })}
                          placeholder="বিভাগ / বিষয়"
                          className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white"
                        />
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={pendingCertExtract.endDate}
                            onChange={(e) => setPendingCertExtract({ ...pendingCertExtract, endDate: e.target.value })}
                            placeholder="পাসের সাল"
                            className="w-1/2 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white"
                          />
                          <input
                            type="text"
                            value={pendingCertExtract.gpa}
                            onChange={(e) => setPendingCertExtract({ ...pendingCertExtract, gpa: e.target.value })}
                            placeholder="CGPA / GPA"
                            className="w-1/2 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPendingCertExtract(null)}
                          className="px-3 py-1 rounded-lg bg-white text-slate-600 font-bold border cursor-pointer"
                        >
                          বাতিল
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addEducationToProfile(pendingCertExtract);
                            setPendingCertExtract(null);
                            onShowToast('শিক্ষাগত যোগ্যতা যুক্ত হয়েছে!', '🎓');
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                        >
                          নিশ্চিত ও যুক্ত করুন
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual Quick Education Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      value={eduDraft.degree}
                      onChange={(e) => setEduDraft({ ...eduDraft, degree: e.target.value })}
                      placeholder="ডিগ্রি (যেমন: BBA / B.Sc / HSC) *"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={eduDraft.institution}
                      onChange={(e) => setEduDraft({ ...eduDraft, institution: e.target.value })}
                      placeholder="প্রতিষ্ঠান / বোর্ড *"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={eduDraft.fieldOfStudy}
                      onChange={(e) => setEduDraft({ ...eduDraft, fieldOfStudy: e.target.value })}
                      placeholder="বিষয় / গ্রুপ"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={eduDraft.endDate}
                      onChange={(e) => setEduDraft({ ...eduDraft, endDate: e.target.value })}
                      placeholder="পাসের বছর (যেমন: 2024)"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={eduDraft.gpa}
                      onChange={(e) => setEduDraft({ ...eduDraft, gpa: e.target.value })}
                      placeholder="ফলাফল / CGPA (যেমন: 3.75/4.00)"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!eduDraft.degree.trim()) return;
                        addEducationToProfile(eduDraft);
                        setEduDraft({
                          degree: '',
                          institution: '',
                          fieldOfStudy: '',
                          location: '',
                          startDate: '',
                          endDate: '',
                          gpa: '',
                          details: '',
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ডিগ্রি যোগ করুন</span>
                    </button>
                  </div>

                  {profile.education.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {profile.education.map((ed) => (
                        <div
                          key={ed.id}
                          className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div>
                            <strong>{ed.degree}</strong> {ed.fieldOfStudy ? `(${ed.fieldOfStudy})` : ''} — {ed.institution}{' '}
                            {ed.endDate ? `• ${ed.endDate}` : ''} {ed.gpa ? `• ${ed.gpa}` : ''}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setProfile((p) => ({ ...p, education: p.education.filter((x) => x.id !== ed.id) }))
                            }
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            advanceInterview(
                              `শিক্ষাগত যোগ্যতা যুক্ত করেছি: ${profile.education
                                .map((e) => `${e.degree} (${e.institution})`)
                                .join(', ')}`
                            )
                          }
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                        >
                          শিক্ষাগত তথ্য সম্পন্ন — পরবর্তী ধাপে যান →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Experience Stage Multi-entry */}
              {currentStepKey === 'experience_prompt' && (
                <div className="bg-white rounded-2xl p-4 border border-indigo-200 space-y-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>কর্মঅভিজ্ঞতা / ইন্টার্নশিপ যুক্ত করুন:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={expDraft.jobTitle}
                      onChange={(e) => setExpDraft({ ...expDraft, jobTitle: e.target.value })}
                      placeholder="পদের নাম (Job Title) *"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={expDraft.employer}
                      onChange={(e) => setExpDraft({ ...expDraft, employer: e.target.value })}
                      placeholder="প্রতিষ্ঠান / কোম্পানির নাম *"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={expDraft.startDate}
                      onChange={(e) => setExpDraft({ ...expDraft, startDate: e.target.value })}
                      placeholder="শুরুর তারিখ (যেমন: Jan 2022)"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        disabled={expDraft.current}
                        value={expDraft.current ? 'বর্তমান' : expDraft.endDate}
                        onChange={(e) => setExpDraft({ ...expDraft, endDate: e.target.value })}
                        placeholder="শেষের তারিখ"
                        className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-300 disabled:bg-slate-100"
                      />
                      <label className="text-[11px] flex items-center gap-1 font-medium cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={expDraft.current}
                          onChange={(e) => setExpDraft({ ...expDraft, current: e.target.checked })}
                        />
                        <span>বর্তমান</span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={expDraft.description}
                      onChange={(e) => setExpDraft({ ...expDraft, description: e.target.value })}
                      placeholder="মূল দায়িত্ব ও কাজ (Key Responsibilities)..."
                      className="sm:col-span-2 px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!expDraft.jobTitle.trim()) return;
                        addExperienceToProfile(expDraft);
                        setExpDraft({
                          jobTitle: '',
                          employer: '',
                          location: '',
                          startDate: '',
                          endDate: '',
                          current: false,
                          description: '',
                          achievements: '',
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>অভিজ্ঞতা যোগ করুন</span>
                    </button>

                    {profile.experience.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          advanceInterview(
                            `অভিজ্ঞতা যুক্ত করেছি: ${profile.experience
                              .map((ex) => `${ex.jobTitle} at ${ex.employer}`)
                              .join(', ')}`
                          )
                        }
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                      >
                        অভিজ্ঞতা সম্পন্ন — পরের ধাপে যান →
                      </button>
                    )}
                  </div>

                  {profile.experience.length > 0 && (
                    <div className="space-y-1.5">
                      {profile.experience.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div>
                            <strong>{ex.jobTitle}</strong> — {ex.employer}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setProfile((p) => ({ ...p, experience: p.experience.filter((x) => x.id !== ex.id) }))
                            }
                            className="text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skills Confirmation Stage (Recommended Circular Skills + User Entry) */}
              {currentStepKey === 'skills_prompt' && (
                <div className="bg-white rounded-2xl p-4 border border-violet-200 space-y-3">
                  {suggestedSkills.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-violet-900">
                        সার্কুলার অনুযায়ী প্রস্তাবিত স্কিল (শুধুমাত্র আপনার যেগুলো জানা আছে সেগুলোতে ক্লিক করে নিশ্চিত করুন):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedSkills.map((sk) => {
                          const exists = profile.skills.some((s) => s.name.toLowerCase() === sk.toLowerCase());
                          return (
                            <button
                              key={sk}
                              type="button"
                              onClick={() => {
                                if (exists) {
                                  setProfile((p) => ({
                                    ...p,
                                    skills: p.skills.filter((s) => s.name.toLowerCase() !== sk.toLowerCase()),
                                  }));
                                } else {
                                  setProfile((p) => ({
                                    ...p,
                                    skills: [
                                      ...p.skills,
                                      { id: `sk-${Date.now()}-${sk}`, name: sk, category: 'technical' },
                                    ],
                                  }));
                                }
                              }}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer transition flex items-center gap-1 ${
                                exists
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100'
                              }`}
                            >
                              {exists ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              <span>{sk}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillDraft}
                      onChange={(e) => setSkillDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && skillDraft.trim()) {
                          e.preventDefault();
                          setProfile((p) => ({
                            ...p,
                            skills: [
                              ...p.skills,
                              { id: `sk-${Date.now()}`, name: skillDraft.trim(), category: 'technical' },
                            ],
                          }));
                          setSkillDraft('');
                        }
                      }}
                      placeholder="নিজের অন্য স্কিল লিখুন (যেমন: MS Excel, AutoCAD, Communication)..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!skillDraft.trim()) return;
                        setProfile((p) => ({
                          ...p,
                          skills: [
                            ...p.skills,
                            { id: `sk-${Date.now()}`, name: skillDraft.trim(), category: 'technical' },
                          ],
                        }));
                        setSkillDraft('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                    >
                      যুক্ত করুন
                    </button>
                  </div>

                  {profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold"
                          >
                            {s.name}
                            <button
                              type="button"
                              onClick={() =>
                                setProfile((p) => ({ ...p, skills: p.skills.filter((x) => x.id !== s.id) }))
                              }
                              className="text-rose-500 ml-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          advanceInterview(
                            `নিশ্চিতকৃত স্কিলসমূহ: ${profile.skills.map((s) => s.name).join(', ')}`
                          )
                        }
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                      >
                        স্কিল সম্পন্ন →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Languages Quick Stage */}
              {currentStepKey === 'languages_prompt' && (
                <div className="bg-white rounded-2xl p-4 border border-sky-200 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-sky-600" />
                    <span>ভাষাগত দক্ষতা যোগ করুন:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={langDraft.language}
                      onChange={(e) => setLangDraft({ ...langDraft, language: e.target.value })}
                      placeholder="ভাষা (যেমন: Bengali, English)"
                      className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <select
                      value={langDraft.proficiency}
                      onChange={(e) => setLangDraft({ ...langDraft, proficiency: e.target.value })}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Native">Native / মাতৃভাষা</option>
                      <option value="Fluent">Fluent / সাবলীল</option>
                      <option value="Professional">Professional</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Basic">Basic</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!langDraft.language.trim()) return;
                        const item: LanguageItem = {
                          id: `lang-${Date.now()}`,
                          language: langDraft.language.trim(),
                          proficiency: langDraft.proficiency,
                        };
                        setProfile((p) => ({ ...p, languages: [...p.languages, item] }));
                        setLangDraft({ language: '', proficiency: 'Fluent' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                    >
                      + যোগ
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.languages.map((l) => (
                        <span key={l.id} className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 font-semibold">
                          {l.language} ({l.proficiency})
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        advanceInterview(
                          profile.languages.length > 0
                            ? `ভাষা: ${profile.languages.map((l) => `${l.language} (${l.proficiency})`).join(', ')}`
                            : 'Bengali (Native), English (Professional)'
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer"
                    >
                      পরবর্তী ধাপ →
                    </button>
                  </div>
                </div>
              )}

              {/* Photo & Signature Stage */}
              {currentStepKey === 'photo_signature' && (
                <div className="bg-white rounded-2xl p-4 border border-indigo-200 space-y-3">
                  <PassportPhotoCropper
                    photoUrl={profile.photoUrl}
                    signatureUrl={profile.signatureUrl}
                    onChangePhoto={(url) => setProfile((p) => ({ ...p, photoUrl: url }))}
                    onChangeSignature={(url) => setProfile((p) => ({ ...p, signatureUrl: url }))}
                    requirePhotoHint={Boolean(circularAnalysis?.requiresPhoto)}
                    requireSignatureHint={Boolean(circularAnalysis?.requiresSignature)}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        advanceInterview(
                          profile.photoUrl || profile.signatureUrl
                            ? 'পাসপোর্ট ছবি ও স্বাক্ষর আপলোড সম্পন্ন করেছি।'
                            : 'আপাতত ছবি ও স্বাক্ষর ছাড়াই এগোতে চাই।',
                          profile,
                          undefined,
                          profile.photoUrl ? { name: 'Passport Photo / Signature', type: 'photo' } : undefined
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                    >
                      {profile.photoUrl || profile.signatureUrl ? 'ছবি/স্বাক্ষর নিশ্চিত করে এগোই →' : 'স্কিপ করে এগোই →'}
                    </button>
                  </div>
                </div>
              )}

              {/* References Stage */}
              {currentStepKey === 'additional_references' && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                  <div className="font-bold text-slate-800">রেফারেন্স যুক্ত করুন (ঐচ্ছিক):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={refDraft.name}
                      onChange={(e) => setRefDraft({ ...refDraft, name: e.target.value })}
                      placeholder="নাম"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={refDraft.jobTitle}
                      onChange={(e) => setRefDraft({ ...refDraft, jobTitle: e.target.value })}
                      placeholder="পদবি ও প্রতিষ্ঠান"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={refDraft.phone}
                      onChange={(e) => setRefDraft({ ...refDraft, phone: e.target.value })}
                      placeholder="মোবাইল"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                    <input
                      type="email"
                      value={refDraft.email}
                      onChange={(e) => setRefDraft({ ...refDraft, email: e.target.value })}
                      placeholder="ইমেইল"
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (!refDraft.name.trim()) return;
                        setProfile((p) => ({
                          ...p,
                          references: [...p.references, { ...refDraft, id: `ref-${Date.now()}` }],
                        }));
                        setRefDraft({ name: '', jobTitle: '', company: '', email: '', phone: '' });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                    >
                      + রেফারেন্স যোগ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        advanceInterview(
                          profile.references.length > 0
                            ? `${profile.references.length}টি রেফারেন্স যুক্ত করেছি`
                            : 'রেফারেন্স পরে দিব / Available on request'
                        )
                      }
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer"
                    >
                      পরবর্তী ধাপ →
                    </button>
                  </div>
                </div>
              )}

              {/* Ready to Generate Banner */}
              {(isReadyToGenerate || isGeneratingCv) && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg space-y-3">
                  {isGeneratingCv ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin shrink-0" />
                      <div className="text-xs sm:text-sm font-bold leading-relaxed">
                        ধন্যবাদ! আপনার দেওয়া তথ্য এবং চাকরির সার্কুলার বিশ্লেষণ সম্পন্ন হয়েছে। আপনার পছন্দের চাকরির জন্য প্রফেশনাল CV তৈরি করা হচ্ছে...
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black">সব প্রয়োজনীয় তথ্য সংগ্রহ সম্পন্ন!</div>
                        <div className="text-xs text-emerald-100">
                          এখনই {profile.targetJobTitle || 'আপনার কাঙ্ক্ষিত পদের'} জন্য ATS-ফ্রেন্ডলি CV জেনারেট করুন।
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={cvLanguage}
                          onChange={(e) => setCvLanguage(e.target.value as 'en' | 'bn')}
                          className="px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold"
                        >
                          <option value="en">CV ভাষা: English</option>
                          <option value="bn">CV ভাষা: বাংলা (Bengali)</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleGenerateFinalCv(cvLanguage)}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>প্রফেশনাল CV তৈরি করুন</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isAiBusy && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold pl-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI কনসালট্যান্ট চিন্তা করছেন...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Replies + Main Input Composer */}
            <div className="p-3.5 bg-white border-t border-slate-200 space-y-2.5">
              {(quickReplies.length > 0 || allowSkip) && (
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((qr, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={isAiBusy}
                      onClick={() => advanceInterview(qr)}
                      className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold cursor-pointer transition disabled:opacity-40"
                    >
                      {qr}
                    </button>
                  ))}
                  {allowSkip && (
                    <button
                      type="button"
                      disabled={isAiBusy}
                      onClick={() => advanceInterview('এই ঐচ্ছিক তথ্যটি স্কিপ করতে চাই')}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <SkipForward className="w-3 h-3" />
                      <span>স্কিপ করুন</span>
                    </button>
                  )}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInput.trim() || isAiBusy) return;
                  advanceInterview(chatInput.trim());
                }}
                className="flex items-center gap-2"
              >
                <label
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer shrink-0"
                  title="চাকরির সার্কুলার (PDF/ছবি/DOCX) আপলোড"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCircularUpload(f);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isAiBusy || isGeneratingCv}
                  placeholder="আপনার উত্তর এখানে লিখুন (বাংলা বা English)..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAiBusy || isGeneratingCv}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">পাঠান</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Live Summary Drawer (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  সংগৃহীত লাইভ তথ্য
                </h4>
                {profile.fullName && (
                  <button
                    type="button"
                    disabled={isGeneratingCv}
                    onClick={() => handleGenerateFinalCv(cvLanguage)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    এখনই CV বানান
                  </button>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div>
                  <span className="font-bold text-slate-900">নাম: </span>
                  <span>{profile.fullName || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">ফোন / ইমেইল: </span>
                  <span>{[profile.phone, profile.email].filter(Boolean).join(' • ') || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">লক্ষ্য পদ: </span>
                  <span className="text-indigo-700 font-bold">
                    {profile.targetJobTitle || circularAnalysis?.jobTitle || '—'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">প্রতিষ্ঠান: </span>
                  <span>{profile.targetCompany || circularAnalysis?.organizationName || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">শিক্ষা: </span>
                  <span>{profile.education.length}টি ডিগ্রি যুক্ত</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">অভিজ্ঞতা: </span>
                  <span>
                    {profile.hasWorkExperience === false
                      ? 'ফ্রেশার'
                      : `${profile.experience.length}টি অভিজ্ঞতা`}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">স্কিল: </span>
                  <span>{profile.skills.length}টি</span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      profile.photoUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {profile.photoUrl ? 'ছবি যুক্ত ✅' : 'ছবি নেই'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      profile.signatureUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {profile.signatureUrl ? 'স্বাক্ষর যুক্ত ✅' : 'স্বাক্ষর নেই'}
                  </span>
                </div>
              </div>
            </div>

            {circularAnalysis && (
              <div className="bg-indigo-50/70 rounded-3xl p-5 border border-indigo-200 space-y-2 text-xs">
                <div className="font-black text-indigo-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>টার্গেট চাকরির সার্কুলার</span>
                </div>
                <div className="font-bold text-slate-900">
                  {circularAnalysis.jobTitle} {circularAnalysis.organizationName ? `— ${circularAnalysis.organizationName}` : ''}
                </div>
                {circularAnalysis.deadline && (
                  <div className="text-[11px] text-rose-700 font-bold">শেষ তারিখ: {circularAnalysis.deadline}</div>
                )}
                {circularAnalysis.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {circularAnalysis.requiredSkills.slice(0, 8).map((k, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-indigo-200 text-[10px] font-semibold">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 3: GENERATED RESULT & 100 TEMPLATES STUDIO ================= */}
      {view === 'result' && generatedCv && (
        <div className="space-y-6">
          {/* ATS Tailoring Report & Action Toolbar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                {tailoringReport && (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md">
                    <span className="text-xl font-black">{tailoringReport.atsScoreEstimate}%</span>
                    <span className="text-[9px] font-bold uppercase">ATS Match</span>
                  </div>
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {generatedCv.personal.fullName} — {generatedCv.personal.jobTitle || 'Tailored CV'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {tailoringReport?.tailoringNotesBn || 'আপনার লক্ষ্য পদের সাথে মিল রেখে ATS-অপ্টিমাইজড CV প্রস্তুত হয়েছে।'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onApplyToMainEditor(generatedCv, selectedTemplateId, 'editor')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>এডিট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDocxClick}
                  disabled={isDownloadingDocx}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{isDownloadingDocx ? 'তৈরি হচ্ছে...' : 'DOCX ডাউনলোড'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTriggerPrint(generatedCv, selectedTemplateId)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTriggerPdfDownload(generatedCv, selectedTemplateId)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF ডাউনলোড</span>
                </button>
              </div>
            </div>

            {tailoringReport && (tailoringReport.matchedKeywords.length > 0 || tailoringReport.missingKeywords.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <div className="font-bold text-emerald-900">ম্যাচ হওয়া কীওয়ার্ডসমূহ:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tailoringReport.matchedKeywords.length > 0 ? (
                      tailoringReport.matchedKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 font-semibold">
                          ✓ {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-700">সাধারণ ATS কীওয়ার্ড যুক্ত হয়েছে</span>
                    )}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="font-bold text-amber-900">ভবিষ্যতে অর্জনের পরামর্শ (ঘাটতি কীওয়ার্ড):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tailoringReport.missingKeywords.length > 0 ? (
                      tailoringReport.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white border border-amber-200 text-amber-800 font-semibold">
                          • {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-amber-800">চমৎকার! অধিকাংশ মূল চাহিদা পূরণ হয়েছে।</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700">CV ভাষা পরিবর্তন:</span>
                <button
                  type="button"
                  disabled={isGeneratingCv}
                  onClick={() => handleGenerateFinalCv('en')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                    cvLanguage === 'en' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  English CV
                </button>
                <button
                  type="button"
                  disabled={isGeneratingCv}
                  onClick={() => handleGenerateFinalCv('bn')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer border ${
                    cvLanguage === 'bn' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  বাংলা CV
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = activeResultCvId || `jobcv_${Date.now()}`;
                    setActiveResultCvId(id);
                    persistSavedCv({
                      id,
                      title: `${generatedCv.personal.jobTitle || 'Job CV'} — ${profile.targetCompany || 'Custom'}`,
                      targetCompany: profile.targetCompany || '',
                      targetJobTitle: generatedCv.personal.jobTitle || '',
                      templateId: selectedTemplateId,
                      cvLanguage,
                      cvData: generatedCv,
                      circularSummary: circularAnalysis,
                      tailoringReport,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>লাইব্রেরিতে সেভ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => startNewInterview(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন আরেকটি চাকরির CV বানান</span>
                </button>
              </div>
            </div>
          </div>

          {/* 100 Existing Templates Live Switcher + Live A4 Renderer */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Sidebar: 100 Existing Templates Selector */}
            <div className="xl:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3 xl:sticky xl:top-24">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900">
                  ১০০টি প্রফেশনাল টেমপ্লেট থেকে বাছাই করুন
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  #{currentResultTemplate.number}
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="টেমপ্লেট খুঁজুন (নাম বা নম্বর)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>

              <select
                value={templateCatFilter}
                onChange={(e) => setTemplateCatFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold"
              >
                <option value="all">সকল ক্যাটাগরি (১০০টি)</option>
                {CV_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.nameBn} ({c.nameEn})
                  </option>
                ))}
              </select>

              <div className="max-h-[540px] overflow-y-auto space-y-1.5 pr-1">
                {filteredTemplatesForResult.map((tmpl) => {
                  const active = tmpl.id === selectedTemplateId;
                  const isAiRec = tailoringReport?.recommendedTemplateIds?.includes(tmpl.id);
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: tmpl.primaryColor }}
                          />
                          <span>#{tmpl.number.toString().padStart(2, '0')} {tmpl.nameBn}</span>
                        </div>
                        <div className={`text-[10px] truncate ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                          {tmpl.categoryNameEn} • ATS {tmpl.atsScore}%
                        </div>
                      </div>
                      {isAiRec && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold shrink-0">
                          AI সেরা
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Live A4 Renderer */}
            <div className="xl:col-span-8 bg-slate-200/80 rounded-3xl p-4 sm:p-6 border border-slate-300 overflow-auto flex justify-center">
              <CVRenderer
                data={generatedCv}
                template={currentResultTemplate}
                isWatermarked={false}
                scale={0.85}
                customId="cv-helper-preview-doc"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 4: MY SAVED CVs ================= */}
      {view === 'saved' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
                <span>আমার তৈরি CV ({savedCvs.length}টি)</span>
              </h3>
              <p className="text-xs text-slate-500">
                প্রতিটি চাকরির জন্য আলাদা আলাদা কাস্টমাইজড CV সংরক্ষিত আছে — যেকোনো সময় ডুপ্লিকেট বা এডিট করুন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => startNewInterview(Boolean(savedProfile.fullName))}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন CV তৈরি করুন</span>
            </button>
          </div>

          {isLibraryLoading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>আপনার সংরক্ষিত CV লোড হচ্ছে...</span>
            </div>
          ) : savedCvs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-slate-400 text-sm font-bold">আপনি এখনও Job CV Making Helper দিয়ে কোনো CV তৈরি করেননি।</div>
              <button
                type="button"
                onClick={() => startNewInterview(Boolean(savedProfile.fullName))}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                প্রথম চাকরিভিত্তিক CV তৈরি করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCvs.map((item) => {
                const tmpl = CV_TEMPLATES.find((t) => t.id === item.templateId) || CV_TEMPLATES[0];
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-md transition flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                          #{tmpl.number} {tmpl.nameBn}
                        </span>
                        {item.tailoringReport?.atsScoreEstimate && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ATS {item.tailoringReport.atsScoreEstimate}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-slate-900 line-clamp-2">{item.title}</h4>
                      <div className="text-[11px] text-slate-600">
                        আপডেট: {new Date(item.updatedAt).toLocaleDateString('bn-BD')} • ভাষা:{' '}
                        {item.cvLanguage === 'bn' ? 'বাংলা' : 'English'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedCv(item.cvData);
                          setTailoringReport(item.tailoringReport || null);
                          setCircularAnalysis(item.circularSummary || null);
                          setSelectedTemplateId(item.templateId || 'tmpl-01');
                          setCvLanguage(item.cvLanguage || 'en');
                          setActiveResultCvId(item.id);
                          setView('result');
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
                      >
                        খুলুন ও টেমপ্লেট দেখুন
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const dup: SavedJobCV = {
                            ...item,
                            id: `jobcv_${Date.now()}`,
                            title: `${item.title} (কপি)`,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                          persistSavedCv(dup);
                          onShowToast('CV সফলভাবে ডুপ্লিকেট হয়েছে!', '📋');
                        }}
                        className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="ডুপ্লিকেট করুন"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => exportCvToDocx(item.cvData, item.cvLanguage || 'en', tmpl.primaryColor)}
                        className="p-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 cursor-pointer"
                        title="DOCX ডাউনলোড"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onTriggerPdfDownload(item.cvData, item.templateId || 'tmpl-01')}
                        className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer"
                        title="PDF ডাউনলোড"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSavedCv(item.id)}
                        className="p-1.5 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 5: MY REUSABLE PROFILE ================= */}
      {view === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>আমার প্রোফাইল (স্থায়ী সংরক্ষিত তথ্য)</span>
              </h3>
              <p className="text-xs text-slate-500">
                এখানে তথ্য সেভ রাখলে প্রতিবার নতুন চাকরির CV তৈরির সময় AI আবার এক প্রশ্ন করবে না।
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => persistSavedProfile(savedProfile)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>প্রোফাইল সেভ করুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  persistSavedProfile(savedProfile);
                  startNewInterview(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>এই প্রোফাইল দিয়ে নতুন CV শুরু করুন</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700">পূর্ণ নাম</label>
              <input
                type="text"
                value={savedProfile.fullName}
                onChange={(e) => setSavedProfile({ ...savedProfile, fullName: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">মোবাইল নম্বর</label>
              <input
                type="text"
                value={savedProfile.phone}
                onChange={(e) => setSavedProfile({ ...savedProfile, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">ইমেইল</label>
              <input
                type="email"
                value={savedProfile.email}
                onChange={(e) => setSavedProfile({ ...savedProfile, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">পিতার নাম (ঐচ্ছিক)</label>
              <input
                type="text"
                value={savedProfile.fatherName}
                onChange={(e) => setSavedProfile({ ...savedProfile, fatherName: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">মাতার নাম (ঐচ্ছিক)</label>
              <input
                type="text"
                value={savedProfile.motherName}
                onChange={(e) => setSavedProfile({ ...savedProfile, motherName: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">জন্ম তারিখ (ঐচ্ছিক)</label>
              <input
                type="text"
                value={savedProfile.dateOfBirth}
                onChange={(e) => setSavedProfile({ ...savedProfile, dateOfBirth: e.target.value })}
                placeholder="DD/MM/YYYY"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700">বর্তমান ঠিকানা</label>
              <input
                type="text"
                value={savedProfile.presentAddress}
                onChange={(e) => setSavedProfile({ ...savedProfile, presentAddress: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">জাতীয়তা</label>
              <input
                type="text"
                value={savedProfile.nationality}
                onChange={(e) => setSavedProfile({ ...savedProfile, nationality: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <PassportPhotoCropper
            photoUrl={savedProfile.photoUrl}
            signatureUrl={savedProfile.signatureUrl}
            onChangePhoto={(url) => setSavedProfile({ ...savedProfile, photoUrl: url })}
            onChangeSignature={(url) => setSavedProfile({ ...savedProfile, signatureUrl: url })}
          />
        </div>
      )}
    </div>
  );
};
