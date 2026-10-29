import { CleanerOptions } from './types';

export const DEFAULT_CLEANER_OPTIONS: CleanerOptions = {
  removeExtraSpaces: true,
  removeLeadingTrailing: true,
  removeBlankLines: false,
  removeDuplicateBlankLines: true,
  normalizeLineBreaks: true,
  removeInvisibleChars: true,
  removeDuplicateWords: false,
  fixBengaliPunctuation: true,
};

export interface CleanResult {
  cleanedText: string;
  changesMade: number;
  details: string[];
}

export function cleanBengaliText(text: string, options: CleanerOptions): CleanResult {
  if (!text) {
    return { cleanedText: '', changesMade: 0, details: [] };
  }

  let result = text;
  let changes = 0;
  const details: string[] = [];

  // 1. Normalize line breaks (\r\n or \r to \n)
  if (options.normalizeLineBreaks) {
    const prev = result;
    result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (result !== prev) {
      changes++;
      details.push('লাইন ব্রেক স্বাভাবিক করা হয়েছে');
    }
  }

  // 2. Remove invisible zero-width characters (ZWSP, ZWNJ, ZWJ, BOM)
  if (options.removeInvisibleChars) {
    const prev = result;
    // We remove Zero Width Space \u200B, Byte Order Mark \uFEFF, Soft Hyphen \u00AD, LTR/RTL marks
    // Note: We deliberately keep ZWNJ (\u200C) / ZWJ (\u200D) if part of conjuncts, but trim floating ones.
    result = result.replace(/[\u200B\uFEFF\u00AD\u200E\u200F]/g, '');
    if (result !== prev) {
      changes++;
      details.push('অদৃশ্য/লুকানো ক্যারেক্টার মুছে ফেলা হয়েছে');
    }
  }

  // 3. Fix Bengali punctuation spacing (e.g. space before দাড়ি " ।" -> "।", space before comma " ," -> ",")
  if (options.fixBengaliPunctuation) {
    const prev = result;
    result = result.replace(/[ \t]+([।,;:!?])/g, '$1');
    // Ensure space after punctuation if followed by text (except newline or quote)
    result = result.replace(/([।,;:!?])([^\s\d।,;:!?"'”’\)\n])/g, '$1 $2');
    if (result !== prev) {
      changes++;
      details.push('বাংলা যতিচিহ্ন ও দাড়ির স্পেসিং সংশোধন করা হয়েছে');
    }
  }

  // 4. Remove duplicate consecutive words (e.g. "আমি আমি বাংলায়" -> "আমি বাংলায়")
  if (options.removeDuplicateWords) {
    const prev = result;
    // Match duplicate adjacent words
    result = result.replace(/\b([^\s]+)\s+\1\b/gi, '$1');
    if (result !== prev) {
      changes++;
      details.push('পাশাপাশি থাকা দ্বৈত শব্দ অপসারণ করা হয়েছে');
    }
  }

  // 5. Remove extra/repeated spaces within lines
  if (options.removeExtraSpaces) {
    const prev = result;
    // Replace multiple spaces/tabs with single space within each line
    result = result
      .split('\n')
      .map((line) => line.replace(/[ \t]{2,}/g, ' '))
      .join('\n');
    if (result !== prev) {
      changes++;
      details.push('অতিরিক্ত ফাঁকা স্পেস (Space) পরিষ্কার করা হয়েছে');
    }
  }

  // 6. Remove leading and trailing spaces per line
  if (options.removeLeadingTrailing) {
    const prev = result;
    result = result
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim();
    if (result !== prev) {
      changes++;
      details.push('লাইনের শুরু ও শেষের অনাবশ্যক স্পেস ছাঁটাই করা হয়েছে');
    }
  }

  // 7. Remove duplicate blank lines
  if (options.removeDuplicateBlankLines) {
    const prev = result;
    result = result.replace(/\n{3,}/g, '\n\n');
    if (result !== prev) {
      changes++;
      details.push('একাধিক খালি লাইন কমিয়ে একটিতে আনা হয়েছে');
    }
  }

  // 8. Remove ALL blank lines if selected
  if (options.removeBlankLines) {
    const prev = result;
    result = result
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .join('\n');
    if (result !== prev) {
      changes++;
      details.push('সকল খালি লাইন মুছে ফেলা হয়েছে');
    }
  }

  return {
    cleanedText: result,
    changesMade: changes,
    details,
  };
}
