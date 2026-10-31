import {
  NicheIdea,
  TopicKeywordItem,
  StoryboardScene,
  VideoProductionPlan,
  RepurposedPackage,
} from '../types/creatorStudio';

export interface CreatorAiResponse<T> {
  success: boolean;
  data: T;
  isAiAvailable: boolean;
  message?: string;
}

export class CreatorAiService {
  // Call backend proxy route
  private static async callApi(endpoint: string, payload: any): Promise<any> {
    try {
      const response = await fetch('/api/creator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err: any) {
      console.warn('Backend Creator AI API unreachable, using local template engine:', err?.message);
      return null;
    }
  }

  // 1. Niche Finder
  static async findNiches(params: {
    country: string;
    language: string;
    platform: string;
    interests: string;
    skills: string;
    timeHours: number;
    budget: string;
    monetization: string;
  }): Promise<CreatorAiResponse<NicheIdea[]>> {
    const apiRes = await this.callApi('/api/creator/generate', {
      action: 'generate_niche',
      ...params,
    });

    if (apiRes && apiRes.success && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      return {
        success: true,
        data: apiRes.data,
        isAiAvailable: apiRes.isAiAvailable ?? true,
      };
    }

    // Local curated template generator based on user inputs
    const baseInterests = params.interests || 'টেকনোলজি ও ফ্রিল্যান্সিং';
    const fallbackNiches: NicheIdea[] = [
      {
        id: `niche-${Date.now()}-1`,
        title: `${baseInterests} সংক্রান্ত প্র্যাকটিক্যাল গাইড ও মোবাইল টিউটোরিয়াল`,
        englishTitle: `Hands-on Mobile & Tech Guides for Beginners`,
        description: `বাংলাদেশের তরুণদের জন্য ঘরে বসে মোবাইল ও পিসি দিয়ে ${baseInterests} শেখার সহজ বাংলা কন্টেন্ট।`,
        targetAudience: `১৮-৩৫ বছর বয়সী বাংলাদেশি শিক্ষার্থী, বেকার তরুণ ও উদ্যোক্তা`,
        monetizationMethods: ['গুগল অ্যাডসেন্স (AdSense)', 'স্পন্সরশিপ', 'অ্যাফিলিয়েট মার্কেটিং', 'পেইড কনসালটেন্সি'],
        recommendedFormats: ['ইউটিউব লং ভিডিও (৬-১২ মিনিট)', 'ফেসবুক ও ইউটিউব শর্টস/রিলস', 'টিউটোরিয়াল ব্লগ পোস্ট'],
        competitionLevel: 'Medium',
        profitPotential: 'High',
        roadmap30Days: [
          { day: 'দিন ১-৫', task: 'চ্যানেল/পেজ ব্র্যান্ডিং, লোগো, কাভার ও প্রথম ৩টি স্ক্রিপ্ট তৈরি' },
          { day: 'দিন ৬-১২', task: 'প্রথম ২টি প্র্যাকটিক্যাল টিউটোরিয়াল ভিডিও শুট, ভয়েসওভার ও পাবলিশ' },
          { day: 'দিন ১৩-২০', task: 'রিলস ও শর্টসের মাধ্যমে অর্গানিক রিচ বৃদ্ধি ও ফেসবুক গ্রুপে শেয়ার' },
          { day: 'দিন ২১-৩০', task: 'কমেন্ট অ্যানালাইসিস, পরবর্তী ১০টি বিষয়ের ক্যালেন্ডার প্রস্তুত ও অডিয়েন্স ফিডব্যাক' },
        ],
      },
      {
        id: `niche-${Date.now()}-2`,
        title: `দৈনন্দিন জীবন ও অনলাইন ক্যারিয়ার হ্যাক্স`,
        englishTitle: `Everyday Digital Productivity & Income Hacks`,
        description: `কম সময়ে বেশি ইনকাম, বিভিন্ন ওয়েবসাইট রিভিউ, কাজের শর্টকাট ও লাইফ হ্যাক্স।`,
        targetAudience: `চাকরিজীবী, গৃহিণী ও পার্ট-টাইম অনলাইন ইনকাম প্রত্যাশীরা`,
        monetizationMethods: ['অ্যাফিলিয়েট লিংক', 'স্পন্সরড সফটওয়্যার রিভিউ', 'ডিজিটাল প্রোডাক্ট'],
        recommendedFormats: ['৩০-৬০ সেকেন্ডের শর্টস/রিলস', 'লিস্টিক্যাল ব্লগ পোস্ট (Top 5 / Top 10)'],
        competitionLevel: 'Low',
        profitPotential: 'Very High',
        roadmap30Days: [
          { day: 'দিন ১-৭', task: '২০টি শর্ট ভিডিওর হুক ও স্ক্রিপ্ট তৈরি' },
          { day: 'দিন ৮-১৫', task: 'প্রতিদিন ১টি করে শর্টস/রিলস শিডিউল ও আপলোড' },
          { day: 'দিন ১৬-২৩', task: 'সবচেয়ে বেশি ভিউ পাওয়া টপিকের উপর পূর্ণাঙ্গ লং ভিডিও নির্মাণ' },
          { day: 'দিন ২৪-৩০', task: 'ব্লগে ডিটেইল আর্টিকেল লিখে ডিসক্রিপশনে লিংক স্থাপন' },
        ],
      },
      {
        id: `niche-${Date.now()}-3`,
        title: `স্মার্ট গ্যাজেট, অ্যাপস ও এআই টুলস রিভিউ`,
        englishTitle: `Smart Gadgets, Mobile Apps & AI Tools Review`,
        description: `বাজেট ফ্রেন্ডলি গ্যাজেট আনবক্সিং, ফ্রি এআই টুলসের ব্যবহার ও মোবাইল অ্যাপস রিভিউ।`,
        targetAudience: `প্রযুক্তিপ্রেমী শিক্ষার্থী, অনলাইন ক্রেতা ও মোবাইল ইউজার`,
        monetizationMethods: ['দারাজ/অ্যামাজন অ্যাফিলিয়েট', 'ব্র্যান্ড কোলাবোরেশন', 'ইউটিউব মনিটাইজেশন'],
        recommendedFormats: ['আনবক্সিং ও হ্যান্ডস-অন ভিডিও', 'ইন-ডেপথ কম্প্যারিজন পোস্ট'],
        competitionLevel: 'High',
        profitPotential: 'Very High',
        roadmap30Days: [
          { day: 'দিন ১-১০', task: 'নিজের ব্যবহৃত ৫টি ডিভাইসের রিয়েল লাইফ রিভিউ কনটেন্ট তৈরি' },
          { day: 'দিন ১১-২০', task: 'দারাজ ও লোকাল গ্যাজেট শপের সাথে অ্যাফিলিয়েট পার্টনারশিপ' },
          { day: 'দিন ২১-৩০', task: 'এসইও অপ্টিমাইজড থাম্বনেইল ও কন্টেন্ট ক্যালেন্ডার মেনে ভিডিও রিলিজ' },
        ],
      },
    ];

    return {
      success: true,
      data: fallbackNiches,
      isAiAvailable: false,
      message: 'টেমপ্লেট মোড: এআই সার্ভার সংযোগ ছাড়াই বিস্তারিত নিশ ও রোডম্যাপ সাজানো হয়েছে।',
    };
  }

  // 2. Topic & Keyword Lab
  static async generateTopics(params: {
    niche: string;
    platform: string;
    language: string;
    audience: string;
  }): Promise<CreatorAiResponse<TopicKeywordItem[]>> {
    const apiRes = await this.callApi('/api/creator/generate', {
      action: 'generate_topics',
      ...params,
    });

    if (apiRes && apiRes.success && Array.isArray(apiRes.data) && apiRes.data.length > 0) {
      return {
        success: true,
        data: apiRes.data,
        isAiAvailable: apiRes.isAiAvailable ?? true,
      };
    }

    const n = params.niche || 'অনলাইন ইনকাম ও কনটেন্ট তৈরি';
    const fallbackTopics: TopicKeywordItem[] = [
      {
        id: `kw-${Date.now()}-1`,
        title: `মোবাইল দিয়ে ${n} শেখার সহজ উপায় ২০২৬`,
        platform: 'youtube',
        searchIntent: 'Informational',
        category: 'গাইড ও টিউটোরিয়াল',
        difficultyEstimate: 'সহজ (নতুনদের জন্য আদর্শ)',
        relatedKeywords: [`${n} কিভাবে শুরু করব`, `মোবাইলে ${n}`, `${n} কোর্স বাংলা`],
        suggestedAngles: [
          'কোনো টাকা ছাড়া কীভাবে শুরু করবেন',
          'শিক্ষার্থীদের জন্য প্রথম ৩০ দিনের গাইড',
          'সবার করা সাধারণ ৩টি মারাত্মক ভুল',
        ],
        faqs: [
          { q: 'শুরু করতে কম্পিউটার থাকা কি বাধ্যতামূলক?', a: 'না, বর্তমান যুগে স্মার্টফোন দিয়েই প্রাথমিক কাজ ও প্র্যাকটিস শুরু করা যায়।' },
          { q: 'প্রথম ইনকাম আসতে কতদিন সময় লাগতে পারে?', a: 'সাধারণত নিয়মিত কাজ করলে ২ থেকে ৪ মাসের মধ্যে বাস্তব অগ্রগতি দেখা যায়।' },
        ],
      },
      {
        id: `kw-${Date.now()}-2`,
        title: `${n} সংক্রান্ত ৫টি সিক্রেট ট্রিক যা কেউ শেয়ার করে না`,
        platform: 'multi',
        searchIntent: 'Commercial',
        category: 'টিপস ও সিক্রেট হ্যাক্স',
        difficultyEstimate: 'মাঝারি (হাই সিপিসি / হাই রিচ)',
        relatedKeywords: [`${n} ট্রিকস`, `${n} সফল হওয়ার উপায়`, `সেরা কৌশল ২০২৬`],
        suggestedAngles: [
          'টপ এক্সপার্টদের কাজের গোপন কৌশল',
          'কম সময়ে দ্বিগুণ আউটপুট পাওয়ার নিয়ম',
        ],
        faqs: [
          { q: 'এই কৌশলগুলো কি ফেসবুক ও ইউটিউব উভয়ের জন্যই কার্যকর?', a: 'হ্যাঁ, অ্যালগরিদম ও অডিয়েন্স এনগেজমেন্ট উভয়ের ক্ষেত্রেই সমান উপকারী।' },
        ],
      },
      {
        id: `kw-${Date.now()}-3`,
        title: `${n} শুরু করার পূর্বে যে ৩টি বিষয় জেনে রাখা জরুরি`,
        platform: 'blog',
        searchIntent: 'Informational',
        category: 'সচেতনতা ও দিকনির্দেশনা',
        difficultyEstimate: 'লো কম্পিটিশন (গুগল র‌্যাংক নিশ্চিত)',
        relatedKeywords: [`${n} সুবিধা অসুবিধা`, `${n} ক্যারিয়ার সম্ভাবনা`, `বাস্তব অভিজ্ঞতা`],
        suggestedAngles: [
          'অবাস্তব প্রত্যাশা বাদ দিয়ে সঠিক প্ল্যানিং',
          'বাজেট ও সময় ব্যবস্থাপনার নিখুঁত ছক',
        ],
      },
    ];

    return {
      success: true,
      data: fallbackTopics,
      isAiAvailable: false,
      message: 'টেমপ্লেট মোড: গবেষণামূলক কিওয়ার্ড ও টপিক ক্লাস্টার রেডি হয়েছে।',
    };
  }

  // 3. Article & Script Studio
  static async generateScript(params: {
    topic: string;
    type: string;
    tone: string;
    length: string;
    language: string;
  }): Promise<CreatorAiResponse<{ title: string; outline: string[]; content: string }>> {
    const apiRes = await this.callApi('/api/creator/generate', {
      action: 'generate_script',
      ...params,
    });

    if (apiRes && apiRes.success && apiRes.data?.content) {
      return {
        success: true,
        data: apiRes.data,
        isAiAvailable: apiRes.isAiAvailable ?? true,
      };
    }

    const t = params.topic || 'সহজ উপায়ে কনটেন্ট তৈরি ও অনলাইন ক্যারিয়ার';
    const isShorts = params.type.includes('shorts') || params.type.includes('reel');
    const isBlog = params.type.includes('blog');

    if (isShorts) {
      return {
        success: true,
        isAiAvailable: false,
        data: {
          title: `🔥 মাত্র ৩০ সেকেন্ডে জানুন: ${t}`,
          outline: ['হুক (১-৩ সেকেন্ড)', 'মূল টুইস্ট (৪-২০ সেকেন্ড)', 'কল টু অ্যাকশন (২১-৩০ সেকেন্ড)'],
          content: `[ভিজ্যুয়াল: দ্রুত কাটিং, জুম ইন]\n[ভয়েসওভার]: আপনি কি এখনো ভাবছেন ${t} শুরু করা কঠিন?\n\n[অন-স্ক্রিন টেক্সট: ভুল ভাবছেন!]\n[ভয়েসওভার]: গত মাসে আমি এই ছোট্ট টেকনিকটা অ্যাপ্লাই করেছিলাম, আর ফলাফল দেখুন!\n\n১. প্রতিদিন নির্দিষ্ট সময় নির্বাচন করুন\n২. সহজ ভাষায় অডিয়েন্সের সাথে কথা বলুন\n৩. ধারাবাহিকতা বজায় রাখুন\n\n[ভিজ্যুয়াল: পয়েন্টার দিয়ে সাবস্ক্রাইব বাটনে নির্দেশ]\n[ভয়েসওভার]: সম্পূর্ণ গাইড পেতে চ্যানেলটি এখনই সাবস্ক্রাইব করুন এবং কমেন্টে আপনার প্রশ্ন লিখুন!`,
        },
      };
    }

    if (isBlog) {
      return {
        success: true,
        isAiAvailable: false,
        data: {
          title: `${t} — সম্পূর্ণ দিকনির্দেশনা ও সফলতার গাইড ২০২৬`,
          outline: [
            'ভূমিকা: কেন বিষয়টি বর্তমান সময়ে সবচেয়ে গুরুত্বপূর্ণ',
            '১. প্রাথমিক প্রস্তুতি ও প্রয়োজনীয় রিসোর্স',
            '২. ধাপে ধাপে কাজের পদ্ধতি',
            '৩. যে ৩টি সাধারণ ভুল এড়িয়ে চলবেন',
            'উপসংহার ও পরবর্তী পদক্ষেপ',
          ],
          content: `# ${t} — সম্পূর্ণ দিকনির্দেশনা ও সফলতার গাইড ২০২৬\n\n## ভূমিকা\nবর্তমান ডিজিটাল যুগে নিজের দক্ষতা বিকাশ ও স্বাধীন ক্যারিয়ার গঠনের ক্ষেত্রে "${t}" একটি অন্যতম সম্ভাবনাময় বিষয়। সঠিক পরিকল্পনা না থাকার কারণে অনেকেই শুরুতেই খেই হারিয়ে ফেলেন। আজকের এই পূর্ণাঙ্গ গাইডে আমরা সহজ ভাষায় আলোচনা করব কীভাবে শূন্য থেকে সফলতার মুখ দেখবেন।\n\n---\n\n## ১. প্রাথমিক প্রস্তুতি ও রিসোর্স\nশুরু করার আগে আপনার প্রয়োজন:\n- একটি সুস্পষ্ট লক্ষ্য ও দৈনিক সময় বণ্টন।\n- প্রয়োজনীয় বেসিক টুলস ও নির্ভরযোগ্য ইন্টারনেট।\n- ধৈর্য ও নিয়মিত শেখার মানসিকতা।\n\n---\n\n## ২. ধাপে ধাপে কাজের মূল পদ্ধতি\nপ্রথমে বিষয়টির ওপর মৌলিক ধারণা নিন। এরপর বাস্তব প্র্যাকটিসে নামুন। নিজের অভিজ্ঞতা লিখে রাখুন এবং অডিয়েন্স কী জানতে চায় তা মনোযোগ দিয়ে লক্ষ্য করুন।\n\n---\n\n## ৩. যেসব ভুল এড়িয়ে চলবেন\n১. রাতারাতি বড় ফলাফলের আশা করা।\n২. অন্যের সাথে নিজের প্রথম দিনের তুলনা করা।\n৩. নিয়মিত কন্টেন্ট বা কাজ প্রকাশ না করা।\n\n---\n\n## উপসংহার ও আহ্বান\nসফলতার কোনো গোপন চাবিকাঠি নেই—একমাত্র চাবিকাঠি হলো ধারাবাহিক পরিশ্রম। লেখাটি উপকারী মনে হলে অন্যদের সাথে শেয়ার করুন এবং আপনার মতামত নিচে কমেন্ট বক্সে জানান!`,
        },
      };
    }

    // Default YouTube Long Video Script
    return {
      success: true,
      isAiAvailable: false,
      data: {
        title: `${t} নিয়ে সম্পূর্ণ মাস্টারক্লাস | বাংলা টিউটোরিয়াল`,
        outline: ['হুকার ও ইন্ট্রো (০:০০-০:৪৫)', 'কেন এই বিষয় সবার জানা দরকার (০:৪৫-২:০০)', 'মূল ধাপ ১, ২ ও ৩ (২:০০-৭:০০)', 'উপসংহার ও সাবস্ক্রাইব কল (৭:০০-৮:০০)'],
        content: `[00:00 - 00:45] শক্তিশালী হুক ও ভূমিকা\n[ক্যামেরা অ্যাঙ্গেল: ফ্রন্ট ক্লোজ-আপ]\n"আসসালামু আলাইকুম বন্ধুরা! আজকের ভিডিওতে আমি আপনাদের সাথে শেয়ার করতে যাচ্ছি "${t}" সম্পর্কে সবচেয়ে প্র্যাকটিক্যাল গাইডলাইন। ভিডিওর শেষে আপনাদের জন্য থাকছে একটি স্পেশাল বোনাস টিপস, যা আপনার কাজের গতি বহুগুণ বাড়িয়ে দেবে।"\n\n[00:45 - 03:00] মূল বিষয়ের পটভূমি ও সুবিধা\n[বি-রোল ফুটেজ / স্ক্রিন রেকর্ড]\n"আমরা অনেকেই দ্বিধাদ্বন্দ্বে থাকি কোথা থেকে শুরু করব। কিন্তু সত্যি বলতে, সঠিক ফ্রেমওয়ার্ক জানা থাকলে এটি অত্যন্ত সহজ..."\n\n[03:00 - 06:30] ধাপে ধাপে সমাধান\n"ধাপ ১: সঠিক প্ল্যানিং ও টার্গেট নির্ধারণ।\nধাপ ২: প্রয়োজনীয় কনটেন্ট বা কাজের কাঠামো তৈরি।\nধাপ ৩: নিয়মিত রিভিউ ও অডিয়েন্সের মতামত মূল্যায়ন।"\n\n[06:30 - 07:30] উপসংহার ও কল টু অ্যাকশন\n"ভিডিওটি ভালো লাগলে লাইক দিন, কমেন্টে আপনার অভিজ্ঞতা জানান এবং ক্রিয়েটর স্টুডিওর পরবর্তী আপডেটের জন্য চ্যানেলটি সাবস্ক্রাইব করে পাশে থাকা বেল আইকনটি প্রেস করে রাখুন। ধন্যবাদ!"`,
      },
    };
  }

  // 4. Video Production Plan & Storyboard
  static async generateVideoPlan(params: {
    topic: string;
    platform: string;
    duration: string;
    tone: string;
    language: string;
  }): Promise<CreatorAiResponse<VideoProductionPlan>> {
    const apiRes = await this.callApi('/api/creator/generate', {
      action: 'generate_video_plan',
      ...params,
    });

    if (apiRes && apiRes.success && apiRes.data?.scenes) {
      return {
        success: true,
        data: apiRes.data,
        isAiAvailable: apiRes.isAiAvailable ?? true,
      };
    }

    const t = params.topic || 'অনলাইন কনটেন্ট তৈরি ও ভিডিও এডিটিং';
    const fallbackPlan: VideoProductionPlan = {
      id: `plan-${Date.now()}`,
      title: `${t} — ফুল ভিডিও প্রোডাকশন স্ক্রিপ্ট ও স্টোরিবোর্ড`,
      topic: t,
      platform: (params.platform as any) || 'youtube',
      durationEstimate: params.duration || '৩-৫ মিনিট',
      hook: `মাত্র ৫ মিনিটে শিখুন কীভাবে ${t} দিয়ে প্রফেশনাল রেজাল্ট পাওয়া যায়!`,
      scenes: [
        {
          sceneNumber: 1,
          durationSeconds: 5,
          visualPrompt: 'ক্যামেরায় সরাসরি তাকিয়ে হাসিমুখে এনার্জেটিক ইন্ট্রো, ব্যাকগ্রাউন্ডে স্টুডিও লাইট',
          voiceover: `স্বাগতম বন্ধুরা! আজকের ভিডিওতে আমরা দেখব ${t} করার সবচেয়ে সহজ ও স্মার্ট ট্রিকস।`,
          onScreenText: `🔥 ${t} — গোপন কৌশল`,
          bRollSuggestion: 'স্মার্টফোন বা ল্যাপটপে দ্রুত কাজ করার ম্যাক্রো শট',
          musicMood: 'আপবিট, আধুনিক ও অনুপ্রেরণাদায়ী লো-ফাই বিট',
        },
        {
          sceneNumber: 2,
          durationSeconds: 12,
          visualPrompt: 'স্ক্রিন শেয়ার ও সফটওয়্যার ড্যাশবোর্ড ওভারভিউ',
          voiceover: 'শুরুতেই আমাদের নিশ্চিত করতে হবে সঠিক সেটিংস ও ফ্রেমওয়ার্ক নির্বাচন করা হয়েছে কিনা।',
          onScreenText: 'ধাপ ১: সঠিক সেটআপ',
          bRollSuggestion: 'মাউস ক্লিকের জুম ইন ও ইন্টারফেস প্রদর্শন',
          musicMood: 'নরম ব্যাকগ্রাউন্ড অ্যাম্বিয়েন্স',
        },
        {
          sceneNumber: 3,
          durationSeconds: 15,
          visualPrompt: 'বাস্তব উদাহরণ ও রেজাল্ট কম্প্যারিজন (আগে ও পরে)',
          voiceover: 'দেখুন, সাধারণ নিয়মে যেখানে ঘণ্টা সময় লাগে, সেখানে এই নিয়মে মাত্র কয়েক মিনিটে কাজ শেষ হয়!',
          onScreenText: 'আগে vs পরে (১০x দ্রুত)',
          bRollSuggestion: 'টাইম-ল্যাপস ফুটেজ ও ক্লিপ ট্রানজিশন',
          musicMood: 'উৎসাহব্যঞ্জক ও গতিশীল',
        },
        {
          sceneNumber: 4,
          durationSeconds: 8,
          visualPrompt: 'আউটরো স্ক্রিন, সাবস্ক্রাইব ও বেল আইকন অ্যানিমেশন',
          voiceover: 'পরবর্তী পর্বে আপনি কোন বিষয়ে জানতে চান তা নিচে কমেন্টে লিখুন। সাবস্ক্রাইব করে সাথে থাকুন!',
          onScreenText: '🔔 সাবস্ক্রাইব করুন ও কমেন্টে জানান!',
          bRollSuggestion: 'ভিডিও থাম্বনেইল কার্ড ও সোশ্যাল মিডিয়া হ্যান্ডেল',
          musicMood: 'স্মুথ আউটরো ফেডার',
        },
      ],
      titleIdeas: [
        `${t} — সম্পূর্ণ নতুন নিয়মে শুরু করুন (গোপন ট্রিকস)`,
        `যেভাবে মাত্র ৫ মিনিটে ${t} করা যায় | ২০২৬ স্পেশাল`,
        `না দেখলে মিস করবেন: ${t} নিয়ে জরুরি গাইড`,
      ],
      description: `আজকের ভিডিওতে সহজ বাংলায় তুলে ধরা হয়েছে ${t}-এর সম্পূর্ণ প্র্যাকটিক্যাল গাইড। ভিডিওটি ভালো লাগলে লাইক দিন ও শেয়ার করুন।`,
      hashtags: ['#ContentCreator', '#MoSaFaStudio', '#TechBangla', '#Tutorial'],
      callToAction: 'ভিডিওটি উপকারী মনে হলে আপনার ক্রিয়েটর বন্ধুদের সাথে শেয়ার করুন ও চ্যানেল সাবস্ক্রাইব করুন!',
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: fallbackPlan,
      isAiAvailable: false,
      message: 'টেমপ্লেট মোড: পূর্ণাঙ্গ স্টোরিবোর্ড ও সিন তৈরি করা হয়েছে।',
    };
  }

  // 5. Content Repurposer
  static async repurpose(sourceText: string): Promise<CreatorAiResponse<RepurposedPackage>> {
    const apiRes = await this.callApi('/api/creator/generate', {
      action: 'repurpose_content',
      sourceText,
    });

    if (apiRes && apiRes.success && apiRes.data) {
      return {
        success: true,
        data: apiRes.data,
        isAiAvailable: apiRes.isAiAvailable ?? true,
      };
    }

    const shortSample = sourceText.slice(0, 120);
    const fallbackPkg: RepurposedPackage = {
      sourceText,
      blogArticle: `# সম্পূর্ণ গাইড: ${shortSample}...\n\nআধুনিক ডিজিটাল দুনিয়ায় কার্যকর ফলাফল পাওয়ার জন্য নিয়মিত গবেষণা ও কনটেন্ট স্ট্র্যাটেজি থাকা অপরিহার্য।\n\n### প্রধান হাইলাইটস:\n- সুস্পষ্ট লক্ষ্য নির্ধারণ\n- অডিয়েন্সের প্রশ্নের সরাসরি উত্তর প্রদান\n- নিয়মিত আউটপুট প্রকাশ\n\nআপনিও আজই আপনার প্রজেক্ট শুরু করতে পারেন!`,
      facebookPost: `✨ আজকের বিশেষ টিপস!\n\n${shortSample}...\n\nআপনার কি এই বিষয়ে অভিজ্ঞতা আছে? নিজের মতামত কমেন্টে শেয়ার করুন! 👇\n\n#MoSaFaTools #CreatorTips #Bangla`,
      youtubeScript: `[ইন্ট্রো]: আসসালামু আলাইকুম! আপনি কি জানেন কীভাবে ${shortSample}... সহজে সম্পন্ন করা যায়?\n\n[মূল অংশ]: এর পেছনের আসল রহস্য হলো সঠিক পরিকল্পনা ও ধারাবাহিকতা...\n\n[আউটরো]: ভিডিওটি ভালো লাগলে লাইক ও সাবস্ক্রাইব করুন!`,
      shortsScript: `মাত্র ৩০ সেকেন্ডে জেনে নিন! 🚀\n\n${shortSample}...\n\n১. সহজ রাখুন\n২. দ্রুত ডেলিভারি দিন\n৩. অডিয়েন্সকে অ্যাকশন নিতে বলুন!\n\nফলো করতে ভুলবেন না! 🔥`,
      carouselSlides: [
        `স্লাইড ১: মূল রহস্যটি কী? (${shortSample})`,
        `স্লাইড ২: যে ৩টি বিষয় মাথায় রাখবেন`,
        `স্লাইড ৩: প্রথম পদক্ষেপ কীভাবে নেবেন`,
        `স্লাইড ৪: সাধারণ ভুল থেকে বাঁচার উপায়`,
        `স্লাইড ৫: সেভ করে রাখুন ও বন্ধুদের মেনশন করুন!`,
      ],
      linkedinPost: `সফল কনটেন্ট স্ট্র্যাটেজির মূল ভিত্তি হলো ধারাবাহিকতা ও ভ্যালু প্রোভাইড করা।\n\n${shortSample}...\n\nআপনার ইন্ডাস্ট্রিতে আপনি এই বিষয়টি কীভাবে হ্যান্ডেল করেন? আলোচনা করতে পেরে আনন্দিত হব।\n\n#ContentStrategy #Growth #Productivity`,
      newsletterDraft: `প্রিয় সাবস্ক্রাইবার,\n\nআশা করি ভালো আছেন। আজকের নিউজলেটারের বিশেষ টপিক:\n\n${shortSample}...\n\nপুরো বিষয়টি এক নজরে বুঝে নিন এবং আপনার কাজে প্রয়োগ করুন।\n\nআন্তরিক শুভেচ্ছাসহ,\nThe MoSaFa Studio`,
      quoteCard: `"${shortSample.slice(0, 80)}..."`,
      pinterestDescription: `সেরা টিপস ও গাইডলাইন: ${shortSample}... সম্পূর্ণ পড়তে পিনটি সেভ করুন!`,
    };

    return {
      success: true,
      data: fallbackPkg,
      isAiAvailable: false,
      message: 'টেমপ্লেট মোড: ৯টি ভিন্ন ফরম্যাটে স্বয়ংক্রিয়ভাবে রূপান্তর সম্পন্ন হয়েছে।',
    };
  }
}
