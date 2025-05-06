'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/strings'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { Moon, Sun, Sparkles, User, Settings, HelpCircle, LogOut, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProfilePicture } from '@/components/profile-picture'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

export function Header() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fullName = user ? `${user.firstName} ${user.lastName}` : ''

  return (
    <nav className={cn(
      "sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md transition-all duration-200",
      isScrolled ? "shadow-md" : "shadow-sm"
    )}>
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
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full hover:bg-[var(--accent)] transition-colors group"
                    >
                      <ProfilePicture user={user} size="sm" className="group-hover:ring-2 group-hover:ring-[var(--primary)] transition-all" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 shadow-lg rounded-lg border border-[var(--border)]"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{fullName}</p>
                        <p className="text-xs leading-none text-[var(--text-tertiary)]">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/account" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/support" className="flex items-center gap-2 cursor-pointer">
                        <HelpCircle className="w-4 h-4" />
                        Help & Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/contact" className="flex items-center gap-2 cursor-pointer">
                        <Mail className="w-4 h-4" />
                        Contact Us
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="flex items-center justify-between px-2 py-2 hover:bg-[var(--accent)] transition-colors rounded-md cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-4 h-4">
                          {mounted ? (
                            <>
                              <Sun className={cn(
                                "w-4 h-4 text-[var(--text-primary)] absolute transition-all duration-300",
                                theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                              )} />
                              <Moon className={cn(
                                "w-4 h-4 text-[var(--text-primary)] absolute transition-all duration-300",
                                theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                              )} />
                            </>
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Theme</span>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {mounted ? (theme === 'light' ? 'Light Mode' : 'Dark Mode') : 'Loading...'}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={mounted && theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        className="data-[state=checked]:bg-[var(--primary)]"
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
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