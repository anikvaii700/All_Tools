import React from 'react';

interface SubToolVisualLogoProps {
  logoId: string;
  className?: string;
}

/**
 * Large, unmistakable, self-explanatory illustrated SVG logos for every sub-tool
 * across BD Online Portal, Ultra Digital Studio, All Form Fillup, PDF Toolkit,
 * and Content Creator Studio.
 */
export const SubToolVisualLogo: React.FC<SubToolVisualLogoProps> = ({
  logoId,
  className = 'w-20 h-20 sm:w-24 sm:h-24',
}) => {
  switch (logoId) {
    // =========================================================================
    // 1. BD ONLINE PORTAL CATEGORIES (12)
    // =========================================================================
    case 'gov-central':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stGov" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stGov)" />
          <circle cx="60" cy="33" r="15" fill="#006a4e" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="58" cy="33" r="7" fill="#f42a41" />
          <polygon points="24,62 60,47 96,62" fill="#ffffff" />
          <rect x="26" y="62" width="68" height="5" rx="1.5" fill="#d1fae5" />
          <rect x="31" y="67" width="8" height="24" rx="1.5" fill="#ffffff" />
          <rect x="46" y="67" width="8" height="24" rx="1.5" fill="#ffffff" />
          <rect x="66" y="67" width="8" height="24" rx="1.5" fill="#ffffff" />
          <rect x="81" y="67" width="8" height="24" rx="1.5" fill="#ffffff" />
          <rect x="22" y="91" width="76" height="8" rx="3" fill="#ecfdf5" />
        </svg>
      );

    case 'nid-birth':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stNid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stNid)" />
          {/* Smart NID Card */}
          <rect x="18" y="30" width="84" height="56" rx="10" fill="#ffffff" />
          <rect x="18" y="30" width="84" height="12" rx="6" fill="#16a34a" />
          <circle cx="90" cy="36" r="3.5" fill="#ef4444" />
          {/* Photo */}
          <rect x="25" y="47" width="22" height="28" rx="4" fill="#bae6fd" />
          <circle cx="36" cy="56" r="5" fill="#1d4ed8" />
          <path d="M28 72c1.5-6 14.5-6 16 0" fill="#1d4ed8" />
          {/* Smart Chip + Lines */}
          <rect x="53" y="48" width="13" height="10" rx="2" fill="#facc15" stroke="#b45309" strokeWidth="1.2" />
          <rect x="70" y="50" width="24" height="4.5" rx="2" fill="#64748b" />
          <rect x="53" y="64" width="40" height="4" rx="2" fill="#cbd5e1" />
          <rect x="53" y="72" width="32" height="4" rx="2" fill="#e2e8f0" />
          {/* Verified Badge */}
          <circle cx="92" cy="84" r="13" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M86 84l4 4 8-8.5" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'passport-police':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stPass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stPass)" />
          {/* Green Bangladesh e-Passport Booklet */}
          <rect x="26" y="18" width="58" height="82" rx="8" fill="#065f46" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="55" cy="49" r="15" fill="none" stroke="#facc15" strokeWidth="2.5" />
          <ellipse cx="55" cy="49" rx="7" ry="15" fill="none" stroke="#facc15" strokeWidth="1.8" />
          <line x1="40" y1="49" x2="70" y2="49" stroke="#facc15" strokeWidth="1.8" />
          <rect x="38" y="72" width="34" height="5" rx="2.5" fill="#facc15" />
          <rect x="44" y="82" width="22" height="7" rx="2" fill="none" stroke="#facc15" strokeWidth="1.8" />
          <circle cx="55" cy="85.5" r="2" fill="#facc15" />
          {/* Police Shield Badge */}
          <path d="M88 58l14 6v13c0 10-6 17-14 21-8-4-14-11-14-21V64z" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M83 77l4 4 7-8" stroke="#ffffff" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'land-mutation':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stLand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stLand)" />
          {/* Land Plot Map Isometric */}
          <polygon points="18,84 44,64 102,72 78,96" fill="#86efac" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="46" y1="65" x2="62" y2="93" stroke="#15803d" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="31" y1="74" x2="90" y2="84" stroke="#15803d" strokeWidth="2" strokeDasharray="4 2" />
          {/* Red Location Pin */}
          <path d="M60 20c-13 0-22 9-22 21 0 15 22 36 22 36s22-21 22-36c0-12-9-21-22-21z" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
          <circle cx="60" cy="41" r="8" fill="#ffffff" />
        </svg>
      );

    case 'education-results':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stEdu" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stEdu)" />
          {/* Graduation Cap */}
          <polygon points="60,20 98,35 60,50 22,35" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
          <path d="M36 41v12c0 5 11 9 24 9s24-4 24-9V41" fill="#334155" />
          <line x1="92" y1="37" x2="92" y2="54" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
          {/* Result Card A+ */}
          <rect x="28" y="64" width="64" height="36" rx="8" fill="#ffffff" />
          <text x="50" y="88" textAnchor="middle" fill="#16a34a" fontSize="22" fontWeight="900">A+</text>
          <rect x="68" y="73" width="18" height="4.5" rx="2" fill="#94a3b8" />
          <rect x="68" y="83" width="14" height="4.5" rx="2" fill="#cbd5e1" />
        </svg>
      );

    case 'tax-vat-business':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stTax" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stTax)" />
          {/* Tax Certificate Document */}
          <rect x="24" y="20" width="64" height="78" rx="9" fill="#ffffff" />
          <rect x="32" y="29" width="48" height="16" rx="5" fill="#0f766e" />
          <text x="56" y="41" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">TIN • VAT</text>
          <rect x="33" y="53" width="44" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="33" y="63" width="36" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="33" y="73" width="28" height="4.5" rx="2" fill="#cbd5e1" />
          {/* Golden % Seal */}
          <circle cx="84" cy="82" r="18" fill="#facc15" stroke="#ffffff" strokeWidth="3" />
          <text x="84" y="89" textAnchor="middle" fill="#78350f" fontSize="20" fontWeight="900">%</text>
        </svg>
      );

    case 'transport-license':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stCar" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stCar)" />
          {/* Bright Car Silhouette */}
          <path d="M26 62l9-20c2-4 6-6 11-6h28c5 0 9 2 11 6l9 20z" fill="#ffffff" />
          <path d="M35 58l6-14h38l6 14z" fill="#38bdf8" />
          <rect x="20" y="60" width="80" height="24" rx="8" fill="#ffffff" />
          {/* Headlights */}
          <circle cx="32" cy="72" r="5" fill="#facc15" />
          <circle cx="88" cy="72" r="5" fill="#facc15" />
          <rect x="46" y="69" width="28" height="7" rx="2.5" fill="#1e293b" />
          {/* Wheels */}
          <rect x="26" y="82" width="16" height="12" rx="4" fill="#1e293b" />
          <rect x="78" y="82" width="16" height="12" rx="4" fill="#1e293b" />
        </svg>
      );

    case 'health-allowance':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stHealth" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stHealth)" />
          {/* Big White Heart + Medical Plus */}
          <path
            d="M60 95S22 72 22 45c0-14 11-23 22-23 8 0 13 5 16 10 3-5 8-10 16-10 11 0 22 9 22 23 0 27-38 50-38 50z"
            fill="#ffffff"
          />
          <rect x="54" y="38" width="12" height="34" rx="3" fill="#e11d48" />
          <rect x="43" y="49" width="34" height="12" rx="3" fill="#e11d48" />
        </svg>
      );

    case 'utility-bills':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stUtil" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stUtil)" />
          {/* Electricity Lightning */}
          <circle cx="60" cy="40" r="21" fill="#fef08a" stroke="#ffffff" strokeWidth="2.5" />
          <polygon points="63,25 49,43 59,43 56,56 71,38 61,38" fill="#d97706" />
          {/* Water Droplet Left */}
          <circle cx="38" cy="80" r="18" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M38 69c6 8 9 12 9 16a9 9 0 1 1-18 0c0-4 3-8 9-16z" fill="#ffffff" />
          {/* Gas Flame Right */}
          <circle cx="82" cy="80" r="18" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M82 68c7 7 9 12 9 16a9 9 0 1 1-18 0c0-5 4-9 9-16z" fill="#fde047" />
        </svg>
      );

    case 'banking-mfs':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stBank" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stBank)" />
          {/* Smartphone MFS */}
          <rect x="32" y="18" width="56" height="84" rx="12" fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="38" y="28" width="44" height="60" rx="5" fill="#ffffff" />
          {/* Big Taka Coin */}
          <circle cx="60" cy="54" r="17" fill="#facc15" stroke="#16a34a" strokeWidth="2.5" />
          <text x="60" y="61" textAnchor="middle" fill="#854d0e" fontSize="21" fontWeight="900">৳</text>
          {/* Send bar */}
          <rect x="44" y="76" width="32" height="7" rx="3.5" fill="#10b981" />
        </svg>
      );

    case 'private-services':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stPriv" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stPriv)" />
          {/* Globe + Parcel Box */}
          <circle cx="52" cy="54" r="28" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
          <ellipse cx="52" cy="54" rx="13" ry="28" fill="none" stroke="#ffffff" strokeWidth="2.2" />
          <line x1="24" y1="54" x2="80" y2="54" stroke="#ffffff" strokeWidth="2.2" />
          {/* Parcel Delivery Box */}
          <rect x="64" y="62" width="36" height="32" rx="6" fill="#fbbf24" stroke="#ffffff" strokeWidth="2.5" />
          <line x1="82" y1="62" x2="82" y2="94" stroke="#b45309" strokeWidth="3" />
          <line x1="64" y1="74" x2="100" y2="74" stroke="#b45309" strokeWidth="2.5" />
        </svg>
      );

    case 'online-jobs':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stJobs" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stJobs)" />
          {/* Executive Briefcase */}
          <path d="M44 34v-6a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v6" fill="none" stroke="#ffffff" strokeWidth="4" />
          <rect x="20" y="34" width="80" height="58" rx="12" fill="#ffffff" />
          <path d="M20 58h80" stroke="#e2e8f0" strokeWidth="3" />
          <rect x="51" y="51" width="18" height="14" rx="4" fill="#facc15" stroke="#1e293b" strokeWidth="2" />
          <text x="60" y="82" textAnchor="middle" fill="#1d4ed8" fontSize="14" fontWeight="900">JOBS</text>
        </svg>
      );

    // =========================================================================
    // 2. ULTRA DIGITAL STUDIO SUB-TOOLS (4)
    // =========================================================================
    case 'ai-photo-studio':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stAiPhoto" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stAiPhoto)" />
          {/* Passport Photo Card */}
          <rect x="20" y="19" width="44" height="54" rx="7" fill="#ffffff" transform="rotate(-6 42 46)" />
          <rect x="24" y="23" width="36" height="46" rx="4" fill="#38bdf8" transform="rotate(-6 42 46)" />
          <circle cx="42" cy="39" r="8.5" fill="#fef3c7" />
          <path d="M29 64c2-11 24-11 26 0" fill="#1e293b" />
          {/* Studio Camera + Magic Sparkles */}
          <rect x="44" y="54" width="56" height="42" rx="10" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="72" cy="75" r="14" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="3" />
          <circle cx="72" cy="75" r="6.5" fill="#0f172a" />
          <circle cx="69" cy="72" r="2.2" fill="#ffffff" />
          {/* Sparkle */}
          <path d="M90 22l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fde047" />
        </svg>
      );

    case 'doc-scanner':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stScan" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stScan)" />
          {/* Corner Scan Brackets */}
          <path d="M22 36V22h14M98 36V22H84M22 84v14h14M98 84v14H84" stroke="#fef08a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Crisp White A4 Document */}
          <rect x="32" y="24" width="56" height="72" rx="6" fill="#ffffff" />
          <rect x="40" y="34" width="28" height="5" rx="2.5" fill="#0f766e" />
          <rect x="40" y="45" width="40" height="4" rx="2" fill="#cbd5e1" />
          <rect x="40" y="54" width="38" height="4" rx="2" fill="#cbd5e1" />
          <rect x="40" y="70" width="34" height="4" rx="2" fill="#cbd5e1" />
          <rect x="40" y="79" width="40" height="4" rx="2" fill="#cbd5e1" />
          {/* Glowing Green Laser Scan Line */}
          <line x1="22" y1="62" x2="98" y2="62" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );

    case 'id-card':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stIdJoin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stIdJoin)" />
          {/* Front ID Card (Top) */}
          <rect x="24" y="20" width="72" height="36" rx="6" fill="#ffffff" />
          <rect x="24" y="20" width="72" height="8" rx="4" fill="#16a34a" />
          <rect x="30" y="32" width="14" height="18" rx="2.5" fill="#38bdf8" />
          <circle cx="37" cy="38" r="3.5" fill="#ffffff" />
          <rect x="50" y="33" width="36" height="4" rx="2" fill="#64748b" />
          <rect x="50" y="42" width="26" height="4" rx="2" fill="#cbd5e1" />
          {/* Back ID Card (Bottom) */}
          <rect x="24" y="64" width="72" height="36" rx="6" fill="#ffffff" />
          <rect x="24" y="71" width="72" height="7" fill="#1e293b" />
          <rect x="32" y="84" width="26" height="4" rx="2" fill="#94a3b8" />
          <rect x="64" y="83" width="24" height="9" rx="1.5" fill="#cbd5e1" />
        </svg>
      );

    case 'two-person':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="stJoint" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#stJoint)" />
          {/* Joint Photo Frame */}
          <rect x="18" y="24" width="84" height="72" rx="10" fill="#ffffff" />
          <rect x="24" y="30" width="72" height="60" rx="6" fill="#bae6fd" />
          {/* Person 1 (Left) */}
          <circle cx="44" cy="50" r="10" fill="#fde68a" stroke="#1e293b" strokeWidth="1.5" />
          <path d="M27 89c2-16 32-16 34 0z" fill="#1d4ed8" />
          {/* Person 2 (Right) */}
          <circle cx="76" cy="50" r="10" fill="#fed7aa" stroke="#1e293b" strokeWidth="1.5" />
          <path d="M59 89c2-16 32-16 34 0z" fill="#be185d" />
        </svg>
      );

    // =========================================================================
    // 3. ALL FORM FILLUP CATEGORIES (9)
    // =========================================================================
    case 'form-election':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#059669" />
          <rect x="24" y="20" width="72" height="80" rx="9" fill="#ffffff" />
          <rect x="24" y="20" width="72" height="18" rx="7" fill="#047857" />
          <text x="60" y="33" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">NID • ফরম</text>
          <rect x="33" y="46" width="18" height="22" rx="3" fill="#bae6fd" />
          <circle cx="42" cy="54" r="4" fill="#0369a1" />
          <rect x="57" y="48" width="30" height="4.5" rx="2" fill="#64748b" />
          <rect x="57" y="58" width="24" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="33" y="76" width="54" height="4.5" rx="2" fill="#cbd5e1" />
          <circle cx="88" cy="86" r="13" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M83 86l3.5 3.5 7-7" stroke="#ffffff" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        </svg>
      );

    case 'form-housing':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#2563eb" />
          {/* House Roof & Body */}
          <polygon points="60,22 22,52 98,52" fill="#fde047" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="30" y="52" width="60" height="44" rx="5" fill="#ffffff" />
          <rect x="51" y="68" width="18" height="28" rx="3" fill="#2563eb" />
          <rect x="36" y="62" width="10" height="10" rx="2" fill="#38bdf8" />
          <rect x="74" y="62" width="10" height="10" rx="2" fill="#38bdf8" />
        </svg>
      );

    case 'form-business':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#d97706" />
          <rect x="24" y="46" width="72" height="50" rx="6" fill="#ffffff" />
          <path d="M18 46l6-22h72l6 22z" fill="#ef4444" />
          <path d="M36 24l-3 22h16l1-22zM70 24l1 22h16l-3-22z" fill="#ffffff" />
          <circle cx="60" cy="72" r="15" fill="#10b981" />
          <text x="60" y="79" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="900">৳</text>
        </svg>
      );

    case 'form-education':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#7c3aed" />
          <polygon points="60,24 98,40 60,56 22,40" fill="#ffffff" />
          <path d="M36 46v16c0 6 11 10 24 10s24-4 24-10V46" fill="#ede9fe" />
          <rect x="34" y="76" width="52" height="22" rx="6" fill="#facc15" />
          <text x="60" y="91" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="900">ভর্তি ফরম</text>
        </svg>
      );

    case 'form-certificate':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#0d9488" />
          <rect x="20" y="24" width="80" height="62" rx="8" fill="#ffffff" stroke="#fde047" strokeWidth="3" />
          <rect x="32" y="36" width="56" height="6" rx="3" fill="#0f766e" />
          <rect x="36" y="48" width="48" height="4" rx="2" fill="#cbd5e1" />
          <rect x="36" y="57" width="40" height="4" rx="2" fill="#cbd5e1" />
          {/* Ribbon Seal */}
          <polygon points="72,82 66,102 76,97 86,102 80,82" fill="#ef4444" />
          <circle cx="76" cy="76" r="13" fill="#facc15" stroke="#ffffff" strokeWidth="2.5" />
        </svg>
      );

    case 'form-job':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#4f46e5" />
          <path d="M44 36v-6a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v6" fill="none" stroke="#ffffff" strokeWidth="4" />
          <rect x="22" y="36" width="76" height="56" rx="11" fill="#ffffff" />
          <rect x="52" y="54" width="16" height="14" rx="3.5" fill="#facc15" />
          <path d="M22 61h76" stroke="#e2e8f0" strokeWidth="2.5" />
        </svg>
      );

    case 'form-vehicle':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#e11d48" />
          <path d="M26 62l9-20c2-4 6-6 11-6h28c5 0 9 2 11 6l9 20z" fill="#ffffff" />
          <path d="M35 58l6-14h38l6 14z" fill="#bae6fd" />
          <rect x="20" y="60" width="80" height="24" rx="8" fill="#ffffff" />
          <circle cx="32" cy="72" r="5" fill="#facc15" />
          <circle cx="88" cy="72" r="5" fill="#facc15" />
          <rect x="26" y="82" width="16" height="12" rx="4" fill="#1e293b" />
          <rect x="78" y="82" width="16" height="12" rx="4" fill="#1e293b" />
        </svg>
      );

    case 'form-lending':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#ea580c" />
          {/* Money Note + Taka */}
          <rect x="20" y="34" width="80" height="52" rx="10" fill="#ffffff" stroke="#fde047" strokeWidth="3" />
          <circle cx="60" cy="60" r="18" fill="#10b981" />
          <text x="60" y="67" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900">৳</text>
          <circle cx="31" cy="60" r="4" fill="#f59e0b" />
          <circle cx="89" cy="60" r="4" fill="#f59e0b" />
        </svg>
      );

    case 'form-custom':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#1e293b" />
          <rect x="26" y="20" width="60" height="78" rx="9" fill="#ffffff" />
          <rect x="35" y="32" width="38" height="5" rx="2.5" fill="#6366f1" />
          <rect x="35" y="44" width="42" height="4" rx="2" fill="#cbd5e1" />
          <rect x="35" y="54" width="32" height="4" rx="2" fill="#cbd5e1" />
          <circle cx="84" cy="82" r="17" fill="#facc15" stroke="#ffffff" strokeWidth="3" />
          <path d="M84 74v16M76 82h16" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    // =========================================================================
    // 4. PDF TOOLKIT SUB-TOOLS (10)
    // =========================================================================
    case 'pdf-edit-text':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#e11d48" />
          <rect x="24" y="18" width="62" height="82" rx="8" fill="#ffffff" />
          <rect x="33" y="30" width="42" height="6" rx="3" fill="#e11d48" />
          <rect x="33" y="44" width="44" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="33" y="54" width="36" height="4.5" rx="2" fill="#fde047" />
          <rect x="33" y="64" width="40" height="4.5" rx="2" fill="#cbd5e1" />
          {/* Writing Pencil */}
          <g transform="translate(86 64) rotate(32)">
            <rect x="-6" y="-26" width="12" height="42" rx="3" fill="#facc15" stroke="#1e293b" strokeWidth="1.8" />
            <polygon points="-6,16 6,16 0,28" fill="#1e293b" />
          </g>
        </svg>
      );

    case 'pdf-merge':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#dc2626" />
          <rect x="20" y="24" width="36" height="48" rx="6" fill="#fecdd3" />
          <rect x="64" y="24" width="36" height="48" rx="6" fill="#fecdd3" />
          <path d="M38 74v8h44v-8M60 82v14m-6-6l6 6 6-6" stroke="#fde047" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="38" y="36" width="44" height="48" rx="7" fill="#ffffff" stroke="#dc2626" strokeWidth="2.5" />
          <text x="60" y="66" textAnchor="middle" fill="#dc2626" fontSize="16" fontWeight="900">PDF+</text>
        </svg>
      );

    case 'pdf-split':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#4f46e5" />
          <rect x="20" y="26" width="34" height="68" rx="6" fill="#ffffff" />
          <rect x="66" y="26" width="34" height="68" rx="6" fill="#ffffff" />
          <line x1="60" y1="18" x2="60" y2="102" stroke="#fde047" strokeWidth="3.5" strokeDasharray="6 4" />
          <circle cx="60" cy="60" r="14" fill="#facc15" stroke="#ffffff" strokeWidth="2.5" />
          <text x="60" y="66" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="900">✂</text>
        </svg>
      );

    case 'pdf-compress':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#059669" />
          <rect x="36" y="34" width="48" height="52" rx="8" fill="#ffffff" />
          <text x="60" y="66" textAnchor="middle" fill="#059669" fontSize="16" fontWeight="900">KB</text>
          {/* 4 Inward Arrows */}
          <path d="M20 20l14 14m-9 0h9v-9M100 20L86 34m9 0h-9v-9M20 100l14-14m-9 0h9v9M100 100L86 86m9 0h-9v9" stroke="#fde047" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'pdf-images-to-pdf':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#d97706" />
          {/* Image */}
          <rect x="18" y="30" width="42" height="44" rx="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="31" cy="43" r="5" fill="#fde047" />
          <polygon points="20,72 34,52 46,72" fill="#10b981" />
          {/* Arrow */}
          <path d="M56 58h14m-5-5l5 5-5 5" stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* PDF */}
          <rect x="66" y="44" width="38" height="52" rx="7" fill="#ffffff" />
          <rect x="70" y="62" width="30" height="16" rx="4" fill="#dc2626" />
          <text x="85" y="74" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">PDF</text>
        </svg>
      );

    case 'pdf-to-images':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#7c3aed" />
          {/* PDF */}
          <rect x="18" y="26" width="38" height="52" rx="7" fill="#ffffff" />
          <rect x="22" y="44" width="30" height="16" rx="4" fill="#dc2626" />
          <text x="37" y="56" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="900">PDF</text>
          {/* Arrow */}
          <path d="M56 58h12m-4-4l4 4-4 4" stroke="#fde047" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Image */}
          <rect x="62" y="46" width="42" height="46" rx="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="75" cy="59" r="5" fill="#fde047" />
          <polygon points="64,90 78,68 92,90" fill="#22c55e" />
        </svg>
      );

    case 'pdf-rotate':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#0284c7" />
          <rect x="34" y="34" width="52" height="52" rx="8" fill="#ffffff" />
          <path d="M60 22a38 38 0 1 1-30 15" fill="none" stroke="#fde047" strokeWidth="5" strokeLinecap="round" />
          <polygon points="60,14 72,22 60,30" fill="#fde047" />
          <text x="60" y="66" textAnchor="middle" fill="#0284c7" fontSize="17" fontWeight="900">90°</text>
        </svg>
      );

    case 'pdf-page-numbers':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#0d9488" />
          <rect x="28" y="20" width="64" height="80" rx="8" fill="#ffffff" />
          <rect x="38" y="32" width="44" height="5" rx="2.5" fill="#cbd5e1" />
          <rect x="38" y="43" width="38" height="5" rx="2.5" fill="#cbd5e1" />
          <rect x="38" y="54" width="44" height="5" rx="2.5" fill="#cbd5e1" />
          <rect x="36" y="70" width="48" height="22" rx="6" fill="#0d9488" />
          <text x="60" y="86" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900">1 • 2 • 3</text>
        </svg>
      );

    case 'pdf-watermark':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#2563eb" />
          <rect x="26" y="18" width="68" height="84" rx="8" fill="#ffffff" />
          <g transform="rotate(-32 60 60)">
            <rect x="22" y="48" width="76" height="24" rx="5" fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="4 2" />
            <text x="60" y="64" textAnchor="middle" fill="#1d4ed8" fontSize="12" fontWeight="900">STAMP</text>
          </g>
        </svg>
      );

    case 'pdf-metadata':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#334155" />
          <rect x="26" y="18" width="68" height="84" rx="8" fill="#ffffff" />
          <circle cx="60" cy="48" r="16" fill="#3b82f6" />
          <text x="60" y="55" textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900">i</text>
          <rect x="38" y="72" width="44" height="5" rx="2.5" fill="#64748b" />
          <rect x="44" y="83" width="32" height="4.5" rx="2" fill="#cbd5e1" />
        </svg>
      );

    // =========================================================================
    // 5. CREATOR STUDIO SUB-TOOLS (8)
    // =========================================================================
    case 'creator-niche':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#4f46e5" />
          <circle cx="60" cy="60" r="34" fill="#ffffff" />
          <circle cx="60" cy="60" r="22" fill="#e0e7ff" />
          <polygon points="60,30 68,60 60,90 52,60" fill="#ef4444" />
          <circle cx="60" cy="60" r="5" fill="#1e293b" />
        </svg>
      );

    case 'creator-topic':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#2563eb" />
          <circle cx="54" cy="54" r="24" fill="#ffffff" stroke="#fde047" strokeWidth="4" />
          <line x1="72" y1="72" x2="94" y2="94" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" />
          <path d="M54 40c5 5 7 9 7 13a7 7 0 1 1-14 0c0-4 3-8 7-13z" fill="#f97316" />
        </svg>
      );

    case 'creator-script':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#e11d48" />
          <rect x="26" y="20" width="68" height="80" rx="9" fill="#ffffff" />
          <rect x="35" y="32" width="38" height="6" rx="3" fill="#e11d48" />
          <rect x="35" y="46" width="50" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="35" y="56" width="44" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="35" y="66" width="48" height="4.5" rx="2" fill="#cbd5e1" />
          <rect x="35" y="76" width="30" height="4.5" rx="2" fill="#cbd5e1" />
        </svg>
      );

    case 'creator-video_ai':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#7c3aed" />
          <rect x="20" y="42" width="80" height="52" rx="9" fill="#ffffff" />
          <rect x="20" y="26" width="80" height="18" rx="6" fill="#1e293b" />
          <path d="M32 26l8 18M52 26l8 18M72 26l8 18" stroke="#ffffff" strokeWidth="4" />
          <polygon points="51,54 51,80 74,67" fill="#7c3aed" />
        </svg>
      );

    case 'creator-video_editor':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#059669" />
          <rect x="20" y="22" width="80" height="44" rx="8" fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
          <polygon points="52,33 52,55 72,44" fill="#34d399" />
          {/* Timeline Tracks */}
          <rect x="20" y="74" width="34" height="10" rx="3" fill="#fde047" />
          <rect x="58" y="74" width="42" height="10" rx="3" fill="#38bdf8" />
          <rect x="20" y="88" width="80" height="8" rx="3" fill="#ffffff" />
          <line x1="56" y1="70" x2="56" y2="100" stroke="#ef4444" strokeWidth="3.5" />
        </svg>
      );

    case 'creator-thumbnail':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#d97706" />
          <rect x="18" y="28" width="84" height="64" rx="10" fill="#ffffff" />
          <rect x="24" y="34" width="72" height="52" rx="6" fill="#ef4444" />
          <polygon points="50,48 50,72 72,60" fill="#ffffff" />
          <rect x="28" y="38" width="22" height="8" rx="2" fill="#facc15" />
        </svg>
      );

    case 'creator-repurpose':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#0891b2" />
          <circle cx="34" cy="60" r="14" fill="#ffffff" />
          <circle cx="84" cy="34" r="12" fill="#fde047" />
          <circle cx="84" cy="60" r="12" fill="#34d399" />
          <circle cx="84" cy="86" r="12" fill="#f472b6" />
          <path d="M48 55l24-16M48 60h24M48 65l24 16" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'creator-seo':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
          <rect x="8" y="8" width="104" height="104" rx="26" fill="#0d9488" />
          <rect x="24" y="70" width="14" height="26" rx="4" fill="#ccfbf1" />
          <rect x="44" y="56" width="14" height="40" rx="4" fill="#5eead4" />
          <rect x="64" y="42" width="14" height="54" rx="4" fill="#fde047" />
          <rect x="84" y="28" width="14" height="68" rx="4" fill="#ffffff" />
          <path d="M26 56l24-18 18 8 24-22m-12 0h12v12" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

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
