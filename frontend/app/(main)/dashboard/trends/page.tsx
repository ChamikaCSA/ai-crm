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
  BarChart,
  PieChart,
  Download,
  Filter,
  AlertCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Database,
  Activity,
  Clock,
  BarChart2,
  Search,
  Lightbulb,
  LineChart as LineChartIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface TrendMetric {
  name: string
  value: number
  previousValue: number
  change: number
  trend: number
  confidence: number
  timeframe: string
  forecast: {
    value: number
    confidence: number
    upperBound: number
    lowerBound: number
  }
}

interface Pattern {
  category: string
  value: number
  previousValue: number
  change: number
  recommendations: string[]
}

interface TimeSeriesData {
  timestamp: string
  value: number
  category: string
  forecast?: number
  upperBound?: number
  lowerBound?: number
}

interface ComparisonData {
  metric: string
  current: number
  previous: number
  change: number
  trend: number
  forecast: number
  confidence: number
}

export default function TrendsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [metrics, setMetrics] = useState<TrendMetric[]>([])
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([])
  const [timeframe, setTimeframe] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [viewMode, setViewMode] = useState<'trends' | 'forecast'>('trends')

  useEffect(() => {
    fetchTrendsData()
  }, [timeframe, selectedMetric, viewMode])

  const fetchTrendsData = async () => {
    try {
      setIsLoading(true)
      // Fetch metrics and patterns (using metrics and trends endpoints for now)
      const [metricsRes, patternsRes] = await Promise.all([
        fetch('/api/data-analyst/dashboard/metrics'),
        fetch('/api/data-analyst/dashboard/trends'),
      ])
      if (!metricsRes.ok || !patternsRes.ok) throw new Error('Failed to fetch trends data')
      const metrics = await metricsRes.json()
      const patterns = await patternsRes.json()
      setMetrics(metrics)
      setPatterns(patterns)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch trends data:', error)
      setError(true)
      toast.error('Failed to load trends data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/data-analyst/dashboard/trends/export')
      if (!response.ok) throw new Error('Failed to export data')

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement('a')
      link.href = url
      link.download = 'trends-data.csv'

      // Append to the document, click it, and remove it
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL
      window.URL.revokeObjectURL(url)

      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Failed to export data:', error)
      toast.error('Failed to export data')
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="h-32 flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-2">
              <AlertCircle className="w-8 h-8 text-[var(--warning)]" />
              <p>Failed to load trends data</p>
              <Button variant="outline" size="sm" onClick={fetchTrendsData} className="group">
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
                <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                Trends Analysis
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Historical data analysis and pattern recognition
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={viewMode} onValueChange={(value: 'trends' | 'forecast') => setViewMode(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select view mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trends">Trend Analysis</SelectItem>
                  <SelectItem value="forecast">Forecast View</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {metrics.map((metric) => (
                <Card key={metric.name} className="bg-[var(--card)]/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {metric.confidence * 100}% confidence
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metric.value.toLocaleString()}
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
                    {viewMode === 'forecast' && (
                      <div className="mt-4 space-y-2">
                        <div className="text-sm font-medium">Forecast</div>
                        <div className="text-lg font-semibold">
                          {metric.forecast.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          Range: {metric.forecast.lowerBound.toLocaleString()} - {metric.forecast.upperBound.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Card className="bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Detected Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patterns.map((pattern) => (
                      <Card key={pattern.category} className="bg-[var(--card)]/30">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">
                              {pattern.category}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Recommendations:</div>
                            <ul className="list-disc list-inside text-sm text-[var(--text-tertiary)]">
                              {pattern.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
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