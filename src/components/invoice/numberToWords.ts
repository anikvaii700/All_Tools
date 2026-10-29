/**
 * Converts numbers to words in Bengali and English for Currency Invoices and Money Receipts.
 */

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumerals(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => banglaDigits[Number(d)]);
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

function convertTwoDigitsBn(n: number): string {
  if (n <= 0) return '';
  return bnUnits[n] || '';
}

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
    str += `${convertTwoDigitsBn(lakh)} লাখ `;
  }
  if (thousand > 0) {
    str += `${convertTwoDigitsBn(thousand)} হাজার `;
  }
  if (hundred > 0) {
    str += `${convertTwoDigitsBn(hundred)} শত `;
  }
  if (rem > 0) {
    str += `${convertTwoDigitsBn(rem)} `;
  }

  return str.trim();
}

export function numberToWordsBengali(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'শূন্য টাকা মাত্র';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const integerPart = Math.floor(abs);
  const decimalPart = Math.round((abs - integerPart) * 100);

  let words = convertPartBn(integerPart);
  if (!words) words = 'শূন্য';
  words += ' টাকা';

  if (decimalPart > 0) {
    words += ` ${convertTwoDigitsBn(decimalPart)} পয়সা`;
  }

  words += ' মাত্র।';
  return (isNegative ? 'মাইনাস ' : '') + words.trim();
}

export function cleanBengaliAmountInWords(amountOrText: number | string): string {
  const text = typeof amountOrText === 'number' ? numberToWordsBengali(amountOrText) : (amountOrText || '');
  if (!text) return '';
  return text
    .replace(/(টাকা\s*মাত্র।?\s*)+/g, 'টাকা মাত্র।')
    .replace(/\s+/g, ' ')
    .trim();
}

// English converter
const enOnes = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const enTens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertUnderThousandEn(n: number): string {
  let s = '';
  if (n >= 100) {
    s += `${enOnes[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 20) {
    s += `${enTens[Math.floor(n / 10)]} `;
    n %= 10;
  }
  if (n > 0) {
    s += `${enOnes[n]} `;
  }
  return s.trim();
}

export function numberToWordsEnglish(amount: number, currency = 'Taka'): string {
  if (isNaN(amount) || amount === 0) return `Zero ${currency} Only.`;
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const integerPart = Math.floor(abs);
  const decimalPart = Math.round((abs - integerPart) * 100);

  let words = '';
  let rem = integerPart;

  const crore = Math.floor(rem / 10000000);
  rem %= 10000000;

  const lakh = Math.floor(rem / 100000);
  rem %= 100000;

  const thousand = Math.floor(rem / 1000);
  rem %= 1000;

  if (crore > 0) {
    words += `${convertUnderThousandEn(crore)} Crore `;
  }
  if (lakh > 0) {
    words += `${convertUnderThousandEn(lakh)} Lakh `;
  }
  if (thousand > 0) {
    words += `${convertUnderThousandEn(thousand)} Thousand `;
  }
  if (rem > 0) {
    words += `${convertUnderThousandEn(rem)} `;
  }

  words = words.trim();
  if (!words) words = 'Zero';
  words += ` ${currency}`;

  if (decimalPart > 0) {
    words += ` and ${convertUnderThousandEn(decimalPart)} Paisa`;
  }

  words += ' Only.';
  return (isNegative ? 'Minus ' : '') + words;
}
