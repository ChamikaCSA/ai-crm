import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id
    const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket/${ticketId}/close`, {})
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to close support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to close support ticket' },
      { status: 500 }
    )
  }
}