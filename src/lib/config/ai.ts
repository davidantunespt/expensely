import { AIConfig } from "@/lib/services/AIService";

/**
 * AI Service Configuration
 * Change these settings to switch between different AI providers or adjust behavior
 */

// Current AI provider - change this to switch providers
export const AI_PROVIDER: "gemini" | "openai" = "gemini";

// Gemini configuration
export const GEMINI_CONFIG: AIConfig = {
  apiKey: process.env.GEMINI_API_KEY || "",
  model: "gemini-1.5-flash", // Fast and cost-effective model
  temperature: 0.1, // Low temperature for consistent structured output
  maxTokens: 1000,
};

// OpenAI configuration (for future use)
export const OPENAI_CONFIG: AIConfig = {
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-4-vision-preview",
  temperature: 0.1,
  maxTokens: 1000,
};

/**
 * Get the current AI configuration based on the selected provider
 * @returns The configuration object for the current AI provider
 */
export function getCurrentAIConfig(): AIConfig {
  switch (AI_PROVIDER) {
    case "gemini":
      return GEMINI_CONFIG;
    case "openai":
      return OPENAI_CONFIG;
    default:
      throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
  }
}

/**
 * Validate that the API key is configured for the current provider
 * @returns boolean indicating if the API key is available
 */
export function isAIConfigured(): boolean {
  const config = getCurrentAIConfig();
  return config.apiKey !== "";
}
