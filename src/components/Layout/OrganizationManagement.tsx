import React, { useState } from 'react';
import { 
  X, Plus, Edit2, Trash2, Users, Calendar, Mail, Send, 
  Shield, Crown, UserCheck, Clock, RefreshCw, Building2
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Organization } from '@/types/organization';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface OrganizationManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const organizationColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', 
  '#F97316', '#84CC16', '#EC4899', '#6B7280', '#1DE9B6', '#37474F'
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
  
  const { showSuccess, showError, toasts, removeToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('organizations');
  const [isCreating, setIsCreating] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{name?: string}>({});
  
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
    setFormErrors({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate required fields
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Organization name is required' });
      showError('Organization name is required', 'Please enter a valid organization name.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id, formData);
        showSuccess('Organization updated', 'Your organization has been updated successfully.');
      } else {
        await createOrganization({
          ...formData,
          memberCount: 1,
          isOwner: true,
        });
        showSuccess('Organization created', 'Your new organization has been created successfully.');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving organization:', error);
      showError(
        editingOrg ? 'Failed to update organization' : 'Failed to create organization',
        'Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1000px] !w-[99vw] !max-h-[85vh] !top-[10%] !translate-y-0 p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gray-50/50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Organization Management</span>
            </div>
            {currentOrganization && (
              <div className="flex items-center gap-2 ml-auto">
                <Avatar className="w-5 h-5">
                  <AvatarFallback 
                    className="text-xs font-bold text-white"
                    style={{ backgroundColor: currentOrganization.color }}
                  >
                    {currentOrganization.avatar || currentOrganization.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentOrganization.name}
                </span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="px-6 pt-4 pb-0 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="organizations" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Building2 className="w-4 h-4" />
                  <span>Organizations</span>
                </TabsTrigger>
                <TabsTrigger value="members" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                  {members.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                      {members.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="invitations" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Mail className="w-4 h-4" />
                  <span>Invitations</span>
                  {pendingInvitations.length > 0 && (
                    <Badge variant="default" className="ml-1 h-5 min-w-5 text-xs">
                      {pendingInvitations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 px-6 py-6">
              {/* Organizations Tab */}
              <TabsContent value="organizations" className="mt-0 space-y-6">
                {/* Header with Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Organizations</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage all your organizations and their settings
                    </p>
                  </div>
                  {!isCreating && !editingOrg && (
                    <Button onClick={() => setIsCreating(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      New Organization
                    </Button>
                  )}
                </div>

                {/* Create/Edit Form */}
                {(isCreating || editingOrg) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {editingOrg ? 'Edit Organization' : 'Create New Organization'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                              Organization Name *
                            </Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                // Clear error when user starts typing
                                if (formErrors.name && e.target.value.trim()) {
                                  setFormErrors({ ...formErrors, name: undefined });
                                }
                              }}
                              placeholder="Enter organization name"
                              className={`h-9 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {formErrors.name && (
                              <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="avatar" className="text-sm font-medium">Avatar (2 letters)</Label>
                            <Input
                              id="avatar"
                              maxLength={2}
                              value={formData.avatar}
                              onChange={(e) => setFormData({ ...formData, avatar: e.target.value.toUpperCase() })}
                              placeholder="AC"
                              className="h-9"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the organization"
                            rows={2}
                            className="resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Color Theme</Label>
                          <div className="flex flex-wrap gap-2">
                            {organizationColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className={`w-7 h-7 rounded-lg border-2 transition-all duration-200 ${
                                  formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button type="submit" size="sm" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (editingOrg ? 'Update Organization' : 'Create Organization')}
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={resetForm} disabled={isSubmitting}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Organizations List */}
                <div className="space-y-6">
                  {organizations.map((org) => (
                    <Card key={org.id} className="group hover:shadow-sm transition-all duration-200 border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback 
                                className="text-lg font-bold text-white"
                                style={{ backgroundColor: org.color }}
                              >
                                {org.avatar || org.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">{org.name}</h4>
                                {org.isOwner && (
                                  <Badge variant="default" className="text-xs h-5 bg-green-100 text-green-700 hover:bg-green-100">
                                    Owner
                                  </Badge>
                                )}
                              </div>
                              {org.description && (
                                <p className="text-sm text-muted-foreground">{org.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{org.memberCount} members</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {org.isOwner && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(org)}
                                tooltip="Edit organization"
                                icon={<Edit2 />}
                              />
                              <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(org.id)}
                                tooltip="Delete organization"
                                icon={<Trash2 />}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your team members and their roles
                    </p>
                  </div>
                  {currentOrganization?.isOwner && (
                    <Button onClick={() => setIsInviting(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Invite Member
                    </Button>
                  )}
                </div>

                {/* Invite Form */}
                {isInviting && (
                  <Card className="border-2 border-dashed border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base">Invite New Member</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <form onSubmit={handleInviteSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={inviteData.email}
                              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                              placeholder="member@example.com"
                              className="h-9"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                            <Select
                              value={inviteData.role}
                              onValueChange={(value) => setInviteData({ ...inviteData, role: value as 'admin' | 'member' })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button type="submit" size="sm" className="gap-2">
                            <Send className="w-4 h-4" />
                            Send Invitation
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={resetInviteForm}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Members List */}
                <div className="space-y-3">
                  {members.map((member) => (
                    <Card key={member.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{member.name}</h4>
                                {getRoleIcon(member.role)}
                              </div>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                              <div className="flex items-center gap-3">
                                <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs h-5">
                                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                </Badge>
                                {member.lastActive && (
                                  <span className="text-xs text-muted-foreground">
                                    Last active {member.lastActive.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {currentOrganization?.isOwner && member.role !== 'owner' && (
                            <div className="flex items-center gap-2">
                              <Select
                                value={member.role}
                                onValueChange={(value) => handleUpdateRole(member.id, value as 'admin' | 'member')}
                              >
                                <SelectTrigger className="w-28 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                tooltip="Remove member"
                                icon={<Trash2 />}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Invitations Tab */}
              <TabsContent value="invitations" className="mt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage outstanding invitations to your organization
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pendingInvitations.length} pending
                  </Badge>
                </div>

                {pendingInvitations.length === 0 ? (
                  <Card className="border-2 border-gray-200">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Mail className="w-12 h-12 text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h4>
                      <p className="text-muted-foreground text-center text-sm">
                        All team members have accepted their invitations.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <Card key={invitation.id} className="border-l-4 border-l-amber-400 border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-amber-100">
                                  <Clock className="w-4 h-4 text-amber-600" />
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="space-y-1">
                                <h4 className="font-medium text-gray-900">{invitation.email}</h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <Badge variant={getRoleBadgeVariant(invitation.role)} className="text-xs h-5">
                                    {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                                  </Badge>
                                  <span>Invited by {invitation.invitedBy}</span>
                                  <span>Expires {invitation.expiresAt.toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {currentOrganization?.isOwner && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => resendInvitation(currentOrganization.id, invitation.id)}
                                  className="gap-2 h-8 text-xs"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Resend
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => cancelInvitation(currentOrganization.id, invitation.id)}
                                  className="gap-2 h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-3 h-3" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Toast Container - Outside Dialog for proper z-index */}
    <ToastContainer toasts={toasts} onClose={removeToast} />
  </>
  );
}