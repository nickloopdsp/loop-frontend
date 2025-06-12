import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Maximize2, Loader2, TrendingUp, Users, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useArtist } from "@/contexts/ArtistContext";

interface HealthMetrics {
  streams: number;
  streamGrowth: number;
  followers: number;
  followersGrowth: number;
  revenue: number;
  revenueGrowth: number;
  engagement: number;
  engagementGrowth: number;
}

interface ChartData {
  date: string;
  streams: number;
  followers: number;
  engagement: number;
}

export default function ArtistHealthMonitor() {
  const { selectedArtist, artistStats } = useArtist();
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedArtist && artistStats) {
      calculateMetrics();
    }
  }, [selectedArtist, artistStats, timeRange]);

  const calculateMetrics = () => {
    setIsLoading(true);
    
    // Calculate metrics from artist stats
    const spotifyStats = artistStats?.spotify;
    const instagramStats = artistStats?.instagram;
    const tiktokStats = artistStats?.tiktok;
    
    // Calculate total streams (monthly listeners as proxy)
    const totalStreams = spotifyStats?.monthlyListeners || 0;
    
    // Calculate total followers across platforms
    const totalFollowers = (spotifyStats?.followers || 0) + 
                          (instagramStats?.followers || 0) + 
                          (tiktokStats?.followers || 0);
    
    // Calculate engagement rate
    const instagramEngagement = instagramStats?.engagement || 0;
    const tiktokEngagement = tiktokStats?.likes ? (tiktokStats.likes / (tiktokStats.followers || 1)) * 100 : 0;
    const avgEngagement = (instagramEngagement + tiktokEngagement) / 2;
    
    // Estimate revenue (very rough calculation)
    const estimatedRevenue = Math.round(totalStreams * 0.004); // $0.004 per stream average
    
    // Generate growth percentages (mock for now, would need historical data)
    const streamGrowth = 12.5 + Math.random() * 10;
    const followersGrowth = 8.3 + Math.random() * 5;
    const revenueGrowth = 10.2 + Math.random() * 8;
    const engagementGrowth = 5.7 + Math.random() * 4;
    
    setMetrics({
      streams: totalStreams,
      streamGrowth: Math.round(streamGrowth * 10) / 10,
      followers: totalFollowers,
      followersGrowth: Math.round(followersGrowth * 10) / 10,
      revenue: estimatedRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      engagement: Math.round(avgEngagement * 100) / 100,
      engagementGrowth: Math.round(engagementGrowth * 10) / 10
    });
    
    // Generate chart data
    generateChartData(totalStreams, totalFollowers, avgEngagement);
    
    setIsLoading(false);
  };

  const generateChartData = (baseStreams: number, baseFollowers: number, baseEngagement: number) => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data: ChartData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some variation to make the chart more realistic
      const streamVariation = 0.9 + Math.random() * 0.2;
      const followerVariation = 0.95 + Math.random() * 0.1;
      const engagementVariation = 0.85 + Math.random() * 0.3;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        streams: Math.round(baseStreams * streamVariation),
        followers: Math.round(baseFollowers * followerVariation),
        engagement: Math.round(baseEngagement * engagementVariation * 100) / 100
      });
    }
    
    setChartData(data);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (!selectedArtist) {
    return (
      <Card className="h-full bg-card border-border">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <p className="text-muted-foreground text-center">Select an artist to view health metrics</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full bg-card border-border">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Artist Health Monitor</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Monthly Listeners</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(metrics?.streams || 0)}</p>
            <span className="text-xs text-emerald-400">+{metrics?.streamGrowth}%</span>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Followers</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(metrics?.followers || 0)}</p>
            <span className="text-xs text-emerald-400">+{metrics?.followersGrowth}%</span>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Est. Revenue</span>
              <DollarSign className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold">${formatNumber(metrics?.revenue || 0)}</p>
            <span className="text-xs text-emerald-400">+{metrics?.revenueGrowth}%</span>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Engagement</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{metrics?.engagement || 0}%</p>
            <span className="text-xs text-emerald-400">+{metrics?.engagementGrowth}%</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                yAxisId="left"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                yAxisId="right"
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'engagement') return [`${value}%`, 'Engagement'];
                  return [formatNumber(value), name.charAt(0).toUpperCase() + name.slice(1)];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="streams" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                yAxisId="left"
                name="Listeners"
              />
              <Line 
                type="monotone" 
                dataKey="followers" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
                yAxisId="left"
                name="Followers"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#A855F7" 
                strokeWidth={2}
                dot={false}
                yAxisId="right"
                name="Engagement"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
