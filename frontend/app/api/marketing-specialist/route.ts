import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketing-specialist/dashboard/overview`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch marketing dashboard overview')
    }
    const data = await response.json()

    return NextResponse.json(data.data.data)
  } catch (error) {
    console.error('Error fetching marketing dashboard overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketing dashboard overview' },
      { status: 500 }
    )
  }
}