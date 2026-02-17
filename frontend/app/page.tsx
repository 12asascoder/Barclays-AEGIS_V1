import React from 'react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex gap-6">
      <aside className="w-64">
        <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">
          <h2 className="font-bold">AEGIS</h2>
          <nav className="mt-4">
            <ul className="space-y-2">
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/cases">Cases</Link></li>
              <li><Link href="/sar">SARs</Link></li>
              <li><Link href="/audit">Audit</Link></li>
              <li><Link href="/admin">Admin</Link></li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="flex-1">
        <div className="p-6 bg-white dark:bg-slate-800 rounded shadow">Welcome to AEGIS - Adaptive Enterprise Governance & Intelligence System</div>
      </main>
    </div>
  )
}
