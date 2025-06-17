import { OrganizationRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Verifies if the user has access to the organization
 */
export async function verifyAccess(userId: string, organizationId: string) {
  if (!organizationId) {
    return OrganizationRole.ADMIN;
  }

  // TODO: handle this case
  if (userId === organizationId) {
    return OrganizationRole.ADMIN;
  }

  const membership = await prisma.organizationMember.findFirst({
    where: {
      profileId: userId,
      organizationId: organizationId,
    },
  });

  if (!membership) {
    throw new UnauthorizedError("You do not have access to this organization");
  }

  return membership.role;
}
