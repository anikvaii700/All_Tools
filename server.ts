import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { STUDYMATE_MASTER_SYSTEM_PROMPT } from './src/data/studymateMasterPrompt.ts';
import { APP_VERSION_CONFIG } from './src/versionConfig.ts';
import { TOOLS_SEO_REGISTRY, HOMEPAGE_SEO } from './src/data/seoToolsData.ts';
import { injectSeoTagsIntoHtml } from './src/utils/seoHtmlRenderer.ts';
import { createShopRouter } from './server/shopStore.ts';
import { createCvHelperRouter } from './server/cvHelperRoutes.ts';

const STUDYMATE_SYSTEM_INSTRUCTION = STUDYMATE_MASTER_SYSTEM_PROMPT;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON parser with 25MB limit for high-res photo uploads of questions/textbooks
  app.use(express.json({ limit: '25mb' }));

  // Strictly prevent stale service workers & cached HTML/version in iFrame dev previews and production
  app.use((req, res, next) => {
    if (
      req.path === '/' ||
      req.path === '/index.html' ||
      req.path === '/sw.js' ||
      req.path === '/version.json' ||
      req.path === '/manifest.json' ||
      req.path.startsWith('/api/system/version')
    ) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  // Initialize Google GenAI
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Live System Version Broadcast API (Controlled by master command 'Update ON' / 'Update OFF')
  app.get('/api/system/version', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({
      success: true,
      ...APP_VERSION_CONFIG,
      serverTime: new Date().toISOString(),
    });
  });

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(apiKey),
      model: 'gemini-3.8-flash',
      version: APP_VERSION_CONFIG.version,
      isUpdateOn: APP_VERSION_CONFIG.isUpdateOn,
    });
  });

  // ----------------------------------------------------
  // Exclusive Single Admin Authorization (01743224700)
  // ----------------------------------------------------
  const AUTHORIZED_ADMIN_PHONE = '01743224700';
  const AUTHORIZED_ADMIN_SYNTHETIC_EMAIL = 'user_01743224700@phone.mosafabd.com';
  const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'ai-studio-applet-webapp-2019a';

  if (!getApps().length) {
    try {
      initializeApp({
        projectId: FIREBASE_PROJECT_ID,
      });
    } catch (err) {
      console.warn('Firebase Admin SDK initialization note:', err);
    }
  }

  async function authenticateAdminRequest(req: express.Request): Promise<{ authorized: boolean; uid?: string; phone?: string; error?: string }> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'অননুমোদিত: টোকেন অনুপস্থিত (Missing Bearer Token)' };
    }
    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) {
      return { authorized: false, error: 'অননুমোদিত: ফাঁকা টোকেন' };
    }

    let decodedToken: DecodedIdToken | null = null;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            return { authorized: false, error: 'টোকেনের মেয়াদ শেষ হয়ে গেছে (Token Expired)' };
          }
          if (
            payload.aud !== FIREBASE_PROJECT_ID &&
            payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`
          ) {
            return { authorized: false, error: 'টোকেন প্রজেক্ট অসামঞ্জস্যপূর্ণ' };
          }
          decodedToken = payload as any;
        }
      } catch {
        return { authorized: false, error: 'টোকেন যাচাইকরণ ব্যর্থ হয়েছে' };
      }
    }

    if (!decodedToken) {
      return { authorized: false, error: 'টোকেন যাচাই করা সম্ভব হয়নি' };
    }

    const email = (decodedToken.email || '').toLowerCase();
    const phone = decodedToken.phone_number || '';
    const digits = phone.replace(/[^0-9]/g, '');
    const normalizedPhone =
      digits.startsWith('880') && digits.length === 13
        ? '0' + digits.slice(3)
        : digits.startsWith('88') && digits.length === 13
        ? digits.slice(2)
        : digits;

    const isMatch = email === AUTHORIZED_ADMIN_SYNTHETIC_EMAIL || normalizedPhone === AUTHORIZED_ADMIN_PHONE;

    if (!isMatch) {
      return {
        authorized: false,
        error: 'অ্যাক্সেস ডিনাইড: শুধুমাত্র অনুমোদিত অ্যাডমিন একাউন্ট (01743224700) এই অপারেশন করতে পারবে। (HTTP 403 Forbidden)',
      };
    }

    return { authorized: true, uid: decodedToken.uid, phone: AUTHORIZED_ADMIN_PHONE };
  }

  // 1. Admin Verification Endpoint
  app.get('/api/admin/verify', async (req, res) => {
    const authResult = await authenticateAdminRequest(req);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        authorized: false,
        error: authResult.error || 'অ্যাক্সেস ডিনাইড (HTTP 403 Forbidden)',
      });
    }
    res.json({
      success: true,
      authorized: true,
      phone: AUTHORIZED_ADMIN_PHONE,
      uid: authResult.uid,
      message: 'এডমিন একাউন্ট সফলভাবে যাচাইকৃত 🔓',
    });
  });

  // 2. Admin Privileged Operation Route Guardian
  app.all('/api/admin/*', async (req, res, next) => {
    if (req.path === '/api/admin/verify') return next();
    const authResult = await authenticateAdminRequest(req);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        authorized: false,
        error: authResult.error || 'অ্যাক্সেস ডিনাইড: অননুমোদিত ইউজার (HTTP 403 Forbidden)',
      });
    }
    next();
  });

  // ----------------------------------------------------
  // My Digital Shop Management Multi-Tenant API (/api/shop/*)
  // ----------------------------------------------------
  app.use('/api/shop', createShopRouter(path.resolve(__dirname, '.data'), FIREBASE_PROJECT_ID));

  // ----------------------------------------------------
  // Job CV Making Helper AI & Private Library API (/api/cv-helper/*)
  // ----------------------------------------------------
  app.use('/api/cv-helper', createCvHelperRouter(path.resolve(__dirname, '.data'), FIREBASE_PROJECT_ID, ai));

  // Chat & Visual Question Solver API
  app.post('/api/studymate/chat', async (req, res) => {
    try {
      const {
        messages = [],
        studentName = '',
        studentClass = '',
        currentSubject = '',
        actionType = 'chat',
        imageBase64 = null,
        imageMimeType = 'image/jpeg',
      } = req.body;

      if (!ai) {
        // Fallback response if GEMINI_API_KEY is not yet populated
        return res.json({
          success: true,
          reply: `স্বাগতম The MoSaFa StudyMate BD-তে! 🎓\n\nপ্রিয় ${
            studentName || 'শিক্ষার্থী'
          }! আমি তোমার অল-ইন-ওয়ান AI প্রাইভেট টিউটর ও প্রশ্ন সমাধানকারী।\n\nতোমার প্রশ্ন বা যে-কোনো অঙ্ক/বইয়ের পৃষ্ঠার ছবি পাঠাও। আমি প্রতিটি ধাপ সহজ বাংলায় বুঝিয়ে দেব।\n\nশেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓`,
          isFallback: true,
        });
      }

      // Format conversation contents for gemini-3.8-flash
      // Build tailored system instruction with student info
      let customizedInstruction = STUDYMATE_SYSTEM_INSTRUCTION;
      if (studentName) {
        customizedInstruction = customizedInstruction.replace(
          /\{\{student_name\}\}/g,
          studentName
        );
      } else {
        customizedInstruction = customizedInstruction.replace(
          /\{\{student_name\}\}/g,
          'শিক্ষার্থী বন্ধু'
        );
      }

      customizedInstruction += `\n\nCRITICAL TEACHER & COUNSELOR MANDATE:
- PERSONALIZED ENGAGEMENT: If studentName is provided ("${studentName}"), address the user respectfully and warmly by name (যেমন: "${studentName} ভাই / আপু / শিক্ষার্থী"). Ask them directly what study service, advice, or subject guidance they need today.
- ZERO CANNED TEMPLATES: Do NOT send rigid, robotic auto-replies or generic numbered menus. Keep conversation completely custom, insightful, and natural.
- EXAM & ACADEMIC CONSULTATION: If the student mentions their school, college, or exam preparation (SSC, HSC, Admission, BCS, Job, Madrasah), act as an elite educational consultant: give actionable study strategies, key syllabus insights, time-management tips, and step-by-step problem-solving.
- STRICT ZERO-ERROR POLICY: Zero arithmetic, algebraic, scientific, or grammatical mistakes. Double-check all intermediate calculations, +/- signs, units, and formulas before outputting.`;

      if (studentClass) {
        customizedInstruction += `\n\nActive Student Profile: Name="${studentName}", Class/Level="${studentClass}", Current Subject="${currentSubject}". Tailor difficulty, guidance and syllabus specifically to ${studentClass}.`;
      }

      // Build normalized contents for Google GenAI
      const candidateTurns: Array<{
        role: 'user' | 'model';
        parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
      }> = [];

      const recentMessages = messages.slice(-10);
      for (let i = 0; i < recentMessages.length; i++) {
        const msg = recentMessages[i];
        const isLastTurn = i === recentMessages.length - 1;
        const role: 'user' | 'model' =
          msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user';

        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

        // Image attachment
        if (msg.image && msg.image.data) {
          parts.push({
            inlineData: {
              mimeType: msg.image.mimeType || 'image/jpeg',
              data: msg.image.data.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''),
            },
          });
        } else if (isLastTurn && imageBase64) {
          parts.push({
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, ''),
            },
          });
        }

        let userPromptText = (msg.text || '').trim();
        if (isLastTurn && actionType && actionType !== 'chat') {
          if (actionType === 'solve') {
            userPromptText +=
              '\n[নির্দেশনা: এই অঙ্কের/প্রশ্নের সবচেয়ে সহজ ও ধাপে ধাপে সম্পূর্ণ সমাধান (Step-by-Step Solution) তৈরি করো।]';
          } else if (actionType === 'explain') {
            userPromptText +=
              '\n[নির্দেশনা: এই প্রশ্নটি সহজ ভাষায় মৌলিক ধারণা থেকে বুঝিয়ে দাও।]';
          } else if (actionType === 'mcq') {
            userPromptText +=
              '\n[নির্দেশনা: এই বিষয়ের ওপর ৫টি প্রমিত MCQ তৈরি করো এবং ক, খ, গ, ঘ বিকল্প দাও।]';
          } else if (actionType === 'rule') {
            userPromptText +=
              '\n[নির্দেশনা: এই প্রশ্নে ব্যবহৃত সূত্র ও গাণিতিক নিয়মাবলি বিস্তারিত বুঝিয়ে দাও।]';
          } else if (actionType === 'find_mistake') {
            userPromptText +=
              '\n[নির্দেশনা: ছবিতে করা সমাধানের ধাপগুলো পুঙ্খানুপুঙ্খ পরীক্ষা করে ভুল চিহ্নিত করো এবং সঠিক সমাধান দেখাও।]';
          } else if (actionType === 'exam_write') {
            userPromptText +=
              '\n[নির্দেশনা: পরীক্ষার খাতায় সর্বোচ্চ নম্বর পাওয়ার মতো সুন্দর ও সুবিন্যস্ত উত্তর লিখে দাও।]';
          }
        }

        if (userPromptText) {
          parts.push({ text: userPromptText });
        } else if (parts.length > 0) {
          parts.push({
            text: 'এই ছবিটি ভালো করে দেখে শিক্ষার্থী যা জানতে চেয়েছেন বা প্রয়োজনীয় সমাধান প্রদান করুন।',
          });
        }

        if (parts.length > 0) {
          // Merge consecutive turns of identical role
          if (
            candidateTurns.length > 0 &&
            candidateTurns[candidateTurns.length - 1].role === role
          ) {
            candidateTurns[candidateTurns.length - 1].parts.push(...parts);
          } else {
            candidateTurns.push({ role, parts });
          }
        }
      }

      // Gemini requires contents to start with a 'user' turn
      while (candidateTurns.length > 0 && candidateTurns[0].role === 'model') {
        candidateTurns.shift();
      }

      // If no valid turns remain, create a clean default user turn
      if (candidateTurns.length === 0) {
        const fallbackText = messages.slice(-1)[0]?.text || 'নমস্কার / আসসালামু আলাইকুম, আমি StudyMate BD শুরু করতে চাই।';
        candidateTurns.push({
          role: 'user',
          parts: [{ text: fallbackText }],
        });
      }

      const isStream =
        req.query.stream === 'true' ||
        req.headers.accept?.includes('text/event-stream') ||
        req.body?.stream === true;

      // Smart helper for instant contextual replies
      const getContextualReply = (userText: string) => {
        if (/দশম|১০|10|নবম|৯|9|ssc|class\s*10|class\s*9|ক্লাস\s*টেন|ক্লাস\s*৯|ক্লাস\s*১০/i.test(userText)) {
          return `দারুণ! 🎯 দশম শ্রেণির (Class 10 / SSC) পড়াশোনা ও পরীক্ষার প্রস্তুতিতে আমি তোমাকে ধাপে ধাপে সাহায্য করব।

**আজকে তুমি কী করতে চাও?**

১. 📚 কোনো নির্দিষ্ট বিষয় বা অধ্যায় বুঝতে চাই
২. 📝 MCQ কুইজ / CQ / মডেল টেস্ট দিতে চাই
৩. 🎯 পরীক্ষার গুরুত্বপূর্ণ টপিক ও শর্ট সাজেশন চাই
৪. 📅 পড়ার রুটিন ও পরীক্ষার প্রস্তুতির প্ল্যান চাই
৫. ✍️ কোনো কঠিন অঙ্ক বা প্রশ্নের সমাধান চাই
৬. 💡 গুরুত্বপূর্ণ সূত্র (Formulas) ও শর্টকাট শিখতে চাই
৭. 🔄 রিভিশন ও আগের পড়া ঝালাই করে নিতে চাই
৮. 📸 অঙ্ক বা বইয়ের পাতার ছবি পাঠিয়ে সরাসরি সমাধান চাই

তোমার পছন্দের নম্বরটি লিখে জানাও, অথবা সরাসরি বলো আজ কী পড়তে চাও। 😊

---
*শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓*`;
        } else if (/একাদশ|দ্বাদশ|11|12|hsc|এইচএসসি|ইন্টার/i.test(userText)) {
          return `দারুণ! 🎯 একাদশ–দ্বাদশ শ্রেণির (HSC) বিজ্ঞান, মানবিক বা ব্যবসায় শিক্ষা পরীক্ষার প্রস্তুতিতে আমি তোমাকে ধাপে ধাপে সাহায্য করব।

**আজকে তুমি কী করতে চাও?**

১. 📚 কোনো নির্দিষ্ট বিষয় বা অধ্যায় বুঝতে চাই
২. 📝 ৫টি প্রমিত MCQ কুইজ দিয়ে প্রস্তুতি যাচাই
৩. 🎯 পরীক্ষার গুরুত্বপূর্ণ টপিক ও শর্ট সাজেশন
৪. 📅 পড়ার রুটিন ও প্রস্তুতির প্ল্যান
৫. 💡 ফিজিক্স/কেমিস্ট্রি/ম্যাথের সূত্র ও শর্টকাট
৬. 📸 অঙ্ক বা বইয়ের পাতার ছবি পাঠিয়ে সরাসরি সমাধান চাই

তোমার পছন্দের নম্বরটি জানাও, অথবা সরাসরি বিষয়ের নাম লিখো। 😊

---
*শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓*`;
        } else if (/ভর্তি|মেডিকেল|ইঞ্জিনিয়ারিং|বুয়েট|বিশ্ববিদ্যালয়|admission|buet|du/i.test(userText)) {
          return `দারুণ! 🎯 বিশ্ববিদ্যালয় / মেডিকেল / ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার লক্ষ্য অর্জন করতে আমি তোমাকে সর্বোত্তম গাইডলাইন ও অনুশীলনে সাহায্য করব।

**আজকে তোমার পড়ার পরিকল্পনা কী?**
১. 📚 বিগত বছরের ভর্তি পরীক্ষার প্রশ্নব্যাংক সলভ
২. 📝 টাইপভিত্তিক জটিল অঙ্ক ও শর্টকাট টেকনিক
৩. ⏱️ দ্রুত উত্তর করার MCQ স্পিড টেস্ট
৪. 📸 কঠিন কোনো অঙ্কের ছবি পাঠিয়ে সমাধান নেওয়া

পছন্দের নম্বরটি লিখো বা তোমার লক্ষ্য জানাও! 😊

---
*শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓*`;
        } else if (/বিসিএস|চাকরি|bcs|job|ব্যাংক/i.test(userText)) {
          return `দারুণ! 🎯 বিসিএস ও সরকারি-বেসরকারি চাকরির প্রিলিমিনারি ও লিখিত পরীক্ষার পূর্ণাঙ্গ প্রস্তুতিতে আমি তোমার পাশে আছি।

**আজকে কী অনুশীলন করতে চাও?**
১. 📝 বাংলা, ইংরেজি, গণিত বা সাধারণ জ্ঞানের কুইজ
২. 💡 গণিত ও মানসিক দক্ষতার সুপার শর্টকাট
৩. 📅 বিসিএস প্রিলিমিনারি রুটিন ও রিভিশন প্ল্যান

পছন্দের বিষয়টি লিখে জানাও! 😊

---
*শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓*`;
        }
        return `প্রিয় শিক্ষার্থী বন্ধু! 😊 তোমার বার্তাটি পেয়েছি।

পড়াশোনা সহজ করা, কঠিন বিষয় বুঝিয়ে দেওয়া, অঙ্ক সমাধান ও কুইজ নেওয়ার জন্য আমি প্রস্তুত। তুমি কোন বিষয়ে সাহায্য চাও বা তোমার প্রশ্নটি বিস্তারিত লিখে জানাও।

---
*শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓*`;
      };

      const userTurns = messages.filter((m: any) => m.role === 'user');
      const lastUserTurn = (userTurns.slice(-1)[0]?.text || '').trim();
      const isInitialOnboarding = userTurns.length <= 2 && !imageBase64;
      const isClassSelection = /দশম|১০|10|নবম|৯|9|ssc|class\s*10|class\s*9|ক্লাস\s*টেন|ক্লাস\s*৯|ক্লাস\s*১০|একাদশ|দ্বাদশ|11|12|hsc|এইচএসসি|ইন্টার|ভর্তি|মেডিকেল|ইঞ্জিনিয়ারিং|admission|বিসিএস|চাকরি|bcs/i.test(lastUserTurn);

      // Fast-path: If user is selecting their class/exam level on onboarding, reply instantly (<50ms)
      if (isInitialOnboarding && isClassSelection) {
        const instantReply = getContextualReply(lastUserTurn);
        if (isStream) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('X-Accel-Buffering', 'no');
          res.flushHeaders?.();
          res.write(`data: ${JSON.stringify({ text: instantReply })}\n\n`);
          res.write('data: [DONE]\n\n');
          return res.end();
        } else {
          return res.json({ success: true, reply: instantReply });
        }
      }

      // Stream generation mode (Lightning speed token-by-token)
      if (isStream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();

        let streamedAny = false;
        const candidateModels = [
          'gemini-3.1-flash-lite',
          'gemini-3.8-flash',
          'gemini-flash-latest',
        ];

        for (const modelName of candidateModels) {
          try {
            const stream = await ai.models.generateContentStream({
              model: modelName,
              contents: candidateTurns,
              config: {
                systemInstruction: customizedInstruction,
                temperature: 0.7,
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.MINIMAL,
                },
              },
            });

            for await (const chunk of stream) {
              if (chunk.text) {
                streamedAny = true;
                res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
              }
            }

            if (streamedAny) {
              break;
            }
          } catch (modelErr: any) {
            console.warn(`[StudyMate Stream] Model ${modelName} error:`, modelErr?.message || modelErr);
            if (streamedAny) break;
          }
        }

        if (!streamedAny) {
          const fallback = getContextualReply(lastUserTurn);
          res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        return res.end();
      }

      // Standard JSON fallback mode
      let reply = '';
      const candidateModels = [
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
        'gemini-flash-latest',
      ];

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: candidateTurns,
            config: {
              systemInstruction: customizedInstruction,
              temperature: 0.7,
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.MINIMAL,
              },
            },
          });
          if (response && response.text) {
            reply = response.text.trim();
            break;
          }
        } catch (modelErr: any) {
          console.warn(`[StudyMate] Model ${modelName} error:`, modelErr?.message || modelErr);
        }
      }

      if (!reply) {
        reply = getContextualReply(lastUserTurn);
      }

      return res.json({
        success: true,
        reply,
      });
    } catch (error: any) {
      console.error('StudyMate AI Chat Error:', error);
      if (req.query.stream === 'true' || req.headers.accept?.includes('text/event-stream')) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.write(`data: ${JSON.stringify({ text: `প্রিয় শিক্ষার্থী বন্ধু! 😊 পড়াশোনা ও পরীক্ষার প্রস্তুতিতে আমি তোমার পাশে আছি।\n\nতোমার প্রশ্ন, অঙ্ক বা কোন বিষয় পড়তে চাও তা লিখে জানাও অথবা বইয়ের পৃষ্ঠার ছবি পাঠাও। আমি ধাপে ধাপে বুঝিয়ে দেব।\n\n---\n*শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓*` })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
      return res.json({
        success: true,
        reply: `প্রিয় শিক্ষার্থী বন্ধু! 😊 পড়াশোনা ও পরীক্ষার প্রস্তুতিতে আমি তোমার পাশে আছি।\n\nতোমার প্রশ্ন, অঙ্ক বা কোন বিষয় পড়তে চাও তা লিখে জানাও অথবা বইয়ের পৃষ্ঠার ছবি পাঠাও। আমি ধাপে ধাপে বুঝিয়ে দেব।\n\n---\n*শেখা হোক সহজ, প্রস্তুতি হোক স্মার্ট, সাফল্যের পথে পাশে থাকুক The MoSaFa StudyMate BD! 🎓*`,
      });
    }
  });

  // MoSaFa Application Writer AI Assistance API
  app.post('/api/application-writer/ai-assist', async (req, res) => {
    try {
      const {
        text = '',
        action = 'improve',
        tone = 'Formal',
        documentType = 'Application',
        language = 'bn',
      } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ success: false, error: 'Text is required' });
      }

      if (!ai) {
        return res.json({
          success: false,
          isAiAvailable: false,
          message: 'Gemini API কী সার্ভারে কনফিগার করা নেই। লোকাল টেমপ্লেট ও এডিটর সক্রিয় রয়েছে।',
        });
      }

      let instruction = '';
      switch (action) {
        case 'improve':
          instruction = `You are an expert formal document writer in Bangladesh. Improve the quality, tone, and readability of the following document. Make it highly professional and respectful. Keep all names, dates, placeholders, and structure intact. Return ONLY the revised document text, with NO conversational preamble or explanations.`;
          break;
        case 'formal':
          instruction = `You are a legal and administrative formal document specialist in Bangladesh. Transform the following document into a strictly formal and official administrative style. Keep all names, dates, placeholders, and structure intact. Return ONLY the revised document text.`;
          break;
        case 'short':
          instruction = `You are an executive editor. Make the following document concise, crisp, and to-the-point without losing any critical facts, dates, names, or official requests. Return ONLY the revised document text.`;
          break;
        case 'detailed':
          instruction = `You are an administrative letter writer. Expand and elaborate on the following document, providing courteous, respectful, and complete formal descriptions for the request/situation. Keep all placeholders and facts intact. Return ONLY the revised document text.`;
          break;
        case 'grammar':
          instruction = `You are an expert Bengali and English proofreader. Correct all spelling, grammar, punctuation, and phrasing errors in the following document. Do not alter the core facts or names. Return ONLY the revised document text.`;
          break;
        case 'translate-en':
          instruction = `Translate the following formal Bengali document into a pristine, highly formal British/international English official letter format. Retain the same structure, names, and placeholders. Return ONLY the English document text.`;
          break;
        case 'translate-bn':
          instruction = `Translate the following formal English letter into a standard formal Bengali application/letter (প্রমিত দাপ্তরিক বাংলা দরখাস্ত রীতি). Use appropriate Bengali administrative salutations (বরাবর, জনাব, অতএব বিনীত নিবেদন ইত্যাদি). Return ONLY the Bengali document text.`;
          break;
        case 'simple-bn':
          instruction = `Rewrite the following Bengali document in clear, simple, respectful, and easy-to-understand Bengali (সহজ ও সাবলীল প্রমিত বাংলা) so that common citizens and officials can understand it effortlessly. Return ONLY the revised document text.`;
          break;
        default:
          instruction = `Improve and polish the following formal document. Tone: ${tone}. Document type: ${documentType}. Language: ${language}. Return ONLY the revised document text with NO conversational filler.`;
      }

      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      let enhancedText = '';
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [{ text: `${instruction}\n\n[DOCUMENT CONTENT START]\n${text}\n[DOCUMENT CONTENT END]` }],
              },
            ],
            config: {
              temperature: 0.3,
            },
          });
          if (response && response.text) {
            enhancedText = response.text.trim();
            // Remove markdown code fences if model wrapped them
            enhancedText = enhancedText.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
            break;
          }
        } catch (err: any) {
          console.warn(`[ApplicationWriter] Model ${modelName} error:`, err?.message || err);
        }
      }

      if (!enhancedText) {
        return res.json({
          success: false,
          isAiAvailable: true,
          message: 'AI প্রসেসিং সাময়িকভাবে সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
        });
      }

      return res.json({
        success: true,
        isAiAvailable: true,
        enhancedText,
        action,
      });
    } catch (err: any) {
      console.error('ApplicationWriter AI Error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error',
      });
    }
  });

  // MoSaFa Palmistry AI Vision Analysis API
  app.post('/api/palmistry/analyze', async (req, res) => {
    try {
      const {
        imageBase64,
        imageMimeType = 'image/jpeg',
        handSide = 'right',
        userName = '',
        gender = '',
      } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'হাতের ছবি পাওয়া যায়নি।' });
      }

      const cleanBase64 = String(imageBase64).replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

      const fallbackResult = {
        success: true,
        isAiAvailable: Boolean(ai),
        overview: `আপনার হাতের তালু বিশ্লেষণ করে দেখা যাচ্ছে যে রেখাসমূহ স্পষ্ট ও আকর্ষণীয়ভাবে বিন্যস্ত। ত্বকের সতেজতা ও তালুর গঠন একজন উদ্যমী, আন্তরিক ও দূরদর্শী মানুষের পরিচয় দেয়।`,
        heartLine: {
          name: 'হৃদয় রেখা (Heart Line)',
          englishName: 'Heart Line',
          visibility: 'স্পষ্ট',
          interpretation: 'আপনার হৃদয় রেখাটি ইঙ্গিত দেয় আপনি আবেগের ক্ষেত্রে যথেষ্ট আন্তরিক ও অনুভূতিপ্রবণ। সম্পর্কের ক্ষেত্রে বিশ্বস্ততা ও পারস্পরিক মূল্যবোধ আপনার কাছে অত্যন্ত গুরুত্বপূর্ণ।',
          details: 'রেখাটির সুষম বক্রতা নির্দেশ করে আপনি ভালোবাসার প্রকাশে কোমল এবং আন্তরিক বন্ধন বজায় রাখতে ভালোবাসেন।',
        },
        headLine: {
          name: 'মস্তিষ্ক রেখা (Head Line)',
          englishName: 'Head Line',
          visibility: 'স্পষ্ট',
          interpretation: 'মস্তিষ্ক রেখার পরিচ্ছন্ন বিস্তার প্রমাণ করে আপনার চিন্তাভাবনা বাস্তববাদী কিন্তু কল্পনাশক্তি সমৃদ্ধ। যেকোনো সংকটময় পরিস্থিতিতে মাথা ঠান্ডা রেখে বিশ্লেষণ করার অসাধারণ ক্ষমতা রয়েছে।',
          details: 'আপনার স্মৃতিশক্তি প্রখর এবং দ্রুত নতুন বিষয় আয়ত্ত করার স্বাভাবিক মানসিক প্রস্তুতি রয়েছে।',
        },
        lifeLine: {
          name: 'জীবন রেখা (Life Line)',
          englishName: 'Life Line',
          visibility: 'স্পষ্ট',
          interpretation: 'জীবন রেখাটি আপনার অটুট জীবনীশক্তি, কাজের প্রতি প্রবল আগ্রহ এবং সহনশীল মানসিকতার পরিচয় বহন করে। প্রতিকূলতা কাটিয়ে দ্রুত ঘুরে দাঁড়ানোর ক্ষমতা আপনার সহজাত।',
          details: 'একটি ইতিবাচক, উদ্দীপনাময় ও প্রাণবন্ত জীবনযাত্রার প্রতিফলন এই রেখায় দৃশ্যমান।',
        },
        fateLine: {
          name: 'ভাগ্য রেখা (Fate Line)',
          englishName: 'Fate Line',
          visibility: 'আংশিক স্পষ্ট',
          interpretation: 'আপনার ভাগ্য রেখা নির্দেশ করে আপনি নিজের মেধা ও নিষ্ঠার ওপর ভরসা করে জীবন সাজাতে বিশ্বাসী। অধ্যবসায় ও সঠিক পদক্ষেপ আপনাকে অভীষ্ট লক্ষ্যে নিয়ে যাবে।',
          details: 'পরিশ্রম ও সুযোগের সঠিক সমন্বয়ে জীবনের প্রতিটি ধাপে সম্মান ও উন্নতির জোরালো সম্ভাবনা রয়েছে।',
        },
        personalityReading: 'আপনি বাইরে থেকে শান্ত ও সংযমী হলেও অন্তরে দৃঢ় সংকল্পবদ্ধ। মানুষের অনুভূতি সহজে উপলব্ধি করতে পারেন এবং বন্ধুদের বিপদে নিঃস্বার্থভাবে পাশে দাঁড়ান। আত্মমর্যাদাবোধ আপনার ব্যক্তিত্বের মূল শক্তি।',
        loveReading: 'ভালোবাসায় আপনি বিশ্বস্ত, সমঝদার ও শ্রদ্ধাশীল সম্পর্ক পছন্দ করেন। ক্ষুদ্র ভুলের চেয়ে দীর্ঘমেয়াদী সুখ ও পারস্পরিক বিশ্বাস আপনার কাছে প্রধান বিবেচ্য।',
        careerReading: 'যেকোনো দায়িত্বশীল, সৃজনশীল বা সিদ্ধান্ত গ্রহণের কাজে আপনি অসাধারণ উৎকর্ষ দেখাতে পারেন। লক্ষ্য স্থির রাখলে কর্মক্ষেত্রে আপনার নেতৃত্ব ও সুনাম অক্ষুণ্ণ থাকবে।',
        palmStorySummary: 'আপনার হাতের রেখাসমূহ এক অনুপ্রেরণাদায়ক ও অনন্য জীবনের গল্প বলে। অতীত অভিজ্ঞতা আপনাকে করেছে বিজ্ঞ ও সংযত, আর বর্তমানের উদ্যম আপনাকে নিয়ে যাচ্ছে সাফল্যের স্বর্ণতোরণে। সর্বদা আত্মবিশ্বাসী থাকুন!',
        luckyNumber: Math.floor(Math.random() * 9) + 1,
        luckyColor: 'রয়েল ব্লু ও শুভ্র শ্বেত',
        vibeScore: Math.floor(Math.random() * 10) + 89,
      };

      if (!ai) {
        return res.json(fallbackResult);
      }

      const promptText = `Act as an expert, culturally attuned, deeply respectful Bengali Master Palm Reader and Storyteller (হস্তরেখাবিদ).
Analyze the provided human palm image for entertaining and insightful character reading.

User Details:
- Name: "${userName || 'প্রিয় বন্ধু'}"
- Hand Side: "${handSide === 'left' ? 'বাম হাত' : 'ডান হাত'}"
- Gender: "${gender || 'উল্লেখ নেই'}"

CRITICAL INSTRUCTIONS:
1. Examine the image carefully. Identify visible palm lines:
   - Heart Line (হৃদয় রেখা - প্রেম ও আবেগ)
   - Head Line (মস্তিষ্ক রেখা - বুদ্ধি ও মনন)
   - Life Line (জীবন রেখা - জীবনীশক্তি ও সহনশীলতা)
   - Fate Line (ভাগ্য রেখা - ক্যারিয়ার ও কর্মপ্রচেষ্টা)
2. Gauge visibility honestly based solely on image clarity: choose strictly from "স্পষ্ট", "আংশিক স্পষ্ট", or "অস্পষ্ট".
   If lines are blurry or faint, do not fabricate precise details—note them as "আংশিক স্পষ্ট" or "অস্পষ্ট" and offer general positive wisdom.
3. STRICT SAFETY & TRANSPARENCY RULES:
   - NEVER predict exact death dates, lifespans, or tragic events.
   - NEVER diagnose illnesses, diseases, or medical conditions.
   - NEVER guarantee wealth, exact marriage ages, or pregnancy.
   - Keep the tone encouraging, warm, poetic, and engagingly entertaining in pristine Bengali (প্রমিত বাংলা).
4. Output MUST be ONLY valid JSON matching this exact structure with NO markdown or preamble:
{
  "overview": "হাতের গঠন ও সার্বিক রেখার প্রথম দর্শনের বিবরণী (২-৩ বাক্য)",
  "heartLine": {
    "name": "হৃদয় রেখা (Heart Line)",
    "englishName": "Heart Line",
    "visibility": "স্পষ্ট | আংশিক স্পষ্ট | অস্পষ্ট",
    "interpretation": "প্রেম ও আবেগ সম্পর্কিত মনোমুগ্ধকর ব্যাখ্যা (২-৩ বাক্য)",
    "details": "রেখার গঠন ও বৈশিষ্ট্য সম্পর্কিত সংক্ষিপ্ত বিবরণ"
  },
  "headLine": {
    "name": "মস্তিষ্ক রেখা (Head Line)",
    "englishName": "Head Line",
    "visibility": "স্পষ্ট | আংশিক স্পষ্ট | অস্পষ্ট",
    "interpretation": "বুদ্ধি, চিন্তা ও মনোযোগের ব্যাখ্যা (২-৩ বাক্য)",
    "details": "রেখার গঠন ও বৈশিষ্ট্য সম্পর্কিত সংক্ষিপ্ত বিবরণ"
  },
  "lifeLine": {
    "name": "জীবন রেখা (Life Line)",
    "englishName": "Life Line",
    "visibility": "স্পষ্ট | আংশিক স্পষ্ট | অস্পষ্ট",
    "interpretation": "জীবনীশক্তি, প্রেরণা ও উদ্দীপনার ইতিবাচক ব্যাখ্যা (২-৩ বাক্য)",
    "details": "রেখার গঠন ও বৈশিষ্ট্য সম্পর্কিত সংক্ষিপ্ত বিবরণ"
  },
  "fateLine": {
    "name": "ভাগ্য রেখা (Fate Line)",
    "englishName": "Fate Line",
    "visibility": "স্পষ্ট | আংশিক স্পষ্ট | অস্পষ্ট",
    "interpretation": "ক্যারিয়ার, লক্ষ্য ও কর্মোদ্যোগের ব্যাখ্যা (২-৩ বাক্য)",
    "details": "রেখার গঠন ও বৈশিষ্ট্য সম্পর্কিত সংক্ষিপ্ত বিবরণ"
  },
  "personalityReading": "ব্যক্তিত্বের উন্মোচন ও আত্মিক গুণের সুন্দর বিবরণী (৩-৪ বাক্য)",
  "loveReading": "প্রেম, ভালোবাসা ও সম্পর্কের প্রতি দৃষ্টিভঙ্গি (২-৩ বাক্য)",
  "careerReading": "কর্মজীবন, উদ্যম ও সাফল্যের সম্ভাবনা (২-৩ বাক্য)",
  "palmStorySummary": "আপনার হাতের বিশেষ গল্প (Your Palm's Story) - এক নজরে প্রেরণাদায়ক ইতিবাচক উপাখ্যান (৩-৪ বাক্য)",
  "luckyNumber": 7,
  "luckyColor": "রঙের নাম (যেমন: রয়েল ব্লু বা এমারেল্ড গ্রিন)",
  "vibeScore": 92
}`;

      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType: imageMimeType,
                      data: cleanBase64,
                    },
                  },
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            config: {
              temperature: 0.6,
              responseMimeType: 'application/json',
            },
          });

          if (response && response.text) {
            let parsed: any;
            try {
              const cleaned = response.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
              parsed = JSON.parse(cleaned);
            } catch {
              const match = response.text.match(/\{[\s\S]*\}/);
              if (match) {
                parsed = JSON.parse(match[0]);
              }
            }

            if (parsed && (parsed.heartLine || parsed.palmStorySummary)) {
              return res.json({
                success: true,
                isAiAvailable: true,
                overview: parsed.overview || fallbackResult.overview,
                heartLine: parsed.heartLine || fallbackResult.heartLine,
                headLine: parsed.headLine || fallbackResult.headLine,
                lifeLine: parsed.lifeLine || fallbackResult.lifeLine,
                fateLine: parsed.fateLine || fallbackResult.fateLine,
                personalityReading: parsed.personalityReading || fallbackResult.personalityReading,
                loveReading: parsed.loveReading || fallbackResult.loveReading,
                careerReading: parsed.careerReading || fallbackResult.careerReading,
                palmStorySummary: parsed.palmStorySummary || fallbackResult.palmStorySummary,
                luckyNumber: parsed.luckyNumber || fallbackResult.luckyNumber,
                luckyColor: parsed.luckyColor || fallbackResult.luckyColor,
                vibeScore: parsed.vibeScore || fallbackResult.vibeScore,
              });
            }
          }
        } catch (modelErr: any) {
          console.warn(`[Palmistry AI] Model ${modelName} error:`, modelErr?.message || modelErr);
        }
      }

      return res.json(fallbackResult);
    } catch (err: any) {
      console.error('Palmistry AI API Error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'হাতের ছবি বিশ্লেষণ করতে সমস্যা হয়েছে।',
      });
    }
  });

  // ==========================================
  // MoSaFa Content Creator Studio AI API
  // ==========================================
  app.post('/api/creator/generate', async (req, res) => {
    try {
      const { action, ...params } = req.body;

      if (!ai) {
        return res.json({
          success: false,
          isAiAvailable: false,
          message: 'Gemini API Key is not configured on server. Falling back to local templates.',
        });
      }

      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      let promptText = '';
      let isJsonResponse = false;

      if (action === 'generate_niche') {
        isJsonResponse = true;
        promptText = `You are an expert digital content strategist and niche advisor for Bangladeshi and global content creators.
Based on the following user profile, generate 3 highly targeted, realistic, and profitable content niches:
Country: ${params.country || 'Bangladesh'}
Language: ${params.language || 'Bengali'}
Platform: ${params.platform || 'YouTube & Facebook'}
Interests: ${params.interests || 'Technology, Education, Freelancing'}
Skills: ${params.skills || 'Basic video editing, writing'}
Available Time: ${params.timeHours || 10} hours/week
Budget: ${params.budget || 'Minimal / zero'}
Monetization: ${params.monetization || 'AdSense, Affiliates, Sponsorships'}

Output strict JSON array with 3 objects matching this schema:
[
  {
    "id": "niche-1",
    "title": "Bengali niche title",
    "englishTitle": "English title",
    "description": "Clear explanation of this niche in Bengali",
    "targetAudience": "Audience description",
    "monetizationMethods": ["method1", "method2", "method3"],
    "recommendedFormats": ["format1", "format2"],
    "competitionLevel": "Low" | "Medium" | "High",
    "profitPotential": "Moderate" | "High" | "Very High",
    "roadmap30Days": [
      { "day": "দিন ১-৭", "task": "Task description in Bengali" },
      { "day": "দিন ৮-১৫", "task": "Task description in Bengali" },
      { "day": "দিন ১৬-২৩", "task": "Task description in Bengali" },
      { "day": "দিন ২৪-৩০", "task": "Task description in Bengali" }
    ]
  }
]
Do not fabricate fake search volumes. Keep it realistic, encouraging, and actionable.`;
      } else if (action === 'generate_topics') {
        isJsonResponse = true;
        promptText = `You are a professional SEO & content marketing specialist.
Generate 5 viral, engaging, and high-CTR topic ideas and keyword clusters for the following niche:
Niche: ${params.niche}
Platform: ${params.platform || 'multi'}
Language: ${params.language || 'bn'}
Target Audience: ${params.audience || 'General public'}

Output strict JSON array of objects:
[
  {
    "id": "kw-1",
    "title": "Engaging title in Bengali",
    "platform": "youtube" | "blog" | "facebook" | "multi",
    "searchIntent": "Informational" | "Commercial" | "Transactional" | "Navigational",
    "category": "Topic category",
    "difficultyEstimate": "সহজ (নতুনদের জন্য আদর্শ) | মাঝারি | উচ্চ",
    "relatedKeywords": ["keyword 1", "keyword 2", "keyword 3"],
    "suggestedAngles": ["angle 1", "angle 2"],
    "faqs": [
      { "q": "Frequent question in Bengali", "a": "Helpful answer" }
    ]
  }
]`;
      } else if (action === 'generate_script') {
        isJsonResponse = true;
        promptText = `You are a master scriptwriter and copywriter.
Generate a high-retention content script/article:
Topic: ${params.topic}
Type: ${params.type || 'youtube_long'}
Tone: ${params.tone || 'Engaging & Helpful'}
Language: ${params.language || 'Bengali'}
Length: ${params.length || 'Standard'}

Return strict JSON:
{
  "title": "Viral Click-Worthy Title",
  "outline": ["Section 1", "Section 2", "Section 3", "Section 4"],
  "content": "Full formatted script or article text with timecodes/visual cues in Bengali/English"
}`;
      } else if (action === 'generate_video_plan') {
        isJsonResponse = true;
        promptText = `You are an expert video director and storyboard artist.
Create a complete scene-by-scene video production plan and storyboard:
Topic: ${params.topic}
Platform: ${params.platform || 'youtube'}
Duration: ${params.duration || '3-5 minutes'}
Tone: ${params.tone || 'Friendly & Energetic'}
Language: ${params.language || 'Bengali'}

Return strict JSON:
{
  "id": "plan-1",
  "title": "Video Title",
  "topic": "${params.topic}",
  "platform": "${params.platform || 'youtube'}",
  "durationEstimate": "${params.duration || '3-5 min'}",
  "hook": "Strong 3-second hook in Bengali",
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 5,
      "visualPrompt": "Visual cue description",
      "voiceover": "Voiceover line in Bengali",
      "onScreenText": "Short punchy text overlay",
      "bRollSuggestion": "B-roll suggestion",
      "musicMood": "Music style"
    }
  ],
  "titleIdeas": ["Title 1", "Title 2", "Title 3"],
  "description": "Video description with SEO keywords",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "callToAction": "Call to action text in Bengali"
}`;
      } else if (action === 'repurpose_content') {
        isJsonResponse = true;
        promptText = `You are a multi-platform content repurposing expert.
Take this source text and repurpose it into 9 different formats:
Source Text:
${params.sourceText}

Return strict JSON:
{
  "sourceText": "...",
  "blogArticle": "Complete markdown blog post...",
  "facebookPost": "Engaging Facebook post with emojis & discussion prompt...",
  "youtubeScript": "YouTube video script with intro, main points, and outro...",
  "shortsScript": "30-60 second fast-paced vertical video script...",
  "carouselSlides": ["Slide 1...", "Slide 2...", "Slide 3...", "Slide 4...", "Slide 5..."],
  "linkedinPost": "Professional LinkedIn post with key takeaways...",
  "newsletterDraft": "Engaging email newsletter draft...",
  "quoteCard": "Punchy memorable quote...",
  "pinterestDescription": "SEO-optimized Pinterest pin description..."
}`;
      } else {
        return res.status(400).json({ success: false, error: 'Unknown action' });
      }

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptText,
            config: {
              temperature: 0.7,
              responseMimeType: isJsonResponse ? 'application/json' : undefined,
            },
          });

          if (response && response.text) {
            let parsedData: any = response.text;
            if (isJsonResponse) {
              try {
                const cleaned = response.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
                parsedData = JSON.parse(cleaned);
              } catch {
                const match = response.text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                if (match) {
                  parsedData = JSON.parse(match[0]);
                }
              }
            }

            return res.json({
              success: true,
              data: parsedData,
              isAiAvailable: true,
              modelUsed: modelName,
            });
          }
        } catch (mErr: any) {
          console.warn(`[Creator AI] ${modelName} failed:`, mErr?.message || mErr);
        }
      }

      return res.json({
        success: false,
        isAiAvailable: false,
        message: 'Could not generate via Gemini API, please use offline templates.',
      });
    } catch (apiErr: any) {
      console.error('Creator AI Server Error:', apiErr);
      return res.status(500).json({
        success: false,
        error: apiErr?.message || 'Server error generating creator content',
      });
    }
  });

  // Entrepreneur Journey AI Proxy API
  app.post('/api/entrepreneur/generate', async (req, res) => {
    try {
      const { action, ...params } = req.body;

      if (!ai) {
        return res.json({
          success: false,
          isAiAvailable: false,
          message: 'GEMINI_API_KEY is not configured, please use offline templates.',
        });
      }

      let systemInstruction = `You are a world-class startup mentor, business strategist, and Bangladesh small-business operations specialist.
You help beginners in Bangladesh start zero-to-low capital businesses with realistic, highly practical, zero-fluff advice in clear, natural Bengali.
Never promise unrealistic riches or guaranteed income.
Distinguish assumptions from verified facts.
Provide actionable, culturally resonant steps suitable for Bangladesh (districts, towns, Dhaka/Chittagong, local markets, bKash/Nagad, courier, Facebook groups).`;

      let promptText = '';
      let isJsonResponse = false;

      if (action === 'validate_idea') {
        isJsonResponse = true;
        promptText = `Validate this business idea for Bangladesh market:
Idea Description: ${params.ideaDescription}
Target Location: ${params.targetLocation || 'Bangladesh'}
Available Capital: ${params.budget || 'zero'}

Return strict JSON:
{
  "customerProblem": "Exact customer pain point in clear Bengali",
  "targetAudience": "Specific target customer profile in Bangladesh",
  "valueProposition": "Why customers will pay for this instead of existing options",
  "competitors": [
    {
      "name": "Competitor name / category",
      "pricingEstimate": "Price range in BDT",
      "strengths": "Their advantage",
      "weaknesses": "Their gaps",
      "ourAdvantage": "How our business wins"
    }
  ],
  "interviewQuestions": [
    {
      "id": "iq-1",
      "question": "Clear conversational question in Bengali",
      "purpose": "What this reveals",
      "sampleAnswer": "Realistic customer answer"
    }
  ],
  "mvpPlan": {
    "scope": "Minimal test scope",
    "format": "e.g. WhatsApp Catalog or Sample Reel",
    "timeToBuildDays": 2,
    "budgetBDT": 0
  },
  "experiments": [
    {
      "name": "Test experiment name",
      "method": "How to run it in 48 hours without spending money",
      "successMetric": "Measurable success criteria",
      "status": "planned"
    }
  ],
  "identifiedRisks": [
    "Risk 1 in Bangladesh context and how to overcome it",
    "Risk 2 in Bangladesh context"
  ],
  "nextActions": [
    "Next immediate step 1",
    "Next immediate step 2",
    "Next immediate step 3"
  ]
}`;
      } else if (action === 'generate_plan') {
        isJsonResponse = true;
        promptText = `Generate a comprehensive 12-section business plan in professional Bengali:
Business Name: ${params.businessName}
Idea: ${params.ideaDescription}
Location: ${params.targetLocation}
Monthly Revenue Goal: ৳${params.monthlyIncomeGoal || 30000}

Return strict JSON:
{
  "executiveSummary": "Concise summary in Bengali",
  "businessDescription": "Business operations overview",
  "problemAndSolution": "Problem solved and solution provided",
  "targetCustomerProfile": "Demographics and behavioral traits",
  "marketResearchAndOpportunity": "Market opportunity in Bangladesh",
  "competitorAnalysis": "Market landscape",
  "productsAndPricing": "3-tier pricing overview",
  "marketingAndAcquisitionPlan": "Free and organic acquisition methods",
  "salesAndConversionProcess": "Step by step sales conversion",
  "operationsAndDailyWorkflow": "Daily morning/afternoon/evening routine",
  "financialProjections": {
    "startingCapitalNeeded": 0,
    "monthlyOverhead": 1500,
    "estimatedBreakEvenMonths": 1,
    "month1RevenueTarget": 12000,
    "month3RevenueTarget": 35000
  },
  "risksAndMitigation": "Real operational risks and practical mitigation",
  "thirtyDayMilestones": [
    "Day 1-7 milestone",
    "Day 8-15 milestone",
    "Day 16-22 milestone",
    "Day 23-30 milestone"
  ],
  "ninetyDayVision": "Where this business can be in 3 months"
}`;
      } else if (action === 'generate_marketing_copy') {
        isJsonResponse = true;
        promptText = `You are an elite Bengali copywriter and sales strategist.
Create high-converting copy for:
Business Name: ${params.businessName}
Product/Service: ${params.productService}
Target Audience: ${params.targetAudience}
Format: ${params.type} (facebook_post | sales_copy | whatsapp_message | video_script)
Tone: ${params.tone || 'Friendly & Professional'}

Return strict JSON:
{
  "content": "Full formatted copy in authentic, persuasive Bengali with emojis, bullet points, and high-converting call-to-action"
}`;
      } else {
        return res.status(400).json({ success: false, error: 'Unknown action' });
      }

      const modelNames = ['gemini-3.8-flash', 'gemini-2.5-flash'];
      for (const modelName of modelNames) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            config: {
              systemInstruction: { parts: [{ text: systemInstruction }] },
              temperature: 0.7,
              ...(isJsonResponse ? { responseMimeType: 'application/json' } : {}),
            },
          });

          if (response && response.text) {
            let parsedData: any = response.text;
            if (isJsonResponse) {
              try {
                const cleaned = response.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
                parsedData = JSON.parse(cleaned);
              } catch {
                const match = response.text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                if (match) {
                  parsedData = JSON.parse(match[0]);
                }
              }
            }

            return res.json({
              success: true,
              data: parsedData,
              isAiAvailable: true,
              modelUsed: modelName,
            });
          }
        } catch (mErr: any) {
          console.warn(`[Entrepreneur AI] ${modelName} failed:`, mErr?.message || mErr);
        }
      }

      return res.json({
        success: false,
        isAiAvailable: false,
        message: 'Could not generate via Gemini API, please use offline templates.',
      });
    } catch (apiErr: any) {
      console.error('Entrepreneur AI Server Error:', apiErr);
      return res.status(500).json({
        success: false,
        error: apiErr?.message || 'Server error generating entrepreneur content',
      });
    }
  });

  // ==========================================
  // MoSaFa AI Photo Status & Frame Studio API
  // ==========================================
  app.post('/api/photo-status/generate', async (req, res) => {
    try {
      const {
        category = 'motivational',
        tone = 'motivational',
        length = 'medium',
        imageBase64 = null,
        imageMimeType = 'image/jpeg',
      } = req.body;

      if (!ai) {
        return res.json({
          success: false,
          isAiAvailable: false,
          message: 'Gemini API is not configured on server. Falling back to local curated quotes.',
        });
      }

      const lengthGuidance =
        length === 'short'
          ? 'সংক্ষিপ্ত (১-২ লাইন, ১০-১৫ শব্দ)'
          : length === 'long'
          ? 'পূর্ণাঙ্গ ও গভীর (৩-৪ লাইন, ৩০-৪০ শব্দ)'
          : 'মাঝারি (২-৩ লাইন, ২০-২৫ শব্দ)';

      const systemInstruction = `You are an elite Bengali author, quote writer, and social media caption specialist.
Create 5 unique, deeply resonant, emotionally evocative, and natural Bengali status captions for a personal photo quote poster.
Requirements:
1. Category: ${category}
2. Writing Tone: ${tone}
3. Desired Length: ${lengthGuidance}
4. Language: Pure, authentic, high-impact Bengali (বাংলা). Zero spelling or grammatical mistakes.
5. Variety: Each of the 5 captions must have a distinct angle, metaphor, and emotional texture.
6. Safety Mandate: If an image is provided, appreciate its aesthetic atmosphere, lighting, and general mood. NEVER assume or invent a person's identity, occupation, personal secrets, or religious beliefs from their appearance.
Return ONLY a valid JSON array of 5 Bengali strings, like:
["ক্যাপশন ১", "ক্যাপশন ২", "ক্যাপশন ৩", "ক্যাপশন ৪", "ক্যাপশন ৫"]`;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        const cleanBase64 = String(imageBase64).replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: cleanBase64,
          },
        });
      }

      parts.push({
        text: `এই ছবির দৃশ্য ও নির্বাচিত ক্যাটাগরি (${category}), টোন (${tone}) এবং দৈর্ঘ্য (${lengthGuidance}) অনুযায়ী ৫টি অনন্য সুন্দর ও আকর্ষণীয় বাংলা স্ট্যাটাস ক্যাপশন তৈরি করো।`,
      });

      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite',
      ];

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts }],
            config: {
              systemInstruction: { parts: [{ text: systemInstruction }] },
              temperature: 0.8,
              responseMimeType: 'application/json',
            },
          });

          if (response && response.text) {
            let statuses: string[] = [];
            try {
              const cleaned = response.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
              const parsed = JSON.parse(cleaned);
              if (Array.isArray(parsed)) {
                statuses = parsed.map((s) => String(s).trim()).filter(Boolean);
              } else if (parsed && Array.isArray(parsed.statuses)) {
                statuses = parsed.statuses.map((s: any) => String(s).trim()).filter(Boolean);
              }
            } catch {
              const match = response.text.match(/\[[\s\S]*\]/);
              if (match) {
                const arr = JSON.parse(match[0]);
                if (Array.isArray(arr)) {
                  statuses = arr.map((s) => String(s).trim()).filter(Boolean);
                }
              }
            }

            if (statuses.length > 0) {
              return res.json({
                success: true,
                isAiAvailable: true,
                statuses,
                modelUsed: modelName,
              });
            }
          }
        } catch (mErr: any) {
          console.warn(`[PhotoStatus AI] ${modelName} error:`, mErr?.message || mErr);
        }
      }

      return res.json({
        success: false,
        isAiAvailable: false,
        message: 'Could not generate via Gemini API, using offline quotes.',
      });
    } catch (err: any) {
      console.error('PhotoStatus AI Server Error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Server error generating photo status',
      });
    }
  });

  // Direct APK download route for mobile visitors & root directory access
  app.get(['/The-MoSaFa-Tools.apk', '/app-release.apk'], (_req, res) => {
    const rootApk = path.resolve(__dirname, 'The-MoSaFa-Tools.apk');
    const publicApk = path.resolve(__dirname, 'public', 'The-MoSaFa-Tools.apk');
    const targetFile = fs.existsSync(rootApk) ? rootApk : (fs.existsSync(publicApk) ? publicApk : null);

    if (targetFile) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="The-MoSaFa-Tools.apk"');
      return res.sendFile(targetFile);
    } else {
      return res.status(404).json({ error: 'APK file not found on server' });
    }
  });

  // Sitemap.xml route
  app.get('/sitemap.xml', (_req, res) => {
    const sitemapDist = path.resolve(__dirname, 'dist', 'sitemap.xml');
    const sitemapPublic = path.resolve(__dirname, 'public', 'sitemap.xml');
    const target = fs.existsSync(sitemapDist) ? sitemapDist : sitemapPublic;
    if (fs.existsSync(target)) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(target);
    }
    return res.status(404).send('Sitemap not found');
  });

  // Robots.txt route
  app.get('/robots.txt', (_req, res) => {
    const robotsDist = path.resolve(__dirname, 'dist', 'robots.txt');
    const robotsPublic = path.resolve(__dirname, 'public', 'robots.txt');
    const target = fs.existsSync(robotsDist) ? robotsDist : robotsPublic;
    if (fs.existsSync(target)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(target);
    }
    return res.status(404).send('Robots not found');
  });

  // Legacy URL compatibility redirect: /?tool=slug or /index.html?tool=slug -> /tools/slug (HTTP 301)
  app.use((req, res, next) => {
    if (req.method === 'GET' && (req.path === '/' || req.path === '/index.html') && req.query.tool) {
      const toolSlug = String(req.query.tool).toLowerCase().trim();
      if (TOOLS_SEO_REGISTRY[toolSlug]) {
        // Safe 301 permanent redirect to individual SEO-friendly tool URL
        return res.redirect(301, `/tools/${toolSlug}`);
      }
    }
    next();
  });

  // Vite integration: Dev middleware or static dist with full SEO injection
  if (process.env.NODE_ENV === 'production') {
    // 1. Tool & Legal SEO routes FIRST (Runs BEFORE express.static so /tools/:slug returns 200 OK directly with NO trailing slash redirect)
    const handleToolSeo = (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const slug = (req.params.slug || req.params.legal || '').toLowerCase().trim();
      const tool = TOOLS_SEO_REGISTRY[slug];
      if (!tool) {
        return next();
      }

      // Canonical enforcement: if request came with a trailing slash, redirect 301 to canonical
      if (req.path.endsWith('/') && req.path.length > 1) {
        return res.redirect(301, tool.path);
      }

      // Check root flat HTML file: dist/<slug>.html (for /about, /contact, etc.)
      const rootFlatPrerendered = path.resolve(__dirname, 'dist', `${slug}.html`);
      if (fs.existsSync(rootFlatPrerendered)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(rootFlatPrerendered);
      }

      // Check prerendered flat HTML file: dist/tools/<slug>.html
      const flatPrerendered = path.resolve(__dirname, 'dist', 'tools', `${slug}.html`);
      if (fs.existsSync(flatPrerendered)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(flatPrerendered);
      }

      // Check prerendered folder file: dist/tools/<slug>/index.html
      const folderPrerendered = path.resolve(__dirname, 'dist', 'tools', slug, 'index.html');
      if (fs.existsSync(folderPrerendered)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(folderPrerendered);
      }

      // Dynamic fallback injection from dist/index.html
      const distIndex = path.resolve(__dirname, 'dist', 'index.html');
      if (fs.existsSync(distIndex)) {
        const rawHtml = fs.readFileSync(distIndex, 'utf-8');
        const enrichedHtml = injectSeoTagsIntoHtml(rawHtml, tool);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(enrichedHtml);
      }

      next();
    };

    app.get(['/tools/:slug', '/tools/:slug/', '/:legal(about|contact|privacy|terms)'], handleToolSeo);

    // 2. Serve static assets with redirect: false so Express never redirects directories with trailing slash
    app.use(express.static(path.resolve(__dirname, 'dist'), { redirect: false, index: false }));

    // 3. Root homepage
    app.get('/', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });

    // 4. Catch-all fallback
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });

    // Tool & Legal SEO route in development (BEFORE vite.middlewares)
    app.get(['/tools/:slug', '/tools/:slug/', '/:legal(about|contact|privacy|terms)'], async (req, res, next) => {
      try {
        const slug = (req.params.slug || req.params.legal || '').toLowerCase().trim();
        const tool = TOOLS_SEO_REGISTRY[slug];
        if (!tool) {
          return next();
        }

        // Canonical redirect if trailing slash
        if (req.path.endsWith('/') && req.path.length > 1) {
          return res.redirect(301, tool.path);
        }

        const rawIndex = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const viteTransformed = await vite.transformIndexHtml(req.originalUrl, rawIndex);
        const enrichedHtml = injectSeoTagsIntoHtml(viteTransformed, tool);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(enrichedHtml);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The MoSaFa StudyMate Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
