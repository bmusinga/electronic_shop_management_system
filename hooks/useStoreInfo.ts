"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import type { StoreInfo } from "@/lib/types";

const EMPTY_INFO: StoreInfo = {
  storeName: "EShop",
  contactPhone: "",
  contactEmail: "",
  whatsapp: "",
  address: "",
};

export function useStoreInfo(): StoreInfo {
  const [info, setInfo] = useState<StoreInfo>(EMPTY_INFO);

  useEffect(() => {
    let active = true;
    apiFetch<StoreInfo>("/api/store-info", { cache: "no-store" })
      .then((data) => {
        if (active) setInfo(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return info;
}
