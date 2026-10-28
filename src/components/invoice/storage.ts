import { BusinessProfile, Customer, Invoice, MoneyReceipt } from './types';

const STORAGE_KEYS = {
  BUSINESS: 'mosafa_invoice_business_profile',
  CUSTOMERS: 'mosafa_invoice_customers',
  INVOICES: 'mosafa_invoice_saved_invoices',
  RECEIPTS: 'mosafa_invoice_saved_receipts',
};

export const defaultBusinessProfile: BusinessProfile = {
  businessName: 'The MoSaFa ডিজিটাল আইটি সল্যুশন',
  ownerName: 'মোফাচ্ছির আহমেদ',
  businessAddress: 'হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ',
  phone: '+880 1700-000000',
  email: 'contact@mosafa.com',
  website: 'https://themedosafe.blogspot.com',
  logoUrl: null,
  tradeLicense: 'TRAD/DNCC/024851/2024',
  binVatNumber: 'BIN-002948512-0102',
  bankName: 'ডাচ-বাংলা ব্যাংক পিএলসি',
  bankAccountName: 'The MoSaFa IT Solution',
  bankAccountNumber: '115.120.98452',
  bankBranch: 'ধানমন্ডি শাখা, ঢাকা',
  bankRoutingNumber: '090271542',
  bkashNumber: '01700-000000 (মার্চেন্ট)',
  nagadNumber: '01700-000000 (পার্সোনাল)',
  rocketNumber: '',
  defaultCurrency: 'BDT (৳)',
  defaultLanguage: 'bn',
  defaultInvoiceFooter: 'আমাদের সেবা গ্রহণের জন্য ধন্যবাদ। কোনো প্রশ্ন থাকলে যোগাযোগ করুন।',
  religiousHeader: 'বিসমিল্লাহির রাহমানির রাহিম',
  subtitle: 'M/S SIAM ENTERPRISES',
  tagline: 'এখানে যাবতীয় পাইকারী ও খুচরা মালামাল এবং ডিজিটাল সেবা সুলভ মূল্যে প্রদান করা হয়।',
};

export const sampleInvoice: Invoice = {
  id: 'sample-inv-001',
  invoiceNumber: 'MSF-INV-0001',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  paymentStatus: 'partial',
  currency: 'BDT (৳)',
  language: 'bn',
  template: 'classic',
  customer: {
    id: 'cust-001',
    name: 'তানভীর হাসান',
    companyName: 'নেক্সটজেন টেকনোলজিস লিঃ',
    phone: '01811-223344',
    email: 'tanveer@nextgentech.bd',
    address: 'প্লট #৮, গুলশান-২, ঢাকা',
    customerId: 'CUST-084',
    createdAt: new Date().toISOString(),
  },
  items: [
    {
      id: 'item-1',
      name: 'প্রফেশনাল বিজনেস ওয়েবসাইট ডিজাইন ও ডেভেলপমেন্ট',
      description: 'রেসপনসিভ UI/UX, ডোমেন ও হোস্টিং ইন্টিগ্রেশন এবং SEO অপটিমাইজেশন',
      quantity: 1,
      unit: 'service',
      unitPrice: 25000,
      discountType: 'fixed',
      discountValue: 2000,
      vatRate: 5,
      lineTotal: 24150,
    },
    {
      id: 'item-2',
      name: 'ক্লাউড হোস্টিং ও SSL সার্টিফিকেট (১ বছর)',
      description: 'হাই-স্পিড NVMe SSD হোস্টিং, ৯৯.৯% আপটাইম গ্যারান্টি',
      quantity: 1,
      unit: 'service',
      unitPrice: 4500,
      discountType: 'percent',
      discountValue: 10,
      vatRate: 5,
      lineTotal: 4252.5,
    },
    {
      id: 'item-3',
      name: 'সোশ্যাল মিডিয়া ব্র্যান্ডিং ও ব্যানার ডিজাইন প্যাক',
      description: 'ফেসবুক ও ইনস্টাগ্রাম প্রফেশনাল পোস্টার ও কভার ডিজাইন (১০টি)',
      quantity: 10,
      unit: 'piece',
      unitPrice: 600,
      discountType: 'fixed',
      discountValue: 500,
      vatRate: 0,
      lineTotal: 5500,
    },
  ],
  invoiceDiscountType: 'fixed',
  invoiceDiscountValue: 1000,
  shippingCharge: 0,
  paidAmount: 20000,
  notes: 'বিল পরিশোধের পর অনুগ্রহ করে ট্রানজেকশন আইডি আমাদের হোয়াটসঅ্যাপে পাঠাবেন।',
  terms: '১. চালান জারির ৭ কার্যদিবসের মধ্যে অবশিষ্ট বকেয়া পরিশোধযোগ্য। ২. প্রদেয় সেবা চুক্তি অনুযায়ী ১ বছর ফ্রি টেকনিক্যাল সাপোর্ট অন্তর্ভুক্ত।',
  signatureTitle: 'স্বত্বাধিকারী / অনুমোদিত স্বাক্ষর',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const sampleReceipt: MoneyReceipt = {
  id: 'sample-rec-001',
  receiptNumber: 'MSF-REC-0001',
  receiptDate: new Date().toISOString().split('T')[0],
  receivedFrom: 'তানভীর হাসান (নেক্সটজেন টেকনোলজিস লিঃ)',
  customerPhone: '01811-223344',
  amount: 20000,
  amountInWords: 'বিশ হাজার টাকা মাত্র।',
  paymentMethod: 'bkash',
  paymentPurpose: 'ওয়েবসাইট ডেভেলপমেন্ট প্রজেক্টের অগ্রিম পেমেন্ট',
  relatedInvoiceNumber: 'MSF-INV-0001',
  receivedBy: 'মোফাচ্ছির আহমেদ',
  notes: 'bKash TrxID: 9X48LK02Q1 প্রাপ্তি স্বীকার করা হলো।',
  createdAt: new Date().toISOString(),
};

// Safe LocalStorage Handlers
export function getSavedBusinessProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    if (!raw) return defaultBusinessProfile;
    return { ...defaultBusinessProfile, ...JSON.parse(raw) };
  } catch {
    return defaultBusinessProfile;
  }
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save business profile:', err);
  }
}

export function getSavedInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (err) {
    console.error('Failed to save invoices:', err);
  }
}

export function getSavedReceipts(): MoneyReceipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveReceipts(receipts: MoneyReceipt[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  } catch (err) {
    console.error('Failed to save receipts:', err);
  }
}

export function getSavedCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (err) {
    console.error('Failed to save customers:', err);
  }
}

// Export All Data as JSON
export function exportAllDataAsJson(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    business: getSavedBusinessProfile(),
    customers: getSavedCustomers(),
    invoices: getSavedInvoices(),
    receipts: getSavedReceipts(),
  };
  return JSON.stringify(data, null, 2);
}

// Import & Validate JSON Data
export function importDataFromJson(jsonStr: string): { success: boolean; message: string; count?: number } {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'অবৈধ ফাইল ফরম্যাট (Invalid JSON format)' };
    }

    let invoiceCount = 0;
    if (data.business && typeof data.business === 'object') {
      saveBusinessProfile({ ...defaultBusinessProfile, ...data.business });
    }
    if (Array.isArray(data.customers)) {
      saveCustomers(data.customers);
    }
    if (Array.isArray(data.invoices)) {
      saveInvoices(data.invoices);
      invoiceCount = data.invoices.length;
    }
    if (Array.isArray(data.receipts)) {
      saveReceipts(data.receipts);
    }

    return {
      success: true,
      message: `সফলভাবে ${invoiceCount}টি ইনভয়েস ও প্রয়োজনীয় ডাটা রিস্টোর করা হয়েছে!`,
      count: invoiceCount,
    };
  } catch (err: any) {
    return { success: false, message: `ফাইল রিড করতে ব্যর্থ: ${err?.message || 'অজানা ত্রুটি'}` };
  }
}
