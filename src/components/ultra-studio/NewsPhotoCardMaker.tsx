import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, FileImage, FileText, ImagePlus, Newspaper, Palette, Upload } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface NewsPhotoCardMakerProps {
  onBack: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const TEMPLATES = [
  { id: 'classic', name: 'ক্লাসিক ব্রেকিং ব্যানার', layout: 'classic', label: 'ব্রেকিং নিউজ', accent: '#b91c1c', dark: '#334155' },
  { id: 'full-gradient', name: 'ফুল ইমেজ গ্রেডিয়েন্ট', layout: 'full-gradient', label: 'লিংক কমেন্টে', accent: '#b91c1c', dark: '#111827' },
  { id: 'clean-white', name: 'মিনিমাল ক্লিন হোয়াইট', layout: 'clean-white', label: 'সর্বশেষ সংবাদ', accent: '#b91c1c', dark: '#334155' },
  { id: 'high-contrast', name: 'ভাইব্রেন্ট হাই-কনট্রাস্ট', layout: 'high-contrast', label: 'বিশেষ প্রতিবেদন', accent: '#facc15', dark: '#09090b' },
  { id: 'framed', name: 'ফ্রেমড নিউজ পোর্টাল', layout: 'framed', label: 'লিংক কমেন্টে', accent: '#b91c1c', dark: '#334155' },
  { id: 'top-headline', name: 'টপ হেডলাইন ও বটম ফটো', layout: 'top-headline', label: 'সর্বশেষ খবর', accent: '#b91c1c', dark: '#334155' },
  { id: 'breaking-red', name: 'রেড ব্রেকিং নিউজ', layout: 'breaking-red', label: 'বিস্তারিত কমেন্টে', accent: '#b91c1c', dark: '#450a0a' },
  { id: 'editorial', name: 'এডিটোরিয়াল / কোট কার্ড', layout: 'editorial', label: 'নিজেই জানালেন', accent: '#0f766e', dark: '#e2e8f0' },
  { id: 'blue-channel', name: 'ব্লু চ্যানেল নিউজ', layout: 'blue-channel', label: 'বিস্তারিত কমেন্টে', accent: '#1d4ed8', dark: '#172554' },
  { id: 'minimal-photo', name: 'মিনিমাল ফটো স্টোরি', layout: 'minimal-photo', label: 'নিউজ আপডেট', accent: '#047857', dark: '#334155' },
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

const Placeholder: React.FC = () => <div className="w-full h-full flex items-center justify-center text-slate-300 text-center text-[clamp(12px,2vw,18px)] font-bold">নিউজের ছবি আপলোড করুন</div>;

  const Footer: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
    <div className={`mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[clamp(9px,1.6vw,13px)] font-semibold ${dark ? 'text-slate-600' : 'text-white'}`}>
      <span>{portalName}</span><span>•</span><span>{date}</span><span>•</span><span>{website}</span><span>•</span><span>{tagline}</span>
    </div>
  );

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
              <label className="block text-xs font-bold text-slate-600 mb-1.5">কার্ড ডিজাইন বাছাই করুন (১০টি স্টাইল)</label>
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
              <div ref={previewRef} className={`relative w-full aspect-square overflow-hidden shadow-lg ${template.layout === 'framed' ? 'rounded-2xl p-[2.5%]' : template.layout === 'clean-white' || template.layout === 'editorial' || template.layout === 'minimal-photo' ? 'rounded-xl' : 'rounded-xl'}`} style={{ fontFamily: "'Hind Siliguri', sans-serif", backgroundColor: template.layout === 'framed' ? accent : template.layout === 'clean-white' || template.layout === 'editorial' || template.layout === 'minimal-photo' ? '#f8fafc' : template.dark }}>
                {template.layout === 'classic' && <>
                  <div className="absolute inset-0">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImagePlus className="w-12 h-12 mr-2" />নিউজের ছবি আপলোড করুন</div>}</div>
                  <div className="absolute bottom-0 inset-x-0 min-h-[36%] px-[5.5%] pt-[4%] pb-[4%] text-white flex flex-col justify-between" style={{ backgroundColor: accent }}>
                    <div><div className="inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-1.5 text-[clamp(10px,2.5vw,18px)] font-extrabold -mt-8 mb-2">{logoUrl && <img src={logoUrl} alt="" className="w-6 h-6 object-contain" />}{portalName}</div><h3 className="text-[clamp(17px,3.3vw,30px)] font-extrabold leading-[1.2]">{headline}</h3></div>
                    <Footer />
                  </div>
                </>}
                {template.layout === 'full-gradient' && <>
                  {photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="absolute inset-0 w-full h-full object-cover" /> : <Placeholder />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-[6%] text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-slate-900 text-[clamp(10px,2.2vw,17px)] font-bold mb-3">{logoUrl && <img src={logoUrl} alt="" className="w-6 h-6 object-contain" />}{tagline || portalName}</div>
                    <h3 className="text-[clamp(19px,4vw,36px)] leading-[1.18] font-extrabold">{headline}</h3><Footer />
                  </div>
                </>}
                {template.layout === 'clean-white' && <>
                  <div className="absolute top-0 inset-x-0 h-[2%]" style={{ backgroundColor: accent }} />
                  <div className="absolute top-[4%] left-[4%] right-[4%] h-[25%] flex items-start"><h3 className="text-[clamp(18px,3.5vw,32px)] leading-[1.2] font-extrabold text-slate-900">{headline}</h3></div>
                  <div className="absolute top-[31%] left-[4%] right-[4%] h-[52%] bg-slate-700 flex items-center justify-center overflow-hidden">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <Placeholder />}</div>
                  <div className="absolute bottom-[3%] left-[4%] right-[4%] text-[clamp(9px,1.7vw,14px)] text-slate-600"><Footer dark /></div>
                </>}
                {template.layout === 'high-contrast' && <>
                  <div className="absolute inset-0 bg-zinc-950" />
                  <div className="absolute top-[8%] left-[3%] right-[3%] h-[50%] bg-slate-700 flex items-center justify-center overflow-hidden border-[3px] border-black">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <Placeholder />}</div>
                  <div className="absolute top-[61%] left-[5%] right-[5%]"><h3 className="text-[clamp(18px,3.7vw,34px)] leading-[1.18] font-extrabold" style={{ color: accent }}>{headline}</h3></div>
                  <div className="absolute bottom-[4%] left-[5%] right-[5%] text-white"><Footer /></div>
                </>}
                {template.layout === 'framed' && <>
                  <div className="absolute inset-[2.5%] bg-white border-[1.5%] border-white">
                    <div className="absolute top-[4%] left-[2%] right-[2%] h-[58%] bg-slate-700 flex items-center justify-center overflow-hidden">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <Placeholder />}</div>
                    <div className="absolute top-[64%] left-[2%] right-[2%]"><span className="inline-block px-3 py-1 text-white text-[clamp(9px,1.8vw,14px)] font-bold" style={{ backgroundColor: accent }}>{tagline}</span><h3 className="mt-2 text-[clamp(17px,3.4vw,31px)] leading-[1.2] font-extrabold text-slate-900">{headline}</h3></div>
                    <div className="absolute bottom-[2%] left-[2%] right-[2%] text-[clamp(9px,1.7vw,14px)] font-bold" style={{ color: accent }}><Footer dark /></div>
                  </div>
                </>}
                {template.layout === 'top-headline' && <>
                  <div className="absolute inset-0 bg-white" />
                  <div className="absolute top-[3%] left-[5%] right-[5%] h-[24%]"><h3 className="text-[clamp(18px,3.6vw,33px)] leading-[1.18] font-extrabold text-slate-900">{headline}</h3></div>
                  <div className="absolute top-[29%] left-[4%] right-[4%] h-[58%] bg-slate-700 flex items-center justify-center overflow-hidden">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <Placeholder />}</div>
                  <div className="absolute bottom-0 inset-x-0 h-[10%] px-[5%] flex items-center text-white text-[clamp(9px,1.8vw,15px)]" style={{ backgroundColor: accent }}><Footer /></div>
                </>}
                {template.layout === 'breaking-red' && <>
                  <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${accent}, #450a0a)` }} />
                  <div className="absolute top-[5%] left-[5%] right-[5%] h-[54%] border-[3px] border-white bg-slate-700 flex items-center justify-center overflow-hidden">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <Placeholder />}</div>
                  <div className="absolute top-[62%] left-[5%] right-[5%] text-white"><h3 className="text-[clamp(18px,3.6vw,33px)] leading-[1.2] font-extrabold">{headline}</h3></div>
                  <div className="absolute bottom-[4%] left-[5%] right-[5%] text-white"><Footer /></div>
                </>}
                {template.layout === 'editorial' && <>
                  <div className="absolute inset-0 bg-stone-50" />
                  <div className="absolute top-[5%] left-[6%] right-[6%] h-[55%] flex gap-[4%]">
                    <div className="w-[58%]"><div className="text-[clamp(28px,5vw,48px)] leading-none" style={{ color: accent }}>“</div><h3 className="text-[clamp(17px,3.3vw,30px)] leading-[1.2] font-extrabold text-slate-900">{headline}</h3><p className="mt-3 text-[clamp(10px,1.8vw,16px)] font-bold" style={{ color: accent }}>{portalName}</p></div>
                    <div className="w-[38%] rounded-t-full overflow-hidden bg-slate-200 flex items-center justify-center">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <Placeholder />}</div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-[27%] px-[6%] py-[4%] text-white flex items-end" style={{ backgroundColor: accent }}><Footer /></div>
                </>}
                {template.layout === 'blue-channel' && <>
                  <div className="absolute inset-0" style={{ backgroundColor: accent }} />
                  <div className="absolute top-[5%] left-[5%] right-[5%] h-[53%] rounded-xl overflow-hidden bg-slate-700 flex items-center justify-center">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <Placeholder />}</div>
                  <div className="absolute top-[62%] left-[5%] right-[5%] text-white"><h3 className="text-[clamp(18px,3.7vw,34px)] leading-[1.2] font-extrabold">{headline}</h3></div>
                  <div className="absolute bottom-[4%] left-[5%] right-[5%] text-white"><Footer /></div>
                </>}
                {template.layout === 'minimal-photo' && <>
                  <div className="absolute inset-0 bg-slate-50" />
                  <div className="absolute top-[4%] left-[5%] right-[5%] h-[8%] flex items-center justify-between text-[clamp(9px,1.7vw,14px)] font-bold text-slate-700"><span>{portalName}</span><span>{date}</span></div>
                  <div className="absolute top-[15%] left-[5%] right-[5%] h-[48%] rounded-xl overflow-hidden bg-slate-700 flex items-center justify-center">{photoUrl ? <img src={photoUrl} alt="নিউজ ছবি" className="w-full h-full object-cover" /> : <Placeholder />}</div>
                  <div className="absolute top-[67%] left-[5%] right-[5%]"><h3 className="text-[clamp(18px,3.6vw,33px)] leading-[1.2] font-extrabold text-slate-900">{headline}</h3></div>
                  <div className="absolute bottom-[4%] left-[5%] right-[5%] text-[clamp(9px,1.7vw,14px)]" style={{ color: accent }}><Footer dark /></div>
                </>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
