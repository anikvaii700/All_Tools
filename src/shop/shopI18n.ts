import { ShopLanguage } from './types';

export function toShopDigits(value: number | string, lang: ShopLanguage): string {
  const str = String(value);
  if (lang !== 'bn') return str;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/\d/g, (d) => bn[Number(d)]);
}

export function formatShopMoney(amount: number, lang: ShopLanguage): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const formatted = safe.toLocaleString('en-US', {
    minimumFractionDigits: safe % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `৳ ${toShopDigits(formatted, lang)}`;
}

export interface ShopStrings {
  appName: string;
  backToMainPortal: string;
  independentNotice: string;
  loginTitle: string;
  registerTitle: string;
  phoneLoginTab: string;
  emailLoginTab: string;
  phoneLabel: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  loginButton: string;
  createAccountButton: string;
  forgotPassword: string;
  stepOf: string;
  nextStep: string;
  prevStep: string;
  completeRegistration: string;
  logout: string;
  dashboard: string;
  inventory: string;
  cashMemo: string;
  customersAndDue: string;
  suppliers: string;
  expenses: string;
  repairs: string;
  reports: string;
  dailySalesReport: string;
  visitingCard: string;
  settings: string;
  lowStockAlert: string;
  expiryAlert: string;
  addProduct: string;
  save: string;
  cancel: string;
  searchPlaceholder: string;
  noDataYet: string;
  enterShop: string;
  switchLanguage: string;
}

export const SHOP_I18N: Record<ShopLanguage, ShopStrings> = {
  bn: {
    appName: 'My Digital Shop Management',
    backToMainPortal: 'মূল মোসাফা টুলস',
    independentNotice: 'স্বতন্ত্র দোকান অ্যাকাউন্ট — মূল ওয়েবসাইট লগইন থেকে সম্পূর্ণ আলাদা ও নিরাপদ',
    loginTitle: 'দোকান অ্যাকাউন্টে লগইন করুন',
    registerTitle: 'নতুন ডিজিটাল দোকান খুলুন (৭ ধাপ)',
    phoneLoginTab: 'মোবাইল নম্বর',
    emailLoginTab: 'ইমেইল অ্যাড্রেস',
    phoneLabel: 'মোবাইল নম্বর',
    emailLabel: 'ইমেইল অ্যাড্রেস',
    passwordLabel: 'পাসওয়ার্ড / পিন (কমপক্ষে ৬ অক্ষর)',
    confirmPasswordLabel: 'পাসওয়ার্ড নিশ্চিত করুন',
    loginButton: 'লগইন করুন',
    createAccountButton: 'নতুন দোকান রেজিস্ট্রেশন করুন',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    stepOf: 'ধাপ',
    nextStep: 'পরবর্তী ধাপ',
    prevStep: 'আগের ধাপ',
    completeRegistration: 'রেজিস্ট্রেশন সম্পন্ন করুন',
    logout: 'লগআউট',
    dashboard: 'ড্যাশবোর্ড',
    inventory: 'পণ্য ও স্টক',
    cashMemo: 'ক্যাশ মেমো ও রিসিট',
    customersAndDue: 'ক্রেতা ও বাকি খাতা',
    suppliers: 'পাইকার / সাপ্লায়ার',
    expenses: 'দৈনিক খরচ ও হিসাব',
    repairs: 'সার্ভিসিং / রিপেয়ার',
    reports: 'রিপোর্ট ও সামারি',
    dailySalesReport: 'প্রতিদিনের বিক্রয় রিপোর্ট',
    visitingCard: 'ভিজিটিং কার্ড',
    settings: 'সেটিংস ও ক্যাটাগরি',
    lowStockAlert: 'স্টক কম সতর্কতা',
    expiryAlert: 'মেয়াদ সতর্কতা',
    addProduct: 'নতুন পণ্য যোগ করুন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    searchPlaceholder: 'নাম, কোড বা মোবাইল দিয়ে খুঁজুন...',
    noDataYet: 'এখনো কোনো তথ্য যুক্ত করা হয়নি',
    enterShop: 'দোকানে প্রবেশ করুন',
    switchLanguage: 'English',
  },
  en: {
    appName: 'My Digital Shop Management',
    backToMainPortal: 'MoSaFa Portal',
    independentNotice: 'Independent Shop Account — Completely separate from main MoSaFa website login',
    loginTitle: 'Sign In to Your Shop',
    registerTitle: 'Create Your Digital Shop (7 Steps)',
    phoneLoginTab: 'Mobile Number',
    emailLoginTab: 'Email Address',
    phoneLabel: 'Mobile Number',
    emailLabel: 'Email Address',
    passwordLabel: 'Password (min 6 characters)',
    confirmPasswordLabel: 'Confirm Password',
    loginButton: 'Sign In',
    createAccountButton: 'Register New Shop',
    forgotPassword: 'Forgot Password?',
    stepOf: 'Step',
    nextStep: 'Next Step',
    prevStep: 'Previous',
    completeRegistration: 'Complete Registration',
    logout: 'Sign Out',
    dashboard: 'Dashboard',
    inventory: 'Products & Stock',
    cashMemo: 'Cash Memo & Receipt',
    customersAndDue: 'Customers & Due',
    suppliers: 'Suppliers',
    expenses: 'Expenses',
    repairs: 'Repairs & Service',
    reports: 'Reports',
    dailySalesReport: 'Daily Sales Report',
    visitingCard: 'Visiting Card',
    settings: 'Settings & Category',
    lowStockAlert: 'Low Stock Alerts',
    expiryAlert: 'Expiry Alerts',
    addProduct: 'Add Product',
    save: 'Save Changes',
    cancel: 'Cancel',
    searchPlaceholder: 'Search by name, SKU, or phone...',
    noDataYet: 'No records added yet',
    enterShop: 'Enter Shop',
    switchLanguage: 'বাংলা',
  },
};
