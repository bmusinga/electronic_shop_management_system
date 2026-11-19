"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

const COLORS = ["#1565ff", "#6a1bd1", "#f26b0f", "#a3126a", "#e91e9c", "#0b7a75", "#222b36"];

function formatKes(v: number) {
  return `KES ${Math.round(v || 0).toLocaleString("en-KE")}`;
}

export default function OffersCarousel({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const products = initialProducts.filter((p) => p && p.name);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const cards = products.map((p, i) => ({
    id: p.id,
    category: p.category || "Featured",
    description: p.description || p.name,
    image: p.image || "",
    price: p.price || 0,
    color: COLORS[i % COLORS.length],
  }));

  if (cards.length === 0) return null;

  const loop = [...cards, ...cards];
  const duration = Math.max(20, cards.length * 6);

  return (
    <section className="bg-[#eef1f4] dark:bg-[#0A1F44] py-1 overflow-hidden">
      <div className="relative w-full overflow-hidden">
        <div
          className="flex gap-1 w-max"
          style={{ animation: reduced ? "none" : `eshop-marquee ${duration}s linear infinite` }}
        >
          {loop.map((card, idx) => (
            <article
              key={`${card.id}-${idx}`}
              className="shrink-0 w-[85vw] max-w-[320px] sm:w-[300px] lg:w-[290px] h-[400px] rounded-[12px] p-3 text-white flex flex-col"
              style={{ backgroundColor: card.color }}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-white/90 line-clamp-1">
                {card.category}
              </p>
              <h2 className="mt-1 pb-3 text-[24px] leading-[1.3] font-bold line-clamp-3">
                {card.description}
              </h2>
              <div className="h-[180px] shrink-0 flex items-center justify-center my-2 overflow-hidden">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.description}
                    className="h-[180px] w-full object-cover drop-shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-white/15 flex items-center justify-center text-white/80 text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="mt-auto">
                <p className="text-[24px] leading-tight font-bold tracking-tight text-[#ff7a1a] [text-shadow:0_2px_6px_rgba(0,0,0,0.85),0_1px_2px_rgba(0,0,0,0.9)]">Hurry while stocks last...</p>
                <p className="text-right text-[24px] leading-tight font-semibold">From {formatKes(card.price)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes eshop-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
