'use client'

import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { motion } from 'framer-motion'
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ShieldAlert, 
  Network, 
  Layers, 
  Zap,
  Target,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

export default function IntelligencePage() {
  const [intelligence, setIntelligence] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIntelligence()
  }, [])

  const fetchIntelligence = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/risk/intelligence/cross-case')
      console.log('Intelligence API Response:', response.data)
      
      if (response.data.success && response.data.intelligence) {
        setIntelligence(response.data.intelligence)
      } else {
        throw new Error('Failed to load intelligence data')
      }
    } catch (err: any) {
      console.error('Intelligence fetch error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load cross-case intelligence'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)]">
         <div className="relative">
            <div className="w-20 h-20 border-2 border-blue-500/10 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-t-2 border-blue-500 rounded-full animate-spin" />
            <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
         </div>
         <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Aggregating Data Clusters...</p>
      </div>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto py-20 text-center">
            <ShieldAlert className="w-20 h-20 text-red-500/50 mx-auto mb-6" />
            <h2 className="text-3xl font-bold font-outfit mb-4">Security <span className="text-red-500">Restriction</span></h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">{error}</p>
            <div className="flex justify-center gap-4">
               <button onClick={fetchIntelligence} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl font-bold text-xs hover:bg-white/10 transition-all">TRY AGAIN</button>
               <button onClick={() => window.history.back()} className="glossy-button">RETURN TO SECURE ZONE</button>
            </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-[1600px] mx-auto space-y-12 animate-fade-in">
        {/* Intelligence Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Strategic Intel</div>
               <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Level 5 Access</div>
            </div>
            <h1 className="text-5xl font-bold font-outfit tracking-tighter">
              Cross-Case <span className="premium-gradient-text">Intelligence</span>
            </h1>
            <p className="text-slate-400 mt-3 max-w-2xl font-medium">
              ML-driven analysis across the entire SAR catalog identifying typology drift, cluster anomalies, and emerging threats.
            </p>
          </div>
          <button onClick={fetchIntelligence} className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Re-Sync Analysis</span>
          </button>
        </div>

        {/* Intelligence Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <SummaryWidget label="Cases Analyzed" value={intelligence?.total_cases_analyzed} icon={<Layers className="w-5 h-5" />} />
           <SummaryWidget label="Detected Clusters" value={intelligence?.pattern_clusters?.length} icon={<Network className="w-5 h-5" />} color="blue" />
           <SummaryWidget label="Typology Drift Alerts" value={intelligence?.drift_alerts?.length} icon={<TrendingUp className="w-5 h-5" />} color="amber" isWarning />
           <SummaryWidget label="Emerging Typologies" value={intelligence?.emerging_typologies?.length} icon={<Zap className="w-5 h-5" />} color="red" isCritical />
        </div>

        {/* Deep Intel Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Left Column: Recommendations & Emerging */}
           <div className="lg:col-span-8 space-y-12">
              {/* Executive Action Items */}
              <section>
                 <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-blue-500" />
                    <h2 className="text-2xl font-bold font-outfit">Strategic Actions</h2>
                 </div>
                 {intelligence?.recommendations && intelligence.recommendations.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {intelligence.recommendations.map((rec: any, idx: number) => (
                      <motion.div 
                        whileHover={{ y: -5 }}
                        key={idx} 
                        className={cn("glass-card overflow-hidden p-6 relative group", 
                           rec.priority === 'CRITICAL' ? 'border-red-500/20' : 
                           rec.priority === 'HIGH' ? 'border-orange-500/20' : 'border-amber-500/20'
                        )}
                      >
                         <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                            <ShieldAlert className="w-16 h-16" />
                         </div>
                         <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                               <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter", 
                                  rec.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 
                                  rec.priority === 'HIGH' ? 'bg-orange-500 text-black' : 'bg-amber-500 text-black'
                               )}>
                                  {rec.priority}
                               </span>
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rec.category}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{rec.finding}</h3>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed italic">"{rec.action}"</p>
                            <div className="mt-auto pt-4 border-t border-white/5">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Expected Strategic Impact</span>
                               <div className="text-blue-400 font-bold text-sm tracking-tight">{rec.impact}</div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                 </div>
                 ) : (
                    <div className="glass-card p-8 text-center">
                       <p className="text-slate-400">No strategic recommendations available at this time.</p>
                    </div>
                 )}
              </section>

              {/* Emerging Threat Grid */}
              <section>
                 <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold font-outfit">Emerging Vulnerabilities</h2>
                 </div>
                 {intelligence?.emerging_typologies && intelligence.emerging_typologies.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {intelligence.emerging_typologies.map((threat: any, idx: number) => (
                       <div key={idx} className="glass-card p-6 border-red-500/10 hover:border-red-500/30 transition-all">
                          <div className="flex items-center justify-between mb-4">
                             <div className="w-12 h-12 rounded-xl bg-red-500/5 flex items-center justify-center text-red-500 border border-red-500/10">
                                <AlertCircle className="w-6 h-6" />
                             </div>
                             <div className="text-right">
                                <div className="text-[9px] font-bold text-slate-500 uppercase">Risk Index</div>
                                <div className="text-lg font-black text-red-500">{threat.risk_level}</div>
                             </div>
                          </div>
                          <h4 className="text-xl font-bold font-outfit mb-2 text-white/90 uppercase tracking-tighter tracking-tightest">
                            {threat.pattern_keyword}
                          </h4>
                          <p className="text-sm text-slate-400 leading-relaxed mb-4">{threat.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                             <span className="text-xs font-bold text-slate-500 uppercase italic">SAR Frequency: <span className="text-white">{threat.frequency} cases</span></span>
                             <button className="text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 group">
                                View Clusters
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
                 ) : (
                    <div className="glass-card p-8 text-center">
                       <p className="text-slate-400">No emerging vulnerabilities detected at this time.</p>
                    </div>
                 )}
              </section>
           </div>

           {/* Right Column: Drift Alerts & Networks */}
           <div className="lg:col-span-4 space-y-12">
              {/* Typology Drift Module */}
              <div className="glass-card overflow-hidden">
                 <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-bold font-outfit">Typology Drift</h3>
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                 </div>
                 {intelligence?.drift_alerts && intelligence.drift_alerts.length > 0 ? (
                 <div className="divide-y divide-white/5">
                    {intelligence.drift_alerts.map((alert: any, idx: number) => (
                       <div key={idx} className="p-5 hover:bg-white/[0.02] transition-colors group">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{alert.typology}</span>
                             <div className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded leading-none", 
                                alert.trend === 'INCREASING' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                             )}>
                                {alert.trend === 'INCREASING' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                {alert.change_percentage}
                             </div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium mb-3 italic">Strategy: {alert.recommendation}</div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className={cn("h-full rounded-full transition-all duration-1000", alert.trend === 'INCREASING' ? 'bg-red-500 w-[80%]' : 'bg-emerald-500 w-[60%]')} />
                          </div>
                       </div>
                    ))}
                 </div>
                 ) : (
                    <div className="text-center text-sm text-slate-400 p-6">No drift alerts detected.</div>
                 )}
              </div>

              {/* Recurring Entity Network */}
              <div className="glass-card p-6">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold font-outfit">Recurring Offenders</h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase tracking-widest">Network Risk</span>
                 </div>
                 {intelligence?.network_risks && intelligence.network_risks.length > 0 ? (
                 <div className="space-y-6">
                    {intelligence.network_risks.map((risk: any, idx: number) => (
                       <div key={idx} className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center shrink-0 border border-white/10 shadow-lg text-xs font-bold font-outfit">
                             {risk.customer_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start mb-1 overflow-hidden">
                                <h4 className="text-sm font-bold text-white truncate pr-2 uppercase tracking-tight">{risk.customer_name}</h4>
                                <span className="text-[10px] font-bold text-red-400 shrink-0">{(risk.risk_score * 100).toFixed(0)}% RISK</span>
                             </div>
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold leading-none">{risk.case_count} RECENT SAR FILINGS</p>
                             <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-400 leading-relaxed italic">
                                "{risk.recommendation}"
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 ) : (
                    <div className="text-center text-sm text-slate-400">No recurring offenders identified.</div>
                 )}
              </div>

              {/* Cluster Map Metadata */}
              <div className="glass-card p-6 relative overflow-hidden group">
                  <div className="relative z-10">
                     <h3 className="text-lg font-bold font-outfit mb-2">Pattern Clusters</h3>
                     <p className="text-xs text-slate-400 mb-6 leading-relaxed">Cross-case grouping of related typologies detected via ML clustering algorithms.</p>
                     
                     {intelligence?.pattern_clusters && intelligence.pattern_clusters.length > 0 ? (
                     <div className="space-y-3">
                        {intelligence.pattern_clusters.map((cluster: any, idx: number) => (
                           <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group-hover:bg-blue-600/5 transition-colors">
                              <span className="text-[11px] font-bold text-white uppercase tracking-tighter">Cluster #{cluster.cluster_id + 1}: {cluster.pattern_type}</span>
                              <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/20">{cluster.size} SARs</span>
                           </div>
                        ))}
                     </div>
                     ) : (
                        <div className="text-center text-sm text-slate-400">No pattern clusters detected.</div>
                     )}
                  </div>
                  <Layers className="absolute -bottom-8 -right-8 w-40 h-40 text-blue-500/[0.03] group-hover:rotate-12 transition-transform duration-700" />
              </div>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function SummaryWidget({ label, value, icon, color = 'blue', isWarning = false, isCritical = false }: any) {
  const colorMap: any = {
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    red: 'text-red-400 border-red-500/20 bg-red-500/5'
  }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn("glass-card p-6 flex items-center justify-between group cursor-default shadow-lg", 
         isWarning && "border-amber-500/20",
         isCritical && "border-red-500/20 shadow-[0_0_40px_-15px_rgba(239,68,68,0.2)]"
      )}
    >
       <div className="space-y-2">
          <p className="stat-label mb-1 opacity-60 group-hover:opacity-100 transition-opacity">{label}</p>
          <div className="text-4xl font-black font-outfit flex items-baseline gap-1">
             {value || 0}
             <span className="text-xs font-bold text-slate-700 uppercase tracking-widest px-1">Units</span>
          </div>
       </div>
       <div className={cn("p-4 rounded-2xl border transition-all duration-300 group-hover:scale-110", colorMap[color])}>
          {icon}
       </div>
    </motion.div>
  )
}
