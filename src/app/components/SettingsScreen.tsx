import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Crown,
  LogOut,
  Store,
  UserRound,
  X,
} from 'lucide-react';

interface SettingsScreenProps {
  onBack?: () => void;
}

interface SettingsCardProps {
  children: React.ReactNode;
}

interface SettingsItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  textColorClassName?: string;
  onClick: () => void;
}

interface AvatarProps {
  name: string;
}

interface BadgeProps {
  label: string;
  variant: 'success' | 'warning';
}

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface PlaceholderModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

/**
 * Renders a mobile-first settings screen for profile, shop, subscription, and logout actions.
 */
export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activePlaceholder, setActivePlaceholder] = useState<'' | 'profile' | 'shop' | 'plan'>('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsProfileLoading(false);
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleOpenPlaceholder = (screen: 'profile' | 'shop' | 'plan') => {
    setActivePlaceholder(screen);
  };

  const handleClosePlaceholder = () => {
    setActivePlaceholder('');
  };

  const placeholderContentMap = {
    profile: {
      title: 'Edit Profile',
      description: 'Profile editing UI placeholder. Connect this to your edit profile flow.',
    },
    shop: {
      title: 'Shop Info',
      description: 'Shop details UI placeholder. Add your shop configuration form here.',
    },
    plan: {
      title: 'View Plans / Upgrade',
      description: 'Plan selection UI placeholder. Add your plans list and upgrade flow here.',
    },
  } as const;

  return (
    <div className="flex h-full flex-col bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 p-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <SettingsCard>
            {isProfileLoading ? (
              <ProfileSkeleton />
            ) : (
              <button
                type="button"
                onClick={() => handleOpenPlaceholder('profile')}
                className="flex w-full items-center gap-3 rounded-xl p-1 text-left active:bg-gray-50"
              >
                <Avatar name="Ravi Kumar" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-900">Ravi Kumar</p>
                  <p className="truncate text-sm text-gray-500">+91 98765 43210</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </SettingsCard>

          <SettingsCard>
            <SettingsItem
              icon={Store}
              title="Shop Info"
              subtitle="My Fresh Mart"
              onClick={() => handleOpenPlaceholder('shop')}
            />
          </SettingsCard>

          <SettingsCard>
            <SettingsItem
              icon={Crown}
              title="Pro Plan"
              subtitle="View Plans / Upgrade"
              badge={<Badge label="Active" variant="success" />}
              onClick={() => handleOpenPlaceholder('plan')}
            />
          </SettingsCard>

          <SettingsCard>
            <SettingsItem
              icon={LogOut}
              title="Logout"
              textColorClassName="text-red-500"
              onClick={() => setIsLogoutModalOpen(true)}
            />
          </SettingsCard>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Are you sure you want to logout?"
        description="You will need to login again to access your POS account."
        confirmLabel="Confirm Logout"
        cancelLabel="Cancel"
        onConfirm={() => setIsLogoutModalOpen(false)}
        onCancel={() => setIsLogoutModalOpen(false)}
      />

      <PlaceholderModal
        isOpen={activePlaceholder !== ''}
        title={activePlaceholder ? placeholderContentMap[activePlaceholder].title : ''}
        description={activePlaceholder ? placeholderContentMap[activePlaceholder].description : ''}
        onClose={handleClosePlaceholder}
      />
    </div>
  );
}

/**
 * Reusable rounded card container for settings sections.
 */
export function SettingsCard({ children }: SettingsCardProps) {
  return <section className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">{children}</section>;
}

/**
 * Reusable touch-friendly settings row item with icon, text, and optional badge.
 */
export function SettingsItem({
  icon: Icon,
  title,
  subtitle,
  badge,
  textColorClassName = 'text-gray-900',
  onClick,
}: SettingsItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 rounded-xl px-1 py-2 text-left active:bg-gray-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`truncate text-base font-semibold ${textColorClassName}`}>{title}</p>
          {badge}
        </div>
        {subtitle ? <p className="truncate text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </button>
  );
}

/**
 * Reusable circular avatar with name initials fallback.
 */
export function Avatar({ name }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-base font-bold text-green-700">
      {initials || <UserRound className="h-6 w-6" />}
    </div>
  );
}

/**
 * Reusable plan status badge with semantic color variants.
 */
export function Badge({ label, variant }: BadgeProps) {
  const badgeClassName =
    variant === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';

  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClassName}`}>{label}</span>;
}

/**
 * Reusable bottom-sheet confirmation modal for destructive actions.
 */
export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full rounded-t-3xl bg-white p-4 shadow-xl sm:max-w-sm sm:rounded-2xl">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 active:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 py-3 font-semibold text-white active:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable placeholder modal for upcoming settings pages.
 */
function PlaceholderModal({ isOpen, title, description, onClose }: PlaceholderModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full rounded-t-3xl bg-white p-4 shadow-xl sm:max-w-sm sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

/**
 * Profile skeleton placeholder while profile content loads.
 */
function ProfileSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3">
      <div className="h-14 w-14 rounded-full bg-gray-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-3 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}
