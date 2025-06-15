'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from './Sidebar'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
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
  
  // For authenticated routes, render with sidebar
  return (
    <>
      {/* Sidebar - Fixed position */}
      <Sidebar />
      
      {/* Main Content Area - Offset by sidebar width */}
      <div className="ml-64 min-h-screen">
        <main className="h-screen overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  )
} 