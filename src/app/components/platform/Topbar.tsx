/**
 * Top header with page title, avatar, and logout (UI only).
 */
import { LogOut, Menu } from 'lucide-react';

interface TopbarProps {
  title: string;
  userLabel?: string;
  onLogout?: () => void;
  /** Opens the mobile navigation drawer. */
  onMenuClick?: () => void;
}

/** 48×48px minimum touch target on small screens (WCAG / Material). */
const touchIconButton =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-sm active:bg-gray-100 active:scale-[0.98] transition-transform';

/** Sticky top bar for platform admin pages. */
export function Topbar({ title, userLabel = 'Super Admin', onLogout, onMenuClick }: TopbarProps) {
  const initials = userLabel
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex min-h-[3.5rem] shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-3 sm:min-h-14 sm:gap-3 sm:px-5 sm:py-2 lg:px-6 lg:py-0">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className={`${touchIconButton} lg:hidden`}
          >
            <Menu className="h-7 w-7 sm:h-6 sm:w-6" strokeWidth={2} />
          </button>
        ) : null}
        <h1 className="min-w-0 truncate text-[15px] font-semibold leading-tight text-gray-900 sm:text-lg">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 py-1.5 pl-1.5 pr-2.5 sm:rounded-lg sm:py-1 sm:pl-1 sm:pr-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white sm:h-8 sm:w-8 sm:rounded-md sm:text-xs"
            aria-hidden
          >
            {initials}
          </div>
          <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 sm:inline md:max-w-[160px]">
            {userLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Logout"
          className={`${touchIconButton} sm:inline-flex sm:h-auto sm:min-h-10 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5`}
        >
          <LogOut className="h-6 w-6 shrink-0 text-gray-600 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
          <span className="hidden text-sm font-medium text-gray-800 sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
