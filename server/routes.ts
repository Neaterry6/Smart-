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
import { insertDocumentSchema, User } from "@shared/schema";
import { setupAuth } from "./auth";

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
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
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

  const httpServer = createServer(app);
  return httpServer;
}