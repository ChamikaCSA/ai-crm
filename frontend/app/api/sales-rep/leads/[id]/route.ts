import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { ApiResponse } from '@/lib/api-types'

// GET /api/sales-rep/leads/[id] - Get a specific lead
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await api.get<ApiResponse<any>>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales-rep/leads/${params.id}`
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to fetch lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

// PUT /api/sales-rep/leads/[id] - Update a lead
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const response = await api.put<ApiResponse<any>>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales-rep/leads/${params.id}`,
      data
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to update lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

// PUT /api/sales-rep/leads/[id]/status - Update lead status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const response = await api.put<ApiResponse<any>>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales-rep/leads/${params.id}/status`,
      data
    )
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Failed to update lead status:', error)
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    )
  }
}