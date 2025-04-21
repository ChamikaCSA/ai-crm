import { NextResponse } from 'next/server'

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}