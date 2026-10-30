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
  const reason = formData.reason.trim() || (isBn ? (typeInfo.defaultReasonBn || '[সুনির্দিষ্ট বিবরণ / কারণ]') : (typeInfo.defaultReasonEn || '[Specific Reason / Details]'));

  const startDateStr = formData.startDate ? (isBn ? formatBengaliDate(formData.startDate) : formatEnglishDate(formData.startDate)) : '';
  const endDateStr = formData.endDate ? (isBn ? formatBengaliDate(formData.endDate) : formatEnglishDate(formData.endDate)) : '';
  const datesSpan = startDateStr && endDateStr
    ? (isBn ? `${startDateStr} হতে ${endDateStr} পর্যন্ত` : `from ${startDateStr} to ${endDateStr}`)
    : (startDateStr ? (isBn ? `${startDateStr} তারিখে` : `on ${startDateStr}`) : '');

  // ------------------------------------------------------------------------
  // BENGALI GENERATOR
  // ------------------------------------------------------------------------
  if (isBn) {
    // 1. POLICE GENERAL DIARY (GD) FORMAT
    if (typeInfo.documentFormat === 'gd' || typeInfo.id.startsWith('gd-')) {
      const fatherOrHusband = formData.applicantFatherOrHusband ? `পিতা/স্বামী: ${formData.applicantFatherOrHusband}` : '';
      const incidentInfo = [
        formData.incidentDateTime ? `• ঘটনার সময়: ${formData.incidentDateTime}` : '',
        formData.incidentPlace ? `• ঘটনার স্থান: ${formData.incidentPlace}` : '',
      ].filter(Boolean).join('\n');

      const lostDetails = formData.lostOrItemDetails || reason;

      return `তারিখ: ${dateStr}

বরাবর
${recipient || 'অফিসার ইনচার্জ (ওসি)'}
${org || '[থানার নাম ও জেলা]'}
${orgAddr}

বিষয়: ${subject}

জনাব,
যথাযথ সম্মানপূর্বক বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicant}${fatherOrHusband ? `, ${fatherOrHusband}` : ''}${formData.applicantAddress ? `, বর্তমান ঠিকানা: ${formData.applicantAddress}` : ''}${formData.applicantPhone ? `, মোবাইল: ${formData.applicantPhone}` : ''}।

আপনার থানার আওতাধীন এলাকায় নিম্নোক্ত অনাকাঙ্ক্ষিত ঘটনাটি ঘটেছে:
${incidentInfo ? `${incidentInfo}\n` : ''}
ঘটনার বিস্তারিত / হারানো জিনিসের বিবরণ:
${lostDetails}

উক্ত হারানো নথিপত্র / ঘটনার প্রেক্ষিতে ভবিষ্যতের আইনি নিরাপত্তা, নথির পুনঃউত্তোলন ও প্রশাসনিক দাপ্তরিক সুরক্ষার স্বার্থে বিষয়টি আপনার থানার সাধারণ ডায়েরি (জিডি) হিসেবে লিপিবদ্ধ করা একান্ত প্রয়োজন। সম্ভাব্য সকল স্থানে খোঁজাখুঁজি করিয়াও কোনো সন্ধান পাওয়া যায়নি।

অতএব, মহোদয়ের নিকট আকুল প্রার্থনা, উপরোক্ত বিষয়টি বিবেচনাপূর্বক আমার এই সাধারণ ডায়েরি (জিডি) গ্রহণ করিয়া একটি জিডি নম্বর প্রদান ও আইনগত ব্যবস্থা গ্রহণে আপনার সদয় মর্জি হয়।

বিনীত নিবেদক,
স্বাক্ষর: .......................................
${applicant}
${fatherOrHusband}
${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `মোবাইল নম্বর: ${formData.applicantPhone}` : ''}`;
    }

    // 2. POLICE WRITTEN COMPLAINT FORMAT (থানায় লিখিত অভিযোগ)
    if (typeInfo.documentFormat === 'police_complaint' || typeInfo.categoryId === 'police') {
      const fatherOrHusband = formData.applicantFatherOrHusband ? `পিতা/স্বামী: ${formData.applicantFatherOrHusband}` : '';
      const incidentInfo = [
        formData.incidentDateTime ? `• ঘটনার তারিখ ও সময়: ${formData.incidentDateTime}` : '',
        formData.incidentPlace ? `• ঘটনাস্থল: ${formData.incidentPlace}` : '',
        formData.specificDetails ? `• অভিযুক্ত/বিবাদীর বিবরণ: ${formData.specificDetails}` : '',
      ].filter(Boolean).join('\n');

      return `তারিখ: ${dateStr}

বরাবর
${recipient || 'অফিসার ইনচার্জ (ওসি)'}
${org || '[থানার নাম ও জেলা]'}
${orgAddr}

বিষয়: ${subject}

জনাব,
যথাযথ সম্মান প্রদর্শনপূর্বক বিনীত নিবেদন এই যে, আমি অভিযোগকারী ${applicant}${fatherOrHusband ? `, ${fatherOrHusband}` : ''}${formData.applicantAddress ? `, ঠিকানা: ${formData.applicantAddress}` : ''}${formData.applicantPhone ? `, মোবাইল: ${formData.applicantPhone}` : ''}।

আমি আপনার থানায় উপস্থিত হয়ে নিম্নোক্ত অপরাধ ও অন্যায়ের প্রতিকার চেয়ে লিখিত অভিযোগ দায়ের করছি:
${incidentInfo ? `${incidentInfo}\n` : ''}
অভিযোগের মূল বিবরণ:
${reason}

উক্ত ঘটনার কারণে আমি ও আমার পরিবার চরম নিরাপত্তাহীনতা ও ক্ষতির শিকার হচ্ছি। স্থানীয়ভাবে বিষয়টি সমাধানের চেষ্টা সত্ত্বেও বিবাদীগণ কোনো আইনি নিয়মনীতির তোয়াক্কা না করে অন্যায় কার্যক্রম অব্যাহত রেখেছে।

অতএব, মহোদয়ের নিকট আকুল প্রার্থনা, বিষয়টি জরুরি বিবেচনা করে সরেজমিনে তদন্তপূর্বক দোষীদের বিরুদ্ধে দ্রুত আইনানুগ ব্যবস্থা গ্রহণ এবং আমাকে/আমাদের সার্বিক নিরাপত্তা প্রদানে আপনার সদয় মর্জি হয়।

বিনীত অভিযোগকারী,
স্বাক্ষর: .......................................
${applicant}
${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `মোবাইল নম্বর: ${formData.applicantPhone}` : ''}`;
    }

    // 3. MUNICIPAL / UNION PARISHAD FORMAT (ইউপি / পৌরসভা / সিটি কর্পোরেশন)
    if (typeInfo.documentFormat === 'municipal' || typeInfo.categoryId === 'municipal') {
      const fatherOrHusband = formData.applicantFatherOrHusband ? `পিতা/স্বামী: ${formData.applicantFatherOrHusband}` : '';

      return `তারিখ: ${dateStr}

বরাবর
${recipient || 'চেয়ারম্যান / মেয়র মহোদয়'}
${org || '[ইউনিয়ন পরিষদ / পৌরসভা / সিটি কর্পোরেশন]'}
${orgAddr}

বিষয়: ${subject}

জনাব,
সবিনয় নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicant}${fatherOrHusband ? `, ${fatherOrHusband}` : ''}${formData.applicantAddress ? `, গ্রাম/ওয়ার্ড/মহল্লা: ${formData.applicantAddress}` : ''}। আমি আপনার আওতাধীন এলাকার একজন স্থায়ী বাসিন্দা ও নিয়মিত নাগরিক।

${reason}

আমার চাকরি, উচ্চশিক্ষা, জাতীয় পরিচয়পত্র বা পারিবারিক দাপ্তরিক কাজের সুবিধার স্বার্থে উপরোক্ত বিষয়ে আপনার কার্যালয় হতে প্রমিত সনদপত্র/প্রত্যয়নপত্র/অনুমোদন প্রদান করা একান্ত আবশ্যক।

অতএব, মহোদয়ের নিকট বিনীত আবেদন, আমার প্রদত্ত সকল নাগরিক তথ্য ও রেকর্ডপত্র যাচাইপূর্বক কাঙ্ক্ষিত প্রত্যয়নপত্র / সনদটি প্রদান করে বাধিত করবেন।

বিনীত নিবেদক,
স্বাক্ষর: .......................................
${applicant}
${fatherOrHusband ? `${fatherOrHusband}\n` : ''}${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 4. EDUCATION LEAVE / ABSENCE
    if (typeInfo.id === 'school-leave' || typeInfo.id === 'college-leave' || typeInfo.id === 'absence-pardon' || typeInfo.id === 'edu-absence-sick') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

জনাব,
সবিনয় নিবেদন এই যে, আমি আপনার প্রতিষ্ঠানে ${designation ? designation + '-এর' : 'এক'} নিয়মিত শিক্ষার্থী। ${reason} কারণে ${datesSpan ? `আগামী ${datesSpan}` : 'নির্দিষ্ট সময়'} আমি প্রতিষ্ঠানে উপস্থিত থাকতে অসমর্থ হব।

অতএব, মহোদয়ের নিকট আকুল প্রার্থনা, উপরোক্ত বিষয়টি মানবিক দৃষ্টিকোণ থেকে বিবেচনা করে আমাকে ${datesSpan ? datesSpan + ' মোট দিনের' : 'উক্ত'} ছুটি মঞ্জুর করে বাধিত করবেন।

বিনীত নিবেদক,
${applicant}
${designation}
${org}${formData.applicantPhone ? `\nমোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 5. JOB APPLICATION & COVER LETTER
    if (typeInfo.id === 'job-application-cover' || typeInfo.id === 'job-entry-application' || typeInfo.id === 'job-promoted-application') {
      return `তারিখ: ${dateStr}
${formData.referenceNo ? `সূত্র/বিজ্ঞাপন নং: ${formData.referenceNo}` : ''}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
বিনীত নিবেদন এই যে, আপনার স্বনামধন্য প্রতিষ্ঠানে সম্প্রতি প্রকাশিত নিয়োগ বিজ্ঞপ্তির সূত্রে জানতে পারলাম যে, ‘${formData.applicantDesignation || 'নির্দিষ্ট পদে'}’ কিছু সংখ্যক দক্ষ জনবল নিয়োগ দেওয়া হবে। আমি উক্ত পদের একজন আগ্রহী প্রার্থী হিসেবে আমার প্রয়োজনীয় বৃত্তান্ত আপনার সদয় বিবেচনার জন্য উপস্থাপন করছি।

আমার শিক্ষাগত যোগ্যতা: ${formData.education || 'স্নাতকোত্তর / স্নাতক'}।
কাজের অভিজ্ঞতা ও দক্ষতা: ${formData.experience || formData.skills || 'সংশ্লিষ্ট ক্ষেত্রে সফল কাজের অভিজ্ঞতা ও দায়িত্বশীলতা'}।

মূল আবেদনপত্র ও অন্যান্য তথ্যাদি:
${reason}

আমি দৃঢ়ভাবে বিশ্বাস করি, আমার নিষ্ঠা, কর্মদক্ষতা ও ইতিবাচক মানসিকতা আপনার প্রতিষ্ঠানের সামগ্রিক অগ্রগতিতে কার্যকর ভূমিকা রাখবে।

অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, আমার শিক্ষাগত যোগ্যতা ও অভিজ্ঞতার আলোকে আমাকে উক্ত পদে নিয়োগের নিমিত্তে লিখিত ও মৌখিক পরীক্ষায় অংশগ্রহণের সুযোগ দানে আপনার সদয় মর্জি হয়।

বিনীত নিবেদক,
${applicant}
${formData.applicantAddress ? `বর্তমান ঠিকানা: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `মোবাইল নম্বর: ${formData.applicantPhone}\n` : ''}${formData.applicantEmail ? `ইমেইল: ${formData.applicantEmail}` : ''}

সংযুক্তি:
১. পূর্ণাঙ্গ জীবনবৃত্তান্ত (CV)
২. সকল শিক্ষাগত সনদের সত্যায়িত অনুলিপি
৩. সদ্য তোলা পাসপোর্ট সাইজের রঙিন ছবি
৪. জাতীয় পরিচয়পত্রের অনুলিপি`;
    }

    // 6. RESIGNATION LETTER (পদত্যাগপত্র)
    if (typeInfo.id === 'resignation-letter') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
যথাযথ সম্মানপূর্বক বিনীত নিবেদন এই যে, আমি আপনার প্রতিষ্ঠানে ${designation || 'একজন দায়িত্বরত কর্মী'} হিসেবে দায়িত্ব পালন করে আসছি। অত্যন্ত দুঃখের সাথে জানাচ্ছি যে, ${reason}।

প্রতিষ্ঠানের নিয়মানুযায়ী নোটিশ পিরিয়ড অনুযায়ী আগামী ${formData.startDate ? formatBengaliDate(formData.startDate) : 'নির্ধারিত তারিখে'} আমার শেষ কর্মদিবস নির্ধারণের জন্য অনুরোধ করছি। এই সময়ের মধ্যে আমার দায়িত্বে থাকা যাবতীয় নথি ও কাজ সহকর্মীদের বুঝিয়ে দেওয়ার সম্পূর্ণ নিশ্চয়তা দিচ্ছি।

আপনার প্রতিষ্ঠানে কর্মরত অবস্থায় আমি যে আন্তরিক সহযোগিতা ও পেশাগত শিক্ষার সুযোগ পেয়েছি, তার জন্য আমি চিরকৃতজ্ঞ। প্রতিষ্ঠানের উত্তরোত্তর সমৃদ্ধি ও সাফল্য কামনা করি।

অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, উল্লেখিত পরিস্থিতি বিবেচনা করে আমার পদত্যাগপত্রটি গ্রহণপূর্বক চাকরি থেকে অব্যাহতি ও বকেয়া পাওনাদি পরিশোধে আপনার সদয় মর্জি হয়।

বিনীত নিবেদক,
${applicant}
${designation}
${org}${formData.applicantPhone ? `\nমোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 7. LAND & PROPERTY PETITIONS (ভূমি অফিস ও নামজারি)
    if (typeInfo.categoryId === 'land') {
      const fatherOrHusband = formData.applicantFatherOrHusband ? `পিতা/স্বামী: ${formData.applicantFatherOrHusband}` : '';

      return `তারিখ: ${dateStr}

বরাবর
${recipient || 'সহকারী কমিশনার (ভূমি) / কানুনগো / তহশিলদার মহোদয়'}
${org || 'উপজেলা ভূমি অফিস / ইউনিয়ন ভূমি উপ-সহকারী কর্মকর্তা'}
${orgAddr}

বিষয়: ${subject}

জনাব,
যথাযথ সম্মানপূর্বক বিনীত নিবেদন এই যে, আমি আবেদনকারী ${applicant}${fatherOrHusband ? `, ${fatherOrHusband}` : ''}${formData.applicantAddress ? `, ঠিকানা: ${formData.applicantAddress}` : ''}।

আবেদনের প্রেক্ষাপট ও জমির বিবরণ:
${reason}

${formData.specificDetails ? `অতিরিক্ত রেকর্ড ও সূত্র: ${formData.specificDetails}\n` : ''}উক্ত জমির যাবতীয় খাজনা, রেজিস্ট্রি দলিল ও মালিকানা রেকর্ড সঠিক থাকা সত্ত্বেও সরকারি খাতায় নামজারি/রেকর্ড সংরক্ষণ না হলে আমি আইনগত ভোগদখলে বাধার সম্মুখীন হচ্ছি।

অতএব, মহোদয়ের নিকট আকুল প্রার্থনা, সরেজমিনে তদন্তপূর্বক আমার জমিসংক্রান্ত কাগজপত্রাদি যাচাই করিয়া কাঙ্ক্ষিত নামজারি/খতিয়ান সংশোধন/সীমানা নির্ধারণ আদেশ মঞ্জুর করে বাধিত করবেন।

বিনীত নিবেদক,
স্বাক্ষর: .......................................
${applicant}
${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 8. BANKING & FINANCE PETITIONS (ব্যাংক ও আর্থিক প্রতিষ্ঠান)
    if (typeInfo.categoryId === 'bank') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient || 'শাখা ব্যবস্থাপক (Branch Manager)'}
${org || '[ব্যাংকের নাম ও শাখা]'}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
যথাযথ সম্মানপূর্বক বিনীত নিবেদন এই যে, আমি আপনার স্বনামধন্য ব্যাংকের একজন নিয়মিত গ্রাহক।
${formData.accountOrMeterNo ? `আমার হিসাব নম্বর (Account No): ${formData.accountOrMeterNo}\n` : ''}
${reason}

ব্যাংকিং লেনদেনের সুবিধার্থে ও ব্যক্তিগত/ব্যবসায়িক প্রয়োজনে উক্ত সেবাটি দ্রুত সম্পন্ন হওয়া একান্ত প্রয়োজন।

অতএব, মহোদয়ের নিকট বিনীত অনুরোধ, আমার হিসাবের তথ্য যাচাইপূর্বক উল্লেখিত বিষয়টি সদয় বিবেচনা করে প্রয়োজনীয় কার্যকর ব্যবস্থা গ্রহণ করে বাধিত করবেন।

ধন্যবাদান্তে,
${applicant}
${formData.accountOrMeterNo ? `হিসাব নং: ${formData.accountOrMeterNo}\n` : ''}${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}\n` : ''}${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}` : ''}`;
    }

    // 9. UTILITY PETITIONS (বিদ্যুৎ, গ্যাস, পানি)
    if (typeInfo.categoryId === 'utility') {
      return `তারিখ: ${dateStr}

বরাবর
${recipient || 'নির্বাহী প্রকৌশলী / সহকারী প্রকৌশলী / ডিজিএম'}
${org || '[বিদ্যুৎ/ওয়াসা/গ্যাস কর্তৃপক্ষ]'}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
সম্মানপূর্বক বিনীত নিবেদন এই যে, আমি আপনার আওতাধীন এলাকার একজন নিয়মিত সম্মানিত গ্রাহক।
${formData.accountOrMeterNo ? `গ্রাহক হিসাব/মিটার নম্বর: ${formData.accountOrMeterNo}\n` : ''}
${reason}

উক্ত সমস্যার কারণে পরিবার-পরিজন নিয়ে নিয়মিত বিদ্যুৎ/পানি/গ্যাস ব্যবহারে চরম ভোগান্তির শিকার হচ্ছি এবং স্বাভাবিক নাগরিক জীবন ব্যাহত হচ্ছে।

অতএব, মহোদয়ের নিকট বিনীত আবেদন, সরেজমিনে পরিদর্শনের ব্যবস্থা করে অনতিবিলম্বে সমস্যাটি সমাধান / নতুন মিটার বা সংযোগ স্থাপনের কার্যকর ব্যবস্থা গ্রহণ করে জনদুর্ভোগ লাঘব করবেন।

বিনীত নিবেদক,
${applicant}
${formData.accountOrMeterNo ? `মিটার/গ্রাহক নং: ${formData.accountOrMeterNo}\n` : ''}${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}` : ''}`;
    }

    // 10. DEFAULT STANDARD FORMAL BENGALI APPLICATION
    const fatherOrHusband = formData.applicantFatherOrHusband ? `পিতা/স্বামী: ${formData.applicantFatherOrHusband}` : '';

    return `তারিখ: ${dateStr}

বরাবর
${recipient}
${org}
${orgAddr}

বিষয়: ${subject}

মহোদয়,
যথাযথ সম্মান প্রদর্শনপূর্বক বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${applicant}${designation ? `, ${designation}` : ''}${fatherOrHusband ? `, ${fatherOrHusband}` : ''}${formData.applicantAddress ? `, ঠিকানা: ${formData.applicantAddress}` : ''}।

${reason}

অতএব, মহোদয়ের নিকট আকুল প্রার্থনা, উপরোক্ত বিষয়সমূহ সহৃদয় বিবেচনার সাথে পর্যালোচনাপূর্বক প্রয়োজনীয় মঞ্জুরি ও কার্যকর আদেশ প্রদান করে বাধিত করবেন।

বিনীত নিবেদক,
স্বাক্ষর: .......................................
${applicant}
${designation ? `${designation}\n` : ''}${formData.applicantAddress ? `ঠিকানা: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `মোবাইল: ${formData.applicantPhone}` : ''}`;
  }

  // ------------------------------------------------------------------------
  // ENGLISH GENERATOR
  // ------------------------------------------------------------------------
  const englishSalutation = 'Dear Sir/Madam,';
  const englishSignOff = 'Yours sincerely,';

  if (typeInfo.documentFormat === 'gd' || typeInfo.id.startsWith('gd-')) {
    return `Date: ${dateStr}

To
The Officer-in-Charge (OC)
${org || '[Police Station Name]'}
${orgAddr}

Subject: ${subject}

Sir,
I, the undersigned ${applicant}${formData.applicantFatherOrHusband ? `, S/O / D/O: ${formData.applicantFatherOrHusband}` : ''}, residing at ${formData.applicantAddress || '[Present Address]'}, Contact: ${formData.applicantPhone || '[Phone Number]'}, would like to report the following incident for official General Diary (GD) entry:

Incident Details:
• Date & Time: ${formData.incidentDateTime || '[Incident Date & Time]'}
• Location / Spot: ${formData.incidentPlace || '[Location]'}

Description of Incident / Lost Property:
${formData.lostOrItemDetails || reason}

Despite extensive efforts to search for the item/address the matter, it could not be recovered. Therefore, lodging this General Diary (GD) is essential for legal security and future administrative/official procedures.

I, therefore, earnestly request that you kindly record this General Diary in your police register, provide me with an official GD number, and take appropriate legal steps.

Yours faithfully,

${applicant}
${formData.applicantPhone ? `Contact: ${formData.applicantPhone}\n` : ''}${formData.applicantAddress ? `Address: ${formData.applicantAddress}` : ''}`;
  }

  if (typeInfo.id === 'job-application-cover') {
    return `Date: ${dateStr}

To
${recipient}
${org}
${orgAddr}

Subject: ${subject}

${englishSalutation}

I am writing to express my enthusiastic interest in the position of "${formData.applicantDesignation || 'the advertised role'}" at ${org}${formData.referenceNo ? ` as published via ${formData.referenceNo}` : ''}.

Academic Background: ${formData.education || '[Educational Qualifications]'}.
Professional Experience: ${formData.experience || '[Work Experience]'}.
Key Skills & Competencies: ${formData.skills || '[Key Technical & Interpersonal Skills]'}.

${reason}

Throughout my career, I have developed strong problem-solving abilities, high professional ethics, and dedication to organizational excellence. I am confident that my skills align well with the vision of your esteemed organization.

Thank you for considering my application. I welcome the opportunity to discuss my qualifications with you in an interview.

${englishSignOff}

${applicant}
${formData.applicantAddress ? `${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `Phone: ${formData.applicantPhone}\n` : ''}${formData.applicantEmail ? `Email: ${formData.applicantEmail}` : ''}

Enclosures:
1. Detailed Curriculum Vitae (CV)
2. Attested copies of academic certificates & mark sheets
3. Passport size photographs`;
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

As per company policy, my last working day will be ${formData.startDate ? formatEnglishDate(formData.startDate) : '[Date]'}. During this transition period, I am fully committed to completing all pending tasks and ensuring a seamless handover to my team members.

I would like to express my sincere appreciation for the opportunities and professional growth I have experienced during my tenure with ${org}.

I wish the organization continued success and prosperity in all its future endeavors.

${englishSignOff}

${applicant}
${designation ? `${designation}\n` : ''}${org ? `${org}\n` : ''}${formData.applicantPhone ? `Phone: ${formData.applicantPhone}` : ''}`;
  }

  // Default Standard English Formal Application
  return `Date: ${dateStr}

To
${recipient}
${org}
${orgAddr}

Subject: ${subject}

${englishSalutation}

I am writing to respectfully bring to your kind attention that I am ${applicant}${designation ? `, currently serving/studying as ${designation}` : ''}${formData.applicantAddress ? `, residing at ${formData.applicantAddress}` : ''}.

${reason}. ${datesSpan ? `Therefore, I request your kind consideration for the duration of ${datesSpan}.` : ''}

In light of the above circumstances, I earnestly request that you kindly consider my application favorably and grant the necessary approval/relief.

Thanking you for your kind consideration and cooperation.

${englishSignOff}

${applicant}
${designation ? `${designation}\n` : ''}${org ? `${org}\n` : ''}${formData.applicantAddress ? `Address: ${formData.applicantAddress}\n` : ''}${formData.applicantPhone ? `Phone: ${formData.applicantPhone}` : ''}`;
}
