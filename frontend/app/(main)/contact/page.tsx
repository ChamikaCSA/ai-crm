'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api-client'
import { LeadSource, LeadStatus, PreferredContactMethod } from '@/lib/api-types'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/animations'
import { ControllerRenderProps } from 'react-hook-form'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Mail, Phone, Building2, Briefcase, MessageSquare, CheckCircle2, Clock, DollarSign, Calendar, Target, Users, MapPin, BarChart3, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  message: z.string().optional(),
  preferences: z.object({
    preferredContactMethod: z.nativeEnum(PreferredContactMethod),
    preferredContactTime: z.string().optional(),
    interests: z.array(z.string()).optional(),
    budget: z.number().optional(),
    timeline: z.string().optional(),
    painPoints: z.array(z.string()).optional(),
    decisionMaker: z.boolean().optional(),
  }).optional(),
  demographics: z.object({
    industry: z.string().optional(),
    companySize: z.string().optional(),
    location: z.string().optional(),
    annualRevenue: z.number().optional(),
    employeeCount: z.number().optional(),
  }).optional(),
})

type FormData = z.infer<typeof formSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const { user } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      message: '',
      preferences: {
        preferredContactMethod: PreferredContactMethod.EMAIL,
        preferredContactTime: '',
        interests: [],
        budget: undefined,
        timeline: '',
        painPoints: [],
        decisionMaker: false,
      },
      demographics: {
        industry: '',
        companySize: '',
        location: '',
        annualRevenue: undefined,
        employeeCount: undefined,
      },
    },
  })

  // Pre-fill form with user data when available
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: '',
        company: '',
        jobTitle: '',
        message: '',
        preferences: {
          preferredContactMethod: PreferredContactMethod.EMAIL,
          preferredContactTime: '',
          interests: [],
          budget: undefined,
          timeline: '',
          painPoints: [],
          decisionMaker: false,
        },
        demographics: {
          industry: '',
          companySize: '',
          location: '',
          annualRevenue: undefined,
          employeeCount: undefined,
        },
      })
    }
  }, [user, form])

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Preferences', icon: Target },
    { id: 3, title: 'Company Details', icon: Building2 },
    { id: 4, title: 'Message', icon: MessageSquare },
  ]

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      const { message, ...leadData } = data;
      await api.post('/api/customer/lead', {
        ...leadData,
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        notes: message,
        user: user?.id,
      })
      setIsSuccess(true)
      toast.success('Thank you for your interest! We will contact you soon.')
      form.reset()
    } catch (error) {
      console.error('Failed to submit lead:', error)
      toast.error('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    // Validate current step before proceeding
    const currentStepFields = getCurrentStepFields(currentStep);
    const isValid = currentStepFields.every(field => {
      const value = form.getValues(field as keyof FormData);
      return value !== undefined && value !== '';
    });

    if (!isValid) {
      // Trigger validation for current step fields
      currentStepFields.forEach(field => {
        form.trigger(field as keyof FormData);
      });
      toast.error('Please fill in all required fields before proceeding.');
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  }

  // Helper function to get required fields for each step
  const getCurrentStepFields = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email', 'phone'];
      case 2:
        return ['preferences'];
      case 3:
        return [];
      case 4:
        return [];
      default:
        return [];
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 max-w-3xl"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-center">Thank You!</CardTitle>
                <CardDescription className="text-center">
                  We have received your message and will get back to you shortly.
                </CardDescription>
                <Button
                  onClick={() => {
                    setIsSuccess(false);
                    setCurrentStep(1);
                    form.reset();
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Send Another Message
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 max-w-3xl"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
            <CardDescription>
              Have questions or need assistance? Fill out the form below and we'll get back to you shortly.
            </CardDescription>

            {/* Progress Steps */}
            <div className="mt-8 mb-6">
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[var(--border)] -translate-y-1/2" />

                {/* Steps */}
                <div className="relative flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          currentStep > step.id
                            ? 'border-[var(--primary)] bg-[var(--primary)] text-white scale-110'
                            : currentStep === step.id
                            ? 'border-[var(--primary)] bg-[var(--primary)] text-white scale-110 shadow-lg'
                            : 'border-[var(--border)] bg-[var(--background)] text-[var(--text-tertiary)]'
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium transition-colors duration-200 ${
                          currentStep >= step.id
                            ? 'text-[var(--text-primary)]'
                            : 'text-[var(--text-tertiary)]'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {currentStep === 1 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    First Name *
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Last Name *
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email *
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="john@example.com" type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Phone *
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="+1 234-567-8900" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="company"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Company
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="Acme Corp" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="jobTitle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Job Title
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="CEO" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="preferences.preferredContactMethod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Preferred Contact Method *
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select contact method" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Object.values(PreferredContactMethod).map((method) => (
                                        <SelectItem key={method} value={method}>
                                          {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="preferences.preferredContactTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Preferred Contact Time
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Morning, Afternoon" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="preferences.budget"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Budget
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter budget"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="preferences.timeline"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Timeline
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Q2 2024" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="preferences.painPoints"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Pain Points
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter pain points (comma-separated)"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="demographics.industry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Industry
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Technology" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="demographics.companySize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Company Size
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 50-200 employees" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="demographics.location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., New York, USA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="demographics.annualRevenue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Annual Revenue
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter annual revenue"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="demographics.employeeCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Employee Count
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Enter employee count"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {currentStep === 4 && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Your Message
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about your needs..."
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-between pt-6 border-t border-[var(--border)]">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center gap-2 min-w-[100px]"
                    >
                      Previous
                    </Button>
                  )}
                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="ml-auto flex items-center gap-2 min-w-[100px]"
                    >
                      Next
                    </Button>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="submit"
                            className="ml-auto flex items-center gap-2 min-w-[100px]"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit'
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send your message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}