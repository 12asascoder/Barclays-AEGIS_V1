'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function ClientLayout({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Routes that shouldn't have the standard dashboard frame
  const isPublicRoute = pathname === '/' || pathname === '/login'

  if (isPublicRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-dark-900 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 pl-72 transition-all duration-300">
        <Navbar />
        <div className="pt-20 p-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
