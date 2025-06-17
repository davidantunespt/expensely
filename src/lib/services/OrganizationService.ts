import { prisma } from "@/lib/prisma";
import {
  Organization,
  OrganizationMember,
  OrganizationRole,
  Profile,
} from "@/generated/prisma";

export type CreateOrganizationData = {
  name: string;
  description?: string;
  color?: string;
  avatar?: string;
};

export type UpdateOrganizationData = {
  name?: string;
  description?: string;
  color?: string;
  avatar?: string;
};

export type AddMemberData = {
  profileId: string;
  role: OrganizationRole;
};

export type UpdateMemberRoleData = {
  role: OrganizationRole;
};

export class OrganizationService {
  /**
   * Create a new organization with the creator as owner
   */
  static async createOrganization(
    ownerId: string,
    data: CreateOrganizationData
  ): Promise<Organization> {
    return await prisma.$transaction(async (tx) => {
      // Create the organization
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          description: data.description,
          ownerId,
          color: data.color,
          avatar: data.avatar,
        },
        include: {
          owner: true,
          members: {
            include: {
              profile: true,
            },
          },
        },
      });

      // Add the owner as a member with OWNER role
      await tx.organizationMember.create({
        data: {
          profileId: ownerId,
          organizationId: organization.id,
          role: OrganizationRole.OWNER,
        },
      });

      // Set as default organization if user doesn't have one
      const profile = await tx.profile.findUnique({
        where: { id: ownerId },
        select: { defaultOrganizationId: true },
      });

      if (!profile?.defaultOrganizationId) {
        await tx.profile.update({
          where: { id: ownerId },
          data: { defaultOrganizationId: organization.id },
        });
      }

      return organization;
    });
  }

  /**
   * Get organization by ID with optional member filtering
   */
  static async getOrganizationById(
    organizationId: string,
    includeMembers: boolean = false
  ): Promise<Organization | null> {
    return await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        owner: true,
        members: includeMembers
          ? {
              include: {
                profile: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    displayName: true,
                  },
                },
              },
              orderBy: {
                role: "asc", // OWNER first, then ADMIN, MEMBER, VIEWER
              },
            }
          : false,
        _count: {
          select: {
            members: true,
            receipts: true,
          },
        },
      },
    });
  }

  /**
   * Get all organizations for a user
   */
  static async getUserOrganizations(userId: string): Promise<
    Array<{
      organization: Organization;
      role: OrganizationRole;
      memberSince: Date;
    }>
  > {
    const memberships = await prisma.organizationMember.findMany({
      where: { profileId: userId },
      include: {
        organization: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
            _count: {
              select: {
                members: true,
                receipts: true,
              },
            },
          },
        },
      },
      orderBy: {
        role: "asc", // Show owned organizations first
      },
    });

    return memberships.map((membership) => ({
      organization: membership.organization,
      role: membership.role,
      memberSince: membership.createdAt,
    }));
  }

  /**
   * Update organization details (requires ADMIN or OWNER role)
   */
  static async updateOrganization(
    organizationId: string,
    userId: string,
    data: UpdateOrganizationData
  ): Promise<Organization | null> {
    // Check if user has permission to update
    const hasPermission = await this.hasRole(organizationId, userId, [
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    ]);

    if (!hasPermission) {
      throw new Error("Insufficient permissions to update organization");
    }

    return await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        avatar: data.avatar,
        updatedAt: new Date(),
      },
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
            receipts: true,
          },
        },
      },
    });
  }

  /**
   * Delete organization (only organization owner can delete)
   */
  static async deleteOrganization(
    organizationId: string,
    userId: string
  ): Promise<boolean> {
    // Check if user is the owner
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerId: true },
    });

    if (!organization || organization.ownerId !== userId) {
      throw new Error("Only organization owner can delete organization");
    }

    return await prisma.$transaction(async (tx) => {
      // Update any profiles that have this as default organization
      await tx.profile.updateMany({
        where: { defaultOrganizationId: organizationId },
        data: { defaultOrganizationId: null },
      });

      // Delete the organization (cascades will handle members and receipts)
      await tx.organization.delete({
        where: { id: organizationId },
      });

      return true;
    });
  }

  // ===========================================
  // MEMBER MANAGEMENT METHODS
  // ===========================================

  /**
   * Add a member to organization (requires ADMIN or OWNER role)
   */
  static async addMember(
    organizationId: string,
    requesterId: string,
    memberData: AddMemberData
  ): Promise<OrganizationMember> {
    // Check if requester has permission
    const hasPermission = await this.hasRole(organizationId, requesterId, [
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    ]);

    if (!hasPermission) {
      throw new Error("Insufficient permissions to add members");
    }

    // Check if member already exists
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        profileId_organizationId: {
          profileId: memberData.profileId,
          organizationId,
        },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this organization");
    }

    // Only owners can add other owners
    if (memberData.role === OrganizationRole.OWNER) {
      const isOwner = await this.hasRole(organizationId, requesterId, [
        OrganizationRole.OWNER,
      ]);

      if (!isOwner) {
        throw new Error("Only organization owners can add other owners");
      }
    }

    return await prisma.organizationMember.create({
      data: {
        profileId: memberData.profileId,
        organizationId,
        role: memberData.role,
      },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update member role (requires ADMIN or OWNER)
   */
  static async updateMemberRole(
    organizationId: string,
    targetUserId: string,
    requesterId: string,
    roleData: UpdateMemberRoleData
  ): Promise<OrganizationMember | null> {
    // Check if requester has permission
    const hasPermission = await this.hasRole(organizationId, requesterId, [
      OrganizationRole.OWNER,
      OrganizationRole.ADMIN,
    ]);

    if (!hasPermission) {
      throw new Error("Insufficient permissions to update member roles");
    }

    // Only owners can promote to owner or demote owners
    if (roleData.role === OrganizationRole.OWNER) {
      const isOwner = await this.hasRole(organizationId, requesterId, [
        OrganizationRole.OWNER,
      ]);

      if (!isOwner) {
        throw new Error(
          "Only organization owners can promote members to owner"
        );
      }
    }

    // Check if target is currently an owner (only owners can demote owners)
    const targetCurrentRole = await this.getUserRole(
      organizationId,
      targetUserId
    );
    if (
      targetCurrentRole === OrganizationRole.OWNER &&
      roleData.role !== OrganizationRole.OWNER
    ) {
      const isOwner = await this.hasRole(organizationId, requesterId, [
        OrganizationRole.OWNER,
      ]);

      if (!isOwner) {
        throw new Error("Only organization owners can demote other owners");
      }
    }

    return await prisma.organizationMember.update({
      where: {
        profileId_organizationId: {
          profileId: targetUserId,
          organizationId,
        },
      },
      data: {
        role: roleData.role,
        updatedAt: new Date(),
      },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
      },
    });
  }

  /**
   * Remove member from organization (requires ADMIN or OWNER)
   */
  static async removeMember(
    organizationId: string,
    targetUserId: string,
    requesterId: string
  ): Promise<boolean> {
    // Users can remove themselves
    if (targetUserId === requesterId) {
      // Check if user is the owner and there are other members
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });

      const userRole = await this.getUserRole(organizationId, targetUserId);

      if (
        userRole === OrganizationRole.OWNER &&
        (organization?._count.members || 0) > 1
      ) {
        throw new Error(
          "Owner cannot leave organization with other members. Transfer ownership first."
        );
      }
    } else {
      // Check if requester has permission to remove others
      const hasPermission = await this.hasRole(organizationId, requesterId, [
        OrganizationRole.OWNER,
        OrganizationRole.ADMIN,
      ]);

      if (!hasPermission) {
        throw new Error("Insufficient permissions to remove members");
      }

      // Only owners can remove other owners or admins
      const targetRole = await this.getUserRole(organizationId, targetUserId);
      if (
        targetRole === OrganizationRole.OWNER ||
        targetRole === OrganizationRole.ADMIN
      ) {
        const isOwner = await this.hasRole(organizationId, requesterId, [
          OrganizationRole.OWNER,
        ]);

        if (!isOwner) {
          throw new Error(
            "Only organization owners can remove admins or owners"
          );
        }
      }
    }

    await prisma.organizationMember.delete({
      where: {
        profileId_organizationId: {
          profileId: targetUserId,
          organizationId,
        },
      },
    });

    return true;
  }

  /**
   * Get organization members with their roles
   */
  static async getOrganizationMembers(
    organizationId: string,
    requesterId: string
  ): Promise<Array<OrganizationMember & { profile: Partial<Profile> }>> {
    // Check if requester is a member
    const isMember = await this.isMember(organizationId, requesterId);
    if (!isMember) {
      throw new Error("You must be a member to view organization members");
    }

    return await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { role: "asc" }, // OWNER first
        { createdAt: "asc" }, // Then by join date
      ],
    });
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Check if user has specific role(s) in organization
   */
  static async hasRole(
    organizationId: string,
    userId: string,
    allowedRoles: OrganizationRole[]
  ): Promise<boolean> {
    const member = await prisma.organizationMember.findUnique({
      where: {
        profileId_organizationId: {
          profileId: userId,
          organizationId,
        },
      },
      select: { role: true },
    });

    return member ? allowedRoles.includes(member.role) : false;
  }

  /**
   * Get user's role in organization
   */
  static async getUserRole(
    organizationId: string,
    userId: string
  ): Promise<OrganizationRole | null> {
    const member = await prisma.organizationMember.findUnique({
      where: {
        profileId_organizationId: {
          profileId: userId,
          organizationId,
        },
      },
      select: { role: true },
    });

    return member?.role || null;
  }

  /**
   * Check if user is a member of organization
   */
  static async isMember(
    organizationId: string,
    userId: string
  ): Promise<boolean> {
    const member = await prisma.organizationMember.findUnique({
      where: {
        profileId_organizationId: {
          profileId: userId,
          organizationId,
        },
      },
    });

    return !!member;
  }

  /**
   * Set user's default organization
   */
  static async setDefaultOrganization(
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    // Check if user is a member of the organization
    const isMember = await this.isMember(organizationId, userId);
    if (!isMember) {
      throw new Error(
        "You must be a member of the organization to set it as default"
      );
    }

    await prisma.profile.update({
      where: { id: userId },
      data: { defaultOrganizationId: organizationId },
    });

    return true;
  }

  /**
   * Get organization statistics
   */
  static async getOrganizationStats(
    organizationId: string,
    userId: string
  ): Promise<{
    memberCount: number;
    receiptCount: number;
    totalExpenses: number;
    monthlyExpenses: number;
  }> {
    // Check if user is a member
    const isMember = await this.isMember(organizationId, userId);
    if (!isMember) {
      throw new Error("You must be a member to view organization statistics");
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            members: true,
            receipts: true,
          },
        },
        receipts: {
          select: {
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const totalExpenses = organization.receipts.reduce(
      (sum, receipt) => sum + Number(receipt.totalAmount),
      0
    );

    const currentMonth = new Date();
    const monthlyExpenses = organization.receipts
      .filter((receipt) => {
        const receiptDate = new Date(receipt.createdAt);
        return (
          receiptDate.getMonth() === currentMonth.getMonth() &&
          receiptDate.getFullYear() === currentMonth.getFullYear()
        );
      })
      .reduce((sum, receipt) => sum + Number(receipt.totalAmount), 0);

    return {
      memberCount: organization._count.members,
      receiptCount: organization._count.receipts,
      totalExpenses,
      monthlyExpenses,
    };
  }
}
