import { useState, useEffect } from "react";
import { TrendingUp, Users, Sparkles, Loader2 } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import useArtistStore from "@/stores/useArtistStore";
import { soundchartsClient } from "@/lib/soundcharts";

interface SocialStat {
  platform: 'spotify' | 'instagram' | 'tiktok' | 'youtube';
  followers: number;
  monthlyListeners?: number;
  engagement?: number;
  growth: number;
  lastUpdated: string;
}

interface SocialTrend {
  hashtag: string;
  platform: 'tiktok' | 'instagram' | 'twitter' | 'youtube';
  engagement: string;
  growth: string;
  relevance: 'high' | 'medium' | 'low';
}

// Mock data for social media trends
const mockTrends: SocialTrend[] = [
  {
    hashtag: '#IndieMusic2024',
    platform: 'tiktok',
    engagement: '2.3M views',
    growth: '+156%',
    relevance: 'high'
  },
  {
    hashtag: '#NewMusicFriday',
    platform: 'instagram',
    engagement: '890K posts',
    growth: '+42%',
    relevance: 'high'
  },
  {
    hashtag: '#VinylCollection',
    platform: 'twitter',
    engagement: '456K tweets',
    growth: '+28%',
    relevance: 'medium'
  },
  {
    hashtag: '#MusicProduction',
    platform: 'youtube',
    engagement: '1.2M views',
    growth: '+89%',
    relevance: 'medium'
  },
  {
    hashtag: '#LiveMusic',
    platform: 'instagram',
    engagement: '567K posts',
    growth: '+15%',
    relevance: 'low'
  }
];

export default function SocialMediaTracker() {
  const { addMCMessage } = useChat();
  const { selectedArtist, artistStats } = useArtistStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'trends'>('stats');
  const [socialStats, setSocialStats] = useState<SocialStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch audience data when artist is selected or stats change
  useEffect(() => {
    if (selectedArtist && artistStats) {
      fetchSocialStats();
    }
  }, [selectedArtist, artistStats]);

  const fetchSocialStats = async () => {
    if (!selectedArtist) return;

    setIsLoading(true);
    try {
      // Fetch data for different platforms
      const platforms = ['spotify', 'instagram', 'tiktok', 'youtube'];
      const stats: SocialStat[] = [];

      // Use the artist stats if available
      if (artistStats) {
        if (artistStats.spotify) {
          stats.push({
            platform: 'spotify',
            followers: artistStats.spotify.followers || 0,
            monthlyListeners: artistStats.spotify.monthlyListeners,
            growth: Math.floor(Math.random() * 30) + 1, // Mock growth for now
            lastUpdated: new Date().toISOString()
          });
        }
        if (artistStats.instagram) {
          stats.push({
            platform: 'instagram',
            followers: artistStats.instagram.followers || 0,
            engagement: artistStats.instagram.engagement,
            growth: Math.floor(Math.random() * 20) + 1,
            lastUpdated: new Date().toISOString()
          });
        }
        if (artistStats.tiktok) {
          stats.push({
            platform: 'tiktok',
            followers: artistStats.tiktok.followers || 0,
            engagement: Math.floor(Math.random() * 15) + 5,
            growth: Math.floor(Math.random() * 50) + 10,
            lastUpdated: new Date().toISOString()
          });
        }
        if (artistStats.youtube) {
          stats.push({
            platform: 'youtube',
            followers: artistStats.youtube.subscribers || 0,
            growth: Math.floor(Math.random() * 15) + 1,
            lastUpdated: new Date().toISOString()
          });
        }
      }

      setSocialStats(stats);
    } catch (error) {
      console.error('Error fetching social stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok':
        return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
      case 'instagram':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'twitter':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'youtube':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'spotify':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleMCClick = (item: SocialStat | SocialTrend) => {
    if ('platform' in item && 'followers' in item) {
      const stat = item as SocialStat;
      addMCMessage(`Your ${stat.platform} presence is showing ${stat.growth}% growth! With ${formatNumber(stat.followers)} followers, let's create a strategy to accelerate this momentum.`);
    } else if ('hashtag' in item) {
      const trend = item as SocialTrend;
      addMCMessage(`Let's leverage the trending ${trend.hashtag} on ${trend.platform}! With ${trend.engagement} engagement, we can create content that taps into this trend.`);
    }
  };

  return (
    <div className="text-foreground w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Social Media Tracker</h3>
      </div>

      {/* Tab Filter */}
      <div className="relative mb-4">
        <div className="glass-tabs p-1 flex relative">
          <div
            className="absolute top-1 bottom-1 bg-white/10 dark:bg-white/10 light:bg-black/10 rounded-full transition-all duration-300 ease-out"
            style={{
              left: activeTab === 'stats' ? '4px' : '50%',
              width: 'calc(50% - 4px)',
            }}
          />

          <button
            onClick={() => setActiveTab('stats')}
            className={`relative z-10 text-sm px-4 py-2 flex-1 transition-colors duration-200 ${activeTab === 'stats' ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Stats
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`relative z-10 text-sm px-4 py-2 flex-1 transition-colors duration-200 ${activeTab === 'trends' ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trends
            </div>
          </button>
        </div>
      </div>

      {/* Content - with scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!selectedArtist ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-center">Search and select an artist to view social media stats</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'stats' ? (
              socialStats.length > 0 ? (
                socialStats.map((stat, index) => (
                  <div
                    key={index}
                    className="glass-item p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPlatformColor(stat.platform)}`}>
                            {stat.platform}
                          </span>
                          <span className="text-foreground font-medium">
                            {formatNumber(stat.followers)} followers
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {stat.monthlyListeners && `${formatNumber(stat.monthlyListeners)} monthly listeners • `}
                          {stat.engagement && `${stat.engagement}% engagement • `}
                          <span className="text-green-400">+{stat.growth}%</span>
                        </div>
                      </div>

                      {/* Right side - MC button */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleMCClick(stat)}
                          className="bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm px-3 py-1.5 rounded-full border border-gray-600/50 flex items-center gap-1.5 transition-all duration-200 hover:shadow-[0_0_20px_rgba(3,255,150,0.4)] hover:border-[#03FF96]/50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          MC
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No social media data available for this artist
                </div>
              )
            ) : (
              mockTrends.map((trend, index) => (
                <div
                  key={index}
                  className="glass-item p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPlatformColor(trend.platform)}`}>
                          {trend.platform}
                        </span>
                        <span className="text-foreground font-medium">{trend.hashtag}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trend.engagement} • {trend.growth}
                      </div>
                    </div>

                    {/* Right side - relevance and MC button */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs ${getRelevanceColor(trend.relevance)}`}>
                        {trend.relevance}
                      </span>
                      <button
                        onClick={() => handleMCClick(trend)}
                        className="bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm px-3 py-1.5 rounded-full border border-gray-600/50 flex items-center gap-1.5 transition-all duration-200 hover:shadow-[0_0_20px_rgba(3,255,150,0.4)] hover:border-[#03FF96]/50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        MC
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 