export const PRODUCT_CATEGORIES = [
  "Smartphones",
  "Laptops",
  "Audio",
  "Accessories",
  "Wearables",
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  driveFileId?: string;
  isOffer?: boolean;
  percentOff?: number;
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
  isOffer: boolean;
  percentOff: number;
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
  isOffer: boolean;
  percentOff: string;
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

export type CategoryCardTile = {
  label: string;
  category: string;
  image: string;
  emoji: string;
};

export type CategoryCardGroup = {
  title: string;
  link: string;
  color: string;
  tiles: CategoryCardTile[];
};

export type SettingsData = Record<string, string>;

export interface StoreInfo {
  storeName: string;
  contactPhone: string;
  contactEmail: string;
  whatsapp: string;
  address: string;
}

export const REPAIR_STATUSES = [
  "Booked",
  "Diagnosing",
  "In progress",
  "Ready",
  "Completed",
  "Cancelled",
] as const;

export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export interface RepairBookingInput {
  name: string;
  phone: string;
  model: string;
  problem: string;
  notes: string;
  preferredDate: string;
}

export interface RepairBooking extends RepairBookingInput {
  id: string;
  reference: string;
  status: RepairStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoginAttemptRecord {
  failures: number;
  firstFailureAt: number;
  expiresAt: number;
  updatedAt: number;
}

export interface WebAuthnChallengeRecord {
  challenge: string;
  type: "registration" | "authentication";
  uid?: string;
  expiresAt: number;
}

export interface WebAuthnCredentialRecord {
  credentialId: string;
  uid: string;
  publicKeyJwk: JsonWebKey;
  alg: number;
  signCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPublicKeyCredential {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string | null;
    attestationObject?: string;
  };
}

export interface PublicKeyCredentialDescriptorJSON {
  type: "public-key";
  id: string;
  transports?: string[];
}

export interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string;
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: { type: "public-key"; alg: number }[];
  timeout?: number;
  attestation?: "none" | "indirect" | "direct" | "enterprise";
  authenticatorSelection?: {
    authenticatorAttachment?: "platform" | "cross-platform";
    residentKey?: "discouraged" | "preferred" | "required";
    requireResidentKey?: boolean;
    userVerification?: "discouraged" | "preferred" | "required";
  };
  excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string;
  rpId: string;
  allowCredentials?: PublicKeyCredentialDescriptorJSON[];
  userVerification?: "discouraged" | "preferred" | "required";
  timeout?: number;
}
