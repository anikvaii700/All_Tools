import React from 'react';
import { DocumentStyle, TemplateId } from './types';

interface DocumentPreviewProps {
  content: string;
  templateId: TemplateId;
  style: DocumentStyle;
  language: 'bn' | 'en';
  isAiEnhanced?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  content,
  templateId,
  style,
  language,
  isAiEnhanced,
}) => {
  // Margin class
  const marginClasses = {
    compact: 'p-8 sm:p-10', // ~0.5 inch
    normal: 'p-10 sm:p-14', // ~0.75-1 inch
    wide: 'p-12 sm:p-16',   // ~1.25 inch
  }[style.margin];

  // Font family class
  const fontClasses = {
    noto: 'font-sans', // uses Noto Sans Bengali
    hind: 'font-sans tracking-tight',
    kalpurush: 'font-serif',
    solaiman: 'font-sans',
    tiro: 'font-serif',
    sans: 'font-sans',
    serif: 'font-serif',
  }[style.fontFamily] || 'font-sans';

  // Alignment class
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[style.alignment];

  // Template specific accents
  const getTemplateHeader = () => {
    switch (templateId) {
      case 'modern-bn':
        return (
          <div className="border-b-2 border-slate-700 pb-3 mb-6 flex justify-between items-center text-xs text-slate-500 uppercase tracking-wider font-semibold">
            <span>অফিসিয়াল পত্র / দাপ্তরিক আবেদন</span>
            <span>The MoSaFa Application Standard</span>
          </div>
        );
      case 'school-college':
        return (
          <div className="border-b border-indigo-200 pb-2 mb-6 flex justify-between items-center text-[11px] text-indigo-700 font-medium">
            <span>শিক্ষা প্রতিষ্ঠান বিভাগীয় আবেদনপত্র</span>
            <span>Academic Division</span>
          </div>
        );
      case 'office-leave':
        return (
          <div className="border-b border-emerald-300 pb-2.5 mb-6 flex justify-between items-center text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">
            <span>Corporate Leave Application</span>
            <span>Internal HR Reference</span>
          </div>
        );
      case 'complaint-letter':
        return (
          <div className="border-b-2 border-rose-500 pb-2.5 mb-6 flex justify-between items-center text-[11px] text-rose-700 font-bold tracking-wide">
            <span>নাগরিক অভিযোগপত্র / প্রতিকারের আবেদন</span>
            <span>Official Grievance Redress</span>
          </div>
        );
      case 'job-application':
        return (
          <div className="border-b border-slate-300 pb-3 mb-6 flex justify-between items-center text-xs text-slate-600 font-semibold tracking-wider uppercase">
            <span>Formal Job Application & Cover Letter</span>
            <span>Confidential</span>
          </div>
        );
      case 'english-official':
        return (
          <div className="border-b border-slate-800 pb-3 mb-6 flex justify-between items-center text-xs text-slate-700 font-bold tracking-widest uppercase">
            <span>Official Correspondence</span>
            <span>Formal Letter</span>
          </div>
        );
      default:
        return null;
    }
  };

  const lines = content.split('\n');

  return (
    <div className="w-full flex justify-center py-2 sm:py-4">
      {/* A4 Sheet Container */}
      <div
        id="a4-application-document-sheet"
        className={`bg-white text-slate-900 shadow-xl border border-slate-200 w-full max-w-[794px] min-h-[1123px] relative flex flex-col justify-between transition-all ${marginClasses} ${fontClasses}`}
        style={{
          fontSize: `${style.fontSize}px`,
          lineHeight: style.lineSpacing,
          fontWeight: style.bold ? 'bold' : 'normal',
          fontStyle: style.italic ? 'italic' : 'normal',
          textDecoration: style.underline ? 'underline' : 'none',
        }}
      >
        {/* Template Header if any */}
        <div>
          {getTemplateHeader()}

          {/* AI or Template Source Badge (hidden during print) */}
          <div className="print:hidden absolute top-3 right-4 flex items-center gap-1.5 opacity-60 text-[10px]">
            {isAiEnhanced ? (
              <span className="bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">
                ✨ AI-উন্নত
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                📋 টেমপ্লেট ড্রাফট
              </span>
            )}
          </div>

          {/* Main Document Body */}
          <div className={`space-y-2.5 ${alignmentClass}`}>
            {lines.map((line, idx) => {
              const trimmed = line.trim();
              const isSubject =
                trimmed.startsWith('বিষয়:') ||
                trimmed.startsWith('বিষয়:') ||
                trimmed.startsWith('Subject:') ||
                trimmed.startsWith('SUBJECT:');
              const isDate = trimmed.startsWith('তারিখ:') || trimmed.startsWith('Date:');
              const isRecipient = trimmed === 'বরাবর' || trimmed === 'To';
              const isSalutation =
                trimmed === 'জনাব,' ||
                trimmed === 'মহোদয়,' ||
                trimmed === 'জনাব/জনাবা,' ||
                trimmed === 'Dear Sir/Madam,' ||
                trimmed === 'Dear Sir,';
              const isSignOff =
                trimmed.startsWith('বিনীত নিবেদক') ||
                trimmed.startsWith('বিনীত,') ||
                trimmed.startsWith('ধন্যবাদান্তে,') ||
                trimmed.startsWith('Yours sincerely') ||
                trimmed.startsWith('Yours faithfully');

              if (trimmed === '') {
                return <div key={idx} className="h-3" />;
              }

              return (
                <p
                  key={idx}
                  className={`
                    ${isSubject ? 'font-bold py-1 text-slate-950 underline decoration-slate-400 decoration-1 underline-offset-4' : ''}
                    ${isDate ? 'font-medium text-slate-700' : ''}
                    ${isRecipient ? 'font-semibold text-slate-900 mt-2' : ''}
                    ${isSalutation ? 'font-semibold pt-1' : ''}
                    ${isSignOff ? 'font-semibold pt-4' : ''}
                  `}
                >
                  {line}
                </p>
              );
            })}
          </div>

          {/* Template-specific Footer Blocks */}
          {templateId === 'school-college' && (
            <div className="mt-12 pt-6 border-t border-dashed border-slate-300 flex justify-between text-xs text-slate-600">
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1" />
                <span>অভিভাবকের স্বাক্ষর ও তারিখ</span>
              </div>
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1" />
                <span>শ্রেণি শিক্ষকের স্বাক্ষর</span>
              </div>
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1" />
                <span>প্রধান শিক্ষক / অধ্যক্ষের অনুমোদন</span>
              </div>
            </div>
          )}

          {templateId === 'office-leave' && (
            <div className="mt-12 pt-6 border-t border-dashed border-slate-300 flex justify-between text-xs text-slate-600">
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1" />
                <span>আবেদনকারীর স্বাক্ষর</span>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1" />
                <span>বিভাগীয় প্রধানের সুপারিশ</span>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1" />
                <span>মানবসম্পদ / সিইও অনুমোদন</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Page Numbering if enabled */}
        {style.showPageNumber && (
          <div className="pt-8 text-center text-[11px] text-slate-400 border-t border-slate-100 mt-8">
            <span>পৃষ্ঠা ১ / ১</span>
          </div>
        )}
      </div>
    </div>
  );
};
