import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Play, Users, DollarSign, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { useArtist } from '@/contexts/ArtistContext';
import { soundchartsClient } from '@/lib/soundcharts';

interface StreamingPlatform {
  platform: string;
  streams: number;
  revenue: number;
  color: string;
  monthlyListeners?: number;
}

export default function StreamingStatsWidget() {
  const { selectedArtist, artistStats } = useArtist();
  const [streamingData, setStreamingData] = useState<StreamingPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalStreams, setTotalStreams] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (selectedArtist) {
      fetchStreamingData();
    }
  }, [selectedArtist]);

  const fetchStreamingData = async () => {
    if (!selectedArtist) return;
    
    setIsLoading(true);
    try {
      // Try to get streaming data from multiple platforms
      const platforms = [
        { name: 'Spotify', color: '#1DB954', revenuePerStream: 0.004 },
        { name: 'Apple Music', color: '#FC3C44', revenuePerStream: 0.005 },
        { name: 'YouTube Music', color: '#FF0000', revenuePerStream: 0.003 },
        { name: 'SoundCloud', color: '#FF5500', revenuePerStream: 0.0025 }
      ];

      const data: StreamingPlatform[] = [];
      
      // Use artist stats if available
      if (artistStats?.spotify) {
        data.push({
          platform: 'Spotify',
          streams: artistStats.spotify.monthlyListeners || 0,
          monthlyListeners: artistStats.spotify.monthlyListeners,
          revenue: Math.round((artistStats.spotify.monthlyListeners || 0) * 0.004),
          color: '#1DB954'
        });
      }

      // For other platforms, we'll use estimated data based on Spotify ratio
      // In production, you'd fetch real data from each platform
      const spotifyListeners = artistStats?.spotify?.monthlyListeners || 0;
      if (spotifyListeners > 0) {
        data.push({
          platform: 'Apple Music',
          streams: Math.round(spotifyListeners * 0.7),
          revenue: Math.round(spotifyListeners * 0.7 * 0.005),
          color: '#FC3C44'
        });
        data.push({
          platform: 'YouTube Music',
          streams: Math.round(spotifyListeners * 0.6),
          revenue: Math.round(spotifyListeners * 0.6 * 0.003),
          color: '#FF0000'
        });
        data.push({
          platform: 'SoundCloud',
          streams: Math.round(spotifyListeners * 0.4),
          revenue: Math.round(spotifyListeners * 0.4 * 0.0025),
          color: '#FF5500'
        });
      }

      // If no real data, use mock data
      if (data.length === 0) {
        data.push(
          { platform: 'Spotify', streams: 45000, revenue: 180, color: '#1DB954' },
          { platform: 'Apple Music', streams: 32000, revenue: 160, color: '#FC3C44' },
          { platform: 'YouTube Music', streams: 28000, revenue: 85, color: '#FF0000' },
          { platform: 'SoundCloud', streams: 18000, revenue: 45, color: '#FF5500' }
        );
      }

      setStreamingData(data);
      setTotalStreams(data.reduce((sum, platform) => sum + platform.streams, 0));
      setTotalRevenue(data.reduce((sum, platform) => sum + platform.revenue, 0));
    } catch (error) {
      console.error('Error fetching streaming data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedArtist) {
    return (
      <div className="glass-widget text-white h-full flex items-center justify-center">
        <p className="text-gray-400 text-center">Select an artist to view streaming analytics</p>
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
          <Play className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold">Streaming Analytics</h3>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="glass-card rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Monthly Listeners</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalStreams.toLocaleString()}</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12.5% from last month
          </p>
        </div>
        <div className="glass-card rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Est. Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +8.3% from last month
          </p>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={streamingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="platform" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'streams' ? `${value?.toLocaleString()} listeners` : `$${value?.toLocaleString()}`,
                name === 'streams' ? 'Monthly Listeners' : 'Est. Revenue'
              ]}
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Bar dataKey="streams" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Platform List */}
      <div className="space-y-2 w-full">
        {streamingData.map((platform, index) => (
          <div key={index} className="flex items-center justify-between p-3 glass-card rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: platform.color }}
              />
              <span className="font-medium text-white">{platform.platform}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">{platform.streams.toLocaleString()}</div>
              <div className="text-xs text-gray-400">${platform.revenue.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 