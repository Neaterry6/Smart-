import { 
  User, InsertUser, Document, InsertDocument, 
  Flashcard, InsertFlashcard, Quiz, InsertQuiz, 
  Summary, InsertSummary, QuizQuestion, TerminologyItem
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private flashcards: Map<number, Flashcard>;
  private quizzes: Map<number, Quiz>;
  private summaries: Map<number, Summary>;
  
  private userIdCounter: number;
  private documentIdCounter: number;
  private flashcardIdCounter: number;
  private quizIdCounter: number;
  private summaryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.flashcards = new Map();
    this.quizzes = new Map();
    this.summaries = new Map();
    
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
    this.flashcardIdCounter = 1;
    this.quizIdCounter = 1;
    this.summaryIdCounter = 1;
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
}

export const storage = new MemStorage();
