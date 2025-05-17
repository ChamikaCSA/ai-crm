import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET /api/data-analyst/dashboard/trends/export - Export trends data as CSV
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/data-analyst/dashboard/trends/export`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) throw new Error('Failed to export data')
    const data = await response.blob()

    return new NextResponse(data, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=trends-data.csv'
      }
    })
  } catch (error) {
    console.error('Failed to export trends data:', error)
    return NextResponse.json(
      { error: 'Failed to export trends data' },
      { status: 500 }
    )
  }
}