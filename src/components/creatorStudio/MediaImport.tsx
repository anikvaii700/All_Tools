import React, { useState } from 'react';
import {
  FolderOpen,
  Upload,
  Video,
  Music,
  Image as ImageIcon,
  Trash2,
  Play,
  Film,
  Info,
  AlertTriangle,
  Link2,
  Check,
} from 'lucide-react';
import { MediaAsset } from '../../types/creatorStudio';
import { CreatorStorage } from '../../services/creatorStorage';

interface MediaImportProps {
  onShowToast?: (msg: string, icon?: string) => void;
  onSendToVideoEditor?: (asset: MediaAsset) => void;
}

export const MediaImport: React.FC<MediaImportProps> = ({
  onShowToast,
  onSendToVideoEditor,
}) => {
  const [mediaList, setMediaList] = useState<MediaAsset[]>(() => CreatorStorage.getMediaAssets());
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // URL Import state
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'video' | 'audio' | 'image'>('video');
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const newAsset: MediaAsset = {
      id: `media-${Date.now()}`,
      name: file.name,
      type,
      sizeBytes: file.size,
      dataUrl: objectUrl,
      createdAt: new Date().toISOString(),
    };

    CreatorStorage.saveMediaAsset(newAsset);
    setMediaList(CreatorStorage.getMediaAssets());
    setSelectedAsset(newAsset);

    if (onShowToast) {
      onShowToast(`"${file.name}" সফলভাবে ইমপোর্ট হয়েছে!`, '📁');
    }
  };

  const handleUrlImport = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);

    const trimmed = urlInput.trim();
    if (!trimmed) return;

    // Honest CORS / Platform restriction check
    if (
      trimmed.includes('youtube.com') ||
      trimmed.includes('youtu.be') ||
      trimmed.includes('facebook.com') ||
      trimmed.includes('instagram.com') ||
      trimmed.includes('tiktok.com')
    ) {
      setUrlError(
        'ইউটিউব, ফেসবুক ও ইনস্টাগ্রামের অফিসিয়াল নীতি, DRM ও ব্রাউজারের CORS বিধিনিষেধের কারণে সরাসরি থার্ড-পার্টি ভিডিও লিঙ্ক ডাউনলোড করা সম্ভব নয়। অনুগ্রহ করে আপনার নিজস্ব বা অনুমোদিত ভিডিও ফাইলটি সরাসরি আপনার ডিভাইস থেকে আপলোড করুন।'
      );
      return;
    }

    // Direct audio/video/image URL
    const newAsset: MediaAsset = {
      id: `media-url-${Date.now()}`,
      name: trimmed.split('/').pop() || `অনলাইন মিডিয়া (${urlType})`,
      type: urlType,
      sizeBytes: 0,
      dataUrl: trimmed,
      createdAt: new Date().toISOString(),
    };

    CreatorStorage.saveMediaAsset(newAsset);
    setMediaList(CreatorStorage.getMediaAssets());
    setSelectedAsset(newAsset);
    setUrlInput('');

    if (onShowToast) {
      onShowToast('অনুমোদিত মিডিয়া লিঙ্ক সফলভাবে যুক্ত হয়েছে!', '🔗');
    }
  };

  const handleDelete = (id: string) => {
    CreatorStorage.deleteMediaAsset(id);
    setMediaList(CreatorStorage.getMediaAssets());
    if (selectedAsset?.id === id) {
      setSelectedAsset(null);
    }
    if (onShowToast) {
      onShowToast('মিডিয়া ফাইল তালিকা থেকে সরানো হয়েছে', '🗑️');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'অনলাইন স্ট্রিম';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              মিডিয়া ইমপোর্ট ও অ্যাসেট লাইব্রেরি 📁
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ভিডিও ক্লিপ, ভয়েসওভার অডিও ও ব্যাকগ্রাউন্ড মিউজিক ইমপোর্ট করুন এবং ব্রাউজার এডিটরে ব্যবহার করুন
            </p>
          </div>
        </div>

        {/* Ethical Media & Legal Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">নীতিমালা ও কপিরাইট স্পষ্টীকরণ:</span> কপিরাইট আইন ও ব্রাউজারের নিরাপত্তা নীতি মেনে শুধুমাত্র আপনার ডিভাইস থেকে নিজস্ব মিডিয়া বা পাবলিক-ডোমেইন রিসোর্স ব্যবহারের পরামর্শ দেওয়া হচ্ছে। কোনো সোশ্যাল মিডিয়া প্ল্যাটফর্মের সংরক্ষিত কন্টেন্ট অবৈধভাবে স্ক্র্যাপ করা হয় না।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Local Upload Cards */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>ডিভাইস থেকে লোকাল ফাইল আপলোড</span>
              <span className="text-[11px] text-slate-400">ব্যক্তিগত মিডিয়া</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <label className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition flex flex-col items-center justify-center text-center gap-2 cursor-pointer group">
                <Video className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-slate-800">ভিডিও ক্লিপ</span>
                <span className="text-[10px] text-slate-400">MP4, WebM</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'video')}
                  className="hidden"
                />
              </label>

              <label className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition flex flex-col items-center justify-center text-center gap-2 cursor-pointer group">
                <Music className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-slate-800">অডিও / মিউজিক</span>
                <span className="text-[10px] text-slate-400">MP3, WAV</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, 'audio')}
                  className="hidden"
                />
              </label>

              <label className="p-4 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 transition flex flex-col items-center justify-center text-center gap-2 cursor-pointer group">
                <ImageIcon className="w-6 h-6 text-rose-600 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-slate-800">ছবি / স্লাইড</span>
                <span className="text-[10px] text-slate-400">PNG, JPG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Direct Authorized Media URL Import */}
          <form
            onSubmit={handleUrlImport}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3"
          >
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>অনুমোদিত পাবলিক মিডিয়া লিঙ্ক (CORS Supported)</span>
              <span className="text-[11px] text-slate-400">URL Import</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মিডিয়া টাইপ
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'video', label: 'ভিডিও URL' },
                  { id: 'audio', label: 'অডিও URL' },
                  { id: 'image', label: 'ইমেজ URL' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setUrlType(tab.id as any)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition border ${
                      urlType === tab.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সরাসরি ফাইল লিংক (Direct File URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://example.com/sample-video.mp4"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-hidden pr-8"
                />
                <Link2 className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            {urlError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed">
                {urlError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              লিঙ্ক ইমপোর্ট করুন
            </button>
          </form>
        </div>

        {/* Media Assets List & Active Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">
                ইমপোর্টকৃত মিডিয়া লাইব্রেরি ({mediaList.length}টি ফাইল)
              </span>
              <span className="text-xs text-slate-400">ব্রাউজার মেমোরিতে সক্রিয়</span>
            </div>

            {/* Selected File Live Player */}
            {selectedAsset && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold truncate max-w-[70%]">{selectedAsset.name}</span>
                  <span className="text-slate-400">{formatFileSize(selectedAsset.sizeBytes)}</span>
                </div>

                <div className="w-full max-h-72 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  {selectedAsset.type === 'video' && selectedAsset.dataUrl && (
                    <video
                      src={selectedAsset.dataUrl}
                      controls
                      className="max-h-64 w-auto max-w-full"
                    />
                  )}
                  {selectedAsset.type === 'audio' && selectedAsset.dataUrl && (
                    <div className="py-6 px-4 w-full">
                      <audio src={selectedAsset.dataUrl} controls className="w-full" />
                    </div>
                  )}
                  {selectedAsset.type === 'image' && selectedAsset.dataUrl && (
                    <img
                      src={selectedAsset.dataUrl}
                      alt={selectedAsset.name}
                      className="max-h-64 object-contain"
                    />
                  )}
                </div>

                {onSendToVideoEditor && (
                  <button
                    type="button"
                    onClick={() => onSendToVideoEditor(selectedAsset)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>ভিডিও এডিটরে ক্লিপটি যোগ করুন</span>
                  </button>
                )}
              </div>
            )}

            {/* Media Items Grid */}
            <div className="space-y-2">
              {mediaList.map((item) => {
                const isSelected = selectedAsset?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAsset(item)}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        {item.type === 'video' && <Video className="w-4 h-4 text-emerald-600" />}
                        {item.type === 'audio' && <Music className="w-4 h-4 text-indigo-600" />}
                        {item.type === 'image' && <ImageIcon className="w-4 h-4 text-rose-500" />}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatFileSize(item.sizeBytes)} • {item.type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {mediaList.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  কোনো মিডিয়া ফাইল ইমপোর্ট করা হয়নি। ডিভাইস থেকে ভিডিও, অডিও বা ছবি আপলোড করুন।
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
