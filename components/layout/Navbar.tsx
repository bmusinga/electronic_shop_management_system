"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Phone, Search, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const SHOP_PHONE = "07XX XXX XXX";
const SHOP_PHONE_TEL = "+254700000000";
const navLinks = [
  { href: "/", label: "All" },
  { href: "/products?deal=today", label: "Today's Deals" },
  { href: "/products?category=Phones", label: "Phones" },
  { href: "/products?category=Laptops", label: "Laptops" },
  { href: "/products?category=TV%20%26%20Audio", label: "TV & Audio" },
  { href: "/products?category=Gaming", label: "Gaming" },
  { href: "/products?category=Smart%20Home", label: "Smart Home" },
  { href: "/products?category=Accessories", label: "Accessories" },
  { href: "/#repair", label: "Repairs" },
];

export default function Navbar() {
  const { dark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <header className="sticky top-0 z-50 text-white">
      <div className="bg-[#0f2e3d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 py-2.5 min-[600px]:flex-nowrap">
            <Link href="/" className="shrink-0 leading-tight">
              <div className="text-[24px] font-bold tracking-tight">
                E<span className="text-[#ff7a1a]">Shop</span>
              </div>
              <div className="text-[11px] text-white/85 -mt-0.5">📍 Juja Farm</div>
            </Link>

            <form onSubmit={onSearch} className="order-3 w-full min-[600px]:order-2 min-[600px]:flex-1 min-[600px]:flex min-[600px]:justify-center">
              <div className="flex w-full min-[600px]:max-w-[520px]">
                <label htmlFor="site-search" className="sr-only">Search products</label>
                <input
                  id="site-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search phones, laptops, TVs, accessories"
                  className="w-full h-10 rounded-l-lg rounded-r-none border border-r-0 border-white/20 bg-white px-3 text-sm text-[#14202a] placeholder:text-[#5b6b78] focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                />
                <button type="submit" className="h-10 rounded-r-lg rounded-l-none bg-[#ff7a1a] px-4 text-sm font-semibold text-white hover:bg-[#e66e15] flex items-center gap-2 shrink-0" aria-label="Search">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </form>

            <div className="order-2 ml-auto flex items-center gap-2 min-[600px]:order-3 min-[600px]:ml-0 shrink-0">
              <a href={`tel:${SHOP_PHONE_TEL}`} className="hidden min-[600px]:block text-right leading-tight hover:text-[#ff7a1a]">
                <div className="text-[10px] uppercase tracking-wide text-white/75">Call or WhatsApp</div>
                <div className="text-sm font-bold flex items-center justify-end gap-1"><Phone className="w-3.5 h-3.5" /> {SHOP_PHONE}</div>
              </a>
              <a href={`tel:${SHOP_PHONE_TEL}`} className="min-[600px]:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20" aria-label={`Call ${SHOP_PHONE}`}>
                <Phone className="w-5 h-5" />
              </a>
              <button onClick={toggleTheme} className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20" aria-label="Toggle theme">
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <nav className="bg-[#173f52] border-t border-white/10" aria-label="Primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2 text-sm">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href === "/" && pathname === "/");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-md transition-colors ${active ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10 hover:text-white"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}