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
  BarChart,
  LineChart,
  PieChart,
  Download,
  TrendingUp,
  Users,
  AlertCircle,
  Settings,
  Activity,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface Metric {
  name: string
  value: number
  trend: number
  change: number
  target: number
}

interface TrendData {
  category: string
  value: number
  previousValue: number
  change: number
}

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [trends, setTrends] = useState<TrendData[]>([])

  useEffect(() => {
    fetchAnalysisData()
  }, [])

  const fetchAnalysisData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockMetrics: Metric[] = [
        {
          name: 'Conversion Rate',
          value: 12.5,
          trend: 15.5,
          change: 5.2,
          target: 15
        },
        {
          name: 'Customer Lifetime Value',
          value: 2500,
          trend: 8.2,
          change: 3.1,
          target: 3000
        },
        {
          name: 'Churn Rate',
          value: 4.2,
          trend: -12.5,
          change: -2.1,
          target: 3
        },
        {
          name: 'Revenue Growth',
          value: 18.5,
          trend: 25.5,
          change: 7.2,
          target: 20
        }
      ]

      const mockTrends: TrendData[] = [
        {
          category: 'Sales Pipeline',
          value: 1250000,
          previousValue: 1000000,
          change: 25
        },
        {
          category: 'Customer Acquisition',
          value: 850,
          previousValue: 750,
          change: 13.3
        },
        {
          category: 'Average Deal Size',
          value: 25000,
          previousValue: 22000,
          change: 13.6
        }
      ]

      setMetrics(mockMetrics)
      setTrends(mockTrends)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch analysis data:', error)
      setError(true)
      toast.error('Failed to fetch analysis data')
    } finally {
      setIsLoading(false)
    }
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
              <p>Failed to load analysis data</p>
              <Button variant="outline" size="sm" onClick={fetchAnalysisData} className="group">
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
                Data Analysis
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Interactive dashboards and key metrics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Customize
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
                    {metric.name.includes('Revenue') ? (
                      <DollarSign className="h-4 w-4" />
                    ) : metric.name.includes('Customer') ? (
                      <Users className="h-4 w-4" />
                    ) : metric.name.includes('Churn') ? (
                      <Activity className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metric.name.includes('Revenue') || metric.name.includes('Customer Lifetime Value')
                        ? `$${metric.value.toLocaleString()}`
                        : `${metric.value}%`}
                    </div>
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
                    <div className="mt-2">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${(metric.value / metric.target) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Target: {metric.target}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                  <CardDescription>
                    Key performance indicators and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trends.map((trend) => (
                      <div key={trend.category} className="p-4 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{trend.category}</p>
                          <Badge className={trend.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {trend.change > 0 ? '+' : ''}{trend.change}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">
                              ${trend.value.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              vs ${trend.previousValue.toLocaleString()}
                            </p>
                          </div>
                          <div className="w-32 h-20 bg-[var(--card)]/50 rounded-lg flex items-center justify-center">
                            <LineChart className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Distribution Analysis</CardTitle>
                  <CardDescription>
                    Data distribution and patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Category {i}</p>
                          <Badge>Distribution</Badge>
                        </div>
                        <div className="w-full h-24 bg-[var(--card)]/50 rounded-lg flex items-center justify-center">
                          <PieChart className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>Data Insights</CardTitle>
                <CardDescription>
                  Key findings and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <BarChart className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium leading-none">
                            Insight {i}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Data-driven insight about business performance and trends
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString()}
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