'use client'

import React, { useEffect, useState } from 'react'
import { sarAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  ShieldAlert, 
  FileSearch,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SarPage() {
  const [sars, setSars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    sarAPI.list()
      .then(r => setSars(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-outfit">
              SAR <span className="premium-gradient-text">Repository</span>
            </h1>
            <p className="text-slate-400 mt-1">Archive of generated Suspicious Activity Reports and Regulatory filings.</p>
          </div>
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Bulk Export</button>
             <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Audit Logs</button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by SAR reference or narrative content..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:border-blue-500/50 outline-none transition-all"
            />
          </div>
          <button className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* SAR List */}
        <div className="space-y-4">
          {loading ? (
             <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             </div>
          ) : (
            <AnimatePresence>
              {sars.map((s, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={s.id} 
                  className="glass-card group hover:border-blue-500/30 overflow-hidden"
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                       <FileText className="w-7 h-7" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest leading-none">
                           {s.sar_ref}
                        </span>
                        {s.approved ? (
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/20"><CheckCircle2 className="w-3 h-3" /> Approved</span>
                        ) : (
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/20"><ShieldAlert className="w-3 h-3" /> Pending Review</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold font-outfit mb-2 group-hover:text-blue-400 transition-colors">Narrative Stream Active</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                         "{s.narrative?.substring(0, 250)}..."
                      </p>
                    </div>

                    <div className="flex items-center gap-8 text-slate-400 text-xs px-6 border-x border-white/5">
                      <div className="flex flex-col">
                        <span className="stat-label">Archive ID</span>
                        <span className="text-white font-medium mt-0.5">#{s.id}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="stat-label">Source Case</span>
                        <span className="text-blue-400 font-medium mt-0.5">Case {s.case_id}</span>
                      </div>
                    </div>

                    <Link 
                      href={`/sar/${s.id}`}
                      className="glossy-button flex items-center gap-2 group/btn"
                    >
                      OPEN RECORD
                      <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && sars.length === 0 && (
            <div className="glass-card p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <FileSearch className="w-10 h-10 text-slate-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-outfit">No SARs generated yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">System is awaiting the first generation from an active investigation.</p>
              </div>
              <Link href="/cases" className="glossy-button inline-flex mx-auto">Visit Investigations</Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
