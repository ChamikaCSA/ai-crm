import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse, SupportTicket } from '@/lib/api-types'

export async function GET() {
  try {
    const response = await api.get<ApiResponse<SupportTicket[]>>(`${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch support tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await api.post<ApiResponse<SupportTicket>>(`${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket`, body)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to create support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}