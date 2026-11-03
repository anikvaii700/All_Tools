export type FormCategory =
  | 'all'
  | 'election'
  | 'housing'
  | 'personal'
  | 'business'
  | 'education'
  | 'custom';

export type FormFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'tel'
  | 'money'
  | 'image';

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  required?: boolean;
  options?: string[]; // for select
  helperText?: string;
  gridSpan?: 1 | 2; // 1 = half width, 2 = full width
  wordsTargetField?: string; // target field name to auto-populate Bengali words
  group?: string; // logical section name e.g. 'মালিকের বিবরণ'
}

export type DocumentLayoutType =
  | 'house-rent-receipt'
  | 'general-receipt'
  | 'agreement'
  | 'application'
  | 'biodata'
  | 'certificate'
  | 'memo'
  | 'voter-form-13'
  | 'voter-form-2'
  | 'voter-form-1'
  | 'landlord-voter-certificate'
  | 'photo-sign-certificate'
  | 'nid-server-copy-application'
  | 'custom';

export interface FormTemplate {
  id: string;
  name: string;
  tagline?: string;
  category: FormCategory;
  categoryName: string;
  badge: string;
  badgeColor?: string;
  shortDescription: string;
  icon: string;
  layoutType: DocumentLayoutType;
  orientation: 'portrait' | 'landscape';
  fields: FormField[];
  disclaimer?: string;
  sampleData: Record<string, any>;
  isCustom?: boolean;
  createdAt?: string;
}

export interface SavedDraft {
  id: string;
  templateId: string;
  templateName: string;
  category: FormCategory;
  categoryName: string;
  data: Record<string, any>;
  title: string;
  updatedAt: string;
}
