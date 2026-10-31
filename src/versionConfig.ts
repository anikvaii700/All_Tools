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
  version: '3.2.0',
  buildNumber: 108,
  releaseDate: '2026-10-30T09:31:00.000Z',
  releaseDateBangla: '৩০ অক্টোবর ২০২৬',
  updateTitle: 'The MoSaFa Tools - লাইভ অনলাইন ও অফলাইন অটো-আপডেট v3.2.0 সক্রিয়',
  updateMessage:
    'সকল অনলাইন ভিজিটর এবং মোবাইল অ্যাপ ব্যবহারকারীদের জন্য সর্বশেষ ২৪টি টুলস, এডমিন সাপোর্ট টেক্সট এডিটর ও সার্বিক অপ্টিমাইজেশন সম্প্রচার করা হয়েছে।',
  features: [
    'এডমিন প্যানেলে সরাসরি সাপোর্ট পপআপের বিবরণী বার্তা, শিরোনাম ও ব্যাজ পরিবর্তনের ব্যবস্থা',
    'সাপোর্ট পপআপ থেকে সরাসরি এক ক্লিকে এডমিন প্যানেল খোলার শর্টকাট (⚙️)',
    'MoSaFa PDF Toolkit, Application Writer ও CV Maker সহ সকল টুলস অপ্টিমাইজেশন',
    'বাংলা ধাঁধা ও কুইজ: ১,০০০+ প্রশ্নের বিশাল ডাটাবেস ও তাৎক্ষণিক স্কোর শেয়ার',
    'অনলাইন ডোমেইন ও অফলাইন মোবাইল অ্যাপে স্বয়ংক্রিয় রিয়েল-টাইম সিঙ্ক ইঞ্জিন v3.2.0',
  ],
  offlineSyncSupported: true,
};
