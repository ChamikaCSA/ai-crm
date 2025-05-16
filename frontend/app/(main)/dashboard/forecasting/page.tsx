'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Prediction } from '@/lib/api-types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ForecastMetric = 'revenue' | 'leads' | 'conversion'

export default function ForecastingPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [latestForecast, setLatestForecast] = useState<Prediction | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<ForecastMetric>('revenue')

  useEffect(() => {
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
        setPredictions(predictionsData.data)

        // Fetch latest forecast
        const latestResponse = await fetch(`/api/sales-manager/forecasts?metric=${selectedMetric}&type=latest`)
        if (!latestResponse.ok) {
          const errorData = await latestResponse.json()
          throw new Error(errorData.error || 'Failed to fetch latest forecast')
        }
        const latestData = await latestResponse.json()
        setLatestForecast(latestData.data)

        // Fetch accuracy
        const accuracyResponse = await fetch(`/api/sales-manager/forecasts?metric=${selectedMetric}&type=accuracy`)
        if (!accuracyResponse.ok) {
          const errorData = await accuracyResponse.json()
          throw new Error(errorData.error || 'Failed to fetch accuracy')
        }
        const accuracyData = await accuracyResponse.json()
        setAccuracy(accuracyData.data.accuracy)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchForecastData()
  }, [selectedMetric])

  if (loading) return <div>Loading forecasting data...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales Forecasting</h1>
        <Select value={selectedMetric} onValueChange={(value: ForecastMetric) => setSelectedMetric(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="conversion">Conversion Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestForecast?.predictedValue?.toLocaleString() ?? 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Confidence: {latestForecast?.confidence ? (latestForecast.confidence * 100).toFixed(1) : 'N/A'}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accuracy ? (accuracy * 100).toFixed(1) : 'N/A'}%
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
              <LineChart data={predictions}>
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

      <Card>
        <CardHeader>
          <CardTitle>Prediction Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#ffc658"
                  name="Confidence"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}