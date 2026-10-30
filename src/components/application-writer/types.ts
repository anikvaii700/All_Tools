export type CategoryId =
  | 'police'      // ১. থানা ও পুলিশ সংক্রান্ত আবেদন (১-১৫)
  | 'municipal'   // ২. ইউনিয়ন পরিষদ, পৌরসভা ও সিটি কর্পোরেশন সংক্রান্ত আবেদন (১৬-৩৫)
  | 'education'   // ৩. স্কুল, কলেজ ও শিক্ষা প্রতিষ্ঠান সংক্রান্ত দরখাস্ত (৩৬-৫৫)
  | 'office'      // ৪. চাকরি ও অফিস সংক্রান্ত দরখাস্ত (৫৬-৭৫)
  | 'land'        // ৫. জমি, সম্পত্তি ও ভূমি অফিস সংক্রান্ত আবেদন (৭৬-৮৭)
  | 'bank'        // ৬. ব্যাংক, আর্থিক প্রতিষ্ঠান ও ঋণ সংক্রান্ত আবেদন (৮৮-১০০)
  | 'utility'     // ৭. বিদ্যুৎ, গ্যাস, পানি ও অন্যান্য ইউটিলিটি সংক্রান্ত আবেদন (১০১-১১১)
  | 'personal'    // ৮. ব্যক্তিগত ও পারিবারিক প্রয়োজনে দরখাস্ত (১১২-১২৪)
  | 'business'    // ৯. ব্যবসা-বাণিজ্য ও দোকানপাট সংক্রান্ত আবেদন (১২৫-১৩৫)
  | 'other'       // ১০. অন্যান্য দরকারি আবেদনপত্র (১৩৬-১৫০)
  | 'government'  // Backward compatibility alias for municipal/govt
  | 'complaint'   // Backward compatibility alias for complaints
  | 'custom';

export type Language = 'bn' | 'en';

export type Tone =
  | 'Formal'
  | 'Highly Formal'
  | 'Simple and Professional'
  | 'Respectful'
  | 'Concise';

export type TemplateId =
  | 'traditional-bn'
  | 'modern-bn'
  | 'english-official'
  | 'school-college'
  | 'office-leave'
  | 'complaint-letter'
  | 'job-application'
  | 'minimal-clean';

export interface DocumentFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'date' | 'textarea' | 'number';
  required?: boolean;
}

export interface DocumentTypeInfo {
  id: string;
  serialNo?: number;
  categoryId: CategoryId;
  name: string;
  nameEn: string;
  badge?: string;
  isPopular?: boolean;
  documentFormat?: 'gd' | 'police_complaint' | 'office' | 'education' | 'municipal' | 'standard';
  description: string;
  defaultRecipientDesignationBn: string;
  defaultRecipientDesignationEn: string;
  defaultSubjectBn: string;
  defaultSubjectEn: string;
  defaultReasonBn?: string;
  defaultReasonEn?: string;
  fields: DocumentFieldConfig[];
}

export interface ApplicationFormData {
  applicantName: string;
  applicantFatherOrHusband?: string; // পিতা / স্বামীর নাম
  applicantDesignation: string; // শ্রেণি/রোল অথবা পদবি/ডিপার্টমেন্ট
  applicantAddress: string;
  applicantPhone: string;
  applicantEmail: string;
  date: string;
  recipientDesignation: string;
  recipientName: string;
  organizationName: string;
  organizationAddress: string;
  subject: string;
  startDate: string;
  endDate: string;
  reason: string;
  incidentDateTime?: string; // ঘটনার তারিখ ও সময় (জিডি ও অভিযোগের জন্য)
  incidentPlace?: string; // ঘটনার স্থান
  lostOrItemDetails?: string; // হারানো জিনিস বা দলিলের বিবরণ
  accountOrMeterNo?: string; // ব্যাংক একাউন্ট / মিটার / খতিয়ান / হোল্ডিং নম্বর
  education: string;
  experience: string;
  skills: string;
  referenceNo: string;
  specificDetails: string;
  language: Language;
  tone: Tone;
}

export interface DocumentStyle {
  fontFamily: 'noto' | 'hind' | 'kalpurush' | 'solaiman' | 'tiro' | 'sans' | 'serif';
  fontSize: number; // 13 - 22
  lineSpacing: number; // 1.2 - 2.0
  alignment: 'left' | 'center' | 'right' | 'justify';
  margin: 'compact' | 'normal' | 'wide';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  showPageNumber: boolean;
  // Optional Signature & Recommendation/Approval blocks
  showApplicantSign?: boolean;
  showDeptHeadSign?: boolean;
  showApprovalSign?: boolean;
  showGuardianSign?: boolean;
  showTeacherSign?: boolean;
}

export interface SavedDocument {
  id: string;
  title: string;
  typeId: string;
  categoryId: CategoryId;
  language: Language;
  templateId: TemplateId;
  formData: ApplicationFormData;
  content: string;
  createdAt: string;
  updatedAt: string;
  isAiEnhanced?: boolean;
}
