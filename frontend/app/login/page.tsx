'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-dark-900 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 px-6"
      >
        <div className="glass-card p-10 border-white/10 shadow-[0_0_80px_-20px_rgba(59,130,246,0.3)]">
          <div className="text-center mb-10">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_0_30px_-5px_#3b82f6] mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold font-outfit tracking-tighter">
              AEGIS <span className="premium-gradient-text">Core</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Secure Operational Intelligence</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="stat-label flex items-center gap-2">
                <UserIcon className="w-3 h-3" />
                Access Identity
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-blue-500/50 outline-none transition-all group-hover:border-white/20"
                  placeholder="Username / ID"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="stat-label flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Security Key
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-blue-500/50 outline-none transition-all group-hover:border-white/20"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glossy-button w-full flex items-center justify-center gap-3 h-12"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="tracking-widest uppercase text-xs font-black">Authorize Access</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-tight leading-relaxed">{error}</p>
            </motion.div>
          )}

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Access Mode</div>
             <div className="flex gap-2 justify-center">
                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-400 border border-white/10 uppercase tracking-tighter">Admin Ledger</div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-400 border border-white/10 uppercase tracking-tighter">Analyst Grid</div>
             </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          &copy; Barclays AEGIS Protocol • 2024
        </p>
      </motion.div>
    </div>
  )
}
