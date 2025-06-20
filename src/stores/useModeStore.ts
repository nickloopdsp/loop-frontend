import {
    Bot,
    LayoutDashboard,
    Music,
    Mic,
    Megaphone,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import { create } from 'zustand';

export type DashboardMode =
    | 'mc-assist'
    | 'standard'
    | 'recording'
    | 'touring'
    | 'promotion'
    | 'inspiration'
    | 'strategy';

export interface Mode {
    id: DashboardMode;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

export const DASHBOARD_MODES: Mode[] = [
    {
        id: 'mc-assist',
        name: 'MC Assist',
        description: 'Let MC help you choose the best mode',
        icon: Bot
    },
    {
        id: 'standard',
        name: 'Standard Mode',
        description: 'All widgets for complete overview',
        icon: LayoutDashboard
    },
    {
        id: 'recording',
        name: 'Recording Mode',
        description: 'Focus on music creation and production',
        icon: Music
    },
    {
        id: 'touring',
        name: 'Touring Mode',
        description: 'Manage concerts and tour logistics',
        icon: Mic
    },
    {
        id: 'promotion',
        name: 'Promotion Mode',
        description: 'Campaign planning and social media focus',
        icon: Megaphone
    },
    {
        id: 'inspiration',
        name: 'Inspiration Mode',
        description: 'Discovery and creative exploration',
        icon: Sparkles
    },
    {
        id: 'strategy',
        name: 'Strategy Mode',
        description: 'Data analysis and planning',
        icon: TrendingUp
    }
];

export interface ModeStoreType {
    currentMode: DashboardMode;
    setMode: (mode: DashboardMode) => void;
    getCurrentModeConfig: () => Mode;
    showMCAssistTooltip: boolean;
    setShowMCAssistTooltip: (show: boolean) => void;
}

const useModeStore = create<ModeStoreType>((set, get) => ({
    currentMode: 'mc-assist',
    setMode: (mode: DashboardMode) => set({ currentMode: mode }),
    getCurrentModeConfig: () => DASHBOARD_MODES.find(mode => mode.id === get().currentMode)!,
    showMCAssistTooltip: false,
    setShowMCAssistTooltip: (show: boolean) => set({ showMCAssistTooltip: show })
}))

export default useModeStore;