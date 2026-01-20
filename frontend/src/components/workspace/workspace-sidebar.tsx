"use client";

import { SettingsIcon } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useI18n } from "@/core/i18n/hooks";

import { RecentChatList } from "./recent-chat-list";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceNavMenu } from "./workspace-nav-menu";

export function WorkspaceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { t } = useI18n();
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader className="py-0">
        <WorkspaceHeader />
      </SidebarHeader>
      <SidebarContent>
        <WorkspaceNavMenu />
        <RecentChatList />
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="text-muted-foreground cursor-pointer">
                    <SettingsIcon size={16} />
                    <span>{t.common.settings}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
