import { NextRequest, NextResponse } from "next/server";
import {
  CreateReceiptData,
  ReceiptService,
} from "@/lib/services/ReceiptService";
import { verifyAccess } from "@/lib/utils/access";
import { getUserFromRequest } from "@/lib/utils/request";
import { UnauthorizedError } from "@/lib/errors";

/**
 * GET /api/receipts
 * Get all receipts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    // Verify organization access
    await verifyAccess(user.id, user.organizationId);

    // Use Prisma service to get receipts
    const receipts = await ReceiptService.getUserReceipts(
      user.organizationId,
      user.id
    );

    return NextResponse.json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
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
    const user = getUserFromRequest(request);

    // Verify organization access
    await verifyAccess(user.id, user.organizationId);

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const meta = JSON.parse(
      formData.get("meta") as string
    ) as CreateReceiptData;

    if (!file || !meta) {
      return NextResponse.json(
        { error: "Missing required fields: file and meta" },
        { status: 400 }
      );
    }

    const createdReceipt = await ReceiptService.createReceipt(
      user.organizationId,
      user.id,
      { ...meta, file }
    );

    return NextResponse.json(
      {
        success: true,
        data: createdReceipt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating receipts:", error);
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
