import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
import DashboardGrid from "./DashboardGrid";
import MCChatDock from "@/components/chat/MCChatDock";
import { useState, useRef, useCallback } from "react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useTheme } from "@/providers/ThemeProvider";
import { useMode } from "@/contexts/ModeContext";
import { createWidget } from "@/lib/widgetRegistry";
import { WidgetData } from "@shared/schema";

export default function DashboardLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentMode } = useMode();
  const { layout, updateLayout, addWidget, removeWidget, resetModeLayout, isDragging, setIsDragging } = useDashboardLayout(currentMode);
  const { theme } = useTheme();
  
  // Function to clean up duplicate widgets
  const cleanupDuplicates = useCallback(() => {
    const seen = new Set<string>();
    const cleaned = layout.filter(widget => {
      if (seen.has(widget.type)) {
        console.log('Removing duplicate widget:', widget.type, widget.id);
        return false;
      }
      seen.add(widget.type);
      return true;
    });
    
    if (cleaned.length !== layout.length) {
      console.log('Cleaned up duplicates:', layout.length, '->', cleaned.length);
      updateLayout(cleaned);
    }
  }, [layout, updateLayout]);
  
  // Check if current layout has been customized (differs from default for the mode)
  const hasCustomLayout = useCallback(() => {
    // Get the default layout for current mode from localStorage or check if widgets were added/removed
    const defaultModeLayouts = {
      'standard': ['mc-chat', 'fans', 'followers-activity', 'concerts', 'global-map', 'score', 'top-songs', 'generate-chords', 'stem-separation'],
      'touring': ['mc-chat', 'concerts', 'global-map', 'fans', 'score'],
      'recording': ['mc-chat', 'generate-chords', 'stem-separation', 'concerts', 'top-songs', 'score'],
      'promotion': ['mc-chat', 'fans', 'followers-activity', 'global-map', 'top-songs', 'score'],
      'inspiration': ['mc-chat', 'generate-chords', 'stem-separation', 'top-songs', 'followers-activity', 'concerts'],
      'strategy': ['mc-chat', 'score', 'followers-activity', 'fans', 'top-songs', 'global-map', 'concerts'],
      'mc-assist': ['mc-chat', 'generate-chords', 'stem-separation']
    };
    
    const defaultWidgets = defaultModeLayouts[currentMode as keyof typeof defaultModeLayouts] || [];
    const currentWidgets = layout.map(w => w.type).sort();
    const expectedWidgets = defaultWidgets.sort();
    
    // Check if widget types differ from default
    return JSON.stringify(currentWidgets) !== JSON.stringify(expectedWidgets);
  }, [layout, currentMode]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleAddWidget = (widgetType: string) => {
    console.log('Adding widget:', widgetType, 'to mode:', currentMode); // Debug log
    
    // First, clean up any duplicates
    cleanupDuplicates();
    
    const existingWidgets = layout;
    
    // Check if widget already exists
    const alreadyExists = existingWidgets.some(w => w.type === widgetType);
    if (alreadyExists) {
      console.log('Widget already exists:', widgetType);
      return;
    }
    
    const newWidget = createWidget(widgetType);
    console.log('Created widget:', newWidget); // Debug log
    
    if (newWidget) {
      // Special handling for full-width widgets
      const isFullWidth = ['global-map', 'ai-todo', 'mc-chat', 'concerts'].includes(widgetType);
      
      if (isFullWidth) {
        // Full-width widgets go to the bottom
        const maxY = Math.max(...existingWidgets.map(w => w.y + w.h), 0);
        newWidget.x = 0;
        newWidget.y = maxY;
        newWidget.w = 12;
      } else {
        // For regular widgets, maintain 2-per-row layout (6 columns each)
        newWidget.w = 6; // Always 6 columns for regular widgets
        
        // Find the next available position
        const maxY = Math.max(...existingWidgets.map(w => w.y + w.h), 0);
        
        // Check if we can place it on the last row
        let bestX = 0;
        let bestY = maxY;
        
        // Look for widgets in the last few rows to see if there's space
        const lastRowWidgets = existingWidgets.filter(w => w.y >= maxY - 6); // Check last 6 rows
        
        // Group widgets by their starting row
        const rowOccupancy = new Map<number, number>(); // row -> total width used
        
        lastRowWidgets.forEach(widget => {
          const startRow = widget.y;
          const endX = widget.x + widget.w;
          rowOccupancy.set(startRow, Math.max(rowOccupancy.get(startRow) || 0, endX));
        });
        
        // Try to find a row with space for a 6-column widget
        let foundSpace = false;
        for (let row = Math.max(0, maxY - 6); row <= maxY; row++) {
          const usedWidth = rowOccupancy.get(row) || 0;
          if (usedWidth <= 6) { // Space for one more 6-column widget
            bestX = usedWidth;
            bestY = row;
            foundSpace = true;
            break;
          }
        }
        
        // If no space found in existing rows, place at bottom
        if (!foundSpace) {
          bestX = 0;
          bestY = maxY;
        }
        
        newWidget.x = bestX;
        newWidget.y = bestY;
      }
      
      console.log('Final widget to add:', newWidget); // Debug log
      
      // Use the hook's addWidget function
      addWidget(newWidget);
      
      console.log('Widget added successfully to', currentMode, 'mode'); // Debug log
    }
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
        <AppSidebar 
          onAddWidget={handleAddWidget}
          existingWidgets={layout.map(w => w.type)}
          onCleanupDuplicates={cleanupDuplicates}
          onResetMode={() => resetModeLayout()}
          currentMode={currentMode}
          hasCustomLayout={hasCustomLayout()}
        />
        <SidebarInset className="flex flex-col bg-transparent min-w-0 w-full">
          <TopBar onOpenChat={handleOpenChat} />
          <main className="flex-1 overflow-auto p-6 w-full">
            <DashboardGrid 
              layout={layout}
              onLayoutChange={updateLayout}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onAddWidget={handleAddWidget}
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
