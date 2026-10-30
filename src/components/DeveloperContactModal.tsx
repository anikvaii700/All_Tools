import React, { useState } from 'react';
import {
  X,
  MessageSquare,
} from 'lucide-react';
import { useDeveloperContact } from '../hooks/useDeveloperContact';

interface DeveloperContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperContactModal: React.FC<DeveloperContactModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { config } = useDeveloperContact();

  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('সাপোর্ট');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Send via WhatsApp
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedText =
      `*The MoSaFa Tools — সাপোর্ট ও ইনকোয়ারি*\n\n` +
      `👤 *নাম:* ${senderName || 'নাম উল্লেখ নেই'}\n` +
      `✉️ *ইমেইল:* ${senderEmail || 'ইমেইল উল্লেখ নেই'}\n` +
      `📌 *বিষয়:* ${subject || 'সাপোর্ট'}\n\n` +
      `💬 *মেসেজ:*\n${message || 'আসসালামু আলাইকুম, আমি সরাসরি সহায়তা চাই।'}`;

    const cleanWhatsapp = config.whatsappNumber.replace(/[^0-9]/g, '');
    const targetNumber = cleanWhatsapp.startsWith('880')
      ? cleanWhatsapp
      : `880${cleanWhatsapp.replace(/^0+/, '')}`;
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(formattedText)}`;

    window.open(whatsappUrl, '_blank');
    setIsSubmitting(false);
  };

  // Direct 1-click WhatsApp chat
  const handleDirectChat = () => {
    const cleanWhatsapp = config.whatsappNumber.replace(/[^0-9]/g, '');
    const targetNumber = cleanWhatsapp.startsWith('880')
      ? cleanWhatsapp
      : `880${cleanWhatsapp.replace(/^0+/, '')}`;
    const defaultText = `আসসালামু আলাইকুম ${config.name}, আমি The MoSaFa Tools ওয়েবসাইট থেকে সরাসরি যোগাযোগ করছি।`;
    window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(defaultText)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl bg-white rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Row with ONLY Close (X) button - Admin button removed as requested */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
            aria-label="পপআপ বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-7 md:p-9">
          <div className="relative">
            {/* Soft decorative background circles matching screenshot */}
            <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-blue-100/50 blur-2xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full bg-indigo-100/40 blur-xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start relative z-10">
              {/* ============= LEFT COLUMN: DEVELOPER PORTRAIT & IDENTITY ============= */}
              <div className="md:col-span-5 flex flex-col items-center text-center">
                {/* Portrait Card */}
                <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto group">
                  {/* Background soft glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 to-indigo-100/40 rounded-3xl -z-10 blur-xs" />

                  <div className="w-full h-[320px] sm:h-[390px] flex items-end justify-center overflow-hidden rounded-3xl">
                    <img
                      src={config.photoUrl || '/developer_portrait.png'}
                      alt={config.name}
                      className="max-h-full max-w-full object-contain object-bottom drop-shadow-xl select-none transition-transform duration-300 group-hover:scale-[1.02]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/developer_portrait.png';
                      }}
                    />
                  </div>
                </div>

                {/* Title / Designation Underneath Photo */}
                <div className="mt-3.5 mb-3 inline-block">
                  <h3 className="text-base sm:text-lg font-bold text-indigo-700 tracking-tight">
                    {config.designation || 'ডাটা এন্ট্রি অপারেটর'}
                  </h3>
                  <div className="w-full h-0.5 bg-indigo-500 rounded-full mt-0.5 mx-auto" />
                </div>

                {/* Green Direct Message Button (WhatsApp) */}
                <button
                  type="button"
                  onClick={handleDirectChat}
                  className="w-full max-w-[240px] py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>সরাসরি মেসেজ করুন!</span>
                </button>
              </div>

              {/* ============= RIGHT COLUMN: SUPPORT DETAILS & FORM ============= */}
              <div className="md:col-span-7 flex flex-col justify-start text-left pt-1">
                {/* Badge */}
                <div className="mb-2">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/60 text-xs font-bold tracking-normal">
                    {config.supportBadge || 'সাপোর্ট ও ইনকোয়ারি'}
                  </span>
                </div>

                {/* Heading: প্রফেশনাল সাপোর্ট নিন। */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  প্রফেশনাল <span className="text-emerald-500">সাপোর্ট</span> নিন।
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-medium mt-2 max-w-xl">
                  {config.supportSubtitle}
                </p>

                {/* Contact Info Row */}
                <div className="flex items-center gap-6 sm:gap-10 mt-3 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                      ফোন নাম্বার:
                    </span>
                    <a
                      href={`tel:${config.phoneDisplay}`}
                      className="text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-600 transition tracking-tight font-mono"
                    >
                      {config.phoneDisplay}
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                      ইমেইল এড্রেস:
                    </span>
                    <a
                      href={`mailto:${config.email}`}
                      className="text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-600 transition tracking-tight font-mono"
                    >
                      {config.email}
                    </a>
                  </div>
                </div>

                {/* Mint / Light Green Form Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="mt-4 p-4 sm:p-5 rounded-3xl bg-[#dcfce7]/70 border border-emerald-200/80 shadow-xs space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">
                        সম্পূর্ণ নাম
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full px-3 py-2 rounded-xl bg-white/95 border border-emerald-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-800 block mb-1">
                        ইমেইল এড্রেস
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="আপনার ইমেইল এড্রেস"
                        className="w-full px-3 py-2 rounded-xl bg-white/95 border border-emerald-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-800 block mb-1">
                      বিষয়
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="সাপোর্ট বা কাস্টম অ্যাপ"
                      className="w-full px-3 py-2 rounded-xl bg-white/95 border border-emerald-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-800 block mb-1">
                      মেসেজ
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="আপনাকে কীভাবে সাহায্য করতে পারি?"
                      className="w-full px-3 py-2 rounded-xl bg-white/95 border border-emerald-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs resize-none"
                    />
                  </div>

                  {/* Dark Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>হোয়াটসঅ্যাপে পাঠান</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
