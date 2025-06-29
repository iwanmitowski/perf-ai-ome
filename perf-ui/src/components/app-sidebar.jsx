import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth0 } from "@auth0/auth0-react";
import { useThreads } from "@/hooks/thread-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";

import {
  MessageCircle,
  Smile,
  MessagesSquare,
  Flame,
  Plus,
  ChevronUp,
  Search,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useNavigate } from "@tanstack/react-router";

const items = [
  {
    title: "Home", // How are you feeling, what is your mood today? etc
    url: "/",
    icon: Smile,
  },
  {
    title: "Search chats",
    url: "#",
    icon: MessagesSquare,
  },
  {
    title: "Scent Feed", // daily news, recommendations
    url: "/feed",
    icon: Flame,
  },
];
{
  /* <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        <Link to="/dashboard" className="[&.active]:font-bold">
          Dashboard
        </Link>{" "}
      </div>
      <hr /> */
}

export function AppSidebar() {
  const { logout, isAuthenticated, loginWithRedirect } = useAuth0();

  const { threads, setThreadId, loadThreads, loading, hasMore, currentQuery } =
    useThreads();
  const { loadHistory, newThread, setMessages } = useChat();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const observer = useRef();
  const lastThreadElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadThreads({ searchQuery: debouncedSearchQuery });
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadThreads, debouncedSearchQuery]
  );

  useEffect(() => {
    loadThreads({ isNewSearch: true, searchQuery: debouncedSearchQuery });
  }, [debouncedSearchQuery]);

  const navigate = useNavigate();

  const selectChat = (threadId) => {
    setThreadId(threadId);
    loadHistory(threadId);
  };

  const newChat = () => {
    newThread();
    setMessages([]);
    navigate({
      to: "/",
    });
  };

  console.log("Current loading state:", loading);
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuSubItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 mb-2">
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
          </div>
          <div className="relative px-3 mb-3">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuSubItem>
                <SidebarMenuButton asChild>
                  <span className="cursor-pointer" onClick={() => newChat()}>
                    <Plus />
                    <span>New Chat</span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuSubItem>
              {threads.map((item, index) => (
                <SidebarMenuSubItem
                  ref={
                    threads.length === index + 1 ? lastThreadElementRef : null
                  }
                  key={item.thread_id}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton asChild>
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            selectChat(item.thread_id);
                          }}
                        >
                          <MessageCircle />
                          <span className="truncate">{item.summary}</span>
                        </span>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      <p>{item.summary}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuSubItem>
              ))}

              {loading && (
                <>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton className="pointer-events-none">
                      <Skeleton className="h-5 w-5 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-800" />
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton className="pointer-events-none">
                      <Skeleton className="h-5 w-5 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-800" />
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton className="pointer-events-none">
                      <Skeleton className="h-5 w-5 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-800" />
                      <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-800" />
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                </>
              )}

              {!loading && threads.length === 0 && (
                <div className="text-center text-sm text-muted-foreground p-4">
                  {currentQuery
                    ? `No results for "${currentQuery}"`
                    : "No chats yet."}
                </div>
              )}

              {!loading && !hasMore && threads.length > 0 && (
                <div className="text-center text-xs text-muted-foreground p-2">
                  You've reached the end.
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem>
                      <a href="/preferences">
                        <span>Preferences</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="cursor-pointer" onClick={logout}>
                        Sign out
                      </span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <span
                      className="cursor-pointer"
                      onClick={loginWithRedirect}
                    >
                      Sign in
                    </span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
