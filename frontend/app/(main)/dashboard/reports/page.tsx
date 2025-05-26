'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { addDays } from 'date-fns'
import { Download, FileText, FileSpreadsheet, FileBarChart, Database, BarChart2, LineChart, PieChart, AlertCircle } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

// Sales Manager Types
type SalesReport = {
  _id: string
  type: string
  format: string
  generatedAt: string
  fileContent?: {
    type: string
    data: number[]
  }
  fileSize?: number
  name: string
  parameters: {
    startDate: string
    endDate: string
    metrics: string[]
  }
  metadata: {
    processingTime: number
    recordCount: number
    salesMetrics: {
      totalRevenue: number
      averageDealSize: number
      winRate: number
      conversionRate: number
    }
  }
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
    filters?: Record<string, any>
    timeRange?: {
      start: string
      end: string
    }
  }
  metadata?: {
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
  fileContent?: {
    type: string
    data: number[]
  }
  fileSize?: number
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
        setDataReports(data || [])
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
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

        toast.success('Report generated successfully')
        await fetchReports()
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

        toast.success('Report generated successfully')
        await fetchReports()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to generate report')
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
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Report downloaded successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to download report')
    }
  }

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
              <p>Failed to load reports</p>
              <Button variant="outline" size="sm" onClick={fetchReports} className="group">
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
                {isDataAnalyst ? (
                  <>
                    <Database className="w-6 h-6 text-[var(--primary)]" />
                    Data Analysis Reports
                  </>
                ) : (
                  <>
                    <FileBarChart className="w-6 h-6 text-[var(--primary)]" />
                    Sales Reports
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                {isDataAnalyst
                  ? 'Generate and manage advanced data analysis reports'
                  : 'Generate and manage sales performance reports'}
              </CardDescription>
            </div>
            <Button onClick={handleGenerateReport} className="group">
              Generate Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4">
                {isDataAnalyst ? (
                  <>
                    <Select value={selectedDataType} onValueChange={(value: DataReportType) => setSelectedDataType(value)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer_analytics">Customer Analytics</SelectItem>
                        <SelectItem value="trend_analysis">Trend Analysis</SelectItem>
                        <SelectItem value="predictive_insights">Predictive Insights</SelectItem>
                        <SelectItem value="segmentation_analysis">Segmentation Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedVisualization} onValueChange={(value: VisualizationType) => setSelectedVisualization(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Visualization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="scatter">Scatter Plot</SelectItem>
                        <SelectItem value="heatmap">Heatmap</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Select value={selectedSalesType} onValueChange={(value: SalesReportType) => setSelectedSalesType(value)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales_performance">Sales Performance</SelectItem>
                        <SelectItem value="pipeline_analysis">Pipeline Analysis</SelectItem>
                        <SelectItem value="forecast_accuracy">Forecast Accuracy</SelectItem>
                        <SelectItem value="team_performance">Team Performance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedFormat} onValueChange={(value: ReportFormat) => setSelectedFormat(value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-[300px]"
                />
              </div>

              <div className="space-y-4">
                {(isDataAnalyst ? dataReports : salesReports)
                  .filter(report => report.fileContent || (isDataAnalyst && (report as DataReport).downloadUrl))
                  .map((report) => (
                  <motion.div
                    key={isDataAnalyst ? (report as DataReport).id : (report as SalesReport)._id}
                    variants={itemVariants}
                    className="flex items-center justify-between p-4 bg-[var(--card)] rounded-lg border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-4">
                      {isDataAnalyst ? (
                        <div className="flex items-center gap-2">
                          {(report as DataReport).visualization === 'bar' && <BarChart2 className="w-5 h-5 text-[var(--primary)]" />}
                          {(report as DataReport).visualization === 'line' && <LineChart className="w-5 h-5 text-[var(--primary)]" />}
                          {(report as DataReport).visualization === 'pie' && <PieChart className="w-5 h-5 text-[var(--primary)]" />}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {(report as SalesReport).format === 'pdf' && <FileText className="w-5 h-5 text-[var(--primary)]" />}
                          {(report as SalesReport).format === 'excel' && <FileSpreadsheet className="w-5 h-5 text-[var(--primary)]" />}
                          {(report as SalesReport).format === 'csv' && <FileBarChart className="w-5 h-5 text-[var(--primary)]" />}
                        </div>
                      )}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {isDataAnalyst
                            ? (report as DataReport).type?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Unknown Type'
                            : (report as SalesReport).name || (report as SalesReport).type?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Unknown Type'}
                          {isDataAnalyst && (
                            <Badge variant="secondary" className="text-xs">
                              {(report as DataReport).visualization?.charAt(0).toUpperCase() + (report as DataReport).visualization?.slice(1)} Chart
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          Generated {report.generatedAt ? format(new Date(report.generatedAt), 'MMM d, yyyy h:mm a') : 'Recently'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {(report.fileContent || (isDataAnalyst && (report as DataReport).downloadUrl)) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(isDataAnalyst ? (report as DataReport).id : (report as SalesReport)._id)}
                          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
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