"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/client-api";
import type { Product } from "@/lib/types";

const COLORS = ["#1565ff", "#6a1bd1", "#f26b0f", "#a3126a", "#e91e9c", "#0b7a75", "#222b36"];

function formatKes(v: number) {
  return `KES ${Math.round(v || 0).toLocaleString("en-KE")}`;
}

export default function OffersCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => {
        if (active) setProducts(items.filter((p) => p && p.name));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
    link: `/products?category=${encodeURIComponent(p.category || "")}`,
  }));

  if (cards.length === 0) {
    return (
      <section className="bg-[#eef1f4] dark:bg-[#0b1218] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[400px] rounded-[12px] border border-[#d5dce2] dark:border-[#2a3a47] bg-white dark:bg-[#15202a] flex items-center justify-center text-[#5b6b78] dark:text-[#9fb0be]">
            Featured products will appear here.
          </div>
        </div>
      </section>
    );
  }

  const loop = [...cards, ...cards];
  const duration = Math.max(20, cards.length * 6);

  return (
    <section className="bg-[#eef1f4] dark:bg-[#0b1218] py-4 overflow-hidden">
      <div className="relative w-full overflow-hidden">
        <div
          className="flex gap-3 w-max"
          style={{ animation: reduced ? "none" : `eshop-marquee ${duration}s linear infinite` }}
        >
          {loop.map((card, idx) => (
            <article
              key={`${card.id}-${idx}`}
              className="shrink-0 w-[85vw] max-w-[320px] sm:w-[300px] lg:w-[290px] h-[400px] rounded-[12px] p-4 text-white flex flex-col"
              style={{ backgroundColor: card.color }}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-white/90 line-clamp-1">
                {card.category}
              </p>
              <h2 className="mt-1 text-[27px] leading-[1.1] font-bold line-clamp-3">
                {card.description}
              </h2>
              <div className="flex-1 flex items-center justify-center my-2 overflow-hidden">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.description}
                    className="max-h-[190px] max-w-full object-contain drop-shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-white/15 flex items-center justify-center text-white/80 text-sm">
                    No image
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold mb-3">From {formatKes(card.price)}</p>
              <Link
                href={card.link}
                className="self-start bg-white text-[#14202a] rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/90"
              >
                Shop now
              </Link>
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
