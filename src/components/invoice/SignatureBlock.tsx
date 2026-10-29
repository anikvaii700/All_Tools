import React from 'react';

interface SignatureBlockProps {
  signatureTitle: string;
  onChangeTitle?: (title: string) => void;
  onUpdateTitle?: (title: string) => void;
  signatureImage?: string;
  onOpenSignatureModal?: () => void;
  defaultTitle?: string;
  className?: string;
  lineColor?: string;
  textColor?: string;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  signatureTitle,
  onChangeTitle,
  onUpdateTitle,
  signatureImage,
  onOpenSignatureModal,
  defaultTitle = 'স্বত্বাধিকারীর স্বাক্ষর',
  className = '',
  lineColor = 'border-slate-700',
  textColor = 'text-slate-800',
}) => {
  const handleTitleChange = (val: string) => {
    onChangeTitle?.(val);
    onUpdateTitle?.(val);
  };

  return (
    <div className={`text-center flex flex-col items-center justify-end min-h-[75px] ${className}`}>
      {signatureImage ? (
        <div className="relative group mb-1 flex items-center justify-center">
          <img
            src={signatureImage}
            alt="স্বাক্ষর"
            className="h-10 sm:h-12 max-w-[150px] object-contain drop-shadow-2xs select-none"
          />
          {onOpenSignatureModal && (
            <button
              type="button"
              onClick={onOpenSignatureModal}
              className="print:hidden absolute -top-1 -right-7 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded shadow-xs opacity-80 hover:opacity-100 transition"
              title="স্বাক্ষর পরিবর্তন করুন"
            >
              ✏️
            </button>
          )}
        </div>
      ) : (
        onOpenSignatureModal && (
          <button
            type="button"
            onClick={onOpenSignatureModal}
            className="print:hidden mb-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 transition shadow-2xs flex items-center gap-1 active:scale-95 cursor-pointer"
            title="স্ক্রিনে আঙুল বা মাউস দিয়ে স্বাক্ষর দিন"
          >
            <span>✍️ ডিজিটাল স্বাক্ষর দিন</span>
          </button>
        )
      )}

      {/* Signature Underline */}
      <div className={`w-36 sm:w-44 border-t-2 ${lineColor} mx-auto mb-1`} />

      {/* Signature Title Input */}
      <input
        type="text"
        value={signatureTitle || defaultTitle}
        onChange={(e) => handleTitleChange(e.target.value)}
        className={`text-center font-bold ${textColor} bg-transparent border-none outline-none focus:outline-none focus:bg-amber-50 rounded text-xs px-2 py-0.5 w-36 sm:w-48`}
        placeholder="স্বাক্ষরের পদবী"
      />
    </div>
  );
};
