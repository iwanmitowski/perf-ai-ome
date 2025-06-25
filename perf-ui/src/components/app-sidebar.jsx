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
} from "@/components/ui/sidebar";
import { useAuth0 } from "@auth0/auth0-react";
import { useThreads } from "@/hooks/thread-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";

import {
  MessageCircle,
  Smile,
  MessagesSquare,
  Flame,
  Plus,
  ChevronUp,
} from "lucide-react";
import { useEffect } from "react";
import { useSSEChat } from "@/hooks/use-sse-chat";

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

  const { threads, setThreadId, loadThreads } = useThreads();
  const { loadHistory, newThread } = useSSEChat();

  useEffect(() => {
    loadThreads();
    return loadThreads;
  }, [loadThreads]);

  const selectChat = (threadId) => {
    setThreadId(threadId);
    loadHistory(threadId);
  };

  const newChat = () => {
    newThread();
  };

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
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
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
              {threads.map((item) => (
                <SidebarMenuSubItem key={item.thread_id}>
                  <SidebarMenuButton asChild>
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                        selectChat(item.thread_id);
                      }}
                    >
                      <MessageCircle />
                      <span>{item.summary}</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              ))}
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
                      Login
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
