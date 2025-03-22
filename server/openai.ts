import OpenAI from "openai";
import fs from "fs";
import { storage } from "./storage";
import { PDFExtract, PDFExtractOptions } from "pdf.js-extract";
import { InsertFlashcard, InsertQuiz, InsertSummary, QuizQuestion, TerminologyItem } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key" });
const pdfExtract = new PDFExtract();

// Extract text from PDF
async function extractTextFromPDF(filePath: string): Promise<string> {
  const options: PDFExtractOptions = {};
  
  try {
    const data = await pdfExtract.extract(filePath, options);
    const text = data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n\n');
    return text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Generate flashcards from document text
async function generateFlashcards(text: string, documentId: number): Promise<InsertFlashcard[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert study assistant that creates high-quality flashcards for students. Create 10 flashcards from the provided document text. Focus on key concepts, definitions, and important details.",
        },
        {
          role: "user",
          content: `Create flashcards from the following text. Return ONLY a JSON array where each flashcard has 'front' (question/concept) and 'back' (answer/explanation) properties. Make sure the front is concise and the back has the complete explanation:\n\n${text.substring(0, 15000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    const flashcards = result.flashcards || [];
    
    return flashcards.map((card: any) => ({
      documentId,
      front: card.front,
      back: card.back,
    }));
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
}

// Generate quiz from document text
async function generateQuiz(text: string, documentId: number, type: string = "multiple-choice", difficulty: string = "medium"): Promise<InsertQuiz> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert educator that creates high-quality ${type} questions at ${difficulty} difficulty level. Create 10 questions from the provided document text.`,
        },
        {
          role: "user",
          content: `Create a ${type} quiz at ${difficulty} difficulty level from the following text. Return ONLY a JSON object with a 'questions' array. Each question should have 'question', 'options' (array of 4 choices for multiple-choice, omit for true/false), 'correctAnswer' (index for multiple-choice or boolean for true/false), and 'explanation' properties:\n\n${text.substring(0, 15000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    const questions = result.questions || [];
    
    return {
      documentId,
      type,
      difficulty,
      questions,
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz");
  }
}

// Generate summary from document text
async function generateSummary(text: string, documentId: number): Promise<InsertSummary> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educator that creates comprehensive summaries for study materials. Create a summary of the provided document text that includes key concepts, important terminology with definitions, and an overall summary.",
        },
        {
          role: "user",
          content: `Create a comprehensive study summary from the following text. Return ONLY a JSON object with 'keyConcepts' (array of strings), 'terminology' (array of objects with 'term' and 'definition' properties), and 'summary' (string) properties:\n\n${text.substring(0, 15000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      documentId,
      keyConcepts: result.keyConcepts || [],
      terminology: result.terminology || [],
      summary: result.summary || "",
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}

// Main document processing function
export async function processDocument(filePath: string, documentId: number): Promise<void> {
  try {
    // Update status to processing
    await storage.updateDocumentStatus(documentId, "processing");
    
    // Extract text from PDF
    const text = await extractTextFromPDF(filePath);
    
    // Generate flashcards
    const flashcards = await generateFlashcards(text, documentId);
    await storage.createFlashcards(flashcards);
    
    // Generate quizzes (multiple choice and true/false)
    const multipleChoiceQuiz = await generateQuiz(text, documentId, "multiple-choice", "medium");
    await storage.createQuiz(multipleChoiceQuiz);
    
    const trueFalseQuiz = await generateQuiz(text, documentId, "true-false", "medium");
    await storage.createQuiz(trueFalseQuiz);
    
    // Generate summary
    const summary = await generateSummary(text, documentId);
    await storage.createSummary(summary);
    
    // Update status to completed
    await storage.updateDocumentStatus(documentId, "completed");
  } catch (error) {
    console.error("Error processing document:", error);
    // Update status to failed
    await storage.updateDocumentStatus(documentId, "failed");
  }
}
