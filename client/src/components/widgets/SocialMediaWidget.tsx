import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Hash, Heart, MessageCircle, Share2, Users2 } from "lucide-react";

const socialPlatforms = [
  {
    name: 'Instagram',
    followers: '85.2K',
    engagement: '4.2%',
    posts: 342,
    color: '#E4405F',
    icon: '📸'
  },
  {
    name: 'TikTok',
    followers: '123.5K',
    engagement: '8.7%',
    posts: 156,
    color: '#000000',
    icon: '🎵'
  },
  {
    name: 'Twitter',
    followers: '45.8K',
    engagement: '2.1%',
    posts: 892,
    color: '#1DA1F2',
    icon: '🐦'
  },
  {
    name: 'Facebook',
    followers: '32.1K',
    engagement: '1.8%',
    posts: 234,
    color: '#1877F2',
    icon: '📘'
  }
];

const engagementData = [
  { month: 'Jan', instagram: 3.2, tiktok: 7.1, twitter: 1.9, facebook: 1.2 },
  { month: 'Feb', instagram: 3.8, tiktok: 8.2, twitter: 2.1, facebook: 1.5 },
  { month: 'Mar', instagram: 4.1, tiktok: 8.5, twitter: 2.0, facebook: 1.7 },
  { month: 'Apr', instagram: 4.2, tiktok: 8.7, twitter: 2.1, facebook: 1.8 },
];

export default function SocialMediaWidget() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" />
          Social Media Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {socialPlatforms.map((platform, index) => (
            <div key={index} className="p-3 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{platform.icon}</span>
                  <span className="font-medium text-sm">{platform.name}</span>
                </div>
                <span className="text-xs text-green-600 font-medium">
                  {platform.engagement}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users2 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-semibold">{platform.followers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{platform.posts} posts</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-48 mb-4">
          <h4 className="text-sm font-medium mb-2">Engagement Rate Trends</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Engagement Rate']} />
              <Line type="monotone" dataKey="instagram" stroke="#E4405F" strokeWidth={2} />
              <Line type="monotone" dataKey="tiktok" stroke="#000000" strokeWidth={2} />
              <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" strokeWidth={2} />
              <Line type="monotone" dataKey="facebook" stroke="#1877F2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded bg-muted/50">
            <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
            <div className="text-sm font-semibold">24.5K</div>
            <div className="text-xs text-muted-foreground">Total Likes</div>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <MessageCircle className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-sm font-semibold">3.2K</div>
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <Share2 className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <div className="text-sm font-semibold">1.8K</div>
            <div className="text-xs text-muted-foreground">Shares</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 