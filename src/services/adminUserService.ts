import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';

export interface ManagedUser {
  uid: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  photoURL?: string | null;
  coins: number;
  totalEarnedCoins: number;
  status: 'active' | 'suspended' | 'banned';
  banReason?: string;
  suspendedUntil?: string | null;
  authProvider: 'google' | 'phone' | 'guest';
  lastSpinDate?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

const LOCAL_STORAGE_USERS_KEY = 'mosafa_managed_users_v2';
const LOCAL_STORAGE_USER_SESSION = 'mosafa_user_session';

// Realistic Bangladeshi initial seed users
const INITIAL_SEED_USERS: ManagedUser[] = [
  {
    uid: 'user_01868775577_admin',
    displayName: 'মুফাসসিরুল ইসলাম (অ্যাডমিন)',
    email: 'mofassir4700@gmail.com',
    phoneNumber: '01868775577',
    photoURL: null,
    coins: 2500, // 25 BDT equivalent
    totalEarnedCoins: 3500,
    status: 'active',
    authProvider: 'google',
    lastSpinDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
    notes: 'প্রধান অ্যাডমিন ও ডেভেলপার প্রোফাইল',
  },
  {
    uid: 'user_phone_01712345678',
    displayName: 'মোঃ রফিকুল ইসলাম',
    email: null,
    phoneNumber: '01712345678',
    photoURL: null,
    coins: 550, // 5.5 BDT equivalent (can download 1 PDF!)
    totalEarnedCoins: 850,
    status: 'active',
    authProvider: 'phone',
    lastSpinDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-02-15T14:30:00.000Z',
    updatedAt: new Date().toISOString(),
    notes: 'ভোট স্থানান্তর ও ফরম ২ নিয়মিত ব্যবহারকারী',
  },
  {
    uid: 'user_phone_01998765432',
    displayName: 'তানজিলা আক্তার মিলি',
    email: 'tanzila.mili@gmail.com',
    phoneNumber: '01998765432',
    photoURL: null,
    coins: 300,
    totalEarnedCoins: 450,
    status: 'active',
    authProvider: 'google',
    lastSpinDate: null,
    createdAt: '2026-03-01T09:15:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'user_phone_01822334455',
    displayName: 'কামরুল হাসান সোহেল',
    email: null,
    phoneNumber: '01822334455',
    photoURL: null,
    coins: 100,
    totalEarnedCoins: 200,
    status: 'suspended',
    banReason: 'ভুল পেমেন্ট TrxID বারবার সাবমিট করায় সাময়িক স্থগিত',
    suspendedUntil: '2026-11-12T00:00:00.000Z',
    authProvider: 'phone',
    lastSpinDate: '2026-10-30',
    createdAt: '2026-02-20T18:00:00.000Z',
    updatedAt: new Date().toISOString(),
    notes: 'সাময়িক স্থগিত একাউন্ট',
  },
  {
    uid: 'user_phone_01600000000',
    displayName: 'স্প্যামার ইউজার',
    email: 'spammer_bot@fake.com',
    phoneNumber: '01600000000',
    photoURL: null,
    coins: 0,
    totalEarnedCoins: 50,
    status: 'banned',
    banReason: 'ভুয়া রেফারেল ট্র্যাকিং ও প্রতারণামূলক চেষ্টার কারণে স্থায়ীভাবে নিষিদ্ধ',
    authProvider: 'phone',
    lastSpinDate: null,
    createdAt: '2026-01-05T12:00:00.000Z',
    updatedAt: new Date().toISOString(),
    notes: 'স্থায়ী ব্যানকৃত প্রোফাইল',
  },
];

class AdminUserService {
  private users: ManagedUser[] = [];
  private subscribers: Array<(users: ManagedUser[]) => void> = [];
  private isInitialized = false;

  constructor() {
    this.loadFromStorage();
    this.syncFromFirestore();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
      } else {
        this.users = [...INITIAL_SEED_USERS];
        this.saveToStorage();
      }

      // Check current user session and inject if not in list
      const session = localStorage.getItem(LOCAL_STORAGE_USER_SESSION);
      if (session) {
        const currentUser = JSON.parse(session);
        if (currentUser && currentUser.uid) {
          this.syncCurrentUser(currentUser);
        }
      }
    } catch {
      this.users = [...INITIAL_SEED_USERS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.warn('Failed to save users to localStorage', e);
    }
  }

  private notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb([...this.users]);
      } catch (e) {
        console.error('Subscriber callback error:', e);
      }
    });
  }

  public subscribe(callback: (users: ManagedUser[]) => void): () => void {
    this.subscribers.push(callback);
    callback([...this.users]);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  public async syncFromFirestore() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        const firestoreUsers: ManagedUser[] = [];
        snap.forEach((d) => {
          const data = d.data();
          firestoreUsers.push({
            uid: d.id,
            displayName: data.displayName || 'ব্যবহারকারী',
            email: data.email || null,
            phoneNumber: data.phoneNumber || null,
            photoURL: data.photoURL || null,
            coins: typeof data.coins === 'number' ? data.coins : 50,
            totalEarnedCoins: typeof data.totalEarnedCoins === 'number' ? data.totalEarnedCoins : 50,
            status: data.status || 'active',
            banReason: data.banReason || undefined,
            suspendedUntil: data.suspendedUntil || null,
            authProvider: data.authProvider || 'google',
            lastSpinDate: data.lastSpinDate || null,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            notes: data.notes || '',
          });
        });

        // Merge firestore users with local seed
        const mergedMap = new Map<string, ManagedUser>();
        this.users.forEach((u) => mergedMap.set(u.uid, u));
        firestoreUsers.forEach((u) => mergedMap.set(u.uid, u));

        this.users = Array.from(mergedMap.values());
        this.saveToStorage();
        this.notify();
      }
    } catch (e) {
      console.warn('Sync from Firestore users notice:', e);
    }
  }

  public syncCurrentUser(user: {
    uid: string;
    displayName: string;
    email: string | null;
    phoneNumber: string | null;
    photoURL?: string | null;
    coins?: number;
    totalEarnedCoins?: number;
    status?: 'active' | 'suspended' | 'banned';
    authProvider?: 'google' | 'phone' | 'guest';
  }) {
    if (!user || !user.uid) return;

    const existingIdx = this.users.findIndex((u) => u.uid === user.uid);
    if (existingIdx >= 0) {
      this.users[existingIdx] = {
        ...this.users[existingIdx],
        displayName: user.displayName || this.users[existingIdx].displayName,
        email: user.email || this.users[existingIdx].email,
        phoneNumber: user.phoneNumber || this.users[existingIdx].phoneNumber,
        photoURL: user.photoURL || this.users[existingIdx].photoURL,
        coins: typeof user.coins === 'number' ? user.coins : this.users[existingIdx].coins,
        totalEarnedCoins:
          typeof user.totalEarnedCoins === 'number'
            ? user.totalEarnedCoins
            : this.users[existingIdx].totalEarnedCoins,
        status: user.status || this.users[existingIdx].status || 'active',
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newUser: ManagedUser = {
        uid: user.uid,
        displayName: user.displayName || 'নতুন ব্যবহারকারী',
        email: user.email || null,
        phoneNumber: user.phoneNumber || null,
        photoURL: user.photoURL || null,
        coins: user.coins ?? 50,
        totalEarnedCoins: user.totalEarnedCoins ?? 50,
        status: user.status || 'active',
        authProvider: user.authProvider || 'phone',
        lastSpinDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.unshift(newUser);
    }
    this.saveToStorage();
    this.notify();
  }

  public getUsers(): ManagedUser[] {
    return [...this.users];
  }

  public getUserById(uid: string): ManagedUser | undefined {
    return this.users.find((u) => u.uid === uid);
  }

  // 1. Add Money / Coins to a User
  public async addMoney(
    uid: string,
    coinAmount: number,
    adminNote: string = 'অ্যাডমিন কর্তৃক ব্যালেন্স এড মানি'
  ): Promise<boolean> {
    const userIdx = this.users.findIndex((u) => u.uid === uid);
    if (userIdx === -1) return false;

    const targetUser = this.users[userIdx];
    const newCoins = Math.max(0, targetUser.coins + coinAmount);
    const newTotal = coinAmount > 0 ? targetUser.totalEarnedCoins + coinAmount : targetUser.totalEarnedCoins;

    this.users[userIdx] = {
      ...targetUser,
      coins: newCoins,
      totalEarnedCoins: newTotal,
      updatedAt: new Date().toISOString(),
      notes: adminNote ? `${targetUser.notes ? targetUser.notes + ' • ' : ''}${adminNote}` : targetUser.notes,
    };

    this.saveToStorage();
    this.notify();

    // If target user is the currently active session user, update active session!
    try {
      const sessionStr = localStorage.getItem(LOCAL_STORAGE_USER_SESSION);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session && session.uid === uid) {
          session.coins = newCoins;
          session.totalEarnedCoins = newTotal;
          localStorage.setItem(LOCAL_STORAGE_USER_SESSION, JSON.stringify(session));
          // Dispatch storage event to alert AuthContext
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch {}

    // Firestore sync
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        coins: newCoins,
        totalEarnedCoins: newTotal,
        updatedAt: new Date().toISOString(),
      });

      // Add to transaction log subcollection
      const txRef = collection(db, 'users', uid, 'transactions');
      await addDoc(txRef, {
        transactionId: `admin_add_${Date.now()}`,
        userId: uid,
        amount: coinAmount,
        type: 'admin_add_money',
        description: adminNote,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore updateDoc addMoney notice:', e);
    }

    return true;
  }

  // 2. Change Status (Active, Suspended, Banned)
  public async updateUserStatus(
    uid: string,
    status: 'active' | 'suspended' | 'banned',
    reason?: string,
    suspendedUntil?: string | null
  ): Promise<boolean> {
    const userIdx = this.users.findIndex((u) => u.uid === uid);
    if (userIdx === -1) return false;

    const targetUser = this.users[userIdx];
    this.users[userIdx] = {
      ...targetUser,
      status,
      banReason: reason || (status === 'active' ? undefined : targetUser.banReason),
      suspendedUntil: status === 'suspended' ? suspendedUntil : null,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    this.notify();

    // If current session belongs to this user, update session
    try {
      const sessionStr = localStorage.getItem(LOCAL_STORAGE_USER_SESSION);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session && session.uid === uid) {
          session.status = status;
          session.banReason = reason;
          session.suspendedUntil = suspendedUntil;
          localStorage.setItem(LOCAL_STORAGE_USER_SESSION, JSON.stringify(session));
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch {}

    // Firestore sync
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status,
        banReason: reason || '',
        suspendedUntil: suspendedUntil || '',
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore updateDoc status notice:', e);
    }

    return true;
  }

  // 3. Reset Daily Spin
  public async resetDailySpin(uid: string): Promise<boolean> {
    const userIdx = this.users.findIndex((u) => u.uid === uid);
    if (userIdx === -1) return false;

    this.users[userIdx] = {
      ...this.users[userIdx],
      lastSpinDate: null,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();
    this.notify();

    // Update local session if current user
    try {
      const sessionStr = localStorage.getItem(LOCAL_STORAGE_USER_SESSION);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session && session.uid === uid) {
          session.lastSpinDate = null;
          localStorage.setItem(LOCAL_STORAGE_USER_SESSION, JSON.stringify(session));
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch {}

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastSpinDate: '',
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore reset spin notice:', e);
    }

    return true;
  }

  // 4. Delete user record
  public async deleteUser(uid: string): Promise<boolean> {
    this.users = this.users.filter((u) => u.uid !== uid);
    this.saveToStorage();
    this.notify();
    return true;
  }
}

export const adminUserService = new AdminUserService();
