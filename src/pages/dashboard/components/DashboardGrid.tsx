import { WidgetData } from "@/types";
import { getWidgetComponent } from "@/lib/widgetRegistry";
import { useMemo, useState, useEffect } from "react";
import useModeStore from "@/stores/useModeStore";
import MCAssistTooltip from "@/components/MCAssistTooltip";
import AddWidgetPlaceholder from "./AddWidgetPlaceholder";

interface DashboardGridProps {
  layout: WidgetData[];
  onLayoutChange: (layout: WidgetData[]) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  onAddWidget?: (widgetType: string) => void;
}

export default function DashboardGrid({
  layout,
  onLayoutChange,
  isDragging,
  setIsDragging,
  onAddWidget
}: DashboardGridProps) {

  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg');
  const { showMCAssistTooltip, setShowMCAssistTooltip } = useModeStore();

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
            <div className="relative">
              <WidgetComponent />
              {/* Show MC Assist Tooltip for MC Chat widget */}
              {widget.type === 'mc-chat' && showMCAssistTooltip && (
                <MCAssistTooltip
                  isVisible={showMCAssistTooltip}
                  onClose={() => {
                    console.log('Closing MC Assist tooltip'); // Debug log
                    setShowMCAssistTooltip(false);
                  }}
                  onLayoutRecommendation={(layout) => {
                    console.log('Recommended layout:', layout);
                  }}
                />
              )}
            </div>
          )}
        </div>
      );
    });
  }, [layout, isDragging, screenSize]);

  // Add placeholder widgets for empty spaces
  const existingWidgetTypes = layout.map(w => w.type);

  // Check if there's an incomplete row that needs a second widget
  const shouldShowPlaceholder = useMemo(() => {
    if (!onAddWidget) return false;

    // Group widgets by their row positions
    const rowGroups = new Map<number, WidgetData[]>();

    layout.forEach(widget => {
      // For each row this widget occupies
      for (let row = widget.y; row < widget.y + widget.h; row++) {
        if (!rowGroups.has(row)) {
          rowGroups.set(row, []);
        }
        // Only add widget once per row group (avoid duplicates)
        const rowWidgets = rowGroups.get(row)!;
        if (!rowWidgets.find(w => w.id === widget.id)) {
          rowWidgets.push(widget);
        }
      }
    });

    // Check each row to see if it has space for another widget
    for (let [row, widgets] of rowGroups.entries()) {
      let totalWidth = 0;
      let hasFullWidthWidget = false;

      widgets.forEach(widget => {
        totalWidth = Math.max(totalWidth, widget.x + widget.w);
        // Check if this widget is full-width (or close to it)
        if (['global-map', 'ai-todo', 'mc-chat', 'concerts'].includes(widget.type) || widget.w >= 10) {
          hasFullWidthWidget = true;
        }
      });

      // If this row has space for another widget and no full-width widgets
      if (!hasFullWidthWidget && totalWidth <= 6 && totalWidth > 0) {
        return true; // Show placeholder - there's a row with only one widget
      }
    }

    // Also show if there are no widgets at all
    return layout.length === 0;
  }, [layout, onAddWidget]);

  // Find the best position for the placeholder
  const placeholderPosition = useMemo(() => {
    if (!shouldShowPlaceholder) return null;

    if (layout.length === 0) {
      return { x: 0, y: 0, w: 6, h: 4 };
    }

    // Find the row with only one widget
    const rowGroups = new Map<number, WidgetData[]>();

    layout.forEach(widget => {
      for (let row = widget.y; row < widget.y + widget.h; row++) {
        if (!rowGroups.has(row)) {
          rowGroups.set(row, []);
        }
        const rowWidgets = rowGroups.get(row)!;
        if (!rowWidgets.find(w => w.id === widget.id)) {
          rowWidgets.push(widget);
        }
      }
    });

    for (let [row, widgets] of rowGroups.entries()) {
      let maxEndX = 0;
      let hasFullWidthWidget = false;

      widgets.forEach(widget => {
        maxEndX = Math.max(maxEndX, widget.x + widget.w);
        if (['global-map', 'ai-todo', 'mc-chat', 'concerts'].includes(widget.type) || widget.w >= 10) {
          hasFullWidthWidget = true;
        }
      });

      // If this row has space and no full-width widgets
      if (!hasFullWidthWidget && maxEndX <= 6 && maxEndX > 0) {
        return { x: maxEndX, y: row, w: 12 - maxEndX, h: 4 };
      }
    }

    // Fallback: place at the bottom
    const maxY = Math.max(...layout.map(w => w.y + w.h), 0);
    return { x: 0, y: maxY, w: 6, h: 4 };
  }, [layout, shouldShowPlaceholder]);

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
        {shouldShowPlaceholder && placeholderPosition && (
          <div
            style={{
              gridColumn: `span ${getResponsiveSpan(placeholderPosition.w)}`,
              gridRow: `span ${placeholderPosition.h}`,
              minHeight: `${placeholderPosition.h * 120}px`,
            }}
          >
            <AddWidgetPlaceholder
              onAddWidget={onAddWidget}
              existingWidgets={existingWidgetTypes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
