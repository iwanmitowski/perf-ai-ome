import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThreadProvider } from "@/hooks/thread-context";

export default function SidebarLayout({ children }) {
  return (
    <SidebarProvider>
      <ThreadProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <SidebarTrigger />
          {children}
        </main>
      </ThreadProvider>
    </SidebarProvider>
  );
}
