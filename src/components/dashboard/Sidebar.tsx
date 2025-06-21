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
  Activity,
  Play,
  Hash,
  Target,
  Settings
} from "lucide-react";

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Play, label: "Streaming", active: false },
  { icon: Hash, label: "Social Media", active: false },
  { icon: Target, label: "Growth Plan", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Settings, label: "Integrations", active: false },
];

const widgetItems = [
  { icon: "💬", label: "MC Chat Dock", key: "chat" },
  { icon: "🎵", label: "Streaming Stats", key: "streaming-stats" },
  { icon: "📱", label: "Social Media", key: "social-media" },
  { icon: "🎯", label: "Growth Plan", key: "growth-plan" },
  { icon: "🔗", label: "Platform Status", key: "platform-status" },
];

export default function Sidebar() {
  return (
    <aside
      className="bg-sidebar-background border-r border-sidebar-border flex flex-col items-center"
      style={{
        display: 'flex',
        width: '89px',
        padding: '32px 16px 24px 16px',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '64px',
        boxShadow: '14px 0px 48px 0px rgba(0, 0, 0, 0.15)'
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">L</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav
        style={{
          display: 'flex',
          height: '766px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '39px'
        }}
      >
        <ul className="flex flex-col items-center gap-[39px]" role="list">
          {navigationItems.map((item, index) => (
            <li key={index}>
              <Button
                variant={item.active ? "default" : "ghost"}
                size="icon"
                className={`w-12 h-12 p-0 ${item.active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                aria-current={item.active ? "page" : undefined}
                title={item.label}
              >
                <item.icon className="w-6 h-6" />
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="flex items-center justify-center">
        <img
          src={mockArtistProfile.avatar}
          alt="Artist profile"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </aside>
  );
}
