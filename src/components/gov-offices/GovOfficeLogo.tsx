import React, { useState } from 'react';
import { OfficeId } from './types';

interface GovOfficeLogoProps {
  officeId: OfficeId;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
}

// 1:1 Mapping to the 9 official logos uploaded by the user
export const GOV_OFFICE_LOGOS: Record<OfficeId, { primary: string; fallback: string; title: string }> = {
  // 1. নির্বাচন অফিস (বাংলাদেশ নির্বাচন কমিশন - লাল ব্যালট বক্স "নি ক")
  'election-commission': {
    primary: '/assets/gov-logos/election-commission.jpg',
    fallback: '/assets/aistudio/______________4bef3d95.jpg',
    title: 'বাংলাদেশ নির্বাচন কমিশন লোগো',
  },
  // 2. সমাজ সেবা অফিস (সমাজসেবা অধিদপ্তর - হাতে ধরা লাল হৃদয় প্রতীক)
  'social-services': {
    primary: '/assets/gov-logos/social-services.jpg',
    fallback: '/assets/aistudio/_______________6a5b9925.jpg',
    title: 'সমাজসেবা অধিদপ্তর লোগো',
  },
  // 3. পাসপোর্ট অফিস (বহিরাগমন ও পাসপোর্ট অধিদপ্তর / সরকারি গোল সিলমোহর)
  'passport-immigration': {
    primary: '/assets/gov-logos/passport-immigration.png',
    fallback: '/assets/aistudio/______________c1defb20.png',
    title: 'বহিরাগমন ও পাসপোর্ট অধিদপ্তর লোগো',
  },
  // 4. ভূমি অফিস (ভূমি মন্ত্রণালয় - সবুজ বৃত্তে "ভূমি" ও শস্যখেত)
  'land-ministry': {
    primary: '/assets/gov-logos/land-ministry.png',
    fallback: '/assets/aistudio/__________e5a80cf2.png',
    title: 'ভূমি মন্ত্রণালয় লোগো',
  },
  // 5. জন্ম ও মৃত্যু নিবন্ধন অফিস (রেজিস্ট্রার জেনারেলের কার্যালয়, BDRIS)
  'bdris-birth-death': {
    primary: '/assets/gov-logos/bdris-birth-death.png',
    fallback: '/assets/aistudio/______________________8bac462d.png',
    title: 'জন্ম ও মৃত্যু নিবন্ধন কার্যালয় লোগো',
  },
  // 6. কর ও ভ্যাট অফিস (জাতীয় রাজস্ব বোর্ড / BANGLADESH CUSTOMS & VAT)
  'nbr-tax': {
    primary: '/assets/gov-logos/nbr-tax.png',
    fallback: '/assets/aistudio/________________857cf0fa.png',
    title: 'জাতীয় রাজস্ব বোর্ড (কর ও ভ্যাট) লোগো',
  },
  // 7. বিআরটিএ অফিস (বাংলাদেশ রোড ট্রান্সপোর্ট অথরিটি - বিআরটিএ)
  'brta': {
    primary: '/assets/gov-logos/brta.png',
    fallback: '/assets/aistudio/_____________744c11fa.png',
    title: 'বাংলাদেশ রোড ট্রান্সপোর্ট অথরিটি (BRTA) লোগো',
  },
  // 8. পুলিশ সেবা অফিস (বাংলাদেশ পুলিশ - শাপলা ও ধানের শীষ প্রতীক)
  'police-clearance': {
    primary: '/assets/gov-logos/police-clearance.png',
    fallback: '/assets/aistudio/________________a20d52f1.png',
    title: 'বাংলাদেশ পুলিশ লোগো',
  },
  // 9. শিক্ষা বোর্ড অফিস (মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড - শিক্ষা শক্তি প্রগতি)
  'education-board': {
    primary: '/assets/gov-logos/education-board.png',
    fallback: '/assets/aistudio/__________________7cf6e853.png',
    title: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড লোগো',
  },
};

export const GovOfficeLogo: React.FC<GovOfficeLogoProps> = ({
  officeId,
  className = '',
  size = 'lg',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);
  const logoInfo = GOV_OFFICE_LOGOS[officeId];

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28 sm:w-32 sm:h-32',
    xl: 'w-36 h-36 sm:w-40 sm:h-40',
  };

  const dim = sizeClasses[size] || sizeClasses.lg;

  if (!logoInfo) return null;

  return (
    <div
      className={`relative flex items-center justify-center p-1.5 transition-transform duration-300 ${dim} ${className}`}
    >
      <img
        src={hasError ? logoInfo.fallback : logoInfo.primary}
        alt={alt || logoInfo.title}
        onError={() => {
          if (!hasError) setHasError(true);
        }}
        loading="lazy"
        className="w-full h-full object-contain filter drop-shadow-md select-none transition-all duration-300"
      />
    </div>
  );
};
