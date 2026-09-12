"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => setSidebarCollapsed(mql.matches);
    const id = setTimeout(() => {
      apply();
      mql.addEventListener("change", apply);
    }, 0);
    return () => {
      clearTimeout(id);
      mql.removeEventListener("change", apply);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-light dark:bg-bg-dark">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main
        className={`min-h-screen p-4 sm:p-6 transition-all duration-300 ${
          sidebarCollapsed ? "ml-[68px]" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}