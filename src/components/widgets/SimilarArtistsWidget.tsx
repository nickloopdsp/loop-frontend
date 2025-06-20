import { useEffect, useState } from 'react';
import { useArtist } from '@/contexts/ArtistContext';
import { soundchartsClient } from '@/lib/soundcharts';
import { Loader2, Music, Users, Sparkles } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

interface SimilarArtist {
  uuid: string;
  name: string;
  image?: string;
  imageUrl?: string;
  genres?: string[];
  similarity?: number;
  followers?: number;
}

export default function SimilarArtistsWidget() {
  const { selectedArtist } = useArtist();
  const { addMCMessage } = useChat();
  const [similarArtists, setSimilarArtists] = useState<SimilarArtist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedArtist) {
      fetchSimilarArtists();
    }
  }, [selectedArtist]);

  const fetchSimilarArtists = async () => {
    if (!selectedArtist) return;
    
    setIsLoading(true);
    try {
      const response = await soundchartsClient.getSimilarArtists(selectedArtist.uuid);
      
      // Transform the response data
      const artists = response.items?.slice(0, 5) || [];
      setSimilarArtists(artists);
    } catch (error) {
      console.error('Error fetching similar artists:', error);
      // Use mock data as fallback
      setSimilarArtists([
        {
          uuid: '1',
          name: "Similar Artist 1",
          genres: ["Pop"],
          similarity: 92,
          followers: 89400000,
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"
        },
        {
          uuid: '2',
          name: "Similar Artist 2", 
          genres: ["Pop Rock"],
          similarity: 89,
          followers: 23100000,
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFollowers = (count?: number) => {
    if (!count) return 'N/A';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleCollaborate = (artist: SimilarArtist) => {
    addMCMessage(`Let's explore collaboration opportunities with ${artist.name}! They have a similar sound and could be a great match for a feature or joint project.`);
  };

  const handleAnalyze = () => {
    addMCMessage(`I'll analyze these similar artists to identify successful strategies you can adapt. Looking at their recent releases, marketing tactics, and audience engagement patterns.`);
  };

  if (!selectedArtist) {
    return (
      <div className="glass-widget text-white h-full flex items-center justify-center">
        <p className="text-gray-400 text-center">Select an artist to view similar artists</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-widget text-white h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="glass-widget text-white h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Similar Artists</h3>
        </div>
        <button className="text-green-400 text-sm hover:text-green-300">Show more</button>
      </div>

      {/* Description */}
      <div className="text-gray-400 text-sm w-full">
        Artists with similar sound and audience overlap
      </div>
      
      {/* Artists list */}
      <div className="space-y-3 w-full flex-1 overflow-y-auto">
        {similarArtists.length > 0 ? (
          similarArtists.map((artist, index) => (
            <div key={artist.uuid} className="flex items-center justify-between p-3 glass-card rounded-lg">
              <div className="flex items-center gap-3">
                {artist.image || artist.imageUrl ? (
                  <img 
                    src={artist.image || artist.imageUrl}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white/60" />
                  </div>
                )}
                <div>
                  <div className="text-white font-medium">{artist.name}</div>
                  <div className="text-gray-400 text-sm">
                    {artist.genres?.join(', ') || 'Genre N/A'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-green-400 font-semibold text-sm">
                    {artist.similarity ? `${artist.similarity}%` : `#${index + 1}`}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {formatFollowers(artist.followers)} followers
                  </div>
                </div>
                <button 
                  onClick={() => handleCollaborate(artist)}
                  className="bg-gray-800/50 hover:bg-gray-700/50 text-white text-xs px-2 py-1 rounded-full border border-gray-600/50 flex items-center gap-1 transition-all duration-200 hover:shadow-[0_0_20px_rgba(3,255,150,0.4)] hover:border-[#03FF96]/50"
                >
                  <Sparkles className="w-3 h-3" />
                  MC
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            No similar artists found
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <button 
          onClick={() => similarArtists[0] && handleCollaborate(similarArtists[0])}
          className="flex-1 py-2 px-4 rounded-lg text-white text-sm font-medium glass-button-primary"
        >
          Collaborate
        </button>
        <button 
          onClick={handleAnalyze}
          className="flex-1 py-2 px-4 rounded-lg text-white text-sm font-medium glass-button"
        >
          Analyze
        </button>
      </div>
    </div>
  );
} 