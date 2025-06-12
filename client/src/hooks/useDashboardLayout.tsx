import { useState, useCallback, useEffect } from "react";
import { WidgetData } from "@shared/schema";
import useLocalStorage from "./useLocalStorage";

const defaultLayout: WidgetData[] = [
  // MC Chat - Full width at top (reduced height)
  { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 12, h: 5, minW: 8, minH: 4 },
  
  // Row 2: Fans and Followers Activity side by side
  { id: "fans", type: "fans", x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
  { id: "followers-activity", type: "followers-activity", x: 6, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
  
  // Row 3: Checklist/Calendar - Full width
  { id: "concerts", type: "concerts", x: 0, y: 10, w: 12, h: 3, minW: 6, minH: 3 },
  
  // Row 4: Global Map - Full width (moved under calendar)
  { id: "global-map", type: "global-map", x: 0, y: 13, w: 12, h: 5, minW: 6, minH: 4 },
  
  // Row 5: Score and Top Songs side by side
  { id: "score", type: "score", x: 0, y: 18, w: 6, h: 4, minW: 3, minH: 3 },
  { id: "top-songs", type: "top-songs", x: 6, y: 18, w: 6, h: 4, minW: 3, minH: 3 },
  
  // Row 6: Music.AI widgets - Generate Chords and Stem Separation
  { id: "generate-chords", type: "generate-chords", x: 0, y: 22, w: 6, h: 4, minW: 3, minH: 3 },
  { id: "stem-separation", type: "stem-separation", x: 6, y: 22, w: 6, h: 4, minW: 3, minH: 3 },
];

// Responsive layouts for different screen sizes
const responsiveLayouts = {
  // Desktop layout (lg: 12 columns)
  lg: defaultLayout,
  
  // Tablet layout (md: 8 columns) - stacked layout
  md: [
    { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 8, h: 5, minW: 6, minH: 4 },
    { id: "fans", type: "fans", x: 0, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
    { id: "followers-activity", type: "followers-activity", x: 4, y: 5, w: 4, h: 5, minW: 3, minH: 4 },
    { id: "concerts", type: "concerts", x: 0, y: 10, w: 8, h: 3, minW: 4, minH: 3 },
    { id: "global-map", type: "global-map", x: 0, y: 13, w: 8, h: 5, minW: 4, minH: 4 },
    { id: "score", type: "score", x: 0, y: 18, w: 4, h: 4, minW: 3, minH: 3 },
    { id: "top-songs", type: "top-songs", x: 4, y: 18, w: 4, h: 4, minW: 3, minH: 3 },
    { id: "generate-chords", type: "generate-chords", x: 0, y: 22, w: 4, h: 4, minW: 3, minH: 3 },
    { id: "stem-separation", type: "stem-separation", x: 4, y: 22, w: 4, h: 4, minW: 3, minH: 3 },
  ],
  
  // Mobile layout (sm: 4 columns) - single column
  sm: [
    { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 4, h: 5, minW: 4, minH: 4 },
    { id: "fans", type: "fans", x: 0, y: 5, w: 4, h: 5, minW: 4, minH: 4 },
    { id: "followers-activity", type: "followers-activity", x: 0, y: 10, w: 4, h: 6, minW: 4, minH: 5 },
    { id: "concerts", type: "concerts", x: 0, y: 16, w: 4, h: 4, minW: 4, minH: 3 },
    { id: "global-map", type: "global-map", x: 0, y: 20, w: 4, h: 6, minW: 4, minH: 5 },
    { id: "score", type: "score", x: 0, y: 26, w: 4, h: 4, minW: 4, minH: 3 },
    { id: "top-songs", type: "top-songs", x: 0, y: 30, w: 4, h: 5, minW: 4, minH: 4 },
    { id: "generate-chords", type: "generate-chords", x: 0, y: 35, w: 4, h: 4, minW: 4, minH: 3 },
    { id: "stem-separation", type: "stem-separation", x: 0, y: 39, w: 4, h: 4, minW: 4, minH: 3 },
  ],
};

export function useDashboardLayout() {
  const [layout, setLayout] = useLocalStorage<WidgetData[]>("loop-dashboard-layout", defaultLayout);
  const [isDragging, setIsDragging] = useState(false);
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

  // Use stored layout for desktop, responsive layouts for smaller screens
  const currentLayout = screenSize === 'lg' ? layout : responsiveLayouts[screenSize];

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
    layout: currentLayout,
    updateLayout,
    addWidget,
    removeWidget,
    resetLayout,
    isDragging,
    setIsDragging,
    screenSize,
  };
}
