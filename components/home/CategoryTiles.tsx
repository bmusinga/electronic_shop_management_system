"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/client-api";
import type { CategoryCardGroup, Product } from "@/lib/types";

const DEFAULT_CARDS: CategoryCardGroup[] = [
  {
    title: "Phones & tablets",
    link: "/products?category=Phones",
    color: "#dbe7f6",
    tiles: [
      { label: "Smartphones", category: "Phones", image: "", emoji: "📱" },
      { label: "Tablets", category: "Tablets", image: "", emoji: "📲" },
      { label: "Earbuds", category: "Accessories", image: "", emoji: "🎧" },
      { label: "Watches", category: "Accessories", image: "", emoji: "⌚" },
    ],
  },
  {
    title: "Computers",
    link: "/products?category=Laptops",
    color: "#e7ddf5",
    tiles: [
      { label: "Laptops", category: "Laptops", image: "", emoji: "💻" },
      { label: "Desktops", category: "Desktops", image: "", emoji: "🖥️" },
      { label: "Keyboards", category: "Accessories", image: "", emoji: "⌨️" },
      { label: "Printers", category: "Accessories", image: "", emoji: "🖨️" },
    ],
  },
  {
    title: "TV & audio",
    link: "/products?category=TV%20%26%20Audio",
    color: "#fbe3d3",
    tiles: [
      { label: "Smart TVs", category: "TV & Audio", image: "", emoji: "📺" },
      { label: "Speakers", category: "TV & Audio", image: "", emoji: "🔊" },
      { label: "Mics", category: "Accessories", image: "", emoji: "🎤" },
      { label: "Decoders", category: "TV & Audio", image: "", emoji: "📡" },
    ],
  },
  {
    title: "Power & accessories",
    link: "/products?category=Accessories",
    color: "#d9efe3",
    tiles: [
      { label: "Power banks", category: "Accessories", image: "", emoji: "🔋" },
      { label: "Chargers", category: "Accessories", image: "", emoji: "🔌" },
      { label: "Storage", category: "Accessories", image: "", emoji: "💾" },
      { label: "Cameras", category: "Cameras", image: "", emoji: "📷" },
    ],
  },
];

function categoryFromLink(link: string): string {
  try {
    const url = new URL(link, "http://localhost");
    return url.searchParams.get("category") || "";
  } catch {
    return "";
  }
}

function cardCategory(card: CategoryCardGroup): string {
  return categoryFromLink(card.link) || card.tiles.find((t) => t.category)?.category || card.title;
}

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

export default function CategoryTiles() {
  const [cards, setCards] = useState<CategoryCardGroup[]>(DEFAULT_CARDS);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<number, Product[]>>({});

  useEffect(() => {
    let active = true;
    apiFetch<{ cards: CategoryCardGroup[] }>("/api/category-cards", { cache: "no-store" })
      .then((d) => {
        if (active && d?.cards?.length) setCards(d.cards);
      })
      .catch(() => {});
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => {
        if (active) setProducts(items || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const next: Record<number, Product[]> = {};
      cards.forEach((card, index) => {
        const matches = productsForCategory(cardCategory(card), products);
        if (matches.length > 4) {
          next[index] = shuffle(matches).slice(0, 4);
        }
      });
      setSelected(next);
    };
    update();
    const id = window.setInterval(update, 60000);
    return () => window.clearInterval(id);
  }, [cards, products]);

  return (
    <section className="bg-[#eef1f4] dark:bg-[#0A1F44]" style={{ padding: "14px 16px", overflowX: "clip" }}>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 8 }}>
        {cards.map((card, cardIndex) => {
          const category = cardCategory(card);
          const title = category || card.title;
          const href = category
            ? `/products?category=${encodeURIComponent(category)}`
            : card.link || "/products";
          const matches = productsForCategory(category, products);
          const shown = selected[cardIndex] || matches.slice(0, 4);

          return (
            <div
              key={`${card.title}-${cardIndex}`}
              className="bg-white dark:bg-[#0A1F44] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[12px]"
              style={{ padding: 12 }}
            >
              <Link
                href={href}
                className="flex items-start justify-between gap-2 mb-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a] rounded"
              >
                <span className="font-bold text-[21px] leading-tight text-[#14202a] dark:text-[#eaf0f5] line-clamp-2">
                  {title}
                </span>
                <span aria-hidden="true" className="text-[#14202a] dark:text-[#eaf0f5] text-lg leading-none mt-0.5">
                  &gt;
                </span>
              </Link>
              <div className="grid grid-cols-2" style={{ columnGap: 10, rowGap: 18 }}>
                {Array.from({ length: 4 }).map((_, tileIndex) => {
                  const product = shown[tileIndex];
                  const fallback = card.tiles[tileIndex];
                  const label = product?.name || fallback?.label || category;
                  const image = product?.image || fallback?.image || "";
                  return (
                    <Link
                      key={product?.id || `${cardIndex}-${tileIndex}`}
                      href={href}
                      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a] rounded-lg border border-[#d5dce2] dark:border-[#2a3a47] p-1.5"
                    >
                      <div
                        className="relative w-full overflow-hidden rounded-lg flex items-center justify-center"
                        style={{ aspectRatio: "1 / 1", backgroundColor: card.color }}
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
                              {fallback?.emoji || "🛍️"}
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
