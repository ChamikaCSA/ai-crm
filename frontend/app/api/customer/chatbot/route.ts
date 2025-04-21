import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '@/lib/api-client';

interface ChatbotResponse {
  data: {
    response: string;
    sessionId: string;
  };
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call the backend API
    const response = await api.post<ChatbotResponse>(`${process.env.NEXT_PUBLIC_API_URL}/customer/chatbot`, {
      message,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    console.error('Error details:', {
      status: error.status,
      message: error.message,
      response: error.response?.data
    });

    // Handle specific error cases
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.status === 403) {
      return NextResponse.json(
        { error: 'You do not have permission to use the chatbot' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}