'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Prediction } from '@/lib/api-types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Sales Manager Types
type SalesForecastMetric = 'revenue' | 'leads' | 'conversion'

// Data Analyst Types
type DataForecastMetric = 'customer_lifetime_value' | 'churn_rate' | 'market_trends' | 'customer_segments'
type AnalysisType = 'time_series' | 'regression' | 'classification' | 'clustering'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function ForecastingPage() {
  const { user } = useAuth()
  const isDataAnalyst = user?.role === 'data_analyst'

  // Sales Manager State
  const [salesPredictions, setSalesPredictions] = useState<Prediction[]>([])
  const [latestSalesForecast, setLatestSalesForecast] = useState<Prediction | null>(null)
  const [salesAccuracy, setSalesAccuracy] = useState<number | null>(null)
  const [selectedSalesMetric, setSelectedSalesMetric] = useState<SalesForecastMetric>('revenue')

  // Data Analyst State
  const [dataPredictions, setDataPredictions] = useState<Prediction[]>([])
  const [latestDataForecast, setLatestDataForecast] = useState<Prediction | null>(null)
  const [dataAccuracy, setDataAccuracy] = useState<number | null>(null)
  const [selectedDataMetric, setSelectedDataMetric] = useState<DataForecastMetric>('customer_lifetime_value')
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType>('time_series')
  const [confidenceInterval, setConfidenceInterval] = useState<[number, number] | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (isDataAnalyst) {
          // Fetch historical predictions
          const predictionsResponse = await fetch(`/api/data-analyst/forecasts?metric=${selectedDataMetric}&analysis=${selectedAnalysisType}`)
          if (!predictionsResponse.ok) {
            const errorData = await predictionsResponse.json()
            throw new Error(errorData.error || 'Failed to fetch predictions')
          }
          const predictionsData = await predictionsResponse.json()
          setDataPredictions(predictionsData.data)

          // Fetch latest forecast
          const latestResponse = await fetch(`/api/data-analyst/forecasts?metric=${selectedDataMetric}&analysis=${selectedAnalysisType}&type=latest`)
          if (!latestResponse.ok) {
            const errorData = await latestResponse.json()
            throw new Error(errorData.error || 'Failed to fetch latest forecast')
          }
          const latestData = await latestResponse.json()
          setLatestDataForecast(latestData.data)

          // Fetch accuracy and confidence interval
          const accuracyResponse = await fetch(`/api/data-analyst/forecasts?metric=${selectedDataMetric}&analysis=${selectedAnalysisType}&type=accuracy`)
          if (!accuracyResponse.ok) {
            const errorData = await accuracyResponse.json()
            throw new Error(errorData.error || 'Failed to fetch accuracy')
          }
          const accuracyData = await accuracyResponse.json()
          setDataAccuracy(accuracyData.data.accuracy)
          setConfidenceInterval(accuracyData.data.confidenceInterval)
        } else {
          // Fetch historical predictions
          const predictionsResponse = await fetch(`/api/sales-manager/forecasts?metric=${selectedSalesMetric}`)
          if (!predictionsResponse.ok) {
            const errorData = await predictionsResponse.json()
            throw new Error(errorData.error || 'Failed to fetch predictions')
          }
          const predictionsData = await predictionsResponse.json()
          setSalesPredictions(predictionsData.data)

          // Fetch latest forecast
          const latestResponse = await fetch(`/api/sales-manager/forecasts?metric=${selectedSalesMetric}&type=latest`)
          if (!latestResponse.ok) {
            const errorData = await latestResponse.json()
            throw new Error(errorData.error || 'Failed to fetch latest forecast')
          }
          const latestData = await latestResponse.json()
          setLatestSalesForecast(latestData.data)

          // Fetch accuracy
          const accuracyResponse = await fetch(`/api/sales-manager/forecasts?metric=${selectedSalesMetric}&type=accuracy`)
          if (!accuracyResponse.ok) {
            const errorData = await accuracyResponse.json()
            throw new Error(errorData.error || 'Failed to fetch accuracy')
          }
          const accuracyData = await accuracyResponse.json()
          setSalesAccuracy(accuracyData.data.accuracy)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchForecastData()
  }, [isDataAnalyst, selectedSalesMetric, selectedDataMetric, selectedAnalysisType])

  if (loading) return <div>Loading forecasting data...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isDataAnalyst ? 'Data Analysis & Forecasting' : 'Sales Forecasting'}
        </h1>
        {isDataAnalyst ? (
          <div className="flex space-x-4">
            <Select value={selectedDataMetric} onValueChange={(value: DataForecastMetric) => setSelectedDataMetric(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_lifetime_value">Customer Lifetime Value</SelectItem>
                <SelectItem value="churn_rate">Churn Rate</SelectItem>
                <SelectItem value="market_trends">Market Trends</SelectItem>
                <SelectItem value="customer_segments">Customer Segments</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAnalysisType} onValueChange={(value: AnalysisType) => setSelectedAnalysisType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Analysis type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time_series">Time Series</SelectItem>
                <SelectItem value="regression">Regression</SelectItem>
                <SelectItem value="classification">Classification</SelectItem>
                <SelectItem value="clustering">Clustering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Select value={selectedSalesMetric} onValueChange={(value: SalesForecastMetric) => setSelectedSalesMetric(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="leads">Leads</SelectItem>
              <SelectItem value="conversion">Conversion Rate</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {isDataAnalyst ? (
        // Data Analyst Dashboard
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestDataForecast?.predictedValue?.toLocaleString() ?? 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Confidence: {latestDataForecast?.confidence ? (latestDataForecast.confidence * 100).toFixed(1) : 'N/A'}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataAccuracy ? (dataAccuracy * 100).toFixed(1) : 'N/A'}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confidence Interval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {confidenceInterval ? `${(confidenceInterval[0] * 100).toFixed(1)}% - ${(confidenceInterval[1] * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="time_series" value={selectedAnalysisType}>
            <TabsList>
              <TabsTrigger value="time_series">Time Series Analysis</TabsTrigger>
              <TabsTrigger value="regression">Regression Analysis</TabsTrigger>
              <TabsTrigger value="classification">Classification Analysis</TabsTrigger>
              <TabsTrigger value="clustering">Clustering Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="time_series">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Predictions vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dataPredictions}>
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
            </TabsContent>

            <TabsContent value="regression">
              <Card>
                <CardHeader>
                  <CardTitle>Regression Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={dataPredictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="actualValue" name="Actual" />
                        <YAxis dataKey="predictedValue" name="Predicted" />
                        <Tooltip />
                        <Legend />
                        <Scatter name="Predictions" data={dataPredictions} fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classification">
              <Card>
                <CardHeader>
                  <CardTitle>Classification Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataPredictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="actualValue" fill="#8884d8" name="Actual" />
                        <Bar dataKey="predictedValue" fill="#82ca9d" name="Predicted" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clustering">
              <Card>
                <CardHeader>
                  <CardTitle>Cluster Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dataPredictions}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="cluster"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {dataPredictions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        // Sales Manager Dashboard
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestSalesForecast?.predictedValue?.toLocaleString() ?? 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Confidence: {latestSalesForecast?.confidence ? (latestSalesForecast.confidence * 100).toFixed(1) : 'N/A'}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {salesAccuracy ? (salesAccuracy * 100).toFixed(1) : 'N/A'}%
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
                  <LineChart data={salesPredictions}>
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
                  <LineChart data={salesPredictions}>
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
        </>
      )}
    </div>
  )
}