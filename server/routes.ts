import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDashboardLayoutSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock data endpoints
  app.get("/api/mock/health-metrics", (req, res) => {
    res.json({
      streams: "2.1M",
      followers: "45.8K",
      revenue: "$8,540",
      streamGrowth: 12.5,
      followersGrowth: 8.3,
      revenueGrowth: 15.2,
    });
  });

  app.get("/api/mock/trending", (req, res) => {
    res.json([
      { rank: 1, name: "Synthwave Revival", mentions: "2.3K", growth: 45 },
      { rank: 2, name: "LoFi Beats", mentions: "1.8K", growth: 32 },
      { rank: 3, name: "Ambient Chill", mentions: "1.2K", growth: 28 },
      { rank: 4, name: "Electronic Pop", mentions: "0.9K", growth: 18 },
      { rank: 5, name: "Indie Rock", mentions: "0.7K", growth: 12 },
    ]);
  });

  app.get("/api/mock/geo-data", (req, res) => {
    res.json({
      topRegion: { name: "North America", listeners: "125K" },
      secondRegion: { name: "Europe", listeners: "89K" },
      thirdRegion: { name: "Asia-Pacific", listeners: "43K" },
    });
  });

  app.get("/api/mock/todos", (req, res) => {
    res.json([
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
    ]);
  });

  app.get("/api/mock/chat-messages", (req, res) => {
    res.json([
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
    ]);
  });

  // Dashboard layout endpoints
  app.get("/api/dashboard-layout/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const layout = await storage.getDashboardLayout(userId);
      res.json(layout);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard layout" });
    }
  });

  app.post("/api/dashboard-layout", async (req, res) => {
    try {
      const validatedData = insertDashboardLayoutSchema.parse(req.body);
      const layout = await storage.saveDashboardLayout(validatedData);
      res.json(layout);
    } catch (error) {
      res.status(400).json({ message: "Invalid dashboard layout data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
