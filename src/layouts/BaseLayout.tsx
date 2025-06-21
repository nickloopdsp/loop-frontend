import AppLayoutSidebar from "@/layouts/AppLayoutSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTheme } from "@/providers/ThemeProvider";
import MCChatDock from "@/components/chat/MCChatDock";
import { Outlet } from "react-router-dom";

export interface IBaseLayoutProps extends React.PropsWithChildren {
    Sidebar?: React.ElementType;
    Header?: React.ElementType;
    Footer?: React.ElementType;
}

export const BaseLayout: React.FC<IBaseLayoutProps> = ({ children, Sidebar, Header, Footer }) => {
    const { theme } = useTheme();
    return (
        <SidebarProvider defaultOpen={true}>
            <div
                className="flex h-screen w-screen overflow-hidden"
                style={{
                    background: theme === 'dark'
                        ? 'linear-gradient(0deg, rgba(15, 15, 15, 0.72) 0%, rgba(15, 15, 15, 0.72) 100%), linear-gradient(165deg, #0F0F0F 8.22%, #0E261C 79.57%, #0C4B31 119.34%)'
                        : 'linear-gradient(180deg, #E8E8E8 0%, #D0D0D0 100%)'
                }}
            >
                {Sidebar ? <Sidebar /> : <AppLayoutSidebar
                    onAddWidget={() => { }}
                    existingWidgets={[]}
                    onCleanupDuplicates={() => { }}
                    onResetMode={() => { }}
                    currentMode={''}
                    hasCustomLayout={false}
                />}
                <SidebarInset className="flex flex-col bg-transparent min-w-0 w-full">

                    <Outlet />

                </SidebarInset>
                <MCChatDock
                    isOpen={false}
                    onClose={() => { }}
                />
            </div>
        </SidebarProvider>
    )
}