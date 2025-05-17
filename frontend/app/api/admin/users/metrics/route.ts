import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/metrics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user metrics')
    }

    const data = await response.json()
    return NextResponse.json(data.data)
  } catch (error) {
    console.error('Error fetching user metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}