import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'
import { cookies } from 'next/headers'

interface ApiResponse {
  success: boolean
  data: {
    campaigns: {
      active: number
      total: number
      metrics: {
        totalReach: number
        totalEngagement: number
        totalConversion: number
        totalRetention: number
      }
    }
    segments: {
      total: number
      byType: Array<{ _id: string; count: number }>
    }
    sentiment: {
      distribution: Array<{ _id: string; count: number; averageScore: number }>
      recentAnalyses: Array<{
        source: string
        sentiment: string
        score: number
        createdAt: string
      }>
    }
    recentActivity: {
      campaigns: Array<{
        name: string
        status: string
        createdAt: string
        metrics: {
          reach: number
          engagement: number
          conversion: number
        }
      }>
      segments: Array<{
        name: string
        type: string
        createdAt: string
      }>
      sentiments: Array<{
        source: string
        sentiment: string
        score: number
        createdAt: string
      }>
    }
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketing-specialist/dashboard/overview`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch marketing dashboard overview')
    }

    const responseData = await response.json()

    const data: ApiResponse = {
      success: true,
      data: {
        campaigns: {
          active: responseData.data?.campaigns?.active || 0,
          total: responseData.data?.campaigns?.total || 0,
          metrics: {
            totalReach: responseData.data?.campaigns?.metrics?.totalReach || 0,
            totalEngagement: responseData.data?.campaigns?.metrics?.totalEngagement || 0,
            totalConversion: responseData.data?.campaigns?.metrics?.totalConversion || 0,
            totalRetention: responseData.data?.campaigns?.metrics?.totalRetention || 0,
          }
        },
        segments: {
          total: responseData.data?.segments?.total || 0,
          byType: responseData.data?.segments?.byType || []
        },
        sentiment: {
          distribution: responseData.data?.sentiment?.distribution || [],
          recentAnalyses: responseData.data?.sentiment?.recentAnalyses || []
        },
        recentActivity: {
          campaigns: responseData.data?.recentActivity?.campaigns || [],
          segments: responseData.data?.recentActivity?.segments || [],
          sentiments: responseData.data?.recentActivity?.sentiments || []
        }
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching marketing dashboard overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketing dashboard overview' },
      { status: 500 }
    )
  }
}