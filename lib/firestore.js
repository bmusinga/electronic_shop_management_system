import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const PRODUCTS_COLLECTION = "products";

function requireDb() {
  if (!db) {
    throw new Error("Firebase is not configured. Please set the NEXT_PUBLIC_FIREBASE_* environment variables.");
  }
  return db;
}

export async function addProduct(productData) {
  const docRef = await addDoc(collection(requireDb(), PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function removeProduct(productId) {
  await deleteDoc(doc(requireDb(), PRODUCTS_COLLECTION, productId));
}

export async function updateProduct(productId, productData) {
  await updateDoc(doc(requireDb(), PRODUCTS_COLLECTION, productId), {
    ...productData,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToProducts(callback) {
  const q = query(collection(requireDb(), PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(products);
  });
}

export async function getProducts() {
  const q = query(collection(requireDb(), PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
