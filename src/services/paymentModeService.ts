import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export type PaymentMode = 'ON' | 'OFF';

/**
 * Global default payment mode for the entire application.
 * - 'ON': Regular mode with 5 BDT per download, coin wallet, balance checks, etc.
 * - 'OFF': 100% Free mode, all PDF downloads proceed immediately without charge or deduction.
 */
export const DEFAULT_PAYMENT_MODE: PaymentMode = 'ON';

const LOCAL_STORAGE_KEY = 'mosafa_payment_mode';
const FIRESTORE_DOC_PATH = 'payment_config';

class PaymentModeService {
  private currentMode: PaymentMode = DEFAULT_PAYMENT_MODE;
  private listeners: ((mode: PaymentMode) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // 1. Read from localStorage if already saved
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored === 'ON' || stored === 'OFF') {
        this.currentMode = stored;
      } else {
        this.currentMode = DEFAULT_PAYMENT_MODE;
        localStorage.setItem(LOCAL_STORAGE_KEY, DEFAULT_PAYMENT_MODE);
      }
    } catch {
      this.currentMode = DEFAULT_PAYMENT_MODE;
    }

    // 2. Cross-tab sync via window storage event
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === LOCAL_STORAGE_KEY && (e.newValue === 'ON' || e.newValue === 'OFF')) {
          this.currentMode = e.newValue as PaymentMode;
          this.notify();
        }
      });
    }

    // 3. Sync from Firestore settings collection
    try {
      const docRef = doc(db, 'settings', FIRESTORE_DOC_PATH);
      onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data?.mode === 'ON' || data?.mode === 'OFF') {
              if (this.currentMode !== data.mode) {
                this.currentMode = data.mode as PaymentMode;
                try {
                  localStorage.setItem(LOCAL_STORAGE_KEY, this.currentMode);
                } catch {}
                this.notify();
              }
            }
          }
        },
        (err) => {
          console.warn('paymentModeService firestore sync notice:', err);
        }
      );
    } catch (e) {
      console.warn('paymentModeService init firestore notice:', e);
    }
  }

  public getMode(): PaymentMode {
    return this.currentMode;
  }

  public isPaymentEnabled(): boolean {
    return this.currentMode === 'ON';
  }

  public async setMode(mode: PaymentMode): Promise<void> {
    this.currentMode = mode;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, mode);
    } catch {}
    this.notify();

    // Trigger storage event for same-window components
    try {
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // Firestore sync
    try {
      const docRef = doc(db, 'settings', FIRESTORE_DOC_PATH);
      await setDoc(
        docRef,
        {
          mode,
          updatedAt: new Date().toISOString(),
          description:
            mode === 'ON'
              ? 'পেমেন্ট গেটওয়ে সক্রিয় (প্রতিটি ডাউনলোড ফি ৫ টাকা)'
              : 'পেমেন্ট গেটওয়ে নিষ্ক্রিয় (সম্পূর্ণ ফ্রি সাইট - কোনো ফি নেই)',
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('paymentModeService setMode firestore notice:', e);
    }
  }

  public subscribe(listener: (mode: PaymentMode) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentMode);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentMode);
      } catch {}
    });
  }
}

export const paymentModeService = new PaymentModeService();
