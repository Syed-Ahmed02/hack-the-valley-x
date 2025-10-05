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
import { useUser } from "@/hooks/useUser";

interface Session {
  id: string;
  title: string;
  target_language: string;
  created_at: string;
  ended_at?: string;
  preview_text?: string;
}

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const { auth0User } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recent sessions when user is available
  useEffect(() => {
    if (auth0User) {
      fetchRecentSessions();
    }
  }, [auth0User]);

  const fetchRecentSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setRecentSessions(data.sessions || []);
      } else {
        console.error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  // Get display text - first 10 characters of transcription or title
  const getDisplayText = (session: Session) => {
    const textToShow = session.preview_text || session.title;
    return textToShow.length > 10 ? textToShow.substring(0, 10) + '...' : textToShow;
  };

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

  // Filter sessions based on search query
  const filteredSessions = recentSessions.filter(session => {
    const searchText = (session.preview_text || session.title).toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  return (
    <Sidebar className={`border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <Button className="flex-1 justify-start gap-2" size="default">
            <Plus className="h-4 w-4" />
            {!isCollapsed && "View your Previous Sessions"}
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
                {isLoadingSessions ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    Loading sessions...
                  </div>
                ) : filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton 
                        className="h-auto py-2 cursor-pointer hover:bg-sidebar-accent"
                        onClick={() => {
                          // Emit custom event to dashboard
                          const event = new CustomEvent('sessionSelect', {
                            detail: { sessionId: session.id }
                          });
                          window.dispatchEvent(event);
                        }}
                      >
                        <div className="flex flex-col items-start gap-1 w-full">
                          <div className="flex items-center gap-2 w-full">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate text-sm">
                              {highlightText(getDisplayText(session), searchQuery)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground pl-6">
                            {formatTimeAgo(session.created_at)}
                          </span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : searchQuery ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    No sessions found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    No recent sessions
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
              {auth0User?.name ? auth0User.name.charAt(0).toUpperCase() : auth0User?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {auth0User?.name || auth0User?.email || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">{auth0User?.email}</p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
