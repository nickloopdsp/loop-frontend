import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { mockArtistProfile } from "@/lib/mockData";
import { useEffect } from "react";
import WidgetSelector from "../components/dashboard/WidgetSelector";
import CleanupButton from "./components/CleanupButton";
import { Plus, RotateCcw } from "lucide-react";
import { DashboardIcon, DiscoverIcon, SocialsIcon, MCIcon, LoopIcon } from "@/components/icons";

const navigationItems = [
  { icon: DashboardIcon, label: "Dashboard", active: true },
  { icon: DiscoverIcon, label: "Discover", active: false },
  { icon: SocialsIcon, label: "Socials", active: false },
  { icon: MCIcon, label: "MC", active: false },
];

interface AppLayoutSidebarProps {
  onAddWidget?: (widgetType: string) => void;
  existingWidgets?: string[];
  onCleanupDuplicates?: () => void;
  onResetMode?: () => void;
  currentMode?: string;
  hasCustomLayout?: boolean;
}

export default function AppLayoutSidebar({ onAddWidget, existingWidgets = [], onCleanupDuplicates, onResetMode, currentMode, hasCustomLayout }: AppLayoutSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Force complete transparency on mount
  useEffect(() => {
    const forceTransparency = () => {
      // Target all sidebar-related elements
      const sidebarElements = document.querySelectorAll('[data-sidebar], .group\\/sidebar-wrapper, [class*="bg-sidebar"], .group[data-variant="sidebar"], [data-side="left"]');
      sidebarElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.background = 'transparent';
          el.style.backgroundColor = 'transparent';
          el.style.border = 'none';
          el.style.borderWidth = '0';
          el.style.borderColor = 'transparent';
        }
      });
    };

    // Apply immediately and after a short delay to catch any dynamic elements
    forceTransparency();
    setTimeout(forceTransparency, 100);
  }, []);

  return (
    <Sidebar
      collapsible="icon"
      className="border-0 border-none [&_[data-sidebar='sidebar']]:bg-transparent [&_[data-sidebar='sidebar']]:!bg-transparent [&_[data-sidebar='sidebar']]:border-0"
      style={{
        // Force complete transparency
        background: 'transparent',
        backgroundColor: 'transparent',
        border: 'none',
      }}
    >
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          {/* Loop Logo with overlapping circles */}
          <div className="flex items-center justify-center flex-shrink-0">
            <LoopIcon className="w-8 h-8 text-[#03FF96]" />
          </div>
          {/* Loop text - only show when expanded */}
          {!isCollapsed && (
            <span className="text-[#03FF96] font-semibold text-xl">Loop</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6">
        <SidebarMenu className="gap-3">
          {navigationItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                isActive={item.active}
                size="lg"
                className={`w-full justify-start gap-4 px-4 py-3 rounded-xl transition-all text-base ${item.active
                  ? 'bg-[#03FF96] text-black hover:bg-[#03FF96]/90 font-medium'
                  : 'text-[#03FF96] hover:bg-[#03FF96]/10 hover:text-[#03FF96] dark:text-[#03FF96] light:text-[#047C4B]'
                  } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-base">{item.label}</span>}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Add Widget Section */}
        <div className="mt-6 pt-6 border-t border-[#03FF96]/20">
          <SidebarMenuItem>
            <WidgetSelector
              onWidgetSelect={(widgetType) => {
                if (onAddWidget) {
                  onAddWidget(widgetType);
                }
              }}
              existingWidgets={existingWidgets}
            >
              <SidebarMenuButton
                size="lg"
                className={`w-full justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-base font-medium
                           bg-gradient-to-r from-[#03FF96]/10 to-emerald-400/10 
                           border border-[#03FF96]/20 
                           text-[#03FF96] hover:text-emerald-300
                           hover:bg-gradient-to-r hover:from-[#03FF96]/20 hover:to-emerald-400/20
                           hover:border-[#03FF96]/30
                           hover:shadow-lg hover:shadow-[#03FF96]/10
                           active:scale-[0.98] active:shadow-inner
                           backdrop-blur-sm
                           relative overflow-hidden
                           before:absolute before:inset-0 before:bg-gradient-to-r 
                           before:from-transparent before:via-white/20 before:to-transparent
                           before:translate-x-[-100%] before:skew-x-12
                           hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out ${isCollapsed ? 'justify-center' : ''
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-1.5 rounded-lg bg-[#03FF96]/20 border border-[#03FF96]/30 flex-shrink-0">
                    <Plus className="h-4 w-4 text-[#03FF96]" />
                  </div>
                  {!isCollapsed && <span className="text-base">Add Widget</span>}
                </div>
              </SidebarMenuButton>
            </WidgetSelector>
          </SidebarMenuItem>

          {/* Cleanup Button - only show if there are duplicates */}
          {onCleanupDuplicates && existingWidgets.length > new Set(existingWidgets).size && (
            <SidebarMenuItem className="mt-2">
              <CleanupButton onCleanup={onCleanupDuplicates} />
            </SidebarMenuItem>
          )}

          {/* Reset Mode Button - show when user has customized the layout */}
          {onResetMode && currentMode && hasCustomLayout && (
            <SidebarMenuItem className="mt-2">
              <SidebarMenuButton
                onClick={onResetMode}
                size="lg"
                className={`w-full justify-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-base
                           bg-gradient-to-r from-red-500/10 to-orange-500/10 
                           border border-red-500/20 
                           text-red-400 hover:text-red-300
                           hover:bg-gradient-to-r hover:from-red-500/20 hover:to-orange-500/20
                           hover:border-red-500/30
                           hover:shadow-lg hover:shadow-red-500/10
                           active:scale-[0.98] active:shadow-inner
                           backdrop-blur-sm font-medium ${isCollapsed ? 'justify-center' : ''
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 flex-shrink-0">
                    <RotateCcw className="h-4 w-4 text-red-400" />
                  </div>
                  {!isCollapsed && <span className="text-base">Reset {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}</span>}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-6">
        {/* Toggle Button with K - positioned at bottom, always visible */}
        <div className="flex justify-start">
          <SidebarTrigger className="w-10 h-10 glass-button text-white rounded-xl flex items-center justify-center transition-all duration-200 font-medium shrink-0">
            <span className="text-sm font-bold">K</span>
          </SidebarTrigger>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
} 