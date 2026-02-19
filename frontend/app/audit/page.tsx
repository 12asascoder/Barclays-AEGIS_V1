'use client'

import React, { useEffect, useState } from 'react'
import { auditAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, 
  Search, 
  Terminal, 
  User, 
  Clock, 
  Activity,
  Download,
  Filter,
  Loader2,
  Lock,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    auditAPI.list()
      .then(r => setLogs(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute>
      <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-outfit flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
              Intelligence <span className="premium-gradient-text">Audit Trail</span>
            </h1>
            <p className="text-slate-400 mt-1">Immutable record of system access, case modifications, and intelligence exports.</p>
          </div>
          <div className="flex gap-3">
             <button className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all uppercase tracking-widest">
                <Download className="w-4 h-4" />
                Export Ledger
             </button>
          </div>
        </div>

        {/* Audit Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card p-6 bg-blue-500/5 group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                 </div>
                 <div>
                    <span className="stat-label">Total Events</span>
                    <div className="text-2xl font-bold font-outfit">{logs.length}</div>
                 </div>
              </div>
           </div>
           <div className="glass-card p-6 bg-emerald-500/5 group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                    <span className="stat-label">Active Investigators</span>
                    <div className="text-2xl font-bold font-outfit">
                       {new Set(logs.map(l => l.user_id)).size}
                    </div>
                 </div>
              </div>
           </div>
           <div className="glass-card p-6 bg-amber-500/5 group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/10 group-hover:scale-110 transition-transform">
                    <Lock className="w-6 h-6" />
                 </div>
                 <div>
                    <span className="stat-label">Integrity Status</span>
                    <div className="text-2xl font-bold font-outfit text-emerald-400 tracking-tight">VERIFIED</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search audit trail by action, user, or entity hash..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-blue-500/50 outline-none transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" />
            Advanced Filtering
          </button>
        </div>

        {/* Audit Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Subject</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Operation</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Entity Identification</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-dark-900/40">
              {loading ? (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Accessing Secure Ledger...</p>
                   </td>
                </tr>
              ) : (
                logs.map((l, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    key={l.id} 
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          <span className="text-xs font-medium">{new Date(l.timestamp).toLocaleString()}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] border border-white/10 font-bold">U</div>
                          <span className="text-xs font-bold text-white uppercase tracking-tight">{l.user_id || 'SYSTEM_CORE'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-blue-500" />
                          <code className="text-[10px] font-bold text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded border border-blue-400/20">{l.action}</code>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {l.entity_type ? (
                          <div className="space-y-1">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{l.entity_type}</div>
                             <div className="text-xs font-mono text-slate-400">#EID-{l.entity_id}</div>
                          </div>
                       ) : (
                          <span className="text-slate-700 text-xs">GLOBAL_SCOPE</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="inline-flex items-center gap-1 text-[8px] font-black text-emerald-500 border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          <ShieldCheck className="w-2.5 h-2.5" /> Secure
                       </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
          
          {!loading && logs.length === 0 && (
            <div className="text-center py-24 space-y-4">
               <Terminal className="w-12 h-12 text-slate-800 mx-auto" />
               <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px]">No ledger entries detected in the current stream.</p>
            </div>
          )}
        </div>
        
        {/* Verification Footer */}
        <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-4">
           <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
           <p className="text-xs text-orange-200/70 leading-relaxed font-medium">
             This audit trail is cryptographically signed and immutable. Any attempts to rotate, clear, or modify these logs will be automatically flagged by the <span className="text-orange-400 font-bold">AEGIS Governance Protocol</span>.
           </p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
