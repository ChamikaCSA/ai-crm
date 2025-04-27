import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api-client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id
    const contentType = request.headers.get('content-type') || ''

    let data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      data = formData
    } else {
      data = await request.json()
    }

    const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket/${ticketId}/reply`, data)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Frontend API Route - Error details:', error)
    return NextResponse.json(
      { error: 'Failed to add ticket reply' },
      { status: 500 }
    )
  }
}