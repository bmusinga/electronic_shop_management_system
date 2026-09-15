"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star, ShoppingCart } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import { getStockStatus } from "@/lib/stock";
import { subscribeToProducts } from "@/lib/firestore";

function getStockBadgeColor(status) {
  switch (status) {
    case "In Stock":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "Out of Stock":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
  }
}

function ProductCard({ product }) {
  const stock = getStockStatus(product.stock);
  return (
    <div className="group sk-panel overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(15,23,42,0.06),0_10px_20px_rgba(15,23,42,0.2)]">
      <div className="m-3 mb-0 sk-panel-inset relative w-auto h-44 bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute top-2.5 left-2.5 text-xs font-semibold px-2.5 py-1 rounded-full sk-badge ${getStockBadgeColor(stock)}`}
        >
          {stock}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 [text-shadow:0_1px_0_rgba(255,255,255,0.6)] dark:[text-shadow:0_1px_0_rgba(0,0,0,0.4)]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {product.rating || 4.5}
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-slate-900 dark:text-white [text-shadow:0_1px_0_rgba(255,255,255,0.6)] dark:[text-shadow:none]">
            ${product.price.toLocaleString()}
          </span>
          <button
            aria-label={`Add ${product.name} to cart`}
            className="p-2 rounded-lg sk-btn-primary"
          >
            <ShoppingCart className="w-5 h-5 drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (items) => {
        setProducts(items.slice(0, 6));
        setLoaded(true);
      },
      () => {
        setLoaded(true);
      }
    );
    return unsubscribe;
  }, []);

  return (
    <section className="py-16 bg-slate-50 dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 [text-shadow:0_1px_0_rgba(255,255,255,0.7)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.45)]">
            Featured Products
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Handpicked electronics chosen for their exceptional quality,
            performance, and value.
          </p>
        </div>

        {loaded && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold sk-btn-primary"
          >
            View All Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}