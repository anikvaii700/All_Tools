import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getAuth } from 'firebase-admin/auth';

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

const VALID_SHOP_CATEGORIES = new Set([
  'mobile-shop',
  'computer-laptop',
  'electronics',
  'general-store',
  'grocery',
  'clothing-fashion',
  'cosmetics-beauty',
  'pharmacy',
  'stationery-book',
  'gift-accessories',
  'hardware-building',
  'other-shop',
]);

const VALID_COLLECTIONS = new Set([
  'products',
  'invoices',
  'receipts',
  'customers',
  'suppliers',
  'expenses',
  'repairs',
  'documents',
  'dailySales',
]);

const VALID_ASSET_IDS = new Set(['branding_logo', 'branding_card', 'branding_sig']);

// Cached Google public X.509 certificates for verifying Firebase Auth ID tokens
let cachedCerts: Record<string, string> = {};
let certsExpireAt = 0;

async function getGoogleSecureTokenCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (Object.keys(cachedCerts).length > 0 && now < certsExpireAt) {
    return cachedCerts;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );
  if (!resp.ok) {
    throw new Error(`Failed to fetch Google certs: HTTP ${resp.status}`);
  }
  const json = (await resp.json()) as Record<string, string>;
  const cc = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cc.match(/max-age=(\d+)/i);
  const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  cachedCerts = json;
  certsExpireAt = now + Math.max(60, maxAgeSec) * 1000;
  return cachedCerts;
}

function base64UrlDecode(segment: string): Buffer {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

export interface VerifiedShopSession {
  uid: string;
  shopId: string;
  email?: string;
  phoneNumber?: string;
}

async function verifyShopBearerToken(
  req: express.Request,
  firebaseProjectId: string
): Promise<{ ok: true; session: VerifiedShopSession } | { ok: false; status: number; error: string }> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'অননুমোদিত: টোকেন অনুপস্থিত (Missing Bearer Token)' };
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return { ok: false, status: 401, error: 'অননুমোদিত: ফাঁকা টোকেন' };
  }

  // Try Firebase Admin SDK first if ADC credentials exist in deployment environment
  try {
    const decoded = await getAuth().verifyIdToken(token);
    if (decoded?.uid && VALID_ID_REGEX.test(decoded.uid)) {
      return {
        ok: true,
        session: {
          uid: decoded.uid,
          shopId: decoded.uid,
          email: decoded.email,
          phoneNumber: decoded.phone_number,
        },
      };
    }
  } catch {
    // Expected when container lacks service-account ADC; fall back to cryptographic X.509 verification
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, status: 401, error: 'অকার্যকর টোকেন ফরম্যাট' };
  }

  let header: { alg?: string; kid?: string };
  let payload: Record<string, any>;
  try {
    header = JSON.parse(base64UrlDecode(parts[0]).toString('utf-8'));
    payload = JSON.parse(base64UrlDecode(parts[1]).toString('utf-8'));
  } catch {
    return { ok: false, status: 401, error: 'টোকেন ডিকোড করা যায়নি' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < nowSec) {
    return { ok: false, status: 401, error: 'সেশনের মেয়াদ শেষ হয়েছে — আবার লগইন করুন' };
  }
  if (payload.aud !== firebaseProjectId) {
    return { ok: false, status: 401, error: 'টোকেন প্রজেক্ট মিলছে না' };
  }
  if (payload.iss !== `https://securetoken.google.com/${firebaseProjectId}`) {
    return { ok: false, status: 401, error: 'টোকেন ইস্যুকারী অনুমোদিত নয়' };
  }
  const uid = String(payload.user_id || payload.sub || '');
  if (!uid || !VALID_ID_REGEX.test(uid)) {
    return { ok: false, status: 401, error: 'টোকেনে বৈধ ইউজার আইডি নেই' };
  }

  // Cryptographically verify RS256 signature with Google's public x509 cert
  try {
    if (header.alg !== 'RS256' || !header.kid) {
      return { ok: false, status: 401, error: 'অসমর্থিত টোকেন অ্যালগরিদম' };
    }
    const certs = await getGoogleSecureTokenCerts();
    const certPem = certs[header.kid];
    if (!certPem) {
      return { ok: false, status: 401, error: 'টোকেন কী খুঁজে পাওয়া যায়নি' };
    }
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    const signatureValid = verifier.verify(certPem, base64UrlDecode(parts[2]));
    if (!signatureValid) {
      return { ok: false, status: 401, error: 'টোকেনের ডিজিটাল স্বাক্ষর সঠিক নয়' };
    }
  } catch (certErr) {
    console.warn('[ShopAuth] Could not verify signature against Google cert endpoint:', certErr);
    return { ok: false, status: 401, error: 'টোকেন যাচাইকরণ সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে' };
  }

  return {
    ok: true,
    session: {
      uid,
      shopId: uid,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      phoneNumber: typeof payload.phone_number === 'string' ? payload.phone_number : undefined,
    },
  };
}

// Per-shop file write mutex to prevent race conditions during concurrent updates
const shopWriteLocks = new Map<string, Promise<unknown>>();

function withShopLock<T>(shopId: string, task: () => Promise<T>): Promise<T> {
  const prev = shopWriteLocks.get(shopId) || Promise.resolve();
  const next = prev.then(task, task);
  shopWriteLocks.set(
    shopId,
    next.finally(() => {
      if (shopWriteLocks.get(shopId) === next) {
        shopWriteLocks.delete(shopId);
      }
    })
  );
  return next;
}

export function createShopRouter(baseDataDir: string, firebaseProjectId: string): express.Router {
  const router = express.Router();
  const shopsRootDir = path.join(baseDataDir, 'shops');

  if (!fs.existsSync(shopsRootDir)) {
    fs.mkdirSync(shopsRootDir, { recursive: true });
  }

  function getShopDir(shopId: string): string {
    if (!VALID_ID_REGEX.test(shopId)) {
      throw new Error('Invalid shopId');
    }
    const dir = path.join(shopsRootDir, shopId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  function readJsonFile<T>(filePath: string, fallback: T): T {
    try {
      if (!fs.existsSync(filePath)) return fallback;
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  function writeJsonAtomic(filePath: string, data: unknown): void {
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  }

  router.get('/health', (_req, res) => {
    res.json({
      success: true,
      service: 'my-digital-shop-management',
      storage: 'isolated-multi-tenant',
      timestamp: new Date().toISOString(),
    });
  });

  // Require verified Bearer JWT for all tenant endpoints below
  router.use(async (req, res, next) => {
    const authResult = await verifyShopBearerToken(req, firebaseProjectId);
    if (authResult.ok === false) {
      return res.status(authResult.status).json({
        success: false,
        error: authResult.error,
      });
    }
    (req as any).shopSession = authResult.session;
    next();
  });

  router.get('/verify-session', (req, res) => {
    const session: VerifiedShopSession = (req as any).shopSession;
    const shopDir = getShopDir(session.shopId);
    const profile = readJsonFile<any>(path.join(shopDir, 'profile.json'), null);
    res.json({
      success: true,
      shopId: session.shopId,
      uid: session.uid,
      hasProfile: Boolean(profile),
    });
  });

  // Bootstrap all tenant-scoped data strictly for the authenticated shopId
  router.get('/bootstrap', (req, res) => {
    const session: VerifiedShopSession = (req as any).shopSession;
    const shopDir = getShopDir(session.shopId);

    const profile = readJsonFile<any>(path.join(shopDir, 'profile.json'), null);
    const assets = readJsonFile<Record<string, any>>(path.join(shopDir, 'assets.json'), {});
    const collections: Record<string, any[]> = {};
    for (const col of VALID_COLLECTIONS) {
      collections[col] = readJsonFile<any[]>(path.join(shopDir, `${col}.json`), []);
    }

    res.json({
      success: true,
      shopId: session.shopId,
      profile,
      assets,
      collections,
    });
  });

  // Create or update shop profile (never accepts plaintext passwords or mismatched shopId)
  router.put('/profile', async (req, res) => {
    const session: VerifiedShopSession = (req as any).shopSession;
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'অবৈধ প্রোফাইল ডাটা' });
    }

    const shopCategory = String(body.shopCategory || '');
    const shopName = String(body.shopName || '').trim();
    const ownerName = String(body.ownerName || '').trim();
    const phone = String(body.phone || '').trim();

    if (!VALID_SHOP_CATEGORIES.has(shopCategory)) {
      return res.status(400).json({ success: false, error: 'সঠিক দোকানের ক্যাটাগরি নির্বাচন করুন' });
    }
    if (!shopName || shopName.length > 160) {
      return res.status(400).json({ success: false, error: 'দোকানের নাম ১-১৬০ অক্ষরের মধ্যে হতে হবে' });
    }
    if (!ownerName || ownerName.length > 120) {
      return res.status(400).json({ success: false, error: 'মালিকের নাম ১-১২০ অক্ষরের মধ্যে হতে হবে' });
    }
    if (!phone || phone.length < 5 || phone.length > 30) {
      return res.status(400).json({ success: false, error: 'বৈধ মোবাইল নম্বর দিন' });
    }

    const now = new Date().toISOString();
    const updated = await withShopLock(session.shopId, async () => {
      const shopDir = getShopDir(session.shopId);
      const profilePath = path.join(shopDir, 'profile.json');
      const existing = readJsonFile<any>(profilePath, null);

      const safeProfile = {
        shopId: session.shopId,
        ownerUid: session.uid,
        shopCategory,
        shopName,
        tagline: String(body.tagline || '').slice(0, 240),
        subtitle: String(body.subtitle || '').slice(0, 180),
        ownerName,
        phone,
        email: String(body.email || '').slice(0, 180),
        website: String(body.website || '').slice(0, 200),
        address: String(body.address || '').slice(0, 400),
        tradeLicense: String(body.tradeLicense || '').slice(0, 100),
        binVatNumber: String(body.binVatNumber || '').slice(0, 100),
        bkashNumber: String(body.bkashNumber || '').slice(0, 60),
        nagadNumber: String(body.nagadNumber || '').slice(0, 60),
        rocketNumber: String(body.rocketNumber || '').slice(0, 60),
        bankName: String(body.bankName || '').slice(0, 120),
        bankAccountName: String(body.bankAccountName || '').slice(0, 120),
        bankAccountNumber: String(body.bankAccountNumber || '').slice(0, 80),
        brandColor: String(body.brandColor || '#059669').slice(0, 24),
        language: body.language === 'en' ? 'en' : 'bn',
        defaultTemplate: String(body.defaultTemplate || 'classic').slice(0, 60),
        defaultInvoiceFooter: String(body.defaultInvoiceFooter || '').slice(0, 300),
        religiousHeader: String(body.religiousHeader || '').slice(0, 120),
        signatureTitle: String(body.signatureTitle || 'অনুমোদিত স্বাক্ষর').slice(0, 100),
        authType: existing?.authType || (body.authType === 'email' ? 'email' : 'phone'),
        loginIdentifier: existing?.loginIdentifier || String(body.loginIdentifier || '').slice(0, 180),
        hasLogo: Boolean(body.hasLogo),
        hasVisitingCard: Boolean(body.hasVisitingCard),
        visitingCardMode: ['none', 'uploaded', 'created'].includes(body.visitingCardMode)
          ? body.visitingCardMode
          : existing?.visitingCardMode || 'none',
        visitingCardTemplate: String(body.visitingCardTemplate || existing?.visitingCardTemplate || 'modern-emerald').slice(0, 50),
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      writeJsonAtomic(profilePath, safeProfile);
      return safeProfile;
    });

    res.json({ success: true, profile: updated });
  });

  // Save or remove shop branding assets (logo, visiting card, signature)
  router.put('/assets/:assetId', async (req, res) => {
    const session: VerifiedShopSession = (req as any).shopSession;
    const { assetId } = req.params;
    if (!VALID_ASSET_IDS.has(assetId)) {
      return res.status(400).json({ success: false, error: 'অবৈধ অ্যাসেট আইডি' });
    }
    const { assetType, mimeType, dataUrl } = req.body || {};
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/') || dataUrl.length > 650000) {
      return res.status(400).json({ success: false, error: 'অবৈধ বা অতিরিক্ত বড় ছবি ফাইল' });
    }

    const assetRecord = await withShopLock(session.shopId, async () => {
      const shopDir = getShopDir(session.shopId);
      const assetsPath = path.join(shopDir, 'assets.json');
      const existing = readJsonFile<Record<string, any>>(assetsPath, {});
      const record = {
        assetId,
        shopId: session.shopId,
        ownerUid: session.uid,
        assetType: String(assetType || 'logo'),
        mimeType: String(mimeType || 'image/png').slice(0, 60),
        dataUrl,
        updatedAt: new Date().toISOString(),
      };
      existing[assetId] = record;
      writeJsonAtomic(assetsPath, existing);
      return record;
    });

    res.json({ success: true, asset: assetRecord });
  });

  router.delete('/assets/:assetId', async (req, res) => {
    const session: VerifiedShopSession = (req as any).shopSession;
    const { assetId } = req.params;
    if (!VALID_ASSET_IDS.has(assetId)) {
      return res.status(400).json({ success: false, error: 'অবৈধ অ্যাসেট আইডি' });
    }

    await withShopLock(session.shopId, async () => {
      const shopDir = getShopDir(session.shopId);
      const assetsPath = path.join(shopDir, 'assets.json');
      const existing = readJsonFile<Record<string, any>>(assetsPath, {});
      delete existing[assetId];
      writeJsonAtomic(assetsPath, existing);
    });

    res.json({ success: true });
  });

  // Upsert a single item in any allowed shop subcollection
  router.put('/collection/:col/:itemId', async (req, res) => {
    const session: VerifiedShopSession = (req as any).shopSession;
    const { col, itemId } = req.params;
    if (!VALID_COLLECTIONS.has(col) || !VALID_ID_REGEX.test(itemId)) {
      return res.status(400).json({ success: false, error: 'অবৈধ কালেকশন বা আইডি' });
    }
    const item = req.body;
    if (!item || typeof item !== 'object') {
      return res.status(400).json({ success: false, error: 'অবৈধ ডাটা অবজেক্ট' });
    }

    const now = new Date().toISOString();
    const saved = await withShopLock(session.shopId, async () => {
      const shopDir = getShopDir(session.shopId);
      const colPath = path.join(shopDir, `${col}.json`);
      const list = readJsonFile<any[]>(colPath, []);
      const idx = list.findIndex((entry) => entry.id === itemId);
      // Enforce tenant isolation: overwrite shopId, ownerUid, id server-side
      const sanitized = {
        ...item,
        id: itemId,
        shopId: session.shopId,
        ownerUid: session.uid,
        createdAt: idx >= 0 && list[idx]?.createdAt ? list[idx].createdAt : item.createdAt || now,
        updatedAt: now,
      };
      if (idx >= 0) {
        list[idx] = sanitized;
      } else {
        list.unshift(sanitized);
      }
      writeJsonAtomic(colPath, list);
      return sanitized;
    });

    res.json({ success: true, item: saved });
  });

  router.delete('/collection/:col/:itemId', async (req, res) => {
    const session: VerifiedShopSession = (req as any).shopSession;
    const { col, itemId } = req.params;
    if (!VALID_COLLECTIONS.has(col) || !VALID_ID_REGEX.test(itemId)) {
      return res.status(400).json({ success: false, error: 'অবৈধ কালেকশন বা আইডি' });
    }

    await withShopLock(session.shopId, async () => {
      const shopDir = getShopDir(session.shopId);
      const colPath = path.join(shopDir, `${col}.json`);
      const list = readJsonFile<any[]>(colPath, []);
      const next = list.filter((entry) => entry.id !== itemId);
      writeJsonAtomic(colPath, next);
    });

    res.json({ success: true });
  });

  return router;
}
