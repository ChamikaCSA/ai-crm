import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET /api/data-analyst/dashboard/configs - Get all dashboard configurations
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/dashboard/configs`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) throw new Error('Failed to fetch dashboard configurations')
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch dashboard configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard configurations' },
      { status: 500 }
    )
  }
}

// POST /api/data-analyst/dashboard/configs - Create a new dashboard configuration
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    const data = await request.json()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/dashboard/configs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    )

    if (!response.ok) throw new Error('Failed to create dashboard configuration')
    const responseData = await response.json()

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Failed to create dashboard configuration:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard configuration' },
      { status: 500 }
    )
  }
}