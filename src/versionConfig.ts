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
  version: '3.0.0',
  buildNumber: 106,
  releaseDate: '2025-05-20T12:00:00.000Z',
  releaseDateBangla: '২০ মে ২০২৫',
  updateTitle: 'The MoSaFa Tools - লাইভ অনলাইন ও অফলাইন অটো-আপডেট সক্রিয়',
  updateMessage: 'সকল অনলাইন ভিজিটর এবং মোবাইল অ্যাপ ব্যবহারকারীদের জন্য স্বয়ংক্রিয় রিয়েল-টাইম আপডেট ও অফলাইন ক্যাশিং সফলভাবে সম্পন্ন হয়েছে।',
  features: [
    'MoSaFa Application Writer পূর্ণাঙ্গ সংস্করণ (ঐচ্ছিক সুপারিশ ও অনুমোদন ফিল্ডসহ)',
    'একক পাতার (১ পাতা) দরখাস্তে অপ্রয়োজনীয় পেজ নম্বর স্বয়ংক্রিয়ভাবে পরিহার',
    'কম্পিউটার/ল্যাপটপ (১৩টি টুলস) ও মোবাইল (১৬টি টুলস) বিশেষায়িত সেক্টর ফিল্টার',
    'শর্ট প্রম্পট কমান্ড সিস্টেম (Random OFF/ON এবং Update ON/OFF)',
    'অনলাইন ডোমেইন ও অফলাইন মোবাইল অ্যাপে স্বয়ংক্রিয় রিয়েল-টাইম সিঙ্ক ইঞ্জিন',
  ],
  offlineSyncSupported: true,
};
