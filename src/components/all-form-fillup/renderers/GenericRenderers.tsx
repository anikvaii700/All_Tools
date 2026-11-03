import React from 'react';
import { formatBanglaDate, formatBanglaNumber, toBanglaDigits } from '../numberUtils';
import { FormTemplate } from '../types';

interface RendererProps {
  template: FormTemplate;
  data: Record<string, any>;
  showBorder?: boolean;
}

// -------------------------------------------------------------
// 1. GENERAL RECEIPT RENDERER (Shop Rent, Money Receipt, etc.)
// -------------------------------------------------------------
export const GeneralReceiptRenderer: React.FC<RendererProps> = ({ template, data, showBorder = true }) => {
  const receiptNo = data.receiptNumber || '০১';
  const date = data.receiptDate ? formatBanglaDate(data.receiptDate) : '.../.../২০২...';
  const orgName = data.organizationName || data.marketName || 'বাণিজ্যিক প্রতিষ্ঠান';
  const orgAddress = data.organizationAddress || '';
  const receivedFrom = data.receivedFrom || data.tenantName || '...................................................';
  const amount = formatBanglaNumber(data.amount || 0);
  const amountInWords = data.amountInWords || '...........................................................................';
  const purpose = data.purpose || data.month ? `${data.month} মাসের ভাড়া বাবদ` : 'সেবা / পণ্য বিক্রয় বাবদ';
  const receivedBy = data.receivedBy || data.ownerName || 'আদায়কারীর স্বাক্ষর';

  return (
    <div
      className={`bg-white text-slate-900 w-full max-w-[760px] mx-auto p-6 sm:p-10 font-sans ${
        showBorder ? 'border-2 border-slate-900 shadow-md' : 'border border-slate-300'
      } rounded-xs`}
    >
      <div className="border border-slate-800 p-5 sm:p-8 relative">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">{orgName}</h2>
            {orgAddress && <p className="text-xs text-slate-600 mt-0.5">{orgAddress}</p>}
            <p className="text-[11px] text-slate-500 font-semibold">{template.tagline}</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white font-extrabold px-3 py-1 text-xs uppercase tracking-wider rounded-sm mb-1.5">
              {template.name}
            </span>
            <div className="text-xs">
              <span className="text-slate-600">নং:</span> <strong>{toBanglaDigits(receiptNo)}</strong>
            </div>
            <div className="text-xs">
              <span className="text-slate-600">তারিখ:</span> <strong>{date}</strong>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm leading-relaxed mb-6">
          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap mr-2">যার নিকট হতে গ্রহণ:</span>
            <span className="font-bold text-slate-950 border-b border-dotted border-slate-600 flex-1 px-1">{receivedFrom}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap mr-2">টাকার পরিমাণ (৳):</span>
              <span className="font-bold text-base text-slate-950 border-b border-dotted border-slate-700 flex-1 px-1">৳ {amount}/-</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap mr-2">মাধ্যম:</span>
              <span className="font-semibold text-slate-950 border-b border-dotted border-slate-600 flex-1 px-1">{data.paymentMethod || 'নগদ ক্যাশ'}</span>
            </div>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap mr-2">টাকা (কথায়):</span>
            <span className="font-bold text-slate-950 border-b border-dotted border-slate-700 flex-1 px-1 italic">{amountInWords}</span>
          </div>

          <div className="flex items-baseline">
            <span className="font-bold text-slate-900 whitespace-nowrap mr-2">বাবদ / খাত:</span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-600 flex-1 px-1">{purpose}</span>
          </div>
        </div>

        <div className="mt-12 pt-6 flex items-end justify-between text-xs sm:text-sm">
          <div className="text-center w-32">
            <div className="h-10 border-b border-slate-400 mb-1" />
            <p className="text-[11px] text-slate-600">গ্রাহকের স্বাক্ষর</p>
          </div>
          <div className="text-center w-48">
            <div className="h-10 border-b-2 border-slate-900 mb-1" />
            <p className="font-bold text-slate-950">{receivedBy}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. AGREEMENT RENDERER (চুক্তিপত্র খসড়া)
// -------------------------------------------------------------
export const AgreementRenderer: React.FC<RendererProps> = ({ template, data, showBorder = true }) => {
  const docDate = data.documentDate ? formatBanglaDate(data.documentDate) : '.../.../২০২...';

  return (
    <div
      className={`bg-white text-slate-900 w-full max-w-[760px] mx-auto p-8 sm:p-12 font-sans ${
        showBorder ? 'border-2 border-slate-900 shadow-md' : 'border border-slate-300'
      } rounded-xs text-xs sm:text-sm leading-relaxed`}
    >
      <div className="text-center mb-6 pb-3 border-b-2 border-slate-900">
        <h1 className="text-xl sm:text-2xl font-black text-slate-950">{template.name}</h1>
        <p className="text-xs text-slate-600 mt-1">{template.tagline}</p>
        <p className="text-[11px] text-slate-500 font-bold mt-1">সম্পাদনের তারিখ: {docDate}</p>
      </div>

      <div className="space-y-4 text-justify">
        <div className="p-3 bg-slate-50 rounded-sm border border-slate-200">
          <h3 className="font-black text-slate-950 mb-1">১ম পক্ষ (মালিক):</h3>
          <p>
            <strong>{data.ownerName || '...................................................'}</strong>, পিতা/স্বামী: {data.ownerFather || '................................'}, ঠিকানা: {data.ownerAddress || '...................................................'}, এনআইডি: {toBanglaDigits(data.ownerNid || '...............................')}।
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-sm border border-slate-200">
          <h3 className="font-black text-slate-950 mb-1">২য় পক্ষ (ভাড়াটিয়া):</h3>
          <p>
            <strong>{data.tenantName || '...................................................'}</strong>, পিতা/স্বামী: {data.tenantFather || '................................'}, ঠিকানা: {data.tenantAddress || '...................................................'}, এনআইডি: {toBanglaDigits(data.tenantNid || '...............................')}।
          </p>
        </div>

        <p className="font-semibold text-slate-950 pt-2">
          উভয় পক্ষ সুস্থ মস্তিষ্কে, স্বেচ্ছায় ও কারো প্ররোচনা ব্যতীত নিম্নলিখিত শর্তাবলি মেনে চুক্তি সম্পাদন করিলেন:
        </p>

        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>ভাড়াকৃত সম্পত্তি:</strong> ১ম পক্ষ তাঁহার মালিকানাধীন <u>{data.premisesAddress || 'সম্পত্তির পূর্ণ ঠিকানা'}</u> ২য় পক্ষকে ব্যবহারের জন্য ভাড়া দিলেন।
          </li>
          <li>
            <strong>মেয়াদকাল:</strong> এই চুক্তির মেয়াদকাল আগামী <u>{data.durationYears || '২ (দুই) বছর'}</u> বহাল থাকিবে।
          </li>
          <li>
            <strong>মাসিক ভাড়া:</strong> মাসিক ভাড়ার পরিমাণ সর্বমোট <u>৳ {formatBanglaNumber(data.monthlyRent || 0)}/-</u> ({data.monthlyRentWords || 'কথায়'}) নির্ধারিত হইল, যাহা প্রতি মাসের ৫ তারিখের মধ্যে ১ম পক্ষকে পরিশোধ করিতে হইবে।
          </li>
          <li>
            <strong>অগ্রিম জামানত:</strong> চুক্তি সম্পাদনকালে ২য় পক্ষ ১ম পক্ষকে অগ্রিম জামানত বাবদ <u>৳ {formatBanglaNumber(data.advanceAmount || 0)}/-</u> ({data.advanceAmountWords || 'কথায়'}) প্রদান করিলেন। চুক্তি সমাপনান্তে এই অর্থ সমন্বয় বা ফেরতযোগ্য।
          </li>
          <li>
            <strong>বাসা ছাড়ার নোটিশ:</strong> যেকোনো পক্ষ চুক্তি বাতিল করিতে চাহিলে অন্য পক্ষকে কমপক্ষে <u>{data.noticePeriodMonths || '২ (দুই) মাস'}</u> পূর্বে লিখিত নোটিশ প্রদান করিবেন।
          </li>
        </ol>

        <p className="pt-3 font-semibold">
          এতদার্থে, উভয় পক্ষ উক্ত শর্তাবলি পাঠ করিয়া ও বুঝিয়া স্বাক্ষীগণের সম্মুখে নিজ নিজ নাম স্বাক্ষর করিলেন।
        </p>
      </div>

      <div className="mt-14 pt-6 grid grid-cols-2 gap-8 text-center text-xs sm:text-sm">
        <div>
          <div className="h-10 border-b-2 border-slate-900 mb-1.5" />
          <p className="font-bold text-slate-950">১ম পক্ষের স্বাক্ষর (মালিক)</p>
        </div>
        <div>
          <div className="h-10 border-b-2 border-slate-900 mb-1.5" />
          <p className="font-bold text-slate-950">২য় পক্ষের স্বাক্ষর (ভাড়াটিয়া)</p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. APPLICATION RENDERER (আবেদনপত্র / দরখাস্ত)
// -------------------------------------------------------------
export const ApplicationRenderer: React.FC<RendererProps> = ({ template, data, showBorder = true }) => {
  const appDate = data.applicationDate || data.noticeDate ? formatBanglaDate(data.applicationDate || data.noticeDate) : '.../.../২০২...';

  return (
    <div
      className={`bg-white text-slate-900 w-full max-w-[760px] mx-auto p-8 sm:p-12 font-sans ${
        showBorder ? 'border-2 border-slate-900 shadow-md' : 'border border-slate-300'
      } rounded-xs text-xs sm:text-sm leading-relaxed`}
    >
      <div className="mb-6 space-y-1">
        <p className="font-bold">তারিখ: {appDate}</p>
        <p className="font-bold">বরাবর,</p>
        <p className="font-semibold">{data.recipientTitle || data.landlordName || 'সংশ্লিষ্ট কর্মকর্তা / কর্তৃপক্ষ'}</p>
        <p className="text-slate-800">{data.organizationName || data.landlordAddress || 'প্রতিষ্ঠান / দপ্তরের নাম'}</p>
        {data.organizationAddress && <p className="text-slate-700">{data.organizationAddress}</p>}
      </div>

      <div className="mb-5 pb-1 border-b border-slate-900">
        <p className="font-bold text-sm sm:text-base text-slate-950">
          বিষয়: {data.subject || 'ছুটি ও জরুরি সেবার জন্য আবেদন।'}
        </p>
      </div>

      <div className="space-y-4 mb-8 text-justify">
        <p className="font-bold">{data.salutation || 'মহোদয় / জনাব,'}</p>
        {data.bodyText ? (
          <div className="whitespace-pre-line leading-relaxed">{data.bodyText}</div>
        ) : (
          <div className="space-y-3">
            <p>
              বিনীত নিবেদন এই যে, আমি আপনার প্রতিষ্ঠানে কর্মরত/অধ্যয়নরত একজন নিয়মিত সদস্য। {data.reason || 'উল্লেখিত বিষয়ে আপনার সদয় দৃষ্টি আকর্ষণ করছি।'}
            </p>
            {data.leaveDaysCount && (
              <p>
                অতএব, আগামী {data.startDate} তারিখ হইতে {data.endDate} তারিখ পর্যন্ত মোট {data.leaveDaysCount} দিনের ছুটি মঞ্জুর করতে মহোদয়ের সুমর্জি হয়।
              </p>
            )}
            {data.advanceNote && <p>{data.advanceNote}</p>}
            <p>
              অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, উপরোক্ত বিষয়টি বিবেচনায় নিয়ে প্রয়োজনীয় সদয় অনুমতি ও ব্যবস্থা গ্রহণ করে বাধিত করবেন।
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 pt-4 flex flex-col items-end text-xs sm:text-sm">
        <div className="text-center min-w-[200px]">
          <p className="font-bold mb-8">বিনীত নিবেদক,</p>
          <div className="h-8 border-b-2 border-slate-900 mb-1" />
          <p className="font-bold text-slate-950">{data.applicantName || data.tenantName || 'আবেদনকারীর নাম'}</p>
          {data.applicantDesignation && <p className="text-slate-600">{data.applicantDesignation}</p>}
          {data.applicantContact && <p className="text-slate-600 text-xs">{data.applicantContact}</p>}
          {data.flatNumber && <p className="text-slate-600 text-xs">ফ্ল্যাট: {data.flatNumber}</p>}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. BIODATA / INFO FORM RENDERER (ভর্তি ফরম, ভাড়াটিয়া তথ্য ফরম)
// -------------------------------------------------------------
export const BiodataRenderer: React.FC<RendererProps> = ({ template, data, showBorder = true }) => {
  return (
    <div
      className={`bg-white text-slate-900 w-full max-w-[760px] mx-auto p-7 sm:p-10 font-sans ${
        showBorder ? 'border-2 border-slate-900 shadow-md' : 'border border-slate-300'
      } rounded-xs text-xs sm:text-sm`}
    >
      <div className="text-center mb-6 pb-2 border-b-2 border-slate-900 relative">
        <h1 className="text-xl sm:text-2xl font-black text-slate-950">{template.name}</h1>
        {data.institutionName && <p className="text-sm font-bold text-slate-800">{data.institutionName}</p>}
        <p className="text-xs text-slate-600">{template.tagline}</p>

        {/* Photo Box */}
        <div className="absolute right-0 top-0 w-24 h-28 border border-dashed border-slate-400 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 text-center p-1">
          ১ কপি পাসপোর্ট সাইজ ছবি
        </div>
      </div>

      <div className="mb-4 flex justify-between text-xs font-semibold text-slate-700">
        <span>আইডি / ফরম নং: <strong>{toBanglaDigits(data.admissionRoll || data.flatNumber || '০১')}</strong></span>
        <span>তারিখ: <strong>{formatBanglaDate(data.submissionDate || data.admissionDate || '')}</strong></span>
      </div>

      <table className="w-full border-collapse border border-slate-800 text-xs sm:text-sm mb-6">
        <tbody>
          {Object.entries(data).map(([key, val]) => {
            if (['submissionDate', 'admissionDate', 'admissionRoll'].includes(key)) return null;
            const field = template.fields.find((f) => f.name === key);
            const label = field ? field.label : key;
            return (
              <tr key={key} className="border-b border-slate-300">
                <td className="w-1/3 bg-slate-50 font-bold p-2.5 border-r border-slate-400 text-slate-800">
                  {label}
                </td>
                <td className="p-2.5 font-semibold text-slate-950">
                  {key === 'dob' ? formatBanglaDate(val) : toBanglaDigits(val)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="p-2.5 bg-slate-50 border border-slate-300 text-[11px] text-slate-600 mb-8">
        <strong>ঘোষণা:</strong> আমি এই মর্মে শপথ করিতেছি যে, উপরে বর্ণিত যাবতীয় তথ্য সম্পূর্ণ সত্য ও সঠিক।
      </div>

      <div className="flex justify-between items-end pt-6 text-xs sm:text-sm">
        <div className="text-center w-36">
          <div className="h-8 border-b border-slate-400 mb-1" />
          <p className="text-[11px] text-slate-600">অভিভাবকের স্বাক্ষর</p>
        </div>
        <div className="text-center w-48">
          <div className="h-8 border-b-2 border-slate-900 mb-1" />
          <p className="font-bold text-slate-950">আবেদনকারীর স্বাক্ষর</p>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. CERTIFICATE RENDERER (অভিজ্ঞতার সনদ, চারিত্রিক প্রত্যয়ন)
// -------------------------------------------------------------
export const CertificateRenderer: React.FC<RendererProps> = ({ template, data, showBorder = true }) => {
  const issueDate = data.issueDate ? formatBanglaDate(data.issueDate) : '.../.../২০২...';

  return (
    <div
      className={`bg-white text-slate-900 w-full max-w-[760px] mx-auto p-8 sm:p-12 font-sans ${
        showBorder ? 'border-4 border-double border-slate-900 shadow-md' : 'border border-slate-300'
      } rounded-xs text-xs sm:text-sm leading-relaxed`}
    >
      <div className="text-center mb-6 pb-3 border-b-2 border-slate-800">
        <h2 className="text-xl sm:text-2xl font-black text-slate-950">
          {data.institutionName || data.companyName || 'প্রতিষ্ঠানের নাম'}
        </h2>
        <p className="text-xs text-slate-600">{data.institutionAddress || data.companyAddress || 'অফিসিয়াল ঠিকানা'}</p>
      </div>

      <div className="flex justify-between items-center text-xs font-semibold mb-6">
        <span>স্মারক নং: {toBanglaDigits(data.referenceNumber || '০০১')}</span>
        <span>তারিখ: {issueDate}</span>
      </div>

      <div className="text-center my-6">
        <span className="inline-block px-6 py-1.5 border-2 border-slate-900 rounded-full font-black text-base sm:text-lg text-slate-950 uppercase tracking-widest bg-slate-50">
          {template.name}
        </span>
      </div>

      <div className="space-y-4 my-8 text-justify leading-loose">
        <p>
          এই মর্মে প্রত্যয়ন করা যাইতেছে যে, <strong>{data.studentName || data.employeeName || '...................................................'}</strong>
          {data.fatherName && <>, পিতা: {data.fatherName}</>}
          {data.motherName && <>, মাতা: {data.motherName}</>}।
        </p>

        {data.designation ? (
          <p>
            তিনি অত্র প্রতিষ্ঠানে <strong>{data.joiningDate}</strong> তারিখ হইতে <strong>{data.leavingDate}</strong> তারিখ পর্যন্ত অত্যন্ত দক্ষতা ও নিষ্ঠার সহিত <strong>{data.designation}</strong> পদে কর্মরত ছিলেন।
          </p>
        ) : (
          <p>
            তিনি অত্র শিক্ষা প্রতিষ্ঠান হইতে {data.examYear || '২০২৬'} সনে {data.board || 'ঢাকা'} শিক্ষা বোর্ডের অধীনে {data.passedExam || 'এইচএসসি'} পরীক্ষায় অংশগ্রহণ করিয়া জিপিএ {toBanglaDigits(data.gpa || '৫.০০')} লাভ করিয়া কৃতিত্বের সহিত উত্তীর্ণ হইয়াছেন।
          </p>
        )}

        <p>
          {data.characterNote || 'আমার জানামতে তিনি একজন সৎ, চরিত্রবান ও দায়িত্বশীল ব্যক্তিত্ব। তাঁহার ভবিষ্যৎ জীবনের সর্বাঙ্গীন উন্নতি ও সাফল্য কামনা করি।'}
        </p>
      </div>

      <div className="mt-16 pt-6 flex justify-between items-end text-xs sm:text-sm">
        <div className="text-center w-32">
          <div className="w-16 h-16 border border-dashed border-slate-400 rounded-full flex items-center justify-center text-[10px] text-slate-400 mx-auto mb-1">
            সিলমোহর
          </div>
        </div>

        <div className="text-center w-48">
          <div className="h-10 border-b-2 border-slate-900 mb-1" />
          <p className="font-bold text-slate-950">{data.signatoryName || data.principalTitle || 'কর্তৃপক্ষের স্বাক্ষর'}</p>
          {data.signatoryDesignation && <p className="text-xs text-slate-600">{data.signatoryDesignation}</p>}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. CASH MEMO RENDERER (ক্যাশ মেমো ও বিল)
// -------------------------------------------------------------
export const MemoRenderer: React.FC<RendererProps> = ({ template, data, showBorder = true }) => {
  return (
    <div
      className={`bg-white text-slate-900 w-full max-w-[760px] mx-auto p-6 sm:p-9 font-sans ${
        showBorder ? 'border-2 border-slate-900 shadow-md' : 'border border-slate-300'
      } rounded-xs text-xs sm:text-sm`}
    >
      <div className="border border-slate-900 p-4 sm:p-6">
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950">{data.shopName || 'বিসমিল্লাহ স্টোর'}</h2>
          <p className="text-xs text-slate-600">{data.shopAddress}</p>
          <div className="mt-1 inline-block bg-slate-900 text-white font-bold px-3 py-0.5 text-xs rounded-sm">
            ক্যাশ মেমো (CASH MEMO)
          </div>
        </div>

        <div className="flex justify-between items-center text-xs mb-3 font-semibold">
          <span>মেমো নং: <strong>{toBanglaDigits(data.memoNumber || '০১')}</strong></span>
          <span>তারিখ: <strong>{formatBanglaDate(data.date || '')}</strong></span>
        </div>

        <div className="border-b border-slate-300 pb-2 mb-3 text-xs">
          <p><strong>ক্রেতার নাম:</strong> {data.customerName || 'নগদ ক্রেতা'}</p>
          {data.customerMobile && <p><strong>মোবাইল:</strong> {toBanglaDigits(data.customerMobile)}</p>}
        </div>

        <table className="w-full border-collapse border border-slate-800 text-xs mb-4">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-800 text-left">
              <th className="p-2 border-r border-slate-800 w-12 text-center">ক্র:</th>
              <th className="p-2 border-r border-slate-800">পণ্যের বিবরণ</th>
              <th className="p-2 border-r border-slate-800 w-16 text-center">পরিমাণ</th>
              <th className="p-2 text-right w-24">মোট (৳)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="p-2 border-r border-slate-800 text-center">০১</td>
              <td className="p-2 border-r border-slate-800 font-semibold">{data.item1Name || 'পণ্য ১'}</td>
              <td className="p-2 border-r border-slate-800 text-center">{toBanglaDigits(data.item1Qty || '১')}</td>
              <td className="p-2 text-right font-bold">{toBanglaDigits(data.item1Total || '০')}</td>
            </tr>
            {data.item2Name && (
              <tr className="border-b border-slate-300">
                <td className="p-2 border-r border-slate-800 text-center">০২</td>
                <td className="p-2 border-r border-slate-800 font-semibold">{data.item2Name}</td>
                <td className="p-2 border-r border-slate-800 text-center">{toBanglaDigits(data.item2Qty || '১')}</td>
                <td className="p-2 text-right font-bold">{toBanglaDigits(data.item2Total || '০')}</td>
              </tr>
            )}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-800">
              <td colSpan={3} className="p-2 text-right border-r border-slate-800">সর্বমোট:</td>
              <td className="p-2 text-right text-sm">৳ {formatBanglaNumber(data.totalAmount || 0)}/-</td>
            </tr>
          </tbody>
        </table>

        {data.totalAmountWords && (
          <p className="text-xs font-semibold italic text-slate-800 mb-3">
            কথায়: {data.totalAmountWords}
          </p>
        )}

        <div className="flex justify-between items-end pt-6 text-xs">
          <p className="text-[11px] text-slate-500 italic">{data.note || 'ধন্যবাদ আবার আসবেন।'}</p>
          <div className="text-center w-36">
            <div className="h-6 border-b border-slate-800 mb-1" />
            <p className="font-bold">বিক্রেতার স্বাক্ষর</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 7. CUSTOM USER FORM RENDERER (ব্যবহারকারীর তৈরি নিজস্ব ফরম)
// -------------------------------------------------------------
export const CustomDocumentRenderer: React.FC<RendererProps> = ({ template, data, showBorder = true }) => {
  return (
    <div
      className={`bg-white text-slate-900 w-full max-w-[760px] mx-auto p-8 sm:p-12 font-sans ${
        showBorder ? 'border-2 border-slate-900 shadow-md' : 'border border-slate-300'
      } rounded-xs text-xs sm:text-sm`}
    >
      <div className="text-center mb-6 pb-3 border-b-2 border-slate-900">
        <h1 className="text-2xl font-black text-slate-950">{template.name}</h1>
        {template.tagline && <p className="text-xs text-slate-600 mt-1">{template.tagline}</p>}
      </div>

      <div className="space-y-4 mb-8">
        {template.fields.map((field) => {
          const val = data[field.name];
          if (field.type === 'checkbox') {
            return (
              <div key={field.name} className="flex items-center gap-2 font-semibold">
                <input type="checkbox" checked={Boolean(val)} readOnly className="w-4 h-4 accent-slate-900" />
                <span>{field.label}</span>
              </div>
            );
          }
          if (field.type === 'textarea') {
            return (
              <div key={field.name} className="space-y-1">
                <span className="font-bold text-slate-900">{field.label}:</span>
                <p className="p-3 bg-slate-50 border border-slate-300 rounded-sm whitespace-pre-line leading-relaxed">
                  {val || '...................................................'}
                </p>
              </div>
            );
          }
          return (
            <div key={field.name} className="flex items-baseline">
              <span className="font-bold text-slate-900 whitespace-nowrap mr-2">{field.label}:</span>
              <span className="font-semibold text-slate-950 border-b border-dotted border-slate-600 flex-1 px-1">
                {field.type === 'date' ? formatBanglaDate(val) : toBanglaDigits(val || '............................................')}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-12 pt-6 flex justify-between items-end text-xs sm:text-sm">
        <div className="text-center w-36">
          <div className="h-8 border-b border-slate-400 mb-1" />
          <p className="text-[11px] text-slate-600">যাচাইকারীর স্বাক্ষর</p>
        </div>
        <div className="text-center w-48">
          <div className="h-8 border-b-2 border-slate-900 mb-1" />
          <p className="font-bold text-slate-950">অনুমোদিত স্বাক্ষর</p>
        </div>
      </div>
    </div>
  );
};
