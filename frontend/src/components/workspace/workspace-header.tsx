"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function WorkspaceHeader({ className }: { className?: string }) {
  const { state } = useSidebar();
  return (
    <div
      className={cn(
        "group/workspace-header flex h-15 flex-col justify-center",
        className,
      )}
    >
      {state === "collapsed" ? (
        <div className="flex w-full cursor-pointer items-center justify-center group-has-data-[collapsible=icon]/sidebar-wrapper:-translate-y-[6px]">
          <h1 className="text-primary block font-serif group-hover/workspace-header:hidden">
            DF
          </h1>
          <SidebarTrigger className="hidden pl-2 group-hover/workspace-header:block" />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-primary ml-2 font-serif">DeerFlow</h1>
          <SidebarTrigger />
        </div>
      )}
    </div>
  );
}
