import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  getShopIdToken,
  shopDb,
  shopHandleFirestoreError,
  ShopOperationType,
} from './shopFirebase';
import {
  ShopCustomer,
  ShopDailySale,
  ShopDocument,
  ShopExpense,
  ShopInvoice,
  ShopProduct,
  ShopReceipt,
  ShopRepairTicket,
  ShopSupplier,
} from './types';

export type ShopCollectionName =
  | 'products'
  | 'invoices'
  | 'receipts'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'repairs'
  | 'documents'
  | 'dailySales';

export interface ShopDataState {
  products: ShopProduct[];
  invoices: ShopInvoice[];
  receipts: ShopReceipt[];
  customers: ShopCustomer[];
  suppliers: ShopSupplier[];
  expenses: ShopExpense[];
  repairs: ShopRepairTicket[];
  documents: ShopDocument[];
  dailySales: ShopDailySale[];
  isSyncing: boolean;
  upsertItem: <T extends { id: string }>(col: ShopCollectionName, item: T) => Promise<void>;
  deleteItem: (col: ShopCollectionName, itemId: string) => Promise<void>;
  replaceCollection: <T extends { id: string }>(col: ShopCollectionName, items: T[]) => void;
}

function readLocalCollection<T>(shopId: string, col: ShopCollectionName, fallback: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(`mosafa_shop_${shopId}_${col}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalCollection<T>(shopId: string, col: ShopCollectionName, items: T[]): void {
  try {
    localStorage.setItem(`mosafa_shop_${shopId}_${col}`, JSON.stringify(items));
  } catch {
    // ignore storage quota
  }
}

export function useShopData(
  shopId: string | undefined,
  bootstrapCollections: Record<string, any[]>
): ShopDataState {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [invoices, setInvoices] = useState<ShopInvoice[]>([]);
  const [receipts, setReceipts] = useState<ShopReceipt[]>([]);
  const [customers, setCustomers] = useState<ShopCustomer[]>([]);
  const [suppliers, setSuppliers] = useState<ShopSupplier[]>([]);
  const [expenses, setExpenses] = useState<ShopExpense[]>([]);
  const [repairs, setRepairs] = useState<ShopRepairTicket[]>([]);
  const [documents, setDocuments] = useState<ShopDocument[]>([]);
  const [dailySales, setDailySales] = useState<ShopDailySale[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Hydrate strictly for the authenticated shopId whenever shopId changes
  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      setInvoices([]);
      setReceipts([]);
      setCustomers([]);
      setSuppliers([]);
      setExpenses([]);
      setRepairs([]);
      setDocuments([]);
      setDailySales([]);
      return;
    }

    const pickInitial = <T extends { id: string }>(col: ShopCollectionName): T[] => {
      const fromBackend = bootstrapCollections?.[col];
      if (Array.isArray(fromBackend) && fromBackend.length > 0) {
        writeLocalCollection(shopId, col, fromBackend);
        return fromBackend;
      }
      return readLocalCollection<T>(shopId, col, []);
    };

    setProducts(pickInitial<ShopProduct>('products'));
    setInvoices(pickInitial<ShopInvoice>('invoices'));
    setReceipts(pickInitial<ShopReceipt>('receipts'));
    setCustomers(pickInitial<ShopCustomer>('customers'));
    setSuppliers(pickInitial<ShopSupplier>('suppliers'));
    setExpenses(pickInitial<ShopExpense>('expenses'));
    setRepairs(pickInitial<ShopRepairTicket>('repairs'));
    setDocuments(pickInitial<ShopDocument>('documents'));
    setDailySales(pickInitial<ShopDailySale>('dailySales'));

    // Also attempt background Firestore hydration for any newer cloud records
    let cancelled = false;
    const syncFromFirestore = async () => {
      setIsSyncing(true);
      const cols: ShopCollectionName[] = [
        'products',
        'invoices',
        'receipts',
        'customers',
        'suppliers',
        'expenses',
        'repairs',
        'documents',
        'dailySales',
      ];
      for (const col of cols) {
        if (cancelled) return;
        try {
          const q = query(collection(shopDb, 'shops', shopId, col), where('ownerUid', '==', shopId));
          const snap = await getDocs(q);
          if (!snap.empty && !cancelled) {
            const fsItems = snap.docs.map((d) => d.data() as any);
            writeLocalCollection(shopId, col, fsItems);
            switch (col) {
              case 'products':
                setProducts(fsItems);
                break;
              case 'invoices':
                setInvoices(fsItems);
                break;
              case 'receipts':
                setReceipts(fsItems);
                break;
              case 'customers':
                setCustomers(fsItems);
                break;
              case 'suppliers':
                setSuppliers(fsItems);
                break;
              case 'expenses':
                setExpenses(fsItems);
                break;
              case 'repairs':
                setRepairs(fsItems);
                break;
              case 'documents':
                setDocuments(fsItems);
                break;
              case 'dailySales':
                setDailySales(fsItems);
                break;
            }
          }
        } catch (err) {
          shopHandleFirestoreError(err, ShopOperationType.LIST, `shops/${shopId}/${col}`);
        }
      }
      if (!cancelled) setIsSyncing(false);
    };

    syncFromFirestore();
    return () => {
      cancelled = true;
    };
  }, [shopId, bootstrapCollections]);

  const setStateForCol = useCallback((col: ShopCollectionName, updater: (prev: any[]) => any[]) => {
    switch (col) {
      case 'products':
        setProducts(updater);
        break;
      case 'invoices':
        setInvoices(updater);
        break;
      case 'receipts':
        setReceipts(updater);
        break;
      case 'customers':
        setCustomers(updater);
        break;
      case 'suppliers':
        setSuppliers(updater);
        break;
      case 'expenses':
        setExpenses(updater);
        break;
      case 'repairs':
        setRepairs(updater);
        break;
      case 'documents':
        setDocuments(updater);
        break;
      case 'dailySales':
        setDailySales(updater);
        break;
    }
  }, []);

  const upsertItem = useCallback(
    async <T extends { id: string }>(col: ShopCollectionName, item: T) => {
      if (!shopId) return;
      const now = new Date().toISOString();
      const normalized: any = {
        ...item,
        id: item.id,
        shopId,
        ownerUid: shopId,
        createdAt: (item as any).createdAt || now,
        updatedAt: now,
      };

      setStateForCol(col, (prev) => {
        const idx = prev.findIndex((p) => p.id === normalized.id);
        const next = idx >= 0 ? prev.map((p, i) => (i === idx ? normalized : p)) : [normalized, ...prev];
        writeLocalCollection(shopId, col, next);
        return next;
      });

      const token = await getShopIdToken();
      if (token) {
        fetch(`/api/shop/collection/${col}/${normalized.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(normalized),
        }).catch(() => {});
      }

      try {
        await setDoc(doc(shopDb, 'shops', shopId, col, normalized.id), normalized, { merge: true });
      } catch (err) {
        shopHandleFirestoreError(err, ShopOperationType.WRITE, `shops/${shopId}/${col}/${normalized.id}`);
      }
    },
    [shopId, setStateForCol]
  );

  const deleteItem = useCallback(
    async (col: ShopCollectionName, itemId: string) => {
      if (!shopId) return;
      setStateForCol(col, (prev) => {
        const next = prev.filter((p) => p.id !== itemId);
        writeLocalCollection(shopId, col, next);
        return next;
      });

      const token = await getShopIdToken();
      if (token) {
        fetch(`/api/shop/collection/${col}/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }

      try {
        await deleteDoc(doc(shopDb, 'shops', shopId, col, itemId));
      } catch (err) {
        shopHandleFirestoreError(err, ShopOperationType.DELETE, `shops/${shopId}/${col}/${itemId}`);
      }
    },
    [shopId, setStateForCol]
  );

  const replaceCollection = useCallback(
    <T extends { id: string }>(col: ShopCollectionName, items: T[]) => {
      if (!shopId) return;
      const stamped = items.map((it) => ({ ...it, shopId, ownerUid: shopId }));
      writeLocalCollection(shopId, col, stamped);
      setStateForCol(col, () => stamped);
    },
    [shopId, setStateForCol]
  );

  return {
    products,
    invoices,
    receipts,
    customers,
    suppliers,
    expenses,
    repairs,
    documents,
    dailySales,
    isSyncing,
    upsertItem,
    deleteItem,
    replaceCollection,
  };
}
