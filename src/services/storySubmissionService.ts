import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SubmittedStory {
  id: string;
  title: string;
  author: string;
  authorContact?: string;
  storyType: 'islamic' | 'general';
  category: string;
  categoryLabel: string;
  shortDescription: string;
  content: string[]; // array of paragraphs
  lessonOrAmal?: string;
  reference?: string;
  coverIcon?: string;
  coverGradient?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  rejectionReason?: string;
}

export interface StoryNotification {
  id: string;
  storyId: string;
  title: string;
  author: string;
  storyType: 'islamic' | 'general';
  approvedAt: number;
  read?: boolean;
}

const LOCAL_STORAGE_KEY = 'mosafa_submitted_stories';
const NOTIFICATIONS_STORAGE_KEY = 'mosafa_story_notifications';
const FIRESTORE_SETTINGS_DOC = 'submitted_stories_archive';

// Seed demo pending stories so admin immediately sees them in action
const SEED_SUBMISSIONS: SubmittedStory[] = [
  {
    id: 'sub-demo-1',
    title: 'তাহাজ্জুদ ও সাইয়্যিদুল ইস্তেগফারের অলৌকিক সমাধান',
    author: 'মুহাম্মদ তানভীর আহমেদ',
    authorContact: 'tanvir@example.com',
    storyType: 'islamic',
    category: 'dua_accepted',
    categoryLabel: 'অসম্ভব দোয়া কবুল',
    shortDescription: 'জীবনের চরম অন্ধকার মুহূর্তে তাহাজ্জুদ ও ইস্তেগফারের মাধ্যমে এক অভাবনীয় পরিবর্তনের বাস্তব কাহিনী।',
    content: [
      'আমার জীবনে এমন একটি সময় এসেছিল যখন চারিদিক থেকে সব পথ বন্ধ মনে হচ্ছিল। একটি জটিল পারিবারিক সংকট ও অর্থনৈতিক টানাপোড়েনে আমি দিশেহারা হয়ে পড়েছিলাম।',
      'এক বুজুর্গ আলেমের পরামর্শে আমি নিয়মিত তাহাজ্জুদের নামাজ শুরু করি এবং প্রতি রাতে ও ফজরের পর অত্যন্ত বিনয়ের সাথে সাইয়্যিদুল ইস্তেগফার পাঠ করতে থাকি।',
      'আলহামদুলিল্লাহ, মাত্র এক মাসের মধ্যে আল্লাহর অশেষ রহমতে এমন এক অপ্রত্যাশিত সমাধান এলো যা আমি স্বপ্নেও ভাবিনি।'
    ],
    lessonOrAmal: 'প্রতিদিন ১০০ বার ইস্তেগফার ও নিয়মিত সাইয়্যিদুল ইস্তেগফার পাঠ',
    reference: 'বাস্তব জীবনের সত্য অনুভূতি',
    coverIcon: '📿',
    status: 'pending',
    submittedAt: Date.now() - 3600000 * 4, // 4 hours ago
  },
  {
    id: 'sub-demo-2',
    title: 'কুয়াশায় ঘেরা অচিন স্টেশন',
    author: 'ফারহানা ইয়াসমিন',
    authorContact: 'farhana@example.com',
    storyType: 'general',
    category: 'mystery',
    categoryLabel: 'রহস্য ও রোমাঞ্চ',
    shortDescription: 'এক শীতের রাতে একাকী ট্রেনে ভ্রমণরত যাত্রীর অদ্ভুত ও রোমাঞ্চকর এক অভিজ্ঞতার গল্প।',
    content: [
      'রাত তখন প্রায় দুটো। ট্রেনের জানালা দিয়ে বাইরে তাকালে শুধু সাদা ঘন কুয়াশা ছাড়া আর কিছুই চোখে পড়ে না। ট্রেনটি হঠাৎ এক নাম না জানা নির্জন স্টেশনে এসে থেমে গেল।',
      'প্ল্যাটফর্মে একটিও বাতি জ্বলছে না, শুধু দূরে এক রহস্যময় প্রাচীন লণ্ঠন হাতে কাউকে দাঁড়িয়ে থাকতে দেখা যাচ্ছিল...',
      'আমি কৌতূহল দমন করতে না পেরে ট্রেনের দরজা দিয়ে নেমে সেই আলোর দিকে এগোতে লাগলাম।'
    ],
    coverIcon: '🚂',
    coverGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    status: 'pending',
    submittedAt: Date.now() - 3600000 * 8, // 8 hours ago
  }
];

class StorySubmissionService {
  private memoryCache: SubmittedStory[] | null = null;
  private listeners: Array<(stories: SubmittedStory[]) => void> = [];
  private notificationListeners: Array<(notifications: StoryNotification[]) => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        this.memoryCache = JSON.parse(saved);
      } else {
        this.memoryCache = SEED_SUBMISSIONS;
        this.persistLocally(SEED_SUBMISSIONS);
      }
    } catch {
      this.memoryCache = SEED_SUBMISSIONS;
    }

    // Try fetching from Firestore in background
    this.syncFromFirestore();
  }

  private persistLocally(stories: SubmittedStory[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stories));
    } catch (e) {
      console.warn('Failed to save stories to localStorage', e);
    }
  }

  private async syncFromFirestore() {
    try {
      const docRef = doc(db, 'settings', FIRESTORE_SETTINGS_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.stories) && data.stories.length > 0) {
          this.memoryCache = data.stories;
          this.persistLocally(data.stories);
          this.notifyListeners();
        }
      } else {
        // Seed to Firestore
        if (this.memoryCache) {
          await setDoc(docRef, { stories: this.memoryCache }, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Firestore story sync offline or deferred', e);
    }
  }

  private async syncToFirestore(stories: SubmittedStory[]) {
    try {
      const docRef = doc(db, 'settings', FIRESTORE_SETTINGS_DOC);
      await setDoc(docRef, { stories, updatedAt: Date.now() }, { merge: true });
    } catch (e) {
      console.warn('Firestore update deferred, locally saved', e);
    }
  }

  private notifyListeners() {
    const list = this.getAllStories();
    this.listeners.forEach((fn) => fn(list));
  }

  private notifyNotificationListeners() {
    const list = this.getNotifications();
    this.notificationListeners.forEach((fn) => fn(list));
  }

  public getAllStories(): SubmittedStory[] {
    if (!this.memoryCache) {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        this.memoryCache = saved ? JSON.parse(saved) : SEED_SUBMISSIONS;
      } catch {
        this.memoryCache = SEED_SUBMISSIONS;
      }
    }
    return [...(this.memoryCache || [])];
  }

  public getPendingStories(): SubmittedStory[] {
    return this.getAllStories().filter((s) => s.status === 'pending');
  }

  public getApprovedStories(): SubmittedStory[] {
    return this.getAllStories().filter((s) => s.status === 'approved');
  }

  public async submitStory(
    data: Omit<SubmittedStory, 'id' | 'status' | 'submittedAt'>
  ): Promise<SubmittedStory> {
    const newStory: SubmittedStory = {
      ...data,
      id: `story-sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
      submittedAt: Date.now(),
    };

    const current = this.getAllStories();
    const updated = [newStory, ...current];
    this.memoryCache = updated;
    this.persistLocally(updated);
    this.notifyListeners();
    this.syncToFirestore(updated);

    return newStory;
  }

  public async approveStory(id: string): Promise<SubmittedStory | null> {
    const current = this.getAllStories();
    let approvedStory: SubmittedStory | null = null;

    const updated = current.map((s) => {
      if (s.id === id) {
        approvedStory = {
          ...s,
          status: 'approved',
          reviewedAt: Date.now(),
        };
        return approvedStory;
      }
      return s;
    });

    if (approvedStory) {
      this.memoryCache = updated;
      this.persistLocally(updated);
      this.notifyListeners();
      this.syncToFirestore(updated);

      // Add site-wide notification
      this.addNotification({
        id: `notif-${Date.now()}`,
        storyId: id,
        title: (approvedStory as SubmittedStory).title,
        author: (approvedStory as SubmittedStory).author,
        storyType: (approvedStory as SubmittedStory).storyType,
        approvedAt: Date.now(),
        read: false,
      });
    }

    return approvedStory;
  }

  public async rejectStory(id: string, reason?: string): Promise<boolean> {
    const current = this.getAllStories();
    const updated = current.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: 'rejected' as const,
          reviewedAt: Date.now(),
          rejectionReason: reason || 'নীতিমালার সাথে সামঞ্জস্যপূর্ণ নয়।',
        };
      }
      return s;
    });

    this.memoryCache = updated;
    this.persistLocally(updated);
    this.notifyListeners();
    this.syncToFirestore(updated);
    return true;
  }

  public async deleteStory(id: string): Promise<boolean> {
    const current = this.getAllStories();
    const updated = current.filter((s) => s.id !== id);
    this.memoryCache = updated;
    this.persistLocally(updated);
    this.notifyListeners();
    this.syncToFirestore(updated);
    return true;
  }

  // Site-wide Notifications Management
  public getNotifications(): StoryNotification[] {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public addNotification(notification: StoryNotification) {
    const list = [notification, ...this.getNotifications()].slice(0, 20);
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
    this.notifyNotificationListeners();

    // Also trigger custom browser window event for cross-component reactive updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('story_approved_notification', { detail: notification })
      );
    }
  }

  public markNotificationAsRead(id: string) {
    const list = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
    this.notifyNotificationListeners();
  }

  public clearAllNotifications() {
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch {}
    this.notifyNotificationListeners();
  }

  public subscribe(fn: (stories: SubmittedStory[]) => void): () => void {
    this.listeners.push(fn);
    fn(this.getAllStories());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public subscribeNotifications(fn: (notifications: StoryNotification[]) => void): () => void {
    this.notificationListeners.push(fn);
    fn(this.getNotifications());
    return () => {
      this.notificationListeners = this.notificationListeners.filter((l) => l !== fn);
    };
  }
}

export const storySubmissionService = new StorySubmissionService();
