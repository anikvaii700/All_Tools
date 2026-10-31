# The MoSaFa Tools — সম্পূর্ণ পাবলিশিং, ডোমেইন ও হোস্টিং সেটআপ গাইডলাইন

এই গাইডে **The MoSaFa Tools** প্ল্যাটফর্মটিকে অনলাইনে লাইভ পাবলিশ করা, নিজস্ব কাস্টম ডোমেইন (যেমন: `www.yourdomain.com`) যুক্ত করা এবং হোস্টিং কনফিগার করার সম্পূর্ণ পদ্ধতি ধাপে ধাপে বর্ণনা করা হলো।

---

## ১. প্ল্যাটফর্ম আর্কিটেকচার বোঝা (কেন এটি গুরুত্বপূর্ণ)

The MoSaFa Tools একটি **Full-Stack Node.js + React (Vite)** অ্যাপ্লিকেশন:
1. **Frontend (ক্লায়েন্ট):** React 19, Tailwind CSS v4, Lucide Icons (যা `npm run build` দিলে `dist/` ফোল্ডারে বিল্ড হয়)।
2. **Backend (সার্ভার):** Express.js (`server.ts`) যা `/api/studymate/chat`, `/api/entrepreneur/generate`, `/api/creator/generate`, `/api/palmistry/analyze` ইত্যাদি AI ও সিস্টেম রুট পরিচালনা করে এবং একই সাথে ফ্রন্টএন্ড পরিবেশন করে।
3. **Database & Auth:** Firebase Firestore ও Google Auth (`firebase-applet-config.json`)।

👉 **হোস্টিং নির্বাচনের মূল নিয়ম:** শুধুমাত্র সাধারণ স্ট্যাটিক হোস্টিং (যেমন বেসিক GitHub Pages) এ backend API রুট চলবে না। তাই এমন হোস্টিং বেছে নিতে হবে যা **Node.js** সাপোর্ট করে।

---

## ২. সেরা ৩টি হোস্টিং পদ্ধতি (আপনার সুবিধা অনুযায়ী বেছে নিন)

| হোস্টিং প্ল্যাটফর্ম | খরচ | সুবিধা | কাদের জন্য সেরা |
|---|---|---|---|
| **পদ্ধতি ১: Render.com (রেকমেন্ডেড)** | ফ্রি / $৭ মাস | GitHub-এর সাথে অটো-ডিপ্লয়, ফ্রি SSL, কাস্টম ডোমেইন সাপোর্ট | সবচেয়ে সহজ ও সেরা |
| **পদ্ধতি ২: Vercel / Railway** | ফ্রি টিয়ার আছে | অত্যন্ত দ্রুত গ্লোবাল সিডিএন ও সহজ ডোমেইন কানেক্ট | আধুনিক ডেভেলপার |
| **পদ্ধতি ৩: cPanel বা VPS (Hostinger / DigitalOcean)** | $১ - $৫ মাস | সম্পূর্ণ নিজস্ব সার্ভার ও ডেডিকেটেড কন্ট্রোল | যাদের অলরেডি cPanel/VPS আছে |

---

## ৩. পদ্ধতি ১: Render.com এ ফ্রি লাইভ পাবলিশ (সবচেয়ে সহজ ও জনপ্রিয়)

আপনার গিটহাব রিপোজিটরি (`anikvaii700/All_Tools`) সরাসরি রেন্ডারের সাথে কানেক্ট করে লাইভ করা যায়:

### ধাপ ১: Render অ্যাকাউন্ট তৈরি
1. [https://render.com](https://render.com)-এ যান।
2. **Sign Up with GitHub** দিয়ে লগইন করুন (যাতে আপনার রিপোজিটরি সরাসরি দেখা যায়)।

### ধাপ ২: নতুন Web Service তৈরি
1. Render ড্যাশবোর্ডে গিয়ে **"New +"** বাটনে ক্লিক করে **"Web Service"** নির্বাচন করুন।
2. আপনার GitHub রিপোজিটরি `anikvaii700/All_Tools` সিলেক্ট করে **Connect** করুন।

### ধাপ ৩: সেটিংস কনফিগার করুন
- **Name:** `mosafa-tools` (বা আপনার পছন্দের নাম)
- **Region:** `Singapore` (বাংলাদেশ থেকে সবচেয়ে দ্রুত গতির জন্য সিঙ্গাপুর রিজিয়ন সেরা)
- **Branch:** `main`
- **Runtime:** `Node`
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  node server.ts
  ```
  *(অথবা `npm run start`)*
- **Instance Type:** `Free`

### ধাপ ৪: Environment Variables (পরিবেশ ভ্যারিয়েবল) সেটআপ
Render-এর **Environment** ট্যাবে গিয়ে নিচের ভ্যারিয়েবলগুলো যোগ করুন:
- `PORT` = `3000`
- `NODE_ENV` = `production`
- `GEMINI_API_KEY` = `আপনার_গুগল_জেমিনি_এপিআই_কি` *(AI স্টুডিও থেকে ফ্রি পাওয়া যায়)*

### ধাপ ৫: Deploy বাটনে ক্লিক করুন
- রেন্ডার কয়েক মিনিটের মধ্যে ডিপ্লয় সম্পন্ন করবে এবং আপনাকে একটি ফ্রি সাবডোমেইন দেবে (যেমন: `https://mosafa-tools.onrender.com`)।

---

## ৪. পদ্ধতি ২: Vercel-এ ডিপ্লয়মেন্ট

1. [https://vercel.com](https://vercel.com)-এ GitHub দিয়ে লগইন করুন।
2. **Add New Project** → রিপোজিটরি সিলেক্ট করুন।
3. Framework Preset: **Vite**।
4. **Environment Variables**-এ `GEMINI_API_KEY` দিন।
5. **Deploy** বাটনে ক্লিক করুন।

---

## ৫. পদ্ধতি ৩: cPanel হোস্টিংয়ে ডিপ্লয় (যদি Namecheap / Hostinger / বাংলাদেশি হোস্টিং থাকে)

আপনার যদি নিজস্ব cPanel হোস্টিং থাকে:

1. **cPanel-এ লগইন করুন:**
   - সার্চ বারে লিখুন **"Setup Node.js App"**।
2. **Create Application:**
   - **Node.js version:** `20.x` বা `22.x` নির্বাচন করুন।
   - **Application mode:** `Production`।
   - **Application root:** আপনার প্রজেক্ট ফোল্ডার (যেমন `mosafa_app`)।
   - **Application URL:** আপনার ডোমেইন বা সাবডোমেইন সিলেক্ট করুন।
   - **Application startup file:** `server.ts` (বা বিল্ড ফাইল)।
3. **ফাইল আপলোড:**
   - Git থেকে ফাইল ক্লোন করুন অথবা প্রজেক্টের জিপ ফাইল File Manager-এ আপলোড করে এক্সট্র্যাক্ট করুন।
4. **NPM Dependencies ইন্সটল:**
   - cPanel Node.js ইন্টারফেসে **"Run NPM Install"** বাটনে ক্লিক করুন।
5. **অ্যাপ্লিকেশন চালু করুন:**
   - **"Start App"** বাটনে ক্লিক করলেই সাইট লাইভ হয়ে যাবে।

---

## ৬. কাস্টম ডোমেইন সেটআপ করার পূর্ণাঙ্গ নিয়ম (Custom Domain Setup)

ধরা যাক আপনি Namecheap, Hostinger, GoDaddy অথবা বাংলাদেশি কোনো প্রভাইডার থেকে একটি ডোমেইন কিনেছেন (যেমন: `www.mosafatools.com`)।

### ধাপ ১: হোস্টিং প্ল্যাটফর্মে ডোমেইন যোগ করুন (যেমন Render-এ)
1. Render-এর আপনার Web Service ড্যাশবোর্ডে যান।
2. বাম পাশের মেনু থেকে **"Settings"**-এ যান।
3. নিচে স্ক্রোল করে **"Custom Domains"** সেকশনে যান।
4. **"Add Custom Domain"** বাটনে ক্লিক করুন।
5. আপনার ডোমেইন নাম লিখুন (যেমন: `www.mosafatools.com` এবং `mosafatools.com`)।
6. Render আপনাকে ২টি DNS রেকর্ড দেখাবে (একটি **CNAME** এবং একটি **A Record** বা **ALIAS**)।

### ধাপ ২: ডোমেইন কন্ট্রোল প্যানেলে (DNS Manager) রেকর্ড বসান
যেখান থেকে ডোমেইন কিনেছেন (Namecheap/Hostinger/Cloudflare)-এর DNS ম্যানেজারে যান:

1. **Root Domain (`mosafatools.com`):**
   - **Type:** `A`
   - **Host:** `@`
   - **Value / Points to:** Render বা আপনার হোস্টিংয়ের দেওয়া IP অ্যাড্রেস (যেমন `216.24.57.1` ইত্যাদি)
   - **TTL:** Automatic বা 300

2. **WWW Subdomain (`www.mosafatools.com`):**
   - **Type:** `CNAME`
   - **Host:** `www`
   - **Value / Target:** আপনার রেন্ডার অ্যাড্রেস (যেমন: `mosafa-tools.onrender.com`)
   - **TTL:** Automatic বা 300

### ধাপ ৩: ফ্রি SSL সার্টিফিকেট (HTTPS) সক্রিয়করণ
- Render, Vercel এবং Cloudflare স্বয়ংক্রিয়ভাবে বিনামূল্যে **Let's Encrypt SSL** প্রদান করে।
- DNS রেকর্ড বসানোর পর ৫ মিনিট থেকে ১ ঘণ্টার মধ্যে আপনার সাইটে স্বয়ংক্রিয়ভাবে গ্রিন প্যাডলক (নিরাপদ `https://`) চালু হয়ে যাবে।

---

## ৭. ক্লাউডফ্লেয়ার (Cloudflare) দিয়ে দ্রুত গতি ও সর্বোচ্চ নিরাপত্তা (ঐচ্ছিক কিন্তু অত্যন্ত কার্যকরী)

বাংলাদেশে লোডিং স্পিড বহুগুণ বাড়াতে এবং ডিডিওএস (DDoS) আক্রমণ থেকে বাঁচাতে Cloudflare ব্যবহার করা সেরা:
1. [https://cloudflare.com](https://cloudflare.com)-এ ফ্রি একাউন্ট খুলুন।
2. **Add a Site** দিয়ে আপনার ডোমেইন লিখুন।
3. ক্লাউডফ্লেয়ার আপনাকে ২টি **Nameserver** দেবে।
4. ডোমেইন রেজিস্ট্রার প্যানেলে (যেখান থেকে ডোমেইন কিনেছেন) ডিফল্ট নেমসার্ভার পরিবর্তন করে Cloudflare-এর নেমসার্ভার বসিয়ে দিন।
5. ক্লাউডফ্লেয়ারের ভেতরে SSL/TLS মোড **"Full"** রাখুন।

---

## ৮. ব্লগার (Blogger - `themedosafe.blogspot.com`) থেকে কাস্টম ডোমেইনে রিডাইরেক্ট বা এম্বেড

আপনার পূর্বে ব্লগার সাইট চালু থাকলে দুটি চমৎকার অপশন রয়েছে:

### অপশন ক (রেকমেন্ডেড): ব্লগার সাইটের কাস্টম থিমে এম্বেড
আপনার রিপোজিটরিতে থাকা `public/blogger-theme.xml` থিমটি ব্লগারে ব্যবহার করলে, ভিজিটর ব্লগার ডোমেইনে গেলেও স্বয়ংক্রিয়ভাবে ফুলস্ক্রিন ফাস্ট MoSaFa অ্যাপটি দেখতে পাবেন।

### অপশন খ: সরাসরি নতুন ডোমেইনে ট্রাফিক পাঠানো
ব্লগারের Theme → Edit HTML-এ `<head>`-এর নিচে নিচের কোডটি দিলে সব ট্রাফিক আপনার নতুন ডোমেইনে চলে যাবে:
```html
<script type='text/javascript'>
  window.location.replace("https://www.yournewdomain.com" + window.location.search);
</script>
```

---

## ৯. পাবলিশ করার পূর্ববর্তী চেকলিস্ট (Pre-Launch Checklist)

- [x] **সবগুলো ২৮টি টুলস সক্রিয়:** সমস্ত রুট (`?tool=...`) এবং হোমপেজ লোডিং ঠিক আছে কি না।
- [x] **পাসওয়ার্ড / এপিআই কি নিরাপত্তা:** কোনো সিক্রেট কি ফ্রন্টএন্ড কোডে নেই, সবগুলো `server.ts`-এ সুরক্ষিত।
- [x] **PWA ও মোবাইল ইনস্টল:** `public/manifest.json` এবং `public/sw.js` প্রস্তুত।
- [x] **মেটা ট্যাগ ও এসইও:** `index.html` এবং `metadata.json`-এ টাইটেল, বাংলা বিবরণী ও সোশ্যাল প্রিভিউ প্রস্তুত।
- [x] **প্রিন্ট ফরম্যাট:** ভোটার ফরম, সিভি মেকার ও বিজনেস প্ল্যান A4 সাইজে প্রিন্ট উপযোগী।

---
*প্রস্তুতকারক: The MoSaFa Tools Engine*
