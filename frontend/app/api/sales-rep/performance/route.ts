import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { PerformanceDataApiResponse } from '@/lib/api-types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'this_month'

    const response = await api.get<PerformanceDataApiResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales-rep/performance?period=${period}`
    )

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch performance data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}