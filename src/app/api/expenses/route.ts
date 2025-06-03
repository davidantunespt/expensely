import { NextRequest, NextResponse } from "next/server";
import {
  saveExpenseRequestSchema,
  saveExpenseResponseSchema,
} from "@/lib/validations/receipt";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/expenses
 * Saves an expense from extracted receipt data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body against the schema
    const validatedData = saveExpenseRequestSchema.parse(body);

    // Simulate saving to database
    // In a real implementation, this would save to your database
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Generate ID and timestamps for new expense
    const expenseId = validatedData.id || uuidv4();
    const now = new Date().toISOString();
    const createdAt = validatedData.createdAt || now;
    const updatedAt = now;

    // Create response object
    const response = {
      success: true,
      data: {
        id: expenseId,
        createdAt,
        updatedAt,
      },
      message: "Expense saved successfully",
    };

    // Validate response against schema
    const validatedResponse = saveExpenseResponseSchema.parse(response);

    return NextResponse.json(validatedResponse, { status: 201 });
  } catch (error) {
    console.error("Save expense error:", error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid expense data provided",
          errors: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to save expense",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expenses
 * Returns information about the save expense endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/expenses",
    method: "POST",
    description: "Save an expense from extracted receipt data",
    requiredFields: [
      "vendor",
      "date",
      "amount",
      "category",
      "description",
      "isDeductible",
      "paymentMethod",
    ],
    optionalFields: ["id", "userId", "taxAmount", "createdAt", "updatedAt"],
  });
}
