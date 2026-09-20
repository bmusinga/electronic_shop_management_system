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
  type Unsubscribe,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Product,
  ProductInput,
  ContactMessage,
  ContactMessageInput,
  SettingsData,
} from "./types";

const PRODUCTS_COLLECTION = "products";
const MESSAGES_COLLECTION = "messages";
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