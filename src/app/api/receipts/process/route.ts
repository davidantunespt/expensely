import { processReceiptFile } from "@/lib/services/ReceiptProcessor";
import { verifyAccess } from "@/lib/utils/access";
import { getUserFromRequest } from "@/lib/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError } from "@/lib/errors";

/**
 * POST /api/receipts/process
 * Processes an uploaded receipt file and extracts expense data
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    // Verify organization access
    await verifyAccess(user.id, user.organizationId);

    // Get the uploaded file and organization from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
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

    // Validate file name
    if (!file.name || file.name.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file name",
          extractedAt: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check for malicious file extensions
    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];
    if (!extension || !allowedExtensions.includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file extension",
          extractedAt: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Process the receipt file
    const processingResult = await processReceiptFile(
      user.organizationId,
      file
    );

    // Validate and normalize the extracted data
    // const normalizedData = validateAndNormalizeReceiptData(
    //   processingResult.data
    // );

    // Create response object
    const response = {
      success: true,
      data: processingResult.data,
      message: `Receipt processed successfully with ${processingResult.confidence}% confidence`,
      confidence: processingResult.confidence,
      extractedAt: processingResult.extractedAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("Receipt processing error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          extractedAt: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("Invalid file")) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            extractedAt: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

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
