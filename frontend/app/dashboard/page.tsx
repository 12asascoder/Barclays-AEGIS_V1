'use client'

import React, { useEffect, useState } from 'react'
import { dashboardAPI, api } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  ChevronRight, 
  Briefcase, 
  FileText, 
  BrainCircuit,
  PieChart as PieChartIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#fbbf24', '#f97316', '#6366f1', '#8b5cf6']

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [riskSummary, setRiskSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('aegis_token')
        const [metricsRes, riskRes] = await Promise.all([
          dashboardAPI.metrics(),
          api.get('/risk/dashboard/risk-summary')
        ])
        setMetrics(metricsRes.data)
        if (riskRes.status === 200) {
          setRiskSummary(riskRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-outfit font-medium animate-pulse">Initializing Intelligence Core...</p>
      </div>
    )
  }

  const typologyData = riskSummary?.typology_distribution 
    ? Object.entries(riskSummary.typology_distribution).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
      }))
    : []

  const severityData = riskSummary?.severity_breakdown
    ? Object.entries(riskSummary.severity_breakdown).map(([name, value]) => ({
        name,
        count: value as number
      }))
    : []

  return (
    <ProtectedRoute>
      <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold font-outfit">
              Executive <span className="premium-gradient-text">Overview</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">
              Welcome back, <span className="text-white">{user?.username || 'Analyst'}</span>. Here is the latest risk intelligence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Live Feed
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Cases" 
            value={metrics?.sar_volume ?? 0}
            subtitle="SARs processed to date"
            icon={<Briefcase className="w-5 h-5" />}
            trend="+12% from last month"
            color="blue"
          />
          <MetricCard 
            title="Avg CQI Score" 
            value={((riskSummary?.average_cqi_score ?? 0) * 100).toFixed(1) + '%'}
            subtitle="Overall report quality"
            icon={<ShieldCheck className="w-5 h-5" />}
            trend="Stable compliance"
            color="emerald"
          />
          <MetricCard 
            title="High-Risk Alerts" 
            value={riskSummary?.high_risk_cases ?? 0}
            subtitle="Requiring immediate action"
            icon={<AlertTriangle className="w-5 h-5" />}
            trend="4 urgent flags"
            color="crimson"
            isWarning
          />
          <MetricCard 
            title="Risk Detections" 
            value={riskSummary?.total_detections ?? 0}
            subtitle="Automated typology matches"
            icon={<Activity className="w-5 h-5" />}
            trend="Across 6 patterns"
            color="gold"
          />
        </div>

        {/* Main Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Typology Chart */}
          <div className="lg:col-span-1 glass-card p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-outfit flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-400" />
                Typology Distribution
              </h3>
            </div>
            {typologyData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typologyData}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {typologyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChartState />
            )}
            <div className="grid grid-cols-2 gap-3 mt-4">
               {typologyData.map((d, i) => (
                 <div key={d.name} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                   {d.name}
                 </div>
               ))}
            </div>
          </div>

          {/* Severity & Trend */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold font-outfit flex items-center gap-2 mb-8">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Compliance Quality Trend
              </h3>
              <div className="h-[250px] w-full">
                {metrics?.risk_score_trend && metrics.risk_score_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.risk_score_trend}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        domain={[0, 1]}
                      />
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                         itemStyle={{ color: '#f8fafc' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold font-outfit mb-4">Risk Severity</h3>
                <div className="space-y-4">
                  {severityData.map((d) => {
                    const percentage = (d.count / (riskSummary?.total_detections || 1)) * 100
                    const color = d.name === 'CRITICAL' ? 'bg-red-500' : d.name === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                    return (
                      <div key={d.name}>
                        <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider text-slate-400">
                          <span>{d.name}</span>
                          <span className="text-white">{d.count} Cases</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className={cn("h-full rounded-full", color)}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

               <div className="glass-card p-6 flex flex-col justify-between overflow-hidden relative">
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold font-outfit mb-2">Pattern Intelligence</h3>
                    <p className="text-sm text-slate-400">Deep analysis of typology drift and cross-case emerging threats.</p>
                  </div>
                  <Link 
                    href="/intelligence"
                    className="glossy-button mt-4 flex items-center justify-center gap-2 group w-full"
                  >
                    Launch Intelligence Core
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <BrainCircuit className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-500/5 rotate-12" />
               </div>
            </div>
          </div>
        </div>

        {/* Quick Access Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <QuickActionCard 
              href="/cases"
              title="Review Active Cases"
              desc="Deep dive into suspicious activity alerts and customer profiles."
              icon={<Briefcase className="w-6 h-6" />}
              stats={`${metrics?.sar_volume || 0} Open`}
           />
           <QuickActionCard 
              href="/sar"
              title="Filing Management"
              desc="View, edit and run regulatory simulations on generated SARs."
              icon={<FileText className="w-6 h-6" />}
              stats="14 Processing"
           />
        </div>
      </div>
    </ProtectedRoute>
  )
}

function MetricCard({ title, value, subtitle, icon, trend, color, isWarning = false }: any) {
  const colors: any = {
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    crimson: 'text-red-400 border-red-500/20 bg-red-500/5',
    gold: 'text-amber-400 border-amber-500/20 bg-amber-500/5'
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={cn("glass-card p-6 flex flex-col", isWarning && "border-red-500/30 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]")}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg border", colors[color])}>
          {icon}
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{trend}</div>
      </div>
      <h3 className="stat-label mb-1">{title}</h3>
      <div className="text-3xl font-bold font-outfit">{value}</div>
      <p className="text-[11px] text-slate-500 mt-2 font-medium">{subtitle}</p>
    </motion.div>
  )
}

function QuickActionCard({ href, title, desc, icon, stats }: any) {
  return (
    <Link href={href}>
      <div className="glass-card p-6 flex items-center gap-6 group">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-xl">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold font-outfit group-hover:text-blue-400 transition-colors">{title}</h3>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">{stats}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  )
}

function EmptyChartState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
      <Activity className="w-10 h-10 opacity-20" />
      <span className="text-xs font-semibold uppercase tracking-widest opacity-40">Intelligence Stream Offline</span>
    </div>
  )
}
