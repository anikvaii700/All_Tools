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
} from 'lucide-react';

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

  // Photos
  const [uploadedImage1, setUploadedImage1] = useState<string | null>(null);
  const [uploadedImage2, setUploadedImage2] = useState<string | null>(null);

  // Controls
  const [fontSize, setFontSize] = useState<number>(28);
  const [quoteBgTheme, setQuoteBgTheme] = useState<'gold_dark' | 'vintage_rose' | 'deep_blue'>('gold_dark');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      setHeadline('সবাই মিলে গড়ব দেশ, বৈষম্যহীন নতুন বাংলাদেশ!');
      setSubtitle('সাম্য, একতা ও তারুণ্যের দৃপ্ত শপথ');
      setCategoryTag('বিজয় স্লোগান');
      setAuthorName('দেশপ্রেমিক কাফেলা');
    } else if (tmpl === 'branding') {
      setHeadline('প্রফেশনাল কন্টেন্ট ক্রিয়েটর ও সফটওয়্যার ইঞ্জিনিয়ার');
      setSubtitle('ডিজিটাল টেকনোলজি ও আধুনিক ওয়েব সল্যুশন');
      setCategoryTag('পার্সোনাল ব্র্যান্ড');
      setAuthorName('মোফাচ্ছির আহমেদ');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (slot === 1) setUploadedImage1(reader.result as string);
      else if (slot === 2) setUploadedImage2(reader.result as string);
      onShowToast('ছবি আপলোড সম্পন্ন! 🖼️', '✅');
    };
    reader.readAsDataURL(file);
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
      // TEMPLATE 4: স্লোগান (Bold Campaign Banner)
      // ==========================================
      else if (template === 'slogan') {
        // Angled Red and Green national campaign banner
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, 0, width, height);

        // Angled Crimson Stripe
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.35);
        ctx.lineTo(width, height * 0.15);
        ctx.lineTo(width, height * 0.7);
        ctx.lineTo(0, height * 0.9);
        ctx.closePath();
        ctx.fill();

        // Top Rosette Badge
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.roundRect(width / 2 - 120, 40, 240, 44, 22);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`★ ${categoryTag} ★`, width / 2, 69);

        // Huge Punchy Slogan Typography
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSize + 12}px "Hind Siliguri", sans-serif`;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        const afterSlogan = wrapText(headline, width / 2, height * 0.38, width - 100, fontSize + 20, 3);
        ctx.shadowBlur = 0;

        // Subtitle / Campaign Manifesto
        ctx.fillStyle = '#fef08a';
        ctx.font = `bold ${fontSize + 2}px "Hind Siliguri", sans-serif`;
        wrapText(subtitle, width / 2, afterSlogan + 25, width - 100, fontSize + 8, 2);

        // Bottom Campaign Ribbon
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, height - 90, width, 90);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
        ctx.fillText(authorName, width / 2, height - 52);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px "Hind Siliguri", sans-serif';
        ctx.fillText(`${watermark} • ${dateText}`, width / 2, height - 25);
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
          <div className="w-full max-w-[460px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex items-center justify-center bg-black">
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
          </div>
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
                { id: 'slogan', label: 'স্লোগান (Slogan)', icon: <Megaphone className="w-4 h-4 text-emerald-400" /> },
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
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-rose-400" />
              <span>ছবি আপলোড:</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">১ম ছবি (মূল ছবি):</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 1)}
                  className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">২য় ছবি (মিম রিঅ্যাকশন):</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 2)}
                  className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-700 file:text-slate-200 file:cursor-pointer"
                />
              </div>
            </div>
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
