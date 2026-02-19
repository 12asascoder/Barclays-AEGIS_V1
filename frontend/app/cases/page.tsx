'use client'

import React, { useEffect, useState } from 'react'
import { casesAPI, sarAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  FilePlus, 
  Loader2, 
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingSar, setGeneratingSar] = useState<number | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    casesAPI.list()
      .then((r) => setCases(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleGenerateSar = async (caseId: number) => {
    setGeneratingSar(caseId)
    try {
      const res = await sarAPI.generate(caseId)
      const newSar = res.data
      router.push(`/sar/${newSar.id}`)
    } catch (error) {
           console.error('Failed to generate SAR:', error)
           alert('Failed to generate SAR. Please try again.')
    } finally {
      setGeneratingSar(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-outfit">
              Active <span className="premium-gradient-text">Cases</span>
            </h1>
            <p className="text-slate-400 mt-1">Review and manage suspicious activity investigation cases.</p>
          </div>
          <button className="glossy-button flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Investigation
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter by reference, title, or customer..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:border-blue-500/50 outline-none transition-all"
            />
          </div>
          <button className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Case List */}
        <div className="space-y-4">
          {loading ? (
             <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
             </div>
          ) : (
            <AnimatePresence>
              {cases.map((c, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={c.id} 
                  className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-white/[0.03]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest leading-none">
                         {c.case_ref}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                    <h3 className="text-xl font-bold font-outfit mb-1">{c.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{c.description}</p>
                  </div>

                  <div className="flex items-center gap-12 text-slate-400 text-xs">
                    <div className="flex flex-col">
                      <span className="stat-label">Customer ID</span>
                      <span className="text-white font-medium mt-0.5">{c.customer_id || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="stat-label">Assignee</span>
                      <img src={`https://ui-avatars.com/api/?name=Analyst+${c.assigned_to || 1}&background=random&color=fff`} className="w-6 h-6 rounded-full mt-1 border border-white/10" alt="Avatar" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleGenerateSar(c.id)}
                      disabled={generatingSar !== null}
                      className={cn(
                        "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50",
                        "bg-white/5 border border-white/10 text-white hover:bg-blue-600 hover:border-blue-500"
                      )}
                    >
                      {generatingSar === c.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FilePlus className="w-4 h-4" />
                      )}
                      GENERATE SAR
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && cases.length === 0 && (
            <div className="glass-card p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold font-outfit">No active cases found</h3>
              <p className="text-slate-500">Your investigation queue is currently empty.</p>
              <button className="glossy-button mx-auto">Create Case</button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase()
  if (normalizedStatus === 'assigned' || normalizedStatus === 'open') {
     return <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/5 px-2 py-0.5 rounded border border-blue-400/20"><Clock className="w-3 h-3" /> {status}</span>
  }
  if (normalizedStatus === 'closed' || normalizedStatus === 'completed') {
     return <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/20"><CheckCircle2 className="w-3 h-3" /> {status}</span>
  }
  return <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-400/5 px-2 py-0.5 rounded border border-slate-400/20"><AlertCircle className="w-3 h-3" /> {status}</span>
}
