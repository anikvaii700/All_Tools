import React, { useState } from 'react';
import { FormField, FormFieldType, FormTemplate } from './types';
import { Plus, Trash2, ArrowUp, ArrowDown, X, Sparkles, Check } from 'lucide-react';

interface CustomFormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomTemplate: (template: FormTemplate) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const CustomFormBuilderModal: React.FC<CustomFormBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomTemplate,
  onShowToast,
}) => {
  const [formName, setFormName] = useState('আমার কাস্টম ফরম');
  const [formTagline, setFormTagline] = useState('ব্যবহারকারীর তৈরি নিজস্ব ফরম');
  const [category, setCategory] = useState<'housing' | 'personal' | 'business' | 'education' | 'custom'>('custom');
  const [fields, setFields] = useState<FormField[]>([
    { name: 'fullName', label: 'পূর্ণ নাম', type: 'text', required: true, gridSpan: 1 },
    { name: 'mobile', label: 'মোবাইল নম্বর', type: 'tel', required: true, gridSpan: 1 },
    { name: 'date', label: 'তারিখ', type: 'date', required: true, gridSpan: 1 },
    { name: 'details', label: 'বিস্তারিত বিবরণ', type: 'textarea', required: false, gridSpan: 2 },
  ]);

  // New field creator state
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<FormFieldType>('text');
  const [newRequired, setNewRequired] = useState(false);
  const [newOptionsText, setNewOptionsText] = useState('');
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setInlineFeedback(msg);
    setTimeout(() => {
      setInlineFeedback(null);
    }, 3000);
  };

  const handleAddField = () => {
    const defaultLabelMap: Record<string, string> = {
      text: 'নতুন তথ্য',
      number: 'সংখ্যা / পরিমাণ',
      money: 'টাকার পরিমাণ (৳)',
      date: 'তারিখ',
      tel: 'মোবাইল নম্বর',
      textarea: 'বিস্তারিত বিবরণ',
      select: 'নির্বাচন অপশন',
      checkbox: 'শর্তাবলী মেনে চলছি',
      image: 'ছবি আপলোড',
    };

    const finalLabel = newLabel.trim() || `${defaultLabelMap[newType] || 'ফিল্ড'} ${fields.length + 1}`;
    const fieldName = `customField_${Date.now()}`;
    const options = newType === 'select'
      ? (newOptionsText.trim() ? newOptionsText.split(',').map((o) => o.trim()).filter(Boolean) : ['বিকল্প ১', 'বিকল্প ২'])
      : undefined;

    const newField: FormField = {
      name: fieldName,
      label: finalLabel,
      type: newType,
      required: newRequired,
      gridSpan: newType === 'textarea' ? 2 : 1,
      options: options && options.length > 0 ? options : ['বিকল্প ১', 'বিকল্প ২'],
    };

    setFields([...fields, newField]);
    setNewLabel('');
    setNewOptionsText('');
    setNewRequired(false);
    showFeedback(`✓ "${finalLabel}" ফিল্ডটি তালিকায় যোগ হয়েছে!`);
    onShowToast(`"${finalLabel}" ফিল্ড যোগ করা হয়েছে! ➕`, '✅');
  };

  const handleAddQuickField = (label: string, type: FormFieldType = 'text') => {
    const fieldName = `quick_${Date.now()}`;
    const newField: FormField = {
      name: fieldName,
      label,
      type,
      required: false,
      gridSpan: type === 'textarea' ? 2 : 1,
    };
    setFields([...fields, newField]);
    showFeedback(`✓ "${label}" ফিল্ডটি যোগ হয়েছে!`);
    onShowToast(`"${label}" ফিল্ড যোগ করা হয়েছে! ➕`, '✅');
  };

  const handleDeleteField = (index: number) => {
    if (fields.length <= 1) {
      showFeedback('⚠️ কমপক্ষে ১টি ফিল্ড রাখা আবশ্যক!');
      onShowToast('কমপক্ষে ১টি ফিল্ড রাখা আবশ্যক!', '⚠️');
      return;
    }
    const removed = fields[index]?.label || 'ফিল্ড';
    setFields(fields.filter((_, i) => i !== index));
    showFeedback(`🗑️ "${removed}" মুছে ফেলা হয়েছে।`);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...fields];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setFields(reordered);
  };

  const handleSave = () => {
    const finalFormName = formName.trim() || 'আমার কাস্টম ফরম';
    const templateId = `custom-form-${Date.now()}`;
    const sampleData: Record<string, any> = {};
    fields.forEach((f) => {
      sampleData[f.name] = f.defaultValue || (f.type === 'date' ? new Date().toISOString().split('T')[0] : '');
    });

    const categoryNames: Record<string, string> = {
      housing: 'বাসা ও সম্পত্তি',
      personal: 'ব্যক্তিগত ও আবেদন',
      business: 'ব্যবসা ও অফিস',
      education: 'শিক্ষা প্রতিষ্ঠান',
      custom: 'কাস্টম ফরম',
    };

    const newTemplate: FormTemplate = {
      id: templateId,
      name: finalFormName,
      tagline: formTagline.trim() || 'ব্যবহারকারীর তৈরি নিজস্ব কাস্টম ফরম',
      category: 'custom',
      categoryName: categoryNames[category] || 'কাস্টম ফরম',
      badge: '✨ নিজস্ব ফরম',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      shortDescription: `আপনার কাস্টম তৈরিকৃত ${fields.length}টি ফিল্ড সংবলিত ফরম।`,
      icon: 'FileText',
      layoutType: 'custom',
      orientation: 'portrait',
      fields,
      sampleData,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onSaveCustomTemplate(newTemplate);
    onShowToast(`"${newTemplate.name}" ফরমটি তৈরি ও ওপেন করা হয়েছে! 🎉`, '✅');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                নিজের ফরম তৈরি করুন
              </h2>
              <p className="text-xs text-slate-500">
                প্রয়োজনমতো টাইটেল ও ফিল্ড সাজিয়ে নতুন ফরম সেভ করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* 1. Basic Info */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              ১. ফরমের মূল পরিচয়
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ফরমের নাম *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: ক্লাব মেম্বারশিপ ফরম"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ক্যাটাগরি
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="custom">কাস্টম ফরম</option>
                  <option value="housing">বাসা ও সম্পত্তি</option>
                  <option value="personal">ব্যক্তিগত ও আবেদন</option>
                  <option value="business">ব্যবসা ও অফিস</option>
                  <option value="education">শিক্ষা প্রতিষ্ঠান</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উপশিরোনাম / ট্যাগলাইন (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="যেমন: সদস্যপদ নিবন্ধন ও তথ্য সংগ্রহ ফরম"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Quick 1-Click Field Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                ⚡ দ্রুত ১-ক্লিকে প্রয়োজনীয় ফিল্ড যোগ করুন:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'পূর্ণ নাম', type: 'text' as FormFieldType },
                { label: 'পিতা/স্বামীর নাম', type: 'text' as FormFieldType },
                { label: 'মোবাইল নম্বর', type: 'tel' as FormFieldType },
                { label: 'এনআইডি / ভোটার আইডি', type: 'text' as FormFieldType },
                { label: 'বর্তমান ঠিকানা', type: 'text' as FormFieldType },
                { label: 'টাকার পরিমাণ (৳)', type: 'money' as FormFieldType },
                { label: 'তারিখ', type: 'date' as FormFieldType },
                { label: 'বিস্তারিত মন্তব্য', type: 'textarea' as FormFieldType },
              ].map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleAddQuickField(preset.label, preset.type)}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer active:scale-95"
                >
                  <Plus className="w-3 h-3 text-indigo-600" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Added Fields List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                ২. বর্তমান ফিল্ডসমূহ ({fields.length}টি)
              </h3>
              <span className="text-[11px] text-slate-500">তীর চিহ্ন দিয়ে ক্রম পরিবর্তন করুন</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {fields.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {f.label || `ফিল্ড #${idx + 1}`} {f.required && <span className="text-rose-500">*</span>}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        টাইপ: {f.type} {f.type === 'select' && `(${f.options?.join(', ')})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveField(idx, 'up')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-20 cursor-pointer"
                      title="উপরে নিন"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fields.length - 1}
                      onClick={() => handleMoveField(idx, 'down')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-20 cursor-pointer"
                      title="নিচে নিন"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteField(idx)}
                      className="p-1 rounded hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Add New Field Tool */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <h3 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>নতুন ফিল্ড যোগ করুন</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="ফিল্ডের নাম লিখুন (খালি রাখলে স্বয়ংক্রিয় নাম বসবে)"
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as FormFieldType)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="text">টেক্সট (Text)</option>
                  <option value="number">সংখ্যা (Number)</option>
                  <option value="money">টাকা (Money ৳)</option>
                  <option value="date">তারিখ (Date)</option>
                  <option value="tel">মোবাইল (Phone)</option>
                  <option value="textarea">বড় বিবরণ (Paragraph)</option>
                  <option value="select">ড্রপডাউন (Dropdown)</option>
                  <option value="checkbox">চেকবক্স (Checkbox)</option>
                </select>
              </div>

              {newType === 'select' && (
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={newOptionsText}
                    onChange={(e) => setNewOptionsText(e.target.value)}
                    placeholder="ড্রপডাউনের বিকল্পসমূহ কমা দিয়ে লিখুন (যেমন: ঢাকা, চট্টগ্রাম, রাজশাহী)"
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newRequired}
                    onChange={(e) => setNewRequired(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>পূরণ করা বাধ্যতামূলক (Required)</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ফিল্ড যোগ করুন</span>
                </button>
              </div>
            </div>
          </div>

          {/* Inline Feedback Banner */}
          {inlineFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{inlineFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setInlineFeedback(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white text-xs font-bold shadow-md shadow-rose-200 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>ফরম তৈরি ও সেভ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
