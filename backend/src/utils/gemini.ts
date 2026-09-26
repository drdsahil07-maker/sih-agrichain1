import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'placeholder' && apiKey.trim() !== '') {
        geminiClient = new GoogleGenAI({ apiKey });
      }
    } catch (err) {
      console.warn("Failed to initialize Gemini client:", err);
      return null;
    }
  }
  return geminiClient;
}
