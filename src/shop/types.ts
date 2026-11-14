import { Customer, Invoice, InvoiceTemplateId, MoneyReceipt } from '../components/invoice/types';

export type ShopCategoryId =
  | 'mobile-shop'
  | 'computer-laptop'
  | 'electronics'
  | 'general-store'
  | 'grocery'
  | 'clothing-fashion'
  | 'cosmetics-beauty'
  | 'pharmacy'
  | 'stationery-book'
  | 'gift-accessories'
  | 'hardware-building'
  | 'other-shop';

export type ShopLanguage = 'bn' | 'en';

export type VisitingCardMode = 'none' | 'uploaded' | 'created';

export type VisitingCardTemplateId =
  | 'modern-emerald'
  | 'executive-navy'
  | 'royal-gold'
  | 'minimal-clean';

export interface ShopProfile {
  shopId: string;
  ownerUid: string;
  shopCategory: ShopCategoryId;
  shopName: string;
  tagline: string;
  subtitle: string;
  ownerName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  tradeLicense: string;
  binVatNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  brandColor: string;
  language: ShopLanguage;
  defaultTemplate: InvoiceTemplateId;
  defaultInvoiceFooter: string;
  religiousHeader: string;
  signatureTitle: string;
  authType: 'phone' | 'email';
  loginIdentifier: string;
  hasLogo: boolean;
  hasVisitingCard: boolean;
  visitingCardMode: VisitingCardMode;
  visitingCardTemplate: VisitingCardTemplateId | string;
  createdAt: string;
  updatedAt: string;
}

export type ShopAssetId = 'branding_logo' | 'branding_card' | 'branding_sig';

export interface ShopAsset {
  assetId: ShopAssetId;
  shopId: string;
  ownerUid: string;
  assetType: 'logo' | 'visiting_card' | 'signature';
  mimeType: string;
  dataUrl: string;
  updatedAt: string;
}

export interface ShopAssetsMap {
  logoDataUrl: string;
  visitingCardDataUrl: string;
  signatureDataUrl: string;
}

export interface ShopProduct {
  id: string;
  shopId: string;
  ownerUid: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockAlert: number;
  warranty: string;
  expiryDate: string;
  batchNumber: string;
  customFields: Record<string, string>;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopCustomer extends Customer {
  shopId: string;
  ownerUid: string;
  totalDue?: number;
  updatedAt?: string;
}

export interface ShopInvoice extends Invoice {
  shopId: string;
  ownerUid: string;
}

export interface ShopReceipt extends MoneyReceipt {
  shopId: string;
  ownerUid: string;
}

export interface ShopSupplier {
  id: string;
  shopId: string;
  ownerUid: string;
  name: string;
  company: string;
  phone: string;
  address: string;
  totalPayable: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopExpense {
  id: string;
  shopId: string;
  ownerUid: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export type RepairStatus = 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export interface ShopRepairTicket {
  id: string;
  shopId: string;
  ownerUid: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  deviceName: string;
  serialOrImei: string;
  issueDescription: string;
  estimatedCost: number;
  advancePaid: number;
  status: RepairStatus;
  receivedDate: string;
  deliveryDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopDocument {
  id: string;
  shopId: string;
  ownerUid: string;
  title: string;
  docType: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type DailySalePaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'card' | 'due';

export interface ShopDailySale {
  id: string;
  shopId: string;
  ownerUid: string;
  date: string;
  title: string;
  customerName?: string;
  paymentMethod: DailySalePaymentMethod;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  costAmount?: number;
  quantity?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopRegistrationDraft {
  shopCategory: ShopCategoryId;
  shopName: string;
  tagline: string;
  brandColor: string;
  ownerName: string;
  phone: string;
  logoDataUrl: string;
  visitingCardDataUrl: string;
  visitingCardMode: VisitingCardMode;
  visitingCardTemplate: VisitingCardTemplateId;
  address: string;
  email: string;
  website: string;
  tradeLicense: string;
  binVatNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  authMethod: 'phone' | 'email';
  loginEmail: string;
  password: string;
  confirmPassword: string;
  language: ShopLanguage;
}
