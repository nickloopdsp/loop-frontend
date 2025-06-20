import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Artist, ArtistStats } from '@/stores/useArtistStore';


interface ArtistContextType {
  selectedArtist: Artist | null;
  artistStats: ArtistStats | null;
  isLoading: boolean;
  error: string | null;
  selectArtist: (artist: Artist) => void;
  clearArtist: () => void;
  refreshStats: () => Promise<void>;
}

const ArtistContext = createContext<ArtistContextType | undefined>(undefined);



interface ArtistProviderProps {
  children: ReactNode;
}

export const ArtistProvider: React.FC<ArtistProviderProps> = ({ children }) => {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('selectedArtist');
    return saved ? JSON.parse(saved) : null;
  });
  const [artistStats, setArtistStats] = useState<ArtistStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArtistStats = async (uuid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/soundcharts/artist/${uuid}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch artist stats');
      }
      const stats = await response.json();
      setArtistStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching artist stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    localStorage.setItem('selectedArtist', JSON.stringify(artist));
    fetchArtistStats(artist.uuid);
  };

  const clearArtist = () => {
    setSelectedArtist(null);
    setArtistStats(null);
    localStorage.removeItem('selectedArtist');
  };

  const refreshStats = async () => {
    if (selectedArtist) {
      await fetchArtistStats(selectedArtist.uuid);
    }
  };

  // Fetch stats on mount if artist is selected
  useEffect(() => {
    if (selectedArtist) {
      fetchArtistStats(selectedArtist.uuid);
    }
  }, []);

  return (
    <ArtistContext.Provider
      value={{
        selectedArtist,
        artistStats,
        isLoading,
        error,
        selectArtist,
        clearArtist,
        refreshStats,
      }}
    >
      {children}
    </ArtistContext.Provider>
  );
}; 