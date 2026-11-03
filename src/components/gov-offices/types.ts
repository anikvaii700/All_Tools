// Types and interfaces for the MoSaFa Government Offices Portal (সকল সরকারি অফিস)

export type OfficeId =
  | 'election-commission'
  | 'social-services'
  | 'passport-immigration'
  | 'land-ministry'
  | 'bdris-birth-death'
  | 'nbr-tax'
  | 'brta'
  | 'police-clearance'
  | 'education-board';

export type OfficeStatus = 'active' | 'upcoming';

export interface GovOffice {
  id: OfficeId;
  nameBn: string;
  nameEn: string;
  shortName: string;
  displayGridTitle: string; // The exact clean name drawn in user sketch, e.g. "নির্বাচন অফিস", "সমাজ সেবা অফিস", "পাসপোর্ট অফিস"
  logoUrl: string;
  iconName: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
  status: OfficeStatus;
  description: string;
  officialPortalUrl?: string;
  helpline?: string;
  availableServicesCount: number;
  upcomingFeatures?: string[];
}

// 12 NID Correction Types defined in the requirements
export type NidCorrectionTypeId =
  | 'self_name_correction'
  | 'name_partial_change'
  | 'name_full_change'
  | 'parents_name_correction'
  | 'spouse_name_correction'
  | 'dob_correction'
  | 'birthplace_correction'
  | 'address_correction'
  | 'photo_change'
  | 'signature_change'
  | 'blood_group_correction'
  | 'other_info_correction';

export type AuthorityLevel =
  | 'উপজেলা / থানা নির্বাচন অফিসার ("ক" ক্যাটাগরি)'
  | 'জেলা নির্বাচন অফিসার ("খ" ক্যাটাগরি)'
  | 'আঞ্চলিক নির্বাচন কর্মকর্তা ("গ" ক্যাটাগরি)'
  | 'নির্বাচন কমিশন সচিবালয় / ডিজি ("ঘ" ক্যাটাগরি)'
  | string;

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  type: 'mandatory' | 'supporting' | 'conditional';
  conditionNote?: string;
}

export interface FeeTier {
  times: string; // ১ম বার, ২য় বার, ৩য় ও পরবর্তী
  baseFee: number;
  vatPercent: number;
  vatAmount: number;
  totalFee: number;
  urgentBaseFee?: number;
  urgentVatAmount?: number;
  urgentTotalFee?: number;
}

export interface NidCorrectionRule {
  id: NidCorrectionTypeId;
  numericId: number;
  titleBn: string;
  subtitleBn: string;
  categoryCode: 'ক' | 'খ' | 'গ' | 'ঘ';
  authority: AuthorityLevel;
  averageWorkingDays: string;
  keywords: string[];
  description: string;
  mandatoryDocs: DocumentItem[];
  supportingDocs: DocumentItem[];
  conditionalDocs: DocumentItem[];
  feeStructure: {
    categoryType: 'ব্যক্তিগত তথ্য' | 'অন্যান্য তথ্য / ঠিকানা' | 'উভয় ক্ষেত্র';
    regularFee: number;
    vat: number;
    totalRegular: number;
    urgentFee?: number;
    urgentVat?: number;
    totalUrgent?: number;
    tiers: FeeTier[];
    paymentMethods: string[];
  };
  stepByStepGuide: {
    stepNumber: number;
    title: string;
    instruction: string;
    portalAction?: string;
  }[];
  statutoryWarnings: string[];
  specialConditions?: string[];
  sourceReference: {
    citation: string;
    circularNo?: string;
    lastVerifiedDate: string;
    needsVerification: boolean;
  };
}

export interface DetectionResult {
  detectedType: NidCorrectionTypeId;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  rule: NidCorrectionRule;
  highlightDifference?: string;
}
