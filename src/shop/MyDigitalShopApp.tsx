import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CreditCard,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Truck,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { InvoiceMaker, InvoiceMakerShopBridge } from '../components/InvoiceMaker';
import { BusinessProfile, Customer, Invoice, MoneyReceipt } from '../components/invoice/types';
import { ShopAuthProvider, useShopAuth } from './ShopAuthContext';
import { getShopCategoryConfig } from './shopCategoriesConfig';
import { SHOP_I18N } from './shopI18n';
import { ShopCustomer, ShopInvoice, ShopProduct, ShopReceipt } from './types';
import { useShopData } from './useShopData';
import { ShopAuthAndWizard } from './components/ShopAuthAndWizard';
import { ShopCategoryIcon } from './components/ShopCategoryIcon';
import { ShopDailySalesReportView } from './components/ShopDailySalesReportView';
import { ShopDashboardView } from './components/ShopDashboardView';
import { ShopInventoryView } from './components/ShopInventoryView';
import { LedgerSection, ShopLedgerView } from './components/ShopLedgerView';
import { ShopSettingsView } from './components/ShopSettingsView';
import { ShopSplashScreen } from './components/ShopSplashScreen';
import { VisitingCardStudioModal } from './components/VisitingCardStudioModal';

type ShopWorkspaceTab =
  | 'dashboard'
  | 'inventory'
  | 'cash-memo'
  | 'daily-sales'
  | 'repairs'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'reports'
  | 'settings';

function stripUndefinedDeep<T>(val: T): T {
  if (Array.isArray(val)) {
    return val.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (val && typeof val === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(val as Record<string, any>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return val;
}

interface InnerProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

const MyDigitalShopInner: React.FC<InnerProps> = ({ onBackToHub, onShowToast }) => {
  const {
    shopUser,
    shopProfile,
    shopAssets,
    bootstrapCollections,
    isRestoringSession,
    showSplash,
    dismissSplash,
    triggerSplashPreview,
    language,
    setLanguage,
    updateShopProfile,
    saveShopAsset,
    removeShopAsset,
    logoutShop,
  } = useShopAuth();

  const shopData = useShopData(shopProfile?.shopId, bootstrapCollections);
  const [activeTab, setActiveTab] = useState<ShopWorkspaceTab>('dashboard');
  const [mobileSubSection, setMobileSubSection] = useState<'mobile-default' | ShopWorkspaceTab>('mobile-default');
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [prefillProduct, setPrefillProduct] = useState<ShopProduct | null>(null);

  const mappedBusinessProfile = useMemo<BusinessProfile>(() => {
    if (!shopProfile) {
      return {
        businessName: '',
        subtitle: '',
        ownerName: '',
        phone: '',
        email: '',
        website: '',
        businessAddress: '',
        logoUrl: '',
        tradeLicense: '',
        binVatNumber: '',
        bkashNumber: '',
        nagadNumber: '',
        rocketNumber: '',
        bankName: '',
        bankAccountName: '',
        bankAccountNumber: '',
        bankBranch: '',
        bankRoutingNumber: '',
        defaultCurrency: 'BDT (৳)',
        defaultLanguage: 'bn',
        defaultInvoiceFooter: '',
        religiousHeader: 'বিসমিল্লাহির রাহমানির রাহিম',
        signatureTitle: 'অনুমোদিত স্বাক্ষর',
      };
    }

    return {
      businessName: shopProfile.shopName,
      subtitle: shopProfile.tagline || shopProfile.subtitle || '',
      ownerName: shopProfile.ownerName,
      phone: shopProfile.phone,
      email: shopProfile.email || '',
      website: shopProfile.website || '',
      businessAddress: shopProfile.address || '',
      logoUrl: shopAssets.logoDataUrl || '',
      signatureImage: shopAssets.signatureDataUrl || undefined,
      tradeLicense: shopProfile.tradeLicense || '',
      binVatNumber: shopProfile.binVatNumber || '',
      bkashNumber: shopProfile.bkashNumber || '',
      nagadNumber: shopProfile.nagadNumber || '',
      rocketNumber: shopProfile.rocketNumber || '',
      bankName: shopProfile.bankName || '',
      bankAccountName: shopProfile.bankAccountName || '',
      bankAccountNumber: shopProfile.bankAccountNumber || '',
      bankBranch: '',
      bankRoutingNumber: '',
      defaultCurrency: 'BDT (৳)',
      defaultLanguage: shopProfile.language || 'bn',
      defaultInvoiceFooter: shopProfile.defaultInvoiceFooter || '',
      religiousHeader: shopProfile.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম',
      signatureTitle: shopProfile.signatureTitle || 'অনুমোদিত স্বাক্ষর',
    };
  }, [shopProfile, shopAssets]);

  const catConfig = getShopCategoryConfig(shopProfile?.shopCategory);
  const t = SHOP_I18N[language];

  const shopBridge = useMemo<InvoiceMakerShopBridge | undefined>(() => {
    if (!shopProfile) return undefined;
    return {
      shopId: shopProfile.shopId,
      shopCategory: shopProfile.shopCategory,
      defaultTemplate: shopProfile.defaultTemplate || catConfig.defaultTemplate,
      businessProfile: mappedBusinessProfile,
      invoices: shopData.invoices,
      receipts: shopData.receipts,
      customers: shopData.customers,
      products: shopData.products,
      prefillProduct,
      onClearPrefillProduct: () => setPrefillProduct(null),
      onUpdateBusinessProfile: async (updates: Partial<BusinessProfile>) => {
        if (updates.logoUrl && updates.logoUrl !== shopAssets.logoDataUrl && updates.logoUrl.startsWith('data:image/')) {
          const mime = updates.logoUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
          await saveShopAsset('branding_logo', 'logo', mime, updates.logoUrl).catch(() => {});
        }
        if (updates.signatureImage && updates.signatureImage !== shopAssets.signatureDataUrl && updates.signatureImage.startsWith('data:image/')) {
          await saveShopAsset('branding_sig', 'signature', 'image/png', updates.signatureImage).catch(() => {});
        }
        await updateShopProfile({
          shopName: updates.businessName ?? shopProfile.shopName,
          tagline: updates.subtitle ?? shopProfile.tagline,
          ownerName: updates.ownerName ?? shopProfile.ownerName,
          phone: updates.phone ?? shopProfile.phone,
          email: updates.email ?? shopProfile.email,
          website: updates.website ?? shopProfile.website,
          address: updates.businessAddress ?? shopProfile.address,
          tradeLicense: updates.tradeLicense ?? shopProfile.tradeLicense,
          binVatNumber: updates.binVatNumber ?? shopProfile.binVatNumber,
          bkashNumber: updates.bkashNumber ?? shopProfile.bkashNumber,
          nagadNumber: updates.nagadNumber ?? shopProfile.nagadNumber,
          rocketNumber: updates.rocketNumber ?? shopProfile.rocketNumber,
          bankName: updates.bankName ?? shopProfile.bankName,
          bankAccountName: updates.bankAccountName ?? shopProfile.bankAccountName,
          bankAccountNumber: updates.bankAccountNumber ?? shopProfile.bankAccountNumber,
          defaultInvoiceFooter: updates.defaultInvoiceFooter ?? shopProfile.defaultInvoiceFooter,
          religiousHeader: updates.religiousHeader ?? shopProfile.religiousHeader,
          signatureTitle: updates.signatureTitle ?? shopProfile.signatureTitle,
        }).catch(() => {});
      },
      onSaveInvoice: (inv: Invoice) => {
        const clean = stripUndefinedDeep<ShopInvoice>({
          ...inv,
          shopId: shopProfile.shopId,
          ownerUid: shopProfile.ownerUid,
        });
        shopData.upsertItem<ShopInvoice>('invoices', clean);
      },
      onDeleteInvoice: (id: string) => {
        shopData.deleteItem('invoices', id);
      },
      onSaveReceipt: (rec: MoneyReceipt) => {
        const clean = stripUndefinedDeep<ShopReceipt>({
          ...rec,
          shopId: shopProfile.shopId,
          ownerUid: shopProfile.ownerUid,
        });
        shopData.upsertItem<ShopReceipt>('receipts', clean);
      },
      onDeleteReceipt: (id: string) => {
        shopData.deleteItem('receipts', id);
      },
      onSaveCustomer: (cust: Customer) => {
        const clean = stripUndefinedDeep<ShopCustomer>({
          ...cust,
          shopId: shopProfile.shopId,
          ownerUid: shopProfile.ownerUid,
          updatedAt: new Date().toISOString(),
        });
        shopData.upsertItem<ShopCustomer>('customers', clean);
      },
      hideStandaloneHeader: shopProfile.shopCategory !== 'mobile-shop',
      onOpenShopSection: (sec: string) => {
        if (sec === 'logout') {
          logoutShop();
          return;
        }
        setMobileSubSection(sec as ShopWorkspaceTab);
      },
      onOpenVisitingCard: () => setIsCardModalOpen(true),
      onLogoutShop: () => logoutShop(),
      visitingCardDataUrl: shopAssets.visitingCardDataUrl,
    };
  }, [
    shopProfile,
    shopAssets,
    catConfig.defaultTemplate,
    mappedBusinessProfile,
    shopData,
    prefillProduct,
    saveShopAsset,
    updateShopProfile,
    logoutShop,
  ]);

  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 px-8 py-6 text-center space-y-2 shadow-xs">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">
            {language === 'en' ? 'Restoring your shop session...' : 'আপনার দোকান সেশন লোড হচ্ছে...'}
          </p>
        </div>
      </div>
    );
  }

  if (!shopUser || !shopProfile) {
    return <ShopAuthAndWizard onBackToPortal={onBackToHub} onShowToast={onShowToast} />;
  }

  if (showSplash) {
    return (
      <ShopSplashScreen
        profile={shopProfile}
        logoDataUrl={shopAssets.logoDataUrl}
        language={language}
        onComplete={dismissSplash}
      />
    );
  }

  const handleBillProduct = (product: ShopProduct) => {
    setPrefillProduct(product);
    if (shopProfile.shopCategory === 'mobile-shop') {
      setMobileSubSection('mobile-default');
    } else {
      setActiveTab('cash-memo');
    }
    onShowToast(
      language === 'en' ? `Added "${product.name}" to Cash Memo` : `"${product.name}" ক্যাশ মেমোতে যুক্ত হয়েছে`,
      '🧾'
    );
  };

  const visitingCardModal = (
    <VisitingCardStudioModal
      isOpen={isCardModalOpen}
      onClose={() => setIsCardModalOpen(false)}
      language={language}
      shopName={shopProfile.shopName}
      categoryLabel={language === 'en' ? catConfig.nameEn : catConfig.nameBn}
      tagline={shopProfile.tagline}
      ownerName={shopProfile.ownerName}
      phone={shopProfile.phone}
      email={shopProfile.email}
      website={shopProfile.website}
      address={shopProfile.address}
      logoDataUrl={shopAssets.logoDataUrl}
      accentColor={shopProfile.brandColor}
      initialMode={shopProfile.visitingCardMode}
      initialTemplate={(shopProfile.visitingCardTemplate as any) || 'modern-emerald'}
      initialCardDataUrl={shopAssets.visitingCardDataUrl}
      onSaveCard={async ({ dataUrl, mode, template }) => {
        const mime = dataUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
        await saveShopAsset('branding_card', 'visiting_card', mime, dataUrl, {
          visitingCardMode: mode,
          visitingCardTemplate: template,
        });
        onShowToast(language === 'en' ? 'Visiting Card saved!' : 'ভিজিটিং কার্ড সংরক্ষিত হয়েছে!', '💳');
      }}
      onRemoveCard={async () => {
        await removeShopAsset('branding_card');
        onShowToast(language === 'en' ? 'Visiting Card removed' : 'ভিজিটিং কার্ড মুছে ফেলা হয়েছে', '🗑️');
      }}
    />
  );

  // =========================================================================
  // MANDATORY PRESERVATION: MOBILE SHOP DEFAULT INTERFACE
  // =========================================================================
  if (shopProfile.shopCategory === 'mobile-shop') {
    if (mobileSubSection === 'mobile-default') {
      return (
        <>
          <InvoiceMaker
            key={shopProfile.shopId}
            onBackToHub={onBackToHub}
            onShowToast={onShowToast}
            shopBridge={shopBridge}
          />
          {visitingCardModal}
        </>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSubSection('mobile-default')}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'en' ? 'Back to Mobile Shop Memo' : 'মোবাইল শপ মেইন ড্যাশবোর্ড ও মেমো'}</span>
              </button>
              <div>
                <h1 className="text-sm font-extrabold text-slate-900">{shopProfile.shopName}</h1>
                <p className="text-[11px] text-slate-500">{shopProfile.ownerName} • {shopProfile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold">
              {[
                { id: 'inventory', label: language === 'en' ? 'Stock' : 'স্টক' },
                { id: 'daily-sales', label: language === 'en' ? 'Daily Sales' : 'দৈনিক বিক্রয়' },
                { id: 'repairs', label: language === 'en' ? 'Repairs' : 'সার্ভিসিং' },
                { id: 'customers', label: language === 'en' ? 'Customers' : 'ক্রেতা/বাকি' },
                { id: 'expenses', label: language === 'en' ? 'Expenses' : 'খরচ' },
                { id: 'reports', label: language === 'en' ? 'Reports' : 'রিপোর্ট' },
                { id: 'settings', label: language === 'en' ? 'Settings' : 'সেটিংস' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMobileSubSection(item.id as ShopWorkspaceTab)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                    mobileSubSection === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCardModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
              >
                💳 {t.visitingCard}
              </button>
              <button
                type="button"
                onClick={logoutShop}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 inline mr-1" />
                {t.logout}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1">
          {mobileSubSection === 'inventory' && (
            <ShopInventoryView
              profile={shopProfile}
              data={shopData}
              language={language}
              onShowToast={onShowToast}
              onBillProduct={handleBillProduct}
            />
          )}
          {mobileSubSection === 'daily-sales' && (
            <ShopDailySalesReportView
              profile={shopProfile}
              logoDataUrl={shopAssets.logoDataUrl}
              data={shopData}
              language={language}
              onShowToast={onShowToast}
              onOpenCashMemo={() => setMobileSubSection('mobile-default')}
            />
          )}
          {(mobileSubSection === 'customers' ||
            mobileSubSection === 'suppliers' ||
            mobileSubSection === 'expenses' ||
            mobileSubSection === 'repairs' ||
            mobileSubSection === 'reports') && (
            <ShopLedgerView
              section={mobileSubSection as LedgerSection}
              profile={shopProfile}
              data={shopData}
              language={language}
              onShowToast={onShowToast}
              onOpenDailySales={() => setMobileSubSection('daily-sales')}
            />
          )}
          {mobileSubSection === 'settings' && (
            <ShopSettingsView
              profile={shopProfile}
              language={language}
              onShowToast={onShowToast}
              onOpenVisitingCardModal={() => setIsCardModalOpen(true)}
            />
          )}
        </main>
        {visitingCardModal}
      </div>
    );
  }

  // =========================================================================
  // DYNAMIC SHOP-TYPE CUSTOMIZED WORKSPACE (11 OTHER SHOP CATEGORIES)
  // =========================================================================
  const navItems: Array<{ id: ShopWorkspaceTab; label: string; icon: React.ReactNode; show?: boolean }> = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'inventory', label: t.inventory, icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'cash-memo', label: t.cashMemo, icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: 'daily-sales', label: t.dailySalesReport, icon: <CalendarDays className="w-3.5 h-3.5" /> },
    {
      id: 'repairs',
      label: t.repairs,
      icon: <Wrench className="w-3.5 h-3.5" />,
      show: catConfig.capabilities.supportsRepairs,
    },
    { id: 'customers', label: t.customersAndDue, icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'suppliers', label: t.suppliers, icon: <Truck className="w-3.5 h-3.5" /> },
    { id: 'expenses', label: t.expenses, icon: <Wallet className="w-3.5 h-3.5" /> },
    { id: 'reports', label: t.reports, icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'settings', label: t.settings, icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Branded Workspace Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.backToMainPortal}</span>
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              {shopAssets.logoDataUrl ? (
                <img
                  src={shopAssets.logoDataUrl}
                  alt={shopProfile.shopName}
                  className="w-10 h-10 rounded-xl object-contain border border-slate-200 bg-white p-0.5 shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0"
                  style={{ backgroundColor: shopProfile.brandColor || catConfig.accentColor }}
                >
                  {(shopProfile.shopName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                    {shopProfile.shopName}
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 shrink-0">
                    <ShopCategoryIcon iconName={catConfig.iconName} className="w-3 h-3" />
                    <span>{language === 'en' ? catConfig.nameEn : catConfig.nameBn}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {shopProfile.ownerName} • <span className="font-mono">{shopProfile.phone}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCardModalOpen(true)}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.visitingCard}</span>
            </button>

            <button
              type="button"
              onClick={triggerSplashPreview}
              className="hidden lg:flex px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'en' ? 'Splash' : 'স্প্ল্যাশ'}</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.switchLanguage}</span>
            </button>

            <button
              type="button"
              onClick={logoutShop}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>

        {/* Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 flex items-center gap-1 overflow-x-auto py-1.5 text-xs font-bold scrollbar-none">
          {navItems
            .filter((item) => item.show !== false)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
        </div>
      </header>

      {/* Main Content */}
      {activeTab === 'cash-memo' ? (
        <div className="flex-1">
          <InvoiceMaker
            key={`${shopProfile.shopId}-${shopProfile.shopCategory}`}
            onBackToHub={() => setActiveTab('dashboard')}
            onShowToast={onShowToast}
            shopBridge={shopBridge}
          />
        </div>
      ) : (
        <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1">
          {activeTab === 'dashboard' && (
            <ShopDashboardView
              profile={shopProfile}
              assets={shopAssets}
              data={shopData}
              language={language}
              onNavigateTab={(tab) => setActiveTab(tab as ShopWorkspaceTab)}
              onOpenVisitingCardModal={() => setIsCardModalOpen(true)}
            />
          )}

          {activeTab === 'inventory' && (
            <ShopInventoryView
              profile={shopProfile}
              data={shopData}
              language={language}
              onShowToast={onShowToast}
              onBillProduct={handleBillProduct}
            />
          )}

          {activeTab === 'daily-sales' && (
            <ShopDailySalesReportView
              profile={shopProfile}
              logoDataUrl={shopAssets.logoDataUrl}
              data={shopData}
              language={language}
              onShowToast={onShowToast}
              onOpenCashMemo={() => setActiveTab('cash-memo')}
            />
          )}

          {(activeTab === 'customers' ||
            activeTab === 'suppliers' ||
            activeTab === 'expenses' ||
            activeTab === 'repairs' ||
            activeTab === 'reports') && (
            <ShopLedgerView
              section={activeTab as LedgerSection}
              profile={shopProfile}
              data={shopData}
              language={language}
              onShowToast={onShowToast}
              onOpenDailySales={() => setActiveTab('daily-sales')}
            />
          )}

          {activeTab === 'settings' && (
            <ShopSettingsView
              profile={shopProfile}
              language={language}
              onShowToast={onShowToast}
              onOpenVisitingCardModal={() => setIsCardModalOpen(true)}
            />
          )}
        </main>
      )}

      {visitingCardModal}
    </div>
  );
};

export interface MyDigitalShopAppProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const MyDigitalShopApp: React.FC<MyDigitalShopAppProps> = ({ onBackToHub, onShowToast }) => {
  return (
    <ShopAuthProvider>
      <MyDigitalShopInner onBackToHub={onBackToHub} onShowToast={onShowToast} />
    </ShopAuthProvider>
  );
};
