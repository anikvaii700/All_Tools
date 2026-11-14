import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import JSZip from 'jszip';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { getAuth } from 'firebase-admin/auth';
import type {
  ApplicantInterviewProfile,
  CVCategory,
  CVData,
  CVTailoringReport,
  CircularAnalysis,
  SavedJobCV,
} from '../src/types/cvMaker';

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

const VALID_CATEGORIES: CVCategory[] = [
  'modern-professional',
  'ats-friendly',
  'europass-style',
  'fresher-student',
  'it-tech',
  'office-admin',
  'skilled-worker',
  'creative-portfolio',
  'academic-research',
  'executive-specialized',
];

const CATEGORY_TEMPLATE_DEFAULTS: Record<CVCategory, string[]> = {
  'modern-professional': ['tmpl-01', 'tmpl-02', 'tmpl-04'],
  'ats-friendly': ['tmpl-11', 'tmpl-12', 'tmpl-15'],
  'europass-style': ['tmpl-21', 'tmpl-22', 'tmpl-24'],
  'fresher-student': ['tmpl-31', 'tmpl-32', 'tmpl-35'],
  'it-tech': ['tmpl-41', 'tmpl-42', 'tmpl-44'],
  'office-admin': ['tmpl-51', 'tmpl-52', 'tmpl-55'],
  'skilled-worker': ['tmpl-61', 'tmpl-62', 'tmpl-64'],
  'creative-portfolio': ['tmpl-71', 'tmpl-72', 'tmpl-75'],
  'academic-research': ['tmpl-81', 'tmpl-82', 'tmpl-84'],
  'executive-specialized': ['tmpl-91', 'tmpl-92', 'tmpl-95'],
};

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

async function verifyUserBearerToken(
  req: express.Request,
  firebaseProjectId: string
): Promise<{ ok: true; uid: string } | { ok: false; status: number; error: string }> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'অননুমোদিত: টোকেন অনুপস্থিত (Sign in required)' };
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return { ok: false, status: 401, error: 'অননুমোদিত: ফাঁকা টোকেন' };
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    if (decoded?.uid && VALID_ID_REGEX.test(decoded.uid)) {
      return { ok: true, uid: decoded.uid };
    }
  } catch {
    // Fallback to cryptographic X.509 verification when ADC is not configured locally
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
    return { ok: false, status: 401, error: 'সেশনের মেয়াদ শেষ — আবার লগইন করুন' };
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
    if (!verifier.verify(certPem, base64UrlDecode(parts[2]))) {
      return { ok: false, status: 401, error: 'টোকেনের ডিজিটাল স্বাক্ষর সঠিক নয়' };
    }
  } catch (err) {
    console.warn('[CVHelperAuth] X.509 verify error:', err);
    return { ok: false, status: 401, error: 'টোকেন যাচাইকরণ ব্যর্থ হয়েছে' };
  }

  return { ok: true, uid };
}

function stripDataUriPrefix(input: string): string {
  const idx = input.indexOf('base64,');
  return idx >= 0 ? input.slice(idx + 7) : input;
}

async function extractTextFromDocxBase64(base64Data: string): Promise<string> {
  const clean = stripDataUriPrefix(base64Data);
  const buffer = Buffer.from(clean, 'base64');
  const zip = await JSZip.loadAsync(buffer);
  const docFile = zip.file('word/document.xml');
  if (!docFile) {
    throw new Error('DOCX ডকুমেন্টের ভেতরে টেক্সট পাওয়া যায়নি।');
  }
  const xml = await docFile.async('string');
  const text = xml
    .replace(/<w:p[^>]*>/g, '\n')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<w:tab[^>]*\/>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
}

function parseJsonSafe<T>(rawText: string | undefined): T {
  if (!rawText) {
    throw new Error('AI থেকে খালি উত্তর পাওয়া গেছে।');
  }
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

function isTransientAiError(err: any): boolean {
  const msg = String(err?.message || err || '').toLowerCase();
  const status = Number(err?.status || err?.code || 0);
  return (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('try again later')
  );
}

function formatCleanAiError(err: any, fallbackMsg: string): string {
  const raw = String(err?.message || err || '').trim();
  if (!raw) return fallbackMsg;
  if (isTransientAiError(err)) {
    return 'AI সার্ভারে এই মুহূর্তে সাময়িক চাপ রয়েছে। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।';
  }
  try {
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw);
      if (parsed?.error?.message) return String(parsed.error.message);
    }
  } catch {
    // ignore JSON parse failure
  }
  return raw.length > 220 ? fallbackMsg : raw;
}

async function generateWithResilience(
  aiClient: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction: string;
    thinkingLevel: ThinkingLevel;
    responseSchema: any;
  }
) {
  const attempts: Array<{ model: string; level: ThinkingLevel; delayMs: number }> = [
    { model: 'gemini-4-hydrogen', level: params.thinkingLevel, delayMs: 0 },
    { model: 'gemini-4-hydrogen', level: ThinkingLevel.LOW, delayMs: 700 },
    { model: 'gemini-3.1-flash-lite', level: ThinkingLevel.LOW, delayMs: 400 },
  ];

  let lastErr: any = null;
  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await new Promise((r) => setTimeout(r, attempt.delayMs));
    }
    try {
      const response = await aiClient.models.generateContent({
        model: attempt.model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          thinkingConfig: { thinkingLevel: attempt.level },
          responseMimeType: 'application/json',
          responseSchema: params.responseSchema,
        },
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`[CVHelper] Model ${attempt.model} failed:`, err?.message || err);
      if (!isTransientAiError(err)) {
        break;
      }
    }
  }
  throw lastErr || new Error('AI response empty');
}

function buildFallbackInterviewTurn(
  lastStepKey: string,
  userAnswer: string,
  collectedProfile: ApplicantInterviewProfile,
  circularAnalysis: CircularAnalysis | null,
  uiLanguage: string
) {
  const ans = String(userAnswer || '').trim();
  const isSkip = /^(skip|স্কিপ|নেই|no|none|পড়ে|পরে)/i.test(ans);
  const updates: Record<string, any> = {};
  const working: ApplicantInterviewProfile = { ...collectedProfile };

  // Extract obvious phone/email anywhere in answer
  const emailMatch = ans.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) {
    updates.email = emailMatch[0];
    working.email = emailMatch[0];
  }
  const phoneMatch = ans.match(/(?:\+?880|0)?1[3-9]\d{8}/);
  if (phoneMatch) {
    updates.phone = phoneMatch[0];
    working.phone = phoneMatch[0];
  }

  if (!isSkip && ans) {
    if (lastStepKey === 'personal_name' && !working.fullName) {
      updates.fullName = ans;
      working.fullName = ans;
    } else if (lastStepKey === 'personal_contact' && !phoneMatch && !emailMatch) {
      if (!working.phone && /\d{6,}/.test(ans)) {
        updates.phone = ans;
        working.phone = ans;
      } else if (!working.email && ans.includes('@')) {
        updates.email = ans;
        working.email = ans;
      }
    } else if (lastStepKey === 'personal_address' && !working.presentAddress) {
      updates.presentAddress = ans;
      working.presentAddress = ans;
    } else if (lastStepKey === 'circular_or_role' && !working.targetJobTitle && !/সার্কুলার ছাড়াই/i.test(ans)) {
      updates.targetJobTitle = ans;
      working.targetJobTitle = ans;
    } else if (lastStepKey === 'career_goal' && !working.careerGoalNote) {
      updates.careerGoalNote = ans;
      working.careerGoalNote = ans;
    } else if (lastStepKey === 'strongest_qualities' && !working.strongestQualities) {
      updates.strongestQualities = ans;
      working.strongestQualities = ans;
    } else if (lastStepKey === 'experience_check') {
      const isFresher = /ফ্রেশার|fresher|নেই|no/i.test(ans);
      updates.hasWorkExperienceStr = isFresher ? 'no' : 'yes';
      working.hasWorkExperience = !isFresher;
    } else if (lastStepKey === 'cv_language') {
      const isBn = /বাংলা|bengali|bn/i.test(ans);
      updates.preferredCvLanguage = isBn ? 'bn' : 'en';
      working.preferredCvLanguage = isBn ? 'bn' : 'en';
    }
  }

  const isBnUi = uiLanguage !== 'en';
  const nameGreet = working.fullName ? `${working.fullName}, ` : '';

  if (!working.fullName) {
    return {
      assistantMessage: isBnUi ? 'অনুগ্রহ করে আপনার পূর্ণ নামটি লিখুন।' : 'Please enter your full name.',
      stepKey: 'personal_name',
      progressPercent: 8,
      isReadyToGenerate: false,
      allowSkip: false,
      quickReplies: [],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (!working.phone) {
    return {
      assistantMessage: isBnUi
        ? `ধন্যবাদ ${nameGreet}এখন আপনার সচল মোবাইল নম্বরটি লিখুন (যেমন: 017XXXXXXXX)।`
        : `Thanks ${nameGreet}please share your active mobile phone number.`,
      stepKey: 'personal_contact',
      progressPercent: 14,
      isReadyToGenerate: false,
      allowSkip: false,
      quickReplies: [],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (!working.email) {
    return {
      assistantMessage: isBnUi
        ? 'চমৎকার! এখন আপনার ইমেইল ঠিকানাটি (Email Address) লিখুন।'
        : 'Great! Now what is your email address?',
      stepKey: 'personal_contact',
      progressPercent: 20,
      isReadyToGenerate: false,
      allowSkip: false,
      quickReplies: [],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (!working.presentAddress) {
    return {
      assistantMessage: isBnUi
        ? 'আপনার বর্তমান ঠিকানা ও শহরের নাম লিখুন (যেমন: মিরপুর, ঢাকা)।'
        : 'What is your current address and city?',
      stepKey: 'personal_address',
      progressPercent: 26,
      isReadyToGenerate: false,
      allowSkip: false,
      quickReplies: [],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (!circularAnalysis && !working.targetJobTitle) {
    return {
      assistantMessage: isBnUi
        ? 'আপনি কোন কোম্পানি ও কোন পদের জন্য CV তৈরি করতে চান? চাইলে নিচের বাটন থেকে চাকরির সার্কুলার আপলোড করতে পারেন।'
        : 'Which company and job role are you applying for? You can also upload the job circular below.',
      stepKey: 'circular_or_role',
      progressPercent: 35,
      isReadyToGenerate: false,
      allowSkip: false,
      quickReplies: ['সেলস/মার্কেটিং এক্সিকিউটিভ', 'অফিস অ্যাডমিন / এক্সিকিউটিভ', 'সফটওয়্যার / আইটি'],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (!working.careerGoalNote && lastStepKey !== 'career_goal') {
    return {
      assistantMessage: isBnUi
        ? 'এই চাকরিতে আপনার ক্যারিয়ারের মূল লক্ষ্য বা আপনি কীভাবে প্রতিষ্ঠানে অবদান রাখতে চান তা ১-২ লাইনে বলুন।'
        : 'Briefly describe your career goal for this role.',
      stepKey: 'career_goal',
      progressPercent: 45,
      isReadyToGenerate: false,
      allowSkip: true,
      quickReplies: [],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (!working.education || working.education.length === 0) {
    return {
      assistantMessage: isBnUi
        ? 'এখন নিচের ফর্ম থেকে আপনার শিক্ষাগত যোগ্যতা যুক্ত করুন অথবা সার্টিফিকেট আপলোড করুন।'
        : 'Please add your educational qualifications below or upload a certificate.',
      stepKey: 'education_prompt',
      progressPercent: 56,
      isReadyToGenerate: false,
      allowSkip: false,
      quickReplies: [],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (working.hasWorkExperience === null) {
    return {
      assistantMessage: isBnUi
        ? 'আপনার কি আগে কোনো চাকরি বা ইন্টার্নশিপের অভিজ্ঞতা আছে?'
        : 'Do you have any prior work or internship experience?',
      stepKey: 'experience_check',
      progressPercent: 66,
      isReadyToGenerate: false,
      allowSkip: false,
      quickReplies: ['হ্যাঁ, অভিজ্ঞতা আছে', 'ফ্রেশার / অভিজ্ঞতা নেই'],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (working.hasWorkExperience && working.experience.length === 0) {
    return {
      assistantMessage: isBnUi
        ? 'নিচের ফর্ম থেকে আপনার পূর্ববর্তী বা বর্তমান কর্মঅভিজ্ঞতা যুক্ত করুন।'
        : 'Please add your work or internship experience below.',
      stepKey: 'experience_prompt',
      progressPercent: 72,
      isReadyToGenerate: false,
      allowSkip: true,
      quickReplies: [],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }
  if (working.skills.length === 0) {
    return {
      assistantMessage: isBnUi
        ? 'আপনার প্রধান দক্ষতাসমূহ (Skills) নিচে থেকে নির্বাচন করুন বা লিখে যুক্ত করুন।'
        : 'Add or confirm your key skills below.',
      stepKey: 'skills_prompt',
      progressPercent: 80,
      isReadyToGenerate: false,
      allowSkip: true,
      quickReplies: [],
      suggestedSkills: circularAnalysis?.requiredSkills || [],
      profileUpdates: updates,
    };
  }
  if (lastStepKey !== 'photo_signature' && !working.photoUrl && lastStepKey !== 'ready_to_generate') {
    return {
      assistantMessage: isBnUi
        ? 'চাইলে আপনার পাসপোর্ট সাইজের ছবি ও স্বাক্ষর আপলোড ও ক্রপ করতে পারেন, অথবা স্কিপ করে পরের ধাপে যেতে পারেন।'
        : 'You can attach and crop your passport photo & signature below, or skip to continue.',
      stepKey: 'photo_signature',
      progressPercent: 90,
      isReadyToGenerate: false,
      allowSkip: true,
      quickReplies: [],
      suggestedSkills: [],
      profileUpdates: updates,
    };
  }

  return {
    assistantMessage: isBnUi
      ? 'সব প্রয়োজনীয় তথ্য প্রস্তুত! নিচের বাটনে ক্লিক করে আপনার চাকরিভিত্তিক প্রফেশনাল CV তৈরি করুন।'
      : 'All key information is ready! Click below to generate your tailored professional CV.',
    stepKey: 'ready_to_generate',
    progressPercent: 100,
    isReadyToGenerate: true,
    allowSkip: false,
    quickReplies: [],
    suggestedSkills: [],
    profileUpdates: updates,
  };
}

const userWriteLocks = new Map<string, Promise<unknown>>();
function withUserLock<T>(uid: string, task: () => Promise<T>): Promise<T> {
  const prev = userWriteLocks.get(uid) || Promise.resolve();
  const next = prev.then(task, task);
  userWriteLocks.set(
    uid,
    next.finally(() => {
      if (userWriteLocks.get(uid) === next) {
        userWriteLocks.delete(uid);
      }
    })
  );
  return next;
}

interface UserCvStore {
  profile: ApplicantInterviewProfile | null;
  savedCvs: SavedJobCV[];
  updatedAt: string;
}

export function createCvHelperRouter(
  baseDataDir: string,
  firebaseProjectId: string,
  ai: GoogleGenAI | null
): express.Router {
  const router = express.Router();
  const rootDir = path.join(baseDataDir, 'cv_helper');

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }

  function getUserStorePath(uid: string): string {
    if (!VALID_ID_REGEX.test(uid)) {
      throw new Error('Invalid uid');
    }
    return path.join(rootDir, `${uid}.json`);
  }

  function readUserStore(uid: string): UserCvStore {
    const filePath = getUserStorePath(uid);
    try {
      if (!fs.existsSync(filePath)) {
        return { profile: null, savedCvs: [], updatedAt: '' };
      }
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Partial<UserCvStore>;
      return {
        profile: parsed.profile || null,
        savedCvs: Array.isArray(parsed.savedCvs) ? parsed.savedCvs : [],
        updatedAt: parsed.updatedAt || '',
      };
    } catch {
      return { profile: null, savedCvs: [], updatedAt: '' };
    }
  }

  function writeUserStoreAtomic(uid: string, store: UserCvStore): void {
    const filePath = getUserStorePath(uid);
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  }

  // =========================================================
  // 1. ANALYZE JOB CIRCULAR (PDF, Image OCR, DOCX, Text)
  // =========================================================
  router.post('/analyze-circular', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          success: false,
          error: 'সার্ভারে AI সার্ভিস কনফিগার করা নেই (GEMINI_API_KEY অনুপস্থিত)।',
        });
      }

      const {
        fileBase64 = '',
        mimeType = '',
        fileName = '',
        rawText = '',
        uiLanguage = 'bn',
      } = req.body || {};

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      let extractedDocText = typeof rawText === 'string' ? rawText.trim() : '';

      const lowerName = String(fileName || '').toLowerCase();
      const lowerMime = String(mimeType || '').toLowerCase();

      if (fileBase64) {
        if (
          lowerName.endsWith('.docx') ||
          lowerMime.includes('wordprocessingml')
        ) {
          extractedDocText = await extractTextFromDocxBase64(String(fileBase64));
        } else if (
          lowerMime === 'text/plain' ||
          lowerName.endsWith('.txt')
        ) {
          extractedDocText = Buffer.from(stripDataUriPrefix(String(fileBase64)), 'base64').toString('utf-8');
        } else if (
          lowerMime === 'application/pdf' ||
          lowerMime.startsWith('image/')
        ) {
          parts.push({
            inlineData: {
              mimeType: lowerMime,
              data: stripDataUriPrefix(String(fileBase64)),
            },
          });
        } else if (lowerName.endsWith('.doc')) {
          const decoded = Buffer.from(stripDataUriPrefix(String(fileBase64)), 'base64')
            .toString('utf-8')
            .replace(/[^\x20-\x7E\u0980-\u09FF\n\r\t]/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
          extractedDocText = decoded.slice(0, 12000);
        }
      }

      if (!parts.length && !extractedDocText) {
        return res.status(400).json({
          success: false,
          error: 'চাকরির সার্কুলার ফাইল বা টেক্সট প্রদান করুন।',
        });
      }

      const systemInstruction = `You are a meticulous recruitment analyst and OCR specialist for Bangladesh and international job circulars (both Bengali and English).
Analyze ONLY the provided job circular document/image/text.
STRICT GROUNDING RULES:
- Extract facts strictly present in the source circular.
- NEVER invent, guess, or fabricate requirements, deadlines, ages, degrees, or company names that are not stated in the circular.
- If a field is not mentioned in the circular, return an empty string "" or empty array [].
- Set suggestedCategory strictly to one of: ${VALID_CATEGORIES.join(', ')}.
- Set suggestedCvLanguage to "bn" ONLY if the job circular explicitly requires a Bengali CV or is a traditional Bengali government/local form requesting Bengali; otherwise default to "en".
- Keep extracted items concise and clear in ${uiLanguage === 'en' ? 'English' : 'clean Bengali/English matching the circular terms'}.`;

      parts.push({
        text: extractedDocText
          ? `Analyze this job circular carefully and extract structured details:\n\n${extractedDocText.slice(0, 20000)}`
          : 'Perform careful OCR and full circular extraction on the attached job circular image/PDF. Do not invent any detail not visible in the document.',
      });

      const response = await generateWithResilience(ai, {
        contents: { parts },
        systemInstruction,
        thinkingLevel: ThinkingLevel.LOW,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            organizationName: { type: Type.STRING },
            jobTitle: { type: Type.STRING },
            jobSummary: { type: Type.STRING },
            responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            educationalRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceRequirements: { type: Type.STRING },
            requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            ageRequirement: { type: Type.STRING },
            deadline: { type: Type.STRING },
            requiredDocuments: { type: Type.ARRAY, items: { type: Type.STRING } },
            applicationInstructions: { type: Type.STRING },
            otherRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            requiresPhoto: { type: Type.BOOLEAN },
            requiresSignature: { type: Type.BOOLEAN },
            suggestedCvLanguage: { type: Type.STRING },
            suggestedCategory: { type: Type.STRING },
          },
          required: [
            'organizationName',
            'jobTitle',
            'jobSummary',
            'responsibilities',
            'educationalRequirements',
            'experienceRequirements',
            'requiredSkills',
            'ageRequirement',
            'deadline',
            'requiredDocuments',
            'applicationInstructions',
            'otherRequirements',
            'requiresPhoto',
            'requiresSignature',
            'suggestedCvLanguage',
            'suggestedCategory',
          ],
        },
      });

      const parsed = parseJsonSafe<CircularAnalysis>(response.text);
      const normalizedCategory: CVCategory = VALID_CATEGORIES.includes(parsed.suggestedCategory)
        ? parsed.suggestedCategory
        : 'modern-professional';

      const result: CircularAnalysis = {
        organizationName: parsed.organizationName || '',
        jobTitle: parsed.jobTitle || '',
        jobSummary: parsed.jobSummary || '',
        responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities.filter(Boolean) : [],
        educationalRequirements: Array.isArray(parsed.educationalRequirements)
          ? parsed.educationalRequirements.filter(Boolean)
          : [],
        experienceRequirements: parsed.experienceRequirements || '',
        requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills.filter(Boolean) : [],
        ageRequirement: parsed.ageRequirement || '',
        deadline: parsed.deadline || '',
        requiredDocuments: Array.isArray(parsed.requiredDocuments) ? parsed.requiredDocuments.filter(Boolean) : [],
        applicationInstructions: parsed.applicationInstructions || '',
        otherRequirements: Array.isArray(parsed.otherRequirements) ? parsed.otherRequirements.filter(Boolean) : [],
        requiresPhoto: Boolean(parsed.requiresPhoto),
        requiresSignature: Boolean(parsed.requiresSignature),
        suggestedCvLanguage: parsed.suggestedCvLanguage === 'bn' ? 'bn' : 'en',
        suggestedCategory: normalizedCategory,
        sourceFileName: fileName || 'Pasted Circular',
      };

      return res.json({ success: true, analysis: result });
    } catch (err: any) {
      console.error('[CVHelper analyze-circular]', err);
      const status = isTransientAiError(err) ? 503 : 500;
      return res.status(status).json({
        success: false,
        error: formatCleanAiError(err, 'সার্কুলার বিশ্লেষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে স্পষ্ট ছবি, PDF বা টেক্সট দিন।'),
      });
    }
  });

  // =========================================================
  // 2. EXTRACT EDUCATION CERTIFICATE / MARKSHEET
  // =========================================================
  router.post('/extract-education-doc', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          success: false,
          error: 'সার্ভারে AI সার্ভিস কনফিগার করা নেই।',
        });
      }

      const { fileBase64 = '', mimeType = '', fileName = '' } = req.body || {};
      if (!fileBase64) {
        return res.status(400).json({ success: false, error: 'সার্টিফিকেট বা মার্কশিট ফাইল আপলোড করুন।' });
      }

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      const lowerName = String(fileName || '').toLowerCase();
      const lowerMime = String(mimeType || '').toLowerCase();

      if (lowerName.endsWith('.docx') || lowerMime.includes('wordprocessingml')) {
        const text = await extractTextFromDocxBase64(String(fileBase64));
        parts.push({ text: `Extract educational qualification from this document text:\n\n${text.slice(0, 12000)}` });
      } else if (lowerMime === 'application/pdf' || lowerMime.startsWith('image/')) {
        parts.push({
          inlineData: {
            mimeType: lowerMime,
            data: stripDataUriPrefix(String(fileBase64)),
          },
        });
        parts.push({
          text: 'Carefully read this academic certificate or marksheet/transcript and extract the exact details without guessing missing fields.',
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'সার্টিফিকেটের জন্য JPG, PNG, PDF অথবা DOCX ফাইল আপলোড করুন।',
        });
      }

      const response = await generateWithResilience(ai, {
        contents: { parts },
        systemInstruction:
          'Extract academic credential details strictly from the provided certificate/marksheet. Do not guess or invent any GPA, year, board, or university that is not clearly visible.',
        thinkingLevel: ThinkingLevel.LOW,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            degree: { type: Type.STRING },
            institution: { type: Type.STRING },
            fieldOfStudy: { type: Type.STRING },
            location: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            gpa: { type: Type.STRING },
            details: { type: Type.STRING },
          },
          required: ['degree', 'institution', 'fieldOfStudy', 'location', 'startDate', 'endDate', 'gpa', 'details'],
        },
      });

      const extracted = parseJsonSafe<Record<string, string>>(response.text);
      return res.json({ success: true, education: extracted });
    } catch (err: any) {
      console.error('[CVHelper extract-education-doc]', err);
      const status = isTransientAiError(err) ? 503 : 500;
      return res.status(status).json({
        success: false,
        error: formatCleanAiError(err, 'সার্টিফিকেট থেকে তথ্য পড়া যায়নি। অনুগ্রহ করে হাতে তথ্য লিখুন।'),
      });
    }
  });

  // =========================================================
  // 3. CONVERSATIONAL INTERVIEW CONSULTANT STEP
  // =========================================================
  router.post('/interview-step', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          success: false,
          error: 'সার্ভারে AI সার্ভিস কনফিগার করা নেই।',
        });
      }

      const {
        collectedProfile,
        circularAnalysis = null,
        conversationHistory = [],
        lastStepKey = 'start',
        userAnswer = '',
        uiLanguage = 'bn',
      } = req.body || {};

      const langPrompt =
        uiLanguage === 'en'
          ? 'Respond warmly in clear, professional English.'
          : 'Respond warmly and respectfully in natural, polite Bengali (আপনি সম্বোধন করে)। Keep technical/job terms bilingual where helpful.';

      const systemInstruction = `You are an expert Career Consultant & CV Interviewer for "Job CV Making Helper" on tools.mosafabd.com.
${langPrompt}

CRITICAL INTERVIEW RULES:
1. ASK ONLY ONE CLEAR QUESTION AT A TIME. Never dump multiple unrelated questions in one turn.
2. NEVER ask for information that is ALREADY filled inside collectedProfile or clearly skipped earlier in conversationHistory.
3. Extract every structured piece of info from the user's latest answer ("${String(userAnswer).slice(0, 1500)}") into profileUpdates.
   - If user replies "স্কিপ", "skip", "নেই", "no", "fresher" appropriately, respect it and advance smoothly.
   - If an essential field (like fullName or email/phone) looks clearly invalid/incomplete, politely ask for clarification once.
4. INTERVIEW STAGE ORDER (skip any stage already completed in collectedProfile!):
   - Stage A (Personal): Ask ONE field at a time: fullName -> phone -> email -> presentAddress (and city/country) -> optional personal bio (fatherName, motherName, dateOfBirth, permanentAddress, nationality) + linkedin/portfolio only if relevant. Never combine phone and email into a single question!
   - Stage B (Target Job): targetCompany & targetJobTitle OR prompt user to upload the Job Circular (PDF/Image/DOCX) if circularAnalysis is null and targetJobTitle is empty.
   - Stage C (Career Objective): careerGoalNote & strongestQualities (1-2 focused consultant questions).
   - Stage D (Education): Check collectedProfile.education. If empty, ask user to add their educational qualification(s) (or upload certificate/marksheet using the button below).
   - Stage E (Experience): Check collectedProfile.hasWorkExperience & experience. Ask if they have prior job/internship experience. If Fresher (hasWorkExperience=false), ask once about academic projects / volunteering / extracurriculars instead. Never invent work history.
   - Stage F (Skills & Languages): Check collectedProfile.skills & languages. If circularAnalysis has requiredSkills not yet in collectedProfile.skills, include them in suggestedSkills so user can confirm which ones they actually possess!
   - Stage G (Photo & Signature): Ask if they want to attach/crop a passport-size photo & signature (especially if circularAnalysis.requiresPhoto or requiresSignature is true; never force if not needed).
   - Stage H (Dynamic Extra Info): Ask relevant optional items ONCE if applicable (e.g., trainings/certifications/awards, applying abroad, driving license if circular requires it, noticePeriod/expectedSalary/currentlyEmployed, references, preferredCvLanguage).
   - Stage I (Ready): When sufficient info is gathered OR user says "তৈরি করুন / Generate CV / Done", set isReadyToGenerate=true and stepKey="ready_to_generate".

5. Keep quickReplies short clickable hints (2-4 options max, e.g. ["স্কিপ করুন", "ফ্রেশার / অভিজ্ঞতা নেই"] or ["ইংরেজি (English)", "বাংলা (Bengali)"]).
6. Set stepKey strictly to one of:
   personal_name, personal_contact, personal_address, personal_bio, personal_links,
   circular_or_role, career_goal, strongest_qualities,
   education_prompt, experience_check, experience_prompt, projects_prompt,
   skills_prompt, languages_prompt, photo_signature,
   additional_training, additional_career, additional_references, cv_language, ready_to_generate.`;

      const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-10) : [];
      const contextPayload = {
        lastStepKey,
        userAnswer,
        collectedProfile,
        circularAnalysis,
        recentHistory: recentHistory.map((m: any) => ({ role: m.role, text: String(m.text || '').slice(0, 400), stepKey: m.stepKey })),
      };

      try {
        const response = await generateWithResilience(ai, {
          contents: `Analyze the applicant state and produce the next single-question turn JSON:\n${JSON.stringify(contextPayload)}`,
          systemInstruction,
          thinkingLevel: ThinkingLevel.LOW,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              assistantMessage: { type: Type.STRING },
              stepKey: { type: Type.STRING },
              progressPercent: { type: Type.INTEGER },
              isReadyToGenerate: { type: Type.BOOLEAN },
              allowSkip: { type: Type.BOOLEAN },
              quickReplies: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              profileUpdates: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  fatherName: { type: Type.STRING },
                  motherName: { type: Type.STRING },
                  dateOfBirth: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  presentAddress: { type: Type.STRING },
                  permanentAddress: { type: Type.STRING },
                  city: { type: Type.STRING },
                  country: { type: Type.STRING },
                  nationality: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  portfolio: { type: Type.STRING },
                  github: { type: Type.STRING },
                  targetCompany: { type: Type.STRING },
                  targetJobTitle: { type: Type.STRING },
                  careerGoalNote: { type: Type.STRING },
                  strongestQualities: { type: Type.STRING },
                  hasWorkExperienceStr: { type: Type.STRING },
                  drivingLicense: { type: Type.STRING },
                  professionalMembership: { type: Type.STRING },
                  applyingAbroad: { type: Type.STRING },
                  noticePeriod: { type: Type.STRING },
                  expectedSalary: { type: Type.STRING },
                  currentlyEmployed: { type: Type.STRING },
                  preferredCvLanguage: { type: Type.STRING },
                  addSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  addTrainings: { type: Type.ARRAY, items: { type: Type.STRING } },
                  addAwards: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
            required: [
              'assistantMessage',
              'stepKey',
              'progressPercent',
              'isReadyToGenerate',
              'allowSkip',
              'quickReplies',
              'suggestedSkills',
              'profileUpdates',
            ],
          },
        });

        const parsed = parseJsonSafe<any>(response.text);
        return res.json({ success: true, turn: parsed });
      } catch (modelErr: any) {
        if (isTransientAiError(modelErr)) {
          console.warn('[CVHelper interview-step] Using deterministic continuity fallback due to transient 503/429');
          const fallbackTurn = buildFallbackInterviewTurn(
            lastStepKey,
            userAnswer,
            collectedProfile || {},
            circularAnalysis,
            uiLanguage
          );
          return res.json({ success: true, turn: fallbackTurn, usedFallback: true });
        }
        throw modelErr;
      }
    } catch (err: any) {
      console.error('[CVHelper interview-step]', err);
      const status = isTransientAiError(err) ? 503 : 500;
      return res.status(status).json({
        success: false,
        error: formatCleanAiError(err, 'AI পরামর্শদাতার উত্তর তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'),
      });
    }
  });

  // =========================================================
  // 4. GENERATE TAILORED ATS CV + TAILORING REPORT
  // =========================================================
  router.post('/generate-cv', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          success: false,
          error: 'সার্ভারে AI সার্ভিস কনফিগার করা নেই।',
        });
      }

      const {
        profile,
        circularAnalysis = null,
        cvLanguage = 'en',
        uiLanguage = 'bn',
      }: {
        profile: ApplicantInterviewProfile;
        circularAnalysis?: CircularAnalysis | null;
        cvLanguage?: 'en' | 'bn';
        uiLanguage?: 'en' | 'bn';
      } = req.body || {};

      if (!profile || !profile.fullName) {
        return res.status(400).json({
          success: false,
          error: 'CV তৈরি করার আগে অন্তত আবেদনকারীর পূর্ণ নাম ও মৌলিক তথ্য দিন।',
        });
      }

      const targetLangName = cvLanguage === 'bn' ? 'Bengali (প্রমিত ও পেশাদার বাংলা)' : 'English (international ATS corporate standard)';

      const systemInstruction = `You are an elite executive CV writer and ATS specialist.
Create a complete, job-tailored, ATS-friendly CV strictly in ${targetLangName} based ONLY on the applicant's verified data and target job circular.

CRITICAL TRUTHFULNESS & QUALITY RULES:
1. ZERO FABRICATION: Never invent employers, job titles, employment dates, degrees, institutions, GPAs, certifications, awards, or unconfirmed skills.
2. TAILORING & POLISH:
   - Craft a strong, personalized 2-4 sentence Career Objective / Professional Summary specifically aligned with "${profile.targetJobTitle || circularAnalysis?.jobTitle || 'Target Role'}" at "${profile.targetCompany || circularAnalysis?.organizationName || 'Target Organization'}". Avoid hollow cliches.
   - Polish each real work experience bullet into clear, impactful, action-verb sentences aligned with the target role while staying 100% truthful to the user's stated duties.
   - Order and group the user's real skills intelligently (categorizing each skill strictly as one of: "technical", "soft", "tool", "industry").
   - Only include personal bio block (includePersonalDetailsBlock=true) if fatherName, motherName, dateOfBirth, or permanentAddress was provided AND is helpful for local/government/corporate Bangladesh CVs or requested by the circular.
   - Include aiExtraSections ONLY when the user genuinely provided extra details like trainings, awards, drivingLicense, professionalMembership, noticePeriod, expectedSalary, or applyingAbroad.
3. REPORT:
   - Estimate a realistic ATS match score (50–98) based on keyword alignment between the circular and the candidate's verified qualifications.
   - List matchedKeywords and missingKeywords honestly.
   - Recommend the single best CVCategory from: ${VALID_CATEGORIES.join(', ')}.`;

      const response = await generateWithResilience(ai, {
        contents: `Generate tailored CV JSON and tailoring report from:\n${JSON.stringify({
          verifiedProfile: {
            ...profile,
            photoUrl: profile.photoUrl ? '[ATTACHED_PHOTO]' : '',
            signatureUrl: profile.signatureUrl ? '[ATTACHED_SIGNATURE]' : '',
          },
          circularAnalysis,
          targetCvLanguage: cvLanguage,
          explanationLanguage: uiLanguage,
        })}`,
        systemInstruction,
        thinkingLevel: ThinkingLevel.MEDIUM,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobTitleHeadline: { type: Type.STRING },
            summary: { type: Type.STRING },
            includePersonalDetailsBlock: { type: Type.BOOLEAN },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jobTitle: { type: Type.STRING },
                  employer: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  description: { type: Type.STRING },
                  achievements: { type: Type.STRING },
                },
                required: ['jobTitle', 'employer', 'location', 'startDate', 'endDate', 'current', 'description'],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  gpa: { type: Type.STRING },
                  details: { type: Type.STRING },
                },
                required: ['degree', 'institution', 'fieldOfStudy', 'location', 'startDate', 'endDate'],
              },
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  level: { type: Type.STRING },
                },
                required: ['name', 'category'],
              },
            },
            languages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  language: { type: Type.STRING },
                  proficiency: { type: Type.STRING },
                },
                required: ['language', 'proficiency'],
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  link: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['name', 'role', 'description'],
              },
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING },
                  link: { type: Type.STRING },
                },
                required: ['name', 'issuer', 'date'],
              },
            },
            aiExtraSections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ['title', 'content'],
              },
            },
            report: {
              type: Type.OBJECT,
              properties: {
                atsScoreEstimate: { type: Type.INTEGER },
                matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                tailoringNotesBn: { type: Type.STRING },
                tailoringNotesEn: { type: Type.STRING },
                recommendedCategory: { type: Type.STRING },
              },
              required: [
                'atsScoreEstimate',
                'matchedKeywords',
                'missingKeywords',
                'tailoringNotesBn',
                'tailoringNotesEn',
                'recommendedCategory',
              ],
            },
          },
          required: [
            'jobTitleHeadline',
            'summary',
            'includePersonalDetailsBlock',
            'experience',
            'education',
            'skills',
            'languages',
            'projects',
            'certifications',
            'aiExtraSections',
            'report',
          ],
        },
      });

      const generated = parseJsonSafe<any>(response.text);

      const cvData: CVData = {
        personal: {
          fullName: profile.fullName,
          jobTitle: generated.jobTitleHeadline || profile.targetJobTitle || circularAnalysis?.jobTitle || '',
          photoUrl: profile.photoUrl || '',
          email: profile.email || '',
          phone: profile.phone || '',
          city: profile.city || '',
          country: profile.country || 'Bangladesh',
          address: profile.presentAddress || '',
          linkedin: profile.linkedin || '',
          portfolio: profile.portfolio || '',
          github: profile.github || '',
          nationality: profile.nationality || 'Bangladeshi',
          fatherName: profile.fatherName || '',
          motherName: profile.motherName || '',
          dateOfBirth: profile.dateOfBirth || '',
          permanentAddress: profile.permanentAddress || '',
          signatureUrl: profile.signatureUrl || '',
          includePersonalDetailsBlock: Boolean(
            generated.includePersonalDetailsBlock &&
              (profile.fatherName || profile.motherName || profile.dateOfBirth || profile.permanentAddress)
          ),
        },
        summary: generated.summary || '',
        experience: Array.isArray(generated.experience)
          ? generated.experience.map((e: any, idx: number) => ({
              id: `exp-${Date.now()}-${idx}`,
              jobTitle: e.jobTitle || '',
              employer: e.employer || '',
              location: e.location || '',
              startDate: e.startDate || '',
              endDate: e.endDate || '',
              current: Boolean(e.current),
              description: e.description || '',
              achievements: e.achievements || '',
            }))
          : [],
        education: Array.isArray(generated.education)
          ? generated.education.map((ed: any, idx: number) => ({
              id: `edu-${Date.now()}-${idx}`,
              degree: ed.degree || '',
              institution: ed.institution || '',
              fieldOfStudy: ed.fieldOfStudy || '',
              location: ed.location || '',
              startDate: ed.startDate || '',
              endDate: ed.endDate || '',
              gpa: ed.gpa || '',
              details: ed.details || '',
            }))
          : [],
        skills: Array.isArray(generated.skills)
          ? generated.skills.map((sk: any, idx: number) => ({
              id: `sk-${Date.now()}-${idx}`,
              name: sk.name || '',
              category: ['technical', 'soft', 'tool', 'industry'].includes(sk.category) ? sk.category : 'technical',
              level: sk.level || '',
            }))
          : [],
        languages: Array.isArray(generated.languages)
          ? generated.languages.map((l: any, idx: number) => ({
              id: `lang-${Date.now()}-${idx}`,
              language: l.language || '',
              proficiency: l.proficiency || '',
            }))
          : [],
        projects: Array.isArray(generated.projects)
          ? generated.projects.map((p: any, idx: number) => ({
              id: `proj-${Date.now()}-${idx}`,
              name: p.name || '',
              role: p.role || '',
              link: p.link || '',
              startDate: p.startDate || '',
              endDate: p.endDate || '',
              description: p.description || '',
            }))
          : [],
        certifications: Array.isArray(generated.certifications)
          ? generated.certifications.map((c: any, idx: number) => ({
              id: `cert-${Date.now()}-${idx}`,
              name: c.name || '',
              issuer: c.issuer || '',
              date: c.date || '',
              link: c.link || '',
            }))
          : [],
        references: Array.isArray(profile.references) ? profile.references : [],
        aiExtraSections: Array.isArray(generated.aiExtraSections)
          ? generated.aiExtraSections
              .filter((s: any) => s?.title && s?.content)
              .map((s: any, idx: number) => ({
                id: `extra-${Date.now()}-${idx}`,
                title: s.title,
                content: s.content,
              }))
          : [],
      };

      const recCat: CVCategory = VALID_CATEGORIES.includes(generated.report?.recommendedCategory)
        ? generated.report.recommendedCategory
        : circularAnalysis?.suggestedCategory || 'ats-friendly';

      const tailoringReport: CVTailoringReport = {
        atsScoreEstimate: Math.min(99, Math.max(40, Number(generated.report?.atsScoreEstimate) || 82)),
        matchedKeywords: Array.isArray(generated.report?.matchedKeywords) ? generated.report.matchedKeywords : [],
        missingKeywords: Array.isArray(generated.report?.missingKeywords) ? generated.report.missingKeywords : [],
        tailoringNotesBn: generated.report?.tailoringNotesBn || 'আপনার যোগ্যতা ও অভিজ্ঞতা অনুযায়ী প্রফেশনালভাবে CV সাজানো হয়েছে।',
        tailoringNotesEn: generated.report?.tailoringNotesEn || 'Tailored cleanly using verified credentials and ATS action verbs.',
        recommendedCategory: recCat,
        recommendedTemplateIds: CATEGORY_TEMPLATE_DEFAULTS[recCat] || ['tmpl-01', 'tmpl-11', 'tmpl-02'],
      };

      return res.json({ success: true, cvData, tailoringReport });
    } catch (err: any) {
      console.error('[CVHelper generate-cv]', err);
      const status = isTransientAiError(err) ? 503 : 500;
      return res.status(status).json({
        success: false,
        error: formatCleanAiError(err, 'CV জেনারেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'),
      });
    }
  });

  // =========================================================
  // 5. PRIVATE AUTH-GATED USER LIBRARY (/library, /profile, /cvs)
  // =========================================================
  router.get('/library', async (req, res) => {
    const authResult = await verifyUserBearerToken(req, firebaseProjectId);
    if (!authResult.ok) {
      return res.status(authResult.status).json({ success: false, error: authResult.error });
    }
    const store = readUserStore(authResult.uid);
    return res.json({
      success: true,
      profile: store.profile,
      savedCvs: store.savedCvs,
    });
  });

  router.put('/profile', async (req, res) => {
    const authResult = await verifyUserBearerToken(req, firebaseProjectId);
    if (!authResult.ok) {
      return res.status(authResult.status).json({ success: false, error: authResult.error });
    }
    const profile = req.body?.profile as ApplicantInterviewProfile | undefined;
    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ success: false, error: 'প্রোফাইল ডাটা সঠিক নয়।' });
    }

    const updated = await withUserLock(authResult.uid, async () => {
      const store = readUserStore(authResult.uid);
      store.profile = profile;
      store.updatedAt = new Date().toISOString();
      writeUserStoreAtomic(authResult.uid, store);
      return store;
    });

    return res.json({ success: true, profile: updated.profile });
  });

  router.put('/cvs/:cvId', async (req, res) => {
    const authResult = await verifyUserBearerToken(req, firebaseProjectId);
    if (!authResult.ok) {
      return res.status(authResult.status).json({ success: false, error: authResult.error });
    }
    const cvId = req.params.cvId;
    if (!VALID_ID_REGEX.test(cvId)) {
      return res.status(400).json({ success: false, error: 'অকার্যকর CV আইডি।' });
    }
    const cvRecord = req.body?.cv as SavedJobCV | undefined;
    if (!cvRecord || typeof cvRecord !== 'object' || !cvRecord.cvData) {
      return res.status(400).json({ success: false, error: 'CV ডাটা সঠিক নয়।' });
    }

    const normalizedRecord: SavedJobCV = {
      ...cvRecord,
      id: cvId,
      updatedAt: new Date().toISOString(),
      createdAt: cvRecord.createdAt || new Date().toISOString(),
    };

    const savedCvs = await withUserLock(authResult.uid, async () => {
      const store = readUserStore(authResult.uid);
      const idx = store.savedCvs.findIndex((c) => c.id === cvId);
      if (idx >= 0) {
        store.savedCvs[idx] = normalizedRecord;
      } else {
        store.savedCvs.unshift(normalizedRecord);
      }
      store.updatedAt = new Date().toISOString();
      writeUserStoreAtomic(authResult.uid, store);
      return store.savedCvs;
    });

    return res.json({ success: true, cv: normalizedRecord, savedCvs });
  });

  router.delete('/cvs/:cvId', async (req, res) => {
    const authResult = await verifyUserBearerToken(req, firebaseProjectId);
    if (!authResult.ok) {
      return res.status(authResult.status).json({ success: false, error: authResult.error });
    }
    const cvId = req.params.cvId;
    if (!VALID_ID_REGEX.test(cvId)) {
      return res.status(400).json({ success: false, error: 'অকার্যকর CV আইডি।' });
    }

    const savedCvs = await withUserLock(authResult.uid, async () => {
      const store = readUserStore(authResult.uid);
      store.savedCvs = store.savedCvs.filter((c) => c.id !== cvId);
      store.updatedAt = new Date().toISOString();
      writeUserStoreAtomic(authResult.uid, store);
      return store.savedCvs;
    });

    return res.json({ success: true, savedCvs });
  });

  return router;
}
