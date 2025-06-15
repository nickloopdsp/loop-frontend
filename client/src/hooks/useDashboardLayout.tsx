import { useState, useCallback, useEffect } from "react";
import { WidgetData } from "../../shared/schema";
import useLocalStorage from "./useLocalStorage";
import { DashboardMode } from "@/contexts/ModeContext";

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

// Mode-specific layouts
const modeLayouts: Record<DashboardMode, WidgetData[]> = {
  // MC Assist Mode - Focus on AI tools and chat
  'mc-assist': [
    { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 12, h: 6, minW: 8, minH: 4 },
    { id: "generate-chords", type: "generate-chords", x: 0, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "stem-separation", type: "stem-separation", x: 6, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
  ],

  // Standard Mode - Current complete layout
  'standard': defaultLayout,

  // Recording Mode - Focus on music creation
  'recording': [
    { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 12, h: 5, minW: 8, minH: 4 },
    { id: "generate-chords", type: "generate-chords", x: 0, y: 5, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "stem-separation", type: "stem-separation", x: 6, y: 5, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "concerts", type: "concerts", x: 0, y: 9, w: 12, h: 3, minW: 6, minH: 3 },
    { id: "top-songs", type: "top-songs", x: 0, y: 12, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "score", type: "score", x: 6, y: 12, w: 6, h: 4, minW: 3, minH: 3 },
  ],

  // Touring Mode - Focus on concerts and logistics
  'touring': [
    { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 12, h: 5, minW: 8, minH: 4 },
    { id: "concerts", type: "concerts", x: 0, y: 5, w: 12, h: 3, minW: 6, minH: 3 },
    { id: "global-map", type: "global-map", x: 0, y: 8, w: 12, h: 5, minW: 6, minH: 4 },
    { id: "fans", type: "fans", x: 0, y: 13, w: 6, h: 5, minW: 4, minH: 4 },
    { id: "score", type: "score", x: 6, y: 13, w: 6, h: 5, minW: 3, minH: 3 },
  ],

  // Promotion Mode - Focus on social media and fan engagement
  'promotion': [
    { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 12, h: 5, minW: 8, minH: 4 },
    { id: "fans", type: "fans", x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { id: "followers-activity", type: "followers-activity", x: 6, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { id: "global-map", type: "global-map", x: 0, y: 10, w: 12, h: 5, minW: 6, minH: 4 },
    { id: "top-songs", type: "top-songs", x: 0, y: 15, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "score", type: "score", x: 6, y: 15, w: 6, h: 4, minW: 3, minH: 3 },
  ],

  // Inspiration Mode - Focus on discovery and creativity
  'inspiration': [
    { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 12, h: 5, minW: 8, minH: 4 },
    { id: "generate-chords", type: "generate-chords", x: 0, y: 5, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "stem-separation", type: "stem-separation", x: 6, y: 5, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "top-songs", type: "top-songs", x: 0, y: 9, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "followers-activity", type: "followers-activity", x: 6, y: 9, w: 6, h: 4, minW: 4, minH: 4 },
    { id: "concerts", type: "concerts", x: 0, y: 13, w: 12, h: 3, minW: 6, minH: 3 },
  ],

  // Strategy Mode - Focus on data analysis and planning
  'strategy': [
    { id: "mc-chat", type: "mc-chat", x: 0, y: 0, w: 12, h: 5, minW: 8, minH: 4 },
    { id: "score", type: "score", x: 0, y: 5, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "followers-activity", type: "followers-activity", x: 6, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { id: "fans", type: "fans", x: 0, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
    { id: "top-songs", type: "top-songs", x: 6, y: 10, w: 6, h: 4, minW: 3, minH: 3 },
    { id: "global-map", type: "global-map", x: 0, y: 14, w: 12, h: 5, minW: 6, minH: 4 },
    { id: "concerts", type: "concerts", x: 0, y: 19, w: 12, h: 3, minW: 6, minH: 3 },
  ],
};

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

export function useDashboardLayout(mode?: DashboardMode) {
  const [layout, setLayout] = useLocalStorage<WidgetData[]>("loop-dashboard-layout", defaultLayout);
  const [customLayouts, setCustomLayouts] = useLocalStorage<Record<string, WidgetData[]>>("loop-custom-layouts", {});
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

  // Get layout based on mode or use stored layout for standard mode
  const getModeLayout = useCallback(() => {
    if (mode && mode !== 'standard') {
      // Check if we have a custom layout for this mode, otherwise use default
      return customLayouts[mode] || modeLayouts[mode] || defaultLayout;
    }
    return layout;
  }, [mode, layout, customLayouts]);

  // Use mode layout for desktop, responsive layouts for smaller screens
  const currentLayout = screenSize === 'lg' ? getModeLayout() : responsiveLayouts[screenSize];

  const updateLayout = useCallback((newLayout: WidgetData[]) => {
    if (mode && mode !== 'standard') {
      // Save mode-specific custom layout
      setCustomLayouts(prev => ({ ...prev, [mode]: newLayout }));
    } else {
      setLayout(newLayout);
    }
  }, [setLayout, setCustomLayouts, mode]);

  const addWidget = useCallback((widget: WidgetData) => {
    const currentWidgets = currentLayout;
    const newLayout = [...currentWidgets, widget];
    
    if (mode && mode !== 'standard') {
      // Save to mode-specific custom layout
      setCustomLayouts(prev => ({ ...prev, [mode]: newLayout }));
    } else {
      setLayout(newLayout);
    }
  }, [mode, currentLayout, setLayout, setCustomLayouts]);

  const removeWidget = useCallback((widgetId: string) => {
    const filteredLayout = currentLayout.filter(w => w.id !== widgetId);
    
    if (mode && mode !== 'standard') {
      // Save to mode-specific custom layout
      setCustomLayouts(prev => ({ ...prev, [mode]: filteredLayout }));
    } else {
      setLayout(filteredLayout);
    }
  }, [mode, currentLayout, setLayout, setCustomLayouts]);

  const resetLayout = useCallback(() => {
    setLayout(defaultLayout);
  }, [setLayout]);

  const resetModeLayout = useCallback((targetMode?: DashboardMode) => {
    const modeToReset = targetMode || mode;
    if (modeToReset === 'standard') {
      // Reset standard mode to default layout
      setLayout(defaultLayout);
    } else if (modeToReset) {
      // Remove the custom layout for this mode, falling back to default mode layout
      setCustomLayouts(prev => {
        const updated = { ...prev };
        delete updated[modeToReset];
        return updated;
      });
    }
  }, [mode, setLayout, setCustomLayouts]);

  return {
    layout: currentLayout,
    updateLayout,
    addWidget,
    removeWidget,
    resetLayout,
    resetModeLayout,
    isDragging,
    setIsDragging,
    screenSize,
  };
}
