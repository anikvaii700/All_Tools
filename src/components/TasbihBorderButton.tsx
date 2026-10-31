import React from 'react';

interface TasbihBorderButtonProps {
  isActive: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
}

// 33 Authentic Islamic Tasbih Beads around the perimeter (৩৩ দানার পূর্ণাঙ্গ তসবিহ মালা)
const TASBIH_BEADS = [
  // 1. Top Edge (Left to Right) - 13 beads
  { x: 4, y: 0, isImam: true }, // Master Imam Bead
  { x: 11, y: 0 },
  { x: 18, y: 0 },
  { x: 26, y: 0 },
  { x: 34, y: 0 },
  { x: 42, y: 0 },
  { x: 50, y: 0 },
  { x: 58, y: 0 },
  { x: 66, y: 0 },
  { x: 74, y: 0 },
  { x: 82, y: 0 },
  { x: 89, y: 0 },
  { x: 96, y: 0 },

  // 2. Top-Right Corner - 1 bead
  { x: 100, y: 14 },

  // 3. Right Edge - 2 beads
  { x: 100, y: 40 },
  { x: 100, y: 65 },

  // 4. Bottom-Right Corner - 1 bead
  { x: 100, y: 88 },

  // 5. Bottom Edge (Right to Left) - 13 beads
  { x: 96, y: 100 },
  { x: 89, y: 100 },
  { x: 82, y: 100 },
  { x: 74, y: 100 },
  { x: 66, y: 100 },
  { x: 50, y: 100 },
  { x: 58, y: 100 },
  { x: 42, y: 100 },
  { x: 34, y: 100 },
  { x: 26, y: 100 },
  { x: 18, y: 100 },
  { x: 11, y: 100 },
  { x: 4, y: 100 },

  // 6. Bottom-Left Corner - 1 bead
  { x: 0, y: 88 },

  // 7. Left Edge (Bottom to Top) - 2 beads
  { x: 0, y: 65 },
  { x: 0, y: 40 },
];

export const TasbihBorderButton: React.FC<TasbihBorderButtonProps> = ({
  isActive,
  onClick,
  title = 'ইস্তেগফার আমলের সত্য ও অনুপ্রেরণাদায়ী কাহিনীসমূহ',
  className = '',
}) => {
  const totalBeads = TASBIH_BEADS.length; // Exactly 33 beads
  const cycleDuration = 3.3; // 3.3s cycle (100ms per bead travel)

  return (
    <div className={`relative group inline-flex my-1 select-none ${className}`}>
      {/* 1. Outer Deep Emerald / Amber Ambient Halo */}
      <div
        className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-400 blur-md transition-all duration-500 pointer-events-none ${
          isActive
            ? 'opacity-95 animate-breathing-glow'
            : 'opacity-60 group-hover:opacity-100 animate-pulse'
        }`}
      />

      {/* 2. Golden Tasbih String / Thread Line behind beads */}
      <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/50 pointer-events-none shadow-[inset_0_0_8px_rgba(245,158,11,0.25)] z-0" />

      {/* 3. The 33 Tasbih Beads revolving and enlarging one by one */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
        {TASBIH_BEADS.map((bead, idx) => {
          const delay = (idx / totalBeads) * cycleDuration;

          return (
            <div
              key={idx}
              className={`absolute rounded-full pointer-events-none transition-all ${
                bead.isImam
                  ? 'w-2.5 h-2.5 sm:w-3 sm:h-3 border border-yellow-200'
                  : 'w-2 h-2 sm:w-2.5 sm:h-2.5 border border-amber-300/80'
              }`}
              style={{
                left: `${bead.x}%`,
                top: `${bead.y}%`,
                animation: `tasbihWaveScale ${cycleDuration}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
              }}
              title={bead.isImam ? 'ইমাম দানা (প্রধান তসবিহ দানা)' : `তসবিহ দানা #${idx + 1}`}
            />
          );
        })}
      </div>

      {/* 4. Core Button Structure */}
      <button
        onClick={onClick}
        title={title}
        className={`relative overflow-hidden z-10 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2.5 transition-all duration-300 cursor-pointer shadow-xl ${
          isActive
            ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-amber-300 ring-2 ring-amber-400 shadow-emerald-950/70 scale-102'
            : 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 hover:from-emerald-800 hover:to-teal-800 text-white border border-emerald-500/40 hover:border-amber-300/80 shadow-emerald-900/50'
        } transform hover:-translate-y-1 hover:scale-105 active:translate-y-0.5 active:scale-95`}
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

        {/* Live Pulsing Amber Beacon */}
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>

        {/* Golden Islamic Badge with rotating star */}
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-emerald-950 shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
          <span>ইসলামিক</span>
          <span className="text-[10px] animate-spin" style={{ animationDuration: '4s' }}>✨</span>
        </span>
      </button>
    </div>
  );
};
