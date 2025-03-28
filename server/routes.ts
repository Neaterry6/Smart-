import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { processDocument, generateChatResponse } from "./openai";
import { z } from "zod";
import { 
  insertDocumentSchema, insertUserStatsSchema, 
  User, UserStats, Badge, UserAchievement
} from "@shared/schema";
import { setupAuth } from "./auth";
import spotifyService, { StudyMood, initializeSpotify } from "./spotify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Generate a unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      cb(null, uniqueSuffix + fileExtension);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed") as any, false);
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB size limit
  },
});

// Auth middleware
// Flag to bypass authentication (for development only)
const BYPASS_AUTH = true;

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (BYPASS_AUTH) {
    // In bypass mode, we create a dummy user if not authenticated
    if (!req.isAuthenticated()) {
      (req as any).user = {
        id: 1,
        username: "test-user",
        email: "test@example.com",
        name: "Test User",
        image: null,
        provider: null,
        providerId: null,
        createdAt: new Date()
      };
    }
    return next();
  }
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Documents endpoints
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      // Get only the current user's documents
      const documents = await storage.getAllDocuments((req.user as User).id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify document belongs to current user
      if (document.userId !== (req.user as User).id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents/upload", isAuthenticated, async (req, res) => {
  try {
    await upload.single("file")(req, res, async (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(400).json({ message: err.message });
      }
      try {
        // req.file is guaranteed to exist by multer middleware
        const file = req.file as Express.Multer.File;
        if (!file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const documentData = {
          filename: file.filename,
          originalName: file.originalname,
          fileSize: file.size,
          processingStatus: "processing",
          userId: (req.user as User).id,
        };

        const validatedData = insertDocumentSchema.parse(documentData);
        const document = await storage.createDocument(validatedData);

        // Process the document asynchronously
        processDocument(path.join(uploadsDir, document.filename), document.id)
          .catch(console.error);

        res.status(201).json(document);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: "Invalid document data", errors: error.errors });
        }
        res.status(500).json({ message: "Failed to upload document" });
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to process upload" });
  }
});

  // Flashcards endpoints
  app.get("/api/documents/:id/flashcards", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify document belongs to current user
      if (document.userId !== (req.user as User).id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const flashcards = await storage.getFlashcardsByDocumentId(documentId);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  // Quizzes endpoints
  app.get("/api/documents/:id/quizzes", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify document belongs to current user
      if (document.userId !== (req.user as User).id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const quizzes = await storage.getQuizzesByDocumentId(documentId);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.post("/api/documents/:id/quizzes", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify document belongs to current user
      if (document.userId !== (req.user as User).id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { type, difficulty, numQuestions } = req.body;
      
      if (!type || !difficulty || !numQuestions) {
        return res.status(400).json({ message: "Missing required quiz parameters" });
      }
      
      // This would normally generate a new quiz on-demand based on parameters
      // For now, we'll return existing quizzes that match the document
      const quizzes = await storage.getQuizzesByDocumentId(documentId);
      
      if (quizzes.length === 0) {
        return res.status(404).json({ message: "No quizzes available for this document yet" });
      }
      
      // Find a quiz matching the requested parameters, or return the first one
      const matchingQuiz = quizzes.find(q => q.type === type && q.difficulty === difficulty) || quizzes[0];
      
      res.json(matchingQuiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Chat endpoint - publicly accessible
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Missing or invalid message" });
      }
      
      const response = await generateChatResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

app.get("/api/documents/:id/summary", isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify document belongs to current user
      if (document.userId !== (req.user as User).id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const summary = await storage.getSummaryByDocumentId(documentId);
      
      if (!summary) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  });

  // Dashboard and achievement system endpoints
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      
      // Get user statistics
      let userStats = await storage.getUserStats(userId);
      
      // Create user stats if they don't exist yet
      if (!userStats) {
        userStats = await storage.createUserStats({
          userId,
          documentsUploaded: 0,
          flashcardsCreated: 0,
          flashcardsReviewed: 0,
          quizzesCompleted: 0,
          quizQuestionsAnswered: 0,
          correctAnswers: 0,
          totalStudyTime: 0
        });
      }
      
      // Get user documents (most recent first)
      const documents = await storage.getAllDocuments(userId);
      
      // Get user achievements
      const achievements = await storage.getUserAchievements(userId);
      
      // Get badge details for each achievement
      const achievementDetails = await Promise.all(
        achievements.map(async (achievement) => {
          const badge = await storage.getBadge(achievement.badgeId);
          return {
            ...achievement,
            badge
          };
        })
      );
      
      // Build the dashboard response
      const dashboardData = {
        stats: userStats,
        recentDocuments: documents.slice(0, 5), // Only take the 5 most recent
        achievements: achievementDetails,
        documentsCount: documents.length
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  
  // Get all available badges
  app.get("/api/badges", isAuthenticated, async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });
  
  // Get badges by category
  app.get("/api/badges/category/:category", isAuthenticated, async (req, res) => {
    try {
      const category = req.params.category;
      const badges = await storage.getBadgesByCategory(category);
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });
  
  // Get user achievements
  app.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const achievements = await storage.getUserAchievements(userId);
      
      // Get badge details for each achievement
      const achievementDetails = await Promise.all(
        achievements.map(async (achievement) => {
          const badge = await storage.getBadge(achievement.badgeId);
          return {
            ...achievement,
            badge
          };
        })
      );
      
      res.json(achievementDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  
  // Update user stat
  app.post("/api/stats/update", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const { statName, value, increment } = req.body;
      
      if (!statName) {
        return res.status(400).json({ message: "Missing statName parameter" });
      }
      
      let updatedStats;
      
      if (increment) {
        // Increment the stat by the specified value
        updatedStats = await storage.incrementUserStat(
          userId, 
          statName as keyof UserStats, 
          typeof value === 'number' ? value : 1
        );
      } else {
        // Set the stat to the specified value
        const updates: Partial<UserStats> = {};
        updates[statName as keyof UserStats] = value;
        updatedStats = await storage.updateUserStats(userId, updates);
      }
      
      // Check and award any new badges based on the updated stats
      const newAchievements = await storage.checkAndAwardBadges(userId);
      
      res.json({
        stats: updatedStats,
        newAchievements: newAchievements.length > 0 ? newAchievements : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update stats" });
    }
  });
  
  // Record study time
  app.post("/api/stats/study-time", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const { minutes } = req.body;
      
      if (typeof minutes !== 'number' || minutes <= 0) {
        return res.status(400).json({ message: "Invalid study time" });
      }
      
      // Update the total study time
      const updatedStats = await storage.incrementUserStat(
        userId,
        'totalStudyTime',
        minutes
      );
      
      // Check and award any new badges based on the updated stats
      const newAchievements = await storage.checkAndAwardBadges(userId);
      
      res.json({
        stats: updatedStats,
        newAchievements: newAchievements.length > 0 ? newAchievements : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to record study time" });
    }
  });

  // Callback functions to track user activity and update stats
  const trackDocumentUpload = async (userId: number) => {
    await storage.incrementUserStat(userId, 'documentsUploaded');
  };
  
  const trackFlashcardReview = async (userId: number, count: number = 1) => {
    await storage.incrementUserStat(userId, 'flashcardsReviewed', count);
  };
  
  const trackQuizCompletion = async (userId: number, correct: number, total: number) => {
    await storage.incrementUserStat(userId, 'quizzesCompleted');
    await storage.incrementUserStat(userId, 'quizQuestionsAnswered', total);
    await storage.incrementUserStat(userId, 'correctAnswers', correct);
  };

  // Modified document upload to track stats
  app.post("/api/documents/track-upload", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      await trackDocumentUpload(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to track document upload" });
    }
  });
  
  // Track flashcard reviews
  app.post("/api/flashcards/track-review", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const { count } = req.body;
      await trackFlashcardReview(userId, count || 1);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to track flashcard review" });
    }
  });
  
  // Track quiz completion
  app.post("/api/quizzes/track-completion", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const { correct, total } = req.body;
      
      if (typeof correct !== 'number' || typeof total !== 'number') {
        return res.status(400).json({ message: "Invalid quiz statistics" });
      }
      
      await trackQuizCompletion(userId, correct, total);
      
      // Check for new achievements
      const newAchievements = await storage.checkAndAwardBadges(userId);
      
      res.json({
        success: true,
        newAchievements: newAchievements.length > 0 ? newAchievements : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to track quiz completion" });
    }
  });

  // Initialize Spotify API on server start
  initializeSpotify().catch(error => {
    console.error('Failed to initialize Spotify API:', error);
  });

  // Spotify API endpoints
  
  // Get playlists by study mood
  app.get("/api/spotify/playlists/:mood", async (req, res) => {
    try {
      const mood = req.params.mood as StudyMood;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (!['focus', 'relax', 'energize', 'ambient', 'classical'].includes(mood)) {
        return res.status(400).json({ message: "Invalid mood. Choose from: focus, relax, energize, ambient, classical" });
      }
      
      const playlists = await spotifyService.searchStudyPlaylists(mood, limit);
      
      res.json({
        mood,
        playlists: playlists.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          image: playlist.images && playlist.images.length > 0 ? playlist.images[0].url : null,
          trackCount: playlist.tracks?.total || 0,
          externalUrl: playlist.external_urls?.spotify || null,
          owner: playlist.owner?.display_name || null
        }))
      });
    } catch (error) {
      console.error("Error fetching Spotify playlists:", error);
      res.status(500).json({ message: "Failed to fetch Spotify playlists" });
    }
  });
  
  // Get playlist details with tracks
  app.get("/api/spotify/playlist/:id", async (req, res) => {
    try {
      const playlistId = req.params.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const playlistDetails = await spotifyService.getPlaylistDetails(playlistId);
      const tracks = await spotifyService.getPlaylistTracks(playlistId, limit);
      
      // Format the response
      const playlist = {
        id: playlistDetails.id,
        name: playlistDetails.name,
        description: playlistDetails.description,
        image: playlistDetails.images && playlistDetails.images.length > 0 
          ? playlistDetails.images[0].url 
          : null,
        trackCount: playlistDetails.tracks?.total || 0,
        externalUrl: playlistDetails.external_urls?.spotify || null,
        owner: playlistDetails.owner?.display_name || null,
        tracks: tracks.map(item => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map(artist => artist.name).join(', '),
          album: item.track.album.name,
          duration: item.track.duration_ms,
          previewUrl: item.track.preview_url,
          externalUrl: item.track.external_urls?.spotify || null,
          image: item.track.album.images && item.track.album.images.length > 0 
            ? item.track.album.images[0].url 
            : null
        }))
      };
      
      res.json(playlist);
    } catch (error) {
      console.error("Error fetching Spotify playlist details:", error);
      res.status(500).json({ message: "Failed to fetch Spotify playlist details" });
    }
  });
  
  // Get recommendations based on study subject and mood
  app.get("/api/spotify/recommendations", async (req, res) => {
    try {
      const { subject, mood } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (!subject || typeof subject !== 'string') {
        return res.status(400).json({ message: "Missing or invalid 'subject' parameter" });
      }
      
      if (!mood || !['focus', 'relax', 'energize', 'ambient', 'classical'].includes(mood as string)) {
        return res.status(400).json({ message: "Invalid mood. Choose from: focus, relax, energize, ambient, classical" });
      }
      
      const recommendations = await spotifyService.getStudyPlaylistRecommendations(
        subject as string,
        mood as StudyMood,
        limit
      );
      
      // Format the response
      const tracks = recommendations.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls?.spotify || null,
        image: track.album.images && track.album.images.length > 0 
          ? track.album.images[0].url 
          : null
      }));
      
      res.json({
        subject,
        mood,
        tracks
      });
    } catch (error) {
      console.error("Error fetching Spotify recommendations:", error);
      res.status(500).json({ message: "Failed to fetch Spotify recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}