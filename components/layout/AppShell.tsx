"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Suspense, type ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const hideNavbar = isDashboard || pathname === "/login";

  return (
    <>
      {!hideNavbar && (
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      )}
      <div className="flex-1">{children}</div>
      {!isDashboard && pathname !== "/login" && <Footer />}
    </>
  );
}