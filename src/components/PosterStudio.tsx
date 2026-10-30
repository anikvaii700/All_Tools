import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Share2,
  Newspaper,
  Quote,
  Smile,
  Megaphone,
  User,
  Sliders,
  Type,
  Check,
  Copy,
  Scissors,
  Maximize2,
  MoveVertical,
  MoveHorizontal,
  RefreshCw,
  Sparkles,
  Move,
  Crosshair,
  Eye,
  EyeOff,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { removeImageBackground } from '../utils/imageCutout';

interface PosterStudioProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export type PosterTemplate = 'news' | 'quote' | 'meme' | 'slogan' | 'branding';
export type AspectRatio = '1:1' | '4:5' | '16:9';

export const PosterStudio: React.FC<PosterStudioProps> = ({ onBackToHub, onShowToast }) => {
  const [template, setTemplate] = useState<PosterTemplate>('news');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  // Text & Content fields
  const [headline, setHeadline] = useState<string>('ব্রেকিং নিউজ: দারুণ পোস্টার তৈরি করুন নিমেষেই!');
  const [subtitle, setSubtitle] = useState<string>('The MoSaFa পোস্টার স্টুডিওর নতুন ফিচার রিলিজ');
  const [bodyText, setBodyText] = useState<string>(
    'সহজেই তৈরি করুন ফেসবুক পোস্ট, কোটেশন, মিম ও ব্যানার।'
  );
  const [authorName, setAuthorName] = useState<string>('The MoSaFa News');
  const [categoryTag, setCategoryTag] = useState<string>('বিশেষ সংবাদ');
  const [watermark, setWatermark] = useState<string>('@mosafa_official');
  const [dateText, setDateText] = useState<string>(
    new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
  );

  // Photos & Cutout Engine
  const [uploadedImage1, setUploadedImage1] = useState<string | null>(null);
  const [rawUploadedImage1, setRawUploadedImage1] = useState<string | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [autoCutout, setAutoCutout] = useState<boolean>(true);
  const [cutoutTolerance, setCutoutTolerance] = useState<number>(42);
  const [imageAspect, setImageAspect] = useState<number>(0.85);

  // 4-Way Photo Scale, Stretch and Position (for slogan & leader portraits)
  const [photoScale, setPhotoScale] = useState<number>(100);
  const [photoWidthScale, setPhotoWidthScale] = useState<number>(100);
  const [photoHeightScale, setPhotoHeightScale] = useState<number>(100);
  const [photoPosY, setPhotoPosY] = useState<number>(15);
  const [photoPosX, setPhotoPosX] = useState<number>(0);
  const [showTransformOverlay, setShowTransformOverlay] = useState<boolean>(true);

  // Controls
  const [fontSize, setFontSize] = useState<number>(28);
  const [quoteBgTheme, setQuoteBgTheme] = useState<'gold_dark' | 'vintage_rose' | 'deep_blue'>('gold_dark');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const handleTemplateChange = (tmpl: PosterTemplate) => {
    setTemplate(tmpl);
    if (tmpl === 'news') {
      setHeadline('ব্রেকিং নিউজ: দ্য মোফাচ্ছির স্টুডিওতে এলো বিশেষ আপডেট!');
      setSubtitle('সরাসরি সম্প্রচার • সারাদেশের দর্শকরা উদ্বেলিত');
      setCategoryTag('বিশেষ সংবাদ');
      setAuthorName('MoSaFa 24 News');
    } else if (tmpl === 'quote') {
      setHeadline('“সততা এবং ত্যাগ স্বীকার ছাড়া কোনো মহান সম্পর্ক দীর্ঘজীবী হতে পারে না।”');
      setSubtitle('— অমূল্য জীবনবোধ ও পাথেয়');
      setCategoryTag('বাংলা বাণী');
      setAuthorName('The MoSaFa Quotes');
    } else if (tmpl === 'meme') {
      setHeadline('যখন বন্ধু বলে: "আমি ৫ মিনিটে আসছি রে দোস্ত!"');
      setSubtitle('২ ঘণ্টা পর... এখনো বাসার নিচে দাঁড়াইয়া আছি! 😂');
      setCategoryTag('ফ্রেন্ড মিম');
      setAuthorName('Funny Troll BD');
    } else if (tmpl === 'slogan') {
      setHeadline('দেশ ঠিক করতে এবং দেশে শান্তি ফিরিয়ে আনতে সময় লাগে মাত্র ৭দিন।');
      setSubtitle('তত্ত্বাবধায়ক সরকারের সাবেক প্রধান উপদেষ্টা');
      setCategoryTag('বিজয় স্লোগান');
      setAuthorName('ফখরুদ্দীন আহমেদ');
      setAspectRatio('4:5');
    } else if (tmpl === 'branding') {
      setHeadline('প্রফেশনাল কন্টেন্ট ক্রিয়েটর ও সফটওয়্যার ইঞ্জিনিয়ার');
      setSubtitle('ডিজিটাল টেকনোলজি ও আধুনিক ওয়েব সল্যুশন');
      setCategoryTag('পার্সোনাল ব্র্যান্ড');
      setAuthorName('মোফাচ্ছির আহমেদ');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      if (slot === 1) {
        setRawUploadedImage1(result);
        const tempImg = new Image();
        tempImg.onload = () => {
          if (tempImg.width && tempImg.height) {
            setImageAspect(tempImg.width / tempImg.height);
          }
        };
        tempImg.src = result;

        if (autoCutout) {
          setIsRemovingBg(true);
          onShowToast('ছবির ব্যাকগ্রাউন্ড রিমুভ ও কাটআউট প্রসেস হচ্ছে... ✂️', '⏳');
          try {
            const cutout = await removeImageBackground(result, { tolerance: cutoutTolerance });
            setUploadedImage1(cutout);
            onShowToast('ব্যাকগ্রাউন্ড রিমুভ সম্পন্ন! ছবি সেট করা হয়েছে 🖼️✨', '✅');
          } catch (err) {
            console.error('Cutout error:', err);
            setUploadedImage1(result);
            onShowToast('ছবি আপলোড সম্পন্ন! 🖼️', '✅');
          } finally {
            setIsRemovingBg(false);
          }
        } else {
          setUploadedImage1(result);
          onShowToast('ছবি আপলোড সম্পন্ন! 🖼️', '✅');
        }
      } else if (slot === 2) {
        setUploadedImage2(result);
        if (template === 'slogan') {
          onShowToast('২য় ছবি পেছনের ব্যাকগ্রাউন্ড হিসেবে যুক্ত হয়েছে! 🌄✨', '✅');
        } else {
          onShowToast('২য় ছবি আপলোড সম্পন্ন! 🖼️', '✅');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRecutout = async (newTolerance?: number, forceRaw?: boolean) => {
    if (!rawUploadedImage1) return;
    if (forceRaw) {
      setUploadedImage1(rawUploadedImage1);
      return;
    }
    setIsRemovingBg(true);
    const tol = newTolerance !== undefined ? newTolerance : cutoutTolerance;
    try {
      const cutout = await removeImageBackground(rawUploadedImage1, { tolerance: tol });
      setUploadedImage1(cutout);
      onShowToast('ব্যাকগ্রাউন্ড রিমুভ আপডেট সম্পন্ন! ✂️', '✅');
    } catch {
      setUploadedImage1(rawUploadedImage1);
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Synchronous portrait dimensions & coordinates calculation (Used by both Canvas and UI overlay)
  const getPortraitBox = () => {
    const cw = 900;
    let ch = 900;
    if (aspectRatio === '4:5') ch = 1125;
    if (aspectRatio === '16:9') ch = 506;

    const totalScale = (photoScale || 100) / 100;
    const wScale = (photoWidthScale || 100) / 100;
    const hScale = (photoHeightScale || 100) / 100;

    const baseW = cw * 0.70;
    const baseH = baseW / (imageAspect || 0.85);

    const targetW = baseW * totalScale * wScale;
    const targetH = baseH * totalScale * hScale;

    const targetX = (cw - targetW) / 2 + (photoPosX || 0);
    const targetY = 25 + (photoPosY || 0);

    return { x: targetX, y: targetY, w: targetW, h: targetH, cw, ch };
  };

  // 4-Directional & Corner interactive drag & resize engine
  const startDrag = (
    e: React.PointerEvent,
    action: 'move' | 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initX = photoPosX;
    const initY = photoPosY;
    const initWScale = photoWidthScale;
    const initHScale = photoHeightScale;

    const container = previewContainerRef.current;
    const rect = container?.getBoundingClientRect();
    const containerW = rect ? rect.width : 400;
    const containerH = rect ? rect.height : 400;

    const currentBox = getPortraitBox();
    const pxRatioX = currentBox.cw / containerW;
    const pxRatioY = currentBox.ch / containerH;

    const onPointerMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startClientX) * pxRatioX;
      const dy = (ev.clientY - startClientY) * pxRatioY;

      if (action === 'move') {
        setPhotoPosX(Math.round(initX + dx));
        setPhotoPosY(Math.round(initY + dy));
      } else if (action === 'e') {
        const deltaPercent = (dx / (currentBox.w || 1)) * 100;
        setPhotoWidthScale(Math.max(30, Math.min(260, Math.round(initWScale + deltaPercent))));
      } else if (action === 'w') {
        const deltaPercent = (-dx / (currentBox.w || 1)) * 100;
        setPhotoWidthScale(Math.max(30, Math.min(260, Math.round(initWScale + deltaPercent))));
        setPhotoPosX(Math.round(initX + dx / 2));
      } else if (action === 's') {
        const deltaPercent = (dy / (currentBox.h || 1)) * 100;
        setPhotoHeightScale(Math.max(30, Math.min(260, Math.round(initHScale + deltaPercent))));
      } else if (action === 'n') {
        const deltaPercent = (-dy / (currentBox.h || 1)) * 100;
        setPhotoHeightScale(Math.max(30, Math.min(260, Math.round(initHScale + deltaPercent))));
        setPhotoPosY(Math.round(initY + dy));
      } else if (action === 'se') {
        const deltaPercentX = (dx / (currentBox.w || 1)) * 100;
        const deltaPercentY = (dy / (currentBox.h || 1)) * 100;
        setPhotoWidthScale(Math.max(30, Math.min(260, Math.round(initWScale + deltaPercentX))));
        setPhotoHeightScale(Math.max(30, Math.min(260, Math.round(initHScale + deltaPercentY))));
      } else if (action === 'sw') {
        const deltaPercentX = (-dx / (currentBox.w || 1)) * 100;
        const deltaPercentY = (dy / (currentBox.h || 1)) * 100;
        setPhotoWidthScale(Math.max(30, Math.min(260, Math.round(initWScale + deltaPercentX))));
        setPhotoHeightScale(Math.max(30, Math.min(260, Math.round(initHScale + deltaPercentY))));
        setPhotoPosX(Math.round(initX + dx / 2));
      } else if (action === 'ne') {
        const deltaPercentX = (dx / (currentBox.w || 1)) * 100;
        const deltaPercentY = (-dy / (currentBox.h || 1)) * 100;
        setPhotoWidthScale(Math.max(30, Math.min(260, Math.round(initWScale + deltaPercentX))));
        setPhotoHeightScale(Math.max(30, Math.min(260, Math.round(initHScale + deltaPercentY))));
        setPhotoPosY(Math.round(initY + dy));
      } else if (action === 'nw') {
        const deltaPercentX = (-dx / (currentBox.w || 1)) * 100;
        const deltaPercentY = (-dy / (currentBox.h || 1)) * 100;
        setPhotoWidthScale(Math.max(30, Math.min(260, Math.round(initWScale + deltaPercentX))));
        setPhotoHeightScale(Math.max(30, Math.min(260, Math.round(initHScale + deltaPercentY))));
        setPhotoPosX(Math.round(initX + dx / 2));
        setPhotoPosY(Math.round(initY + dy));
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleFitFacePreset = () => {
    setPhotoScale(100);
    setPhotoWidthScale(100);
    setPhotoHeightScale(100);
    setPhotoPosY(15);
    setPhotoPosX(0);
    onShowToast('মুখ ও মাথা ফ্রেমের মাঝখানে পারফেক্ট ফিট করা হয়েছে! 🎯✨', '✅');
  };

  const handleResetTransforms = () => {
    setPhotoScale(100);
    setPhotoWidthScale(100);
    setPhotoHeightScale(100);
    setPhotoPosY(15);
    setPhotoPosX(0);
    onShowToast('ছবির সাইজ ও পজিশন ডিফল্টে রিসেট করা হয়েছে! 🔄', '✅');
  };

  // Canvas Drawing Engine for 5 distinct templates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 900;
    let height = 900;
    if (aspectRatio === '4:5') height = 1125;
    if (aspectRatio === '16:9') height = 506;

    canvas.width = width;
    canvas.height = height;

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.src = src;
      });

    const wrapText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      maxLines = 4
    ) => {
      const words = text.split(' ');
      let line = '';
      let lineCount = 0;
      let curY = y;

      for (let i = 0; i < words.length; i++) {
        const test = line ? `${line} ${words[i]}` : words[i];
        const m = ctx.measureText(test);
        if (m.width > maxWidth && i > 0) {
          ctx.fillText(line, x, curY);
          line = words[i];
          curY += lineHeight;
          lineCount++;
          if (lineCount >= maxLines) break;
        } else {
          line = test;
        }
      }
      if (line && lineCount < maxLines) {
        ctx.fillText(line, x, curY);
        curY += lineHeight;
      }
      return curY;
    };

    const renderCanvas = async () => {
      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // TEMPLATE 1: নিউজ (Authentic TV Breaking News)
      // ==========================================
      if (template === 'news') {
        // Dark studio background
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // TV Frame Top Header Bar
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 0, width, 55);

        // LIVE Indicator
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(45, 27, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('সরাসরি সম্প্রচার (LIVE)', 60, 33);

        ctx.textAlign = 'right';
        ctx.fillText(authorName, width - 40, 33);

        // Photo placement
        const photoY = 70;
        const photoH = height * 0.45;
        if (uploadedImage1) {
          try {
            const img = await loadImage(uploadedImage1);
            ctx.drawImage(img, 30, photoY, width - 60, photoH);
          } catch {}
        } else {
          // Placeholder TV graphic
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(30, photoY, width - 60, photoH);
          ctx.fillStyle = '#64748b';
          ctx.textAlign = 'center';
          ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
          ctx.fillText('📺 নিউজ ফটো আপলোড করুন', width / 2, photoY + photoH / 2);
        }

        // Lower Third News Ticker
        const tickerY = photoY + photoH + 15;

        // Red "BREAKING NEWS / ব্রেকিং নিউজ" Badge
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(30, tickerY, 210, 42, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔴 ব্রেকিং নিউজ', 135, tickerY + 29);

        // Yellow Category Pill
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.roundRect(250, tickerY, 130, 42, 6);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
        ctx.fillText(categoryTag, 315, tickerY + 28);

        // Date right aligned
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(dateText, width - 35, tickerY + 28);

        // Headline Container Box (Classic TV news yellow/white on black)
        const hlBoxY = tickerY + 52;
        ctx.fillStyle = '#000000';
        ctx.fillRect(30, hlBoxY, width - 60, height - hlBoxY - 70);

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 3;
        ctx.strokeRect(30, hlBoxY, width - 60, height - hlBoxY - 70);

        // Headline Text
        ctx.fillStyle = '#fef08a';
        ctx.font = `bold ${fontSize + 4}px "Hind Siliguri", sans-serif`;
        ctx.textAlign = 'left';
        const afterHl = wrapText(headline, 50, hlBoxY + 45, width - 100, fontSize + 12, 3);

        // Subtitle Text
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${fontSize - 6}px "Hind Siliguri", sans-serif`;
        wrapText(subtitle, 50, afterHl + 10, width - 100, fontSize + 4, 2);

        // Bottom Disclaimer (Required for anti-misinformation)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, height - 35, width, 35);
        ctx.fillStyle = '#991b1b';
        ctx.font = 'bold 12px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ কাল্পনিক টেমপ্লেট ডিজাইন • অসত্য বা বিভ্রান্তিকর সংবাদ তৈরি দণ্ডনীয় অপরাধ', width / 2, height - 12);
      }

      // ==========================================
      // TEMPLATE 2: উক্তি (Literary & Elegant Vintage Quote)
      // ==========================================
      else if (template === 'quote') {
        let bg1 = '#090d16', bg2 = '#1e1b4b';
        if (quoteBgTheme === 'vintage_rose') {
          bg1 = '#3b0764'; bg2 = '#831843';
        } else if (quoteBgTheme === 'deep_blue') {
          bg1 = '#032030'; bg2 = '#004d61';
        }

        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, bg1);
        bgGrad.addColorStop(1, bg2);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Vintage Golden Frame
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.strokeRect(40, 40, width - 80, height - 80);

        ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, 50, width - 100, height - 100);

        // Corner Ornaments
        const drawCorner = (cx: number, cy: number) => {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 20, 0, Math.PI * 2);
          ctx.stroke();
        };
        drawCorner(65, 65);
        drawCorner(width - 65, 65);
        drawCorner(65, height - 65);
        drawCorner(width - 65, height - 65);

        // Giant Golden Quotation Mark
        ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.font = 'bold 140px "Hind Siliguri", serif';
        ctx.textAlign = 'center';
        ctx.fillText('“', width / 2, 210);

        // Category Tag
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.fillText(`• ${categoryTag} •`, width / 2, 240);

        // Quote Text (Centered)
        ctx.fillStyle = '#ffffff';
        ctx.font = `600 ${fontSize + 6}px "Hind Siliguri", sans-serif`;
        const wrapCenter = (text: string, y: number) => {
          const words = text.split(' ');
          let line = '';
          const lines = [];
          for (let i = 0; i < words.length; i++) {
            const test = line ? `${line} ${words[i]}` : words[i];
            if (ctx.measureText(test).width > width - 180 && i > 0) {
              lines.push(line);
              line = words[i];
            } else {
              line = test;
            }
          }
          if (line) lines.push(line);

          let startY = y;
          const lH = fontSize + 16;
          for (let k = 0; k < lines.length; k++) {
            ctx.fillText(lines[k], width / 2, startY);
            startY += lH;
          }
          return startY;
        };

        const afterQuote = wrapCenter(headline, 330);

        // Decorative flourish divider
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 80, afterQuote + 20);
        ctx.lineTo(width / 2 + 80, afterQuote + 20);
        ctx.stroke();

        // Author / Source
        ctx.fillStyle = '#fef08a';
        ctx.font = 'italic bold 22px "Hind Siliguri", sans-serif';
        ctx.fillText(authorName, width / 2, afterQuote + 65);

        // Subtitle
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '15px "Hind Siliguri", sans-serif';
        ctx.fillText(subtitle, width / 2, afterQuote + 95);

        // Watermark Footer
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Hind Siliguri", sans-serif';
        ctx.fillText(`${watermark} • ${dateText}`, width / 2, height - 70);
      }

      // ==========================================
      // TEMPLATE 3: মিম (Viral Friend Meme Factory)
      // ==========================================
      else if (template === 'meme') {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, width, height);

        // Yellow top badge
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, 0, width, 40);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('😂 ফ্রেন্ড মিম ফ্যাক্টরি • ভাইরাল ট্রোল', width / 2, 26);

        // Top Text / Situation
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize + 4}px "Hind Siliguri", sans-serif`;
        ctx.textAlign = 'center';
        const afterTop = wrapText(headline, width / 2, 85, width - 80, fontSize + 10, 2);

        // Images: Side by Side (if 2 images) or Single Photo
        const memeImgY = afterTop + 20;
        const memeImgH = height * 0.48;

        if (uploadedImage1 && uploadedImage2) {
          try {
            const img1 = await loadImage(uploadedImage1);
            const img2 = await loadImage(uploadedImage2);
            const wHalf = (width - 70) / 2;

            ctx.drawImage(img1, 30, memeImgY, wHalf, memeImgH);
            ctx.drawImage(img2, 40 + wHalf, memeImgY, wHalf, memeImgH);

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(30, memeImgY, wHalf, memeImgH);
            ctx.strokeRect(40 + wHalf, memeImgY, wHalf, memeImgH);

            // Labels on images
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(30, memeImgY + memeImgH - 35, wHalf, 35);
            ctx.fillRect(40 + wHalf, memeImgY + memeImgH - 35, wHalf, 35);

            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
            ctx.fillText('বন্ধু যা বলে...', 30 + wHalf / 2, memeImgY + memeImgH - 12);
            ctx.fillText('আসল বাস্তবতা! 😂', 40 + wHalf + wHalf / 2, memeImgY + memeImgH - 12);
          } catch {}
        } else if (uploadedImage1) {
          try {
            const img1 = await loadImage(uploadedImage1);
            ctx.drawImage(img1, 40, memeImgY, width - 80, memeImgH);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.strokeRect(40, memeImgY, width - 80, memeImgH);
          } catch {}
        } else {
          ctx.fillStyle = '#27272a';
          ctx.fillRect(40, memeImgY, width - 80, memeImgH);
          ctx.fillStyle = '#a1a1aa';
          ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
          ctx.fillText('📷 মিম ছবি আপলোড করুন (১ম ও ২য় ছবি)', width / 2, memeImgY + memeImgH / 2);
        }

        // Bottom Punchline Text
        const bottomY = memeImgY + memeImgH + 40;
        ctx.fillStyle = '#fef08a';
        ctx.font = `bold ${fontSize + 6}px "Hind Siliguri", sans-serif`;
        wrapText(subtitle, width / 2, bottomY, width - 80, fontSize + 12, 2);

        // Watermark Footer
        ctx.fillStyle = '#71717a';
        ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
        ctx.fillText(`Meme By: ${authorName} • ${watermark}`, width / 2, height - 25);
      }

      // ==========================================
      // TEMPLATE 4: বিজয় স্লোগান (National Leadership Quote Poster Frame)
      // Faithfully reproduces the user's uploaded reference:
      // - Upper section: Deep navy background, Bangladesh Flag (green field & glowing red sun) on top-left,
      //   Bangladesh Map watermark on top-right, and central leader portrait (or user photo).
      // - Middle separator: Graceful curved wave swoosh with green and white ribbons.
      // - Lower card: Crisp white card, crimson double quote marks (── ❝ ── and ── ❞ ──),
      //   bold punchy slogan typography (with crimson red punchline accent), speaker name & designation.
      // ==========================================
      else if (template === 'slogan') {
        const upperHeight = height * 0.51;

        // 1. Upper background: Custom photo (Slot 2) if uploaded, otherwise Bangladesh National Flag & Navy
        let customBgDrawn = false;
        if (uploadedImage2) {
          try {
            const bgImg = await loadImage(uploadedImage2);
            const targetBgH = upperHeight + 50;
            const bImgAspect = bgImg.width / bgImg.height;
            const targetAspect = width / targetBgH;
            let sx = 0, sy = 0, sw = bgImg.width, sh = bgImg.height;
            if (bImgAspect > targetAspect) {
              sw = bgImg.height * targetAspect;
              sx = (bgImg.width - sw) / 2;
            } else {
              sh = bgImg.width / targetAspect;
              sy = (bgImg.height - sh) / 2;
            }
            ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, width, targetBgH);
            customBgDrawn = true;
          } catch (e) {
            console.error('Failed to draw custom background:', e);
          }
        }

        if (!customBgDrawn) {
          // Upper background gradient (Deep royal navy)
          const topBg = ctx.createLinearGradient(0, 0, width, upperHeight);
          topBg.addColorStop(0, '#04162e');
          topBg.addColorStop(0.5, '#0a2345');
          topBg.addColorStop(1, '#0e2f5b');
          ctx.fillStyle = topBg;
          ctx.fillRect(0, 0, width, height);

          // Bangladesh National Flag Waving in top-left
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(width * 0.52, 0);
          ctx.bezierCurveTo(
            width * 0.44, upperHeight * 0.25,
            width * 0.26, upperHeight * 0.55,
            0, upperHeight * 0.65
          );
          ctx.closePath();
          const flagGrad = ctx.createLinearGradient(0, 0, width * 0.45, upperHeight * 0.5);
          flagGrad.addColorStop(0, '#006a4e');
          flagGrad.addColorStop(0.5, '#014d38');
          flagGrad.addColorStop(1, '#002619');
          ctx.fillStyle = flagGrad;
          ctx.fill();

          // Flag Glowing Red Sun Disk
          const sunX = width * 0.17;
          const sunY = upperHeight * 0.38;
          const sunR = width * 0.14;
          const sunGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR);
          sunGrad.addColorStop(0, '#f43f5e');
          sunGrad.addColorStop(0.7, '#e11d48');
          sunGrad.addColorStop(1, '#9f1239');
          ctx.fillStyle = sunGrad;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Bangladesh Map Watermark Silhouette on top-right
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
          ctx.lineWidth = 3;
          const mapX = width * 0.66;
          const mapY = upperHeight * 0.08;
          const mapW = width * 0.28;
          const mapH = upperHeight * 0.75;
          ctx.beginPath();
          ctx.moveTo(mapX + mapW * 0.45, mapY);
          ctx.lineTo(mapX + mapW * 0.72, mapY + mapH * 0.14);
          ctx.lineTo(mapX + mapW * 0.88, mapY + mapH * 0.28);
          ctx.lineTo(mapX + mapW * 0.96, mapY + mapH * 0.48);
          ctx.lineTo(mapX + mapW * 0.84, mapY + mapH * 0.74);
          ctx.lineTo(mapX + mapW * 0.96, mapY + mapH * 0.92);
          ctx.lineTo(mapX + mapW * 0.75, mapY + mapH * 0.98);
          ctx.lineTo(mapX + mapW * 0.58, mapY + mapH * 0.84);
          ctx.lineTo(mapX + mapW * 0.38, mapY + mapH * 0.94);
          ctx.lineTo(mapX + mapW * 0.18, mapY + mapH * 0.80);
          ctx.lineTo(mapX + mapW * 0.04, mapY + mapH * 0.54);
          ctx.lineTo(mapX + mapW * 0.14, mapY + mapH * 0.30);
          ctx.lineTo(mapX + mapW * 0.32, mapY + mapH * 0.16);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // 2. Leader / Speaker Portrait Photo
        let portraitDrawn = false;
        if (uploadedImage1) {
          try {
            const userImg = await loadImage(uploadedImage1);
            const pBox = getPortraitBox();

            ctx.save();
            // Soft cinematic drop shadow behind cutout
            ctx.shadowColor = 'rgba(0, 0, 0, 0.50)';
            ctx.shadowBlur = 28;
            ctx.shadowOffsetY = 8;
            ctx.drawImage(userImg, pBox.x, pBox.y, pBox.w, pBox.h);
            ctx.restore();

            portraitDrawn = true;
          } catch {}
        }

        if (!portraitDrawn) {
          try {
            // Authentic reference leader portrait from user upload
            const defaultImg = await loadImage('/assets/aistudio/855072859_3014522248892479_1997319251905802767_n_2bb49005.jpg');
            // Crop the top 54% of the reference image which contains the leader and upper backdrop
            const srcCropH = defaultImg.height * 0.54;
            ctx.drawImage(
              defaultImg,
              0, 0, defaultImg.width, srcCropH,
              0, 0, width, upperHeight + 25
            );
            portraitDrawn = true;
          } catch {}
        }

        // 3. Sweeping Curved Wave Ribbon & White Card Shape
        const waveLeftY = upperHeight - 20;
        const waveMidY = upperHeight + 35;
        const waveRightY = upperHeight - 28;

        // Shadow behind the curved white card
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = -6;

        // White card background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, waveLeftY);
        ctx.bezierCurveTo(
          width * 0.35, waveMidY + 16,
          width * 0.65, waveMidY + 10,
          width, waveRightY
        );
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Green & Navy decorative ribbon on top of the curve
        ctx.save();
        // Dark Green Ribbon
        ctx.beginPath();
        ctx.moveTo(-10, waveLeftY - 6);
        ctx.bezierCurveTo(
          width * 0.35, waveMidY + 10,
          width * 0.65, waveMidY + 4,
          width + 10, waveRightY - 14
        );
        ctx.strokeStyle = '#026b42';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Deep Navy Ribbon accent
        ctx.beginPath();
        ctx.moveTo(-10, waveLeftY - 16);
        ctx.bezierCurveTo(
          width * 0.35, waveMidY + 1,
          width * 0.65, waveMidY - 5,
          width + 10, waveRightY - 24
        );
        ctx.strokeStyle = '#0f2b48';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

        // 4. White Card Content
        // Top Quotation Mark: ── ❝ ── in Crimson Red
        const topQuoteY = waveMidY + (aspectRatio === '16:9' ? 25 : 52);
        ctx.save();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2.5;

        // Left horizontal accent line
        ctx.beginPath();
        ctx.moveTo(width / 2 - 145, topQuoteY);
        ctx.lineTo(width / 2 - 42, topQuoteY);
        ctx.stroke();

        // Right horizontal accent line
        ctx.beginPath();
        ctx.moveTo(width / 2 + 42, topQuoteY);
        ctx.lineTo(width / 2 + 145, topQuoteY);
        ctx.stroke();

        // Large Crimson Red Quotes
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 50px "Hind Siliguri", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('❝', width / 2, topQuoteY + 14);
        ctx.restore();

        // 5. Impactful Slogan Text (Multi-line centered with crimson punchline highlight)
        const quoteStartY = topQuoteY + (aspectRatio === '16:9' ? 38 : 55);
        const maxQuoteWidth = width - 120;
        const lineSpacing = fontSize + 16;

        ctx.textAlign = 'center';

        // Custom multi-line slogan wrapper with smart emphasis
        const rawWords = headline.split(' ');
        const lines: string[] = [];
        let currLine = '';

        for (let i = 0; i < rawWords.length; i++) {
          const testLine = currLine ? `${currLine} ${rawWords[i]}` : rawWords[i];
          ctx.font = `bold ${fontSize + 12}px "Hind Siliguri", sans-serif`;
          if (ctx.measureText(testLine).width > maxQuoteWidth && i > 0) {
            lines.push(currLine);
            currLine = rawWords[i];
          } else {
            currLine = testLine;
          }
        }
        if (currLine) lines.push(currLine);

        let curY = quoteStartY;
        for (let i = 0; i < lines.length; i++) {
          const lineStr = lines[i];
          const isLastLine = i === lines.length - 1;

          // If last line has keywords like "৭দিন", highlight the punchline part in crimson
          if (isLastLine && (lineStr.includes('৭দিন') || lineStr.includes('দিন') || lineStr.includes('বাংলাদেশ'))) {
            ctx.font = `bold ${fontSize + 14}px "Hind Siliguri", sans-serif`;
            const match = lineStr.match(/^(.*?)(\s*[\d০-৯]+দিন।?|\s*৭দিন।?)$/);
            if (match) {
              const prefix = match[1];
              const redPart = match[2];
              const totalW = ctx.measureText(lineStr).width;
              const startX = width / 2 - totalW / 2;

              ctx.textAlign = 'left';
              ctx.fillStyle = '#0a1d37';
              ctx.fillText(prefix, startX, curY);
              const prefixW = ctx.measureText(prefix).width;

              ctx.fillStyle = '#b91c1c';
              ctx.fillText(redPart, startX + prefixW, curY);
              ctx.textAlign = 'center';
            } else {
              ctx.fillStyle = '#b91c1c';
              ctx.fillText(lineStr, width / 2, curY);
            }
          } else {
            ctx.fillStyle = '#0a1d37';
            ctx.font = `bold ${fontSize + 12}px "Hind Siliguri", sans-serif`;
            ctx.fillText(lineStr, width / 2, curY);
          }
          curY += lineSpacing;
        }

        // 6. Bottom Quotation Mark: ── ❞ ── in Crimson Red
        const bottomQuoteY = curY + 6;
        ctx.save();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 2.5;

        // Left horizontal line
        ctx.beginPath();
        ctx.moveTo(width / 2 - 145, bottomQuoteY);
        ctx.lineTo(width / 2 - 42, bottomQuoteY);
        ctx.stroke();

        // Right horizontal line
        ctx.beginPath();
        ctx.moveTo(width / 2 + 42, bottomQuoteY);
        ctx.lineTo(width / 2 + 145, bottomQuoteY);
        ctx.stroke();

        // Closing Quotes
        ctx.fillStyle = '#b91c1c';
        ctx.font = 'bold 50px "Hind Siliguri", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('❞', width / 2, bottomQuoteY + 14);
        ctx.restore();

        // 7. Speaker Name (ফখরুদ্দীন আহমেদ)
        const nameY = bottomQuoteY + (aspectRatio === '16:9' ? 36 : 52);
        ctx.fillStyle = '#0a2342';
        ctx.font = `bold ${fontSize + 8}px "Hind Siliguri", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(authorName, width / 2, nameY);

        // 8. Speaker Title / Subtitle (তত্ত্বাবধায়ক সরকারের সাবেক প্রধান উপদেষ্টা)
        const titleY = nameY + (aspectRatio === '16:9' ? 24 : 32);
        ctx.fillStyle = '#334155';
        ctx.font = `600 ${fontSize - 4}px "Hind Siliguri", sans-serif`;
        ctx.fillText(subtitle, width / 2, titleY);

        // 9. Bottom Elegant National Accents
        ctx.fillStyle = '#026b42';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(60, height);
        ctx.bezierCurveTo(45, height - 15, 15, height - 45, 0, height - 60);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(width, height);
        ctx.lineTo(width - 60, height);
        ctx.bezierCurveTo(width - 45, height - 15, width - 15, height - 45, width, height - 60);
        ctx.closePath();
        ctx.fill();

        // Subtle watermark
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Hind Siliguri", sans-serif';
        ctx.fillText(`${watermark} • ${categoryTag || 'বিজয় স্লোগান'}`, width / 2, height - 16);
      }

      // ==========================================
      // TEMPLATE 5: ব্র্যান্ডিং (Modern Tech Personal Branding)
      // ==========================================
      else if (template === 'branding') {
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#030712');
        bg.addColorStop(0.5, '#0f172a');
        bg.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        // Circular Avatar / Logo Frame at center top
        const avatarY = 160;
        const avatarR = 85;

        // Glowing outer ring
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(width / 2, avatarY, avatarR + 6, 0, Math.PI * 2);
        ctx.stroke();

        if (uploadedImage1) {
          try {
            const avImg = await loadImage(uploadedImage1);
            ctx.save();
            ctx.beginPath();
            ctx.arc(width / 2, avatarY, avatarR, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avImg, width / 2 - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
            ctx.restore();
          } catch {}
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(width / 2, avatarY, avatarR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👤 প্রোফাইল', width / 2, avatarY + 12);
        }

        // Verified Badge on avatar
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(width / 2 + avatarR - 12, avatarY + avatarR - 12, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', width / 2 + avatarR - 12, avatarY + avatarR - 6);

        // Person / Brand Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px "Hind Siliguri", sans-serif';
        ctx.fillText(authorName, width / 2, avatarY + avatarR + 50);

        // Category / Title Badge
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(width / 2 - 110, avatarY + avatarR + 68, 220, 36, 18);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.fillText(categoryTag, width / 2, avatarY + avatarR + 92);

        // Headline / Specialization
        ctx.fillStyle = '#38bdf8';
        ctx.font = `bold ${fontSize + 2}px "Hind Siliguri", sans-serif`;
        const afterBrHl = wrapText(headline, width / 2, avatarY + avatarR + 155, width - 120, fontSize + 10, 2);

        // Subtitle / Bio
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `400 ${fontSize - 6}px "Hind Siliguri", sans-serif`;
        wrapText(subtitle, width / 2, afterBrHl + 15, width - 120, fontSize + 4, 3);

        // Social handles box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(60, height - 100, width - 120, 60, 16);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.fillText(`${watermark} • Portfolio & Official Profile`, width / 2, height - 64);
      }
    };

    renderCanvas();
  }, [
    template,
    aspectRatio,
    headline,
    subtitle,
    bodyText,
    authorName,
    categoryTag,
    watermark,
    dateText,
    fontSize,
    quoteBgTheme,
    uploadedImage1,
    uploadedImage2,
    photoScale,
    photoPosY,
    photoPosX,
  ]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `MoSaFa-Poster-${template}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast(`${template.toUpperCase()} পোস্টার ডাউনলোড সম্পন্ন! 📥`, '🎉');
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (navigator.share) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'poster.png', { type: 'image/png' });
          await navigator.share({
            title: headline,
            text: `${headline}\n— তৈরি করেছেন: ${authorName}`,
            files: [file],
          });
          onShowToast('শেয়ার সম্পন্ন হয়েছে!', '🚀');
        });
        return;
      } catch {}
    }
    handleDownload();
  };

  const handleCopyText = async () => {
    const text = `${headline}\n${subtitle ? subtitle + '\n' : ''}— ${authorName} (${categoryTag})\n${watermark}`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('পোস্টারের লেখা কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('পোস্টারের লেখা কপি হয়েছে! 📋', '✅');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 border border-slate-700 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">MoSaFa Poster Studio</h1>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                ৫টি ভিন্ন ফরম্যাট টেমপ্লেট
              </span>
            </div>
            <p className="text-xs text-slate-400">নিউজ, উক্তি, মিম, স্লোগান ও ব্র্যান্ডিং পোস্টার জেনারেটর</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="পোস্টারের লেখা কপি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">লেখা কপি</span>
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">শেয়ার</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white font-bold text-xs shadow-md shadow-rose-900/50 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG ডাউনলোড</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/70 p-4 sm:p-6 rounded-3xl border border-slate-800">
          <div
            ref={previewContainerRef}
            className="w-full max-w-[460px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex items-center justify-center bg-black relative select-none"
            style={{ aspectRatio: aspectRatio === '4:5' ? '4/5' : aspectRatio === '16:9' ? '16/9' : '1/1' }}
          >
            <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

            {/* Interactive 4-Way & Corner Drag & Resize Overlay (Active in slogan template or with portrait photo) */}
            {template === 'slogan' && (uploadedImage1 || rawUploadedImage1) && showTransformOverlay && (() => {
              const pBox = getPortraitBox();
              const leftPct = (pBox.x / pBox.cw) * 100;
              const topPct = (pBox.y / pBox.ch) * 100;
              const widthPct = (pBox.w / pBox.cw) * 100;
              const heightPct = (pBox.h / pBox.ch) * 100;

              return (
                <div
                  className="absolute border-2 border-rose-500/80 bg-rose-500/10 cursor-move touch-none group transition-shadow shadow-[0_0_15px_rgba(244,63,94,0.3)] z-10"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  }}
                  onPointerDown={(e) => startDrag(e, 'move')}
                  title="ছবিটি টেনে যেকোনো স্থানে সরান"
                >
                  {/* Center Hint Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-black/75 text-rose-300 text-[9px] font-bold pointer-events-none backdrop-blur-sm whitespace-nowrap flex items-center gap-1 border border-rose-500/40">
                    <Move className="w-2.5 h-2.5 text-rose-400" />
                    <span>টেনে সরান (Move)</span>
                  </div>

                  {/* 4 Corner Handles (NW, NE, SE, SW) */}
                  <div
                    className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow cursor-nwse-resize hover:scale-125 transition-transform"
                    onPointerDown={(e) => startDrag(e, 'nw')}
                    title="টেনে কোণা থেকে বড়/ছোট করুন (NW)"
                  />
                  <div
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow cursor-nesw-resize hover:scale-125 transition-transform"
                    onPointerDown={(e) => startDrag(e, 'ne')}
                    title="টেনে কোণা থেকে বড়/ছোট করুন (NE)"
                  />
                  <div
                    className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow cursor-nwse-resize hover:scale-125 transition-transform"
                    onPointerDown={(e) => startDrag(e, 'se')}
                    title="টেনে কোণা থেকে বড়/ছোট করুন (SE)"
                  />
                  <div
                    className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow cursor-nesw-resize hover:scale-125 transition-transform"
                    onPointerDown={(e) => startDrag(e, 'sw')}
                    title="টেনে কোণা থেকে বড়/ছোট করুন (SW)"
                  />

                  {/* 4 Edge Handles (N, E, S, W) for stretching 4 sides */}
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-amber-400 border border-white shadow cursor-ns-resize hover:scale-125 transition-transform flex items-center justify-center"
                    onPointerDown={(e) => startDrag(e, 'n')}
                    title="উপরের দিক থেকে টেনে লম্বা করুন / উচ্চতা বাড়ান (Top)"
                  />
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-amber-400 border border-white shadow cursor-ns-resize hover:scale-125 transition-transform flex items-center justify-center"
                    onPointerDown={(e) => startDrag(e, 's')}
                    title="নিচের দিক থেকে টেনে লম্বা করুন / উচ্চতা বাড়ান (Bottom)"
                  />
                  <div
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 rounded-full bg-cyan-400 border border-white shadow cursor-ew-resize hover:scale-125 transition-transform flex items-center justify-center"
                    onPointerDown={(e) => startDrag(e, 'w')}
                    title="বামের দিক থেকে টেনে চওড়া করুন / প্রসারিত করুন (Left)"
                  />
                  <div
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 rounded-full bg-cyan-400 border border-white shadow cursor-ew-resize hover:scale-125 transition-transform flex items-center justify-center"
                    onPointerDown={(e) => startDrag(e, 'e')}
                    title="ডানের দিক থেকে টেনে চওড়া করুন / প্রসারিত করুন (Right)"
                  />
                </div>
              );
            })()}
          </div>

          {/* Guide & Overlay Toggle */}
          {template === 'slogan' && (uploadedImage1 || rawUploadedImage1) && (
            <div className="mt-2.5 flex items-center justify-between w-full max-w-[460px] text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1 text-slate-300">
                <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                <span>হ্যান্ডেল বা বর্ডার টেনে সাইজ ও পজিশন পরিবর্তন করুন</span>
              </span>
              <button
                type="button"
                onClick={() => setShowTransformOverlay(!showTransformOverlay)}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer transition text-[10px]"
              >
                {showTransformOverlay ? (
                  <>
                    <EyeOff className="w-3 h-3 text-slate-400" />
                    <span>ফ্রেম লুকান</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 text-rose-400" />
                    <span>ফ্রেম দেখান</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
            <span>অনুপাত:</span>
            {(['1:1', '4:5', '16:9'] as AspectRatio[]).map((ar) => (
              <button
                key={ar}
                onClick={() => setAspectRatio(ar)}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  aspectRatio === ar ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Template Selector & Form Controls */}
        <div className="lg:col-span-5 space-y-4 max-h-[82vh] overflow-y-auto pr-1">
          {/* 5 Distinct Templates Selector */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-bold text-slate-200 mb-2">
              পোস্টার টেমপ্লেট নির্বাচন করুন (প্রতিটির ডিজাইন ভিন্ন):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'news', label: 'নিউজ (News)', icon: <Newspaper className="w-4 h-4 text-red-400" /> },
                { id: 'quote', label: 'উক্তি (Quote)', icon: <Quote className="w-4 h-4 text-purple-400" /> },
                { id: 'meme', label: 'মিম (Meme)', icon: <Smile className="w-4 h-4 text-amber-400" /> },
                { id: 'slogan', label: 'বিজয় স্লোগান (Slogan)', icon: <Megaphone className="w-4 h-4 text-emerald-400" /> },
                { id: 'branding', label: 'ব্র্যান্ডিং (Branding)', icon: <User className="w-4 h-4 text-blue-400" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id as PosterTemplate)}
                  className={`p-2.5 rounded-xl flex items-center gap-2 font-bold transition cursor-pointer text-left ${
                    template === t.id
                      ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                      : 'bg-slate-900/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  {t.icon}
                  <span className="text-[11px]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Inputs */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">মূল বক্তব্য / শিরোনাম:</label>
              <textarea
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">সাবটাইটেল / ক্যাপশন:</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-300 mb-1">ক্যাটাগরি / ব্যাজ:</label>
                <input
                  type="text"
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">নাম / বক্তা / চ্যানেল:</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload Area */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                <span>ছবি আপলোড ও ব্যাকগ্রাউন্ড কন্ট্রোল:</span>
              </h4>
              {template === 'slogan' && (uploadedImage1 || rawUploadedImage1) && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage1(null);
                    setRawUploadedImage1(null);
                    setPhotoScale(100);
                    setPhotoWidthScale(100);
                    setPhotoHeightScale(100);
                    setPhotoPosY(15);
                    setPhotoPosX(0);
                    onShowToast('ডিফল্ট নেতার ছবিতে ফিরে যাওয়া হয়েছে! 🔄', '🇧🇩');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer shadow-sm transition"
                >
                  ডিফল্ট ছবিতে ফিরুন
                </button>
              )}
            </div>

            {template === 'slogan' && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>🇧🇩 রেফারেন্স জাতীয় নেতা ও বিজয় স্লোগান ফ্রেম সক্রিয়</span>
                <span className="text-[10px] text-emerald-400/90 font-bold">
                  {uploadedImage1 ? 'কাস্টম ছবি (কাটআউট)' : 'ডিফল্ট ছবি'}
                </span>
              </div>
            )}

            {isRemovingBg && (
              <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-xs font-bold flex items-center gap-2 animate-pulse shadow-md">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                <span>ছবির ব্যাকগ্রাউন্ড স্বয়ংক্রিয়ভাবে রিমুভ ও কাটআউট হচ্ছে...</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  {template === 'slogan' ? 'নেতার ছবি পরিবর্তন (১ম ছবি):' : '১ম ছবি (মূল ছবি):'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 1)}
                  className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  {template === 'slogan'
                    ? '২য় ছবি (পেছনের ব্যাকগ্রাউন্ড পরিবর্তন):'
                    : template === 'meme'
                    ? '২য় ছবি (মিম রিঅ্যাকশন):'
                    : '২য় ছবি (কাস্টম ব্যাকগ্রাউন্ড):'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 2)}
                  className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:cursor-pointer"
                />
              </div>
            </div>

            {/* Custom Background Status Card */}
            {uploadedImage2 && (
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-600/60 text-[11px] text-purple-200 flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-1.5 font-bold">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>🌄 কাস্টম পেছনের ব্যাকগ্রাউন্ড সক্রিয়</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage2(null);
                    onShowToast('কাস্টম ব্যাকগ্রাউন্ড মুছে ডিফল্ট ব্যাকগ্রাউন্ডে ফিরে যাওয়া হয়েছে! 🔄', '🇧🇩');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer transition shadow-sm"
                >
                  ❌ ব্যাকগ্রাউন্ড মুছুন / রিসেট
                </button>
              </div>
            )}

            {/* Smart Cutout & Photo Scaling Controls */}
            {rawUploadedImage1 && (
              <div className="pt-2 border-t border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                    <span>অটো ব্যাকগ্রাউন্ড রিমুভার (AI Cutout):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !autoCutout;
                      setAutoCutout(next);
                      handleRecutout(cutoutTolerance, !next);
                    }}
                    className={`px-2.5 py-0.5 rounded-full font-black text-[10px] cursor-pointer transition ${
                      autoCutout
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-slate-700 text-slate-400 border border-slate-600'
                    }`}
                  >
                    {autoCutout ? '🟢 কাটআউট সক্রিয়' : '⚪ মূল ছবি'}
                  </button>
                </div>

                {autoCutout && (
                  <div className="space-y-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">কাটআউট সংবেদনশীলতা (Tolerance):</span>
                      <span className="text-emerald-400 font-bold">{cutoutTolerance}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={cutoutTolerance}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setCutoutTolerance(val);
                        }}
                        onMouseUp={() => handleRecutout(cutoutTolerance)}
                        onTouchEnd={() => handleRecutout(cutoutTolerance)}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRecutout(cutoutTolerance)}
                        className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold cursor-pointer shrink-0"
                      >
                        রি-কাট
                      </button>
                    </div>
                  </div>
                )}

                {/* 4-Directional & Proportional Transform Controls */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-700/70 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>চারদিক থেকে ছবির সাইজ ও অবস্থান:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleFitFacePreset}
                        className="px-2 py-0.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] cursor-pointer shadow-sm transition flex items-center gap-1"
                        title="মাথা ও পুরো মুখ ফ্রেমের মাঝে সুন্দরভাবে ফিট করুন"
                      >
                        <span>🎯 পারফেক্ট ফেস ফিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetTransforms}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-[10px] cursor-pointer transition"
                        title="রিসেট"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Overall Zoom / Scale */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-slate-300 font-semibold">মোট আকার (Overall Zoom):</span>
                      <span className="text-cyan-400 font-bold">{photoScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={photoScale}
                      onChange={(e) => setPhotoScale(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* 4-Way Stretch: Width (চওড়া) & Height (লম্বা) */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                        <span className="flex items-center gap-1 font-semibold text-cyan-300">
                          <MoveHorizontal className="w-3 h-3 text-cyan-400" />
                          <span>চওড়া প্রসারিত:</span>
                        </span>
                        <span className="text-cyan-400 font-bold">{photoWidthScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="220"
                        value={photoWidthScale}
                        onChange={(e) => setPhotoWidthScale(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                        <span className="flex items-center gap-1 font-semibold text-amber-300">
                          <MoveVertical className="w-3 h-3 text-amber-400" />
                          <span>লম্বা প্রসারিত:</span>
                        </span>
                        <span className="text-amber-400 font-bold">{photoHeightScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="220"
                        value={photoHeightScale}
                        onChange={(e) => setPhotoHeightScale(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Position Y and Position X */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <ChevronsUp className="w-3 h-3 text-rose-400" />
                          <span>উপরে / নিচে:</span>
                        </span>
                        <span className="text-rose-400 font-bold">{photoPosY}px</span>
                      </div>
                      <input
                        type="range"
                        min="-120"
                        max="220"
                        value={photoPosY}
                        onChange={(e) => setPhotoPosY(parseInt(e.target.value, 10))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <ChevronsLeft className="w-3 h-3 text-purple-400" />
                          <span>ডানে / বামে:</span>
                        </span>
                        <span className="text-purple-400 font-bold">{photoPosX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-140"
                        max="140"
                        value={photoPosX}
                        onChange={(e) => setPhotoPosX(parseInt(e.target.value, 10))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick 4-Direction Nudge Buttons */}
                  <div className="flex items-center justify-between gap-1 pt-1 text-[10px]">
                    <span className="text-slate-400">এক ক্লিকে সরানো:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPhotoPosY((p) => p - 10)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer font-bold"
                        title="উপরে সরান"
                      >
                        ⬆️ উপরে
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoPosY((p) => p + 10)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer font-bold"
                        title="নিচে সরান"
                      >
                        ⬇️ নিচে
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoPosX((p) => p - 10)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer font-bold"
                        title="বামে সরান"
                      >
                        ⬅️ বামে
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoPosX((p) => p + 10)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer font-bold"
                        title="ডানে সরান"
                      >
                        ➡️ ডানে
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Font & Color controls */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">ফন্ট সাইজ অ্যাডজাস্ট:</span>
              <span className="text-slate-400">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="40"
              value={Number.isNaN(fontSize) ? 24 : fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 24)}
              className="w-full accent-rose-500 cursor-pointer"
            />

            {template === 'quote' && (
              <div className="pt-2">
                <span className="font-bold text-slate-300 block mb-1.5">উক্তি ব্যাকগ্রাউন্ড থিম:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setQuoteBgTheme('gold_dark')}
                    className={`p-1.5 rounded-lg border text-[11px] font-bold ${
                      quoteBgTheme === 'gold_dark' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    গোল্ডেন ডার্ক
                  </button>
                  <button
                    onClick={() => setQuoteBgTheme('vintage_rose')}
                    className={`p-1.5 rounded-lg border text-[11px] font-bold ${
                      quoteBgTheme === 'vintage_rose' ? 'bg-rose-700 border-rose-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    ভিন্টেজ পার্পল
                  </button>
                  <button
                    onClick={() => setQuoteBgTheme('deep_blue')}
                    className={`p-1.5 rounded-lg border text-[11px] font-bold ${
                      quoteBgTheme === 'deep_blue' ? 'bg-cyan-700 border-cyan-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    ওশান ব্লু
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
