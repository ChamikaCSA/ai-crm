'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { APP_NAME } from '@/strings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ClipboardList, BarChart3, Sparkles, CheckCircle2, Star, Zap, Shield, Globe, MessageSquare, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

type StatCardProps = {
  value: string
  label: string
  delay?: number
}

type FeatureCardProps = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay?: number
}

type TestimonialCardProps = {
  name: string
  role: string
  quote: string
  rating: number
  delay?: number
}

type PricingCardProps = {
  name: string
  price: string
  features: string[]
  popular: boolean
  delay?: number
}

type FAQCardProps = {
  question: string
  answer: string
  delay?: number
}

const StatCard = ({ value, label, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="text-center"
  >
    <div className="text-4xl font-bold text-[var(--primary)] mb-2">{value}</div>
    <div className="text-[var(--text-tertiary)]">{label}</div>
  </motion.div>
)

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="h-full"
  >
    <Card className="card shadow-lg hover:shadow-xl transition-all group hover:scale-105 h-full">
      <CardHeader className="h-full flex flex-col">
        <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-7 h-7 text-[var(--primary)]" />
        </div>
        <CardTitle className="text-2xl text-[var(--text-primary)]">{title}</CardTitle>
        <CardDescription className="text-lg text-[var(--text-tertiary)] flex-grow">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  </motion.div>
)

const TestimonialCard = ({ name, role, quote, rating, delay = 0 }: TestimonialCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="h-full"
  >
    <Card className="card shadow-lg hover:shadow-xl transition-all hover:scale-105 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(rating)].map((_, j) => (
            <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <p className="text-lg text-[var(--text-tertiary)] mb-4 flex-grow">
          "{quote}"
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">{name}</p>
            <p className="text-sm text-[var(--text-tertiary)]">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

const PricingCard = ({ name, price, features, popular, delay = 0 }: PricingCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
  >
    <Card className={`card shadow-lg hover:shadow-xl transition-all ${popular ? 'border-2 border-[var(--primary)]' : ''} h-full`}>
      <CardHeader className="relative">
        {popular && (
          <div className="absolute -top-3 -right-3 bg-[var(--primary)] text-white px-2 py-0.5 rounded-full text-xs">
            Most Popular
          </div>
        )}
        <CardTitle className="text-2xl text-[var(--text-primary)]">{name}</CardTitle>
        <div className="text-4xl font-bold text-[var(--primary)] mb-4">{price}<span className="text-lg text-[var(--text-tertiary)]">/month</span></div>
        <ul className="space-y-2 flex-grow">
          {features.map((feature, j) => (
            <li key={j} className="flex items-center gap-2 text-[var(--text-tertiary)]">
              <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
              {feature}
            </li>
          ))}
        </ul>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button className="w-full" variant={popular ? "default" : "outline"}>
          Get Started
        </Button>
      </CardContent>
    </Card>
  </motion.div>
)

const FAQCard = ({ question, answer, delay = 0 }: FAQCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
  >
    <Card className="card shadow-lg hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">{question}</h3>
          <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
        </div>
        <p className="mt-4 text-[var(--text-tertiary)]">{answer}</p>
      </CardContent>
    </Card>
  </motion.div>
)

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
              <span className="text-sm font-medium">Enterprise AI-Powered CRM Platform</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-[var(--text-primary)] bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
            >
              {user ? `Welcome to ${APP_NAME}` : 'Intelligent Customer Relationship Management'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl md:text-2xl text-[var(--text-tertiary)] mb-8 max-w-2xl mx-auto"
            >
              {user
                ? 'Start managing your customer relationships with our AI-powered tools.'
                : 'Unify sales, marketing, and customer support with AI-driven insights and automation.'
              }
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {user ? (
                <Link href="/dashboard">
                  <Button className="group">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button variant="outline" className="group">
                    Start Free Trial
                  </Button>
                </Link>
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
            <StatCard value="10K+" label="Active Users" />
            <StatCard value="50K+" label="Leads Managed" delay={0.1} />
            <StatCard value="99%" label="Customer Satisfaction" delay={0.2} />
            <StatCard value="24/7" label="Support Available" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[var(--accent)]/50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Enterprise-Grade Features</h2>
            <p className="text-xl text-[var(--text-tertiary)] max-w-2xl mx-auto">
              Comprehensive tools for every team member in your organization
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={MessageSquare}
              title="AI-Powered Support"
              description="Real-time chatbot support and personalized customer interactions powered by advanced AI."
            />
            <FeatureCard
              icon={BarChart3}
              title="Advanced Analytics"
              description="Predictive analytics, interactive dashboards, and AI-driven insights for data-driven decisions."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="Multi-factor authentication, role-based access, and comprehensive audit logging."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Trusted by Enterprise Teams</h2>
            <p className="text-xl text-[var(--text-tertiary)] max-w-2xl mx-auto">
              See how our platform transforms customer relationships across departments
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Chen"
              role="Sales Director, Enterprise Corp"
              quote="The AI-driven lead scoring and predictive analytics have revolutionized our sales process. We've seen a 35% increase in conversion rates."
              rating={5}
            />
            <TestimonialCard
              name="Michael Rodriguez"
              role="Marketing Manager, TechGlobal"
              quote="The customer segmentation and sentiment analysis tools have transformed our marketing campaigns. Our engagement rates have doubled."
              rating={5}
              delay={0.1}
            />
            <TestimonialCard
              name="Lisa Thompson"
              role="IT Director, SecureSystems"
              quote="The security features and compliance capabilities give us complete confidence in managing sensitive customer data."
              rating={5}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[var(--accent)]/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Enterprise-Ready Plans</h2>
            <p className="text-xl text-[var(--text-tertiary)] max-w-2xl mx-auto">
              Scalable solutions for organizations of all sizes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Professional"
              price="$99"
              features={["Up to 10 users", "AI chatbot support", "Basic analytics", "Email support", "5GB storage"]}
              popular={false}
            />
            <PricingCard
              name="Business"
              price="$299"
              features={["Up to 50 users", "Advanced AI features", "Predictive analytics", "Priority support", "50GB storage", "API access"]}
              popular={true}
              delay={0.1}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              features={["Unlimited users", "Custom AI models", "Advanced security", "24/7 support", "Unlimited storage", "Custom integrations"]}
              popular={false}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">Frequently Asked Questions</h2>
            <p className="text-xl text-[var(--text-tertiary)] max-w-2xl mx-auto">
              Everything you need to know about our enterprise CRM platform
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <FAQCard
              question="How does the AI chatbot support work?"
              answer="Our AI chatbot provides real-time support to customers, handling common queries and routing complex issues to human agents. It learns from interactions to provide increasingly personalized responses."
            />
            <FAQCard
              question="What kind of analytics and reporting capabilities do you offer?"
              answer="We provide comprehensive analytics including predictive forecasting, interactive dashboards, and detailed reporting tools. Our AI-powered insights help identify trends and opportunities across sales, marketing, and customer service."
              delay={0.1}
            />
            <FAQCard
              question="How secure is the platform?"
              answer="We implement enterprise-grade security including multi-factor authentication, role-based access control, and detailed audit logging. All data is encrypted in transit and at rest, and we maintain compliance with major security standards."
              delay={0.2}
            />
            <FAQCard
              question="Can the platform integrate with our existing systems?"
              answer="Yes, our Enterprise plan offers custom integrations with your existing systems. We also provide a robust API for Professional and Business plans to connect with common business tools."
              delay={0.3}
            />
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
              <Link href="/auth/register">
                <Button variant="outline" className="group">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
