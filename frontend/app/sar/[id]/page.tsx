'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  GraduationCap, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  ChevronLeft,
  Loader2,
  Download,
  Share2,
  Trash2,
  Printer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

export default function SARDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sarId = params.id
  
  const [sar, setSar] = useState<any>(null)
  const [simulation, setSimulation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    fetchSARDetails()
  }, [sarId])

  const fetchSARDetails = async () => {
    try {
      const response = await api.get(`/sar/${sarId}`)
      if (response.status === 200) {
        setSar(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch SAR:', error)
    } finally {
      setLoading(false)
    }
  }

  const runSimulation = async () => {
    setSimulating(true)
    try {
      const response = await api.post(`/risk/sar/${sarId}/simulate`)
      if (response.status === 200) {
        setSimulation(response.data.simulation)
      }
    } catch (error) {
      console.error('Simulation failed:', error)
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-slate-400 font-medium">Retrieving Case Narrative...</p>
      </div>
    )
  }

  if (!sar) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Case Record Unreachable</h1>
            <p className="text-slate-400 mb-8">The requested SAR record could not be found in the current intelligence stream.</p>
            <Link href="/sar" className="glossy-button inline-flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Return to Catalog
            </Link>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/sar" className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
             <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 transition-all"><Printer className="w-5 h-5" /></button>
             <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 transition-all"><Download className="w-5 h-5" /></button>
             <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 transition-all"><Share2 className="w-5 h-5" /></button>
             <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 transition-all"><Trash2 className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Document Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-card overflow-hidden">
               <div className="bg-white/5 border-b border-white/10 px-8 py-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold font-outfit">SAR Narrative Record</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Ref: {sar.sar_ref}</p>
                  </div>
                  {!simulation && (
                    <button
                      onClick={runSimulation}
                      disabled={simulating}
                      className="glossy-button flex items-center gap-2"
                    >
                      {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                      {simulating ? 'RUNNING SIMULATION...' : 'VALIDATE DEFENSE'}
                    </button>
                  )}
               </div>
               
                <div className="p-12 bg-white relative shadow-2xl min-h-[1000px] border border-slate-200">
                  {/* Formal Header */}
                  <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-slate-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-900 mb-4">
                        <ShieldCheck className="w-8 h-8" />
                        <span className="text-2xl font-black tracking-tighter">BARCLAYS <span className="font-light text-slate-500">AEGIS</span></span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Financial Intelligence Unit</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">North American Compliance Operations</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-slate-900">SAR NARRATIVE REPORT</h2>
                      <p className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-widest">ID: {sar.sar_ref || 'SAR-2024-8119'}</p>
                      <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Filing Reason</p>
                        <p className="text-[10px] font-bold text-slate-900 uppercase">Suspicious Activity / Structuring</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Body */}
                  <div className="relative z-10 font-serif text-slate-900">
                    <div className="mb-8 p-4 bg-slate-50 border-l-4 border-slate-900 flex justify-between items-center">
                       <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Subject of Investigation</p>
                          <p className="text-lg font-bold">Jonathan T. Reed (Customer ID: {sar.customer_id || 'CUST-8821'})</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Date of Publication</p>
                          <p className="text-sm font-bold">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                       </div>
                    </div>

                    <div className="space-y-8 leading-relaxed text-justify text-slate-800">
                      <section>
                        <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-900">I. Executive Summary</h3>
                        <p className="text-sm">
                          This report details suspicious financial activity identified within the accounts of the Subject identified above. 
                          The <span className="font-bold text-slate-900 italic">AEGIS Intelligence Engine</span> flagged multiple anomalies between October 2023 and January 2024, 
                          characterized by rapid fund layering, cross-border transfers, and a series of structured deposits that appear to lack 
                          any verifiable economic or business purpose.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-900">II. Transactional Forensics</h3>
                        <p className="text-sm">
                          An analysis of the Subject's liquid asset movements reveals a <span className="font-bold">450% increase</span> in monthly deposit volume compared to the previous 
                          24-month rolling average. Intelligence indicates that approximately $425,000 in liquid assets were introduced into 
                          the banking system via five separate Branch Locations within a 72-hour window. These movements are consistent with 
                          the typology of <span className="italic underline decoration-slate-300 underline-offset-4">Structuring (31 CFR Chapter X)</span>, designed to circumvent CTR (Currency Transaction Report) thresholds.
                        </p>
                        <ul className="mt-4 space-y-2 list-none p-0">
                           <li className="text-[11px] font-mono bg-slate-100 p-2 rounded flex justify-between">
                              <span>FLAG: RAPID_FUND_LAYERING</span>
                              <span className="font-bold">CRITICAL SEVERITY</span>
                           </li>
                           <li className="text-[11px] font-mono bg-slate-100 p-2 rounded flex justify-between">
                              <span>FLAG: MULTI_BRANCH_EQUIVALENCY</span>
                              <span className="font-bold">DETECTED</span>
                           </li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-900">III. Counterparty & Jurisdictional Analysis</h3>
                        <p className="text-sm">
                          Subsequent to the layering phase, outgoing wire transfers totaling $380,000 were directed to offshore jurisdictions 
                          identified as high-risk by the Financial Action Task Force (FATF). Our internal intelligence database correlates 
                          the recipient entities with shell company structures previously identified in the <span className="font-bold">"Aegean Laundering Investigation."</span> 
                          Specifically, the recipient "Global Maritime Logistics Ltd" shares a beneficial owner with entities under sanctions list review.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-xs font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 text-slate-900">IV. Conclusion & Justification</h3>
                        <p className="text-sm">
                          The patterns observed meet all the necessary criteria for the formal filing of a Suspicious Activity Report. 
                          The Subject's behavior represents a significant departure from established historical patterns and indicates 
                          intentional obfuscation of the origin of funds. It is recommended that this case be referred to Law Enforcement 
                          Liaison for immediate review and that the Subject's relationship with the institution be terminated.
                        </p>
                      </section>
                    </div>

                    <div className="mt-20 pt-8 border-t border-slate-200 flex justify-between items-end">
                       <div className="space-y-4">
                          <img src="https://signature.free.com/image.png" alt="Signature Placeholder" className="w-32 h-12 grayscale opacity-30 mix-blend-multiply" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">Compliance Officer Alpha</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Senior Intelligence Analyst | AEGIS System v4.2</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="inline-block p-4 border-2 border-slate-200 rounded-lg">
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Electronic Authentication</p>
                             <div className="text-[9px] font-mono text-slate-400 break-all w-48 leading-tight">
                                SHA256: 8f92b...e3c11
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                    <div className="text-[180px] font-bold font-outfit select-none -rotate-12">CONFIDENTIAL</div>
                  </div>
                </div>

            </div>

            {/* Simulation Results (Expanded) */}
            <AnimatePresence>
              {simulation && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5">
                      <span className="stat-label mb-2 block">Defensibility Score</span>
                      <div className="text-5xl font-bold font-outfit text-blue-400">
                        {(simulation.overall_defensibility_score * 100).toFixed(0)}%
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", getReadinessBg(simulation.regulatory_readiness))}>
                          {simulation.regulatory_readiness.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                       <span className="stat-label mb-2 block">Regulatory Grade</span>
                       <div className={cn("text-6xl font-black font-outfit", getGradeColor(simulation.grade))}>
                         {simulation.grade}
                       </div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase mt-4 tracking-tighter">Based on FinCEN Benchmarks</p>
                    </div>

                    <div className="glass-card p-6">
                      <h4 className="text-xs font-bold font-outfit uppercase tracking-widest mb-6 text-slate-400">Compliance Audit</h4>
                      <div className="space-y-4">
                        {Object.entries(simulation.requirement_scores).map(([req, score]: [string, any]) => (
                          <div key={req}>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                              <span className="text-slate-400">{req.replace(/_/g, ' ')}</span>
                              <span className="text-white">{(score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${score * 100}%` }}
                                className={cn("h-full", score >= 0.8 ? 'bg-emerald-500' : 'bg-blue-500')}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="glass-card p-6">
                        <h3 className="text-lg font-bold font-outfit mb-6 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          Critical Defensibility Gaps
                        </h3>
                        <div className="space-y-4">
                          {simulation.gaps?.map((gap: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4">
                               <div className={cn("w-1 h-12 rounded-full shrink-0", gap.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500')} />
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{gap.requirement.replace(/_/g, ' ')}</span>
                                    <span className={cn("text-[8px] font-bold px-1.5 rounded leading-none py-0.5", gap.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-500 text-black')}>
                                      {gap.severity}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-300 font-medium">{gap.improvement_needed}</p>
                               </div>
                            </div>
                          ))}
                        </div>
                     </div>

                     <div className="glass-card p-6">
                        <h3 className="text-lg font-bold font-outfit mb-6 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-amber-400" />
                          Augmentation Strategies
                        </h3>
                        <div className="space-y-4">
                          {simulation.recommendations?.map((rec: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all">
                               <div className="flex items-start gap-4">
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-white mb-1">{rec.action}</p>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Impact Potential:</span>
                                       <span className="text-[10px] text-emerald-400 font-bold">{rec.expected_impact}</span>
                                    </div>
                                  </div>
                               </div>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Metadata Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card p-6 space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold font-outfit">Intelligence Context</h2>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
               </div>
               
               <div className="space-y-6">
                  <div>
                    <span className="stat-label">Report Quality index (CQI)</span>
                    <div className="flex items-end gap-3 mt-2">
                       <span className="text-4xl font-bold font-outfit premium-gradient-text">94</span>
                       <span className="text-slate-500 mb-1.5 font-bold uppercase tracking-widest text-[10px]">Holistic Score</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                       <ScoreMetric label="Evidence" value={0.92} />
                       <ScoreMetric label="Traceability" value={0.96} />
                       <ScoreMetric label="Confidence" value={0.89} />
                       <ScoreMetric label="Completeness" value={1.0} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-6">
                     <div>
                       <span className="stat-label">Regulatory Status</span>
                       <div className="mt-2">
                         <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                            REGULATORY_READY
                         </span>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Investigation Analyst</p>
                           <p className="text-sm font-semibold">FIU-ALPHA-OBSERVER</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Last Intelligence Sync</p>
                           <p className="text-sm font-semibold">{new Date().toLocaleTimeString()} Today</p>
                        </div>
                     </div>

                     <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-2 mb-2">
                           <ShieldCheck className="w-4 h-4 text-blue-400" />
                           <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Security Clearance</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                           This record is protected by Tier-4 cryptographic isolation. Unauthorized access is monitored.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <Link href={`/cases/${sar.case_id}`} className="glass-card p-6 flex items-center justify-between group hover:bg-blue-600/10">
               <div>
                  <h4 className="font-bold opacity-40 text-[10px] uppercase tracking-widest mb-1">Source Investigation</h4>
                  <p className="font-semibold text-blue-400 group-hover:text-white transition-colors">Return to Case Catalog</p>
               </div>
               <ChevronLeft className="w-5 h-5 text-slate-700 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function ScoreMetric({ label, value }: any) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
       <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
       <div className="text-lg font-bold font-outfit">{(value * 100 || 0).toFixed(0)}%</div>
    </div>
  )
}

function getGradeColor(grade: string) {
  if (grade?.startsWith('A')) return 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]'
  if (grade?.startsWith('B')) return 'text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]'
  if (grade?.startsWith('C')) return 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]'
  return 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]'
}

function getReadinessBg(status: string) {
  if (status === 'READY_TO_FILE') return 'bg-emerald-500 text-black'
  if (status === 'MINOR_REVISIONS_NEEDED') return 'bg-blue-500 text-white'
  if (status === 'SIGNIFICANT_REVISIONS_REQUIRED') return 'bg-amber-500 text-black'
  return 'bg-red-500 text-white'
}
