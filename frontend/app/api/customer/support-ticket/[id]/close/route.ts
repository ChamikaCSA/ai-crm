import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const ticketId = params.id
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket/${ticketId}/close`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to close support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to close support ticket' },
      { status: 500 }
    )
  }
}