import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'
import { cookies } from 'next/headers'

interface Trend {
  id: string
  name: string
  value: number
  change: number
  recommendations: string[]
}

// GET /api/data-analyst/dashboard/trends - Get dashboard trends
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

    const response = await api.get<ApiResponse<Trend[]>>(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/dashboard/trends`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
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