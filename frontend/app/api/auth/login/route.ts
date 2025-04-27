import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Set the refresh token cookie regardless of MFA status
    const cookieStore = await cookies()
    cookieStore.set('refresh_token', data.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // If MFA is required, return the response without setting the access token
    if (data.data.user.isMfaEnabled) {
      return NextResponse.json({
        ...data.data,
        requiresMfa: true
      })
    }

    // If MFA is not required, set the access token cookie and return the response
    cookieStore.set('token', data.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 15, // 15 minutes
    })

    return NextResponse.json({
      ...data.data,
      requiresMfa: false
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}