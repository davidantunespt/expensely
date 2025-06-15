import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ReceiptService } from "@/lib/services/ReceiptService";
import { Category } from "../../../generated/prisma";

/**
 * GET /api/receipts
 * Get all receipts for the authenticated user
 */
export async function GET() {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Prisma service to get receipts
    const receipts = await ReceiptService.getUserReceipts(user.id);

    return NextResponse.json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/receipts
 * Create a new receipt for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      vendor,
      amount,
      date,
      category,
      description,
      isDeductible,
      paymentMethod,
      taxAmount,
      confidence,
      organizationId,
    } = body;

    // Validate required fields
    if (!vendor || !amount || !date || !category) {
      return NextResponse.json(
        { error: "Missing required fields: vendor, amount, date, category" },
        { status: 400 }
      );
    }

    // Create receipt using Prisma service
    const receipt = await ReceiptService.createReceipt(user.id, {
      category: category as Category,
      documentType: "INVOICE",
      documentId: "1234567890",
      documentDate: new Date(date).toISOString(),
      description,
      isDeductible: isDeductible ?? true,
      paymentMethod,
      taxAmount: taxAmount ? parseFloat(taxAmount) : 0,
      confidence: confidence ? parseInt(confidence) : 0,
      organizationId: organizationId ?? "",
      totalAmount: amount ? parseFloat(amount) : 0,
    });

    return NextResponse.json(
      {
        success: true,
        data: receipt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
