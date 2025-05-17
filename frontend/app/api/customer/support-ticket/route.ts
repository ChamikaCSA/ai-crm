import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse, SupportTicket } from '@/lib/api-types'
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await api.get<ApiResponse<SupportTicket[]>>(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch support tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''

    let data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      data = formData
    } else {
      data = await request.json()
    }

    const response = await api.post<ApiResponse<SupportTicket>>(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket`,
      data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Frontend API Route - Error details:', error)
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}