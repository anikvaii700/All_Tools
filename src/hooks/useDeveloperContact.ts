import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface DeveloperContactConfig {
  photoUrl: string;
  name: string;
  designation: string;
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  supportBadge: string;
  supportHeading: string;
  supportSubtitle: string;
  
  // Announcement / Notice Banner above Tools
  noticeEnabled: boolean;
  noticeTitle: string;
  noticeContent: string;
  noticeBadge: string;
  noticeVariant?: 'gradient' | 'info' | 'highlight' | 'custom';
  noticeBgColor?: string;
  noticeTextColor?: string;
  noticeTitleColor?: string;
  noticeBadgeBg?: string;
  noticeBadgeTextColor?: string;
  noticeBorderColor?: string;

  updatedAt?: string;
}

export const DEFAULT_DEVELOPER_CONFIG: DeveloperContactConfig = {
  photoUrl: '/developer_portrait.png',
  name: 'মোঃ আনিসুল ইসলাম',
  designation: 'ডাটা এন্ট্রি অপারেটর',
  phoneDisplay: '+8801868775577',
  whatsappNumber: '8801868775577',
  email: 'anikvaii700@gmail.com',
  supportBadge: 'সাপোর্ট ও ইনকোয়ারি',
  supportHeading: 'প্রফেশনাল সাপোর্ট নিন।',
  supportSubtitle:
    'আপনার যেকোনো তথ্য বিশদভাবে জানতে বা যেকোনো টেকনিক্যাল সহায়তার জন্য সরাসরি আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমাদের টিম ২৪/৭ আপনাকে সাহায্য করতে প্রস্তুত।',
  
  // Default Announcement Banner Settings
  noticeEnabled: true,
  noticeTitle: 'The MoSaFa Tools — গুরুত্বপূর্ণ নোটিশ ও তথ্যাবলি',
  noticeContent:
    'আমাদের সকল অনলাইন ডিজিটাল টুলস ১০০% ফ্রি, সুরক্ষিত ও মোবাইল ফ্রেন্ডলি। নিয়মিত নতুন টুলস ও আপডেটের জন্য পেজটি বুকমার্ক করে রাখুন অথবা সরাসরি অ্যাপ ইনস্টল করুন। যেকোনো জিজ্ঞাসা বা পরামর্শে সরাসরি যোগাযোগ করুন।',
  noticeBadge: 'জরুরি নোটিশ',
  noticeVariant: 'gradient',
  noticeBgColor: '#fff1f2',
  noticeTextColor: '#334155',
  noticeTitleColor: '#e11d48',
  noticeBadgeBg: '#f43f5e',
  noticeBadgeTextColor: '#ffffff',
  noticeBorderColor: '#fecdd3',
};

const LOCAL_STORAGE_KEY = 'mosafa_developer_contact_v3';

export function useDeveloperContact() {
  const [config, setConfig] = useState<DeveloperContactConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_DEVELOPER_CONFIG, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_DEVELOPER_CONFIG;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Clear any legacy persistent admin auth key on mount
  useEffect(() => {
    try {
      localStorage.removeItem('mosafa_admin_authed');
    } catch {
      // ignore
    }
  }, []);

  // Listen for real-time changes from Firestore
  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'developer_contact');
      const unsubscribe = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Partial<DeveloperContactConfig>;
            const merged = { ...DEFAULT_DEVELOPER_CONFIG, ...data };
            setConfig(merged);
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            } catch {
              // ignore
            }
          }
        },
        (error) => {
          console.warn('Firestore developer_contact listen error:', error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore subscription failed:', err);
    }
  }, []);

  const saveConfig = async (newConfig: Partial<DeveloperContactConfig>) => {
    setIsLoading(true);
    const updated: DeveloperContactConfig = {
      ...config,
      ...newConfig,
      updatedAt: new Date().toISOString(),
    };

    setConfig(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    try {
      const docRef = doc(db, 'settings', 'developer_contact');
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.error('Failed to save developer contact to Firestore:', err);
    } finally {
      setIsLoading(false);
    }
    return true;
  };

  const resetToDefault = async () => {
    return await saveConfig(DEFAULT_DEVELOPER_CONFIG);
  };

  const setAdminAuth = (authed: boolean) => {
    setIsAdminAuthenticated(authed);
    try {
      localStorage.removeItem('mosafa_admin_authed');
    } catch {
      // ignore
    }
  };

  return {
    config,
    saveConfig,
    resetToDefault,
    isLoading,
    isAdminAuthenticated,
    setAdminAuth,
  };
}
