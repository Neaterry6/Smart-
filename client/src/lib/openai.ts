import OpenAI from "openai";
import { QuizQuestion, TerminologyItem } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key" });

// Extract key concepts from text
export async function extractKeyConcepts(text: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educator that identifies key concepts from academic content. Extract the most important concepts from the provided text.",
        },
        {
          role: "user",
          content: `Extract 5-10 key concepts from the following text. Return ONLY a JSON array of strings:\n\n${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.concepts || [];
  } catch (error) {
    console.error("Error extracting key concepts:", error);
    return [];
  }
}

// Generate flashcards from text
export async function generateFlashcards(text: string): Promise<{ front: string; back: string }[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert study assistant that creates high-quality flashcards for students. Create flashcards from the provided document text. Focus on key concepts, definitions, and important details.",
        },
        {
          role: "user",
          content: `Create flashcards from the following text. Return ONLY a JSON object with a 'flashcards' array where each flashcard has 'front' (question/concept) and 'back' (answer/explanation) properties:\n\n${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.flashcards || [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
}

// Generate quiz questions from text
export async function generateQuizQuestions(
  text: string, 
  type: string = "multiple-choice", 
  difficulty: string = "medium"
): Promise<QuizQuestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert educator that creates high-quality ${type} questions at ${difficulty} difficulty level. Create questions from the provided document text.`,
        },
        {
          role: "user",
          content: `Create a ${type} quiz at ${difficulty} difficulty level from the following text. Return ONLY a JSON object with a 'questions' array. Each question should have 'question', 'options' (array of 4 choices for multiple-choice, omit for true/false), 'correctAnswer' (index for multiple-choice or boolean for true/false), and 'explanation' properties:\n\n${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.questions || [];
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}

// Generate summary from text
export async function generateSummary(text: string): Promise<{
  keyConcepts: string[];
  terminology: TerminologyItem[];
  summary: string;
}> {
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
          content: `Create a comprehensive study summary from the following text. Return ONLY a JSON object with 'keyConcepts' (array of strings), 'terminology' (array of objects with 'term' and 'definition' properties), and 'summary' (string) properties:\n\n${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      keyConcepts: result.keyConcepts || [],
      terminology: result.terminology || [],
      summary: result.summary || "",
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    return {
      keyConcepts: [],
      terminology: [],
      summary: "Failed to generate summary.",
    };
  }
}
