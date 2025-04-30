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
  LineChart,
  Download,
  Filter,
  AlertCircle,
  Plus,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart,
  PieChart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface Prediction {
  id: string
  title: string
  type: 'sales' | 'customer' | 'revenue' | 'churn'
  confidence: number
  timeframe: string
  metrics: {
    name: string
    predicted: number
    actual: number
    trend: number
  }[]
}

interface ForecastMetric {
  name: string
  value: number
  trend: number
  confidence: number
}

export default function PredictionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [metrics, setMetrics] = useState<ForecastMetric[]>([])

  useEffect(() => {
    fetchPredictionsData()
  }, [])

  const fetchPredictionsData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockPredictions: Prediction[] = [
        {
          id: '1',
          title: 'Q3 Sales Forecast',
          type: 'sales',
          confidence: 85,
          timeframe: '2024 Q3',
          metrics: [
            { name: 'Revenue', predicted: 1500000, actual: 1450000, trend: 12.5 },
            { name: 'Deals', predicted: 50, actual: 48, trend: 8.2 }
          ]
        },
        {
          id: '2',
          title: 'Customer Churn Prediction',
          type: 'churn',
          confidence: 92,
          timeframe: 'Next 30 Days',
          metrics: [
            { name: 'Churn Rate', predicted: 4.5, actual: 4.2, trend: -2.5 },
            { name: 'Retention', predicted: 95.5, actual: 95.8, trend: 2.5 }
          ]
        }
      ]

      const mockMetrics: ForecastMetric[] = [
        {
          name: 'Forecast Accuracy',
          value: 87.5,
          trend: 5.2,
          confidence: 90
        },
        {
          name: 'Active Predictions',
          value: 12,
          trend: 8.2,
          confidence: 85
        },
        {
          name: 'Model Confidence',
          value: 92.5,
          trend: 3.1,
          confidence: 95
        }
      ]

      setPredictions(mockPredictions)
      setMetrics(mockMetrics)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch predictions data:', error)
      setError(true)
      toast.error('Failed to fetch predictions data')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: Prediction['type']) => {
    const icons = {
      sales: TrendingUp,
      customer: Target,
      revenue: BarChart,
      churn: TrendingDown,
    }
    return icons[type]
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800'
    if (confidence >= 75) return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800'
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
              <p>Failed to load predictions data</p>
              <Button variant="outline" size="sm" onClick={fetchPredictionsData} className="group">
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
                <LineChart className="w-6 h-6 text-[var(--primary)]" />
                Predictions
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                AI-powered forecasting and trend analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Prediction
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
                    <LineChart className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}%</div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center">
                        {metric.trend > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ml-1 ${metric.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {metric.trend > 0 ? '+' : ''}{metric.trend}%
                        </span>
                      </div>
                      <Badge className={getConfidenceColor(metric.confidence)}>
                        {metric.confidence}% conf
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Active Predictions</CardTitle>
                  <CardDescription>
                    Current forecasts and their accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.map((prediction) => {
                      const TypeIcon = getTypeIcon(prediction.type)
                      return (
                        <div key={prediction.id} className="p-4 rounded-lg bg-[var(--card)]/50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                <TypeIcon className="w-5 h-5 text-[var(--primary)]" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{prediction.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Timeframe: {prediction.timeframe}
                                </p>
                              </div>
                            </div>
                            <Badge className={getConfidenceColor(prediction.confidence)}>
                              {prediction.confidence}% confidence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {prediction.metrics.map((metric) => (
                              <div key={metric.name} className="p-3 rounded-lg bg-[var(--card)]/50">
                                <p className="text-sm font-medium">{metric.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <div>
                                    <p className="text-lg font-bold">
                                      {metric.name.includes('Rate') ? `${metric.predicted}%` : metric.predicted.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Actual: {metric.name.includes('Rate') ? `${metric.actual}%` : metric.actual.toLocaleString()}
                                    </p>
                                  </div>
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
                  <CardTitle>Prediction Models</CardTitle>
                  <CardDescription>
                    Available forecasting models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Sales Forecasting', 'Customer Behavior', 'Revenue Prediction', 'Churn Analysis'].map((model) => (
                      <div key={model} className="p-3 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{model}</p>
                          <Badge variant="outline">
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          Last updated: 2 days ago
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>
                  Accuracy and reliability metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { name: 'Sales Model', accuracy: 92, confidence: 88 },
                    { name: 'Customer Model', accuracy: 89, confidence: 85 },
                    { name: 'Revenue Model', accuracy: 94, confidence: 90 },
                    { name: 'Churn Model', accuracy: 91, confidence: 87 }
                  ].map((model) => (
                    <Card key={model.name} className="bg-[var(--card)]/50">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Accuracy</span>
                            <Badge className={getConfidenceColor(model.accuracy)}>
                              {model.accuracy}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Confidence</span>
                            <Badge className={getConfidenceColor(model.confidence)}>
                              {model.confidence}%
                            </Badge>
                          </div>
                        </div>
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