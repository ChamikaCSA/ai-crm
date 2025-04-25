import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'MFA token is required' },
        { status: 400 }
      )
    }

    // Get the refresh token from cookies
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Make the verification request to the backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('MFA verification error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to verify MFA token' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('MFA verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify MFA token' },
      { status: 500 }
    )
  }
}