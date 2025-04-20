import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })

    if (!registerResponse.ok) {
      const error = await registerResponse.json()
      return NextResponse.json(
        { error: error.message || 'Registration failed' },
        { status: registerResponse.status }
      )
    }

    const registerData = await registerResponse.json()

    if (!registerData.data) {
      return NextResponse.json(
        { error: 'Invalid registration response' },
        { status: 500 }
      )
    }

    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!loginResponse.ok) {
      const error = await loginResponse.json()
      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: loginResponse.status }
      )
    }

    const loginData = await loginResponse.json()

    if (!loginData.data || !loginData.data.access_token) {
      return NextResponse.json(
        { error: 'Invalid login response' },
        { status: 500 }
      )
    }

    // Set the token cookie
    const cookieStore = await cookies()
    cookieStore.set('token', loginData.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json(loginData.data)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}