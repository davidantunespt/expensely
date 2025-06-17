import { NextRequest, NextResponse } from "next/server";
import { OrganizationService } from "@/lib/services/OrganizationService";
import { getUserFromRequest } from "../../../../lib/utils/request";
import { verifyAccess } from "../../../../lib/utils/access";

// Type for organization with count data
interface OrganizationWithCount {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  color: string | null;
  avatar: string | null;
  _count?: {
    members: number;
    receipts: number;
  };
}

// GET /api/organizations/[id] - Get specific organization
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    const organizationId = params.id;

    await verifyAccess(user.id, organizationId);

    const organization = await OrganizationService.getOrganizationById(
      organizationId,
      true // Include members
    );

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 }
      );
    }

    // Type assertion to access _count property
    const orgWithCount = organization as OrganizationWithCount;

    // Transform the data to match frontend expectations
    const transformedOrganization = {
      id: organization.id,
      name: organization.name,
      description: organization.description || "",
      color: organization.color || "#1DE9B6",
      avatar: organization.avatar || "",
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      memberCount: orgWithCount._count?.members || 0,
      receiptCount: orgWithCount._count?.receipts || 0,
      isOwner: organization.ownerId === user.id,
    };

    return NextResponse.json({
      success: true,
      data: transformedOrganization,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch organization",
      },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id] - Update organization
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    const organizationId = params.id;

    await verifyAccess(user.id, organizationId);

    const body = await request.json();
    const { name, description, color, avatar } = body;

    const organization = await OrganizationService.updateOrganization(
      organizationId,
      user.id,
      { name, description, color, avatar }
    );

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization not found or access denied" },
        { status: 404 }
      );
    }

    // Type assertion to access _count property
    const orgWithCount = organization as OrganizationWithCount;

    // Transform the data to match frontend expectations
    const transformedOrganization = {
      id: organization.id,
      name: organization.name,
      description: organization.description || "",
      color: organization.color || "#1DE9B6",
      avatar: organization.avatar || "",
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      memberCount: orgWithCount._count?.members || 0,
      receiptCount: orgWithCount._count?.receipts || 0,
      isOwner: organization.ownerId === user.id,
    };

    return NextResponse.json({
      success: true,
      data: transformedOrganization,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update organization",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id] - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Replace with actual user authentication
    // For now, using a hardcoded user ID - this should come from session/JWT
    const userId = "user-1";
    const organizationId = params.id;

    const success = await OrganizationService.deleteOrganization(
      organizationId,
      userId
    );

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete organization or access denied",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete organization",
      },
      { status: 500 }
    );
  }
}
