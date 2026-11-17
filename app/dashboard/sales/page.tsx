"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  Search,
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
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  const loading = productsLoading || salesLoading;
  const loadError = productsError || salesError || actionError;

  const selectedProduct = products.find((p) => p.id === productId) || null;
  const editingSale = sales.find((sale) => sale.id === editingSaleId) || null;
  const availableStock = selectedProduct
    ? selectedProduct.stock +
      (editingSale?.productId === selectedProduct.id ? editingSale.quantity : 0)
    : 0;

  const quantityNum = Number(quantity);
  const unitPriceNum = Number(unitPrice);
  const total =
    Number.isFinite(quantityNum) && Number.isFinite(unitPriceNum)
      ? quantityNum * unitPriceNum
      : 0;

  function openModal() {
    setEditingSaleId(null);
    setProductId("");
    setQuantity("1");
    setUnitPrice("");
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(sale: Sale) {
    setEditingSaleId(sale.id);
    setProductId(sale.productId);
    setQuantity(String(sale.quantity));
    setUnitPrice(String(sale.unitPrice));
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
    if (quantityNum > availableStock) {
      setFormError(
        `Only ${availableStock} unit${availableStock === 1 ? "" : "s"} of ${selectedProduct.name} are in stock.`
      );
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      await apiFetch<{ ok: boolean }>(
        editingSaleId ? `/api/sales/${editingSaleId}` : "/api/sales",
        {
          method: editingSaleId ? "PUT" : "POST",
          body: JSON.stringify({
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: quantityNum,
            unitPrice: unitPriceNum,
          }),
        }
      );
      setIsModalOpen(false);
      setEditingSaleId(null);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : editingSaleId
            ? "Could not update the sale."
            : "Could not record the sale."
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
  const filteredSales = sales.filter((sale) =>
    sale.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 sm:gap-4">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted-light dark:text-text-muted-dark" />
          <input
            type="text"
            placeholder="Find sale"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sk-input h-11 w-full rounded-xl pl-10 pr-4 text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-muted-light dark:placeholder-text-muted-dark"
          />
        </div>
        <button
          onClick={openModal}
          className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-medium text-white sk-btn-primary"
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

      {!loading && !loadError && sales.length > 0 && (
        <>
          <div className="sk-panel overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark text-xs uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Unit Price</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <p className="text-text-muted-light dark:text-text-muted-dark text-sm">
                        No sales match &ldquo;{searchQuery}&rdquo;
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-border-light dark:border-border-dark last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
                        {sale.productName}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {sale.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
                        {formatMoney(sale.unitPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium sk-badge bg-[#2563EB]/10 text-[#2563EB]">
                          {formatMoney(sale.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {formatDate(sale.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(sale)}
                            className="p-2 sk-btn rounded-lg"
                            title="Edit sale"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(sale.id)}
                            aria-label={`Delete sale of ${sale.productName}`}
                            title="Delete sale"
                            className="p-2 text-danger border border-red-300/70 dark:border-red-900/60 rounded-lg bg-gradient-to-b from-[#fff5f5] to-[#fee2e2] dark:from-[#33171a] dark:to-[#200d10] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(15,23,42,0.14)] hover:from-[#ffefef] hover:to-[#fecaca] dark:hover:from-[#3d1d21] dark:hover:to-[#2a1214] active:translate-y-px active:shadow-[inset_0_2px_5px_rgba(220,38,38,0.25)] transition-all duration-150"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="sk-panel w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingSaleId ? "Edit Sale" : "Record a Sale"}
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
                        disabled={
                          product.stock <= 0 && product.id !== editingSale?.productId
                        }
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
                    {availableStock} unit
                    {availableStock === 1 ? "" : "s"} available in stock
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
                    {saving
                      ? editingSaleId
                        ? "Saving..."
                        : "Recording..."
                      : editingSaleId
                        ? "Save Changes"
                        : "Record Sale"}
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