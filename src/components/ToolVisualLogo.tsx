import React from 'react';

interface ToolVisualLogoProps {
  toolId: string | null;
  className?: string;
}

/**
 * Large, unmistakable, self-explanatory illustrated SVG logos for every tool on MoSaFa Tools.
 * Designed so any user — even without reading text — immediately recognizes what each tool does.
 */
export const ToolVisualLogo: React.FC<ToolVisualLogoProps> = ({ toolId, className = 'w-24 h-24 sm:w-28 sm:h-28' }) => {
  switch (toolId) {
    // 1. BD Online Portal (Bangladesh Flag + Govt Building)
    case 'bd-online-portal':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="bdBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#bdBg)" />
          {/* Bangladesh Flag Emblem Top */}
          <circle cx="60" cy="34" r="16" fill="#006a4e" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="58" cy="34" r="7.5" fill="#f42a41" />
          {/* Classical Govt Building Pillars */}
          <polygon points="24,62 60,46 96,62" fill="#ffffff" />
          <rect x="26" y="62" width="68" height="5" rx="1.5" fill="#d1fae5" />
          <rect x="31" y="67" width="8" height="24" rx="1.5" fill="#ffffff" />
          <rect x="46" y="67" width="8" height="24" rx="1.5" fill="#ffffff" />
          <rect x="66" y="67" width="8" height="24" rx="1.5" fill="#ffffff" />
          <rect x="81" y="67" width="8" height="24" rx="1.5" fill="#ffffff" />
          <rect x="22" y="91" width="76" height="8" rx="3" fill="#ecfdf5" />
          {/* Globe badge */}
          <circle cx="92" cy="30" r="11" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
          <path d="M87 30h10M92 25v10" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    // 2. All Form Fillup (Clipboard Form + Pen + Seal)
    case 'all-form-fillup':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="formBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#formBg)" />
          {/* Clipboard Document */}
          <rect x="25" y="24" width="58" height="76" rx="8" fill="#ffffff" />
          <rect x="40" y="18" width="28" height="11" rx="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
          {/* Checkboxes & Lines */}
          <rect x="33" y="38" width="9" height="9" rx="2" fill="#10b981" />
          <path d="M35.5 42.5l2 2 3.5-4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <rect x="46" y="40" width="28" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="33" y="53" width="9" height="9" rx="2" fill="#10b981" />
          <path d="M35.5 57.5l2 2 3.5-4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <rect x="46" y="55" width="26" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="33" y="68" width="9" height="9" rx="2" fill="#6366f1" />
          <rect x="46" y="70" width="22" height="4.5" rx="2" fill="#cbd5e1" />
          {/* Official Seal */}
          <circle cx="43" cy="88" r="7" fill="#ffe4e6" stroke="#e11d48" strokeWidth="1.8" />
          {/* Pen writing */}
          <g transform="translate(88 64) rotate(32)">
            <rect x="-5" y="-26" width="10" height="42" rx="3" fill="#facc15" stroke="#1e293b" strokeWidth="1.5" />
            <polygon points="-5,16 5,16 0,27" fill="#fef3c7" stroke="#1e293b" strokeWidth="1.2" />
            <polygon points="-1.8,23 1.8,23 0,27" fill="#1e293b" />
          </g>
        </svg>
      );

    // 3. Voter Transfer Form-13 (NID Card + Location Transfer Arrow + ১৩)
    case 'voter-transfer-form':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="voterBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#voterBg)" />
          {/* Smart NID Card */}
          <rect x="20" y="24" width="66" height="42" rx="7" fill="#ffffff" />
          <rect x="20" y="24" width="66" height="9" rx="4" fill="#16a34a" />
          <rect x="26" y="37" width="16" height="21" rx="3" fill="#bae6fd" />
          <circle cx="34" cy="44" r="4" fill="#0369a1" />
          <path d="M28 56c1-4 11-4 12 0" fill="#0369a1" />
          <rect x="47" y="39" width="32" height="4" rx="2" fill="#94a3b8" />
          <rect x="47" y="47" width="24" height="4" rx="2" fill="#cbd5e1" />
          <rect x="47" y="55" width="28" height="3.5" rx="1.7" fill="#e2e8f0" />
          {/* Badge 13 */}
          <circle cx="92" cy="32" r="14" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
          <text x="92" y="37" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">১৩</text>
          {/* Transfer Arrow between Two Pins */}
          <circle cx="33" cy="88" r="9" fill="#fde047" />
          <circle cx="33" cy="88" r="3.5" fill="#b45309" />
          <path d="M46 88h26m-7-7l7 7-7 7" stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="87" cy="88" r="10" fill="#34d399" stroke="#ffffff" strokeWidth="2" />
          <path d="M83 88l3 3 5.5-6" stroke="#064e3b" strokeWidth="2.3" fill="none" strokeLinecap="round" />
        </svg>
      );

    // 4. Prepaid Meter Helper (Electric Meter Box + LCD + Keypad + Lightning)
    case 'prepaid-meter':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="meterBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#meterBg)" />
          {/* Meter Body */}
          <rect x="26" y="18" width="62" height="84" rx="10" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          {/* LCD Screen */}
          <rect x="33" y="26" width="48" height="22" rx="4" fill="#bef264" stroke="#365314" strokeWidth="1.8" />
          <text x="57" y="42" textAnchor="middle" fill="#1a2e05" fontSize="14" fontWeight="900" fontFamily="monospace">800#</text>
          {/* Keypad 3x3 */}
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={35 + c * 15}
                y={55 + r * 13}
                width="11"
                height="9"
                rx="2"
                fill={r === 2 && c === 2 ? '#ef4444' : r === 2 && c === 0 ? '#2563eb' : '#cbd5e1'}
              />
            ))
          )}
          {/* Bright Lightning Bolt Badge */}
          <circle cx="91" cy="84" r="16" fill="#facc15" stroke="#ffffff" strokeWidth="2.5" />
          <polygon points="93,73 84,85 90,85 88,95 98,82 92,82" fill="#b45309" />
        </svg>
      );

    // 5. Ultra Digital Studio (DSLR Camera + Passport Photo + Print)
    case 'ultra-digital-studio':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="studioBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#studioBg)" />
          {/* Passport Photo Card Left */}
          <rect x="20" y="20" width="42" height="52" rx="6" fill="#ffffff" transform="rotate(-6 41 46)" />
          <rect x="24" y="24" width="34" height="44" rx="4" fill="#38bdf8" transform="rotate(-6 41 46)" />
          <circle cx="41" cy="39" r="8" fill="#fef3c7" />
          <path d="M29 63c2-11 22-11 24 0" fill="#1e293b" />
          {/* Studio Camera Foreground */}
          <rect x="42" y="54" width="58" height="42" rx="10" fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M56 54l4-8h20l4 8" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
          <circle cx="71" cy="75" r="14" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="3" />
          <circle cx="71" cy="75" r="7" fill="#0f172a" />
          <circle cx="68" cy="72" r="2.5" fill="#ffffff" />
          <circle cx="90" cy="63" r="3.2" fill="#facc15" />
        </svg>
      );

    // 6. CV Maker (A4 Resume with Portrait + "CV" Header + Bars)
    case 'cv-maker':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="cvBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#cvBg)" />
          {/* A4 CV Sheet */}
          <rect x="26" y="18" width="68" height="84" rx="8" fill="#ffffff" />
          {/* Top Accent Banner */}
          <rect x="26" y="18" width="68" height="24" rx="8" fill="#1e293b" />
          <rect x="26" y="32" width="68" height="10" fill="#1e293b" />
          {/* Profile Avatar */}
          <circle cx="42" cy="36" r="11" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="42" cy="33" r="3.5" fill="#ffffff" />
          <path d="M36 42c1.5-4 10.5-4 12 0" fill="#ffffff" />
          <text x="72" y="35" textAnchor="middle" fill="#facc15" fontSize="14" fontWeight="900">CV</text>
          {/* Structured Resume Lines */}
          <rect x="34" y="54" width="52" height="5" rx="2.5" fill="#6366f1" />
          <rect x="34" y="64" width="44" height="4" rx="2" fill="#cbd5e1" />
          <rect x="34" y="73" width="50" height="4" rx="2" fill="#cbd5e1" />
          <rect x="34" y="82" width="32" height="5" rx="2.5" fill="#ec4899" />
          <rect x="34" y="91" width="46" height="4" rx="2" fill="#e2e8f0" />
        </svg>
      );

    // 7. Job Photo & Signature Resizer (300x300 Photo + 300x80 Signature Box)
    case 'job-photo-signature-resizer':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="jobBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#jobBg)" />
          {/* 300x300 Photo Frame with Crop Corners */}
          <rect x="36" y="18" width="48" height="48" rx="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
          <circle cx="60" cy="36" r="9.5" fill="#fef3c7" />
          <path d="M44 63c3-13 29-13 32 0" fill="#1e293b" />
          {/* Crop corner brackets */}
          <path d="M31 27v-12h12M89 27v-12h-12M31 57v12h12M89 57v12h-12" stroke="#fde047" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          {/* 300x80 Signature Strip */}
          <rect x="22" y="75" width="76" height="24" rx="6" fill="#ffffff" />
          <path
            d="M31 91c6-12 11 4 17-6 5-8 7 8 14-1 5-6 10 3 22-1"
            stroke="#1d4ed8"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    // 8. Application Writer (Official Letter Page + Fountain Pen)
    case 'application-writer':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="appBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#appBg)" />
          {/* Formal Letter Paper */}
          <rect x="24" y="18" width="60" height="82" rx="8" fill="#ffffff" />
          <rect x="33" y="28" width="24" height="5" rx="2.5" fill="#2563eb" />
          <rect x="33" y="39" width="42" height="4" rx="2" fill="#94a3b8" />
          <rect x="33" y="48" width="42" height="4" rx="2" fill="#cbd5e1" />
          <rect x="33" y="57" width="36" height="4" rx="2" fill="#cbd5e1" />
          <rect x="33" y="66" width="40" height="4" rx="2" fill="#cbd5e1" />
          <path d="M33 84c7-6 12 4 20-2" stroke="#1e293b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* Fountain Pen */}
          <g transform="translate(88 58) rotate(35)">
            <rect x="-6" y="-28" width="12" height="40" rx="4" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />
            <rect x="-6" y="4" width="12" height="5" fill="#facc15" />
            <polygon points="-5,12 5,12 0,28" fill="#facc15" />
            <circle cx="0" cy="19" r="1.6" fill="#1e293b" />
          </g>
        </svg>
      );

    // 9. PDF Toolkit (Big Red PDF Document + Merge/Edit Badge)
    case 'pdf-toolkit':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="pdfBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#pdfBg)" />
          {/* Back Stacked Page */}
          <rect x="34" y="18" width="56" height="72" rx="8" fill="#fecdd3" />
          {/* Front White PDF File */}
          <path d="M26 26a8 8 0 0 1 8-8h34l18 18v56a8 8 0 0 1-8 8H34a8 8 0 0 1-8-8V26z" fill="#ffffff" />
          <path d="M68 18v18h18z" fill="#fca5a5" />
          {/* Big Red PDF Strip */}
          <rect x="20" y="50" width="72" height="28" rx="7" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
          <text x="56" y="70" textAnchor="middle" fill="#ffffff" fontSize="19" fontWeight="900" letterSpacing="1">PDF</text>
          {/* Mini Tool Gear */}
          <circle cx="90" cy="86" r="13" fill="#facc15" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="90" cy="86" r="4.5" fill="#78350f" />
        </svg>
      );

    // 10. My Digital Shop Management (Storefront Awning + Taka Sign)
    case 'my-digital-shop':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="shopBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#shopBg)" />
          {/* Store Body */}
          <rect x="24" y="46" width="72" height="52" rx="6" fill="#ffffff" />
          {/* Striped Awning */}
          <path d="M18 46l6-22h72l6 22z" fill="#ef4444" />
          <path d="M36 24l-3 22h16l1-22zM70 24l1 22h16l-3-22z" fill="#ffffff" />
          {/* Scalloped awning edge */}
          {[24, 38, 52, 66, 80, 94].map((cx, i) => (
            <circle key={cx} cx={cx} cy="46" r="7" fill={i % 2 === 0 ? '#ef4444' : '#ffffff'} />
          ))}
          {/* Shop Window & Door */}
          <rect x="32" y="58" width="28" height="22" rx="4" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
          <rect x="67" y="58" width="20" height="40" rx="3" fill="#fbbf24" stroke="#92400e" strokeWidth="2" />
          <circle cx="82" cy="78" r="2.2" fill="#78350f" />
          {/* Taka Coin Badge */}
          <circle cx="46" cy="69" r="8" fill="#10b981" />
          <text x="46" y="74" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">৳</text>
        </svg>
      );

    // 11. Invoice Maker (Cash Memo Receipt + Taka + PAID)
    case 'invoice-maker':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="invBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#invBg)" />
          {/* Zigzag Invoice Paper */}
          <path d="M26 20h68v78l-8-6-8 6-9-6-9 6-9-6-9 6-8-6-8 6z" fill="#ffffff" />
          {/* Header */}
          <rect x="34" y="29" width="32" height="6" rx="3" fill="#0f766e" />
          <circle cx="80" cy="32" r="8" fill="#10b981" />
          <text x="80" y="36.5" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">৳</text>
          {/* Line Items */}
          <rect x="34" y="45" width="36" height="4" rx="2" fill="#cbd5e1" />
          <rect x="75" y="45" width="12" height="4" rx="2" fill="#94a3b8" />
          <rect x="34" y="55" width="32" height="4" rx="2" fill="#cbd5e1" />
          <rect x="75" y="55" width="12" height="4" rx="2" fill="#94a3b8" />
          <rect x="34" y="65" width="38" height="4" rx="2" fill="#cbd5e1" />
          <rect x="75" y="65" width="12" height="4" rx="2" fill="#94a3b8" />
          {/* Total Row */}
          <line x1="34" y1="75" x2="87" y2="75" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="3 2" />
          <rect x="34" y="80" width="24" height="6" rx="2.5" fill="#1e293b" />
          <rect x="65" y="80" width="22" height="6" rx="2.5" fill="#10b981" />
        </svg>
      );

    // 12. Daily Hishab & To-Do (Wallet + Taka Coin + Green Checklist)
    case 'daily-hishab':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="hishabBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#hishabBg)" />
          {/* Wallet */}
          <rect x="20" y="34" width="76" height="58" rx="12" fill="#78350f" stroke="#fef3c7" strokeWidth="2.5" />
          <rect x="20" y="34" width="76" height="14" rx="6" fill="#92400e" />
          <rect x="72" y="54" width="28" height="18" rx="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <circle cx="81" cy="63" r="3" fill="#ffffff" />
          {/* Big Golden Taka Coin Peeking Out */}
          <circle cx="52" cy="36" r="18" fill="#facc15" stroke="#ffffff" strokeWidth="3" />
          <text x="52" y="43" textAnchor="middle" fill="#854d0e" fontSize="20" fontWeight="900">৳</text>
          {/* Checkmark Circle */}
          <circle cx="88" cy="88" r="14" fill="#22c55e" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M82 88l4 4 8-9" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    // 13. Entrepreneur Journey (Rocket + Rising Growth Bars + Lightbulb)
    case 'entrepreneur-journey':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="entBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="55%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#entBg)" />
          {/* Growth Bars */}
          <rect x="24" y="76" width="14" height="22" rx="4" fill="#fde047" />
          <rect x="44" y="62" width="14" height="36" rx="4" fill="#34d399" />
          <rect x="64" y="46" width="14" height="52" rx="4" fill="#38bdf8" />
          {/* Rocket Launching */}
          <g transform="translate(80 42) rotate(32)">
            <path d="M0-24c10 10 10 26 8 34H-8c-2-8-2-24 8-34z" fill="#ffffff" />
            <circle cx="0" cy="-4" r="5" fill="#2563eb" />
            <path d="M-8 6l-7 9h7zM8 6l7 9h-7z" fill="#fb7185" />
            <path d="M-4 10l4 10 4-10z" fill="#fde047" />
          </g>
        </svg>
      );

    // 14. Bangla Text Converter (অ <-> A Swap Cards)
    case 'bangla-text-converter':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="convBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#convBg)" />
          {/* Card 1: Bangla অ */}
          <rect x="18" y="22" width="44" height="44" rx="11" fill="#ffffff" />
          <text x="40" y="53" textAnchor="middle" fill="#047857" fontSize="28" fontWeight="900">অ</text>
          {/* Card 2: English A */}
          <rect x="58" y="54" width="44" height="44" rx="11" fill="#fef08a" stroke="#ffffff" strokeWidth="2.5" />
          <text x="80" y="84" textAnchor="middle" fill="#0f172a" fontSize="26" fontWeight="900">A</text>
          {/* Swap Arrows */}
          <path d="M70 30c12 0 18 6 18 16m-5-4l5 5 5-5" stroke="#ffffff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 90c-12 0-18-6-18-16m-5 4l5-5 5 5" stroke="#ffffff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    // 15. StudyMate BD (Graduation Cap + Open Book + AI Star)
    case 'studymate-bd':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="studyBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#studyBg)" />
          {/* Graduation Cap */}
          <polygon points="60,20 98,36 60,52 22,36" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
          <path d="M36 42v14c0 6 11 10 24 10s24-4 24-10V42" fill="#334155" />
          <line x1="92" y1="38" x2="92" y2="57" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
          <circle cx="92" cy="59" r="3.5" fill="#facc15" />
          {/* Open Textbook */}
          <path d="M24 72c12-4 26-2 36 5 10-7 24-9 36-5v24c-12-4-26-2-36 5-10-7-24-9-36-5z" fill="#ffffff" />
          <line x1="60" y1="77" x2="60" y2="101" stroke="#cbd5e1" strokeWidth="2" />
          <text x="41" y="89" textAnchor="middle" fill="#4f46e5" fontSize="11" fontWeight="900">A+</text>
          <text x="79" y="89" textAnchor="middle" fill="#db2777" fontSize="11" fontWeight="900">AI</text>
        </svg>
      );

    // 16. Typing Speed Test (Keyboard + Speedometer Gauge)
    case 'typing-test':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="typeBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#typeBg)" />
          {/* Speedometer Arc */}
          <path d="M32 54a28 28 0 0 1 56 0" fill="none" stroke="#e0f2fe" strokeWidth="7" strokeLinecap="round" />
          <path d="M60 26a28 28 0 0 1 28 28" fill="none" stroke="#facc15" strokeWidth="7" strokeLinecap="round" />
          <line x1="60" y1="54" x2="77" y2="37" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="54" r="5" fill="#ffffff" />
          {/* Keyboard */}
          <rect x="18" y="64" width="84" height="36" rx="8" fill="#ffffff" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={`r1-${i}`} x={24 + i * 15} y="70" width="11" height="9" rx="2" fill="#cbd5e1" />
          ))}
          <rect x="24" y="84" width="14" height="9" rx="2" fill="#94a3b8" />
          <rect x="42" y="84" width="36" height="9" rx="2" fill="#3b82f6" />
          <rect x="82" y="84" width="14" height="9" rx="2" fill="#94a3b8" />
        </svg>
      );

    // 17. Bangla Riddles & Quiz (Big Question Mark + Lightbulb + Trophy)
    case 'bangla-quiz':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="quizBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#quizBg)" />
          {/* Speech Bubble with Giant ? */}
          <rect x="22" y="20" width="76" height="62" rx="18" fill="#ffffff" />
          <polygon points="44,82 54,96 64,82" fill="#ffffff" />
          <text x="60" y="66" textAnchor="middle" fill="#ea580c" fontSize="46" fontWeight="900">?</text>
          {/* Floating Star & Bulb */}
          <circle cx="92" cy="28" r="12" fill="#fef08a" stroke="#ffffff" strokeWidth="2.5" />
          <text x="92" y="33" textAnchor="middle" fill="#b45309" fontSize="14" fontWeight="900">★</text>
          <circle cx="28" cy="86" r="11" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <path d="M23.5 86l3 3 5.5-6" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
      );

    // 18. My Bangladesh Map (Recognizable Bangladesh Map Silhouette + Travel Pins)
    case 'bangladesh-map':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#mapBg)" />
          {/* Stylized Bangladesh Map Silhouette */}
          <path
            d="M44 20l10 2 8 8 15 2 8 9-4 9 7 10-4 12 8 18-6 10-7-9-5-14-10 4-11 7-11-3-5-12 4-10-8-8 3-11 8-6-4-9 4-9z"
            fill="#4ade80"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Red Travel Location Pins */}
          <circle cx="55" cy="48" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <circle cx="55" cy="48" r="2.2" fill="#ffffff" />
          <circle cx="72" cy="64" r="5.5" fill="#facc15" stroke="#ffffff" strokeWidth="2" />
          <circle cx="48" cy="70" r="5.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
          {/* Dotted route */}
          <path d="M55 55l14 7M55 55l-6 11" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      );

    // 19. Bangla Status & Caption Hub (Quote Bubble + Heart)
    case 'bangla-status':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="statBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#statBg)" />
          {/* Chat / Status Bubble */}
          <rect x="20" y="24" width="80" height="58" rx="18" fill="#ffffff" />
          <polygon points="34,82 28,98 52,82" fill="#ffffff" />
          {/* Big Quotes + Text Lines */}
          <text x="34" y="54" fill="#7c3aed" fontSize="30" fontWeight="900">“</text>
          <rect x="46" y="42" width="42" height="5.5" rx="2.7" fill="#a855f7" />
          <rect x="36" y="55" width="52" height="5" rx="2.5" fill="#cbd5e1" />
          <rect x="36" y="66" width="34" height="5" rx="2.5" fill="#e2e8f0" />
          {/* Floating Red Heart */}
          <path
            d="M88 70c-4-7-14-4-14 3 0 7 14 15 14 15s14-8 14-15c0-7-10-10-14-3z"
            fill="#f43f5e"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
        </svg>
      );

    // 20. Poster & Photo Frame Studio (Golden Ornate Frame + Photo + Palette)
    case 'poster-studio':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="postBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#postBg)" />
          {/* Golden Frame */}
          <rect x="22" y="20" width="70" height="76" rx="10" fill="#facc15" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="30" y="28" width="54" height="60" rx="5" fill="#0ea5e9" />
          {/* Scenic Photo inside Frame */}
          <circle cx="44" cy="42" r="7" fill="#fef08a" />
          <polygon points="30,88 50,58 68,88" fill="#10b981" />
          <polygon points="52,88 70,64 84,88" fill="#059669" />
          {/* Paint Palette Corner */}
          <circle cx="88" cy="86" r="15" fill="#ffffff" stroke="#e11d48" strokeWidth="2.5" />
          <circle cx="83" cy="81" r="3" fill="#ef4444" />
          <circle cx="92" cy="81" r="3" fill="#3b82f6" />
          <circle cx="83" cy="91" r="3" fill="#22c55e" />
          <circle cx="92" cy="90" r="3" fill="#f59e0b" />
        </svg>
      );

    // 21. Content Creator Studio (Video Play Screen + Mic)
    case 'content-creator-studio':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="vidBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#vidBg)" />
          {/* Video Screen */}
          <rect x="18" y="26" width="76" height="54" rx="12" fill="#ffffff" />
          <rect x="24" y="32" width="64" height="42" rx="8" fill="#ef4444" />
          <polygon points="49,42 49,64 68,53" fill="#ffffff" />
          {/* Timeline Scrubber */}
          <rect x="20" y="87" width="60" height="7" rx="3.5" fill="#c7d2fe" />
          <rect x="20" y="87" width="32" height="7" rx="3.5" fill="#facc15" />
          {/* Studio Microphone */}
          <rect x="84" y="58" width="16" height="26" rx="8" fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="92" y1="84" x2="92" y2="96" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <line x1="84" y1="96" x2="100" y2="96" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    // 22. Golpo Ghor (Open Storybook + Bookmark + Stars)
    case 'golpo-ghor':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="bookBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#bookBg)" />
          {/* Open Book Cover */}
          <path d="M18 42c16-6 32-3 42 5 10-8 26-11 42-5v48c-16-6-32-3-42 5-10-8-26-11-42-5z" fill="#7c2d12" />
          {/* Cream Pages */}
          <path d="M22 38c14-5 28-2 38 6 10-8 24-11 38-6v46c-14-5-28-2-38 6-10-8-24-11-38-6z" fill="#fffbeb" />
          <line x1="60" y1="44" x2="60" y2="90" stroke="#d97706" strokeWidth="2" />
          {/* Story Lines */}
          <rect x="29" y="50" width="23" height="3.5" rx="1.7" fill="#f59e0b" />
          <rect x="29" y="59" width="21" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="29" y="67" width="23" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="68" y="50" width="23" height="3.5" rx="1.7" fill="#f59e0b" />
          <rect x="68" y="59" width="20" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="68" y="67" width="22" height="3" rx="1.5" fill="#cbd5e1" />
          {/* Ribbon Bookmark & Star */}
          <polygon points="78,36 86,36 86,56 82,51 78,56" fill="#ef4444" />
          <circle cx="60" cy="24" r="6" fill="#fde047" />
        </svg>
      );

    // 23. Age Calculator (Calendar + Birthday Cake Candle)
    case 'age-calc':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="ageBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#ageBg)" />
          {/* Calendar Sheet */}
          <rect x="22" y="24" width="76" height="74" rx="12" fill="#ffffff" />
          <rect x="22" y="24" width="76" height="22" rx="10" fill="#ef4444" />
          <rect x="22" y="36" width="76" height="10" fill="#ef4444" />
          {/* Rings */}
          <rect x="38" y="16" width="7" height="16" rx="3.5" fill="#1e293b" />
          <rect x="75" y="16" width="7" height="16" rx="3.5" fill="#1e293b" />
          {/* Big Date */}
          <text x="60" y="79" textAnchor="middle" fill="#0f172a" fontSize="31" fontWeight="900">25</text>
          <text x="60" y="92" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="800">বছর • মাস • দিন</text>
        </svg>
      );

    // 24. Love Test (Twin Vibrant Hearts + 100%)
    case 'love-test':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="loveBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#loveBg)" />
          {/* Big Glossy Heart */}
          <path
            d="M60 95S22 72 22 45c0-14 11-23 22-23 8 0 13 5 16 10 3-5 8-10 16-10 11 0 22 9 22 23 0 27-38 50-38 50z"
            fill="#ffffff"
          />
          <path
            d="M60 87S29 68 29 46c0-10 8-17 16-17 7 0 12 4 15 10 3-6 8-10 15-10 8 0 16 7 16 17 0 22-31 41-31 41z"
            fill="#fb7185"
          />
          <text x="60" y="61" textAnchor="middle" fill="#ffffff" fontSize="19" fontWeight="900">100%</text>
        </svg>
      );

    // 25. Random Picker Wheel (Colorful 8-Slice Spinning Wheel + Pointer)
    case 'random-picker':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="wheelBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#wheelBg)" />
          {/* Wheel Outer Rim */}
          <circle cx="60" cy="63" r="38" fill="#ffffff" />
          {/* 8 Colored Slices */}
          <path d="M60 63L60 29A34 34 0 0 1 84 39Z" fill="#ef4444" />
          <path d="M60 63L84 39A34 34 0 0 1 94 63Z" fill="#f59e0b" />
          <path d="M60 63L94 63A34 34 0 0 1 84 87Z" fill="#22c55e" />
          <path d="M60 63L84 87A34 34 0 0 1 60 97Z" fill="#06b6d4" />
          <path d="M60 63L60 97A34 34 0 0 1 36 87Z" fill="#3b82f6" />
          <path d="M60 63L36 87A34 34 0 0 1 26 63Z" fill="#8b5cf6" />
          <path d="M60 63L26 63A34 34 0 0 1 36 39Z" fill="#ec4899" />
          <path d="M60 63L36 39A34 34 0 0 1 60 29Z" fill="#facc15" />
          {/* Center Hub */}
          <circle cx="60" cy="63" r="10" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
          {/* Top Pointer Triangle */}
          <polygon points="60,34 51,18 69,18" fill="#facc15" stroke="#1e293b" strokeWidth="2" />
        </svg>
      );

    // 26. Life Receipt (Thermal Receipt + Clock + Barcode)
    case 'life-receipt':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="lifeBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#lifeBg)" />
          {/* Thermal Paper Receipt */}
          <path d="M29 18l6 5 6-5 6 5 6-5 7 5 7-5 6 5 6-5 6 5 6-5v84l-6-5-6 5-6-5-7 5-7-5-6 5-6-5-6 5-6-5-6 5z" fill="#ffffff" />
          {/* Clock Icon */}
          <circle cx="60" cy="40" r="12" fill="#e0e7ff" stroke="#4338ca" strokeWidth="2.5" />
          <path d="M60 34v6l4 3" stroke="#4338ca" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Receipt Lines */}
          <rect x="38" y="59" width="44" height="4" rx="2" fill="#94a3b8" />
          <rect x="38" y="68" width="34" height="4" rx="2" fill="#cbd5e1" />
          {/* Barcode */}
          {[38, 43, 47, 52, 55, 60, 64, 68, 73, 77].map((x, idx) => (
            <rect key={x} x={x} y="78" width={idx % 3 === 0 ? 3 : 1.8} height="13" fill="#0f172a" />
          ))}
        </svg>
      );

    // 27. Name Reveal (Sparkling Name Crest / Crystal Scroll)
    case 'name-reveal':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="nameBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#nameBg)" />
          {/* Glowing Crystal Medallion */}
          <circle cx="60" cy="60" r="34" fill="#ffffff" fillOpacity="0.16" stroke="#fde047" strokeWidth="3" />
          <circle cx="60" cy="60" r="25" fill="#ffffff" />
          <text x="60" y="68" textAnchor="middle" fill="#6d28d9" fontSize="22" fontWeight="900">নাম</text>
          {/* Sparkle Stars */}
          <path d="M90 22l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5z" fill="#fde047" />
          <path d="M26 78l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#f9a8d4" />
        </svg>
      );

    // 28. Palmistry AI (Open Hand Palm + Glowing Life/Heart/Head Lines)
    case 'palmistry-ai':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="palmBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#palmBg)" />
          {/* Scanner Corners */}
          <path d="M22 34V22h12M98 34V22H86M22 86v12h12M98 86v12H86" stroke="#fef08a" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Open Hand Silhouette */}
          <path
            d="M42 92V66l-9-11c-2.5-3-1-7 2.5-7.5 2.5-.4 5 1 7.5 4.5V34c0-3 2-5 4.5-5s4.5 2 4.5 5v20h2V28c0-3 2-5 4.5-5s4.5 2 4.5 5v26h2V31c0-3 2-5 4.5-5s4.5 2 4.5 5v25h2V38c0-3 2-5 4.5-5s4.5 2 4.5 5v33c0 13-9 21-22 21H42z"
            fill="#fef3c7"
            stroke="#92400e"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Glowing Palm Lines */}
          <path d="M47 64c8-4 18-4 27 1" stroke="#e11d48" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M47 72c9 0 18 3 25 8" stroke="#2563eb" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M51 66c6 8 7 15 5 22" stroke="#059669" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </svg>
      );

    // Fallback generic crisp icon
    default:
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#4f46e5" />
          <rect x="30" y="30" width="60" height="60" rx="14" fill="#ffffff" />
          <circle cx="60" cy="60" r="16" fill="#4f46e5" />
        </svg>
      );
  }
};
