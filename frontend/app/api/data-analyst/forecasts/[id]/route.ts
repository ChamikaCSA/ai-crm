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

// GET /api/data-analyst/forecasts/[id] - Get a specific forecast
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.get<ApiResponse<Forecast>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/forecasts/${params.id}`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch forecast:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forecast' },
      { status: 500 }
    )
  }
}

// DELETE /api/data-analyst/forecasts/[id] - Delete a forecast
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.delete<ApiResponse<void>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/forecasts/${params.id}`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to delete forecast:', error)
    return NextResponse.json(
      { error: 'Failed to delete forecast' },
      { status: 500 }
    )
  }
}