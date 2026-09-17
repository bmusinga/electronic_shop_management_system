"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  X,
  AlertCircle,
  Camera,
  ImageIcon,
} from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import {
  addProduct,
  updateProduct,
  removeProduct,
  subscribeToProducts,
} from "@/lib/firestore";
import { getStockStatus, getStockBadgeClass } from "@/lib/stock";
import {
  uploadImageToDrive,
  isDriveConfigured,
  preloadDrive,
  requestDriveAccessToken,
} from "@/lib/drive";

const categories = ["Smartphones", "Laptops", "Audio", "Accessories", "Wearables"];

const MAX_IMAGE_DIMENSION = 1200;
const IMAGE_QUALITY = 0.7;

function processImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(
          1,
          MAX_IMAGE_DIMENSION / Math.max(img.width, img.height)
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("Could not encode the image.")),
          "image/jpeg",
          IMAGE_QUALITY
        );
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const emptyForm = {
  id: null,
  name: "",
  description: "",
  price: "",
  category: "Smartphones",
  stock: "",
  image: "",
};

function toProductData(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    category: form.category,
    stock: Number(form.stock),
    image: form.image.trim(),
  };
}

export default function DashboardProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (items) => {
        setProducts(items);
        setLoading(false);
        setLoadError("");
      },
      () => {
        setLoadError(
          "Could not load products. Make sure the Firestore database is created and read rules are enabled."
        );
        setLoading(false);
      }
    );
    preloadDrive();
    return unsubscribe;
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteTarget = products.find((product) => product.id === deleteId);

  function openAddModal() {
    setForm(emptyForm);
    setFormError("");
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
    setFormError("");
    setIsModalOpen(true);
  }

  function handleImageChange(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (JPG, PNG, or WEBP).");
      return;
    }
    if (!isDriveConfigured()) {
      setFormError(
        "Google Drive is not configured. Set NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID in your .env.local file."
      );
      return;
    }
    setFormError("");
    setUploading(true);
    const tokenPromise = requestDriveAccessToken();
    processImageFile(file)
      .then((blob) =>
        uploadImageToDrive(blob, tokenPromise, `product-${Date.now()}.jpg`)
      )
      .then((uploaded) => {
        setForm((prev) => ({ ...prev, image: uploaded.url }));
      })
      .catch((err) => {
        const msg = err?.message || "";
        if (/access_denied|popup_closed|user aborted|immediate_failed|blocked|popup/i.test(msg)) {
          setFormError(
            "Google sign-in was cancelled or the popup was blocked. Allow popups for this site, then try again."
          );
        } else {
          setFormError(msg || "Could not upload the image to Google Drive.");
        }
      })
      .finally(() => setUploading(false));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const image = form.image.trim();
    if (!image) {
      setFormError("Please upload or take a photo for the product.");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await updateProduct(form.id, toProductData(form));
      } else {
        await addProduct(toProductData(form));
      }
      setIsModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError("Could not save the product. Check your Firestore write rules and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setFormError("");
    try {
      await removeProduct(deleteId);
      setDeleteId(null);
    } catch (err) {
      setLoadError("Could not delete the product. Check your Firestore write rules and try again.");
      setDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
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

      {loadError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{loadError}</p>
        </div>
      )}

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

      <div className="sk-panel overflow-x-auto hidden md:block">
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
                      <ProductImage
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
                        className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${getStockBadgeClass(
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

      <div className="md:hidden space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="sk-panel rounded-xl py-16 text-center">
            <p className="text-text-muted-light dark:text-text-muted-dark text-sm">
              No products found.
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const status = getStockStatus(product.stock);
            return (
              <div key={product.id} className="sk-panel rounded-xl p-4">
                <div className="flex gap-4">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark leading-snug">
                        {product.name}
                      </h3>
                      <span
                        className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${getStockBadgeClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full sk-badge bg-primary-light text-primary dark:bg-blue-900/40 dark:text-blue-300 whitespace-nowrap">
                        {product.category}
                      </span>
                      <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Stock: <span className="font-medium">{product.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium sk-btn rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-danger border border-red-300/70 dark:border-red-900/60 rounded-lg bg-gradient-to-b from-[#fff5f5] to-[#fee2e2] dark:from-[#33171a] dark:to-[#200d10] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(15,23,42,0.14)] active:translate-y-px active:shadow-[inset_0_2px_5px_rgba(220,38,38,0.25)] transition-all duration-150"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
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

            {formError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>
              </div>
            )}

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

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                    Image
                  </label>
                  <div className="flex items-center gap-4">
                    {form.image ? (
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.image}
                          alt="Product preview"
                          className="w-20 h-20 object-cover rounded-xl border border-border-light dark:border-border-dark bg-slate-100 dark:bg-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: "" })}
                          className="absolute -top-2 -right-2 p-1 bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5 text-danger" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 shrink-0 rounded-xl border border-dashed border-border-light dark:border-border-dark flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                        <ImageIcon className="w-6 h-6 text-text-muted-light dark:text-text-muted-dark" />
                      </div>
                    )}
                    <div className="space-y-2">
                      {uploading ? (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                          Uploading to Google Drive...
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              htmlFor="product-image-upload"
                              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium sk-btn rounded-lg"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Upload from Device
                            </label>
                            <input
                              id="product-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleImageChange(e.target.files[0]);
                                e.target.value = "";
                              }}
                            />
                            <label
                              htmlFor="product-image-capture"
                              className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium sk-btn rounded-lg"
                            >
                              <Camera className="w-4 h-4" />
                              Take Photo
                            </label>
                            <input
                              id="product-image-capture"
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => {
                                handleImageChange(e.target.files[0]);
                                e.target.value = "";
                              }}
                            />
                          </div>
                          <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                            JPG, PNG, or WEBP. Images are compressed and stored
                            in Google Drive.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
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
                  disabled={saving}
                  className="px-4 py-2.5 text-sm font-medium sk-btn-primary"
                >
                  {saving ? "Saving..." : form.id ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}