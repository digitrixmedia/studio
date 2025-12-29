import Dexie, { Table } from "dexie";

export interface OfflineOrder {
  id: string;                 // local UUID
  outletId: string;
  orderNumber: string;        // TEMP number when offline
  orderData: any;
  synced: boolean;            // false = not uploaded
  createdAt: number;
}

class OfflineDatabase extends Dexie {
  orders!: Table<OfflineOrder>;

  constructor() {
    super("POSOfflineDB");

    this.version(1).stores({
      orders: "id, outletId, synced, createdAt",
    });
  }
}

export const offlineDB = new OfflineDatabase();

/* ---------- Helper functions ---------- */

export async function saveOfflineOrder(order: OfflineOrder) {
  await offlineDB.orders.put(order);
}

export async function getPendingOrders(outletId: string) {
  return offlineDB.orders
    .where("outletId")
    .equals(outletId)
    .and(o => o.synced === false)
    .toArray();
}

export async function markOrderAsSynced(id: string) {
  await offlineDB.orders.update(id, { synced: true });
}
