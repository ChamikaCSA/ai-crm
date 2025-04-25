import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { api } from '@/lib/api-client'

interface MfaGenerateResponse {
  data: {
    secret: string
  }
}

interface MfaEnableResponse {
  data: {
    success: boolean
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const response = await api.get<MfaGenerateResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/generate`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error generating MFA secret:', error)
    return NextResponse.json(
      { error: 'Failed to generate MFA secret' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token: mfaToken, action } = body

    if (action === 'disable') {
      try {
        const response = await api.post<MfaEnableResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/disable`, {})
        return NextResponse.json(response.data)
      } catch (apiError) {
        console.error('Error disabling MFA:', apiError)
        throw apiError
      }
    }

    if (!mfaToken) {
      return NextResponse.json(
        { error: 'MFA token is required' },
        { status: 400 }
      )
    }

    const response = await api.post<MfaEnableResponse>(`${process.env.NEXT_PUBLIC_API_URL}/auth/mfa/enable`, { token: mfaToken })
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error in MFA operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform MFA operation' },
      { status: 500 }
    )
  }
}