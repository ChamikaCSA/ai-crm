import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Header } from '@/components/Header'
import { APP_NAME } from '@/strings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ClipboardList, BarChart3, ArrowRight, Sparkles, CheckCircle2, Star } from 'lucide-react'
import Image from 'next/image'

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="flex-1">
      <Header session={session} />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 via-transparent to-[var(--accent)]/20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered CRM Platform</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-[var(--text-primary)] animate-fade-in">
              {session?.user ? `Welcome to ${APP_NAME}` : 'Transform Your Customer Relationships'}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-tertiary)] mb-8 max-w-2xl mx-auto animate-fade-in">
              {session?.user
                ? 'Start managing your customer relationships with our AI-powered tools.'
                : 'AI-powered CRM to help you manage leads, automate tasks, and grow your business.'
              }
            </p>
            {session?.user ? (
              <Button size="lg" asChild className="btn-primary shadow-lg hover:shadow-xl transition-all animate-float">
                <Link href="/dashboard" className="flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="btn-primary shadow-lg hover:shadow-xl transition-all animate-float">
                <Link href="/auth/register" className="flex items-center gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[var(--accent)]/50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Powerful Features</h2>
            <p className="text-xl text-[var(--text-tertiary)] max-w-2xl mx-auto">
              Everything you need to manage your customer relationships effectively
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card shadow-lg hover:shadow-xl transition-all animate-slide-up group">
              <CardHeader>
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--text-primary)]">Lead Management</CardTitle>
                <CardDescription className="text-lg text-[var(--text-tertiary)]">
                  Track and nurture leads with our intuitive interface and AI-powered insights.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="card shadow-lg hover:shadow-xl transition-all animate-slide-up group" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--text-primary)]">Task Automation</CardTitle>
                <CardDescription className="text-lg text-[var(--text-tertiary)]">
                  Automate repetitive tasks and focus on building meaningful relationships.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="card shadow-lg hover:shadow-xl transition-all animate-slide-up group" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <CardTitle className="text-2xl text-[var(--text-primary)]">Analytics Dashboard</CardTitle>
                <CardDescription className="text-lg text-[var(--text-tertiary)]">
                  Get real-time insights into your sales pipeline and team performance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Trusted by Businesses</h2>
            <p className="text-xl text-[var(--text-tertiary)] max-w-2xl mx-auto">
              See what our customers have to say about their experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card shadow-lg hover:shadow-xl transition-all animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-[var(--text-tertiary)] mb-4">
                    "This CRM has transformed how we manage our customer relationships. The AI features are game-changing!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10" />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">John Doe</p>
                      <p className="text-sm text-[var(--text-tertiary)]">CEO, Company Inc.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session?.user && (
        <section className="py-24 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[var(--text-primary)]">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-[var(--text-tertiary)] mb-8">
                Join thousands of businesses using our CRM to grow their customer relationships.
              </p>
              <Button size="lg" asChild className="btn-primary shadow-lg hover:shadow-xl transition-all animate-float">
                <Link href="/auth/register" className="flex items-center gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
