import React, { useState, useRef } from 'react';
import { Droplets, Sparkles, ArrowRight } from 'lucide-react';

interface WaterDropletButtonProps {
  label?: string;
  onOpenTool: () => void;
  toolTitle?: string;
  toolSlug?: string | null;
  className?: string;
}

interface SplashDroplet {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  scale: number;
}

// Procedural realistic water splash & bloop sound synthesizer via native Web Audio API
const playWaterSplashSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // 1. Resonant Water Bubble Pop ("Bloop")
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.exponentialRampToValueAtTime(1450, now + 0.07);
    osc1.frequency.exponentialRampToValueAtTime(750, now + 0.18);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // 2. High Droplet Splash Sprinkle (Water Beads Sizzle)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1600, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(2600, now + 0.09);
    osc2.frequency.exponentialRampToValueAtTime(900, now + 0.22);
    gain2.gain.setValueAtTime(0.09, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.25);
  } catch {
    // Non-critical audio, ignore if blocked
  }
};

export const WaterDropletButton: React.FC<WaterDropletButtonProps> = ({
  label = 'টুল শুরু করুন',
  onOpenTool,
  toolTitle,
  toolSlug,
  className = '',
}) => {
  const [isSplashing, setIsSplashing] = useState(false);
  const [splashDroplets, setSplashDroplets] = useState<SplashDroplet[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSplashing) return;

    // Generate 16 organic water splash droplets radiating outward
    const dropletsCount = 16;
    const newDroplets: SplashDroplet[] = [];

    for (let i = 0; i < dropletsCount; i++) {
      const angle = (i / dropletsCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.35;
      const distance = 40 + Math.random() * 55;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * (distance * 0.75);
      const size = 6 + Math.floor(Math.random() * 6);
      const delay = Math.random() * 35;
      const duration = 290 + Math.random() * 90;
      const scale = 0.7 + Math.random() * 0.7;

      newDroplets.push({
        id: i,
        x,
        y,
        size,
        delay,
        duration,
        scale,
      });
    }

    setSplashDroplets(newDroplets);
    setIsSplashing(true);

    // Play tactile audio & haptics
    playWaterSplashSound();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.([20, 25, 30]);
      } catch {}
    }

    // Open tool right as the splash peaks
    setTimeout(() => {
      onOpenTool();
      setTimeout(() => {
        setIsSplashing(false);
        setSplashDroplets([]);
      }, 100);
    }, 320);
  };

  const href = toolSlug ? `/tools/${toolSlug}` : '#';

  return (
    <a
      href={href}
      onClick={handleClick}
      title={toolTitle ? `${toolTitle} শুরু করুন` : label}
      aria-label={label}
      className={`group relative w-full block select-none outline-none cursor-pointer overflow-visible transition-transform duration-200 active:scale-95 no-underline ${className}`}
    >
      {/* ============================================================== */}
      {/* FULL-BUTTON TRANSPARENT GLASS WATER DROPLET (সম্পূর্ণ বাটনটিই কাচ ও পানি) */}
      {/* ============================================================== */}
      <div
        className={`relative w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl flex items-center justify-center transition-all duration-300
          backdrop-blur-md
          bg-gradient-to-r from-sky-100/80 via-white/95 to-sky-100/85
          hover:from-sky-100 hover:via-white hover:to-cyan-100
          border-[1.5px] border-white/95
          shadow-[0_8px_20px_-3px_rgba(14,165,233,0.22),inset_0_2.5px_4px_rgba(255,255,255,1),inset_0_-2px_6px_rgba(56,189,248,0.3)]
          group-hover:border-cyan-200 group-hover:shadow-[0_10px_25px_-2px_rgba(14,165,233,0.32),inset_0_2.5px_5px_rgba(255,255,255,1),inset_0_-3px_8px_rgba(14,165,233,0.4)]
          overflow-hidden
        `}
      >
        {/* Curved Glass Specular Highlight (কাচের বাঁকা গ্লেয়ার) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-2 top-0.5 h-[45%] rounded-t-xl bg-gradient-to-b from-white/95 via-white/50 to-transparent pointer-events-none opacity-90"
        />

        {/* Ambient Glass Gleam Sweep (আলোর পিছলে যাওয়া রিফ্লেকশন) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-25deg] pointer-events-none -translate-x-[150%] group-hover:animate-[glassGleam_1.2s_ease-in-out_infinite]"
        />

        {/* Bottom Caustic Water Refraction (কাচের তলায় আলোর প্রতিসরণ) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-6 bottom-0 h-1.5 rounded-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent blur-[1px] pointer-events-none"
        />

        {/* ============================================================== */}
        {/* FULL BUTTON LARGE FLOATING TEXT (বড় লিখা, পুরো বাটন জুড়ে ভাসমান) */}
        {/* ============================================================== */}
        <div className="relative z-10 w-full flex items-center justify-center gap-2 sm:gap-2.5 animate-water-text-float">
          {/* Water Droplet Icon */}
          <div className="w-6 h-6 rounded-full bg-sky-100 border border-white/80 shadow-xs flex items-center justify-center shrink-0">
            <Droplets className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          </div>

          {/* Large Bold Text */}
          <span
            className="text-sm sm:text-base font-extrabold text-sky-950 tracking-tight leading-none"
            style={{
              textShadow: '0 1px 2px rgba(255, 255, 255, 1), 0 -0.5px 1px rgba(2, 132, 199, 0.25)',
            }}
          >
            {label}
          </span>

          {/* Sparkle & Arrow Indicator */}
          <div className="flex items-center gap-1 shrink-0 text-sky-600 group-hover:translate-x-1 transition-transform duration-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <ArrowRight className="w-4 h-4 text-sky-700" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* WATER DROPLET SPLASH BURST EFFECT (পানির ফোঁটা ছিটে যাওয়ার অ্যানিমেশন) */}
      {/* ============================================================== */}
      {isSplashing && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
        >
          {/* Concentric Water Ripples Shockwave (পানির বৃত্তাকার তরঙ্গ) */}
          <span
            className="absolute w-16 h-16 rounded-full border-2 border-cyan-400 bg-sky-300/30 animate-[waterRippleExpand_0.32s_cubic-bezier(0.1,0.8,0.3,1)_forwards]"
          />
          <span
            className="absolute w-10 h-10 rounded-full border border-white bg-white/50 animate-[waterRippleExpand_0.28s_cubic-bezier(0.1,0.8,0.3,1)_0.04s_forwards]"
          />

          {/* Water Splash Droplets Beads Shooting Outward (ছিটে যাওয়া পানির কণা) */}
          {splashDroplets.map((d) => (
            <span
              key={d.id}
              className="absolute rounded-full shadow-[0_2px_6px_rgba(2,132,199,0.5)]"
              style={{
                width: `${d.size}px`,
                height: `${d.size}px`,
                background:
                  'radial-gradient(circle at 35% 35%, #ffffff 0%, #7dd3fc 45%, #0284c7 100%)',
                animation: `splashParticleShoot ${d.duration}ms cubic-bezier(0.15, 0.85, 0.35, 1.2) ${d.delay}ms forwards`,
                ['--splash-x' as any]: `${d.x}px`,
                ['--splash-y' as any]: `${d.y}px`,
                ['--splash-scale' as any]: d.scale,
              }}
            >
              {/* Droplet micro highlight */}
              <span className="absolute top-[15%] left-[20%] w-[35%] h-[35%] rounded-full bg-white opacity-95" />
            </span>
          ))}
        </div>
      )}
    </a>
  );
};
