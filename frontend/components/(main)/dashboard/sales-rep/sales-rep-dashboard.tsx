import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ClipboardList, BarChart3, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SalesRepStats, Lead, Task } from '@/lib/api-types'

export function SalesRepDashboard() {
  const [stats, setStats] = useState<SalesRepStats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, leadsResponse, tasksResponse] = await Promise.all([
          api.get<SalesRepStats>('/api/sales-rep/stats'),
          api.get<Lead[]>('/api/sales-rep/leads'),
          api.get<Task[]>('/api/sales-rep/tasks')
        ])

        setStats(statsResponse)
        setLeads(Array.isArray(leadsResponse) ? leadsResponse : [])
        setTasks(Array.isArray(tasksResponse) ? tasksResponse : [])
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Active Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeLeads || 0}</div>
            <p className="text-sm text-[var(--text-tertiary)]">+5 from last week</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="w-6 h-6 text-[var(--primary)]" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.tasks || 0}</div>
            <p className="text-sm text-[var(--text-tertiary)]">3 due today</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.conversionRate || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">+2% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No recent leads
                  </p>
                </div>
              ) : (
                leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {lead.name}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'qualified' || lead.status === 'proposal'
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : lead.status === 'contacted'
                              ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                              : 'bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)]'
                          }`}
                        >
                          {lead.status === 'qualified' || lead.status === 'proposal' ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : lead.status === 'contacted' ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 mr-1" />
                          )}
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[var(--text-tertiary)]">
                          {lead.company}
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Value: ${lead.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      Last contact: {new Date(lead.lastContact).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/sales-rep/leads">
                <Button variant="outline" size="sm" className="w-full">
                  View All Leads
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="w-6 h-6 text-[var(--primary)]" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No upcoming tasks
                  </p>
                </div>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {task.title}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high'
                              ? 'bg-[var(--error)]/10 text-[var(--error)]'
                              : task.priority === 'medium'
                              ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                              : 'bg-[var(--success)]/10 text-[var(--success)]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[var(--text-tertiary)]">
                          Type: {task.type}
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Status: {task.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/sales-rep/tasks">
                <Button variant="outline" size="sm" className="w-full">
                  View All Tasks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}