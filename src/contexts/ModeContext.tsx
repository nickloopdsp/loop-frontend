import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { type ModeStoreType, type DashboardMode, DASHBOARD_MODES } from '@/stores/useModeStore';




const ModeContext = createContext<ModeStoreType | undefined>(undefined);

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

  const value: ModeStoreType = {
    currentMode,
    setMode,
    getCurrentModeConfig,
    showMCAssistTooltip,
    setShowMCAssistTooltip,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}
