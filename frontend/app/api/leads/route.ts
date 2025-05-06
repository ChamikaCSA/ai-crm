import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

// GET /api/leads - Get all leads
export async function GET() {
  try {
    const response = await api.get<ApiResponse<any[]>>(`${process.env.NEXT_PUBLIC_API_URL}/leads`)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const response = await api.post<ApiResponse<any>>(`${process.env.NEXT_PUBLIC_API_URL}/leads`, data)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to create lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}

// DELETE /api/leads - Delete a lead
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/leads/${id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete lead:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}