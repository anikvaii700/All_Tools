import React, { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { getShopCategoryConfig } from '../shopCategoriesConfig';
import { ShopLanguage, ShopProfile } from '../types';
import { SHOP_I18N } from '../shopI18n';
import { ShopCategoryIcon } from './ShopCategoryIcon';

interface ShopSplashScreenProps {
  profile: ShopProfile;
  logoDataUrl: string;
  language: ShopLanguage;
  onComplete: () => void;
}

export const ShopSplashScreen: React.FC<ShopSplashScreenProps> = ({
  profile,
  logoDataUrl,
  language,
  onComplete,
}) => {
  const [progress, setProgress] = useState(18);
  const category = getShopCategoryConfig(profile.shopCategory);
  const t = SHOP_I18N[language];
  const accent = profile.brandColor || category.accentColor || '#059669';
  const monogram = (profile.shopName || 'S').trim().charAt(0).toUpperCase();

  useEffect(() => {
    const step1 = setTimeout(() => setProgress(65), 250);
    const step2 = setTimeout(() => setProgress(100), 750);
    const autoDone = setTimeout(() => onComplete(), 1650);
    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(autoDone);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center space-y-6 relative overflow-hidden">
        <div
          className="h-2 w-full absolute top-0 left-0"
          style={{ backgroundColor: accent }}
        />

        {/* Dynamic Shop Logo or Monogram */}
        <div className="pt-2 flex justify-center">
          {logoDataUrl ? (
            <div className="w-24 h-24 rounded-2xl border border-slate-200 bg-white shadow-sm p-2 flex items-center justify-center overflow-hidden">
              <img
                src={logoDataUrl}
                alt={profile.shopName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-24 h-24 rounded-2xl shadow-sm flex items-center justify-center text-white text-4xl font-black"
              style={{ backgroundColor: accent }}
            >
              {monogram}
            </div>
          )}
        </div>

        {/* Category & Shop Name */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <ShopCategoryIcon iconName={category.iconName} className="w-3.5 h-3.5" />
            <span>{language === 'en' ? category.nameEn : category.nameBn}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {profile.shopName}
          </h1>

          {profile.tagline && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {profile.tagline}
            </p>
          )}
        </div>

        {/* Shop Contact Preview */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-3.5 text-xs text-slate-600 space-y-1.5 text-left">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profile.ownerName}</span>
          </div>
          {profile.phone && (
            <div className="flex items-center gap-2 font-mono">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{profile.address}</span>
            </div>
          )}
        </div>

        {/* Dynamic Loading Bar */}
        <div className="space-y-2">
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: accent }}
            />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {language === 'en'
              ? 'Loading your shop workspace...'
              : 'আপনার দোকানের ড্যাশবোর্ড প্রস্তুত হচ্ছে...'}
          </p>
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer hover:opacity-95 active:scale-[0.99]"
          style={{ backgroundColor: accent }}
        >
          <span>{t.enterShop}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
