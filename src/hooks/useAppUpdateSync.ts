import { useState, useEffect, useCallback, useRef } from 'react';
import { APP_VERSION_CONFIG, AppVersionConfig } from '../versionConfig';

export interface UseAppUpdateSyncReturn {
  isUpdateOn: boolean;
  isOnline: boolean;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  isChecking: boolean;
  lastCheckedAt: Date | null;
  serverInfo: AppVersionConfig | null;
  checkForUpdate: (isManual?: boolean) => Promise<{ updated: boolean; message: string }>;
  applyUpdateNow: () => void;
  dismissUpdateBanner: () => void;
  isBannerDismissed: boolean;
}

export function useAppUpdateSync(): UseAppUpdateSyncReturn {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [serverInfo, setServerInfo] = useState<AppVersionConfig | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  const checkingRef = useRef<boolean>(false);

  // Monitor Online/Offline state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // When user comes back online from offline, immediately query version
      checkForUpdate(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to custom SW new-version-available event
    const handleSwUpdate = () => {
      checkForUpdate(false);
    };
    window.addEventListener('mosafa:new-version-available', handleSwUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mosafa:new-version-available', handleSwUpdate);
    };
  }, []);

  // Main Version Check Function
  const checkForUpdate = useCallback(
    async (isManual = false): Promise<{ updated: boolean; message: string }> => {
      if (checkingRef.current) {
        return { updated: false, message: 'ইতিমধ্যে আপডেটের খোঁজ চলছে...' };
      }

      if (!navigator.onLine) {
        return {
          updated: false,
          message: 'আপনি অফলাইনে আছেন। ইন্টারনেট সংযোগ পেলে আপডেট পরীক্ষা করা হবে।',
        };
      }

      checkingRef.current = true;
      setIsChecking(true);

      try {
        const cacheBuster = `nocache=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        let remoteData: AppVersionConfig | null = null;

        // Try /api/system/version first, fallback to /version.json
        try {
          const apiRes = await fetch(`/api/system/version?${cacheBuster}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
          });
          if (apiRes.ok) {
            remoteData = await apiRes.json();
          }
        } catch {
          // Continue to fallback
        }

        if (!remoteData) {
          const jsonRes = await fetch(`/version.json?${cacheBuster}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
          });
          if (jsonRes.ok) {
            remoteData = await jsonRes.json();
          }
        }

        setLastCheckedAt(new Date());

        if (!remoteData) {
          if (isManual) {
            return {
              updated: false,
              message: 'সার্ভার থেকে আপডেটের তথ্য পাওয়া যায়নি। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।',
            };
          }
          return { updated: false, message: 'No remote data' };
        }

        setServerInfo(remoteData);

        // Operational Logic:
        // Updates are ONLY applied when remoteData.isUpdateOn === true
        if (remoteData.isUpdateOn) {
          const hasNewVersion =
            remoteData.version !== APP_VERSION_CONFIG.version ||
            remoteData.buildNumber > APP_VERSION_CONFIG.buildNumber;

          if (hasNewVersion) {
            setUpdateAvailable(true);
            setIsBannerDismissed(false);

            // Signal Service Worker to purge older caches and claim clients
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ type: 'PURGE_AND_UPDATE' });
            }

            return {
              updated: true,
              message: `নতুন সংস্করণ v${remoteData.version} পাওয়া গেছে! স্বয়ংক্রিয়ভাবে আপডেট হচ্ছে...`,
            };
          } else {
            setUpdateAvailable(false);
            return {
              updated: false,
              message: `আপনি ইতিমধ্যে সর্বশেষ সংস্করণ (v${APP_VERSION_CONFIG.version}) ব্যবহার করছেন। কোনো নতুন আপডেট নেই।`,
            };
          }
        } else {
          // Update is OFF - suppress updates, keep users stable
          setUpdateAvailable(false);
          return {
            updated: false,
            message: 'সাইট বর্তমানে স্ট্যাবল মোডে রয়েছে (Update OFF)। ব্যবহারকারীদের সেশন অপরিবর্তিত আছে।',
          };
        }
      } catch (err) {
        console.warn('[UpdateSync] Error checking version:', err);
        return {
          updated: false,
          message: 'আপডেট পরীক্ষার সময় সমস্যা হয়েছে।',
        };
      } finally {
        checkingRef.current = false;
        setIsChecking(false);
      }
    },
    []
  );

  // Apply update and reload
  const applyUpdateNow = useCallback(() => {
    try {
      // Clear legacy caches
      if ('caches' in window) {
        caches.keys().then((keys) => {
          Promise.all(keys.map((k) => caches.delete(k))).catch(() => {});
        });
      }
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch {
      // pass
    }

    // Force hard reload with timestamp query to bust browser cache
    const url = new URL(window.location.href);
    url.searchParams.set('_v', Date.now().toString());
    window.location.replace(url.toString());
  }, []);

  const dismissUpdateBanner = useCallback(() => {
    setIsBannerDismissed(true);
  }, []);

  // Periodic polling & visibility change
  useEffect(() => {
    // Initial check on mount
    const timer = setTimeout(() => {
      checkForUpdate(false);
    }, 2000);

    // Visibility change check
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodic check every 45 seconds when online
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        checkForUpdate(false);
      }
    }, 45000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [checkForUpdate]);

  return {
    isUpdateOn: APP_VERSION_CONFIG.isUpdateOn,
    isOnline,
    currentVersion: APP_VERSION_CONFIG.version,
    latestVersion: serverInfo ? serverInfo.version : APP_VERSION_CONFIG.version,
    updateAvailable,
    isChecking,
    lastCheckedAt,
    serverInfo,
    checkForUpdate,
    applyUpdateNow,
    dismissUpdateBanner,
    isBannerDismissed,
  };
}
