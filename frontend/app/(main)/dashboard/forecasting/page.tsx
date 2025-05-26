'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { TrendingUp, AlertCircle, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ForecastMetric = 'revenue' | 'leads'

type Forecast = {
  _id: string
  metric: string
  predictedValue: number
  actualValue?: number
  confidence: number
  factors: {
    historicalTrend: number
    seasonality: number
    marketConditions: number
    teamPerformance: number
  }
  timestamp: string
  predictionDate: string
  date: string
  value: number
  accuracy?: number
  metadata: {
    model: string
    version: string
    parameters: {
      seasonality: boolean
      trend: boolean
    }
  }
}

type AccuracyMetrics = {
  accuracy: {
    mae: number
    mape: number
    accuracy: number
  }
  confidenceInterval: [number, number]
}

export default function ForecastingPage() {
  const { user } = useAuth()
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [accuracyMetrics, setAccuracyMetrics] = useState<AccuracyMetrics | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<ForecastMetric>('revenue')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchForecastData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch historical predictions
      const predictionsResponse = await fetch(`/api/sales-manager/forecasts?metric=${selectedMetric}`)
      if (!predictionsResponse.ok) {
        const errorData = await predictionsResponse.json()
        throw new Error(errorData.error || 'Failed to fetch predictions')
      }
      const predictionsData = await predictionsResponse.json()
      setForecasts(predictionsData || [])

      // Fetch accuracy metrics
      const accuracyResponse = await fetch(`/api/sales-manager/forecasts?metric=${selectedMetric}&type=accuracy`)
      if (!accuracyResponse.ok) {
        const errorData = await accuracyResponse.json()
        throw new Error(errorData.error || 'Failed to fetch accuracy metrics')
      }
      const accuracyData = await accuracyResponse.json()
      setAccuracyMetrics(accuracyData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch forecast data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecastData()
  }, [selectedMetric])

  if (loading) {
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
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[180px]" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
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
              <p>Failed to load forecast data</p>
              <Button variant="outline" size="sm" onClick={fetchForecastData} className="group">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const latestForecast = forecasts[0]
  const formattedForecasts = forecasts.map(forecast => ({
    ...forecast,
    timestamp: format(new Date(forecast.timestamp), 'MMM d, yyyy'),
    predictionDate: format(new Date(forecast.predictionDate), 'MMM d, yyyy'),
  }))

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
                <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                Sales Forecasting
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                View and analyze sales forecasts and predictions
              </CardDescription>
            </div>
            <Select value={selectedMetric} onValueChange={(value: ForecastMetric) => setSelectedMetric(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Prediction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${latestForecast?.predictedValue?.toLocaleString() ?? 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {latestForecast?.confidence ? (latestForecast.confidence * 100).toFixed(1) : 'N/A'}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {accuracyMetrics?.accuracy.accuracy ? accuracyMetrics.accuracy.accuracy.toFixed(1) : 'N/A'}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      MAPE: {accuracyMetrics?.accuracy.mape ? accuracyMetrics.accuracy.mape.toFixed(1) : 'N/A'}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Confidence Interval</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {accuracyMetrics?.confidenceInterval ?
                        `${(accuracyMetrics.confidenceInterval[0] * 100).toFixed(1)}% - ${(accuracyMetrics.confidenceInterval[1] * 100).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Historical Predictions vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formattedForecasts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="predictedValue"
                          stroke="#8884d8"
                          name="Predicted"
                        />
                        <Line
                          type="monotone"
                          dataKey="actualValue"
                          stroke="#82ca9d"
                          name="Actual"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {forecasts.map((forecast) => (
                  <motion.div
                    key={forecast._id}
                    variants={itemVariants}
                    className="flex items-center justify-between p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-4">
                      <BarChart2 className="w-5 h-5 text-[var(--primary)]" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(forecast.timestamp), 'MMMM d, yyyy')}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          Prediction for {format(new Date(forecast.predictionDate), 'MMMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">
                          ${forecast.predictedValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          Confidence: {(forecast.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                      {forecast.actualValue && (
                        <Badge variant="secondary" className={forecast.accuracy && forecast.accuracy > 0.9 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
                          {forecast.accuracy ? (forecast.accuracy * 100).toFixed(1) : 'N/A'}% accuracy
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}