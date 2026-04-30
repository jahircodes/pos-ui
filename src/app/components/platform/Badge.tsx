/**
 * Status and label badges for the platform admin UI.
 */
type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClassName: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800 ring-green-600/10',
  danger: 'bg-red-100 text-red-800 ring-red-600/10',
  warning: 'bg-amber-100 text-amber-900 ring-amber-600/10',
  neutral: 'bg-gray-100 text-gray-700 ring-gray-600/10',
};

/** Small pill badge for table rows and lists. */
export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variantClassName[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
