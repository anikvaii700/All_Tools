import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { adminUserService } from '../services/adminUserService';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  balance: number; // মূল ব্যালেন্স (টাকা / BDT)
  coins: number; // কয়েন ব্যালেন্স
  totalEarnedCoins: number;
  lastSpinDate: string | null;
  authProvider: 'google' | 'phone' | 'email' | 'guest';
  status?: 'active' | 'suspended' | 'banned';
  banReason?: string;
  suspendedUntil?: string | null;
  role?: 'admin' | 'user';
}

export interface CoinTransaction {
  id: string;
  amount: number;
  unit?: 'bdt' | 'coins';
  type: string;
  description: string;
  date: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginOrRegisterWithPhone: (phoneNumber: string, pin: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deductMainBalance: (amount: number, reason: string) => Promise<boolean>;
  addMainBalance: (amount: number, method: string, trxId?: string) => Promise<boolean>;
  convertCoinsToMainBalance: (coinAmount: number) => Promise<{ success: boolean; bdtAdded: number; message: string }>;
  awardCoins: (amount: number, reason: string) => Promise<boolean>;
  recordDailySpin: (coinsWon: number) => Promise<boolean>;
  canSpinToday: () => boolean;
  transactions: CoinTransaction[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'mosafa_user_session';
const LOCAL_STORAGE_SPIN_KEY = 'mosafa_guest_spin_date';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [guestSpinDate, setGuestSpinDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_SPIN_KEY);
    } catch {
      return null;
    }
  });

  // Initialize from LocalStorage for immediate UI responsiveness
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.uid) {
          setUser(parsed);
        }
      }
    } catch {
      // LocalStorage parsing fallback
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        try {
          const snap = await getDoc(userRef);
          const isPasswordUser = fbUser.providerData?.some((p) => p.providerId === 'password');
          const detectedProvider: 'google' | 'email' = isPasswordUser ? 'email' : 'google';

          if (snap.exists()) {
            const data = snap.data();
            const profile: UserProfile = {
              uid: fbUser.uid,
              displayName: data.displayName || fbUser.displayName || 'ব্যবহারকারী',
              email: fbUser.email || data.email || null,
              phoneNumber: fbUser.phoneNumber || data.phoneNumber || null,
              photoURL: fbUser.photoURL || data.photoURL || null,
              balance: typeof data.balance === 'number' ? data.balance : 0,
              coins: typeof data.coins === 'number' ? data.coins : 50,
              totalEarnedCoins: typeof data.totalEarnedCoins === 'number' ? data.totalEarnedCoins : 50,
              lastSpinDate: data.lastSpinDate || null,
              authProvider: data.authProvider || detectedProvider,
              status: data.status || 'active',
              banReason: data.banReason || undefined,
              suspendedUntil: data.suspendedUntil || null,
            };
            setUser(profile);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
            adminUserService.syncCurrentUser(profile as any);
          } else {
            // New user: give initial 50 points welcome bonus as requested
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'ব্যবহারকারী',
              email: fbUser.email || null,
              phoneNumber: fbUser.phoneNumber || null,
              photoURL: fbUser.photoURL || null,
              balance: 0,
              coins: 50,
              totalEarnedCoins: 50,
              lastSpinDate: null,
              authProvider: detectedProvider,
              status: 'active',
            };
            await setDoc(userRef, {
              userId: fbUser.uid,
              displayName: newProfile.displayName,
              email: newProfile.email || '',
              phoneNumber: newProfile.phoneNumber || '',
              photoURL: newProfile.photoURL || '',
              balance: 0,
              coins: newProfile.coins,
              totalEarnedCoins: newProfile.totalEarnedCoins,
              lastSpinDate: '',
              authProvider: detectedProvider,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setUser(newProfile);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
            adminUserService.syncCurrentUser(newProfile as any);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
          // Fallback to local profile
          const fallbackProfile: UserProfile = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || 'ব্যবহারকারী',
            email: fbUser.email || null,
            phoneNumber: fbUser.phoneNumber || null,
            photoURL: fbUser.photoURL || null,
            balance: user?.balance || 0,
            coins: user?.coins || 50,
            totalEarnedCoins: user?.totalEarnedCoins || 50,
            lastSpinDate: user?.lastSpinDate || null,
            authProvider: 'google',
            status: 'active',
          };
          setUser(fallbackProfile);
          adminUserService.syncCurrentUser(fallbackProfile);
        }

        // Realtime listener for user doc updates
        const unsubDoc = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const d = docSnap.data();
              let nextUpdatedUser: UserProfile | null = null;
              setUser((prev) => {
                if (!prev) return null;
                const updated: UserProfile = {
                  ...prev,
                  balance: typeof d.balance === 'number' ? d.balance : (prev.balance || 0),
                  coins: typeof d.coins === 'number' ? d.coins : prev.coins,
                  totalEarnedCoins: typeof d.totalEarnedCoins === 'number' ? d.totalEarnedCoins : prev.totalEarnedCoins,
                  lastSpinDate: d.lastSpinDate || prev.lastSpinDate,
                  displayName: d.displayName || prev.displayName,
                  status: d.status || prev.status || 'active',
                  banReason: d.banReason || prev.banReason,
                  suspendedUntil: d.suspendedUntil || prev.suspendedUntil,
                };
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
                nextUpdatedUser = updated;
                return updated;
              });

              if (nextUpdatedUser) {
                const userToSync = nextUpdatedUser;
                queueMicrotask(() => {
                  try {
                    adminUserService.syncCurrentUser(userToSync);
                  } catch (e) {
                    console.warn('Sync updated user notice:', e);
                  }
                });
              }
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
          }
        );

        setIsLoading(false);
        return () => unsubDoc();
      } else {
        // Not a Firebase user: check if phone user exists in local state
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.authProvider === 'phone') {
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          } catch {}
        }
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Handle Google redirect result if page was reloaded after redirect login
  useEffect(() => {
    getRedirectResult(auth)
      .then((cred) => {
        if (cred?.user) {
          console.log('Google redirect sign-in success:', cred.user.email);
        }
      })
      .catch((err) => {
        if (err && err.code !== 'auth/null-user') {
          console.warn('Google redirect notice:', err?.code, err?.message);
        }
      });
  }, []);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in info:', err?.code, err?.message || err);
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirErr) {
          throw redirErr;
        }
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.warn('Email login error:', err?.message || err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setIsLoading(true);
      const cleanEmail = email.trim();
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const cleanName = displayName?.trim() || cleanEmail.split('@')[0] || 'ব্যবহারকারী';

      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (e) {
        console.warn('Could not update display name:', e);
      }

      // Initialize user document with 50 coins welcome bonus
      const userRef = doc(db, 'users', cred.user.uid);
      const initialProfile: UserProfile = {
        uid: cred.user.uid,
        displayName: cleanName,
        email: cleanEmail,
        phoneNumber: null,
        photoURL: null,
        balance: 0,
        coins: 50,
        totalEarnedCoins: 50,
        lastSpinDate: null,
        authProvider: 'email',
        status: 'active',
      };

      try {
        await setDoc(userRef, {
          userId: cred.user.uid,
          displayName: cleanName,
          email: cleanEmail,
          phoneNumber: '',
          photoURL: '',
          balance: 0,
          coins: 50,
          totalEarnedCoins: 50,
          lastSpinDate: '',
          authProvider: 'email',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Register Firestore write note:', err);
      }

      setUser(initialProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(initialProfile));
      adminUserService.syncCurrentUser(initialProfile as any);
    } catch (err: any) {
      console.warn('Email registration error:', err?.message || err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      console.warn('Password reset error:', err?.message || err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile number registration/login
  const loginOrRegisterWithPhone = async (
    phoneNumber: string,
    pin: string,
    name?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
      if (cleanPhone.length < 11 || pin.length < 4) {
        throw new Error('মোবাইল নাম্বার ও ৪ ডিজিটের পিন সঠিক নয়');
      }

      const phoneUid = `phone_${cleanPhone.replace('+', '')}`;
      const userRef = doc(db, 'users', phoneUid);

      let currentBalance = 0;
      let currentCoins = 50;
      let totalCoins = 50;
      let displayName = name || `ইউজার ${cleanPhone.slice(-4)}`;
      let lastSpinDate: string | null = null;
      let status: 'active' | 'suspended' | 'banned' = 'active';
      let banReason: string | undefined = undefined;
      let suspendedUntil: string | null = null;

      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          currentBalance = typeof data.balance === 'number' ? data.balance : 0;
          currentCoins = data.coins ?? 50;
          totalCoins = data.totalEarnedCoins ?? 50;
          displayName = data.displayName || displayName;
          lastSpinDate = data.lastSpinDate || null;
          status = data.status || 'active';
          banReason = data.banReason;
          suspendedUntil = data.suspendedUntil || null;
        } else {
          // New phone user: 50 points signup bonus
          await setDoc(userRef, {
            userId: phoneUid,
            displayName,
            email: '',
            phoneNumber: cleanPhone,
            photoURL: '',
            balance: 0,
            coins: 50,
            totalEarnedCoins: 50,
            lastSpinDate: '',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        // Fallback to local storage if firestore rules prevent unauthenticated direct write
        console.warn('Phone profile local mode:', e);
      }

      const phoneProfile: UserProfile = {
        uid: phoneUid,
        displayName,
        email: null,
        phoneNumber: cleanPhone,
        photoURL: null,
        balance: currentBalance,
        coins: currentCoins,
        totalEarnedCoins: totalCoins,
        lastSpinDate,
        authProvider: 'phone',
        status,
        banReason,
        suspendedUntil,
      };

      setUser(phoneProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(phoneProfile));
      adminUserService.syncCurrentUser(phoneProfile);
      return true;
    } catch (err) {
      console.error('Phone login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setUser(null);
    } catch (err) {
      console.warn('Logout error:', err);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      setUser(null);
    }
  };

  // 1. Deduct from Main Cash Balance (টাকা / BDT) - e.g. 5 BDT for PDF Download
  const deductMainBalance = async (amount: number, reason: string): Promise<boolean> => {
    if (!user) return false;
    const currentBalance = Number(user.balance || 0);
    if (currentBalance < amount) {
      return false;
    }
    const newBalance = Math.max(0, currentBalance - amount);
    const updatedUser: UserProfile = {
      ...user,
      balance: newBalance,
    };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    adminUserService.syncCurrentUser(updatedUser);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      });

      const txRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(txRef, {
        transactionId: `tx_deduct_${Date.now()}`,
        userId: user.uid,
        amount: -amount,
        unit: 'bdt',
        type: 'balance_deduct',
        description: reason,
        date: getTodayDateString(),
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('deductMainBalance Firestore sync note:', err);
    }

    const newTx: CoinTransaction = {
      id: `tx_deduct_${Date.now()}`,
      amount: -amount,
      unit: 'bdt',
      type: 'balance_deduct',
      description: reason,
      date: getTodayDateString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  // 2. Add Main Cash Balance (টাকা / BDT) - Minimum 50 BDT requirement
  const addMainBalance = async (amount: number, method: string, trxId?: string): Promise<boolean> => {
    if (!user) return false;
    if (amount < 50) {
      throw new Error('মিনিমাম ৫০ টাকা এড মানি করতে পারবেন');
    }
    const currentBalance = Number(user.balance || 0);
    const newBalance = currentBalance + amount;
    const updatedUser: UserProfile = {
      ...user,
      balance: newBalance,
    };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    adminUserService.syncCurrentUser(updatedUser);

    const desc = `ব্যালেন্স এড মানি (+৳${amount} টাকা) [${method}${trxId ? `, TrxID: ${trxId}` : ''}]`;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      });

      const txRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(txRef, {
        transactionId: `tx_add_${Date.now()}`,
        userId: user.uid,
        amount,
        unit: 'bdt',
        type: 'add_money',
        description: desc,
        date: getTodayDateString(),
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('addMainBalance Firestore sync note:', err);
    }

    const newTx: CoinTransaction = {
      id: `tx_add_${Date.now()}`,
      amount,
      unit: 'bdt',
      type: 'add_money',
      description: desc,
      date: getTodayDateString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  // 3. Convert Coin Balance into Main Balance (100 coins = 1 BDT)
  const convertCoinsToMainBalance = async (
    coinAmount: number
  ): Promise<{ success: boolean; bdtAdded: number; message: string }> => {
    if (!user) {
      return { success: false, bdtAdded: 0, message: 'লগইন আবশ্যক' };
    }
    const currentCoins = Number(user.coins || 0);
    if (coinAmount < 100) {
      return { success: false, bdtAdded: 0, message: 'কনভার্ট করার জন্য ন্যূনতম ১০০ কয়েন প্রয়োজন' };
    }
    if (currentCoins < coinAmount) {
      return { success: false, bdtAdded: 0, message: 'আপনার একাউন্টে পর্যাপ্ত কয়েন ব্যালেন্স নেই' };
    }

    const bdtAdded = Math.floor(coinAmount / 100);
    const actualCoinsDeducted = bdtAdded * 100;
    if (bdtAdded <= 0) {
      return { success: false, bdtAdded: 0, message: 'ন্যূনতম ১০০ কয়েন কনভার্ট করতে হবে' };
    }

    const newCoins = currentCoins - actualCoinsDeducted;
    const currentBalance = Number(user.balance || 0);
    const newBalance = currentBalance + bdtAdded;

    const updatedUser: UserProfile = {
      ...user,
      coins: newCoins,
      balance: newBalance,
    };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    adminUserService.syncCurrentUser(updatedUser);

    const desc = `কয়েন কনভার্ট: ${actualCoinsDeducted} কয়েন ➔ +৳${bdtAdded} টাকা মূল ব্যালেন্স`;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: newCoins,
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      });

      const txRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(txRef, {
        transactionId: `tx_conv_${Date.now()}`,
        userId: user.uid,
        amount: bdtAdded,
        unit: 'bdt',
        type: 'coin_conversion',
        description: desc,
        date: getTodayDateString(),
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('convertCoinsToMainBalance Firestore sync note:', err);
    }

    const newTx: CoinTransaction = {
      id: `tx_conv_${Date.now()}`,
      amount: bdtAdded,
      unit: 'bdt',
      type: 'coin_conversion',
      description: desc,
      date: getTodayDateString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    return {
      success: true,
      bdtAdded,
      message: `${actualCoinsDeducted} কয়েন সফলভাবে কনভার্ট করে আপনার মূল ব্যালেন্সে ৳${bdtAdded} টাকা যোগ হয়েছে!`,
    };
  };

  const awardCoins = async (amount: number, reason: string): Promise<boolean> => {
    if (!user) return false;
    const newCoins = (user.coins || 0) + amount;
    const newTotal = (user.totalEarnedCoins || 0) + amount;

    const updatedUser: UserProfile = {
      ...user,
      coins: newCoins,
      totalEarnedCoins: newTotal,
    };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));

    // Try persisting to Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: newCoins,
        totalEarnedCoins: newTotal,
        updatedAt: new Date().toISOString(),
      });

      // Add to transactions subcollection
      const txRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(txRef, {
        transactionId: `tx_${Date.now()}`,
        userId: user.uid,
        amount,
        type: 'daily_spin',
        description: reason,
        date: getTodayDateString(),
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Award coins Firestore sync note:', err);
    }

    // Add to local transactions
    const newTx: CoinTransaction = {
      id: `tx_${Date.now()}`,
      amount,
      type: 'daily_spin',
      description: reason,
      date: getTodayDateString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    return true;
  };

  const recordDailySpin = async (coinsWon: number): Promise<boolean> => {
    const today = getTodayDateString();
    if (!user) {
      // Record guest spin in localStorage and reactive state
      localStorage.setItem(LOCAL_STORAGE_SPIN_KEY, today);
      setGuestSpinDate(today);
      return true;
    }

    const newCoins = (user.coins || 0) + coinsWon;
    const newTotal = (user.totalEarnedCoins || 0) + coinsWon;
    const updatedUser: UserProfile = {
      ...user,
      coins: newCoins,
      totalEarnedCoins: newTotal,
      lastSpinDate: today,
    };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: newCoins,
        totalEarnedCoins: newTotal,
        lastSpinDate: today,
        updatedAt: new Date().toISOString(),
      });

      const txRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(txRef, {
        transactionId: `spin_${Date.now()}`,
        userId: user.uid,
        amount: coinsWon,
        type: 'daily_spin',
        description: `দৈনিক লাকি স্পিন থেকে জয়ী (${coinsWon} কয়েন)`,
        date: today,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Record spin firestore sync note:', err);
    }

    return true;
  };

  const canSpinToday = (): boolean => {
    const today = getTodayDateString();
    if (user) {
      if (user.status === 'banned' || user.status === 'suspended') {
        return false;
      }
      return user.lastSpinDate !== today;
    }
    return guestSpinDate !== today;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        loginOrRegisterWithPhone,
        logout,
        deductMainBalance,
        addMainBalance,
        convertCoinsToMainBalance,
        awardCoins,
        recordDailySpin,
        canSpinToday,
        transactions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
