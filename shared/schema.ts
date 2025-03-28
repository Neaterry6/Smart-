import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  name: text("name"),
  image: text("image"),
  provider: text("provider"), // 'local', 'google', 'github', 'facebook'
  providerId: text("provider_id"), // ID from the provider
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  processingStatus: text("processing_status").notNull().default("pending"),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
});

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  type: text("type").notNull(),
  difficulty: text("difficulty").notNull(),
  questions: jsonb("questions").notNull(),
});

export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  keyConcepts: jsonb("key_concepts").notNull(),
  terminology: jsonb("terminology").notNull(),
  summary: text("summary").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  image: true,
  provider: true,
  providerId: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  filename: true,
  originalName: true,
  fileSize: true,
  processingStatus: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  documentId: true,
  front: true,
  back: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  documentId: true,
  type: true,
  difficulty: true,
  questions: true,
});

export const insertSummarySchema = createInsertSchema(summaries).pick({
  documentId: true,
  keyConcepts: true,
  terminology: true,
  summary: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Flashcard = typeof flashcards.$inferSelect;

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizQuestion = {
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
};

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;
export type TerminologyItem = {
  term: string;
  definition: string;
};

// Define badges for user achievements
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // study, quiz, flashcard, etc.
  requiredCount: integer("required_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define user achievements to track progress
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Define user stats to track progress
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentsUploaded: integer("documents_uploaded").default(0).notNull(),
  flashcardsCreated: integer("flashcards_created").default(0).notNull(),
  flashcardsReviewed: integer("flashcards_reviewed").default(0).notNull(),
  quizzesCompleted: integer("quizzes_completed").default(0).notNull(),
  quizQuestionsAnswered: integer("quiz_questions_answered").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  totalStudyTime: integer("total_study_time").default(0).notNull(), // in minutes
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Create the insert schemas for new tables
export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  icon: true,
  category: true,
  requiredCount: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  badgeId: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).pick({
  userId: true,
  documentsUploaded: true,
  flashcardsCreated: true,
  flashcardsReviewed: true,
  quizzesCompleted: true,
  quizQuestionsAnswered: true,
  correctAnswers: true,
  totalStudyTime: true,
});

// Export types for the new tables
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;
