import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockArtistProfile } from "@/lib/mockData";
import { 
  LayoutDashboard, 
  BarChart3, 
  Map, 
  Calendar, 
  TrendingUp,
  MessageCircle,
  MapPin,
  Activity
} from "lucide-react";

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: MapPin, label: "Fan Map", active: false },
  { icon: Calendar, label: "Calendar", active: false },
  { icon: TrendingUp, label: "Trends", active: false },
];

const widgetItems = [
  { icon: "💬", label: "MC Chat Dock", key: "chat" },
  { icon: "🗺️", label: "Fan Heatmap", key: "map" },
  { icon: "📊", label: "Health Monitor", key: "health" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-semibold text-sidebar-foreground">Loop</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2" role="list">
          {navigationItems.map((item, index) => (
            <li key={index}>
              <Button
                variant={item.active ? "default" : "ghost"}
                className={`w-full justify-start ${
                  item.active 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={item.active ? "page" : undefined}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
        
        <div className="mt-8 pt-8 border-t border-sidebar-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Widgets
          </h3>
          <div className="space-y-2">
            {widgetItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                data-widget={item.key}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center space-x-3">
          <img 
            src={mockArtistProfile.avatar}
            alt="Artist profile" 
            className="w-10 h-10 rounded-full" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground">
              {mockArtistProfile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {mockArtistProfile.followers}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
