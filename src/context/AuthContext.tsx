import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
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

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  coins: number;
  totalEarnedCoins: number;
  lastSpinDate: string | null;
  authProvider: 'google' | 'phone' | 'guest';
}

export interface CoinTransaction {
  id: string;
  amount: number;
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
  loginOrRegisterWithPhone: (phoneNumber: string, pin: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
          if (snap.exists()) {
            const data = snap.data();
            const profile: UserProfile = {
              uid: fbUser.uid,
              displayName: data.displayName || fbUser.displayName || 'ব্যবহারকারী',
              email: fbUser.email || data.email || null,
              phoneNumber: fbUser.phoneNumber || data.phoneNumber || null,
              photoURL: fbUser.photoURL || data.photoURL || null,
              coins: typeof data.coins === 'number' ? data.coins : 200,
              totalEarnedCoins: typeof data.totalEarnedCoins === 'number' ? data.totalEarnedCoins : 200,
              lastSpinDate: data.lastSpinDate || null,
              authProvider: 'google',
            };
            setUser(profile);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
          } else {
            // New Google user: give initial 150 welcome bonus coins
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'ব্যবহারকারী',
              email: fbUser.email || null,
              phoneNumber: fbUser.phoneNumber || null,
              photoURL: fbUser.photoURL || null,
              coins: 150,
              totalEarnedCoins: 150,
              lastSpinDate: null,
              authProvider: 'google',
            };
            await setDoc(userRef, {
              userId: fbUser.uid,
              displayName: newProfile.displayName,
              email: newProfile.email || '',
              phoneNumber: newProfile.phoneNumber || '',
              photoURL: newProfile.photoURL || '',
              coins: newProfile.coins,
              totalEarnedCoins: newProfile.totalEarnedCoins,
              lastSpinDate: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setUser(newProfile);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
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
            coins: user?.coins || 150,
            totalEarnedCoins: user?.totalEarnedCoins || 150,
            lastSpinDate: user?.lastSpinDate || null,
            authProvider: 'google',
          };
          setUser(fallbackProfile);
        }

        // Realtime listener for user doc updates
        const unsubDoc = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const d = docSnap.data();
              setUser((prev) => {
                if (!prev) return null;
                const updated: UserProfile = {
                  ...prev,
                  coins: typeof d.coins === 'number' ? d.coins : prev.coins,
                  totalEarnedCoins: typeof d.totalEarnedCoins === 'number' ? d.totalEarnedCoins : prev.totalEarnedCoins,
                  lastSpinDate: d.lastSpinDate || prev.lastSpinDate,
                  displayName: d.displayName || prev.displayName,
                };
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
                return updated;
              });
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

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google sign-in info:', err?.message || err);
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

      let currentCoins = 150;
      let totalCoins = 150;
      let displayName = name || `ইউজার ${cleanPhone.slice(-4)}`;
      let lastSpinDate: string | null = null;

      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          currentCoins = data.coins ?? 150;
          totalCoins = data.totalEarnedCoins ?? 150;
          displayName = data.displayName || displayName;
          lastSpinDate = data.lastSpinDate || null;
        } else {
          // New phone user
          await setDoc(userRef, {
            userId: phoneUid,
            displayName,
            email: '',
            phoneNumber: cleanPhone,
            photoURL: '',
            coins: 150,
            totalEarnedCoins: 150,
            lastSpinDate: '',
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
        coins: currentCoins,
        totalEarnedCoins: totalCoins,
        lastSpinDate,
        authProvider: 'phone',
      };

      setUser(phoneProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(phoneProfile));
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
      // Record guest spin in localStorage
      localStorage.setItem(LOCAL_STORAGE_SPIN_KEY, today);
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
      return user.lastSpinDate !== today;
    }
    const guestLastSpin = localStorage.getItem(LOCAL_STORAGE_SPIN_KEY);
    return guestLastSpin !== today;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        isLoading,
        loginWithGoogle,
        loginOrRegisterWithPhone,
        logout,
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
