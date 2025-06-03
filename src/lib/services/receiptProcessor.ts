import { ReceiptData } from "@/lib/validations/receipt";

/**
 * Mock receipt processing service
 * In a real implementation, this would integrate with OCR services like:
 * - Google Cloud Vision API
 * - AWS Textract
 * - Azure Computer Vision
 * - Tesseract.js for client-side processing
 */

interface ProcessingResult {
  data: ReceiptData;
  confidence: number;
  extractedAt: string;
}

/**
 * Simulates processing a receipt file and extracting data
 * @param file - The uploaded receipt file
 * @returns Promise with extracted receipt data
 */
export async function processReceiptFile(
  file: File
): Promise<ProcessingResult> {
  // Simulate processing delay
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  // Mock extracted data based on file name or content
  const mockData: ReceiptData[] = [
    {
      vendor: "Starbucks Coffee",
      date: "2024-01-15",
      amount: 12.45,
      category: "Meals",
      description: "Coffee and pastry for client meeting",
      isDeductible: true,
      paymentMethod: "Credit Card",
      taxAmount: 1.12,
    },
    {
      vendor: "Uber Technologies",
      date: "2024-01-14",
      amount: 24.8,
      category: "Travel",
      description: "Airport transfer for business trip",
      isDeductible: true,
      paymentMethod: "Digital Wallet",
      taxAmount: 2.24,
    },
    {
      vendor: "Office Depot",
      date: "2024-01-13",
      amount: 67.99,
      category: "Office Supplies",
      description: "Printer paper, pens, and notebooks",
      isDeductible: true,
      paymentMethod: "Credit Card",
      taxAmount: 6.12,
    },
    {
      vendor: "Adobe Systems",
      date: "2024-01-12",
      amount: 52.99,
      category: "Software",
      description: "Adobe Creative Cloud monthly subscription",
      isDeductible: true,
      paymentMethod: "Credit Card",
      taxAmount: 4.77,
    },
    {
      vendor: "McDonald's",
      date: "2024-01-11",
      amount: 8.75,
      category: "Meals",
      description: "Quick lunch during work day",
      isDeductible: false,
      paymentMethod: "Cash",
      taxAmount: 0.79,
    },
  ];

  // Select random mock data or use file-based logic
  const selectedData = mockData[Math.floor(Math.random() * mockData.length)];

  // Simulate confidence based on file type and quality
  let confidence = 85; // Base confidence

  if (file.type === "application/pdf") {
    confidence += 10; // PDFs usually have better text extraction
  } else if (file.type.startsWith("image/")) {
    confidence += Math.random() * 15 - 5; // Images vary in quality
  }

  // Adjust confidence based on file size (larger files might be higher quality)
  if (file.size > 1024 * 1024) {
    // > 1MB
    confidence += 5;
  }

  confidence = Math.min(95, Math.max(70, confidence)); // Clamp between 70-95%

  return {
    data: selectedData,
    confidence: Math.round(confidence),
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Validates and normalizes extracted receipt data
 * @param data - Raw extracted data
 * @returns Validated and normalized receipt data
 */
export function validateAndNormalizeReceiptData(
  data: Partial<ReceiptData>
): ReceiptData {
  // Normalize vendor name
  const vendor = data.vendor?.trim() || "Unknown Vendor";

  // Ensure date is in correct format
  let date = data.date || new Date().toISOString().split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    date = new Date().toISOString().split("T")[0];
  }

  // Ensure amount is valid
  const amount =
    typeof data.amount === "number" && data.amount > 0 ? data.amount : 0;

  // Default category if not provided
  const category = data.category || "Other";

  // Default description
  const description = data.description?.trim() || `Purchase from ${vendor}`;

  // Default payment method
  const paymentMethod = data.paymentMethod || "Credit Card";

  // Calculate tax amount if not provided
  const taxAmount =
    data.taxAmount !== undefined ? data.taxAmount : amount * 0.09; // 9% default tax rate

  return {
    vendor,
    date,
    amount,
    category: category as ReceiptData["category"],
    description,
    isDeductible: data.isDeductible ?? true, // Default to deductible for business expenses
    paymentMethod: paymentMethod as ReceiptData["paymentMethod"],
    taxAmount,
  };
}
