import { ValidationPlan, BusinessPlanDocument, BusinessOfferDraft } from '../types/entrepreneur';

export interface EntrepreneurAiResponse<T> {
  success: boolean;
  data: T;
  isAiAvailable: boolean;
  message?: string;
}

export class EntrepreneurAiService {
  private static async callBackend(payload: any): Promise<any> {
    try {
      const response = await fetch('/api/entrepreneur/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err: any) {
      console.warn('[Entrepreneur AI] Backend API call failed, falling back to local business templates:', err?.message);
      return null;
    }
  }

  // 1. Validate Business Idea
  static async validateIdea(params: {
    ideaDescription: string;
    targetLocation: string;
    budget: string;
    skills: string[];
  }): Promise<EntrepreneurAiResponse<Partial<ValidationPlan>>> {
    const apiRes = await this.callBackend({
      action: 'validate_idea',
      ...params,
    });

    if (apiRes && apiRes.success && apiRes.data) {
      return {
        success: true,
        data: apiRes.data,
        isAiAvailable: apiRes.isAiAvailable ?? true,
      };
    }

    // Comprehensive Rule-Based Fallback Engine
    const cleanedIdea = params.ideaDescription.trim();
    const fallbackData: Partial<ValidationPlan> = {
      customerProblem: `কাস্টমাররা বর্তমানে এই সেবা বা পণ্য পেতে অতিরিক্ত সময় অপচয় করছেন, বড় ব্র্যান্ডের অতিরিক্ত মূল্য দিতে বাধ্য হচ্ছেন অথবা মানসম্মত ও বিশ্বস্ত সার্ভিস খুঁজে পাচ্ছেন না।`,
      targetAudience: `${params.targetLocation || 'বাংলাদেশ'}-এর ছোট-মাঝারি পরিবার, দোকানদার ও চাকুরিজীবী যারা সহজে ও ন্যায্য মূল্যে এই সুবিধা চান।`,
      valueProposition: `কোনো মধ্যস্বত্বভোগী ও অপ্রয়োজনীয় খরচ ছাড়া সরাসরি দ্রুত ডেলিভারি, ব্যক্তিগত যত্ন ও ১০০% সন্তুষ্টি গ্যারান্টি।`,
      competitors: [
        {
          name: 'ঐতিহ্যবাহী লোকাল মার্কেট / দোকানদার',
          pricingEstimate: 'স্বাভাবিক বাজারদর',
          strengths: 'দীর্ঘদিনের উপস্থিতি ও দৃশ্যমান পরিচিতি',
          weaknesses: 'ডিজিটাল সেবার অভাব, দেরিতে ডেলিভারি, কাস্টমারদের ব্যক্তিগত ফলো-আপ না রাখা',
          ourAdvantage: 'দ্রুত হোম সার্ভিস / ডিজিটাল সাপোর্ট এবং সাশ্রয়ী মূল্য প্যাকেজ',
        },
        {
          name: 'বড় জাতীয় কোম্পানি / ব্র্যান্ড',
          pricingEstimate: 'উচ্চমূল্য ও ফিক্সড চার্জ',
          strengths: 'বড় বিজ্ঞাপন বাজেট ও দেশব্যাপী নেটওয়ার্ক',
          weaknesses: 'ছোট কাস্টমারের সমস্যায় ধীরগতি, কোনো আন্তরিক যোগাযোগ নেই',
          ourAdvantage: 'হাইপার-লোকাল যত্ন এবং যেকোনো সময় হোয়াটসঅ্যাপে সরাসরি ওনারের সাথে যোগাযোগ',
        },
      ],
      interviewQuestions: [
        {
          id: 'iq-gen-1',
          question: `আপনি বর্তমানে "${cleanedIdea.slice(0, 30)}..." সংক্রান্ত সমস্যার মুখোমুখি হলে কীভাবে সমাধান করেন?`,
          purpose: 'বর্তমান বিকল্প সমাধান ও তাদের অসন্তোষ বোঝা',
          sampleAnswer: 'আশেপাশের কাউকে দিয়ে করাই অথবা নিজে গিয়ে সময় নষ্ট করে এনে দিই।',
        },
        {
          id: 'iq-gen-2',
          question: 'এই কাজের জন্য আপনার মাসে গড়ে কত টাকা বা কত ঘণ্টা সময় খরচ হয়?',
          purpose: 'সমস্যার তীব্রতা ও আর্থিক ব্যয়ের পরিমাণ যাচাই করা',
          sampleAnswer: 'মাসে ৫০০-১০০০ টাকা খরচ হয় এবং প্রচুর ঝামেলা পোহাতে হয়।',
        },
        {
          id: 'iq-gen-3',
          question: 'যদি আমি এই সেবা আপনার দোরগোড়ায় সহজে পৌঁছে দিই, আপনি কি ট্রায়াল নিতে আগ্রহী?',
          purpose: 'সরাসরি কেনার বা সেবা নেওয়ার আগ্রহ পরীক্ষা',
          sampleAnswer: 'যদি কোয়ালিটি ঠিক থাকে এবং দাম ন্যায্য হয় তবে অবশ্যই নেব।',
        },
      ],
      mvpPlan: {
        scope: 'ন্যূনতম একটি সাধারণ ডেমো বা স্যাম্পল অফার যা ১ দিনের মধ্যে তৈরি করা সম্ভব',
        format: 'WhatsApp Catalog / Simple PDF / Facebook Photo Album',
        timeToBuildDays: 2,
        budgetBDT: 0,
      },
      experiments: [
        {
          name: '৫ জন পরিচিত মানুষের কাছে অফার দেখানো',
          method: 'হোয়াটসঅ্যাপে ব্যক্তিগত মেসেজ দিয়ে তাদের নিরপেক্ষ পরামর্শ চাওয়া',
          successMetric: '৫ জনের অন্তত ৩ জন ইতিবাচক মনোভাব প্রকাশ করবেন',
          status: 'planned',
        },
        {
          name: 'লোকাল গ্রুপে ভ্যালু পোস্ট শেয়ার',
          method: 'কোনো বিক্রি ছাড়া শুধু কীভাবে সমস্যার সমাধান করা যায় তা নিয়ে পোস্ট দেওয়া',
          successMetric: 'অন্তত ১০টি কমেন্ট বা মেসেজ আসা',
          status: 'planned',
        },
      ],
      identifiedRisks: [
        'কাস্টমাররা শুরুতে নতুন সেবায় দ্বিধাবোধ করতে পারেন (সমাধান: ছোট স্যাম্পল বা নো-রিস্ক ট্রায়াল অফার করা)',
        'বাজারের প্রচলিত বিকল্পগুলোর সাথে দামের প্রতিযোগিতা (সমাধান: সার্ভিস কোয়ালিটি ও দ্রুততায় জোর দেওয়া)',
      ],
      nextActions: [
        'আজই ২ জন সম্ভাব্য কাস্টমারের সাথে কথা বলে প্রশ্নগুলোর উত্তর নোটবুকে লিখে রাখা।',
        'ক্যানভাতে নিজের সেবার ১ পৃষ্ঠার একটি আকর্ষণীয় পরিচয়পত্র বা মেনু প্রস্তুত করা।',
        'প্রথম কাস্টমারকে সন্তুষ্ট করার জন্য ১০০% শ্রম দেওয়া।',
      ],
    };

    return {
      success: true,
      data: fallbackData,
      isAiAvailable: false,
      message: 'লোকাল বিজনেস ভ্যালিডেশন ইঞ্জিনের সাহায্যে তৈরি হয়েছে।',
    };
  }

  // 2. Generate Marketing Content
  static async generateMarketingCopy(params: {
    businessName: string;
    productService: string;
    targetAudience: string;
    type: 'facebook_post' | 'sales_copy' | 'whatsapp_message' | 'video_script';
    tone: string;
  }): Promise<EntrepreneurAiResponse<string>> {
    const apiRes = await this.callBackend({
      action: 'generate_marketing_copy',
      ...params,
    });

    if (apiRes && apiRes.success && apiRes.data?.content) {
      return {
        success: true,
        data: apiRes.data.content,
        isAiAvailable: apiRes.isAiAvailable ?? true,
      };
    }

    // High converting Bangla Copywriting Fallback
    const bName = params.businessName || 'আমাদের উদ্যোগ';
    const prod = params.productService || 'আমাদের সেবা/পণ্য';

    if (params.type === 'facebook_post') {
      const fbCopy = `🔥 আপনার প্রতিদিনের ঝামেলা কমাতে পাশে আছে ${bName}!

অনেকেরই ইচ্ছা থাকে একটি ভালো ও নির্ভরযোগ্য সমাধান পাওয়ার, কিন্তু বিশ্বস্ত উদ্যোগের অভাবে কাজটি করা হয়ে ওঠে না। 

আমরা নিয়ে এসেছি ${prod}—যা আপনার সময় ও অর্থ দুটোই বাঁচাবে।

✨ আমাদের বিশেষ বৈশিষ্ট্য:
✅ কোনো বাড়তি বা গোপন চার্জ নেই
✅ দ্রুত ও সর্বোচ্চ আন্তরিকতার সাথে সেবা প্রদান
✅ ১০০% কোয়ালিটি ও সন্তুষ্টির নিশ্চয়তা

👉 বিস্তারিত জানতে বা আজই অর্ডার কনফার্ম করতে আমাদের ইনবক্সে মেসেজ দিন অথবা হোয়াটসঅ্যাপে কথা বলুন!`;
      return { success: true, data: fbCopy, isAiAvailable: false };
    }

    if (params.type === 'sales_copy') {
      const salesCopy = `🎯 আপনি কি ${prod} খুঁজছেন, কিন্তু কোনটা ভালো হবে তা নিয়ে সিদ্ধান্তহীনতায় ভুগছেন?

আমরা বুঝি আপনার প্রয়োজনের গুরুত্ব। বাজেটের মধ্যে সেরা মানের নিশ্চয়তা দিতেই ${bName}-এর যাত্রা।

📌 কেন শত শত কাস্টমার আমাদের বেছে নিচ্ছেন?
১. প্রিমিয়াম কোয়ালিটি ও সৎ কমিটমেন্ট
২. কোনো মধ্যস্বত্বভোগী নেই, তাই সরাসরি সাশ্রয়ী মূল্য
৩. পছন্দ না হলে সহজ সমাধান গ্যারান্টি

🎁 [সীমিত সময়ের বিশেষ অফার]: প্রথম ১০ জন অর্ডারকারীর জন্য রয়েছে আকর্ষণীয় ছাড়!

👉 এখনই ইনবক্সে "OFFER" লিখে মেসেজ দিন অথবা হোয়াটসঅ্যাপ করুন: 01XXXXXXXXX`;
      return { success: true, data: salesCopy, isAiAvailable: false };
    }

    if (params.type === 'whatsapp_message') {
      const waCopy = `আসসালামু আলাইকুম ভাইয়া/আপু 🌸

কেমন আছেন? আশা করি ভালো আছেন।

আমি ${bName} থেকে যোগাযোগ করছি। আমরা মূলত ${params.targetAudience || 'আমাদের সম্মানিত গ্রাহকদের'}-এর জন্য প্রিমিয়াম ${prod} সরবরাহ করে থাকি।

আপনার সুবিধার জন্য আমাদের সাম্প্রতিক কাজের কিছু নমুনা ও বিশেষ প্যাকেজ রেডি রয়েছে। 

আপনি চাইলে কি ছোট্ট একটি ১ পৃষ্ঠার ক্যাটালগ পাঠাতে পারি? কোনো বাধ্যবাধকতা নেই, শুধু আপনার মূল্যবান মতামত পেলে অনেক খুশি হতাম।

ধন্যবাদান্তে,
${bName} টিম
ফোন/WhatsApp: 01XXXXXXXXX`;
      return { success: true, data: waCopy, isAiAvailable: false };
    }

    const script = `🎬 [ভিডিও স্ক্রিপ্ট: ৩০ সেকেন্ডের শর্টস / রিলস]

⏱️ [00:00 - 00:05] হুক (Hook):
"আপনি কি এখনও ${prod} নিয়ে ঘণ্টার পর ঘণ্টা সময় নষ্ট করছেন? তাহলে এই ভিডিওটি আপনার জন্য!"

⏱️ [00:05 - 00:15] সমস্যা ও সমাধান (Problem & Solution):
"আমরা জানি ব্যস্ত জীবনে মানসম্মত সেবা খুঁজে পাওয়া কতটা কষ্টের। তাই ${bName} নিয়ে এসেছে ঝামেলাহীন ও সাশ্রয়ী সমাধান—যা খুব সহজে আপনার দরজায় পৌঁছে যাবে।"

⏱️ [00:15 - 00:25] প্রমাণ ও সুবিধা (Proof):
"কোনো হিডেন চার্জ নেই, সরাসরি সেরা কোয়ালিটি এবং ১০০% সাপোর্ট।"

⏱️ [00:25 - 00:30] কল টু অ্যাকশন (CTA):
"দেরি না করে আজই নিচের লিংকে ক্লিক করুন অথবা আমাদের পেজে ইনবক্স করুন!"`;
    return { success: true, data: script, isAiAvailable: false };
  }

  // 3. Generate Complete Business Plan
  static async generateBusinessPlan(params: {
    businessName: string;
    ideaDescription: string;
    targetLocation: string;
    monthlyIncomeGoal: number;
  }): Promise<EntrepreneurAiResponse<Partial<BusinessPlanDocument>>> {
    const apiRes = await this.callBackend({
      action: 'generate_plan',
      ...params,
    });

    if (apiRes && apiRes.success && apiRes.data) {
      return {
        success: true,
        data: apiRes.data,
        isAiAvailable: apiRes.isAiAvailable ?? true,
      };
    }

    const bName = params.businessName || 'আমার নতুন ব্যবসা';
    const idea = params.ideaDescription || 'সার্ভিস ও পণ্য সরবরাহ উদ্যোগ';
    const loc = params.targetLocation || 'বাংলাদেশ';

    const planData: Partial<BusinessPlanDocument> = {
      businessName: bName,
      tagline: 'শূন্য থেকে স্বাবলম্বী হওয়ার বাস্তবমুখী উদ্যোগ',
      lastUpdated: new Date().toISOString(),
      executiveSummary: `${bName} একটি স্থানীয় বাজারভিত্তিক আধুনিক উদ্যোগ, যা ${loc}-এর গ্রাহকদের জন্য ${idea} সেবা সহজে ও সাশ্রয়ী খরচে প্রদান করার লক্ষ্যে গঠিত হয়েছে। এটি শূন্য বা সামান্য প্রাথমিক পুঁজিতে গ্রাহকের অগ্রিম অর্থ ও নিজস্ব দক্ষতার ওপর দাঁড়িয়ে গড়ে তোলা হবে।`,
      businessDescription: `উদ্যোগটি সম্পূর্ণ গ্রাহককেন্দ্রিক। বাজারে প্রচলিত জটিলতা ও অতিরিক্ত খরচ পরিহার করে সরাসরি মোবাইল, সোশ্যাল মিডিয়া ও স্থানীয় নেটওয়ার্কিংয়ের মাধ্যমে সেবা সরবরাহ করা হবে।`,
      problemAndSolution: `বিদ্যমান সমস্যা: গ্রাহকরা সময়মতো খাঁটি সেবা পাচ্ছেন না অথবা অতিরিক্ত চার্জের শিকার হচ্ছেন। আমাদের সমাধান: স্বচ্ছ মূল্যতালিকা, দ্রুত রেসপন্স ও সর্বোচ্চ আন্তরিকতার সাথে গ্রাহক সন্তুষ্টি অর্জন।`,
      targetCustomerProfile: `${loc} এলাকার ২০ থেকে ৪৫ বছর বয়সী পরিবার, পেশাজীবী ও ক্ষুদ্র ব্যবসায়ী যারা নিয়মিত এই সেবার প্রয়োজন অনুভব করেন।`,
      marketResearchAndOpportunity: `বাংলাদেশের ক্রমবর্ধমান অর্থনৈতিক উন্নয়ন ও ডিজিটাল সেবার প্রসারের ফলে স্থানীয় ও রিমোট সার্ভিসের চাহিদা প্রতিনিয়ত বৃদ্ধি পাচ্ছে। ব্যক্তিগত আন্তরিকতা ও সততা বজায় রাখলে প্রথম মাস থেকেই নিয়মিত ক্লায়েন্ট পাওয়া সম্ভব।`,
      competitorAnalysis: `প্রতিযোগীরা অনেকেই কাস্টমারের কথা মনোযোগ দিয়ে শোনেন না বা সময়মতো কাজ ডেলিভারি দেন না। আমাদের প্রধান শক্তি হবে নিখুঁত সময়ানুবর্তিতা এবং গ্রাহকের সাথে সার্বক্ষণিক ফলো-আপ।`,
      productsAndPricing: `আমরা সহজবোধ্য তিনটি স্তরে সেবা অফার করব: স্টার্টার (বেসিক প্রয়োজনের জন্য), গ্রোথ (সর্বোত্তম ভ্যালু), এবং প্রিমিয়াম (কমপ্লিট সাপোর্ট)।`,
      marketingAndAcquisitionPlan: `ফ্রি ও অর্গানিক মার্কেটিং: ফেসবুক গ্রুপে প্রাসঙ্গিক উপদেশ দেওয়া, লোকাল ব্যবসায়ীদের সাথে সরাসরি যোগাযোগ, মুখে মুখে প্রচার (Word of Mouth) এবং সন্তুষ্ট গ্রাহকদের থেকে রেফারেল গ্রহণ।`,
      salesAndConversionProcess: `ফ্রি ডেমো বা স্যাম্পল প্রদর্শন → ৩ দিনের সন্তুষ্টি ট্রায়াল → ৫০% অগ্রিম নিশ্চিতকরণ → সম্পূর্ণ ডেলিভারি ও রিসিট প্রদান।`,
      operationsAndDailyWorkflow: `প্রতিদিন সকালের শিডিউল: কাস্টমার মেসেজ ও অর্ডারের আপডেট। দুপুরের শিডিউল: মূল কাজ ও ডেলিভারি সম্পাদন। সন্ধ্যার শিডিউল: নতুন ৫ জনের কাছে পৌঁছানো ও দৈনিক আয়-ব্যয় সংরক্ষণ।`,
      financialProjections: {
        startingCapitalNeeded: 0,
        monthlyOverhead: 1500,
        estimatedBreakEvenMonths: 1,
        month1RevenueTarget: Math.round((params.monthlyIncomeGoal || 30000) * 0.4),
        month3RevenueTarget: params.monthlyIncomeGoal || 30000,
      },
      risksAndMitigation: `প্রধান ঝুঁকি: শুরুতে গ্রাহকের আস্থা পেতে সময় লাগা। সমাধান: মানি-ব্যাক গ্যারান্টি এবং কাজ পছন্দ না হলে কোনো চার্জ না নেওয়ার সাহসী ঘোষণা।`,
      thirtyDayMilestones: [
        'দিন ১-৭: প্রোফাইল, স্যাম্পল ও অফার চূড়ান্তকরণ',
        'দিন ৮-১৫: ২০ জন সম্ভাব্য গ্রাহকের সাথে কথা বলে প্রথম ৩ জন ট্রায়াল ক্লায়েন্ট নেওয়া',
        'দিন ১৬-২২: প্রথম পেইড অর্ডার সম্পন্ন করা এবং লিখিত রিভিউ সংগ্রহ',
        'দিন ২৩-৩০: নিয়মিত ৩-৫ জন ক্লায়েন্ট নিশ্চিত করে প্রথম মাসের লাভ হাতে নেওয়া',
      ],
      ninetyDayVision: `তিন মাস পর এই ব্যবসাকে একটি নির্ভরযোগ্য ও স্বয়ংক্রিয় আয়ের উৎসে পরিণত করা এবং প্রয়োজনে একজন দক্ষ সহকারীকে যুক্ত করে সেবার পরিধি দ্বিগুণ করা।`,
    };

    return {
      success: true,
      data: planData,
      isAiAvailable: false,
      message: 'ব্যবসার প্রমিত ফ্রেমওয়ার্ক অনুযায়ী প্ল্যান তৈরি হয়েছে।',
    };
  }
}
