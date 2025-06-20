import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { widgetRegistry, WidgetConfig } from '@/lib/widgetRegistry';
import { Plus } from 'lucide-react';

interface WidgetSelectorProps {
  onWidgetSelect: (widgetType: string) => void;
  existingWidgets: string[];
  children?: React.ReactNode;
}

export default function WidgetSelector({ onWidgetSelect, existingWidgets, children }: WidgetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableWidgets = Object.values(widgetRegistry).filter(
    (widget: WidgetConfig) => {
      const isAlreadyAdded = existingWidgets.includes(widget.id);
      console.log(`Widget ${widget.id}: existing widgets:`, existingWidgets, 'isAlreadyAdded:', isAlreadyAdded);
      return !isAlreadyAdded;
    }
  );

  const handleWidgetSelect = (widgetType: string) => {
    onWidgetSelect(widgetType);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-[#03FF96] border-[#03FF96]/20 hover:bg-[#03FF96]/10"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Widget</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableWidgets.map((widget: WidgetConfig) => (
              <Card 
                key={widget.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-[#03FF96]/50"
                onClick={() => handleWidgetSelect(widget.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">{widget.icon}</div>
                    <Badge variant="secondary" className="text-xs">
                      {widget.defaultSize.w}x{widget.defaultSize.h}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{widget.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {widget.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          {availableWidgets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">🎉</div>
              <p>All available widgets are already added to your dashboard!</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 