import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Settings } from "lucide-react";

const platforms = [
  {
    name: "Spotify",
    status: "connected",
    lastSync: "2 minutes ago",
    dataPoints: "Streams, Monthly Listeners, Playlists",
    icon: "🎵",
    color: "#1DB954"
  },
  {
    name: "Apple Music",
    status: "connected",
    lastSync: "5 minutes ago",
    dataPoints: "Streams, Shazam Tags, Radio Plays",
    icon: "🍎",
    color: "#FC3C44"
  },
  {
    name: "Instagram",
    status: "connected",
    lastSync: "1 minute ago",
    dataPoints: "Followers, Engagement, Story Views",
    icon: "📸",
    color: "#E4405F"
  },
  {
    name: "TikTok",
    status: "connected",
    lastSync: "3 minutes ago",
    dataPoints: "Views, Likes, Shares, Comments",
    icon: "🎵",
    color: "#000000"
  },
  {
    name: "Twitter",
    status: "warning",
    lastSync: "2 hours ago",
    dataPoints: "Tweets, Impressions, Engagement",
    icon: "🐦",
    color: "#1DA1F2"
  },
  {
    name: "Facebook",
    status: "connected",
    lastSync: "10 minutes ago",
    dataPoints: "Page Likes, Post Reach, Videos",
    icon: "📘",
    color: "#1877F2"
  },
  {
    name: "YouTube Music",
    status: "error",
    lastSync: "Failed",
    dataPoints: "Views, Subscribers, Watch Time",
    icon: "📺",
    color: "#FF0000"
  },
  {
    name: "SoundCloud",
    status: "connected",
    lastSync: "15 minutes ago",
    dataPoints: "Plays, Reposts, Comments",
    icon: "☁️",
    color: "#FF5500"
  },
  {
    name: "Ticketmaster",
    status: "disconnected",
    lastSync: "Never",
    dataPoints: "Event Sales, Venue Data, Attendance",
    icon: "🎫",
    color: "#0066CC"
  }
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'connected':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        badge: 'bg-green-400/20 text-green-400 border-green-400/30',
        text: 'Connected'
      };
    case 'warning':
      return {
        icon: <AlertCircle className="w-4 h-4 text-yellow-400" />,
        badge: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
        text: 'Sync Issue'
      };
    case 'error':
      return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        badge: 'bg-red-400/20 text-red-400 border-red-400/30',
        text: 'Error'
      };
    case 'disconnected':
      return {
        icon: <XCircle className="w-4 h-4 text-gray-400" />,
        badge: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
        text: 'Disconnected'
      };
    default:
      return {
        icon: <XCircle className="w-4 h-4 text-gray-400" />,
        badge: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
        text: 'Unknown'
      };
  }
};

export default function PlatformStatusWidget() {
  const connectedCount = platforms.filter(p => p.status === 'connected').length;
  const totalCount = platforms.length;

  return (
    <div className="glass-widget text-white h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold">Platform Integrations</h3>
        </div>
        <div className="glass-card px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-green-400">
            {connectedCount}/{totalCount} Connected
          </span>
        </div>
      </div>

      {/* Platform List */}
      <div className="space-y-3 w-full flex-1 overflow-y-auto">
        {platforms.slice(0, 6).map((platform, index) => {
          const statusConfig = getStatusConfig(platform.status);
          return (
            <div key={index} className="flex items-center justify-between p-3 glass-card rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{platform.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">{platform.name}</span>
                      {statusConfig.icon}
                    </div>
                    <div className="text-xs text-gray-400">
                      Last sync: {platform.lastSync}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={`${statusConfig.badge} text-xs`} variant="outline">
                  {statusConfig.text}
                </Badge>
                {(platform.status === 'warning' || platform.status === 'error') && (
                  <Button size="sm" className="glass-button text-white text-xs">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
                {platform.status === 'disconnected' && (
                  <Button size="sm" className="glass-button-primary text-white text-xs">
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Collection Status */}
      <div className="glass-card rounded-lg p-4 w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm text-white">Data Collection Status</span>
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </div>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Next full sync:</span>
            <span className="text-white">In 4 hours</span>
          </div>
          <div className="flex justify-between">
            <span>Data points collected today:</span>
            <span className="text-green-400">2.4M+</span>
          </div>
          <div className="flex justify-between">
            <span>API rate limit usage:</span>
            <span className="text-white">73% (Normal)</span>
          </div>
        </div>
      </div>
      
      {/* Manage Button */}
      <Button className="w-full glass-button text-white font-medium py-2">
        <Settings className="w-4 h-4 mr-2" />
        Manage Integrations
      </Button>
    </div>
  );
} 