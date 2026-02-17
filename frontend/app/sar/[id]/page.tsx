'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'

export default function SARDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sarId = params.id
  
  const [sar, setSar] = useState<any>(null)
  const [simulation, setSimulation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    fetchSARDetails()
  }, [sarId])

  const fetchSARDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/sar/${sarId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        setSar(await response.json())
      }
    } catch (error) {
      console.error('Failed to fetch SAR:', error)
    } finally {
      setLoading(false)
    }
  }

  const runSimulation = async () => {
    setSimulating(true)
    try {
      const response = await fetch(`http://localhost:8000/api/risk/sar/${sarId}/simulate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSimulation(data.simulation)
      }
    } catch (error) {
      console.error('Simulation failed:', error)
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Loading SAR...</div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!sar) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">SAR Not Found</h1>
            <Link href="/sar" className="text-blue-600 hover:underline">
              ← Back to SARs
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 dark:text-green-400'
    if (grade.startsWith('B')) return 'text-blue-600 dark:text-blue-400'
    if (grade.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400'
    if (grade.startsWith('D')) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getReadinessColor = (status: string) => {
    if (status === 'READY_TO_FILE') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    if (status === 'MINOR_REVISIONS_NEEDED') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    if (status === 'SIGNIFICANT_REVISIONS_REQUIRED') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
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
                  SAR Detail: {sar.sar_ref}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  View narrative, CQI score, and regulatory simulation
                </p>
              </div>
              <div className="flex gap-4">
                {!simulation && (
                  <button
                    onClick={runSimulation}
                    disabled={simulating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {simulating ? 'Simulating...' : '🎓 Run Regulatory Simulation'}
                  </button>
                )}
                <Link 
                  href="/sar" 
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  ← Back
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* SAR Narrative */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  SAR Narrative
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {sar.narrative || 'No narrative available'}
                  </div>
                </div>
              </div>

              {/* Regulatory Simulation Results */}
              {simulation && (
                <>
                  {/* Defensibility Score Card */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">
                      Regulatory Defensibility Analysis
                    </h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-90 mb-1">Overall Score</div>
                        <div className="text-5xl font-bold">
                          {(simulation.overall_defensibility_score * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-90 mb-1">Grade</div>
                        <div className={`text-5xl font-bold ${getGradeColor(simulation.grade)}`}>
                          {simulation.grade}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getReadinessColor(simulation.regulatory_readiness)}`}>
                        {simulation.regulatory_readiness.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Requirement Scores */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Requirement Scores
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(simulation.requirement_scores).map(([req, score]: [string, any]) => (
                        <div key={req}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                              {req.replace(/_/g, ' ')}
                            </span>
                            <span className="text-gray-900 dark:text-white font-semibold">
                              {(score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                score >= 0.8 ? 'bg-green-500' :
                                score >= 0.6 ? 'bg-blue-500' :
                                score >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gaps */}
                  {simulation.gaps && simulation.gaps.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        🚨 Identified Gaps
                      </h3>
                      <div className="space-y-3">
                        {simulation.gaps.map((gap: any, idx: number) => (
                          <div 
                            key={idx}
                            className={`border-l-4 p-4 rounded ${
                              gap.severity === 'CRITICAL' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                              gap.severity === 'HIGH' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                              'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                                {gap.requirement.replace(/_/g, ' ')}
                              </span>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                gap.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                gap.severity === 'HIGH' ? 'bg-orange-600 text-white' :
                                'bg-yellow-600 text-white'
                              }`}>
                                {gap.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {gap.improvement_needed}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {simulation.recommendations && simulation.recommendations.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        💡 Improvement Recommendations
                      </h3>
                      <div className="space-y-3">
                        {simulation.recommendations.map((rec: any, idx: number) => (
                          <div 
                            key={idx}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                rec.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                                rec.priority === 'HIGH' ? 'bg-orange-600 text-white' :
                                'bg-blue-600 text-white'
                              }`}>
                                {rec.priority}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                                  {rec.action}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  Expected Impact: {rec.expected_impact}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CQI Score */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Compliance Quality Index
                </h3>
                {sar.cqi_score ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Score</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {(sar.cqi_score.overall_score * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <ScoreBar label="Evidence" score={sar.cqi_score.evidence_coverage} />
                      <ScoreBar label="Completeness" score={sar.cqi_score.completeness} />
                      <ScoreBar label="Confidence" score={sar.cqi_score.confidence} />
                      <ScoreBar label="Traceability" score={sar.cqi_score.traceability} />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No CQI score available</div>
                )}
              </div>

              {/* Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Status</div>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      sar.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      sar.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {sar.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(sar.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  {!simulation && (
                    <button
                      onClick={runSimulation}
                      disabled={simulating}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                    >
                      {simulating ? 'Simulating...' : 'Run Simulation'}
                    </button>
                  )}
                  <Link 
                    href={`/cases/${sar.case_id}`}
                    className="block w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition text-center"
                  >
                    View Case
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-gray-900 dark:text-white font-medium">
          {(score * 100).toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div 
          className="bg-blue-500 h-1.5 rounded-full"
          style={{ width: `${score * 100}%` }}
        ></div>
      </div>
    </div>
  )
}
