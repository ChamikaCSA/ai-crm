'use client';

import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User as UserIcon, Clock, X, ExternalLink, HelpCircle, Settings, Home, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { interactionService } from '@/lib/interaction-service';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { containerVariants, messageVariants } from '@/lib/animations';
import Link from 'next/link';

type SectionType = 'overview' | 'support' | 'account' | 'settings';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    type: SectionType;
    section: string;
  };
}

interface ChatbotResponse {
  response: string;
  metadata?: {
    type: SectionType;
    section: string;
  };
  sessionId: string;
}

const suggestedTopics = [
  'How do I get started with the CRM?',
  'I need help with my account',
  'Can you explain the main features?',
  'How do I contact support?',
];

const markdownComponents: Components = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
};

const processAIResponse = (response: string, metadata?: { type: SectionType; section: string }): string => {
  // Remove any existing metadata from the response
  const cleanResponse = response.replace(/\[Type:.*?Section:.*?\]/g, '').trim();
  return cleanResponse;
};

const getSectionIcon = (type?: string) => {
  switch (type) {
    case 'overview':
      return Home;
    case 'support':
      return Headphones;
    case 'account':
      return UserIcon;
    case 'settings':
      return Settings;
    default:
      return null;
  }
};

export function ChatDialog() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = (smooth = true) => {
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    if (open) {
      // Immediate scroll to bottom when opening
      scrollToBottom(false);
    }
  }, [open]);

  useEffect(() => {
    // Smooth scroll for new messages and typing indicator
    scrollToBottom(true);
  }, [messages, isTyping]);

  if (user?.role !== "customer") return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await api.post<ChatbotResponse>('/api/customer/chatbot', {
        message: userMessage.content,
        chatHistory
      });

      // Track chat interaction
      if (user) {
        await interactionService.trackChat(userMessage.content, response.sessionId);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        isUser: false,
        timestamp: new Date(),
        metadata: response.metadata
      };

      // First remove typing indicator
      setIsTyping(false);
      // Then add the new message after a small delay
      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
      }, 100);
    } catch (error) {
      console.error('Failed to get response from chatbot:', error);
      toast.error('Failed to get response from chatbot');
      setIsTyping(false);
    }
  };

  const handleSuggestedTopic = (topic: string) => {
    setInput(topic);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="default"
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </motion.div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.5
              }}
              className="fixed bottom-24 right-8 w-[600px] h-[600px] bg-[var(--card)] rounded-lg shadow-xl border border-[var(--border)] flex flex-col z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
                    <h2 className="text-xl font-bold">Chat Support</h2>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Get help from our AI assistant
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Online</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[var(--accent)]/10"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
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
                                <>
                                  <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown components={markdownComponents}>
                                      {processAIResponse(message.content)}
                                    </ReactMarkdown>
                                  </div>
                                  {message.metadata?.type && message.metadata?.section && (
                                    <div className="mt-2">
                                      <Link href={`/dashboard/${message.metadata.type}`}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                          <ExternalLink className="h-4 w-4" />
                                          Go to {message.metadata.section}
                                        </Button>
                                      </Link>
                                    </div>
                                  )}
                                </>
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
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-2"
                        >
                          <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-[var(--primary)]" />
                          </div>
                          <div className="flex gap-1.5 px-4 py-2.5 bg-[var(--accent)] rounded-lg shadow-sm">
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                ease: "easeInOut"
                              }}
                              className="w-2 h-2 rounded-full bg-[var(--accent-foreground)]"
                            />
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                delay: 0.2,
                                ease: "easeInOut"
                              }}
                              className="w-2 h-2 rounded-full bg-[var(--accent-foreground)]"
                            />
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                delay: 0.4,
                                ease: "easeInOut"
                              }}
                              className="w-2 h-2 rounded-full bg-[var(--accent-foreground)]"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t border-[var(--border)]">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)] transition-colors placeholder:text-[var(--text-tertiary)] focus:placeholder:text-[var(--text-secondary)]"
                />
                <Button
                  type="submit"
                  disabled={!input.trim()}
                  className="shrink-0 group hover:scale-105 transition-all duration-200 hover:bg-[var(--primary)]/90"
                >
                  <Send className="w-4 h-4 transition-transform group-hover:rotate-12" />
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}