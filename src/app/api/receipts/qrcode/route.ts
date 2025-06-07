import { NextRequest, NextResponse } from "next/server";
import { scanReceiptQRCode } from "@/lib/services/ReceiptProcessor";
import { qrCodeReaderResponseSchema } from "@/lib/validations/receipt";

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
        },
        { status: 400 }
      );
    }

    // Process the receipt file
    const qrCodeData = await scanReceiptQRCode(file);

    // Create response object
    const response = {
      success: true,
      data: qrCodeData.results,
      message: `Receipt processed successfully with ${qrCodeData.results.length} QR codes`,
    };

    // Validate response against schema
    const validatedResponse = qrCodeReaderResponseSchema.parse(response);

    return NextResponse.json(validatedResponse, { status: 200 });
  } catch (error) {
    console.error("Receipt processing error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to process receipt",
      },
      { status: 500 }
    );
  }
}
