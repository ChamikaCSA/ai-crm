import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

interface OverviewData {
  summary: {
    totalReports: number
    recentReports: number
    averageForecastAccuracy: number
    dataPointsProcessed: number
    growthRate: number
  }
  topMetrics: Array<{
    name: string
    value: number
    trend: string
    change: number
  }>
  significantTrends: Array<{
    category: string
    value: number
    previousValue: number
    change: number
    recommendations: string[]
  }>
  latestForecasts: Array<{
    metric: string
    predictedValue: number
    confidence: number
    timestamp: string
  }>
  recentReports: Array<{
    id: string
    type: string
    generatedAt: string
    visualization: string
  }>
}

// GET /api/data-analyst/dashboard/overview - Get dashboard overview data
export async function GET() {
  try {
    const response = await api.get<ApiResponse<OverviewData>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/dashboard/overview`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch dashboard overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard overview' },
      { status: 500 }
    )
  }
}