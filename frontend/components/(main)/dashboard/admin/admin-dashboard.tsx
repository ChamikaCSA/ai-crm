import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, Settings, Activity, AlertCircle, CheckCircle2, Server, Database, Network, Cpu, HardDrive } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

interface DashboardData {
  userMetrics: Array<{
    name: string
    value: number
    trend: number
    change: number
  }>
  systemMetrics: Array<{
    name: string
    value: number
    trend: number
    status: 'excellent' | 'good' | 'warning' | 'critical'
  }>
  securityMetrics: Array<{
    name: string
    value: number
    trend: number
    status: 'excellent' | 'good' | 'warning' | 'critical'
  }>
  recentLogs: Array<{
    _id: string
    userId: string
    userEmail: string
    action: string
    entityType: string
    entityId: string
    ipAddress: string
    userAgent: string
    oldValue?: Record<string, any>
    newValue?: Record<string, any>
    createdAt: string
    updatedAt: string
  }>
  recentEvents: Array<any>
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get<DashboardData>('/api/admin/dashboard/overview')
        setData(response)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-6 h-6 bg-[var(--text-tertiary)]/20 rounded animate-pulse" />
                  <div className="h-6 w-32 bg-[var(--text-tertiary)]/20 rounded animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-[var(--text-tertiary)]/20 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-800'
      case 'good':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMetricIcon = (name: string) => {
    if (name.includes('CPU')) return <Cpu className="w-6 h-6 text-[var(--primary)]" />
    if (name.includes('Memory')) return <Database className="w-6 h-6 text-[var(--primary)]" />
    if (name.includes('Storage')) return <HardDrive className="w-6 h-6 text-[var(--primary)]" />
    if (name.includes('Network')) return <Network className="w-6 h-6 text-[var(--primary)]" />
    if (name.includes('Security')) return <Shield className="w-6 h-6 text-[var(--primary)]" />
    if (name.includes('Users')) return <Users className="w-6 h-6 text-[var(--primary)]" />
    return <Activity className="w-6 h-6 text-[var(--primary)]" />
  }

  const formatLogDetails = (log: DashboardData['recentLogs'][0]) => {
    if (log.action === 'LOGIN') {
      return `User logged in from ${log.ipAddress}`
    }
    if (log.action === 'update' && log.oldValue && log.newValue) {
      const changes = Object.entries(log.newValue)
        .filter(([key, value]) => log.oldValue?.[key] !== value)
        .map(([key, value]) => `${key}: ${log.oldValue?.[key]} → ${value}`)
        .join(', ')
      return `Updated user: ${changes}`
    }
    return log.action
  }

  return (
    <div className="space-y-8">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {(data.systemMetrics || []).map((metric) => (
          <Card key={metric.name} className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {getMetricIcon(metric.name)}
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}{metric.name === 'System Uptime' ? '%' : ''}</div>
              <div className="flex items-center justify-between mt-2">
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
                <span className={`text-sm ${metric.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.trend > 0 ? '+' : ''}{metric.trend}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User and Security Metrics */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.userMetrics || []).map((metric) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">{metric.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium min-w-[60px] text-right">{metric.value}</span>
                    <span className={`text-sm min-w-[70px] text-right ${metric.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.trend > 0 ? '+' : ''}{metric.trend}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
              Recent System Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentEvents.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-tertiary)]">
                  No recent system events
                </div>
              ) : (
                data.recentEvents.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {event.type}
                        </p>
                        <Badge className={getStatusColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-[var(--text-tertiary)] mt-1">
                        {event.message}
                      </p>
                      <time className="text-xs text-[var(--text-tertiary)] mt-2 block">
                        {new Date(event.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
              Recent Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.recentLogs || []).map((log) => (
                <div
                  key={log._id}
                  className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">
                      {log.action}
                    </p>
                    <p className="text-[var(--text-tertiary)] mt-1">
                      {formatLogDetails(log)}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {log.userEmail}
                      </span>
                      <time className="text-xs text-[var(--text-tertiary)]">
                        {new Date(log.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}