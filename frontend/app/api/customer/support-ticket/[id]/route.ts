import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse, SupportTicket } from '@/lib/api-types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.get<ApiResponse<SupportTicket>>(`${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket/${params.id}`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support ticket' },
      { status: 500 }
    )
  }
}