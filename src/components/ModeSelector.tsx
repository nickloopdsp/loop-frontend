import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useModeStore, { DASHBOARD_MODES, type DashboardMode } from '@/stores/useModeStore';
import { useClickAway } from '@/hooks/useClickAway';

export default function ModeSelector() {
  const { currentMode, setMode, getCurrentModeConfig } = useModeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickAway(dropdownRef, () => setIsOpen(false));

  const currentModeConfig = getCurrentModeConfig();

  const handleModeSelect = (mode: DashboardMode) => {
    setMode(mode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Mode Selector Button - Sleek Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${isOpen
            ? 'bg-white/20 shadow-lg ring-1 ring-white/30'
            : 'bg-white/10 hover:bg-white/15 shadow-md'
          }`}
      >
        {/* Mode Icon with Dynamic Background */}
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${currentModeConfig.id === 'mc-assist'
            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-500/30'
            : currentModeConfig.id === 'standard'
              ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-slate-500/30'
              : currentModeConfig.id === 'recording'
                ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-purple-500/30'
                : currentModeConfig.id === 'touring'
                  ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-green-500/30'
                  : currentModeConfig.id === 'promotion'
                    ? 'bg-gradient-to-br from-orange-400 to-yellow-500 text-white shadow-orange-500/30'
                    : currentModeConfig.id === 'inspiration'
                      ? 'bg-gradient-to-br from-purple-400 to-blue-500 text-white shadow-purple-500/30'
                      : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-blue-500/30'
          } shadow-lg`}>
          <currentModeConfig.icon className="w-4 h-4" />
        </div>

        {/* Mode Name */}
        <div className="flex flex-col items-start min-w-0">
          <div className="text-sm font-semibold text-white/90 truncate max-w-[120px]">
            {currentModeConfig.name}
          </div>
        </div>

        {/* Chevron Icon */}
        <div className={`transition-all duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white/80" />
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </button>

      {/* Dropdown Menu - Sleek Design */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-[340px] rounded-2xl backdrop-blur-xl bg-black/40 border border-white/20 shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="p-3 space-y-1">
            {DASHBOARD_MODES.map((mode, index) => (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left relative overflow-hidden ${currentMode === mode.id
                    ? 'bg-white/15 ring-1 ring-white/30 shadow-lg'
                    : 'hover:bg-white/10 hover:scale-[1.01]'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Mode Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${mode.id === 'mc-assist'
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : mode.id === 'standard'
                      ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-500/30'
                      : mode.id === 'recording'
                        ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                        : mode.id === 'touring'
                          ? 'bg-gradient-to-br from-green-400 to-teal-500 text-white shadow-lg shadow-green-500/30'
                          : mode.id === 'promotion'
                            ? 'bg-gradient-to-br from-orange-400 to-yellow-500 text-white shadow-lg shadow-orange-500/30'
                            : mode.id === 'inspiration'
                              ? 'bg-gradient-to-br from-purple-400 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                  }`}>
                  <mode.icon className="w-5 h-5" />
                </div>

                {/* Mode Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-white group-hover:text-white/95 transition-colors">
                      {mode.name}
                    </div>
                    {currentMode === mode.id && (
                      <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-xs text-white/60 group-hover:text-white/70 leading-relaxed transition-colors">
                    {mode.description}
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </button>
            ))}
          </div>

          {/* Bottom gradient border */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      )}
    </div>
  );
} 