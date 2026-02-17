'use client'
import React, { useEffect, useState } from 'react'
import { auditAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  
  useEffect(() => {
    auditAPI.list().then(r => setLogs(r.data)).catch(() => {})
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                <td className="px-4 py-3 text-sm">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{l.user_id || 'System'}</td>
                <td className="px-4 py-3 text-sm font-mono">{l.action}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {l.entity_type ? `${l.entity_type}#${l.entity_id}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No audit logs found.
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
