import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  Check,
  Star,
  Compass,
  Download,
  Share2,
  RotateCcw,
  Search,
  Upload,
  FileJson,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Info,
  Sparkles,
  Camera,
  CheckCircle2,
  Globe,
  SlidersHorizontal,
  X,
  Undo2,
  Layers,
} from 'lucide-react';
import { BANGLADESH_DISTRICTS, DistrictGeoData } from '../data/bangladeshDistrictsData';

export type DistrictStatus = 'unselected' | 'home' | 'visited' | 'planned';

interface HistoryState {
  districtId: string;
  previousStatus: DistrictStatus;
  newStatus: DistrictStatus;
}

interface BangladeshMapProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

const STORAGE_KEY = 'mosafa_bd_map_state_v1';

export const BangladeshMap: React.FC<BangladeshMapProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  // Language toggle: 'bn' (Bangla) or 'en' (English)
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // District selections: { [districtId]: 'home' | 'visited' | 'planned' }
  const [districtMap, setDistrictMap] = useState<Record<string, DistrictStatus>>({});

  // History stack for Undo
  const [historyStack, setHistoryStack] = useState<HistoryState[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Active / Hovered district
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictGeoData | null>(null);
  const [selectedDistrictModal, setSelectedDistrictModal] = useState<DistrictGeoData | null>(null);

  // SVG Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Poster & Profile Card Details
  const [userName, setUserName] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('আমার বাংলাদেশ ভ্রমণ মানচিত্র');
  const [customCaption, setCustomCaption] = useState<string>('৬৪ জেলার সৌন্দর্য ও সংস্কৃতির খোঁজে এক স্বপ্নিল পথচলা 🇧🇩');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDistrictLabels, setShowDistrictLabels] = useState(true);

  // Hidden file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const posterCanvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Divisions list
  const divisions = useMemo(() => [
    { id: 'all', bn: 'সব বিভাগ', en: 'All Divisions', count: 64 },
    { id: 'Dhaka', bn: 'ঢাকা', en: 'Dhaka', count: 13 },
    { id: 'Chattogram', bn: 'চট্টগ্রাম', en: 'Chattogram', count: 11 },
    { id: 'Rajshahi', bn: 'রাজশাহী', en: 'Rajshahi', count: 8 },
    { id: 'Khulna', bn: 'খুলনা', en: 'Khulna', count: 10 },
    { id: 'Barishal', bn: 'বরিশাল', en: 'Barishal', count: 6 },
    { id: 'Sylhet', bn: 'সিলেট', en: 'Sylhet', count: 4 },
    { id: 'Rangpur', bn: 'রংপুর', en: 'Rangpur', count: 8 },
    { id: 'Mymensingh', bn: 'ময়মনসিংহ', en: 'Mymensingh', count: 4 },
  ], []);

  // Load saved state from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.districtMap) setDistrictMap(parsed.districtMap);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.customTitle) setCustomTitle(parsed.customTitle);
        if (parsed.customCaption) setCustomCaption(parsed.customCaption);
        if (parsed.userAvatar) setUserAvatar(parsed.userAvatar);
      }
    } catch (e) {
      console.warn('Failed to parse localStorage map state', e);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      const payload = {
        districtMap,
        userName,
        customTitle,
        customCaption,
        userAvatar,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [districtMap, userName, customTitle, customCaption, userAvatar]);

  interface MapCounts {
    homeCount: number;
    visitedCount: number;
    plannedCount: number;
    totalExplored: number;
    unselectedCount: number;
    percentage: number;
    homeDistrict: DistrictGeoData | null;
  }

  // Calculations for counters
  const counts = useMemo<MapCounts>(() => {
    let homeCount = 0;
    let visitedCount = 0;
    let plannedCount = 0;
    let foundHome: DistrictGeoData | null = null;

    BANGLADESH_DISTRICTS.forEach((d) => {
      const status = districtMap[d.id] || 'unselected';
      if (status === 'home') {
        homeCount++;
        foundHome = d;
      } else if (status === 'visited') {
        visitedCount++;
      } else if (status === 'planned') {
        plannedCount++;
      }
    });

    // Home district is also considered a visited district
    const totalExplored = homeCount + visitedCount;
    const percentage = Math.round((totalExplored / 64) * 100);
    const unselectedCount = 64 - totalExplored - plannedCount;

    return {
      homeCount,
      visitedCount,
      plannedCount,
      totalExplored,
      unselectedCount,
      percentage,
      homeDistrict: foundHome,
    };
  }, [districtMap]);

  // Set District Status
  const handleSetStatus = (districtId: string, newStatus: DistrictStatus) => {
    const currentStatus = districtMap[districtId] || 'unselected';
    if (currentStatus === newStatus) return;

    setHistoryStack((prev) => [
      ...prev.slice(-30),
      { districtId, previousStatus: currentStatus, newStatus },
    ]);

    setDistrictMap((prev) => {
      const next = { ...prev };
      // If setting a district as 'home', ensure only ONE district has 'home' status
      if (newStatus === 'home') {
        Object.keys(next).forEach((key) => {
          if (next[key] === 'home') {
            next[key] = 'visited'; // demote previous home to visited
          }
        });
      }

      if (newStatus === 'unselected') {
        delete next[districtId];
      } else {
        next[districtId] = newStatus;
      }
      return next;
    });

    const target = BANGLADESH_DISTRICTS.find((d) => d.id === districtId);
    const dName = target ? (lang === 'bn' ? target.nameBn : target.nameEn) : districtId;

    if (newStatus === 'home') {
      onShowToast(`🌟 ${dName}-কে নিজের জেলা হিসেবে সেট করা হয়েছে!`, '🏡');
    } else if (newStatus === 'visited') {
      onShowToast(`✅ ${dName} ঘুরে দেখা সম্পন্ন!`, '🎒');
    } else if (newStatus === 'planned') {
      onShowToast(`📍 ${dName} ভ্রমণের তালিকায় যোগ করা হয়েছে!`, '✈️');
    } else {
      onShowToast(`⚪ ${dName} অনির্বাচিত করা হয়েছে।`, '🔄');
    }
  };

  // Cycle District Status on direct map click
  const handleMapDistrictClick = (district: DistrictGeoData) => {
    const current = districtMap[district.id] || 'unselected';
    // Cycle: unselected -> visited -> planned -> unselected (Home set via button or modal)
    let next: DistrictStatus = 'visited';
    if (current === 'unselected') next = 'visited';
    else if (current === 'visited') next = 'planned';
    else if (current === 'planned') next = 'unselected';
    else if (current === 'home') next = 'visited';

    handleSetStatus(district.id, next);
  };

  // Undo Last Action
  const handleUndo = () => {
    if (historyStack.length === 0) {
      onShowToast(lang === 'bn' ? 'পূর্বাবস্থায় ফেরানোর কিছু নেই!' : 'Nothing to undo!', '⚠️');
      return;
    }
    const lastAction = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    setDistrictMap((prev) => {
      const next = { ...prev };
      if (lastAction.previousStatus === 'unselected') {
        delete next[lastAction.districtId];
      } else {
        next[lastAction.districtId] = lastAction.previousStatus;
      }
      return next;
    });

    onShowToast(lang === 'bn' ? 'পূর্বের অবস্থা ফিরিয়ে আনা হয়েছে ↩️' : 'Undone previous action ↩️', '↩️');
  };

  // Reset All
  const handleResetAll = () => {
    setDistrictMap({});
    setHistoryStack([]);
    setShowResetConfirm(false);
    onShowToast(lang === 'bn' ? 'সকল জেলার নির্বাচন রিসেট করা হয়েছে!' : 'All selections reset!', '🔄');
  };

  // Filtered Districts for Grid list
  const filteredDistricts = useMemo(() => {
    return BANGLADESH_DISTRICTS.filter((d) => {
      const matchesDivision = selectedDivision === 'all' || d.divEn === selectedDivision;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        d.nameBn.toLowerCase().includes(q) ||
        d.nameEn.toLowerCase().includes(q) ||
        d.divBn.toLowerCase().includes(q) ||
        d.divEn.toLowerCase().includes(q);
      return matchesDivision && matchesSearch;
    });
  }, [selectedDivision, searchQuery]);

  // Color mappings
  const getStatusColor = (status: DistrictStatus) => {
    switch (status) {
      case 'home':
        return '#f59e0b'; // Amber-500
      case 'visited':
        return '#10b981'; // Emerald-500
      case 'planned':
        return '#0284c7'; // Sky-600
      default:
        return '#e2e8f0'; // Slate-200
    }
  };

  const getStatusBorder = (status: DistrictStatus) => {
    switch (status) {
      case 'home':
        return '#b45309';
      case 'visited':
        return '#047857';
      case 'planned':
        return '#0369a1';
      default:
        return '#94a3b8';
    }
  };

  // Avatar Upload Handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      onShowToast(lang === 'bn' ? 'ছবির সাইজ ৩ মেগাবাইটের কম হতে হবে।' : 'Image size must be under 3MB.', '⚠️');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserAvatar(event.target?.result as string);
      onShowToast(lang === 'bn' ? 'প্রোফাইল ছবি সফলভাবে যুক্ত হয়েছে! 📸' : 'Profile photo added! 📸', '✅');
    };
    reader.readAsDataURL(file);
  };

  // JSON Export (Backup)
  const handleExportJSON = () => {
    const data = {
      appName: 'MoSaFa My Bangladesh Map',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      districtMap,
      userName,
      customTitle,
      customCaption,
      stats: {
        totalExplored: counts.totalExplored,
        percentage: counts.percentage,
        plannedCount: counts.plannedCount,
        homeDistrict: counts.homeDistrict ? counts.homeDistrict.nameBn : null,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-bangladesh-map-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(lang === 'bn' ? 'ম্যাপ ডাটা সফলভাবে এক্সপোর্ট হয়েছে! 📥' : 'Map data exported! 📥', '💾');
  };

  // JSON Import (Restore)
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format');
        }

        // Validate districtMap keys
        const validIds = new Set(BANGLADESH_DISTRICTS.map((d) => d.id));
        const cleanMap: Record<string, DistrictStatus> = {};

        if (parsed.districtMap && typeof parsed.districtMap === 'object') {
          Object.keys(parsed.districtMap).forEach((k) => {
            if (validIds.has(k)) {
              const val = parsed.districtMap[k];
              if (['home', 'visited', 'planned', 'unselected'].includes(val)) {
                cleanMap[k] = val;
              }
            }
          });
        }

        setDistrictMap(cleanMap);
        if (typeof parsed.userName === 'string') setUserName(parsed.userName);
        if (typeof parsed.customTitle === 'string') setCustomTitle(parsed.customTitle);
        if (typeof parsed.customCaption === 'string') setCustomCaption(parsed.customCaption);

        onShowToast(
          lang === 'bn'
            ? `ব্যাকআপ সফলভাবে রিস্টোর হয়েছে! (${Object.keys(cleanMap).length}টি জেলা লোড হয়েছে)`
            : `Backup restored! (${Object.keys(cleanMap).length} districts loaded)`,
          '🎉'
        );
      } catch (err) {
        onShowToast(
          lang === 'bn' ? 'ফাইলটি সঠিক ফরম্যাটে নেই। ব্যাকআপ ব্যর্থ হয়েছে।' : 'Invalid backup JSON file.',
          '❌'
        );
      }
    };
    reader.readAsText(file);
    if (jsonImportRef.current) jsonImportRef.current.value = '';
  };

  // High-Resolution Poster Generation using Canvas
  const generatePosterCanvas = async (): Promise<string> => {
    setIsGeneratingPoster(true);

    return new Promise((resolve, reject) => {
      const canvas = posterCanvasRef.current;
      if (!canvas) {
        setIsGeneratingPoster(false);
        reject('Canvas not found');
        return;
      }

      // Poster dimensions: 1200 x 1500 (High-res 4:5 social media standard)
      const w = 1200;
      const h = 1500;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsGeneratingPoster(false);
        reject('Context not found');
        return;
      }

      // Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0f172a'); // Slate-900
      bgGrad.addColorStop(0.5, '#1e1b4b'); // Indigo-950
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle decorative top glowing circle
      const glowGrad = ctx.createRadialGradient(w / 2, 200, 50, w / 2, 200, 500);
      glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0.25)'); // Rose glow
      glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, 600);

      // Outer Decorative Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 40, w - 80, h - 80);

      // Header Brand
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#f43f5e'; // Rose-500
      ctx.fillText('🇧🇩 The MoSaFa Tools • My Bangladesh Map', w / 2, 85);

      // Poster Title
      ctx.font = 'bold 44px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(customTitle || 'আমার বাংলাদেশ ভ্রমণ মানচিত্র', w / 2, 140);

      // Poster Subtitle / Caption
      ctx.font = '500 20px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#cbd5e1'; // Slate-300
      ctx.fillText(customCaption || '৬৪ জেলার রূপ ও সংস্কৃতির খোঁজে এক অবিরাম পথচলা', w / 2, 180);

      // User Profile & Stats Bar
      const profileBoxY = 215;
      const profileBoxH = 90;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.roundRect(70, profileBoxY, w - 140, profileBoxH, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      // Display Name & Stats
      ctx.textAlign = 'left';
      ctx.font = 'bold 26px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#ffffff';
      const dispName = userName.trim() || (lang === 'bn' ? 'বাংলাদেশ পরিব্রাজক' : 'Bangladesh Explorer');
      ctx.fillText(dispName, 180, profileBoxY + 42);

      ctx.font = '500 18px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#f59e0b'; // Amber
      const homeTxt = counts.homeDistrict
        ? `হোম ডিস্ট্রিক্ট: ${counts.homeDistrict.nameBn}`
        : 'হোম ডিস্ট্রিক্ট: নির্বাচন করুন';
      ctx.fillText(homeTxt, 180, profileBoxY + 70);

      // Score badges on the right side of profile bar
      ctx.textAlign = 'right';
      ctx.font = 'bold 32px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#10b981'; // Emerald
      ctx.fillText(`${counts.totalExplored} / ৬৪`, w - 100, profileBoxY + 46);

      ctx.font = 'bold 16px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`ভ্রমণ সম্পন্ন: ${counts.percentage}%`, w - 100, profileBoxY + 72);

      // Render Avatar or Default Icon
      const renderAvatar = () => {
        if (userAvatar) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(125, profileBoxY + 45, 32, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, 93, profileBoxY + 13, 64, 64);
            ctx.restore();

            // Border around avatar
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(125, profileBoxY + 45, 32, 0, Math.PI * 2);
            ctx.stroke();
            renderMapPaths();
          };
          img.onerror = () => {
            drawFallbackAvatar();
            renderMapPaths();
          };
          img.src = userAvatar;
        } else {
          drawFallbackAvatar();
          renderMapPaths();
        }
      };

      const drawFallbackAvatar = () => {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(125, profileBoxY + 45, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🇧🇩', 125, profileBoxY + 54);
      };

      // Draw SVG Map on Canvas
      const renderMapPaths = () => {
        // Map placement coordinates:
        // Original SVG viewBox: 0 0 800 1150
        // Canvas map box: X: 150, Y: 330, width: 900, height: 1000
        const mapScale = 0.88;
        const mapOffsetX = 250;
        const mapOffsetY = 330;

        ctx.save();
        ctx.translate(mapOffsetX, mapOffsetY);
        ctx.scale(mapScale, mapScale);

        BANGLADESH_DISTRICTS.forEach((district) => {
          const status = districtMap[district.id] || 'unselected';
          const fillColor = getStatusColor(status);
          const strokeColor = getStatusBorder(status);

          const path2d = new Path2D(district.path);

          // Fill
          ctx.fillStyle = fillColor;
          ctx.fill(path2d);

          // Stroke
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = status === 'unselected' ? 1 : 1.8;
          ctx.stroke(path2d);

          // If Home district, draw glowing star icon at centroid
          if (status === 'home' && district.cx && district.cy) {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(district.cx, district.cy - 8, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', district.cx, district.cy - 7);
          }

          // Draw district name label inside district
          if (district.cx && district.cy) {
            const isCompact = ['dhaka', 'narayanganj', 'munshiganj', 'feni', 'meherpur', 'jhalokati', 'chuadanga', 'magura', 'rajbari', 'shariatpur'].includes(district.id);
            const isLarge = ['rangamati', 'bandarban', 'khulna', 'sunamganj', 'sylhet', 'mymensingh', 'dinajpur', 'naogaon', 'bagerhat'].includes(district.id);
            const fontSize = isCompact ? (district.nameBn.length > 7 ? 6.5 : 7.2) : isLarge ? 9 : (district.nameBn.length > 8 ? 7.5 : 8.2);

            ctx.font = `700 ${fontSize}px "Hind Siliguri", "Noto Sans Bengali", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#ffffff';
            const labelY = status === 'home' ? district.cy + 7 : district.cy;
            ctx.strokeText(district.nameBn, district.cx, labelY);
            ctx.fillStyle = '#0f172a';
            ctx.fillText(district.nameBn, district.cx, labelY);
          }
        });

        ctx.restore();

        // Legend Section at Bottom
        const legendY = 1360;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.roundRect(70, legendY, w - 140, 65, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.stroke();

        const items = [
          { color: '#f59e0b', text: `আমার নিজের জেলা (${counts.homeCount})` },
          { color: '#10b981', text: `ঘুরে দেখা হয়েছে (${counts.visitedCount})` },
          { color: '#0284c7', text: `ভ্রমণের ইচ্ছা (${counts.plannedCount})` },
          { color: '#cbd5e1', text: `বাকি আছে (${counts.unselectedCount})` },
        ];

        const itemSpacing = (w - 180) / 4;
        items.forEach((item, idx) => {
          const x = 110 + idx * itemSpacing;
          // Color pill
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(x, legendY + 33, 8, 0, Math.PI * 2);
          ctx.fill();
          // Text
          ctx.textAlign = 'left';
          ctx.font = '600 16px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(item.text, x + 15, legendY + 39);
        });

        // Bottom Footer Watermark & Attribution
        ctx.textAlign = 'center';
        ctx.font = '14px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
        ctx.fillStyle = '#64748b'; // Slate-500
        ctx.fillText(
          'তৈরি করুন আপনার ব্যক্তিগত ভ্রমণ মানচিত্র: The MoSaFa Tools • ভৌগোলিক সীমানা সূত্র: BBS ও geoBoundaries (ODbL)',
          w / 2,
          1455
        );

        const dataUrl = canvas.toDataURL('image/png');
        setPosterPreviewUrl(dataUrl);
        setIsGeneratingPoster(false);
        resolve(dataUrl);
      };

      renderAvatar();
    });
  };

  // Download Poster as PNG
  const handleDownloadPoster = async () => {
    try {
      let url = posterPreviewUrl;
      if (!url) {
        url = await generatePosterCanvas();
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = `MoSaFa-My-Bangladesh-Map-${(userName || 'traveler').replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onShowToast(lang === 'bn' ? 'পোস্টার PNG সফলভাবে ডাউনলোড হয়েছে! 🎨' : 'Poster PNG downloaded! 🎨', '🎉');
    } catch (err) {
      onShowToast(lang === 'bn' ? 'পোস্টার তৈরি করতে ব্যর্থ হয়েছে।' : 'Poster generation failed.', '❌');
    }
  };

  // Web Share API
  const handleSharePoster = async () => {
    try {
      let url = posterPreviewUrl;
      if (!url) {
        url = await generatePosterCanvas();
      }

      // Convert data URL to Blob for Web Share
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], 'my-bangladesh-map.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: customTitle || 'MoSaFa My Bangladesh Map',
          text: `🇧🇩 আমার বাংলাদেশ ভ্রমণ মানচিত্র! আমি ইতিমধ্যে ৬৪ জেলার মধ্যে ${counts.totalExplored}টি জেলা ঘুরেছি (${counts.percentage}%)। The MoSaFa Tools-এ আপনার ম্যাপ তৈরি করুন!`,
          files: [file],
        });
        onShowToast(lang === 'bn' ? 'সফলভাবে শেয়ার করা হয়েছে! 🚀' : 'Shared successfully! 🚀', '✨');
      } else {
        // Fallback to download
        handleDownloadPoster();
      }
    } catch (e) {
      handleDownloadPoster();
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 py-6 px-3 sm:px-6 relative text-slate-800">
      {/* Hidden Poster Canvas */}
      <canvas ref={posterCanvasRef} className="hidden" />

      {/* Top Navigation & App Bar */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBackToHub}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>⬅️</span>
            <span>{lang === 'bn' ? 'মূল টুলস হাব' : 'Tools Hub'}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                <span>MoSaFa My Bangladesh Map</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase">
                  ৬৪ জেলা
                </span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {lang === 'bn'
                ? 'আপনার ভ্রমণের জেলাগুলো নির্বাচন করুন ও আকর্ষণীয় সোশ্যাল পোস্টার তৈরি করুন'
                : 'Select your visited districts and create your customized Bangladesh travel poster'}
            </p>
          </div>
        </div>

        {/* Action Controls & Language Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="ভাষা পরিবর্তন / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Undo Button */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyStack.length === 0}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              historyStack.length > 0
                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer'
                : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
            title="পূর্বাবস্থায় ফেরান"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'আন্ডু' : 'Undo'}</span>
          </button>

          {/* Export / Backup JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
            title="ম্যাপ ডাটা ব্যাকআপ ডাউনলোড"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'ব্যাকআপ' : 'Backup'}</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => jsonImportRef.current?.click()}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
            title="ব্যাকআপ রিস্টোর করুন"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'রিস্টোর' : 'Restore'}</span>
          </button>
          <input
            type="file"
            ref={jsonImportRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />

          {/* Reset All */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
            title="সব জেলা রিসেট করুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
          </button>

          {/* Create Poster Button */}
          <button
            type="button"
            onClick={async () => {
              setShowPosterModal(true);
              await generatePosterCanvas();
            }}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{lang === 'bn' ? 'পোস্টার তৈরি করুন' : 'Generate Poster'}</span>
          </button>
        </div>
      </header>

      {/* Progress & Stat Cards Bar */}
      <section className="max-w-7xl mx-auto mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Home District */}
        <div className="bg-white p-4 rounded-3xl border border-amber-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'নিজের জেলা' : 'Home District'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              ★
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-amber-600 truncate">
              {counts.homeDistrict
                ? lang === 'bn'
                  ? counts.homeDistrict.nameBn
                  : counts.homeDistrict.nameEn
                : lang === 'bn'
                ? 'সিলেক্ট করুন'
                : 'Not Set'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {counts.homeDistrict ? `${counts.homeDistrict.divBn} বিভাগ` : 'ম্যাপে বা তালিকায় সেট করুন'}
            </p>
          </div>
        </div>

        {/* Card 2: Visited Districts */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'ঘুরে দেখা হয়েছে' : 'Visited Districts'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-emerald-600 flex items-baseline gap-1.5">
              <span>{counts.totalExplored}</span>
              <span className="text-xs font-bold text-slate-400">/ ৬৪</span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-auto">
                {counts.percentage}%
              </span>
            </div>
            {/* Visual progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${counts.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Want to Visit */}
        <div className="bg-white p-4 rounded-3xl border border-sky-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'ভ্রমণের ইচ্ছা' : 'Want to Visit'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
              ✈
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-sky-600 flex items-baseline gap-1.5">
              <span>{counts.plannedCount}</span>
              <span className="text-xs font-bold text-slate-400">জেলা</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {lang === 'bn' ? 'ভবিষ্যৎ ট্যুর প্ল্যানে রয়েছে' : 'Planned for upcoming trips'}
            </p>
          </div>
        </div>

        {/* Card 4: Remaining */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'bn' ? 'অদেখা বাকি' : 'Remaining'}
            </span>
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
              ○
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-700 flex items-baseline gap-1.5">
              <span>{counts.unselectedCount}</span>
              <span className="text-xs font-bold text-slate-400">জেলা</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {lang === 'bn' ? 'এখনও দেখা বাকি আছে' : 'Yet to be explored'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Workspace: Interactive Map & District Selection Panel */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive SVG Map (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm relative flex flex-col">
          {/* Map Header & Controls */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-500" />
                <span>{lang === 'bn' ? 'ইন্টারেক্টিভ বাংলাদেশ মানচিত্র' : 'Interactive Bangladesh Map'}</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'bn'
                  ? 'যেকোনো জেলায় ট্যাপ করে স্ট্যাটাস পরিবর্তন করুন (ঘুরেছি ➔ ইচ্ছা ➔ অনির্বাচিত)'
                  : 'Tap any district to cycle status (Visited ➔ Planned ➔ Unselected)'}
              </p>
            </div>

            {/* Action Buttons: Toggle District Names & Zoom Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* District Names Visibility Toggle */}
              <button
                type="button"
                onClick={() => setShowDistrictLabels((v) => !v)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer border ${
                  showDistrictLabels
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title={lang === 'bn' ? 'মানচিত্রে জেলার নাম প্রদর্শন/লুকান' : 'Toggle district names on map'}
              >
                <span className="text-[12px]">🏷️</span>
                <span>
                  {lang === 'bn'
                    ? showDistrictLabels
                      ? 'জেলার নাম: চালু'
                      : 'জেলার নাম: বন্ধ'
                    : showDistrictLabels
                    ? 'Names: ON'
                    : 'Names: OFF'}
                </span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-2xs transition cursor-pointer"
                  title="জুম ইন (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.25))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-2xs transition cursor-pointer"
                  title="জুম আউট (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-2xs transition cursor-pointer"
                  title="রিসেট ভিউ"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive SVG Canvas Container */}
          <div
            className="w-full relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-slate-50/40 to-slate-100/60 rounded-2xl border border-slate-200/80 select-none flex items-center justify-center min-h-[500px] sm:min-h-[620px]"
            onMouseDown={(e) => {
              if (zoomLevel > 1) {
                setIsPanning(true);
                setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
              }
            }}
            onMouseMove={(e) => {
              if (isPanning && zoomLevel > 1) {
                setPanOffset({
                  x: e.clientX - panStart.x,
                  y: e.clientY - panStart.y,
                });
              }
            }}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
          >
            {/* The SVG Map */}
            <svg
              ref={svgRef}
              viewBox="0 0 800 1150"
              className="w-full h-auto max-h-[700px] transition-transform duration-100"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
              }}
            >
              <defs>
                <filter id="mapShadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Districts Paths Layer */}
              <g id="districts-layer">
                {BANGLADESH_DISTRICTS.map((district) => {
                  const status = districtMap[district.id] || 'unselected';
                  const isHovered = hoveredDistrict?.id === district.id;
                  const fillColor = getStatusColor(status);
                  const strokeColor = getStatusBorder(status);

                  return (
                    <path
                      key={district.id}
                      d={district.path}
                      fill={fillColor}
                      stroke={isHovered ? '#f43f5e' : strokeColor}
                      strokeWidth={isHovered ? 2.5 : status === 'unselected' ? 1 : 1.6}
                      strokeLinejoin="round"
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredDistrict(district)}
                      onMouseLeave={() => setHoveredDistrict(null)}
                      onClick={() => handleMapDistrictClick(district)}
                    >
                      <title>{`${district.nameBn} (${district.nameEn}) • ${district.divBn} বিভাগ`}</title>
                    </path>
                  );
                })}
              </g>

              {/* District Names & Home Indicators Layer (Rendered on top of borders for crystal-clear readability) */}
              <g id="district-labels-layer" className="pointer-events-none select-none">
                {BANGLADESH_DISTRICTS.map((district) => {
                  const status = districtMap[district.id] || 'unselected';
                  const isHome = status === 'home';
                  const labelText = lang === 'bn' ? district.nameBn : district.nameEn;

                  // Adaptive font size so names fit neatly inside boundaries while remaining super legible
                  const isCompact = [
                    'dhaka',
                    'narayanganj',
                    'munshiganj',
                    'feni',
                    'meherpur',
                    'jhalokati',
                    'chuadanga',
                    'magura',
                    'rajbari',
                    'shariatpur',
                  ].includes(district.id);
                  const isLarge = [
                    'rangamati',
                    'bandarban',
                    'khulna',
                    'sunamganj',
                    'sylhet',
                    'mymensingh',
                    'dinajpur',
                    'naogaon',
                    'bagerhat',
                  ].includes(district.id);

                  const fontSize = isCompact
                    ? labelText.length > 7
                      ? '6.5px'
                      : '7.2px'
                    : isLarge
                    ? '9px'
                    : labelText.length > 8
                    ? '7.5px'
                    : '8.2px';

                  const labelY = isHome ? district.cy + 7 : district.cy;

                  return (
                    <g key={`marker-${district.id}`} className="transition-all duration-150">
                      {/* Home Star Indicator on Map Centroid */}
                      {isHome && district.cx && district.cy && (
                        <g>
                          <circle
                            cx={district.cx}
                            cy={district.cy - 7}
                            r={6.5}
                            fill="#f59e0b"
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            className="animate-pulse"
                          />
                          <text
                            x={district.cx}
                            y={district.cy - 6.5}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="8px"
                            fill="#ffffff"
                            fontWeight="bold"
                          >
                            ★
                          </text>
                        </g>
                      )}

                      {/* District Name Label: High-contrast white halo outline with crisp dark text */}
                      {showDistrictLabels && district.cx && district.cy && (
                        <text
                          x={district.cx}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={fontSize}
                          fontWeight="700"
                          fontFamily="'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif"
                          style={{
                            paintOrder: 'stroke fill',
                            stroke: '#ffffff',
                            strokeWidth: '2.4px',
                            strokeLinejoin: 'round',
                            strokeLinecap: 'round',
                            fill: '#0f172a',
                            letterSpacing: '-0.2px',
                          }}
                        >
                          {labelText}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Hover Floating Tooltip */}
            {hoveredDistrict && (
              <div className="absolute top-4 left-4 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-700 pointer-events-none animate-in fade-in duration-150 z-20">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">
                    {lang === 'bn' ? hoveredDistrict.nameBn : hoveredDistrict.nameEn}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    ({lang === 'bn' ? hoveredDistrict.nameEn : hoveredDistrict.nameBn})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{hoveredDistrict.divBn} বিভাগ</span>
                  <span>•</span>
                  <span className="font-semibold text-rose-400">
                    {districtMap[hoveredDistrict.id] === 'home'
                      ? '🌟 নিজের জেলা'
                      : districtMap[hoveredDistrict.id] === 'visited'
                      ? '✅ ঘুরে দেখা হয়েছে'
                      : districtMap[hoveredDistrict.id] === 'planned'
                      ? '📍 যাওয়ার ইচ্ছা আছে'
                      : '⚪ অনির্বাচিত'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Map Legend Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-2xs" />
                <span className="font-semibold text-slate-700">{lang === 'bn' ? 'নিজের জেলা' : 'Home'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs" />
                <span className="font-semibold text-slate-700">{lang === 'bn' ? 'ঘুরেছি' : 'Visited'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-600 shadow-2xs" />
                <span className="font-semibold text-slate-700">{lang === 'bn' ? 'যেতে চাই' : 'Planned'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300 shadow-2xs" />
                <span className="font-semibold text-slate-700">{lang === 'bn' ? 'অনির্বাচিত' : 'Unselected'}</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400">
              {lang === 'bn' ? 'ম্যাপ সূত্র: BBS ও geoBoundaries (CC BY 3.0)' : 'Data: BBS & geoBoundaries'}
            </span>
          </div>
        </div>

        {/* Right Column: District Selection & Status Control Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col max-h-[820px]">
          {/* Search Box */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'জেলা খুঁজুন... যেমন: ঢাকা, সিলেট, খুলনা' : 'Search district...'}
              className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Division Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
            {divisions.map((div) => (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivision(div.id)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap text-[11px] font-bold transition cursor-pointer shrink-0 ${
                  selectedDivision === div.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{lang === 'bn' ? div.bn : div.en}</span>
                <span className="ml-1 opacity-70">({div.count})</span>
              </button>
            ))}
          </div>

          {/* Districts List (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredDistricts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <span className="text-3xl block mb-1">🔍</span>
                <p className="text-xs font-bold">কোনো জেলা পাওয়া যায়নি!</p>
              </div>
            ) : (
              filteredDistricts.map((d) => {
                const currentStatus = districtMap[d.id] || 'unselected';

                return (
                  <div
                    key={d.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      currentStatus === 'home'
                        ? 'bg-amber-50/70 border-amber-300'
                        : currentStatus === 'visited'
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : currentStatus === 'planned'
                        ? 'bg-sky-50/70 border-sky-300'
                        : 'bg-slate-50/60 border-slate-200/90 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {lang === 'bn' ? d.nameBn : d.nameEn}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({lang === 'bn' ? d.nameEn : d.nameBn})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        <span>{d.divBn} বিভাগ</span>
                      </div>
                    </div>

                    {/* Quick Category Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Home Button */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(d.id, currentStatus === 'home' ? 'unselected' : 'home')}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          currentStatus === 'home'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                        title="আমার নিজের জেলা"
                      >
                        ★
                      </button>

                      {/* Visited Button */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(d.id, currentStatus === 'visited' ? 'unselected' : 'visited')}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          currentStatus === 'visited'
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="ঘুরে দেখেছি (Visited)"
                      >
                        ✓
                      </button>

                      {/* Planned Button */}
                      <button
                        type="button"
                        onClick={() => handleSetStatus(d.id, currentStatus === 'planned' ? 'unselected' : 'planned')}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          currentStatus === 'planned'
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-400 hover:text-sky-600 hover:bg-sky-50'
                        }`}
                        title="ভ্রমণের ইচ্ছা (Want to visit)"
                      >
                        ✈
                      </button>

                      {/* Reset Button (only shown if selected) */}
                      {currentStatus !== 'unselected' && (
                        <button
                          type="button"
                          onClick={() => handleSetStatus(d.id, 'unselected')}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Poster Generation Modal */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 max-h-[94vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {lang === 'bn' ? 'ব্যক্তিগত ভ্রমণ মানচিত্র পোস্টার' : 'Personal Map Card & Poster'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'bn'
                      ? 'নাম, ছবি ও পছন্দের ক্যাপশন দিয়ে সোশ্যাল মিডিয়া পোস্টার তৈরি করুন'
                      : 'Customize and download your social media travel map poster'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPosterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Form Customization Controls (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                {/* User Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'আপনার নাম' : 'Your Display Name'}
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  />
                </div>

                {/* Poster Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'পোস্টার শিরোনাম' : 'Poster Title'}
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="আমার বাংলাদেশ ভ্রমণ মানচিত্র"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                  />
                </div>

                {/* Custom Caption */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'ক্যাপশন বা উক্তি' : 'Short Caption / Quote'}
                  </label>
                  <textarea
                    rows={2}
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    placeholder="৬৪ জেলার সৌন্দর্য দেখার এক স্বপ্নিল যাত্রা..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition resize-none"
                  />
                </div>

                {/* Profile Avatar Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {lang === 'bn' ? 'প্রোফাইল ছবি যুক্ত করুন (ঐচ্ছিক)' : 'Profile Photo (Optional)'}
                  </label>
                  <div className="flex items-center gap-3">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Profile"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-rose-500"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      {userAvatar ? (lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change') : (lang === 'bn' ? 'ছবি আপলোড' : 'Upload')}
                    </button>
                    {userAvatar && (
                      <button
                        type="button"
                        onClick={() => setUserAvatar(null)}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        {lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                      </button>
                    )}
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Regenerate Preview Button */}
                <button
                  type="button"
                  onClick={generatePosterCanvas}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'পোস্টার আপডেট করুন' : 'Update Poster Preview'}</span>
                </button>
              </div>

              {/* Poster Live Preview & Download (7 cols) */}
              <div className="md:col-span-7 flex flex-col items-center">
                <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative bg-slate-900">
                  {isGeneratingPoster ? (
                    <div className="h-[420px] flex items-center justify-center text-white text-xs">
                      পোস্টার তৈরি হচ্ছে...
                    </div>
                  ) : posterPreviewUrl ? (
                    <img
                      src={posterPreviewUrl}
                      alt="MoSaFa My Bangladesh Map Poster"
                      className="w-full h-auto object-contain"
                    />
                  ) : (
                    <div className="h-[420px] flex items-center justify-center text-slate-400 text-xs">
                      প্রিভিউ লোড করতে 'পোস্টার আপডেট করুন' চাপুন
                    </div>
                  )}
                </div>

                {/* Download and Share Buttons */}
                <div className="flex items-center gap-3 w-full max-w-sm mt-5">
                  <button
                    type="button"
                    onClick={handleDownloadPoster}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'PNG ডাউনলোড করুন' : 'Download PNG'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSharePoster}
                    className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    title="সোশ্যাল মিডিয়ায় শেয়ার"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'শেয়ার' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <span className="text-4xl block mb-2">⚠️</span>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              {lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {lang === 'bn'
                ? 'আপনার নির্বাচিত সকল জেলার রেকর্ড মুছে যাবে। আপনি চাইলে আগে "ব্যাকআপ" বাটনে ক্লিক করে JSON ফাইল সংরক্ষণ করতে পারেন।'
                : 'All selected districts will be cleared. You can export a backup before resetting.'}
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-sm shadow-rose-200"
              >
                {lang === 'bn' ? 'হ্যাঁ, রিসেট করুন' : 'Yes, Reset All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
