import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import DashboardGrid from "./DashboardGrid";
import MCChatDock from "@/components/chat/MCChatDock";
import { useState } from "react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

export default function DashboardLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const dashboardLayout = useDashboardLayout();

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar onOpenChat={handleOpenChat} />
        <div className="flex-1 overflow-auto p-6">
          <DashboardGrid 
            layout={dashboardLayout.layout}
            onLayoutChange={dashboardLayout.updateLayout}
            isDragging={dashboardLayout.isDragging}
            setIsDragging={dashboardLayout.setIsDragging}
          />
        </div>
      </main>
      <MCChatDock 
        isOpen={isChatOpen} 
        onClose={handleCloseChat}
      />
    </div>
  );
}
