import { NextRequest, NextResponse } from "next/server";
import {
  CreateReceiptData,
  ReceiptService,
} from "@/lib/services/ReceiptService";
import { verifyAccess } from "@/lib/utils/access";
import { getUserFromRequest } from "@/lib/utils/request";
import { UnauthorizedError } from "@/lib/errors";
import { z } from "zod";

/**
 * GET /api/receipts
 * Get all receipts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    // Verify organization access
    await verifyAccess(user.id, user.organizationId);

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const validatedParams = GetReceiptsSchema.parse(queryParams);

    // Get receipts from the service
    const receipts = await ReceiptService.getUserReceipts(
      user.organizationId,
      user.id
    );

    // Apply filters
    let filteredReceipts = receipts;

    // Search filter
    if (validatedParams.search) {
      const searchLower = validatedParams.search.toLowerCase();
      filteredReceipts = filteredReceipts.filter(
        (receipt) =>
          receipt.vendor?.toLowerCase().includes(searchLower) ||
          receipt.description?.toLowerCase().includes(searchLower) ||
          receipt.documentId?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (validatedParams.category && validatedParams.category !== "All") {
      filteredReceipts = filteredReceipts.filter(
        (receipt) => receipt.category === validatedParams.category
      );
    }

    // Payment method filter
    if (
      validatedParams.paymentMethod &&
      validatedParams.paymentMethod !== "All"
    ) {
      filteredReceipts = filteredReceipts.filter(
        (receipt) => receipt.paymentMethod === validatedParams.paymentMethod
      );
    }

    // Tax deductible filter
    if (validatedParams.isDeductible) {
      const isDeductible = validatedParams.isDeductible === "true";
      filteredReceipts = filteredReceipts.filter(
        (receipt) => receipt.isDeductible === isDeductible
      );
    }

    // Date filters
    if (validatedParams.dateFrom) {
      const fromDate = new Date(validatedParams.dateFrom);
      filteredReceipts = filteredReceipts.filter(
        (receipt) =>
          receipt.documentDate && new Date(receipt.documentDate) >= fromDate
      );
    }

    if (validatedParams.dateTo) {
      const toDate = new Date(validatedParams.dateTo);
      filteredReceipts = filteredReceipts.filter(
        (receipt) =>
          receipt.documentDate && new Date(receipt.documentDate) <= toDate
      );
    }

    // Amount filters
    if (validatedParams.minAmount) {
      const minAmount = parseFloat(validatedParams.minAmount);
      filteredReceipts = filteredReceipts.filter(
        (receipt) => Number(receipt.totalAmount) >= minAmount
      );
    }

    if (validatedParams.maxAmount) {
      const maxAmount = parseFloat(validatedParams.maxAmount);
      filteredReceipts = filteredReceipts.filter(
        (receipt) => Number(receipt.totalAmount) <= maxAmount
      );
    }

    // Sorting
    const sortField = validatedParams.sortField || "date";
    const sortDirection = validatedParams.sortDirection || "desc";

    filteredReceipts.sort((a, b) => {
      let aValue: number | string | Date, bValue: number | string | Date;

      switch (sortField) {
        case "date":
          aValue = a.documentDate ? new Date(a.documentDate) : new Date(0);
          bValue = b.documentDate ? new Date(b.documentDate) : new Date(0);
          break;
        case "vendor":
          aValue = (a.vendor || "").toLowerCase();
          bValue = (b.vendor || "").toLowerCase();
          break;
        case "amount":
          aValue = Number(a.totalAmount);
          bValue = Number(b.totalAmount);
          break;
        case "category":
          aValue = (a.category || "").toLowerCase();
          bValue = (b.category || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = parseInt(validatedParams.page || "1");
    const limit = parseInt(validatedParams.limit || "10");
    const startIndex = (page - 1) * limit;
    const paginatedReceipts = filteredReceipts.slice(
      startIndex,
      startIndex + limit
    );

    // Transform receipts for frontend
    const transformedReceipts = paginatedReceipts.map((receipt) => ({
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
      fileUrl: receipt.fileUrl, //`/api/receipts/${receipt.id}/file`, // File endpoint
      createdAt: receipt.createdAt,
      updatedAt: receipt.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        receipts: transformedReceipts,
        pagination: {
          page,
          limit,
          total: filteredReceipts.length,
          totalPages: Math.ceil(filteredReceipts.length / limit),
        },
        summary: {
          totalExpenses: filteredReceipts.reduce(
            (sum, r) => sum + Number(r.totalAmount),
            0
          ),
          deductibleExpenses: filteredReceipts
            .filter((r) => r.isDeductible)
            .reduce((sum, r) => sum + Number(r.totalAmount), 0),
          receiptCount: filteredReceipts.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch receipts" },
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

// Schema for query parameters validation
const GetReceiptsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  isDeductible: z.enum(["true", "false"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortField: z.enum(["date", "vendor", "amount", "category"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});
