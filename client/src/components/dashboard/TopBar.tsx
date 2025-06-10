import { Button } from "@/components/ui/button";
import { Search, Bell } from "lucide-react";

interface TopBarProps {
  onOpenChat: () => void;
}

export default function TopBar({ onOpenChat }: TopBarProps) {
  return (
    <header className="bg-sidebar-background border-b border-sidebar-border px-6 py-4" role="banner">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Artist Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, Alex! Here's your performance overview.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button 
            onClick={onOpenChat}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            MC Assistant
          </Button>
        </div>
      </div>
    </header>
  );
}
