'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
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
import { containerVariants, messageVariants } from '@/lib/animations'
import { format } from 'date-fns'
import { interactionService } from '@/lib/interaction-service'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const suggestedTopics = [
  'How do I get started with the CRM?',
  'I need help with my account',
  'Can you explain the main features?',
  'How do I contact support?',
]

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  if (!user) {
    redirect('/auth/login')
  }

  const scrollToBottom = () => {
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]')
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await api.post<ChatbotResponse>('/api/customer/chatbot', {
        message: userMessage.content,
        chatHistory
      })

      // Track chat interaction
      await interactionService.trackChat(userMessage.content, response.sessionId)

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
    }
  }

  const handleSuggestedTopic = (topic: string) => {
    setInput(topic)
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
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 mb-4 pr-2">
            <div className="space-y-4">
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
                      <div className="flex flex-col gap-1 max-w-[80%]">
                        <div
                          className={`rounded-lg px-4 py-2 break-words ${
                            message.isUser
                              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                              : 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                          }`}
                        >
                          {message.isUser ? (
                            message.content
                          ) : (
                            <ReactMarkdown
                              components={{
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                              } as Components}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
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
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)] transition-colors"
            />
            <Button
              type="submit"
              disabled={!input.trim()}
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