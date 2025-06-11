import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function SidebarLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
