export type CVCategory =
  | 'modern-professional'
  | 'ats-friendly'
  | 'europass-style'
  | 'fresher-student'
  | 'it-tech'
  | 'office-admin'
  | 'skilled-worker'
  | 'creative-portfolio'
  | 'academic-research'
  | 'executive-specialized';

export type LayoutStyle =
  | 'one-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'header-accent'
  | 'compact-ats'
  | 'europass'
  | 'modern-grid'
  | 'creative-banner';

export interface CVTemplate {
  id: string; // 'tmpl-01' ... 'tmpl-100'
  number: number; // 1 ... 100
  nameEn: string;
  nameBn: string;
  category: CVCategory;
  categoryNameEn: string;
  categoryNameBn: string;
  isPremium: boolean;
  price: number; // 0 for 1-20, 10 for 21-100
  layoutStyle: LayoutStyle;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  bgColor: string;
  sidebarBg?: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  headerStyle: 'banner' | 'centered' | 'split' | 'left' | 'boxed' | 'minimal';
  atsScore: number; // 60 - 99
  descriptionBn: string;
  tags: string[];
  isEuropass?: boolean;
}

export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  photoUrl: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  address: string;
  linkedin: string;
  portfolio: string;
  github: string;
  nationality?: string;
  workAuth?: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  details?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'tool' | 'industry';
  level?: string; // Beginner, Intermediate, Expert
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: string; // Native, Fluent, Professional, Intermediate, Elementary, A1-C2
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface CVData {
  personal: PersonalDetails;
  summary: string;
  experience: WorkExperience[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  references: ReferenceItem[];
  customSections?: CustomSection[];
}

export interface PaymentTransaction {
  orderId: string;
  templateId: string;
  templateNumber: number;
  templateName: string;
  amount: number;
  provider: 'bkash' | 'nagad';
  trxId: string;
  customerPhone: string;
  status: 'verified' | 'pending' | 'failed';
  timestamp: string;
}

export interface CVQualityIssue {
  type: 'error' | 'warning' | 'tip';
  field: string;
  messageBn: string;
  messageEn: string;
}
