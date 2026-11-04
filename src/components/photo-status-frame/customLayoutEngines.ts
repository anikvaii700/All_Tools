import { AspectRatio, FrameTemplate, PosterCustomization } from './types';

// Helper: Rounded Rectangle
export const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

// Helper: Text Wrapping
export const wrapCanvasText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
};

// Helper: Draw 7 colorful social media icons on a black footer bar
export const drawSocialMediaStrip = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  copyright: string
) => {
  ctx.save();
  // Copyright text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(copyright || '© ARIF KHAN OFFICIAL 28', x, y);

  // Social icons row
  const iconY = y + 26;
  const iconRadius = 18;
  const spacing = 46;
  const icons = [
    { name: 'fb', bg: '#1877f2', symbol: 'f' },
    { name: 'ig', bg: '#e1306c', symbol: '📸' },
    { name: 'tt', bg: '#000000', symbol: '🎵' },
    { name: 'th', bg: '#000000', symbol: '@' },
    { name: 'yt', bg: '#ff0000', symbol: '▶' },
    { name: 'x', bg: '#000000', symbol: '𝕏' },
    { name: 'g', bg: '#ffffff', symbol: 'G' },
  ];

  const totalWidth = (icons.length - 1) * spacing;
  let curX = x - totalWidth / 2;

  icons.forEach((ico) => {
    // Circle background
    ctx.save();
    ctx.fillStyle = ico.bg;
    ctx.beginPath();
    ctx.arc(curX, iconY, iconRadius, 0, Math.PI * 2);
    ctx.fill();

    if (ico.name === 'g') {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#ea4335';
      ctx.font = 'bold 18px sans-serif';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = ico.symbol.length > 1 ? '14px sans-serif' : 'bold 18px sans-serif';
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ico.symbol, curX, iconY);
    ctx.restore();

    curX += spacing;
  });

  ctx.restore();
};

// Helper: Draw subtle world map silhouette watermark
export const drawWorldMapWatermark = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) => {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  // Americas
  ctx.beginPath();
  ctx.ellipse(w * 0.25, h * 0.35, w * 0.14, h * 0.22, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia & Africa
  ctx.beginPath();
  ctx.ellipse(w * 0.65, h * 0.32, w * 0.22, h * 0.18, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.58, h * 0.55, w * 0.12, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Helper: Draw curved dotted arrow pointing from text to speaker
export const drawCurvedDottedArrow = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  ctx.save();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const cx = x1 - 50;
  const cy = (y1 + y2) / 2;
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();

  // Arrowhead at x2, y2
  ctx.setLineDash([]);
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 12, y2 - 14);
  ctx.lineTo(x2 + 4, y2 - 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Helper: Draw vertical torn paper jagged edge
export const drawTornPaperVertical = (
  ctx: CanvasRenderingContext2D,
  splitX: number,
  h: number
) => {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 8;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(splitX, 0);

  const step = 22;
  for (let y = 0; y <= h; y += step) {
    const jitterX = splitX + ((y * 13) % 18) - 9;
    ctx.lineTo(jitterX, y);
  }

  ctx.lineTo(splitX, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Helper: Draw realistic wooden picture frame
export const drawWoodenPictureFrame = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frameThickness = 32
) => {
  ctx.save();
  // Outer wood frame gradient
  const woodGrad = ctx.createLinearGradient(0, 0, w, h);
  woodGrad.addColorStop(0, '#2e1909');
  woodGrad.addColorStop(0.5, '#45260f');
  woodGrad.addColorStop(1, '#1b0e05');
  ctx.fillStyle = woodGrad;
  ctx.fillRect(0, 0, w, h);

  // Outer 3D bevel highlight
  ctx.strokeStyle = '#5a3418';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, w - 6, h - 6);

  // Inner frame shadow & bevel
  ctx.strokeStyle = '#0d0702';
  ctx.lineWidth = 4;
  ctx.strokeRect(frameThickness, frameThickness, w - frameThickness * 2, h - frameThickness * 2);

  // Inner Matting / Fine Art Card
  const mattingX = frameThickness + 4;
  const mattingY = frameThickness + 4;
  const mattingW = w - (frameThickness + 4) * 2;
  const mattingH = h - (frameThickness + 4) * 2;

  ctx.fillStyle = '#fbf9f4';
  ctx.fillRect(mattingX, mattingY, mattingW, mattingH);

  // Subtle fine art inner pinstripe
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mattingX + 16, mattingY + 16, mattingW - 32, mattingH - 32);

  ctx.restore();
};

// Check if a layoutType belongs to one of our rich custom layouts
export const isCustomEngineLayout = (layoutType: string): boolean => {
  const customLayouts = [
    'wood_frame_social',
    'tv_news_crimson',
    'poetic_pure_black',
    'editorial_quote_bar',
    'vintage_lithograph_scroll',
    'literary_book_cover',
    'periwinkle_vertical_reel',
    'sunset_story_brush',
    'speech_bubble_placard',
    'viral_dotted_arrow',
    'torn_paper_split',
    'overlapping_white_card',
    'yellow_border_alert_card',
  ];
  return customLayouts.includes(layoutType);
};
