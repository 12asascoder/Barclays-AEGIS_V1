'use client'

import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('aegis_token')
    localStorage.removeItem('aegis_user')
    router.push('/login')
  }

  return (
    <header className="fixed top-0 right-0 left-72 h-20 border-b border-white/5 bg-dark-900/50 backdrop-blur-xl z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-64 items-center gap-3 rounded-full bg-white/5 border border-white/10 px-4">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search cases, SARs, or intelligence..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">System Online</span>
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <span>🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-900"></span>
        </button>

        <button 
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
        >
          LOGOUT
        </button>
      </div>
    </header>
  )
}
