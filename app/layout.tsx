import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "EShop - Electronics & Phone Repairs in Juja Farm",
  description:
    "Shop electronics and get fast mobile phone repairs in Juja Farm, Kenya. Phones, laptops, TVs, accessories and trusted repair services.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#eef1f4] text-[#14202a] dark:bg-[#0A1F44] dark:text-[#eaf0f5]">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}