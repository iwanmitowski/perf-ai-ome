import { AppSidebar } from "@/components/app-sidebar";
import { useRouterState } from "@tanstack/react-router";

export default function SidebarLayout({ children }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideSidebar = pathname === "/perf-ai-ome";

  return (
    <>
      {!hideSidebar && <AppSidebar />}
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
