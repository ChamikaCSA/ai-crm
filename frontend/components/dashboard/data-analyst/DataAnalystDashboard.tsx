import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Database, TrendingUp, Target, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DataAnalystStats, DataTrend, Prediction } from '@/lib/api-types'

export function DataAnalystDashboard() {
  const [stats, setStats] = useState<DataAnalystStats | null>(null)
  const [dataTrends, setDataTrends] = useState<DataTrend[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, trendsResponse, predictionsResponse] = await Promise.all([
          api.get<DataAnalystStats>('/api/data-analyst/stats'),
          api.get<DataTrend[]>('/api/data-analyst/trends'),
          api.get<Prediction[]>('/api/data-analyst/predictions')
        ])

        setStats(statsResponse)
        setDataTrends(Array.isArray(trendsResponse) ? trendsResponse : [])
        setPredictions(Array.isArray(predictionsResponse) ? predictionsResponse : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="w-6 h-6 text-[var(--primary)]" />
              Data Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats?.dataPoints || 0).toLocaleString()}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Processed today</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Analysis Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.analysisAccuracy || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Model accuracy</p>
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
            <div className="text-3xl font-bold">{stats?.growthRate || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">MoM growth</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.predictionAccuracy || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Accuracy rate</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
              Data Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataTrends.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No recent data trends
                  </p>
                </div>
              ) : (
                dataTrends.slice(0, 5).map((trend) => (
                  <div
                    key={trend._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {trend.metric}
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
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(trend.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/data-analyst/trends">
                <Button variant="outline" size="sm" className="w-full">
                  View All Trends
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Predictive Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No recent predictions
                  </p>
                </div>
              ) : (
                predictions.slice(0, 5).map((prediction) => (
                  <div
                    key={prediction._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {prediction.metric}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            prediction.confidence >= 0.8
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : prediction.confidence >= 0.6
                              ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                              : 'bg-[var(--error)]/10 text-[var(--error)]'
                          }`}
                        >
                          {Math.round(prediction.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[var(--text-tertiary)]">
                          Predicted: {prediction.predictedValue.toLocaleString()}
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Actual: {prediction.actualValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(prediction.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/data-analyst/predictions">
                <Button variant="outline" size="sm" className="w-full">
                  View All Predictions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}