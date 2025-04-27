import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      )
    }

    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: apiResponse.status }
      )
    }

    const { access_token, refresh_token } = await apiResponse.json()

    // Set the new tokens in cookies
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    }

    const nextResponse = NextResponse.json({ success: true })
    nextResponse.cookies.set('token', access_token, { ...cookieOptions, maxAge: 900 }) // 15 minutes
    nextResponse.cookies.set('refresh_token', refresh_token, { ...cookieOptions, maxAge: 604800 }) // 7 days

    return nextResponse
  } catch (error) {
    console.error('Token refresh failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}