'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { authAPI } from '@/lib/api'

interface User {
  id: number
  username: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored token on mount
    if (globalThis.window !== undefined) {
      const storedToken = localStorage.getItem('aegis_token')
      const storedUser = localStorage.getItem('aegis_user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    }
  }, [])

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password)
    const { access_token } = response.data
    
    // Decode token to get user info (simple JWT decode - in prod use a library)
    const payload = JSON.parse(atob(access_token.split('.')[1]))
    const userData = {
      id: payload.user_id,
      username: payload.username,
      email: payload.email || '',
      role: payload.role,
    }
    
    setToken(access_token)
    setUser(userData)
    
    if (globalThis.window !== undefined) {
      localStorage.setItem('aegis_token', access_token)
      localStorage.setItem('aegis_user', JSON.stringify(userData))
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    if (globalThis.window !== undefined) {
      localStorage.removeItem('aegis_token')
      localStorage.removeItem('aegis_user')
    }
  }

  const contextValue = useMemo(
    () => ({ user, token, login, logout, isAuthenticated: !!token }),
    [user, token]
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
