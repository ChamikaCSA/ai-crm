import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface Report {
  id: string
  name: string
  type: 'performance' | 'team' | 'pipeline' | 'forecasting'
  dateRange: {
    start: string
    end: string
  }
  format: 'pdf' | 'excel' | 'csv'
  status: 'generating' | 'ready' | 'failed'
  downloadUrl?: string
}

// GET /api/sales-manager/reports - Get all reports
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales-manager/reports`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch reports')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST /api/sales-manager/reports - Generate a new report
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales-manager/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to generate report')
    }

    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Failed to generate report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}