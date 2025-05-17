import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'
import { cookies } from 'next/headers'

// GET /api/data-analyst/forecasts/accuracy - Get forecast accuracy metrics
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

    const response = await api.get<ApiResponse<Record<string, number>>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/forecasts/accuracy`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch forecast accuracy:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forecast accuracy' },
      { status: 500 }
    )
  }
}