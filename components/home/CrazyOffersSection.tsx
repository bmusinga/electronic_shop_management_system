"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import type { Product } from "@/lib/types";

type CrazyOffer = {
  id: string;
  name: string;
  image: string;
  linkUrl: string;
  currentPrice: number;
  oldPrice?: number;
  percentOff?: number;
  label: string;
  endsAt?: string;
};

function formatKes(v: number) {
  return Math.round(v || 0).toLocaleString("en-KE");
}

function discountPercent(current: number, old?: number) {
  if (!old || old <= current) return 0;
  return Math.round(((old - current) / old) * 100);
}

function migrateFromProducts(products: Product[]): CrazyOffer[] {
  return products
    .filter((p) => p.isOffer && p.name)
    .slice(0, 8)
    .map((p) => {
      const percent = Math.min(100, Math.max(1, p.percentOff || 0));
      return {
        id: p.id,
        name: p.name,
        image: p.image || "",
        linkUrl: `/products?category=${encodeURIComponent(p.category || "")}`,
        currentPrice: p.price || 0,
        oldPrice: undefined,
        percentOff: percent,
        label: "Hot deal",
        endsAt: undefined,
      };
    });
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `Ends in ${h}:${m}:${s}`;
}

export default function CrazyOffersSection() {
  const [offers, setOffers] = useState<CrazyOffer[]>([]);
  const [now, setNow] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
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
        if (active) setOffers(migrateFromProducts(items || []));
      })
      .catch(() => {
        if (active) setOffers([]);
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

  return (
    <section className="bg-[#eef1f4] dark:bg-[#0A1F44]">
      <div
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] bg-[#14532d] dark:bg-[#14532d] text-white my-0"
        style={{ padding: "8px 16px 16px" }}
      >
        <div style={{ marginBottom: 10 }}>
          <h2 className="text-[24px] font-bold leading-tight flex items-center gap-2 m-0">
            <span>Check out our crazy offers!</span>
          </h2>
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
            {visible.length === 0 ? (
              <div className="w-full py-8 text-center text-sm text-white/80">
                No offers available right now.
              </div>
            ) : (
              visible.map((o) => {
                const pct = o.percentOff ?? discountPercent(o.currentPrice, o.oldPrice);
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
              })
            )}
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
    </section>
  );
}
