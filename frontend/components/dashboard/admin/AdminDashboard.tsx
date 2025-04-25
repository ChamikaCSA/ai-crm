import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, Settings, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AdminStats, SystemLog, UserActivity } from '@/lib/api-types'

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, logsResponse, activitiesResponse] = await Promise.all([
          api.get<AdminStats>('/api/admin/stats'),
          api.get<SystemLog[]>('/api/admin/system-logs'),
          api.get<UserActivity[]>('/api/admin/user-activities')
        ])

        setStats(statsResponse)
        setSystemLogs(Array.isArray(logsResponse) ? logsResponse : [])
        setUserActivities(Array.isArray(activitiesResponse) ? activitiesResponse : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats?.totalUsers || 0).toLocaleString()}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Active users</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="w-6 h-6 text-[var(--primary)]" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.systemHealth || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Uptime this month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="w-6 h-6 text-[var(--primary)]" />
              Configurations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeConfigurations || 0}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Active settings</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
              System Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.systemLoad || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Current utilization</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No recent user activity
                  </p>
                </div>
              ) : (
                userActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {activity.action}
                      </p>
                      <p className="text-[var(--text-tertiary)]">
                        {activity.details}
                      </p>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/admin/activity">
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
              System Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No recent system logs
                  </p>
                </div>
              ) : (
                systemLogs.slice(0, 5).map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {log.type}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.severity === 'error'
                              ? 'bg-[var(--error)]/10 text-[var(--error)]'
                              : log.severity === 'warning'
                              ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                              : 'bg-[var(--success)]/10 text-[var(--success)]'
                          }`}
                        >
                          {log.severity === 'error' ? (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          ) : log.severity === 'warning' ? (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {log.severity}
                        </span>
                      </div>
                      <p className="text-[var(--text-tertiary)]">
                        {log.message}
                      </p>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/admin/logs">
                <Button variant="outline" size="sm" className="w-full">
                  View All Logs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}