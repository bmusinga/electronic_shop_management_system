"use client";

import {
  Package,
  ShoppingBag,
  AlertTriangle,
  XCircle,
  PackageOpen,
  type LucideIcon,
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
import { useCollectionStream } from "@/hooks/useCollectionStream";
import ProductImage from "@/components/ui/ProductImage";
import { getStockStatus } from "@/lib/stock";
import type { Product, Sale } from "@/lib/types";

type StatKey = "total" | "inStock" | "lowStock" | "outOfStock";

interface StatCard {
  key: StatKey;
  title: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
}

const statCards: StatCard[] = [
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