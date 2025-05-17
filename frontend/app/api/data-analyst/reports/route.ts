import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'
import { cookies } from 'next/headers'

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

// GET /api/data-analyst/reports - Get all reports
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const response = await api.get<ApiResponse<Report[]>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/reports`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST /api/data-analyst/reports - Generate a new report
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const response = await api.post<ApiResponse<Report>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/reports`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to generate report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}