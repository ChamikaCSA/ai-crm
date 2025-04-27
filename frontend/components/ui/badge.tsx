import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/80",
        secondary:
          "border-transparent bg-[var(--accent)]/10 text-[var(--text-secondary)] hover:bg-[var(--accent)]/20",
        destructive:
          "border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/80",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--accent)]/5",
        success:
          "border-transparent bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/80",
        warning:
          "border-transparent bg-[var(--warning)] text-[var(--warning-foreground)] hover:bg-[var(--warning)]/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
