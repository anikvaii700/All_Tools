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
  version: '3.1.0',
  buildNumber: 107,
  releaseDate: '2026-10-30T04:00:00.000Z',
  releaseDateBangla: '৩০ অক্টোবর ২০২৬',
  updateTitle: 'The MoSaFa Tools - লাইভ অনলাইন ও অফলাইন অটো-আপডেট v3.1.0 সক্রিয়',
  updateMessage: 'সকল অনলাইন ভিজিটর এবং মোবাইল অ্যাপ ব্যবহারকারীদের জন্য সর্বশেষ ২৩টি টুলস, ১,০০০+ কুইজ ডাটাবেস ও দৈনিক স্পিন আপডেট সম্প্রচার করা হয়েছে।',
  features: [
    'সর্বমোট ২৩টি সক্রিয় অনলাইন টুলসের স্বয়ংক্রিয় হিসাব ও ডায়নামিক কাউন্টার',
    'বাংলা ধাঁধা ও কুইজ: ১,০০০+ প্রশ্নের বিশাল ডাটাবেস ও প্রতি সেশনে র‍্যান্ডম ১০টি প্রশ্ন',
    'দৈনিক লাকি স্পিনার: ১০০ থেকে ১০০০ কয়েন রিওয়ার্ড আপডেট',
    'ইন্টারফেস অপ্টিমাইজেশন ও অপ্রয়োজনীয় টুলস সফলভাবে ছাঁটাই',
    'অনলাইন ডোমেইন ও অফলাইন মোবাইল অ্যাপে স্বয়ংক্রিয় রিয়েল-টাইম সিঙ্ক ইঞ্জিন v3.1.0',
  ],
  offlineSyncSupported: true,
};
