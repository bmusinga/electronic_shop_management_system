"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ShoppingCart,
  Inbox,
  CalendarClock,
  X,
  AlertCircle,
  PackageX,
} from "lucide-react";
import { useCollectionStream } from "@/hooks/useCollectionStream";
import { apiFetch } from "@/lib/client-api";
import type { Product, Sale } from "@/lib/types";

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardSalesPage() {
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
  } = useCollectionStream<Product>("/api/products/stream", "products");
  const {
    data: sales,
    loading: salesLoading,
    error: salesError,
  } = useCollectionStream<Sale>("/api/sales/stream", "sales");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  const loading = productsLoading || salesLoading;
  const loadError = productsError || salesError || actionError;

  const selectedProduct = products.find((p) => p.id === productId) || null;

  const quantityNum = Number(quantity);
  const unitPriceNum = Number(unitPrice);
  const total =
    Number.isFinite(quantityNum) && Number.isFinite(unitPriceNum)
      ? quantityNum * unitPriceNum
      : 0;

  function openModal() {
    setProductId("");
    setQuantity("1");
    setUnitPrice("");
    setFormError("");
    setIsModalOpen(true);
  }

  function handleProductChange(id: string) {
    setProductId(id);
    const product = products.find((p) => p.id === id);
    if (product) {
      setUnitPrice(String(product.price));
      setQuantity("1");
    }
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    if (!selectedProduct) {
      setFormError("Please select a product.");
      return;
    }
    if (!Number.isInteger(quantityNum) || quantityNum <= 0) {
      setFormError("Quantity must be a whole number greater than zero.");
      return;
    }
    if (!Number.isFinite(unitPriceNum) || unitPriceNum <= 0) {
      setFormError("Please enter a valid unit price.");
      return;
    }
    if (quantityNum > selectedProduct.stock) {
      setFormError(
        `Only ${selectedProduct.stock} unit${selectedProduct.stock === 1 ? "" : "s"} of ${selectedProduct.name} are in stock.`
      );
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      await apiFetch<{ ok: boolean }>("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: quantityNum,
          unitPrice: unitPriceNum,
        }),
      });
      setIsModalOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not record the sale."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setActionError("");
    try {
      await apiFetch<{ ok: boolean }>(`/api/sales/${deleteId}`, {
        method: "DELETE",
      });
      setDeleteId(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete the sale."
      );
      setDeleteId(null);
    }
  }

  const saleProjectsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sales
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Record new sales. Recording a sale subtracts the quantity from the
            product&apos;s stock.
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl sk-btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Sale
        </button>
      </div>

      {!loading && !loadError && sales.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg sk-panel text-sm font-medium text-slate-700 dark:text-slate-200">
            <ShoppingCart className="w-4 h-4 text-[#2563EB]" />
            {sales.length} sale{sales.length === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg sk-panel text-sm font-medium text-slate-700 dark:text-slate-200">
            {saleProjectsSold} unit{saleProjectsSold === 1 ? "" : "s"} sold
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg sk-panel text-sm font-medium text-slate-700 dark:text-slate-200">
            {formatMoney(totalRevenue)} total revenue
          </span>
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-400">{loadError}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !loadError && sales.length === 0 && (
        <div className="sk-panel p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full sk-icon bg-[#2563EB]/10 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-[#2563EB]" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No sales yet
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Record your first sale to start tracking revenue. Each sale is
            automatically subtracted from the product&apos;s stock.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {sales.map((sale) => (
          <div key={sale.id} className="sk-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full sk-icon bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {sale.productName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Quantity {sale.quantity} at {formatMoney(sale.unitPrice)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteId(sale.id)}
                aria-label={`Delete sale of ${sale.productName}`}
                className="p-2 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-150 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium sk-badge bg-[#2563EB]/10 text-[#2563EB]">
                {formatMoney(sale.total)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CalendarClock className="w-3.5 h-3.5" />
                {formatDate(sale.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="sk-panel w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Record a Sale
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {products.length === 0 ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <PackageX className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  You don&apos;t have any products yet. Add products first from
                  the Manage Products page.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                    Product
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-3 py-2.5 sk-input rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark"
                  >
                    <option value="">Select a product...</option>
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                        disabled={product.stock <= 0}
                      >
                        {product.name} — {product.stock} in stock
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2.5 sk-input rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className="w-full px-3 py-2.5 sk-input rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark"
                    />
                  </div>
                </div>

                {selectedProduct && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <ShoppingCart className="w-4 h-4 text-[#2563EB]" />
                    {selectedProduct.stock} unit
                    {selectedProduct.stock === 1 ? "" : "s"} available in stock
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-lg sk-panel-inset">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Total
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatMoney(total)}
                  </span>
                </div>

                {formError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {formError}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium sk-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-b from-[#3f83f8] to-[#2058d8] border border-[#1e40af] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.28)] hover:brightness-105 transition-all duration-150"
                  >
                    {saving ? "Recording..." : "Record Sale"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="sk-panel w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Delete sale?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This removes the sale and restores the quantity back to the
              product&apos;s stock.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium sk-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-b from-red-500 to-red-700 border border-red-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.3)] hover:from-red-600 hover:to-red-800 transition-all duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}