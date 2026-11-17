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
  Sale,
  SaleInput,
  SettingsData,
} from "./types";

const PRODUCTS_COLLECTION = "products";
const MESSAGES_COLLECTION = "messages";
const SALES_COLLECTION = "sales";
const SETTINGS_DOC = "settings/admin";

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
  const db = getAdminDb();

  await db.runTransaction(async (transaction) => {
    const productRef = db.collection(PRODUCTS_COLLECTION).doc(productId);
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists) {
      throw new Error("Could not find the selected product.");
    }

    const currentStock = (productSnap.data()?.stock as number) ?? 0;
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

    const saleRef = db.collection(SALES_COLLECTION).doc();
    transaction.set(saleRef, { ...saleData, createdAt: now() });
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
