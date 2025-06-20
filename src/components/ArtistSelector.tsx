import React, { useState, useEffect, useRef } from 'react';
import { Search, Music, CheckCircle, X, User, LogOut } from 'lucide-react';
import { soundchartsClient } from '@/lib/soundcharts';
import { useArtist } from '@/contexts/ArtistContext';
import { cn } from '@/lib/utils';

interface ArtistSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

interface SearchResult {
  uuid: string;
  name: string;
  image?: string;
  imageUrl?: string;
  verified?: boolean;
  genres?: string[];
  country?: string;
}

export const ArtistSelector: React.FC<ArtistSelectorProps> = ({ isOpen, onClose, anchorEl }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const { selectedArtist, selectArtist, clearArtist } = useArtist();

  // Calculate popup position
  const [position, setPosition] = useState({ top: 0, right: 0 });
  
  useEffect(() => {
    if (anchorEl && isOpen) {
      const rect = anchorEl.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [anchorEl, isOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) && 
          anchorEl && !anchorEl.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorEl]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await soundchartsClient.searchArtists(query);
          // Transform the response to handle both image and imageUrl fields
          const transformedResults = response.items.map(item => ({
            ...item,
            image: item.image || item.imageUrl
          }));
          setResults(transformedResults);
        } catch (err) {
          setError('Failed to search artists');
          console.error('Search error:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectArtist = (artist: SearchResult) => {
    // Ensure we have the correct image property
    const artistWithImage = {
      ...artist,
      image: artist.image || artist.imageUrl
    };
    selectArtist(artistWithImage);
    setQuery('');
    onClose();
  };

  const handleClearArtist = () => {
    clearArtist();
    setQuery('');
    setResults([]);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className="fixed z-50 w-96 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Artist Profile
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Artist or Search */}
        {selectedArtist ? (
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {selectedArtist.image ? (
                    <img
                      src={selectedArtist.image}
                      alt={selectedArtist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Music className="w-8 h-8 text-white/60" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      {selectedArtist.name}
                      {selectedArtist.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </h4>
                    {selectedArtist.genres && selectedArtist.genres.length > 0 && (
                      <p className="text-white/60 text-sm">
                        {selectedArtist.genres.slice(0, 2).join(', ')}
                      </p>
                    )}
                    {selectedArtist.country && (
                      <p className="text-white/60 text-xs mt-1">
                        {selectedArtist.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearArtist}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Switch Artist
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/60 text-sm mb-3">
              Search and select your artist profile to access personalized data and insights.
            </p>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for your artist..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
                autoFocus
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white/60"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-1 -mx-4 px-4">
                {results.map((artist) => (
                  <button
                    key={artist.uuid}
                    onClick={() => handleSelectArtist(artist)}
                    className="w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-3 text-left"
                  >
                    {artist.image || artist.imageUrl ? (
                      <img
                        src={artist.image || artist.imageUrl}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Music className="w-5 h-5 text-white/60" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium flex items-center gap-2">
                        {artist.name}
                        {artist.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                      </p>
                      {artist.genres && artist.genres.length > 0 && (
                        <p className="text-white/60 text-sm truncate">
                          {artist.genres.slice(0, 2).join(', ')}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 