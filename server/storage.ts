import { 
  User, InsertUser, Document, InsertDocument, 
  Flashcard, InsertFlashcard, Quiz, InsertQuiz, 
  Summary, InsertSummary, QuizQuestion, TerminologyItem,
  Badge, InsertBadge, UserAchievement, InsertUserAchievement,
  UserStats, InsertUserStats
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentStatus(id: number, status: string): Promise<Document | undefined>;
  
  // Flashcard methods
  getFlashcardsByDocumentId(documentId: number): Promise<Flashcard[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  createFlashcards(flashcards: InsertFlashcard[]): Promise<Flashcard[]>;
  
  // Quiz methods
  getQuizzesByDocumentId(documentId: number): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // Summary methods
  getSummaryByDocumentId(documentId: number): Promise<Summary | undefined>;
  createSummary(summary: InsertSummary): Promise<Summary>;
  
  // Badge methods
  getBadges(): Promise<Badge[]>;
  getBadgesByCategory(category: string): Promise<Badge[]>;
  getBadge(id: number): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // User Achievement methods
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  checkAndAwardBadges(userId: number): Promise<UserAchievement[]>;
  
  // User Stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, updates: Partial<InsertUserStats>): Promise<UserStats | undefined>;
  incrementUserStat(userId: number, statName: keyof InsertUserStats, incrementBy?: number): Promise<UserStats | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private flashcards: Map<number, Flashcard>;
  private quizzes: Map<number, Quiz>;
  private summaries: Map<number, Summary>;
  private badges: Map<number, Badge>;
  private userAchievements: Map<number, UserAchievement>;
  private userStats: Map<number, UserStats>;
  
  private userIdCounter: number;
  private documentIdCounter: number;
  private flashcardIdCounter: number;
  private quizIdCounter: number;
  private summaryIdCounter: number;
  private badgeIdCounter: number;
  private userAchievementIdCounter: number;
  private userStatsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.flashcards = new Map();
    this.quizzes = new Map();
    this.summaries = new Map();
    this.badges = new Map();
    this.userAchievements = new Map();
    this.userStats = new Map();
    
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
    this.flashcardIdCounter = 1;
    this.quizIdCounter = 1;
    this.summaryIdCounter = 1;
    this.badgeIdCounter = 1;
    this.userAchievementIdCounter = 1;
    this.userStatsIdCounter = 1;
    
    // Initialize with default badges
    this.initializeDefaultBadges();
  }
  
  private async initializeDefaultBadges() {
    // Document badges
    await this.createBadge({
      name: "Document Novice",
      description: "Upload your first document",
      icon: "📄",
      category: "document",
      requiredCount: 1
    });
    
    await this.createBadge({
      name: "Document Explorer",
      description: "Upload 5 documents",
      icon: "📚",
      category: "document",
      requiredCount: 5
    });
    
    await this.createBadge({
      name: "Document Master",
      description: "Upload 10 documents",
      icon: "🏆",
      category: "document",
      requiredCount: 10
    });
    
    // Flashcard badges
    await this.createBadge({
      name: "Flashcard Beginner",
      description: "Review 10 flashcards",
      icon: "🃏",
      category: "flashcard",
      requiredCount: 10
    });
    
    await this.createBadge({
      name: "Flashcard Enthusiast",
      description: "Review 50 flashcards",
      icon: "🎴",
      category: "flashcard",
      requiredCount: 50
    });
    
    await this.createBadge({
      name: "Flashcard Champion",
      description: "Review 100 flashcards",
      icon: "🏅",
      category: "flashcard",
      requiredCount: 100
    });
    
    // Quiz badges
    await this.createBadge({
      name: "Quiz Taker",
      description: "Complete your first quiz",
      icon: "❓",
      category: "quiz",
      requiredCount: 1
    });
    
    await this.createBadge({
      name: "Quiz Enthusiast",
      description: "Complete 5 quizzes",
      icon: "🧩",
      category: "quiz",
      requiredCount: 5
    });
    
    await this.createBadge({
      name: "Quiz Master",
      description: "Complete 10 quizzes with at least 80% correct answers",
      icon: "🎓",
      category: "quiz",
      requiredCount: 10
    });
    
    // Study time badges
    await this.createBadge({
      name: "Study Rookie",
      description: "Study for 60 minutes total",
      icon: "⏱️",
      category: "study",
      requiredCount: 60
    });
    
    await this.createBadge({
      name: "Study Pro",
      description: "Study for 300 minutes total",
      icon: "⏰",
      category: "study",
      requiredCount: 300
    });
    
    await this.createBadge({
      name: "Study Legend",
      description: "Study for 600 minutes total",
      icon: "🕰️",
      category: "study",
      requiredCount: 600
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt,
      password: insertUser.password || null,
      email: insertUser.email || null,
      name: insertUser.name || null,
      image: insertUser.image || null,
      provider: insertUser.provider || null,
      providerId: insertUser.providerId || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getAllDocuments(userId?: number): Promise<Document[]> {
    let documents = Array.from(this.documents.values());
    
    // Filter by userId if provided
    if (userId !== undefined) {
      documents = documents.filter(doc => doc.userId === userId);
    }
    
    // Sort by uploadDate in descending order (newest first)
    return documents.sort((a, b) => {
      const dateA = new Date(a.uploadDate).getTime();
      const dateB = new Date(b.uploadDate).getTime();
      return dateB - dateA;
    });
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const uploadDate = new Date();
    const document: Document = { 
      ...insertDocument, 
      id, 
      uploadDate,
      processingStatus: insertDocument.processingStatus || "pending" 
    };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocumentStatus(id: number, status: string): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, processingStatus: status };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  // Flashcard methods
  async getFlashcardsByDocumentId(documentId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (flashcard) => flashcard.documentId === documentId
    );
  }
  
  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.flashcardIdCounter++;
    const flashcard: Flashcard = { ...insertFlashcard, id };
    this.flashcards.set(id, flashcard);
    return flashcard;
  }
  
  async createFlashcards(insertFlashcards: InsertFlashcard[]): Promise<Flashcard[]> {
    const flashcards: Flashcard[] = [];
    
    for (const insertFlashcard of insertFlashcards) {
      const flashcard = await this.createFlashcard(insertFlashcard);
      flashcards.push(flashcard);
    }
    
    return flashcards;
  }
  
  // Quiz methods
  async getQuizzesByDocumentId(documentId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.documentId === documentId
    );
  }
  
  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizIdCounter++;
    const quiz: Quiz = { ...insertQuiz, id };
    this.quizzes.set(id, quiz);
    return quiz;
  }
  
  // Summary methods
  async getSummaryByDocumentId(documentId: number): Promise<Summary | undefined> {
    return Array.from(this.summaries.values()).find(
      (summary) => summary.documentId === documentId
    );
  }
  
  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const id = this.summaryIdCounter++;
    const summary: Summary = { ...insertSummary, id };
    this.summaries.set(id, summary);
    return summary;
  }
  
  // Badge methods
  async getBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }
  
  async getBadgesByCategory(category: string): Promise<Badge[]> {
    return Array.from(this.badges.values()).filter(
      (badge) => badge.category === category
    );
  }
  
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }
  
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const createdAt = new Date();
    const badge: Badge = { ...insertBadge, id, createdAt };
    this.badges.set(id, badge);
    return badge;
  }
  
  // User Achievement methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      (achievement) => achievement.userId === userId
    );
  }
  
  async createUserAchievement(insertAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementIdCounter++;
    const earnedAt = new Date();
    const achievement: UserAchievement = { ...insertAchievement, id, earnedAt };
    this.userAchievements.set(id, achievement);
    return achievement;
  }
  
  async checkAndAwardBadges(userId: number): Promise<UserAchievement[]> {
    const userStats = await this.getUserStats(userId);
    if (!userStats) {
      return [];
    }
    
    const earnedBadges: UserAchievement[] = [];
    const existingAchievements = await this.getUserAchievements(userId);
    const existingBadgeIds = new Set(existingAchievements.map(a => a.badgeId));
    
    // Get all badges
    const allBadges = await this.getBadges();
    
    // Check each badge to see if the user qualifies
    for (const badge of allBadges) {
      // Skip if user already has this badge
      if (existingBadgeIds.has(badge.id)) {
        continue;
      }
      
      let qualified = false;
      
      // Check qualification based on badge category
      switch (badge.category) {
        case 'document':
          qualified = userStats.documentsUploaded >= badge.requiredCount;
          break;
        case 'flashcard':
          qualified = userStats.flashcardsReviewed >= badge.requiredCount;
          break;
        case 'quiz':
          qualified = userStats.quizzesCompleted >= badge.requiredCount;
          break;
        case 'study':
          qualified = userStats.totalStudyTime >= badge.requiredCount;
          break;
      }
      
      // If qualified, award the badge
      if (qualified) {
        const achievement = await this.createUserAchievement({
          userId,
          badgeId: badge.id
        });
        earnedBadges.push(achievement);
      }
    }
    
    return earnedBadges;
  }
  
  // User Stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(
      (stats) => stats.userId === userId
    );
  }
  
  async createUserStats(insertStats: InsertUserStats): Promise<UserStats> {
    const id = this.userStatsIdCounter++;
    const lastUpdated = new Date();
    const stats: UserStats = { 
      ...insertStats, 
      id, 
      lastUpdated,
      documentsUploaded: insertStats.documentsUploaded || 0,
      flashcardsCreated: insertStats.flashcardsCreated || 0,
      flashcardsReviewed: insertStats.flashcardsReviewed || 0,
      quizzesCompleted: insertStats.quizzesCompleted || 0,
      quizQuestionsAnswered: insertStats.quizQuestionsAnswered || 0,
      correctAnswers: insertStats.correctAnswers || 0,
      totalStudyTime: insertStats.totalStudyTime || 0
    };
    this.userStats.set(id, stats);
    return stats;
  }
  
  async updateUserStats(userId: number, updates: Partial<InsertUserStats>): Promise<UserStats | undefined> {
    // Get current stats or create new if not exists
    let stats = await this.getUserStats(userId);
    
    if (!stats) {
      stats = await this.createUserStats({ userId, ...updates });
      return stats;
    }
    
    // Update stats with new values
    const updatedStats: UserStats = {
      ...stats,
      ...updates,
      lastUpdated: new Date()
    };
    
    this.userStats.set(stats.id, updatedStats);
    
    // Check for new achievements after updating stats
    await this.checkAndAwardBadges(userId);
    
    return updatedStats;
  }
  
  async incrementUserStat(userId: number, statName: keyof InsertUserStats, incrementBy: number = 1): Promise<UserStats | undefined> {
    // Get current stats or create new if not exists
    let stats = await this.getUserStats(userId);
    
    if (!stats) {
      // Initialize with default values and the incremented stat
      const initialStats: InsertUserStats = {
        userId,
        documentsUploaded: 0,
        flashcardsCreated: 0,
        flashcardsReviewed: 0,
        quizzesCompleted: 0,
        quizQuestionsAnswered: 0,
        correctAnswers: 0,
        totalStudyTime: 0
      };
      
      // Only update the specific stat being incremented
      if (statName !== 'userId') {
        initialStats[statName] = incrementBy;
      }
      
      stats = await this.createUserStats(initialStats);
      await this.checkAndAwardBadges(userId);
      return stats;
    }
    
    // Create a copy of the stats to update
    const updatedStats: UserStats = { ...stats };
    
    // Only update the specific stat if it's a valid numeric field
    if (statName !== 'userId' && typeof stats[statName] === 'number') {
      updatedStats[statName] = (stats[statName] as number) + incrementBy;
    }
    
    updatedStats.lastUpdated = new Date();
    
    // Save the updated stats
    this.userStats.set(stats.id, updatedStats);
    
    // Check for new achievements after updating stats
    await this.checkAndAwardBadges(userId);
    
    return updatedStats;
  }
}

export const storage = new MemStorage();
