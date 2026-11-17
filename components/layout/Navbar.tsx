"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { apiFetch } from "@/lib/client-api";
import type { Product } from "@/lib/types";

const SHOP_PHONE = "0712345678";
const SHOP_PHONE_TEL = "+254712345678";
const baseLinks = [
  { href: "/", label: "All" },
  { href: "/products", label: "Today's Deals" },
];

export default function Navbar() {
  const { dark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryLinks, setCategoryLinks] = useState<{ href: string; label: string }[]>([]);

  useEffect(() => {
    let active = true;
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => {
        if (!active) return;
        const names = Array.from(new Set((items || []).map((item) => item?.category).filter((name): name is string => !!name)));
        setCategoryLinks(names.map((name) => ({ href: `/products?category=${encodeURIComponent(name)}`, label: name })));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const navLinks = [...baseLinks, ...categoryLinks];

  const isActive = (href: string) => {
    const [path, query = ""] = href.split("?");
    if (path !== pathname) return false;
    const target = new URLSearchParams(query);
    const targetEntries = Array.from(target.entries());
    return targetEntries.length === Array.from(searchParams.keys()).length && targetEntries.every(([key, value]) => searchParams.get(key) === value);
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <header className="sticky top-0 z-50 text-white">
      <div className={dark ? "bg-[#0A1F44]" : "bg-[#1E3A8A]"}>
        <div className="flex flex-wrap items-center gap-3 py-2 pl-2 pr-4 sm:pr-6 lg:pr-8 min-[600px]:flex-nowrap">
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="min-[600px]:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="flex flex-wrap items-end gap-x-2 leading-tight shrink-0 min-[600px]:hidden">
              <span className="text-[24px] font-bold tracking-tight">E<span className="text-[#ff7a1a]">Shop</span></span>
              <span className="text-sm text-white/85">Juja Farm</span>
            </span>
            <Link href="/" className="hidden flex-wrap items-end gap-x-2 leading-tight shrink-0 min-[600px]:flex">
              <span className="text-[24px] font-bold tracking-tight">E<span className="text-[#ff7a1a]">Shop</span></span>
              <span className="text-sm text-white/85">Juja Farm</span>
              <span className="ml-6 text-sm text-white/85">We also do phone repairs</span>
            </Link>
          </div>

            <div className="order-3 w-full min-[600px]:order-2 min-[600px]:ml-4 min-[600px]:flex-1 min-[600px]:flex min-[600px]:justify-center">
              <p className="mt-0 mb-1 border-t border-white/20 pt-2 text-center text-sm text-white/85 min-[600px]:hidden">We also do phone repairs</p>
              <form onSubmit={onSearch} className="w-full">
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
            </div>

            <div className="order-2 ml-auto flex items-center gap-2 min-[600px]:order-3 min-[600px]:ml-0 shrink-0">
              <span className="hidden self-end text-sm text-white/85 min-[600px]:inline min-[600px]:mr-6">We also do phone repairs</span>
              <button onClick={toggleTheme} className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-lg bg-white/10 hover:bg-white/20" aria-label="Toggle theme">
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <a href={`tel:${SHOP_PHONE_TEL}`} className="inline-flex items-center h-[30px] rounded-lg overflow-hidden" aria-label={`Call ${SHOP_PHONE}`}>
                <img src="/icons/phone-icon.webp" alt="" aria-hidden="true" className="w-[30px] h-[30px] object-cover shrink-0" />
                <span className="hidden min-[600px]:inline pl-2 text-[24px] font-bold leading-tight tracking-tight text-white whitespace-nowrap">{SHOP_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] min-[600px]:hidden bg-black/50"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <nav id="mobile-nav" className={`fixed inset-y-0 left-0 z-[70] min-[600px]:hidden w-[280px] max-w-[85vw] overflow-y-auto border-r border-white/10 ${dark ? "bg-[#0A1F44]" : "bg-[#1E3A8A]"}`} aria-label="Mobile">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-lg font-bold">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col px-2 pb-4">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-md text-sm ${active ? "text-green-400 font-semibold" : "text-white/90 hover:bg-white/10 hover:text-white"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
      <nav className={`${dark ? "bg-[#0A1F44]" : "bg-[#1E3A8A]"} border-t border-white/10 hidden min-[600px]:block`} aria-label="Primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-1 overflow-x-auto no-scrollbar py-1 text-sm">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`whitespace-nowrap px-3 py-1 rounded-md transition-colors ${active ? "text-green-400 font-semibold" : "text-white/90 hover:bg-white/10 hover:text-white"}`}
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