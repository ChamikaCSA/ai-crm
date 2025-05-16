import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const metric = searchParams.get('metric')
    const type = searchParams.get('type') // 'latest' or 'accuracy'

    if (!metric) {
      return NextResponse.json(
        { error: 'Metric parameter is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/sales-manager/forecasts`
    if (type === 'latest') {
      endpoint += `/latest/${metric}`
    } else if (type === 'accuracy') {
      endpoint += `/accuracy/${metric}`
    } else {
      endpoint += `?metric=${metric}`
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching forecasting data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch forecasting data' },
      { status: 500 }
    )
  }
}