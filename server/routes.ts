import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDashboardLayoutSchema, type ChatMessage } from "@shared/schema";
import { soundchartsAPI } from "./soundcharts";
import { createAIService } from "./services/ai-service";
import { initializeMusicAIService, getMusicAIService } from "./services/musicai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize AI service if API key is available
  console.log('Initializing AI service...');
  console.log('API Key available:', !!process.env.OPENAI_API_KEY);
  console.log('API Key length:', process.env.OPENAI_API_KEY?.length || 0);
  
  const aiService = process.env.OPENAI_API_KEY 
    ? createAIService(process.env.OPENAI_API_KEY) 
    : null;

  if (!aiService) {
    console.warn('AI service not initialized - no API key found');
  } else {
    console.log('AI service initialized successfully');
  }

  // Initialize Music.AI service with the provided API key
  const MUSICAI_API_KEY = 'a156815f-de48-4e30-a966-341577c69a71';
  console.log('Initializing Music.AI service...');
  initializeMusicAIService(MUSICAI_API_KEY);
  console.log('Music.AI service initialized successfully');

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

  // AI Chat endpoints
  app.post("/api/chat/message", async (req, res) => {
    if (!aiService) {
      return res.status(503).json({ 
        error: "AI service not available. Please configure OPENAI_API_KEY." 
      });
    }

    try {
      const { message, conversationHistory = [], context = {} } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await aiService.generateChatResponse(
        message,
        conversationHistory,
        context
      );

      res.json({ 
        message: response,
        timestamp: new Date()
      });
    } catch (error: any) {
      console.error("AI chat error:", error);
      
      // Pass through the actual error message for better debugging
      let errorMessage = "Failed to generate response. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          status: error.status,
          code: error.code,
          type: error.type
        } : undefined
      });
    }
  });

  // Streaming chat endpoint (for future use)
  app.post("/api/chat/stream", async (req, res) => {
    if (!aiService) {
      return res.status(503).json({ 
        error: "AI service not available. Please configure OPENAI_API_KEY." 
      });
    }

    try {
      const { message, conversationHistory = [], context = {} } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of aiService.streamChatResponse(
        message,
        conversationHistory,
        context
      )) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error("AI streaming error:", error);
      res.status(500).json({ 
        error: "Failed to stream response. Please try again." 
      });
    }
  });

  // Strategy analysis endpoint
  app.post("/api/chat/analyze-strategy", async (req, res) => {
    if (!aiService) {
      return res.status(503).json({ 
        error: "AI service not available. Please configure OPENAI_API_KEY." 
      });
    }

    try {
      const { content, type = 'marketing' } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Document content is required" });
      }

      const analysis = await aiService.analyzeStrategy(content, type);
      res.json(analysis);
    } catch (error) {
      console.error("Strategy analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze strategy. Please try again." 
      });
    }
  });

  // Soundcharts API endpoints
  app.get("/api/soundcharts/search/artists", async (req, res) => {
    try {
      const { q, limit = 10 } = req.query;
      if (!q) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }
      const results = await soundchartsAPI.searchArtists(q as string, Number(limit));
      res.json(results);
    } catch (error) {
      console.error("Error searching artists:", error);
      res.status(500).json({ error: "Failed to search artists" });
    }
  });

  app.get("/api/soundcharts/artist/:uuid", async (req, res) => {
    try {
      const { uuid } = req.params;
      const artist = await soundchartsAPI.getArtist(uuid);
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist:", error);
      res.status(500).json({ error: "Failed to fetch artist data" });
    }
  });

  app.get("/api/soundcharts/artist/:uuid/stats", async (req, res) => {
    try {
      const { uuid } = req.params;
      const stats = await soundchartsAPI.getArtistStats(uuid);
      
      // Add cache-busting headers to ensure fresh data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching artist stats:", error);
      res.status(500).json({ error: "Failed to fetch artist stats" });
    }
  });

  app.get("/api/soundcharts/artist/:uuid/audience/:platform", async (req, res) => {
    try {
      const { uuid, platform } = req.params;
      const audience = await soundchartsAPI.getArtistAudience(uuid, platform);
      res.json(audience);
    } catch (error) {
      console.error("Error fetching artist audience:", error);
      res.status(500).json({ error: "Failed to fetch artist audience" });
    }
  });

  app.get("/api/soundcharts/artist/:uuid/streaming/:platform", async (req, res) => {
    try {
      const { uuid, platform } = req.params;
      const streaming = await soundchartsAPI.getArtistStreaming(uuid, platform);
      res.json(streaming);
    } catch (error) {
      console.error("Error fetching artist streaming:", error);
      res.status(500).json({ error: "Failed to fetch artist streaming data" });
    }
  });

  app.get("/api/soundcharts/artist/:uuid/events", async (req, res) => {
    try {
      const { uuid } = req.params;
      const events = await soundchartsAPI.getArtistEvents(uuid);
      res.json(events);
    } catch (error) {
      console.error("Error fetching artist events:", error);
      res.status(500).json({ error: "Failed to fetch artist events" });
    }
  });

  app.get("/api/soundcharts/artist/:uuid/songs", async (req, res) => {
    try {
      const { uuid } = req.params;
      const { limit = 20 } = req.query;
      const songs = await soundchartsAPI.getArtistSongs(uuid, Number(limit));
      res.json(songs);
    } catch (error) {
      console.error("Error fetching artist songs:", error);
      res.status(500).json({ error: "Failed to fetch artist songs" });
    }
  });

  app.get("/api/soundcharts/artist/:uuid/playlists/:platform", async (req, res) => {
    try {
      const { uuid, platform } = req.params;
      const playlists = await soundchartsAPI.getArtistPlaylists(uuid, platform);
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching artist playlists:", error);
      res.status(500).json({ error: "Failed to fetch artist playlists" });
    }
  });

  app.get("/api/soundcharts/artist/:uuid/similar", async (req, res) => {
    try {
      const { uuid } = req.params;
      const similar = await soundchartsAPI.getSimilarArtists(uuid);
      res.json(similar);
    } catch (error) {
      console.error("Error fetching similar artists:", error);
      res.status(500).json({ error: "Failed to fetch similar artists" });
    }
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

  // Music.AI endpoints
  app.get("/api/musicai/upload", async (req, res) => {
    try {
      const musicAI = getMusicAIService();
      if (!musicAI) {
        return res.status(503).json({ error: "Music.AI service not initialized" });
      }
      const urls = await musicAI.getUploadUrls();
      res.json(urls);
    } catch (error: any) {
      console.error("Error getting upload URLs:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/musicai/workflows", async (req, res) => {
    try {
      const musicAI = getMusicAIService();
      if (!musicAI) {
        return res.status(503).json({ error: "Music.AI service not initialized" });
      }
      const { page = 0, size = 100 } = req.query;
      const workflows = await musicAI.getWorkflows(Number(page), Number(size));
      res.json(workflows);
    } catch (error: any) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/musicai/job", async (req, res) => {
    try {
      const musicAI = getMusicAIService();
      if (!musicAI) {
        return res.status(503).json({ error: "Music.AI service not initialized" });
      }
      const result = await musicAI.createJob(req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/musicai/job/:id", async (req, res) => {
    try {
      const musicAI = getMusicAIService();
      if (!musicAI) {
        return res.status(503).json({ error: "Music.AI service not initialized" });
      }
      const job = await musicAI.getJob(req.params.id);
      res.json(job);
    } catch (error: any) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/musicai/job/:id/status", async (req, res) => {
    try {
      const musicAI = getMusicAIService();
      if (!musicAI) {
        return res.status(503).json({ error: "Music.AI service not initialized" });
      }
      const status = await musicAI.getJobStatus(req.params.id);
      res.json(status);
    } catch (error: any) {
      console.error("Error fetching job status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/musicai/jobs", async (req, res) => {
    try {
      const musicAI = getMusicAIService();
      if (!musicAI) {
        return res.status(503).json({ error: "Music.AI service not initialized" });
      }
      const jobs = await musicAI.getJobs(req.query as any);
      res.json(jobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/musicai/job/:id", async (req, res) => {
    try {
      const musicAI = getMusicAIService();
      if (!musicAI) {
        return res.status(503).json({ error: "Music.AI service not initialized" });
      }
      const result = await musicAI.deleteJob(req.params.id);
      res.json(result);
    } catch (error: any) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
