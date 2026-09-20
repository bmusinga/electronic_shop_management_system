"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

const iconButton =
  "w-10 h-10 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark bg-gradient-to-b from-white to-[#e2e8f0] dark:from-[#2a3a50] dark:to-[#16202f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.18)] active:translate-y-px active:shadow-[inset_0_2px_5px_rgba(15,23,42,0.22)] transition-all duration-150";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-light dark:bg-bg-dark">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((open) => !open);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
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
            className={iconButton}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            {isMobile || sidebarCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}