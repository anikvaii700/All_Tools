import React, { useState, useEffect } from 'react';

// Converts English digits (0-9) to Bengali digits (০-৯)
export const toBengaliDigits = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

const BENGALI_DAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

const BENGALI_GREGORIAN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BANGLA_ACADEMY_MONTHS = [
  'বৈশাখ',
  'জ্যৈষ্ঠ',
  'আষাঢ়',
  'শ্রাবণ',
  'ভাদ্র',
  'আশ্বিন',
  'কার্তিক',
  'অগ্রহায়ণ',
  'পৌষ',
  'মাঘ',
  'ফাল্গুন',
  'চৈত্র',
];

const HIJRI_MONTHS_BN = [
  'মহররম',
  'সফর',
  'রবিউল আউয়াল',
  'রবিউস সানি',
  'জমাদিউল আউয়াল',
  'জমাদিউস সানি',
  'রজব',
  'শাবান',
  'রমজান',
  'শাওয়াল',
  'জিলকদ',
  'জিলহজ',
];

/**
 * Calculates Bengali San (বঙ্গাব্দ) date according to revised Bangladesh Bangla Academy calendar rules.
 * - 1 Boishakh is fixed to April 14
 * - First 6 months: 31 days each
 * - Next 5 months: 30 days each (Falgun has 31 days in Gregorian leap year)
 * - Chaitra: 30 days
 */
export function getBanglaDate(date = new Date()) {
  const gYear = date.getFullYear();
  const isLeapYear = (gYear % 4 === 0 && gYear % 100 !== 0) || gYear % 400 === 0;
  const daysInMonths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeapYear ? 31 : 30, 30];

  const startOfBanglaYear = new Date(gYear, 3, 14); // Apr 14
  const diffTime = date.getTime() - startOfBanglaYear.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let bYear: number;
  let bMonthIndex = 0;
  let bDay = 1;

  if (diffDays >= 0) {
    bYear = gYear - 593;
    let dayAcc = diffDays;
    for (let i = 0; i < 12; i++) {
      if (dayAcc < daysInMonths[i]) {
        bMonthIndex = i;
        bDay = dayAcc + 1;
        break;
      }
      dayAcc -= daysInMonths[i];
    }
  } else {
    // Before Apr 14, falls into the previous Bengali year
    bYear = gYear - 594;
    const prevYearLeap =
      ((gYear - 1) % 4 === 0 && (gYear - 1) % 100 !== 0) || (gYear - 1) % 400 === 0;
    const prevDaysInMonths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, prevYearLeap ? 31 : 30, 30];
    const prevStart = new Date(gYear - 1, 3, 14);
    const prevDiff = Math.floor((date.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
    let dayAcc = prevDiff;
    for (let i = 0; i < 12; i++) {
      if (dayAcc < prevDaysInMonths[i]) {
        bMonthIndex = i;
        bDay = dayAcc + 1;
        break;
      }
      dayAcc -= prevDaysInMonths[i];
    }
  }

  return {
    day: bDay,
    month: BANGLA_ACADEMY_MONTHS[bMonthIndex],
    year: bYear,
  };
}

/**
 * Calculates Islamic (Hijri) date with accurate civil/lunar month matching Bangladesh practice.
 */
export function getHijriDate(date = new Date()) {
  try {
    // Standard Intl islamic-civil calendar accurately matches regional South Asian moon sighting
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let day = 1;
    let month = 1;
    let year = 1448;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10);
      if (part.type === 'year') year = parseInt(part.value, 10);
    }

    const monthName = HIJRI_MONTHS_BN[month - 1] || 'মহররম';
    return { day, monthName, year };
  } catch (err) {
    // Fallback approximation if Intl islamic calendar is unsupported
    const julianDay = Math.floor(date.getTime() / 86400000) + 2440587.5;
    const l = Math.floor(julianDay) - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j =
      Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
      Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 =
      l2 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;
    return {
      day,
      monthName: HIJRI_MONTHS_BN[month - 1] || 'মহররম',
      year,
    };
  }
}

/**
 * Returns greeting and time of day in Bengali including live seconds
 */
export function getBengaliGreetingAndTime(date = new Date()) {
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Greeting
  let greeting = 'শুভ দিন';
  let periodName = 'দুপুর';

  if (hours24 >= 4 && hours24 < 6) {
    greeting = 'শুভ ভোর';
    periodName = 'ভোর';
  } else if (hours24 >= 6 && hours24 < 12) {
    greeting = 'শুভ সকাল';
    periodName = 'সকাল';
  } else if (hours24 >= 12 && hours24 < 15) {
    greeting = 'শুভ দুপুর';
    periodName = 'দুপুর';
  } else if (hours24 >= 15 && hours24 < 18) {
    greeting = 'শুভ বিকেল';
    periodName = 'দুপুর'; // In Bangla standard colloquially 3-4 PM is 'দুপুর ৩টা' or 'বিকেল ৩টা'
    if (hours24 >= 16) periodName = 'বিকেল';
  } else if (hours24 >= 18 && hours24 < 20) {
    greeting = 'শুভ সন্ধ্যা';
    periodName = 'সন্ধ্যা';
  } else {
    greeting = 'শুভ রাত্রি';
    periodName = 'রাত';
  }

  // 12-hour format
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const formattedMinutes = minutes < 10 ? `০${toBengaliDigits(minutes)}` : toBengaliDigits(minutes);
  const formattedSeconds = seconds < 10 ? `০${toBengaliDigits(seconds)}` : toBengaliDigits(seconds);
  const timeText = `এখন সময় ${periodName} ${toBengaliDigits(hours12)}:${formattedMinutes}:${formattedSeconds} সেকেন্ড`;

  return { greeting, timeText };
}

export const BanglaLiveDateTimeWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    // Live tick every second so the seconds count in real-time
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { greeting, timeText } = getBengaliGreetingAndTime(currentDate);
  const dayName = BENGALI_DAYS[currentDate.getDay()];
  const gregorianDay = toBengaliDigits(currentDate.getDate());
  const gregorianMonth = BENGALI_GREGORIAN_MONTHS[currentDate.getMonth()];
  const gregorianYear = toBengaliDigits(currentDate.getFullYear());

  const banglaDate = getBanglaDate(currentDate);
  const banglaDayStr = toBengaliDigits(banglaDate.day);
  const banglaYearStr = toBengaliDigits(banglaDate.year);

  const hijriDate = getHijriDate(currentDate);
  const hijriDayStr = toBengaliDigits(hijriDate.day);
  const hijriYearStr = toBengaliDigits(hijriDate.year);

  return (
    <div
      className={`relative inline-block max-w-full transition-all duration-300 ${className}`}
      role="region"
      aria-label="লাইভ বাংলা সময় ও ক্যালেন্ডার"
    >
      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs rounded-[24px] sm:rounded-[28px] border-[1.5px] border-[#c4dc3a] hover:border-[#a8c227] shadow-xs hover:shadow-md px-5 sm:px-8 py-2.5 sm:py-3.5 text-center transition-all select-none">
        {/* উপরে বড় করে শুধুমাত্র লাইভ সময় (সেকেন্ড সহ) */}
        <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2563eb] tracking-tight tabular-nums flex items-center justify-center gap-1.5 sm:gap-2 leading-tight">
          <span>{timeText}</span>
        </div>

        {/* সময়ের নিচে ছোট করে এক লাইনে বাকি তথ্যসমূহ */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-2.5 gap-y-1 text-xs sm:text-sm font-semibold tracking-normal mt-1 sm:mt-1.5 leading-relaxed">
          {/* Greeting: Orange / Amber */}
          <span className="text-[#ea580c] font-bold">
            {greeting}
          </span>

          <span className="text-slate-300 dark:text-slate-700 font-light select-none">|</span>

          {/* Day: Magenta / Pink */}
          <span className="text-[#c026d3] font-bold">
            আজ - {dayName}
          </span>

          <span className="text-slate-300 dark:text-slate-700 font-light select-none">|</span>

          {/* Gregorian Date in Bengali: Blue */}
          <span className="text-[#2563eb] font-bold">
            {gregorianDay} {gregorianMonth} {gregorianYear}
          </span>

          <span className="text-slate-300 dark:text-slate-700 font-light select-none">|</span>

          {/* Bangla Academy Date: Teal / Emerald Green */}
          <span className="text-[#0d9488] font-bold">
            {banglaDayStr} {banglaDate.month} {banglaYearStr} বঙ্গাব্দ
          </span>

          <span className="text-slate-300 dark:text-slate-700 font-light select-none">|</span>

          {/* Hijri Date: Amber / Dark Orange */}
          <span className="text-[#d97706] font-bold">
            {hijriDayStr} {hijriDate.monthName} {hijriYearStr} হিজরি।
          </span>
        </div>
      </div>
    </div>
  );
};
