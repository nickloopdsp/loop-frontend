import { Button } from "@/components/ui/button";
import { Bell, Sun, Moon, Music } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { ArtistSelector } from "@/components/ArtistSelector";
import useArtistStore from "@/stores/useArtistStore";
import { useState, useRef } from "react";
import ModeSelector from "@/components/ModeSelector";

interface AppLayoutTopBarProps {
  onOpenChat: () => void;
}

export default function AppLayoutTopBar({ onOpenChat }: AppLayoutTopBarProps) {
  const { theme, setTheme } = useTheme();
  const { selectedArtist } = useArtistStore();
  const [isArtistSelectorOpen, setIsArtistSelectorOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className="px-6 py-4 flex-shrink-0"
      role="banner"
    >
      <div className="flex items-center justify-between">
        {/* Mode Selector */}
        <ModeSelector />

        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white dark:hover:text-white light:text-gray-600 light:hover:text-gray-900 rounded-full"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white dark:hover:text-white light:text-gray-600 light:hover:text-gray-900 rounded-full"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </Button>

          {/* User Avatar - shows selected artist or default */}
          <button
            ref={avatarRef}
            onClick={() => setIsArtistSelectorOpen(!isArtistSelectorOpen)}
            className="w-10 h-10 rounded-full overflow-hidden bg-white/10 hover:ring-2 hover:ring-white/30 transition-all cursor-pointer"
          >
            {selectedArtist?.image || selectedArtist?.imageUrl ? (
              <img
                src={selectedArtist.image || selectedArtist.imageUrl}
                alt={selectedArtist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                <Music className="w-5 h-5 text-white" />
              </div>
            )}
          </button>

          {/* Artist Selector Popup */}
          <ArtistSelector
            isOpen={isArtistSelectorOpen}
            onClose={() => setIsArtistSelectorOpen(false)}
            anchorEl={avatarRef.current}
          />
        </div>
      </div>
    </header>
  );
}
