import { prisma } from "@/lib/prisma";
import { Profile } from "@/generated/prisma";

export type CreateProfileData = {
  id: string; // Supabase auth user ID
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export type UpdateProfileData = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export class ProfileService {
  /**
   * Create a new user profile (called after Supabase signup)
   */
  static async createProfile(data: CreateProfileData) {
    return await prisma.profile.create({
      data: {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName || `${data.firstName} ${data.lastName}`,
        email: data.email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
        defaultOrganization: {
          select: {
            id: true,
            name: true,
          },
        },
        organizations: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  /**
   * Get user profile by ID
   */
  static async getProfileById(
    userId: string
  ): Promise<Partial<Profile> | null> {
    return await prisma.profile.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
      },
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<Profile | null> {
    try {
      return await prisma.profile.update({
        where: {
          id: userId,
        },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: data.displayName,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  }

  /**
   * Delete user profile (called when user deletes account)
   */
  static async deleteProfile(userId: string): Promise<boolean> {
    try {
      await prisma.profile.delete({
        where: {
          id: userId,
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting profile:", error);
      return false;
    }
  }

  /**
   * Get total profile count (for admin/stats purposes)
   */
  static async getProfileCount(): Promise<number> {
    return await prisma.profile.count();
  }

  /**
   * Get profile with receipt count and total expenses
   */
  static async getProfileWithStats(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: {
        id: userId,
      },
      include: {
        receipts: {
          select: {
            totalAmount: true,
            isDeductible: true,
          },
        },
      },
    });

    if (!profile) return null;

    const totalExpenses = profile.receipts.reduce(
      (sum, receipt) => sum + Number(receipt.totalAmount),
      0
    );
    const taxDeductibleExpenses = profile.receipts
      .filter((receipt) => receipt.isDeductible)
      .reduce((sum, receipt) => sum + Number(receipt.totalAmount), 0);

    return {
      ...profile,
      stats: {
        receiptCount: profile.receipts.length,
        totalExpenses,
        taxDeductibleExpenses,
      },
    };
  }
}
