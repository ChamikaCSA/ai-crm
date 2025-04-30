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
  Target,
  BarChart,
  Download,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calendar,
  LineChart,
  PieChart,
  FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface Forecast {
  period: string
  predicted: number
  actual: number
  confidence: number
}

interface TargetMetric {
  name: string
  current: number
  target: number
  trend: number
  status: 'on_track' | 'at_risk' | 'exceeding'
}

export default function TargetsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [metrics, setMetrics] = useState<TargetMetric[]>([])

  useEffect(() => {
    fetchTargetData()
  }, [])

  const fetchTargetData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockForecasts: Forecast[] = [
        {
          period: 'Q2 2024',
          predicted: 150000,
          actual: 145000,
          confidence: 85
        },
        // Add more forecasts
      ]

      const mockMetrics: TargetMetric[] = [
        {
          name: 'Revenue Target',
          current: 850000,
          target: 1000000,
          trend: 12.5,
          status: 'on_track'
        },
        // Add more metrics
      ]

      setForecasts(mockForecasts)
      setMetrics(mockMetrics)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch target data:', error)
      setError(true)
      toast.error('Failed to fetch target data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: TargetMetric['status']) => {
    const colors = {
      on_track: 'bg-green-100 text-green-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      exceeding: 'bg-blue-100 text-blue-800',
    }
    return colors[status]
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
              <p>Failed to load target data</p>
              <Button variant="outline" size="sm" onClick={fetchTargetData} className="group">
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
                <Target className="w-6 h-6 text-[var(--primary)]" />
                Sales Targets & Forecasting
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Monitor targets and view predictive analytics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Set New Target
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Annual Target
                  </CardTitle>
                  <Target className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1.2M</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">85% achieved</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Forecast Accuracy
                  </CardTitle>
                  <LineChart className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+3.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pipeline Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2.4M</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+15.5%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Win Rate
                  </CardTitle>
                  <PieChart className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+5.8%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Sales Forecast</CardTitle>
                  <CardDescription>
                    Predicted vs actual sales performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forecasts.map((forecast) => (
                      <div key={forecast.period} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{forecast.period}</span>
                          <span className="text-sm text-muted-foreground">
                            {forecast.confidence}% confidence
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${(forecast.actual / forecast.predicted) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Predicted: ${forecast.predicted.toLocaleString()}</span>
                          <span>Actual: ${forecast.actual.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Target Metrics</CardTitle>
                  <CardDescription>
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.map((metric) => (
                      <div key={metric.name} className="flex items-center justify-between p-2 rounded-lg bg-[var(--card)]/50">
                        <div>
                          <p className="text-sm font-medium">{metric.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${metric.current.toLocaleString()} / ${metric.target.toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  Latest performance reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium leading-none">
                            Report {i}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Description of report {i}
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