import Link from "next/link";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

const categories = ["Smartphones", "Laptops", "Audio", "Accessories", "Wearables"];

const contactItems = [
  { icon: MapPin, text: "123 Electronics Ave, Tech City, TC 10001" },
  { icon: Phone, text: "+1 (555) 123-4567" },
  { icon: Mail, text: "info@voltex.com" },
];

const embossedHeading =
  "text-sm font-semibold uppercase tracking-wider mb-4 text-maroon-cream [text-shadow:0_1px_1px_rgba(0,0,0,0.5)]";

const footerLink =
  "text-sm text-maroon-cream-dim hover:text-maroon-cream transition-all duration-200 hover:[text-shadow:0_0_8px_rgba(255,235,210,0.45)]";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#8F2424] via-[#701515] to-[#571010] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-b from-[#4f8cff] to-[#1f53c7] border border-[#143a8f] rounded-lg flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.35),0_2px_5px_rgba(0,0,0,0.45)]">
                <Zap className="w-5 h-5 text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-maroon-cream [text-shadow:0_1px_1px_rgba(0,0,0,0.5)]">
                Voltex
              </span>
            </Link>
            <p className="text-sm text-maroon-cream-dim leading-relaxed [text-shadow:0_1px_1px_rgba(0,0,0,0.35)]">
              Your trusted partner for premium electronics. Quality products,
              competitive prices, and expert support.
            </p>
          </div>

          <div>
            <h3 className={embossedHeading}>Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={embossedHeading}>Categories</h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link href="/products" className={footerLink}>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={embossedHeading}>Contact Info</h3>
            <ul className="space-y-3">
              {contactItems.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-3 text-sm text-maroon-cream-dim [text-shadow:0_1px_1px_rgba(0,0,0,0.35)]"
                >
                  <div className="mt-0.5 w-8 h-8 flex-shrink-0 rounded-full bg-black/20 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.3)]">
                    <Icon className="w-4 h-4 text-maroon-cream" />
                  </div>
                  <span className="leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-black/15 border-t border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-center text-maroon-cream-dim [text-shadow:0_1px_1px_rgba(0,0,0,0.4)]">
            &copy; {new Date().getFullYear()} Voltex Electronics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}