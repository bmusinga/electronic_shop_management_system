"use client";

import { Suspense, useState, useEffect } from "react";
import { Search, ShoppingCart, Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import ProductImage from "@/components/ui/ProductImage";
import { apiFetch } from "@/lib/client-api";
import { getStockStatus, getStockBadgeClass } from "@/lib/stock";
import type { Product } from "@/lib/types";

const categories = ["All", "Phones", "Smartphones", "Laptops", "TV & Audio", "Audio", "Accessories", "Gaming", "Smart Home"];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");

  useEffect(() => {
    let active = true;
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => { if (active) { setProducts(items); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    const c = searchParams.get("category");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q !== null) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (c !== null) setActiveCategory(c);
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#eef1f4] dark:bg-[#0b1218]">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] p-4 sm:p-5 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14202a] dark:text-[#eaf0f5] mb-4">Electronics & Accessories</h1>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b6b78]" />
              <input type="text" placeholder="Search phones, laptops, TVs, accessories" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg bg-white dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5] placeholder:text-[#5b6b78]" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button key={category} onClick={() => setActiveCategory(category)} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${activeCategory === category ? "bg-[#173f52] text-white border-[#173f52]" : "bg-[#eef1f4] dark:bg-[#0b1218] text-[#14202a] dark:text-[#eaf0f5] border-[#d5dce2] dark:border-[#2a3a47] hover:border-[#ff7a1a]"}`}>
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[#ff7a1a] border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px]">
            <Filter className="w-10 h-10 text-[#5b6b78] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#14202a] dark:text-[#eaf0f5] mb-1">No products found</h3>
            <p className="text-sm text-[#5b6b78] dark:text-[#9fb0be]">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.stock);
              return (
                <div key={product.id} className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-44 bg-[#f9fafb] dark:bg-[#0b1218]">
                    <ProductImage src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-contain p-3" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#eef1f4] dark:bg-[#0b1218] text-[#173f52] dark:text-[#9fb0be]">{product.category}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStockBadgeClass(status)}`}>{status}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#14202a] dark:text-[#eaf0f5] mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-[#5b6b78] dark:text-[#9fb0be] mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#14202a] dark:text-[#eaf0f5]">KES {product.price.toLocaleString("en-KE")}</span>
                      <button className="p-2 rounded-lg bg-[#ff7a1a] text-white hover:bg-[#e66e15]" aria-label={`View ${product.name}`}><ShoppingCart className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#eef1f4] dark:bg-[#0b1218]"><div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#5b6b78]">Loading products...</div></main>}>
      <ProductsContent />
    </Suspense>
  );
}