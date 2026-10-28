import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  FileText,
  Receipt,
  Plus,
  Trash2,
  Copy,
  Printer,
  Download,
  Share2,
  Save,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  Settings,
  Search,
  Upload,
  Eye,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Wallet,
  Sparkles,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Sliders,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

import {
  BusinessProfile,
  Customer,
  Invoice,
  InvoiceItem,
  InvoiceTemplateId,
  MoneyReceipt,
  PaymentMethod,
  PaymentStatus,
  UnitType,
} from './invoice/types';
import {
  defaultBusinessProfile,
  exportAllDataAsJson,
  getSavedBusinessProfile,
  getSavedCustomers,
  getSavedInvoices,
  getSavedReceipts,
  importDataFromJson,
  sampleInvoice,
  sampleReceipt,
  saveBusinessProfile,
  saveCustomers,
  saveInvoices,
  saveReceipts,
} from './invoice/storage';
import { calculateInvoice, calculateItemTotal, formatMoney } from './invoice/calculator';
import { numberToWordsBengali, numberToWordsEnglish, toBengaliNumerals } from './invoice/numberToWords';

// 15 Invoice Templates (5 Original + 10 Bangladeshi Market Cash Memo Templates)
import { InvoiceTemplateClassic } from './invoice/InvoiceTemplateClassic';
import { InvoiceTemplateModern } from './invoice/InvoiceTemplateModern';
import { InvoiceTemplateElegant } from './invoice/InvoiceTemplateElegant';
import { InvoiceTemplateMinimal } from './invoice/InvoiceTemplateMinimal';
import { InvoiceTemplateBengali } from './invoice/InvoiceTemplateBengali';
import { InvoiceTemplateMobilePoint } from './invoice/InvoiceTemplateMobilePoint';
import { InvoiceTemplateGoldenGadhi } from './invoice/InvoiceTemplateGoldenGadhi';
import { InvoiceTemplateBismillahStore } from './invoice/InvoiceTemplateBismillahStore';
import { InvoiceTemplateComputerStudio } from './invoice/InvoiceTemplateComputerStudio';
import { InvoiceTemplateEnterprise } from './invoice/InvoiceTemplateEnterprise';
import { InvoiceTemplateComputerPoint } from './invoice/InvoiceTemplateComputerPoint';
import { InvoiceTemplateMotors } from './invoice/InvoiceTemplateMotors';
import { InvoiceTemplateFurnitureClassic } from './invoice/InvoiceTemplateFurnitureClassic';
import { InvoiceTemplateDoorFurniture } from './invoice/InvoiceTemplateDoorFurniture';
import { InvoiceTemplateFestiveMobile } from './invoice/InvoiceTemplateFestiveMobile';
import { MoneyReceiptView } from './invoice/MoneyReceiptView';

interface InvoiceMakerProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

type MainTab = 'dashboard' | 'create-invoice' | 'create-receipt' | 'saved' | 'settings' | 'templates';

export const InvoiceMaker: React.FC<InvoiceMakerProps> = ({ onBackToHub, onShowToast }) => {
  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [mobileEditorMode, setMobileEditorMode] = useState<'editor' | 'preview'>('editor');

  // Persistence States
  const [business, setBusiness] = useState<BusinessProfile>(() => getSavedBusinessProfile());
  const [savedInvoicesList, setSavedInvoicesList] = useState<Invoice[]>(() => getSavedInvoices());
  const [savedReceiptsList, setSavedReceiptsList] = useState<MoneyReceipt[]>(() => getSavedReceipts());
  const [savedCustomersList, setSavedCustomersList] = useState<Customer[]>(() => getSavedCustomers());

  // Show welcome modal/screen if no invoices exist yet
  const [showWelcome, setShowWelcome] = useState<boolean>(() => savedInvoicesList.length === 0);

  // Helper to generate next sequential invoice number
  const generateNextInvoiceNumber = (invoices: Invoice[]): string => {
    const count = invoices.length + 1;
    const padded = String(count).padStart(4, '0');
    return `MSF-INV-${padded}`;
  };

  const generateNextReceiptNumber = (receipts: MoneyReceipt[]): string => {
    const count = receipts.length + 1;
    const padded = String(count).padStart(4, '0');
    return `MSF-REC-${padded}`;
  };

  // Active Invoice Form State
  const [invoice, setInvoice] = useState<Invoice>(() => ({
    id: `inv-${Date.now()}`,
    invoiceNumber: generateNextInvoiceNumber(savedInvoicesList),
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    paymentStatus: 'unpaid',
    currency: 'BDT (৳)',
    language: 'bn',
    template: 'classic',
    customer: {
      id: `cust-${Date.now()}`,
      name: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      createdAt: new Date().toISOString(),
    },
    items: [
      {
        id: `item-${Date.now()}-1`,
        name: 'ওয়েব ডেভেলপমেন্ট সার্ভিস',
        description: 'রেসপনসিভ ওয়েবসাইট ডিজাইন ও টেকনিক্যাল সেটআপ',
        quantity: 1,
        unit: 'service',
        unitPrice: 10000,
        discountType: 'fixed',
        discountValue: 0,
        vatRate: 0,
        lineTotal: 10000,
      },
    ],
    invoiceDiscountType: 'fixed',
    invoiceDiscountValue: 0,
    shippingCharge: 0,
    paidAmount: 0,
    notes: '',
    terms: '১. বিল প্রাপ্তির ৭ কার্যদিবসের মধ্যে অবশিষ্ট বকেয়া পরিশোধ করতে হবে।',
    signatureTitle: 'অনুমোদিত স্বাক্ষর',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Active Receipt Form State
  const [receipt, setReceipt] = useState<MoneyReceipt>(() => ({
    id: `rec-${Date.now()}`,
    receiptNumber: generateNextReceiptNumber(savedReceiptsList),
    receiptDate: new Date().toISOString().split('T')[0],
    receivedFrom: '',
    customerPhone: '',
    amount: 5000,
    amountInWords: numberToWordsBengali(5000),
    paymentMethod: 'cash',
    paymentPurpose: 'বিল পরিশোধ বাবদ নগদ গ্রহণ',
    relatedInvoiceNumber: '',
    receivedBy: business.ownerName || 'স্বত্বাধিকারী',
    notes: '',
    createdAt: new Date().toISOString(),
  }));

  // UI & Filter States
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [receiptOrInvoiceToDelete, setReceiptOrInvoiceToDelete] = useState<'invoice' | 'receipt'>('invoice');

  // Interactive Click-to-Point State
  const [highlightedFieldId, setHighlightedFieldId] = useState<string | null>(null);

  const handleFocusField = (fieldId: string) => {
    if (fieldId === 'field-business-settings') {
      setActiveTab('settings');
      onShowToast('ব্যবসার প্রোফাইল ও সেটিংস ওপেন করা হয়েছে! 🏢', '✏️');
      return;
    }

    if (activeTab !== 'create-invoice') {
      setActiveTab('create-invoice');
    }
    if (mobileEditorMode === 'preview') {
      setMobileEditorMode('editor');
    }

    // Resolve mapped field ID if needed
    let targetId = fieldId;
    if (
      fieldId === 'field-calc-subtotal' ||
      fieldId === 'field-calc-grand-total' ||
      fieldId === 'field-calc-paid' ||
      fieldId === 'field-calc-due'
    ) {
      targetId = 'field-inv-paid-amount';
    } else if (fieldId === 'field-calc-discount') {
      targetId = 'field-inv-discount';
    } else if (fieldId === 'field-calc-shipping') {
      targetId = 'field-inv-shipping';
    }

    setHighlightedFieldId(targetId);
    setTimeout(() => {
      setHighlightedFieldId((prev) => (prev === targetId ? null : prev));
    }, 4000);

    setTimeout(() => {
      let el = document.getElementById(targetId);
      if (!el && targetId.startsWith('field-item-')) {
        const parts = targetId.split('-');
        const prefix = parts.slice(0, 3).join('-');
        el = document.querySelector(`[id^="${prefix}"]`);
      }
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          el instanceof HTMLSelectElement
        ) {
          el.focus();
        } else {
          const input = el.querySelector('input, textarea, select');
          if (input instanceof HTMLElement) {
            input.focus();
          }
        }
      }
    }, 120);

    onShowToast('সংশ্লিষ্ট এডিট অপশনে নির্দেশ করা হয়েছে! ✏️', '🎯');
  };

  // DOM Refs for PDF / Print
  const invoicePreviewRef = useRef<HTMLDivElement | null>(null);
  const receiptPreviewRef = useRef<HTMLDivElement | null>(null);

  // Auto Calculations for active invoice
  const currentCalc = calculateInvoice(invoice);

  // Sync business settings to localStorage
  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveBusinessProfile(business);
    onShowToast('ব্যবসার প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে! 🏢', '✅');
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      onShowToast('ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট হতে হবে!', '⚠️');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setBusiness((prev) => ({ ...prev, logoUrl: b64 }));
      onShowToast('ব্যবসার লোগো আপলোড হয়েছে! 🖼️', '✅');
    };
    reader.readAsDataURL(file);
  };

  // Customer autofill & save
  const handleSelectSavedCustomer = (customerId: string) => {
    const cust = savedCustomersList.find((c) => c.id === customerId);
    if (cust) {
      setInvoice((prev) => ({
        ...prev,
        customer: { ...cust },
      }));
      onShowToast(`গ্রাহক "${cust.name}" নির্বাচিত হয়েছেন!`, '👤');
    }
  };

  const handleSaveCurrentCustomer = () => {
    if (!invoice.customer.name.trim()) {
      onShowToast('অনুগ্রহ করে গ্রাহকের নাম লিখুন!', '⚠️');
      return;
    }
    const existingIdx = savedCustomersList.findIndex(
      (c) => c.name.toLowerCase() === invoice.customer.name.toLowerCase()
    );
    let updated: Customer[];
    if (existingIdx >= 0) {
      updated = [...savedCustomersList];
      updated[existingIdx] = { ...invoice.customer };
    } else {
      updated = [invoice.customer, ...savedCustomersList];
    }
    setSavedCustomersList(updated);
    saveCustomers(updated);
    onShowToast('গ্রাহকের তথ্য সংরক্ষিত হয়েছে!', '💾');
  };

  // Item Table Handlers
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      description: '',
      quantity: 1,
      unit: 'piece',
      unitPrice: 0,
      discountType: 'fixed',
      discountValue: 0,
      vatRate: 0,
      lineTotal: 0,
    };
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setInvoice((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          const res = calculateItemTotal(merged);
          return { ...merged, lineTotal: res.total };
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
  };

  const handleDuplicateItem = (id: string) => {
    const itemToDup = invoice.items.find((i) => i.id === id);
    if (!itemToDup) return;
    const duplicated: InvoiceItem = {
      ...itemToDup,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${itemToDup.name} (কপি)`,
    };
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, duplicated],
    }));
    onShowToast('আইটেম ডুপ্লিকেট করা হয়েছে! 📑', '✅');
  };

  const handleRemoveItem = (id: string) => {
    if (invoice.items.length <= 1) {
      onShowToast('ইনভয়েসে কমপক্ষে একটি আইটেম থাকা আবশ্যক!', '⚠️');
      return;
    }
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  // Save Invoice Action
  const handleSaveInvoice = () => {
    if (!invoice.invoiceNumber.trim()) {
      onShowToast('ইনভয়েস নম্বর লিখুন!', '⚠️');
      return;
    }
    const updatedInvoice: Invoice = {
      ...invoice,
      updatedAt: new Date().toISOString(),
    };

    const existingIdx = savedInvoicesList.findIndex((inv) => inv.id === invoice.id);
    let newList: Invoice[];
    if (existingIdx >= 0) {
      newList = [...savedInvoicesList];
      newList[existingIdx] = updatedInvoice;
    } else {
      newList = [updatedInvoice, ...savedInvoicesList];
    }

    setSavedInvoicesList(newList);
    saveInvoices(newList);
    onShowToast(`ইনভয়েস #${invoice.invoiceNumber} সফলভাবে সংরক্ষিত হয়েছে! 💾`, '✅');
  };

  // Save Receipt Action
  const handleSaveReceipt = () => {
    if (!receipt.receiptNumber.trim()) {
      onShowToast('রিসিট নম্বর লিখুন!', '⚠️');
      return;
    }
    const updatedReceipt: MoneyReceipt = {
      ...receipt,
      createdAt: receipt.createdAt || new Date().toISOString(),
    };

    const existingIdx = savedReceiptsList.findIndex((r) => r.id === receipt.id);
    let newList: MoneyReceipt[];
    if (existingIdx >= 0) {
      newList = [...savedReceiptsList];
      newList[existingIdx] = updatedReceipt;
    } else {
      newList = [updatedReceipt, ...savedReceiptsList];
    }

    setSavedReceiptsList(newList);
    saveReceipts(newList);
    onShowToast(`মানি রিসিট #${receipt.receiptNumber} সংরক্ষিত হয়েছে! 💾`, '✅');
  };

  // Start New Invoice
  const handleCreateNewInvoice = () => {
    const nextNum = generateNextInvoiceNumber(savedInvoicesList);
    setInvoice({
      id: `inv-${Date.now()}`,
      invoiceNumber: nextNum,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      paymentStatus: 'unpaid',
      currency: business.defaultCurrency || 'BDT (৳)',
      language: business.defaultLanguage || 'bn',
      template: 'classic',
      customer: {
        id: `cust-${Date.now()}`,
        name: '',
        companyName: '',
        phone: '',
        email: '',
        address: '',
        createdAt: new Date().toISOString(),
      },
      items: [
        {
          id: `item-${Date.now()}-1`,
          name: '',
          description: '',
          quantity: 1,
          unit: 'piece',
          unitPrice: 0,
          discountType: 'fixed',
          discountValue: 0,
          vatRate: 0,
          lineTotal: 0,
        },
      ],
      invoiceDiscountType: 'fixed',
      invoiceDiscountValue: 0,
      shippingCharge: 0,
      paidAmount: 0,
      notes: '',
      terms: business.defaultInvoiceFooter || '১. বিল প্রাপ্তির ৭ কার্যদিবসের মধ্যে বকেয়া পরিশোধযোগ্য।',
      signatureTitle: 'অনুমোদিত স্বাক্ষর',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveTab('create-invoice');
    setShowWelcome(false);
    onShowToast(`নতুন ইনভয়েস (${nextNum}) প্রস্তুত! 🧾`, '✨');
  };

  // Start New Receipt
  const handleCreateNewReceipt = () => {
    const nextNum = generateNextReceiptNumber(savedReceiptsList);
    setReceipt({
      id: `rec-${Date.now()}`,
      receiptNumber: nextNum,
      receiptDate: new Date().toISOString().split('T')[0],
      receivedFrom: '',
      customerPhone: '',
      amount: 1000,
      amountInWords: numberToWordsBengali(1000),
      paymentMethod: 'cash',
      paymentPurpose: 'বিল পরিশোধ বাবদ নগদ গ্রহণ',
      relatedInvoiceNumber: '',
      receivedBy: business.ownerName || 'স্বত্বাধিকারী',
      notes: '',
      createdAt: new Date().toISOString(),
    });
    setActiveTab('create-receipt');
    setShowWelcome(false);
    onShowToast(`নতুন মানি রিসিট (${nextNum}) প্রস্তুত! 💵`, '✨');
  };

  // Load Sample Demo Data
  const handleLoadSampleData = () => {
    setInvoice(sampleInvoice);
    setReceipt(sampleReceipt);
    setActiveTab('create-invoice');
    setShowWelcome(false);
    onShowToast('নমুনা ইনভয়েস ডাটা লোড করা হয়েছে! 🧪', '✨');
  };

  // Delete Handlers
  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    if (receiptOrInvoiceToDelete === 'invoice') {
      const filtered = savedInvoicesList.filter((i) => i.id !== deleteConfirmId);
      setSavedInvoicesList(filtered);
      saveInvoices(filtered);
      onShowToast('ইনভয়েস মুছে ফেলা হয়েছে! 🗑️', '✅');
    } else {
      const filtered = savedReceiptsList.filter((r) => r.id !== deleteConfirmId);
      setSavedReceiptsList(filtered);
      saveReceipts(filtered);
      onShowToast('মানি রিসিট মুছে ফেলা হয়েছে! 🗑️', '✅');
    }
    setDeleteConfirmId(null);
  };

  // Duplicate an existing invoice from saved list
  const handleDuplicateInvoice = (targetInvoice: Invoice) => {
    const newNum = generateNextInvoiceNumber(savedInvoicesList);
    const dup: Invoice = {
      ...targetInvoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: newNum,
      invoiceDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [dup, ...savedInvoicesList];
    setSavedInvoicesList(updated);
    saveInvoices(updated);
    setInvoice(dup);
    setActiveTab('create-invoice');
    onShowToast(`ইনভয়েস ডুপ্লিকেট হয়ে #${newNum} হিসেবে ওপেন হয়েছে!`, '📋');
  };

  // Print Handling
  const handlePrint = () => {
    window.print();
  };

  // Reliable Multi-page PDF Export Engine
  const handleDownloadPdf = async (type: 'invoice' | 'receipt') => {
    const target = type === 'invoice' ? invoicePreviewRef.current : receiptPreviewRef.current;
    if (!target) {
      onShowToast('ডকুমেন্ট পাওয়া যায়নি!', '⚠️');
      return;
    }

    try {
      setIsExportingPdf(true);
      onShowToast('PDF তৈরি হচ্ছে... অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন', '⏳');

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        imageTimeout: 10000,
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const pageCanvasHeight = Math.floor((canvas.width * 297) / 210);

      if (canvas.height <= pageCanvasHeight + 40) {
        // Single page
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const actualImgHeightMm = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(actualImgHeightMm, pdfHeight), undefined, 'FAST');
      } else {
        // Multi page support
        const totalPages = Math.ceil(canvas.height / pageCanvasHeight);
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) pdf.addPage();
          const sourceY = i * pageCanvasHeight;
          const chunkHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageCanvasHeight;
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);
            ctx.drawImage(canvas, 0, sourceY, canvas.width, chunkHeight, 0, 0, canvas.width, chunkHeight);
          }
          const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(pageImg, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }
      }

      const fileName =
        type === 'invoice'
          ? `${invoice.invoiceNumber || 'Invoice'}.pdf`
          : `${receipt.receiptNumber || 'Receipt'}.pdf`;

      pdf.save(fileName);
      onShowToast(`সফলভাবে ${fileName} ডাউনলোড সম্পন্ন হয়েছে! 📄`, '✅');
    } catch (err: any) {
      console.error('PDF export error:', err);
      onShowToast('PDF তৈরিতে সমস্যা হয়েছে। বিকল্প হিসেবে ব্রাউজার "প্রিন্ট" বাটন ব্যবহার করে PDF হিসেবে সেভ করুন।', '⚠️');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // WhatsApp & Share API
  const handleShareWhatsApp = () => {
    const currencySym = invoice.currency.includes('৳') ? '৳' : 'BDT ';
    const phone = (invoice.customer.phone || '').replace(/[^0-9]/g, '');
    let targetPhone = phone;
    if (phone.length === 11 && phone.startsWith('01')) {
      targetPhone = '88' + phone;
    }
    const itemsSummary = invoice.items
      .filter((i) => i.name.trim())
      .map((i, idx) => `• ${i.name} (${i.quantity}x) = ${currencySym}${i.lineTotal.toLocaleString()}`)
      .join('\n');

    const text = `*${business.businessName || 'ইনভয়েস বিবরণী'}*\n🧾 ইনভয়েস নং: ${invoice.invoiceNumber}\n👤 গ্রাহক: ${invoice.customer.name || 'সম্মানিত গ্রাহক'}\n📅 তারিখ: ${invoice.invoiceDate}\n--------------------\n${itemsSummary}\n--------------------\n💰 মোট বিল: ${currencySym}${currentCalc.grandTotal.toLocaleString()}\n✅ পরিশোধিত: ${currencySym}${currentCalc.paidAmount.toLocaleString()}\n⚠️ অবশিষ্ট বকেয়া: ${currencySym}${currentCalc.dueAmount.toLocaleString()}\n\nধন্যবাদ সাথে থাকার জন্য!`;
    const encoded = encodeURIComponent(text);
    const url = targetPhone
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
    onShowToast('হোয়াটসঅ্যাপে ইনভয়েস পাঠানোর লিংক ওপেন হয়েছে! 💬', '📲');
  };

  const handleCopySummary = async () => {
    const currencySym = invoice.currency.includes('৳') ? '৳' : 'BDT ';
    const text = `ইনভয়েস বিবরণী:\nইনভয়েস নং: ${invoice.invoiceNumber}\nপ্রতিষ্ঠান: ${business.businessName}\nগ্রাহক: ${invoice.customer.name}\nমোট বিল: ${currencySym}${currentCalc.grandTotal.toLocaleString()}\nপরিশোধিত: ${currencySym}${currentCalc.paidAmount.toLocaleString()}\nবকেয়া: ${currencySym}${currentCalc.dueAmount.toLocaleString()}`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('ইনভয়েস বিবরণী ক্লিপবোর্ডে কপি হয়েছে! 📋', '✅');
    } catch {
      onShowToast('কপি করতে ব্যর্থ হয়েছে।', '⚠️');
    }
  };

  // JSON Export & Import
  const handleExportJson = () => {
    const jsonStr = exportAllDataAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoSaFa_Invoices_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('সকল ইনভয়েস ডাটা সফলভাবে JSON ফাইল হিসেবে ব্যাকআপ হয়েছে! 📦', '✅');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const res = importDataFromJson(content);
      if (res.success) {
        setBusiness(getSavedBusinessProfile());
        setSavedInvoicesList(getSavedInvoices());
        setSavedReceiptsList(getSavedReceipts());
        setSavedCustomersList(getSavedCustomers());
        onShowToast(res.message, '🎉');
      } else {
        onShowToast(res.message, '⚠️');
      }
    };
    reader.readAsText(file);
  };

  // Render Template Selector (All 15 Templates)
  const renderInvoiceByTemplate = () => {
    switch (invoice.template) {
      // 10 Bangladeshi Market Cash Memo Templates
      case 'memo-mobile-point':
        return <InvoiceTemplateMobilePoint invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-golden-gadhi':
        return <InvoiceTemplateGoldenGadhi invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-bismillah-store':
        return <InvoiceTemplateBismillahStore invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-computer-studio':
        return <InvoiceTemplateComputerStudio invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-enterprise':
        return <InvoiceTemplateEnterprise invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-it-computer-point':
        return <InvoiceTemplateComputerPoint invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-motors':
        return <InvoiceTemplateMotors invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-furniture-classic':
        return <InvoiceTemplateFurnitureClassic invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-door-furniture':
        return <InvoiceTemplateDoorFurniture invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'memo-festive-mobile':
        return <InvoiceTemplateFestiveMobile invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;

      // 5 Original Templates
      case 'bengali':
        return <InvoiceTemplateBengali invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'modern':
        return <InvoiceTemplateModern invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'elegant':
        return <InvoiceTemplateElegant invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'minimal':
        return <InvoiceTemplateMinimal invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
      case 'classic':
      default:
        return <InvoiceTemplateClassic invoice={invoice} business={business} calc={currentCalc} onEditField={handleFocusField} />;
    }
  };

  // Dashboard Stats
  const totalInvoicesCount = savedInvoicesList.length;
  const totalBilled = savedInvoicesList.reduce((acc, inv) => acc + calculateInvoice(inv).grandTotal, 0);
  const totalPaid = savedInvoicesList.reduce((acc, inv) => acc + calculateInvoice(inv).paidAmount, 0);
  const totalDue = savedInvoicesList.reduce((acc, inv) => acc + calculateInvoice(inv).dueAmount, 0);

  // Filtered Invoices
  const filteredInvoices = savedInvoicesList.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      inv.customer.phone.includes(searchFilter);
    const calc = calculateInvoice(inv);
    const status = calc.isOverdue ? 'overdue' : inv.paymentStatus;
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans print:bg-white print:p-0">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHub}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="সকল ২২টি টুলসের মূল পোর্টালে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">সকল টুলস</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    MoSaFa Invoice Maker
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                    ফ্রি বিল ও রিসিট
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  প্রফেশনাল ইনভয়েস ও মানি রিসিট জেনারেটর • ১০০% ক্লায়েন্ট সাইড
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewInvoice}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ইনভয়েস</span>
            </button>
            <button
              type="button"
              onClick={handleCreateNewReceipt}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">মানি রিসিট</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 flex items-center gap-1 overflow-x-auto py-1 text-xs font-bold scrollbar-none">
          {[
            { id: 'dashboard', label: '📊 ড্যাশবোর্ড', badge: totalInvoicesCount ? String(totalInvoicesCount) : undefined },
            { id: 'create-invoice', label: '✏️ ইনভয়েস তৈরি' },
            { id: 'create-receipt', label: '💵 মানি রিসিট' },
            { id: 'saved', label: '📁 সংরক্ষিত নথি', badge: savedInvoicesList.length + savedReceiptsList.length > 0 ? String(savedInvoicesList.length + savedReceiptsList.length) : undefined },
            { id: 'templates', label: '🎨 ১৫টি টেমপ্লেট' },
            { id: 'settings', label: '🏢 ব্যবসার প্রোফাইল' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as MainTab);
                setShowWelcome(false);
              }}
              className={`px-3 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 print:p-0 print:m-0">
        {/* Welcome Modal for First-time / Direct Users */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 mb-8 border border-white/20 print:hidden relative overflow-hidden">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold inline-block mb-3 backdrop-blur-xs">
                ✨ নো-লগইন • নো-ফি • ১০০% ফ্রি
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                স্বাগতম MoSaFa Invoice Maker-এ!
              </h2>
              <p className="text-sm sm:text-base text-white/90 mt-2 leading-relaxed">
                আপনার ব্যবসার জন্য সহজেই তৈরি করুন প্রফেশনাল ইনভয়েস ও মানি রিসিট। স্বয়ংক্রিয় হিসাব, ৫টি প্রিমিয়াম টেমপ্লেট, বাংলা ও ইংরেজি সাপোর্ট এবং সরাসরি PDF ডাউনলোড ও প্রিন্ট সুবিধা।
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateNewInvoice}
                  className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm hover:bg-slate-100 transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 text-rose-600" />
                  <span>নতুন ইনভয়েস তৈরি করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewReceipt}
                  className="px-5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Wallet className="w-4 h-4" />
                  <span>মানি রিসিট তৈরি করুন</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="px-4 py-2.5 rounded-2xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs backdrop-blur-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>নমুনা ইনভয়েস দেখুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 1: DASHBOARD
           ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">মোট ইনভয়েস</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono">
                  {toBengaliNumerals(totalInvoicesCount)}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">আপনার সংরক্ষিত চালান</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-bold text-indigo-600 block uppercase tracking-wider">মোট বিল (Billed)</span>
                <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-1 font-mono">
                  ৳ {toBengaliNumerals(formatMoney(totalBilled, ''))}
                </div>
                <span className="text-[11px] text-indigo-400 mt-1 block">সর্বমোট জারিকৃত মূল্য</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-600 block uppercase tracking-wider">আদায়কৃত (Paid)</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
                  ৳ {toBengaliNumerals(formatMoney(totalPaid, ''))}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">সফলভাবে প্রাপ্ত টাকা</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-bold text-rose-600 block uppercase tracking-wider">বকেয়া (Due)</span>
                <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1 font-mono">
                  ৳ {toBengaliNumerals(formatMoney(totalDue, ''))}
                </div>
                <span className="text-[11px] text-rose-400 mt-1 block">অবশিষ্ট পাওনা টাকা</span>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {business.businessName || 'আপনার ব্যবসার নাম সেট করুন'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {business.phone ? `ফোন: ${business.phone} • ` : ''}
                    {business.businessAddress ? business.businessAddress.slice(0, 45) + '...' : 'ঠিকানা ও ব্যাংক তথ্য প্রোফাইলে যুক্ত করুন'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>ব্যবসার প্রোফাইল এডিট</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewInvoice}
                  className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ইনভয়েস বানান</span>
                </button>
              </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">সাম্প্রতিক ইনভয়েস তালিকা</h3>
                  <p className="text-xs text-slate-500 mt-0.5">আপনার তৈরি করা সর্বশেষ বিলসমূহ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>সবগুলো দেখুন ({savedInvoicesList.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {savedInvoicesList.length === 0 ? (
                <div className="p-10 text-center text-slate-500 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">এখনো কোনো ইনভয়েস তৈরি করা হয়নি</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    "নতুন ইনভয়েস" বাটনে ক্লিক করে প্রথম চালান তৈরি করুন অথবা ডেমো প্রিভিউ দেখুন।
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCreateNewInvoice}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      প্রথম ইনভয়েস তৈরি করুন
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSampleData}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      নমুনা ডাটা লোড
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                        <th className="py-3 px-4">ইনভয়েস নং</th>
                        <th className="py-3 px-4">গ্রাহক</th>
                        <th className="py-3 px-4">তারিখ</th>
                        <th className="py-3 px-4 text-right">মোট বিল</th>
                        <th className="py-3 px-4 text-right">বকেয়া</th>
                        <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {savedInvoicesList.slice(0, 6).map((inv) => {
                        const calc = calculateInvoice(inv);
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4 font-mono font-bold text-indigo-900">
                              {inv.invoiceNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800">{inv.customer.name || 'গ্রাহক'}</div>
                              {inv.customer.phone && (
                                <div className="text-[10px] text-slate-400">{inv.customer.phone}</div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600">{toBengaliNumerals(inv.invoiceDate)}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                              ৳ {toBengaliNumerals(formatMoney(calc.grandTotal, ''))}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-rose-600 font-mono">
                              ৳ {toBengaliNumerals(formatMoney(calc.dueAmount, ''))}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  calc.isOverdue
                                    ? 'bg-rose-100 text-rose-700'
                                    : inv.paymentStatus === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.paymentStatus === 'partial'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {calc.isOverdue
                                  ? 'বিলম্বিত'
                                  : inv.paymentStatus === 'paid'
                                  ? 'পরিশোধিত'
                                  : inv.paymentStatus === 'partial'
                                  ? 'আংশিক'
                                  : 'বকেয়া'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInvoice(inv);
                                    setActiveTab('create-invoice');
                                    onShowToast(`ইনভয়েস #${inv.invoiceNumber} ওপেন করা হয়েছে!`, '✏️');
                                  }}
                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer"
                                  title="এডিট করুন"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateInvoice(inv)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                  title="ডুপ্লিকেট করুন"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: CREATE INVOICE (EDITOR + LIVE PREVIEW)
           ========================================================================= */}
        {activeTab === 'create-invoice' && (
          <div>
            {/* Mobile View Toggle */}
            <div className="lg:hidden flex items-center justify-center gap-2 p-1.5 bg-slate-200 rounded-2xl mb-4 font-bold text-xs print:hidden">
              <button
                type="button"
                onClick={() => setMobileEditorMode('editor')}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mobileEditorMode === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <span>✏️ ইনভয়েস ফর্ম</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileEditorMode('preview')}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mobileEditorMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <span>👁️ লাইভ প্রিভিউ</span>
              </button>
            </div>

            {/* Top Toolbar Actions for Invoice */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
              <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
                <span className="text-slate-500">টেমপ্লেট (১৫টি):</span>
                <select
                  value={invoice.template}
                  onChange={(e) => {
                    const selected = e.target.value as InvoiceTemplateId;
                    setInvoice((prev) => ({ ...prev, template: selected }));
                    onShowToast(`টেমপ্লেট পরিবর্তিত হয়েছে! 🎨`, '✨');
                  }}
                  className="px-3 py-1.5 rounded-xl border-2 border-indigo-200 bg-indigo-50/70 font-bold text-indigo-950 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-2xs"
                >
                  <optgroup label="🇧🇩 বাংলাদেশি মার্কেট ক্যাশ মেমো (১০টি)">
                    <option value="memo-mobile-point">১. ফাস্ট মোবাইল পয়েন্ট (সায়ান-ব্লু মেমো)</option>
                    <option value="memo-golden-gadhi">২. সানজিতা সোনালী গদি (হলুদ-মেরুন মেমো)</option>
                    <option value="memo-bismillah-store">৩. বিসমিল্লাহ্ ষ্টোর (নীল-হলুদ মেমো)</option>
                    <option value="memo-computer-studio">৪. নাঈম কম্পিউটার কর্নার (রয়্যাল ব্লু মেমো)</option>
                    <option value="memo-enterprise">৫. মেসার্স সিয়াম এন্টারপ্রাইজ (ট্রেডিং মেমো)</option>
                    <option value="memo-it-computer-point">৬. Computer Point (আইটি বিল)</option>
                    <option value="memo-motors">৭. সায়াদ জেনুইন মটরস (অটোমোবাইল মেমো)</option>
                    <option value="memo-furniture-classic">৮. জান্নাত ফার্নিচার (উষ্ণ প্যাস্টেল মেমো)</option>
                    <option value="memo-door-furniture">৯. মদিনা ডোর এন্ড ফার্নিচার (কালারফুল মেমো)</option>
                    <option value="memo-festive-mobile">১০. এমরান মোবাইল (উৎসবমুখর বর্ডার মেমো)</option>
                  </optgroup>
                  <optgroup label="🌐 কর্পোরেট ও অন্যান্য টেমপ্লেট (৫টি)">
                    <option value="bengali">১১. বাংলা বিজনেস মেমো (ট্রেডিশনাল চালান)</option>
                    <option value="classic">১২. Classic (ক্লাসিকাল কর্পোরেট)</option>
                    <option value="modern">১৩. Modern (মডার্ন গ্র্যাডিয়েন্ট)</option>
                    <option value="elegant">১৪. Elegant (লাক্সারি গোল্ডেন)</option>
                    <option value="minimal">১৫. Minimal (কালি সাশ্রয়ী সাদাকালো)</option>
                  </optgroup>
                </select>

                <button
                  type="button"
                  onClick={() => setActiveTab('templates')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1 cursor-pointer text-xs"
                  title="সকল ১৫টি টেমপ্লেট গ্যালারিতে বড় করে দেখুন"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">১৫টি টেমপ্লেট গ্যালারি</span>
                </button>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={handleSaveInvoice}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title="ইনভয়েস ব্রাউজারে সুরক্ষিত রাখুন"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সেভ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="সরাসরি প্রিন্ট বা প্রিন্টার ডায়ালগ ওপেন করুন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPdf('invoice')}
                  disabled={isExportingPdf}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
                  title="A4 সাইজ হাই-কোয়ালিটি PDF ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title="গ্রাহকের নম্বরে সরাসরি হোয়াটসঅ্যাপে পাঠান"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Two Column Layout on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Editor Form */}
              <div
                className={`lg:col-span-5 space-y-6 ${
                  mobileEditorMode === 'preview' ? 'hidden lg:block' : 'block'
                } print:hidden`}
              >
                {/* 1. Invoice Basics Card */}
                <div
                  id="field-inv-section-1"
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs transition"
                >
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>১. চালান ও ইনভয়েস তথ্য</span>
                    </div>
                    {highlightedFieldId?.startsWith('field-inv-') && (
                      <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                        🎯 নির্দেশিত সেকশন
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div id="field-inv-number" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-inv-number' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">ইনভয়েস নম্বর:</label>
                        {highlightedFieldId === 'field-inv-number' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={invoice.invoiceNumber}
                        onChange={(e) => setInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                        placeholder="MSF-INV-0001"
                      />
                    </div>

                    <div id="field-inv-currency" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-inv-currency' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">কারেন্সি / মুদ্রা:</label>
                        {highlightedFieldId === 'field-inv-currency' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <select
                        value={invoice.currency}
                        onChange={(e) => setInvoice((prev) => ({ ...prev, currency: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      >
                        <option value="BDT (৳)">BDT (৳ - টাকা)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                        <option value="INR (₹)">INR (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div id="field-inv-date" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-inv-date' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">চালানের তারিখ:</label>
                        {highlightedFieldId === 'field-inv-date' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <input
                        type="date"
                        value={invoice.invoiceDate}
                        onChange={(e) => setInvoice((prev) => ({ ...prev, invoiceDate: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div id="field-inv-due-date" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-inv-due-date' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">পরিশোধের শেষ সময় (Due):</label>
                        {highlightedFieldId === 'field-inv-due-date' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <input
                        type="date"
                        value={invoice.dueDate}
                        onChange={(e) => setInvoice((prev) => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div id="field-inv-language" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-inv-language' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <label className="block font-bold text-slate-700 mb-1">ভাষা (Language):</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setInvoice((prev) => ({ ...prev, language: 'bn' }))}
                          className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            invoice.language === 'bn' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          বাংলা
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoice((prev) => ({ ...prev, language: 'en' }))}
                          className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            invoice.language === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          English
                        </button>
                      </div>
                    </div>

                    <div id="field-inv-status" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-inv-status' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">পেমেন্ট স্ট্যাটাস:</label>
                        {highlightedFieldId === 'field-inv-status' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <select
                        value={invoice.paymentStatus}
                        onChange={(e) =>
                          setInvoice((prev) => ({ ...prev, paymentStatus: e.target.value as PaymentStatus }))
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      >
                        <option value="unpaid">অপরিশোধিত (Unpaid)</option>
                        <option value="partial">আংশিক জমা (Partially Paid)</option>
                        <option value="paid">সম্পূর্ণ পরিশোধিত (Paid)</option>
                        <option value="overdue">বিলম্বিত (Overdue)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Customer Information Card */}
                <div
                  id="field-cust-section"
                  className={`bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs transition ${
                    highlightedFieldId?.startsWith('field-cust-') ? 'ring-2 ring-indigo-400 bg-indigo-50/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>২. গ্রাহকের বিবরণ (Billed To)</span>
                    </h3>
                    {savedCustomersList.length > 0 && (
                      <select
                        onChange={(e) => e.target.value && handleSelectSavedCustomer(e.target.value)}
                        className="text-[11px] font-bold p-1 border border-slate-300 rounded-lg text-slate-700"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          সংরক্ষিত গ্রাহক বেছে নিন...
                        </option>
                        {savedCustomersList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.companyName ? `(${c.companyName})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div id="field-cust-name" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-cust-name' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">গ্রাহকের নাম: *</label>
                        {highlightedFieldId === 'field-cust-name' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={invoice.customer.name}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            customer: { ...prev.customer, name: e.target.value },
                          }))
                        }
                        placeholder="যেমন: তানভীর আহমেদ"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                      />
                    </div>
                    <div id="field-cust-company" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-cust-company' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">কোম্পানির নাম (ঐচ্ছিক):</label>
                        {highlightedFieldId === 'field-cust-company' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={invoice.customer.companyName}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            customer: { ...prev.customer, companyName: e.target.value },
                          }))
                        }
                        placeholder="যেমন: নেক্সটজেন লিমিটেড"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div id="field-cust-phone" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-cust-phone' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">মোবাইল ফোন:</label>
                        {highlightedFieldId === 'field-cust-phone' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={invoice.customer.phone}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            customer: { ...prev.customer, phone: e.target.value },
                          }))
                        }
                        placeholder="০১৭০০-০০০০০০"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div id="field-cust-email" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-cust-email' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">ইমেইল:</label>
                        {highlightedFieldId === 'field-cust-email' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <input
                        type="email"
                        value={invoice.customer.email}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            customer: { ...prev.customer, email: e.target.value },
                          }))
                        }
                        placeholder="customer@gmail.com"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div id="field-cust-address" className={`p-1.5 rounded-2xl ${highlightedFieldId === 'field-cust-address' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">ঠিকানা:</label>
                      {highlightedFieldId === 'field-cust-address' && (
                        <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                          এডিট করুন ✏️
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={invoice.customer.address}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          customer: { ...prev.customer, address: e.target.value },
                        }))
                      }
                      placeholder="গ্রাহকের সম্পূর্ণ ঠিকানা..."
                      className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveCurrentCustomer}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>এই গ্রাহকের তথ্য ভবিষ্যতে ব্যবহারের জন্য সংরক্ষণ করুন</span>
                  </button>
                </div>

                {/* 3. Items & Services Table Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      <span>৩. পণ্য ও সেবাসমূহ ({invoice.items.length}টি)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>আইটেম যোগ করুন</span>
                    </button>
                  </div>

                  {/* List of items editor */}
                  <div className="space-y-4">
                    {invoice.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 text-xs">
                            #{idx + 1}. আইটেম বা সেবার নাম
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem(item.id)}
                              className="p-1 rounded-md text-slate-500 hover:bg-slate-200 cursor-pointer"
                              title="ডুপ্লিকেট"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer"
                              title="মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div
                          id={`field-item-name-${item.id}`}
                          className={`p-1 rounded-xl transition-all ${
                            highlightedFieldId === `field-item-name-${item.id}` || highlightedFieldId === 'field-item-name'
                              ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-600">আইটেম বা সেবার নাম:</label>
                            {(highlightedFieldId === `field-item-name-${item.id}` || highlightedFieldId === 'field-item-name') && (
                              <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-bounce">
                                এডিট করুন ✏️
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                            placeholder="যেমন: ওয়েবসাইট ডিজাইন / মোবাইল অ্যাপ"
                            className="w-full p-2 rounded-xl border border-slate-300 font-bold text-xs"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                            placeholder="আইটেমের সংক্ষিপ্ত বিবরণ বা নোট..."
                            className="w-full p-2 rounded-xl border border-slate-300 text-xs text-slate-600"
                          />
                        </div>

                        {/* Numeric Fields */}
                        <div className="grid grid-cols-4 gap-2">
                          <div
                            id={`field-item-qty-${item.id}`}
                            className={`p-1 rounded-xl transition-all ${
                              highlightedFieldId === `field-item-qty-${item.id}` || highlightedFieldId === 'field-item-qty'
                                ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-700">পরিমাণ (Qty):</label>
                              {(highlightedFieldId === `field-item-qty-${item.id}` || highlightedFieldId === 'field-item-qty') && (
                                <span className="text-[8px] font-bold bg-rose-600 text-white px-1 py-0.2 rounded-full">
                                  এডিট ✏️
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(item.id, { quantity: Math.max(0, parseFloat(e.target.value) || 0) })
                              }
                              className="w-full p-2 rounded-xl border border-slate-300 font-bold text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">একক (Unit):</label>
                            <select
                              value={item.unit}
                              onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value as UnitType })}
                              className="w-full p-2 rounded-xl border border-slate-300 font-bold text-[11px]"
                            >
                              <option value="piece">Piece (টি)</option>
                              <option value="hour">Hour (ঘণ্টা)</option>
                              <option value="day">Day (দিন)</option>
                              <option value="month">Month (মাস)</option>
                              <option value="kg">Kg (কেজি)</option>
                              <option value="liter">Liter (লিটার)</option>
                              <option value="box">Box (বক্স)</option>
                              <option value="service">Service (সেবা)</option>
                              <option value="custom">Custom</option>
                            </select>
                          </div>

                          <div
                            id={`field-item-price-${item.id}`}
                            className={`p-1 rounded-xl transition-all ${
                              highlightedFieldId === `field-item-price-${item.id}` || highlightedFieldId === 'field-item-price'
                                ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-700">একক দর (Price):</label>
                              {(highlightedFieldId === `field-item-price-${item.id}` || highlightedFieldId === 'field-item-price') && (
                                <span className="text-[8px] font-bold bg-rose-600 text-white px-1 py-0.2 rounded-full">
                                  এডিট ✏️
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(item.id, { unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })
                              }
                              className="w-full p-2 rounded-xl border border-slate-300 font-bold text-xs font-mono"
                            />
                          </div>

                          <div
                            id={`field-item-total-${item.id}`}
                            className={`p-1 rounded-xl transition-all ${
                              highlightedFieldId === `field-item-total-${item.id}` || highlightedFieldId === 'field-item-total'
                                ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300'
                                : ''
                            }`}
                          >
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">মোট (Total):</label>
                            <div className="p-2 bg-slate-200/80 rounded-xl font-bold font-mono text-xs text-right">
                              ৳{formatMoney(item.lineTotal || 0, '')}
                            </div>
                          </div>
                        </div>

                        {/* Line Discounts & Tax */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                          <div
                            id={`field-item-discount-${item.id}`}
                            className={`p-1 rounded-xl transition-all ${
                              highlightedFieldId === `field-item-discount-${item.id}` || highlightedFieldId === 'field-item-discount'
                                ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-700">আইটেম ছাড় (Discount):</label>
                              {(highlightedFieldId === `field-item-discount-${item.id}` || highlightedFieldId === 'field-item-discount') && (
                                <span className="text-[8px] font-bold bg-rose-600 text-white px-1 py-0.2 rounded-full">
                                  এডিট ✏️
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                min="0"
                                value={item.discountValue}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, { discountValue: Math.max(0, parseFloat(e.target.value) || 0) })
                                }
                                className="w-full p-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                                placeholder="0"
                              />
                              <select
                                value={item.discountType}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, { discountType: e.target.value as 'fixed' | 'percent' })
                                }
                                className="p-1.5 rounded-lg border border-slate-300 font-bold text-[11px]"
                              >
                                <option value="fixed">৳ ফিক্সড</option>
                                <option value="percent">% শতাংশ</option>
                              </select>
                            </div>
                          </div>

                          <div
                            id={`field-item-vat-${item.id}`}
                            className={`p-1 rounded-xl transition-all ${
                              highlightedFieldId === `field-item-vat-${item.id}` || highlightedFieldId === 'field-item-vat'
                                ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-700">ভ্যাট / ট্যাক্স (VAT %):</label>
                              {(highlightedFieldId === `field-item-vat-${item.id}` || highlightedFieldId === 'field-item-vat') && (
                                <span className="text-[8px] font-bold bg-rose-600 text-white px-1 py-0.2 rounded-full">
                                  এডিট ✏️
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.vatRate}
                              onChange={(e) =>
                                handleUpdateItem(item.id, { vatRate: Math.max(0, parseFloat(e.target.value) || 0) })
                              }
                              className="w-full p-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                              placeholder="0%"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-700 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন আইটেম যোগ করুন</span>
                  </button>
                </div>

                {/* 4. Invoice Level Discounts, Shipping & Payment */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span>৪. সামগ্রিক ছাড়, ডেলিভারি ও পরিশোধের হিসাব</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      id="field-inv-discount"
                      className={`p-1.5 rounded-2xl transition-all ${
                        highlightedFieldId === 'field-inv-discount' || highlightedFieldId === 'field-calc-discount'
                          ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">বিশেষ সামগ্রিক ছাড় (Discount):</label>
                        {(highlightedFieldId === 'field-inv-discount' || highlightedFieldId === 'field-calc-discount') && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-pulse">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min="0"
                          value={invoice.invoiceDiscountValue}
                          onChange={(e) =>
                            setInvoice((prev) => ({
                              ...prev,
                              invoiceDiscountValue: Math.max(0, parseFloat(e.target.value) || 0),
                            }))
                          }
                          className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                          placeholder="0"
                        />
                        <select
                          value={invoice.invoiceDiscountType}
                          onChange={(e) =>
                            setInvoice((prev) => ({
                              ...prev,
                              invoiceDiscountType: e.target.value as 'fixed' | 'percent',
                            }))
                          }
                          className="p-2 rounded-xl border border-slate-300 font-bold"
                        >
                          <option value="fixed">৳ ফিক্সড</option>
                          <option value="percent">% শতাংশ</option>
                        </select>
                      </div>
                    </div>

                    <div
                      id="field-inv-shipping"
                      className={`p-1.5 rounded-2xl transition-all ${
                        highlightedFieldId === 'field-inv-shipping' || highlightedFieldId === 'field-calc-shipping'
                          ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">ডেলিভারি / অন্যান্য চার্জ (৳):</label>
                        {(highlightedFieldId === 'field-inv-shipping' || highlightedFieldId === 'field-calc-shipping') && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-pulse">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={invoice.shippingCharge}
                        onChange={(e) =>
                          setInvoice((prev) => ({
                            ...prev,
                            shippingCharge: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div
                    id="field-inv-paid-amount"
                    className={`p-2 rounded-2xl transition-all ${
                      highlightedFieldId === 'field-inv-paid-amount' ||
                      highlightedFieldId === 'field-calc-paid' ||
                      highlightedFieldId === 'field-calc-due' ||
                      highlightedFieldId === 'field-calc-grand-total'
                        ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-emerald-800">পরিশোধিত টাকা (Paid Amount ৳):</label>
                      {(highlightedFieldId === 'field-inv-paid-amount' ||
                        highlightedFieldId === 'field-calc-paid' ||
                        highlightedFieldId === 'field-calc-due' ||
                        highlightedFieldId === 'field-calc-grand-total') && (
                        <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-pulse">
                          এডিট করুন ✏️
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={invoice.paidAmount}
                      onChange={(e) =>
                        setInvoice((prev) => ({
                          ...prev,
                          paidAmount: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                      className="w-full p-2.5 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 font-mono font-bold text-emerald-900"
                      placeholder="0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      id="field-inv-terms"
                      className={`p-1.5 rounded-2xl transition-all ${
                        highlightedFieldId === 'field-inv-terms' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">শর্তাবলী (Terms):</label>
                        {highlightedFieldId === 'field-inv-terms' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-pulse">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={invoice.terms}
                        onChange={(e) => setInvoice((prev) => ({ ...prev, terms: e.target.value }))}
                        className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>

                    <div
                      id="field-inv-notes"
                      className={`p-1.5 rounded-2xl transition-all ${
                        highlightedFieldId === 'field-inv-notes' ? 'ring-4 ring-rose-500 bg-rose-50 border border-rose-300 shadow-md' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">বিশেষ নোট (Notes):</label>
                        {highlightedFieldId === 'field-inv-notes' && (
                          <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded-full animate-pulse">
                            এডিট করুন ✏️
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={invoice.notes}
                        onChange={(e) => setInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                        className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Printable Preview */}
              <div
                className={`lg:col-span-7 ${
                  mobileEditorMode === 'editor' ? 'hidden lg:block' : 'block'
                }`}
              >
                <div className="sticky top-24 space-y-3">
                  {/* Interactive Click-to-Edit Guide Banner */}
                  <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/90 rounded-2xl p-2.5 px-3 flex items-center justify-between text-xs text-amber-900 shadow-xs print:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-base animate-pulse">💡</span>
                      <span className="font-semibold text-[11px] sm:text-xs">
                        <strong>ক্লিক-টু-এডিট সুবিধা:</strong> প্রিভিউয়ের যেকোনো লেখা বা ঘরে (পরিমাণ, একক দর, মোট, নাম, ঠিকানা) ক্লিক করলেই সরাসরি সেই এডিট অপশনে ফোকাস হবে!
                      </span>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] bg-amber-200/70 text-amber-950 font-black px-2 py-0.5 rounded-full">
                      Click-to-Edit 🎯
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs px-2 print:hidden">
                    <span className="font-bold text-slate-500">
                      লাইভ A4 পেজ প্রিভিউ ({invoice.template.toUpperCase()})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="text-indigo-600 hover:text-indigo-800 font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>বিবরণী কপি</span>
                      </button>
                    </div>
                  </div>

                  {/* The Document Canvas Container */}
                  <div className="p-2 sm:p-4 bg-slate-300/60 rounded-3xl border border-slate-300 overflow-x-auto shadow-inner print:p-0 print:m-0 print:border-none print:bg-white">
                    <div
                      id="printable-invoice-area"
                      ref={invoicePreviewRef}
                      className="invoice-printable-doc w-full max-w-[800px] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:rounded-none"
                    >
                      {renderInvoiceByTemplate()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CREATE MONEY RECEIPT (মানি রিসিট মেকার)
           ========================================================================= */}
        {activeTab === 'create-receipt' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">মানি রিসিট মেকার (Money Receipt)</h3>
                <p className="text-xs text-slate-500">টাকা প্রাপ্তির প্রাতিষ্ঠানিক রসিদ তৈরি ও প্রিন্ট করুন</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={handleSaveReceipt}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>রিসিট সেভ</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf('receipt')}
                  disabled={isExportingPdf}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                </button>
              </div>
            </div>

            {/* Receipt Form Editor */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">রিসিট নম্বর:</label>
                  <input
                    type="text"
                    value={receipt.receiptNumber}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, receiptNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">রিসিটের তারিখ:</label>
                  <input
                    type="date"
                    value={receipt.receiptDate}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, receiptDate: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মেথড:</label>
                  <select
                    value={receipt.paymentMethod}
                    onChange={(e) =>
                      setReceipt((prev) => ({ ...prev, paymentMethod: e.target.value as PaymentMethod }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="cash">নগদ ক্যাশ (Cash)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                    <option value="bank">ব্যাংক ট্রান্সফার / চেক</option>
                    <option value="card">কার্ড পেমেন্ট (Card)</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">যাঁর নিকট থেকে প্রাপ্ত (গ্রাহকের নাম): *</label>
                  <input
                    type="text"
                    value={receipt.receivedFrom}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, receivedFrom: e.target.value }))}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">গ্রাহকের মোবাইল:</label>
                  <input
                    type="text"
                    value={receipt.customerPhone}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="০১৭০০-০০০০০০"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">প্রাপ্ত টাকার অংক (৳): *</label>
                  <input
                    type="number"
                    min="0"
                    value={receipt.amount}
                    onChange={(e) => {
                      const val = Math.max(0, parseFloat(e.target.value) || 0);
                      setReceipt((prev) => ({
                        ...prev,
                        amount: val,
                        amountInWords: numberToWordsBengali(val),
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl border-2 border-emerald-400 font-mono font-bold text-emerald-950 text-base"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কথায় (স্বয়ংক্রিয় বাংলা রূপান্তর):</label>
                  <input
                    type="text"
                    value={receipt.amountInWords}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, amountInWords: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পেমেন্টের উদ্দেশ্য / বিবরণ:</label>
                  <input
                    type="text"
                    value={receipt.paymentPurpose}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, paymentPurpose: e.target.value }))}
                    placeholder="যেমন: ওয়েবসাইট ডেভেলপমেন্ট বা বকেয়া বিল"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সংশ্লিষ্ট ইনভয়েস নং (যদি থাকে):</label>
                  <input
                    type="text"
                    value={receipt.relatedInvoiceNumber || ''}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, relatedInvoiceNumber: e.target.value }))}
                    placeholder="MSF-INV-0001"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">টাকা গ্রহণকারীর নাম / পদবী:</label>
                  <input
                    type="text"
                    value={receipt.receivedBy}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, receivedBy: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">নোট / ট্রানজেকশন আইডি:</label>
                  <input
                    type="text"
                    value={receipt.notes}
                    onChange={(e) => setReceipt((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="TrxID: 9X82LK4... ইত্যাদি"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Live Receipt Printable Preview */}
            <div className="p-4 bg-slate-300/50 rounded-3xl border border-slate-300 overflow-x-auto shadow-inner">
              <div ref={receiptPreviewRef}>
                <MoneyReceiptView receipt={receipt} business={business} />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SAVED DOCUMENTS (INVOICES & RECEIPTS DASHBOARD)
           ========================================================================= */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            {/* Header & Filter Controls */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:max-w-md relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="ইনভয়েস নং, গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold w-full md:w-auto">
                {['all', 'unpaid', 'partial', 'paid', 'overdue'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl capitalize transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st === 'all'
                      ? 'সকল'
                      : st === 'unpaid'
                      ? 'বকেয়া'
                      : st === 'partial'
                      ? 'আংশিক'
                      : st === 'paid'
                      ? 'পরিশোধিত'
                      : 'বিলম্বিত'}
                  </button>
                ))}
              </div>

              {/* JSON Export & Import */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="সকল ডাটা JSON ফাইল হিসেবে ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ব্যাকআপ নিন</span>
                </button>

                <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>রিস্টোর</span>
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  সংরক্ষিত ইনভয়েসসমূহ ({filteredInvoices.length}টি)
                </h3>
              </div>

              {filteredInvoices.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <p className="font-semibold text-slate-700">কোনো ইনভয়েস পাওয়া যায়নি।</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                        <th className="py-3 px-4">নং</th>
                        <th className="py-3 px-4">গ্রাহকের বিবরণ</th>
                        <th className="py-3 px-4">তারিখ</th>
                        <th className="py-3 px-4">শেষ সময় (Due)</th>
                        <th className="py-3 px-4 text-right">সর্বমোট বিল</th>
                        <th className="py-3 px-4 text-right">বকেয়া</th>
                        <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInvoices.map((inv) => {
                        const calc = calculateInvoice(inv);
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-900">
                              {inv.invoiceNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-800">{inv.customer.name || 'গ্রাহক'}</div>
                              {inv.customer.companyName && (
                                <div className="text-[10px] text-slate-500">{inv.customer.companyName}</div>
                              )}
                              {inv.customer.phone && (
                                <div className="text-[10px] text-slate-400 font-mono">{inv.customer.phone}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">{toBengaliNumerals(inv.invoiceDate)}</td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {inv.dueDate ? toBengaliNumerals(inv.dueDate) : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                              ৳ {toBengaliNumerals(formatMoney(calc.grandTotal, ''))}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-rose-600 font-mono">
                              ৳ {toBengaliNumerals(formatMoney(calc.dueAmount, ''))}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  calc.isOverdue
                                    ? 'bg-rose-100 text-rose-700'
                                    : inv.paymentStatus === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : inv.paymentStatus === 'partial'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {calc.isOverdue
                                  ? 'বিলম্বিত'
                                  : inv.paymentStatus === 'paid'
                                  ? 'পরিশোধিত'
                                  : inv.paymentStatus === 'partial'
                                  ? 'আংশিক'
                                  : 'বকেয়া'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInvoice(inv);
                                    setActiveTab('create-invoice');
                                    onShowToast(`ইনভয়েস #${inv.invoiceNumber} ওপেন হয়েছে`, '✏️');
                                  }}
                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer"
                                  title="ওপেন ও এডিট করুন"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateInvoice(inv)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                  title="ডুপ্লিকেট করুন"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirmId(inv.id);
                                    setReceiptOrInvoiceToDelete('invoice');
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Saved Receipts Section */}
            {savedReceiptsList.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    সংরক্ষিত মানি রিসিটসমূহ ({savedReceiptsList.length}টি)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                        <th className="py-3 px-4">রিসিট নং</th>
                        <th className="py-3 px-4">প্রাপ্তি গ্রাহক</th>
                        <th className="py-3 px-4">তারিখ</th>
                        <th className="py-3 px-4 text-right">টাকার পরিমাণ</th>
                        <th className="py-3 px-4">মাধ্যম</th>
                        <th className="py-3 px-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {savedReceiptsList.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-900">{r.receiptNumber}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{r.receivedFrom}</td>
                          <td className="py-3 px-4 text-slate-600">{toBengaliNumerals(r.receiptDate)}</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-800 font-mono">
                            ৳ {toBengaliNumerals(formatMoney(r.amount, ''))}
                          </td>
                          <td className="py-3 px-4 text-slate-600 capitalize">{r.paymentMethod}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setReceipt(r);
                                  setActiveTab('create-receipt');
                                  onShowToast(`রিসিট #${r.receiptNumber} ওপেন হয়েছে`, '💵');
                                }}
                                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer"
                                title="ওপেন করুন"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmId(r.id);
                                  setReceiptOrInvoiceToDelete('receipt');
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                                title="মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: INVOICE TEMPLATES GALLERY (১৫টি টেমপ্লেট)
           ========================================================================= */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">১৫টি প্রফেশনাল ইনভয়েস ও মেমো টেমপ্লেট</h2>
                  <span className="bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    ১০টি নতুন ক্যাশ মেমো যুক্ত
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  আপনার ব্যবসার ধরন অনুযায়ী যেকোনো একটি টেমপ্লেট নির্বাচন করুন। এক ক্লিকেই প্রিভিউ ও প্রিন্ট লেআউট পরিবর্তিত হবে।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('create-invoice')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>লাইভ ইনভয়েস প্রিভিউ দেখুন</span>
              </button>
            </div>

            {/* Section 1: 10 Bangladeshi Market Cash Memos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  🇧🇩 বাংলাদেশি মার্কেট ক্যাশ মেমো (১০টি ডিজাইন)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    id: 'memo-mobile-point',
                    title: '১. ফাস্ট মোবাইল পয়েন্ট (সায়ান-ব্লু)',
                    desc: 'মোবাইল শো-রুম, গ্যাজেট শপ ও রিপেয়ারিং সার্ভিসের জন্য সায়ান-ব্লু বর্ডার ও ব্র্যান্ড লোগো মেমো।',
                    badge: 'মোবাইল শো-রুম',
                    accent: 'bg-gradient-to-r from-blue-700 to-sky-500 text-white',
                  },
                  {
                    id: 'memo-golden-gadhi',
                    title: '২. সানজিতা সোনালী গদি (হলুদ-মেরুন)',
                    desc: 'গদি ঘর, সোফা, রেক্সিন ও ফার্নিচার ব্যবসার হালকা হলুদ ব্যাকগ্রাউন্ড ও মেরুন হেডার মেমো।',
                    badge: 'ডেকোরেশন ও গদি',
                    accent: 'bg-gradient-to-r from-purple-900 to-rose-700 text-amber-200',
                  },
                  {
                    id: 'memo-bismillah-store',
                    title: '৩. বিসমিল্লাহ্ ষ্টোর (নীল-হলুদ মেমো)',
                    desc: 'জুয়েলারী, কসমেটিক্স, খেলনা ও জেনারেল স্টোরের জন্য লাল ভার্টিক্যাল ব্যাজ ও নীল কার্ভ হেডার।',
                    badge: 'জেনারেল স্টোর',
                    accent: 'bg-gradient-to-r from-blue-800 to-sky-600 text-amber-300',
                  },
                  {
                    id: 'memo-computer-studio',
                    title: '৪. নাঈম কম্পিউটার কর্নার (রয়্যাল ব্লু)',
                    desc: 'আইটি ট্রেনিং, কম্পিউটার কর্নার ও ডিজিটাল স্টুডিওর রয়্যাল ব্লু হেডার ও ওয়েভ কর্নার মেমো।',
                    badge: 'ডিজিটাল স্টুডিও',
                    accent: 'bg-blue-900 text-white',
                  },
                  {
                    id: 'memo-enterprise',
                    title: '৫. মেসার্স সিয়াম এন্টারপ্রাইজ (ট্রেডিং)',
                    desc: 'পাইপ, ফিটিংস, হার্ডওয়্যার ও ট্রেডিং ব্যবসার ১-১৬ ক্রমানুসারে সারি ও গোল্ডেন লেজার মেমো।',
                    badge: 'হোলসেল ও ট্রেডিং',
                    accent: 'bg-amber-600 text-white',
                  },
                  {
                    id: 'memo-it-computer-point',
                    title: '৬. Computer Point (আইটি ও টেক বিল)',
                    desc: 'হার্ডওয়্যার, সফটওয়্যার ও এক্সেসরিজ ব্যবসার লাল-কালো জ্যামিতিক বার ও রেড ফ্রেম বিল।',
                    badge: 'আইটি ও টেক বিল',
                    accent: 'bg-red-600 text-white',
                  },
                  {
                    id: 'memo-motors',
                    title: '৭. সায়াদ জেনুইন মটরস (অটোমোবাইল)',
                    desc: 'মোটরস, পরিবহন ও গাড়ির যন্ত্রাংশ বিক্রেতাদের গাড়ির আইকন হেডার ও সায়ান গ্রিড মেমো।',
                    badge: 'মোটরস ও পার্টস',
                    accent: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-red-800',
                  },
                  {
                    id: 'memo-furniture-classic',
                    title: '৮. জান্নাত ফার্নিচার (উষ্ণ প্যাস্টেল)',
                    desc: 'কাঠশিল্প ও নকশা করা ফার্নিচার ব্যবসার উষ্ণ পিচ টেক্সচার ও ডুয়েল সায়ান-অরেঞ্জ মেমো।',
                    badge: 'কাঠশিল্প ও ফার্নিচার',
                    accent: 'bg-gradient-to-r from-sky-500 to-orange-500 text-white',
                  },
                  {
                    id: 'memo-door-furniture',
                    title: '৯. মদিনা ডোর এন্ড ফার্নিচার (কালারফুল)',
                    desc: 'দেশী-বিদেশী কাঠের দরজা ও চৌকাঠের উডগ্রেন সাইড স্ট্রাইপ ও পিল সামারি মেমো।',
                    badge: 'ডোর ও চৌকাঠ',
                    accent: 'bg-gradient-to-r from-purple-800 to-lime-600 text-white',
                  },
                  {
                    id: 'memo-festive-mobile',
                    title: '১০. এমরান মোবাইল (উৎসবমুখর বর্ডার)',
                    desc: 'সার্ভিসিং ও রিপেয়ারিংয়ের জন্য দুই পাশে আকর্ষণীয় রঙিন ত্রিকোণাকার পার্টি বান্টিং বর্ডার মেমো।',
                    badge: 'কালারফুল বান্টিং বর্ডার',
                    accent: 'bg-gradient-to-r from-red-600 via-yellow-500 to-blue-700 text-white',
                  },
                ].map((t) => (
                  <div
                    key={t.id}
                    className={`bg-white rounded-3xl p-5 border-2 transition shadow-xs flex flex-col justify-between ${
                      invoice.template === t.id
                        ? 'border-indigo-600 ring-4 ring-indigo-100 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {t.badge}
                        </span>
                        {invoice.template === t.id && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            <Check className="w-3.5 h-3.5" />
                            <span>নির্বাচিত</span>
                          </span>
                        )}
                      </div>

                      <div className={`h-14 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm mb-3 px-3 text-center shadow-xs ${t.accent}`}>
                        {t.title}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{t.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setInvoice((prev) => ({ ...prev, template: t.id as InvoiceTemplateId }));
                          setActiveTab('create-invoice');
                          onShowToast(`টেমপ্লেট "${t.title}" সক্রিয় হয়েছে!`, '🎨');
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                          invoice.template === t.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {invoice.template === t.id ? 'এই টেমপ্লেটে ইনভয়েস দেখুন' : 'টেমপ্লেট বেছে নিন'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: 5 Corporate & Original Templates */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  🌐 কর্পোরেট, মডার্ন ও মিনিমাল টেমপ্লেট (৫টি ডিজাইন)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    id: 'bengali',
                    title: '১১. বাংলা বিজনেস মেমো (ট্রেডিশনাল)',
                    desc: 'বাংলাদেশি দোকান, ট্রেডিং, পাইকারি ও খুচরা ব্যবসার জন্য চালানের আদলে তৈরি পূর্ণাঙ্গ বাংলা ক্যাশ মেমো।',
                    badge: 'ট্রেডিশনাল বাংলা',
                    accent: 'bg-emerald-800 text-white',
                  },
                  {
                    id: 'classic',
                    title: '১২. Classic Corporate (কর্পোরেট)',
                    desc: 'কর্পোরেট ও প্রাতিষ্ঠানিক ঐতিহ্যবাহী লেআউট। যেকোনো কোম্পানি ও এজেন্সির জন্য মানানসই।',
                    badge: 'সর্বাধিক জনপ্রিয়',
                    accent: 'bg-slate-900 text-white',
                  },
                  {
                    id: 'modern',
                    title: '১৩. Modern Gradient (মডার্ন)',
                    desc: 'কালারফুল গ্র্যাডিয়েন্ট অ্যাকসেন্ট, আধুনিক টাইপোগ্রাফি ও কার্ড লেআউট। ফ্রিল্যান্সার ও স্টার্টআপের জন্য দারুণ।',
                    badge: 'প্রিমিয়াম স্টাইল',
                    accent: 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white',
                  },
                  {
                    id: 'elegant',
                    title: '১৪. Elegant Luxury (এলিগ্যান্ট)',
                    desc: 'গোল্ডেন ও এমারেল্ড টোন, অভিজাত ক্লায়েন্ট বা লাক্সারি সার্ভিসের ইনভয়েসিংয়ের জন্য উপযোগী।',
                    badge: 'লাক্সারি লুক',
                    accent: 'bg-stone-900 text-amber-300',
                  },
                  {
                    id: 'minimal',
                    title: '১৫. Minimal Clean (কালি সাশ্রয়ী)',
                    desc: 'ইনক-সেভিং ও দ্রুততম প্রিন্ট উপযোগী। সাধারণ সাদাকালো লেজার প্রিন্টারে সবচেয়ে পরিষ্কার আউটপুট দেয়।',
                    badge: 'কালি সাশ্রয়ী',
                    accent: 'bg-white border-2 border-black text-black',
                  },
                ].map((t) => (
                  <div
                    key={t.id}
                    className={`bg-white rounded-3xl p-5 border-2 transition shadow-xs flex flex-col justify-between ${
                      invoice.template === t.id
                        ? 'border-indigo-600 ring-4 ring-indigo-100 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {t.badge}
                        </span>
                        {invoice.template === t.id && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            <Check className="w-3.5 h-3.5" />
                            <span>নির্বাচিত</span>
                          </span>
                        )}
                      </div>

                      <div className={`h-14 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm mb-3 px-3 text-center shadow-xs ${t.accent}`}>
                        {t.title}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{t.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setInvoice((prev) => ({ ...prev, template: t.id as InvoiceTemplateId }));
                          setActiveTab('create-invoice');
                          onShowToast(`টেমপ্লেট "${t.title}" সক্রিয় হয়েছে!`, '🎨');
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                          invoice.template === t.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {invoice.template === t.id ? 'এই টেমপ্লেটে ইনভয়েস দেখুন' : 'টেমপ্লেট বেছে নিন'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: BUSINESS SETTINGS (ব্যবসার প্রোফাইল)
           ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>ব্যবসার প্রোফাইল ও সেটিংস</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                এখানে তথ্যগুলো একবার সংরক্ষণ করলে আপনার তৈরি করা প্রতিটি ইনভয়েস ও মানি রিসিটে এগুলো স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
              </p>
            </div>

            <form onSubmit={handleSaveBusinessSettings} className="space-y-6">
              {/* Logo & Basic Info */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h3 className="font-extrabold text-slate-900 text-sm">১. ব্যবসার সাধারণ তথ্য ও লোগো</h3>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  {business.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt="Business Logo"
                      className="w-20 h-20 object-contain rounded-2xl bg-white border border-slate-200 p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0 text-center p-2">
                      লোগো নেই
                    </div>
                  )}

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <span className="font-bold text-slate-700 block">ব্যবসার লোগো আপলোড করুন:</span>
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>ছবি নির্বাচন করুন (PNG/JPG)</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {business.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setBusiness((prev) => ({ ...prev, logoUrl: null }))}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 block cursor-pointer"
                      >
                        লোগো মুছে ফেলুন
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ব্যবসা বা প্রতিষ্ঠানের নাম: *</label>
                    <input
                      type="text"
                      value={business.businessName}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, businessName: e.target.value }))}
                      required
                      placeholder="The MoSaFa IT Solution"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">স্বত্বাধিকারী / মালিকের নাম:</label>
                    <input
                      type="text"
                      value={business.ownerName}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, ownerName: e.target.value }))}
                      placeholder="মোফাচ্ছির আহমেদ"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ব্যবসার ঠিকানা:</label>
                  <textarea
                    rows={2}
                    value={business.businessAddress}
                    onChange={(e) => setBusiness((prev) => ({ ...prev, businessAddress: e.target.value }))}
                    placeholder="রোড #৪, ধানমন্ডি, ঢাকা..."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মোবাইল ফোন:</label>
                    <input
                      type="text"
                      value={business.phone}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+880 1700-000000"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ইমেইল:</label>
                    <input
                      type="email"
                      value={business.email}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@mosafa.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ওয়েবসাইট:</label>
                    <input
                      type="text"
                      value={business.website}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://themedosafe.blogspot.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ট্রেড লাইসেন্স নম্বর (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      value={business.tradeLicense}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, tradeLicense: e.target.value }))}
                      placeholder="TRAD/DNCC/024851/2024"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">BIN / VAT রেজিস্ট্রেশন নং (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      value={business.binVatNumber}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, binVatNumber: e.target.value }))}
                      placeholder="BIN-002948512-0102"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details (Bank, bKash, Nagad) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h3 className="font-extrabold text-slate-900 text-sm">২. ব্যাংক ও মোবাইল ব্যাংকিং (MFS) তথ্য</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ব্যাংকের নাম:</label>
                    <input
                      type="text"
                      value={business.bankName}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, bankName: e.target.value }))}
                      placeholder="ডাচ-বাংলা ব্যাংক পিএলসি"
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">একাউন্টের নাম:</label>
                    <input
                      type="text"
                      value={business.bankAccountName}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, bankAccountName: e.target.value }))}
                      placeholder="The MoSaFa IT"
                      className="w-full p-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">একাউন্ট নম্বর:</label>
                    <input
                      type="text"
                      value={business.bankAccountNumber}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                      placeholder="115.120.98452"
                      className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-pink-700 mb-1">বিকাশ (bKash) পেমেন্ট নম্বর:</label>
                    <input
                      type="text"
                      value={business.bkashNumber}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, bkashNumber: e.target.value }))}
                      placeholder="01700-000000 (মার্চেন্ট বা পার্সোনাল)"
                      className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-orange-700 mb-1">নগদ (Nagad) পেমেন্ট নম্বর:</label>
                    <input
                      type="text"
                      value={business.nagadNumber}
                      onChange={(e) => setBusiness((prev) => ({ ...prev, nagadNumber: e.target.value }))}
                      placeholder="01700-000000 (পার্সোনাল)"
                      className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Notice Box */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>গোপনীয়তা নিশ্চয়তা:</strong> আপনার ইনভয়েসের যাবতীয় তথ্য এই ডিভাইসের ব্রাউজারে (localStorage) সম্পূর্ণ নিরাপদে সংরক্ষিত থাকে। কোনো বহিরাগত সার্ভারে আপনার গোপন তথ্য পাঠানো হয় না। প্রয়োজনে "ব্যাকআপ নিন" বাটনে ক্লিক করে JSON ফাইল হিসেবে সংরক্ষণ করতে পারেন।
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
                >
                  প্রোফাইল সেটিংস সংরক্ষণ করুন 💾
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">আপনি কি নিশ্চিত?</h3>
              <p className="text-xs text-slate-500 mt-1">
                এই {receiptOrInvoiceToDelete === 'invoice' ? 'ইনভয়েসটি' : 'মানি রিসিটটি'} মুছে ফেললে তা আর ফিরিয়ে আনা যাবে না।
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
