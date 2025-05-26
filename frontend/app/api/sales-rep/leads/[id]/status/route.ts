import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// PUT /api/sales-rep/leads/[id]/status - Update lead status
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

    const body = await request.json()
    const { status } = body

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/sales-rep/leads/${params.id}/status`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update lead status')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to update lead status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update lead status' },
      { status: 500 }
    )
  }
}