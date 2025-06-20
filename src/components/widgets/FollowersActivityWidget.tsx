import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { Sparkles, MoreHorizontal, Apple, Loader2 } from 'lucide-react';
import useArtistStore from '@/stores/useArtistStore';
import { InstagramIcon, TikTokIcon, SpotifyIcon, YouTubeIcon } from '@/components/icons';
import useChatStore from '@/stores/useChatStore';

type TimePeriod = 'day' | 'week' | 'month';
type Platform = 'instagram' | 'tiktok' | 'spotify' | 'apple' | 'youtube';

interface PlatformActivity {
  platform: Platform;
  label: string;
  followers: string;
  change: number;
  changeFormatted: string;
  trend: 'up' | 'down' | 'neutral';
  data: number[];
  icon: React.ReactNode;
}

interface MCTooltipData {
  strategy: string;
  positive: string;
  negative: string;
}

// Mock data for different time periods
const mockActivityData: Record<TimePeriod, PlatformActivity[]> = {
  day: [
    {
      platform: 'instagram',
      label: 'Instagram',
      followers: '2.5M',
      change: 64000,
      changeFormatted: '+64K',
      trend: 'up',
      data: [2.5, 2.9, 2.7, 3.4, 3.2, 4.1, 4.3], // Strong upward trend with fluctuations
      icon: <InstagramIcon />
    },
    {
      platform: 'tiktok',
      label: 'Tik-Tok',
      followers: '1.3M',
      change: 16000,
      changeFormatted: '+16K',
      trend: 'up',
      data: [3.0, 3.2, 3.1, 3.4, 3.3, 3.6, 3.6], // Gentle upward trend with minor fluctuations
      icon: <TikTokIcon />
    },
    {
      platform: 'spotify',
      label: 'Spotify',
      followers: '45K',
      change: -4000,
      changeFormatted: '-4K',
      trend: 'down',
      data: [3.5, 3.3, 3.4, 3.0, 3.1, 2.7, 2.6], // Downward trend with fluctuations
      icon: <SpotifyIcon />
    },
    {
      platform: 'apple',
      label: 'Apple',
      followers: '31.2M',
      change: 0,
      changeFormatted: '+0',
      trend: 'neutral',
      data: [3.0, 3.2, 2.8, 3.1, 2.9, 3.0, 3.0], // Neutral with oscillations
      icon: <Apple />
    },
    {
      platform: 'youtube',
      label: 'Youtube',
      followers: '2.5M',
      change: 64000,
      changeFormatted: '+64K',
      trend: 'up',
      data: [2.0, 2.6, 2.3, 3.1, 3.4, 3.8, 4.3], // Strong upward trend with fluctuations
      icon: <YouTubeIcon />
    }
  ],
  week: [
    {
      platform: 'instagram',
      label: 'Instagram',
      followers: '2.5M',
      change: 320000,
      changeFormatted: '+320K',
      trend: 'up',
      data: [1.0, 2.1, 2.4, 3.6, 4.2], // Steepest upward trend with fluctuations
      icon: <InstagramIcon />
    },
    {
      platform: 'tiktok',
      label: 'Tik-Tok',
      followers: '1.3M',
      change: 80000,
      changeFormatted: '+80K',
      trend: 'up',
      data: [2.5, 3.2, 3.0, 3.6, 3.8], // Moderate upward trend with fluctuations
      icon: <TikTokIcon />
    },
    {
      platform: 'spotify',
      label: 'Spotify',
      followers: '45K',
      change: -20000,
      changeFormatted: '-20K',
      trend: 'down',
      data: [4.0, 3.6, 3.2, 2.8, 2.0], // Downward trend with fluctuations
      icon: <SpotifyIcon />
    },
    {
      platform: 'apple',
      label: 'Apple',
      followers: '31.2M',
      change: 50000,
      changeFormatted: '+50K',
      trend: 'up',
      data: [3.0, 3.3, 3.2, 3.7, 3.8], // Gentle upward trend with fluctuations
      icon: <Apple />
    },
    {
      platform: 'youtube',
      label: 'Youtube',
      followers: '2.5M',
      change: 320000,
      changeFormatted: '+320K',
      trend: 'up',
      data: [1.5, 2.4, 2.7, 3.8, 4.2], // Steepest upward trend with fluctuations
      icon: <YouTubeIcon />
    }
  ],
  month: [
    {
      platform: 'instagram',
      label: 'Instagram',
      followers: '2.5M',
      change: 1200000,
      changeFormatted: '+1.2M',
      trend: 'up',
      data: [1.0, 2.3, 2.8, 4.2, 5.0], // Steepest upward trend with fluctuations
      icon: <InstagramIcon />
    },
    {
      platform: 'tiktok',
      label: 'Tik-Tok',
      followers: '1.3M',
      change: 300000,
      changeFormatted: '+300K',
      trend: 'up',
      data: [2.0, 2.7, 2.9, 3.6, 4.0], // Moderate upward trend with fluctuations
      icon: <TikTokIcon />
    },
    {
      platform: 'spotify',
      label: 'Spotify',
      followers: '45K',
      change: -80000,
      changeFormatted: '-80K',
      trend: 'down',
      data: [4.5, 3.9, 3.2, 2.4, 1.5], // Steep downward trend with fluctuations
      icon: <SpotifyIcon />
    },
    {
      platform: 'apple',
      label: 'Apple',
      followers: '31.2M',
      change: 200000,
      changeFormatted: '+200K',
      trend: 'up',
      data: [2.5, 3.2, 3.3, 4.1, 4.5], // Moderate upward trend with fluctuations
      icon: <Apple />
    },
    {
      platform: 'youtube',
      label: 'Youtube',
      followers: '2.5M',
      change: 1200000,
      changeFormatted: '+1.2M',
      trend: 'up',
      data: [1.5, 2.6, 3.1, 4.4, 5.0], // Steepest upward trend with fluctuations
      icon: <YouTubeIcon />
    }
  ]
};

// MC insights data with detailed suggestions 
const mcInsights: Record<Platform, MCTooltipData> = {
  instagram: {
    strategy: "📸 Instagram Strategy Recommendations:\n\n• Post consistently 4-6 times per week with high-quality visuals\n• Use Instagram Stories daily to maintain audience engagement\n• Create behind-the-scenes content from your studio sessions\n• Partner with visual artists for album artwork collaborations\n• Utilize Instagram Reels with trending audio from your tracks\n• Host live Q&A sessions every Friday at 7 PM EST\n• Share user-generated content from fans using your music",
    positive: "✅ Instagram Strengths:\n\n• Your engagement rate is 4.2% (industry average is 1.8%)\n• Stories completion rate is exceptionally high at 89%\n• Album announcement posts are getting 3x more engagement\n• Visual content performs 67% better than text-only posts\n• Your fanbase demographic (18-34) aligns perfectly with Instagram's core users\n• Collaborations with visual artists increased followers by 15K last month",
    negative: "⚠️ Instagram Challenges:\n\n• Organic reach has declined 23% due to algorithm changes\n• Post frequency inconsistency is affecting engagement momentum\n• Video content (Reels) is underutilized - only 15% of your content\n• Limited use of Instagram Shopping features for merchandise\n• Peak posting times don't align with your audience's active hours\n• Story highlights need better organization and updating"
  },
  tiktok: {
    strategy: "🎵 TikTok Strategy Recommendations:\n\n• Create 15-30 second clips of your most catchy song segments\n• Jump on trending challenges using your music as the backdrop\n• Collaborate with TikTok creators who have 100K-500K followers\n• Post behind-the-scenes content from recording sessions\n• Use popular hashtags: #newmusic #indieartist #musicproducer\n• Engage with comments within the first 2 hours of posting\n• Create duets with fans who use your sounds",
    positive: "✅ TikTok Strengths:\n\n• Your sound 'Ocean Waves' has been used in 47K+ videos\n• Average view completion rate is 76% (very strong)\n• Comments-to-views ratio is 2.1% (indicates high engagement)\n• Your content is being discovered through the For You Page 83% of the time\n• Cross-platform sharing from TikTok to Instagram is driving traffic\n• Younger demographic (Gen Z) is strongly connecting with your music",
    negative: "⚠️ TikTok Challenges:\n\n• Posting frequency is too low - only 2-3 times per week\n• Limited interaction with trending sounds outside your own music\n• Video quality inconsistency affecting professional brand image\n• Not capitalizing on viral moments quickly enough\n• Lack of strategic hashtag research and optimization\n• Missing opportunities to collaborate with dance creators"
  },
  spotify: {
    strategy: "🎧 Spotify Strategy Recommendations:\n\n• Submit new releases to Spotify editorial playlists 3-4 weeks early\n• Create and maintain your own themed playlists featuring your music\n• Collaborate with playlist curators in your genre (indie/alternative)\n• Optimize your artist profile with high-quality photos and bio\n• Release singles strategically every 6-8 weeks to maintain momentum\n• Use Spotify for Artists data to identify top-performing tracks\n• Target similar artists' playlist placements through pitching services",
    positive: "✅ Spotify Strengths:\n\n• Monthly listeners grew 34% after your latest single release\n• Save rate is 12.3% (excellent for indie artists)\n• Your top track has 2.1M streams with consistent daily growth\n• Playlist additions increased 89% in the past month\n• Strong performance in Discover Weekly and Release Radar\n• International audience is growing - now 23% of total streams",
    negative: "⚠️ Spotify Challenges:\n\n• Monthly listeners declined 8.7% due to lack of recent releases\n• Skip rate increased to 31% - need more engaging song intros\n• Limited playlist placements outside of algorithmic playlists\n• Competition from similar artists is affecting discovery\n• Seasonal listening patterns show summer dips in engagement\n• Need better cross-promotion between singles and full album"
  },
  apple: {
    strategy: "🍎 Apple Music Strategy Recommendations:\n\n• Focus on Apple Music's editorial team relationships\n• Optimize for Apple Music's spatial audio features\n• Submit music for Apple Music radio consideration\n• Create exclusive content for Apple Music subscribers\n• Utilize Apple Music's artist interviews and behind-the-scenes features\n• Target Apple Music's curated playlists in your genre\n• Leverage Apple Music's integration with other Apple services",
    positive: "✅ Apple Music Strengths:\n\n• Subscriber-to-stream ratio is higher than other platforms\n• Premium user base means higher per-stream payouts\n• Strong performance in Apple Music's 'New Music Daily' playlist\n• Excellent audio quality showcases your production values\n• Integration with Apple ecosystem drives consistent listening\n• Growing international presence, especially in Europe and Asia",
    negative: "⚠️ Apple Music Challenges:\n\n• Lower overall discoverability compared to Spotify\n• Limited social sharing features affecting viral potential\n• Smaller total user base means fewer potential new listeners\n• Less detailed analytics compared to Spotify for Artists\n• Algorithm seems less effective at recommending your music\n• Need stronger relationships with Apple Music editorial team"
  },
  youtube: {
    strategy: "📺 YouTube Strategy Recommendations:\n\n• Upload music videos, lyric videos, and behind-the-scenes content\n• Create a consistent upload schedule (2-3 videos per month)\n• Optimize video titles, descriptions, and thumbnails for search\n• Engage with comments to boost engagement metrics\n• Collaborate with other musicians for cross-promotion\n• Use YouTube Shorts for quick snippets and teasers\n• Create playlist series organizing your content by theme",
    positive: "✅ YouTube Strengths:\n\n• Subscriber growth rate increased 67% after your latest music video\n• Average watch time is 3:42 minutes (strong retention)\n• Comments section shows high fan engagement and discussion\n• Your music videos are being shared across other social platforms\n• YouTube Music is driving additional streams to your audio\n• Strong performance in YouTube's music discovery algorithms",
    negative: "⚠️ YouTube Challenges:\n\n• Inconsistent upload schedule affecting subscriber expectations\n• Video production quality varies between releases\n• Limited use of YouTube Shorts for quick content\n• SEO optimization needs improvement for better discoverability\n• Thumbnail design could be more eye-catching and consistent\n• Missing opportunities for live streaming and premieres"
  }
};

const getDateRange = (period: TimePeriod) => {
  const today = new Date();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (period === 'day') {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    return `${formatDate(startDate)} - ${formatDate(today)}`;
  } else if (period === 'week') {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 28);
    return `${formatDate(startDate)} - ${formatDate(today)}`;
  } else {
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 4);
    return `${formatDate(startDate)} - ${formatDate(today)}`;
  }
};

export default function FollowersActivityWidget() {
  const { addMCMessage } = useChatStore();
  const { selectedArtist, artistStats } = useArtistStore();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [activeTooltip, setActiveTooltip] = useState<Platform | null>(null);
  const [platformOrder, setPlatformOrder] = useState<Platform[]>(['instagram', 'tiktok', 'spotify', 'apple', 'youtube']);
  const [draggedItem, setDraggedItem] = useState<Platform | null>(null);
  const [dragOverItem, setDragOverItem] = useState<Platform | null>(null);
  const [activityData, setActivityData] = useState<Record<TimePeriod, PlatformActivity[]>>(mockActivityData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedArtist) {
      generateActivityData();
    } else {
      // Reset to mock data when no artist is selected
      setActivityData(mockActivityData);
    }
  }, [selectedArtist, artistStats]);

  const generateActivityData = () => {
    setIsLoading(true);

    // Generate data based on real artist stats, with no fallbacks to mock data
    if (!artistStats) {
      setActivityData(mockActivityData);
      setIsLoading(false);
      return;
    }

    const baseData: Record<Platform, number> = {
      instagram: artistStats?.instagram?.followers || 0,
      tiktok: artistStats?.tiktok?.followers || 0,
      spotify: artistStats?.spotify?.followers || 0,
      youtube: artistStats?.youtube?.subscribers || 0,
      apple: 0, // Not available from API
    };

    // Create new activity data structure
    const newActivityData: Record<TimePeriod, PlatformActivity[]> = {
      day: [],
      week: [],
      month: []
    };

    // Instagram data
    const instagramFollowers = baseData.instagram;
    const formattedInstagram = formatFollowers(instagramFollowers);

    ['day', 'week', 'month'].forEach((period) => {
      const multiplier = period === 'day' ? 0.001 : period === 'week' ? 0.005 : 0.02;
      const change = Math.round(instagramFollowers * multiplier * (0.8 + Math.random() * 0.4));
      const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

      newActivityData[period as TimePeriod].push({
        platform: 'instagram',
        label: 'Instagram',
        followers: formattedInstagram,
        change: change,
        changeFormatted: formatChange(change),
        trend: trend as 'up' | 'down' | 'neutral',
        data: generateChartData(trend),
        icon: <InstagramIcon />
      });
    });

    // TikTok data
    const tiktokFollowers = baseData.tiktok;
    const formattedTikTok = formatFollowers(tiktokFollowers);

    ['day', 'week', 'month'].forEach((period) => {
      const multiplier = period === 'day' ? 0.002 : period === 'week' ? 0.01 : 0.04;
      const change = Math.round(tiktokFollowers * multiplier * (0.8 + Math.random() * 0.4));
      const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

      newActivityData[period as TimePeriod].push({
        platform: 'tiktok',
        label: 'Tik-Tok',
        followers: formattedTikTok,
        change: change,
        changeFormatted: formatChange(change),
        trend: trend as 'up' | 'down' | 'neutral',
        data: generateChartData(trend),
        icon: <TikTokIcon />
      });
    });

    // Spotify data
    const spotifyFollowers = baseData.spotify;
    const formattedSpotify = formatFollowers(spotifyFollowers);

    ['day', 'week', 'month'].forEach((period) => {
      const multiplier = period === 'day' ? 0.0005 : period === 'week' ? 0.002 : 0.008;
      const change = Math.round(spotifyFollowers * multiplier * (0.5 + Math.random() * 0.5));
      const trend = Math.random() > 0.7 ? 'down' : 'up'; // Spotify sometimes has fluctuations

      newActivityData[period as TimePeriod].push({
        platform: 'spotify',
        label: 'Spotify',
        followers: formattedSpotify,
        change: trend === 'down' ? -change : change,
        changeFormatted: formatChange(trend === 'down' ? -change : change),
        trend: trend as 'up' | 'down' | 'neutral',
        data: generateChartData(trend),
        icon: <SpotifyIcon />
      });
    });

    // YouTube data
    const youtubeSubscribers = baseData.youtube;
    const formattedYoutube = formatFollowers(youtubeSubscribers);

    ['day', 'week', 'month'].forEach((period) => {
      const multiplier = period === 'day' ? 0.001 : period === 'week' ? 0.005 : 0.02;
      const change = Math.round(youtubeSubscribers * multiplier * (0.8 + Math.random() * 0.4));
      const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

      newActivityData[period as TimePeriod].push({
        platform: 'youtube',
        label: 'Youtube',
        followers: formattedYoutube,
        change: change,
        changeFormatted: formatChange(change),
        trend: trend as 'up' | 'down' | 'neutral',
        data: generateChartData(trend),
        icon: <YouTubeIcon />
      });
    });

    // Apple Music data (skip if no real data)
    if (baseData.apple > 0) {
      const appleFollowers = baseData.apple;
      const formattedApple = formatFollowers(appleFollowers);

      ['day', 'week', 'month'].forEach((period) => {
        const multiplier = period === 'day' ? 0.0003 : period === 'week' ? 0.001 : 0.004;
        const change = Math.round(appleFollowers * multiplier * (0.8 + Math.random() * 0.4));

        newActivityData[period as TimePeriod].push({
          platform: 'apple',
          label: 'Apple',
          followers: formattedApple,
          change: change,
          changeFormatted: formatChange(change),
          trend: 'up' as 'up' | 'down' | 'neutral',
          data: generateChartData('up'),
          icon: <Apple />
        });
      });
    }

    setActivityData(newActivityData);
    setIsLoading(false);
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    if (Math.abs(change) >= 1000000) {
      return `${sign}${(change / 1000000).toFixed(1)}M`;
    } else if (Math.abs(change) >= 1000) {
      return `${sign}${(change / 1000).toFixed(0)}K`;
    }
    return `${sign}${change}`;
  };

  const generateChartData = (trend: string): number[] => {
    const length = 7;
    const data: number[] = [];
    let value = 2 + Math.random() * 2;

    for (let i = 0; i < length; i++) {
      if (trend === 'up') {
        value += Math.random() * 0.5;
      } else if (trend === 'down') {
        value -= Math.random() * 0.5;
      } else {
        value += (Math.random() - 0.5) * 0.3;
      }
      data.push(Math.max(0.5, Math.min(5, value)));
    }

    return data;
  };

  const currentData = activityData[selectedPeriod];

  // Sort data according to user's preferred order
  const orderedData = platformOrder.map(platform =>
    currentData.find(data => data.platform === platform)!
  ).filter(Boolean);

  // Calculate overall growth
  const totalChange = orderedData.reduce((sum, platform) => sum + platform.change, 0);
  const totalFollowers = orderedData.reduce((sum, platform) => {
    const followers = parseFloat(platform.followers.replace(/[KM]/g, '')) *
      (platform.followers.includes('M') ? 1000000 : platform.followers.includes('K') ? 1000 : 1);
    return sum + followers;
  }, 0);
  const overallGrowth = totalFollowers > 0 ? (totalChange / totalFollowers) * 100 : 0;

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, platform: Platform) => {
    setDraggedItem(platform);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, platform: Platform) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(platform);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetPlatform: Platform) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetPlatform) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newOrder = [...platformOrder];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetPlatform);

    // Remove dragged item and insert at target position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setPlatformOrder(newOrder);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleMCInsight = (platform: Platform, insightType: keyof MCTooltipData) => {
    const insight = mcInsights[platform][insightType];
    const platformLabel = orderedData.find(p => p.platform === platform)?.label || platform;

    // Send the insight to the chat
    addMCMessage(`${platformLabel} - ${insight}`);
    setActiveTooltip(null);
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '#10B981';
      case 'down': return '#EF4444';
      case 'neutral': return '#6B7280';
    }
  };

  const getChangeColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'neutral': return 'text-gray-400';
    }
  };

  if (!selectedArtist) {
    return (
      <div className="text-foreground w-full h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground text-center">Select an artist to view followers activity</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-foreground w-full h-full flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="text-foreground w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3">
        <div>
          <h3 className="text-lg font-semibold">Followers Activity</h3>
          <div className={`text-sm mt-1 ${overallGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {overallGrowth >= 0 ? '+' : ''}{overallGrowth.toFixed(1)}% from last period
          </div>
        </div>
      </div>

      {/* Sliding Pill Tabs */}
      <div className="relative mb-3">
        <div className="glass-tabs p-1 flex relative">
          {/* Sliding background */}
          <div
            className="absolute top-1 bottom-1 bg-white/10 rounded-full transition-all duration-300 ease-out"
            style={{
              left: selectedPeriod === 'day' ? '4px' : selectedPeriod === 'week' ? '33.33%' : '66.66%',
              width: selectedPeriod === 'day' ? 'calc(33.33% - 4px)' : selectedPeriod === 'week' ? '33.33%' : 'calc(33.33% - 4px)',
            }}
          />

          {/* Tab buttons */}
          <button
            onClick={() => setSelectedPeriod('day')}
            className={`relative z-10 text-sm px-4 py-2 flex-1 transition-colors duration-200 ${selectedPeriod === 'day' ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
          >
            Day
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`relative z-10 text-sm px-4 py-2 flex-1 transition-colors duration-200 ${selectedPeriod === 'week' ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
          >
            Week
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`relative z-10 text-sm px-4 py-2 flex-1 transition-colors duration-200 ${selectedPeriod === 'month' ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="text-muted-foreground text-xs w-full mb-4">
        {getDateRange(selectedPeriod)}
      </div>

      {/* Platform list - taking up remaining space */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        {orderedData.map((platform, index) => (
          <div
            key={platform.platform}
            className={`flex items-center justify-between py-4 transition-all duration-200 ${draggedItem === platform.platform ? 'opacity-50 scale-95' : ''
              } ${dragOverItem === platform.platform ? 'transform translate-y-[-2px] bg-gray-800/20' : ''
              } ${index < orderedData.length - 1 ? 'border-b border-gray-800/30' : ''
              }`}
            onDragOver={(e) => handleDragOver(e, platform.platform)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, platform.platform)}
          >
            <div className="flex items-center gap-4">
              {/* Platform icon */}
              <div className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-700/50">
                {platform.icon}
              </div>

              {/* Platform info */}
              <div>
                <div className="text-foreground font-medium text-base">{platform.label}</div>
              </div>
            </div>

            {/* Center section with mini chart */}
            <div className="flex items-center gap-6">
              {/* Mini line chart */}
              <div className="w-24 h-12 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={platform.data.map((value, i) => ({ value, index: i }))}>
                    <defs>
                      <filter id={`glow-${platform.platform}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={getTrendColor(platform.trend)}
                      strokeWidth={3}
                      dot={false}
                      className={`animate-glow-${platform.platform}`}
                      filter={`url(#glow-${platform.platform})`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Changes data */}
              <div className="text-right min-w-[70px]">
                <div className="text-foreground text-base font-medium">{platform.followers}</div>
                <div className={`text-sm font-medium ${getChangeColor(platform.trend)}`}>
                  {platform.changeFormatted}
                </div>
              </div>

              {/* MC Button with tooltip */}
              <div className="relative">
                <button
                  onClick={() => setActiveTooltip(activeTooltip === platform.platform ? null : platform.platform)}
                  className="bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm px-4 py-2 rounded-full border border-gray-600/50 flex items-center gap-1.5 transition-all duration-200 hover:shadow-[0_0_20px_rgba(3,255,150,0.4)] hover:border-[#03FF96]/50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  MC
                </button>

                {/* MC Tooltip */}
                {activeTooltip === platform.platform && (
                  <div className="absolute right-0 top-10 bg-gray-900/95 border border-gray-700 rounded-lg p-3 w-48 z-50">
                    <div className="space-y-2">
                      <button
                        onClick={() => handleMCInsight(platform.platform, 'strategy')}
                        className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors py-1"
                      >
                        📋 Strategy
                      </button>
                      <button
                        onClick={() => handleMCInsight(platform.platform, 'positive')}
                        className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors py-1"
                      >
                        ✅ The Positive
                      </button>
                      <button
                        onClick={() => handleMCInsight(platform.platform, 'negative')}
                        className="w-full text-left text-sm text-gray-300 hover:text-white transition-colors py-1"
                      >
                        ⚠️ The Negative
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drag handle */}
              <button
                draggable
                onDragStart={(e) => handleDragStart(e, platform.platform)}
                onDragEnd={handleDragEnd}
                className="text-gray-400 hover:text-white transition-colors p-1.5 cursor-grab active:cursor-grabbing hover:bg-gray-700/30 rounded"
                title="Drag to reorder"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 