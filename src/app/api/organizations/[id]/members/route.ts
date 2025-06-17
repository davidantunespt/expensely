import { NextRequest, NextResponse } from "next/server";
import { OrganizationService } from "@/lib/services/OrganizationService";
import { OrganizationRole } from "@/generated/prisma";
import { getUserFromRequest } from "../../../../../lib/utils/request";
import { verifyAccess } from "../../../../../lib/utils/access";
import { UnauthorizedError } from "../../../../../lib/errors";

// Type for member with profile data from addMember
interface MemberWithProfile {
  id: string;
  profileId: string;
  organizationId: string;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
  };
}

// GET /api/organizations/[id]/members - Get organization members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);

    const members = await OrganizationService.getOrganizationMembers(
      params.id,
      user.id
    );

    // Transform the data to match frontend expectations
    const transformedMembers = members.map((member) => ({
      id: member.profile.id,
      name:
        member.profile.displayName ||
        `${member.profile.firstName || ""} ${
          member.profile.lastName || ""
        }`.trim() ||
        "Unknown User",
      email: member.profile.email,
      role: member.role,
      avatar: "", // Avatar not included in the service response
      joinedAt: member.createdAt,
      isOwner: member.role === "OWNER",
    }));

    return NextResponse.json({
      success: true,
      data: transformedMembers,
    });
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch organization members",
      },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/members - Add member to organization
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    const organizationId = params.id;

    await verifyAccess(user.id, organizationId);

    const body = await request.json();
    const { profileId, role = OrganizationRole.MEMBER } = body;

    if (!profileId) {
      return NextResponse.json(
        { success: false, message: "Profile ID is required" },
        { status: 400 }
      );
    }

    const member = await OrganizationService.addMember(
      organizationId,
      user.id,
      {
        profileId,
        role,
      }
    );

    // Type assertion to access the included profile data
    const memberWithProfile = member as MemberWithProfile;

    // Transform the data to match frontend expectations
    const transformedMember = {
      id: memberWithProfile.profile?.id || memberWithProfile.profileId,
      name:
        memberWithProfile.profile?.displayName ||
        `${memberWithProfile.profile?.firstName || ""} ${
          memberWithProfile.profile?.lastName || ""
        }`.trim() ||
        "Unknown User",
      email: "", // Email not included in the service response for privacy
      role: member.role,
      avatar: "", // Avatar not included in the service response
      joinedAt: member.createdAt,
      isOwner: member.role === "OWNER",
    };

    return NextResponse.json({
      success: true,
      data: transformedMember,
    });
  } catch (error) {
    console.error("Error adding organization member:", error);

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
            : "Failed to add organization member",
      },
      { status: 500 }
    );
  }
}
