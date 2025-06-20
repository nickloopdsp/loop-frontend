import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Bot, 
  LayoutDashboard, 
  Music, 
  Mic, 
  Megaphone, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';

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

interface ModeContextType {
  currentMode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  getCurrentModeConfig: () => Mode;
  showMCAssistTooltip: boolean;
  setShowMCAssistTooltip: (show: boolean) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

interface ModeProviderProps {
  children: ReactNode;
}

export function ModeProvider({ children }: ModeProviderProps) {
  const [currentMode, setCurrentMode] = useState<DashboardMode>('standard');
  const [showMCAssistTooltip, setShowMCAssistTooltip] = useState(false);

  const setMode = useCallback((mode: DashboardMode) => {
    // Only show tooltip when first switching to MC Assist mode
    if (mode === 'mc-assist' && currentMode !== 'mc-assist') {
      setShowMCAssistTooltip(true);
    } else if (mode !== 'mc-assist') {
      setShowMCAssistTooltip(false);
    }
    setCurrentMode(mode);
  }, [currentMode]);

  const getCurrentModeConfig = useCallback(() => {
    return DASHBOARD_MODES.find(mode => mode.id === currentMode) || DASHBOARD_MODES[1];
  }, [currentMode]);

  const value: ModeContextType = {
    currentMode,
    setMode,
    getCurrentModeConfig,
    showMCAssistTooltip,
    setShowMCAssistTooltip,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
} 