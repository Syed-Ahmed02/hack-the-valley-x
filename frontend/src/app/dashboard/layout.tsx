"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 w-full">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-sidebar-border bg-background px-4 py-2">
          <SidebarTrigger />
          <div className="flex-1" />
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
