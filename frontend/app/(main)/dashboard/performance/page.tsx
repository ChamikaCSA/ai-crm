'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpRight, ArrowDownRight, Target, Users, DollarSign, TrendingUp, AlertCircle, BarChart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { PerformanceMetric, PerformanceLead, PerformanceData } from '@/lib/api-types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getStatusColor, formatStatus } from '@/lib/lead-utils'

interface Metric extends PerformanceMetric {
  icon: React.ReactNode
  status: 'success' | 'warning' | 'destructive'
}

export default function PerformancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [topLeads, setTopLeads] = useState<PerformanceLead[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('this_month')

  useEffect(() => {
    fetchPerformanceData()
  }, [selectedPeriod])

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<PerformanceData>(`/api/sales-rep/performance?period=${selectedPeriod}`)

      if (response.metrics) {
        setMetrics(response.metrics.map(metric => ({
          ...metric,
          icon: getMetricIcon(metric.title),
          status: getMetricStatus(metric.change)
        })))
      }

      if (response.topLeads) {
        setTopLeads(response.topLeads)
      }

      setError(false)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      setError(true)
      toast.error('Failed to fetch metrics')
    } finally {
      setIsLoading(false)
    }
  }

  const getMetricIcon = (title: string) => {
    switch (title) {
      case 'Total Sales':
        return <DollarSign className="h-4 w-4" />
      case 'Active Leads':
        return <Users className="h-4 w-4" />
      case 'Conversion Rate':
        return <Target className="h-4 w-4" />
      case 'Avg. Deal Size':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <BarChart className="h-4 w-4" />
    }
  }

  const getMetricStatus = (change: number): 'success' | 'warning' | 'destructive' => {
    if (change >= 10) return 'success'
    if (change >= 0) return 'warning'
    return 'destructive'
  }

  const getLeadStatusBadge = (status: PerformanceLead['status']) => {
    return (
      <Badge
        className={`${getStatusColor(status)} ml-2`}
      >
        {formatStatus(status)}
      </Badge>
    )
  }

  const handleLeadClick = (leadId: string) => {
    router.push(`/dashboard/leads/${leadId}`)
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
            <Skeleton className="h-10 w-[180px]" />
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
              <p>Failed to load performance metrics</p>
              <Button variant="outline" size="sm" onClick={fetchPerformanceData} className="group">
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
                <BarChart className="w-6 h-6 text-[var(--primary)]" />
                Performance Overview
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Track your sales performance and metrics
              </CardDescription>
            </div>
            <Select
              value={selectedPeriod}
              onValueChange={(value) => setSelectedPeriod(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.title} className="bg-[var(--card)]/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.title}
                      <Badge
                        variant={metric.status}
                        className="ml-2"
                      >
                        {metric.status}
                      </Badge>
                    </CardTitle>
                    {metric.icon}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center pt-1">
                      {metric.change > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-[var(--success)]" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-[var(--destructive)]" />
                      )}
                      <span
                        className={`text-sm ${
                          metric.change > 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'
                        }`}
                      >
                        {Math.abs(metric.change)}%
                      </span>
                      <span className="text-sm text-[var(--text-tertiary)] ml-1">
                        from last period
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--primary)]" />
                      Top Performing Leads
                    </CardTitle>
                    <CardDescription>
                      Your most promising opportunities
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/leads">
                    <Button variant="outline" size="sm" className="text-xs">
                      View All Leads
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-[var(--accent)]/5 transition-colors cursor-pointer"
                      onClick={() => handleLeadClick(lead._id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-[var(--accent)]/10 group-hover:bg-[var(--accent)]/20 transition-colors">
                          <span className="text-sm font-medium">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                              {`${lead.firstName} ${lead.lastName}`}
                            </p>
                            {getLeadStatusBadge(lead.status as 'hot' | 'warm' | 'cold')}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                              {lead.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
                              {lead.jobTitle}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Score</span>
                            <Badge variant="outline" className="font-mono">
                              {lead.leadScore}
                            </Badge>
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            Last contact: {new Date(lead.lastContact).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLeadClick(lead._id)
                          }}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
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