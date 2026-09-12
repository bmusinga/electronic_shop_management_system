"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ShoppingCart, Star, Filter } from "lucide-react";

const fallbackProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    price: 1199,
    category: "Smartphones",
    description: "Latest Apple flagship with A17 Pro chip",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: 1099,
    category: "Smartphones",
    description: "Premium Android smartphone with S Pen",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: 'MacBook Pro 14"',
    price: 1999,
    category: "Laptops",
    description: "M3 Pro chip, 18GB RAM, 512GB SSD",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    name: "Sony WH-1000XM5",
    price: 349,
    category: "Audio",
    description: "Industry-leading noise canceling headphones",
    stock: "Low Stock",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    name: 'iPad Pro 12.9"',
    price: 1099,
    category: "Accessories",
    description: "M2 chip, Liquid Retina XDR display",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    name: "Dell XPS 15",
    price: 1299,
    category: "Laptops",
    description: "Intel Core i7, 16GB RAM, 512GB SSD",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
  },
  {
    id: "7",
    name: "AirPods Pro 2",
    price: 249,
    category: "Audio",
    description: "Active noise cancellation, adaptive transparency",
    stock: "In Stock",
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop",
  },
  {
    id: "8",
    name: "Apple Watch Series 9",
    price: 399,
    category: "Wearables",
    description: "Always-On Retina display, health sensors",
    stock: "Low Stock",
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop",
  },
];

const categories = ["All", "Smartphones", "Laptops", "Audio", "Accessories", "Wearables"];

function getStockBadge(stock) {
  if (stock === "In Stock") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
  if (stock === "Low Stock") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = fallbackProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 [text-shadow:0_1px_0_rgba(255,255,255,0.7)] dark:[text-shadow:0_2px_4px_rgba(0,0,0,0.45)]">
          Our Products
        </h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sk-input text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
                activeCategory === category
                  ? "bg-gradient-to-b from-[#e6edf7] to-[#cbd9ea] dark:from-[#1b2638] dark:to-[#0e1622] text-[#2563EB] dark:text-white border-border-light dark:border-border-dark shadow-[inset_0_2px_4px_rgba(15,23,42,0.15),inset_0_-1px_0_rgba(255,255,255,0.5)]"
                  : "border-border-light dark:border-border-dark bg-gradient-to-b from-white to-[#e9eef4] dark:from-[#2a3a50] dark:to-[#16202f] text-slate-700 dark:text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_1px_2px_rgba(15,23,42,0.14)] hover:from-white hover:to-[#dee6ee] dark:hover:from-[#31425c] dark:hover:to-[#1a2535] active:translate-y-px"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Try adjusting your search or filter to find what you are looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="sk-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(15,23,42,0.06),0_10px_20px_rgba(15,23,42,0.2)] group overflow-hidden"
              >
                <div className="m-3 mb-0 sk-panel-inset relative overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full sk-badge bg-[#2563EB]/10 text-[#2563EB]">
                      {product.category}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full sk-badge ${getStockBadge(
                        product.stock
                      )}`}
                    >
                      {product.stock}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      ${product.price.toLocaleString()}
                    </span>
                    <button className="p-2.5 rounded-lg sk-btn-primary">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
