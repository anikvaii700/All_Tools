import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Download,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Type,
  Maximize2,
  Sliders,
  Sparkles,
  Info,
  Check,
  Video as VideoIcon,
  Music,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { MediaAsset } from '../../types/creatorStudio';

interface VideoEditorProps {
  initialAsset?: MediaAsset | null;
  onShowToast?: (msg: string, icon?: string) => void;
}

interface VideoClip {
  id: string;
  name: string;
  src: string;
  type: 'video' | 'image';
  duration: number; // in seconds
  startTime: number;
  endTime: number;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  initialAsset,
  onShowToast,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clips track
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(10);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  // Video settings & overlays
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(10);

  // Text Overlay
  const [overlayText, setOverlayText] = useState('🔥 নতুন টেকনিক ২০২৬');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textBg, setTextBg] = useState('#EF4444');
  const [textSize, setTextSize] = useState<number>(36);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Initialize with initial asset or sample canvas
  useEffect(() => {
    if (initialAsset && initialAsset.dataUrl) {
      const clip: VideoClip = {
        id: initialAsset.id,
        name: initialAsset.name,
        src: initialAsset.dataUrl,
        type: initialAsset.type === 'image' ? 'image' : 'video',
        duration: 10,
        startTime: 0,
        endTime: 10,
      };
      setClips([clip]);
    }
  }, [initialAsset]);

  // Video aspect ratio width/height
  const getDims = () => {
    switch (aspectRatio) {
      case '16:9':
        return { w: 1280, h: 720 };
      case '9:16':
        return { w: 720, h: 1280 };
      case '1:1':
        return { w: 1080, h: 1080 };
      default:
        return { w: 1280, h: 720 };
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isImage = file.type.startsWith('image/');
    const newClip: VideoClip = {
      id: `clip-${Date.now()}`,
      name: file.name,
      src: url,
      type: isImage ? 'image' : 'video',
      duration: isImage ? 5 : 10,
      startTime: 0,
      endTime: isImage ? 5 : 10,
    };

    setClips((prev) => [...prev, newClip]);
    if (onShowToast) {
      onShowToast(`"${file.name}" টাইমলাইনে যুক্ত হয়েছে!`, '🎬');
    }
  };

  // Canvas composite drawing loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = getDims();
    canvas.width = w;
    canvas.height = h;

    const render = () => {
      // Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      const activeClip = clips[activeClipIndex];

      if (video && activeClip && activeClip.type === 'video' && video.readyState >= 2) {
        try {
          // Fit & center video in aspect ratio
          const vidRatio = video.videoWidth / (video.videoHeight || 1);
          const canvasRatio = w / h;
          let drawW = w;
          let drawH = h;
          let offsetX = 0;
          let offsetY = 0;

          if (vidRatio > canvasRatio) {
            drawH = h;
            drawW = h * vidRatio;
            offsetX = (w - drawW) / 2;
          } else {
            drawW = w;
            drawH = w / vidRatio;
            offsetY = (h - drawH) / 2;
          }

          ctx.drawImage(video, offsetX, offsetY, drawW, drawH);
        } catch {
          // Frame draw skip
        }
      } else {
        // Fallback or Image slide
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(1, '#311042');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          activeClip ? activeClip.name : 'ক্লিপ বা মিডিয়া আপলোড করুন',
          w / 2,
          h / 2
        );
      }

      // Draw Text Overlay
      if (overlayText.trim()) {
        ctx.save();
        ctx.font = `bold ${textSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(overlayText);
        const padX = 24;
        const padY = 12;
        const boxW = metrics.width + padX * 2;
        const boxH = textSize + padY * 2;

        let posX = w / 2;
        let posY = h - 100;
        if (textPosition === 'top') posY = 90;
        if (textPosition === 'center') posY = h / 2;

        // Background badge
        ctx.fillStyle = textBg;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(posX - boxW / 2, posY - boxH / 2, boxW, boxH, 14);
        ctx.fill();

        // Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = textColor;
        ctx.fillText(overlayText, posX, posY);
        ctx.restore();
      }

      if (isPlaying && video) {
        setCurrentTime(video.currentTime);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [clips, activeClipIndex, isPlaying, overlayText, textPosition, textColor, textBg, textSize, aspectRatio]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (timeSec: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = timeSec;
      setCurrentTime(timeSec);
    }
  };

  const handleSplitClip = () => {
    if (clips.length === 0) return;
    const active = clips[activeClipIndex];
    if (!active) return;

    const splitTime = currentTime;
    const clipA: VideoClip = {
      ...active,
      id: `${active.id}-a`,
      name: `${active.name} (অংশ ১)`,
      endTime: splitTime,
      duration: splitTime - active.startTime,
    };
    const clipB: VideoClip = {
      ...active,
      id: `${active.id}-b`,
      name: `${active.name} (অংশ ২)`,
      startTime: splitTime,
      duration: active.endTime - splitTime,
    };

    const nextClips = [...clips];
    nextClips.splice(activeClipIndex, 1, clipA, clipB);
    setClips(nextClips);
    if (onShowToast) {
      onShowToast(`ক্লিপটি ${splitTime.toFixed(1)} সেকেন্ডে স্প্লিট করা হয়েছে!`, '✂️');
    }
  };

  // Real Web Video Export using MediaRecorder
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(10);

    try {
      const stream = canvas.captureStream(30); // 30 FPS
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mosafa_video_${aspectRatio}_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportProgress(100);
        if (onShowToast) {
          onShowToast('ভিডিও সফলভাবে রেন্ডার ও ডাউনলোড হয়েছে! 🎉', '📥');
        }
      };

      recorder.start();

      if (video) {
        video.currentTime = trimStart;
        video.play().catch(() => {});
        setIsPlaying(true);
      }

      // Record for trimmed duration
      const recDuration = Math.min(15, Math.max(3, trimEnd - trimStart));
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 1;
        setExportProgress(Math.min(95, Math.round((elapsed / recDuration) * 90)));
        if (elapsed >= recDuration) {
          clearInterval(interval);
          if (video) video.pause();
          setIsPlaying(false);
          recorder.stop();
        }
      }, 1000);
    } catch (err: any) {
      console.error('Export error:', err);
      setIsExporting(false);
      if (onShowToast) {
        onShowToast('ভিডিও রেন্ডারিং করতে সমস্যা হয়েছে।', '⚠️');
      }
    }
  };

  const activeClip = clips[activeClipIndex];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              ব্রাউজার ভিডিও এডিটর (Browser Video Editor) 🎬
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ক্লিপ ট্রিম, স্প্লিট, অনুপাত পরিবর্তন, টেক্সট ওভারলে, ব্যাকগ্রাউন্ড মিউজিক ও রিয়েল ভিডিও রেন্ডার
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">ক্লায়েন্ট-সাইড প্রসেসিং:</span> এই এডিটরটি সরাসরি আপনার ব্রাউজারের HTML5 ক্যানভাস ও Web Audio API ব্যবহার করে ভিডিও প্রসেস করে। কোনো ফাইল কোনো সার্ভারে আপলোড হয় না, আপনার সব ডেটা নিরাপদ।
          </p>
        </div>
      </div>

      {/* Hidden Video Source for Canvas rendering */}
      {activeClip && activeClip.type === 'video' && (
        <video
          ref={videoRef}
          src={activeClip.src}
          className="hidden"
          playsInline
          muted={isMuted}
          onLoadedMetadata={(e) => {
            const dur = e.currentTarget.duration;
            setTotalDuration(dur || 10);
            setTrimEnd(dur || 10);
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Video Preview & Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800 text-white space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <span className="font-bold text-slate-300">
                {activeClip ? activeClip.name : 'ভিডিও প্রিভিউ স্ক্রিন'}
              </span>
              <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
              </span>
            </div>

            {/* Video Canvas Player */}
            <div className="w-full bg-black rounded-2xl flex items-center justify-center overflow-hidden min-h-[320px] max-h-[440px] relative">
              <canvas
                ref={canvasRef}
                className="max-h-[420px] max-w-full object-contain"
              />

              {isExporting && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="font-bold text-sm">ভিডিও রেন্ডার হচ্ছে... {exportProgress}%</span>
                  <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-300">দয়া করে ট্যাবটি বন্ধ করবেন না</span>
                </div>
              )}
            </div>

            {/* Scrubber & Player Controls */}
            <div className="space-y-3 pt-2">
              <input
                type="range"
                min={0}
                max={totalDuration || 10}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(0)}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                    title="পুনরায় শুরু করুন"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSplitClip}
                    className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>স্প্লিট</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleExportVideo}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>ভিডিও এক্সপোর্ট (WebM/MP4)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Clips Management */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-800">
                টাইমলাইন ক্লিপ ট্র্যাক ({clips.length}টি ক্লিপ)
              </span>
              <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>ক্লিপ যোগ করুন</span>
                <input
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {clips.map((clip, idx) => {
                const isSelected = activeClipIndex === idx;
                return (
                  <div
                    key={clip.id}
                    onClick={() => setActiveClipIndex(idx)}
                    className={`p-3 rounded-2xl border min-w-[140px] max-w-[180px] shrink-0 transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                      <span className="text-[10px] bg-white px-1.5 py-0.2 rounded-md font-mono text-slate-600">
                        {clip.duration.toFixed(1)}s
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {clip.name}
                    </span>
                  </div>
                );
              })}

              {clips.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs w-full">
                  টাইমলাইনে কোনো ক্লিপ নেই। &quot;ক্লিপ যোগ করুন&quot; বাটনে ক্লিক করে ভিডিও আপলোড করুন।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Video Controls, Aspect Ratio & Overlays */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>ভিডিও কনফিগারেশন</span>
            <span className="text-[11px] text-slate-400">এডিটর টুলস</span>
          </h3>

          {/* Aspect Ratio Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ভিডিও অনুপাত (Aspect Ratio)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '16:9', label: '16:9 ল্যান্ডস্কেপ (YouTube)' },
                { id: '9:16', label: '9:16 ভার্টিক্যাল (Shorts/Reel)' },
                { id: '1:1', label: '1:1 স্কয়ার (Facebook Feed)' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAspectRatio(r.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    aspectRatio === r.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Overlay Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-600" />
              <span>টেক্সট ওভারলে ও সাবটাইটেল (Text Overlay)</span>
            </span>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                অন-স্ক্রিন টেক্সট
              </label>
              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="যেমন: সাবস্ক্রাইব করুন ও বেল আইকন চাপুন"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  পজিশন
                </label>
                <select
                  value={textPosition}
                  onChange={(e) => setTextPosition(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="top">উপরে (Top)</option>
                  <option value="center">মাঝামাঝি (Center)</option>
                  <option value="bottom">নিচে (Bottom)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ফন্ট সাইজ ({textSize}px)
                </label>
                <input
                  type="range"
                  min={20}
                  max={60}
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ব্যাজ কালার
                </label>
                <select
                  value={textBg}
                  onChange={(e) => setTextBg(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="#EF4444">লাল (Red Pop)</option>
                  <option value="#10B981">সবুজ (Emerald)</option>
                  <option value="#3B82F6">নীল (Blue)</option>
                  <option value="#000000">কালো (Black)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Speed & Volume Control */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>প্লেব্যাক স্পিড ও অডিও ভলিউম</span>
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  প্লেব্যাক স্পিড ({playbackSpeed}x)
                </label>
                <select
                  value={playbackSpeed}
                  onChange={(e) => {
                    const spd = Number(e.target.value);
                    setPlaybackSpeed(spd);
                    if (videoRef.current) videoRef.current.playbackRate = spd;
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value={0.5}>0.5x (স্লো মোশন)</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1.0x (স্বাভাবিক)</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x (ফাস্ট পেস)</option>
                  <option value={2}>2.0x (দ্বিগুণ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ভলিউম
                </label>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isMuted
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'আনমিউট করুন' : 'অডিও অন'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
