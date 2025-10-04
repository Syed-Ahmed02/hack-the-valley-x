"use client";

import {
  Plus,
  FileText,
  Upload,
  Moon,
  Sun,
  MessageSquare,
  Clock,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SettingsPanel } from "@/components/settings-panel";

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Recent documents/sessions
  const recentItems = [
    { title: "Computer Science Notes", time: "2 hours ago" },
    { title: "Biology Chapter 5", time: "Yesterday" },
    { title: "Math Formulas", time: "2 days ago" },
    { title: "Physics Lecture", time: "3 days ago" },
    { title: "Chemistry Lab Report", time: "1 week ago" },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-3">
        <Button className="w-full justify-start gap-2" size="default">
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/upload">
                    <Upload className="h-4 w-4" />
                    <span>Upload Materials</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/documents">
                    <FileText className="h-4 w-4" />
                    <span>My Documents</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Recent</p>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild className="h-auto py-2">
                    <a href="#" className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2 w-full">
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate text-sm">{item.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground pl-6">{item.time}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SettingsPanel />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {mounted && (
                <>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-2 px-2 py-3 rounded-lg hover:bg-sidebar-accent cursor-pointer mt-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
            MJ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Mike Johnson</p>
            <p className="text-xs text-muted-foreground">2,450 credits</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
