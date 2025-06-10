import { WidgetData } from "@shared/schema";
import ArtistHealthMonitor from "@/components/widgets/ArtistHealthMonitor";
import TrendTracker from "@/components/widgets/TrendTracker";
import ArtistMapTool from "@/components/widgets/ArtistMapTool";
import AITodoCalendar from "@/components/widgets/AITodoCalendar";

export interface WidgetConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  icon: string;
  description: string;
}

export const widgetRegistry: Record<string, WidgetConfig> = {
  "health-monitor": {
    id: "health-monitor",
    name: "Health Monitor",
    component: ArtistHealthMonitor,
    defaultSize: { w: 8, h: 6 },
    minSize: { w: 6, h: 4 },
    icon: "📊",
    description: "Track your performance metrics and growth",
  },
  "trend-tracker": {
    id: "trend-tracker",
    name: "Trend Tracker",
    component: TrendTracker,
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
    icon: "📈",
    description: "Stay updated with trending topics",
  },
  "artist-map": {
    id: "artist-map",
    name: "Fan Heatmap",
    component: ArtistMapTool,
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    icon: "🗺️",
    description: "Visualize your global fan distribution",
  },
  "ai-todo": {
    id: "ai-todo",
    name: "AI To-Do & Calendar",
    component: AITodoCalendar,
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    icon: "📅",
    description: "Manage tasks and schedule with AI assistance",
  },
};

export function getWidgetComponent(type: string) {
  const config = widgetRegistry[type];
  return config ? config.component : null;
}

export function createWidget(type: string, position?: { x: number; y: number }): WidgetData | null {
  const config = widgetRegistry[type];
  if (!config) return null;

  return {
    id: `${type}-${Date.now()}`,
    type,
    x: position?.x || 0,
    y: position?.y || 0,
    w: config.defaultSize.w,
    h: config.defaultSize.h,
    minW: config.minSize.w,
    minH: config.minSize.h,
  };
}
