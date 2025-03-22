import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { storage } from "./storage";
import { PDFExtract, PDFExtractOptions } from "pdf.js-extract";
import { InsertFlashcard, InsertQuiz, InsertSummary } from "@shared/schema";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const pdfExtract = new PDFExtract();

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

async function generateFlashcards(text: string, documentId: number): Promise<InsertFlashcard[]> {
  try {
    const prompt = `Create 10 flashcards from this text. Format as JSON array with 'front' (question/concept) and 'back' (answer/explanation) properties:\n\n${text.substring(0, 15000)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const flashcards = JSON.parse(response.text()).flashcards || [];

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

async function generateQuiz(text: string, documentId: number, type: string = "multiple-choice", difficulty: string = "medium"): Promise<InsertQuiz> {
  try {
    const prompt = `Create a ${type} quiz at ${difficulty} difficulty level from this text. Return JSON with 'questions' array. Each question needs 'question', 'options' (array for multiple-choice, omit for true/false), 'correctAnswer' (index or boolean), and 'explanation':\n\n${text.substring(0, 15000)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const questions = JSON.parse(response.text()).questions || [];

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

async function generateSummary(text: string, documentId: number): Promise<InsertSummary> {
  try {
    const prompt = `Create a study summary from this text. Return JSON with 'keyConcepts' (array of strings), 'terminology' (array of objects with 'term' and 'definition'), and 'summary' (string):\n\n${text.substring(0, 15000)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = JSON.parse(response.text());

    return {
      documentId,
      keyConcepts: summary.keyConcepts || [],
      terminology: summary.terminology || [],
      summary: summary.summary || "",
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}

export async function processDocument(filePath: string, documentId: number): Promise<void> {
  console.log("Starting document processing with Gemini AI...");
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    await storage.updateDocumentStatus(documentId, "processing");
    const text = await extractTextFromPDF(filePath);

    const flashcards = await generateFlashcards(text, documentId);
    await storage.createFlashcards(flashcards);

    const multipleChoiceQuiz = await generateQuiz(text, documentId, "multiple-choice", "medium");
    await storage.createQuiz(multipleChoiceQuiz);

    const trueFalseQuiz = await generateQuiz(text, documentId, "true-false", "medium");
    await storage.createQuiz(trueFalseQuiz);

    const summary = await generateSummary(text, documentId);
    await storage.createSummary(summary);

    await storage.updateDocumentStatus(documentId, "completed");
  } catch (error) {
    console.error("Error processing document:", error);
    await storage.updateDocumentStatus(documentId, "failed");
  }
}