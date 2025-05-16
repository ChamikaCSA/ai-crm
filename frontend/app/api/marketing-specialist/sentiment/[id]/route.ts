import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketing-specialist/sentiment/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete sentiment analysis')
    }

    return NextResponse.json({ message: 'Sentiment analysis deleted successfully' })
  } catch (error) {
    console.error('Error deleting sentiment analysis:', error)
    return NextResponse.json(
      { error: 'Failed to delete sentiment analysis' },
      { status: 500 }
    )
  }
}