import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Upload,
  RotateCcw,
  Languages as LangIcon,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
} from 'lucide-react';
import { CVData, WorkExperience, EducationItem, SkillItem, LanguageItem } from '../../types/cvMaker';
import { SAMPLE_CV_DATA, INITIAL_EMPTY_CV_DATA } from '../../data/sampleCVData';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const MASTER_PROFILE_STORAGE_KEY = 'mosafa_cv_master_profile';

interface CVMasterProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndApply: (profileData: CVData) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const CVMasterProfileModal: React.FC<CVMasterProfileModalProps> = ({
  isOpen,
  onClose,
  onSaveAndApply,
  onShowToast,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'summary' | 'experience' | 'education' | 'skills'>('personal');
  const [profile, setProfile] = useState<CVData>(INITIAL_EMPTY_CV_DATA);
  const [isSaved, setIsSaved] = useState(false);

  // Load existing master profile or default with user credentials
  useEffect(() => {
    if (!isOpen) return;

    try {
      const stored = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
        setIsSaved(true);
        return;
      }
    } catch (e) {
      // ignore
    }

    // Default to user info if logged in and no profile yet
    if (user) {
      setProfile((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          fullName: user.displayName || prev.personal.fullName,
          email: user.email || prev.personal.email,
          phone: user.phoneNumber || prev.personal.phone,
          photoUrl: user.photoURL || prev.personal.photoUrl,
        },
      }));
    } else {
      // Pre-load sample template so the user doesn't start with a blank screen
      setProfile(SAMPLE_CV_DATA);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle personal details field update
  const updatePersonal = (field: keyof CVData['personal'], value: string) => {
    setProfile((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  // Photo upload helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast('ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট হতে হবে', '⚠️');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updatePersonal('photoUrl', reader.result);
          onShowToast('ছবি আপলোড সফল হয়েছে!', '📸');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Work experience helpers
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      employer: '',
      location: '',
      startDate: '',
      endDate: 'বর্তমান',
      current: true,
      description: '',
    };
    setProfile((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  };

  const removeExperience = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  // Education helpers
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
    };
    setProfile((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));
  };

  const removeEducation = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  // Skills helpers
  const handleSkillsChange = (text: string) => {
    const names = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const skillItems: SkillItem[] = names.map((name, idx) => ({
      id: `skill-${idx}`,
      name,
      category: 'technical',
      level: 'Expert',
    }));
    setProfile((prev) => ({ ...prev, skills: skillItems }));
  };

  // Languages helpers
  const handleLanguagesChange = (text: string) => {
    const items = text
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
    const langItems: LanguageItem[] = items.map((lang, idx) => ({
      id: `lang-${idx}`,
      language: lang,
      proficiency: 'Fluent',
    }));
    setProfile((prev) => ({ ...prev, languages: langItems }));
  };

  // Save profile and apply
  const handleSaveAndApply = async () => {
    if (!profile.personal.fullName.trim()) {
      onShowToast('অনুগ্রহ করে অন্তত আপনার পূর্ণ নাম লিখুন!', '⚠️');
      setActiveTab('personal');
      return;
    }

    try {
      // 1. Save to local storage
      localStorage.setItem(MASTER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
      setIsSaved(true);

      // 2. If logged in, also persist to Firestore user record
      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            cvProfile: profile,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Could not sync to Firestore user record:', err);
        }
      }

      // 3. Notify parent to apply directly into active CV editor & template
      onSaveAndApply(profile);
      onShowToast('আপনার সিভি প্রোফাইল সফলভাবে সংরক্ষিত ও অটু-ফিল হয়েছে! 🎉', '✅');
      onClose();
    } catch (e) {
      console.error(e);
      onShowToast('প্রোফাইল সংরক্ষণে সমস্যা হয়েছে!', '❌');
    }
  };

  const handleLoadSample = () => {
    setProfile(SAMPLE_CV_DATA);
    onShowToast('নমুনা প্রোফাইল ডাটা লোড করা হয়েছে!', '📝');
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি সব তথ্য মুছে খালি করতে চান?')) {
      setProfile(INITIAL_EMPTY_CV_DATA);
      localStorage.removeItem(MASTER_PROFILE_STORAGE_KEY);
      setIsSaved(false);
      onShowToast('প্রোফাইল তথ্য মুছে ফেলা হয়েছে।', '🗑️');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  নিজের সিভি প্রোফাইল (Master CV Profile)
                </h2>
                {isSaved && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    সংরক্ষিত
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                একবার তথ্য দিন, পরবর্তীতে যে কোনো সিভি ফরম্যাট চয়েজ করলেই সব তথ্য স্বয়ংক্রিয়ভাবে অটু-ফিল হবে!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'personal'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ব্যক্তিগত তথ্য</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'summary'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ক্যারিয়ার সারাংশ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'experience'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>অভিজ্ঞতা ({profile.experience.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'education'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>শিক্ষা ({profile.education.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'skills'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>দক্ষতা ও ভাষা</span>
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* TAB 1: Personal Details */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700 text-sm">ব্যক্তিগত ও যোগাযোগ তথ্য</span>
                <span className="text-[11px] text-slate-500">সকল তথ্য পরবর্তীতে সিভিতে ব্যবহার হবে</span>
              </div>

              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 border-2 border-slate-300 shrink-0 flex items-center justify-center">
                  {profile.personal.photoUrl ? (
                    <img
                      src={profile.personal.photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 block mb-1">প্রোফাইল ছবি</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ডিভাইস থেকে ছবি আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {profile.personal.photoUrl && (
                      <button
                        type="button"
                        onClick={() => updatePersonal('photoUrl', '')}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        ছবি সরান
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    value={profile.personal.fullName}
                    onChange={(e) => updatePersonal('fullName', e.target.value)}
                    placeholder="উদাঃ মোফাচ্ছির আহমেদ (Mofassir Ahmed)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বর্তমান পদবী / প্রফেশন *</label>
                  <input
                    type="text"
                    value={profile.personal.jobTitle}
                    onChange={(e) => updatePersonal('jobTitle', e.target.value)}
                    placeholder="উদাঃ Senior Software Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>মোবাইল নম্বর *</span>
                  </label>
                  <input
                    type="text"
                    value={profile.personal.phone}
                    onChange={(e) => updatePersonal('phone', e.target.value)}
                    placeholder="উদাঃ +880 1700-000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>ইমেইল এড্রেস *</span>
                  </label>
                  <input
                    type="email"
                    value={profile.personal.email}
                    onChange={(e) => updatePersonal('email', e.target.value)}
                    placeholder="উদাঃ yourname@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>শহর / জেলা</span>
                  </label>
                  <input
                    type="text"
                    value={profile.personal.city}
                    onChange={(e) => updatePersonal('city', e.target.value)}
                    placeholder="উদাঃ ঢাকা (Dhaka)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">দেশ</label>
                  <input
                    type="text"
                    value={profile.personal.country}
                    onChange={(e) => updatePersonal('country', e.target.value)}
                    placeholder="উদাঃ বাংলাদেশ (Bangladesh)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণ ঠিকানা</label>
                  <input
                    type="text"
                    value={profile.personal.address}
                    onChange={(e) => updatePersonal('address', e.target.value)}
                    placeholder="উদাঃ বাসা নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>লিংকডইন (LinkedIn)</span>
                  </label>
                  <input
                    type="text"
                    value={profile.personal.linkedin}
                    onChange={(e) => updatePersonal('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span>পোর্টফোলিও / ওয়েবসাইট</span>
                  </label>
                  <input
                    type="text"
                    value={profile.personal.portfolio}
                    onChange={(e) => updatePersonal('portfolio', e.target.value)}
                    placeholder="myportfolio.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Career Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700 text-sm">প্রফেশনাল সারাংশ / ক্যারিয়ার অবজেক্টিভ</span>
              </div>
              <p className="text-xs text-slate-500">
                আপনার ক্যারিয়ার ও দক্ষতার সংক্ষেপ বিবরণ যা সিভির শুরুতে প্রফেশনাল হেডিং হিসেবে দেখাবে।
              </p>
              <textarea
                rows={6}
                value={profile.summary}
                onChange={(e) => setProfile((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="উদাঃ দক্ষ ও অভিজ্ঞ সফটওয়্যার ইঞ্জিনিয়ার, যার আধুনিক ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট ও ক্লাউড আর্কিটেকচারে গভীর অভিজ্ঞতা রয়েছে..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs font-medium leading-relaxed"
              />
            </div>
          )}

          {/* TAB 3: Work Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700 text-sm">কাজের অভিজ্ঞতা</span>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন অভিজ্ঞতা যোগ করুন</span>
                </button>
              </div>

              {profile.experience.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">এখনও কোন অভিজ্ঞতা যোগ করেননি</p>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    + প্রথম অভিজ্ঞতা যোগ করুন
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.experience.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative group space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg">
                          অভিজ্ঞতা #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            পদবী (Job Title)
                          </label>
                          <input
                            type="text"
                            value={exp.jobTitle}
                            onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                            placeholder="উদাঃ Frontend Developer"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            প্রতিষ্ঠান / কোম্পানি (Company)
                          </label>
                          <input
                            type="text"
                            value={exp.employer}
                            onChange={(e) => updateExperience(exp.id, 'employer', e.target.value)}
                            placeholder="উদাঃ XYZ Tech Ltd."
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            শুরু তারিখ / সাল
                          </label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            placeholder="উদাঃ ২০২২-০১"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            শেষ তারিখ / বর্তমান
                          </label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            placeholder="উদাঃ বর্তমান বা ২০২৩-১২"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            দায়িত্ব ও অর্জন বিবরণ
                          </label>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="• কোর ফিচার ডেভেলপমেন্ট ও টিম লিডিং..."
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Education */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700 text-sm">শিক্ষাগত যোগ্যতা</span>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন শিক্ষা যোগ করুন</span>
                </button>
              </div>

              {profile.education.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">এখনও কোন শিক্ষাগত তথ্য যোগ করেননি</p>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    + প্রথম শিক্ষা যোগ করুন
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.education.map((edu, index) => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative group space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg">
                          ডিগ্রি #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            ডিগ্রি / সার্টিফিকেট নাম
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="উদাঃ B.Sc. in Computer Science"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            শিক্ষা প্রতিষ্ঠান (University / College)
                          </label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            placeholder="উদাঃ Dhaka University"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            পাসের বছর / সময়কাল
                          </label>
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            placeholder="উদাঃ ২০২০"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            ফলাফল / জিপিএ (GPA / CGPA)
                          </label>
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="উদাঃ CGPA 3.85 / 4.00"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Skills & Languages */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>দক্ষতাসমূহ (Skills) — কমা দিয়ে আলাদা করুন</span>
                </label>
                <textarea
                  rows={4}
                  value={profile.skills.map((s) => s.name).join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  placeholder="উদাঃ React, TypeScript, Node.js, UI/UX Design, Git, Problem Solving"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  মোট {profile.skills.length}টি দক্ষতা যুক্ত রয়েছে।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <LangIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>ভাষাসমূহ (Languages) — কমা দিয়ে আলাদা করুন</span>
                </label>
                <textarea
                  rows={2}
                  value={profile.languages.map((l) => l.language).join(', ')}
                  onChange={(e) => handleLanguagesChange(e.target.value)}
                  placeholder="উদাঃ বাংলা (মাতৃভাষা), ইংরেজি (Fluent), আরবি"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="নমুনা তথ্য দিয়ে টেস্ট করুন"
            >
              নমুনা ডাটা দিন
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-600 transition cursor-pointer"
              title="সব তথ্য মুছুন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-200 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>সংরক্ষণ ও সিভিতে অটু-ফিল করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
