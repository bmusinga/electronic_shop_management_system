"use client";

import React from "react";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 22300 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 24100 },
  { month: "May", revenue: 27600 },
  { month: "Jun", revenue: 25400 },
  { month: "Jul", revenue: 29800 },
  { month: "Aug", revenue: 31200 },
  { month: "Sep", revenue: 28900 },
  { month: "Oct", revenue: 33500 },
  { month: "Nov", revenue: 35200 },
  { month: "Dec", revenue: 38800 },
];

const recentOrders = [
  {
    orderId: "#ORD-7892",
    customer: "Alex Johnson",
    product: 'MacBook Pro 16" M3',
    amount: "$2,499.00",
    status: "Completed",
    date: "Dec 15, 2024",
  },
  {
    orderId: "#ORD-7891",
    customer: "Sarah Williams",
    product: "Sony WH-1000XM5",
    amount: "$349.99",
    status: "Processing",
    date: "Dec 15, 2024",
  },
  {
    orderId: "#ORD-7890",
    customer: "Michael Chen",
    product: "Samsung Galaxy S24 Ultra",
    amount: "$1,299.99",
    status: "Completed",
    date: "Dec 14, 2024",
  },
  {
    orderId: "#ORD-7889",
    customer: "Emily Davis",
    product: 'iPad Air M2 11"',
    amount: "$799.00",
    status: "Pending",
    date: "Dec 14, 2024",
  },
  {
    orderId: "#ORD-7888",
    customer: "James Wilson",
    product: "LG OLED C3 55\" TV",
    amount: "$1,499.99",
    status: "Completed",
    date: "Dec 13, 2024",
  },
];

const stats = [
  {
    title: "Total Revenue",
    value: "$124,563",
    trend: "+12.5% from last month",
    positive: true,
    icon: DollarSign,
    color: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Total Orders",
    value: "1,248",
    trend: "+8.2% from last month",
    positive: true,
    icon: ShoppingBag,
    color: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Products",
    value: "384",
    trend: "+24 new this month",
    positive: true,
    icon: Package,
    color: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Active Users",
    value: "2,456",
    trend: "+18.1% from last month",
    positive: true,
    icon: Users,
    color: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

const statusStyles = {
  Completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Processing:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Pending:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </p>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="sk-panel p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`sk-icon p-3 ${stat.color}`}
                >
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {stat.positive ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    stat.positive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="sk-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full sk-icon">
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Revenue Trend
          </h2>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563EB"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders Table */}
      <div className="sk-panel">
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Orders
          </h2>
        </div>
        <div className="overflow-x-auto px-1 pb-1">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentOrders.map((order) => (
                <tr
                  key={order.orderId}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
