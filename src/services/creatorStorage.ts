import {
  CreatorProject,
  NicheIdea,
  TopicKeywordItem,
  ContentDraft,
  CalendarTask,
  VideoProductionPlan,
  MediaAsset,
} from '../types/creatorStudio';

const STORAGE_KEYS = {
  PROJECTS: 'mosafa_creator_projects_v1',
  ACTIVE_PROJECT: 'mosafa_creator_active_project_v1',
  NICHES: 'mosafa_creator_saved_niches_v1',
  KEYWORDS: 'mosafa_creator_saved_keywords_v1',
  DRAFTS: 'mosafa_creator_saved_drafts_v1',
  CALENDAR: 'mosafa_creator_saved_calendar_v1',
  VIDEO_PLANS: 'mosafa_creator_saved_video_plans_v1',
  MEDIA_ASSETS: 'mosafa_creator_saved_media_v1',
};

// Initial sample project for quick start
const INITIAL_PROJECT: CreatorProject = {
  id: 'proj-demo-1',
  name: 'টেক ও ফ্রিল্যান্সিং গাইড বাংলা',
  platform: 'youtube',
  language: 'bn',
  targetAudience: 'বাংলাদেশের তরুণ শিক্ষার্থী, ফ্রিল্যান্সার ও কনটেন্ট ক্রিয়েটর',
  niche: 'টেকনোলজি, ক্যারিয়ার টিপস ও অনলাইন ইনকাম',
  description: 'সহজ বাংলায় মোবাইল ও পিসির টেক টিপস, ফ্রিল্যান্সিং গাইড ও ক্রিয়েটর টুলস পরিচিতি।',
  status: 'in_progress',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const INITIAL_CALENDAR_TASKS: CalendarTask[] = [
  {
    id: 'cal-1',
    projectId: 'proj-demo-1',
    title: 'ইউটিউব ভিডিও: মোবাইল দিয়ে থাম্বনেইল তৈরির সহজ উপায়',
    platform: 'youtube',
    date: new Date().toISOString().split('T')[0],
    status: 'in_production',
    notes: 'স্ক্রিপ্ট তৈরি শেষ, ক্যানভাসে থাম্বনেইল ডিজাইন ও ভয়েসওভার রেকর্ডিং বাকি।',
    tags: ['ইউটিউব', 'থাম্বনেইল', 'মোবাইল'],
  },
  {
    id: 'cal-2',
    projectId: 'proj-demo-1',
    title: 'ফেসবুক রিলস: ৩টি ওয়েবসাইট যা প্রতিটি ক্রিয়েটরের দরকার',
    platform: 'facebook',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'scheduled',
    notes: '৩০ সেকেন্ডের ফাস্ট পেস স্ক্রিপ্ট ও সাবটাইটেল রেডি।',
    tags: ['রিলস', 'ভাইরাল টিপস'],
  },
  {
    id: 'cal-3',
    projectId: 'proj-demo-1',
    title: 'ব্লগ পোস্ট: ২০২৬ সালে বাংলায় ফ্রিল্যান্সিং শুরু করার রোডম্যাপ',
    platform: 'blog',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'draft',
    notes: 'আউটলাইন ও হেডিং তৈরি, মেটা ডেসক্রিপশন রিভিশন প্রয়োজন।',
    tags: ['এসইও ব্লগ', 'ফ্রিল্যান্সিং'],
  },
];

export class CreatorStorage {
  // Projects
  static getProjects(): CreatorProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (data) return JSON.parse(data);
      // Seed with initial project
      this.saveProjects([INITIAL_PROJECT]);
      return [INITIAL_PROJECT];
    } catch {
      return [INITIAL_PROJECT];
    }
  }

  static saveProjects(projects: CreatorProject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('LocalStorage error saving projects', e);
    }
  }

  static getActiveProjectId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT) || INITIAL_PROJECT.id;
    } catch {
      return INITIAL_PROJECT.id;
    }
  }

  static setActiveProjectId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id);
    } catch (e) {
      console.warn(e);
    }
  }

  // Saved Niches
  static getSavedNiches(): NicheIdea[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NICHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveNiche(niche: NicheIdea): void {
    const list = this.getSavedNiches();
    const existingIndex = list.findIndex((n) => n.id === niche.id);
    if (existingIndex >= 0) {
      list[existingIndex] = niche;
    } else {
      list.unshift(niche);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.NICHES, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
  }

  static deleteNiche(id: string): void {
    const list = this.getSavedNiches().filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NICHES, JSON.stringify(list));
  }

  // Saved Keywords & Ideas
  static getSavedKeywords(): TopicKeywordItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KEYWORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveKeyword(item: TopicKeywordItem): void {
    const list = this.getSavedKeywords();
    const existingIndex = list.findIndex((k) => k.id === item.id);
    if (existingIndex >= 0) {
      list[existingIndex] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(list));
  }

  static deleteKeyword(id: string): void {
    const list = this.getSavedKeywords().filter((k) => k.id !== id);
    localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(list));
  }

  // Content Drafts & Scripts
  static getDrafts(): ContentDraft[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveDraft(draft: ContentDraft): void {
    const list = this.getDrafts();
    const existingIndex = list.findIndex((d) => d.id === draft.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...draft, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(draft);
    }
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(list));
  }

  static deleteDraft(id: string): void {
    const list = this.getDrafts().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(list));
  }

  // Calendar Tasks
  static getCalendarTasks(): CalendarTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (data) return JSON.parse(data);
      this.saveCalendarTasks(INITIAL_CALENDAR_TASKS);
      return INITIAL_CALENDAR_TASKS;
    } catch {
      return INITIAL_CALENDAR_TASKS;
    }
  }

  static saveCalendarTasks(tasks: CalendarTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(tasks));
    } catch (e) {
      console.warn(e);
    }
  }

  static addCalendarTask(task: CalendarTask): void {
    const tasks = this.getCalendarTasks();
    tasks.unshift(task);
    this.saveCalendarTasks(tasks);
  }

  static updateCalendarTask(task: CalendarTask): void {
    const tasks = this.getCalendarTasks().map((t) => (t.id === task.id ? task : t));
    this.saveCalendarTasks(tasks);
  }

  static deleteCalendarTask(id: string): void {
    const tasks = this.getCalendarTasks().filter((t) => t.id !== id);
    this.saveCalendarTasks(tasks);
  }

  // Video Plans
  static getVideoPlans(): VideoProductionPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIDEO_PLANS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveVideoPlan(plan: VideoProductionPlan): void {
    const plans = this.getVideoPlans();
    const existingIndex = plans.findIndex((p) => p.id === plan.id);
    if (existingIndex >= 0) {
      plans[existingIndex] = plan;
    } else {
      plans.unshift(plan);
    }
    localStorage.setItem(STORAGE_KEYS.VIDEO_PLANS, JSON.stringify(plans));
  }

  static deleteVideoPlan(id: string): void {
    const plans = this.getVideoPlans().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.VIDEO_PLANS, JSON.stringify(plans));
  }

  // Media Assets (Metadata & References)
  static getMediaAssets(): MediaAsset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDIA_ASSETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveMediaAsset(asset: MediaAsset): void {
    const list = this.getMediaAssets();
    list.unshift(asset);
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA_ASSETS, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage size limit reached for media assets', e);
    }
  }

  static deleteMediaAsset(id: string): void {
    const list = this.getMediaAssets().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA_ASSETS, JSON.stringify(list));
  }

  // Full Backup Export
  static exportFullBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      activeProjectId: this.getActiveProjectId(),
      savedNiches: this.getSavedNiches(),
      savedKeywords: this.getSavedKeywords(),
      drafts: this.getDrafts(),
      calendarTasks: this.getCalendarTasks(),
      videoPlans: this.getVideoPlans(),
      mediaAssets: this.getMediaAssets().map((m) => ({ ...m, dataUrl: undefined })), // avoid heavy blobs in JSON
    };
    return JSON.stringify(backup, null, 2);
  }

  // Full Backup Import
  static importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.projects) this.saveProjects(data.projects);
      if (data.activeProjectId) this.setActiveProjectId(data.activeProjectId);
      if (data.savedNiches) localStorage.setItem(STORAGE_KEYS.NICHES, JSON.stringify(data.savedNiches));
      if (data.savedKeywords) localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(data.savedKeywords));
      if (data.drafts) localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(data.drafts));
      if (data.calendarTasks) this.saveCalendarTasks(data.calendarTasks);
      if (data.videoPlans) localStorage.setItem(STORAGE_KEYS.VIDEO_PLANS, JSON.stringify(data.videoPlans));
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }
}
