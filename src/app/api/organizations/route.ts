import { NextRequest, NextResponse } from "next/server";
import { OrganizationService } from "@/lib/services/OrganizationService";
import { getUserFromRequest } from "../../../lib/utils/request";
import { UnauthorizedError } from "../../../lib/errors";

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

// GET /api/organizations - Get all organizations for the current user
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    const organizations = await OrganizationService.getUserOrganizations(
      user.id
    );

    // Transform the data to match frontend expectations
    const transformedOrganizations = organizations.map(
      ({ organization, role, memberSince }) => {
        // Type assertion to access _count property
        const orgWithCount = organization as OrganizationWithCount;

        return {
          id: organization.id,
          name: organization.name,
          description: organization.description || "",
          color: organization.color || "#1DE9B6",
          avatar: organization.avatar || "",
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
          memberCount: orgWithCount._count?.members || 0,
          receiptCount: orgWithCount._count?.receipts || 0,
          isOwner: role === "OWNER",
          userRole: role,
          memberSince,
        };
      }
    );

    return NextResponse.json({
      success: true,
      data: transformedOrganizations,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch organizations",
      },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    // TODO: Replace with actual user authentication
    // For now, using a hardcoded user ID - this should come from session/JWT
    const user = getUserFromRequest(request);

    const body = await request.json();
    const { name, description, color, avatar } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Organization name is required" },
        { status: 400 }
      );
    }

    const organization = await OrganizationService.createOrganization(user.id, {
      name,
      description,
      color,
      avatar,
    });

    // Transform the data to match frontend expectations
    const transformedOrganization = {
      id: organization.id,
      name: organization.name,
      description: organization.description || "",
      color: organization.color || "#1DE9B6",
      avatar: organization.avatar || "",
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      memberCount: 1, // Creator is the first member
      receiptCount: 0, // New organization starts with 0 receipts
      isOwner: true,
    };

    return NextResponse.json({
      success: true,
      data: transformedOrganization,
    });
  } catch (error) {
    console.error("Error creating organization:", error);

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create organization",
      },
      { status: 500 }
    );
  }
}
