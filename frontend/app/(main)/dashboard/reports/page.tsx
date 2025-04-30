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
  FileText,
  Download,
  Filter,
  AlertCircle,
  Plus,
  ChevronRight,
  Calendar,
  Users,
  DollarSign,
  BarChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface Report {
  id: string
  title: string
  type: 'sales' | 'marketing' | 'customer' | 'financial'
  status: 'scheduled' | 'generated' | 'failed'
  lastGenerated: string
  nextSchedule: string
  metrics: {
    name: string
    value: number
    trend: number
  }[]
}

interface ReportMetric {
  name: string
  value: number
  trend: number
  change: number
}

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [metrics, setMetrics] = useState<ReportMetric[]>([])

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'Q2 Sales Performance',
          type: 'sales',
          status: 'generated',
          lastGenerated: '2024-03-15',
          nextSchedule: '2024-04-15',
          metrics: [
            { name: 'Revenue', value: 1250000, trend: 15.5 },
            { name: 'Deals', value: 45, trend: 8.2 }
          ]
        },
        {
          id: '2',
          title: 'Customer Acquisition Report',
          type: 'customer',
          status: 'scheduled',
          lastGenerated: '2024-03-10',
          nextSchedule: '2024-04-10',
          metrics: [
            { name: 'New Customers', value: 125, trend: 12.5 },
            { name: 'Churn Rate', value: 4.2, trend: -2.5 }
          ]
        }
      ]

      const mockMetrics: ReportMetric[] = [
        {
          name: 'Total Reports',
          value: 24,
          trend: 12.5,
          change: 5.2
        },
        {
          name: 'Scheduled Reports',
          value: 8,
          trend: 8.2,
          change: 3.1
        },
        {
          name: 'Failed Reports',
          value: 2,
          trend: -25.5,
          change: -7.2
        }
      ]

      setReports(mockReports)
      setMetrics(mockMetrics)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch reports data:', error)
      setError(true)
      toast.error('Failed to fetch reports data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Report['status']) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      generated: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  const getTypeIcon = (type: Report['type']) => {
    const icons = {
      sales: DollarSign,
      marketing: BarChart,
      customer: Users,
      financial: DollarSign,
    }
    return icons[type]
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
              <p>Failed to load reports data</p>
              <Button variant="outline" size="sm" onClick={fetchReportsData} className="group">
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
                <FileText className="w-6 h-6 text-[var(--primary)]" />
                Reports
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Generate and manage detailed reports
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Report
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
                    <FileText className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center pt-1">
                      {metric.trend > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ml-1 ${metric.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.trend > 0 ? '+' : ''}{metric.trend}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>
                    Latest generated and scheduled reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const TypeIcon = getTypeIcon(report.type)
                      return (
                        <div key={report.id} className="p-4 rounded-lg bg-[var(--card)]/50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                <TypeIcon className="w-5 h-5 text-[var(--primary)]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{report.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Last generated: {report.lastGenerated}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {report.metrics.map((metric) => (
                              <div key={metric.name} className="p-3 rounded-lg bg-[var(--card)]/50">
                                <p className="text-sm font-medium">{metric.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-lg font-bold">
                                    {metric.name.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
                                  </p>
                                  <Badge className={metric.trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {metric.trend > 0 ? '+' : ''}{metric.trend}%
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button variant="ghost" size="sm">
                              View Details
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Report Schedule</CardTitle>
                  <CardDescription>
                    Upcoming report generations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="p-3 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{report.title}</p>
                          <Badge variant="outline">
                            {report.type}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          Next: {report.nextSchedule}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>
                  Pre-configured report templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {['Sales Performance', 'Customer Insights', 'Marketing ROI', 'Financial Overview'].map((template) => (
                    <Card key={template} className="bg-[var(--card)]/50">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">{template}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
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