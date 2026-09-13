export function getStockStatus(stock) {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
}

export function getStockBadgeClass(status) {
  if (status === "In Stock") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
  if (status === "Low Stock") {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  }
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}