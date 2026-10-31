import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, User, MapPin, Briefcase, Clock, DollarSign, Smartphone, Laptop, Target } from 'lucide-react';
import { EntrepreneurProfile, CapitalBracket, ExperienceLevel } from '../../types/entrepreneur';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: EntrepreneurProfile;
  onSave: (updated: EntrepreneurProfile) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const BD_DIVISIONS = [
  'ঢাকা',
  'চট্টগ্রাম',
  'রাজশাহী',
  'খুলনা',
  'বরিশাল',
  'সিলেট',
  'রংপুর',
  'ময়মনসিংহ',
];

const COMMON_SKILLS = [
  'স্মার্টফোন ও ইন্টারনেট ব্রাউজিং',
  'ক্যানভা ডিজাইন (Canva)',
  'ক্যাপকাট ভিডিও এডিটিং (CapCut)',
  'বাংলা ও ইংরেজি সাধারণ লেখালেখি',
  'ফেসবুক ও সোশ্যাল মিডিয়া মার্কেটিং',
  'হিসাব-নিকাশ ও এক্সেল/গুগল শিট',
  'ছবি তোলা ও ক্যামেরা হ্যান্ডলিং',
  'কথোপকথন ও কাস্টমার ডিলিং',
  'হস্তশিল্প বা রান্না/বেকিং',
  'পড়ানো বা টিউটরিং',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name || '');
  const [locationDistrict, setLocationDistrict] = useState(profile.locationDistrict || 'ঢাকা');
  const [locationDivision, setLocationDivision] = useState(profile.locationDivision || 'ঢাকা');
  const [education, setEducation] = useState(profile.education || 'স্নাতক / এইচএসসি');
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [workExperience, setWorkExperience] = useState(profile.workExperience || 'ফ্রেশার');
  const [availableHours, setAvailableHours] = useState(profile.availableHoursPerWeek || 15);
  const [capital, setCapital] = useState<CapitalBracket>(profile.availableCapital || 'zero');
  const [hasSmartphone, setHasSmartphone] = useState(profile.equipment.hasSmartphone);
  const [hasLaptopOrPC, setHasLaptopOrPC] = useState(profile.equipment.hasLaptopOrPC);
  const [hasInternet, setHasInternet] = useState(profile.equipment.hasReliableInternet);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel || 'beginner');
  const [preference, setPreference] = useState<'online' | 'offline' | 'hybrid'>(profile.preference || 'online');
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(profile.monthlyIncomeGoal || 30000);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  // Readiness Score Calculation
  const calculateScore = () => {
    let score = 25; // base interest
    if (hasSmartphone) score += 20;
    if (hasLaptopOrPC) score += 15;
    if (hasInternet) score += 10;
    if (skills.length >= 2) score += 15;
    if (skills.length >= 4) score += 10;
    if (availableHours >= 10) score += 5;
    return Math.min(100, score);
  };

  const readinessScore = calculateScore();

  const handleSave = () => {
    const updated: EntrepreneurProfile = {
      name: name.trim() || 'উদ্যোক্তা',
      locationDistrict: locationDistrict.trim() || 'ঢাকা',
      locationDivision,
      education,
      skills,
      interests: profile.interests,
      workExperience,
      availableHoursPerWeek: Number(availableHours) || 10,
      availableCapital: capital,
      equipment: {
        hasSmartphone,
        hasLaptopOrPC,
        hasReliableInternet: hasInternet,
      },
      experienceLevel,
      preference,
      monthlyIncomeGoal: Number(monthlyIncomeGoal) || 25000,
      isProfileComplete: true,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onShowToast('উদ্যোক্তা প্রোফাইল সফলভাবে আপডেট হয়েছে! 🌟', '👤');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">উদ্যোক্তা প্রোফাইল বিল্ডার</h3>
              <p className="text-xs text-slate-300">আপনার বর্তমান দক্ষতা ও সুযোগ বিশ্লেষণ করে উপযুক্ত ব্যবসা নির্ধারণ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Readiness Score Box */}
          <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-800 text-xs sm:text-sm">উদ্যোক্তা প্রস্তুতি স্কোর (Readiness)</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {readinessScore >= 75
                  ? 'দারুণ! আপনার হাতে ইতিমধ্যে ব্যবসা শুরু করার মতো পর্যাপ্ত গ্যাজেট ও দক্ষতা রয়েছে।'
                  : 'আপনি জিরো-ক্যাপিটাল সার্ভিস বা স্মার্টফোনভিত্তিক ব্যবসা দিয়ে খুব সহজেই যাত্রা শুরু করতে পারেন।'}
              </p>
            </div>
            <div className="text-center shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{readinessScore}%</span>
              <span className="block text-[10px] text-slate-500 font-medium">রেডি স্কোর</span>
            </div>
          </div>

          {/* Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>আপনার নাম বা ডাকনাম:</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: তানভীর হাসান / সুমাইয়া"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>বিভাগ ও জেলা:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={locationDivision}
                  onChange={(e) => setLocationDivision(e.target.value)}
                  className="px-2.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 bg-slate-50 text-xs"
                >
                  {BD_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={locationDistrict}
                  onChange={(e) => setLocationDistrict(e.target.value)}
                  placeholder="জেলার নাম (যেমন: বগুড়া)"
                  className="px-2.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 bg-slate-50 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Capital & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>হাতে থাকা প্রাথমিক পুঁজি:</span>
              </label>
              <select
                value={capital}
                onChange={(e) => setCapital(e.target.value as CapitalBracket)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 bg-slate-50 text-xs sm:text-sm font-medium"
              >
                <option value="zero">৳০ (সম্পূর্ণ বিনা পুঁজিতে - জিরো ক্যাপিটাল)</option>
                <option value="low">৳১,০০০ থেকে ৫,০০০ (খুব সামান্য বাজেট)</option>
                <option value="medium">৳৫,০০০ থেকে ২০,০০০ (মাঝারি স্টার্টআপ)</option>
                <option value="high">৳২০,০০০+ (বিনিয়োগ প্রস্তুতি)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>সাপ্তাহিক দেওয়ার মতো সময়:</span>
              </label>
              <select
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 bg-slate-50 text-xs sm:text-sm font-medium"
              >
                <option value={7}>দৈনিক ১ ঘণ্টা (সপ্তাহে ৭ ঘণ্টা - পার্ট টাইম)</option>
                <option value={15}>দৈনিক ২ ঘণ্টা (সপ্তাহে ১৫ ঘণ্টা - সাইড হাসল)</option>
                <option value={28}>দৈনিক ৪ ঘণ্টা (সপ্তাহে ২৮ ঘণ্টা - গভীর মনোযোগ)</option>
                <option value={45}>ফুল-টাইম (সপ্তাহে ৪০+ ঘণ্টা)</option>
              </select>
            </div>
          </div>

          {/* Equipment Checkboxes */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">আপনার কাছে বর্তমানে যা রয়েছে:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setHasSmartphone(!hasSmartphone)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  hasSmartphone
                    ? 'bg-rose-50/80 border-rose-300 text-rose-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Smartphone className={`w-4 h-4 ${hasSmartphone ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-xs">স্মার্টফোন</span>
              </button>

              <button
                type="button"
                onClick={() => setHasLaptopOrPC(!hasLaptopOrPC)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  hasLaptopOrPC
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Laptop className={`w-4 h-4 ${hasLaptopOrPC ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-xs">ল্যাপটপ / কম্পিউটার</span>
              </button>

              <button
                type="button"
                onClick={() => setHasInternet(!hasInternet)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  hasInternet
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${hasInternet ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs">স্থির ইন্টারনেট সংযোগ</span>
              </button>
            </div>
          </div>

          {/* Current Skills Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              আপনার বর্তমান প্রাথমিক দক্ষতাগুলো নির্বাচন করুন:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.map((s) => {
                const selected = skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly Income Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-500" />
                <span>প্রথম ৩ মাসের মাসিক আয়ের লক্ষ্য (টাকা):</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                <input
                  type="number"
                  value={monthlyIncomeGoal}
                  onChange={(e) => setMonthlyIncomeGoal(Number(e.target.value))}
                  placeholder="30000"
                  step={5000}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 bg-slate-50 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                <span>কাজের ধরন পছন্দ:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['online', 'offline', 'hybrid'] as const).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setPreference(pref)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                      preference === pref
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {pref === 'online' ? 'অনলাইন' : pref === 'offline' ? 'অফলাইন' : 'হাইব্রিড'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500">আপনার ডাটা সম্পূর্ণ আপনার ডিভাইসে সংরক্ষিত থাকবে।</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              প্রোফাইল সেভ করুন 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
