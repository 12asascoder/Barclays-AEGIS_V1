'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, BrainCircuit, ShieldCheck, Zap } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Optional: Auto redirect if you want to skip landing
    // router.push('/login')
  }, [])

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center relative z-10"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
           <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
           <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Next-Gen Compliance Core</span>
        </div>

        <h1 className="text-7xl md:text-8xl font-black font-outfit tracking-tighter mb-6">
          <span className="premium-gradient-text">AEGIS</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          The <span className="text-white">Adaptive Enterprise Governance & Intelligence System</span> for advanced AML risk analysis and regulatory simulation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 px-4">
           <FeatureBrief 
              icon={<BrainCircuit className="w-5 h-5" />}
              title="AI Risk Core"
              desc="ML-driven typology detection"
           />
           <FeatureBrief 
              icon={<ShieldCheck className="w-5 h-5" />}
              title="CQI Indexing"
              desc="Deep report quality metrics"
           />
           <FeatureBrief 
              icon={<Shield className="w-5 h-5" />}
              title="Simulated Defense"
              desc="Regulatory gap intelligence"
           />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
           <button 
             onClick={() => router.push('/login')}
             className="glossy-button px-12 h-14 text-sm font-black uppercase tracking-[0.2em]"
           >
             Initialize System
           </button>
           <button className="px-12 h-14 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
             Documentation
           </button>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
         <div className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.5em]">Classified Interface • Restricted Access</div>
      </div>
    </div>
  )
}

function FeatureBrief({ icon, title, desc }: any) {
  return (
    <div className="glass-card p-6 border-white/5 hover:border-white/10 transition-all flex flex-col items-center text-center">
       <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 border border-blue-500/10">
          {icon}
       </div>
       <h3 className="font-bold text-lg mb-1">{title}</h3>
       <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">{desc}</p>
    </div>
  )
}
