import { HealthMetrics, TrendingItem, GeoData, TodoItem, ChatMessage } from "@/types";

export const mockHealthMetrics: HealthMetrics = {
  streams: "2.1M",
  followers: "45.8K",
  revenue: "$8,540",
  streamGrowth: 12.5,
  followersGrowth: 8.3,
  revenueGrowth: 15.2,
};

export const mockTrendingItems: TrendingItem[] = [
  { rank: 1, name: "Synthwave Revival", mentions: "2.3K", growth: 45 },
  { rank: 2, name: "LoFi Beats", mentions: "1.8K", growth: 32 },
  { rank: 3, name: "Ambient Chill", mentions: "1.2K", growth: 28 },
  { rank: 4, name: "Electronic Pop", mentions: "0.9K", growth: 18 },
  { rank: 5, name: "Indie Rock", mentions: "0.7K", growth: 12 },
];

export const mockGeoData: GeoData = {
  topRegion: { name: "North America", listeners: "125K" },
  secondRegion: { name: "Europe", listeners: "89K" },
  thirdRegion: { name: "Asia-Pacific", listeners: "43K" },
};

export const mockTodoItems: TodoItem[] = [
  {
    id: "1",
    title: "Release new single",
    description: "Finalize mastering and distribution",
    status: "todo",
    dueDate: "2024-01-20",
  },
  {
    id: "2",
    title: "Update social media",
    description: "Post about upcoming release",
    status: "todo",
    dueDate: "2024-01-19",
  },
  {
    id: "3",
    title: "Studio session prep",
    description: "Prepare for next recording session",
    status: "in-progress",
  },
  {
    id: "4",
    title: "Album artwork review",
    description: "Review and approve final artwork",
    status: "done",
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "mc",
    message: "Hi Alex! I've been analyzing your recent performance. Your latest track is gaining great momentum! 🎵",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    sender: "user",
    message: "That's great! What should I focus on next?",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    sender: "mc",
    message: "Based on your fan engagement, I recommend:\n• Schedule 3 more social posts this week\n• Consider a live stream session\n• Engage with trending #synthwave hashtag",
    timestamp: new Date(Date.now() - 180000),
  },
];

export const mockArtistProfile = {
  name: "Alex Rivera",
  followers: "1.2M followers",
  avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
};

// Time series data for charts
export const mockChartData = [
  { date: "2024-01-01", streams: 1800000, followers: 42000, revenue: 7200 },
  { date: "2024-01-02", streams: 1850000, followers: 42500, revenue: 7400 },
  { date: "2024-01-03", streams: 1900000, followers: 43000, revenue: 7600 },
  { date: "2024-01-04", streams: 1950000, followers: 43800, revenue: 7800 },
  { date: "2024-01-05", streams: 2000000, followers: 44200, revenue: 8000 },
  { date: "2024-01-06", streams: 2050000, followers: 45000, revenue: 8200 },
  { date: "2024-01-07", streams: 2100000, followers: 45800, revenue: 8540 },
];
