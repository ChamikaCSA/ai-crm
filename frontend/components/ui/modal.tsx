import * as React from 'react'
import { cn } from '@/lib/utils'

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  ...props
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-lg bg-[var(--card)] p-6 shadow-lg',
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="mb-4">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}