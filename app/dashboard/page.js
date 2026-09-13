"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  XCircle,
  PackageOpen,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { subscribeToProducts } from "@/lib/firestore";
import { getStockStatus, getStockBadgeClass } from "@/lib/stock";

const statCards = [
  {
    key: "total",
    title: "Total Products",
    icon: Package,
    color: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "inStock",
    title: "In Stock",
    icon: ShoppingBag,
    color: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "lowStock",
    title: "Low Stock",
    icon: AlertTriangle,
    color: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "outOfStock",
    title: "Out of Stock",
    icon: XCircle,
    color: "bg-red-50 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
  },
];

function CategoryTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </p>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          {payload[0].value} product{payload[0].value === 1 ? "" : "s"}
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (items) => {
        setProducts(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  const stats = {
    total: products.length,
    inStock: products.filter((p) => getStockStatus(p.stock) === "In Stock").length,
    lowStock: products.filter((p) => getStockStatus(p.stock) === "Low Stock").length,
    outOfStock: products.filter((p) => getStockStatus(p.stock) === "Out of Stock").length,
  };

  const categoryCounts = Array.from(
    products.reduce((map, p) => {
      const key = p.category || "Uncategorized";
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map()),
    ([name, count]) => ({ name, count })
  );

  const latestProducts = products.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back. Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 sk-panel-inset px-4 py-2 rounded-lg">
          {today}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const value = stats[stat.key];
          return (
            <div key={stat.key} className="sk-panel p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {loading ? "..." : value.toLocaleString()}
                  </p>
                </div>
                <div className={`sk-icon p-3 ${stat.color}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Products by Category Chart */}
      <div className="sk-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full sk-icon">
            <PackageOpen className="h-5 w-5 text-slate-400" />
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Products by Category
          </h2>
        </div>
        {categoryCounts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
            {loading
              ? "Loading inventory..."
              : "No products yet. Add products from the Manage Products page."}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryCounts}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip content={<CategoryTooltip />} cursor={{ fill: "rgba(148,163,184,0.1)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {categoryCounts.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={index % 2 === 0 ? "#2563EB" : "#60a5fa"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Latest Products Table */}
      <div className="sk-panel">
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Latest Products
          </h2>
        </div>
        <div className="overflow-x-auto px-1 pb-1">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {latestProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {loading
                        ? "Loading products..."
                        : "No products added yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                latestProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        ${product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockBadgeClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}