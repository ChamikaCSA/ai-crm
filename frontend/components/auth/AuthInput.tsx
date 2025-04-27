import { Input } from '@/components/ui/input';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  showPasswordToggle?: boolean;
}

export function AuthInput({ label, icon: Icon, showPasswordToggle, type = 'text', ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={props.id} className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] w-4 h-4" />
        <Input
          {...props}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          className={`pl-10 ${showPasswordToggle ? 'pr-10' : ''} ${props.className || ''}`}
        />
        {showPasswordToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-[var(--text-tertiary)]" />
            ) : (
              <Eye className="h-4 w-4 text-[var(--text-tertiary)]" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}