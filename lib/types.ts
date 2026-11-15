export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  driveFileId?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  driveFileId?: string;
}

export interface ProductFormValues {
  id: string | null;
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  image: string;
  driveFileId: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt?: string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string;
}

export interface SaleInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type SettingsData = Record<string, string>;