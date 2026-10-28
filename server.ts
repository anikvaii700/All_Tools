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

const STUDYMATE_SYSTEM_INSTRUCTION = STUDYMATE_MASTER_SYSTEM_PROMPT;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON parser with 25MB limit for high-res photo uploads of questions/textbooks
  app.use(express.json({ limit: '25mb' }));

  // Strictly prevent stale service workers & cached HTML in iFrame dev previews
  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/index.html' || req.path === '/sw.js') {
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

  // Health check API
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(apiKey),
      model: 'gemini-3.8-flash',
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
