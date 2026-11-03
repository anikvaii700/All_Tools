// NidSimpleFormat.tsx
// Exact implementation of user-provided specification and image_f41edc08.png
// Features:
// 1. Top 6 Action Boxes (Form 2, Form 13, Form 1, Server Copy, Photo/Sign, Landlord Certificate)
// 2. Middle bar with "কি সংশোধনে কি ডকুমেন্টস ও ফিস নিচ থেকে সার্চ করে দেখে নিন" & "জানতে চাই" trigger
// 3. Exact table layout: 9 rows on the left (Subject, Existing Info, Desired Info),
//    with unified "ডকুমেন্টস" and "ফিস" columns on the right updated when user clicks "জানতে চাই"
// 4. Exact document rules & fee calculation according to user prompt and image notes

import React, { useState } from 'react';
import {
  Search,
  Printer,
  X,
  ExternalLink,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck,
  CreditCard,
  Building,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  FileText,
  Fingerprint,
} from 'lucide-react';
import { NidCorrectionForm2, Form2Data, CorrectionRow } from '../../all-form-fillup/NidCorrectionForm2';
import { NidBiometricForm1, Form1Data } from '../../all-form-fillup/NidBiometricForm1';
import { VoterTransferForm, Form13Data } from '../../VoterTransferForm';

interface NidSimpleFormatProps {
  onShowToast: (msg: string, icon?: string) => void;
}

export type CorrectionFieldId =
  | 'self_name_bn'
  | 'self_name_en'
  | 'father_name'
  | 'mother_name'
  | 'spouse_name'
  | 'dob'
  | 'address'
  | 'blood_group'
  | 'others';

export interface FieldRow {
  id: CorrectionFieldId;
  fieldBn: string;
  placeholderExisting: string;
  placeholderDesired: string;
  isFrontCard: boolean; // Front of card (নাম, জন্ম তারিখ, পিতা, মাতা)
}

export const FIELD_DEFINITIONS: FieldRow[] = [
  {
    id: 'self_name_bn',
    fieldBn: 'নিজ নাম (বাংলা)',
    placeholderExisting: 'নাইমুল ইসলাম',
    placeholderDesired: 'নাঈম মিয়া',
    isFrontCard: true,
  },
  {
    id: 'self_name_en',
    fieldBn: 'নিজ নাম (ইংরেজি)',
    placeholderExisting: 'NAIMUL ISLAM',
    placeholderDesired: 'NAEEM MIA',
    isFrontCard: true,
  },
  {
    id: 'father_name',
    fieldBn: 'পিতার নাম',
    placeholderExisting: 'মো: রফিকুল ইসলাম',
    placeholderDesired: 'রফিকুল ইসলাম',
    isFrontCard: true,
  },
  {
    id: 'mother_name',
    fieldBn: 'মাতার নাম',
    placeholderExisting: 'মোসা: রহিমা খাতুন',
    placeholderDesired: 'রহিমা বেগম',
    isFrontCard: true,
  },
  {
    id: 'spouse_name',
    fieldBn: 'স্বামী/স্ত্রীর নাম',
    placeholderExisting: 'পূর্বের নাম',
    placeholderDesired: 'সংশোধিত নাম',
    isFrontCard: false,
  },
  {
    id: 'dob',
    fieldBn: 'জন্ম তারিখ',
    placeholderExisting: '০১/০১/১৯৯৫',
    placeholderDesired: '১৫/০৮/১৯৯৩',
    isFrontCard: true,
  },
  {
    id: 'address',
    fieldBn: 'ঠিকানা',
    placeholderExisting: 'বর্তমান ঠিকানা',
    placeholderDesired: 'কাঙ্ক্ষিত নতুন ঠিকানা',
    isFrontCard: false,
  },
  {
    id: 'blood_group',
    fieldBn: 'রক্তের গ্রুপ',
    placeholderExisting: 'পূর্বের গ্রুপ',
    placeholderDesired: 'A+ / B+ / O+ / AB+',
    isFrontCard: false,
  },
  {
    id: 'others',
    fieldBn: 'অন্যান্য (পেশা/শিক্ষা)',
    placeholderExisting: 'পূর্বের পেশা বা তথ্য',
    placeholderDesired: 'বর্তমান সঠিক তথ্য',
    isFrontCard: false,
  },
];

export const NidSimpleFormat: React.FC<NidSimpleFormatProps> = ({ onShowToast }) => {
  // Input values for each field
  const [formData, setFormData] = useState<
    Record<CorrectionFieldId, { existing: string; desired: string }>
  >({
    self_name_bn: { existing: 'নাইমুল ইসলাম', desired: 'নাঈম মিয়া' },
    self_name_en: { existing: '', desired: '' },
    father_name: { existing: '', desired: '' },
    mother_name: { existing: '', desired: '' },
    spouse_name: { existing: '', desired: '' },
    dob: { existing: '', desired: '' },
    address: { existing: '', desired: '' },
    blood_group: { existing: '', desired: '' },
    others: { existing: '', desired: '' },
  });

  // User condition toggles as specified in prompt
  const [hasEducationCertificate, setHasEducationCertificate] = useState<boolean>(true); // মাধ্যমিক/উচ্চ মাধ্যমিক পাশ আছে কি না
  const [isSecondApplication, setIsSecondApplication] = useState<boolean>(false); // প্রথম বার বনাম দ্বিতীয় বার
  const [addressType, setAddressType] = useState<'current_only' | 'permanent_only' | 'both'>('current_only');
  const [payFullPackage, setPayFullPackage] = useState<boolean>(false); // শুরুতেই ৩৫১ টাকা দিয়ে সকল কিছুর আবেদন
  const [hasSearched, setHasSearched] = useState<boolean>(true); // Controls calculation display on "জানতে চাই"

  // Modal control for the forms
  const [selectedFormModal, setSelectedFormModal] = useState<string | null>(null);
  // Controls whether the complete Form-2 editor (from image_da888b96.png) is active
  const [isForm2EditorActive, setIsForm2EditorActive] = useState<boolean>(false);
  // Controls whether the complete Form-13 editor (from image_629ca8ff.png) is active
  const [isForm13EditorActive, setIsForm13EditorActive] = useState<boolean>(false);
  // Controls whether the complete Form-1 Biometric editor (from image_551c9cea.png) is active
  const [isForm1EditorActive, setIsForm1EditorActive] = useState<boolean>(false);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Form-2 Applicant Profile State for PDF generation
  const [formApplicantName, setFormApplicantName] = useState('মো: নাইমুল ইসলাম');
  const [formNidNumber, setFormNidNumber] = useState('১৯৯৫২৬৯১৬৪৫০৪৫৭১২');
  const [formMobileNumber, setFormMobileNumber] = useState('০১৭১২-৩৪৫৬৭৮');

  // Handle inputs
  const handleInputChange = (
    fieldId: CorrectionFieldId,
    type: 'existing' | 'desired',
    val: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        [type]: val,
      },
    }));
  };

  // Determine active changed fields (where either existing or desired is non-empty)
  const activeFieldIds = (Object.keys(formData) as CorrectionFieldId[]).filter(
    (key) => formData[key].existing.trim() !== '' || formData[key].desired.trim() !== ''
  );

  // If no fields are typed, default to showing guidance for the first row
  const effectiveFieldIds: CorrectionFieldId[] =
    activeFieldIds.length > 0 ? activeFieldIds : ['self_name_bn'];

  // Check categories of active fields
  const hasFrontCardField = effectiveFieldIds.some((id) =>
    ['self_name_bn', 'self_name_en', 'father_name', 'mother_name', 'dob'].includes(id)
  );
  const hasAddressField = effectiveFieldIds.includes('address');
  const hasOtherField = effectiveFieldIds.some((id) =>
    ['blood_group', 'spouse_name', 'others'].includes(id)
  );

  // =========================================================================
  // FEE CALCULATION LOGIC (EXACT USER SPECIFICATION & IMAGE NOTES):
  // 1. Front of card (নাম, জন্ম তারিখ, পিতা, মাতা): ১ম বার ২৩০+৬ = ২৩৬ ৳। ২য় বার ৩৪৫+৬ = ৩৫১ ৳
  // 2. Address: বর্তমান ২৩০+৬ = ২৩৬ ৳, স্থায়ী ১১৫+৬ = ১২১ ৳, উভয় ৩৪৫+৬ = ৩৫১ ৳
  // 3. Other fields (রক্তের গ্রুপ, পেশা, শিক্ষা, ইত্যাদি): ১১৫+৬ = ১২১ ৳
  // 4. If front is combined with other or address: ৩৪৫+৬ = ৩৫১ ৳
  // 5. Full card package: ৩৪৫+৬ = ৩৫১ ৳
  // =========================================================================
  let totalBaseFee = 230;
  let vatFee = 6;
  let feeExplanation = '';

  if (payFullPackage) {
    totalBaseFee = 345;
    feeExplanation = 'আইডি কার্ডের সকল কিছুর কম্বাইন্ড আবেদন প্যাকেজ (৩৪৫ ৳ + ৬ ৳ ভ্যাট)';
  } else if (hasFrontCardField) {
    if (isSecondApplication) {
      totalBaseFee = 345;
      feeExplanation = 'সামনের অংশের দ্বিতীয়/পরবর্তী আবেদন ফি (৩৪৫ ৳ + ৬ ৳ ভ্যাট)';
    } else if (hasOtherField || (hasAddressField && addressType === 'both')) {
      totalBaseFee = 345;
      feeExplanation = 'সামনের অংশের সাথে পেছনের তথ্য/উভয় ঠিকানা যুক্ত করায় কম্বাইন্ড ফি (৩৪৫ ৳ + ৬ ৳ ভ্যাট)';
    } else if (hasAddressField) {
      totalBaseFee = 345;
      feeExplanation = 'সামনের অংশের সাথে ঠিকানা যুক্ত থাকায় কম্বাইন্ড ফি (৩৪৫ ৳ + ৬ ৳ ভ্যাট)';
    } else {
      totalBaseFee = 230;
      feeExplanation = 'আইডি কার্ডের সামনের অংশের ১ম বার আবেদন ফি (২৩০ ৳ + ৬ ৳ ভ্যাট)';
    }
  } else if (hasAddressField) {
    if (hasOtherField || addressType === 'both') {
      totalBaseFee = 345;
      feeExplanation = 'উভয় ঠিকানা বা ঠিকানা+অন্যান্য তথ্যের আবেদন ফি (৩৪৫ ৳ + ৬ ৳ ভ্যাট)';
    } else if (addressType === 'current_only') {
      totalBaseFee = 230;
      feeExplanation = 'শুধু বর্তমান ঠিকানা সংশোধনের আবেদন ফি (২৩০ ৳ + ৬ ৳ ভ্যাট)';
    } else {
      totalBaseFee = 115;
      feeExplanation = 'শুধু স্থায়ী ঠিকানা সংশোধনের আবেদন ফি (১১৫ ৳ + ৬ ৳ ভ্যাট)';
    }
  } else if (hasOtherField) {
    totalBaseFee = 115;
    feeExplanation = 'রক্তের গ্রুপ/পেশা/অন্যান্য তথ্যের আবেদন ফি (১১৫ ৳ + ৬ ৳ ভ্যাট)';
  } else {
    totalBaseFee = 230;
    feeExplanation = 'সাধারণ সংশোধন আবেদন ফি (২৩০ ৳ + ৬ ৳ ভ্যাট)';
  }

  const finalTotalFee = totalBaseFee + vatFee;

  // =========================================================================
  // DOCUMENT GENERATION LOGIC (EXACT USER PROMPT RULES):
  // =========================================================================
  const getRequiredDocuments = (): { title: string; docs: string[]; note?: string }[] => {
    const sections: { title: string; docs: string[]; note?: string }[] = [];

    // 1. নাম সংশোধন (বাংলা / ইংরেজি)
    if (
      effectiveFieldIds.includes('self_name_bn') ||
      effectiveFieldIds.includes('self_name_en')
    ) {
      if (hasEducationCertificate) {
        sections.push({
          title: 'নিজ নাম সংশোধন (শিক্ষাগত যোগ্যতা অনুযায়ী):',
          docs: [
            'এসএসসি/এইচএসসি বা সমমানের শিক্ষাগত মূল সার্টিফিকেট (বাধ্যতামূলক)',
            'অনলাইন সঠিক ডিজিটাল জন্ম নিবন্ধন সনদ',
            'পিতা ও মাতার জাতীয় পরিচয়পত্রের কপি',
            'পাসপোর্ট / ড্রাইভিং লাইসেন্স (যদি থাকে)',
          ],
          note: 'শিক্ষাগত যোগ্যতা উল্লেখ থাকলে সার্টিফিকেট বাধ্যতামূলক। সার্টিফিকেট অনুযায়ী নাম হুবহু মিলানো হবে।',
        });
      } else {
        sections.push({
          title: 'নিজ নাম সংশোধন (শিক্ষাগত সনদ ছাড়া):',
          docs: [
            'অনলাইন সঠিক ডিজিটাল জন্ম নিবন্ধন সনদ (প্রথম শর্ত)',
            'সংশ্লিষ্ট ইউপি চেয়ারম্যান/পৌর মেয়র/কাউন্সিলর নাগরিক প্রত্যয়নপত্র',
            'পরিবারের অন্য সদস্যদের (পিতা/মাতা/ভাই/বোন) জাতীয় পরিচয়পত্র',
            '১ম শ্রেণির জুডিশিয়াল ম্যাজিস্ট্রেট কোর্ট এফিডেভিট',
          ],
          note: 'শিক্ষাগত সনদ না থাকলে সঠিক জন্ম নিবন্ধন, চেয়ারম্যান প্রত্যয়ন ও পরিবারের আইডি কার্ড প্রদান আবশ্যক।',
        });
      }
    }

    // 2. পিতা-মাতার নাম সংশোধন
    if (
      effectiveFieldIds.includes('father_name') ||
      effectiveFieldIds.includes('mother_name')
    ) {
      sections.push({
        title: 'পিতা বা মাতার নাম সংশোধন:',
        docs: [
          'পিতা ও মাতার মূল জাতীয় পরিচয়পত্র (NID)',
          'সকল ভাই-বোনের জাতীয় পরিচয়পত্র (NID)',
          '১ম শ্রেণির জুডিশিয়াল ম্যাজিস্ট্রেট কোর্ট এফিডেভিট',
          'স্থানীয় চেয়ারম্যান/মেয়র কর্তৃক "দুই নামে একই ব্যক্তি" মর্মে প্রত্যয়নপত্র',
          'আবেদনকারীর শিক্ষাগত সনদ / পাসপোর্ট (প্রয়োজনে)',
          'পিতা/মাতা মৃত হলে মৃত্যু সনদ ও ওয়ারিশ কায়েম সনদ',
        ],
        note: 'পিতা-মাতার নাম সংশোধনে ভাই-বোনের আইডি ও দুই নামে একই ব্যক্তি মর্মে প্রত্যয়ন আবশ্যক।',
      });
    }

    // 3. স্বামীর নাম সংশোধন
    if (effectiveFieldIds.includes('spouse_name')) {
      sections.push({
        title: 'স্বামী/স্ত্রীর নাম সংশোধন:',
        docs: [
          'স্বামীর জাতীয় পরিচয়পত্র (থাকলে পাসপোর্ট)',
          'সন্তানদের আইডি কার্ড বা অনলাইন জন্ম নিবন্ধন',
          'মুসলিম বিবাহে রেজিস্ট্রিকৃত নিকাহনামা (কাবিননামা) / অন্যান্য ধর্মে বিবাহ প্রত্যয়ন',
          'তালাক হয়ে থাকলে রেজিস্ট্রিকৃত তালাকনামা',
          'নতুন বিয়ে হলে নতুন কাবিননামা',
          'স্বামী মৃত হলে মৃত্যু সনদপত্র',
        ],
        note: 'সামান্য বানান বা আংশিক পরিবর্তনে স্বামীর আইডি বা পাসপোর্টই যথেষ্ট।',
      });
    }

    // 4. জন্ম তারিখ সংশোধন
    if (effectiveFieldIds.includes('dob')) {
      sections.push({
        title: 'জন্ম তারিখ সংশোধন:',
        docs: [
          'এসএসসি/দাখিল বা সমমানের শিক্ষাগত মূল সার্টিফিকেট (বাধ্যতামূলক)',
          '২০০০ সালের পূর্বের সঠিক অনলাইন ডিজিটাল জন্ম নিবন্ধন',
          'সরকারি চাকরিজীবীদের সার্ভিস বুক বা পাসপোর্ট',
          'সনদহীনদের ক্ষেত্রে সিভিল সার্জন কর্তৃক বয়স নির্ধারণী প্রত্যয়নপত্র',
        ],
        note: 'জন্ম তারিখ সংশোধনে সঠিক জন্ম নিবন্ধন বা শিক্ষাগত সার্টিফিকেট বাধ্যতামূলক।',
      });
    }

    // 5. ঠিকানা সংশোধন
    if (effectiveFieldIds.includes('address')) {
      sections.push({
        title: 'ঠিকানা সংশোধন / স্থানান্তর:',
        docs: [
          'সঠিক অনলাইন ডিজিটাল জন্ম নিবন্ধন সনদ',
          'ইউপি চেয়ারম্যান/পৌর মেয়র/কাউন্সিলর প্রত্যয়নপত্র',
          'পরিবারের কারও জাতীয় পরিচয়পত্র',
          'বাসার বিদ্যুৎ/গ্যাস/পানির বিলের হালনাগাদ কপি বা হোল্ডিং ট্যাক্স রশিদ',
          'ভাড়াটিয়া হলে বাড়িভাড়ার চুক্তিপত্র ও বাড়িওয়ালার প্রত্যয়নপত্র',
        ],
        note: 'ঠিকানা পরিবর্তনের জন্য জন্ম নিবন্ধন, চেয়ারম্যান প্রত্যয়ন ও পরিবারের সদস্যের আইডি প্রয়োজন।',
      });
    }

    // 6. রক্তের গ্রুপ সংশোধন
    if (effectiveFieldIds.includes('blood_group')) {
      sections.push({
        title: 'রক্তের গ্রুপ সংশোধন:',
        docs: [
          'সরকার অনুমোদিত প্যাথলজি ল্যাব থেকে রক্তের গ্রুপের মেডিকেল টেস্ট রিপোর্ট',
          'রেজিস্টার্ড এমবিবিএস ডাক্তারের প্রত্যয়নপত্র',
        ],
        note: 'রক্তের গ্রুপ পরিবর্তনের জন্য ল্যাব টেস্ট রিপোর্ট আবশ্যক।',
      });
    }

    // 7. অন্যান্য (পেশা / শিক্ষা)
    if (effectiveFieldIds.includes('others')) {
      sections.push({
        title: 'পেশা / অন্যান্য তথ্য পরিবর্তন:',
        docs: [
          'ব্যবসা হলে: হালনাগাদ ট্রেড লাইসেন্স ও ট্যাক্স/টিন সনদ',
          'চাকরি হলে: অফিসিয়াল চাকরিজীবী নিয়োগপত্র বা প্রত্যয়নপত্র',
          'শিক্ষাগত যোগ্যতা সংশোধনে: সংশ্লিষ্ট সর্বশেষ শিক্ষাগত যোগ্যতার মূল সনদ',
        ],
        note: 'পেশা পরিবর্তনে বর্তমান বৈধ পেশার প্রমাণপত্র দাখিল করতে হবে।',
      });
    }

    return sections;
  };

  const documentSections = getRequiredDocuments();

  // "জানতে চাই" button handler
  const handleCalculateAndCheck = () => {
    setHasSearched(true);
    onShowToast('আপনার চাহিত তথ্যের ডকুমেন্টস ও ফি হিসাব করা হয়েছে!', '🔍');
  };

  // Reset handler
  const handleReset = () => {
    setFormData({
      self_name_bn: { existing: '', desired: '' },
      self_name_en: { existing: '', desired: '' },
      father_name: { existing: '', desired: '' },
      mother_name: { existing: '', desired: '' },
      spouse_name: { existing: '', desired: '' },
      dob: { existing: '', desired: '' },
      address: { existing: '', desired: '' },
      blood_group: { existing: '', desired: '' },
      others: { existing: '', desired: '' },
    });
    setPayFullPackage(false);
    onShowToast('সকল তথ্য মুছে ফেলা হয়েছে', '🔄');
  };

  // Sample data loader (নাইমুল ইসলাম -> নাঈম মিয়া)
  const handleLoadSample = () => {
    setFormData({
      self_name_bn: { existing: 'নাইমুল ইসলাম', desired: 'নাঈম মিয়া' },
      self_name_en: { existing: 'NAIMUL ISLAM', desired: 'NAEEM MIA' },
      father_name: { existing: '', desired: '' },
      mother_name: { existing: '', desired: '' },
      spouse_name: { existing: '', desired: '' },
      dob: { existing: '', desired: '' },
      address: { existing: '', desired: '' },
      blood_group: { existing: '', desired: '' },
      others: { existing: '', desired: '' },
    });
    setHasSearched(true);
    onShowToast('নমুনা তথ্য লোড করা হয়েছে (নাইমুল ইসলাম → নাঈম মিয়া)', '✨');
  };

  // Filter rows if search query is entered
  const filteredRows = FIELD_DEFINITIONS.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.fieldBn.toLowerCase().includes(q) ||
      formData[r.id].existing.toLowerCase().includes(q) ||
      formData[r.id].desired.toLowerCase().includes(q)
    );
  });

  // Top 6 Action Boxes matching image_f41edc08.png
  const topActionBoxes = [
    {
      id: 'form2',
      title: 'ফরম ২ সংশোধন এর ফরম ফিলাপ',
      icon: '📄',
    },
    {
      id: 'form13',
      title: 'ফরম-১৩ স্থানান্তরের ফরম ফিলাপ',
      icon: '🔄',
    },
    {
      id: 'form1',
      title: 'ফরম ১ বায়োমেট্রিক আপডেট ফরম ফিলাপ',
      icon: '👆',
    },
    {
      id: 'server_copy',
      title: 'সার্ভার কপি সংগ্রহের আবেদন',
      icon: '💻',
    },
    {
      id: 'photo_sign',
      title: 'ছবি ও স্বাক্ষর পরিবর্তনের প্রত্যয়ন',
      icon: '✍️',
    },
    {
      id: 'landlord',
      title: 'ভাড়াটিয়ার জন্য বাড়িওয়ালার প্রত্যয়ন',
      icon: '🏠',
    },
  ];

  // Map current table data into Form2Data structure for complete Form-2 fillup
  const mappedForm2Corrections: CorrectionRow[] = [
    {
      key: 'nameBn',
      label: '(ক) নাম (বাংলা)',
      selected: Boolean(formData.self_name_bn.existing || formData.self_name_bn.desired),
      currentValue: formData.self_name_bn.existing || '',
      desiredValue: formData.self_name_bn.desired || '',
      attachedDoc: hasEducationCertificate
        ? 'এসএসসি মূল সনদ ও অনলাইন জন্ম নিবন্ধন'
        : 'অনলাইন ডিজিটাল জন্ম নিবন্ধন সনদ ও নাগরিক প্রত্যয়ন',
    },
    {
      key: 'nameEn',
      label: '(খ) নাম (ইংরেজি)',
      selected: Boolean(formData.self_name_en.existing || formData.self_name_en.desired),
      currentValue: formData.self_name_en.existing || '',
      desiredValue: formData.self_name_en.desired || '',
      attachedDoc: 'পাসপোর্ট ও শিক্ষাগত সনদপত্র',
    },
    {
      key: 'fatherName',
      label: '(গ) পিতার নাম',
      selected: Boolean(formData.father_name.existing || formData.father_name.desired),
      currentValue: formData.father_name.existing || '',
      desiredValue: formData.father_name.desired || '',
      attachedDoc: 'পিতার জাতীয় পরিচয়পত্র ও ভাই-বোনের আইডি',
    },
    {
      key: 'motherName',
      label: '(ঘ) মাতার নাম',
      selected: Boolean(formData.mother_name.existing || formData.mother_name.desired),
      currentValue: formData.mother_name.existing || '',
      desiredValue: formData.mother_name.desired || '',
      attachedDoc: 'মাতার জাতীয় পরিচয়পত্র ও ডিজিটাল জন্ম সনদ',
    },
    {
      key: 'spouseName',
      label: '(ঙ) স্বামীর নাম [বা স্ত্রীর নাম]',
      selected: Boolean(formData.spouse_name.existing || formData.spouse_name.desired),
      currentValue: formData.spouse_name.existing || '',
      desiredValue: formData.spouse_name.desired || '',
      attachedDoc: 'রেজিস্ট্রিকৃত নিকাহনামা (কাবিননামা) ও স্বামীর আইডি',
    },
    {
      key: 'dob',
      label: '(চ) জন্মতারিখ',
      selected: Boolean(formData.dob.existing || formData.dob.desired),
      currentValue: formData.dob.existing || '',
      desiredValue: formData.dob.desired || '',
      attachedDoc: 'এসএসসি মূল সনদ ও অনলাইন জন্ম নিবন্ধন',
    },
    {
      key: 'address',
      label: '(ছ) ঠিকানা',
      selected: Boolean(formData.address.existing || formData.address.desired),
      currentValue: formData.address.existing || '',
      desiredValue: formData.address.desired || '',
      attachedDoc: 'নাগরিক সনদপত্র, বিদ্যুৎ বিল ও হোল্ডিং ট্যাক্স রশিদ',
    },
    {
      key: 'bloodGroup',
      label: '(জ) রক্তের গ্রুপ',
      selected: Boolean(formData.blood_group.existing || formData.blood_group.desired),
      currentValue: formData.blood_group.existing || '',
      desiredValue: formData.blood_group.desired || '',
      attachedDoc: 'অনুমোদিত ডায়াগনস্টিক ল্যাব টেস্টের রিপোর্ট',
    },
    {
      key: 'others',
      label: '(ঝ) অন্যান্য',
      selected: Boolean(formData.others.existing || formData.others.desired),
      currentValue: formData.others.existing || '',
      desiredValue: formData.others.desired || '',
      attachedDoc: 'পেশাগত প্রমাণপত্র / হালনাগাদ ট্রেড লাইসেন্স',
    },
  ];

  const mappedForm2Data: Partial<Form2Data> = {
    applicantName: formData.self_name_bn.desired || formData.self_name_bn.existing || 'মো: নাইমুল ইসলাম',
    applicantSignName: formData.self_name_bn.desired || formData.self_name_bn.existing || 'মো: নাইমুল ইসলাম',
    applicantNid: formNidNumber,
    applicantMobile: formMobileNumber,
    applicantAddress: formData.address.desired || formData.address.existing || 'ঢাকা, বাংলাদেশ',
    feeAmount: `${finalTotalFee}/- (${totalBaseFee} ৳ + ভ্যাট ${vatFee} ৳)`,
    feeReceiptNo: `bKash/Rocket TrxID - তারিখ: ${new Date().toLocaleDateString('bn-BD')}`,
    corrections: mappedForm2Corrections,
  };

  // Map current table data into Form13Data structure for complete Form-13 fillup
  const mappedForm13Data: Partial<Form13Data> = {
    applicantName: formData.self_name_bn.desired || formData.self_name_bn.existing || 'মোঃ মোফাসসিরুল ইসলাম',
    nidNumber: formNidNumber || '১৯৯৪২৬১২২৩০০০০৫৬৭',
    dob: formData.dob.desired || formData.dob.existing || '১২/০৪/১৯৯৪',
    currentVillageRoad: formData.address.existing || '',
    destVillageRoad: formData.address.desired || '',
    destPhone: formMobileNumber || '০১৭১২-৩৪৫৬৭৮',
    applicantSignatureText: formData.self_name_bn.desired || formData.self_name_bn.existing || 'মোফাসসিরুল ইসলাম',
    receiptApplicantName: formData.self_name_bn.desired || formData.self_name_bn.existing || 'মোঃ মোফাসসিরুল ইসলাম',
  };

  // If user clicked "ফরম ২ সংশোধন এর ফরম ফিলাপ", render the complete 2-column Form-2 from all-form-fillup (image_da888b96.png)
  if (isForm2EditorActive) {
    return (
      <div className="space-y-4">
        {/* Top return switcher */}
        <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-300 shadow-xs">
          <button
            type="button"
            onClick={() => setIsForm2EditorActive(false)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-600" />
            <span>← ফিরে যান (ডকুমেন্টস ও ফি নির্দেশিকা ছক)</span>
          </button>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ফরম ২ সংশোধন এর ফরম ফিলাপ ও লাইভ A4 প্রিভিউ</span>
          </span>
        </div>

        {/* Embedded Complete Form 2 Fillup from all-form-fillup (image_da888b96.png) */}
        <NidCorrectionForm2
          onBackToHub={() => setIsForm2EditorActive(false)}
          backButtonLabel="← ডকুমেন্টস ও ফি ছকে ফিরে যান"
          onShowToast={onShowToast}
          initialData={mappedForm2Data}
        />
      </div>
    );
  }

  // If user clicked "ফরম-১৩ স্থানান্তরের ফরম ফিলাপ", render the complete 2-page Legal Form-13 from all-form-fillup (image_629ca8ff.png)
  if (isForm13EditorActive) {
    return (
      <div className="space-y-4">
        {/* Top return banner matching image_629ca8ff.png */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
              🇧🇩
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black">
                  ভোটার এলাকা স্থানান্তর আবেদন (ফরম-১৩)
                </h3>
                <span className="text-[10px] bg-emerald-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                  সরকারি অফিশিয়াল ফরম
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                MoSaFa All Form Fillup-এর অন্তর্ভুক্ত নির্বাচন কমিশন নির্ধারিত সম্পূর্ণ ২-পৃষ্ঠার লিগ্যাল ফরম
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsForm13EditorActive(false)}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← ফিরে যান (ডকুমেন্টস ও ফি নির্দেশিকা ছক)</span>
          </button>
        </div>

        {/* Embedded Complete Form-13 Component from all-form-fillup */}
        <VoterTransferForm
          onBackToHub={() => setIsForm13EditorActive(false)}
          backButtonLabel="← ছকে ফিরে যান"
          onShowToast={onShowToast}
          initialData={mappedForm13Data}
        />
      </div>
    );
  }

  // Map current table data into Form1Data structure for complete Form-1 Biometric fillup
  const mappedForm1Data: Partial<Form1Data> = {
    applicantName: formData.self_name_bn.desired || formData.self_name_bn.existing || 'মো: মোফাসসিরুল ইসলাম',
    applicantNid: formNidNumber || '১৯৯৪২৬১২২৩০০০০৫৬৭',
    applicantSignName: formData.self_name_bn.desired || formData.self_name_bn.existing || 'মোফাসসিরুল ইসলাম',
    applicantAddress: formData.address.desired || formData.address.existing || 'ঢাকা, বাংলাদেশ',
    applicantMobile: formMobileNumber || '০১৭১২-৩৪৫৬৭৮',
    feeAmount: `${finalTotalFee}/- (${totalBaseFee} ৳ + ভ্যাট ${vatFee} ৳)`,
    feeReceiptNo: `TR-BIO-TRX - ${new Date().toLocaleDateString('bn-BD')}`,
    receiptSerialNo: 'EC-BIO-২০২৬/১০৪',
  };

  // If user clicked "ফরম ১ বায়োমেট্রিক আপডেট ফরম ফিলাপ", render the complete Form-1 from image_551c9cea.png
  if (isForm1EditorActive) {
    return (
      <div className="space-y-4">
        {/* Top return banner matching image_551c9cea.png */}
        <div className="bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
              🇧🇩
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black">
                  বায়োমেট্রিক আপডেট আবেদন (ফরম-১)
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                  সরকারি অফিশিয়াল ফরম
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                MoSaFa All Form Fillup-এর অন্তর্ভুক্ত নির্বাচন কমিশন নির্ধারিত সম্পূর্ণ লিগ্যাল ফরম-১ (আঙ্গুলের ছাপ ও আইরিশ আপডেট)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsForm1EditorActive(false)}
            className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← ফিরে যান (ডকুমেন্টস ও ফি নির্দেশিকা ছক)</span>
          </button>
        </div>

        {/* Embedded Complete Form-1 Biometric Component */}
        <NidBiometricForm1
          onBackToHub={() => setIsForm1EditorActive(false)}
          backButtonLabel="← ছকে ফিরে যান"
          onShowToast={onShowToast}
          initialData={mappedForm1Data}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-sans text-slate-800">
      {/* ========================================================== */}
      {/* 1. TOP ROW: 6 FORM ACTION BOXES (EXACT USER WIREFRAME)    */}
      {/* ========================================================== */}
      <section className="bg-white rounded-2xl border-2 border-slate-300 shadow-xs overflow-hidden p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {topActionBoxes.map((box) => (
            <button
              key={box.id}
              type="button"
              onClick={() => {
                if (box.id === 'form2') {
                  setIsForm2EditorActive(true);
                  onShowToast('ফরম ২ সংশোধন এর ফরম ফিলাপ ও লাইভ A4 প্রিভিউ খোলা হয়েছে!', '📄');
                } else if (box.id === 'form13') {
                  setIsForm13EditorActive(true);
                  onShowToast('ফরম-১৩ (ভোটার স্থানান্তর ফরম ফিলাপ) ও লাইভ ২-পৃষ্ঠার লিগ্যাল প্রিভিউ খোলা হয়েছে!', '🔄');
                } else if (box.id === 'form1') {
                  setIsForm1EditorActive(true);
                  onShowToast('ফরম ১ (বায়োমেট্রিক আপডেট ফরম ফিলাপ) ও লাইভ A4 প্রিভিউ খোলা হয়েছে!', '👆');
                } else {
                  setSelectedFormModal(box.id);
                }
              }}
              className={`p-3 sm:p-4 rounded-xl border-2 text-center flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs group ${
                box.id === 'form2'
                  ? 'border-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/60 ring-2 ring-emerald-200 text-emerald-950'
                  : box.id === 'form13'
                  ? 'border-teal-600 bg-teal-50/50 hover:bg-teal-100/60 ring-2 ring-teal-200 text-teal-950'
                  : box.id === 'form1'
                  ? 'border-amber-600 bg-amber-50/50 hover:bg-amber-100/60 ring-2 ring-amber-200 text-amber-950'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-900 hover:border-slate-400'
              }`}
            >
              <span className="text-xl sm:text-2xl mb-1 group-hover:scale-110 transition-transform">
                {box.icon}
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold leading-snug">
                {box.title}
              </h4>
              {box.id === 'form2' && (
                <span className="text-[10px] font-bold text-emerald-700 mt-1 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                  A4 ফরম ফিলাপ
                </span>
              )}
              {box.id === 'form13' && (
                <span className="text-[10px] font-bold text-teal-700 mt-1 bg-white px-2 py-0.5 rounded-full border border-teal-300">
                  ২-পৃষ্ঠা লিগ্যাল ফরম
                </span>
              )}
              {box.id === 'form1' && (
                <span className="text-[10px] font-bold text-amber-800 mt-1 bg-white px-2 py-0.5 rounded-full border border-amber-300">
                  A4 বায়োমেট্রিক ফরম
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. MIDDLE BANNER: SEARCH & "জানতে চাই" CONTROLS           */}
      {/* ========================================================== */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-base sm:text-lg font-bold text-yellow-300">
              কি সংশোধনে কি ডকুমেন্টস ও ফিস নিচ থেকে সার্চ করে দেখে নিন
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              বাম পাশের ঘরে আপনার বিদ্যমান ও চাহিত তথ্য টাইপ করে <b>"জানতে চাই"</b> বোতামে ক্লিক করুন।
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বিষয় খুঁজুন..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              নমুনা তথ্য
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="রিসেট"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* THE PROMINENT "জানতে চাই" BUTTON */}
            <button
              type="button"
              onClick={handleCalculateAndCheck}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>জানতে চাই</span>
            </button>
          </div>
        </div>

        {/* Condition Checkboxes based on user prompt */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-slate-200">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasEducationCertificate}
              onChange={(e) => setHasEducationCertificate(e.target.checked)}
              className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
            />
            <span>শিক্ষাগত যোগ্যতা (এসএসসি/এইচএসসি বা সার্টিফিকেট) আছে</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSecondApplication}
              onChange={(e) => setIsSecondApplication(e.target.checked)}
              className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
            />
            <span>পূর্বে একবার সংশোধন করা হয়েছে (২য় বার আবেদন)</span>
          </label>

          {effectiveFieldIds.includes('address') && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-300 font-semibold">ঠিকানার ধরন:</span>
              <select
                value={addressType}
                onChange={(e) => setAddressType(e.target.value as any)}
                className="bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none"
              >
                <option value="current_only">শুধু বর্তমান ঠিকানা (২৩৬ ৳)</option>
                <option value="permanent_only">শুধু স্থায়ী ঠিকানা (১২১ ৳)</option>
                <option value="both">স্থায়ী ও বর্তমান উভয় ঠিকানা (৩৫১ ৳)</option>
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer select-none ml-auto text-amber-300">
            <input
              type="checkbox"
              checked={payFullPackage}
              onChange={(e) => setPayFullPackage(e.target.checked)}
              className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
            />
            <span className="font-bold">শুরুতেই ৩৫১ ৳ প্যাকেজ (সকল কিছুর আবেদন)</span>
          </label>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3. THE EXACT TABLE FORMAT (image_f41edc08.png)             */}
      {/* ========================================================== */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
        {/* Desktop and Tablet: Exact Table with Rowspan for Documents and Fees */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-slate-300 text-left text-xs sm:text-sm">
            {/* Header matching image_f41edc08.png */}
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b-2 border-slate-300 text-center font-extrabold text-sm sm:text-base">
                <th className="border-r-2 border-slate-300 px-4 py-3.5 w-32 sm:w-40">
                  বিষয়
                </th>
                <th className="border-r-2 border-slate-300 px-4 py-3.5 w-48 sm:w-60">
                  বিদ্যমান তথ্য
                </th>
                <th className="border-r-2 border-slate-300 px-4 py-3.5 w-48 sm:w-60">
                  চাহিত তথ্য
                </th>
                <th className="border-r-2 border-slate-300 px-5 py-3.5 min-w-[320px] max-w-[420px] bg-slate-100">
                  ডকুমেন্টস
                </th>
                <th className="px-4 py-3.5 w-36 sm:w-44 bg-slate-100">
                  ফিস
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredRows.map((row, index) => {
                const isFirstRow = index === 0;
                const totalRowCount = filteredRows.length;
                const hasValue =
                  formData[row.id].existing.trim() !== '' ||
                  formData[row.id].desired.trim() !== '';

                return (
                  <tr
                    key={row.id}
                    className={`border-b-2 border-slate-300 ${
                      hasValue ? 'bg-amber-50/30' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* 1. বিষয় */}
                    <td className="border-r-2 border-slate-300 px-3.5 py-3 font-bold text-slate-900 bg-slate-50/50 align-middle">
                      <span>{row.fieldBn}</span>
                    </td>

                    {/* 2. বিদ্যমান তথ্য */}
                    <td className="border-r-2 border-slate-300 px-3 py-2 align-middle">
                      <input
                        type="text"
                        value={formData[row.id].existing}
                        onChange={(e) =>
                          handleInputChange(row.id, 'existing', e.target.value)
                        }
                        placeholder={row.placeholderExisting}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400"
                      />
                    </td>

                    {/* 3. চাহিত তথ্য */}
                    <td className="border-r-2 border-slate-300 px-3 py-2 align-middle">
                      <input
                        type="text"
                        value={formData[row.id].desired}
                        onChange={(e) =>
                          handleInputChange(row.id, 'desired', e.target.value)
                        }
                        placeholder={row.placeholderDesired}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400"
                      />
                    </td>

                    {/* 4. ডকুমেন্টস (MERGED COLUMN SPANNING ALL ROWS - EXACT USER DRAWING) */}
                    {isFirstRow && (
                      <td
                        rowSpan={totalRowCount}
                        className="border-r-2 border-slate-300 p-4 sm:p-5 align-top bg-white"
                      >
                        <div className="h-full flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                              <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-emerald-600" />
                                <span>প্রয়োজনীয় ডকুমেন্টস এর তালিকা:</span>
                              </span>
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {documentSections.length}টি ক্ষেত্রে প্রযোজ্য
                              </span>
                            </div>

                            {/* Dynamically generated documents tailored to prompt rules */}
                            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                              {documentSections.map((sec, secIdx) => (
                                <div
                                  key={secIdx}
                                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-800"
                                >
                                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    <span>{sec.title}</span>
                                  </div>
                                  <ul className="space-y-1 pl-3.5">
                                    {sec.docs.map((doc, docIdx) => (
                                      <li
                                        key={docIdx}
                                        className="list-disc leading-relaxed text-slate-700"
                                      >
                                        {doc}
                                      </li>
                                    ))}
                                  </ul>
                                  {sec.note && (
                                    <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-md border border-amber-200/60 mt-1">
                                      💡 {sec.note}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200 text-center">
                            <button
                              type="button"
                              onClick={handleCalculateAndCheck}
                              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Search className="w-3.5 h-3.5 text-yellow-300" />
                              <span>নতুন করে ডকুমেন্টস ও ফি জানুন</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* 5. ফিস (MERGED COLUMN SPANNING ALL ROWS - EXACT USER DRAWING) */}
                    {isFirstRow && (
                      <td
                        rowSpan={totalRowCount}
                        className="p-4 sm:p-5 align-top bg-slate-50/70 text-center"
                      >
                        <div className="h-full flex flex-col justify-between items-center space-y-4">
                          <div className="w-full space-y-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                              মোট প্রদেয় ফি
                            </span>

                            <div className="p-4 rounded-2xl bg-white border-2 border-slate-300 shadow-xs flex flex-col items-center">
                              <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                                {finalTotalFee} ৳
                              </span>
                              <span className="text-[11px] text-slate-500 mt-1">
                                (মূল ফি {totalBaseFee} ৳ + ভ্যাট {vatFee} ৳)
                              </span>
                            </div>

                            <div className="text-left p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1">
                              <span className="font-bold text-slate-800 block">
                                ফি হিসাব বিবরণী:
                              </span>
                              <p className="leading-snug">{feeExplanation}</p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] text-left">
                              <span className="font-bold block">পেমেন্ট মাধ্যম:</span>
                              bKash, Rocket বা Nagad বিল পে (NID Service)।
                            </div>
                          </div>

                          <div className="w-full pt-3 border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                setIsForm2EditorActive(true);
                                onShowToast('ফরম ২ সংশোধন এর ফরম ফিলাপ ও লাইভ A4 প্রিভিউ খোলা হয়েছে!', '📄');
                              }}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>ফরম-২ পূরণ ও প্রিন্ট</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View Document and Fee Summary Card */}
        <div className="block lg:hidden p-4 bg-slate-50 border-t-2 border-slate-300 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-300">
            <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>প্রয়োজনীয় ডকুমেন্টস তালিকা:</span>
            </h4>
            <div className="space-y-3">
              {documentSections.map((sec, idx) => (
                <div key={idx} className="text-xs space-y-1">
                  <span className="font-bold text-slate-800">{sec.title}</span>
                  <ul className="list-disc pl-4 text-slate-600">
                    {sec.docs.map((d, dIdx) => (
                      <li key={dIdx}>{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-300 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">মোট সরকারি ফি:</span>
              <span className="text-xl font-black text-rose-600">{finalTotalFee} ৳</span>
              <span className="text-[11px] text-slate-400 block">{feeExplanation}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsForm2EditorActive(true);
                onShowToast('ফরম ২ সংশোধন এর ফরম ফিলাপ ও লাইভ A4 প্রিভিউ খোলা হয়েছে!', '📄');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
            >
              ফরম-২ পূরণ ও প্রিন্ট
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 4. EXACT NOTE FROM USER SKETCH (image_f41edc08.png বি: দ্র:) */}
      {/* ========================================================== */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 sm:p-6 shadow-xs space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base border-b border-slate-200 pb-2 flex items-center gap-2">
          <span>বি: দ্র: সরকারি ফি সংক্রান্ত জরুরি নিয়মাবলী</span>
        </h4>

        <div className="space-y-2 text-slate-700">
          <p>
            • <b>আইডি কার্ডের উপরের অংশের জন্য:</b> যেমন নিজ নাম (বাংলা, ইংরেজী), জন্ম তারিখ, পিতার নাম, মাতার নামের আবেদন ফিস <b>প্রথম বার ২৩০ টাকা + ৬ টাকা ভ্যাট টোটাল ২৩৬ টাকা</b>।
          </p>
          <p>
            • <b>পরের বার প্রতি আবেদনে:</b> আরো ১১৫ টাকা যুক্ত হবে। যদি দ্বিতীয় আবেদন হয় তবে <b>৩৪৫ + ৬ = ৩৫১ টাকা</b>।
          </p>
          <p>
            • <b>ঠিকানা সংশোধনের জন্য:</b> বর্তমান ঠিকানার জন্য ২৩০ টাকা, স্থায়ী ঠিকানার জন্য ১১৫ টাকা। আর যদি স্থায়ী ও বর্তমান দুই জায়গায় সমস্যা থাকে তাহলে <b>৩৪৫ + ৬ = ৩৫১ টাকা</b>।
          </p>
          <p>
            • <b>বাকি সকল কিছুর জন্য:</b> রক্তের গ্রুপ, মোবাইল নাম্বার, পাসপোর্ট নাম্বার, পেশা, শিক্ষাগত যোগ্যতা—এই সবের ক্ষেত্রে <b>১১৫ + ৬ = ১২১ টাকা</b>। যদি সামনের অংশের সাথে এইগুলোর যেকোন একটা অপশন যুক্ত হয় তবে <b>৩৪৫ + ৬ = ৩৫১ টাকা টোটাল খরচ</b>।
          </p>
          <p className="font-bold text-indigo-900 bg-indigo-50 p-2.5 rounded-xl border border-indigo-200">
            💡 আর শুরুতেই যদি ৩৪৫ + ৬ = ৩৫১ টাকা পেমেন্ট করা হয় তাহলে আইডি কার্ডের সকল কিছুর জন্য একসাথে আবেদন করা যাবে।
          </p>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 5. MODALS FOR THE 6 FORMS (PRINTABLE OFFICIAL TEMPLATES)   */}
      {/* ========================================================== */}

      {/* MODAL 1: ফরম ২ সংশোধন এর ফরম ফিলাপ (Form-2) */}
      {selectedFormModal === 'form2' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  ফরম-২: জাতীয় পরিচয়পত্র বা তথ্য-উপাত্ত সংশোধনের আবেদন
                </h3>
                <p className="text-xs text-slate-500">
                  [প্রবিধান ৪ দ্রষ্টব্য] • বাংলাদেশ নির্বাচন কমিশন সচিবালয়
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editable Applicant Header Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  আবেদনকারীর নাম:
                </label>
                <input
                  type="text"
                  value={formApplicantName}
                  onChange={(e) => setFormApplicantName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  জাতীয় পরিচয়পত্র (NID) নম্বর:
                </label>
                <input
                  type="text"
                  value={formNidNumber}
                  onChange={(e) => setFormNidNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  মোবাইল নম্বর:
                </label>
                <input
                  type="text"
                  value={formMobileNumber}
                  onChange={(e) => setFormMobileNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* The Authentic Form-2 Document Preview */}
            <div className="border-2 border-slate-400 p-6 sm:p-8 bg-white rounded-xl space-y-5 text-slate-900 text-xs sm:text-sm font-serif">
              <div className="text-center space-y-1">
                <span className="font-bold block text-sm sm:text-base">ফরম-২</span>
                <span className="text-xs">[প্রবিধান ৪ দ্রষ্টব্য]</span>
                <h4 className="text-base sm:text-lg font-extrabold underline mt-1">
                  জাতীয় পরিচয়পত্র বা তথ্য-উপাত্ত সংশোধনের আবেদন
                </h4>
              </div>

              <div className="flex justify-between text-xs pt-2">
                <span>১। জাতীয় পরিচয়পত্রধারীর নাম: <b>{formApplicantName}</b></span>
                <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
              </div>
              <div className="text-xs">
                <span>জাতীয় পরিচিতি নম্বর (NID): <b>{formNidNumber}</b></span>
              </div>

              <div className="pt-2">
                <span className="font-bold block mb-2 text-xs">
                  ৩। জাতীয় পরিচয়পত্র বা সংরক্ষিত তথ্য-উপাত্তে যে তথ্য সংশোধন করিতে হইবে:
                </span>
                <table className="w-full border-collapse border border-slate-800 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-slate-800 p-2 w-32">বিষয়</th>
                      <th className="border border-slate-800 p-2">বর্তমানে জাতীয় পরিচয়পত্রে বিদ্যমান তথ্য</th>
                      <th className="border border-slate-800 p-2">চাহিত সংশোধিত তথ্য</th>
                      <th className="border border-slate-800 p-2">সংযুক্ত দলিলাদি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIELD_DEFINITIONS.filter(
                      (r) =>
                        formData[r.id].existing.trim() !== '' ||
                        formData[r.id].desired.trim() !== ''
                    ).map((r, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-800 p-2 font-bold">{r.fieldBn}</td>
                        <td className="border border-slate-800 p-2">{formData[r.id].existing || '—'}</td>
                        <td className="border border-slate-800 p-2 font-semibold text-rose-900">
                          {formData[r.id].desired || '—'}
                        </td>
                        <td className="border border-slate-800 p-2 text-[11px]">
                          {hasEducationCertificate ? 'শিক্ষাগত মূল সনদ' : 'অনলাইন ডিজিটাল জন্ম নিবন্ধন সনদ ও প্রত্যয়ন'}
                        </td>
                      </tr>
                    ))}
                    {FIELD_DEFINITIONS.filter(
                      (r) =>
                        formData[r.id].existing.trim() !== '' ||
                        formData[r.id].desired.trim() !== ''
                    ).length === 0 && (
                      <tr>
                        <td colSpan={4} className="border border-slate-800 p-4 text-center text-slate-400 italic">
                          (টেবিলের ঘরে তথ্য পূরণ করলে এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 pt-3 text-xs">
                <p>৪। জমাকৃত ফি এর পরিমাণ: <b>{finalTotalFee} টাকা</b> (মূল ফি {totalBaseFee} ৳ + ভ্যাট {vatFee} ৳)</p>
                <p>৫। ফি জমা দানের বিবরণী: {feeExplanation}</p>
              </div>

              <div className="pt-10 flex justify-between text-xs">
                <div className="text-center">
                  <div className="w-36 border-t border-slate-400 pt-1">
                    আবেদনকারীর স্বাক্ষর ও তারিখ
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-36 border-t border-slate-400 pt-1">
                    দায়িত্বপ্রাপ্ত কর্মকর্তার স্বাক্ষর
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট / PDF সংরক্ষণ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ফরম-১৩ স্থানান্তরের ফরম ফিলাপ */}
      {selectedFormModal === 'form13' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedFormModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <span className="text-2xl mb-1 block">🔄</span>
              <h3 className="text-lg font-bold text-slate-900">
                ফরম-১৩: ভোটার এলাকা স্থানান্তর আবেদন ফরম
              </h3>
              <p className="text-xs text-slate-500">
                এক নির্বাচনী এলাকা হতে অন্য এলাকায় ভোটার তালিকা স্থানান্তরের আবেদন
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span>প্রয়োজনীয় কাগজপত্র ও শর্তাবলী:</span>
              </div>
              <ul className="space-y-1.5 list-disc pl-5">
                <li>নতুন বাসস্থানের পৌরসভা/ইউপি চেয়ারম্যান প্রদত্ত নাগরিক সনদপত্র</li>
                <li>নতুন ঠিকানার বিদ্যুৎ/গ্যাস বিল বা পানির বিলের হালনাগাদ কপি</li>
                <li>ভাড়াটিয়া হলে বাড়িভাড়ার চুক্তিপত্র ও বাড়িওয়ালার প্রত্যয়ন</li>
                <li>ফরম-১৩ পূরণ করে সংশ্লিষ্ট উপজেলা/থানা নির্বাচন অফিসে জমা</li>
                <li>ভোটার এলাকা স্থানান্তরের জন্য কোনো সরকারি ফি লাগে না (সম্পূর্ণ ফ্রি)</li>
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFormModal(null);
                  setIsForm13EditorActive(true);
                  onShowToast('ফরম-১৩ (ভোটার স্থানান্তর ফরম ফিলাপ) ও লাইভ ২-পৃষ্ঠার লিগ্যাল প্রিভিউ খোলা হয়েছে!', '🔄');
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>হুবহু ফরম-১৩ ফিলাপ ও লিগ্যাল প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open('https://services.nidw.gov.bd', '_blank');
                  onShowToast('নির্বাচন কমিশনের অনলাইন পোর্টাল খোলা হয়েছে', '🌐');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>অনলাইন স্থানান্তরে যান</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ফরম ১ বায়োমেট্রিক আপডেট ফরম ফিলাপ */}
      {selectedFormModal === 'form1' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedFormModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <span className="text-2xl mb-1 block">👆</span>
              <h3 className="text-lg font-bold text-slate-900">
                ফরম-১: বায়োমেট্রিক ও তথ্য আপডেট আবেদন
              </h3>
              <p className="text-xs text-slate-500">
                আঙ্গুলের ১০ আঙুলের ছাপ ও আইরিশ রি-ক্যাপচার আবেদন
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <p>
                যাদের ফিঙ্গারপ্রিন্ট ম্যাচ করছে না বা বায়োমেট্রিক ত্রুটি রয়েছে, তাদের সশরীরে উপজেলা নির্বাচন অফিসে উপস্থিত হয়ে নতুন করে ১০ আঙুলের ছাপ দিতে হয়।
              </p>
              <div className="font-bold text-slate-900">সাথে আনতে হবে:</div>
              <ul className="space-y-1 list-disc pl-5">
                <li>মূল জাতীয় পরিচয়পত্র বা এনআইডি নম্বর সম্বলিত স্লিপ</li>
                <li>অনলাইন ডিজিটাল জন্ম নিবন্ধন সনদ</li>
                <li>সংশ্লিষ্ট নির্বাচন অফিসারের অনুমোদন স্লিপ</li>
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFormModal(null);
                  setIsForm1EditorActive(true);
                  onShowToast('ফরম ১ (বায়োমেট্রিক আপডেট ফরম ফিলাপ) ও লাইভ A4 প্রিভিউ খোলা হয়েছে!', '👆');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>হুবহু ফরম-১ ফিলাপ ও অফিশিয়াল প্রিন্ট</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: সার্ভার কপি সংগ্রহের আবেদন */}
      {selectedFormModal === 'server_copy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedFormModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <span className="text-2xl mb-1 block">💻</span>
              <h3 className="text-lg font-bold text-slate-900">
                এনআইডি সার্ভার কপি সংগ্রহের আবেদন
              </h3>
              <p className="text-xs text-slate-500">
                অফিসিয়াল NID Server Copy প্রাপ্তির নিয়মাবলী
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <p>
                অনলাইনে election commission portal (services.nidw.gov.bd) এ লগইন করে সরাসরি আপনার প্রোফাইলের বিস্তারিত রঙিন সার্ভার কপি ডাউনলোড ও প্রিন্ট করতে পারবেন।
              </p>
              <div className="font-bold text-slate-900">জরুরি নির্দেশনা:</div>
              <ul className="space-y-1 list-disc pl-5">
                <li>NID নম্বর ও জন্ম তারিখ দিয়ে অ্যাকাউন্ট রেজিস্টার করুন</li>
                <li>NID Wallet অ্যাপ দিয়ে ফেস ভেরিফিকেশন সম্পন্ন করুন</li>
                <li>ডাউনলোড বোতামে ক্লিক করে সার্ভার কপি সংরক্ষণ করুন</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ছবি ও স্বাক্ষর পরিবর্তনের প্রত্যয়ন */}
      {selectedFormModal === 'photo_sign' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedFormModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <span className="text-2xl mb-1 block">✍️</span>
              <h3 className="text-lg font-bold text-slate-900">
                ছবি ও স্বাক্ষর পরিবর্তনের প্রত্যয়ন
              </h3>
              <p className="text-xs text-slate-500">
                এনআইডির অস্পষ্ট ছবি বা পরিবর্তিত স্বাক্ষরের প্রত্যয়নপত্র
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <p>
                জাতীয় পরিচয়পত্রে ছবি ও স্বাক্ষর পরিবর্তনের জন্য আবেদনকারীকে সশরীরে সংশ্লিষ্ট উপজেলা নির্বাচন অফিসারের কার্যালয়ে উপস্থিত হতে হবে।
              </p>
              <div className="font-bold text-slate-900">প্রয়োজনীয় দলিল:</div>
              <ul className="space-y-1 list-disc pl-5">
                <li>১ম শ্রেণির জুডিশিয়াল ম্যাজিস্ট্রেট কোর্ট এফিডেভিট (স্বাক্ষর পরিবর্তনের জন্য)</li>
                <li>ব্যাংক একাউন্ট বা পাসপোর্টের সাথে মিল থাকা স্বাক্ষর নমুনা</li>
                <li>উপজেলা নির্বাচন অফিসারের সামনে লাইভ ছবি ও ডিজিটাল প্যাডে স্বাক্ষর প্রদান</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ভাড়াটিয়ার জন্য বাড়িওয়ালার প্রত্যয়ন */}
      {selectedFormModal === 'landlord' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setSelectedFormModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <span className="text-2xl mb-1 block">🏠</span>
              <h3 className="text-lg font-bold text-slate-900">
                ভাড়াটিয়ার জন্য বাড়িওয়ালার প্রত্যয়নপত্র
              </h3>
              <p className="text-xs text-slate-500">
                এনআইডি স্থানান্তর ও নতুন ভোটার নিবন্ধনে বাড়িওয়ালার সম্মতিপত্র
              </p>
            </div>
            <div className="border border-slate-300 p-5 rounded-2xl bg-white space-y-3 text-xs text-slate-800 leading-relaxed font-serif">
              <div className="text-center font-bold text-sm underline pb-2">
                প্রত্যয়নপত্র
              </div>
              <p>
                এই মর্মে প্রত্যয়ন করা যাইতেছে যে, জনাব/বেগম ....................................................., পিতা: ....................................................., মাতা: ..................................................... আমার মালিকানাধীন বাসা নং: ....................., রোড নং: ....................., এলাকা: ..................................................... ঠিকানায় বিগত ..................... তারিখ হইতে নিয়মিত ভাড়াটিয়া হিসাবে সপরিবারে বসবাস করিতেছেন।
              </p>
              <p>
                উক্ত ঠিকানায় তাঁহার জাতীয় পরিচয়পত্র বা ভোটার তালিকাভুক্তির বিষয়ে আমার কোনো প্রকার আপত্তি নাই।
              </p>
              <div className="pt-8 flex justify-between">
                <div>তারিখ: .....................</div>
                <div className="text-center">
                  .....................................................<br />
                  (বাড়িওয়ালার স্বাক্ষর, নাম ও মোবাইল নং)
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
