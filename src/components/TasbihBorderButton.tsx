import React from 'react';

interface TasbihBorderButtonProps {
  isActive: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
}

// Bottom-line Tasbih Beads marching one by one from right to left (staggered evenly across 5.5s)
const BOTTOM_WALK_BEADS = [
  { id: 0, isImam: true, delayClass: '[animation-delay:0s]' },
  { id: 1, isImam: false, delayClass: '[animation-delay:-0.55s]' },
  { id: 2, isImam: false, delayClass: '[animation-delay:-1.1s]' },
  { id: 3, isImam: false, delayClass: '[animation-delay:-1.65s]' },
  { id: 4, isImam: false, delayClass: '[animation-delay:-2.2s]' },
  { id: 5, isImam: false, delayClass: '[animation-delay:-2.75s]' },
  { id: 6, isImam: false, delayClass: '[animation-delay:-3.3s]' },
  { id: 7, isImam: false, delayClass: '[animation-delay:-3.85s]' },
  { id: 8, isImam: false, delayClass: '[animation-delay:-4.4s]' },
  { id: 9, isImam: false, delayClass: '[animation-delay:-4.95s]' },
];

export const TasbihBorderButton: React.FC<TasbihBorderButtonProps> = ({
  isActive,
  onClick,
  title = 'ইস্তেগফার আমলের সত্য ও অনুপ্রেরণাদায়ী কাহিনীসমূহ',
  className = '',
}) => {
  return (
    <div className={`relative group inline-flex my-1 pb-2 select-none ${className}`}>
      {/* 1. Core Button Structure */}
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`relative overflow-hidden z-10 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2.5 transition-all duration-300 cursor-pointer shadow-lg ${
          isActive
            ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-amber-300 ring-2 ring-amber-400 shadow-emerald-950/50 scale-102'
            : 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 hover:from-emerald-800 hover:to-teal-800 text-white border border-emerald-500/40 hover:border-amber-300/80 shadow-emerald-900/40'
        } transform hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95`}
      >
        {/* Subtle diagonal light shimmer sweep across button face */}
        <span className="absolute inset-0 w-2/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-sweep pointer-events-none" />

        {/* Animated 3D Floating Beads Icon */}
        <span className="text-xl sm:text-2xl animate-beads-float inline-block drop-shadow-md">
          📿
        </span>

        {/* Text Label */}
        <span className="tracking-wide text-white group-hover:text-amber-200 transition-colors drop-shadow-sm font-black">
          ইস্তেগফার আমলের গল্প
        </span>

        {/* Golden Islamic Badge */}
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-emerald-950 shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
          <span>ইসলামিক</span>
          <span className="text-[10px]">✨</span>
        </span>
      </button>

      {/* 2. Bottom-Only Golden String & Soft Glow */}
      <div className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-amber-400/90 to-transparent pointer-events-none z-10 shadow-[0_0_8px_rgba(245,158,11,0.75)]" />

      {/* 3. Tasbih Beads Walking One-by-One from Right to Left along Bottom Line ONLY */}
      <div className="absolute bottom-1 left-0 right-0 h-0 pointer-events-none overflow-visible z-20">
        {BOTTOM_WALK_BEADS.map((bead, idx) => (
          <div
            key={bead.id}
            className={`absolute top-0 rounded-full pointer-events-none animate-tasbih-bottom-walk ${bead.delayClass} ${
              bead.isImam
                ? 'w-3 h-3 border border-yellow-200'
                : 'w-2.5 h-2.5 border border-amber-300/90'
            }`}
            title={bead.isImam ? 'ইমাম দানা (প্রধান তসবিহ দানা)' : `তসবিহ দানা #${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
