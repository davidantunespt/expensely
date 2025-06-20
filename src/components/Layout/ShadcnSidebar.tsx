"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Camera,
  FolderOpen,
  Receipt,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Search,
  ChevronDown,
  User,
  MoreHorizontal,
  Check,
  Plus,
  ChevronsUpDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Organization } from "@/types/organization";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Navigation items based on the app requirements
const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Upload Receipt",
    href: "/upload",
    icon: Camera,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: FolderOpen,
  },
  {
    name: "Invoicing",
    href: "/invoicing",
    icon: Receipt,
  },
  {
    name: "Tax Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

// Project-like organization for expenses (inspired by the image)
const projectItems = [
  {
    name: "Business Expenses",
    href: "/expenses/business",
    active: true,
  },
  {
    name: "Travel & Transport",
    href: "/expenses/travel",
    active: false,
  },
  {
    name: "Office Supplies",
    href: "/expenses/office",
    active: false,
  },
  {
    name: "Marketing",
    href: "/expenses/marketing",
    active: false,
  },
  {
    name: "Professional Services",
    href: "/expenses/professional",
    active: false,
  },
];

const bottomNavItems = [
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: 2,
  },
  {
    name: "Help Center",
    href: "/help",
    icon: HelpCircle,
  },
];

interface ShadcnSidebarProps {
  onOpenOrgManagement: () => void;
}

export function ShadcnSidebar({ onOpenOrgManagement }: ShadcnSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { 
    organizations, 
    currentOrganization, 
    setCurrentOrganization, 
    isLoading: orgLoading 
  } = useOrganization();
  const { state } = useSidebar();
  const [profile, setProfile] = useState<{
    first_name: string | null;
    last_name: string | null;
  } | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState("");

  const isCollapsed = state === "collapsed";

  // Filter organizations based on search
  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
  );

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        console.log("🔐 User:", user);
        try {
          setProfile({
            first_name: user.user_metadata.first_name,
            last_name: user.user_metadata.last_name,
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      setSigningOut(false);
    }
  };

  const handleOrganizationSelect = (org: Organization) => {
    setCurrentOrganization(org);
    setOrgDropdownOpen(false);
    setOrgSearchQuery("");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "RT";
  };

  // Get display name
  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (user?.email) {
      return user.email;
    }
    return "Receipt Tracker";
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="bg-white border-r border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Header Section with Logo and User Info */}
        <SidebarHeader className={cn(
          "border-b border-gray-100 flex flex-col items-center",
          isCollapsed ? "p-4" : "p-6"
        )}>
          {!isCollapsed ? (
            <div className="space-y-4">
              {/* Company Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">RT</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                    Receipt Tracker
                  </h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">RT</span>
              </div>
              
            </div>
          )}
        </SidebarHeader>

        {/* Organization Selection Area */}
        <div className={cn(
          "border-b border-gray-100",
          isCollapsed ? "px-2 py-4" : "px-4 py-4"
        )}>
          {!isCollapsed ? (
            <div className="space-y-2">              
              {orgLoading ? (
                <div className="flex items-center space-x-3 p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              ) : currentOrganization ? (
                <DropdownMenu open={orgDropdownOpen} onOpenChange={setOrgDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ backgroundColor: currentOrganization.color }}
                        >
                          {currentOrganization.avatar || currentOrganization.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">
                            {currentOrganization.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {currentOrganization.memberCount} {currentOrganization.memberCount === 1 ? 'member' : 'members'}
                          </div>
                        </div>
                      </div>
                      <ChevronsUpDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="w-80 p-0"
                    sideOffset={8}
                  >
                    <div className="p-5 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search organizations..."
                          value={orgSearchQuery}
                          onChange={(e) => setOrgSearchQuery(e.target.value)}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {filteredOrganizations.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          onClick={() => handleOrganizationSelect(org)}
                          className="p-3 cursor-pointer"
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ backgroundColor: org.color }}
                            >
                              {org.avatar || org.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate text-sm">
                                {org.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {org.description || `${org.memberCount} members`}
                              </div>
                            </div>
                            {currentOrganization.id === org.id && (
                              <Check className="h-4 w-4 text-gray-600 flex-shrink-0" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    
                    {filteredOrganizations.length === 0 && (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        No organizations found
                      </div>
                    )}
                    
                    <div className="border-t border-gray-100">
                      <DropdownMenuItem 
                        onClick={() => {
                          onOpenOrgManagement();
                          setOrgDropdownOpen(false);
                        }}
                        className="p-3 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              Manage Organizations
                            </div>
                            <div className="text-xs text-gray-500">
                              Create, edit, or delete organizations
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3 p-2 text-gray-500">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">?</span>
                  </div>
                  <span className="text-sm">No organization selected</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              {currentOrganization ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                            style={{ backgroundColor: currentOrganization.color }}
                          >
                            {currentOrganization.avatar || currentOrganization.name.charAt(0).toUpperCase()}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-80 p-0" side="right">
                        <div className="p-3 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search organizations..."
                              value={orgSearchQuery}
                              onChange={(e) => setOrgSearchQuery(e.target.value)}
                              className="pl-10 h-8"
                            />
                          </div>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto">
                          {filteredOrganizations.map((org) => (
                            <DropdownMenuItem
                              key={org.id}
                              onClick={() => handleOrganizationSelect(org)}
                              className="p-3 cursor-pointer"
                            >
                              <div className="flex items-center space-x-3 w-full">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                  style={{ backgroundColor: org.color }}
                                >
                                  {org.avatar || org.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate text-sm">
                                    {org.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {org.description || `${org.memberCount} members`}
                                  </div>
                                </div>
                                {currentOrganization.id === org.id && (
                                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                        
                        <div className="border-t border-gray-100">
                          <DropdownMenuItem 
                            onClick={onOpenOrgManagement}
                            className="p-3 cursor-pointer"
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Plus className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  Manage Organizations
                                </div>
                                <div className="text-xs text-gray-500">
                                  Create, edit, or delete organizations
                                </div>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{currentOrganization.name}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">?</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>No organization selected</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <SidebarContent className={cn(
          "overflow-y-auto overflow-x-hidden",
          isCollapsed ? "px-2 py-4" : "px-3 py-4"
        )}>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const IconComponent = item.icon;

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={isCollapsed ? item.name : undefined}
                        className={cn(
                          "transition-all duration-200 font-medium",
                          isCollapsed
                            ? "justify-center p-0  hover:bg-gray-100"
                            : "w-full h-10 rounded-lg justify-start px-3",
                          isActive
                            ? isCollapsed 
                              ? "text-blue-700 hover:text-blue-100" 
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                            : isCollapsed 
                              ? "text-gray-600 hover:text-gray-900" 
                              : "text-gray-700 hover:bg-blue-50 hover:text-gray-900"
                        )}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center min-w-0",
                            isCollapsed ? "justify-center w-auto" : "w-full"
                          )}
                        >
                          <IconComponent
                            className={cn(
                              "flex-shrink-0",
                              isCollapsed ? "w-6 h-6" : "w-5 h-5",
                              isCollapsed ? "" : "mr-3",
                              isActive ? "text-blue-600" : ""
                            )}
                          />
                          {!isCollapsed && (
                            <span className="truncate flex-1">{item.name}</span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Projects Section - only show when expanded */}
          {!isCollapsed && (
            <>
              <SidebarSeparator className="my-4 bg-gray-100" />

              <SidebarGroup>
                <div className="flex items-center justify-between px-2 mb-2">
                  <SidebarGroupLabel className="text-gray-600 text-sm font-semibold">
                    Expense Categories
                  </SidebarGroupLabel>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    onClick={() => setProjectsExpanded(!projectsExpanded)}
                  >
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        projectsExpanded ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </Button>
                </div>

                {projectsExpanded && (
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-0.5 ml-2">
                      {projectItems.map((project) => {
                        const isActive = pathname === project.href;

                        return (
                          <SidebarMenuItem key={project.name}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={cn(
                                "w-full h-8 rounded-md text-sm font-normal pl-6 relative",
                                isActive
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                              )}
                            >
                              <Link
                                href={project.href}
                                className="flex items-center w-full"
                              >
                                <div
                                  className={cn(
                                    "absolute left-3 w-1.5 h-1.5 rounded-full",
                                    project.active
                                      ? "bg-green-400"
                                      : "bg-gray-300"
                                  )}
                                />
                                <span className="truncate">{project.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            </>
          )}

          {/* Spacer to push bottom items down */}
          <div className="flex-1" />

          {/* Bottom Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const IconComponent = item.icon;

                  return (
                    <SidebarMenuItem key={item.name}>
                      <div className="relative">
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={isCollapsed ? item.name : undefined}
                          className={cn(
                            "transition-all duration-200 font-medium",
                            isCollapsed
                              ? "h-12 w-12 rounded-xl justify-center p-0 mx-auto hover:bg-gray-100"
                              : "w-full h-10 rounded-lg justify-start px-3",
                            isActive
                              ? isCollapsed 
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100" 
                                : "bg-blue-50 text-blue-700"
                              : isCollapsed 
                                ? "text-gray-600 hover:text-gray-900" 
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center min-w-0",
                              isCollapsed ? "justify-center w-auto" : "w-full"
                            )}
                          >
                            <IconComponent
                              className={cn(
                                "flex-shrink-0",
                                isCollapsed ? "w-6 h-6" : "w-5 h-5",
                                isCollapsed ? "" : "mr-3"
                              )}
                            />
                            {!isCollapsed && (
                              <>
                                <span className="truncate flex-1">
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 bg-blue-100 text-blue-700 text-xs"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </Link>
                        </SidebarMenuButton>
                        {isCollapsed && item.badge && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{item.badge}</span>
                          </div>
                        )}
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User Profile Footer */}
        <SidebarFooter className={cn(
          "border-t border-gray-100",
          isCollapsed ? "p-2" : "p-3"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={getDisplayName()} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">Freelancer</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {signingOut ? "Signing out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={getDisplayName()} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" side="right">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        disabled={signingOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {signingOut ? "Signing out..." : "Sign out"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Account - {getDisplayName()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
