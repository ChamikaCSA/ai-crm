import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@/lib/types'

interface ProfilePictureProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProfilePicture({ user, size = 'md', className = '' }: ProfilePictureProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={`${user.firstName} ${user.lastName}`} />
      <AvatarFallback className="text-[var(--text-primary)]">
        {user.firstName[0]}
      </AvatarFallback>
    </Avatar>
  )
}