export type Language = 'bn' | 'en';
export type InvoiceTemplateId =
  | 'classic'
  | 'modern'
  | 'elegant'
  | 'minimal'
  | 'bengali'
  | 'memo-mobile-point'
  | 'memo-golden-gadhi'
  | 'memo-bismillah-store'
  | 'memo-computer-studio'
  | 'memo-enterprise'
  | 'memo-it-computer-point'
  | 'memo-motors'
  | 'memo-furniture-classic'
  | 'memo-door-furniture'
  | 'memo-festive-mobile';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';
export type UnitType = 'piece' | 'hour' | 'day' | 'month' | 'kg' | 'liter' | 'box' | 'service' | 'custom';
export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'card' | 'other';

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  businessAddress: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string | null;
  tradeLicense: string;
  binVatNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankRoutingNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  defaultCurrency: string;
  defaultLanguage: Language;
  defaultInvoiceFooter: string;
  tagline?: string;
  subtitle?: string;
  religiousHeader?: string;
  memoTypeTitle?: string;
  dealerText?: string;
  signatureTitle?: string;
  signatureImage?: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  customerId?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: UnitType;
  customUnit?: string;
  unitPrice: number;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  vatRate: number; // in percentage, e.g. 5 for 5%, 0 for no vat
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
  currency: string;
  language: Language;
  template: InvoiceTemplateId;
  customer: Customer;
  items: InvoiceItem[];
  invoiceDiscountType: 'fixed' | 'percent';
  invoiceDiscountValue: number;
  shippingCharge: number;
  paidAmount: number;
  notes: string;
  terms: string;
  signatureTitle: string;
  signatureImage?: string;
  customerSignatureTitle?: string;
  customInWords?: string;
  memoTypeTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoneyReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  receivedFrom: string;
  customerPhone: string;
  amount: number;
  amountInWords: string;
  paymentMethod: PaymentMethod;
  paymentPurpose: string;
  relatedInvoiceNumber?: string;
  receivedBy: string;
  notes: string;
  createdAt: string;
}

export interface InvoiceCalculation {
  subtotal: number;
  itemDiscounts: number;
  taxableSubtotal: number;
  totalVat: number;
  invoiceDiscount: number;
  totalDiscount: number;
  shipping: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  isOverdue: boolean;
}

export interface InvoiceTemplateProps {
  invoice: Invoice;
  business: BusinessProfile;
  calc: InvoiceCalculation;
  onEditField?: (fieldId: string) => void;
  onUpdateInvoice?: (updates: Partial<Invoice>) => void;
  onUpdateBusiness?: (updates: Partial<BusinessProfile>) => void;
  onUpdateItem?: (id: string, updates: Partial<InvoiceItem>) => void;
  onAddItem?: () => void;
  onRemoveItem?: (id: string) => void;
  onOpenSignatureModal?: () => void;
}
