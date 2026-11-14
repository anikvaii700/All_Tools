import React, { useEffect, useState } from 'react';
import { Check, CreditCard, Download, Image as ImageIcon, Sparkles, Trash2, Upload, X } from 'lucide-react';
import {
  processShopImageUpload,
  renderVisitingCardDataUrl,
} from '../shopImageUtils';
import { ShopLanguage, VisitingCardMode, VisitingCardTemplateId } from '../types';

export interface VisitingCardStudioProps {
  isOpen: boolean;
  onClose: () => void;
  language: ShopLanguage;
  shopName: string;
  categoryLabel: string;
  tagline: string;
  ownerName: string;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  logoDataUrl?: string;
  accentColor?: string;
  initialMode: VisitingCardMode;
  initialTemplate: VisitingCardTemplateId;
  initialCardDataUrl: string;
  onSaveCard: (result: {
    dataUrl: string;
    mode: VisitingCardMode;
    template: VisitingCardTemplateId;
  }) => Promise<void> | void;
  onRemoveCard?: () => Promise<void> | void;
}

const TEMPLATES: Array<{ id: VisitingCardTemplateId; labelBn: string; labelEn: string; swatch: string }> = [
  { id: 'modern-emerald', labelBn: 'মডার্ন এমারেল্ড', labelEn: 'Modern Emerald', swatch: 'bg-emerald-900 border-emerald-400' },
  { id: 'executive-navy', labelBn: 'এক্সিকিউটিভ নেভি', labelEn: 'Executive Navy', swatch: 'bg-slate-900 border-blue-400' },
  { id: 'royal-gold', labelBn: 'রয়েল গোল্ড', labelEn: 'Royal Gold', swatch: 'bg-stone-900 border-amber-400' },
  { id: 'minimal-clean', labelBn: 'মিনিমাল হোয়াইট', labelEn: 'Minimal Clean', swatch: 'bg-white border-slate-400' },
];

export const VisitingCardStudioModal: React.FC<VisitingCardStudioProps> = ({
  isOpen,
  onClose,
  language,
  shopName,
  categoryLabel,
  tagline,
  ownerName,
  phone,
  email,
  website,
  address,
  logoDataUrl,
  accentColor,
  initialMode,
  initialTemplate,
  initialCardDataUrl,
  onSaveCard,
  onRemoveCard,
}) => {
  const [tab, setTab] = useState<'create' | 'upload'>(
    initialMode === 'uploaded' ? 'upload' : 'create'
  );
  const [template, setTemplate] = useState<VisitingCardTemplateId>(initialTemplate || 'modern-emerald');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>(initialCardDataUrl || '');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string>(
    initialMode === 'uploaded' ? initialCardDataUrl : ''
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (tab === 'create') {
      let active = true;
      renderVisitingCardDataUrl({
        template,
        shopName,
        categoryLabel,
        tagline,
        ownerName,
        phone,
        email,
        website,
        address,
        logoDataUrl,
        accentColor,
      })
        .then((url) => {
          if (active) setPreviewDataUrl(url);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    } else {
      setPreviewDataUrl(uploadedDataUrl);
    }
  }, [
    isOpen,
    tab,
    template,
    shopName,
    categoryLabel,
    tagline,
    ownerName,
    phone,
    email,
    website,
    address,
    logoDataUrl,
    accentColor,
    uploadedDataUrl,
  ]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const { dataUrl } = await processShopImageUpload(file, 'visiting_card');
      setUploadedDataUrl(dataUrl);
      setPreviewDataUrl(dataUrl);
    } catch (err: any) {
      setError(err?.message || 'ভিজিটিং কার্ড আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.href = previewDataUrl;
    link.download = `${(shopName || 'shop').replace(/\s+/g, '_')}_visiting_card.png`;
    link.click();
  };

  const handleConfirmSave = async () => {
    if (!previewDataUrl) {
      setError(
        language === 'en'
          ? 'Please upload an image or generate a card first.'
          : 'অনুগ্রহ করে কার্ড তৈরি করুন অথবা ছবি আপলোড করুন।'
      );
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSaveCard({
        dataUrl: previewDataUrl,
        mode: tab === 'upload' ? 'uploaded' : 'created',
        template,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {language === 'en' ? 'Shop Visiting Card Studio' : 'দোকানের ডিজিটাল ভিজিটিং কার্ড'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'en'
                  ? 'Create from template or upload your existing visiting card'
                  : 'টেমপ্লেট দিয়ে নতুন তৈরি করুন অথবা আপনার কার্ডের ছবি আপলোড করুন'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setTab('create')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                tab === 'create'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'Create Digital Card' : 'নতুন কার্ড তৈরি করুন'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                tab === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'en' ? 'Upload Card Image' : 'কার্ডের ছবি আপলোড'}</span>
            </button>
          </div>

          {tab === 'create' ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700">
                {language === 'en' ? 'Choose Card Design:' : 'ভিজিটিং কার্ডের ডিজাইন বেছে নিন:'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TEMPLATES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTemplate(item.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      template === item.id
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-full h-7 rounded-lg border mb-2 ${item.swatch}`} />
                    <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                      <span>{language === 'en' ? item.labelEn : item.labelBn}</span>
                      {template === item.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-5 text-center cursor-pointer bg-slate-50 transition">
              <ImageIcon className="w-7 h-7 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                {language === 'en'
                  ? 'Click to upload Visiting Card (PNG, JPG, WebP)'
                  : 'আপনার ভিজিটিং কার্ডের ছবি নির্বাচন করুন (PNG, JPG, WebP)'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {language === 'en' ? 'Auto-optimized for dashboard & sharing' : 'অটো অপটিমাইজ হয়ে ড্যাশবোর্ডে সংরক্ষিত হবে'}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          {/* Live Preview */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                {language === 'en' ? 'Live Card Preview' : 'লাইভ ভিজিটিং কার্ড প্রিভিউ'}
              </span>
              {previewDataUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Download PNG' : 'PNG ডাউনলোড'}</span>
                </button>
              )}
            </div>
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Visiting Card Preview"
                className="w-full max-h-64 object-contain rounded-xl shadow-md mx-auto bg-white"
              />
            ) : (
              <div className="h-44 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                {language === 'en' ? 'No visiting card image selected yet' : 'এখনো কোনো কার্ড নির্বাচন করা হয়নি'}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div>
              {onRemoveCard && initialCardDataUrl && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onRemoveCard();
                      onClose();
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Remove Card' : 'কার্ড মুছুন'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleConfirmSave}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{busy ? '...' : language === 'en' ? 'Save Visiting Card' : 'ভিজিটিং কার্ড সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
