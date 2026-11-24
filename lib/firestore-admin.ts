import "server-only";

import {
  FieldValue,
  type DocumentSnapshot,
} from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";
import type {
  ContactMessage,
  ContactMessageInput,
  Product,
  ProductInput,
  RepairBooking,
  RepairBookingInput,
  RepairStatus,
  Sale,
  SaleInput,
  SettingsData,
} from "./types";

const PRODUCTS_COLLECTION = "products";
const MESSAGES_COLLECTION = "messages";
const SALES_COLLECTION = "sales";
const REPAIRS_COLLECTION = "repairs";
const SESSION_VERSIONS_COLLECTION = "sessionVersions";
const SETTINGS_DOC = "settings/admin";
const OWNER_DOC = "settings/owner";
const REPAIR_COUNTER_DOC = "counters/repairs";

function now(): string {
  return new Date().toISOString();
}

function mapDoc<T>(snapshot: DocumentSnapshot): T {
  return { id: snapshot.id, ...(snapshot.data() as Omit<T, "id">) } as T;
}

export async function listProducts(): Promise<Product[]> {
  const snapshot = await getAdminDb()
    .collection(PRODUCTS_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => mapDoc<Product>(doc));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snapshot = await getAdminDb()
    .collection(PRODUCTS_COLLECTION)
    .doc(id)
    .get();
  return snapshot.exists ? mapDoc<Product>(snapshot) : null;
}

export async function createProduct(input: ProductInput): Promise<string> {
  const ref = getAdminDb().collection(PRODUCTS_COLLECTION).doc();
  await ref.set({ ...input, createdAt: now(), updatedAt: now() });
  return ref.id;
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<void> {
  await getAdminDb()
    .collection(PRODUCTS_COLLECTION)
    .doc(id)
    .update({ ...input, updatedAt: now() });
}

export async function deleteProduct(id: string): Promise<Product | null> {
  const ref = getAdminDb().collection(PRODUCTS_COLLECTION).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return null;
  }

  const product = mapDoc<Product>(snapshot);
  await ref.delete();
  return product;
}

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError?: (error: Error) => void
): () => void {
  return getAdminDb()
    .collection(PRODUCTS_COLLECTION)
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        callback(snapshot.docs.map((doc) => mapDoc<Product>(doc)));
      },
      (error) => onError?.(error)
    );
}

export async function listMessages(): Promise<ContactMessage[]> {
  const snapshot = await getAdminDb()
    .collection(MESSAGES_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => mapDoc<ContactMessage>(doc));
}

export async function createMessage(
  input: ContactMessageInput
): Promise<string> {
  const ref = getAdminDb().collection(MESSAGES_COLLECTION).doc();
  await ref.set({ ...input, createdAt: now() });
  return ref.id;
}

export async function deleteMessage(id: string): Promise<void> {
  await getAdminDb().collection(MESSAGES_COLLECTION).doc(id).delete();
}

export function subscribeToMessages(
  callback: (messages: ContactMessage[]) => void,
  onError?: (error: Error) => void
): () => void {
  return getAdminDb()
    .collection(MESSAGES_COLLECTION)
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        callback(snapshot.docs.map((doc) => mapDoc<ContactMessage>(doc)));
      },
      (error) => onError?.(error)
    );
}

export async function listSales(): Promise<Sale[]> {
  const snapshot = await getAdminDb()
    .collection(SALES_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => mapDoc<Sale>(doc));
}

export async function recordSale(
  productId: string,
  saleData: SaleInput
): Promise<void> {
  await recordSales([{ ...saleData, productId }]);
}

export async function recordSales(items: SaleInput[]): Promise<void> {
  if (!items.length) {
    throw new Error("No sale items provided.");
  }
  const db = getAdminDb();

  await db.runTransaction(async (transaction) => {
    const requestedByProduct = new Map<string, number>();
    for (const item of items) {
      requestedByProduct.set(
        item.productId,
        (requestedByProduct.get(item.productId) || 0) + item.quantity
      );
    }

    const productRefs = Array.from(requestedByProduct.keys()).map((id) =>
      db.collection(PRODUCTS_COLLECTION).doc(id)
    );
    const productSnaps = await Promise.all(
      productRefs.map((ref) => transaction.get(ref))
    );

    for (let i = 0; i < productRefs.length; i++) {
      const snap = productSnaps[i];
      const productId = productRefs[i].id;
      if (!snap.exists) {
        throw new Error("Could not find the selected product.");
      }
      const currentStock = (snap.data()?.stock as number) ?? 0;
      const requested = requestedByProduct.get(productId) || 0;
      if (requested > currentStock) {
        const name = (snap.data()?.name as string) || "product";
        throw new Error(
          `Not enough stock for ${name}. Only ${currentStock} unit${
            currentStock === 1 ? "" : "s"
          } available.`
        );
      }
    }

    for (const [productId, requested] of requestedByProduct.entries()) {
      const ref = db.collection(PRODUCTS_COLLECTION).doc(productId);
      transaction.update(ref, {
        stock: FieldValue.increment(-requested),
        updatedAt: now(),
      });
    }

    for (const item of items) {
      const saleRef = db.collection(SALES_COLLECTION).doc();
      transaction.set(saleRef, { ...item, createdAt: now() });
    }
  });
}

export async function updateSale(
  id: string,
  saleData: SaleInput
): Promise<void> {
  const db = getAdminDb();

  await db.runTransaction(async (transaction) => {
    const saleRef = db.collection(SALES_COLLECTION).doc(id);
    const saleSnap = await transaction.get(saleRef);
    if (!saleSnap.exists) {
      throw new Error("Could not find the selected sale.");
    }

    const previous = saleSnap.data() as Sale;
    if (previous.productId) {
      const previousProductRef = db
        .collection(PRODUCTS_COLLECTION)
        .doc(previous.productId);
      if ((await transaction.get(previousProductRef)).exists) {
        transaction.update(previousProductRef, {
          stock: FieldValue.increment(previous.quantity),
          updatedAt: now(),
        });
      }
    }

    const productRef = db.collection(PRODUCTS_COLLECTION).doc(saleData.productId);
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists) {
      throw new Error("Could not find the selected product.");
    }

    let currentStock = (productSnap.data()?.stock as number) ?? 0;
    if (saleData.productId === previous.productId) {
      currentStock += previous.quantity;
    }
    if (saleData.quantity > currentStock) {
      throw new Error(
        `Not enough stock. Only ${currentStock} unit${
          currentStock === 1 ? "" : "s"
        } available.`
      );
    }

    transaction.update(productRef, {
      stock: FieldValue.increment(-saleData.quantity),
      updatedAt: now(),
    });
    transaction.update(saleRef, { ...saleData, updatedAt: now() });
  });
}

export async function deleteSale(id: string): Promise<void> {
  const db = getAdminDb();

  await db.runTransaction(async (transaction) => {
    const saleRef = db.collection(SALES_COLLECTION).doc(id);
    const saleSnap = await transaction.get(saleRef);
    if (!saleSnap.exists) {
      transaction.delete(saleRef);
      return;
    }

    const sale = saleSnap.data() as Sale;
    if (sale.productId) {
      const productRef = db.collection(PRODUCTS_COLLECTION).doc(sale.productId);
      const productSnap = await transaction.get(productRef);
      if (productSnap.exists) {
        transaction.update(productRef, {
          stock: FieldValue.increment(sale.quantity),
          updatedAt: now(),
        });
      }
    }

    transaction.delete(saleRef);
  });
}

export function subscribeToSales(
  callback: (sales: Sale[]) => void,
  onError?: (error: Error) => void
): () => void {
  return getAdminDb()
    .collection(SALES_COLLECTION)
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        callback(snapshot.docs.map((doc) => mapDoc<Sale>(doc)));
      },
      (error) => onError?.(error)
    );
}

export async function getSettings(): Promise<SettingsData | null> {
  const snapshot = await getAdminDb().doc(SETTINGS_DOC).get();
  return snapshot.exists ? (snapshot.data() as SettingsData) : null;
}

export async function saveSettings(data: SettingsData): Promise<void> {
  await getAdminDb()
    .doc(SETTINGS_DOC)
    .set({ ...data, updatedAt: now() }, { merge: true });
}

export async function getSessionVersion(uid: string): Promise<number> {
  const snapshot = await getAdminDb()
    .doc(`${SESSION_VERSIONS_COLLECTION}/${uid}`)
    .get();
  const version = snapshot.data()?.version;
  return typeof version === "number" && Number.isInteger(version) && version >= 0
    ? version
    : 0;
}

export async function bumpSessionVersion(uid: string): Promise<number> {
  const db = getAdminDb();
  const ref = db.doc(`${SESSION_VERSIONS_COLLECTION}/${uid}`);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.data()?.version;
    const next =
      typeof current === "number" && Number.isInteger(current) && current >= 0
        ? current + 1
        : 1;
    transaction.set(ref, { version: next, updatedAt: now() });
    return next;
  });
}

export async function getOwnerUid(): Promise<string | null> {
  const snapshot = await getAdminDb().doc(OWNER_DOC).get();
  const uid = snapshot.data()?.uid;
  return typeof uid === "string" && uid ? uid : null;
}

export async function claimOwnerUid(uid: string): Promise<string> {
  const db = getAdminDb();
  const ref = db.doc(OWNER_DOC);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const existing = snapshot.data()?.uid;
    if (typeof existing === "string" && existing) {
      return existing;
    }
    transaction.set(ref, { uid, createdAt: now() });
    return uid;
  });
}

export async function createRepairBooking(
  input: RepairBookingInput
): Promise<RepairBooking> {
  const db = getAdminDb();
  const counterRef = db.doc(REPAIR_COUNTER_DOC);
  const ref = db.collection(REPAIRS_COLLECTION).doc();

  return db.runTransaction(async (transaction) => {
    const counter = await transaction.get(counterRef);
    const raw = counter.data()?.value;
    const current =
      typeof raw === "number" && Number.isInteger(raw) && raw >= 0 ? raw : 0;
    const next = current + 1;
    transaction.set(counterRef, { value: next });

    const booking: RepairBooking = {
      id: ref.id,
      reference: `R-${String(next).padStart(4, "0")}`,
      ...input,
      status: "Booked",
      createdAt: now(),
      updatedAt: now(),
    };
    transaction.set(ref, booking);
    return booking;
  });
}

export async function getRepairBooking(
  reference: string
): Promise<RepairBooking | null> {
  const snapshot = await getAdminDb()
    .collection(REPAIRS_COLLECTION)
    .where("reference", "==", reference)
    .limit(1)
    .get();
  return snapshot.empty ? null : mapDoc<RepairBooking>(snapshot.docs[0]);
}

export async function listRepairBookings(): Promise<RepairBooking[]> {
  const snapshot = await getAdminDb()
    .collection(REPAIRS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(200)
    .get();
  return snapshot.docs.map((doc) => mapDoc<RepairBooking>(doc));
}

export async function updateRepairStatus(
  id: string,
  status: RepairStatus
): Promise<void> {
  await getAdminDb()
    .collection(REPAIRS_COLLECTION)
    .doc(id)
    .update({ status, updatedAt: now() });
}
