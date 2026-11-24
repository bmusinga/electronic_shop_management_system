import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
