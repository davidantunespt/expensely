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
  CreditCard,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  const { state } = useSidebar();
  const [profile, setProfile] = useState<{
    first_name: string | null;
    last_name: string | null;
  } | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const isCollapsed = state === "collapsed";

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

  // Get user email
  const getUserEmail = () => {
    return user?.email || "accounts@receipttracker.com";
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="bg-white border-r border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Header Section with Logo and User Info */}
        <SidebarHeader className="p-6 border-b border-gray-100">
          {!isCollapsed ? (
            <div className="space-y-4">
              {/* Company Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">RT</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                    Receipt Tracker
                  </h1>
                  <p className="text-sm text-gray-500 truncate">
                    {getUserEmail()}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                                         <DropdownMenuItem onClick={onOpenOrgManagement}>
                       <Settings className="mr-2 h-4 w-4" />
                       Organization Settings
                     </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
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

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="inline-flex items-center rounded border border-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-500">
                    ⌘F
                  </kbd>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RT</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </SidebarHeader>

        {/* Main Content */}
        <SidebarContent className="px-3 py-4 overflow-y-auto overflow-x-hidden">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
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
                          "w-full h-10 rounded-lg transition-all duration-200 font-medium",
                          isCollapsed
                            ? "justify-center"
                            : "justify-start px-3",
                          isActive
                            ? isCollapsed ? "text-blue-700" : "bg-blue-50 text-blue-700 border border-blue-100"
                            : isCollapsed ? "text-gray-700 hover:bg-blue-50 hover:text-gray-900" : "text-gray-700 hover:bg-blue-50 hover:text-gray-900"
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
                              "w-5 h-5 flex-shrink-0",
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

          {/* Projects Section - inspired by the image */}
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
              <SidebarMenu className="space-y-1">
                {bottomNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const IconComponent = item.icon;

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={isCollapsed ? item.name : undefined}
                        className={cn(
                          "w-full h-10 rounded-lg transition-all duration-200 font-medium",
                          isCollapsed
                            ? "justify-center px-2"
                            : "justify-start px-3",
                          isActive
                            ? "bg-blue-50 text-blue-700"
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
                              "w-5 h-5 flex-shrink-0",
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
                          {isCollapsed && item.badge && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User Profile Footer */}
        <SidebarFooter className="p-3 border-t border-gray-100">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="" alt={getDisplayName()} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-medium">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Account</p>
                    </TooltipContent>
                  </Tooltip>
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
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
