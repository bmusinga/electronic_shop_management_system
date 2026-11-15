import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
