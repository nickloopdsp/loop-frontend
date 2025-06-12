import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import DashboardGrid from "./DashboardGrid";
import MCChatDock from "@/components/chat/MCChatDock";
import { useState } from "react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useTheme } from "@/providers/ThemeProvider";

export default function DashboardLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const dashboardLayout = useDashboardLayout();
  const { theme } = useTheme();

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div 
        className="flex h-screen w-screen overflow-hidden"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(0deg, rgba(15, 15, 15, 0.72) 0%, rgba(15, 15, 15, 0.72) 100%), linear-gradient(165deg, #0F0F0F 8.22%, #0E261C 79.57%, #0C4B31 119.34%)'
            : 'linear-gradient(180deg, #E8E8E8 0%, #D0D0D0 100%)'
        }}
      >
        <AppSidebar />
        <SidebarInset className="flex flex-col bg-transparent min-w-0 w-full">
          <TopBar onOpenChat={handleOpenChat} />
          <main className="flex-1 overflow-auto p-6 w-full">
            <DashboardGrid 
              layout={dashboardLayout.layout}
              onLayoutChange={dashboardLayout.updateLayout}
              isDragging={dashboardLayout.isDragging}
              setIsDragging={dashboardLayout.setIsDragging}
            />
          </main>
        </SidebarInset>
        <MCChatDock 
          isOpen={isChatOpen} 
          onClose={handleCloseChat}
        />
      </div>
    </SidebarProvider>
  );
}
