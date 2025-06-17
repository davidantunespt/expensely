'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization, OrganizationContextType, Member, Invitation } from '@/types/organization';

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Mock data for demonstration with new color palette
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    description: 'Main business organization',
    color: '#1DE9B6',
    avatar: 'AC',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    memberCount: 12,
    isOwner: true,
  },
  {
    id: '2',
    name: 'Freelance Projects',
    description: 'Personal freelance work',
    color: '#37474F',
    avatar: 'FP',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    memberCount: 1,
    isOwner: true,
  },
  {
    id: '3',
    name: 'Tech Startup Inc.',
    description: 'Startup company expenses',
    color: '#FF9100',
    avatar: 'TS',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    memberCount: 8,
    isOwner: false,
  },
];

const mockMembers: Record<string, Member[]> = {
  '1': [
    {
      id: 'm1',
      email: 'davidnunes88@gmail.com',
      name: 'David Nunes',
      role: 'owner',
      status: 'active',
      joinedAt: new Date('2024-01-01'),
      lastActive: new Date('2024-01-30'),
    },
    {
      id: 'm2',
      email: 'sarah.johnson@acme.com',
      name: 'Sarah Johnson',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-01-05'),
      lastActive: new Date('2024-01-29'),
    },
    {
      id: 'm3',
      email: 'mike.chen@acme.com',
      name: 'Mike Chen',
      role: 'member',
      status: 'active',
      joinedAt: new Date('2024-01-10'),
      lastActive: new Date('2024-01-28'),
    },
    {
      id: 'm4',
      email: 'lisa.wong@acme.com',
      name: 'Lisa Wong',
      role: 'member',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date('2024-01-27'),
    },
  ],
  '2': [
    {
      id: 'm5',
      email: 'davidnunes88@gmail.com',
      name: 'David Nunes',
      role: 'owner',
      status: 'active',
      joinedAt: new Date('2024-01-10'),
      lastActive: new Date('2024-01-30'),
    },
  ],
  '3': [
    {
      id: 'm6',
      email: 'founder@techstartup.com',
      name: 'Alex Rodriguez',
      role: 'owner',
      status: 'active',
      joinedAt: new Date('2024-01-20'),
      lastActive: new Date('2024-01-30'),
    },
    {
      id: 'm7',
      email: 'davidnunes88@gmail.com',
      name: 'David Nunes',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-01-22'),
      lastActive: new Date('2024-01-29'),
    },
  ],
};

const mockInvitations: Record<string, Invitation[]> = {
  '1': [
    {
      id: 'i1',
      email: 'john.doe@example.com',
      role: 'member',
      invitedBy: 'David Nunes',
      invitedAt: new Date('2024-01-25'),
      expiresAt: new Date('2024-02-08'),
      status: 'pending',
    },
    {
      id: 'i2',
      email: 'jane.smith@example.com',
      role: 'admin',
      invitedBy: 'David Nunes',
      invitedAt: new Date('2024-01-28'),
      expiresAt: new Date('2024-02-11'),
      status: 'pending',
    },
  ],
  '2': [],
  '3': [
    {
      id: 'i3',
      email: 'developer@example.com',
      role: 'member',
      invitedBy: 'Alex Rodriguez',
      invitedAt: new Date('2024-01-29'),
      expiresAt: new Date('2024-02-12'),
      status: 'pending',
    },
  ],
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<Record<string, Member[]>>(mockMembers);
  const [invitations, setInvitations] = useState<Record<string, Invitation[]>>(mockInvitations);

  useEffect(() => {
    // Simulate loading and set default organization
    const timer = setTimeout(() => {
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const defaultOrg = savedOrgId 
        ? organizations.find(org => org.id === savedOrgId) || organizations[0]
        : organizations[0];
      
      setCurrentOrganization(defaultOrg);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [organizations]);

  const handleSetCurrentOrganization = (org: Organization) => {
    setCurrentOrganization(org);
    localStorage.setItem('currentOrganizationId', org.id);
  };

  const createOrganization = (orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrg: Organization = {
      ...orgData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setOrganizations(prev => [...prev, newOrg]);
    
    // Add the creator as owner
    const ownerMember: Member = {
      id: `m${Date.now()}`,
      email: 'davidnunes88@gmail.com',
      name: 'David Nunes',
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
      lastActive: new Date(),
    };
    
    setMembers(prev => ({
      ...prev,
      [newOrg.id]: [ownerMember],
    }));
    
    setInvitations(prev => ({
      ...prev,
      [newOrg.id]: [],
    }));
  };

  const updateOrganization = (id: string, updates: Partial<Organization>) => {
    setOrganizations(prev => 
      prev.map(org => 
        org.id === id 
          ? { ...org, ...updates, updatedAt: new Date() }
          : org
      )
    );
    
    if (currentOrganization?.id === id) {
      setCurrentOrganization(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const deleteOrganization = (id: string) => {
    setOrganizations(prev => prev.filter(org => org.id !== id));
    setMembers(prev => {
      const newMembers = { ...prev };
      delete newMembers[id];
      return newMembers;
    });
    setInvitations(prev => {
      const newInvitations = { ...prev };
      delete newInvitations[id];
      return newInvitations;
    });
    
    if (currentOrganization?.id === id) {
      const remainingOrgs = organizations.filter(org => org.id !== id);
      setCurrentOrganization(remainingOrgs[0] || null);
    }
  };

  const getMembers = (orgId: string): Member[] => {
    return members[orgId] || [];
  };

  const getInvitations = (orgId: string): Invitation[] => {
    return invitations[orgId] || [];
  };

  const inviteMember = (orgId: string, email: string, role: 'admin' | 'member') => {
    const newInvitation: Invitation = {
      id: `i${Date.now()}`,
      email,
      role,
      invitedBy: 'David Nunes',
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'pending',
    };

    setInvitations(prev => ({
      ...prev,
      [orgId]: [...(prev[orgId] || []), newInvitation],
    }));

    // Update organization member count
    setOrganizations(prev =>
      prev.map(org =>
        org.id === orgId
          ? { ...org, memberCount: org.memberCount + 1, updatedAt: new Date() }
          : org
      )
    );
  };

  const updateMemberRole = (orgId: string, memberId: string, role: 'admin' | 'member') => {
    setMembers(prev => ({
      ...prev,
      [orgId]: prev[orgId]?.map(member =>
        member.id === memberId ? { ...member, role } : member
      ) || [],
    }));
  };

  const removeMember = (orgId: string, memberId: string) => {
    setMembers(prev => ({
      ...prev,
      [orgId]: prev[orgId]?.filter(member => member.id !== memberId) || [],
    }));

    // Update organization member count
    setOrganizations(prev =>
      prev.map(org =>
        org.id === orgId
          ? { ...org, memberCount: Math.max(1, org.memberCount - 1), updatedAt: new Date() }
          : org
      )
    );
  };

  const cancelInvitation = (orgId: string, invitationId: string) => {
    setInvitations(prev => ({
      ...prev,
      [orgId]: prev[orgId]?.map(invitation =>
        invitation.id === invitationId
          ? { ...invitation, status: 'cancelled' as const }
          : invitation
      ) || [],
    }));

    // Update organization member count
    setOrganizations(prev =>
      prev.map(org =>
        org.id === orgId
          ? { ...org, memberCount: Math.max(1, org.memberCount - 1), updatedAt: new Date() }
          : org
      )
    );
  };

  const resendInvitation = (orgId: string, invitationId: string) => {
    setInvitations(prev => ({
      ...prev,
      [orgId]: prev[orgId]?.map(invitation =>
        invitation.id === invitationId
          ? {
              ...invitation,
              invitedAt: new Date(),
              expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              status: 'pending' as const,
            }
          : invitation
      ) || [],
    }));
  };

  const value: OrganizationContextType = {
    organizations,
    currentOrganization,
    isLoading,
    setCurrentOrganization: handleSetCurrentOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getMembers,
    getInvitations,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvitation,
    resendInvitation,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
