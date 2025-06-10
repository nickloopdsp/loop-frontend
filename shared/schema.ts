import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  layout: jsonb("layout").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDashboardLayoutSchema = createInsertSchema(dashboardLayouts).pick({
  userId: true,
  layout: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDashboardLayout = z.infer<typeof insertDashboardLayoutSchema>;
export type DashboardLayout = typeof dashboardLayouts.$inferSelect;

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
