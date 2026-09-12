"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import {
  Sun,
  Moon,
  Menu,
  X,
  Zap,
  User,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

const iconButton =
  "w-10 h-10 rounded-lg border border-border-light dark:border-border-dark flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark bg-gradient-to-b from-white to-[#e2e8f0] dark:from-[#2a3a50] dark:to-[#16202f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.18)] active:translate-y-px active:shadow-[inset_0_2px_5px_rgba(15,23,42,0.22)] transition-all duration-150";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggleTheme } = useTheme();
  const pathname = usePathname();

  const linkClass = (isActive) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-gradient-to-b from-[#eef4fb] to-[#d3dfee] dark:from-[#18202e] dark:to-[#0e1622] border border-border-light dark:border-border-dark text-primary dark:text-white shadow-[inset_0_2px_4px_rgba(15,23,42,0.12),inset_0_-1px_0_rgba(255,255,255,0.55)]"
        : "border border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-white hover:bg-gradient-to-b hover:from-white hover:to-[#e2e8f0] dark:hover:from-[#2a3a50] dark:hover:to-[#16202f] hover:border-border-light dark:hover:border-border-dark hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(15,23,42,0.16)]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-white to-[#eef2f7] dark:from-[#24324a] dark:to-[#131c29] border-b border-border-light dark:border-border-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_6px_rgba(15,23,42,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_6px_rgba(0,0,0,0.5)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-b from-[#4f8cff] to-[#1f53c7] border border-[#143a8f] rounded-lg flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.35),0_2px_4px_rgba(15,23,42,0.25)] transition-colors">
              <Zap className="w-5 h-5 text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark [text-shadow:0_1px_0_rgba(255,255,255,0.6)]">
              Voltex
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(pathname === link.href)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={iconButton} aria-label="Toggle theme">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium sk-btn-primary"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden ${iconButton}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="sk-panel p-3 flex flex-col gap-1 mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={linkClass(pathname === link.href)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 mt-1 px-4 py-2.5 rounded-lg text-sm font-medium sk-btn-primary"
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}