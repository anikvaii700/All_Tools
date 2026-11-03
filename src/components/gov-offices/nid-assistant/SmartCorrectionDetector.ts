// Smart Correction Detection Engine for NID Assistant
import { NidCorrectionTypeId, DetectionResult } from '../types';
import { NID_CORRECTION_RULES } from '../knowledgeBase/electionCommissionData';

export function detectCorrectionType(
  existingText: string,
  correctedText: string,
  explicitType?: NidCorrectionTypeId
): DetectionResult {
  // If user explicitly picked a type, honor it directly
  if (explicitType && NID_CORRECTION_RULES[explicitType]) {
    return {
      detectedType: explicitType,
      confidence: 'high',
      reasoning: 'আপনি ড্রপডাউন থেকে সরাসরি এই সংশোধনের ধরনটি নির্বাচন করেছেন।',
      rule: NID_CORRECTION_RULES[explicitType],
    };
  }

  const existing = (existingText || '').trim();
  const corrected = (correctedText || '').trim();
  const combined = `${existing} ${corrected}`.toLowerCase();

  // Pattern 1: Blood Group Detection
  const bloodGroupRegex =
    /\b(a|b|ab|o)\s*[\+\-]|(রক্ত|ব্লাড|পজিটিভ|নেগেটিভ|positive|negative|blood)/i;
  if (bloodGroupRegex.test(combined)) {
    return {
      detectedType: 'blood_group_correction',
      confidence: 'high',
      reasoning:
        'তথ্য বিশ্লেষণে রক্তের গ্রুপ বা ল্যাবরেটরি সম্পর্কিত শব্দ সনাক্ত হয়েছে। এটি "ক" ক্যাটাগরির অন্তর্ভুক্ত।',
      rule: NID_CORRECTION_RULES.blood_group_correction,
      highlightDifference: `বিদ্যমান: ${existing} → সংশোধিত: ${corrected}`,
    };
  }

  // Pattern 2: Date of Birth Detection
  // Matches dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd, or bengali numbers/date keywords
  const dobRegex =
    /(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{2,4})|([০-৯]{1,4}[/\-.][০-৯]{1,2}[/\-.][০-৯]{2,4})|(জন্ম|তারিখ|সাল|বয়স|dob|birth)/i;
  if (dobRegex.test(combined)) {
    return {
      detectedType: 'dob_correction',
      confidence: 'high',
      reasoning:
        'তথ্য বিশ্লেষণে জন্মতারিখ, বয়স বা সাল সম্পর্কিত প্যাটার্ন সনাক্ত হয়েছে। এটি "গ" ক্যাটাগরি (বোর্ডের এসএসসি মূল সনদ আবশ্যক)।',
      rule: NID_CORRECTION_RULES.dob_correction,
      highlightDifference: `তারিখ পরিবর্তন: ${existing} ➔ ${corrected}`,
    };
  }

  // Pattern 3: Address Detection
  const addressKeywords = [
    'বাসা',
    'রোড',
    'গ্রাম',
    'হোল্ডিং',
    'থানা',
    'উপজেলা',
    'ডাকঘর',
    'সেক্টর',
    'পাড়া',
    'ফ্ল্যাট',
    'মহল্লা',
    'পোস্ট',
    'বাড়ি',
    'ঠিকানা',
    'address',
    'house',
    'road',
  ];
  if (addressKeywords.some((kw) => combined.includes(kw))) {
    return {
      detectedType: 'address_correction',
      confidence: 'high',
      reasoning:
        'তথ্য বিশ্লেষণে বাড়ি, হোল্ডিং, গ্রাম বা রোড সম্পর্কিত শব্দ পাওয়া গেছে। এটি ঠিকানা সংশোধনের ক্যাটাগরি।',
      rule: NID_CORRECTION_RULES.address_correction,
      highlightDifference: `ঠিকানা হালনাগাদ: ${existing} ➔ ${corrected}`,
    };
  }

  // Pattern 4: Parents Name Detection
  const parentsKeywords = ['পিতা', 'মাতা', 'বাবা', 'মা', 'বাবার', 'মায়ের', 'father', 'mother'];
  if (parentsKeywords.some((kw) => combined.includes(kw))) {
    return {
      detectedType: 'parents_name_correction',
      confidence: 'high',
      reasoning:
        'পিতা বা মাতার নাম সংশোধনের নির্দেশক শব্দ পাওয়া গেছে। পিতা/মাতার মূল এনআইডি অনুযায়ী এটি সংশোধন হবে।',
      rule: NID_CORRECTION_RULES.parents_name_correction,
      highlightDifference: `পিতা/মাতার নাম: ${existing} ➔ ${corrected}`,
    };
  }

  // Pattern 5: Spouse Name Detection
  const spouseKeywords = ['স্বামী', 'স্ত্রী', 'husband', 'wife', 'বিবাহ', 'তালাক', 'নিকাহনামা', 'বউ'];
  if (spouseKeywords.some((kw) => combined.includes(kw))) {
    return {
      detectedType: 'spouse_name_correction',
      confidence: 'high',
      reasoning:
        'বৈবাহিক অবস্থা বা স্বামী/স্ত্রীর তথ্য পরিবর্তনের উপাদান সনাক্ত হয়েছে। নিকাহনামা বা বিবাহ সনদ প্রয়োজন।',
      rule: NID_CORRECTION_RULES.spouse_name_correction,
      highlightDifference: `স্বামী/স্ত্রীর তথ্য: ${existing} ➔ ${corrected}`,
    };
  }

  // Pattern 6: Photo Detection
  const photoKeywords = ['ছবি', 'ঝাপসা', 'অস্পষ্ট', 'ক্যামেরা', 'photo', 'চেহারা'];
  if (photoKeywords.some((kw) => combined.includes(kw))) {
    return {
      detectedType: 'photo_change',
      confidence: 'high',
      reasoning: 'ছবি পরিবর্তন সংক্রান্ত তথ্য সনাক্ত হয়েছে (সশরীরে উপস্থিতি আবশ্যক)।',
      rule: NID_CORRECTION_RULES.photo_change,
    };
  }

  // Pattern 7: Signature Detection
  const signatureKeywords = ['স্বাক্ষর', 'দস্তখত', 'টিপ', 'টিপসহি', 'signature', 'sign'];
  if (signatureKeywords.some((kw) => combined.includes(kw))) {
    return {
      detectedType: 'signature_change',
      confidence: 'high',
      reasoning: 'স্বাক্ষর বা দস্তখত পরিবর্তনের তথ্য সনাক্ত হয়েছে।',
      rule: NID_CORRECTION_RULES.signature_change,
    };
  }

  // Pattern 8: Birthplace Detection
  const birthplaceKeywords = ['জন্মস্থান', 'জন্মের জেলা', 'জেলা', 'district', 'birthplace'];
  if (birthplaceKeywords.some((kw) => combined.includes(kw))) {
    return {
      detectedType: 'birthplace_correction',
      confidence: 'high',
      reasoning: 'জন্মস্থান বা জেলা পরিবর্তনের তথ্য সনাক্ত হয়েছে।',
      rule: NID_CORRECTION_RULES.birthplace_correction,
    };
  }

  // Pattern 9: Occupation / Education
  const otherKeywords = ['পেশা', 'শিক্ষাগত', 'ডিগ্রি', 'স্নাতক', 'চাকরি', 'ধর্ম', 'occupation'];
  if (otherKeywords.some((kw) => combined.includes(kw))) {
    return {
      detectedType: 'other_info_correction',
      confidence: 'high',
      reasoning: 'পেশা বা শিক্ষাগত যোগ্যতার মতো অন্যান্য তথ্য পরিবর্তনের ইঙ্গিত পাওয়া গেছে।',
      rule: NID_CORRECTION_RULES.other_info_correction,
    };
  }

  // Pattern 10: Name Comparison Analysis (Spelling vs Partial vs Full Change)
  if (existing.length > 0 && corrected.length > 0) {
    const existingTokens = existing.toLowerCase().split(/\s+/).filter(Boolean);
    const correctedTokens = corrected.toLowerCase().split(/\s+/).filter(Boolean);

    // Calculate common tokens
    const commonTokens = existingTokens.filter((token) => correctedTokens.includes(token));
    const tokenOverlapRatio =
      commonTokens.length / Math.max(existingTokens.length, correctedTokens.length, 1);

    // If ZERO common tokens and tokens are substantively different length -> Full Name Change!
    if (tokenOverlapRatio === 0 && existingTokens.length >= 1 && correctedTokens.length >= 1) {
      return {
        detectedType: 'name_full_change',
        confidence: 'high',
        reasoning:
          'পূর্বের ও বর্তমান নামের মাঝে কোনো শব্দের মিল পাওয়া যায়নি। এটি "সম্পূর্ণ নাম পরিবর্তন" (ক্যাটাগরি-গ) হিসেবে গণ্য হবে এবং সরকারি গেজেট ও কোর্ট এফিডেভিট আবশ্যক।',
        rule: NID_CORRECTION_RULES.name_full_change,
        highlightDifference: `পুরো নাম পরিবর্তন: "${existing}" ➔ "${corrected}"`,
      };
    }

    // Check for title/prefix additions like "মোসাঃ" vs "মোসাম্মৎ", "আক্তার"
    const prefixKeywords = ['মোসাঃ', 'মোসাম্মৎ', 'আক্তার', 'বেগম', 'চৌধুরী', 'খান', 'মিয়া'];
    const hasPrefixShift = prefixKeywords.some(
      (kw) =>
        (existing.includes(kw) && !corrected.includes(kw)) ||
        (!existing.includes(kw) && corrected.includes(kw))
    );

    if (hasPrefixShift || (tokenOverlapRatio > 0 && tokenOverlapRatio < 0.75)) {
      return {
        detectedType: 'name_partial_change',
        confidence: 'medium',
        reasoning:
          'নামের কিছু শব্দ বা উপাধি/পদবীর আংশিক পরিবর্তন লক্ষ্য করা গেছে। এটি "খ" ক্যাটাগরির আওতায় পড়তে পারে।',
        rule: NID_CORRECTION_RULES.name_partial_change,
        highlightDifference: `আংশিক পরিমার্জন: "${existing}" ➔ "${corrected}"`,
      };
    }

    // High overlap or slight character difference
    return {
      detectedType: 'self_name_correction',
      confidence: 'medium',
      reasoning:
        'নামের সাধারণ বানান বা অক্ষরের সামান্য ভুল সংশোধন হিসেবে সনাক্ত হয়েছে। এটি "ক" ক্যাটাগরির সাধারণ আবেদন।',
      rule: NID_CORRECTION_RULES.self_name_correction,
      highlightDifference: `বানান সংশোধন: "${existing}" ➔ "${corrected}"`,
    };
  }

  // Default fallback if no input given yet
  return {
    detectedType: 'self_name_correction',
    confidence: 'low',
    reasoning:
      'অনুগ্রহ করে আপনার তথ্য লিখুন অথবা নিচে থেকে সংশোধনের ধরন বা নমুনা তথ্য নির্বাচন করুন।',
    rule: NID_CORRECTION_RULES.self_name_correction,
  };
}
