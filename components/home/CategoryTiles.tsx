"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/client-api";
import type { Product } from "@/lib/types";

const CARD_COLORS = ["#dbe7f6", "#e7ddf5", "#fbe3d3", "#d9efe3", "#f6dbe6"];
const CATEGORY_EMOJIS = ["📱", "💻", "🎧", "⌚", "🎮"];

function productsForCategory(category: string, products: Product[]): Product[] {
  const key = category.toLowerCase().trim();
  if (!key) return [];
  const exact = products.filter(
    (p) => p.image && (p.category || "").toLowerCase().trim() === key
  );
  if (exact.length) return exact;
  return products.filter((p) => {
    if (!p.image) return false;
    const pc = (p.category || "").toLowerCase().trim();
    return pc.includes(key) || key.includes(pc);
  });
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function imageSet(matches: Product[], random = false): Product[] {
  const source = random ? shuffle(matches) : matches;
  if (!source.length) return [];
  return Array.from({ length: 4 }, (_, index) => source[index % source.length]);
}

export default function CategoryTiles() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    let active = true;
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => {
        if (active) setProducts(items || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const fromProducts = products
      .filter((p) => p.image && (p.category || "").trim())
      .map((p) => (p.category || "").trim());
    return Array.from(new Set(fromProducts));
  }, [products]);

  useEffect(() => {
    const update = () => {
      const next: Record<string, Product[]> = {};
      categories.forEach((category) => {
        const matches = productsForCategory(category, products);
        if (matches.length) next[category] = imageSet(matches, true);
      });
      setSelected(next);
    };
    update();
    const id = window.setInterval(update, 30000);
    return () => window.clearInterval(id);
  }, [categories, products]);

  return (
    <section className="bg-[#eef1f4] dark:bg-[#0A1F44]" style={{ padding: "14px 16px", overflowX: "clip" }}>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 8 }}>
        {categories.map((category, categoryIndex) => {
          const matches = productsForCategory(category, products);
          const shown = selected[category] || imageSet(matches);
          const color = CARD_COLORS[categoryIndex % CARD_COLORS.length];
          const emoji = CATEGORY_EMOJIS[categoryIndex % CATEGORY_EMOJIS.length];
          const href = `/products?category=${encodeURIComponent(category)}`;

          return (
            <div
              key={category}
              className="bg-white dark:bg-[#0A1F44] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[12px]"
              style={{ padding: 12 }}
            >
              <Link
                href={href}
                className="flex items-start justify-between gap-2 mb-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a] rounded"
              >
                <span className="font-bold text-[21px] leading-tight text-[#14202a] dark:text-[#eaf0f5] line-clamp-2">
                  {category}
                </span>
                <span aria-hidden="true" className="text-[#14202a] dark:text-[#eaf0f5] text-lg leading-none mt-0.5">
                  &gt;
                </span>
              </Link>
              <div className="grid grid-cols-2" style={{ columnGap: 10, rowGap: 18 }}>
                {Array.from({ length: 4 }).map((_, tileIndex) => {
                  const product = shown[tileIndex];
                  const label = product?.name || category;
                  const image = product?.image || "";
                  return (
                    <Link
                      key={`${category}-${tileIndex}-${product?.id || "empty"}`}
                      href={href}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a] rounded-lg border border-[#d5dce2] dark:border-[#2a3a47] p-1.5"
                    >
                      <div
                        className="relative w-full overflow-hidden rounded-lg flex items-center justify-center bg-[var(--tile-bg)] dark:bg-[#15202a]"
                        style={{ aspectRatio: "1 / 1", "--tile-bg": color } as CSSProperties}
                      >
                        <div className="relative z-[1] w-full h-full flex items-center justify-center" style={{ padding: "8%" }}>
                          {image ? (
                            <img
                              src={image}
                              alt={label}
                              className="max-w-full max-h-full object-contain transition-transform duration-150 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <span className="text-[64px] leading-none" aria-hidden="true">
                              {emoji}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="text-[14px] font-normal text-left text-[#14202a] dark:text-[#eaf0f5]"
                        style={{ marginTop: 6 }}
                      >
                        {label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
