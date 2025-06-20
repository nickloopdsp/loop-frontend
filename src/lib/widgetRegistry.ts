import { WidgetData } from "@shared/schema";
import ArtistHealthMonitor from "@/components/widgets/ArtistHealthMonitor";
import TrendTracker from "@/components/widgets/TrendTracker";
import ArtistMapTool from "@/components/widgets/ArtistMapTool";
import AITodoCalendar from "@/components/widgets/AITodoCalendar";
import StreamingStatsWidget from "@/components/widgets/StreamingStatsWidget";
import SocialMediaWidget from "@/components/widgets/SocialMediaWidget";
import GrowthPlanWidget from "@/components/widgets/GrowthPlanWidget";
import PlatformStatusWidget from "@/components/widgets/PlatformStatusWidget";
import HeroSection from "@/components/widgets/HeroSection";
import FansWidget from "@/components/widgets/FansWidget";
import FollowersActivityWidget from "@/components/widgets/FollowersActivityWidget";
import ConcertsWidget from "@/components/widgets/ConcertsWidget";
import StrategyReviewWidget from "@/components/widgets/StrategyReviewWidget";
import GlobalMapWidget from "@/components/widgets/GlobalMapWidget";
// import SimilarArtistsWidget from "@/components/widgets/SimilarArtistsWidget";
import MCChatWidget from "@/components/widgets/MCChatWidget";
import SocialMediaTracker from "@/components/widgets/SocialMediaTracker";
import GenerateChordsWidget from "@/components/widgets/GenerateChordsWidget";
import StemSeparationWidget from "@/components/widgets/StemSeparationWidget";

export interface WidgetConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  icon: string;
  description: string;
}

export const widgetRegistry: Record<string, WidgetConfig> = {
  "hero-section": {
    id: "hero-section",
    name: "Hero Section",
    component: HeroSection,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 8, h: 4 },
    icon: "🎵",
    description: "Main hero section with chat interface",
  },
  "mc-chat": {
    id: "mc-chat",
    name: "MC Chat",
    component: MCChatWidget,
    defaultSize: { w: 12, h: 5 },
    minSize: { w: 8, h: 4 },
    icon: "💬",
    description: "Interactive Music Concierge chat interface",
  },
  "fans": {
    id: "fans",
    name: "Fans",
    component: FansWidget,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    icon: "👥",
    description: "Fan growth analytics",
  },
  "followers-activity": {
    id: "followers-activity",
    name: "Followers Activity",
    component: FollowersActivityWidget,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    icon: "📊",
    description: "Platform-specific follower activity",
  },
  "concerts": {
    id: "concerts",
    name: "Checklist",
    component: ConcertsWidget,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 6, h: 4 },
    icon: "📋",
    description: "Task checklist and calendar management",
  },
  "score": {
    id: "score",
    name: "Strategy Review",
    component: StrategyReviewWidget,
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
    icon: "📄",
    description: "AI-powered campaign strategy analysis",
  },
  "top-songs": {
    id: "top-songs",
    name: "Social Media Tracker",
    component: SocialMediaTracker,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    icon: "📱",
    description: "Track social media trends and collaboration opportunities",
  },
  "global-map": {
    id: "global-map",
    name: "Global Map",
    component: GlobalMapWidget,
    defaultSize: { w: 8, h: 6 },
    minSize: { w: 6, h: 4 },
    icon: "🌍",
    description: "Global fan distribution map",
  },
  "health-monitor": {
    id: "health-monitor",
    name: "Health Monitor",
    component: ArtistHealthMonitor,
    defaultSize: { w: 8, h: 6 },
    minSize: { w: 6, h: 4 },
    icon: "📊",
    description: "Track your performance metrics and growth",
  },
  "trend-tracker": {
    id: "trend-tracker",
    name: "Trend Tracker",
    component: TrendTracker,
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
    icon: "📈",
    description: "Stay updated with trending topics",
  },
  "artist-map": {
    id: "artist-map",
    name: "Fan Heatmap",
    component: ArtistMapTool,
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    icon: "🗺️",
    description: "Visualize your global fan distribution",
  },
  "ai-todo": {
    id: "ai-todo",
    name: "AI To-Do & Calendar",
    component: AITodoCalendar,
    defaultSize: { w: 6, h: 5 },
    minSize: { w: 4, h: 4 },
    icon: "📅",
    description: "Manage tasks and schedule with AI assistance",
  },
  "streaming-stats": {
    id: "streaming-stats",
    name: "Streaming Analytics",
    component: StreamingStatsWidget,
    defaultSize: { w: 6, h: 8 },
    minSize: { w: 4, h: 6 },
    icon: "📊",
    description: "Detailed streaming platform analytics",
  },
  "social-media": {
    id: "social-media",
    name: "Social Media",
    component: SocialMediaWidget,
    defaultSize: { w: 6, h: 8 },
    minSize: { w: 4, h: 6 },
    icon: "📱",
    description: "Social media performance tracking",
  },
  "growth-plan": {
    id: "growth-plan",
    name: "Growth Plan",
    component: GrowthPlanWidget,
    defaultSize: { w: 6, h: 6 },
    minSize: { w: 4, h: 4 },
    icon: "🎯",
    description: "AI-powered growth recommendations",
  },
  "platform-status": {
    id: "platform-status",
    name: "Platform Status",
    component: PlatformStatusWidget,
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    icon: "🔗",
    description: "Connected platform status monitoring",
  },
  "generate-chords": {
    id: "generate-chords",
    name: "Chord Analysis",
    component: GenerateChordsWidget,
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    icon: "🎹",
    description: "AI-powered chord transcription and analysis",
  },
  "stem-separation": {
    id: "stem-separation",
    name: "Vocal & Instrumental Stems",
    component: StemSeparationWidget,
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    icon: "🎤",
    description: "Separate audio into vocal and instrumental stems",
  },
  // "similar-artists": {
  //   id: "similar-artists",
  //   name: "Similar Artists",
  //   component: SimilarArtistsWidget,
  //   defaultSize: { w: 4, h: 8 },
  //   minSize: { w: 3, h: 6 },
  //   icon: "👤",
  //   description: "Similar artist recommendations",
  // },
};

export function getWidgetComponent(type: string) {
  const config = widgetRegistry[type];
  return config ? config.component : null;
}

export function createWidget(type: string, position?: { x: number; y: number }): WidgetData | null {
  const config = widgetRegistry[type];
  if (!config) return null;

  return {
    id: `${type}-${Date.now()}`,
    type,
    x: position?.x || 0,
    y: position?.y || 0,
    w: config.defaultSize.w,
    h: config.defaultSize.h,
    minW: config.minSize.w,
    minH: config.minSize.h,
  };
}
