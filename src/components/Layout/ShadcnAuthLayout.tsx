'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ShadcnSidebar } from './ShadcnSidebar'
import { Header } from './Header'
import { OrganizationManagement } from './OrganizationManagement'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

interface ShadcnAuthLayoutProps {
  children: React.ReactNode
}

export function ShadcnAuthLayout({ children }: ShadcnAuthLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [isOrgManagementOpen, setIsOrgManagementOpen] = useState(false)
  
  // Routes that should not show the sidebar
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = pathname ? publicRoutes.includes(pathname) : false
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // For public routes (login/signup), render without sidebar
  if (isPublicRoute || !user) {
    return <>{children}</>
  }
  
  // For authenticated routes, render with shadcn sidebar
  return (
    <SidebarProvider>
      <ShadcnSidebar onOpenOrgManagement={() => setIsOrgManagementOpen(true)} />
      <main className="flex flex-col flex-1 min-h-screen">
        {/* Header with sidebar trigger */}
        <Header />
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
      
      {/* Organization Management Modal - rendered at layout level for proper z-index */}
      <OrganizationManagement
        isOpen={isOrgManagementOpen}
        onClose={() => setIsOrgManagementOpen(false)}
      />
    </SidebarProvider>
  )
} 