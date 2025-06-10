import { useState, useCallback } from "react";
import { WidgetData } from "@shared/schema";
import useLocalStorage from "./useLocalStorage";

const defaultLayout: WidgetData[] = [
  { id: "health-monitor", type: "health-monitor", x: 0, y: 0, w: 8, h: 6, minW: 6, minH: 4 },
  { id: "trend-tracker", type: "trend-tracker", x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4 },
  { id: "artist-map", type: "artist-map", x: 0, y: 6, w: 6, h: 5, minW: 4, minH: 4 },
  { id: "ai-todo", type: "ai-todo", x: 6, y: 6, w: 6, h: 5, minW: 4, minH: 4 },
];

export function useDashboardLayout() {
  const [layout, setLayout] = useLocalStorage<WidgetData[]>("loop-dashboard-layout", defaultLayout);
  const [isDragging, setIsDragging] = useState(false);

  const updateLayout = useCallback((newLayout: WidgetData[]) => {
    setLayout(newLayout);
  }, [setLayout]);

  const addWidget = useCallback((widget: WidgetData) => {
    setLayout(prev => [...prev, widget]);
  }, [setLayout]);

  const removeWidget = useCallback((widgetId: string) => {
    setLayout(prev => prev.filter(w => w.id !== widgetId));
  }, [setLayout]);

  const resetLayout = useCallback(() => {
    setLayout(defaultLayout);
  }, [setLayout]);

  return {
    layout,
    updateLayout,
    addWidget,
    removeWidget,
    resetLayout,
    isDragging,
    setIsDragging,
  };
}
