import { GeminiAIService } from "./ai/GeminiAIService";
import { OpenAIService } from "./ai/OpenAIService";

/**
 * Abstract interface for AI services
 * This allows easy switching between different AI models (Gemini, OpenAI, Claude, etc.)
 */
export interface AIService {
  /**
   * Process a receipt file and extract structured data
   * @param file - The receipt file to process
   * @returns Promise with extracted receipt data and confidence score
   */
  processReceipt(file: File, fileUrl?: string): Promise<string>;
}

/**
 * Configuration for AI services
 */
export interface AIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Factory function to create AI service instances
 * Makes it easy to switch between different AI providers
 */
export function createAIService(
  provider: "gemini" | "openai",
  config: AIConfig
): AIService {
  switch (provider) {
    case "gemini":
      return new GeminiAIService(config);
    case "openai":
      return new OpenAIService(config);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
