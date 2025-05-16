'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns'
import { Download, FileText, FileSpreadsheet, FileBarChart } from 'lucide-react'
import { DateRange } from 'react-day-picker'

type Report = {
  id: string
  type: string
  format: string
  generatedAt: string
  status: string
  downloadUrl?: string
}

type ReportType = 'sales_performance' | 'pipeline_analysis' | 'forecast_accuracy' | 'team_performance'
type ReportFormat = 'pdf' | 'excel' | 'csv'

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ReportType>('sales_performance')
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/sales-manager/reports')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch reports')
        }
        const data = await response.json()
        setReports(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/sales-manager/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
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
      setReports(prevReports => [data, ...prevReports])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (reportId: string) => {
    try {
      const response = await fetch(`/api/sales-manager/reports/${reportId}/download`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download report')
      }

      // Get the filename from the Content-Disposition header
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

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'sales_performance':
        return <FileBarChart className="h-5 w-5" />
      case 'pipeline_analysis':
        return <FileSpreadsheet className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  if (loading && reports.length === 0) return <div>Loading reports...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button onClick={handleGenerateReport} disabled={loading}>
          Generate Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select value={selectedType} onValueChange={(value: ReportType) => setSelectedType(value)}>
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

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports && reports.length > 0 ? (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getReportTypeIcon(report.type)}
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}