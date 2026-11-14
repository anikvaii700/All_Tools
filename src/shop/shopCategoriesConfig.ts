import { InvoiceTemplateId } from '../components/invoice/types';
import { ShopCategoryId } from './types';

export interface ProductCustomFieldDef {
  key: string;
  labelBn: string;
  labelEn: string;
  placeholderBn: string;
  placeholderEn: string;
  type?: 'text' | 'select';
  options?: string[];
}

export interface ShopCategoryDefinition {
  id: ShopCategoryId;
  nameBn: string;
  nameEn: string;
  descBn: string;
  descEn: string;
  iconName:
    | 'Smartphone'
    | 'Laptop'
    | 'Cpu'
    | 'Store'
    | 'ShoppingBasket'
    | 'Shirt'
    | 'Sparkles'
    | 'Pill'
    | 'BookOpen'
    | 'Gift'
    | 'Hammer'
    | 'Briefcase';
  accentColor: string;
  defaultTemplate: InvoiceTemplateId;
  terminology: {
    itemLabelBn: string;
    itemLabelEn: string;
    inventoryTitleBn: string;
    inventoryTitleEn: string;
    serviceTitleBn: string;
    serviceTitleEn: string;
  };
  capabilities: {
    usesLegacyMobileShopDefault: boolean;
    supportsImeiOrSerial: boolean;
    supportsRepairs: boolean;
    supportsWarranty: boolean;
    supportsExpiryAndBatch: boolean;
    supportsVariants: boolean;
  };
  defaultUnits: string[];
  presetCategoriesBn: string[];
  presetCategoriesEn: string[];
  customProductFields: ProductCustomFieldDef[];
}

export const SHOP_CATEGORIES: ShopCategoryDefinition[] = [
  {
    id: 'mobile-shop',
    nameBn: 'মোবাইল শপ',
    nameEn: 'Mobile Shop',
    descBn: 'স্মার্টফোন, ফিচার ফোন, IMEI ট্র্যাকিং, সার্ভিসিং ও মোবাইল এক্সেসরিজ ব্যবস্থাপনা।',
    descEn: 'Smartphones, feature phones, IMEI/serial tracking, repair tickets & accessories.',
    iconName: 'Smartphone',
    accentColor: '#059669',
    defaultTemplate: 'memo-mobile-point',
    terminology: {
      itemLabelBn: 'মোবাইল / এক্সেসরিজ',
      itemLabelEn: 'Phone / Accessory',
      inventoryTitleBn: 'মোবাইল ও এক্সেসরিজ স্টক',
      inventoryTitleEn: 'Mobile & Accessories Stock',
      serviceTitleBn: 'মোবাইল সার্ভিসিং / রিপেয়ার',
      serviceTitleEn: 'Mobile Repair & Servicing',
    },
    capabilities: {
      usesLegacyMobileShopDefault: true,
      supportsImeiOrSerial: true,
      supportsRepairs: true,
      supportsWarranty: true,
      supportsExpiryAndBatch: false,
      supportsVariants: true,
    },
    defaultUnits: ['piece', 'box', 'service'],
    presetCategoriesBn: ['স্মার্টফোন', 'ফিচার ফোন', 'চার্জার ও কেবল', 'হেডফোন ও ইয়ারবাড', 'কভার ও গ্লাস', 'ব্যাটারি ও পার্টস'],
    presetCategoriesEn: ['Smartphone', 'Feature Phone', 'Charger & Cable', 'Audio & Earbuds', 'Cover & Glass', 'Battery & Parts'],
    customProductFields: [
      { key: 'imei', labelBn: 'IMEI / সিরিয়াল নম্বর', labelEn: 'IMEI / Serial Number', placeholderBn: 'যেমন: 356938035643809', placeholderEn: 'e.g. 356938035643809' },
      { key: 'ramRom', labelBn: 'RAM / স্টোরেজ', labelEn: 'RAM / Storage', placeholderBn: 'যেমন: 8GB / 128GB', placeholderEn: 'e.g. 8GB / 128GB' },
      { key: 'color', labelBn: 'রং (Color)', labelEn: 'Color', placeholderBn: 'যেমন: মিডনাইট ব্ল্যাক', placeholderEn: 'e.g. Midnight Black' },
      { key: 'condition', labelBn: 'অবস্থা (Official/Used)', labelEn: 'Condition', placeholderBn: 'অফিসিয়াল / আনঅফিসিয়াল / ব্যবহৃত', placeholderEn: 'Official / Unofficial / Used' },
    ],
  },
  {
    id: 'computer-laptop',
    nameBn: 'কম্পিউটার ও ল্যাপটপ শপ',
    nameEn: 'Computer & Laptop Shop',
    descBn: 'ল্যাপটপ, ডেস্কটপ, প্রসেসর-র‍্যাম স্পেক, সিরিয়াল নম্বর, ওয়ারেন্টি ও সার্ভিসিং।',
    descEn: 'Laptops, desktops, CPU/RAM specs, serial numbers, warranty & tech repairs.',
    iconName: 'Laptop',
    accentColor: '#2563eb',
    defaultTemplate: 'memo-computer-studio',
    terminology: {
      itemLabelBn: 'ল্যাপটপ / পার্টস',
      itemLabelEn: 'Laptop / Hardware',
      inventoryTitleBn: 'কম্পিউটার ও পার্টস স্টক',
      inventoryTitleEn: 'Computer & Parts Inventory',
      serviceTitleBn: 'ল্যাপটপ/পিসি সার্ভিসিং',
      serviceTitleEn: 'PC / Laptop Servicing',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: true,
      supportsRepairs: true,
      supportsWarranty: true,
      supportsExpiryAndBatch: false,
      supportsVariants: false,
    },
    defaultUnits: ['piece', 'box', 'service'],
    presetCategoriesBn: ['ল্যাপটপ', 'ডেস্কটপ পিসি', 'মনিটর', 'RAM ও SSD', 'কীবোর্ড ও মাউস', 'প্রিন্টার ও নেটওয়ার্কিং'],
    presetCategoriesEn: ['Laptop', 'Desktop PC', 'Monitor', 'RAM & SSD', 'Keyboard & Mouse', 'Printer & Networking'],
    customProductFields: [
      { key: 'processor', labelBn: 'প্রসেসর (CPU)', labelEn: 'Processor (CPU)', placeholderBn: 'যেমন: Intel Core i5 13th Gen', placeholderEn: 'e.g. Intel Core i5 13th Gen' },
      { key: 'ram', labelBn: 'র‍্যাম (RAM)', labelEn: 'RAM', placeholderBn: 'যেমন: 16GB DDR5', placeholderEn: 'e.g. 16GB DDR5' },
      { key: 'storage', labelBn: 'স্টোরেজ (SSD/HDD)', labelEn: 'Storage (SSD/HDD)', placeholderBn: 'যেমন: 512GB NVMe SSD', placeholderEn: 'e.g. 512GB NVMe SSD' },
      { key: 'serialNumber', labelBn: 'সিরিয়াল নম্বর (S/N)', labelEn: 'Serial Number (S/N)', placeholderBn: 'যেমন: SN-LEN-98421', placeholderEn: 'e.g. SN-LEN-98421' },
    ],
  },
  {
    id: 'electronics',
    nameBn: 'ইলেকট্রনিক্স শপ',
    nameEn: 'Electronics Shop',
    descBn: 'টিভি, ফ্রিজ, এসি, ফ্যান, হোম অ্যাপ্লায়েন্স, ব্র্যান্ড-মডেল, ওয়ারেন্টি ও সিরিয়াল ট্র্যাকিং।',
    descEn: 'TV, fridge, AC, appliances with brand, model, serial number, warranty & repairs.',
    iconName: 'Cpu',
    accentColor: '#0284c7',
    defaultTemplate: 'memo-enterprise',
    terminology: {
      itemLabelBn: 'ইলেকট্রনিক্স পণ্য',
      itemLabelEn: 'Electronic Item',
      inventoryTitleBn: 'ইলেকট্রনিক্স ও হোম অ্যাপ্লায়েন্স স্টক',
      inventoryTitleEn: 'Electronics Stock',
      serviceTitleBn: 'ইলেকট্রনিক্স সার্ভিস ও রিপেয়ার',
      serviceTitleEn: 'Electronics Service & Repair',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: true,
      supportsRepairs: true,
      supportsWarranty: true,
      supportsExpiryAndBatch: false,
      supportsVariants: false,
    },
    defaultUnits: ['piece', 'box', 'service'],
    presetCategoriesBn: ['টেলিভিশন ও অডিও', 'ফ্রিজ ও এসি', 'ফ্যান ও লাইট', 'ব্লেন্ডার ও কিচেন', 'আইপিএস ও ব্যাটারি', 'তার ও এক্সেসরিজ'],
    presetCategoriesEn: ['TV & Audio', 'Fridge & AC', 'Fan & Lighting', 'Kitchen Appliances', 'IPS & Battery', 'Cables & Accessories'],
    customProductFields: [
      { key: 'serialNumber', labelBn: 'সিরিয়াল নম্বর', labelEn: 'Serial Number', placeholderBn: 'যেমন: EL-2025-881', placeholderEn: 'e.g. EL-2025-881' },
      { key: 'powerRating', labelBn: 'ওয়াট / ক্ষমতা', labelEn: 'Wattage / Capacity', placeholderBn: 'যেমন: 1.5 Ton / 750W', placeholderEn: 'e.g. 1.5 Ton / 750W' },
      { key: 'voltage', labelBn: 'ভোল্টেজ / গ্রেড', labelEn: 'Voltage / Spec', placeholderBn: 'যেমন: 220V Inverter', placeholderEn: 'e.g. 220V Inverter' },
    ],
  },
  {
    id: 'general-store',
    nameBn: 'জেনারেল স্টোর / ভ্যারাইটিজ',
    nameEn: 'General Store',
    descBn: 'দৈনন্দিন ব্যবহার্য পণ্য, রিটেইল ও পাইকারি সেলস, বাকি খাতা ও দ্রুত ক্যাশ মেমো।',
    descEn: 'Everyday household goods, retail & wholesale stock, customer due & billing.',
    iconName: 'Store',
    accentColor: '#4f46e5',
    defaultTemplate: 'memo-bismillah-store',
    terminology: {
      itemLabelBn: 'দোকানের পণ্য',
      itemLabelEn: 'Store Item',
      inventoryTitleBn: 'জেনারেল স্টোর মালামাল তালিকা',
      inventoryTitleEn: 'General Store Inventory',
      serviceTitleBn: 'অর্ডার / ডেলিভারি',
      serviceTitleEn: 'Orders & Notes',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: false,
      supportsRepairs: false,
      supportsWarranty: false,
      supportsExpiryAndBatch: true,
      supportsVariants: false,
    },
    defaultUnits: ['piece', 'box', 'kg', 'liter'],
    presetCategoriesBn: ['পানীয় ও স্ন্যাকস', 'সাবান ও ডিটারজেন্ট', 'পার্সোনাল কেয়ার', 'শিশু খাদ্য ও পণ্য', 'গৃহস্থালী সামগ্রী', 'প্যাকেটজাত পণ্য'],
    presetCategoriesEn: ['Beverages & Snacks', 'Soap & Detergent', 'Personal Care', 'Baby Items', 'Household', 'Packaged Goods'],
    customProductFields: [
      { key: 'packSize', labelBn: 'প্যাক সাইজ / ওজন', labelEn: 'Pack Size / Weight', placeholderBn: 'যেমন: ৫০০ গ্রাম / ১ লিটার', placeholderEn: 'e.g. 500g / 1L' },
      { key: 'shelfRack', labelBn: 'তাক / র‍্যাক নম্বর', labelEn: 'Shelf / Rack', placeholderBn: 'যেমন: র‍্যাক B-3', placeholderEn: 'e.g. Rack B-3' },
    ],
  },
  {
    id: 'grocery',
    nameBn: 'মুদি ও গ্রোসারি শপ',
    nameEn: 'Grocery Shop',
    descBn: 'চাল, ডাল, তেল, মশলা, ওজন-ভিত্তিক ও প্যাকেট পণ্য, মেয়াদ ও স্টক সতর্কতা।',
    descEn: 'Rice, oil, spices, weight & pack-based units, expiry date tracking & alerts.',
    iconName: 'ShoppingBasket',
    accentColor: '#16a34a',
    defaultTemplate: 'memo-bismillah-store',
    terminology: {
      itemLabelBn: 'মুদি পণ্য',
      itemLabelEn: 'Grocery Item',
      inventoryTitleBn: 'মুদি ও খাদ্যপণ্য স্টক',
      inventoryTitleEn: 'Grocery Stock & Expiry',
      serviceTitleBn: 'হোম ডেলিভারি নোট',
      serviceTitleEn: 'Delivery Notes',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: false,
      supportsRepairs: false,
      supportsWarranty: false,
      supportsExpiryAndBatch: true,
      supportsVariants: false,
    },
    defaultUnits: ['kg', 'liter', 'piece', 'box'],
    presetCategoriesBn: ['চাল ও আটা', 'ভোজ্য তেল ও ঘি', 'ডাল ও ছোলা', 'মসলা ও লবণ', 'চিনি ও চা-কফি', 'দুধ ও বেকারি'],
    presetCategoriesEn: ['Rice & Flour', 'Cooking Oil', 'Lentils & Pulses', 'Spices & Salt', 'Sugar & Tea', 'Dairy & Bakery'],
    customProductFields: [
      { key: 'netWeight', labelBn: 'পরিমাণ / ওজন', labelEn: 'Net Weight / Volume', placeholderBn: 'যেমন: ১ কেজি / ৫ লিটার', placeholderEn: 'e.g. 1 Kg / 5 Liter' },
      { key: 'origin', labelBn: 'উৎস / ধরণ', labelEn: 'Origin / Grade', placeholderBn: 'যেমন: দেশি প্রিমিয়াম', placeholderEn: 'e.g. Local Premium' },
    ],
  },
  {
    id: 'clothing-fashion',
    nameBn: 'ক্লথিং ও ফ্যাশন হাউস',
    nameEn: 'Clothing & Fashion Shop',
    descBn: 'জামা-কাপড়, পাঞ্জাবি, শাড়ি, সাইজ, রং, ডিজাইন কোড ও ভ্যারিয়েন্ট স্টক।',
    descEn: 'Apparel, fashion wear, size/color/design variants & seasonal stock.',
    iconName: 'Shirt',
    accentColor: '#db2777',
    defaultTemplate: 'memo-golden-gadhi',
    terminology: {
      itemLabelBn: 'পোশাক ও ফ্যাশন',
      itemLabelEn: 'Apparel Item',
      inventoryTitleBn: 'পোশাক ও ভ্যারিয়েন্ট স্টক',
      inventoryTitleEn: 'Apparel & Variants Stock',
      serviceTitleBn: 'টেইলারিং / অল্টারেশন',
      serviceTitleEn: 'Alteration / Tailoring',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: false,
      supportsRepairs: false,
      supportsWarranty: false,
      supportsExpiryAndBatch: false,
      supportsVariants: true,
    },
    defaultUnits: ['piece', 'box'],
    presetCategoriesBn: ['শার্ট ও টি-শার্ট', 'পাঞ্জাবি ও পায়জামা', 'শাড়ি ও থ্রি-পিস', 'জিন্স ও ট্রাউজার', 'শিশুদের পোশাক', 'জুতা ও বেল্ট'],
    presetCategoriesEn: ['Shirts & T-Shirts', 'Panjabi & Ethnic', 'Saree & Three-Piece', 'Denim & Trousers', 'Kids Wear', 'Footwear & Belts'],
    customProductFields: [
      { key: 'size', labelBn: 'সাইজ (Size)', labelEn: 'Size', placeholderBn: 'যেমন: S / M / L / XL / 42', placeholderEn: 'e.g. S / M / L / XL / 42' },
      { key: 'color', labelBn: 'রং (Color)', labelEn: 'Color', placeholderBn: 'যেমন: নেভি ব্লু / মেরুন', placeholderEn: 'e.g. Navy Blue / Maroon' },
      { key: 'fabric', labelBn: 'কাপড় / ডিজাইন', labelEn: 'Fabric / Design', placeholderBn: 'যেমন: ১০০% কটন স্লিম ফিট', placeholderEn: 'e.g. 100% Cotton Slim Fit' },
    ],
  },
  {
    id: 'cosmetics-beauty',
    nameBn: 'কসমেটিকস ও বিউটি শপ',
    nameEn: 'Cosmetics & Beauty Shop',
    descBn: 'স্কিনকেয়ার, মেকআপ, পারফিউম, শেড নম্বর, ব্যাচ ও এক্সপায়ারি ডেট ম্যানেজমেন্ট।',
    descEn: 'Skincare, makeup, fragrance, shade variants, batch & expiry monitoring.',
    iconName: 'Sparkles',
    accentColor: '#9333ea',
    defaultTemplate: 'elegant',
    terminology: {
      itemLabelBn: 'কসমেটিকস পণ্য',
      itemLabelEn: 'Beauty Product',
      inventoryTitleBn: 'কসমেটিকস ও শেড ইনভেন্টরি',
      inventoryTitleEn: 'Cosmetics & Shade Inventory',
      serviceTitleBn: 'সাজেশন / অর্ডার',
      serviceTitleEn: 'Customer Orders',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: false,
      supportsRepairs: false,
      supportsWarranty: false,
      supportsExpiryAndBatch: true,
      supportsVariants: true,
    },
    defaultUnits: ['piece', 'box'],
    presetCategoriesBn: ['স্কিন কেয়ার', 'মেকআপ ও লিপস্টিক', 'পারফিউম ও বডি স্প্রে', 'হেয়ার কেয়ার', 'হ্যান্ডব্যাগ ও পার্স', 'বিউটি টুলস'],
    presetCategoriesEn: ['Skin Care', 'Makeup & Lipsticks', 'Perfume & Mist', 'Hair Care', 'Handbags', 'Beauty Tools'],
    customProductFields: [
      { key: 'shade', labelBn: 'শেড / ফ্লেভার', labelEn: 'Shade / Fragrance', placeholderBn: 'যেমন: Rose Nude 04', placeholderEn: 'e.g. Rose Nude 04' },
      { key: 'volume', labelBn: 'পরিমাণ (ml/gm)', labelEn: 'Volume (ml/gm)', placeholderBn: 'যেমন: 100ml', placeholderEn: 'e.g. 100ml' },
    ],
  },
  {
    id: 'pharmacy',
    nameBn: 'ফার্মেসি / ওষুধের দোকান',
    nameEn: 'Pharmacy',
    descBn: 'ওষুধ, জেনেরিক নাম, ব্যাচ নম্বর, এক্সপায়ারি ডেট সতর্কতা ও স্বাস্থ্যপণ্য বিক্রয়।',
    descEn: 'Medicines, generic names, batch numbers, expiry date alerts & surgical items.',
    iconName: 'Pill',
    accentColor: '#0d9488',
    defaultTemplate: 'modern',
    terminology: {
      itemLabelBn: 'ওষুধ / মেডিকেল পণ্য',
      itemLabelEn: 'Medicine / Item',
      inventoryTitleBn: 'ওষুধ, ব্যাচ ও মেয়াদ স্টক',
      inventoryTitleEn: 'Medicine, Batch & Expiry Stock',
      serviceTitleBn: 'প্রেসক্রিপশন / অর্ডার',
      serviceTitleEn: 'Prescription Orders',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: false,
      supportsRepairs: false,
      supportsWarranty: false,
      supportsExpiryAndBatch: true,
      supportsVariants: false,
    },
    defaultUnits: ['piece', 'box'],
    presetCategoriesBn: ['ট্যাবলেট ও ক্যাপসুল', 'সিরাপ ও সাসপেনশন', 'ইনজেকশন ও ইনহেলার', 'মলম ও ক্রিম', 'সার্জিক্যাল ও ডিভাইস', 'শিশু ও হেলথ কেয়ার'],
    presetCategoriesEn: ['Tablets & Capsules', 'Syrups', 'Injections & Inhalers', 'Ointments', 'Surgical & Devices', 'Baby & Healthcare'],
    customProductFields: [
      { key: 'genericName', labelBn: 'জেনেরিক নাম (Generic)', labelEn: 'Generic Name', placeholderBn: 'যেমন: Paracetamol 500mg', placeholderEn: 'e.g. Paracetamol 500mg' },
      { key: 'dosageForm', labelBn: 'ডোজ / প্যাক ধরণ', labelEn: 'Dosage / Pack', placeholderBn: 'যেমন: ১০ পিস পাতা / ১০০ মি.লি.', placeholderEn: 'e.g. 10 Tabs Strip / 100ml' },
      { key: 'rackLocation', labelBn: 'শেলফ / র‍্যাক', labelEn: 'Shelf Location', placeholderBn: 'যেমন: র‍্যাক A-2', placeholderEn: 'e.g. Shelf A-2' },
    ],
  },
  {
    id: 'stationery-book',
    nameBn: 'বই ও স্টেশনারি শপ',
    nameEn: 'Stationery & Book Shop',
    descBn: 'বই, লেখক-প্রকাশনী, খাতা, কলম, অফিস সাপ্লাই ও প্রিন্ট-ফটোকপি হিসাব।',
    descEn: 'Books, author/publisher info, notebooks, office supplies & print services.',
    iconName: 'BookOpen',
    accentColor: '#d97706',
    defaultTemplate: 'bengali',
    terminology: {
      itemLabelBn: 'বই / স্টেশনারি পণ্য',
      itemLabelEn: 'Book / Stationery',
      inventoryTitleBn: 'বই ও স্টেশনারি ইনভেন্টরি',
      inventoryTitleEn: 'Books & Stationery Stock',
      serviceTitleBn: 'প্রিন্ট ও অর্ডার নোট',
      serviceTitleEn: 'Print & Special Orders',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: false,
      supportsRepairs: false,
      supportsWarranty: false,
      supportsExpiryAndBatch: false,
      supportsVariants: false,
    },
    defaultUnits: ['piece', 'box', 'service'],
    presetCategoriesBn: ['পাঠ্য ও গাইড বই', 'গল্প ও উপন্যাস', 'খাতা ও ডায়েরি', 'কলম ও পেন্সিল', 'আর্ট ও ড্রয়িং', 'অফিস স্টেশনারি'],
    presetCategoriesEn: ['Academic & Guides', 'Fiction & Literature', 'Notebooks & Diaries', 'Pens & Pencils', 'Art Supplies', 'Office Stationery'],
    customProductFields: [
      { key: 'authorPublisher', labelBn: 'লেখক / প্রকাশনী', labelEn: 'Author / Publisher', placeholderBn: 'যেমন: হুমায়ূন আহমেদ / অন্যপ্রকাশ', placeholderEn: 'e.g. Author / Publisher' },
      { key: 'editionIsbn', labelBn: 'সংস্করণ / ISBN', labelEn: 'Edition / ISBN', placeholderBn: 'যেমন: ২০২৬ সংস্করণ', placeholderEn: 'e.g. 2026 Edition' },
    ],
  },
  {
    id: 'gift-accessories',
    nameBn: 'গিফট ও এক্সেসরিজ শপ',
    nameEn: 'Gift & Accessories Shop',
    descBn: 'গিফট বক্স, ঘড়ি, চশমা, গহনা, শো-পিস, খেলনা ও কাস্টম গিফট প্যাক।',
    descEn: 'Gift boxes, watches, sunglasses, jewelry, showpieces & custom hampers.',
    iconName: 'Gift',
    accentColor: '#e11d48',
    defaultTemplate: 'memo-golden-gadhi',
    terminology: {
      itemLabelBn: 'গিফট ও এক্সেসরিজ',
      itemLabelEn: 'Gift / Accessory',
      inventoryTitleBn: 'গিফট ও এক্সেসরিজ কালেকশন',
      inventoryTitleEn: 'Gifts & Accessories Stock',
      serviceTitleBn: 'গিফট র‍্যাপিং ও অর্ডার',
      serviceTitleEn: 'Custom Gift Orders',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: false,
      supportsRepairs: false,
      supportsWarranty: true,
      supportsExpiryAndBatch: false,
      supportsVariants: true,
    },
    defaultUnits: ['piece', 'box'],
    presetCategoriesBn: ['গিফট হ্যাম্পার', 'হাতঘড়ি ও সানগ্লাস', 'অলংকার ও জুয়েলারি', 'শো-পিস ও ফ্লাওয়ার', 'শিশুদের খেলনা', 'কার্ড ও র‍্যাপিং'],
    presetCategoriesEn: ['Gift Hampers', 'Watches & Eyewear', 'Jewelry', 'Showpieces', 'Toys', 'Cards & Wrapping'],
    customProductFields: [
      { key: 'occasion', labelBn: 'উপলক্ষ / ধরণ', labelEn: 'Occasion / Style', placeholderBn: 'যেমন: জন্মদিন / বিয়ে / কাপল সেট', placeholderEn: 'e.g. Birthday / Wedding / Couple Set' },
      { key: 'colorMaterial', labelBn: 'রং / উপাদান', labelEn: 'Color / Material', placeholderBn: 'যেমন: গোল্ডেন স্টেইনলেস', placeholderEn: 'e.g. Golden Stainless' },
    ],
  },
  {
    id: 'hardware-building',
    nameBn: 'হার্ডওয়্যার ও বিল্ডিং ম্যাটেরিয়ালস',
    nameEn: 'Hardware & Building Materials',
    descBn: 'রড, সিমেন্ট, রঙ, পাইপ-ফিটিংস, টুলস, স্যানিটারি ও বাল্ক ইনভেন্টরি।',
    descEn: 'Rods, cement, paint, plumbing, tools, sanitary items & bulk unit billing.',
    iconName: 'Hammer',
    accentColor: '#475569',
    defaultTemplate: 'memo-furniture-classic',
    terminology: {
      itemLabelBn: 'হার্ডওয়্যার ও নির্মাণ সামগ্রী',
      itemLabelEn: 'Hardware / Material',
      inventoryTitleBn: 'হার্ডওয়্যার ও নির্মাণ সামগ্রী স্টক',
      inventoryTitleEn: 'Hardware & Materials Stock',
      serviceTitleBn: 'ডেলিভারি / সাইট অর্ডার',
      serviceTitleEn: 'Site Deliveries',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: false,
      supportsRepairs: false,
      supportsWarranty: true,
      supportsExpiryAndBatch: false,
      supportsVariants: false,
    },
    defaultUnits: ['piece', 'kg', 'liter', 'box', 'custom'],
    presetCategoriesBn: ['রড ও সিমেন্ট', 'রং ও ব্রাশ', 'পাইপ ও স্যানিটারি', 'ইলেকট্রিক্যাল সামগ্রী', 'হ্যান্ড ও পাওয়ার টুলস', 'নাট-বোল্ট ও লক'],
    presetCategoriesEn: ['Rod & Cement', 'Paints & Brushes', 'Pipes & Sanitary', 'Electricals', 'Hand & Power Tools', 'Fasteners & Locks'],
    customProductFields: [
      { key: 'sizeGauge', labelBn: 'সাইজ / গেজ / গ্রেড', labelEn: 'Size / Gauge / Grade', placeholderBn: 'যেমন: ১০ মি.মি. / ২ ইঞ্চি', placeholderEn: 'e.g. 10mm / 2 Inch' },
      { key: 'shadeSpec', labelBn: 'কালার কোড / স্পেক', labelEn: 'Shade / Spec', placeholderBn: 'যেমন: অফ-হোয়াইট ৫০০', placeholderEn: 'e.g. Off-White 500' },
    ],
  },
  {
    id: 'other-shop',
    nameBn: 'অন্যান্য ব্যবসা / কাস্টম শপ',
    nameEn: 'Other Shop',
    descBn: 'ফার্নিচার, মোটরস, টেইলার্স, সেলুন, স্টুডিও বা যেকোনো ব্যবসার ফ্লেক্সিবল ম্যানেজমেন্ট।',
    descEn: 'Flexible shop suite for furniture, motors, tailoring, studio or custom retail.',
    iconName: 'Briefcase',
    accentColor: '#0f172a',
    defaultTemplate: 'classic',
    terminology: {
      itemLabelBn: 'পণ্য বা সেবা',
      itemLabelEn: 'Product / Service',
      inventoryTitleBn: 'পণ্য ও সেবা তালিকা',
      inventoryTitleEn: 'Products & Services',
      serviceTitleBn: 'কাস্টম অর্ডার / সার্ভিস',
      serviceTitleEn: 'Orders & Services',
    },
    capabilities: {
      usesLegacyMobileShopDefault: false,
      supportsImeiOrSerial: true,
      supportsRepairs: true,
      supportsWarranty: true,
      supportsExpiryAndBatch: false,
      supportsVariants: true,
    },
    defaultUnits: ['piece', 'service', 'box', 'kg', 'custom'],
    presetCategoriesBn: ['মূল পণ্য', 'কাস্টম অর্ডার', 'সার্ভিস চার্জ', 'এক্সেসরিজ'],
    presetCategoriesEn: ['Main Products', 'Custom Orders', 'Service Charge', 'Accessories'],
    customProductFields: [
      { key: 'specification', labelBn: 'বিবরণ / স্পেসিফিকেশন', labelEn: 'Specification', placeholderBn: 'পণ্য বা সেবার বিশেষ তথ্য', placeholderEn: 'Special details or spec' },
    ],
  },
];

export function getShopCategoryConfig(categoryId?: string | null): ShopCategoryDefinition {
  const found = SHOP_CATEGORIES.find((c) => c.id === categoryId);
  return found || SHOP_CATEGORIES[0];
}
