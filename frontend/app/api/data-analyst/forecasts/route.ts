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

// GET /api/data-analyst/forecasts - Get all forecasts
export async function GET() {
  try {
    const response = await api.get<ApiResponse<Forecast[]>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/forecasts`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch forecasts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forecasts' },
      { status: 500 }
    )
  }
}

// POST /api/data-analyst/forecasts - Create a new forecast
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const response = await api.post<ApiResponse<Forecast>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/forecasts`,
      data
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to create forecast:', error)
    return NextResponse.json(
      { error: 'Failed to create forecast' },
      { status: 500 }
    )
  }
}