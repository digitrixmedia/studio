// offlineDB.ts
import Dexie, { Table } from 'dexie';

export interface OfflineOrder {
  id: string;
  outletId: string;
  orderData: any;
  synced: boolean;
  createdAt: number;
}

class OfflineDatabase extends Dexie {
  orders!: Table<OfflineOrder, string>;

  constructor() {
    super('OfflinePOSDB');
    this.version(1).stores({
      orders: 'id, outletId, synced, createdAt',
    });
  }
}

export const offlineDB = new OfflineDatabase();

export async function saveOfflineOrder(order: OfflineOrder) {
  await offlineDB.orders.put(order);
}

export async function getPendingOrders(outletId: string) {
  return offlineDB.orders
    .where('outletId')
    .equals(outletId)
    .and(o => o.synced === false)
    .toArray();
}

// 🔴 THIS IS THE MOST IMPORTANT PART
export async function markOrderAsSynced(id: string) {
  await offlineDB.orders.delete(id); // HARD DELETE
}
