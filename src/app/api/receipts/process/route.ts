import { NextRequest, NextResponse } from "next/server";
import { receiptProcessingResponseSchema } from "@/lib/validations/receipt";
import {
  processReceiptFile,
  validateAndNormalizeReceiptData,
} from "@/lib/services/receiptProcessor";

/**
 * POST /api/receipts/process
 * Processes an uploaded receipt file and extracts expense data
 */
export async function POST(request: NextRequest) {
  try {
    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file provided",
          extractedAt: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid file type. Only JPG, PNG, and PDF files are allowed",
          extractedAt: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "File size too large. Maximum size is 10MB",
          extractedAt: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Process the receipt file
    const processingResult = await processReceiptFile(file);

    // Validate and normalize the extracted data
    const normalizedData = validateAndNormalizeReceiptData(
      processingResult.data
    );

    // Create response object
    const response = {
      success: true,
      data: normalizedData,
      message: `Receipt processed successfully with ${processingResult.confidence}% confidence`,
      confidence: processingResult.confidence,
      extractedAt: processingResult.extractedAt,
    };

    // Validate response against schema
    const validatedResponse = receiptProcessingResponseSchema.parse(response);

    return NextResponse.json(validatedResponse, { status: 200 });
  } catch (error) {
    console.error("Receipt processing error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to process receipt",
        extractedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/receipts/process
 * Returns information about the receipt processing endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/receipts/process",
    method: "POST",
    description: "Upload a receipt file to extract expense data",
    supportedFormats: ["image/jpeg", "image/png", "application/pdf"],
    maxFileSize: "10MB",
    fields: {
      file: "The receipt file to process (required)",
    },
  });
}
