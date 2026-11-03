/**
 * The MoSaFa Tools - Master Version & Live Sync Configuration
 *
 * Master Short Command:
 *  - "Update ON"  : IS_UPDATE_ON = true (Broadcasts new updates to all online users and offline mobile PWA/APK users upon reconnect)
 *  - "Update OFF" : IS_UPDATE_ON = false (Development/draft mode, user clients do not update or reload)
 */

export interface AppVersionConfig {
  isUpdateOn: boolean;
  version: string;
  buildNumber: number;
  releaseDate: string;
  releaseDateBangla: string;
  updateTitle: string;
  updateMessage: string;
  features: string[];
  offlineSyncSupported: boolean;
}

export const APP_VERSION_CONFIG: AppVersionConfig = {
  // Master Short Prompt Flag: 'Update ON' is ACTIVE
  isUpdateOn: true,
  version: '3.4.0',
  buildNumber: 110,
  releaseDate: '2026-11-02T15:30:00.000Z',
  releaseDateBangla: '০২ নভেম্বর ২০২৬',
  updateTitle: 'The MoSaFa Tools - লাইভ অনলাইন ও অফলাইন অটো-আপডেট v3.4.0 সক্রিয়',
  updateMessage:
    'সকল অনলাইন ভিজিটর এবং মোবাইল ব্যবহারকারীদের জন্য নতুন মাস্টার টুল "MoSaFa All Form Fillup" (বাসা ভাড়ার রসিদ ও ২৪+ অটো ফরম মেকার) সম্প্রচার করা হয়েছে।',
  features: [
    'নতুন মাস্টার টুল: MoSaFa All Form Fillup (তথ্য দিন, ফরম তৈরি করুন—সহজে, দ্রুত, নির্ভুলভাবে)',
    'বাসা ভাড়ার রসিদ: রেফারেন্স ফরম্যাট অনুযায়ী নিখুঁত বাংলা ফ্রেম, টাকার অংক ও বাংলায় স্বয়ংক্রিয় কথায় রূপান্তর',
    '৫টি ক্যাটাগরির ২৪+ ফরম: বাসা ও সম্পত্তি, ব্যক্তিগত ও আবেদন, ব্যবসা ও অফিস, শিক্ষা প্রতিষ্ঠান এবং কাস্টম ফরম',
    'লাইভ ডুয়েল প্রিভিউ ও মোবাইল ফ্রেন্ডলি ইন্টারফেস: জুম কন্ট্রোল, সরাসরি A4 প্রিন্ট ও আল্ট্রা-শার্প PDF/PNG ডাউনলোড',
    'নিজের ফরম তৈরি করুন (Custom Form Builder): ফিল্ড যোগ, ক্রম পরিবর্তন ও ব্রাউজার লোকাল স্টোরেজ ড্রাফট সেভ',
  ],
  offlineSyncSupported: true,
};
