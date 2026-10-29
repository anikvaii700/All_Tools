export type ConverterDirection = 'unicode-to-bijoy' | 'bijoy-to-unicode';

export interface CleanerOptions {
  removeExtraSpaces: boolean;
  removeLeadingTrailing: boolean;
  removeBlankLines: boolean;
  removeDuplicateBlankLines: boolean;
  normalizeLineBreaks: boolean;
  removeInvisibleChars: boolean;
  removeDuplicateWords: boolean;
  fixBengaliPunctuation: boolean;
}

export type TextCaseOption = 'none' | 'uppercase' | 'lowercase' | 'titlecase' | 'sentencecase';

export interface FormatterOptions {
  action:
    | 'none'
    | 'add-line-numbers-bn'
    | 'add-line-numbers-en'
    | 'remove-line-numbers'
    | 'join-lines'
    | 'split-sentences'
    | 'sort-lines-asc'
    | 'sort-lines-desc'
    | 'reverse-lines'
    | 'remove-duplicate-lines'
    | 'trim-lines';
  caseOption: TextCaseOption;
}

export interface TextStatistics {
  totalChars: number;
  charsNoSpaces: number;
  totalWords: number;
  totalLines: number;
  totalParagraphs: number;
  banglaChars: number;
  englishChars: number;
  banglaDigits: number;
  englishDigits: number;
  readingTimeMinutes: number;
}

export interface ConversionHistoryItem {
  id: string;
  sourceText: string;
  convertedText: string;
  direction: ConverterDirection | 'number-bn-to-en' | 'number-en-to-bn' | 'text-clean' | 'text-format';
  directionLabel: string;
  timestamp: number;
}

export interface DiffSegment {
  type: 'same' | 'added' | 'removed';
  value: string;
}

export interface DiffResult {
  similarityPercentage: number;
  addedWordsCount: number;
  removedWordsCount: number;
  unchangedWordsCount: number;
  segments: DiffSegment[];
}
