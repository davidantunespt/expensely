import { ReceiptData } from "@/lib/validations/receipt";
import { createAIService } from "./AIService";
import { FileMetadata } from "./FileService";

/**
 * Receipt processing service that uses AI/LLM for data extraction
 * with QR code scanning as a fallback
 */

interface ProcessingResult {
  data: ReceiptData;
  confidence: number;
  extractedAt: string;
}

interface QRCodeReaderResult {
  results: Array<{
    data: string;
    imagePath: string;
  }>;
}

/**
 * Extracts text from an image using OCR
 * @param file - The image file to process
 * @returns Promise with extracted text
 */
async function extractTextFromImage(
  file: File,
  fileMetadata?: FileMetadata
): Promise<ReceiptData | null> {
  const aiService = createAIService("openai", {
    apiKey: process.env.GC_API_KEY!,
  });

  const generatedText = await aiService.processReceipt(
    file,
    fileMetadata?.fileUrl
  );
  console.log(" OPENAI result :robot: ", generatedText);

  let extractedData: ReceiptData;
  try {
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : generatedText;
    extractedData = JSON.parse(jsonText);
  } catch {
    console.error("Failed to parse AI response:", generatedText);
    throw new Error("Invalid JSON response from AI");
  }

  console.log("extractedData :robot: ", extractedData);

  return extractedData;
}

/**
 * Scans a receipt file using QR code service
 * @param file - The receipt file to scan
 * @returns Promise with the QR code scan response
 */
export async function scanReceiptQRCode(
  file: File
): Promise<QRCodeReaderResult> {
  try {
    const formData = new FormData();
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });
    formData.append("file", blob, file.name);

    console.log("formData", btoa("admin:pyOsLs8fFGv3P2p"), formData);
    const response = await fetch("https://qrcode.usados.top/scan", {
      method: "POST",
      headers: {
        Authorization: "Basic " + process.env.QR_CODE_READER_API_KEY!,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `QR code scan failed with status: ${response.status} - ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error: unknown) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt file");
  }
}

/**
 * Main function to process a receipt file
 * Uses AI/LLM for primary processing with QR code scanning as fallback
 * @param file - The uploaded receipt file
 * @returns Promise with extracted receipt data
 */
export async function processReceiptFile(
  organizationId: string,
  file: File
): Promise<ProcessingResult> {
  try {
    // save the file
    // const fileService = new FileService();
    // const fileData = await fileService.uploadReceiptFile(
    //   organizationId,
    //   file
    //   // null - no file id, temporary upload
    // );

    // Step 1: Extract text from image using OCR
    if (process.env.DUMMY_AI_DATA === "true") {
      console.log("RETURNING DUMMY_AI_DATA");
      return {
        data: dummyData as ReceiptData,
        confidence: 90,
        extractedAt: new Date().toISOString(),
      };
    }

    const extractedReceipt = await extractTextFromImage(file);

    if (!extractedReceipt) {
      throw new Error("No text extracted from image");
    }

    return {
      data: extractedReceipt,
      confidence: 90, // High confidence for AI/LLM processing
      extractedAt: new Date().toISOString(),
    };
  } catch (error: unknown) {
    throw error;
  }
}

export async function retrieveFinanceInfo(
  qrData: string
): Promise<ReceiptData> {
  try {
    const formData = new FormData();
    formData.append("data", qrData);

    const response = await fetch(
      "https://qrcode.usados.top/fiscal-data/parse",
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa("admin:pyOsLs8fFGv3P2p"),
        },
        body: formData,
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Fetching finance info failed with status: ${response.status} - ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error: unknown) {
    console.error("Error fetching finance info:", error);
    throw new Error("Failed to fetch finance info");
  }
}

const dummyData = {
  vendor: "PADARIA PORTUGUESA",
  date: "2023-06-04 08:40:48",
  category: "Meals",
  description: "Breakfast items including sandwiches and coffee",
  isDeductible: false,
  paymentMethod: "Cash",
  taxAmount: 0.36,
  qrCode: "",
  documentType: "Receipt",
  items: [
    { name: "SandesCroissa", quantity: 1, tax: 13, total: 2.7 },
    { name: "CroisBrioche", quantity: 1, tax: 13, total: 0 },
    { name: "Mista", quantity: 1, tax: 13, total: 0 },
    { name: "SumoNaturala", quantity: 1, tax: 6, total: 2.99 },
    { name: "Cafe Organico", quantity: 1, tax: 13, total: 0.9 },
  ],
  totalItems: 5,
  subtotalAmount: 3.99,
  totalAmount: 3.99,
  totalTax: 0.36,
  totalDiscount: 2.6,
  issuerVatNumber: "509783065",
  buyerVatNumber: "",
  documentDate: "2023-06-04 08:40:48",
  documentId: "F5 095/1006163",
};
