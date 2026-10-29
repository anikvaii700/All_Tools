import { FormatterOptions } from './types';
import { convertEnglishDigitsToBengali } from './numberConverter';

export function formatText(text: string, options: FormatterOptions): string {
  if (!text) return '';

  let lines = text.split('\n');

  // Handle Action
  switch (options.action) {
    case 'add-line-numbers-bn': {
      lines = lines.map((line, idx) => {
        const numBn = convertEnglishDigitsToBengali(String(idx + 1));
        return `${numBn}. ${line}`;
      });
      break;
    }

    case 'add-line-numbers-en': {
      lines = lines.map((line, idx) => `${idx + 1}. ${line}`);
      break;
    }

    case 'remove-line-numbers': {
      lines = lines.map((line) => {
        // Strip English or Bengali leading numbers like "1.", "1 -", "১.", "১।", "১ -"
        return line.replace(/^[\s]*([0-9]+|[০-৯]+)[\s]*[.)\-–—|।]?\s*/, '');
      });
      break;
    }

    case 'join-lines': {
      // Joins non-empty lines with a space
      const joined = lines
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join(' ');
      return applyCase(joined, options.caseOption);
    }

    case 'split-sentences': {
      // Split by Bengali and English sentence delimiters: ।, ., !, ?
      const rawSentences = text
        .replace(/([।!?.]+)\s*/g, '$1\n')
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      lines = rawSentences;
      break;
    }

    case 'sort-lines-asc': {
      // Unicode collation friendly sorting (supports Bengali alphabet and English)
      lines = [...lines].sort((a, b) => a.localeCompare(b, 'bn', { sensitivity: 'base' }));
      break;
    }

    case 'sort-lines-desc': {
      lines = [...lines].sort((a, b) => b.localeCompare(a, 'bn', { sensitivity: 'base' }));
      break;
    }

    case 'reverse-lines': {
      lines = [...lines].reverse();
      break;
    }

    case 'remove-duplicate-lines': {
      const seen = new Set<string>();
      lines = lines.filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return true; // keep blank lines
        if (seen.has(trimmed)) return false;
        seen.add(trimmed);
        return true;
      });
      break;
    }

    case 'trim-lines': {
      lines = lines.map((l) => l.trim());
      break;
    }

    default:
      break;
  }

  let result = lines.join('\n');

  // Handle Case Option for English text
  if (options.caseOption !== 'none') {
    result = applyCase(result, options.caseOption);
  }

  return result;
}

/**
 * Applies English casing without breaking Bengali characters.
 */
function applyCase(text: string, caseOption: FormatterOptions['caseOption']): string {
  switch (caseOption) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'titlecase':
      return text.replace(/\b([a-zA-Z])([a-zA-Z]*)/g, (_match, first, rest) => {
        return first.toUpperCase() + rest.toLowerCase();
      });
    case 'sentencecase':
      return text.replace(/(^\s*|[.!?।]\s+)([a-zA-Z])/g, (_match, sep, char) => {
        return sep + char.toUpperCase();
      });
    default:
      return text;
  }
}
