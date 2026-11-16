"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { apiFetch } from "@/lib/client-api";
import { getStockStatus, type StockStatus } from "@/lib/stock";
import type { Product } from "@/lib/types";

function badge(status: StockStatus) {
  if (status === "In Stock") return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  if (status === "Low Stock") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<Product[]>("/api/products", { cache: "no-store" })
      .then((items) => { if (active) { setProducts(items.slice(0, 8)); setLoaded(true); } })
      .catch(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  return (
    <section className="py-4">
      <div className="bg-white dark:bg-[#15202a] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#14202a] dark:text-[#eaf0f5]">Popular picks</h2>
          <Link href="/products" className="text-sm font-medium text-[#173f52] dark:text-[#9fb0be] hover:text-[#ff7a1a] inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {loaded && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.map((product) => {
              const stock = getStockStatus(product.stock);
              return (
                <div key={product.id} className="border border-[#d5dce2] dark:border-[#2a3a47] rounded-lg p-3 bg-white dark:bg-[#0b1218]">
                  <div className="relative h-32 bg-[#eef1f4] dark:bg-[#15202a] rounded mb-2 overflow-hidden">
                    <ProductImage src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-2" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#14202a] dark:text-[#eaf0f5] line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                  <p className="text-base font-bold text-[#14202a] dark:text-[#eaf0f5] mt-1">KES {product.price.toLocaleString("en-KE")}</p>
                  <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge(stock)}`}>{stock}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#5b6b78] dark:text-[#9fb0be]">Browse our latest phones, laptops, TVs and accessories at great prices in Juja Farm.</p>
        )}
      </div>
    </section>
  );
}