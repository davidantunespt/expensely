import { NextRequest, NextResponse } from "next/server";
import { ReceiptService } from "@/lib/services/ReceiptService";
import { verifyAccess } from "@/lib/utils/access";
import { getUserFromRequest } from "@/lib/utils/request";
import { UnauthorizedError } from "@/lib/errors";
import { OrganizationRole } from "../../../../generated/prisma";

/**
 * GET /api/receipts/[receiptId]
 * Get a single receipt by ID
 */
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ receiptId: string }>;
  }
) {
  const { receiptId } = await params;
  try {
    const user = getUserFromRequest(request);

    // Verify organization access
    await verifyAccess(user.id, user.organizationId);

    const receipt = await ReceiptService.getReceiptById(
      receiptId,
      user.organizationId,
      user.id
    );

    if (!receipt) {
      return NextResponse.json(
        { success: false, error: "Receipt not found" },
        { status: 404 }
      );
    }

    // Transform receipt for frontend
    const transformedReceipt = {
      id: receipt.id,
      vendor: receipt.vendor,
      date: receipt.documentDate,
      category: receipt.category,
      description: receipt.description || "",
      isDeductible: receipt.isDeductible,
      paymentMethod: receipt.paymentMethod,
      taxAmount: Number(receipt.taxAmount),
      qrCode: receipt.qrCode || "",
      documentType: receipt.documentType,
      items: receipt.items || [],
      totalItems: Array.isArray(receipt.items) ? receipt.items.length : 0,
      subtotalAmount: Number(receipt.totalAmount) - Number(receipt.taxAmount),
      totalAmount: Number(receipt.totalAmount),
      totalTax: Number(receipt.taxAmount),
      totalDiscount: 0, // Not tracked in current schema
      issuerVatNumber: receipt.issuerVatNumber || "",
      buyerVatNumber: receipt.buyerVatNumber || "",
      documentDate: receipt.documentDate,
      documentId: receipt.documentId,
      organizationId: receipt.organizationId,
      fileName: receipt.fileOriginalName,
      fileUrl: receipt.fileUrl,
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: transformedReceipt,
    });
  } catch (error) {
    console.error("Error fetching receipt:", error);
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/receipts/[receiptId]
 * Delete a receipt by ID
 */
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ receiptId: string }>;
  }
) {
  const { receiptId } = await params;
  try {
    const user = getUserFromRequest(request);

    // Verify organization access
    const role = await verifyAccess(user.id, user.organizationId);

    // Validate receiptId parameter
    if (!receiptId) {
      return NextResponse.json(
        { success: false, error: "Receipt ID is required" },
        { status: 400 }
      );
    }

    if (role !== OrganizationRole.ADMIN && role !== OrganizationRole.OWNER) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to delete this receipt",
        },
        { status: 403 }
      );
    }

    // Delete the receipt using the service
    const deleteSuccess = await ReceiptService.deleteReceipt(
      receiptId,
      user.organizationId,
      user.id
    );

    if (!deleteSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Receipt not found or you do not have permission to delete it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Receipt deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete receipt",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
