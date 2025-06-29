import SidebarLayout from "@/components/shared/SidebarLayout";
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
