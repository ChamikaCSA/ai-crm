'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { addDays } from 'date-fns'
import { Download, FileText, FileSpreadsheet, FileBarChart, Database, BarChart2, LineChart, PieChart } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { useAuth } from '@/contexts/AuthContext'

// Sales Manager Types
type SalesReport = {
  id: string
  type: string
  format: string
  generatedAt: string
  status: string
  downloadUrl?: string
}

type SalesReportType = 'sales_performance' | 'pipeline_analysis' | 'forecast_accuracy' | 'team_performance'
type ReportFormat = 'pdf' | 'excel' | 'csv'

// Data Analyst Types
type DataReport = {
  id: string
  type: string
  metrics: string[]
  generatedAt: string
  status: string
  downloadUrl?: string
  visualization: string
  drillDownLevel: number
  parameters: {
    metrics: string[]
    filters: Record<string, any>
    timeRange?: {
      start: Date
      end: Date
    }
    analysisDepth?: number
    confidenceThreshold?: number
    segmentSize?: number
  }
  metadata: {
    version: string
    generatedBy: string
    processingTime: number
    recordCount: number
    dataQuality?: {
      completeness: number
      accuracy: number
      consistency: number
    }
  }
}

type DataReportType = 'customer_analytics' | 'trend_analysis' | 'predictive_insights' | 'segmentation_analysis'
type VisualizationType = 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap'

export default function ReportsPage() {
  const { user } = useAuth()
  const isDataAnalyst = user?.role === 'data_analyst'

  // Sales Manager State
  const [salesReports, setSalesReports] = useState<SalesReport[]>([])
  const [selectedSalesType, setSelectedSalesType] = useState<SalesReportType>('sales_performance')
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  // Data Analyst State
  const [dataReports, setDataReports] = useState<DataReport[]>([])
  const [selectedDataType, setSelectedDataType] = useState<DataReportType>('customer_analytics')
  const [selectedVisualization, setSelectedVisualization] = useState<VisualizationType>('bar')
  const [drillDownLevel, setDrillDownLevel] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError(null)

        if (isDataAnalyst) {
          const response = await fetch('/api/data-analyst/reports')
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to fetch reports')
          }
          const data = await response.json()
          setDataReports(data.data || [])
        } else {
        const response = await fetch('/api/sales-manager/reports')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch reports')
        }
        const data = await response.json()
          setSalesReports(data.data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [isDataAnalyst])

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      setError(null)

      if (isDataAnalyst) {
        const response = await fetch('/api/data-analyst/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: selectedDataType,
            visualization: selectedVisualization,
            drillDownLevel,
            parameters: {
              metrics: ['customer_count', 'revenue', 'engagement'],
              filters: {},
              timeRange: {
                start: dateRange.from,
                end: dateRange.to,
              },
            },
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate report')
        }

        const data = await response.json()
        setDataReports(prevReports => [data, ...prevReports])
      } else {
      const response = await fetch('/api/sales-manager/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: selectedSalesType,
          format: selectedFormat,
          startDate: dateRange.from,
          endDate: dateRange.to,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate report')
      }

      const { data } = await response.json()
        setSalesReports(prevReports => [data, ...prevReports])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (reportId: string) => {
    try {
      const endpoint = isDataAnalyst ? '/api/data-analyst/reports' : '/api/sales-manager/reports'
      const response = await fetch(`${endpoint}/${reportId}/download`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download report')
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `report-${reportId}`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (loading && (salesReports.length === 0 && dataReports.length === 0)) return <div>Loading reports...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button onClick={handleGenerateReport} disabled={loading}>
          Generate Report
        </Button>
      </div>

      {isDataAnalyst ? (
        // Data Analyst Report Generation Form
        <Card>
          <CardHeader>
            <CardTitle>Generate Data Analysis Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select value={selectedDataType} onValueChange={(value: DataReportType) => setSelectedDataType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_analytics">Customer Analytics</SelectItem>
                    <SelectItem value="trend_analysis">Trend Analysis</SelectItem>
                    <SelectItem value="predictive_insights">Predictive Insights</SelectItem>
                    <SelectItem value="segmentation_analysis">Segmentation Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Visualization Type</label>
                <Select value={selectedVisualization} onValueChange={(value: VisualizationType) => setSelectedVisualization(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visualization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                    <SelectItem value="heatmap">Heat Map</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Drill-down Level</label>
                <Select value={drillDownLevel.toString()} onValueChange={(value) => setDrillDownLevel(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Overview</SelectItem>
                    <SelectItem value="1">Detailed</SelectItem>
                    <SelectItem value="2">Granular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Sales Manager Report Generation Form
      <Card>
        <CardHeader>
            <CardTitle>Generate Sales Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Report Type</label>
                <Select value={selectedSalesType} onValueChange={(value: SalesReportType) => setSelectedSalesType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales_performance">Sales Performance</SelectItem>
                  <SelectItem value="pipeline_analysis">Pipeline Analysis</SelectItem>
                  <SelectItem value="forecast_accuracy">Forecast Accuracy</SelectItem>
                  <SelectItem value="team_performance">Team Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Format</label>
              <Select value={selectedFormat} onValueChange={(value: ReportFormat) => setSelectedFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isDataAnalyst ? (
              // Data Analyst Reports List
              dataReports.length > 0 ? (
                <div className="space-y-4">
                  {dataReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Database className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium capitalize">
                            {report.type.replace(/_/g, ' ')}
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Visualization: {report.visualization}</p>
                            <p>Generated on {new Date(report.generatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          Level {report.drillDownLevel}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report.id)}
                          disabled={!report.downloadUrl}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No reports generated yet
                </div>
              )
            ) : (
              // Sales Manager Reports List
              salesReports.length > 0 ? (
                salesReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <FileBarChart className="h-5 w-5" />
                      <div>
                        <h3 className="font-medium capitalize">
                          {report.type.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Generated on {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground uppercase">
                        {report.format}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(report.id)}
                        disabled={!report.downloadUrl}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No reports generated yet
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}