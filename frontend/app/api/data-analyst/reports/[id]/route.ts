import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

interface Report {
  id: string
  name: string
  type: 'customer_analytics' | 'trend_analysis' | 'predictive_insights' | 'segmentation_analysis'
  visualization: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap'
  drillDownLevel: number
  parameters: {
    metrics: string[]
    filters: Record<string, any>
    timeRange?: {
      start: string
      end: string
    }
  }
  generatedAt: string
  expiresAt: string
  metadata: {
    generatedBy: string
    processingTime: number
    recordCount: number
    confidenceScore?: number
  }
}

// GET /api/data-analyst/reports/[id] - Get a specific report
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.get<ApiResponse<Report>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/reports/${params.id}`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}

// DELETE /api/data-analyst/reports/[id] - Delete a report
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.delete<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/reports/${params.id}`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to delete report:', error)
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    )
  }
}