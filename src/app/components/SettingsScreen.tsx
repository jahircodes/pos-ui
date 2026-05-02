import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ChevronRight,
  Crown,
  KeyRound,
  Languages,
  LogOut,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { ChangePasswordScreen } from './ChangePasswordScreen';
import { changeAppLanguage } from '../../i18n.js';

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
  const { t, i18n } = useTranslation();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activePlaceholder, setActivePlaceholder] = useState<'' | 'profile' | 'shop' | 'plan'>('');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

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

  if (isChangePasswordOpen) {
    return <ChangePasswordScreen onBack={() => setIsChangePasswordOpen(false)} />;
  }

  const placeholderContentMap = {
    profile: {
      titleKey: 'settings.placeholder_profile_title',
      descriptionKey: 'settings.placeholder_profile_desc',
    },
    shop: {
      titleKey: 'settings.placeholder_shop_title',
      descriptionKey: 'settings.placeholder_shop_desc',
    },
    plan: {
      titleKey: 'settings.placeholder_plan_title',
      descriptionKey: 'settings.placeholder_plan_desc',
    },
  } as const;

  const isEnglishActive = i18n.language === 'en' || i18n.language.startsWith('en');
  const isTamilActive = i18n.language === 'ta' || i18n.language.startsWith('ta');

  return (
    <div className="flex h-full flex-col bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 p-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label={t('common.go_back')}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <SettingsCard>
            <div className="flex items-start gap-3 rounded-xl p-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <Languages className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-gray-900">{t('settings.language')}</p>
                <p className="text-sm text-gray-500">{t('settings.language_hint')}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => changeAppLanguage('en')}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                      isEnglishActive
                        ? 'border-green-600 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
                    }`}
                  >
                    {t('settings.language_english')}
                  </button>
                  <button
                    type="button"
                    onClick={() => changeAppLanguage('ta')}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                      isTamilActive
                        ? 'border-green-600 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
                    }`}
                  >
                    {t('settings.language_tamil')}
                  </button>
                </div>
              </div>
            </div>
          </SettingsCard>

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
              title={t('settings.shop_info')}
              subtitle="My Fresh Mart"
              onClick={() => handleOpenPlaceholder('shop')}
            />
          </SettingsCard>

          <SettingsCard>
            <SettingsItem
              icon={Crown}
              title={t('settings.pro_plan')}
              subtitle={t('settings.view_plans')}
              badge={<Badge label={t('settings.badge_active')} variant="success" />}
              onClick={() => handleOpenPlaceholder('plan')}
            />
          </SettingsCard>

          <SettingsCard>
            <SettingsItem
              icon={KeyRound}
              title={t('settings.change_password')}
              subtitle={t('settings.change_password_sub')}
              onClick={() => setIsChangePasswordOpen(true)}
            />
          </SettingsCard>

          <SettingsCard>
            <SettingsItem
              icon={LogOut}
              title={t('settings.logout')}
              textColorClassName="text-red-500"
              onClick={() => setIsLogoutModalOpen(true)}
            />
          </SettingsCard>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title={t('settings.logout_title')}
        description={t('settings.logout_desc')}
        confirmLabel={t('settings.confirm_logout')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => setIsLogoutModalOpen(false)}
        onCancel={() => setIsLogoutModalOpen(false)}
      />

      <PlaceholderModal
        isOpen={activePlaceholder !== ''}
        title={activePlaceholder ? t(placeholderContentMap[activePlaceholder].titleKey) : ''}
        description={activePlaceholder ? t(placeholderContentMap[activePlaceholder].descriptionKey) : ''}
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
  const { t } = useTranslation();
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
            aria-label={t('common.close_modal')}
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
