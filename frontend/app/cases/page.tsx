'use client'
import React, { useEffect, useState } from 'react'
import { casesAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([])
  
  useEffect(() => {
    casesAPI.list().then((r) => setCases(r.data)).catch(() => {})
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cases</h1>
        <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="space-y-3">
        {cases.map((c) => (
          <div key={c.id} className="p-4 bg-white dark:bg-slate-800 rounded shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{c.case_ref} — {c.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.description}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                    Status: {c.status}
                  </span>
                  {c.customer_id && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded">
                      Customer ID: {c.customer_id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {cases.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No cases found. Create a new case to get started.
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
