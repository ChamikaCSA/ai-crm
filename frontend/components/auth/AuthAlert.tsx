import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface AuthAlertProps {
  message: string;
  variant?: 'default' | 'destructive';
}

export function AuthAlert({ message, variant = 'default' }: AuthAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert variant={variant}>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </motion.div>
  );
}