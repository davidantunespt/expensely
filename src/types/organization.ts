export interface Organization {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  isOwner: boolean;
}

export interface Member {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member";
  status: "active" | "pending";
  joinedAt: Date;
  lastActive?: Date;
  avatar?: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: "admin" | "member";
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: "pending" | "accepted" | "expired" | "cancelled";
}

export interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  setCurrentOrganization: (org: Organization) => void;
  createOrganization: (
    org: Omit<Organization, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  getMembers: (orgId: string) => Member[];
  getInvitations: (orgId: string) => Invitation[];
  inviteMember: (
    orgId: string,
    email: string,
    role: "admin" | "member"
  ) => void;
  updateMemberRole: (
    orgId: string,
    memberId: string,
    role: "admin" | "member"
  ) => void;
  removeMember: (orgId: string, memberId: string) => void;
  cancelInvitation: (orgId: string, invitationId: string) => void;
  resendInvitation: (orgId: string, invitationId: string) => void;
}
