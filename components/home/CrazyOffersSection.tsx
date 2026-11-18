"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/lib/types";

type CrazyOffer = {
  id: string;
  name: string;
  image: string;
  linkUrl: string;
  currentPrice: number;
  oldPrice?: number;
  label: string;
  endsAt?: string;
};

const LABELS = ["Hot deal", "Limited time deal", "Clearance", "New arrival"];

const SAMPLES: CrazyOffer[] = [
  { id: "s1", name: "Smartwatch", image: "", linkUrl: "/products", currentPrice: 3299, oldPrice: 3999, label: "Hot deal" },
  { id: "s2", name: "Laptop", image: "", linkUrl: "/products?category=Laptops", currentPrice: 45999, oldPrice: 52999, label: "Limited time deal" },
  { id: "s3", name: "Wireless Earbuds", image: "", linkUrl: "/products?category=Accessories", currentPrice: 1899, oldPrice: 2499, label: "Hot deal" },
  { id: "s4", name: "Headphones", image: "", linkUrl: "/products?category=TV%20%26%20Audio", currentPrice: 3499, oldPrice: 4499, label: "Clearance" },
  { id: "s5", name: "Bluetooth Speaker", image: "", linkUrl: "/products?category=TV%20%26%20Audio", currentPrice: 2799, oldPrice: 3599, label: "Hot deal" },
  { id: "s6", name: "Power Bank", image: "", linkUrl: "/products?category=Accessories", currentPrice: 2199, oldPrice: 2999, label: "Limited time deal" },
  { id: "s7", name: "4K TV", image: "", linkUrl: "/products?category=TV%20%26%20Audio", currentPrice: 34999, oldPrice: 42999, label: "Hot deal" },
  { id: "s8", name: "Smartphone", image: "", linkUrl: "/products?category=Phones", currentPrice: 15999, oldPrice: 18999, label: "New arrival" },
];

function formatKes(v: number) {
  return Math.round(v || 0).toLocaleString("en-KE");
}

function discountPercent(current: number, old?: number) {
  if (!old || old <= current) return 0;
  return Math.round(((old - current) / old) * 100);
}

function migrateFromProducts(products: Product[]): CrazyOffer[] {
  return products.slice(0, 8).map((p) => ({
    id: p.id,
    name: p.name || "Product",
    image: p.image || "",
    linkUrl: `/products?category=${encodeURIComponent(p.category || "")}`,
    currentPrice: p.price || 0,
    oldPrice: undefined,
    label: "Hot deal",
    endsAt: undefined,
  }));
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `Ends in ${h}:${m}:${s}`;
}

export default function CrazyOffersSection() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<CrazyOffer[]>([]);
  const [now, setNow] = useState(Date.now());
  const [reduced, setReduced] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [draft, setDraft] = useState<CrazyOffer | null>(null);
  const [error, setError] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => {
        if (!active) return;
        const base = migrateFromProducts((items || []).filter((p) => p && p.name));
        const merged = base.length < 8 ? [...base, ...SAMPLES.slice(0, 8 - base.length)] : base;
        setOffers(merged);
      })
      .catch(() => {
        if (active) setOffers(SAMPLES);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const visible = useMemo(
    () => offers.filter((o) => !o.endsAt || new Date(o.endsAt).getTime() > now),
    [offers, now]
  );

  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    window.addEventListener("resize", updateArrows);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateArrows);
    };
  }, [visible.length]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = (el.firstElementChild as HTMLElement | null)?.offsetWidth || 141;
    const amount = (card + 8) * 4 * dir;
    el.scrollBy({ left: amount, behavior: reduced ? "auto" : "smooth" });
  };

  const openNew = () => {
    setError("");
    setDraft({
      id: `c${Date.now()}`,
      name: "",
      image: "",
      linkUrl: "/products",
      currentPrice: 0,
      oldPrice: undefined,
      label: "Hot deal",
      endsAt: "",
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!(draft.currentPrice >= 0)) {
      setError("Current price must be valid.");
      return;
    }
    if (draft.oldPrice !== undefined && draft.oldPrice !== 0 && !(draft.oldPrice > draft.currentPrice)) {
      setError("Old price must be higher than current price.");
      return;
    }
    const clean: CrazyOffer = {
      ...draft,
      name: draft.name.trim(),
      image: draft.image || "",
      linkUrl: draft.linkUrl || "/products",
      oldPrice: draft.oldPrice && draft.oldPrice > draft.currentPrice ? draft.oldPrice : undefined,
      endsAt: draft.endsAt ? draft.endsAt : undefined,
      label: draft.label || "Hot deal",
    };
    setOffers((prev) => {
      const i = prev.findIndex((o) => o.id === clean.id);
      if (i >= 0) {
        const n = [...prev];
        n[i] = clean;
        return n;
      }
      return [...prev, clean];
    });
    setDraft(null);
    setError("");
  };

  return (
    <section className="bg-[#eef1f4] dark:bg-[#0A1F44]">
      <div
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] bg-[#14532d] dark:bg-[#14532d] text-white my-0"
        style={{ padding: "8px 16px 16px" }}
      >
        <div className="flex items-center justify-between gap-3" style={{ marginBottom: 10 }}>
          <h2 className="text-[24px] font-bold leading-tight flex items-center gap-2 m-0">
            <span>Check out our crazy offers!</span>
          </h2>
          {user && (
            <button
              onClick={() => setShowManage(true)}
              className="text-xs sm:text-sm underline underline-offset-2 text-white/90 hover:text-white shrink-0"
            >
              Manage crazy offers
            </button>
          )}
        </div>

        <div className="relative">
          {canLeft && (
            <button
              aria-label="Scroll offers left"
              onClick={() => scrollByCards(-1)}
              className="hidden [@media(hover:hover)_and_(pointer:fine)]:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-[44px] h-[100px] rounded-md bg-white text-[#14202a] items-center justify-center shadow-md"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div
            ref={scroller}
            onScroll={updateArrows}
            className="crazy-row flex flex-nowrap items-start overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ gap: 8, scrollSnapType: "x proximity", paddingRight: 0 }}
          >
            {visible.map((o) => {
              const pct = discountPercent(o.currentPrice, o.oldPrice);
              const remaining = o.endsAt ? new Date(o.endsAt).getTime() - now : null;
              const badgeLabel =
                remaining !== null && remaining > 0 ? formatCountdown(remaining) : o.label;
              return (
                <Link
                  key={o.id}
                  href={o.linkUrl || "/products"}
                  aria-label={o.name}
                  className="crazy-card group snap-start shrink-0 bg-white dark:bg-[#0A1F44] text-[#14202a] dark:text-white rounded-lg flex flex-col transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a]"
                  style={{ padding: 8, gap: 6, height: "auto", minWidth: 120 }}
                >
                  <div className="w-full bg-white dark:bg-[#0A1F44] flex items-center justify-center overflow-hidden" style={{ height: 125 }}>
                    {o.image ? (
                      <img src={o.image} alt={o.name} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-2xl opacity-40" aria-hidden="true">🛍️</span>
                    )}
                  </div>
                  <div className="flex items-center" style={{ gap: 4, minHeight: 32 }}>
                    {pct > 0 && (
                      <span className="bg-[#d6213b] text-white font-bold text-[12px] rounded-[4px] whitespace-nowrap" style={{ padding: "3px 6px" }}>
                        {pct}% off
                      </span>
                    )}
                    <span className="text-[#d6213b] dark:text-[#ff8a9b] font-bold text-[12px] leading-tight line-clamp-2">{badgeLabel}</span>
                  </div>
                  <div className="flex items-baseline flex-wrap" style={{ gap: 6 }}>
                    <span className="font-bold text-[18px] leading-tight text-[#14202a] dark:text-white">
                      <span className="text-[11px] font-semibold mr-0.5">KES</span>
                      {formatKes(o.currentPrice)}
                    </span>
                    {o.oldPrice && o.oldPrice > o.currentPrice && (
                      <span className="text-[12px] text-gray-500 dark:text-white/60 line-through">KES {formatKes(o.oldPrice)}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          {canRight && (
            <button
              aria-label="Scroll offers right"
              onClick={() => scrollByCards(1)}
              className="hidden [@media(hover:hover)_and_(pointer:fine)]:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-[44px] h-[100px] rounded-md bg-white text-[#14202a] items-center justify-center shadow-md"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .crazy-row > :global(.crazy-card) {
          flex: 0 0 calc((100% - 64px) / 8.6);
        }
        @media (max-width: 1024px) {
          .crazy-row > :global(.crazy-card) {
            flex: 0 0 calc((100% - 32px) / 4.3);
          }
        }
        @media (max-width: 600px) {
          .crazy-row > :global(.crazy-card) {
            flex: 0 0 calc((100% - 16px) / 2.4);
          }
        }
      `}</style>

      {showManage && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Manage crazy offers"
        >
          <div className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-xl bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] p-4 sm:p-6 text-[#14202a] dark:text-[#eaf0f5]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Manage crazy offers</h3>
              <button
                onClick={() => {
                  setShowManage(false);
                  setDraft(null);
                  setError("");
                }}
                className="px-3 py-1.5 rounded border border-[#d5dce2] dark:border-[#2a3a47]"
              >
                Close
              </button>
            </div>
            <button onClick={openNew} className="mb-4 px-4 py-2 rounded-lg bg-[#ff7a1a] text-white font-medium">
              Add offer
            </button>
            {draft && (
              <div className="mb-4 p-3 rounded-lg border border-[#d5dce2] dark:border-[#2a3a47] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  aria-label="Product name"
                  placeholder="Product name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0A1F44]"
                />
                <input
                  aria-label="Image URL"
                  placeholder="Image URL"
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                  className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0A1F44]"
                />
                <input
                  aria-label="Link URL"
                  placeholder="Link URL"
                  value={draft.linkUrl}
                  onChange={(e) => setDraft({ ...draft, linkUrl: e.target.value })}
                  className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0A1F44]"
                />
                <select
                  aria-label="Label"
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0A1F44]"
                >
                  {LABELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                  {!LABELS.includes(draft.label) && <option value={draft.label}>{draft.label}</option>}
                </select>
                <input
                  aria-label="Current price"
                  type="number"
                  placeholder="Current price (KES)"
                  value={draft.currentPrice}
                  onChange={(e) => setDraft({ ...draft, currentPrice: Number(e.target.value || 0) })}
                  className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0A1F44]"
                />
                <input
                  aria-label="Old price"
                  type="number"
                  placeholder="Old price (KES, optional)"
                  value={draft.oldPrice ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, oldPrice: e.target.value === "" ? undefined : Number(e.target.value) })
                  }
                  className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0A1F44]"
                />
                <input
                  aria-label="End time"
                  type="datetime-local"
                  value={draft.endsAt || ""}
                  onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
                  className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0A1F44] sm:col-span-2"
                />
                {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
                <div className="sm:col-span-2 flex gap-2">
                  <button onClick={saveDraft} className="px-4 py-2 rounded bg-[#173f52] text-white">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setDraft(null);
                      setError("");
                    }}
                    className="px-4 py-2 rounded border border-[#d5dce2] dark:border-[#2a3a47]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <ul className="space-y-2">
              {offers.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center gap-2 p-2 rounded border border-[#d5dce2] dark:border-[#2a3a47]"
                >
                  <span className="font-medium flex-1 min-w-[140px]">{o.name}</span>
                  <span className="text-sm">KES {formatKes(o.currentPrice)}</span>
                  <button
                    onClick={() => {
                      setError("");
                      setDraft(o);
                    }}
                    className="px-2 py-1 text-xs border rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setOffers((prev) => prev.filter((x) => x.id !== o.id))}
                    className="px-2 py-1 text-xs border rounded text-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </section>
  );
}
