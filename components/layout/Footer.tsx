import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f2e3d] text-white mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-2xl font-bold">E<span className="text-[#ff7a1a]">Shop</span></div>
          <p className="text-sm text-white/75 mt-2">Electronics sales and mobile phone repairs in Juja Farm, Kenya.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Shop</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/products" className="hover:text-[#ff7a1a]">All Products</Link></li>
            <li><Link href="/products?category=Phones" className="hover:text-[#ff7a1a]">Phones</Link></li>
            <li><Link href="/products?category=Laptops" className="hover:text-[#ff7a1a]">Laptops</Link></li>
            <li><Link href="/#repair" className="hover:text-[#ff7a1a]">Repairs</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Company</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/about" className="hover:text-[#ff7a1a]">About</Link></li>
            <li><Link href="/contact" className="hover:text-[#ff7a1a]">Contact</Link></li>
            <li><Link href="/repairs" className="hover:text-[#ff7a1a]">Book a Repair</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Contact</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 text-[#ff7a1a]" /> Juja Farm, Kenya</li>
            <li className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 text-[#ff7a1a]" /> <a href="tel:+254700000000" className="hover:text-[#ff7a1a]">07XX XXX XXX</a></li>
            <li className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 text-[#ff7a1a]" /> <a href="mailto:hello@eshop.co.ke" className="hover:text-[#ff7a1a]">hello@eshop.co.ke</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} EShop, Juja Farm. All rights reserved.
      </div>
    </footer>
  );
}