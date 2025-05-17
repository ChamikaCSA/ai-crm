import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET /api/sales-rep/leads/[id] - Get a specific lead
export async function GET(
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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales-rep/leads/${params.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch lead')
    }

    const data = await response.json()
    return NextResponse.json(data)
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
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales-rep/leads/${params.id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update lead')
    }

    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Failed to update lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

// PATCH /api/sales-rep/leads/[id]/status - Update lead status
export async function PATCH(
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

    const data = await request.json()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales-rep/leads/${params.id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update lead status')
    }

    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Failed to update lead status:', error)
    return NextResponse.json(
      { error: 'Failed to update lead status' },
      { status: 500 }
    )
  }
}