import { convertBijoyToUnicode as libBijoyToUnicode, looksLikeBijoy } from 'bijoy2unicode';

export { looksLikeBijoy };

export interface ConversionReport {
  result: string;
  unmappedCount: number;
  warnings: string[];
}

// Unicode Conjuncts and Vowels to Bijoy (SutonnyMJ ANSI) Mapping
// Sorted by key length descending so longer combinations match first
const UNICODE_TO_BIJOY_CONJUNCTS: [string, string][] = [
  // 4-character combinations
  ['স্ত্ব', '¯Í¡'],
  ['ন্ত্ব', 'šÍ¡'],
  ['ত্ত্ব', 'Ë¡'],
  ['চ্ছ্ব', '”Q¦'],
  ['ক্ষ্ণ', '²'],

  // 3-character combinations (Consonant + Virama + Consonant)
  ['ক্ক', '°'],
  ['ক্ট', '±'],
  ['ক্ত', '³'],
  ['ক্ম', '´'],
  ['ক্র', 'µ'],
  ['ক্ষ', 'ÿ'],
  ['ক্স', '·'],
  ['গু', '¸'],
  ['জ্ঞ', 'Á'],
  ['গ্দ', 'º'],
  ['গ্ধ', '»'],
  ['ঙ্ক', '¼'],
  ['ঙ্গ', '½'],
  ['জ্জ', '¾'],
  ['্ত্র', '¿'],
  ['জ্ঝ', 'À'],
  ['ঞ্চ', 'Â'],
  ['ঞ্ছ', 'Ã'],
  ['ঞ্জ', 'Ä'],
  ['ঞ্ঝ', 'Å'],
  ['ট্ট', 'Æ'],
  ['ড্ড', 'Ç'],
  ['ণ্ট', 'È'],
  ['ণ্ঠ', 'É'],
  ['ণ্ড', 'Ê'],
  ['ত্ত', 'Ë'],
  ['ত্থ', 'Ì'],
  ['ত্র', 'Î'],
  ['দ্দ', 'Ï'],
  ['দ্ধ', '×'],
  ['দ্ব', 'Ø'],
  ['দ্ম', 'Ù'],
  ['ন্ঠ', 'Ú'],
  ['ন্ড', 'Û'],
  ['ন্ধ', 'Ü'],
  ['ন্স', 'Ý'],
  ['প্ট', 'Þ'],
  ['প্ত', 'ß'],
  ['প্প', 'à'],
  ['প্স', 'á'],
  ['ব্জ', 'â'],
  ['ব্দ', 'ã'],
  ['ব্ধ', 'ä'],
  ['ভ্র', 'å'],
  ['ম্ফ', 'ç'],
  ['ল্ক', 'é'],
  ['ল্গ', 'ê'],
  ['ল্ট', 'ë'],
  ['ল্ড', 'ì'],
  ['ল্প', 'í'],
  ['ল্ফ', 'î'],
  ['শু', 'ï'],
  ['শ্চ', 'ð'],
  ['শ্ছ', 'ñ'],
  ['ষ্ণ', 'ò'],
  ['ষ্ট', 'ó'],
  ['ষ্ঠ', 'ô'],
  ['ষ্ফ', 'õ'],
  ['স্খ', 'ö'],
  ['স্ট', '÷'],
  ['স্ন', 'ø'],
  ['স্ফ', 'ù'],
  ['হু', 'û'],
  ['হৃ', 'ü'],
  ['হ্ন', 'ý'],
  ['হ্ম', 'þ'],
  ['হ্ল', 'ú'],
  ['হ্ব', 'û'],
  ['স্ত', '¯Í'],
  ['স্থ', '¯’'],
  ['স্প', '¯ú'],
  ['স্ব', '¯^'],
  ['স্ম', '¯§'],
  ['স্ক্র', '¯Œ'],
  ['স্ট্র', '÷ª'],
  ['ব্ল', 'eø'],
  ['প্ল', 'cø'],
  ['ফ্ল', 'dø'],
  ['গ্ল', 'Mø'],
  ['ক্ল', 'K¬'],
  ['শ্ন', 'kœ'],
  ['স্ম', '¯§'],
  ['শ্ল', 'kø'],
  ['ম্ন', 'gœ'],
  ['ন্মু', 'b¥y'],
  ['ন্ম', 'b¥'],
  ['ল্ল', 'j­'],
  ['রু', 'iæ'],
  ['রূ', 'iƒ'],

  // Special suffixes
  ['্্য', '¨'],
  ['্য', '¨'],
  ['্wrapper', ''],
  ['্র', 'ª'],
  ['্ব', '^'],
  ['্ম', '§'],
  ['্ন', 'œ'],
  ['্ল', '¬'],
  ['্ত', '—'],
  ['্থ', '’'],
  ['্ক', '‹'],
  ['্তু', '‘'],
  ['্ভ', '¢'],
  ['্ভ্র', '£'],
  ['্প', 'ú'],
];

// Single letter and Kar maps
const UNICODE_VOWELS: [string, string][] = [
  ['আ', 'Av'],
  ['অ', 'A'],
  ['ই', 'B'],
  ['ঈ', 'C'],
  ['উ', 'D'],
  ['ঊ', 'E'],
  ['ঋ', 'F'],
  ['এ', 'G'],
  ['ঐ', 'H'],
  ['ও', 'I'],
  ['ঔ', 'J'],
];

const UNICODE_CONSONANTS: [string, string][] = [
  ['ক', 'K'],
  ['খ', 'L'],
  ['গ', 'M'],
  ['ঘ', 'N'],
  ['ঙ', 'O'],
  ['চ', 'P'],
  ['ছ', 'Q'],
  ['জ', 'R'],
  ['ঝ', 'S'],
  ['ঞ', 'T'],
  ['ট', 'U'],
  ['ঠ', 'V'],
  ['ড', 'W'],
  ['ঢ', 'X'],
  ['ণ', 'Y'],
  ['ত', 'Z'],
  ['থ', '_'],
  ['দ', '`'],
  ['ধ', 'a'],
  ['ন', 'b'],
  ['প', 'c'],
  ['ফ', 'd'],
  ['ব', 'e'],
  ['ভ', 'f'],
  ['ম', 'g'],
  ['য', 'h'],
  ['র', 'i'],
  ['ল', 'j'],
  ['শ', 'k'],
  ['ষ', 'l'],
  ['স', 'm'],
  ['হ', 'n'],
  ['ড়', 'o'],
  ['ঢ়', 'p'],
  ['য়', 'q'],
  ['ৎ', 'r'],
  ['ং', 's'],
  ['ঃ', 't'],
  ['ঁ', 'u'],
];

const UNICODE_NUMBERS: [string, string][] = [
  ['০', '0'],
  ['১', '1'],
  ['২', '2'],
  ['৩', '3'],
  ['৪', '4'],
  ['৫', '5'],
  ['৬', '6'],
  ['৭', '7'],
  ['৮', '8'],
  ['৯', '9'],
];

const UNICODE_POST_KARS: [string, string][] = [
  ['া', 'v'],
  ['ী', 'x'],
  ['ু', 'y'],
  ['ূ', '~'],
  ['ৃ', '„'],
  ['ৌ', 'Š'], // will combine with pre e-kar
  ['।', '|'],
  ['্', '&'],
];

/**
 * Reorders Unicode Bengali string so that Pre-Kars (ি, ে, ৈ) and Reph (র্)
 * are positioned correctly in Bijoy ANSI visual order.
 */
function prepareUnicodeForBijoy(text: string): string {
  let str = text;

  // 1. Decompose compound kars
  // ো -> ে + া
  str = str.replace(/ো/g, 'ো');
  // ৌ -> ে + ৗ
  str = str.replace(/ৌ/g, 'ৌ');

  // 2. Handle Reph: In Unicode, Reph is র + ্ at beginning of cluster.
  // In Bijoy, Reph © is placed AFTER the cluster (and after any vowel sign).
  // Pattern: র + ্ + (consonants with halant)+ (optional vowel sign)
  // We match (র্)([ক-হড়-য়](?:্[ক-হড়-য়])*(?:[া-ৌ])?) and flip to $2©
  const rephRegex = /র্([ক-হড়-য়](?:্[ক-হড়-য়])*)([া-ৌ]?)/g;
  str = str.replace(rephRegex, (_m, cluster, kar) => {
    return `${cluster}${kar}©`;
  });

  // 3. Handle Pre-base kars: ি, ে, ৈ
  // In Unicode, they follow the consonant or consonant cluster: e.g. ক + ি
  // In Bijoy, they must visually precede the cluster: w + K
  // Note: cluster can be: consonant + (্ + consonant)*
  const preKarRegex = /([ক-হড়-য়](?:্[ক-হড়-য়])*)([িেৈ])/g;
  str = str.replace(preKarRegex, (_m, cluster, kar) => {
    let bijoyPreKar = '';
    if (kar === 'ি') bijoyPreKar = 'w';
    else if (kar === 'ে') bijoyPreKar = '†';
    else if (kar === 'ৈ') bijoyPreKar = 'ˆ';
    return `${bijoyPreKar}${cluster}`;
  });

  return str;
}

/**
 * Converts Unicode Bengali text to Bijoy (SutonnyMJ ANSI)
 */
export function convertUnicodeToBijoy(text: string): ConversionReport {
  if (!text) {
    return { result: '', unmappedCount: 0, warnings: [] };
  }

  const warnings: string[] = [];

  // Step 1: Pre-process pre-kars, compound kars and Reph
  let processed = prepareUnicodeForBijoy(text);

  // Step 2: Replace multi-char conjuncts
  for (const [uni, bijoy] of UNICODE_TO_BIJOY_CONJUNCTS) {
    if (processed.includes(uni)) {
      processed = processed.split(uni).join(bijoy);
    }
  }

  // Step 3: Replace independent vowels
  for (const [uni, bijoy] of UNICODE_VOWELS) {
    if (processed.includes(uni)) {
      processed = processed.split(uni).join(bijoy);
    }
  }

  // Step 4: Replace consonants
  for (const [uni, bijoy] of UNICODE_CONSONANTS) {
    if (processed.includes(uni)) {
      processed = processed.split(uni).join(bijoy);
    }
  }

  // Step 5: Replace numbers
  for (const [uni, bijoy] of UNICODE_NUMBERS) {
    if (processed.includes(uni)) {
      processed = processed.split(uni).join(bijoy);
    }
  }

  // Step 6: Replace remaining post-kars and punctuation
  for (const [uni, bijoy] of UNICODE_POST_KARS) {
    if (processed.includes(uni)) {
      processed = processed.split(uni).join(bijoy);
    }
  }

  // Check if any untranslated Bengali characters remain
  const remainingBengali = processed.match(/[\u0980-\u09FF]/g);
  const unmappedCount = remainingBengali ? remainingBengali.length : 0;
  if (unmappedCount > 0) {
    const uniqueRemaining = Array.from(new Set(remainingBengali)).slice(0, 5).join(', ');
    warnings.push(`কিছু অক্ষর Bijoy এনকোডিংয়ে সমর্থিত নয় (${uniqueRemaining} ইত্যাদি)`);
  }

  return {
    result: processed,
    unmappedCount,
    warnings,
  };
}

/**
 * Converts Bijoy (SutonnyMJ ANSI) text to Unicode Bengali
 */
export function convertBijoyToUnicode(text: string): ConversionReport {
  if (!text) {
    return { result: '', unmappedCount: 0, warnings: [] };
  }

  const warnings: string[] = [];

  try {
    const result = libBijoyToUnicode(text);
    return {
      result,
      unmappedCount: 0,
      warnings,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'অজানা সমস্যা';
    warnings.push(`কনভার্ট করার সময় সমস্যা হয়েছে: ${message}`);
    return {
      result: text,
      unmappedCount: 1,
      warnings,
    };
  }
}
