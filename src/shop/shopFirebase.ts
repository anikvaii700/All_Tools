import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Completely separate named Firebase App instance for My Digital Shop Management.
// Because Firebase Web SDK scopes Auth persistence (IndexedDB / localStorage) by app name,
// being logged into the main MoSaFa Tools website ([DEFAULT] app) NEVER logs into this app,
// and logging in here NEVER affects the main MoSaFa website session.
export const SHOP_FIREBASE_APP_NAME = 'mosafa-digital-shop-app';

function getShopFirebaseApp(): FirebaseApp {
  const existing = getApps().find((a) => a.name === SHOP_FIREBASE_APP_NAME);
  if (existing) return existing;
  return initializeApp(firebaseConfig, SHOP_FIREBASE_APP_NAME);
}

const shopApp = getShopFirebaseApp();
export const shopAuth: Auth = getAuth(shopApp);
export const shopDb: Firestore = getFirestore(shopApp, firebaseConfig.firestoreDatabaseId);

export enum ShopOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface ShopFirestoreErrorInfo {
  error: string;
  operationType: ShopOperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function shopHandleFirestoreError(
  error: unknown,
  operationType: ShopOperationType,
  path: string | null
): ShopFirestoreErrorInfo {
  const errInfo: ShopFirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: shopAuth.currentUser?.uid || null,
      email: shopAuth.currentUser?.email || null,
      emailVerified: shopAuth.currentUser?.emailVerified ?? null,
      isAnonymous: shopAuth.currentUser?.isAnonymous ?? null,
      tenantId: shopAuth.currentUser?.tenantId || null,
    },
    operationType,
    path,
  };
  console.warn('[ShopFirestore]', JSON.stringify(errInfo));
  return errInfo;
}

export async function testShopFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(shopDb, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Shop Firebase client appears offline.');
    }
    return false;
  }
}

export function normalizeShopPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/[^0-9]/g, '');
  if (digits.startsWith('880') && digits.length === 13) {
    return '0' + digits.slice(3);
  }
  if (digits.startsWith('88') && digits.length === 13) {
    return digits.slice(2);
  }
  return digits;
}

export function buildShopSyntheticEmail(rawPhone: string): string {
  const clean = normalizeShopPhone(rawPhone);
  // Distinct domain namespace from main MoSaFa site's @phone.mosafabd.com
  return `shop_${clean}@shop.mosafabd.com`;
}

export function isShopSyntheticEmail(email?: string | null): boolean {
  return Boolean(email && email.endsWith('@shop.mosafabd.com'));
}

export async function getShopIdToken(): Promise<string | null> {
  const user = shopAuth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}
