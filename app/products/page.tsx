"use client";

import { Suspense, useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import ProductImage from "@/components/ui/ProductImage";
import { apiFetch } from "@/lib/client-api";
import type { Product } from "@/lib/types";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");

  useEffect(() => {
    let active = true;
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => { if (active) { setProducts(items); setLoading(false); } })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load products.");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const c = searchParams.get("category") || "All";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(q);
    setActiveCategory(c);
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#eef1f4] dark:bg-[#0A1F44]">
      <section className="w-full px-2 sm:px-3 py-6">
        {error && (
          <p className="mx-auto mb-4 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-[#ff7a1a] border-t-transparent rounded-full animate-spin" /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0A1F44] rounded-[10px]">
            <Filter className="w-10 h-10 text-[#5b6b78] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#14202a] dark:text-[#eaf0f5] mb-1">No products found</h3>
            <p className="text-sm text-[#5b6b78] dark:text-[#9fb0be]">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              return (
                <div key={product.id} className="bg-white dark:bg-[#0A1F44] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-[176px] bg-[#f9fafb] dark:bg-[#0A1F44]">
                    <ProductImage src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-contain" />
                  </div>
                  <div className="p-4 bg-white dark:bg-[#0A1F44] border-t border-[#d5dce2] dark:border-[#2a3a47]">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#14202a] dark:text-[#eaf0f5] line-clamp-2">{product.name}</h3>
                      <span className="shrink-0 text-right text-xs font-medium text-[#173f52] dark:text-[#9fb0be]">{product.category}</span>
                    </div>
                    <p className="text-sm text-[#5b6b78] dark:text-[#9fb0be] mb-3 line-clamp-2">{product.description}</p>
                    <span className="block text-right text-lg font-bold text-[#14202a] dark:text-[#eaf0f5]">KES {product.price.toLocaleString("en-KE")}</span>
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
    <Suspense fallback={<main className="min-h-screen bg-[#eef1f4] dark:bg-[#0A1F44]"><div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#5b6b78]">Loading products...</div></main>}>
      <ProductsContent />
    </Suspense>
  );
}