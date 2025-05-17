import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
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
      `${process.env.NEXT_PUBLIC_API_URL}/customer/support-ticket/attachment/${params.filename}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch attachment')
    }

    const blob = await response.blob()
    const headers = new Headers()
    headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream')
    headers.set('Content-Disposition', response.headers.get('content-disposition') || `attachment; filename="${params.filename}"`)

    return new NextResponse(blob, { headers })
  } catch (error) {
    console.error('Failed to fetch attachment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachment' },
      { status: 500 }
    )
  }
}