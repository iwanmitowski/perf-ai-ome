import SidebarLayout from "@/components/shared/SidebarLayout";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <SidebarLayout>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        <Link to="/dashboard" className="[&.active]:font-bold">
          Dashboard
        </Link>{" "}
      </div>
      <hr />
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </SidebarLayout>
  ),
});
