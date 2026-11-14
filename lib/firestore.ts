import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  setDoc,
  increment,
  runTransaction,
  type Unsubscribe,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Product,
  ProductInput,
  ContactMessage,
  ContactMessageInput,
  Sale,
  SaleInput,
  SettingsData,
} from "./types";

const PRODUCTS_COLLECTION = "products";
const MESSAGES_COLLECTION = "messages";
const SALES_COLLECTION = "sales";
const SETTINGS_DOC = "settings/admin";

function requireDb() {
  if (!db) {
    throw new Error(
      "Firebase is not configured. Please set the NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }
  return db;
}

function mapDoc<T>(snapshot: QueryDocumentSnapshot): T {
  return { id: snapshot.id, ...(snapshot.data() as Omit<T, "id">) } as T;
}

export async function addProduct(productData: ProductInput): Promise<string> {
  const docRef = await addDoc(collection(requireDb(), PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function saveMessage(
  messageData: ContactMessageInput
): Promise<string> {
  const docRef = await addDoc(collection(requireDb(), MESSAGES_COLLECTION), {
    ...messageData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export function subscribeToMessages(
  callback: (messages: ContactMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(requireDb(), MESSAGES_COLLECTION),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) =>
        mapDoc<ContactMessage>(doc)
      );
      callback(messages);
    },
    onError
  );
}

export async function removeMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(requireDb(), MESSAGES_COLLECTION, messageId));
}

export async function removeProduct(productId: string): Promise<void> {
  await deleteDoc(doc(requireDb(), PRODUCTS_COLLECTION, productId));
}

export async function updateProduct(
  productId: string,
  productData: ProductInput
): Promise<void> {
  await updateDoc(doc(requireDb(), PRODUCTS_COLLECTION, productId), {
    ...productData,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(requireDb(), PRODUCTS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const products = snapshot.docs.map((doc) => mapDoc<Product>(doc));
      callback(products);
    },
    onError
  );
}

export async function getProducts(): Promise<Product[]> {
  const q = query(
    collection(requireDb(), PRODUCTS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => mapDoc<Product>(doc));
}

export async function recordSale(
  productId: string,
  saleData: SaleInput
): Promise<void> {
  const dbInstance = requireDb();
  await runTransaction(dbInstance, async (transaction) => {
    const productRef = doc(dbInstance, PRODUCTS_COLLECTION, productId);
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) {
      throw new Error("Could not find the selected product.");
    }
    const currentStock = (productSnap.data().stock as number) ?? 0;
    if (saleData.quantity > currentStock) {
      throw new Error(
        `Not enough stock. Only ${currentStock} unit${currentStock === 1 ? "" : "s"} available.`
      );
    }
    transaction.update(productRef, {
      stock: increment(-saleData.quantity),
      updatedAt: new Date().toISOString(),
    });
    const saleRef = doc(collection(dbInstance, SALES_COLLECTION));
    transaction.set(saleRef, {
      ...saleData,
      createdAt: new Date().toISOString(),
    });
  });
}

export function subscribeToSales(
  callback: (sales: Sale[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    collection(requireDb(), SALES_COLLECTION),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const sales = snapshot.docs.map((doc) => mapDoc<Sale>(doc));
      callback(sales);
    },
    onError
  );
}

export async function deleteSale(saleId: string): Promise<void> {
  const dbInstance = requireDb();
  await runTransaction(dbInstance, async (transaction) => {
    const saleRef = doc(dbInstance, SALES_COLLECTION, saleId);
    const saleSnap = await transaction.get(saleRef);
    if (!saleSnap.exists()) {
      transaction.delete(saleRef);
      return;
    }
    const sale = saleSnap.data() as Sale;
    if (sale.productId) {
      const productRef = doc(dbInstance, PRODUCTS_COLLECTION, sale.productId);
      const productSnap = await transaction.get(productRef);
      if (productSnap.exists()) {
        transaction.update(productRef, {
          stock: increment(sale.quantity),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    transaction.delete(saleRef);
  });
}

export async function getSettingsDoc(): Promise<SettingsData | null> {
  const docRef = doc(requireDb(), SETTINGS_DOC);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as SettingsData) : null;
}

export async function saveSettingsDoc(data: SettingsData): Promise<void> {
  const docRef = doc(requireDb(), SETTINGS_DOC);
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}