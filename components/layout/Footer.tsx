"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { normalizeKenyanPhone } from "@/lib/phone";

const links = [
  { href: "/products", label: "All Products" },
  { href: "/repairs", label: "Repairs" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  const { dark } = useTheme();
  const storeInfo = useStoreInfo();
  const phone = normalizeKenyanPhone(storeInfo.contactPhone);
  const headerBg = dark ? "bg-[#0A1F44]" : "bg-[#1E3A8A]";
  const backToTopBg = dark ? "bg-[#1E3A8A]" : "bg-[#0A1F44]";
  return (
    <footer className="text-white">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`w-full ${backToTopBg} border-y border-white/20 hover:brightness-110 py-3 text-center text-sm font-medium transition-colors`}
      >
        Back to top
      </button>
      <div className={`${headerBg} px-4 pt-8 pb-6 text-center`}>
        <nav className="flex flex-wrap justify-center gap-x-9 gap-y-2 text-sm" aria-label="Footer">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-white hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4 text-xs text-gray-300">
          {storeInfo.address || "Juja Farm, Kenya"}
          {storeInfo.contactPhone && (
            <>
              <span className="mx-2">|</span>
              <a href={`tel:+${phone || storeInfo.contactPhone.replace(/[^\d]/g, "")}`} className="hover:underline">{storeInfo.contactPhone}</a>
            </>
          )}
          {storeInfo.contactEmail && (
            <>
              <span className="mx-2">|</span>
              <a href={`mailto:${storeInfo.contactEmail}`} className="hover:underline">{storeInfo.contactEmail}</a>
            </>
          )}
        </p>
        <p className="mt-6 text-xs text-gray-300">
          &copy; {new Date().getFullYear()} {storeInfo.storeName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
