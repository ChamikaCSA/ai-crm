import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)] dark:bg-[var(--accent)]/30 border-[var(--border)] flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[var(--primary)] focus-visible:ring-[var(--primary)]/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-[var(--error)]/20 dark:aria-invalid:ring-[var(--error)]/40 aria-invalid:border-[var(--error)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
