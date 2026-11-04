import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AspectRatio, FrameTemplate, PhotoTransform, PosterCustomization } from './types';
import {
  drawSocialMediaStrip,
  drawWorldMapWatermark,
  drawCurvedDottedArrow,
  drawTornPaperVertical,
  drawWoodenPictureFrame,
} from './customLayoutEngines';

export interface PosterRendererHandle {
  exportImage: (format: 'png' | 'jpeg', quality?: number) => Promise<string | null>;
  getCanvas: () => HTMLCanvasElement | null;
}

interface PosterCanvasRendererProps {
  aspectRatio: AspectRatio;
  frame: FrameTemplate;
  userPhoto: string | null;
  transform: PhotoTransform;
  custom: PosterCustomization;
  interactivePreview?: boolean;
}

export const PosterCanvasRenderer = forwardRef<PosterRendererHandle, PosterCanvasRendererProps>(
  ({ aspectRatio, frame, userPhoto, transform, custom }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Canvas native internal dimensions (for high-DPI export: 1080px base)
    const getDimensions = () => {
      const width = 1080;
      let height = 1080;
      if (aspectRatio === '4:5') height = 1350;
      if (aspectRatio === '9:16') height = 1920;
      return { width, height };
    };

    // Export image helper
    useImperativeHandle(ref, () => ({
      exportImage: async (format: 'png' | 'jpeg', quality = 0.96) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const mime = format === 'png' ? 'image/png' : 'image/jpeg';
        return canvas.toDataURL(mime, quality);
      },
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = getDimensions();
      canvas.width = width;
      canvas.height = height;

      let isCancelled = false;

      const renderPoster = async () => {
        // Ensure fonts are ready
        try {
          await (document as any).fonts?.ready;
        } catch {}

        if (isCancelled) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Render Background
        renderBackground(ctx, width, height, frame);

        // 2. Render User Photo (if provided)
        if (userPhoto) {
          await renderPhoto(ctx, width, height, frame, userPhoto, transform);
        } else {
          renderPhotoPlaceholder(ctx, width, height, frame);
        }

        if (isCancelled) return;

        // 3. Render Frame Decorative Elements & Overlays
        renderFrameDecorations(ctx, width, height, frame, aspectRatio);

        // 4. Render Bengali Text (Headline, Quotes, Author, Badges)
        renderTypography(ctx, width, height, frame, custom, aspectRatio);
      };

      renderPoster();

      return () => {
        isCancelled = true;
      };
    }, [aspectRatio, frame, userPhoto, transform, custom]);

    // Helpers
    const renderBackground = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      f: FrameTemplate
    ) => {
      // Direct custom background color override if set (for non-curved frames)
      if (custom.customBgColor && f.layoutType !== 'leader_curved_wave' && f.layoutType !== 'whiteboard_presenter') {
        ctx.fillStyle = custom.customBgColor;
        ctx.fillRect(0, 0, w, h);
        return;
      }

      // 1. Leader Curved Wave Background (Matching Image 1: Dr. Fakhruddin Ahmed style)
      if (f.layoutType === 'leader_curved_wave') {
        const waveY = h * 0.52;

        if (custom.showBangladeshFlagBg !== false) {
          // Bangladesh dark green flag backdrop
          const greenGrad = ctx.createLinearGradient(0, 0, w, waveY);
          greenGrad.addColorStop(0, '#004d38');
          greenGrad.addColorStop(1, '#006a4e');
          ctx.fillStyle = greenGrad;
          ctx.fillRect(0, 0, w, waveY + 40);

          // Bangladesh red sun
          const sunX = w * 0.22;
          const sunY = h * 0.20;
          const sunR = w * 0.17;
          ctx.fillStyle = '#f42a41';
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
          ctx.fill();

          // Translucent Bangladesh Map silhouette outline on right
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 3;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.beginPath();
          const mx = w * 0.72;
          const my = h * 0.10;
          ctx.moveTo(mx, my);
          ctx.lineTo(mx + 80, my + 30);
          ctx.lineTo(mx + 110, my + 80);
          ctx.lineTo(mx + 70, my + 140);
          ctx.lineTo(mx + 90, my + 190);
          ctx.lineTo(mx + 20, my + 210);
          ctx.lineTo(mx - 40, my + 160);
          ctx.lineTo(mx - 20, my + 70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        } else {
          // Clean deep gradient or custom color
          if (custom.customBgColor) {
            ctx.fillStyle = custom.customBgColor;
            ctx.fillRect(0, 0, w, waveY + 40);
          } else {
            const grad = ctx.createLinearGradient(0, 0, w, waveY);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(1, '#1e293b');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, waveY + 40);
          }
        }

        // Bottom section: crisp card (white by default, or custom background color)
        ctx.fillStyle = custom.customCardBgColor || custom.customBgColor || '#ffffff';
        ctx.fillRect(0, waveY - 20, w, h - waveY + 20);
        return;
      }

      // 2. Whiteboard Presenter Background (Matching Image 2: Shaykh Ahmadullah style)
      if (f.layoutType === 'whiteboard_presenter') {
        // Soft neutral wall background or custom color
        if (custom.customBgColor) {
          ctx.fillStyle = custom.customBgColor;
          ctx.fillRect(0, 0, w, h);
        } else {
          const wallGrad = ctx.createLinearGradient(0, 0, w, h);
          wallGrad.addColorStop(0, '#f1f5f9');
          wallGrad.addColorStop(0.5, '#e2e8f0');
          wallGrad.addColorStop(1, '#cbd5e1');
          ctx.fillStyle = wallGrad;
          ctx.fillRect(0, 0, w, h);
        }

        // Whiteboard on left
        const wbX = 35;
        const wbY = 35;
        const wbW = w * 0.62;
        const wbH = h - 70;

        ctx.save();
        // Drop shadow for whiteboard
        ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 12;

        // Aluminum frame
        ctx.fillStyle = '#94a3b8';
        roundRect(ctx, wbX, wbY, wbW, wbH, 16);
        ctx.fill();

        // Inner white surface
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, wbX + 12, wbY + 12, wbW - 24, wbH - 24, 8);
        ctx.fill();

        // Whiteboard gloss highlight
        const gloss = ctx.createLinearGradient(wbX, wbY, wbX + wbW, wbY + wbH);
        gloss.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gloss.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gloss;
        roundRect(ctx, wbX + 12, wbY + 12, wbW - 24, wbH - 24, 8);
        ctx.fill();

        // Marker tray at bottom of board
        ctx.fillStyle = '#64748b';
        ctx.fillRect(wbX + 40, wbY + wbH - 12, 160, 10);
        // Black and red dry-erase markers
        ctx.fillStyle = '#0f172a';
        roundRect(ctx, wbX + 50, wbY + wbH - 16, 50, 7, 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        roundRect(ctx, wbX + 110, wbY + wbH - 16, 50, 7, 2);
        ctx.fill();

        ctx.restore();
        return;
      }

      // Background gradient or base for other frames
      if (f.category === 'whiteboard') {
        if (f.layoutType === 'whiteboard_classic') {
          // Whiteboard background with subtle gloss
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, '#f8fafc');
          grad.addColorStop(1, '#f1f5f9');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Subtle grid dots
          ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
          for (let x = 40; x < w - 40; x += 40) {
            for (let y = 40; y < h - 40; y += 40) {
              ctx.fillRect(x, y, 2, 2);
            }
          }
        } else if (f.layoutType === 'classroom_chalkboard') {
          // Slate chalkboard
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#1c2f24');
          grad.addColorStop(0.5, '#15251c');
          grad.addColorStop(1, '#0c1611');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        } else {
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(1, '#020617');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      } else if (f.layoutType === 'islamic_mihrab_window') {
        // Deep emerald midnight sky with subtle celestial glow
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 80, w * 0.5, h * 0.5, Math.max(w, h));
        grad.addColorStop(0, '#0a2f26');
        grad.addColorStop(0.5, '#051c16');
        grad.addColorStop(1, '#020e0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Subtle stars / golden dust
        ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
        for (let i = 0; i < 35; i++) {
          const sx = (i * 137.5) % w;
          const sy = (i * 93.7) % (h * 0.6);
          const r = (i % 3 === 0) ? 2 : 1;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (f.layoutType === 'vintage_torn_parchment') {
        // Deep warm espresso & mahogany wooden desk background
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#1c100a');
        grad.addColorStop(0.5, '#120a06');
        grad.addColorStop(1, '#090503');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Warm lantern glow halo on left
        const glow = ctx.createRadialGradient(160, h * 0.75, 20, 160, h * 0.75, 320);
        glow.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
        glow.addColorStop(0.6, 'rgba(217, 119, 6, 0.08)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'baroque_garden_laurel') {
        // Royal botanical garden emerald vignette
        const grad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, Math.max(w, h));
        grad.addColorStop(0, '#093627');
        grad.addColorStop(0.6, '#041d14');
        grad.addColorStop(1, '#010a07');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'wood_frame_social') {
        drawWoodenPictureFrame(ctx, w, h);
      } else if (f.layoutType === 'tv_news_crimson') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#7f1d1d');
        grad.addColorStop(0.5, '#450a0a');
        grad.addColorStop(1, '#1c0303');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        drawWorldMapWatermark(ctx, w, h);
      } else if (f.layoutType === 'poetic_pure_black') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'editorial_quote_bar') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(1, '#030712');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'vintage_lithograph_scroll') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#f5ecd8');
        grad.addColorStop(0.5, '#eee1c7');
        grad.addColorStop(1, '#decbb0');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'literary_book_cover') {
        ctx.fillStyle = '#f8ede3';
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'periwinkle_vertical_reel') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#7374b5');
        grad.addColorStop(0.6, '#555694');
        grad.addColorStop(1, '#3b3c75');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 40; i++) {
          const px = (i * 123.4) % w;
          const py = (i * 98.7) % h;
          const pr = (i % 3 === 0) ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (f.layoutType === 'sunset_story_brush') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#311042');
        grad.addColorStop(0.35, '#831843');
        grad.addColorStop(0.65, '#ea580c');
        grad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'speech_bubble_placard') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(0.5, '#022c22');
        grad.addColorStop(1, '#011c15');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'viral_dotted_arrow') {
        ctx.fillStyle = '#faf9f5';
        ctx.fillRect(0, 0, w, h);
      } else if (f.layoutType === 'torn_paper_split') {
        ctx.fillStyle = '#164e3f';
        ctx.fillRect(0, 0, w, h);
        drawTornPaperVertical(ctx, w * 0.40, h);
      } else if (f.layoutType === 'overlapping_white_card') {
        ctx.fillStyle = '#0d382d';
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, 45, 45, w * 0.72, h * 0.65, 24);
        ctx.fill();
        ctx.restore();
      } else if (f.layoutType === 'yellow_border_alert_card') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      } else if (f.category === 'golden') {
        const grad = ctx.createRadialGradient(w / 2, h * 0.35, 50, w / 2, h / 2, Math.max(w, h));
        grad.addColorStop(0, '#2c1e08');
        grad.addColorStop(0.6, '#140c03');
        grad.addColorStop(1, '#050300');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (f.category === 'islamic') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#042f24');
        grad.addColorStop(0.5, '#021e17');
        grad.addColorStop(1, '#01120e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (f.category === 'nature') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#062d18');
        grad.addColorStop(0.5, '#03170c');
        grad.addColorStop(1, '#010a05');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(0.5, '#111827');
        grad.addColorStop(1, '#030712');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const renderPhoto = async (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      f: FrameTemplate,
      src: string,
      t: PhotoTransform
    ) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;

      await new Promise<void>((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

      if (!img.naturalWidth || !img.naturalHeight) return;

      ctx.save();

      // Determine photo box based on layout
      let bx = 0;
      let by = 0;
      let bw = w;
      let bh = h;
      let isCircle = false;
      let isRounded = true;
      let borderRadius = 24;

      if (f.layoutType === 'leader_curved_wave') {
        // Top portrait matching Image 1: Dr. Fakhruddin Ahmed style
        bw = w * 0.72;
        bh = h * 0.52;
        bx = (w - bw) / 2;
        by = h * 0.02;
        borderRadius = 32;
      } else if (f.layoutType === 'whiteboard_presenter') {
        // Speaker standing on right matching Image 2: Shaykh Ahmadullah style
        bw = w * 0.44;
        bh = h * 0.86;
        bx = w - bw - 15;
        by = h * 0.10;
        borderRadius = 28;
      } else if (f.layoutType === 'whiteboard_classic' || f.layoutType === 'classroom_chalkboard' || f.layoutType === 'glassboard_office') {
        // Polaroid / Pin photo on the right
        bw = w * 0.38;
        bh = bw * 1.25;
        bx = w - bw - 60;
        by = (h - bh) / 2 - 30;
        borderRadius = 16;
      } else if (f.layoutType === 'dramatic_black_gold' || f.layoutType === 'red_black_typography' || f.layoutType === 'corporate_blue_white' || f.layoutType === 'premium_editorial') {
        // Portrait on right half or top right
        bw = w * 0.42;
        bh = h * 0.65;
        bx = w - bw - 50;
        by = (h - bh) / 2;
        borderRadius = 32;
      } else if (f.layoutType === 'luxury_golden_border' || f.layoutType === 'islamic_mihrab') {
        // Oval / Arched central portrait
        bw = w * 0.45;
        bh = bw * 1.15;
        bx = (w - bw) / 2;
        by = h * 0.12;
        borderRadius = 40;
      } else if (f.layoutType === 'islamic_mihrab_window' || f.layoutType === 'baroque_garden_laurel') {
        // Circular / medallion portrait at top center
        bw = w * 0.36;
        bh = bw;
        bx = (w - bw) / 2;
        by = h * 0.08;
        borderRadius = bw / 2;
        isCircle = true;
      } else if (f.layoutType === 'vintage_torn_parchment') {
        bw = w * 0.38;
        bh = bw * 1.15;
        bx = (w - bw) / 2;
        by = h * 0.09;
        borderRadius = 16;
      } else if (f.layoutType === 'wood_frame_social') {
        // Centered sketch portrait inside matting
        bw = w * 0.38;
        bh = bw * 1.18;
        bx = (w - bw) / 2;
        by = h * 0.07;
        borderRadius = 12;
      } else if (f.layoutType === 'tv_news_crimson') {
        // Lower-right portrait box with red border
        bw = w * 0.38;
        bh = h * 0.42;
        bx = w - bw - 55;
        by = h * 0.44;
        borderRadius = 16;
      } else if (f.layoutType === 'poetic_pure_black') {
        // Lower-left portrait blending softly
        bw = w * 0.40;
        bh = h * 0.46;
        bx = 55;
        by = h - bh - 60;
        borderRadius = 28;
      } else if (f.layoutType === 'editorial_quote_bar') {
        // Right half seamless portrait
        bw = w * 0.48;
        bh = h * 0.74;
        bx = w - bw;
        by = h * 0.16;
        borderRadius = 20;
      } else if (f.layoutType === 'vintage_lithograph_scroll') {
        // Left side framed vintage portrait
        bw = w * 0.34;
        bh = h * 0.62;
        bx = 65;
        by = (h - bh) / 2;
        borderRadius = 8;
      } else if (f.layoutType === 'literary_book_cover') {
        // Center-bottom circular portrait with glowing halo
        bw = w * 0.42;
        bh = bw;
        bx = (w - bw) / 2;
        by = h * 0.46;
        borderRadius = bw / 2;
        isCircle = true;
      } else if (f.layoutType === 'periwinkle_vertical_reel') {
        // Top speaker portrait with feathered bottom fade
        bw = w * 0.54;
        bh = h * 0.38;
        bx = (w - bw) / 2;
        by = 30;
        borderRadius = 28;
      } else if (f.layoutType === 'sunset_story_brush') {
        // Left side landscape silhouette portrait
        bw = w * 0.40;
        bh = h * 0.56;
        bx = 55;
        by = h * 0.28;
        borderRadius = 20;
      } else if (f.layoutType === 'speech_bubble_placard') {
        // Center person holding speech bubble
        bw = w * 0.48;
        bh = h * 0.44;
        bx = (w - bw) / 2;
        by = 35;
        borderRadius = 24;
      } else if (f.layoutType === 'viral_dotted_arrow') {
        // Right bottom circular cutout
        bw = w * 0.34;
        bh = bw;
        bx = w - bw - 60;
        by = h * 0.50;
        borderRadius = bw / 2;
        isCircle = true;
      } else if (f.layoutType === 'torn_paper_split') {
        // Left side portrait in front of torn paper
        bw = w * 0.40;
        bh = h * 0.74;
        bx = 40;
        by = (h - bh) / 2;
        borderRadius = 20;
      } else if (f.layoutType === 'overlapping_white_card') {
        // Lower-right overlapping portrait
        bw = w * 0.38;
        bh = h * 0.52;
        bx = w - bw - 45;
        by = h * 0.40;
        borderRadius = 24;
      } else if (f.layoutType === 'yellow_border_alert_card') {
        // Right side formal portrait
        bw = w * 0.38;
        bh = h * 0.54;
        bx = w - bw - 60;
        by = h * 0.18;
        borderRadius = 20;
      } else if (f.layoutType === 'tv_breaking_news') {
        // Full screen background or top box
        bw = w - 80;
        bh = h * 0.58;
        bx = 40;
        by = 50;
        borderRadius = 20;
      } else {
        // Top banner portrait
        const topRatio = aspectRatio === '9:16' ? 0.46 : aspectRatio === '4:5' ? 0.48 : 0.45;
        bw = w - 100;
        bh = h * topRatio;
        bx = 50;
        by = 50;
        borderRadius = 28;
      }

      // User Photo Box Scale (making the photo container larger or smaller)
      const boxScale = (t.boxScale || 100) / 100;
      if (boxScale !== 1) {
        const origBw = bw;
        const origBh = bh;
        bw = bw * boxScale;
        bh = bh * boxScale;
        if (f.layoutType === 'leader_curved_wave' || f.photoPosition === 'center') {
          bx = (w - bw) / 2;
        } else if (f.photoPosition === 'right' || f.layoutType === 'whiteboard_presenter') {
          bx = bx + (origBw - bw);
        } else {
          bx = bx + (origBw - bw) / 2;
        }
      }

      // Drop shadow for photo card
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      // Draw clip shape
      ctx.beginPath();
      if (isCircle) {
        ctx.arc(bx + bw / 2, by + bh / 2, bw / 2, 0, Math.PI * 2);
      } else if (isRounded) {
        roundRect(ctx, bx, by, bw, bh, borderRadius);
      } else {
        ctx.rect(bx, by, bw, bh);
      }
      ctx.clip();
      ctx.shadowColor = 'transparent'; // reset shadow

      // Image drawing with user transforms
      const zoomFactor = t.zoom / 100;
      const panX = (t.posX / 100) * (bw / 2);
      const panY = (t.posY / 100) * (bh / 2);

      // Fit image center with aspect fill
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const boxAspect = bw / bh;
      let drawW = bw;
      let drawH = bh;

      if (imgAspect > boxAspect) {
        drawH = bh * zoomFactor;
        drawW = drawH * imgAspect;
      } else {
        drawW = bw * zoomFactor;
        drawH = drawW / imgAspect;
      }

      const drawX = bx + (bw - drawW) / 2 + panX;
      const drawY = by + (bh - drawH) / 2 + panY;

      // Rotate around image center if requested
      if (t.rotate !== 0) {
        const cx = drawX + drawW / 2;
        const cy = drawY + drawH / 2;
        ctx.translate(cx, cy);
        ctx.rotate((t.rotate * Math.PI) / 180);
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }

      // Soft vignette on photo edges if requested
      if (f.hasPhotoVignette) {
        const vig = ctx.createLinearGradient(bx, by + bh * 0.7, bx, by + bh);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.65)');
        ctx.fillStyle = vig;
        ctx.fillRect(bx, by, bw, bh);
      }

      ctx.restore();

      // Border around photo
      ctx.save();
      ctx.lineWidth = f.category === 'golden' ? 4 : f.category === 'whiteboard' ? 8 : 3;
      ctx.strokeStyle =
        f.category === 'golden'
          ? '#d4af37'
          : f.category === 'whiteboard'
          ? '#ffffff'
          : f.accentColor || '#e2e8f0';
      ctx.beginPath();
      roundRect(ctx, bx, by, bw, bh, borderRadius);
      ctx.stroke();

      // Polaroid photo pin or tape on whiteboard
      if (f.layoutType === 'whiteboard_classic' || f.layoutType === 'sticky_note_pinboard') {
        // Red push pin at top center
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bx + bw / 2, by - 4, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(bx + bw / 2 - 3, by - 7, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const renderPhotoPlaceholder = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      f: FrameTemplate
    ) => {
      ctx.save();
      const bw = w * 0.4;
      const bh = bw * 1.1;
      const bx = f.photoPosition === 'right' ? w - bw - 60 : (w - bw) / 2;
      const by = h * 0.15;

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      roundRect(ctx, bx, by, bw, bh, 20);
      ctx.fill();
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📷 আপনার ছবি আপলোড করুন', bx + bw / 2, by + bh / 2);
      ctx.restore();
    };

    const drawCornerOrnament = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      flipX = false,
      flipY = false
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, size);
      ctx.lineTo(0, 0);
      ctx.lineTo(size, 0);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(6, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawMosqueSilhouette = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      const by = h - 60;
      ctx.moveTo(0, h);
      ctx.lineTo(0, by);
      ctx.lineTo(w * 0.15, by);
      ctx.lineTo(w * 0.15, by - 80);
      ctx.lineTo(w * 0.18, by - 120);
      ctx.lineTo(w * 0.21, by - 80);
      ctx.lineTo(w * 0.21, by);
      ctx.arc(w / 2, by, 70, Math.PI, 0, false);
      ctx.lineTo(w * 0.79, by);
      ctx.lineTo(w * 0.79, by - 80);
      ctx.lineTo(w * 0.82, by - 120);
      ctx.lineTo(w * 0.85, by - 80);
      ctx.lineTo(w * 0.85, by);
      ctx.lineTo(w, by);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const renderFrameDecorations = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      f: FrameTemplate,
      _ar: AspectRatio
    ) => {
      ctx.save();

      if (f.layoutType === 'leader_curved_wave') {
        const waveY = h * 0.52;
        // Draw the curved wave separator arc matching Image 1
        ctx.beginPath();
        ctx.moveTo(0, waveY + 20);
        ctx.bezierCurveTo(w * 0.32, waveY + 55, w * 0.68, waveY - 35, w, waveY);
        ctx.strokeStyle = '#006a4e';
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, waveY + 28);
        ctx.bezierCurveTo(w * 0.32, waveY + 63, w * 0.68, waveY - 27, w, waveY + 8);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (f.layoutType === 'whiteboard_presenter') {
        // Handled cleanly in background & typography
        ctx.restore();
        return;
      }

      // Outer Royal / Themed Border
      const margin = 28;
      ctx.strokeStyle = f.accentColor || '#d4af37';

      if (f.category === 'golden') {
        // Double luxury border with corner brackets
        ctx.lineWidth = 3;
        ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.strokeRect(margin + 12, margin + 12, w - (margin + 12) * 2, h - (margin + 12) * 2);

        // Corner ornaments
        if (f.hasCornerOrnaments) {
          drawCornerOrnament(ctx, margin + 6, margin + 6, 30, '#ffd700');
          drawCornerOrnament(ctx, w - margin - 6, margin + 6, 30, '#ffd700', true);
          drawCornerOrnament(ctx, margin + 6, h - margin - 6, 30, '#ffd700', false, true);
          drawCornerOrnament(ctx, w - margin - 6, h - margin - 6, 30, '#ffd700', true, true);
        }
      } else if (f.category === 'islamic') {
        // Islamic arch border & header
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#d4af37';
        roundRect(ctx, margin, margin, w - margin * 2, h - margin * 2, 24);
        ctx.stroke();

        // Crescent moon icon top
        ctx.fillStyle = '#fbbf24';
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☪︎', w / 2, margin + 40);

        // Subtle geometric bottom silhouette if mosque silhouette
        if (f.layoutType === 'mosque_silhouette') {
          drawMosqueSilhouette(ctx, w, h);
        }
      } else if (f.category === 'whiteboard') {
        // Aluminum whiteboard frame
        ctx.lineWidth = 18;
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(9, 9, w - 18, h - 18);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(18, 18, w - 36, h - 36);

        // Marker tray at bottom
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(w / 2 - 160, h - 28, 320, 16);
        // Markers in tray
        ctx.fillStyle = '#2563eb';
        roundRect(ctx, w / 2 - 130, h - 24, 70, 8, 3);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        roundRect(ctx, w / 2 - 40, h - 24, 70, 8, 3);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        roundRect(ctx, w / 2 + 50, h - 24, 70, 8, 3);
        ctx.fill();
      } else if (f.layoutType === 'islamic_mihrab_window') {
        // Grand Islamic Mihrab Arch window card
        const cardW = w * 0.88;
        const cardH = h * 0.84;
        const cardX = (w - cardW) / 2;
        const cardY = (h - cardH) / 2;

        ctx.save();
        // Mihrab Arch Shape
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 12;

        ctx.beginPath();
        // Top pointed arch
        ctx.moveTo(cardX, cardY + cardH);
        ctx.lineTo(cardX, cardY + 120);
        ctx.quadraticCurveTo(cardX + 20, cardY + 30, w / 2, cardY);
        ctx.quadraticCurveTo(cardX + cardW - 20, cardY + 30, cardX + cardW, cardY + 120);
        ctx.lineTo(cardX + cardW, cardY + cardH);
        ctx.closePath();

        // Dark emerald card fill
        const cardGrad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
        cardGrad.addColorStop(0, '#062b21');
        cardGrad.addColorStop(1, '#021610');
        ctx.fillStyle = cardGrad;
        ctx.fill();

        // Double Gold foil border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Inner pinstripe
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cardX + 14, cardY + cardH - 14);
        ctx.lineTo(cardX + 14, cardY + 125);
        ctx.quadraticCurveTo(cardX + 30, cardY + 42, w / 2, cardY + 14);
        ctx.quadraticCurveTo(cardX + cardW - 30, cardY + 42, cardX + cardW - 14, cardY + 125);
        ctx.lineTo(cardX + cardW - 14, cardY + cardH - 14);
        ctx.closePath();
        ctx.stroke();

        // Top crescent & star
        ctx.fillStyle = '#f59e0b';
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☪︎', w / 2, cardY + 60);

        // Antique brass glowing lantern on left
        drawAntiqueLantern(ctx, cardX + 70, cardY + cardH - 140, 1.1);

        // Mosque silhouette on right
        drawMiniMosque(ctx, cardX + cardW - 140, cardY + cardH - 20, 1.0);

        ctx.restore();
      } else if (f.layoutType === 'vintage_torn_parchment') {
        // Realistic Torn Vintage Parchment card
        const cardW = w * 0.88;
        const cardH = h * 0.84;
        const cardX = (w - cardW) / 2;
        const cardY = (h - cardH) / 2;

        ctx.save();
        // Drop shadow for torn paper
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 35;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 16;

        // Draw ragged/torn paper path
        drawTornPaper(ctx, cardX, cardY, cardW, cardH);

        // Antique parchment gradient fill
        const pGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        pGrad.addColorStop(0, '#f9f1e0');
        pGrad.addColorStop(0.5, '#f4e5c8');
        pGrad.addColorStop(1, '#e8cca0');
        ctx.fillStyle = pGrad;
        ctx.fill();

        // Burnt/aged edge stroke
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.55)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Antique brass oil lantern on bottom left
        drawAntiqueLantern(ctx, cardX + 75, cardY + cardH - 130, 1.15);

        // Quill pen and inkpot on bottom right
        drawQuillAndInk(ctx, cardX + cardW - 110, cardY + cardH - 95, 1.05);

        // Flowing silk ribbon across bottom
        drawSilkRibbon(ctx, cardX, cardY + cardH - 35, cardW);

        ctx.restore();
      } else if (f.layoutType === 'baroque_garden_laurel') {
        // Outer thin double gold pin-stripe border
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#d4af37';
        ctx.strokeRect(32, 32, w - 64, h - 64);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.strokeRect(42, 42, w - 84, h - 84);

        // Corner ornaments
        drawCornerOrnament(ctx, 36, 36, 28, '#ffd700');
        drawCornerOrnament(ctx, w - 36, 36, 28, '#ffd700', true);
        drawCornerOrnament(ctx, 36, h - 36, 28, '#ffd700', false, true);
        drawCornerOrnament(ctx, w - 36, h - 36, 28, '#ffd700', true, true);

        // Central Baroque scalloped cartouche plaque
        const plaqueW = w * 0.84;
        const plaqueH = h * 0.82;
        const plaqueX = (w - plaqueW) / 2;
        const plaqueY = (h - plaqueH) / 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 10;

        // Scalloped cartouche rounded shape
        roundRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 36);
        ctx.fillStyle = '#faf8f2';
        ctx.fill();

        // Gold Cartouche Border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(218, 165, 32, 0.5)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, plaqueX + 10, plaqueY + 10, plaqueW - 20, plaqueH - 20, 28);
        ctx.stroke();

        // Laurel branches flanking left & right
        drawLaurelBranch(ctx, plaqueX + 18, plaqueY + plaqueH * 0.48, 1.2, false);
        drawLaurelBranch(ctx, plaqueX + plaqueW - 18, plaqueY + plaqueH * 0.48, 1.2, true);

        ctx.restore();
      } else if (f.layoutType === 'wood_frame_social') {
        // Bottom black footer bar with social icons
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(36, h - 105, w - 72, 70);
        drawSocialMediaStrip(ctx, w / 2, h - 85, c.watermark || `© ${c.authorName || 'ARIF KHAN'} OFFICIAL`);
      } else if (f.layoutType === 'tv_news_crimson') {
        // Top logo badge: সমগ্র
        ctx.save();
        ctx.fillStyle = '#0284c7';
        roundRect(ctx, 60, 45, 95, 42, 6);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        roundRect(ctx, 155, 45, 95, 42, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('সম', 107, 66);
        ctx.fillText('গ্র', 202, 66);
        ctx.restore();

        // Giant dark quote
        ctx.save();
        ctx.fillStyle = 'rgba(40, 5, 5, 0.9)';
        ctx.font = 'bold 110px serif';
        ctx.fillText('❝', 65, 180);
        ctx.restore();

        // Bottom full-width live news ticker bar
        const barH = 50;
        const barY = h - barH - 25;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(40, barY, w * 0.35, barH);
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(40 + w * 0.35, barY, w * 0.30, barH);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(40 + w * 0.65, barY, (w - 80) * 0.35, barH);

        // Social text on ticker
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('f /Samagra-TV', 40 + (w * 0.35) / 2, barY + barH / 2);
        ctx.fillText(c.dateText || '১৫ ফেব্রুয়ারি, ২০২৬', 40 + w * 0.35 + (w * 0.30) / 2, barY + barH / 2);
        ctx.fillText('▶ /@Samagra-TV', 40 + w * 0.65 + ((w - 80) * 0.35) / 2, barY + barH / 2);
      } else if (f.layoutType === 'poetic_pure_black') {
        // Red feather quill signature badge at bottom right: আত্মপ্রকাশ
        const badgeX = w - 190;
        const badgeY = h - 90;
        ctx.save();
        // Feather quill icon
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(badgeX + 15, badgeY);
        ctx.quadraticCurveTo(badgeX + 45, badgeY - 35, badgeX + 75, badgeY - 55);
        ctx.stroke();
        // Feather vane
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(badgeX + 75, badgeY - 55);
        ctx.quadraticCurveTo(badgeX + 45, badgeY - 45, badgeX + 35, badgeY - 20);
        ctx.closePath();
        ctx.fill();
        // Bengali badge text
        ctx.font = 'bold 26px "Hind Siliguri", serif';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('আত্মপ্রকাশ', badgeX + 50, badgeY + 28);
        ctx.restore();
      } else if (f.layoutType === 'editorial_quote_bar') {
        // Top publication masthead: The Ingeneral
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(65, 55, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('i', 65, 55);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('The Ingeneral', 95, 55);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px sans-serif';
        ctx.fillText(`|  ${c.dateText || '29 October 2026'}`, 245, 55);

        // Yellow vertical quote bar
        ctx.fillStyle = '#eab308';
        ctx.fillRect(55, 130, 8, h * 0.52);

        // Giant yellow quote mark
        ctx.font = 'bold 85px serif';
        ctx.fillText('❝', 80, 190);
        ctx.restore();
      } else if (f.layoutType === 'vintage_lithograph_scroll') {
        // Victorian corner paisley filigree
        drawCornerOrnament(ctx, 45, 45, 35, '#854d0e');
        drawCornerOrnament(ctx, w - 45, 45, 35, '#854d0e', true);
        drawCornerOrnament(ctx, 45, h - 45, 35, '#854d0e', false, true);
        drawCornerOrnament(ctx, w - 45, h - 45, 35, '#854d0e', true, true);

        // Double engraved line border around photo
        const pBx = 60;
        const pBy = (h - h * 0.62) / 2;
        const pBw = w * 0.34;
        const pBh = h * 0.62;
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2;
        ctx.strokeRect(pBx - 6, pBy - 6, pBw + 12, pBh + 12);
        ctx.lineWidth = 1;
        ctx.strokeRect(pBx - 12, pBy - 12, pBw + 24, pBh + 24);

        // Rock Memorial statue silhouette at bottom right
        ctx.save();
        ctx.fillStyle = 'rgba(69, 26, 3, 0.45)';
        const sx = w - 110;
        const sy = h - 65;
        ctx.fillRect(sx - 25, sy, 50, 25);
        ctx.beginPath();
        ctx.arc(sx, sy - 30, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (f.layoutType === 'literary_book_cover') {
        // Glowing solar halo behind portrait
        const haloX = w / 2;
        const haloY = h * 0.46 + (w * 0.42) / 2;
        const halo = ctx.createRadialGradient(haloX, haloY, 20, haloX, haloY, w * 0.38);
        halo.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
        halo.addColorStop(0.5, 'rgba(245, 158, 11, 0.20)');
        halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(haloX, haloY, w * 0.38, 0, Math.PI * 2);
        ctx.fill();

        // Publisher tree logo at bottom right
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(w - 110, h - 90, 65, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('ব', w - 78, h - 68);
        ctx.font = '11px "Hind Siliguri", sans-serif';
        ctx.fillText('বোধিসত্ত্ব', w - 78, h - 45);
        ctx.restore();
      } else if (f.layoutType === 'sunset_story_brush') {
        // Left side antique clock silhouette
        ctx.save();
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(100, h * 0.72, 55, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Clock hands
        ctx.beginPath();
        ctx.moveTo(100, h * 0.72);
        ctx.lineTo(100, h * 0.72 - 32);
        ctx.moveTo(100, h * 0.72);
        ctx.lineTo(125, h * 0.72);
        ctx.stroke();

        // Top right yellow brushstroke headline banner
        ctx.fillStyle = '#facc15';
        roundRect(ctx, w * 0.46, h * 0.15, w * 0.48, 48, 8);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('সময় নিয়ে ক্যাপশন:', w * 0.70, h * 0.15 + 32);

        // Dark brown badge: ২০ টি উক্তি
        ctx.fillStyle = '#29180c';
        roundRect(ctx, w * 0.52, h * 0.52, 190, 52, 12);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
        ctx.fillText('২০ টি উক্তি', w * 0.52 + 95, h * 0.52 + 36);
        ctx.restore();
      } else if (f.layoutType === 'speech_bubble_placard') {
        // Large oval speech bubble placard held in hands
        const sbX = w * 0.10;
        const sbY = h * 0.45;
        const sbW = w * 0.80;
        const sbH = h * 0.46;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 12;

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(w / 2, sbY + sbH / 2, sbW / 2, sbH / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Speech bubble pointer tail at bottom left
        ctx.beginPath();
        ctx.moveTo(w * 0.32, sbY + sbH - 8);
        ctx.lineTo(w * 0.22, sbY + sbH + 35);
        ctx.lineTo(w * 0.38, sbY + sbH - 2);
        ctx.closePath();
        ctx.fill();

        // Giant red quote mark at top right of speech bubble
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 120px serif';
        ctx.fillText('❝', w * 0.72, sbY - 15);

        // Two hands holding bottom edge of placard
        ctx.fillStyle = '#d4a373';
        roundRect(ctx, w * 0.28, sbY + sbH - 18, 48, 28, 14);
        ctx.fill();
        roundRect(ctx, w * 0.68, sbY + sbH - 18, 48, 28, 14);
        ctx.fill();
        ctx.restore();
      } else if (f.layoutType === 'viral_dotted_arrow') {
        // Top center dark navy circle quote badge
        ctx.save();
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(w / 2, 85, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❝', w / 2, 90);

        // Curved dotted arrow pointing to author
        drawCurvedDottedArrow(ctx, 160, h * 0.58, w - 210, h * 0.62);

        // Bottom social media pill bar
        const barY = h - 60;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(50, barY, w - 100, 36);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('f 📸 ▶ Be Like Bangla • ফেসবুক পেজ ফলো দিয়ে সাথে থাকুন', w / 2, barY + 18);
        ctx.restore();
      } else if (f.layoutType === 'torn_paper_split') {
        // Top right logo: RESTART YOURSELF
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('RESTART YOURSELF', w - 55, 65);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#86efac';
        ctx.fillText('WITH ZAVED PARVEZ', w - 55, 88);
        ctx.restore();
      } else if (f.layoutType === 'yellow_border_alert_card') {
        // Thick yellow outer border with curved corners
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 18;
        roundRect(ctx, 30, 30, w - 60, h - 60, 32);
        ctx.stroke();

        // Giant yellow quotes
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 95px serif';
        ctx.fillText('❝', 75, 140);

        // Bottom dark alert box with calendar icon
        const abX = 55;
        const abY = h - 145;
        const abW = w - 110;
        const abH = 95;
        ctx.fillStyle = '#0f172a';
        roundRect(ctx, abX, abY, abW, abH, 20);
        ctx.fill();

        // Calendar icon
        ctx.fillStyle = '#eab308';
        roundRect(ctx, abX + 25, abY + 22, 50, 50, 10);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📅', abX + 50, abY + 47);

        // Alert text inside box
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('২০২৩ সালের ২৫ ডিসেম্বর, অর্থাৎ', abX + 90, abY + 38);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '16px "Hind Siliguri", sans-serif';
        ctx.fillText('জুলাই আন্দোলনের মাত্র ৬ মাস আগে এক ফেসবুক স্ট্যাটাসে এ প্রশংসা করেছিলেন', abX + 90, abY + 68);
        ctx.restore();
      } else if (f.layoutType === 'tv_breaking_news') {
        // Breaking news red banner at bottom
        const barH = 140;
        const barY = h - barH - 40;

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(30, barY, w - 60, 48);

        // Red live tag
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🔴 সরাসরি • ব্রেকিং নিউজ', 55, barY + 34);

        // Yellow ticker bar
        ctx.fillStyle = '#facc15';
        ctx.fillRect(30, barY + 48, w - 60, barH - 48);
      } else {
        // Clean modern border
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        roundRect(ctx, margin, margin, w - margin * 2, h - margin * 2, 20);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawAntiqueLantern = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale = 1.0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Warm radial glow halo
      const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 80);
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
      glow.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
      glow.addColorStop(1, 'rgba(217, 119, 6, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.fill();

      // Top suspension ring
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -42, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Top brass dome cap
      ctx.fillStyle = '#b48a28';
      ctx.beginPath();
      ctx.moveTo(-16, -26);
      ctx.lineTo(16, -26);
      ctx.lineTo(24, -14);
      ctx.lineTo(-24, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glass body
      const glassGrad = ctx.createLinearGradient(-18, -14, 18, 30);
      glassGrad.addColorStop(0, 'rgba(254, 243, 199, 0.95)');
      glassGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.9)');
      glassGrad.addColorStop(1, 'rgba(245, 158, 11, 0.8)');
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.moveTo(-18, -14);
      ctx.lineTo(18, -14);
      ctx.lineTo(22, 28);
      ctx.lineTo(-22, 28);
      ctx.closePath();
      ctx.fill();

      // Flame core inside
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 4, 7, 0, Math.PI * 2);
      ctx.fill();

      // Brass cage ribs
      ctx.strokeStyle = '#926a17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -14);
      ctx.lineTo(-10, 28);
      ctx.moveTo(8, -14);
      ctx.lineTo(10, 28);
      ctx.stroke();

      // Base pedestal
      ctx.fillStyle = '#7a5510';
      ctx.beginPath();
      ctx.rect(-25, 28, 50, 10);
      ctx.fill();
      ctx.stroke();

      // Stacked vintage book base underneath
      ctx.fillStyle = '#451a03';
      roundRect(ctx, -38, 38, 76, 12, 3);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-36, 42, 72, 3);

      ctx.restore();
    };

    const drawMiniMosque = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale = 1.0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = 'rgba(6, 43, 33, 0.95)';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;

      // Base building
      ctx.beginPath();
      ctx.rect(-60, -40, 120, 40);
      ctx.fill();
      ctx.stroke();

      // Central Dome
      ctx.beginPath();
      ctx.arc(0, -40, 28, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();

      // Crescent spire on dome
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('☪', -5, -72);

      // Minaret left
      ctx.fillStyle = 'rgba(6, 43, 33, 0.95)';
      ctx.fillRect(-62, -75, 12, 75);
      ctx.strokeRect(-62, -75, 12, 75);
      ctx.beginPath();
      ctx.moveTo(-64, -75);
      ctx.lineTo(-56, -92);
      ctx.lineTo(-48, -75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Minaret right
      ctx.fillRect(50, -75, 12, 75);
      ctx.strokeRect(50, -75, 12, 75);
      ctx.beginPath();
      ctx.moveTo(48, -75);
      ctx.lineTo(56, -92);
      ctx.lineTo(64, -75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const drawQuillAndInk = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale = 1.0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Glass Inkpot
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, -18, 0, 36, 26, 6);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inkpot neck & cork
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-10, -8, 20, 8);

      // Feather Quill leaning right
      ctx.save();
      ctx.rotate(0.35);
      // Quill shaft
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(15, -75);
      ctx.stroke();

      // Feather vane
      ctx.fillStyle = '#fafaf9';
      ctx.beginPath();
      ctx.moveTo(15, -75);
      ctx.quadraticCurveTo(32, -50, 10, -25);
      ctx.lineTo(0, -30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    const drawSilkRibbon = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number
    ) => {
      ctx.save();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 20, y);
      ctx.bezierCurveTo(x + w * 0.3, y - 18, x + w * 0.7, y + 18, x + w - 20, y);
      ctx.stroke();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 30, y + 6);
      ctx.bezierCurveTo(x + w * 0.3, y - 12, x + w * 0.7, y + 24, x + w - 30, y + 6);
      ctx.stroke();
      ctx.restore();
    };

    const drawTornPaper = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      // Procedurally generate ragged edges
      const step = 20;
      ctx.beginPath();
      ctx.moveTo(x, y + 20);

      // Top edge
      for (let curX = x; curX <= x + w; curX += step) {
        const jitterY = y + ((curX * 13) % 9) - 4;
        ctx.lineTo(curX, jitterY);
      }
      ctx.lineTo(x + w, y);

      // Right edge
      for (let curY = y; curY <= y + h; curY += step) {
        const jitterX = x + w + ((curY * 17) % 9) - 4;
        ctx.lineTo(jitterX, curY);
      }
      ctx.lineTo(x + w, y + h);

      // Bottom edge
      for (let curX = x + w; curX >= x; curX -= step) {
        const jitterY = y + h + ((curX * 19) % 9) - 4;
        ctx.lineTo(curX, jitterY);
      }
      ctx.lineTo(x, y + h);

      // Left edge
      for (let curY = y + h; curY >= y; curY -= step) {
        const jitterX = x + ((curY * 23) % 9) - 4;
        ctx.lineTo(jitterX, curY);
      }
      ctx.closePath();
    };

    const drawLaurelBranch = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale = 1.0,
      flip = false
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flip ? -scale : scale, scale);

      // Stem curve
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.quadraticCurveTo(18, 0, 0, 90);
      ctx.stroke();

      // Laurel leaves along stem
      const leafCount = 7;
      for (let i = 0; i < leafCount; i++) {
        const ly = -75 + i * 25;
        const lx = Math.sin((i / leafCount) * Math.PI) * 12;

        ctx.fillStyle = i % 2 === 0 ? '#166534' : '#15803d';
        ctx.beginPath();
        ctx.ellipse(lx + 14, ly, 12, 6, 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Gold leaf tip highlight
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    };

    const renderTypography = (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      f: FrameTemplate,
      c: PosterCustomization,
      _ar: AspectRatio
    ) => {
      ctx.save();

      const textColor = c.customTextColor || f.textColor || '#ffffff';
      const quoteColor = c.customQuoteColor || f.quoteColor || f.accentColor || '#d4af37';
      const fontFamily = c.customFontFamily || f.recommendedFont || '"Hind Siliguri", sans-serif';

      // 1. Specific Typography for Leader Curved Wave (Matching Image 1: Dr. Fakhruddin Ahmed style)
      if (f.layoutType === 'leader_curved_wave') {
        const offX = c.textOffsetX || 0;
        const offY = c.textOffsetY || 0;
        const waveY = h * 0.52;
        const cardTop = waveY + 28;
        const centerX = w / 2 + offX;

        const mainColor = c.customTextColor || '#0f2942';
        const qColor = c.customQuoteColor || '#dc2626';

        // Opening Red Quote Mark with flanking lines: — ❝ —
        const quoteY = cardTop + 24 + offY;
        ctx.save();
        ctx.fillStyle = qColor;
        ctx.font = 'bold 56px "Hind Siliguri", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('“', centerX, quoteY);

        // Flanking horizontal red accent lines
        ctx.strokeStyle = qColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX - 180, quoteY);
        ctx.lineTo(centerX - 35, quoteY);
        ctx.moveTo(centerX + 35, quoteY);
        ctx.lineTo(centerX + 180, quoteY);
        ctx.stroke();
        ctx.restore();

        // Main Quote Text (Centered, Deep Navy Bold)
        ctx.save();
        const fontSize = c.fontSize || 34;
        ctx.font = `700 ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const maxTextW = w - 160;
        const textStartY = quoteY + 45;
        const lineHeight = fontSize * 1.38;

        const rawLines = wrapText(ctx, c.statusText || 'দেশ ঠিক করতে এবং দেশে শান্তি ফিরিয়ে আনতে সময় লাগে মাত্র ৭দিন।', maxTextW);

        // Check if there is highlight text (e.g., "মাত্র ৭দিন।")
        const highlightPhrase = c.highlightText?.trim();

        rawLines.forEach((line, idx) => {
          const curY = textStartY + idx * lineHeight;
          if (highlightPhrase && line.includes(highlightPhrase)) {
            const parts = line.split(highlightPhrase);
            const totalW = ctx.measureText(line).width;
            let curX = centerX - totalW / 2;

            if (parts[0]) {
              ctx.fillStyle = mainColor;
              ctx.fillText(parts[0], curX, curY);
              curX += ctx.measureText(parts[0]).width;
            }

            ctx.fillStyle = qColor; // Vibrant Highlight
            ctx.fillText(highlightPhrase, curX, curY);
            curX += ctx.measureText(highlightPhrase).width;

            if (parts[1]) {
              ctx.fillStyle = mainColor;
              ctx.fillText(parts[1], curX, curY);
            }
          } else {
            ctx.fillStyle = mainColor;
            ctx.fillText(line, centerX, curY);
          }
        });

        const textEndY = textStartY + rawLines.length * lineHeight;

        // Closing Red Quote Mark with flanking lines: — ❞ —
        const closeQuoteY = textEndY + 30;
        ctx.save();
        ctx.fillStyle = qColor;
        ctx.font = 'bold 56px "Hind Siliguri", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('”', centerX, closeQuoteY);

        ctx.strokeStyle = qColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX - 180, closeQuoteY);
        ctx.lineTo(centerX - 35, closeQuoteY);
        ctx.moveTo(centerX + 35, closeQuoteY);
        ctx.lineTo(centerX + 180, closeQuoteY);
        ctx.stroke();
        ctx.restore();

        // Speaker / Author Name (Deep Navy, Bold)
        let nameY = closeQuoteY + 45;
        if (c.showAuthor && c.authorName) {
          ctx.save();
          ctx.fillStyle = mainColor;
          ctx.font = `bold ${Math.max(26, fontSize * 0.85)}px ${fontFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText(c.authorName, centerX, nameY);
          nameY += 34;
          ctx.restore();
        }

        // Designation (Slate Subtitle, e.g. "তত্ত্বাবধায়ক সরকারের সাবেক প্রধান উপদেষ্টা")
        if (c.showDesignation !== false && c.designation) {
          ctx.save();
          ctx.fillStyle = c.customTextColor ? 'rgba(0,0,0,0.65)' : '#475569';
          ctx.font = `600 ${Math.max(18, fontSize * 0.55)}px ${fontFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText(c.designation, centerX, nameY);
          ctx.restore();
        }

        // Watermark at very bottom
        if (c.showWatermark && c.watermark) {
          ctx.save();
          ctx.fillStyle = 'rgba(15, 41, 66, 0.45)';
          ctx.font = '14px "Hind Siliguri", sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(c.watermark, w - 40, h - 25);
          ctx.restore();
        }

        ctx.restore();
        return;
      }

      // 2. Specific Typography for Whiteboard Presenter (Matching Image 2: Shaykh Ahmadullah style)
      if (f.layoutType === 'whiteboard_presenter') {
        const offX = c.textOffsetX || 0;
        const offY = c.textOffsetY || 0;
        const wbX = 35;
        const wbY = 35;
        const wbW = w * 0.62;
        const wbH = h - 70;
        const boardPadding = 40;

        const boardContentX = wbX + boardPadding + offX;
        const maxTextW = wbW - boardPadding * 2;
        const fontSize = c.fontSize || 32;

        const mainColor = c.customTextColor || '#0f172a';
        const redColor = c.customQuoteColor || '#dc2626';

        ctx.save();
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        // Split text into normal text and punchline/highlight
        let mainPart = c.statusText;
        let punchlinePart = c.highlightText || '';

        // If no explicit highlightText, if there's comma or multiple sentences, split automatically
        if (!punchlinePart && c.statusText.includes(',')) {
          const idx = c.statusText.indexOf(',');
          mainPart = c.statusText.substring(0, idx + 1).trim();
          punchlinePart = c.statusText.substring(idx + 1).trim();
        } else if (!punchlinePart && c.statusText.includes('।')) {
          const sents = c.statusText.split('।').filter(Boolean);
          if (sents.length > 1) {
            mainPart = sents[0].trim() + '।';
            punchlinePart = sents.slice(1).join('।').trim() + '।';
          }
        }

        ctx.font = `700 ${fontSize}px ${fontFamily}`;
        const mainLines = wrapText(ctx, mainPart, maxTextW);
        const punchLines = punchlinePart ? wrapText(ctx, punchlinePart, maxTextW) : [];

        const lineHeight = fontSize * 1.45;
        const totalH = (mainLines.length + punchLines.length) * lineHeight + 120;
        const startY = Math.max(wbY + 60, (wbH - totalH) / 2 + wbY) + offY;

        let curY = startY;

        // Line 1 / Upper text in Marker Color
        ctx.fillStyle = mainColor;
        mainLines.forEach((line) => {
          ctx.fillText(line, boardContentX, curY);
          curY += lineHeight;
        });

        // Key Punchline in Bold RED Marker with Underline
        if (punchLines.length > 0) {
          curY += 10;
          ctx.fillStyle = redColor;
          punchLines.forEach((line, pIdx) => {
            ctx.fillText(line, boardContentX, curY);

            // Hand-drawn red marker underline under last punchline
            if (pIdx === punchLines.length - 1) {
              const lineMetrics = ctx.measureText(line);
              const ulY = curY + lineHeight * 0.95;
              ctx.save();
              ctx.strokeStyle = redColor;
              ctx.lineWidth = 6;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(boardContentX + 5, ulY);
              ctx.quadraticCurveTo(
                boardContentX + lineMetrics.width * 0.5,
                ulY + 4,
                boardContentX + lineMetrics.width - 5,
                ulY - 2
              );
              ctx.stroke();
              ctx.restore();
            }

            curY += lineHeight;
          });
        }

        // Speaker Name in slanted Marker style on bottom of board
        curY += 35;
        if (c.showAuthor && c.authorName) {
          ctx.fillStyle = mainColor;
          ctx.font = `bold ${Math.max(22, fontSize * 0.72)}px ${fontFamily}`;
          const authorStr = c.authorName.startsWith('—') ? c.authorName : `— ${c.authorName}`;
          ctx.fillText(authorStr, boardContentX + 10, curY);
          curY += 30;
        }

        // Speaker Designation on board
        if (c.showDesignation !== false && c.designation) {
          ctx.fillStyle = '#64748b';
          ctx.font = `600 ${Math.max(16, fontSize * 0.5)}px ${fontFamily}`;
          ctx.fillText(c.designation, boardContentX + 30, curY);
        }

        ctx.restore();
        return;
      }

      // 3. Specific Typography for Islamic Mihrab Window (Matching Image 3: Patience & Faith style)
      if (f.layoutType === 'islamic_mihrab_window') {
        const offX = c.textOffsetX || 0;
        const offY = c.textOffsetY || 0;
        const centerX = w / 2 + offX;
        const startY = h * 0.46 + offY;
        const maxTextW = w * 0.70;
        const fontSize = c.fontSize || 34;
        const mainColor = c.customTextColor || '#ffffff';
        const goldColor = c.customQuoteColor || '#d4af37';

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Gold decorative quote mark
        ctx.fillStyle = goldColor;
        ctx.font = 'bold 50px serif';
        ctx.fillText('“', centerX, startY - 35);

        // Status lines
        ctx.font = `600 ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = mainColor;
        const lines = wrapText(ctx, c.statusText || 'ধৈর্য এমন এক গাছ যার সারা গায়ে কাঁটা, কিন্তু তার ফল অত্যন্ত মিষ্টি।', maxTextW);
        const lineHeight = fontSize * 1.45;
        let curY = startY + 25;

        // Render main text lines
        lines.forEach((line) => {
          // Check if line contains highlight
          if (c.highlightText && line.includes(c.highlightText.trim())) {
            const m = ctx.measureText(line);
            // Golden brushstroke banner behind highlight
            ctx.save();
            ctx.fillStyle = '#b48a28';
            roundRect(ctx, centerX - m.width / 2 - 16, curY - 2, m.width + 32, lineHeight, 8);
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = '#ffffff';
            ctx.fillText(line, centerX, curY);
            ctx.fillStyle = mainColor;
          } else {
            ctx.fillText(line, centerX, curY);
          }
          curY += lineHeight;
        });

        // Closing gold quote
        ctx.fillStyle = goldColor;
        ctx.font = 'bold 50px serif';
        ctx.fillText('”', centerX, curY + 5);
        curY += 45;

        // Author name with crescent ornament
        if (c.showAuthor && c.authorName) {
          ctx.fillStyle = goldColor;
          ctx.font = `bold ${Math.max(24, fontSize * 0.8)}px ${fontFamily}`;
          ctx.fillText(`— ☪︎ ${c.authorName} —`, centerX, curY);
          curY += 32;
        }

        // Designation
        if (c.showDesignation !== false && c.designation) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = `600 ${Math.max(16, fontSize * 0.5)}px ${fontFamily}`;
          ctx.fillText(c.designation, centerX, curY);
        }

        ctx.restore();
        return;
      }

      // 4. Specific Typography for Vintage Torn Parchment (Matching Image 4: Bengali Wisdom style)
      if (f.layoutType === 'vintage_torn_parchment') {
        const offX = c.textOffsetX || 0;
        const offY = c.textOffsetY || 0;
        const centerX = w / 2 + offX;
        const startY = h * 0.47 + offY;
        const maxTextW = w * 0.68;
        const fontSize = c.fontSize || 34;
        const mainColor = c.customTextColor || '#1e140d';
        const crimsonColor = c.customQuoteColor || '#b91c1c';

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Opening Crimson Quote mark
        ctx.fillStyle = crimsonColor;
        ctx.font = 'bold 54px serif';
        ctx.fillText('“', centerX, startY - 35);

        // Status lines in antique charcoal calligraphy
        ctx.font = `700 ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = mainColor;
        const lines = wrapText(ctx, c.statusText || 'জ্ঞানের চেয়ে বড় কোনো ধন নেই, আর মূর্খতার চেয়ে বড় কোনো দরিদ্রতা নেই।', maxTextW);
        const lineHeight = fontSize * 1.45;
        let curY = startY + 25;

        lines.forEach((line) => {
          if (c.highlightText && line.includes(c.highlightText.trim())) {
            const m = ctx.measureText(line);
            ctx.save();
            ctx.fillStyle = 'rgba(185, 28, 28, 0.15)';
            roundRect(ctx, centerX - m.width / 2 - 14, curY + 2, m.width + 28, lineHeight - 4, 6);
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = crimsonColor;
            ctx.fillText(line, centerX, curY);
            ctx.fillStyle = mainColor;
          } else {
            ctx.fillText(line, centerX, curY);
          }
          curY += lineHeight;
        });

        // Closing crimson quote
        ctx.fillStyle = crimsonColor;
        ctx.font = 'bold 54px serif';
        ctx.fillText('”', centerX, curY + 5);
        curY += 45;

        // Author in rich serif
        if (c.showAuthor && c.authorName) {
          ctx.fillStyle = crimsonColor;
          ctx.font = `bold ${Math.max(24, fontSize * 0.8)}px ${fontFamily}`;
          ctx.fillText(`— ${c.authorName} —`, centerX, curY);
          curY += 32;
        }

        if (c.showDesignation !== false && c.designation) {
          ctx.fillStyle = '#78350f';
          ctx.font = `600 ${Math.max(16, fontSize * 0.5)}px ${fontFamily}`;
          ctx.fillText(c.designation, centerX, curY);
        }

        ctx.restore();
        return;
      }

      // 5. Specific Typography for Baroque Garden Laurel (Matching Image 5: Don’t Stop style)
      if (f.layoutType === 'baroque_garden_laurel') {
        const offX = c.textOffsetX || 0;
        const offY = c.textOffsetY || 0;
        const centerX = w / 2 + offX;
        const startY = h * 0.45 + offY;
        const maxTextW = w * 0.68;
        const fontSize = c.fontSize || 34;
        const mainColor = c.customTextColor || '#062b21';
        const goldColor = c.customQuoteColor || '#b8860b';

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Gold decorative quote
        ctx.fillStyle = goldColor;
        ctx.font = 'bold 52px serif';
        ctx.fillText('“', centerX, startY - 35);

        // Status lines
        ctx.font = `700 ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = mainColor;
        const lines = wrapText(ctx, c.statusText || 'সামনে এগিয়ে চলা থামাবেন না, প্রতিটি ব্যর্থতাই নতুন বিজয়ের সূচনা।', maxTextW);
        const lineHeight = fontSize * 1.45;
        let curY = startY + 25;

        lines.forEach((line) => {
          if (c.highlightText && line.includes(c.highlightText.trim())) {
            const m = ctx.measureText(line);
            ctx.save();
            ctx.fillStyle = '#fef3c7';
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 1.5;
            roundRect(ctx, centerX - m.width / 2 - 16, curY - 2, m.width + 32, lineHeight, 8);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            ctx.fillStyle = '#92400e';
            ctx.fillText(line, centerX, curY);
            ctx.fillStyle = mainColor;
          } else {
            ctx.fillText(line, centerX, curY);
          }
          curY += lineHeight;
        });

        ctx.fillStyle = goldColor;
        ctx.font = 'bold 52px serif';
        ctx.fillText('”', centerX, curY + 5);
        curY += 45;

        // Author
        if (c.showAuthor && c.authorName) {
          ctx.fillStyle = mainColor;
          ctx.font = `bold ${Math.max(24, fontSize * 0.8)}px ${fontFamily}`;
          ctx.fillText(`— ${c.authorName} —`, centerX, curY);
          curY += 32;
        }

        if (c.showDesignation !== false && c.designation) {
          ctx.fillStyle = '#475569';
          ctx.font = `600 ${Math.max(16, fontSize * 0.5)}px ${fontFamily}`;
          ctx.fillText(c.designation, centerX, curY);
          curY += 34;
        }

        // Dark green pill badge at bottom of plaque: নিজের ওপর বিশ্বাস রাখুন
        const badgeStr = c.categoryBadge || 'নিজের ওপর বিশ্বাস রাখুন';
        ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
        const bm = ctx.measureText(badgeStr);
        const bbw = bm.width + 36;
        const bbh = 38;
        const bbx = centerX - bbw / 2;
        const bby = curY + 10;

        ctx.fillStyle = '#064e3b';
        roundRect(ctx, bbx, bby, bbw, bbh, 19);
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fef3c7';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeStr, centerX, bby + bbh / 2);

        ctx.restore();
        return;
      }

      // Standard layout text box boundaries based on layout + Manual offsets
      const offX = c.textOffsetX || 0;
      const offY = c.textOffsetY || 0;

      let tx = 80 + offX;
      let ty = (h * 0.58) + offY;
      let tw = w - 160;

      if (f.layoutType === 'whiteboard_classic' || f.layoutType === 'classroom_chalkboard' || f.layoutType === 'glassboard_office') {
        // Left side text beside right portrait
        tx = 70 + offX;
        ty = (h * 0.22) + offY;
        tw = w * 0.48;
      } else if (f.layoutType === 'dramatic_black_gold' || f.layoutType === 'red_black_typography' || f.layoutType === 'corporate_blue_white' || f.layoutType === 'premium_editorial') {
        // Left side text beside right half portrait
        tx = 70 + offX;
        ty = (h * 0.25) + offY;
        tw = w * 0.44;
      } else if (f.layoutType === 'tv_breaking_news') {
        // In the bottom news ticker
        tx = 55 + offX;
        ty = (h - 130) + offY;
        tw = w - 110;
      } else {
        // Standard center or lower third
        tx = 80 + offX;
        ty = (h * 0.56) + offY;
        tw = w - 160;
      }

      // 1. Category Badge
      if (c.showCategoryBadge && c.categoryBadge) {
        ctx.save();
        ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
        const badgeText = c.categoryBadge;
        const metrics = ctx.measureText(badgeText);
        const bw = metrics.width + 30;
        const bh = 36;
        const bx = c.textAlign === 'center' ? tx + (tw - bw) / 2 : tx;
        const by = ty - 50;

        ctx.fillStyle = f.category === 'golden' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(244, 63, 94, 0.2)';
        ctx.strokeStyle = f.accentColor || '#d4af37';
        ctx.lineWidth = 1.5;
        roundRect(ctx, bx, by, bw, bh, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = f.accentColor || '#f5c542';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, bx + 15, by + bh / 2);
        ctx.restore();
      }

      // 2. Large Decorative Quote Mark (if enabled)
      if (c.showQuoteMarks && f.hasDecorativeQuote && f.layoutType !== 'tv_breaking_news') {
        ctx.save();
        ctx.fillStyle = quoteColor;
        ctx.globalAlpha = 0.35;
        ctx.font = 'bold 90px serif';
        ctx.textAlign = c.textAlign === 'center' ? 'center' : 'left';
        ctx.fillText('“', c.textAlign === 'center' ? tx + tw / 2 : tx - 10, ty + 10);
        ctx.restore();
      }

      // 3. Main Status Text with automatic line wrapping
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.textAlign = c.textAlign;
      ctx.textBaseline = 'top';

      const fontSize = c.fontSize || 32;
      ctx.font = `600 ${fontSize}px ${fontFamily}`;

      const lineHeight = fontSize * 1.45;
      const lines = wrapText(ctx, c.statusText || 'আপনার ছবি ও পছন্দের স্ট্যাটাস দিয়ে তৈরি করুন দারুণ পোস্টার।', tw);

      const totalTextH = lines.length * lineHeight;
      let startY = ty;

      // Adjust startY if whiteboard side or centered
      if (f.layoutType === 'whiteboard_classic' || f.layoutType === 'classroom_chalkboard') {
        startY = Math.max(ty, (h - totalTextH) / 2 - 20);
      }

      const alignX = c.textAlign === 'center' ? tx + tw / 2 : c.textAlign === 'right' ? tx + tw : tx;

      lines.forEach((line, idx) => {
        ctx.fillText(line, alignX, startY + idx * lineHeight);
      });

      // 4. Author / Speaker Name
      let authorY = startY + lines.length * lineHeight + 25;
      if (c.showAuthor && c.authorName) {
        ctx.save();
        ctx.fillStyle = quoteColor;
        ctx.font = `bold ${Math.max(20, fontSize * 0.65)}px ${fontFamily}`;
        ctx.textAlign = c.textAlign;
        const authorStr = c.authorName.startsWith('—') ? c.authorName : `— ${c.authorName}`;
        ctx.fillText(authorStr, alignX, authorY);
        authorY += 35;
        ctx.restore();
      }

      // 5. Watermark & Date Footer
      if (c.showWatermark && c.watermark) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.font = '16px "Hind Siliguri", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(c.watermark, w - 50, h - 45);

        if (c.showDate && c.dateText) {
          ctx.textAlign = 'left';
          ctx.fillText(`📅 ${c.dateText}`, 50, h - 45);
        }
        ctx.restore();
      }

      ctx.restore();
    };

    // Text Wrapping Helper
    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
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

    // Rounded rectangle path helper
    const roundRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    const { width, height } = getDimensions();
    const styleAspectRatio = `${width} / ${height}`;

    return (
      <div className="relative w-full max-w-full flex items-center justify-center p-2 sm:p-4">
        <canvas
          ref={canvasRef}
          style={{
            aspectRatio: styleAspectRatio,
            maxHeight: '76vh',
            width: 'auto',
            maxWidth: '100%',
          }}
          className="rounded-2xl shadow-2xl border border-slate-700/80 object-contain bg-slate-950"
        />
      </div>
    );
  }
);

PosterCanvasRenderer.displayName = 'PosterCanvasRenderer';
