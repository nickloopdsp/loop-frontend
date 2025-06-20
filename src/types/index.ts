export type InsertUser = any //z.infer<typeof insertUserSchema>;
export type User = any//typeof users.$inferSelect;
export type InsertDashboardLayout = any // z.infer<typeof insertDashboardLayoutSchema>;
export type DashboardLayout = any // typeof dashboardLayouts.$inferSelect;

// Widget and dashboard types
export interface WidgetData {
    id: string;
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
}

export interface HealthMetrics {
    streams: string;
    followers: string;
    revenue: string;
    streamGrowth: number;
    followersGrowth: number;
    revenueGrowth: number;
}

export interface TrendingItem {
    rank: number;
    name: string;
    mentions: string;
    growth: number;
}

export interface GeoData {
    topRegion: { name: string; listeners: string };
    secondRegion: { name: string; listeners: string };
    thirdRegion: { name: string; listeners: string };
}

export interface TodoItem {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    dueDate?: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'mc';
    message: string;
    timestamp: Date;
}
