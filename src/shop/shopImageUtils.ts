import { VisitingCardTemplateId } from './types';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function validateImageFile(file: File, maxMb = 8): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return 'শুধুমাত্র PNG, JPG, JPEG অথবা WebP ফরম্যাটের ছবি আপলোড করা যাবে।';
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `ছবির সাইজ সর্বোচ্চ ${maxMb} মেগাবাইট হতে পারবে।`;
  }
  return null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('ছবিটি পড়া সম্ভব হয়নি'));
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('ফাইল রিড করতে সমস্যা হয়েছে'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses & resizes uploaded logos or visiting cards cleanly via Canvas
 * so they remain crisp for PDF/print while staying comfortably inside Firestore/API limits.
 */
export async function processShopImageUpload(
  file: File,
  kind: 'logo' | 'visiting_card'
): Promise<{ dataUrl: string; mimeType: string }> {
  const err = validateImageFile(file, 8);
  if (err) {
    throw new Error(err);
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(rawDataUrl);

  const maxWidth = kind === 'logo' ? 480 : 1120;
  const maxHeight = kind === 'logo' ? 480 : 680;
  const maxBytes = kind === 'logo' ? 220_000 : 380_000;

  let width = img.naturalWidth || maxWidth;
  let height = img.naturalHeight || maxHeight;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: rawDataUrl, mimeType: file.type || 'image/png' };
  }

  if (kind === 'visiting_card') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);

  // Preserve PNG transparency for logos when possible
  if (kind === 'logo') {
    let out = canvas.toDataURL('image/png');
    if (out.length <= maxBytes) {
      return { dataUrl: out, mimeType: 'image/png' };
    }
    // WebP preserves alpha at much smaller byte sizes
    out = canvas.toDataURL('image/webp', 0.88);
    if (out.length <= maxBytes) {
      return { dataUrl: out, mimeType: 'image/webp' };
    }
    // Downscale slightly if still large
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = Math.round(width * 0.72);
    smallCanvas.height = Math.round(height * 0.72);
    const sCtx = smallCanvas.getContext('2d');
    if (sCtx) {
      sCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
      const smaller = smallCanvas.toDataURL('image/webp', 0.84);
      return { dataUrl: smaller, mimeType: 'image/webp' };
    }
  }

  let quality = 0.9;
  let out = canvas.toDataURL('image/jpeg', quality);
  while (out.length > maxBytes && quality > 0.55) {
    quality -= 0.08;
    out = canvas.toDataURL('image/jpeg', quality);
  }
  return { dataUrl: out, mimeType: 'image/jpeg' };
}

export interface VisitingCardRenderInput {
  template: VisitingCardTemplateId;
  shopName: string;
  categoryLabel: string;
  tagline: string;
  ownerName: string;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  logoDataUrl?: string;
  accentColor?: string;
}

const TEMPLATE_PALETTES: Record<
  VisitingCardTemplateId,
  {
    bgStart: string;
    bgEnd: string;
    accent: string;
    textPrimary: string;
    textMuted: string;
    divider: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  'modern-emerald': {
    bgStart: '#064e3b',
    bgEnd: '#0f172a',
    accent: '#34d399',
    textPrimary: '#ffffff',
    textMuted: '#cbd5e1',
    divider: 'rgba(52,211,153,0.35)',
    badgeBg: 'rgba(52,211,153,0.18)',
    badgeText: '#a7f3d0',
  },
  'executive-navy': {
    bgStart: '#0f172a',
    bgEnd: '#1e3a8a',
    accent: '#60a5fa',
    textPrimary: '#ffffff',
    textMuted: '#cbd5e1',
    divider: 'rgba(96,165,250,0.35)',
    badgeBg: 'rgba(96,165,250,0.18)',
    badgeText: '#bfdbfe',
  },
  'royal-gold': {
    bgStart: '#1c1917',
    bgEnd: '#292524',
    accent: '#f59e0b',
    textPrimary: '#fef3c7',
    textMuted: '#d6d3d1',
    divider: 'rgba(245,158,11,0.4)',
    badgeBg: 'rgba(245,158,11,0.18)',
    badgeText: '#fde68a',
  },
  'minimal-clean': {
    bgStart: '#ffffff',
    bgEnd: '#f8fafc',
    accent: '#0f172a',
    textPrimary: '#0f172a',
    textMuted: '#475569',
    divider: '#cbd5e1',
    badgeBg: '#e2e8f0',
    badgeText: '#1e293b',
  },
};

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
): number {
  const words = text.trim().split(/\s+/);
  let line = '';
  let linesDrawn = 0;
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      linesDrawn++;
      if (linesDrawn >= maxLines) return currentY + lineHeight;
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

/**
 * Generates a crisp 1050x600 digital visiting card PNG directly in browser Canvas.
 */
export async function renderVisitingCardDataUrl(input: VisitingCardRenderInput): Promise<string> {
  const width = 1050;
  const height = 600;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const basePalette = TEMPLATE_PALETTES[input.template] || TEMPLATE_PALETTES['modern-emerald'];
  const accent = input.template === 'minimal-clean' && input.accentColor ? input.accentColor : basePalette.accent;

  // Card Background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, basePalette.bgStart);
  grad.addColorStop(1, basePalette.bgEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative geometry
  ctx.fillStyle = basePalette.divider;
  ctx.beginPath();
  ctx.arc(width - 60, 70, 170, 0, Math.PI * 2);
  ctx.fill();

  // Left vertical accent stripe
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 18, height);

  // Inner subtle border for light template
  if (input.template === 'minimal-clean') {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
  }

  // Logo or Clean Monogram box
  const boxX = 64;
  const boxY = 58;
  const boxSize = 112;

  ctx.save();
  ctx.fillStyle = input.template === 'minimal-clean' ? '#f1f5f9' : 'rgba(255,255,255,0.12)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxSize, boxSize, 20);
  ctx.fill();
  ctx.stroke();

  let drewLogo = false;
  if (input.logoDataUrl) {
    try {
      const logoImg = await loadImage(input.logoDataUrl);
      ctx.beginPath();
      ctx.roundRect(boxX + 6, boxY + 6, boxSize - 12, boxSize - 12, 14);
      ctx.clip();
      ctx.drawImage(logoImg, boxX + 6, boxY + 6, boxSize - 12, boxSize - 12);
      drewLogo = true;
    } catch {
      drewLogo = false;
    }
  }
  ctx.restore();

  if (!drewLogo) {
    const initial = (input.shopName || 'S').trim().charAt(0).toUpperCase();
    ctx.fillStyle = accent;
    ctx.font = 'bold 54px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, boxX + boxSize / 2, boxY + boxSize / 2 + 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Category Pill Badge
  const textX = 204;
  ctx.font = '600 20px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
  const catText = input.categoryLabel || 'Digital Shop';
  const badgeW = Math.min(460, ctx.measureText(catText).width + 36);
  ctx.fillStyle = basePalette.badgeBg;
  ctx.beginPath();
  ctx.roundRect(textX, 58, badgeW, 38, 8);
  ctx.fill();
  ctx.fillStyle = basePalette.badgeText;
  ctx.fillText(catText, textX + 18, 84);

  // Shop Name
  ctx.fillStyle = basePalette.textPrimary;
  ctx.font = 'bold 42px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
  const afterNameY = wrapCanvasText(ctx, input.shopName || 'My Digital Shop', textX, 146, width - textX - 56, 48, 2);

  // Tagline
  if (input.tagline) {
    ctx.fillStyle = basePalette.textMuted;
    ctx.font = '500 22px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
    wrapCanvasText(ctx, input.tagline, textX, Math.max(afterNameY + 4, 186), width - textX - 56, 28, 1);
  }

  // Horizontal Divider
  ctx.strokeStyle = basePalette.divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 290);
  ctx.lineTo(width - 64, 290);
  ctx.stroke();

  // Owner Block (Left Column)
  ctx.fillStyle = accent;
  ctx.font = '600 18px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PROPRIETOR / OWNER', 64, 342);

  ctx.fillStyle = basePalette.textPrimary;
  ctx.font = 'bold 32px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
  wrapCanvasText(ctx, input.ownerName || 'Shop Owner', 64, 386, 410, 38, 1);

  ctx.fillStyle = basePalette.textMuted;
  ctx.font = '600 26px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Tel: ${input.phone || ''}`, 64, 434);

  if (input.email) {
    ctx.font = '500 21px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
    ctx.fillText(input.email, 64, 476);
  }
  if (input.website) {
    ctx.font = '500 20px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = accent;
    ctx.fillText(input.website, 64, 514);
  }

  // Address Block (Right Column)
  const rightX = 530;
  ctx.fillStyle = accent;
  ctx.font = '600 18px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SHOP ADDRESS', rightX, 342);

  ctx.fillStyle = basePalette.textPrimary;
  ctx.font = '500 24px "Hind Siliguri", "Plus Jakarta Sans", sans-serif';
  wrapCanvasText(ctx, input.address || 'Bangladesh', rightX, 386, width - rightX - 64, 34, 4);

  // Export JPEG/PNG comfortably under 380KB
  return canvas.toDataURL('image/png');
}
