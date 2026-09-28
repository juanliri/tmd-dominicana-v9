export interface OutboxQuotationItem {
  id: string;
  type: 'machine_quote' | 'parts_order' | 'emergency_dispatch' | 'service_request';
  clientName: string;
  clientPhone: string;
  companyName: string;
  itemsSummary: string;
  totalUsd: number;
  totalDop: number;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  retryCount: number;
  syncedAt?: string;
}

const STORAGE_KEY = 'tmd-offline-outbox-items';

const DEMO_OUTBOX_ITEMS: OutboxQuotationItem[] = [
  {
    id: 'OUT-2026-081',
    type: 'machine_quote',
    clientName: 'Ing. Carlos Mendoza',
    clientPhone: '+1 (809) 555-8822',
    companyName: 'Minera Los Haitises S.A.',
    itemsSummary: '1x LiuGong 922E HD + Cuchara Roca 1.2m³',
    totalUsd: 138500,
    totalDop: 8358475,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
    retryCount: 0
  },
  {
    id: 'OUT-2026-082',
    type: 'parts_order',
    clientName: 'Manuel Santana',
    clientPhone: '+1 (829) 444-1212',
    companyName: 'Agregados del Yuna',
    itemsSummary: 'Kit Filtros PM-250h JCB 3CX (4 filtros + aceite 15W40)',
    totalUsd: 480,
    totalDop: 28968,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'pending',
    retryCount: 0
  }
];

export const getStoredOutbox = (): OutboxQuotationItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_OUTBOX_ITEMS));
      return DEMO_OUTBOX_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading offline outbox:', e);
    return [];
  }
};

export const saveStoredOutbox = (items: OutboxQuotationItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving offline outbox:', e);
  }
};

export const addOutboxItem = (item: Omit<OutboxQuotationItem, 'id' | 'createdAt' | 'status' | 'retryCount'>): OutboxQuotationItem => {
  const items = getStoredOutbox();
  const newItem: OutboxQuotationItem = {
    ...item,
    id: `OUT-2026-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0
  };
  const updated = [newItem, ...items];
  saveStoredOutbox(updated);
  return newItem;
};

export const removeOutboxItem = (id: string) => {
  const items = getStoredOutbox();
  const updated = items.filter((x) => x.id !== id);
  saveStoredOutbox(updated);
  return updated;
};

export const clearOutbox = () => {
  saveStoredOutbox([]);
};

export const dispatchOutboxItem = async (id: string): Promise<boolean> => {
  const items = getStoredOutbox();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return false;

  items[idx].status = 'syncing';
  saveStoredOutbox([...items]);

  // Simulate network dispatch latency (CAN-bus / REST API)
  await new Promise((resolve) => setTimeout(resolve, 800));

  items[idx].status = 'synced';
  items[idx].syncedAt = new Date().toISOString();
  saveStoredOutbox([...items]);
  return true;
};

export const dispatchAllPendingOutbox = async (): Promise<number> => {
  const items = getStoredOutbox();
  let count = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].status === 'pending') {
      items[i].status = 'syncing';
      saveStoredOutbox([...items]);
      await new Promise((r) => setTimeout(r, 600));
      items[i].status = 'synced';
      items[i].syncedAt = new Date().toISOString();
      saveStoredOutbox([...items]);
      count++;
    }
  }
  return count;
};
