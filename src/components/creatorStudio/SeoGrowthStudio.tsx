import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  Link,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

interface SeoGrowthStudioProps {
  onShowToast?: (msg: string, icon?: string) => void;
}

export const SeoGrowthStudio: React.FC<SeoGrowthStudioProps> = ({ onShowToast }) => {
  const [titleInput, setTitleInput] = useState('ওয়ার্ডপ্রেস ওয়েবসাইট তৈরির সহজ উপায় ও ফ্রিল্যান্সিং গাইড');
  const [metaDesc, setMetaDesc] = useState(
    'ঘরে বসে মোবাইল বা কম্পিউটার দিয়ে ওয়ার্ডপ্রেস ওয়েবসাইট তৈরির পূর্ণাঙ্গ বাংলা গাইড। ডোমেন, হোস্টিং ও থিম সেটআপের সম্পূর্ণ নিয়ম জানুন।'
  );
  const [focusKeyword, setFocusKeyword] = useState('ওয়ার্ডপ্রেস ওয়েবসাইট');
  const [domainUrl, setDomainUrl] = useState('https://myawesomeblog.com');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AdSense Checklist items
  const [adsenseChecks, setAdsenseChecks] = useState([
    { id: 1, text: 'ব্লগে প্রয়োজনীয় পেইজ রয়েছে (Privacy Policy, About Us, Contact Us, Disclaimer)', done: true },
    { id: 2, text: 'কমপক্ষে ২০-২৫টি উচ্চমানের ইউনিক আর্টিকেল প্রকাশিত হয়েছে', done: false },
    { id: 3, text: 'সহজ নেভিগেশন বার ও ক্যাটাগরি মেনু পরিষ্কার', done: true },
    { id: 4, text: 'কোনো কপিরাইট লঙ্ঘন বা পাইরেসি কন্টেন্ট নেই', done: true },
    { id: 5, text: 'মোবাইল ফ্রেন্ডলি রেসপনসিভ ডিজাইন ও দ্রুত লোডিং স্পিড', done: true },
    { id: 6, text: 'গুগল সার্চ কনসোলে সাইটম্যাপ সাবমিট করা হয়েছে', done: false },
  ]);

  const toggleAdsenseCheck = (id: number) => {
    setAdsenseChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    if (onShowToast) {
      onShowToast('ক্লিপবোর্ডে কপি হয়েছে!', '📋');
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Character lengths
  const titleLen = titleInput.length;
  const metaLen = metaDesc.length;
  const hasKeywordInTitle = titleInput.toLowerCase().includes(focusKeyword.toLowerCase());
  const hasKeywordInMeta = metaDesc.toLowerCase().includes(focusKeyword.toLowerCase());

  // XML Sitemap Generator
  const generateSitemap = () => {
    const d = domainUrl.replace(/\/$/, '');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${d}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${d}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${d}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${d}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
  };

  // Robots.txt Generator
  const generateRobotsTxt = () => {
    const d = domainUrl.replace(/\/$/, '');
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /drafts/

Sitemap: ${d}/sitemap.xml`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-200">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              এসইও ও গ্রোথ স্টুডিও (SEO & Growth Studio) 📈
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              টাইটেল ও মেটা অপ্টিমাইজার, সাইটম্যাপ ও robots.txt জেনারেটর এবং গুগল অ্যাডসেন্স অনুমোদন চেকলিস্ট
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">বাস্তবমুখী গাইডলাইন:</span> এসইও একটি দীর্ঘমেয়াদী ধারাবাহিক প্রক্রিয়া। কোনো জাদুকরী উপায়ে রাতারাতি গুগল র‌্যাংক বা অ্যাডসেন্স গ্যারান্টি দেওয়া হয় না। তবে এই বেস্ট-প্র্যাকটিসগুলো কঠোরভাবে অনুসরণ করলে সফলতার সম্ভাবনা সর্বোচ্চ হয়।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Title & Meta Optimizer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>এসইও টাইটেল ও মেটা ডেসক্রিপশন অডিটর</span>
              <span className="text-[11px] text-slate-400">Google SERP</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ফোকাস কিওয়ার্ড (Focus Keyword)
              </label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="যেমন: ফ্রিল্যান্সিং গাইড"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-500 outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">এসইও টাইটেল (Title Tag)</label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    titleLen >= 45 && titleLen <= 65 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {titleLen} / ৬০ অক্ষর (সর্বোচ্চ ৬৫)
                </span>
              </div>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-500 outline-hidden"
              />
              <div className="mt-1 flex items-center gap-2 text-[10px]">
                <span
                  className={`font-bold flex items-center gap-1 ${
                    hasKeywordInTitle ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {hasKeywordInTitle ? '✓ কিওয়ার্ড টাইটেলে আছে' : '✕ কিওয়ার্ড টাইটেলে নেই'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">মেটা ডেসক্রিপশন (Meta Description)</label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    metaLen >= 120 && metaLen <= 160 ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {metaLen} / ১৬০ অক্ষর
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-500 outline-hidden"
              />
              <div className="mt-1 flex items-center gap-2 text-[10px]">
                <span
                  className={`font-bold flex items-center gap-1 ${
                    hasKeywordInMeta ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {hasKeywordInMeta ? '✓ কিওয়ার্ড ডেসক্রিপশনে আছে' : '✕ কিওয়ার্ড ডেসক্রিপশনে নেই'}
                </span>
              </div>
            </div>

            {/* Google Search Live Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                গুগল সার্চ ফলাফল প্রিভিউ (SERP Snippet):
              </span>
              <span className="text-xs text-slate-500 block">mywebsite.com &gt; blog &gt; article</span>
              <h4 className="text-sm font-bold text-blue-800 hover:underline cursor-pointer line-clamp-1">
                {titleInput || 'আপনার আর্টিকেলের শিরোনাম'}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {metaDesc || 'আপনার আর্টিকেলের সংক্ষিপ্ত মেটা ডেসক্রিপশন এখানে দেখা যাবে...'}
              </p>
            </div>
          </div>

          {/* Technical SEO: Sitemap & Robots.txt */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>টেকনিক্যাল এসইও: Sitemap ও Robots.txt</span>
              <span className="text-[11px] text-slate-400">XML &amp; TXT</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার ওয়েবসাইট বা ব্লগের URL
              </label>
              <input
                type="url"
                value={domainUrl}
                onChange={(e) => setDomainUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-teal-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCopy(generateSitemap(), 'sitemap')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'sitemap' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>Sitemap XML কপি</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(generateRobotsTxt(), 'robots')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'robots' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>Robots.txt কপি</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Google AdSense Approval Checklist & Heading Rules */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>গুগল অ্যাডসেন্স (AdSense) প্রস্তুতি চেকলিস্ট</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {adsenseChecks.filter((c) => c.done).length} / {adsenseChecks.length} সম্পন্ন
              </span>
            </div>

            <div className="space-y-2.5">
              {adsenseChecks.map((check) => (
                <div
                  key={check.id}
                  onClick={() => toggleAdsenseCheck(check.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                    check.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition ${
                      check.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {check.done && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs font-medium leading-relaxed ${check.done ? 'text-emerald-950 font-bold' : 'text-slate-700'}`}>
                    {check.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Heading Structure Guide */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>সঠিক হেডিং স্ট্রাকচার ফ্রেমওয়ার্ক (H1, H2, H3)</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-indigo-600">H1 (শুধুমাত্র ১টি):</span> পুরো আর্টিকেলের মূল শিরোনাম, যার মধ্যে ফোকাস কিওয়ার্ড অবশ্যই থাকতে হবে।
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-purple-600">H2 (প্রধান অনুচ্ছেদসমূহ):</span> ৩ থেকে ৫টি প্রধান বিষয় বা ধাপ, যা আউটলাইনের সাথে সামঞ্জস্যপূর্ণ।
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-teal-600">H3 (সাব-পয়েন্টস ও টিপস):</span> প্রতিটি H2-এর অধীনে বিস্তারিত পয়েন্ট বা বুলেট লিস্ট ব্যাখ্যা করতে ব্যবহৃত হয়।
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
