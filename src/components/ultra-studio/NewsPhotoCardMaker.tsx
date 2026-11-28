import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, FileImage, FileText, ImagePlus, Newspaper, Palette, Upload } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface NewsPhotoCardMakerProps {
  onBack: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const TEMPLATES = [
  { id: 'classic', name: 'ক্লাসিক ব্যানার', label: 'ব্রেকিং নিউজ', accent: '#b91c1c', dark: '#334155' },
  { id: 'breaking', name: 'ব্রেকিং নিউজ', label: 'জরুরি সংবাদ', accent: '#dc2626', dark: '#111827' },
  { id: 'blue', name: 'নিউজ আপডেট', label: 'সর্বশেষ সংবাদ', accent: '#1d4ed8', dark: '#172554' },
  { id: 'green', name: 'নিরপেক্ষ সংবাদ', label: 'সংবাদ', accent: '#047857', dark: '#1f2937' },
  { id: 'gold', name: 'প্রিমিয়াম', label: 'বিশেষ প্রতিবেদন', accent: '#a16207', dark: '#292524' },
];

const PALETTE = ['#b91c1c', '#047857', '#1d4ed8', '#7c3aed', '#d97706', '#111827', '#be185d'];

export const NewsPhotoCardMaker: React.FC<NewsPhotoCardMakerProps> = ({ onBack, onShowToast }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [templateId, setTemplateId] = useState('classic');
  const [accent, setAccent] = useState('#b91c1c');
  const [headline, setHeadline] = useState('ব্রেকিং নিউজ: বাংলাদেশে প্রযুক্তির নতুন দিগন্ত উন্মোচিত');
  const [portalName, setPortalName] = useState('বিডি টুলস');
  const [tagline, setTagline] = useState('লিংক কমেন্টে');
  const [website, setWebsite] = useState('narailit.com');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [photoUrl, setPhotoUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [exporting, setExporting] = useState(false);

  const template = TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0];

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    if (logoUrl) URL.revokeObjectURL(logoUrl);
  }, [photoUrl, logoUrl]);

  const handleFile = (file: File | undefined, setter: (url: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('শুধু ছবি ফাইল আপলোড করুন।', '⚠️');
      return;
    }
    setter(URL.createObjectURL(file));
  };

  const exportCard = async (format: 'png' | 'pdf') => {
    if (!previewRef.current || exporting) return;
    setExporting(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 540,
        height: 540,
        windowWidth: 1200,
      });
      const image = canvas.toDataURL('image/png');
      if (format === 'png') {
        const link = document.createElement('a');
        link.href = image;
        link.download = 'mosafa-news-photo-card-1080x1080.png';
        link.click();
      } else {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [210, 210] });
        pdf.addImage(image, 'PNG', 0, 0, 210, 210);
        pdf.save('mosafa-news-photo-card.pdf');
      }
      onShowToast(format === 'png' ? 'নিউজ কার্ড PNG হিসেবে ডাউনলোড হয়েছে।' : 'নিউজ কার্ড PDF হিসেবে ডাউনলোড হয়েছে।', '✅');
    } catch (error) {
      console.error('News card export failed:', error);
      onShowToast('ডাউনলোড করা যায়নি। আবার চেষ্টা করুন।', '⚠️');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-indigo-50 text-slate-900 pb-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 pt-4">
        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
          <button type="button" onClick={onBack} className="self-start inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
            <ArrowLeft className="w-4 h-4" /> স্টুডিওতে ফিরুন
          </button>
          <div className="flex-1 flex items-start gap-3">
            <span className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><Newspaper className="w-6 h-6" /></span>
            <div>
              <div className="text-xs font-bold text-emerald-700">ফটো ও গ্রাফিক্স</div>
              <h1 className="text-xl sm:text-2xl font-extrabold leading-snug">নিউজ ফটো কার্ড মেকার (1080×1080 Photo Card)</h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">ফেসবুক ও সোশ্যাল মিডিয়ার জন্য ছবি, শিরোনাম ও পোর্টাল পরিচিতিসহ নিউজ কার্ড তৈরি করুন।</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(330px,0.82fr)_minmax(0,1.18fr)] gap-5 items-start">
          <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 sm:p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold">নিউজ ফটো কার্ড ডিজাইনার (1080×1080)</h2>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">কার্ড স্টাইল বাছাই করুন (৫টি স্টাইল)</label>
              <select value={templateId} onChange={(e) => { setTemplateId(e.target.value); const selected = TEMPLATES.find((item) => item.id === e.target.value); if (selected) setAccent(selected.accent); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold">
                {TEMPLATES.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><label className="text-xs font-bold text-slate-600">কালার স্টাইল</label><input aria-label="কাস্টম কার্ড রং" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-9 h-8 border-0 bg-transparent cursor-pointer" /></div>
              <div className="flex flex-wrap gap-2">{PALETTE.map((color) => <button key={color} type="button" aria-label={`রং ${color}`} onClick={() => setAccent(color)} className={`w-7 h-7 rounded-full border-2 ${accent === color ? 'border-slate-900 ring-2 ring-white' : 'border-white shadow'}`} style={{ backgroundColor: color }} />)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold text-slate-600">নিউজের ছবি আপলোড<input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0], setPhotoUrl)} className="mt-1.5 block w-full text-[11px] font-normal file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-2 file:py-2" /></label>
              <label className="text-xs font-bold text-slate-600">পোর্টাল লোগো আপলোড<input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0], setLogoUrl)} className="mt-1.5 block w-full text-[11px] font-normal file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-2 file:py-2" /></label>
            </div>
            <label className="block text-xs font-bold text-slate-600">নিউজ শিরোনাম (Headline)<textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3} maxLength={180} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium leading-relaxed" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold text-slate-600">পোর্টাল / চ্যানেলের নাম<input value={portalName} onChange={(e) => setPortalName(e.target.value)} maxLength={32} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium" /></label>
              <label className="text-xs font-bold text-slate-600">ট্যাগ / কমেন্ট রাজ্য<input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={32} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium" /></label>
              <label className="text-xs font-bold text-slate-600">ওয়েবসাইট লিংক<input value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={60} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium" /></label>
              <label className="text-xs font-bold text-slate-600">তারিখ<input value={date} onChange={(e) => setDate(e.target.value)} maxLength={30} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium" /></label>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button type="button" disabled={exporting} onClick={() => exportCard('png')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-3 py-3 text-xs sm:text-sm font-extrabold text-white"><Download className="w-4 h-4" />{exporting ? 'তৈরি হচ্ছে…' : 'PNG ডাউনলোড'}</button>
              <button type="button" disabled={exporting} onClick={() => exportCard('pdf')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 px-3 py-3 text-xs sm:text-sm font-extrabold text-white"><FileText className="w-4 h-4" />PDF ডাউনলোড</button>
            </div>
            <p className="text-[11px] text-slate-500">আপনার আপলোড করা ছবি এই ব্রাউজারেই প্রিভিউ ও এক্সপোর্টের জন্য ব্যবহার করা হয়।</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h2 className="font-extrabold text-base">লাইভ প্রিভিউ</h2><span className="text-xs text-slate-500">1080 × 1080 px</span></div>
            <div className="w-full max-w-[560px] mx-auto">
              <div ref={previewRef} className="relative w-full aspect-square overflow-hidden rounded-xl shadow-lg bg-white" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                <div className="absolute inset-0" style={{ backgroundColor: template.dark }}>
                  {photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><div className="text-center"><ImagePlus className="w-12 h-12 mx-auto mb-2 opacity-70" /><span className="text-lg font-bold">নিউজের ছবি আপলোড করুন</span></div></div>}
                </div>
                <div className="absolute left-0 right-0 bottom-0 min-h-[34%] px-[5.5%] pt-[5%] pb-[4.5%] text-white flex flex-col justify-between" style={{ backgroundColor: accent }}>
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-1.5 text-[clamp(10px,2.5vw,18px)] font-extrabold -mt-9 mb-3 max-w-[70%]">
                      {logoUrl && <img src={logoUrl} alt="" className="w-6 h-6 object-contain" />}
                      <span className="truncate">{portalName || 'নিউজ পোর্টাল'}</span>
                    </div>
                    <h3 className="text-[clamp(17px,3.3vw,30px)] font-extrabold leading-[1.25] break-words line-clamp-3">{headline || 'আপনার নিউজের শিরোনাম লিখুন'}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[clamp(9px,1.6vw,13px)] font-medium opacity-95">
                    <span>{date}</span><span>•</span><span>{website}</span><span>•</span><span>{tagline}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
