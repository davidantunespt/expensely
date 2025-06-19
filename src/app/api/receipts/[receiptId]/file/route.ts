import { NextResponse } from "next/server";
import { FileService } from "@/lib/services/FileService";
import { OrganizationRole, PrismaClient } from "@/generated/prisma";
import { getUserFromRequest } from "../../../../../lib/utils/request";
import { type NextRequest } from "next/server";
import { UnauthorizedError } from "@/lib/errors";

const fileService = new FileService();
const prisma = new PrismaClient();

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
    const organizationId = user.organizationId;

    const receipt = await prisma.receipt.findUnique({
      where: {
        id: params.receiptId,
        organizationId: organizationId,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user has access to the organization and receipt
    const { membership } = await verifyAccess(
      user.id,
      user.organizationId,
      params.receiptId
    );

    if (
      membership.role !== OrganizationRole.OWNER &&
      membership.role !== OrganizationRole.ADMIN
    ) {
      return NextResponse.json(
        { error: "You do not have access to this receipt" },
        { status: 403 }
      );
    }

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
