const EN_TO_BN_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const BN_TO_EN_DIGITS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

/**
 * Converts all English digits in the input text to Bengali digits, preserving everything else.
 */
export function convertEnglishDigitsToBengali(text: string): string {
  if (!text) return '';
  return text.replace(/[0-9]/g, (digit) => EN_TO_BN_DIGITS[digit] || digit);
}

/**
 * Converts all Bengali digits in the input text to English digits, preserving everything else.
 */
export function convertBengaliDigitsToEnglish(text: string): string {
  if (!text) return '';
  return text.replace(/[০-৯]/g, (digit) => BN_TO_EN_DIGITS[digit] || digit);
}

/**
 * Automatically detects whether text contains more English or Bengali digits and inverts them.
 */
export function autoConvertDigits(text: string): { result: string; detected: 'en-to-bn' | 'bn-to-en' } {
  if (!text) return { result: '', detected: 'en-to-bn' };
  const enCount = (text.match(/[0-9]/g) || []).length;
  const bnCount = (text.match(/[০-৯]/g) || []).length;

  if (bnCount > enCount) {
    return {
      result: convertBengaliDigitsToEnglish(text),
      detected: 'bn-to-en',
    };
  }
  return {
    result: convertEnglishDigitsToBengali(text),
    detected: 'en-to-bn',
  };
}
