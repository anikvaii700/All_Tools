import React from 'react';
import { FormField, FormTemplate } from './types';
import { convertAmountToBengaliWords } from './numberUtils';
import { RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

interface DynamicFormEditorProps {
  template: FormTemplate;
  formData: Record<string, any>;
  onChangeField: (name: string, value: any) => void;
  onReset: () => void;
  onLoadSample: () => void;
  onNavigateToTool?: (toolId: any) => void;
}

export const DynamicFormEditor: React.FC<DynamicFormEditorProps> = ({
  template,
  formData,
  onChangeField,
  onReset,
  onLoadSample,
  onNavigateToTool,
}) => {
  // Group fields by their group label
  const groupedFields = template.fields.reduce((acc, field) => {
    const groupName = field.group || 'সাধারণ বিবরণ';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(field);
    return acc;
  }, {} as Record<string, FormField[]>);

  const handleMoneyChange = (field: FormField, val: string) => {
    const numeric = parseFloat(val) || 0;
    onChangeField(field.name, numeric);

    // Auto-update amount in words if target field is specified
    if (field.wordsTargetField) {
      const words = convertAmountToBengaliWords(numeric);
      onChangeField(field.wordsTargetField, words);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700">
              {template.categoryName}
            </span>
            <span className="text-xs text-slate-500 font-medium">তথ্য পূরণ করুন</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            {template.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="নমুনা উদাহরণ তথ্য দিয়ে পূরণ করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>নমুনা তথ্য</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="সকল ইনপুট খালি করুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>রিসেট</span>
          </button>
        </div>
      </div>

      {/* Grouped Input Sections */}
      <div className="space-y-6">
        {Object.entries(groupedFields).map(([groupTitle, fields]) => (
          <div key={groupTitle} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">
                {groupTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {fields.map((field) => {
                const val = formData[field.name] !== undefined ? formData[field.name] : (field.defaultValue ?? '');
                const isSpan2 = field.gridSpan === 2 || field.type === 'textarea';

                return (
                  <div
                    key={field.name}
                    className={`space-y-1.5 ${isSpan2 ? 'sm:col-span-2' : 'sm:col-span-1'}`}
                  >
                    <label className="block text-xs font-bold text-slate-700">
                      {field.label}
                      {field.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>

                    {/* FIELD TYPE: SELECT */}
                    {field.type === 'select' && (
                      <select
                        value={val}
                        onChange={(e) => onChangeField(field.name, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition cursor-pointer"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* FIELD TYPE: TEXTAREA */}
                    {field.type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={val}
                        placeholder={field.placeholder}
                        onChange={(e) => onChangeField(field.name, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-y"
                      />
                    )}

                    {/* FIELD TYPE: MONEY */}
                    {field.type === 'money' && (
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                        <input
                          type="number"
                          value={val || ''}
                          placeholder={field.placeholder || '০'}
                          onChange={(e) => handleMoneyChange(field, e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                        />
                      </div>
                    )}

                    {/* FIELD TYPE: DATE */}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={val}
                        onChange={(e) => onChangeField(field.name, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                      />
                    )}

                    {/* FIELD TYPE: NUMBER */}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={val}
                        placeholder={field.placeholder}
                        onChange={(e) => onChangeField(field.name, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                      />
                    )}

                    {/* FIELD TYPE: TEL */}
                    {field.type === 'tel' && (
                      <input
                        type="tel"
                        value={val}
                        placeholder={field.placeholder || '০১৭xxxxxxxx'}
                        onChange={(e) => onChangeField(field.name, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                      />
                    )}

                    {/* FIELD TYPE: CHECKBOX */}
                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => onChangeField(field.name, e.target.checked)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                        />
                        <span className="text-xs text-slate-700 font-medium">{field.placeholder || 'অনুমোদন নিশ্চিত করুন'}</span>
                      </label>
                    )}

                    {/* FIELD TYPE: STANDARD TEXT (DEFAULT) */}
                    {(field.type === 'text' || !field.type) && (
                      <input
                        type="text"
                        value={val}
                        placeholder={field.placeholder}
                        onChange={(e) => onChangeField(field.name, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                      />
                    )}

                    {/* Helper text */}
                    {field.helperText && (
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{field.helperText}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
