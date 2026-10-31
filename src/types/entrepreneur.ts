export type CapitalBracket =
  | 'zero' // ৳০ (সম্পূর্ণ বিনা পুঁজিতে)
  | 'low' // ৳১,০০০ - ৫,০০০
  | 'medium' // ৳৫,০০০ - ২০,০০০
  | 'high'; // ৳২০,০০০+

export type ExperienceLevel = 'beginner' | 'some_skills' | 'experienced';
export type BusinessModelType = 'service' | 'digital' | 'reselling' | 'handmade' | 'coaching' | 'physical';

export interface EntrepreneurProfile {
  name: string;
  locationDistrict: string;
  locationDivision: string;
  education: string;
  skills: string[];
  interests: string[];
  workExperience: string;
  availableHoursPerWeek: number;
  availableCapital: CapitalBracket;
  equipment: {
    hasSmartphone: boolean;
    hasLaptopOrPC: boolean;
    hasReliableInternet: boolean;
  };
  experienceLevel: ExperienceLevel;
  preference: 'online' | 'offline' | 'hybrid';
  monthlyIncomeGoal: number; // in BDT (৳)
  isProfileComplete: boolean;
  updatedAt: string;
}

export interface ZeroCapitalIdea {
  id: string;
  title: string;
  banglaTitle: string;
  tagline: string;
  category: BusinessModelType;
  capitalRequired: CapitalBracket;
  estimatedStartingCost: string; // e.g. "৳০ - ৫০০"
  timeToFirstIncome: string; // e.g. "২-৩ সপ্তাহ"
  potentialMonthlyIncome: string; // e.g. "৳১৫,০০০ - ৪৫,০০০"
  difficultyLevel: 'সহজ' | 'মাঝারি' | 'পরিশ্রমসাধ্য';
  requiredSkills: string[];
  equipmentNeeded: string[];
  targetCustomersInBD: string[];
  valueProposition: string;
  howToFindFirst10Customers: string[];
  firstOfferDraft: {
    name: string;
    description: string;
    suggestedPrice: string;
  };
  freeMarketingMethods: string[];
  realRisksInBD: string[];
  validationSteps: string[];
  fourWeekRoadmap: {
    week1: string;
    week2: string;
    week3: string;
    week4: string;
  };
}

export interface CustomerInterviewQuestion {
  id: string;
  question: string;
  purpose: string;
  sampleAnswer: string;
}

export interface ValidationPlan {
  id: string;
  ideaDescription: string;
  customerProblem: string;
  targetAudience: string;
  valueProposition: string;
  competitors: Array<{
    name: string;
    pricingEstimate: string;
    strengths: string;
    weaknesses: string;
    ourAdvantage: string;
  }>;
  interviewQuestions: CustomerInterviewQuestion[];
  mvpPlan: {
    scope: string;
    format: string; // e.g. "WhatsApp Catalog", "Google Form", "Canva PDF portfolio"
    timeToBuildDays: number;
    budgetBDT: number;
  };
  experiments: Array<{
    name: string;
    method: string;
    successMetric: string;
    status: 'planned' | 'in_progress' | 'passed' | 'failed';
  }>;
  identifiedRisks: string[];
  nextActions: string[];
  updatedAt: string;
}

export interface CustomerPersona {
  name: string;
  demographics: string;
  location: string;
  dailyRoutine: string;
  biggestPainPoint: string;
  currentWorkaround: string;
  willingnessToPay: string;
  onlineHangouts: string[];
  triggerMoment: string;
}

export interface OfferPackageTier {
  id: string;
  tierName: string; // Basic, Standard, Premium
  tagline: string;
  priceBDT: number;
  deliverables: string[];
  deliveryTimeDays: number;
  revisionsAllowed: string;
  idealFor: string;
}

export interface BusinessOfferDraft {
  brandNameIdeas: string[];
  selectedBrandName: string;
  tagline: string;
  coreValueProp: string;
  packages: OfferPackageTier[];
  guaranteePolicy: string;
  salesHookLines: string[];
  callToAction: string;
}

export interface BusinessPlanDocument {
  id: string;
  businessName: string;
  tagline: string;
  lastUpdated: string;
  executiveSummary: string;
  businessDescription: string;
  problemAndSolution: string;
  targetCustomerProfile: string;
  marketResearchAndOpportunity: string;
  competitorAnalysis: string;
  productsAndPricing: string;
  marketingAndAcquisitionPlan: string;
  salesAndConversionProcess: string;
  operationsAndDailyWorkflow: string;
  financialProjections: {
    startingCapitalNeeded: number;
    monthlyOverhead: number;
    estimatedBreakEvenMonths: number;
    month1RevenueTarget: number;
    month3RevenueTarget: number;
  };
  risksAndMitigation: string;
  thirtyDayMilestones: string[];
  ninetyDayVision: string;
}

export interface MarketingContentSnippet {
  id: string;
  type: 'facebook_post' | 'product_caption' | 'sales_copy' | 'whatsapp_message' | 'video_script' | 'follow_up';
  title: string;
  content: string;
  callToAction: string;
  channel: string;
  tags: string[];
}

export interface StartupExpenseItem {
  id: string;
  title: string;
  category: 'equipment' | 'inventory' | 'marketing' | 'license' | 'other';
  amountBDT: number;
  isEssential: boolean;
}

export interface MonthlyExpenseItem {
  id: string;
  title: string;
  category: 'rent_space' | 'internet_phone' | 'materials' | 'delivery' | 'marketing' | 'other';
  monthlyCostBDT: number;
}

export interface UnitCostCalculatorData {
  productOrServiceName: string;
  rawMaterialsCost: number;
  packagingCost: number;
  laborHoursPerUnit: number;
  laborRatePerHour: number;
  platformOrPaymentFeePercent: number; // e.g. 2% for bKash merchant
  deliveryCost: number;
  sellingPriceBDT: number;
}

export interface FinanceData {
  startupExpenses: StartupExpenseItem[];
  monthlyExpenses: MonthlyExpenseItem[];
  unitCostCalc: UnitCostCalculatorData;
  monthlyRevenueGoalBDT: number;
  reinvestmentRatePercent: number; // e.g. 30%
  ownerSalaryGoalBDT: number;
}

export interface CustomerLead {
  id: string;
  name: string;
  phoneOrWhatsApp: string;
  email?: string;
  district: string;
  status: 'lead' | 'contacted' | 'negotiating' | 'converted' | 'lost';
  source: 'facebook_group' | 'whatsapp' | 'referral' | 'personal_network' | 'offline_visit' | 'other';
  interestedInProduct: string;
  potentialValueBDT: number;
  notes: string;
  followUpDate?: string;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemsOrdered: string;
  totalAmountBDT: number;
  advancePaidBDT: number;
  dueAmountBDT: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  deliveryStatus: 'pending' | 'in_progress' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}

export interface DailyMentorTask {
  id: string;
  title: string;
  banglaTitle: string;
  description: string;
  category: 'customer_discovery' | 'outreach' | 'offer_creation' | 'finance' | 'learning';
  dayNumber: number; // 1 to 30
  estimatedMinutes: number;
  isCompleted: boolean;
  completionDate?: string;
}

export interface BusinessProject {
  id: string;
  name: string;
  businessType: BusinessModelType;
  tagline: string;
  primaryDescription: string;
  targetAudience: string;
  capitalAllocatedBDT: number;
  stage: 'idea_stage' | 'validation' | 'first_offer' | 'first_customers' | 'active_sales' | 'scaling';
  validationPlan: ValidationPlan;
  offerDraft: BusinessOfferDraft;
  businessPlan: BusinessPlanDocument;
  financeData: FinanceData;
  leads: CustomerLead[];
  orders: OrderRecord[];
  dailyTasks: DailyMentorTask[];
  notesAndJournal: Array<{
    id: string;
    date: string;
    note: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
