import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketing-specialist/sentiment`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch sentiment analysis')
    }

    const data = await response.json()
    return NextResponse.json(data.data.data)
  } catch (error) {
    console.error('Error fetching sentiment analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment analysis' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketing-specialist/sentiment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Failed to analyze sentiment')
    }

    const data = await response.json()
    return NextResponse.json(data.data.data)
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    )
  }
}