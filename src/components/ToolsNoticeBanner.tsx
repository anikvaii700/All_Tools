import React from 'react';
import { Megaphone, Sparkles } from 'lucide-react';
import { useDeveloperContact } from '../hooks/useDeveloperContact';

interface ToolsNoticeBannerProps {
  onOpenAdmin?: () => void;
}

export const ToolsNoticeBanner: React.FC<ToolsNoticeBannerProps> = ({ onOpenAdmin }) => {
  const { config } = useDeveloperContact();

  if (!config.noticeEnabled) return null;

  const variant = config.noticeVariant || 'gradient';

  // Construct notice string for continuous marquee
  const title = config.noticeTitle || 'The MoSaFa Tools — গুরুত্বপূর্ণ নোটিশ ও তথ্যাবলি';
  const content =
    config.noticeContent ||
    'আমাদের সকল ২৩টি অনলাইন ডিজিটাল টুলস সম্পূর্ণ ফ্রি ও মোবাইল ফ্রেন্ডলি।';
  const fullNoticeText = `${title} : ${content}`;

  const bgColor = config.noticeBgColor || '#fff1f2';
  const textColor = config.noticeTextColor || '#334155';
  const titleColor = config.noticeTitleColor || '#e11d48';
  const badgeBg = config.noticeBadgeBg || '#f43f5e';
  const badgeTextColor = config.noticeBadgeTextColor || '#ffffff';
  const borderColor = config.noticeBorderColor || '#fecdd3';
  const isGradientBg = bgColor.includes('gradient');

  return (
    <div className="w-full mb-5 sm:mb-6 animate-in fade-in duration-300">
      <div
        style={{
          background: bgColor,
          borderColor: borderColor,
          color: textColor,
        }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 border shadow-xs transition"
      >
        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          {/* Static Left Badge & Icon */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 select-none">
            <div
              style={{
                background: badgeBg,
                color: badgeTextColor,
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-2xs shrink-0"
            >
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>

            <span
              style={{
                background: badgeBg,
                color: badgeTextColor,
              }}
              className="text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs uppercase tracking-wider shrink-0"
            >
              {config.noticeBadge || 'জরুরি নোটিশ'}
            </span>
          </div>

          {/* Marquee Ticker Channel (Right to Left, Very Slow & Smooth) */}
          <div
            className="flex-1 overflow-hidden relative py-1 cursor-default group"
            title="মাউস রাখলে বা স্পর্শ করলে স্ক্রলিং থেমে থাকবে"
          >
            {/* Left and Right Fade Masks for smooth gradient entry/exit */}
            <div
              style={{
                background: isGradientBg
                  ? 'linear-gradient(to right, rgba(255,255,255,0.7), transparent)'
                  : `linear-gradient(to right, ${bgColor}, transparent)`,
              }}
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 sm:w-6 z-10 opacity-70"
            />
            <div
              style={{
                background: isGradientBg
                  ? 'linear-gradient(to left, rgba(255,255,255,0.7), transparent)'
                  : `linear-gradient(to left, ${bgColor}, transparent)`,
              }}
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 sm:w-6 z-10 opacity-70"
            />

            {/* Seamless Double Content for continuous loop */}
            <div className="animate-notice-marquee flex items-center select-none">
              {/* Segment 1 */}
              <div
                className="flex items-center gap-3 pr-8 sm:pr-12 text-xs sm:text-sm font-bold"
                style={{ color: textColor }}
              >
                <span className="font-black tracking-tight" style={{ color: titleColor }}>
                  {title}
                </span>
                <span className="opacity-40 font-normal">|</span>
                <span className="font-semibold" style={{ color: textColor }}>
                  {content}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold ml-2 border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: textColor,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>The MoSaFa</span>
                </span>
              </div>

              {/* Segment 2 (Duplicate for seamless infinite scroll) */}
              <div
                className="flex items-center gap-3 pr-8 sm:pr-12 text-xs sm:text-sm font-bold"
                style={{ color: textColor }}
              >
                <span className="font-black tracking-tight" style={{ color: titleColor }}>
                  {title}
                </span>
                <span className="opacity-40 font-normal">|</span>
                <span className="font-semibold" style={{ color: textColor }}>
                  {content}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold ml-2 border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: textColor,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>The MoSaFa</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
