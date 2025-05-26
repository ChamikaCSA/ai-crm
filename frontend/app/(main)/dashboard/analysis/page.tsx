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
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
  ArrowDownRight,
  Lightbulb
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Metric {
  name: string
  value: number
  trend: number
  change: number
  target: number
  category: string
  description: string
  lastUpdated: string
}

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

interface TrendData {
  category: string
  value: number
  previousValue: number
  change: number
}

interface DashboardConfig {
  id: string
  name: string
  metrics: string[]
  layout: 'grid' | 'list'
  refreshInterval: number
  isDefault: boolean
}

export default function AnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [trendMetrics, setTrendMetrics] = useState<TrendMetric[]>([])
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([])
  const [trends, setTrends] = useState<TrendData[]>([])
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([])
  const [activeDashboard, setActiveDashboard] = useState<string>('default')
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [timeframe, setTimeframe] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [newDashboard, setNewDashboard] = useState<Partial<DashboardConfig>>({
    name: '',
    metrics: [],
    layout: 'grid',
    refreshInterval: 300,
    isDefault: false
  })

  useEffect(() => {
    fetchAnalysisData()
  }, [activeDashboard, timeframe, selectedMetric])

  useEffect(() => {
    if (dashboards.length === 0) {
      const defaultDashboard: DashboardConfig = {
        id: 'default',
        name: 'Default Dashboard',
        metrics: metrics.map((m: Metric) => m.name),
        layout: 'grid',
        refreshInterval: 300,
        isDefault: true
      }
      setDashboards([defaultDashboard])
      setActiveDashboard('default')
    }
  }, [metrics, dashboards, setDashboards, setActiveDashboard])

  useEffect(() => {
    const activeConfig = dashboards.find((d: DashboardConfig) => d.id === activeDashboard)
    if (!activeConfig) return

    const interval = setInterval(() => {
      fetchAnalysisData()
    }, activeConfig.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [activeDashboard, dashboards])

  const fetchAnalysisData = async () => {
    try {
      setIsLoading(true)
      // Fetch metrics and trends from backend
      const [metricsRes, trendsRes] = await Promise.all([
        fetch('/api/data-analyst/dashboard/metrics'),
        fetch('/api/data-analyst/dashboard/trends'),
      ])
      if (!metricsRes.ok || !trendsRes.ok) throw new Error('Failed to fetch dashboard data')
      const metrics = await metricsRes.json()
      const trends = await trendsRes.json()
      setMetrics(metrics)
      setTrends(trends)
      // Extract patterns from trends data
      const patterns = trends.map((trend: TrendData) => ({
        category: trend.category,
        value: trend.value,
        previousValue: trend.previousValue,
        change: trend.change,
        recommendations: [`Trend shows ${trend.change > 0 ? 'positive' : 'negative'} growth of ${Math.abs(trend.change)}%`]
      }))
      setPatterns(patterns)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch analysis data:', error)
      setError(true)
      toast.error('Failed to fetch analysis data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDashboardChange = (dashboardId: string) => {
    setActiveDashboard(dashboardId)
  }

  const handleCustomizeDashboard = () => {
    setIsCustomizing(true)
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/data-analyst/dashboard/analysis/export')
      if (!response.ok) throw new Error('Failed to export data')

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement('a')
      link.href = url
      link.download = 'analysis-data.csv'

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

  const handleSaveDashboard = () => {
    if (!newDashboard.name) {
      toast.error('Please enter a dashboard name')
      return
    }

    const config: DashboardConfig = {
      id: `dashboard-${Date.now()}`,
      name: newDashboard.name,
      metrics: newDashboard.metrics || [],
      layout: newDashboard.layout || 'grid',
      refreshInterval: newDashboard.refreshInterval || 300,
      isDefault: newDashboard.isDefault || false
    }

    setDashboards(prev => [...prev, config])
    setActiveDashboard(config.id)
    setIsCustomizing(false)
    setNewDashboard({
      name: '',
      metrics: [],
      layout: 'grid',
      refreshInterval: 300,
      isDefault: false
    })
    toast.success('Dashboard saved successfully')
  }

  const handleMetricToggle = (metricName: string) => {
    setNewDashboard(prev => ({
      ...prev,
      metrics: prev.metrics?.includes(metricName)
        ? prev.metrics.filter(m => m !== metricName)
        : [...(prev.metrics || []), metricName]
    }))
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
                <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                Analysis Dashboard
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Comprehensive data analysis and trend insights
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
              <Button variant="outline" onClick={handleCustomizeDashboard}>
                <Settings className="mr-2 h-4 w-4" />
                Customize
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {metrics.map((metric) => (
                <Card key={metric.name} className="bg-[var(--card)]/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {metric.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {metric.value.toLocaleString()}
                        </div>
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
                      </div>
                      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                        <span>Target</span>
                        <span>{metric.target.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                        <span>Last Updated</span>
                        <span>{new Date(metric.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trends Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trends.map((trend) => (
                <Card key={trend.category} className="bg-[var(--card)]/50">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">{trend.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">Current</span>
                        <span className="font-medium">{trend.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">Previous</span>
                        <span className="font-medium">{trend.previousValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">Change</span>
                        <span className={`font-medium ${trend.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trend.change > 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Patterns Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[var(--primary)]" />
              Key Patterns & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patterns.map((pattern) => (
                <Card key={pattern.category} className="bg-[var(--card)]/50">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">{pattern.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--text-secondary)]">Change</span>
                        <span className={`text-sm ${pattern.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pattern.change > 0 ? '+' : ''}{pattern.change}%
                        </span>
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {pattern.recommendations[0]}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customize Dashboard Modal */}
      <Modal
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        title="Customize Dashboard"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="dashboard-name">Dashboard Name</Label>
            <Input
              id="dashboard-name"
              value={newDashboard.name}
              onChange={(e) => setNewDashboard(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter dashboard name"
            />
          </div>
          <div>
            <Label>Select Metrics</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {metrics.map((metric) => (
                <div key={metric.name} className="flex items-center space-x-2">
                  <Switch
                    checked={newDashboard.metrics?.includes(metric.name)}
                    onCheckedChange={() => handleMetricToggle(metric.name)}
                  />
                  <Label>{metric.name}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Layout</Label>
            <Select
              value={newDashboard.layout}
              onValueChange={(value: 'grid' | 'list') => setNewDashboard(prev => ({ ...prev, layout: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Refresh Interval (seconds)</Label>
            <Input
              type="number"
              value={newDashboard.refreshInterval}
              onChange={(e) => setNewDashboard(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
              min={30}
              step={30}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newDashboard.isDefault}
              onCheckedChange={(checked) => setNewDashboard(prev => ({ ...prev, isDefault: checked }))}
            />
            <Label>Set as default dashboard</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCustomizing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDashboard}>
              Save Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}