import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AuthCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, icon: Icon, children, className = '' }: AuthCardProps) {
  return (
    <Card className={`card shadow-xl hover:shadow-2xl transition-all ${className}`}>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-[var(--primary)]" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center text-[var(--text-primary)]">{title}</CardTitle>
        <CardDescription className="text-center text-[var(--text-tertiary)]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}