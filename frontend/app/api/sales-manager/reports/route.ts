import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

interface Report {
  id: string
  name: string
  type: 'performance' | 'team' | 'pipeline' | 'forecasting'
  dateRange: {
    start: string
    end: string
  }
  format: 'pdf' | 'excel' | 'csv'
  status: 'generating' | 'ready' | 'failed'
  downloadUrl?: string
}

// GET /api/sales-manager/reports - Get all reports
export async function GET() {
  try {
    const response = await api.get<ApiResponse<Report[]>>(
      `${process.env.NEXT_PUBLIC_API_URL}/sales-manager/reports`
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

// POST /api/sales-manager/reports - Generate a new report
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const response = await api.post<ApiResponse<Report>>(
      `${process.env.NEXT_PUBLIC_API_URL}/sales-manager/reports`,
      data
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