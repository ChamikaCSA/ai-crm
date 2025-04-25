'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/strings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ClipboardList, BarChart3, ArrowRight, Sparkles, CheckCircle2, Star, Zap, Shield, Globe, MessageSquare, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 via-transparent to-[var(--accent)]/20" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered CRM Platform</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[var(--text-primary)] bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
            >
              {user ? `Welcome to ${APP_NAME}` : 'Transform Your Customer Relationships'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl md:text-2xl text-[var(--text-tertiary)] mb-8 max-w-2xl mx-auto"
            >
              {user
                ? 'Start managing your customer relationships with our AI-powered tools.'
                : 'AI-powered CRM to help you manage leads, automate tasks, and grow your business.'
              }
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {user ? (
                <Button size="lg" asChild className="btn-primary shadow-lg hover:shadow-xl transition-all">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="btn-primary shadow-lg hover:shadow-xl transition-all">
                  <Link href="/auth/register" className="flex items-center gap-2">
                    Start Free Trial <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[var(--accent)]/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">10K+</div>
              <div className="text-[var(--text-tertiary)]">Active Users</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">50K+</div>
              <div className="text-[var(--text-tertiary)]">Leads Managed</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">99%</div>
              <div className="text-[var(--text-tertiary)]">Customer Satisfaction</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[var(--primary)] mb-2">24/7</div>
              <div className="text-[var(--text-tertiary)]">Support Available</div>
            </motion.div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="card shadow-lg hover:shadow-xl transition-all group hover:scale-105">
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="card shadow-lg hover:shadow-xl transition-all group hover:scale-105">
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
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="card shadow-lg hover:shadow-xl transition-all group hover:scale-105">
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
            </motion.div>
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
            {[
              {
                name: "John Doe",
                role: "CEO, Company Inc.",
                quote: "This CRM has transformed how we manage our customer relationships. The AI features are game-changing!",
                rating: 5
              },
              {
                name: "Jane Smith",
                role: "Sales Director, TechCorp",
                quote: "The automation features have saved us countless hours. Our team's productivity has increased by 40%.",
                rating: 5
              },
              {
                name: "Mike Johnson",
                role: "Founder, StartupX",
                quote: "The analytics dashboard gives us insights we never had before. It's like having a data scientist on the team.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-lg text-[var(--text-tertiary)] mb-4">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10" />
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{testimonial.name}</p>
                        <p className="text-sm text-[var(--text-tertiary)]">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[var(--accent)]/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Simple, Transparent Pricing</h2>
            <p className="text-xl text-[var(--text-tertiary)] max-w-2xl mx-auto">
              Choose the plan that's right for your business
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$29",
                features: ["Up to 5 users", "Basic CRM features", "Email support", "1GB storage"],
                popular: false
              },
              {
                name: "Professional",
                price: "$79",
                features: ["Up to 20 users", "Advanced CRM features", "Priority support", "10GB storage", "API access"],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: ["Unlimited users", "All features", "24/7 support", "Unlimited storage", "Custom integrations"],
                popular: false
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`card shadow-lg hover:shadow-xl transition-all ${plan.popular ? 'border-2 border-[var(--primary)]' : ''} h-full`}>
                  <CardHeader className="relative">
                    {plan.popular && (
                      <div className="absolute -top-3 -right-3 bg-[var(--primary)] text-white px-2 py-0.5 rounded-full text-xs">
                        Most Popular
                      </div>
                    )}
                    <CardTitle className="text-2xl text-[var(--text-primary)]">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-[var(--primary)] mb-4">{plan.price}<span className="text-lg text-[var(--text-tertiary)]">/month</span></div>
                    <ul className="space-y-2 flex-grow">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-[var(--text-tertiary)]">
                          <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Frequently Asked Questions</h2>
            <p className="text-xl text-[var(--text-tertiary)] max-w-2xl mx-auto">
              Everything you need to know about our platform
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "What makes your CRM different from others?",
                answer: "Our CRM combines powerful AI capabilities with an intuitive interface, making it easier than ever to manage customer relationships. We focus on automation and insights to help you grow your business."
              },
              {
                question: "Can I try the platform before committing?",
                answer: "Yes! We offer a 14-day free trial with access to all features. No credit card required."
              },
              {
                question: "How secure is my data?",
                answer: "We take security seriously. All data is encrypted in transit and at rest, and we regularly undergo security audits to ensure your information is protected."
              },
              {
                question: "Do you offer custom integrations?",
                answer: "Yes, we offer custom integrations for Enterprise customers. Our API is also available for Professional plan users."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-[var(--text-primary)]">{faq.question}</h3>
                      <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </div>
                    <p className="mt-4 text-[var(--text-tertiary)]">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[var(--text-primary)]">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-[var(--text-tertiary)] mb-8">
                Join thousands of businesses using our CRM to grow their customer relationships.
              </p>
              <Button size="lg" asChild className="btn-primary shadow-lg hover:shadow-xl transition-all">
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
