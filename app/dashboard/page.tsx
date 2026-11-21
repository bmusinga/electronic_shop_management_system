"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useCollectionStream } from "@/hooks/useCollectionStream";
import ProductImage from "@/components/ui/ProductImage";
import { getStockStatus } from "@/lib/stock";
import type { Product, Sale } from "@/lib/types";

type StatKey = "total" | "inStock" | "lowStock" | "outOfStock";

interface StatCard {
  key: StatKey;
  title: string;
  titleColor: string;
}

const statCards: StatCard[] = [
  { key: "total", title: "Total Products", titleColor: "text-blue-600 dark:text-blue-400" },
  { key: "inStock", title: "In Stock", titleColor: "text-green-600 dark:text-green-400" },
  { key: "lowStock", title: "Low Stock", titleColor: "text-orange-500 dark:text-orange-400" },
  { key: "outOfStock", title: "Out of Stock", titleColor: "text-red-600 dark:text-red-400" },
];

interface CategoryCount {
  name: string;
  count: number;
}

interface CategoryTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
}

function formatSaleTime(value?: string): string {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CategoryTooltip({ active, payload, label }: CategoryTooltipProps) {
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

type RevenueRange = "today" | "lastTwoDays" | "week" | "month" | "lastMonth" | "custom";

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRangeBounds(
  range: RevenueRange,
  customFrom: string,
  customTo: string
): { from: string; to: string } {
  const now = new Date();

  if (range === "today") {
    const key = dateKey(now);
    return { from: key, to: key };
  }

  if (range === "lastTwoDays") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    return { from: dateKey(start), to: dateKey(now) };
  }

  if (range === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return { from: dateKey(start), to: dateKey(now) };
  }

  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: dateKey(start), to: dateKey(now) };
  }

  if (range === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: dateKey(start), to: dateKey(end) };
  }

  return { from: customFrom, to: customTo };
}

export default function DashboardPage() {
  const {
    data: products,
    loading: productsLoading,
  } = useCollectionStream<Product>("/api/products/stream", "products");
  const {
    data: sales,
    loading: salesLoading,
  } = useCollectionStream<Sale>("/api/sales/stream", "sales");
  const loading = productsLoading || salesLoading;
  const [revenueRange, setRevenueRange] = useState<RevenueRange>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const stats: Record<StatKey, number> = {
    total: products.length,
    inStock: products.filter((p) => getStockStatus(p.stock) === "In Stock").length,
    lowStock: products.filter((p) => getStockStatus(p.stock) === "Low Stock").length,
    outOfStock: products.filter((p) => getStockStatus(p.stock) === "Out of Stock").length,
  };

  const categoryCounts: CategoryCount[] = Array.from(
    products.reduce((map, p) => {
      const key = p.category || "Uncategorized";
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map<string, number>()),
    ([name, count]) => ({ name, count })
  );

  const revenueByDate = Array.from(
    sales.reduce((map, sale) => {
      if (!sale.createdAt) return map;
      const date = new Date(sale.createdAt);
      if (Number.isNaN(date.getTime())) return map;
      const key = dateKey(date);
      map.set(key, (map.get(key) || 0) + (sale.total || 0));
      return map;
    }, new Map<string, number>()),
    ([date, revenue]) => ({ date, revenue })
  ).sort((a, b) => a.date.localeCompare(b.date));

  const revenueBounds = getRangeBounds(revenueRange, customFrom, customTo);
  const filteredRevenue = revenueByDate.filter(
    (point) =>
      (!revenueBounds.from || point.date >= revenueBounds.from) &&
      (!revenueBounds.to || point.date <= revenueBounds.to)
  );

  const formatDateLabel = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return value;
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const today = new Date();
  const recentSales = sales
    .filter((sale) => {
      if (!sale.createdAt) return false;
      const date = new Date(sale.createdAt);
      return date.toDateString() === today.toDateString();
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const value = stats[stat.key];
          return (
            <div key={stat.key} className="sk-panel p-4 sm:p-6">
              <p className={`text-sm font-medium ${stat.titleColor}`}>
                {stat.title}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                {loading ? "..." : value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Products by Category Chart */}
      <div className="sk-panel p-6 pl-3 sm:pl-4">
        <div className="mb-6">
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
                width={42}
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

      {/* Revenue Trend Chart */}
      <div className="sk-panel p-6 pl-3 sm:pl-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Revenue Trend
          </h2>
          <div className="relative">
            <select
              aria-label="Revenue trend period"
              value={revenueRange}
              onChange={(event) => setRevenueRange(event.target.value as RevenueRange)}
              className="appearance-none rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark py-2 pl-3 pr-9 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="lastTwoDays">Last Two Days</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Date Range</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        {revenueRange === "custom" && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label="From date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400">to</span>
            <input
              type="date"
              aria-label="To date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {filteredRevenue.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
            {loading
              ? "Loading sales..."
              : "No sales recorded for this period."}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={filteredRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                width={42}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(v) => v.toLocaleString()}
              />
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString(), "Revenue"]}
                labelFormatter={(label) => formatDateLabel(String(label))}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff7a1a"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Sales */}
      <div className="sk-panel">
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Sales
          </h2>
        </div>
        <div className="hidden md:block overflow-x-auto px-1 pb-1">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {loading
                        ? "Loading sales..."
                        : "No sales recorded today."}
                    </p>
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <ProductImage
                        src={products.find((p) => p.id === sale.productId)?.image}
                        alt={sale.productName}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded-lg bg-slate-100 dark:bg-slate-700"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {sale.productName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {sale.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatSaleTime(sale.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {recentSales.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading sales..." : "No sales recorded today."}
            </p>
          ) : (
            recentSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white dark:bg-[#0A1F44] border border-[#d5dce2] dark:border-[#2a3a47] rounded-[10px] overflow-hidden"
              >
                <div className="flex gap-3 p-4 border-b border-[#d5dce2] dark:border-[#2a3a47]">
                  <ProductImage
                    src={products.find((p) => p.id === sale.productId)?.image}
                    alt={sale.productName}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover rounded-lg bg-[#f9fafb] dark:bg-[#0A1F44]"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[#14202a] dark:text-[#eaf0f5] line-clamp-2">
                      {sale.productName}
                    </h3>
                    <p className="mt-1 text-sm text-[#5b6b78] dark:text-[#9fb0be]">
                      {formatSaleTime(sale.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="text-xs text-[#5b6b78] dark:text-[#9fb0be]">
                      Quantity
                    </p>
                    <p className="text-sm font-medium text-[#14202a] dark:text-[#eaf0f5]">
                      {sale.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#5b6b78] dark:text-[#9fb0be]">
                      Total
                    </p>
                    <p className="text-lg font-bold text-[#14202a] dark:text-[#eaf0f5]">
                      {sale.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}