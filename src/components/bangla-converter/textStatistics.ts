import { TextStatistics } from './types';

export function calculateTextStatistics(text: string): TextStatistics {
  if (!text) {
    return {
      totalChars: 0,
      charsNoSpaces: 0,
      totalWords: 0,
      totalLines: 0,
      totalParagraphs: 0,
      banglaChars: 0,
      englishChars: 0,
      banglaDigits: 0,
      englishDigits: 0,
      readingTimeMinutes: 0,
    };
  }

  const totalChars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  // Words count: Match non-whitespace word sequences
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const totalWords = text.trim() === '' ? 0 : words.length;

  // Lines count
  const lines = text.split('\n');
  const totalLines = lines.length;

  // Paragraphs count: separated by empty lines
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const totalParagraphs = paragraphs.length;

  // Bengali Characters count (Unicode range U+0980 - U+09FF)
  const banglaMatches = text.match(/[\u0980-\u09FF]/g);
  const banglaChars = banglaMatches ? banglaMatches.length : 0;

  // English Characters count (A-Z, a-z)
  const englishMatches = text.match(/[A-Za-z]/g);
  const englishChars = englishMatches ? englishMatches.length : 0;

  // Bengali Digits count (০-৯)
  const bnDigitsMatches = text.match(/[০-৯]/g);
  const banglaDigits = bnDigitsMatches ? bnDigitsMatches.length : 0;

  // English Digits count (0-9)
  const enDigitsMatches = text.match(/[0-9]/g);
  const englishDigits = enDigitsMatches ? enDigitsMatches.length : 0;

  // Reading time (average 180 words per minute for Bengali/English reading)
  const readingTimeMinutes = Math.max(0.1, Number((totalWords / 180).toFixed(1)));

  return {
    totalChars,
    charsNoSpaces,
    totalWords,
    totalLines,
    totalParagraphs,
    banglaChars,
    englishChars,
    banglaDigits,
    englishDigits,
    readingTimeMinutes,
  };
}
