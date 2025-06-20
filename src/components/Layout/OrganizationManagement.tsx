import React, { useState } from 'react';
import { 
  X, Plus, Edit2, Trash2, Users, Calendar, Mail, Send, 
  Shield, Crown, UserCheck, Clock, RefreshCw,
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Organization } from '@/types/organization';

interface OrganizationManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const organizationColors = [
  '#1DE9B6', '#37474F', '#FF9100', '#3B82F6', '#10B981', '#F59E0B', 
  '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899'
];

type TabType = 'organizations' | 'members' | 'invitations';

export function OrganizationManagement({ isOpen, onClose }: OrganizationManagementProps) {
  const { 
    organizations, 
    currentOrganization,
    createOrganization, 
    updateOrganization, 
    deleteOrganization,
    getMembers,
    getInvitations,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvitation,
    resendInvitation
  } = useOrganization();
  
  const [activeTab, setActiveTab] = useState<TabType>('organizations');
  const [isCreating, setIsCreating] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: organizationColors[0],
    avatar: '',
  });

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member' as 'admin' | 'member',
  });

  const members = currentOrganization ? getMembers(currentOrganization.id) : [];
  const invitations = currentOrganization ? getInvitations(currentOrganization.id) : [];
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: organizationColors[0],
      avatar: '',
    });
    setIsCreating(false);
    setEditingOrg(null);
  };

  const resetInviteForm = () => {
    setInviteData({
      email: '',
      role: 'member',
    });
    setIsInviting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOrg) {
      updateOrganization(editingOrg.id, formData);
    } else {
      createOrganization({
        ...formData,
        memberCount: 1,
        isOwner: true,
      });
    }
    
    resetForm();
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentOrganization) {
      inviteMember(currentOrganization.id, inviteData.email, inviteData.role);
      resetInviteForm();
    }
  };

  const handleEdit = (org: Organization) => {
    setFormData({
      name: org.name,
      description: org.description || '',
      color: org.color,
      avatar: org.avatar || '',
    });
    setEditingOrg(org);
  };

  const handleDelete = (orgId: string) => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      deleteOrganization(orgId);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (currentOrganization && confirm('Are you sure you want to remove this member?')) {
      removeMember(currentOrganization.id, memberId);
    }
  };

  const handleUpdateRole = (memberId: string, newRole: 'admin' | 'member') => {
    if (currentOrganization) {
      updateMemberRole(currentOrganization.id, memberId, newRole);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-success-green" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-accent" />;
      default:
        return <UserCheck className="w-4 h-4 text-primary-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    switch (role) {
      case 'owner':
        return `${baseClasses} bg-success-green-100 text-success-green`;
      case 'admin':
        return `${baseClasses} bg-accent-100 text-accent`;
      default:
        return `${baseClasses} bg-primary-100 text-primary`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold text-gray-900">Organization Management</h2>
            {currentOrganization && (
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-inverse text-sm font-bold"
                  style={{ backgroundColor: currentOrganization.color }}
                >
                  {currentOrganization.avatar || currentOrganization.name.charAt(0)}
                </div>
                <span className="text-gray-900 font-medium">{currentOrganization.name}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-8">
            {[
              { id: 'organizations', label: 'Organizations', icon: Users },
              { id: 'members', label: 'Members', icon: UserCheck, count: members.length },
              { id: 'invitations', label: 'Invitations', icon: Mail, count: pendingInvitations.length },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-3 py-4 px-2 border-b-2 font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-accent text-text-inverse px-2 py-1 rounded-full text-xs font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] bg-bg-primary">
          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <div>
              {/* Create/Edit Form */}
              {(isCreating || editingOrg) && (
                <div className="bg-bg-secondary rounded-2xl p-8 mb-8 border border-border-primary">
                  <h3 className="text-xl font-bold text-text-primary mb-6">
                    {editingOrg ? 'Edit Organization' : 'Create New Organization'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-3">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 cursor-text text-text-primary bg-bg-primary"
                          placeholder="Enter organization name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-3">
                          Avatar (2 letters)
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 cursor-text text-text-primary bg-bg-primary"
                          placeholder="AC"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-3">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 cursor-text text-text-primary bg-bg-primary"
                        placeholder="Brief description of the organization"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-3">
                        Color Theme
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {organizationColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                              formData.color === color ? 'border-accent' : 'border-transparent hover:border-border-secondary'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        className="px-8 py-3 bg-primary text-text-inverse rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold cursor-pointer"
                      >
                        {editingOrg ? 'Update Organization' : 'Create Organization'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-3 bg-bg-muted text-text-secondary rounded-xl hover:bg-secondary-300 transition-all duration-200 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Organizations List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-text-primary">Your Organizations</h3>
                  {!isCreating && !editingOrg && (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-primary text-text-inverse rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Organization</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="border-2 border-border-primary rounded-2xl p-6 hover:border-border-accent transition-all duration-200 bg-bg-primary"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-text-inverse font-bold text-lg"
                            style={{ backgroundColor: org.color }}
                          >
                            {org.avatar || org.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-text-primary text-lg">{org.name}</h4>
                            {org.description && (
                              <p className="text-text-secondary mt-1">{org.description}</p>
                            )}
                            <div className="flex items-center space-x-6 mt-3">
                              <div className="flex items-center space-x-2 text-text-muted">
                                <Users className="w-4 h-4" />
                                <span className="font-medium">{org.memberCount} members</span>
                              </div>
                              <div className="flex items-center space-x-2 text-text-muted">
                                <Calendar className="w-4 h-4" />
                                <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {org.isOwner && (
                            <>
                              <button
                                onClick={() => handleEdit(org)}
                                className="p-3 text-text-muted hover:text-accent hover:bg-bg-accent rounded-xl transition-all duration-200 cursor-pointer"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(org.id)}
                                className="p-3 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {org.isOwner && (
                        <div className="mt-4 flex">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-green-100 text-success-green">
                            Owner
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-text-primary">Team Members</h3>
                {currentOrganization?.isOwner && (
                  <button
                    onClick={() => setIsInviting(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-text-inverse rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Invite Member</span>
                  </button>
                )}
              </div>

              {/* Invite Form */}
              {isInviting && (
                <div className="bg-bg-secondary rounded-2xl p-8 mb-8 border border-border-primary">
                  <h4 className="text-xl font-bold text-text-primary mb-6">Invite New Member</h4>
                  
                  <form onSubmit={handleInviteSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-3">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={inviteData.email}
                          onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 cursor-text text-text-primary bg-bg-primary"
                          placeholder="member@example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-text-primary mb-3">
                          Role
                        </label>
                        <select
                          value={inviteData.role}
                          onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as 'admin' | 'member' })}
                          className="w-full px-4 py-3 border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200 cursor-pointer text-text-primary bg-bg-primary"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-8 py-3 bg-primary text-text-inverse rounded-xl hover:bg-primary-700 transition-all duration-200 font-semibold cursor-pointer"
                      >
                        <Send className="w-5 h-5" />
                        <span>Send Invitation</span>
                      </button>
                      <button
                        type="button"
                        onClick={resetInviteForm}
                        className="px-8 py-3 bg-bg-muted text-text-secondary rounded-xl hover:bg-secondary-300 transition-all duration-200 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-6 border-2 border-border-primary rounded-2xl hover:bg-bg-secondary transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary-300 rounded-xl flex items-center justify-center">
                        <span className="text-text-primary font-bold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-text-primary">{member.name}</h4>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-text-secondary">{member.email}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={getRoleBadge(member.role)}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                          {member.lastActive && (
                            <span className="text-xs text-text-muted">
                              Last active {member.lastActive.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {currentOrganization?.isOwner && member.role !== 'owner' && (
                      <div className="flex items-center space-x-3">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value as 'admin' | 'member')}
                          className="text-sm border border-border-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer text-text-primary bg-bg-primary"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-text-primary">Pending Invitations</h3>
                <span className="text-sm text-text-secondary bg-bg-secondary px-3 py-1 rounded-full font-medium">
                  {pendingInvitations.length} pending
                </span>
              </div>

              {pendingInvitations.length === 0 ? (
                <div className="text-center py-16">
                  <Mail className="w-16 h-16 text-secondary-200 mx-auto mb-6" />
                  <h4 className="text-xl font-semibold text-text-primary mb-3">No pending invitations</h4>
                  <p className="text-text-secondary">All team members have accepted their invitations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-6 border-2 border-border-primary rounded-2xl bg-accent-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-accent-200 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-text-primary">{invitation.email}</h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={getRoleBadge(invitation.role)}>
                              {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                            </span>
                            <span className="text-xs text-text-muted">
                              Invited by {invitation.invitedBy}
                            </span>
                            <span className="text-xs text-text-muted">
                              Expires {invitation.expiresAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {currentOrganization?.isOwner && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => resendInvitation(currentOrganization.id, invitation.id)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-accent hover:bg-bg-accent hover:text-accent rounded-lg transition-all duration-200 font-medium cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Resend</span>
                          </button>
                          <button
                            onClick={() => cancelInvitation(currentOrganization.id, invitation.id)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}