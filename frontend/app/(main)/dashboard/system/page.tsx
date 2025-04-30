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
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: 'success' | 'failure'
  details: string
}

export default function SystemPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    fetchSystemData()
  }, [])

  const fetchSystemData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: 45,
          trend: -5.2,
          status: 'good'
        },
        {
          name: 'Memory Usage',
          value: 68,
          trend: 2.1,
          status: 'warning'
        },
        {
          name: 'Storage Usage',
          value: 82,
          trend: 8.5,
          status: 'warning'
        },
        {
          name: 'Network Load',
          value: 35,
          trend: -12.5,
          status: 'good'
        }
      ]

      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: '2024-03-15 14:30:00',
          user: 'admin@example.com',
          action: 'User Login',
          resource: 'Authentication',
          status: 'success',
          details: 'Successful login from IP 192.168.1.1'
        },
        {
          id: '2',
          timestamp: '2024-03-15 14:25:00',
          user: 'system',
          action: 'Data Backup',
          resource: 'Database',
          status: 'success',
          details: 'Daily backup completed successfully'
        },
        {
          id: '3',
          timestamp: '2024-03-15 14:20:00',
          user: 'user@example.com',
          action: 'Permission Change',
          resource: 'User Management',
          status: 'failure',
          details: 'Unauthorized attempt to modify admin permissions'
        }
      ]

      setMetrics(mockMetrics)
      setLogs(mockLogs)
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

  const getLogStatusColor = (status: AuditLog['status']) => {
    return status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
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
                    ) : (
                      <Network className="h-4 w-4" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}%</div>
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
                    {logs.map((log) => (
                      <div key={log.id} className="p-4 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-medium">{log.action}</p>
                          </div>
                          <Badge className={getLogStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">User</p>
                            <p className="text-sm text-muted-foreground">
                              {log.user}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">Resource</p>
                            <p className="text-sm text-muted-foreground">
                              {log.resource}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            {log.details}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {log.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>
                    Current system status and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'System Uptime', value: '99.9%', status: 'good' },
                      { name: 'Active Users', value: '45', status: 'good' },
                      { name: 'Security Alerts', value: '2', status: 'warning' }
                    ].map((item) => (
                      <div key={item.name} className="p-3 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{item.name}</p>
                          <Badge className={getStatusColor(item.status as SystemMetric['status'])}>
                            {item.value}
                          </Badge>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: item.name === 'System Uptime' ? '99.9%' : '100%' }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>System Events</CardTitle>
                <CardDescription>
                  Recent system events and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { event: 'System Update', time: '2 hours ago', status: 'completed' },
                    { event: 'Security Scan', time: '4 hours ago', status: 'completed' },
                    { event: 'Backup Process', time: '6 hours ago', status: 'completed' }
                  ].map((event, index) => (
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
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}