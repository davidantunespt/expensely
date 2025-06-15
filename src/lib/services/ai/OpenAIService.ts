import { BaseAIService } from "./BaseAIService";
import OpenAI from "openai";
import { AIConfig } from "../AIService";

export class OpenAIService extends BaseAIService {
  private client: OpenAI;

  constructor(config: AIConfig) {
    super({
      model: "Qwen/Qwen2.5-VL-72B-Instruct",
      ...config,
    });
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: "https://inference-api.genesiscloud.com/openai/v1",
    });
  }

  async processReceipt(file: File, fileUrl?: string): Promise<string> {
    try {
      const { data: base64Data, mimeType } = await this.fileToBase64(file);
      // const data = new FormData();
      // data.append("file", file);
      // data.append("purpose", "user_data");

      // const fileResponse = await fetch(`${this.client.baseURL}/files`, {
      //   method: "POST",
      //   body: data,
      //   headers: {
      //     Authorization: `Bearer ${this.client.apiKey}`,
      //   },
      // });
      // if (!fileResponse.ok) {
      //   const error = await fileResponse.json();
      //   console.error("Upload failed:", error);
      // } else {
      //   const result = await fileResponse.json();
      //   console.log("File uploaded:", result);
      // }

      // const buffer = await file.arrayBuffer();
      // const blob = new Blob([buffer], { type: file.type });

      // const fileResponse = await this.client.files.create({
      //   file: data,
      //   purpose: "user_data",
      // });
      // console.log("fileUrl :robot: ", fileUrl);

      const response = await this.client.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: this.createReceiptPrompt() },
              {
                type: "image_url",
                image_url: {
                  url: fileUrl
                    ? fileUrl
                    : `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const generatedText = response.choices[0]?.message?.content;
      if (!generatedText) {
        throw new Error("No response from OpenAI API");
      }

      console.log("generatedText :robot: ", generatedText);

      return generatedText;
    } catch (error) {
      console.error("Error processing receipt with OpenAI:", error);
      throw new Error(
        `Failed to process receipt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
