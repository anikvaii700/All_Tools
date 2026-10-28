import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ShieldAlert,
  User,
  Camera,
  Sparkles,
  Copy,
} from 'lucide-react';

interface FamilyTreeProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export type RelationType =
  | 'দাদা'
  | 'দাদি'
  | 'নানা'
  | 'নানি'
  | 'বাবা'
  | 'মা'
  | 'চাচা'
  | 'চাচি'
  | 'ফুফু'
  | 'ফুপা'
  | 'মামা'
  | 'মামি'
  | 'খালা'
  | 'খালু'
  | 'নিজ (আমি)'
  | 'ভাই'
  | 'বোন'
  | 'স্বামী'
  | 'স্ত্রী'
  | 'চাচাত ভাই'
  | 'চাচাত বোন'
  | 'ফুফাত ভাই'
  | 'ফুফাত বোন'
  | 'মামাত ভাই'
  | 'মামাত বোন'
  | 'খালাত ভাই'
  | 'খালাত বোন'
  | 'ছেলে'
  | 'মেয়ে';

export interface FamilyMember {
  id: string;
  name: string;
  relation: RelationType;
  gender: 'male' | 'female';
  photo?: string | null;
  birthYear?: number;
  note?: string;
}

const DEFAULT_MEMBERS: FamilyMember[] = [
  {
    id: 'mem_1',
    name: 'আব্দুর রহমান',
    relation: 'দাদা',
    gender: 'male',
    birthYear: 1945,
  },
  {
    id: 'mem_2',
    name: 'রোকেয়া বেগম',
    relation: 'দাদি',
    gender: 'female',
    birthYear: 1950,
  },
  {
    id: 'mem_3',
    name: 'মোঃ রফিকুল ইসলাম',
    relation: 'বাবা',
    gender: 'male',
    birthYear: 1972,
  },
  {
    id: 'mem_4',
    name: 'নাসরিন সুলতানা',
    relation: 'মা',
    gender: 'female',
    birthYear: 1978,
  },
  {
    id: 'mem_5',
    name: 'মোফাচ্ছির আহমেদ',
    relation: 'নিজ (আমি)',
    gender: 'male',
    birthYear: 2000,
  },
  {
    id: 'mem_6',
    name: 'ফারহানা ইসলাম',
    relation: 'বোন',
    gender: 'female',
    birthYear: 2004,
  },
  {
    id: 'mem_7',
    name: 'মোঃ শফিকুল ইসলাম',
    relation: 'চাচা',
    gender: 'male',
    birthYear: 1976,
  },
  {
    id: 'mem_8',
    name: 'তানজিলা রহমান',
    relation: 'চাচি',
    gender: 'female',
    birthYear: 1982,
  },
  {
    id: 'mem_9',
    name: 'তানভীর আহমেদ',
    relation: 'চাচাত ভাই',
    gender: 'male',
    birthYear: 2002,
  },
  {
    id: 'mem_10',
    name: 'জাহিদুল হক',
    relation: 'মামা',
    gender: 'male',
    birthYear: 1980,
  },
  {
    id: 'mem_11',
    name: 'নাবিলা ইসলাম',
    relation: 'মামাত বোন',
    gender: 'female',
    birthYear: 2006,
  },
];

export const FamilyTree: React.FC<FamilyTreeProps> = ({ onBackToHub, onShowToast }) => {
  const [members, setMembers] = useState<FamilyMember[]>(DEFAULT_MEMBERS);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [relation, setRelation] = useState<RelationType>('ভাই');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [photo, setPhoto] = useState<string | null>(null);
  const [birthYear, setBirthYear] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const treeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mosafa_family_members_v2');
      if (stored) setMembers(JSON.parse(stored));
    } catch {}
  }, []);

  const saveMembers = (updated: FamilyMember[]) => {
    setMembers(updated);
    try {
      localStorage.setItem('mosafa_family_members_v2', JSON.stringify(updated));
    } catch {}
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Auto-detect gender for relations
    let autoGender: 'male' | 'female' = gender;
    if (['দাদি', 'নানি', 'মা', 'চাচি', 'ফুফু', 'মামি', 'খালা', 'বোন', 'স্ত্রী', 'চাচাত বোন', 'ফুফাত বোন', 'মামাত বোন', 'খালাত বোন', 'মেয়ে'].includes(relation)) {
      autoGender = 'female';
    } else if (['দাদা', 'নানা', 'বাবা', 'চাচা', 'ফুপা', 'মামা', 'খালু', 'ভাই', 'স্বামী', 'চাচাত ভাই', 'ফুফাত ভাই', 'মামাত ভাই', 'খালাত ভাই', 'ছেলে'].includes(relation)) {
      autoGender = 'male';
    }

    const newMember: FamilyMember = {
      id: `mem_${Date.now()}`,
      name: name.trim(),
      relation,
      gender: autoGender,
      photo,
      birthYear: birthYear ? Number(birthYear) : undefined,
      note: note.trim(),
    };

    const updated = [...members, newMember];
    saveMembers(updated);
    setName('');
    setPhoto(null);
    setBirthYear('');
    setNote('');
    setIsAddModalOpen(false);
    onShowToast(`${newMember.name} (${relation}) যুক্ত হয়েছেন! 🌳`, '✅');
  };

  const deleteMember = (id: string) => {
    const target = members.find((m) => m.id === id);
    if (confirm(`আপনি কি "${target?.name}"-কে বংশলতিকা থেকে বাদ দিতে চান?`)) {
      saveMembers(members.filter((m) => m.id !== id));
      onShowToast('সদস্য মুছে ফেলা হয়েছে', '🗑️');
    }
  };

  // Group members into Family Tree Tiers
  // Tier 1: দাদা-দাদি, নানা-নানি
  const grandTier = members.filter((m) =>
    ['দাদা', 'দাদি', 'নানা', 'নানি'].includes(m.relation)
  );

  // Tier 2: বাবা-মা, চাচা-চাচি, ফুফু-ফুপা, মামা-মামি, খালা-খালু
  const parentTier = members.filter((m) =>
    ['বাবা', 'মা', 'চাচা', 'চাচি', 'ফুফু', 'ফুপা', 'মামা', 'মামি', 'খালা', 'খালু'].includes(m.relation)
  );

  // Tier 3: নিজ, ভাই-বোন, স্বামী-স্ত্রী, কাজিন (চাচাত/মামাত/খালাত/ফুফাত ভাই-বোন)
  const selfAndCousinTier = members.filter((m) =>
    [
      'নিজ (আমি)',
      'ভাই',
      'বোন',
      'স্বামী',
      'স্ত্রী',
      'চাচাত ভাই',
      'চাচাত বোন',
      'ফুফাত ভাই',
      'ফুফাত বোন',
      'মামাত ভাই',
      'মামাত বোন',
      'খালাত ভাই',
      'খালাত বোন',
    ].includes(m.relation)
  );

  // Tier 4: সন্তানাদি (ছেলে/মেয়ে)
  const childrenTier = members.filter((m) => ['ছেলে', 'মেয়ে'].includes(m.relation));

  // Export Tree as PNG
  const downloadTreeImage = () => {
    const canvas = treeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1100;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;

    // Lush Tree Foliage & Nature Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#064e3b');
    bgGrad.addColorStop(0.3, '#047857');
    bgGrad.addColorStop(0.7, '#065f46');
    bgGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative Tree Branches SVG style
    ctx.strokeStyle = '#78350f'; // Tree wood trunk
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(W / 2, H - 40);
    ctx.lineTo(W / 2, 220);
    ctx.stroke();

    // Side Branches
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#92400e';
    // Grandparent branch
    ctx.beginPath();
    ctx.moveTo(W / 2, 260);
    ctx.lineTo(120, 260);
    ctx.moveTo(W / 2, 260);
    ctx.lineTo(W - 120, 260);
    ctx.stroke();

    // Parent branch
    ctx.beginPath();
    ctx.moveTo(W / 2, 500);
    ctx.lineTo(80, 500);
    ctx.moveTo(W / 2, 500);
    ctx.lineTo(W - 80, 500);
    ctx.stroke();

    // Sibling & Cousin branch
    ctx.beginPath();
    ctx.moveTo(W / 2, 760);
    ctx.lineTo(80, 760);
    ctx.moveTo(W / 2, 760);
    ctx.lineTo(W - 80, 760);
    ctx.stroke();

    // Children branch
    ctx.beginPath();
    ctx.moveTo(W / 2, 1000);
    ctx.lineTo(180, 1000);
    ctx.moveTo(W / 2, 1000);
    ctx.lineTo(W - 180, 1000);
    ctx.stroke();

    // Title Canopy
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 38px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('আমাদের পারিবারিক বংশবৃক্ষ 🌳', W / 2, 70);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '18px "Hind Siliguri", sans-serif';
    ctx.fillText(`মোট পারিবারিক সদস্য: ${members.length} জন • রক্তের পবিত্র বন্ধন`, W / 2, 105);

    // Draw tiers summary labels
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('★ ১ম স্তর: দাদা-দাদি ও নানা-নানি', W / 2, 170);
    ctx.fillText('★ ২য় স্তর: বাবা-মা, চাচা-চাচি, ফুফু ও মামা-খালা', W / 2, 420);
    ctx.fillText('★ ৩য় স্তর: আমি, ভাই-বোন ও কাজিনবৃন্দ', W / 2, 680);
    ctx.fillText('★ ৪র্থ স্তর: সন্তানাদি ও ভবিষ্যৎ প্রজন্ম', W / 2, 930);

    const renderTierText = (tierMembers: FamilyMember[], startY: number) => {
      const perRow = 5;
      const count = tierMembers.length;
      if (count === 0) return;
      const spacing = (W - 120) / Math.min(count, perRow);

      tierMembers.slice(0, 10).forEach((m, idx) => {
        const row = Math.floor(idx / perRow);
        const col = idx % perRow;
        const x = 70 + col * spacing + spacing / 2;
        const y = startY + row * 80;

        ctx.fillStyle = m.gender === 'male' ? '#1e3a8a' : '#831843';
        ctx.beginPath();
        ctx.roundRect(x - 65, y, 130, 60, 12);
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.name.slice(0, 14), x, y + 26);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px "Hind Siliguri", sans-serif';
        ctx.fillText(m.relation, x, y + 46);
      });
    };

    renderTierText(grandTier, 200);
    renderTierText(parentTier, 450);
    renderTierText(selfAndCousinTier, 710);
    renderTierText(childrenTier, 960);

    // Footer
    ctx.fillStyle = '#6ee7b7';
    ctx.font = '13px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The MoSaFa Tools • পরিবার প্রথম, পরিবার চিরন্তন 🏡', W / 2, H - 20);

    const link = document.createElement('a');
    link.download = `Family-Tree-MoSaFa-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('বংশবৃক্ষ ছবি সফলভাবে ডাউনলোড হয়েছে! 🌳', '🎉');
  };

  const copyTreeSummary = async () => {
    let text = `🌳 আমাদের পারিবারিক বংশলতিকা (Family Tree):\n\n`;
    if (grandTier.length > 0) {
      text += `★ ১ম স্তর: দাদা-দাদি ও নানা-নানি:\n`;
      grandTier.forEach((m) => {
        text += `- ${m.name} (${m.relation}${m.birthYear ? ', জন্ম: ' + m.birthYear : ''})\n`;
      });
      text += `\n`;
    }
    if (parentTier.length > 0) {
      text += `★ ২য় স্তর: বাবা-মা, চাচা-চাচি, ফুফু ও মামা-খালা:\n`;
      parentTier.forEach((m) => {
        text += `- ${m.name} (${m.relation}${m.birthYear ? ', জন্ম: ' + m.birthYear : ''})\n`;
      });
      text += `\n`;
    }
    if (selfAndCousinTier.length > 0) {
      text += `★ ৩য় স্তর: আমি, ভাই-বোন ও কাজিনবৃন্দ:\n`;
      selfAndCousinTier.forEach((m) => {
        text += `- ${m.name} (${m.relation}${m.birthYear ? ', জন্ম: ' + m.birthYear : ''})\n`;
      });
      text += `\n`;
    }
    if (childrenTier.length > 0) {
      text += `★ ৪র্থ স্তর: সন্তানাদি:\n`;
      childrenTier.forEach((m) => {
        text += `- ${m.name} (${m.relation}${m.birthYear ? ', জন্ম: ' + m.birthYear : ''})\n`;
      });
      text += `\n`;
    }
    text += `মোট সদস্য: ${members.length} জন\nThe MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('বংশলতিকার তথ্য কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('বংশলতিকার তথ্য কপি হয়েছে! 📋', '✅');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-emerald-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">Family Tree Builder</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                গাছের মত বংশলতিকা 🌳
              </span>
            </div>
            <p className="text-xs text-slate-500">
              দাদা-দাদি, বাবা-মা, ভাই-বোন, চাচা-চাচি, মামা-মামি ও কাজিনদের ছবিযুক্ত বংশবৃক্ষ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-slate-600">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="জুম আউট"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="জুম ইন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={copyTreeSummary}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1 active:scale-95"
            title="বংশলতিকার বিবরণ কপি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">লতিকা কপি</span>
          </button>

          <button
            onClick={downloadTreeImage}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>গাছ ডাউনলোড (PNG)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>সদস্য যুক্ত করুন</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 flex flex-col">
        {/* Privacy Advisory */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>গোপনীয়তা সতর্কতা:</strong> পরিবারের অন্যান্য সদস্যদের ছবি ও ব্যক্তিগত তথ্য যুক্ত করার আগে তাদের সম্মতি গ্রহণ করুন।
          </span>
        </div>

        {/* LUSH TREE-STRUCTURE VISUAL CANVAS CONTAINER */}
        <div className="flex-1 bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-6 sm:p-10 border border-emerald-800 shadow-xl overflow-x-auto min-h-[680px] relative">
          {/* Tree Trunk Decorative Line */}
          <div className="absolute top-24 bottom-12 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 rounded-full opacity-60 pointer-events-none hidden md:block" />

          <div
            className="flex flex-col items-center justify-start space-y-12 relative z-10"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
          >
            {/* TIER 1: দাদা-দাদি / নানা-নানি */}
            {grandTier.length > 0 && (
              <div className="flex flex-col items-center w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold mb-4 shadow-md">
                  <span>🌳 মূল শিকড় ও ১ম স্তর: দাদা-দাদি ও নানা-নানি ({grandTier.length} জন)</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {grandTier.map((m) => (
                    <PhotoMemberCard key={m.id} member={m} onDelete={deleteMember} />
                  ))}
                </div>
              </div>
            )}

            {/* TIER 2: বাবা-মা, চাচা-চাচি, ফুফু-ফুপা, মামা-মামি, খালা-খালু */}
            {parentTier.length > 0 && (
              <div className="flex flex-col items-center w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-800/80 border border-teal-500/60 text-teal-200 text-xs font-bold mb-4 shadow-md">
                  <span>🌿 প্রধান শাখা ও ২য় স্তর: বাবা-মা, চাচা-চাচি, ফুফু ও মামা-খালা ({parentTier.length} জন)</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {parentTier.map((m) => (
                    <PhotoMemberCard key={m.id} member={m} onDelete={deleteMember} />
                  ))}
                </div>
              </div>
            )}

            {/* TIER 3: আমি, ভাই-বোন ও কাজিনবৃন্দ */}
            {selfAndCousinTier.length > 0 && (
              <div className="flex flex-col items-center w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-800/80 border border-indigo-500/60 text-indigo-200 text-xs font-bold mb-4 shadow-md">
                  <span>🍃 ডালপালা ও ৩য় স্তর: আমি, ভাই-বোন ও কাজিনবৃন্দ ({selfAndCousinTier.length} জন)</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {selfAndCousinTier.map((m) => (
                    <PhotoMemberCard
                      key={m.id}
                      member={m}
                      onDelete={deleteMember}
                      isHighlight={m.relation === 'নিজ (আমি)'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TIER 4: সন্তানাদি (ছেলে / মেয়ে) */}
            {childrenTier.length > 0 && (
              <div className="flex flex-col items-center w-full">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-800/80 border border-rose-500/60 text-rose-200 text-xs font-bold mb-4 shadow-md">
                  <span>🌸 নতুন কুঁড়ি ও ৪র্থ স্তর: সন্তানাদি ({childrenTier.length} জন)</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {childrenTier.map((m) => (
                    <PhotoMemberCard key={m.id} member={m} onDelete={deleteMember} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Hidden Tree Canvas for Export */}
      <canvas ref={treeCanvasRef} className="hidden" />

      {/* Add Member Modal with Full Relations & Photo Upload */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>পারিবারিক নতুন সদস্য যুক্ত করুন</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              দাদা-দাদি থেকে শুরু করে কাজিন পর্যন্ত যেকারো ছবি ও সম্পর্ক যুক্ত করুন
            </p>

            <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
              {/* Photo Upload Box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">সদস্যের ছবি (ঐচ্ছিক):</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-bold file:cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">ক্যামেরা বা গ্যালারি থেকে ছবি নির্বাচন করুন</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মোঃ জাহিদ হাসান"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                />
              </div>

              {/* Complete Relationship Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">সম্পর্ক (Relation):</label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value as RelationType)}
                  className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <optgroup label="দাদা-দাদি ও নানা-নানি">
                    <option value="দাদা">দাদা (Paternal Grandfather)</option>
                    <option value="দাদি">দাদি (Paternal Grandmother)</option>
                    <option value="নানা">নানা (Maternal Grandfather)</option>
                    <option value="নানি">নানি (Maternal Grandmother)</option>
                  </optgroup>
                  <optgroup label="বাবা-মা ও চাচা/ফুফু/মামা/খালা">
                    <option value="বাবা">বাবা (Father)</option>
                    <option value="মা">মা (Mother)</option>
                    <option value="চাচা">চাচা (Uncle)</option>
                    <option value="চাচি">চাচি (Aunt)</option>
                    <option value="ফুফু">ফুফু (Aunt)</option>
                    <option value="ফুপা">ফুপা (Uncle)</option>
                    <option value="মামা">মামা (Uncle)</option>
                    <option value="মামি">মামি (Aunt)</option>
                    <option value="খালা">খালা (Aunt)</option>
                    <option value="খালু">খালু (Uncle)</option>
                  </optgroup>
                  <optgroup label="নিজ, ভাই-বোন ও জীবনসঙ্গী">
                    <option value="নিজ (আমি)">নিজ (আমি / Self)</option>
                    <option value="ভাই">ভাই (Brother)</option>
                    <option value="বোন">বোন (Sister)</option>
                    <option value="স্বামী">স্বামী (Husband)</option>
                    <option value="স্ত্রী">স্ত্রী (Wife)</option>
                  </optgroup>
                  <optgroup label="কাজিনবৃন্দ (চাচাত/মামাত/খালাত/ফুফাত)">
                    <option value="চাচাত ভাই">চাচাত ভাই (Cousin)</option>
                    <option value="চাচাত বোন">চাচাত বোন (Cousin)</option>
                    <option value="ফুফাত ভাই">ফুফাত ভাই (Cousin)</option>
                    <option value="ফুফাত বোন">ফুফাত বোন (Cousin)</option>
                    <option value="মামাত ভাই">মামাত ভাই (Cousin)</option>
                    <option value="মামাত বোন">মামাত বোন (Cousin)</option>
                    <option value="খালাত ভাই">খালাত ভাই (Cousin)</option>
                    <option value="খালাত বোন">খালাত বোন (Cousin)</option>
                  </optgroup>
                  <optgroup label="সন্তানাদি">
                    <option value="ছেলে">ছেলে (Son)</option>
                    <option value="মেয়ে">মেয়ে (Daughter)</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">জন্মসাল (ঐচ্ছিক):</label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="যেমন: ১৯৯৫"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">পেশা / অবস্থান:</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="যেমন: ইঞ্জিনিয়ার, ঢাকা"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  গাছে যুক্ত করুন 🌳
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Tree Node Member Card with Photo
const PhotoMemberCard: React.FC<{
  member: FamilyMember;
  onDelete: (id: string) => void;
  isHighlight?: boolean;
}> = ({ member, onDelete, isHighlight = false }) => {
  const isMale = member.gender === 'male';

  return (
    <div
      className={`relative min-w-[160px] max-w-[190px] p-3.5 rounded-2xl border transition-all duration-300 shadow-lg group ${
        isHighlight
          ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-white ring-4 ring-amber-300/60 scale-105'
          : isMale
          ? 'bg-slate-900/90 text-white border-blue-400/50 hover:border-blue-400'
          : 'bg-slate-900/90 text-white border-rose-400/50 hover:border-rose-400'
      }`}
    >
      <button
        onClick={() => onDelete(member.id)}
        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
        title="মুছে ফেলুন"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      <div className="flex flex-col items-center text-center">
        {/* Photo or Avatar */}
        <div
          className={`w-14 h-14 rounded-full border-2 overflow-hidden mb-2 flex items-center justify-center shadow-md ${
            isHighlight
              ? 'border-white bg-amber-200'
              : isMale
              ? 'border-blue-400 bg-blue-950'
              : 'border-rose-400 bg-rose-950'
          }`}
        >
          {member.photo ? (
            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <User className={`w-7 h-7 ${isHighlight ? 'text-amber-900' : isMale ? 'text-blue-300' : 'text-rose-300'}`} />
          )}
        </div>

        <h4 className={`text-xs font-bold truncate max-w-[150px] ${isHighlight ? 'text-slate-950' : 'text-white'}`}>
          {member.name}
        </h4>

        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-1 ${
            isHighlight
              ? 'bg-black text-amber-300'
              : isMale
              ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
              : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
          }`}
        >
          {member.relation}
        </span>

        {member.birthYear && (
          <span className={`text-[10px] mt-1 ${isHighlight ? 'text-slate-800' : 'text-slate-400'}`}>
            জন্ম: {member.birthYear}
          </span>
        )}
      </div>
    </div>
  );
};
