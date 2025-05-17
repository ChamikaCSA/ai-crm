'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Server,
  Shield,
  Activity,
  AlertCircle,
  Settings,
  ChevronRight,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Network,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface SystemMetric {
  name: string
  value: number
  trend: number
  status: 'good' | 'warning' | 'critical'
}

interface AuditLog {
  _id: string
  userId: string
  userEmail: string
  action: string
  entityType: string
  entityId: string
  oldValue: any
  newValue: any
  ipAddress: string
  userAgent: string
  createdAt: string
  updatedAt: string
}

interface SystemEvent {
  event: string
  time: string
  status: string
}

export default function SystemPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [events, setEvents] = useState<SystemEvent[]>([])

  useEffect(() => {
    fetchSystemData()
  }, [])

  const fetchSystemData = async () => {
    try {
      setIsLoading(true)

      // Fetch metrics
      const metricsResponse = await fetch('/api/admin/system/metrics')
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics')
      const metricsData = await metricsResponse.json()

      // Fetch audit logs
      const logsResponse = await fetch('/api/admin/system/audit-logs?limit=10')
      if (!logsResponse.ok) throw new Error('Failed to fetch audit logs')
      const logsData = await logsResponse.json()

      // Fetch system events
      const eventsResponse = await fetch('/api/admin/system/events')
      if (!eventsResponse.ok) throw new Error('Failed to fetch system events')
      const eventsData = await eventsResponse.json()

      setMetrics(Array.isArray(metricsData?.metrics) ? metricsData.metrics : [])
      setLogs(Array.isArray(logsData?.data) ? logsData.data : Array.isArray(logsData) ? logsData : [])
      setEvents(Array.isArray(eventsData?.data) ? eventsData.data : Array.isArray(eventsData) ? eventsData : [])
      setError(false)
    } catch (error) {
      console.error('Failed to fetch system data:', error)
      setError(true)
      toast.error('Failed to fetch system data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: SystemMetric['status']) => {
    const colors = {
      good: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  const getLogStatusColor = (action: string) => {
    return action === 'LOGIN' || action === 'CREATE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-[var(--card)]/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="h-32 flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-2">
              <AlertCircle className="w-8 h-8 text-[var(--warning)]" />
              <p>Failed to load system data</p>
              <Button variant="outline" size="sm" onClick={fetchSystemData} className="group">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Server className="w-6 h-6 text-[var(--primary)]" />
                System Management
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Monitor system health and audit logs
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(metrics || []).map((metric) => (
                <Card key={metric.name} className="bg-[var(--card)]/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.name}
                    </CardTitle>
                    {metric.name.includes('CPU') ? (
                      <Cpu className="h-4 w-4" />
                    ) : metric.name.includes('Memory') ? (
                      <Database className="h-4 w-4" />
                    ) : metric.name.includes('Storage') ? (
                      <HardDrive className="h-4 w-4" />
                    ) : metric.name.includes('Uptime') ? (
                      <Server className="h-4 w-4" />
                    ) : metric.name.includes('API') ? (
                      <Network className="h-4 w-4" />
                    ) : metric.name.includes('Database') ? (
                      <Database className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}{metric.name.includes('Uptime') ? '%' : ''}</div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center">
                        {metric.trend > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                        )}
                        <span className={`text-sm ml-1 ${metric.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {metric.trend > 0 ? '+' : ''}{metric.trend}%
                        </span>
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>
                    Recent system activities and security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(logs || []).map((log) => (
                      <div key={log._id} className="p-4 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-medium">{log.action}</p>
                          </div>
                          <Badge className={getLogStatusColor(log.action)}>
                            {log.action}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">User</p>
                            <p className="text-sm text-muted-foreground">
                              {log.userEmail}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">Resource</p>
                            <p className="text-sm text-muted-foreground">
                              {log.entityType}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            {log.ipAddress}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>System Events</CardTitle>
                  <CardDescription>
                    Recent system events and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(events || []).map((event, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-medium leading-none">
                              {event.event}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Status: {event.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}