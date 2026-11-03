/**
 * Bengali Numeral and Amount in Words Conversion Utilities
 */

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  return String(val).replace(/[0-9]/g, (d) => banglaDigits[Number(d)]);
}

/**
 * Formats a number with standard South Asian commas (e.g. 12,50,000) and converts to Bengali digits
 */
export function formatBanglaNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, ''));
  if (isNaN(num)) return toBanglaDigits(val);

  const parts = num.toString().split('.');
  let intPart = parts[0];
  const decPart = parts.length > 1 ? parts[1] : null;

  // Indian/South Asian grouping: last 3 digits, then groups of 2
  let isNegative = false;
  if (intPart.startsWith('-')) {
    isNegative = true;
    intPart = intPart.substring(1);
  }

  if (intPart.length > 3) {
    const last3 = intPart.substring(intPart.length - 3);
    const rest = intPart.substring(0, intPart.length - 3);
    const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
    intPart = withCommas;
  }

  const formatted = (isNegative ? '-' : '') + intPart + (decPart ? '.' + decPart : '');
  return toBanglaDigits(formatted);
}

const bnUnits = [
  '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
  'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ', 'ত্রিশ',
  'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ', 'চল্লিশ',
  'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ', 'পঞ্চাশ',
  'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট', 'ষাট',
  'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর', 'সত্তর',
  'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি', 'আশি',
  'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'অষ্টআশি', 'উননব্বই', 'নব্বই',
  'একানব্বই', 'বানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

function convertPartBn(n: number): string {
  if (n === 0) return '';
  let str = '';
  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundred = Math.floor(rem / 100);
  rem = rem % 100;

  if (crore > 0) {
    str += `${convertPartBn(crore)} কোটি `;
  }
  if (lakh > 0) {
    str += `${bnUnits[lakh]} লাখ `;
  }
  if (thousand > 0) {
    str += `${bnUnits[thousand]} হাজার `;
  }
  if (hundred > 0) {
    str += `${bnUnits[hundred]} শত `;
  }
  if (rem > 0) {
    str += `${bnUnits[rem]} `;
  }

  return str.trim();
}

/**
 * Converts a numeric amount to Bengali words
 * Example: 12500 -> "বারো হাজার পাঁচশত টাকা মাত্র।"
 */
export function convertAmountToBengaliWords(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.-]/g, ''));
  if (isNaN(num) || num === 0) return 'শূন্য টাকা মাত্র।';

  const isNegative = num < 0;
  const abs = Math.abs(num);
  const integerPart = Math.floor(abs);
  const decimalPart = Math.round((abs - integerPart) * 100);

  let words = convertPartBn(integerPart);
  if (!words) words = 'শূন্য';
  words += ' টাকা';

  if (decimalPart > 0 && decimalPart < 100) {
    words += ` ${bnUnits[decimalPart]} পয়সা`;
  }

  words += ' মাত্র।';
  return (isNegative ? 'মাইনাস ' : '') + words.trim();
}

/**
 * Converts YYYY-MM-DD date to Bengali formatted date (e.g. ২৫/১০/২০২৬)
 */
export function formatBanglaDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${toBanglaDigits(day)}/${toBanglaDigits(month)}/${toBanglaDigits(year)}`;
  }
  return toBanglaDigits(dateStr);
}

export const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
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

export const BANGLA_YEARS = [
  '২০২৪',
  '২০২৫',
  '২০২৬',
  '২০২৭',
  '২০২৮',
  '২০২৯',
  '২০৩০',
];
