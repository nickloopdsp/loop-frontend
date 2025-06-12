import { WidgetData } from "@shared/schema";
import { getWidgetComponent } from "@/lib/widgetRegistry";
import { useMemo, useState, useEffect } from "react";

interface DashboardGridProps {
  layout: WidgetData[];
  onLayoutChange: (layout: WidgetData[]) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

export default function DashboardGrid({ 
  layout, 
  onLayoutChange, 
  isDragging, 
  setIsDragging
}: DashboardGridProps) {
  
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg');

  // Handle responsive layout changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('sm');
      } else if (width < 1024) {
        setScreenSize('md');
      } else {
        setScreenSize('lg');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current grid columns
  const getGridCols = () => {
    switch (screenSize) {
      case 'sm': return 4;
      case 'md': return 8;
      case 'lg': return 12;
      default: return 12;
    }
  };

  // Calculate responsive grid span
  const getResponsiveSpan = (originalW: number) => {
    const gridCols = getGridCols();
    const maxCols = 12; // Original design max columns
    
    // Calculate proportional width
    let span = Math.round((originalW / maxCols) * gridCols);
    
    // Ensure minimum span of 1 and maximum of current grid columns
    span = Math.max(1, Math.min(span, gridCols));
    
    return span;
  };
  
  const renderedWidgets = useMemo(() => {
    return layout.map((widget) => {
      const WidgetComponent = getWidgetComponent(widget.type);
      if (!WidgetComponent) return null;
      
      // Calculate responsive spans
      const responsiveW = getResponsiveSpan(widget.w);
      
      // Determine if widget should use compact styling based on size
      const isCompact = responsiveW <= 2 && widget.h <= 4;
      
      // MC Chat widget has its own styling, don't wrap it
      const shouldWrapWithGlass = widget.type !== 'mc-chat';
      
      return (
        <div
          key={widget.id}
          className={`widget-card drag-handle ${isDragging ? 'dragging' : ''} relative`}
          style={{
            gridColumn: `span ${responsiveW}`,
            gridRow: `span ${widget.h}`,
            minHeight: `${widget.h * 120}px`, // Each grid row unit = 120px
          }}
          data-widget-type={widget.type}
          data-widget-size={isCompact ? 'compact' : 'normal'}
        >
          {shouldWrapWithGlass ? (
            <div className={isCompact ? 'glass-widget-compact' : 'glass-widget'}>
              <WidgetComponent />
            </div>
          ) : (
            <WidgetComponent />
          )}
        </div>
      );
    });
  }, [layout, isDragging, screenSize]);

  return (
    <div className="w-full">
      <div 
        className="grid gap-6 w-full grid-cols-4 md:grid-cols-8 lg:grid-cols-12"
        style={{
          gridAutoRows: '120px',
        }}
        id="dashboard-grid"
      >
        {renderedWidgets}
      </div>
    </div>
  );
}
