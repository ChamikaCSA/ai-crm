import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

interface Trend {
  category: string
  value: number
  previousValue: number
  change: number
  recommendations: string[]
}

// GET /api/data-analyst/dashboard/trends - Get dashboard trends
export async function GET() {
  try {
    const response = await api.get<ApiResponse<Trend[]>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/dashboard/trends`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch dashboard trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard trends' },
      { status: 500 }
    )
  }
}