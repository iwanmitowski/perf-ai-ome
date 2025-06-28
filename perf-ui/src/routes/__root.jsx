import SidebarLayout from "@/components/shared/SidebarLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/hooks/chat-context";
import { ThreadProvider } from "@/hooks/thread-context";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <SidebarLayout>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </SidebarLayout>
  ),
});
