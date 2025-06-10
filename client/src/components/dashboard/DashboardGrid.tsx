import { WidgetData } from "@shared/schema";
import { getWidgetComponent } from "@/lib/widgetRegistry";
import { useMemo } from "react";

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
  
  const renderedWidgets = useMemo(() => {
    return layout.map((widget) => {
      const WidgetComponent = getWidgetComponent(widget.type);
      if (!WidgetComponent) return null;

      return (
        <div
          key={widget.id}
          className={`widget-card drag-handle ${isDragging ? 'dragging' : ''}`}
          style={{
            gridColumn: `span ${widget.w}`,
            gridRow: `span ${widget.h}`,
          }}
        >
          <WidgetComponent />
        </div>
      );
    });
  }, [layout, isDragging]);

  return (
    <div 
      className="grid grid-cols-12 gap-6 auto-rows-max"
      id="dashboard-grid"
    >
      {renderedWidgets}
    </div>
  );
}
