import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-[var(--background)] text-[var(--text-primary)] border-[var(--border)]",
        destructive: "text-[var(--error)] bg-[var(--background)] border-[var(--error)] [&>svg]:text-[var(--error)] *:data-[slot=alert-description]:text-[var(--error)]/90",
        success: "text-[var(--success)] bg-[var(--background)] border-[var(--success)] [&>svg]:text-[var(--success)] *:data-[slot=alert-description]:text-[var(--success)]/90",
        warning: "text-[var(--warning)] bg-[var(--background)] border-[var(--warning)] [&>svg]:text-[var(--warning)] *:data-[slot=alert-description]:text-[var(--warning)]/90",
        info: "text-[var(--info)] bg-[var(--background)] border-[var(--info)] [&>svg]:text-[var(--info)] *:data-[slot=alert-description]:text-[var(--info)]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-[var(--text-secondary)] col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
