'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/dashboard' },
  { name: 'Case Review', icon: '💼', path: '/cases' },
  { name: 'SAR Management', icon: '📄', path: '/sar' },
  { name: 'Intelligence', icon: '🧠', path: '/intelligence' },
  { name: 'Audit Trail', icon: '🛡️', path: '/audit' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-dark-900 border-r border-white/5 z-40 px-6 py-8 flex flex-col">
      <div className="mb-12">
        <h1 className="text-3xl font-bold font-outfit tracking-tighter flex items-center gap-2">
          <span className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center text-xl">A</span>
          <span className="premium-gradient-text">AEGIS</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mt-2 ml-12">Compliance Intel</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path)
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={isActive ? 'nav-link-active' : 'nav-link'}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg">👑</div>
          <div>
            <p className="text-sm font-semibold">Administrator</p>
            <p className="text-[10px] text-slate-400">Security Clearance: L5</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
