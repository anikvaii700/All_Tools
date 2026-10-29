export type CategoryId =
  | 'education'
  | 'office'
  | 'government'
  | 'complaint'
  | 'business'
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
  placeholder: string;
  type?: 'text' | 'date' | 'textarea' | 'number';
  required?: boolean;
}

export interface DocumentTypeInfo {
  id: string;
  categoryId: CategoryId;
  name: string;
  nameEn: string;
  badge?: string;
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
