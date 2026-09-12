"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShoppingCart } from "lucide-react";

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 1199,
    description: "Latest Apple flagship with A17 Pro chip",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
    stock: "In Stock",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    price: 1099,
    description: "Premium Android smartphone with S Pen",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop",
    stock: "In Stock",
    rating: 4.7,
  },
  {
    id: 3,
    name: 'MacBook Pro 14"',
    price: 1999,
    description: "M3 Pro chip, 18GB RAM, 512GB SSD",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    stock: "In Stock",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Sony WH-1000XM5",
    price: 349,
    description: "Industry-leading noise canceling headphones",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    stock: "Low Stock",
    rating: 4.6,
  },
  {
    id: 5,
    name: 'iPad Pro 12.9"',
    price: 1099,
    description: "M2 chip, Liquid Retina XDR display",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    stock: "In Stock",
    rating: 4.7,
  },
  {
    id: 6,
    name: "Dell XPS 15",
    price: 1299,
    description: "Intel Core i7, 16GB RAM, 512GB SSD",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    stock: "In Stock",
    rating: 4.5,
  },
];

function getStockBadgeColor(stock) {
  switch (stock) {
    case "In Stock":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "Out of Stock":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}

function ProductCard({ product }) {
  return (
    <div className="group sk-panel overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(15,23,42,0.06),0_10px_20px_rgba(15,23,42,0.2)]">
      <div className="m-3 mb-0 sk-panel-inset relative w-auto h-44 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute top-2.5 left-2.5 text-xs font-semibold px-2.5 py-1 rounded-full sk-badge ${getStockBadgeColor(product.stock)}`}
        >
          {product.stock}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 [text-shadow:0_1px_0_rgba(255,255,255,0.6)] dark:[text-shadow:0_1px_0_rgba(0,0,0,0.4)]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {product.rating}
          </span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-white [text-shadow:0_1px_0_rgba(255,255,255,0.6)] dark:[text-shadow:none]">
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
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products?featured=true&limit=6");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          }
        }
      } catch {
        // Use fallback data
      }
    }

    fetchProducts();
  }, []);

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 [text-shadow:0_1px_0_rgba(255,255,255,0.7)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.45)]">
            Featured Products
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Handpicked electronics chosen for their exceptional quality,
            performance, and value.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

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