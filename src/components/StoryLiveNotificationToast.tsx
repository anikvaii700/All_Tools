import React, { useState, useEffect } from 'react';
import { Sparkles, X, BookOpen, ChevronRight, Award } from 'lucide-react';
import {
  storySubmissionService,
  StoryNotification,
} from '../services/storySubmissionService';

interface StoryLiveNotificationToastProps {
  onOpenStory?: (storyId: string, isIslamic: boolean) => void;
}

export const StoryLiveNotificationToast: React.FC<StoryLiveNotificationToastProps> = ({
  onOpenStory,
}) => {
  const [activeNotification, setActiveNotification] = useState<StoryNotification | null>(null);

  useEffect(() => {
    // Listen to custom window events for immediate cross-tab / cross-component notification
    const handleEvent = (e: any) => {
      const notif = e.detail as StoryNotification;
      if (notif) {
        setActiveNotification(notif);
      }
    };

    window.addEventListener('story_approved_notification', handleEvent);

    // Also check unread notifications from storage
    const list = storySubmissionService.getNotifications();
    const unread = list.find((n) => !n.read);
    if (unread && Date.now() - unread.approvedAt < 60000 * 30) {
      // If approved in the last 30 minutes and unread
      setActiveNotification(unread);
    }

    return () => {
      window.removeEventListener('story_approved_notification', handleEvent);
    };
  }, []);

  // Auto-hide after 12 seconds
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, 12000);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  const handleDismiss = () => {
    if (activeNotification) {
      storySubmissionService.markNotificationAsRead(activeNotification.id);
    }
    setActiveNotification(null);
  };

  const handleRead = () => {
    if (activeNotification && onOpenStory) {
      onOpenStory(activeNotification.storyId, activeNotification.storyType === 'islamic');
    }
    handleDismiss();
  };

  if (!activeNotification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-amber-400/80 flex items-start justify-between gap-3 relative overflow-hidden">
        {/* Shimmer sweep effect */}
        <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-sweep pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
            {activeNotification.storyType === 'islamic' ? (
              <span className="text-xl">📿</span>
            ) : (
              <Sparkles className="w-5 h-5 text-amber-200" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                🎉 নতুন গল্প লাইভ হয়েছে
              </span>
              <span className="text-[10px] text-slate-400">এখনই প্রকাশিত</span>
            </div>

            <h4 className="text-sm font-black text-white leading-tight">
              {activeNotification.title}
            </h4>

            <p className="text-[11px] text-slate-300 font-medium">
              লেখক: <span className="text-amber-300 font-bold">{activeNotification.author}</span> • যাচাইকৃত ও প্রকাশিত
            </p>

            <button
              onClick={handleRead}
              className="mt-2 text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer transition underline underline-offset-2"
            >
              <span>গল্পটি পড়ুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
