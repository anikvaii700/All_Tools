import { ApplicationFormData, DocumentTypeInfo, TemplateId } from './types';

export function formatBengaliDate(isoDate?: string): string {
  if (!isoDate) {
    const today = new Date();
    const day = today.getDate();
    const monthNames = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const year = today.getFullYear();
    const bnNums = (n: number) => n.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);
    return `${bnNums(day)} ${monthNames[today.getMonth()]} ${bnNums(year)}`;
  }

  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const monthNames = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const bnNums = (n: string) => n.replace(/[0-9]/g, (digit) => '০১২৩৪৫৬৭৮৯'[+digit]);
    const monthIndex = parseInt(m, 10) - 1;
    const monthName = monthNames[monthIndex] || m;
    return `${bnNums(String(parseInt(d, 10)))} ${monthName} ${bnNums(y)}`;
  }

  return isoDate;
}

export function formatEnglishDate(isoDate?: string): string {
  if (!isoDate) {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return isoDate;
  return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function generateApplicationContent(
  typeInfo: DocumentTypeInfo,
  formData: ApplicationFormData,
  templateId: TemplateId
): string {
  const isBn = formData.language === 'bn';
  const dateStr = isBn
    ? (formData.date ? formatBengaliDate(formData.date) : formatBengaliDate())
    : (formData.date ? formatEnglishDate(formData.date) : formatEnglishDate());

  const applicant = formData.applicantName.trim() || (isBn ? '[আবেদনকারীর নাম]' : '[Applicant Name]');
  const designation = formData.applicantDesignation.trim() || '';
  const org = formData.organizationName.trim() || (isBn ? '[প্রতিষ্ঠানের নাম]' : '[Organization Name]');
  const orgAddr = formData.organizationAddress.trim() || (isBn ? '[প্রতিষ্ঠানের ঠিকানা]' : '[Organization Address]');
  const recipient = formData.recipientDesignation.trim() || (isBn ? typeInfo.defaultRecipientDesignationBn : typeInfo.defaultRecipientDesignationEn);
  const subject = formData.subject.trim() || (isBn ? typeInfo.defaultSubjectBn : typeInfo.defaultSubjectEn);
  const reason = formData.reason.trim() || (isBn ? (typeInfo.defaultReasonBn || '[সুনির্দিষ্ট কারণ/বিবরণ]') : (typeInfo.defaultReasonEn || '[Specific Reason/Details]'));

  const startDateStr = formData.startDate ? (isBn ? formatBengaliDate(formData.startDate) : formatEnglishDate(formData.startDate)) : '';
  const endDateStr = formData.endDate ? (isBn ? formatBengaliDate(formData.endDate) : formatEnglishDate(formData.endDate)) : '';
  const datesSpan = startDateStr && endDateStr
    ? (isBn ? `${startDateStr} হতে ${endDateStr} পর্যন্ত` : `from ${startDateStr} to ${endDateStr}`)
    : (startDateStr ? (isBn ? `${startDateStr} তারিখে` : `on ${startDateStr}`) : '');

  // ------------------------------------------------------------------------
  // BENGALI GENERATOR
  // ------------------------------------------------------------------------
  if (isBn) {
    // 1. School / College Leave or Absence
    if (typeInfo.id === 'school-leave' || typeInfo.id === 'college-leave' || typeInfo.id === 'absence-pardon') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

জনাব,
সবিনয় নিবেদন এই যে, আমি আপনার প্রতিষ্ঠানে ${designation ? designation + '-এর' : 'এক'} নিয়মিত শিক্ষার্থী। ${reason} কারণে ${datesSpan ? `আগামী ${datesSpan}` : 'নির্দিষ্ট সময়'} আমি বিদ্যালয়ে উপস্থিত থাকতে অসমর্থ হব।

অতএব, মহোদয়ের নিকট আকুল প্রার্থনা, উপরোক্ত বিষয়টি মানবিক দৃষ্টিকোণ থেকে বিবেচনা করে আমাকে ${datesSpan ? datesSpan + ' মোট দিনের' : 'উক্ত'} ছুটি মঞ্জুর করে বাধিত করবেন।

বিনীত নিবেদক,
${applicant}
${designation}
${org}${formData.applicantPhone ? `\nমোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 2. Exam Fee Waiver
    if (typeInfo.id === 'fee-waiver') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

জনাব,
বিনীত নিবেদন এই যে, আমি আপনার প্রতিষ্ঠানের ${designation || 'একজন নিয়মিত শিক্ষার্থী'}। আমি অত্যন্ত সুনামের সাথে নিয়মিত পাঠ গ্রহণ করে আসছি। অত্যন্ত দুঃখের সাথে জানাচ্ছি যে, ${reason}। ফলে আমার পরিবারের পক্ষে আসন্ন পরীক্ষার যাবতীয় ফি এককালীন পরিশোধ করা অত্যন্ত দুঃসাধ্য হয়ে পড়েছে। পরীক্ষার ফি পরিশোধে ব্যর্থ হলে আমার পড়াশোনায় অনাকাঙ্ক্ষিত বিঘ্ন ঘটবে।

অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, আমার পরিবারের আর্থিক অসচ্ছলতা এবং পড়াশোনায় আগ্রহ বিবেচনাপূর্বক আমাকে আসন্ন পরীক্ষার ফি সম্পূর্ণ বা আংশিক মওকুফ করে পড়াশোনা চালিয়ে যাওয়ার সুযোগদানে বাধিত করবেন।

বিনীত নিবেদক,
${applicant}
${designation}
${org}${formData.applicantPhone ? `\nমোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 3. Testimonial / Character Certificate / TC
    if (typeInfo.id === 'testimonial-request' || typeInfo.id === 'transfer-certificate') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

জনাব,
যথাযথ সম্মান প্রদর্শনপূর্বক নিবেদন এই যে, আমি আপনার প্রতিষ্ঠানের ${designation || 'একজন শিক্ষার্থী ছিলাম'}। ${reason}। অত্র প্রতিষ্ঠানে অধ্যয়নকালীন সময়ে আমি প্রতিষ্ঠানের সকল নিয়ম-শৃঙ্খলা যথাযথভাবে মেনে চলেছি এবং কোনো প্রকার অসামাজিক বা নিয়মবহির্ভূত কাজে জড়িত ছিলাম না।

অতএব, মহোদয়ের নিকট বিনীত আবেদন, আমার ভবিষ্যৎ শিক্ষাজীবন ও সার্বিক অগ্রগতির সুবিধার্থে আমাকে উক্ত সনদপত্র/ছাড়পত্র প্রদান করে বাধিত করবেন।

বিনীত নিবেদক,
${applicant}
${designation}
${org}${formData.applicantPhone ? `\nমোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 4. Job Application & Cover Letter
    if (typeInfo.id === 'job-application-cover') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
বিনীত নিবেদন এই যে, ${formData.referenceNo ? `গত ${formData.referenceNo}-এ` : 'সম্প্রতি'} প্রকাশিত নিয়োগ বিজ্ঞপ্তির মাধ্যমে অবগত হলাম যে, আপনার স্বনামধন্য প্রতিষ্ঠানে ‘${formData.applicantDesignation || 'উল্লেখিত পদ'}’ পদে কিছুসংখ্যক দক্ষ জনবল নিয়োগ দেওয়া হবে। আমি উক্ত পদের একজন আগ্রহী প্রার্থী হিসেবে আমার বিস্তারিত তথ্য আপনার সদয় বিবেচনার জন্য উপস্থাপন করছি।

আমার শিক্ষাগত যোগ্যতা: ${formData.education || '[শিক্ষাগত যোগ্যতা উল্লেখ করুন]'}।
কর্মদক্ষতা ও অভিজ্ঞতা: ${formData.experience || '[অভিজ্ঞতা উল্লেখ করুন]'}।
বিশেষ দক্ষতা: ${formData.skills || '[বিশেষ দক্ষতা]'}।

আমি বিশ্বাস করি, আমার একাগ্রতা, দায়িত্বশীলতা ও বাস্তব অভিজ্ঞতা আপনার প্রতিষ্ঠানের কাঙ্ক্ষিত লক্ষ্য অর্জনে ইতিবাচক ভূমিকা রাখবে।

অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, আমার যোগ্যতা ও অভিজ্ঞতার বিষয়টি সহৃদয় বিবেচনা করে আমাকে একটি লিখিত/মৌখিক পরীক্ষার সুযোগ প্রদান করে বাধিত করবেন।

বিনীত,
${applicant}
${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}` : ''}
${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}` : ''}
${formData.applicantEmail ? `ইমেইল: ${formData.applicantEmail}` : ''}

সংযুক্তি:
১. জীবনবৃত্তান্ত (CV / Resume)
২. সকল শিক্ষাগত সনদের সত্যায়িত অনুলিপি
৩. সদ্য তোলা পাসপোর্ট সাইজ ছবি`;
    }

    // 5. Office Casual / Sick / General Leave
    if (typeInfo.id === 'office-casual-leave' || typeInfo.id === 'office-sick-leave' || typeInfo.id === 'office-leave-general' || typeInfo.id === 'paternity-leave' || typeInfo.id === 'maternity-leave') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
যথাযথ সম্মান প্রদর্শনপূর্বক বিনীত নিবেদন এই যে, আমি আপনার প্রতিষ্ঠানে ${designation ? `${designation} হিসেবে` : 'একনিষ্ঠভাবে'} কর্মরত রয়েছি। ${reason}। ফলে ${datesSpan ? `${datesSpan} পর্যন্ত` : 'নির্দিষ্ট দিনগুলোতে'} অফিসে উপস্থিত থেকে নিয়মিত দায়িত্ব পালন করা আমার পক্ষে সম্ভব হবে না।

আমার অনুপস্থিতিকালীন সময়ে জরুরি কোনো দাপ্তরিক সমন্বয়ের প্রয়োজন হলে ফোনে বা ইমেইলে যোগাযোগ রক্ষা করার যথাসাধ্য চেষ্টা করব${formData.specificDetails ? `। (${formData.specificDetails})` : '।'}

অতএব, মহোদয়ের নিকট বিনীত আবেদন, আমার উপরোক্ত পরিস্থিতি বিবেচনা করে আমাকে ${datesSpan ? `${datesSpan} মোট দিনের` : 'প্রয়োজনীয় দিনের'} ছুটি মঞ্জুর করে বাধিত করবেন।

বিনীত নিবেদক,
${applicant}
${designation}
${org}${formData.applicantPhone ? `\nমোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 6. Resignation Letter
    if (typeInfo.id === 'resignation-letter') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
বিনীত নিবেদন এই যে, আমি আপনার স্বনামধন্য প্রতিষ্ঠানে ${designation ? `${designation} হিসেবে` : 'একজন কর্মী হিসেবে'} বিশ্বস্ততা ও নিষ্ঠার সাথে দায়িত্ব পালন করে আসছি। অত্যন্ত ভারাক্রান্ত হৃদয়ে জানাচ্ছি যে, ${reason} আমার পক্ষে এই পদে দায়িত্ব অব্যাহত রাখা সম্ভব হচ্ছে না।

কোম্পানির চাকরির নীতিমালা ও নোটিশ পিরিয়ড অনুযায়ী ${formData.startDate ? formatBengaliDate(formData.startDate) : '[তারিখ]'} হতে আমার পদত্যাগপত্রটি কার্যকর করার বিনীত অনুরোধ জানাচ্ছি। দায়িত্ব হস্তান্তরের শেষ দিন পর্যন্ত আমি আমার সকল চলমান প্রকল্প ও ফাইলের দায়িত্ব সংশ্লিষ্ট সহকর্মীর নিকট হস্তান্তর করব।

অত্র প্রতিষ্ঠানে কাজ করার সুযোগ, সহকর্মীদের আন্তরিক সহযোগিতা এবং কর্তৃপক্ষের দিকনির্দেশনার জন্য আমি চিরকৃতজ্ঞ।

অতএব, মহোদয়ের নিকট বিনীত আবেদন, আমার পদত্যাগপত্রটি গ্রহণ পূর্বক সকল প্রাতিষ্ঠানিক পাওনা ও ক্লিয়ারেন্স প্রদানে সদয় অনুমতি দিয়ে বাধিত করবেন।

বিনীত নিবেদক,
${applicant}
${designation}
${org}${formData.applicantPhone ? `\nমোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 7. Government & NID / Birth Certificate Correction
    if (typeInfo.id === 'birth-cert-correction' || typeInfo.id === 'nid-correction' || typeInfo.id === 'name-correction' || typeInfo.id === 'citizen-certificate') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
যথাযথ সম্মানপূর্বক বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicant}, ${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}` : 'আপনার আওতাধীন এলাকার একজন স্থায়ী বাসিন্দা'}। 

আমার অফিসিয়াল রেকর্ডে ${reason}। উক্ত ভুলের কারণে বিভিন্ন নাগরিক ও প্রাতিষ্ঠানিক সেবা গ্রহণে আমি জটিলতার সম্মুখীন হচ্ছি। প্রমাণস্বরূপ প্রয়োজনীয় মূল দলিলের সত্যায়িত অনুলিপি আবেদনের সাথে সংযুক্ত করা হলো।

অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, সংযুক্ত প্রমাণাদি যাচাই-বাছাই পূর্বক আমার নথির উল্লেখিত ভুল সংশোধন করে সঠিক তথ্য হালনাগাদ করার প্রয়োজনীয় ব্যবস্থা গ্রহণে আপনার সদয় মর্জি হয়।

বিনীত নিবেদক,
${applicant}
${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}` : ''}
${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}` : ''}

সংযুক্তি:
১. প্রাসঙ্গিক সনদের সত্যায়িত কপি
২. জাতীয় পরিচয়পত্র / জন্মনিবন্ধন সনদ`;
    }

    // 8. Complaints & Road/Drain/Water/Power Repair
    if (typeInfo.id === 'general-complaint' || typeInfo.id === 'road-drain-repair' || typeInfo.id === 'electricity-complaint' || typeInfo.id === 'service-deficiency-complaint') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
যথাযথ সম্মানপূর্বক আপনার দৃষ্টি আকর্ষণ করছি যে, আমি/আমরা ${formData.applicantAddress ? `${formData.applicantAddress} এলাকার বাসিন্দা` : 'ভুক্তভোগী পক্ষ'}। 

বিগত বেশ কিছুদিন যাবত আমাদের এলাকায় ${reason}। এর ফলে সাধারণ মানুষ, শিক্ষার্থী ও বয়োজ্যেষ্ঠদের জীবনযাত্রা চরম দুর্ভোগের শিকার হচ্ছে এবং যেকোনো মুহূর্তে বড় ধরনের দুর্ঘটনা বা অচলাবস্থার আশঙ্কা দেখা দিয়েছে।

অতএব, মহোদয়ের নিকট আকুল আবেদন, সরেজমিনে তদন্তপূর্বক জনস্বার্থে বিষয়টি অতীব জরুরি বিবেচনা করে অনতিবিলম্বে কার্যকর পদক্ষেপ ও প্রতিকার গ্রহণ করতে আপনার সদয় মর্জি হয়।

বিনীত নিবেদক,
${applicant}
${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}` : ''}
${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 9. Business / Payment Reminder / Notice
    if (typeInfo.id === 'payment-reminder' || typeInfo.id === 'business-letter-formal' || typeInfo.id === 'supplier-notice') {
      return `তারিখ: ${dateStr}
${formData.referenceNo ? `স্মারক নং: ${formData.referenceNo}` : ''}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
আমাদের প্রতিষ্ঠান ও আপনার স্বনামধন্য প্রতিষ্ঠানের মধ্যে বিদ্যমান বাণিজ্যিক সম্পর্কের প্রতি আন্তরিক সম্মান প্রদর্শনপূর্বক জানাচ্ছি যে, ${reason}।

উভয় প্রতিষ্ঠানের সুষ্ঠু ব্যবসায়িক ধারাবাহিকতা ও পারস্পরিক সৌহার্দ্য বজায় রাখার লক্ষ্যে বিষয়টি দ্রুত নিষ্পত্তির জন্য আপনার সদয় সহযোগিতা কামনা করছি।

অতএব, মহোদয়ের নিকট বিনীত অনুরোধ, উল্লেখিত বিষয়ের আলোকে প্রয়োজনীয় পদক্ষেপ গ্রহণ করে আমাদের বাধিত করবেন।

ধন্যবাদান্তে,
${applicant}
${designation}
${formData.applicantAddress ? `${formData.applicantAddress}` : ''}
${formData.applicantPhone ? `ফোন: ${formData.applicantPhone}` : ''}`;
    }

    // 10. Default General Bengali Application
    return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
যথাযথ সম্মান প্রদর্শনপূর্বক বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicant}। ${reason}।

অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, উল্লেখিত পরিস্থিতি ও মানবিক দিক বিবেচনা করে বিষয়টি সদয় বিবেচনা ও প্রয়োজনীয় মঞ্জুরি প্রদান করে বাধিত করবেন।

বিনীত নিবেদক,
${applicant}
${designation ? `${designation}\n` : ''}${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}` : ''}`;
  }

  // ------------------------------------------------------------------------
  // ENGLISH GENERATOR
  // ------------------------------------------------------------------------
  const englishSalutation = 'Dear Sir/Madam,';
  const englishSignOff = 'Yours sincerely,';

  if (typeInfo.id === 'job-application-cover') {
    return `Date: ${dateStr}

To
${recipient}
${org}
${orgAddr}

Subject: ${subject}

${englishSalutation}

I am writing to express my enthusiastic interest in the position of "${formData.applicantDesignation || 'the advertised role'}" at ${org}, as advertised recently${formData.referenceNo ? ` via ${formData.referenceNo}` : ''}.

Academic Background: ${formData.education || '[Educational Qualifications]'}.
Professional Experience: ${formData.experience || '[Work Experience]'}.
Key Skills & Competencies: ${formData.skills || '[Key Technical & Interpersonal Skills]'}.

Throughout my professional and academic journey, I have developed strong problem-solving abilities, exceptional dedication, and a commitment to organizational excellence. I am confident that my skills and proactive work ethic align well with the vision of your esteemed organization.

Thank you for considering my application. I would welcome the opportunity to discuss my qualifications with you in an interview.

${englishSignOff}

${applicant}
${formData.applicantAddress ? `${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `Phone: ${formData.applicantPhone}\n` : ''}${formData.applicantEmail ? `Email: ${formData.applicantEmail}` : ''}

Enclosures:
1. Detailed Curriculum Vitae (CV)
2. Copies of Academic Certificates
3. Passport Size Photographs`;
  }

  if (typeInfo.id === 'resignation-letter') {
    return `Date: ${dateStr}

To
${recipient}
${org}
${orgAddr}

Subject: ${subject}

${englishSalutation}

Please accept this letter as formal notification that I am resigning from my position as ${designation || 'an employee'} at ${org}. ${reason}.

As per company policy and notice guidelines, my last working day will be ${formData.startDate ? formatEnglishDate(formData.startDate) : '[Date]'}. During this transition period, I am committed to completing all pending tasks and ensuring a seamless handover to my team members.

I would like to express my sincere appreciation for the opportunities and professional growth I have experienced during my tenure with ${org}.

I wish the organization continued success and prosperity in all its future endeavors.

${englishSignOff}

${applicant}
${designation}
${org}${formData.applicantPhone ? `\nPhone: ${formData.applicantPhone}` : ''}`;
  }

  // Default Standard English Formal Application
  return `Date: ${dateStr}

To
${recipient}
${org}
${orgAddr}

Subject: ${subject}

${englishSalutation}

I am writing to respectfully bring to your kind attention that I am ${applicant}${designation ? `, currently serving/studying as ${designation}` : ''}.

${reason}. ${datesSpan ? `Therefore, I request your kind consideration for the period ${datesSpan}.` : ''}

In light of the above circumstances, I earnestly request that you kindly consider my application favorably and grant the necessary approval.

Thanking you for your kind consideration and cooperation.

${englishSignOff}

${applicant}
${designation ? `${designation}\n` : ''}${org ? `${org}\n` : ''}${formData.applicantAddress ? `Address: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `Phone: ${formData.applicantPhone}` : ''}`;
}
