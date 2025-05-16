import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse, SalesPipeline } from '@/lib/api-types'

export async function GET() {
  try {
    const response = await api.get<ApiResponse<SalesPipeline[]>>(
      `${process.env.NEXT_PUBLIC_API_URL}/sales-manager/pipeline`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch pipeline data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pipeline data' },
      { status: 500 }
    )
  }
}