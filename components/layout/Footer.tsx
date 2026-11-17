"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

const links = [
  { href: "/products", label: "All Products" },
  { href: "/products?category=Phones", label: "Phones" },
  { href: "/products?category=Laptops", label: "Laptops" },
  { href: "/#repair", label: "Repairs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/repairs", label: "Book a Repair" },
];

export default function Footer() {
  const { dark } = useTheme();
  return (
    <footer className="text-white">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`w-full ${dark ? "bg-[#0A1F44]" : "bg-[#173f52]"} hover:bg-[#1d4a60] py-3 text-center text-sm font-medium transition-colors`}
      >
        Back to top
      </button>
      <div className="bg-[#0b1218] px-4 pt-8 pb-6 text-center">
        <nav className="flex flex-wrap justify-center gap-x-9 gap-y-2 text-sm" aria-label="Footer">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-white hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4 text-xs text-gray-300">
          Juja Farm, Kenya <span className="mx-2">|</span>
          <a href="tel:+254700000000" className="hover:underline">07XX XXX XXX</a>
          <span className="mx-2">|</span>
          <a href="mailto:hello@eshop.co.ke" className="hover:underline">hello@eshop.co.ke</a>
        </p>
        <p className="mt-6 text-xs text-gray-300">
          &copy; {new Date().getFullYear()} EShop, Juja Farm. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
