import { assertSameOrigin, jsonError, readJson } from "@/lib/api";
import { getSettings, saveSettings } from "@/lib/firestore-admin";
import { requireAdmin } from "@/lib/session";
import type { CategoryCardGroup } from "@/lib/types";

export const dynamic = "force-dynamic";

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

function normalize(input: unknown): CategoryCardGroup[] | null {
  if (!Array.isArray(input)) return null;
  const cards = input
    .map((c: any, i: number) => {
      if (!c || typeof c !== "object") return null;
      const tiles = Array.isArray(c.tiles) ? c.tiles.slice(0, 4) : [];
      while (tiles.length < 4) tiles.push({ label: "Item", category: "Accessories", image: "", emoji: "🛍️" });
      return {
        title: typeof c.title === "string" && c.title.trim() ? c.title.trim().slice(0, 80) : DEFAULT_CARDS[i]?.title || "Category",
        link: typeof c.link === "string" && c.link.trim() ? c.link.trim().slice(0, 300) : DEFAULT_CARDS[i]?.link || "/products",
        color: typeof c.color === "string" && c.color.trim() ? c.color.trim().slice(0, 20) : DEFAULT_CARDS[i]?.color || "#dbe7f6",
        tiles: tiles.map((t: any, j: number) => ({
          label: typeof t?.label === "string" && t.label.trim() ? t.label.trim().slice(0, 40) : DEFAULT_CARDS[i]?.tiles[j]?.label || "Item",
          category: typeof t?.category === "string" && t.category.trim() ? t.category.trim().slice(0, 60) : DEFAULT_CARDS[i]?.tiles[j]?.category || "Accessories",
          image: typeof t?.image === "string" ? t.image.slice(0, 500000) : "",
          emoji: typeof t?.emoji === "string" && t.emoji.trim() ? t.emoji.trim().slice(0, 8) : DEFAULT_CARDS[i]?.tiles[j]?.emoji || "🛍️",
        })),
      } as CategoryCardGroup;
    })
    .filter(Boolean) as CategoryCardGroup[];
  return cards.length ? cards.slice(0, 12) : null;
}

export async function GET() {
  try {
    const settings = (await getSettings()) ?? {};
    let cards: CategoryCardGroup[] | null = null;
    if (typeof settings.categoryCards === "string" && settings.categoryCards) {
      try { cards = normalize(JSON.parse(settings.categoryCards)); } catch { cards = null; }
    }
    return Response.json({ cards: cards ?? DEFAULT_CARDS }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const body = await readJson<{ cards?: unknown }>(request);
    const cards = normalize(body.cards);
    if (!cards) return Response.json({ error: "Invalid category cards." }, { status: 400 });
    await saveSettings({ categoryCards: JSON.stringify(cards) });
    return Response.json({ ok: true, cards });
  } catch (error) {
    return jsonError(error);
  }
}
