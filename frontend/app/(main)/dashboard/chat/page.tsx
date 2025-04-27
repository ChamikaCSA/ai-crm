'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Bot, User as UserIcon, Clock } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { ChatbotResponse } from '@/lib/api-types'
import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, messageVariants } from '@/lib/animations'
import { format } from 'date-fns'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const suggestedTopics = [
  'How can I track my order?',
  'What are your business hours?',
  'How do I update my profile?',
  'Tell me about your services',
]

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

  const handleSuggestedTopic = (topic: string) => {
    setInput(topic)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="h-[600px] flex flex-col bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      <Card className="h-[600px] flex flex-col bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
              Chat Support
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">
              Get help from our AI assistant
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Online</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" ref={messagesContainerRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-6">
                <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">Welcome to AI Support</p>
                  <p className="text-sm">How can I help you today?</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-xl">
                  {suggestedTopics.map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      className="text-sm text-left justify-start h-auto py-2 px-3 whitespace-normal break-words"
                      onClick={() => handleSuggestedTopic(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-start gap-2`}
                  >
                    {!message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-[var(--primary)]" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.isUser
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                          : 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                      }`}
                    >
                      {message.content}
                      </div>
                      <div className={`flex items-center gap-1 text-xs text-[var(--text-secondary)] ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <Clock className="w-3 h-3" />
                        <span>{format(message.timestamp, 'h:mm a')}</span>
                      </div>
                    </div>
                    {message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-[var(--primary)]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2"
              >
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
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)] transition-colors"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 group hover:scale-105 transition-all duration-200 hover:bg-[var(--primary)]/90"
            >
              <Send className="w-4 h-4 transition-transform group-hover:rotate-12" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}