import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  shopAuth,
  shopDb,
  buildShopSyntheticEmail,
  normalizeShopPhone,
  getShopIdToken,
  shopHandleFirestoreError,
  ShopOperationType,
} from './shopFirebase';
import { getShopCategoryConfig } from './shopCategoriesConfig';
import {
  ShopAssetId,
  ShopAssetsMap,
  ShopCategoryId,
  ShopLanguage,
  ShopProfile,
  ShopRegistrationDraft,
  VisitingCardMode,
} from './types';

export interface ShopBootstrapData {
  profile: ShopProfile | null;
  assets: ShopAssetsMap;
  collections: Record<string, any[]>;
}

interface ShopAuthContextValue {
  shopUser: User | null;
  shopProfile: ShopProfile | null;
  shopAssets: ShopAssetsMap;
  bootstrapCollections: Record<string, any[]>;
  isLoading: boolean;
  isRestoringSession: boolean;
  showSplash: boolean;
  dismissSplash: () => void;
  triggerSplashPreview: () => void;
  language: ShopLanguage;
  setLanguage: (lang: ShopLanguage) => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerShopAccount: (draft: ShopRegistrationDraft) => Promise<void>;
  logoutShop: () => Promise<void>;
  sendRecoveryEmail: (email: string) => Promise<void>;
  changeShopPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateShopProfile: (updates: Partial<ShopProfile>) => Promise<void>;
  switchShopCategory: (newCategory: ShopCategoryId) => Promise<void>;
  saveShopAsset: (
    assetId: ShopAssetId,
    assetType: 'logo' | 'visiting_card' | 'signature',
    mimeType: string,
    dataUrl: string,
    extraProfileUpdates?: Partial<ShopProfile>
  ) => Promise<void>;
  removeShopAsset: (
    assetId: ShopAssetId,
    extraProfileUpdates?: Partial<ShopProfile>
  ) => Promise<void>;
  refreshShopSession: () => Promise<void>;
}

const EMPTY_ASSETS: ShopAssetsMap = {
  logoDataUrl: '',
  visitingCardDataUrl: '',
  signatureDataUrl: '',
};

const ShopAuthContext = createContext<ShopAuthContextValue | null>(null);

function friendlyAuthError(err: any): string {
  const code = err?.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'মোবাইল নম্বর / ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে যাচাই করে আবার চেষ্টা করুন।';
  }
  if (code === 'auth/email-already-in-use') {
    return 'এই মোবাইল নম্বর বা ইমেইলে ইতিমধ্যেই একটি দোকান অ্যাকাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন অথবা অন্য নম্বর/ইমেইল ব্যবহার করুন।';
  }
  if (code === 'auth/weak-password') {
    return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
  }
  if (code === 'auth/too-many-requests') {
    return 'অতিরিক্ত প্রচেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
  }
  if (code === 'auth/network-request-failed') {
    return 'ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
  }
  return err?.message || 'অথেনটিকেশন সম্পন্ন করা যায়নি।';
}

function cacheKey(shopId: string, name: string): string {
  return `mosafa_shop_${shopId}_${name}`;
}

export const ShopAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shopUser, setShopUser] = useState<User | null>(null);
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);
  const [shopAssets, setShopAssets] = useState<ShopAssetsMap>(EMPTY_ASSETS);
  const [bootstrapCollections, setBootstrapCollections] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [language, setLanguageState] = useState<ShopLanguage>('bn');

  const fetchBackendBootstrap = useCallback(async (uid: string): Promise<ShopBootstrapData | null> => {
    const token = await getShopIdToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/shop/bootstrap', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json?.success) return null;
      const assetsRaw = json.assets || {};
      return {
        profile: json.profile || null,
        assets: {
          logoDataUrl: assetsRaw.branding_logo?.dataUrl || '',
          visitingCardDataUrl: assetsRaw.branding_card?.dataUrl || '',
          signatureDataUrl: assetsRaw.branding_sig?.dataUrl || '',
        },
        collections: json.collections || {},
      };
    } catch {
      return null;
    }
  }, []);

  const fetchFirestoreBootstrap = useCallback(async (uid: string): Promise<ShopBootstrapData | null> => {
    try {
      const shopRef = doc(shopDb, 'shops', uid);
      const snap = await getDoc(shopRef);
      if (!snap.exists()) return null;
      const profile = snap.data() as ShopProfile;

      let logoDataUrl = '';
      let visitingCardDataUrl = '';
      let signatureDataUrl = '';
      try {
        const assetSnaps = await getDocs(collection(shopDb, 'shops', uid, 'assets'));
        assetSnaps.forEach((docSnap) => {
          const d = docSnap.data();
          if (docSnap.id === 'branding_logo') logoDataUrl = d.dataUrl || '';
          if (docSnap.id === 'branding_card') visitingCardDataUrl = d.dataUrl || '';
          if (docSnap.id === 'branding_sig') signatureDataUrl = d.dataUrl || '';
        });
      } catch {
        // Optional asset fetch error ignored silently
      }

      return {
        profile,
        assets: { logoDataUrl, visitingCardDataUrl, signatureDataUrl },
        collections: {},
      };
    } catch (err) {
      shopHandleFirestoreError(err, ShopOperationType.GET, `shops/${uid}`);
      return null;
    }
  }, []);

  const hydrateShopForUser = useCallback(
    async (user: User, triggerSplash: boolean) => {
      const uid = user.uid;
      let loadedProfile: ShopProfile | null = null;
      let loadedAssets: ShopAssetsMap = EMPTY_ASSETS;
      let loadedCollections: Record<string, any[]> = {};

      // Check local shop-scoped cache first for instant paint
      try {
        const cachedProfileStr = localStorage.getItem(cacheKey(uid, 'profile'));
        const cachedAssetsStr = localStorage.getItem(cacheKey(uid, 'assets'));
        if (cachedProfileStr) loadedProfile = JSON.parse(cachedProfileStr);
        if (cachedAssetsStr) loadedAssets = { ...EMPTY_ASSETS, ...JSON.parse(cachedAssetsStr) };
      } catch {
        // ignore cache parse errors
      }

      // Fetch authoritative backend + Firestore data in parallel
      const [backendData, firestoreData] = await Promise.all([
        fetchBackendBootstrap(uid),
        fetchFirestoreBootstrap(uid),
      ]);

      if (backendData?.profile && firestoreData?.profile) {
        const backendTime = Date.parse(backendData.profile.updatedAt || '0') || 0;
        const fsTime = Date.parse(firestoreData.profile.updatedAt || '0') || 0;
        loadedProfile = fsTime > backendTime ? firestoreData.profile : backendData.profile;
        loadedAssets = {
          logoDataUrl: (fsTime > backendTime ? firestoreData.assets.logoDataUrl : backendData.assets.logoDataUrl) || backendData.assets.logoDataUrl || firestoreData.assets.logoDataUrl,
          visitingCardDataUrl: (fsTime > backendTime ? firestoreData.assets.visitingCardDataUrl : backendData.assets.visitingCardDataUrl) || backendData.assets.visitingCardDataUrl || firestoreData.assets.visitingCardDataUrl,
          signatureDataUrl: (fsTime > backendTime ? firestoreData.assets.signatureDataUrl : backendData.assets.signatureDataUrl) || backendData.assets.signatureDataUrl || firestoreData.assets.signatureDataUrl,
        };
      } else if (backendData?.profile) {
        loadedProfile = backendData.profile;
        loadedAssets = backendData.assets;
      } else if (firestoreData?.profile) {
        loadedProfile = firestoreData.profile;
        loadedAssets = firestoreData.assets;
      }

      if (backendData?.collections) {
        loadedCollections = backendData.collections;
      }

      if (loadedProfile) {
        setShopProfile(loadedProfile);
        setShopAssets(loadedAssets);
        setLanguageState(loadedProfile.language || 'bn');
        try {
          localStorage.setItem(cacheKey(uid, 'profile'), JSON.stringify(loadedProfile));
          localStorage.setItem(cacheKey(uid, 'assets'), JSON.stringify(loadedAssets));
        } catch {
          // ignore quota issues
        }
        if (triggerSplash) {
          setShowSplash(true);
        }
      } else {
        setShopProfile(null);
        setShopAssets(EMPTY_ASSETS);
      }
      setBootstrapCollections(loadedCollections);
    },
    [fetchBackendBootstrap, fetchFirestoreBootstrap]
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(shopAuth, async (user) => {
      setShopUser(user);
      if (!user) {
        setShopProfile(null);
        setShopAssets(EMPTY_ASSETS);
        setBootstrapCollections({});
        setShowSplash(false);
        setIsLoading(false);
        setIsRestoringSession(false);
        return;
      }

      await hydrateShopForUser(user, true);
      setIsLoading(false);
      setIsRestoringSession(false);
    });
    return () => unsub();
  }, [hydrateShopForUser]);

  const persistProfileEverywhere = useCallback(async (profile: ShopProfile) => {
    const token = await getShopIdToken();
    let backendSaved = false;
    if (token) {
      try {
        const res = await fetch('/api/shop/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.profile) {
            backendSaved = true;
          }
        }
      } catch {
        // continue to firestore
      }
    }

    let firestoreSaved = false;
    try {
      await setDoc(doc(shopDb, 'shops', profile.shopId), profile, { merge: true });
      firestoreSaved = true;
    } catch (err) {
      shopHandleFirestoreError(err, ShopOperationType.WRITE, `shops/${profile.shopId}`);
    }

    if (!backendSaved && !firestoreSaved) {
      throw new Error('প্রোফাইল ডাটাবেজে সংরক্ষণ করা যায়নি।');
    }

    try {
      localStorage.setItem(cacheKey(profile.shopId, 'profile'), JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, []);

  const persistAssetEverywhere = useCallback(
    async (
      shopId: string,
      assetId: ShopAssetId,
      assetType: 'logo' | 'visiting_card' | 'signature',
      mimeType: string,
      dataUrl: string
    ) => {
      const payload = {
        assetId,
        shopId,
        ownerUid: shopId,
        assetType,
        mimeType,
        dataUrl,
        updatedAt: new Date().toISOString(),
      };

      const token = await getShopIdToken();
      if (token) {
        await fetch(`/api/shop/assets/${assetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }

      try {
        await setDoc(doc(shopDb, 'shops', shopId, 'assets', assetId), payload);
      } catch (err) {
        shopHandleFirestoreError(err, ShopOperationType.WRITE, `shops/${shopId}/assets/${assetId}`);
      }
    },
    []
  );

  const loginWithPhone = async (phone: string, password: string) => {
    const cleanPhone = normalizeShopPhone(phone);
    if (cleanPhone.length < 10) {
      throw new Error('সঠিক মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)');
    }
    try {
      const cred = await signInWithEmailAndPassword(shopAuth, buildShopSyntheticEmail(cleanPhone), password);
      await hydrateShopForUser(cred.user, true);
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!email.trim().includes('@')) {
      throw new Error('বৈধ ইমেইল অ্যাড্রেস লিখুন');
    }
    try {
      const cred = await signInWithEmailAndPassword(shopAuth, email.trim().toLowerCase(), password);
      await hydrateShopForUser(cred.user, true);
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  };

  const registerShopAccount = async (draft: ShopRegistrationDraft) => {
    const cleanPhone = normalizeShopPhone(draft.phone);
    if (cleanPhone.length < 10) {
      throw new Error('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।');
    }
    if (draft.password.length < 6) {
      throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    }
    if (draft.password !== draft.confirmPassword) {
      throw new Error('পাসওয়ার্ড ও নিশ্চিত পাসওয়ার্ড মিলছে না।');
    }

    const authEmail =
      draft.authMethod === 'email'
        ? draft.loginEmail.trim().toLowerCase()
        : buildShopSyntheticEmail(cleanPhone);

    if (draft.authMethod === 'email' && !authEmail.includes('@')) {
      throw new Error('লগইনের জন্য একটি বৈধ ইমেইল অ্যাড্রেস দিন।');
    }

    let uid = '';
    try {
      const cred = await createUserWithEmailAndPassword(shopAuth, authEmail, draft.password);
      uid = cred.user.uid;
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }

    const catConfig = getShopCategoryConfig(draft.shopCategory);
    const now = new Date().toISOString();
    const hasLogo = Boolean(draft.logoDataUrl);
    const hasVisitingCard = Boolean(draft.visitingCardDataUrl);
    const visitingCardMode: VisitingCardMode = hasVisitingCard ? draft.visitingCardMode : 'none';

    const profile: ShopProfile = {
      shopId: uid,
      ownerUid: uid,
      shopCategory: draft.shopCategory,
      shopName: draft.shopName.trim(),
      tagline: draft.tagline.trim(),
      subtitle: draft.language === 'en' ? catConfig.nameEn : catConfig.nameBn,
      ownerName: draft.ownerName.trim(),
      phone: cleanPhone,
      email: (draft.email || (draft.authMethod === 'email' ? authEmail : '')).trim(),
      website: draft.website.trim(),
      address: draft.address.trim(),
      tradeLicense: draft.tradeLicense.trim(),
      binVatNumber: draft.binVatNumber.trim(),
      bkashNumber: draft.bkashNumber.trim(),
      nagadNumber: draft.nagadNumber.trim(),
      rocketNumber: '',
      bankName: '',
      bankAccountName: '',
      bankAccountNumber: '',
      brandColor: draft.brandColor || catConfig.accentColor,
      language: draft.language || 'bn',
      defaultTemplate: catConfig.defaultTemplate,
      defaultInvoiceFooter:
        draft.language === 'en'
          ? 'Thank you for your business! Goods once sold may follow store warranty policy.'
          : 'ধন্যবাদ! বিক্রিত পণ্য দোকানের ওয়ারেন্টি ও নীতিমালা অনুযায়ী প্রযোজ্য।',
      religiousHeader: 'বিসমিল্লাহির রাহমানির রাহিম',
      signatureTitle: 'স্বত্বাধিকারী / স্বাক্ষর',
      authType: draft.authMethod,
      loginIdentifier: draft.authMethod === 'email' ? authEmail : cleanPhone,
      hasLogo,
      hasVisitingCard,
      visitingCardMode,
      visitingCardTemplate: draft.visitingCardTemplate || 'modern-emerald',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await persistProfileEverywhere(profile);
      if (draft.logoDataUrl) {
        const mime = draft.logoDataUrl.startsWith('data:image/webp') ? 'image/webp' : 'image/png';
        await persistAssetEverywhere(uid, 'branding_logo', 'logo', mime, draft.logoDataUrl);
      }
      if (draft.visitingCardDataUrl) {
        const mime = draft.visitingCardDataUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';
        await persistAssetEverywhere(uid, 'branding_card', 'visiting_card', mime, draft.visitingCardDataUrl);
      }
    } catch (err) {
      console.error('Shop profile initialization error:', err);
      throw err;
    }

    const nextAssets: ShopAssetsMap = {
      logoDataUrl: draft.logoDataUrl || '',
      visitingCardDataUrl: draft.visitingCardDataUrl || '',
      signatureDataUrl: '',
    };
    setShopProfile(profile);
    setShopAssets(nextAssets);
    setLanguageState(profile.language);
    setBootstrapCollections({});
    try {
      localStorage.setItem(cacheKey(uid, 'profile'), JSON.stringify(profile));
      localStorage.setItem(cacheKey(uid, 'assets'), JSON.stringify(nextAssets));
    } catch {
      // ignore
    }
    setShowSplash(true);
  };

  const logoutShop = async () => {
    await signOut(shopAuth);
    setShopUser(null);
    setShopProfile(null);
    setShopAssets(EMPTY_ASSETS);
    setBootstrapCollections({});
    setShowSplash(false);
  };

  const sendRecoveryEmail = async (email: string) => {
    if (!email.trim().includes('@')) {
      throw new Error('পাসওয়ার্ড রিসেট লিংক পেতে রেজিস্টার্ড ইমেইল লিখুন।');
    }
    try {
      await sendPasswordResetEmail(shopAuth, email.trim().toLowerCase());
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  };

  const changeShopPassword = async (currentPassword: string, newPassword: string) => {
    if (!shopAuth.currentUser || !shopAuth.currentUser.email) {
      throw new Error('আগে লগইন করুন।');
    }
    if (newPassword.length < 6) {
      throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    }
    try {
      const credential = EmailAuthProvider.credential(shopAuth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(shopAuth.currentUser, credential);
      await updatePassword(shopAuth.currentUser, newPassword);
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  };

  const updateShopProfile = async (updates: Partial<ShopProfile>) => {
    if (!shopProfile) return;
    const merged: ShopProfile = {
      ...shopProfile,
      ...updates,
      shopId: shopProfile.shopId,
      ownerUid: shopProfile.ownerUid,
      createdAt: shopProfile.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await persistProfileEverywhere(merged);
    setShopProfile(merged);
    if (updates.language) {
      setLanguageState(updates.language);
    }
  };

  const switchShopCategory = async (newCategory: ShopCategoryId) => {
    if (!shopProfile) return;
    const nextCat = getShopCategoryConfig(newCategory);
    await updateShopProfile({
      shopCategory: newCategory,
      subtitle: language === 'en' ? nextCat.nameEn : nextCat.nameBn,
      defaultTemplate: nextCat.defaultTemplate,
      brandColor: shopProfile.brandColor || nextCat.accentColor,
    });
  };

  const saveShopAsset = async (
    assetId: ShopAssetId,
    assetType: 'logo' | 'visiting_card' | 'signature',
    mimeType: string,
    dataUrl: string,
    extraProfileUpdates?: Partial<ShopProfile>
  ) => {
    if (!shopProfile) return;
    await persistAssetEverywhere(shopProfile.shopId, assetId, assetType, mimeType, dataUrl);

    const nextAssets = { ...shopAssets };
    if (assetId === 'branding_logo') nextAssets.logoDataUrl = dataUrl;
    if (assetId === 'branding_card') nextAssets.visitingCardDataUrl = dataUrl;
    if (assetId === 'branding_sig') nextAssets.signatureDataUrl = dataUrl;
    setShopAssets(nextAssets);
    try {
      localStorage.setItem(cacheKey(shopProfile.shopId, 'assets'), JSON.stringify(nextAssets));
    } catch {
      // ignore
    }

    const profileUpdates: Partial<ShopProfile> = { ...extraProfileUpdates };
    if (assetId === 'branding_logo') profileUpdates.hasLogo = true;
    if (assetId === 'branding_card') profileUpdates.hasVisitingCard = true;
    await updateShopProfile(profileUpdates);
  };

  const removeShopAsset = async (
    assetId: ShopAssetId,
    extraProfileUpdates?: Partial<ShopProfile>
  ) => {
    if (!shopProfile) return;
    const token = await getShopIdToken();
    if (token) {
      await fetch(`/api/shop/assets/${assetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    try {
      await deleteDoc(doc(shopDb, 'shops', shopProfile.shopId, 'assets', assetId));
    } catch (err) {
      shopHandleFirestoreError(err, ShopOperationType.DELETE, `shops/${shopProfile.shopId}/assets/${assetId}`);
    }

    const nextAssets = { ...shopAssets };
    if (assetId === 'branding_logo') nextAssets.logoDataUrl = '';
    if (assetId === 'branding_card') nextAssets.visitingCardDataUrl = '';
    if (assetId === 'branding_sig') nextAssets.signatureDataUrl = '';
    setShopAssets(nextAssets);
    try {
      localStorage.setItem(cacheKey(shopProfile.shopId, 'assets'), JSON.stringify(nextAssets));
    } catch {
      // ignore
    }

    const profileUpdates: Partial<ShopProfile> = { ...extraProfileUpdates };
    if (assetId === 'branding_logo') profileUpdates.hasLogo = false;
    if (assetId === 'branding_card') {
      profileUpdates.hasVisitingCard = false;
      profileUpdates.visitingCardMode = 'none';
    }
    await updateShopProfile(profileUpdates);
  };

  const setLanguage = async (lang: ShopLanguage) => {
    setLanguageState(lang);
    if (shopProfile) {
      await updateShopProfile({ language: lang }).catch(() => {});
    }
  };

  const refreshShopSession = async () => {
    if (shopAuth.currentUser) {
      await hydrateShopForUser(shopAuth.currentUser, false);
    }
  };

  return (
    <ShopAuthContext.Provider
      value={{
        shopUser,
        shopProfile,
        shopAssets,
        bootstrapCollections,
        isLoading,
        isRestoringSession,
        showSplash,
        dismissSplash: () => setShowSplash(false),
        triggerSplashPreview: () => setShowSplash(true),
        language,
        setLanguage,
        loginWithPhone,
        loginWithEmail,
        registerShopAccount,
        logoutShop,
        sendRecoveryEmail,
        changeShopPassword,
        updateShopProfile,
        switchShopCategory,
        saveShopAsset,
        removeShopAsset,
        refreshShopSession,
      }}
    >
      {children}
    </ShopAuthContext.Provider>
  );
};

export function useShopAuth(): ShopAuthContextValue {
  const ctx = useContext(ShopAuthContext);
  if (!ctx) {
    throw new Error('useShopAuth must be used inside ShopAuthProvider');
  }
  return ctx;
}
