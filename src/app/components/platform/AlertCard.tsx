/**
 * Single alert row for failed payments, expiring subscriptions, etc.
 */
import { AlertTriangle, Bell } from 'lucide-react';

type AlertSeverity = 'high' | 'medium' | 'low';

interface AlertCardProps {
  title: string;
  description: string;
  severity: AlertSeverity;
  meta?: string;
}

const severityStyles: Record<AlertSeverity, { border: string; icon: string; Icon: typeof Bell }> = {
  high: {
    border: 'border-red-200 bg-red-50/80',
    icon: 'text-red-600',
    Icon: AlertTriangle,
  },
  medium: {
    border: 'border-amber-200 bg-amber-50/80',
    icon: 'text-amber-600',
    Icon: AlertTriangle,
  },
  low: {
    border: 'border-gray-200 bg-white',
    icon: 'text-gray-500',
    Icon: Bell,
  },
};

/** Renders one system alert with severity styling. */
export function AlertCard({ title, description, severity, meta }: AlertCardProps) {
  const styles = severityStyles[severity];
  const Icon = styles.Icon;

  return (
    <div
      className={`flex gap-3 rounded-xl border p-3 shadow-sm sm:p-4 ${styles.border}`}
      role="status"
    >
      <div className={`shrink-0 ${styles.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        {meta ? <p className="mt-2 text-xs text-gray-400">{meta}</p> : null}
      </div>
    </div>
  );
}
