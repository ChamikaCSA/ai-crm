import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Database, TrendingUp, Target, ArrowUp, ArrowDown, FileText, LineChart } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface OverviewData {
  summary: {
    totalReports: number
    recentReports: number
    averageForecastAccuracy: number
    dataPointsProcessed: number
    growthRate: number
  }
  topMetrics: Array<{
    name: string
    value: number
    trend: string
    change: number
  }>
  significantTrends: Array<{
    category: string
    value: number
    previousValue: number
    change: number
    recommendations: string[]
  }>
  latestForecasts: Array<{
    metric: string
    predictedValue: number
    confidence: number
    timestamp: string
  }>
  recentReports: Array<{
    id: string
    type: string
    generatedAt: string
    visualization: string
  }>
}

export function DataAnalystDashboard() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get<OverviewData>('/api/data-analyst/dashboard/overview')
        setData(response)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading || !data) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="w-6 h-6 text-[var(--primary)]" />
              Data Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.dataPointsProcessed?.toLocaleString() ?? '0'}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Processed today</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Forecast Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.averageForecastAccuracy ?? 'N/A'}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Average accuracy</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.growthRate?.toFixed(1) ?? '0.0'}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">MoM growth</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-[var(--primary)]" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.recentReports ?? '0'}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Metrics */}
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Top Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-1 space-y-4">
              {data.topMetrics?.length > 0 ? (
                data.topMetrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {metric.name}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            metric.change > 0
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : 'bg-[var(--error)]/10 text-[var(--error)]'
                          }`}
                        >
                          {metric.change > 0 ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 mr-1" />
                          )}
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                      <p className="text-[var(--text-tertiary)]">
                        Current value: {metric.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">No metrics available</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <Link href="/dashboard/analysis">
                <Button variant="outline" size="sm" className="w-full">
                  View All Metrics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Significant Trends */}
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LineChart className="w-6 h-6 text-[var(--primary)]" />
              Significant Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-1 space-y-4">
              {data.significantTrends?.length > 0 ? (
                data.significantTrends.map((trend) => (
                  <div
                    key={trend.category}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {trend.category}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            trend.change > 0
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : 'bg-[var(--error)]/10 text-[var(--error)]'
                          }`}
                        >
                          {trend.change > 0 ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 mr-1" />
                          )}
                          {trend.change > 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                      <p className="text-[var(--text-tertiary)]">
                        Current value: {trend.value.toLocaleString()}
                      </p>
                      {trend.recommendations?.length > 0 && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                          {trend.recommendations[0]}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <LineChart className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">No trends available</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <Link href="/dashboard/trends">
                <Button variant="outline" size="sm" className="w-full">
                  View All Trends
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Latest Forecasts */}
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Latest Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-1 space-y-4">
              {data.latestForecasts?.length > 0 ? (
                data.latestForecasts.map((forecast) => (
                  <div
                    key={forecast.metric}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {forecast.metric}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            forecast.confidence >= 0.8
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : forecast.confidence >= 0.6
                              ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                              : 'bg-[var(--error)]/10 text-[var(--error)]'
                          }`}
                        >
                          {Math.round(forecast.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-[var(--text-tertiary)]">
                        Predicted: {forecast.predictedValue.toLocaleString()}
                      </p>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(forecast.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">No forecasts available</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <Link href="/dashboard/forecasting">
                <Button variant="outline" size="sm" className="w-full">
                  View All Forecasts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-[var(--primary)]" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-1 space-y-4">
              {data.recentReports?.length > 0 ? (
                data.recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {report.type}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                          {report.visualization}
                        </span>
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </time>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">No reports available</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <Link href="/dashboard/reports">
                <Button variant="outline" size="sm" className="w-full">
                  View All Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}