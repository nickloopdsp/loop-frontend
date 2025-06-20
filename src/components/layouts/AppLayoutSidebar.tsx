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
import { Plus, RotateCcw } from "lucide-react";
import { DashboardIcon, DiscoverIcon, LoopIcon, MCIcon, SocialsIcon } from "../icons";

const navigationItems = [
    { icon: DashboardIcon, label: "Dashboard", active: true },
    { icon: DiscoverIcon, label: "Discover", active: false },
    { icon: SocialsIcon, label: "Socials", active: false },
    { icon: MCIcon, label: "MC", active: false },
];

export interface AppLayoutSidebarProps {
    onAddWidget?: (widgetType: string) => void;
    existingWidgets?: string[];
    onCleanupDuplicates?: () => void;
    onResetMode?: () => void;
    currentMode?: string;
    hasCustomLayout?: boolean;
}

export const AppLayoutSidebar: React.FC<AppLayoutSidebarProps> = ({ onAddWidget, existingWidgets = [], onCleanupDuplicates, onResetMode, currentMode, hasCustomLayout }) => {
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