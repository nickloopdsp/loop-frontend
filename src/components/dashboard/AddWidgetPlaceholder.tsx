import React from 'react';
import { Plus } from 'lucide-react';
import WidgetSelector from './WidgetSelector';

interface AddWidgetPlaceholderProps {
  onAddWidget?: (widgetType: string) => void;
  existingWidgets: string[];
  className?: string;
}

export default function AddWidgetPlaceholder({
  onAddWidget,
  existingWidgets,
  className = ''
}: AddWidgetPlaceholderProps) {
  return (
    <WidgetSelector
      onWidgetSelect={onAddWidget}
      existingWidgets={existingWidgets}
    >
      <div className={`widget-card h-full ${className}`}>
        <div className="h-full w-full flex flex-col items-center justify-center cursor-pointer hover:bg-[#03FF96]/5 rounded-xl transition-all duration-200 border-2 border-dashed border-[#03FF96]/30 hover:border-[#03FF96]/60 backdrop-blur-sm bg-[#03FF96]/[0.02] hover:bg-[#03FF96]/[0.08]">
          <div className="flex flex-col items-center gap-4 text-[#03FF96]/70 hover:text-[#03FF96] transition-colors duration-200">
            <div className="p-6 rounded-full bg-[#03FF96]/10 hover:bg-[#03FF96]/20 transition-colors duration-200">
              <Plus className="h-10 w-10" />
            </div>
            <div className="text-center">
              <div className="font-medium text-base">Add Widget</div>
              <div className="text-sm opacity-75 mt-1">Click to browse widgets</div>
            </div>
          </div>
        </div>
      </div>
    </WidgetSelector>
  );
} 