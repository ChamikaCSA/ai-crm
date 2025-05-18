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
  ArrowDownRight
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
  const [trends, setTrends] = useState<TrendData[]>([])
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([])
  const [activeDashboard, setActiveDashboard] = useState<string>('default')
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [newDashboard, setNewDashboard] = useState<Partial<DashboardConfig>>({
    name: '',
    metrics: [],
    layout: 'grid',
    refreshInterval: 300,
    isDefault: false
  })

  useEffect(() => {
    fetchAnalysisData()
  }, [activeDashboard])

  useEffect(() => {
    if (dashboards.length === 0) {
      const defaultDashboard: DashboardConfig = {
        id: 'default',
        name: 'Default Dashboard',
        metrics: metrics.map(m => m.name),
        layout: 'grid',
        refreshInterval: 300,
        isDefault: true
      }
      setDashboards([defaultDashboard])
      setActiveDashboard('default')
    }
  }, [metrics])

  useEffect(() => {
    const activeConfig = dashboards.find(d => d.id === activeDashboard)
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
                <BarChart className="w-6 h-6 text-[var(--primary)]" />
                Data Analysis
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Interactive dashboards and key metrics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={activeDashboard} onValueChange={handleDashboardChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select dashboard" />
                </SelectTrigger>
                <SelectContent>
                  {dashboards.map(dashboard => (
                    <SelectItem key={dashboard.id} value={dashboard.id}>
                      {dashboard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleCustomizeDashboard}>
                <Settings className="mr-2 h-4 w-4" />
                Customize
              </Button>
              <Button onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "gap-4",
              dashboards.find(d => d.id === activeDashboard)?.layout === 'grid'
                ? "grid md:grid-cols-2 lg:grid-cols-4"
                : "flex flex-col"
            )}>
              {metrics
                .filter(metric =>
                  dashboards.find(d => d.id === activeDashboard)?.metrics.includes(metric.name)
                )
                .map((metric) => (
                  <Card
                    key={metric.name}
                    className={cn(
                      "bg-[var(--card)]/50 hover:shadow-lg transition-all duration-300",
                      dashboards.find(d => d.id === activeDashboard)?.layout === 'list' && "mb-4"
                    )}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {metric.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {metric.category}
                      </Badge>
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
                      <div className="mt-2 text-xs text-[var(--text-tertiary)]">
                        {metric.description}
                      </div>
                      <div className="mt-2 text-xs text-[var(--text-tertiary)]">
                        Last updated: {new Date(metric.lastUpdated).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className={cn(
              "mt-6 gap-4",
              dashboards.find(d => d.id === activeDashboard)?.layout === 'grid'
                ? "grid md:grid-cols-2 lg:grid-cols-7"
                : "flex flex-col"
            )}>
              <Card className={cn(
                "bg-[var(--card)]/50",
                dashboards.find(d => d.id === activeDashboard)?.layout === 'grid'
                  ? "col-span-4"
                  : "mb-4"
              )}>
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

              <Card className={cn(
                "bg-[var(--card)]/50",
                dashboards.find(d => d.id === activeDashboard)?.layout === 'grid'
                  ? "col-span-3"
                  : "mb-4"
              )}>
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

            <Card className={cn(
              "mt-6 bg-[var(--card)]/50",
              dashboards.find(d => d.id === activeDashboard)?.layout === 'list' && "mb-4"
            )}>
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

      <Modal
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        title="Customize Dashboard"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-tertiary)]">
            Create a new dashboard with your preferred metrics and settings.
          </p>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newDashboard.name}
                onChange={(e) => setNewDashboard(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Enter dashboard name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="layout" className="text-right">
                Layout
              </Label>
              <Select
                value={newDashboard.layout}
                onValueChange={(value: 'grid' | 'list') =>
                  setNewDashboard(prev => ({ ...prev, layout: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="refresh" className="text-right">
                Refresh (s)
              </Label>
              <Input
                id="refresh"
                type="number"
                value={newDashboard.refreshInterval}
                onChange={(e) => setNewDashboard(prev => ({
                  ...prev,
                  refreshInterval: parseInt(e.target.value) || 300
                }))}
                className="col-span-3"
                min={30}
                max={3600}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="default" className="text-right">
                Default
              </Label>
              <Switch
                id="default"
                checked={newDashboard.isDefault}
                onCheckedChange={(checked) =>
                  setNewDashboard(prev => ({ ...prev, isDefault: checked }))
                }
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <Label>Select Metrics</Label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {metrics.map((metric) => (
                  <div key={metric.name} className="flex items-center space-x-2">
                    <Switch
                      id={`metric-${metric.name}`}
                      checked={newDashboard.metrics?.includes(metric.name)}
                      onCheckedChange={() => handleMetricToggle(metric.name)}
                    />
                    <Label htmlFor={`metric-${metric.name}`} className="text-sm">
                      {metric.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
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