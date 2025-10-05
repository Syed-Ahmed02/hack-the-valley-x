"use client";

import {
  Plus,
  FileText,
  Upload,
  Moon,
  Sun,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Function to highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-blue-600 text-white px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Filter items based on search query
  const filteredItems = recentItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar className={`border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <Button className="flex-1 justify-start gap-2" size="default">
            <Plus className="h-4 w-4" />
            {!isCollapsed && "New Session"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      {!isCollapsed && (
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
          {/* Search Input */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search recent items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">Recent</p>
          </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild className="h-auto py-2">
                      <a href="#" className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 w-full">
                          <MessageSquare className="h-4 w-4 shrink-0" />
                          <span className="truncate text-sm">
                            {highlightText(item.title, searchQuery)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground pl-6">{item.time}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {filteredItems.length === 0 && searchQuery && (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    No items found for "{searchQuery}"
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      )}

      {!isCollapsed && (
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
      )}
    </Sidebar>
  );
}
