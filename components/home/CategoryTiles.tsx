"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/client-api";
import { useAuth } from "@/hooks/useAuth";
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

const DARK_COLORS: Record<string, string> = {
  "#dbe7f6": "#24384c",
  "#e7ddf5": "#352a46",
  "#fbe3d3": "#463323",
  "#d9efe3": "#243a30",
};

function darken(color: string) {
  return DARK_COLORS[color.toLowerCase()] || "#24323f";
}

async function resizeDataUrl(file: File): Promise<string> {
  const data = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result || ""));
    r.onerror = () => rej(new Error("read"));
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("img"));
    i.src = data;
  });
  const max = 400;
  let { width, height } = img;
  if (width > max || height > max) {
    const ratio = Math.min(max / width, max / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return data;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function CategoryTiles() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CategoryCardGroup[]>(DEFAULT_CARDS);
  const [products, setProducts] = useState<Product[]>([]);
  const [showManage, setShowManage] = useState(false);
  const [draft, setDraft] = useState<CategoryCardGroup[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<{ cards: CategoryCardGroup[] }>("/api/category-cards", { cache: "no-store" })
      .then((d) => { if (active && d?.cards?.length) setCards(d.cards); })
      .catch(() => {});
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => { if (active) setProducts(items || []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const tileMatch = (t: { image: string; category: string; label: string }) => {
    if (t.image) return { image: t.image, productName: "" };
    const cat = (t.category || "").toLowerCase().trim();
    const label = (t.label || "").toLowerCase().trim();
    const found = products.find((p) => {
      if (!p.image) return false;
      const pc = (p.category || "").toLowerCase().trim();
      const pn = (p.name || "").toLowerCase();
      return (
        (cat && pc === cat) ||
        (cat && (pc.includes(cat) || cat.includes(pc))) ||
        (label && (pc === label || pc.includes(label) || label.includes(pc))) ||
        (label && pn.includes(label))
      );
    });
    return { image: found?.image || "", productName: found?.name || "" };
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/category-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ cards: draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setCards(data.cards || draft);
      setDraft(null);
      setShowManage(false);
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const moveCard = (i: number, dir: -1 | 1) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const n = [...prev];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };

  const setCard = (i: number, patch: Partial<CategoryCardGroup>) =>
    setDraft((prev) => prev ? prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) : prev);

  const setTile = (ci: number, ti: number, patch: Partial<CategoryCardGroup["tiles"][number]>) =>
    setDraft((prev) => prev ? prev.map((c, idx) => idx === ci ? { ...c, tiles: c.tiles.map((t, j) => j === ti ? { ...t, ...patch } : t) } : c) : prev);

  const onTileImage = async (ci: number, ti: number, file?: File | null) => {
    if (!file) return;
    try {
      const img = await resizeDataUrl(file);
      setTile(ci, ti, { image: img });
    } catch {}
  };

  return (
    <section className="bg-[#eef1f4] dark:bg-[#0b1218]" style={{ padding: "14px 16px", overflowX: "clip" }}>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 8 }}>
        {cards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[12px]" style={{ padding: 12 }}>
            <Link href={card.link || "/products"} className="flex items-start justify-between gap-2 mb-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a] rounded">
              <span className="font-bold text-[21px] leading-tight text-[#14202a] dark:text-[#eaf0f5] line-clamp-2">{card.title}</span>
              <span aria-hidden="true" className="text-[#14202a] dark:text-[#eaf0f5] text-lg leading-none mt-0.5">&gt;</span>
            </Link>
            <div className="grid grid-cols-2" style={{ columnGap: 10, rowGap: 18 }}>
              {card.tiles.slice(0, 4).map((t) => {
                const match = tileMatch(t);
                const href = `/products?category=${encodeURIComponent(t.category || t.label)}`;
                return (
                  <Link key={t.label} href={href} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1a] rounded-lg">
                    <div className="relative w-full overflow-hidden rounded-lg flex items-center justify-center" style={{ aspectRatio: "1 / 1", backgroundColor: card.color }}>
                      <div className="absolute inset-0 hidden dark:block rounded-lg" style={{ backgroundColor: darken(card.color) }} />
                      <div className="relative z-[1] w-full h-full flex items-center justify-center" style={{ padding: "8%" }}>
                        {match.image ? (
                          <img src={match.image} alt={match.productName || t.label} className="max-w-full max-h-full object-contain transition-transform duration-150 group-hover:scale-[1.04]" />
                        ) : (
                          <span className="text-[64px] leading-none" aria-hidden="true">{t.emoji || "🛍️"}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-[14px] font-normal text-left text-[#14202a] dark:text-[#eaf0f5]" style={{ marginTop: 6 }}>{t.label}</div>
                    {match.productName && (
                      <div className="text-[12px] text-left text-[#5b6b78] dark:text-[#9fb0be] line-clamp-1" style={{ marginTop: 2 }}>{match.productName}</div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <div className="mt-3 flex justify-end">
          <button onClick={() => { setDraft(JSON.parse(JSON.stringify(cards))); setShowManage(true); }} className="text-sm font-medium text-[#173f52] dark:text-[#9fb0be] underline underline-offset-2 hover:text-[#ff7a1a]">
            Manage category cards
          </button>
        </div>
      )}

      {showManage && draft && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Manage category cards">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-auto rounded-xl bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] p-4 sm:p-6 text-[#14202a] dark:text-[#eaf0f5]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Manage category cards</h3>
              <button onClick={() => { setShowManage(false); setDraft(null); setErr(""); }} className="px-3 py-1.5 rounded border border-[#d5dce2] dark:border-[#2a3a47]">Close</button>
            </div>
            {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
            <div className="space-y-4">
              {draft.map((card, ci) => (
                <div key={ci} className="p-3 rounded-lg border border-[#d5dce2] dark:border-[#2a3a47]">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <input aria-label="Card title" value={card.title} onChange={(e) => setCard(ci, { title: e.target.value })} className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0b1218] flex-1 min-w-[180px]" placeholder="Title" />
                    <input aria-label="Card link" value={card.link} onChange={(e) => setCard(ci, { link: e.target.value })} className="border border-[#d5dce2] dark:border-[#2a3a47] rounded px-3 py-2 bg-white dark:bg-[#0b1218] flex-1 min-w-[180px]" placeholder="Link" />
                    <label className="flex items-center gap-2 text-sm">Color <input aria-label="Background colour" type="color" value={card.color} onChange={(e) => setCard(ci, { color: e.target.value })} /></label>
                    <button onClick={() => moveCard(ci, -1)} disabled={ci === 0} className="px-2 py-1 text-xs border rounded disabled:opacity-40">Up</button>
                    <button onClick={() => moveCard(ci, 1)} disabled={ci === draft.length - 1} className="px-2 py-1 text-xs border rounded disabled:opacity-40">Down</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {card.tiles.map((t, ti) => (
                      <div key={ti} className="p-2 rounded border border-[#d5dce2] dark:border-[#2a3a47] space-y-2">
                        <input aria-label="Tile label" value={t.label} onChange={(e) => setTile(ci, ti, { label: e.target.value })} className="w-full border border-[#d5dce2] dark:border-[#2a3a47] rounded px-2 py-1.5 bg-white dark:bg-[#0b1218]" placeholder="Label" />
                        <input aria-label="Tile category" value={t.category} onChange={(e) => setTile(ci, ti, { category: e.target.value })} className="w-full border border-[#d5dce2] dark:border-[#2a3a47] rounded px-2 py-1.5 bg-white dark:bg-[#0b1218]" placeholder="Category name (for link/products)" />
                        <input aria-label="Tile emoji fallback" value={t.emoji} onChange={(e) => setTile(ci, ti, { emoji: e.target.value })} className="w-full border border-[#d5dce2] dark:border-[#2a3a47] rounded px-2 py-1.5 bg-white dark:bg-[#0b1218]" placeholder="Emoji fallback" />
                        <input aria-label="Tile image" type="file" accept="image/*" onChange={(e) => onTileImage(ci, ti, e.target.files?.[0])} className="text-xs" />
                        {t.image && <button onClick={() => setTile(ci, ti, { image: "" })} className="text-xs underline">Remove image</button>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-[#173f52] text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              <button onClick={() => { setShowManage(false); setDraft(null); setErr(""); }} className="px-4 py-2 rounded border border-[#d5dce2] dark:border-[#2a3a47]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
