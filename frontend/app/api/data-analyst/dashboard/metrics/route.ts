import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

interface Metric {
  name: string
  value: number
  trend: number
  change: number
  target: number
  category: string
  description: string
  lastUpdated: string
  forecast: {
    value: number
    confidence: number
    upperBound: number
    lowerBound: number
  }
}

// GET /api/data-analyst/dashboard/metrics - Get dashboard metrics
export async function GET() {
  try {
    const response = await api.get<ApiResponse<Metric[]>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/dashboard/metrics`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    )
  }
}