'use client'
import React, { useEffect, useState } from 'react'
import { sarAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'

export default function SarPage() {
  const [sars, setSars] = useState<any[]>([])
  
  useEffect(() => {
    sarAPI.list().then(r => setSars(r.data)).catch(() => {})
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SAR Reports</h1>
        <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="space-y-3">
        {sars.map(s => (
          <div key={s.id} className="p-4 bg-white dark:bg-slate-800 rounded shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{s.sar_ref}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                  {s.narrative?.slice(0, 300)}...
                </p>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${s.approved ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                    {s.approved ? 'Approved' : 'Pending'}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                    Case ID: {s.case_id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {sars.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No SARs found. Generate SARs from cases.
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
