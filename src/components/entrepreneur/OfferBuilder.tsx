import React, { useState } from 'react';
import {
  Package,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Copy,
  DollarSign,
  Tag,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { BusinessProject, BusinessOfferDraft, OfferPackageTier } from '../../types/entrepreneur';

interface OfferBuilderProps {
  project: BusinessProject;
  onUpdateProject: (updater: (prev: BusinessProject) => BusinessProject) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const OfferBuilder: React.FC<OfferBuilderProps> = ({
  project,
  onUpdateProject,
  onShowToast,
}) => {
  const [offerDraft, setOfferDraft] = useState<BusinessOfferDraft>(project.offerDraft);

  const [newBrandIdea, setNewBrandIdea] = useState('');
  const [activeTab, setActiveTab] = useState<'packages' | 'valueprop' | 'guarantee' | 'hooks'>('packages');

  const addBrandIdea = () => {
    if (!newBrandIdea.trim()) return;
    if (!offerDraft.brandNameIdeas.includes(newBrandIdea.trim())) {
      setOfferDraft({
        ...offerDraft,
        brandNameIdeas: [...offerDraft.brandNameIdeas, newBrandIdea.trim()],
      });
      setNewBrandIdea('');
    }
  };

  const updatePackage = (index: number, updatedTier: OfferPackageTier) => {
    const updated = [...offerDraft.packages];
    updated[index] = updatedTier;
    setOfferDraft({ ...offerDraft, packages: updated });
  };

  const addPackageTier = () => {
    const newTier: OfferPackageTier = {
      id: `pkg-${Date.now()}`,
      tierName: 'কাস্টম প্যাকেজ',
      tagline: 'নির্দিষ্ট গ্রাহকের চাহিদার জন্য',
      priceBDT: 3000,
      deliverables: ['প্রধান সুবিধা ১', 'প্রধান সুবিধা ২'],
      deliveryTimeDays: 7,
      revisionsAllowed: '২ বার',
      idealFor: 'নতুন ক্রেতা',
    };
    setOfferDraft({
      ...offerDraft,
      packages: [...offerDraft.packages, newTier],
    });
  };

  const removePackageTier = (index: number) => {
    if (offerDraft.packages.length <= 1) {
      onShowToast('অন্তত একটি প্যাকেজ থাকা আবশ্যক!', '⚠️');
      return;
    }
    const updated = offerDraft.packages.filter((_, i) => i !== index);
    setOfferDraft({ ...offerDraft, packages: updated });
  };

  const handleSaveToProject = () => {
    onUpdateProject((prev) => ({
      ...prev,
      name: offerDraft.selectedBrandName || prev.name,
      offerDraft,
      stage: 'first_offer',
      updatedAt: new Date().toISOString(),
    }));
    onShowToast('অফার ও প্যাকেজ সফলভাবে সেভ হয়েছে! 📦', '✨');
  };

  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    onShowToast(`${label} কপি হয়েছে! 📋`, '📋');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>মডিউল ৫: বিজনেস অফার ও প্যাকেজ বিল্ডার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            এমন একটি অফার তৈরি করুন যা দেখে কাস্টমার না বলতে পারবে না
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            সাধারণ "সার্ভিস দিই" বলা বাদ দিয়ে সুনির্দিষ্ট ফলাফল, ৩টি প্রাইসিং টায়ার (বেসিক/স্ট্যান্ডার্ড/প্রিমিয়াম) ও ১০০% রিস্ক-ফ্রি গ্যারান্টি সাজান।
          </p>
        </div>

        {/* Selected Brand Name & Quick Input */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">নির্বাচিত ব্র্যান্ড বা ব্যবসার নাম:</label>
            <input
              type="text"
              value={offerDraft.selectedBrandName}
              onChange={(e) => setOfferDraft({ ...offerDraft, selectedBrandName: e.target.value })}
              placeholder="যেমন: ব্র্যান্ড বুস্ট বিডি"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">ট্যাগলাইন বা স্লোগান:</label>
            <input
              type="text"
              value={offerDraft.tagline}
              onChange={(e) => setOfferDraft({ ...offerDraft, tagline: e.target.value })}
              placeholder="যেমন: আপনার শপের সোশ্যাল মিডিয়া পার্টনার"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📦 প্রাইসিং ও সার্ভিস প্যাকেজ ({offerDraft.packages.length}টি)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guarantee')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'guarantee'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🛡️ কাস্টমার গ্যারান্টি ও পলিসি
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hooks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'hooks'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🎣 সেলস হুক ও কল টু অ্যাকশন
          </button>
        </div>
      </div>

      {/* Tab 1: Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">সার্ভিস / প্রোডাক্ট প্যাকেজ সমূহ:</span>
            <button
              type="button"
              onClick={addPackageTier}
              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন প্যাকেজ যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offerDraft.packages.map((pkg, idx) => (
              <div
                key={pkg.id || idx}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 relative group"
              >
                {offerDraft.packages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePackageTier(idx)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition"
                    title="প্যাকেজ ডিলিট করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="space-y-3">
                  <input
                    type="text"
                    value={pkg.tierName}
                    onChange={(e) => updatePackage(idx, { ...pkg, tierName: e.target.value })}
                    placeholder="প্যাকেজের নাম"
                    className="font-bold text-slate-900 text-base border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none w-5/6"
                  />

                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-500">৳</span>
                    <input
                      type="number"
                      value={pkg.priceBDT}
                      onChange={(e) => updatePackage(idx, { ...pkg, priceBDT: Number(e.target.value) })}
                      className="font-black text-2xl text-purple-700 border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none w-32"
                    />
                    <span className="text-xs text-slate-400">/ প্যাকেজ</span>
                  </div>

                  <input
                    type="text"
                    value={pkg.tagline}
                    onChange={(e) => updatePackage(idx, { ...pkg, tagline: e.target.value })}
                    placeholder="প্যাকেজ ট্যাগলাইন"
                    className="text-xs text-slate-500 border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none w-full"
                  />

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">কী কী থাকছে (Deliverables):</span>
                    <textarea
                      rows={3}
                      value={pkg.deliverables.join('\n')}
                      onChange={(e) =>
                        updatePackage(idx, {
                          ...pkg,
                          deliverables: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                        })
                      }
                      placeholder="প্রতি লাইনে ১টি করে সুবিধা লিখুন"
                      className="w-full p-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                    <div>
                      <span>ডেলিভারি সময়: </span>
                      <input
                        type="number"
                        value={pkg.deliveryTimeDays}
                        onChange={(e) => updatePackage(idx, { ...pkg, deliveryTimeDays: Number(e.target.value) })}
                        className="w-12 border-b border-slate-300 text-center font-bold text-slate-800"
                      />
                      <span> দিন</span>
                    </div>
                    <div>
                      <span>রিভিশন: </span>
                      <input
                        type="text"
                        value={pkg.revisionsAllowed}
                        onChange={(e) => updatePackage(idx, { ...pkg, revisionsAllowed: e.target.value })}
                        className="w-16 border-b border-slate-300 text-center font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Guarantee */}
      {activeTab === 'guarantee' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>কাস্টমার গ্যারান্টি পলিসি (Risk Reversal)</span>
          </div>
          <p className="text-xs text-slate-500">
            কাস্টমারের মাথায় কেনাকাটার আগে সবসময় ভয় থাকে: "যদি ভালো না হয়?"। একটি সৎ ও স্পষ্ট গ্যারান্টি দিলে বিক্রি ৩ গুণ বেড়ে যায়।
          </p>

          <textarea
            rows={4}
            value={offerDraft.guaranteePolicy}
            onChange={(e) => setOfferDraft({ ...offerDraft, guaranteePolicy: e.target.value })}
            placeholder="যেমন: প্রথম ৭ দিনের মধ্যে কাজের মান পছন্দ না হলে পুরো টাকা বিনা প্রশ্নে ফেরত দেওয়া হবে।"
            className="w-full p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm text-slate-800 bg-slate-50 leading-relaxed font-sans"
          />

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                setOfferDraft({
                  ...offerDraft,
                  guaranteePolicy: '১০০% সন্তুষ্টি গ্যারান্টি: প্রথম ৭ দিনে আমাদের কাজের মান দেখে সন্তুষ্ট না হলে বিনা প্রশ্নে পুরো অগ্রিম ফেরত!',
                })
              }
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
            >
              টাকা ফেরতের নমুনা
            </button>
            <button
              type="button"
              onClick={() =>
                setOfferDraft({
                  ...offerDraft,
                  guaranteePolicy: 'ফ্রি আনলিমিটেড রিভিশন: আপনার মনের মতো নিখুঁত না হওয়া পর্যন্ত আমরা পরিবর্তন ও সংশোধন করে দেব।',
                })
              }
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
            >
              রিভিশন গ্যারান্টির নমুনা
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Sales Hooks & CTA */}
      {activeTab === 'hooks' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <Zap className="w-5 h-5 text-purple-600" />
            <span>আকর্ষণীয় সেলস হুক ও কল টু অ্যাকশন (CTA)</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">৩টি প্রধান সেলস হুক লাইন (সোশ্যাল পোস্ট ও বিজ্ঞাপনে ব্যবহারের জন্য):</label>
            {offerDraft.salesHookLines.map((hook, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                <input
                  type="text"
                  value={hook}
                  onChange={(e) => {
                    const lines = [...offerDraft.salesHookLines];
                    lines[i] = e.target.value;
                    setOfferDraft({ ...offerDraft, salesHookLines: lines });
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => copyText(hook, 'হুক')}
                  className="text-slate-400 hover:text-slate-700 transition"
                  title="কপি করুন"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">কল টু অ্যাকশন (Call to Action):</label>
            <input
              type="text"
              value={offerDraft.callToAction}
              onChange={(e) => setOfferDraft({ ...offerDraft, callToAction: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
            />
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg">
        <div>
          <h4 className="text-xs sm:text-sm font-bold">প্যাকেজ ও অফার তৈরি শেষ?</h4>
          <p className="text-[11px] text-slate-400">এই তথ্যগুলো আপনার মূল প্রজেক্টে যুক্ত করে কাস্টমারদের কাছে পৌঁছান।</p>
        </div>
        <button
          type="button"
          onClick={handleSaveToProject}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>অফার সেভ করুন</span>
        </button>
      </div>
    </div>
  );
};
