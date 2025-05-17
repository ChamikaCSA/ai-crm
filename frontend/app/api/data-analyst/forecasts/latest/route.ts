import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

interface Forecast {
  id: string
  metric: 'customer_lifetime_value' | 'churn_rate' | 'market_trends' | 'customer_segments'
  analysisType: 'time_series' | 'regression' | 'classification' | 'clustering'
  predictedValue: number
  actualValue?: number
  confidence: number
  confidenceInterval: [number, number]
  metadata: {
    modelVersion: string
    features: string[]
    parameters: Record<string, any>
    accuracy: number
    mae?: number
    mape?: number
  }
  timestamp: string
}

// GET /api/data-analyst/forecasts/latest - Get latest forecasts for each metric
export async function GET() {
  try {
    const response = await api.get<ApiResponse<Record<string, Forecast>>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/forecasts/latest`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch latest forecasts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest forecasts' },
      { status: 500 }
    )
  }
}