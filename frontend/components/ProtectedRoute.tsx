'use client'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  readonly children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
