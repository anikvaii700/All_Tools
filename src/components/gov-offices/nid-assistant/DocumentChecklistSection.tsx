// Document Checklist Section for all Election Commission NID services
import React, { useState } from 'react';
import { FileText, Search, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { NID_CORRECTION_RULES } from '../knowledgeBase/electionCommissionData';
import { NidCorrectionTypeId } from '../types';

export const DocumentChecklistSection: React.FC<{
  onShowToast: (msg: string, icon?: string) => void;
}> = ({ onShowToast }) => {
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>('self_name_correction');

  const rulesList = Object.values(NID_CORRECTION_RULES);

  const filteredRules = rulesList.filter((rule) => {
    const matchesType = selectedType === 'all' || rule.id === selectedType;
    const matchesSearch =
      !filterQuery.trim() ||
      rule.titleBn.toLowerCase().includes(filterQuery.toLowerCase()) ||
      rule.mandatoryDocs.some((d) => d.title.toLowerCase().includes(filterQuery.toLowerCase())) ||
      rule.keywords.some((kw) => kw.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedRuleId(expandedRuleId === id ? null : id);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-pink-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8">
        <span className="px-3 py-1 rounded-md bg-white/10 text-rose-300 text-xs font-mono font-bold">
          ডকুমেন্ট অডিট ও চেকলিস্ট
        </span>
        <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">
          ১২টি সংশোধনের জন্য প্রযোজ্য দলিলের সর্বজনীন ম্যাট্রিক্স
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          নির্বাচন কমিশনে আবেদন নাকচ হওয়ার ৯০% কারণ হলো ভুল বা অসম্পূর্ণ দলিল আপলোড করা। নিচে কোন
          সংশোধনে ঠিক কোন কাগজটি প্রয়োজন তা বিস্তারিত দেখে নিন।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="কাগজপত্র বা সংশোধনের নাম খুঁজুন (যেমন: এসএসসি, জন্ম সনদ, নিকাহনামা)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 focus:border-rose-500 text-xs sm:text-sm text-slate-800 outline-none transition"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 focus:border-rose-500 text-xs sm:text-sm text-slate-800 bg-white outline-none"
            >
              <option value="all">সকল সংশোধন ধরন (১২টি ক্যাটাগরি)</option>
              {rulesList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.numericId}. {r.titleBn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rules Document Cards Accordion */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRuleId === rule.id;
          return (
            <div
              key={rule.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition"
            >
              <button
                type="button"
                onClick={() => toggleExpand(rule.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                    {rule.categoryCode}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {rule.numericId}. {rule.titleBn}
                    </h3>
                    <span className="text-xs text-slate-500">{rule.subtitleBn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-xs text-slate-500">
                    {rule.mandatoryDocs.length}টি মূল দলিল
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-100 space-y-4 bg-slate-50/50">
                  {/* Mandatory */}
                  <div>
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-2">
                      অবশ্যই দাখিল করতে হবে (বাধ্যতামূলক):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {rule.mandatoryDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-xl bg-white border border-rose-200 text-xs"
                        >
                          <div className="font-bold text-rose-950 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{doc.title}</span>
                          </div>
                          {doc.description && (
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supporting */}
                  {rule.supportingDocs.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block mb-2">
                        সহায়ক প্রমাণক (থাকলে দেওয়া বাঞ্ছনীয়):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {rule.supportingDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-white border border-indigo-200 text-xs"
                          >
                            <div className="font-bold text-indigo-950">{doc.title}</div>
                            {doc.description && (
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conditional */}
                  {rule.conditionalDocs.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">
                        পরিস্থিতিভেদে প্রযোজ্য (কোর্ট হলফনামা / বিশেষ প্রত্যয়ন):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {rule.conditionalDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-white border border-amber-200 text-xs"
                          >
                            <div className="font-bold text-amber-950">{doc.title}</div>
                            {doc.conditionNote && (
                              <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                                শর্ত: {doc.conditionNote}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
