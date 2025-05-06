import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

// PUT /api/leads/[id]/status - Update lead status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const response = await api.put<ApiResponse<any>>(`${process.env.NEXT_PUBLIC_API_URL}/leads/${params.id}/status`, data)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to update lead status:', error)
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    )
  }
}