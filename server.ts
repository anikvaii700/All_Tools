import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { STUDYMATE_MASTER_SYSTEM_PROMPT } from './src/data/studymateMasterPrompt.ts';
import { APP_VERSION_CONFIG } from './src/versionConfig.ts';

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

      customizedInstruction += `\n\nCRITICAL TEACHER MANDATE:
- Act strictly as an authoritative, meticulous, zero-error Bangladeshi Master Teacher (শ্রেণিকক্ষের আদর্শ শিক্ষক).
- Deep Question Comprehension: Analyze what is given, what is asked, and the core concept first.
- Strict Zero-Error Policy: Zero arithmetic, algebraic, scientific, or grammatical mistakes. Double-check all intermediate calculations, +/- signs, units, and formulas before outputting.
- If solving a difficult math or science problem, provide a clear, step-by-step verified NCTB-aligned solution.`;

      if (studentClass) {
        customizedInstruction += `\n\nActive Student Profile: Name="${studentName}", Class/Level="${studentClass}", Current Subject="${currentSubject}". Tailor difficulty and syllabus specifically to ${studentClass}.`;
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

  // Vite integration: Dev middleware or static dist
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The MoSaFa StudyMate Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
