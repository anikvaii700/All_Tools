/**
 * Automatic Client-Side Background Removal (Cutout) Engine
 * Specially optimized for portraits, headshots, and studio photos.
 * Uses connected perimeter flood-fill, white/light chroma detection,
 * edge anti-aliasing, and defringe to produce transparent PNGs instantly.
 */

export interface CutoutOptions {
  tolerance?: number; // 10 to 90 (default 42)
  feather?: boolean;  // default true
  defringe?: boolean; // default true
}

export async function removeImageBackground(
  imageSource: string,
  options: CutoutOptions = {}
): Promise<string> {
  const tolerance = options.tolerance ?? 42;
  const shouldFeather = options.feather ?? true;
  const shouldDefringe = options.defringe ?? true;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      // Cap processing size to 1400px for instant responsive performance
      const maxDim = 1400;
      let targetW = origW;
      let targetH = origH;
      if (Math.max(origW, origH) > maxDim) {
        const ratio = maxDim / Math.max(origW, origH);
        targetW = Math.round(origW * ratio);
        targetH = Math.round(origH * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve(imageSource);
        return;
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      const totalPixels = targetW * targetH;

      // 1. Check if the image already has significant transparency (e.g. transparent PNG)
      let transparentSampleCount = 0;
      const checkStride = Math.max(1, Math.floor(totalPixels / 500));
      for (let i = 3; i < data.length; i += checkStride * 4) {
        if (data[i] < 40) transparentSampleCount++;
      }
      if (transparentSampleCount > 50) {
        // Image already has a transparent cutout
        resolve(canvas.toDataURL('image/png'));
        return;
      }

      // 2. Sample perimeter borders to detect the background color
      const samples: [number, number, number][] = [];
      const sampleStepX = Math.max(1, Math.floor(targetW / 35));
      const sampleStepY = Math.max(1, Math.floor(targetH / 35));

      // Top border (across entire width, 0 to 8px down)
      for (let x = 0; x < targetW; x += sampleStepX) {
        for (let y = 0; y < Math.min(6, targetH); y += 2) {
          const idx = (y * targetW + x) * 4;
          samples.push([data[idx], data[idx + 1], data[idx + 2]]);
        }
      }

      // Left and Right borders (upper 75% where background surrounds head & shoulders)
      const maxSampleY = Math.floor(targetH * 0.75);
      for (let y = 0; y < maxSampleY; y += sampleStepY) {
        for (let x = 0; x < Math.min(6, targetW); x += 2) {
          const idx = (y * targetW + x) * 4;
          samples.push([data[idx], data[idx + 1], data[idx + 2]]);
        }
        for (let x = Math.max(0, targetW - 6); x < targetW; x += 2) {
          const idx = (y * targetW + x) * 4;
          samples.push([data[idx], data[idx + 1], data[idx + 2]]);
        }
      }

      if (samples.length === 0) {
        resolve(imageSource);
        return;
      }

      // Calculate mean background color
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      samples.forEach(([r, g, b]) => {
        sumR += r;
        sumG += g;
        sumB += b;
      });
      const bgR = sumR / samples.length;
      const bgG = sumG / samples.length;
      const bgB = sumB / samples.length;

      // Check if background is predominantly white / light-gray studio backdrop
      const isWhiteOrLight = bgR > 200 && bgG > 200 && bgB > 200;

      // 3. Connected Perimeter BFS Flood Fill
      const visited = new Uint8Array(totalPixels);
      const isBg = new Uint8Array(totalPixels);
      const queue = new Int32Array(totalPixels);
      let head = 0;
      let tail = 0;

      // Seed queue with all top border pixels
      for (let x = 0; x < targetW; x++) {
        queue[tail++] = x;
        visited[x] = 1;
      }
      // Seed queue with left and right border pixels
      for (let y = 1; y < targetH; y++) {
        const leftIdx = y * targetW;
        queue[tail++] = leftIdx;
        visited[leftIdx] = 1;

        const rightIdx = y * targetW + (targetW - 1);
        queue[tail++] = rightIdx;
        visited[rightIdx] = 1;
      }

      // Dynamic Euclidean color distance threshold
      // Mapping tolerance (10..90) -> distance threshold (~35..150)
      const distThreshold = 30 + (tolerance / 100) * 110;
      const whiteBrightnessThresh = 238 - (tolerance / 100) * 40; // e.g. 222 at tol 40

      while (head < tail) {
        const pIdx = queue[head++];
        const px = pIdx % targetW;
        const py = (pIdx / targetW) | 0;
        const dataIdx = pIdx * 4;

        const r = data[dataIdx];
        const g = data[dataIdx + 1];
        const b = data[dataIdx + 2];

        // Euclidean color distance from sampled background
        const dr = r - bgR;
        const dg = g - bgG;
        const db = b - bgB;
        // Weighted perceptual Euclidean distance
        const dist = Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);

        let matchesBackground = dist <= distThreshold;

        // If background is white or light studio, also classify bright/desaturated pixels as background
        if (isWhiteOrLight) {
          const brightness = (r + g + b) / 3;
          const maxChannel = Math.max(r, g, b);
          const minChannel = Math.min(r, g, b);
          const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;

          if (brightness >= whiteBrightnessThresh && saturation < 0.22) {
            matchesBackground = true;
          }
        }

        if (matchesBackground) {
          isBg[pIdx] = 1;

          // 4-way neighbors
          if (px > 0) {
            const left = pIdx - 1;
            if (visited[left] === 0) {
              visited[left] = 1;
              queue[tail++] = left;
            }
          }
          if (px < targetW - 1) {
            const right = pIdx + 1;
            if (visited[right] === 0) {
              visited[right] = 1;
              queue[tail++] = right;
            }
          }
          if (py > 0) {
            const up = pIdx - targetW;
            if (visited[up] === 0) {
              visited[up] = 1;
              queue[tail++] = up;
            }
          }
          if (py < targetH - 1) {
            const down = pIdx + targetW;
            if (visited[down] === 0) {
              visited[down] = 1;
              queue[tail++] = down;
            }
          }
        }
      }

      // 4. Alpha Masking & Anti-Aliased Edge Feathering
      for (let pIdx = 0; pIdx < totalPixels; pIdx++) {
        const dataIdx = pIdx * 4;

        if (isBg[pIdx] === 1) {
          data[dataIdx + 3] = 0; // Transparent
        } else if (shouldFeather) {
          const px = pIdx % targetW;
          const py = (pIdx / targetW) | 0;

          // Count how many cardinal neighbors are background
          let bgNeighbors = 0;
          if (px > 0 && isBg[pIdx - 1] === 1) bgNeighbors++;
          if (px < targetW - 1 && isBg[pIdx + 1] === 1) bgNeighbors++;
          if (py > 0 && isBg[pIdx - targetW] === 1) bgNeighbors++;
          if (py < targetH - 1 && isBg[pIdx + targetW] === 1) bgNeighbors++;

          if (bgNeighbors > 0) {
            // Soft border transition
            const alphaFactor = Math.max(0.25, 1 - bgNeighbors * 0.22);
            data[dataIdx + 3] = Math.round(data[dataIdx + 3] * alphaFactor);

            // Defringe white border haloing if background was light
            if (shouldDefringe && isWhiteOrLight) {
              data[dataIdx] = Math.round(data[dataIdx] * 0.88);
              data[dataIdx + 1] = Math.round(data[dataIdx + 1] * 0.88);
              data[dataIdx + 2] = Math.round(data[dataIdx + 2] * 0.88);
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}
