import { getSettings } from "@/lib/firestore-admin";
import type { StoreInfo } from "@/lib/types";

export const dynamic = "force-dynamic";

const EMPTY_INFO: StoreInfo = {
  storeName: "EShop",
  contactPhone: "",
  contactEmail: "",
  whatsapp: "",
  address: "",
};

export async function GET() {
  const settings = await getSettings();
  const info: StoreInfo = {
    storeName: settings?.storeName || EMPTY_INFO.storeName,
    contactPhone: settings?.contactPhone || "",
    contactEmail: settings?.contactEmail || "",
    whatsapp: settings?.whatsapp || "",
    address: settings?.address || "",
  };

  return Response.json(info, {
    headers: { "Cache-Control": "no-store" },
  });
}
