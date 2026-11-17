"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

const pageMeta: Record<
  string,
  { title: string; subtitle: string; mobileSubtitle?: string }
> = {
  "/dashboard": {
    title: "Overview",
    subtitle: "Welcome back. Here's what's happening with your store.",
    mobileSubtitle: "Welcome Back",
  },
  "/dashboard/products": {
    title: "Manage Products",
    subtitle: "Add, edit, or remove products",
  },
  "/dashboard/sales": {
    title: "Sales",
    subtitle: "Record new sales.",
  },
  "/dashboard/settings": {
    title: "Settings",
    subtitle: "Manage your account and store preferences",
  },
};

const iconButton =
  "w-10 h-10 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark bg-gradient-to-b from-white to-[#e2e8f0] dark:from-[#2a3a50] dark:to-[#16202f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.18)] active:translate-y-px active:shadow-[inset_0_2px_5px_rgba(15,23,42,0.22)] transition-all duration-150";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setIsMobile(mql.matches);
      if (!mql.matches) setMobileOpen(false);
    };
    const id: ReturnType<typeof setTimeout> = setTimeout(() => {
      apply();
      mql.addEventListener("change", apply);
    }, 0);
    return () => {
      clearTimeout(id);
      mql.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((open) => !open);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  };

  const meta = pageMeta[pathname] ?? { title: "Dashboard", subtitle: "" };
  const mobileToggleClass = mobileOpen
    ? "w-10 h-10 flex items-center justify-center rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm"
    : iconButton;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-[68px]" : "md:ml-64"
        }`}
      >
        <header className="sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur border-b border-border-light dark:border-border-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <button
            onClick={toggleSidebar}
            className={`${mobileToggleClass} md:hidden`}
            aria-label={mobileOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={mobileOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="min-w-0 ml-3 md:ml-0">
            <h1 className="truncate text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {meta.title}
            </h1>
            {meta.subtitle && (
              <p className="truncate text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {meta.mobileSubtitle && (
                  <span className="md:hidden">{meta.mobileSubtitle}</span>
                )}
                <span className={meta.mobileSubtitle ? "hidden md:inline" : ""}>
                  {meta.subtitle}
                </span>
              </p>
            )}
          </div>
          <div className="ml-auto hidden shrink-0 rounded-lg sk-panel-inset px-3 py-1.5 text-sm text-text-secondary-light dark:text-text-secondary-dark md:block">
            {today}
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
