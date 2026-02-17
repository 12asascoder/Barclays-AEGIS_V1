'use client'
import React, { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'

export default function IntelligencePage() {
  const [intelligence, setIntelligence] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchIntelligence()
  }, [])

  const fetchIntelligence = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/risk/intelligence/cross-case', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch intelligence report')
      }
      const data = await response.json()
      setIntelligence(data.intelligence)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Generating intelligence report...</div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Intelligence Report
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">
              This feature requires admin or auditor role.
            </p>
          </div>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Cross-Case Intelligence Report
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Emerging threats, typology drift, and network analysis
                </p>
              </div>
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Cases Analyzed
              </h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {intelligence?.total_cases_analyzed ?? 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Drift Alerts
              </h3>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {intelligence?.drift_alerts?.length ?? 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Emerging Threats
              </h3>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {intelligence?.emerging_typologies?.length ?? 0}
              </div>
            </div>
          </div>

          {/* Executive Recommendations */}
          {intelligence?.recommendations && intelligence.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🎯 Executive Recommendations
              </h2>
              <div className="space-y-4">
                {intelligence.recommendations.map((rec: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`border-l-4 p-4 rounded ${
                      rec.priority === 'CRITICAL' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      rec.priority === 'HIGH' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                      'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            rec.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                            rec.priority === 'HIGH' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {rec.priority}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">
                          Finding: {rec.finding}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Action: {rec.action}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Impact: {rec.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drift Alerts */}
          {intelligence?.drift_alerts && intelligence.drift_alerts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Typology Drift Alerts
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Typology
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Trend
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Change
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Severity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Recommendation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {intelligence.drift_alerts.map((alert: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {alert.typology}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            alert.trend === 'INCREASING' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {alert.trend === 'INCREASING' ? '↑' : '↓'} {alert.trend}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold">
                          {alert.change_percentage}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {alert.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Emerging Typologies */}
          {intelligence?.emerging_typologies && intelligence.emerging_typologies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🚨 Emerging Threats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligence.emerging_typologies.map((threat: any, idx: number) => (
                  <div 
                    key={idx}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {threat.pattern_keyword.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        threat.risk_level === 'HIGH' ? 'bg-red-600 text-white' :
                        'bg-orange-600 text-white'
                      }`}>
                        {threat.risk_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Frequency: <span className="font-semibold">{threat.frequency}</span> recent SARs
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {threat.description}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      → {threat.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pattern Clusters */}
          {intelligence?.pattern_clusters && intelligence.pattern_clusters.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🔍 Pattern Clusters
              </h2>
              <div className="space-y-4">
                {intelligence.pattern_clusters.map((cluster: any, idx: number) => (
                  <div 
                    key={idx}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Cluster {cluster.cluster_id + 1}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {cluster.size} SARs
                      </span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {cluster.pattern_type}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Common Keywords:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {cluster.common_keywords.map((keyword: string, kidx: number) => (
                          <span 
                            key={kidx}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Network Risks */}
          {intelligence?.network_risks && intelligence.network_risks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🕸️ Network Risks (Repeat Offenders)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Case Count
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Risk Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Recommendation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {intelligence.network_risks.map((risk: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {risk.customer_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {risk.customer_id}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold">
                          {risk.case_count}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${risk.risk_score * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {(risk.risk_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {risk.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Temporal Trends */}
          {intelligence?.temporal_trends && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📈 Temporal Trends
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Trend Direction
                  </h4>
                  <div className={`text-2xl font-bold ${
                    intelligence.temporal_trends.trend_direction === 'INCREASING' ? 'text-red-600' :
                    intelligence.temporal_trends.trend_direction === 'DECREASING' ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {intelligence.temporal_trends.trend_direction}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Volume Change
                  </h4>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {intelligence.temporal_trends.volume_change_pct}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Recent Monthly Avg
                  </h4>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {intelligence.temporal_trends.recent_monthly_avg}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
