import '../styles/globals.css'
import React from 'react'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata = {
  title: 'AEGIS - Dashboard',
  description: 'Adaptive Enterprise Governance & Intelligence System',
}

interface RootLayoutProps {
  readonly children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="max-w-[1400px] mx-auto p-4">{children}</div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
