'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization, OrganizationContextType, Member, Invitation } from '@/types/organization';

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<Record<string, Member[]>>({});
  const [invitations, setInvitations] = useState<Record<string, Invitation[]>>({});

  // Fetch organizations from backend
  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      const result = await response.json();
      
      if (result.success) {
        setOrganizations(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  };

  // Fetch members for a specific organization
  const fetchMembers = async (orgId: string) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`);
      const result = await response.json();
      
      if (result.success) {
        setMembers(prev => ({
          ...prev,
          [orgId]: result.data
        }));
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Initialize organizations and set default
    const initializeOrganizations = async () => {
      setIsLoading(true);
      try {
        const orgs = await fetchOrganizations();
        
        // Set default organization
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        const defaultOrg = savedOrgId 
          ? orgs.find((org: Organization) => org.id === savedOrgId) || orgs[0]
          : orgs[0];
        
        if (defaultOrg) {
          setCurrentOrganization(defaultOrg);
          // Fetch members for the default organization
          await fetchMembers(defaultOrg.id);
        }
      } catch (error) {
        console.error('Failed to initialize organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrganizations();
  }, []);

  const handleSetCurrentOrganization = async (org: Organization) => {
    setCurrentOrganization(org);
    localStorage.setItem('currentOrganizationId', org.id);
    // Fetch members for the selected organization
    try {
      await fetchMembers(org.id);
    } catch (error) {
      console.error('Failed to fetch members for organization:', error);
    }
  };

  const createOrganization = async (orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newOrg = result.data;
        setOrganizations(prev => [...prev, newOrg]);
        
        // Initialize empty members and invitations for the new organization
        setMembers(prev => ({
          ...prev,
          [newOrg.id]: [],
        }));
        
        setInvitations(prev => ({
          ...prev,
          [newOrg.id]: [],
        }));
        
        return newOrg;
      } else {
        throw new Error(result.message || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const updatedOrg = result.data;
        setOrganizations(prev => 
          prev.map(org => 
            org.id === id ? updatedOrg : org
          )
        );
        
        if (currentOrganization?.id === id) {
          setCurrentOrganization(updatedOrg);
        }
        
        return updatedOrg;
      } else {
        throw new Error(result.message || 'Failed to update organization');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      const response = await fetch(`/api/organizations/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
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
      } else {
        throw new Error(result.message || 'Failed to delete organization');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  };

  const getMembers = (orgId: string): Member[] => {
    return members[orgId] || [];
  };

  const getInvitations = (orgId: string): Invitation[] => {
    return invitations[orgId] || [];
  };

  const inviteMember = async (orgId: string, email: string, role: 'admin' | 'member') => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh members list to include the new member
        await fetchMembers(orgId);
        
        // Update organization member count
        setOrganizations(prev =>
          prev.map(org =>
            org.id === orgId
              ? { ...org, memberCount: org.memberCount + 1, updatedAt: new Date() }
              : org
          )
        );
      } else {
        throw new Error(result.message || 'Failed to invite member');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (orgId: string, memberId: string, role: 'admin' | 'member') => {
    try {
      // TODO: Implement API call for updating member role
      // For now, update locally
      setMembers(prev => ({
        ...prev,
        [orgId]: prev[orgId]?.map(member =>
          member.id === memberId ? { ...member, role } : member
        ) || [],
      }));
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  const removeMember = async (orgId: string, memberId: string) => {
    try {
      // TODO: Implement API call for removing member
      // For now, update locally
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
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const cancelInvitation = async (orgId: string, invitationId: string) => {
    try {
      // TODO: Implement API call for canceling invitation
      // For now, update locally
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
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  };

  const resendInvitation = async (orgId: string, invitationId: string) => {
    try {
      // TODO: Implement API call for resending invitation
      // For now, update locally
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
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
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
