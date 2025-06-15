import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface CleanupButtonProps {
  onCleanup: () => void;
}

export default function CleanupButton({ onCleanup }: CleanupButtonProps) {
  return (
    <Button
      onClick={onCleanup}
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 
                 border border-orange-500/20 
                 text-orange-400 hover:text-orange-300
                 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-yellow-500/20
                 hover:border-orange-500/30
                 hover:shadow-lg hover:shadow-orange-500/10
                 active:scale-[0.98] active:shadow-inner
                 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30">
          <Trash2 className="h-3.5 w-3.5 text-orange-400" />
        </div>
        <span className="text-sm">Clean Duplicates</span>
      </div>
    </Button>
  );
} 