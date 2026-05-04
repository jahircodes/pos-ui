/**
 * Shared list row glyph: amber circle + icon for shop and staff hub cards.
 */
import { Building2, User } from 'lucide-react';

export type HubListEntityKind = 'shop' | 'staff';

interface HubListEntityIconProps {
  kind: HubListEntityKind;
}

export function HubListEntityIcon({ kind }: HubListEntityIconProps) {
  const Icon = kind === 'shop' ? Building2 : User;

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800"
      aria-hidden
    >
      <Icon className="h-6 w-6" />
    </div>
  );
}
