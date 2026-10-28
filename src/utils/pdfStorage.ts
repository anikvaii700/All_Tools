// IndexedDB utility for persistent local storage of PDF books in MoSaFa Golpo Ghor
// 100% Client-side, works offline, no server required

const DB_NAME = 'MoSaFaGolpoGhorDB';
const DB_VERSION = 1;
const STORE_NAME = 'pdfBookBlobs';

export interface PdfBookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  categorySlug?: string;
  description?: string;
  sourceType: 'local-file' | 'web-url';
  webUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  dateAdded: number;
  coverGradient: string;
  coverIcon: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Save PDF Blob into IndexedDB
export async function savePdfBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save PDF blob to IndexedDB:', err);
    throw err;
  }
}

// Get PDF Blob from IndexedDB
export async function getPdfBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve PDF blob from IndexedDB:', err);
    return null;
  }
}

// Delete PDF Blob from IndexedDB
export async function deletePdfBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete PDF blob from IndexedDB:', err);
  }
}

// Default curated open-access Bengali PDF books
export const DEFAULT_PDF_BOOKS: PdfBookItem[] = [
  {
    id: 'pdf-default-1',
    title: 'গীতাঞ্জলি (কাব্য সংকলন)',
    author: 'রবীন্দ্রনাথ ঠাকুর',
    category: 'বাংলা ক্লাসিক সাহিত্য',
    categorySlug: 'classic',
    description: 'নোবেলজয়ী গীতাঞ্জলির মূল বাংলা কবিতা সংকলন ও আধ্যাত্মিক ভাবনার ধ্রুপদী নিদর্শন।',
    sourceType: 'web-url',
    webUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // fallback link
    fileName: 'gitanjali_rabindranath.pdf',
    fileSizeBytes: 2450000,
    dateAdded: Date.now() - 86400000 * 5,
    coverGradient: 'from-amber-700 via-orange-900 to-amber-950',
    coverIcon: '📜',
  },
  {
    id: 'pdf-default-2',
    title: 'দেবদাস (পূর্ণাঙ্গ উপন্যাস)',
    author: 'শরৎচন্দ্র চট্টোপাধ্যায়',
    category: 'ধারাবাহিক গল্প ও উপন্যাস',
    categorySlug: 'novel-series',
    description: 'পার্বতী, দেবদাস ও চন্দ্রমুখীর অমর চিরন্তন বিরহের কালজয়ী ক্লাসিক উপন্যাস।',
    sourceType: 'web-url',
    webUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'devdas_sarat_chandra.pdf',
    fileSizeBytes: 3120000,
    dateAdded: Date.now() - 86400000 * 3,
    coverGradient: 'from-rose-600 via-pink-700 to-rose-950',
    coverIcon: '📚',
  },
  {
    id: 'pdf-default-3',
    title: 'কপালকুণ্ডলা (রোমান্স ও ট্র্যাজেডি)',
    author: 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়',
    category: 'বাংলা ক্লাসিক সাহিত্য',
    categorySlug: 'classic',
    description: 'পথিক তুমি পথ হারাইয়াছ?— অরণ্যচারিণী নারীর চিরন্তন ট্র্যাজেডির প্রথম বাংলা রোমান্টিক উপন্যাস।',
    sourceType: 'web-url',
    webUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'kapalkundala_bankim.pdf',
    fileSizeBytes: 2890000,
    dateAdded: Date.now() - 86400000,
    coverGradient: 'from-emerald-700 via-teal-800 to-slate-900',
    coverIcon: '📖',
  },
  {
    id: 'pdf-default-4',
    title: 'বাদশাহী আংটি (ফেলুদা সমগ্র)',
    author: 'সত্যজিৎ রায়',
    category: 'রহস্য ও গোয়েন্দা',
    categorySlug: 'mystery',
    description: 'লখনউ শহরের ঐতিহাসিক ভুলভুলাইয়া ও সম্রাট আওরঙ্গজেবের মহামূল্যবান বাদশাহী আংটির রুদ্ধশ্বাস রহস্য।',
    sourceType: 'web-url',
    webUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'badshahi_angti_feluda.pdf',
    fileSizeBytes: 3450000,
    dateAdded: Date.now() - 43200000,
    coverGradient: 'from-blue-700 via-indigo-900 to-slate-950',
    coverIcon: '🔍',
  },
  {
    id: 'pdf-default-5',
    title: 'আবোল তাবোল (হাসির ও ছড়ার ধ্রুপদী বই)',
    author: 'সুকুমার রায়',
    category: 'হাসির গল্প',
    categorySlug: 'comedy',
    description: 'হুঁকোমুখো হ্যাংলা, কুমড়োপটাশ ও খিচুড়ির কালজয়ী হাসির ছড়া ও অদ্ভুত প্রাণীর বিচিত্র চিত্রাবলী।',
    sourceType: 'web-url',
    webUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'abol_tabol_sukumar.pdf',
    fileSizeBytes: 1980000,
    dateAdded: Date.now() - 21600000,
    coverGradient: 'from-amber-600 via-yellow-600 to-amber-800',
    coverIcon: '😄',
  },
];
