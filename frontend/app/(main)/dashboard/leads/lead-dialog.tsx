import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { LeadSource, LeadStatus, PreferredContactMethod } from '@/lib/api-types'
import { toast } from 'sonner'
import { ControllerRenderProps } from 'react-hook-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.nativeEnum(LeadSource),
  status: z.nativeEnum(LeadStatus),
  notes: z.string().optional(),
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

interface LeadDialogProps {
  leadId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadUpdated: () => void
  trigger?: React.ReactNode
}

export function LeadDialog({
  leadId,
  open,
  onOpenChange,
  onLeadUpdated,
  trigger,
}: LeadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditMode = !!leadId

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      source: LeadSource.WEBSITE,
      status: LeadStatus.NEW,
      notes: '',
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

  useEffect(() => {
    if (open && !isEditMode) {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        source: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        notes: '',
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
  }, [open, isEditMode, form])

  useEffect(() => {
    if (leadId && open) {
      fetchLeadDetails()
    }
  }, [leadId, open])

  const fetchLeadDetails = async () => {
    if (!leadId) return

    try {
      setIsLoading(true)
      const response = await api.get<FormData>(`/api/sales-rep/leads/${leadId}`)
      form.reset(response)
    } catch (error) {
      console.error('Failed to fetch lead details:', error)
      toast.error('Failed to fetch lead details')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      if (isEditMode) {
        await api.put(`/api/sales-rep/leads/${leadId}`, data)
        toast.success('Lead updated successfully')
      } else {
        await api.post('/api/sales-rep/leads', data)
        toast.success('Lead added successfully')
        form.reset()
      }
      onOpenChange(false)
      onLeadUpdated()
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'add'} lead:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} lead`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {trigger && (
        <div onClick={() => onOpenChange(true)}>
          {trigger}
        </div>
      )}
      <Modal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title={isEditMode ? 'Edit Lead' : 'Add New Lead'}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-tertiary)]">
            {isEditMode
              ? "Edit lead information below. Click save when you're done."
              : "Enter the lead's information below. Click save when you're done."}
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
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
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
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
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234-567-8900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
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
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="CEO" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a source" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(LeadSource).map((source) => (
                                <SelectItem key={source} value={source}>
                                  {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(LeadStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Input placeholder="Additional information..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preferences.preferredContactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Contact Method</FormLabel>
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
                          <FormLabel>Preferred Contact Time</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Morning, Afternoon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preferences.budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget</FormLabel>
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
                          <FormLabel>Timeline</FormLabel>
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
                        <FormLabel>Pain Points</FormLabel>
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
                </TabsContent>

                <TabsContent value="demographics" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="demographics.industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
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
                          <FormLabel>Company Size</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 50-200 employees" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="demographics.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
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
                          <FormLabel>Annual Revenue</FormLabel>
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
                        <FormLabel>Employee Count</FormLabel>
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
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Lead'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Modal>
    </>
  )
}