import { NextResponse } from "next/server";
import { FileService } from "@/lib/services/FileService";
import { PrismaClient } from "@/generated/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getUserFromRequest } from "../../../../../lib/utils/request";
import { type NextRequest } from "next/server";
import { UnauthorizedError } from "@/lib/errors";

const fileService = new FileService();
const prisma = new PrismaClient();

// Rate limit: 5 requests per minute per user
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

/**
 * Verifies if the user has access to the organization and receipt
 */
async function verifyAccess(
  userId: string,
  organizationId: string,
  receiptId: string
) {
  // Check organization membership
  const membership = await prisma.organizationMember.findFirst({
    where: {
      profileId: userId,
      organizationId: organizationId,
    },
  });

  if (!membership) {
    throw new UnauthorizedError("You do not have access to this organization");
  }

  // Check receipt ownership/access
  const receipt = await prisma.receipt.findFirst({
    where: {
      id: receiptId,
      organizationId: organizationId,
    },
  });

  if (!receipt) {
    throw new Error("Receipt not found or you do not have access to it");
  }

  return { membership, receipt };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  try {
    const user = getUserFromRequest(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const organizationId = formData.get("organizationId") as string;

    if (!file || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user has access to the organization and receipt
    await verifyAccess(user.id, user.organizationId, params.receiptId);

    const fileData = await fileService.uploadReceiptFile(
      user.organizationId,
      file,
      params.receiptId
    );

    return NextResponse.json(fileData);
  } catch (error: unknown) {
    console.error("Upload error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message?.includes("Invalid file")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { receiptId: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimitResult = await limiter.check(5, user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Get the receipt to find its organization
    const receipt = await prisma.receipt.findUnique({
      where: { id: params.receiptId },
      select: { organizationId: true },
    });

    if (!receipt?.organizationId) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Verify user has access to the organization and receipt
    await verifyAccess(user.id, receipt.organizationId, params.receiptId);

    await fileService.deleteReceiptFile(params.receiptId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete error:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
