"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, Search, X, AlertCircle } from "lucide-react";

const initialProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    category: "Smartphones",
    price: 1199,
    stock: 45,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    category: "Smartphones",
    price: 999,
    stock: 32,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: 'MacBook Pro 14"',
    category: "Laptops",
    price: 1999,
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    name: "Sony WH-1000XM5",
    category: "Audio",
    price: 349,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    name: "AirPods Pro 2",
    category: "Audio",
    price: 249,
    stock: 56,
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    name: "iPad Air",
    category: "Accessories",
    price: 599,
    stock: 0,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
  },
];

const categories = ["Smartphones", "Laptops", "Audio", "Accessories", "Wearables"];

const emptyForm = {
  id: null,
  name: "",
  description: "",
  price: "",
  category: "Smartphones",
  stock: "",
  image: "",
};

function getStockStatus(stock) {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
}

function getStatusBadgeClass(status) {
  if (status === "In Stock") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
  if (status === "Low Stock") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteTarget = products.find((product) => product.id === deleteId);

  function openAddModal() {
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(product) {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image,
    });
    setIsModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.id) {
      setProducts(
        products.map((product) =>
          product.id === form.id
            ? {
                ...product,
                name: form.name,
                description: form.description,
                price: Number(form.price),
                category: form.category,
                stock: Number(form.stock),
                image: form.image,
              }
            : product
        )
      );
    } else {
      setProducts([
        ...products,
        {
          id: Date.now().toString(),
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          stock: Number(form.stock),
          image: form.image,
        },
      ]);
    }
    setIsModalOpen(false);
    setForm(emptyForm);
  }

  function handleDelete() {
    setProducts(products.filter((product) => product.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Manage Products
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Add, edit, or remove products from your inventory
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl sk-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted-light dark:text-text-muted-dark" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sk-input rounded-xl text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-muted-light dark:placeholder-text-muted-dark"
        />
      </div>

      {deleteTarget && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-xl px-4 py-3 mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Delete {deleteTarget.name}? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteId(null)}
              className="px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm font-medium bg-danger text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="sk-panel overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark text-xs uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
              <th className="px-6 py-4 font-semibold">Image</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="text-text-muted-light dark:text-text-muted-dark text-sm">
                    No products found.
                  </p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const status = getStockStatus(product.stock);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border-light dark:border-border-dark last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-slate-700"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
                      {product.name}
                      {product.description && (
                        <span className="block text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5 font-normal">
                          {product.description}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full sk-badge bg-primary-light text-primary dark:bg-blue-900/40 dark:text-blue-300 whitespace-nowrap">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
                      ${product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${getStatusBadgeClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 sk-btn rounded-lg"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-2 text-danger border border-red-300/70 dark:border-red-900/60 rounded-lg bg-gradient-to-b from-[#fff5f5] to-[#fee2e2] dark:from-[#33171a] dark:to-[#200d10] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(15,23,42,0.14)] hover:from-[#ffefef] hover:to-[#fecaca] dark:hover:from-[#3d1d21] dark:hover:to-[#2a1214] active:translate-y-px active:shadow-[inset_0_2px_5px_rgba(220,38,38,0.25)] transition-all duration-150"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg sk-panel rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                {form.id ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 sk-btn rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 sk-input rounded-xl text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-muted-light dark:placeholder-text-muted-dark"
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 sk-input rounded-xl text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-muted-light dark:placeholder-text-muted-dark resize-none"
                  placeholder="Short product description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 sk-input rounded-xl text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-muted-light dark:placeholder-text-muted-dark"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 sk-input rounded-xl text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-muted-light dark:placeholder-text-muted-dark"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                    Category
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 sk-input rounded-xl text-sm text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                    Image URL
                  </label>
                  <input
                    type="text"
                    required
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 sk-input rounded-xl text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-muted-light dark:placeholder-text-muted-dark"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium sk-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium sk-btn-primary"
                >
                  {form.id ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}