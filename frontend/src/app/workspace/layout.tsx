"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Overscroll } from "@/components/workspace/overscroll";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";

const queryClient = new QueryClient();

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        <Overscroll behavior="none" overflow="hidden" />
        <WorkspaceSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
