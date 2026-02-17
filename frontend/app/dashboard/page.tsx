'use client'
import React, { useEffect, useState } from 'react'
import { dashboardAPI } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [riskSummary, setRiskSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, riskRes] = await Promise.all([
          dashboardAPI.metrics(),
          fetch('http://localhost:8000/api/risk/dashboard/risk-summary', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ])
        setMetrics(metricsRes.data)
        if (riskRes.ok) {
          setRiskSummary(await riskRes.json())
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
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Loading dashboard...</div>
        </div>
      </ProtectedRoute>
    )
  }

  // Prepare typology distribution data
  const typologyData = riskSummary?.typology_distribution 
    ? Object.entries(riskSummary.typology_distribution).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').toUpperCase(),
        value
      }))
    : []

  // Prepare severity breakdown data
  const severityData = riskSummary?.severity_breakdown
    ? Object.entries(riskSummary.severity_breakdown).map(([name, value]) => ({
        name,
        count: value
      }))
    : []

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Executive Intelligence Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Real-time risk analytics and compliance metrics
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/intelligence" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Cross-Case Intelligence
                </Link>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user?.username}
                </span>
                <button 
                  onClick={logout} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              title="Total Cases" 
              value={metrics?.sar_volume ?? 0}
              subtitle="SARs Generated"
              color="blue"
            />
            <MetricCard 
              title="Average CQI Score" 
              value={(riskSummary?.average_cqi_score ?? 0).toFixed(2)}
              subtitle="Compliance Quality Index"
              color="green"
            />
            <MetricCard 
              title="High-Risk Cases" 
              value={riskSummary?.high_risk_cases ?? 0}
              subtitle="Critical + High Severity"
              color="red"
            />
            <MetricCard 
              title="Total Detections" 
              value={riskSummary?.total_detections ?? 0}
              subtitle="Typology Patterns Found"
              color="purple"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Typology Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Typology Distribution
              </h3>
              {typologyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typologyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typologyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No typology data available
                </div>
              )}
            </div>

            {/* Severity Breakdown Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Risk Severity Breakdown
              </h3>
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={severityData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'CRITICAL' ? '#ef4444' :
                          entry.name === 'HIGH' ? '#f97316' :
                          entry.name === 'MEDIUM' ? '#eab308' : '#22c55e'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No severity data available
                </div>
              )}
            </div>
          </div>

          {/* CQI Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              CQI Score Trend
            </h3>
            {metrics?.risk_score_trend && metrics.risk_score_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.risk_score_trend}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No trend data available
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/cases" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  View Cases
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse all suspicious activity cases
                </p>
              </div>
            </Link>
            <Link href="/sar" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  View SARs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review generated SAR reports
                </p>
              </div>
            </Link>
            <Link href="/intelligence" className="block">
              <div className="bg-blue-600 hover:bg-blue-700 rounded-lg shadow p-6 transition cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Intelligence Report
                </h3>
                <p className="text-sm text-blue-100">
                  Cross-case analysis & drift detection
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function MetricCard({ title, value, subtitle, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  }

  return (
    <div className={`rounded-lg shadow p-6 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium mb-2 opacity-80">{title}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-xs opacity-70">{subtitle}</p>
    </div>
  )
}
