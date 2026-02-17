'use client'
import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">AEGIS Login</h1>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6">
          Adaptive Enterprise Governance & Intelligence System
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username-input" className="block text-sm font-medium mb-2">Username or Email</label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password-input" className="block text-sm font-medium mb-2">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Demo credentials: admin/admin123 or analyst1/analyst123
        </p>
      </div>
    </div>
  )
}
