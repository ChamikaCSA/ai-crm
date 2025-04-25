'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Bot, User as UserIcon } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { ChatbotResponse } from '@/lib/api-types'
import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  if (!user) {
    redirect('/auth/login')
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await api.post<ChatbotResponse>('/api/customer/chatbot', {
        message: userMessage.content,
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Failed to get response from chatbot:', error)
      toast.error('Failed to get response from chatbot')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="h-[500px] flex flex-col bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
            Chat Support
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" ref={messagesContainerRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-4">
                <Bot className="w-12 h-12 text-[var(--primary)]/50" />
                <p>Start a conversation with our AI support assistant</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-start gap-2`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.isUser
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.isUser && (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div className="bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-foreground)]/50 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-foreground)]/50 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-foreground)]/50 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}