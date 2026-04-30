/**
 * Left navigation for the platform admin shell.
 */
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Wallet,
  Bell,
  Settings,
  X,
} from 'lucide-react';

export type PlatformNavId =
  | 'dashboard'
  | 'shops'
  | 'subscriptions'
  | 'payments'
  | 'alerts'
  | 'settings';

interface SidebarProps {
  activeId: PlatformNavId;
  onNavigate: (id: PlatformNavId) => void;
  /** When set, shows a close control on small screens (mobile drawer). */
  onRequestClose?: () => void;
}

const navItems: { id: PlatformNavId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'shops', label: 'Shops', icon: Store },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: Wallet },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/** Vertical sidebar with icon + label and active highlight. */
export function Sidebar({ activeId, onNavigate, onRequestClose }: SidebarProps) {
  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col border-r border-gray-200 bg-white lg:w-64">
      <div className="border-b border-gray-100 px-4 py-4 lg:py-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Platform</p>
            <p className="mt-1 text-lg font-bold text-gray-900">Dashboard</p>
          </div>
          {onRequestClose ? (
            <button
              type="button"
              onClick={onRequestClose}
              aria-label="Close menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-600 active:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 pb-6" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors active:scale-[0.99] lg:min-h-0 lg:py-2.5 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/15'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-700' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
