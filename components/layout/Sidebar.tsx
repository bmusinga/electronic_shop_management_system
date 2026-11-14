"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  ShoppingCart,
  Settings,
  LogOut,
  Sun,
  Moon,
  Zap,
  X,
  type LucideIcon,
} from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const expanded = !collapsed || mobileOpen;

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-gradient-to-b from-[#eef4fb] to-[#d3dfee] dark:from-[#18202e] dark:to-[#0e1622] border border-border-light dark:border-border-dark text-primary dark:text-white shadow-[inset_0_2px_4px_rgba(15,23,42,0.12),inset_0_-1px_0_rgba(255,255,255,0.55)]"
        : "border border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-white hover:bg-gradient-to-b hover:from-white hover:to-[#e2e8f0] dark:hover:from-[#2a3a50] dark:hover:to-[#16202f] hover:border-border-light dark:hover:border-border-dark hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(15,23,42,0.16)]"
    } ${expanded ? "" : "justify-center"}`;

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 bg-gradient-to-b from-white to-[#e8edf3] dark:from-[#24324a] dark:to-[#131c29] border-r border-border-light dark:border-border-dark transition-all duration-300 shadow-[inset_1px_0_0_rgba(255,255,255,0.9),6px_0_14px_rgba(15,23,42,0.12)] dark:shadow-[inset_1px_0_0_rgba(255,255,255,0.05),6px_0_14px_rgba(0,0,0,0.45)] ${
        mobileOpen
          ? "translate-x-0 w-72"
          : "-translate-x-full w-72 md:translate-x-0"
      } ${collapsed ? "md:w-[68px]" : "md:w-64"}`}
    >
      <div className="flex items-center gap-2 h-16 px-4 border-b border-border-light dark:border-border-dark shadow-[0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]">
        <button
          onClick={onClose}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg sk-btn"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        {expanded && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-b from-[#4f8cff] to-[#1f53c7] border border-[#143a8f] rounded-lg flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.35),0_2px_4px_rgba(15,23,42,0.25)]">
              <Zap className="w-4 h-4 text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark [text-shadow:0_1px_0_rgba(255,255,255,0.6)]">
              Voltex
            </span>
          </Link>
        )}
        {!expanded && (
          <div className="w-8 h-8 mx-auto bg-gradient-to-b from-[#4f8cff] to-[#1f53c7] border border-[#143a8f] rounded-lg flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.35),0_2px_4px_rgba(15,23,42,0.25)]">
            <Zap className="w-4 h-4 text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]" />
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1 p-3 mt-2">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(isActive)}
              title={expanded ? undefined : link.label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {expanded && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border-light dark:border-border-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium sk-btn mb-2 ${
            expanded ? "" : "justify-center"
          }`}
        >
          {dark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          {expanded && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={signOut}
          className="flex items-center justify-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-danger border border-red-300/60 dark:border-red-900/60 bg-gradient-to-b from-[#fff5f5] to-[#fee2e2] dark:from-[#2a1518] dark:to-[#1a0b0d] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.14)] hover:from-[#fff0f0] hover:to-[#fecaca] dark:hover:from-[#3a1c20] dark:hover:to-[#220d10] active:translate-y-px active:shadow-[inset_0_2px_5px_rgba(220,38,38,0.25)] transition-all duration-150"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {expanded && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}