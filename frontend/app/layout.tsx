import '@/styles/globals.css'
import React from 'react'
import { AuthProvider } from '@/lib/AuthContext'
import ClientLayout from '@/components/ClientLayout'

export const metadata = {
  title: 'AEGIS | Enterprise ML Compliance',
  description: 'Adaptive Enterprise Governance & Intelligence System',
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark-900 text-slate-100 font-sans selection:bg-blue-500/30">
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
