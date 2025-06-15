import { BaseAIService } from "./BaseAIService";
import { AIConfig } from "../AIService";

export class GeminiAIService extends BaseAIService {
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(config: AIConfig) {
    super({
      model: "gemini-2.5-flash-preview-05-20",
      ...config,
    });
  }

  async processReceipt(file: File): Promise<string> {
    try {
      const { data: base64Data, mimeType } = await this.fileToBase64(file);

      const requestBody = {
        contents: [
          {
            parts: [
              { text: this.createReceiptPrompt() },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
        },
      };

      const response = await fetch(
        `${this.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No response from Gemini API");
      }

      console.log("generatedText :robot: ", generatedText);

      return generatedText;
    } catch (error) {
      console.error("Error processing receipt with Gemini:", error);
      throw new Error(
        `Failed to process receipt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
