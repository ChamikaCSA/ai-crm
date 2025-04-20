'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/strings'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { Moon, Sun, Sparkles, ArrowRight } from 'lucide-react'

interface NavigationProps {
  session: { user: { id: string; name?: string; email?: string } | null } | null
}

export function Navigation({ session }: NavigationProps) {
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2 text-xl font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
            >
              <Sparkles className="w-5 h-5 text-[var(--primary)] group-hover:rotate-12 transition-transform" />
              {APP_NAME}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="hover:bg-[var(--accent)] transition-colors group"
            >
              {theme === 'light' ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            {session?.user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full hover:bg-[var(--accent)] transition-colors group"
                    >
                      <Avatar className="h-8 w-8 group-hover:ring-2 group-hover:ring-[var(--primary)] transition-all">
                        <AvatarImage src={`https://avatar.vercel.sh/${session.user.email}`} alt={session.user.name || ''} />
                        <AvatarFallback className="text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {session.user.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 shadow-lg rounded-lg border border-[var(--border)]"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuItem
                      onClick={logout}
                      className="hover:bg-[var(--accent)] transition-colors cursor-pointer"
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="hover:bg-[var(--accent)] transition-colors"
                >
                  <Link href="/auth/login" className="text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors">
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="btn-primary shadow-sm hover:shadow-md transition-all group"
                >
                  <Link
                    href="/auth/register"
                    className="text-[var(--primary-foreground)] flex items-center gap-2"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}