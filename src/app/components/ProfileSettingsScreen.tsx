/**
 * Edit account profile (name, email); mobile is read-only from registration.
 */
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '../authStore';
import { formatMobileDisplay } from '../utils/formatMobile';
import { Avatar, SettingsCard } from './SettingsScreen';
import { SettingsSubScreenLayout } from './SettingsSubScreenLayout';

interface ProfileSettingsScreenProps {
  onBack: () => void;
}

export function ProfileSettingsScreen({ onBack }: ProfileSettingsScreenProps) {
  const { t } = useTranslation();
  const mobileDigits = useAuthStore((s) => s.mobileDigits);
  const userName = useAuthStore((s) => s.userName);
  const email = useAuthStore((s) => s.email);
  const accountStatus = useAuthStore((s) => s.accountStatus);
  const updateUserProfile = useAuthStore((s) => s.updateUserProfile);

  const [name, setName] = useState(userName);
  const [emailValue, setEmailValue] = useState(email);

  const displayName = userName.trim() || t('settings.profile_name_fallback');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('settings.toast_name_required'));
      return;
    }
    if (!emailValue.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
      toast.error(t('settings.toast_email_invalid'));
      return;
    }
    updateUserProfile({ userName: name, email: emailValue });
    toast.success(t('settings.toast_profile_saved'));
    onBack();
  };

  return (
    <SettingsSubScreenLayout title={t('settings.profile_title')} onBack={onBack}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SettingsCard>
          <div className="flex flex-col items-center gap-3 py-2">
            <Avatar name={displayName} />
            <p className="text-sm text-gray-500">{formatMobileDisplay(mobileDigits)}</p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                accountStatus === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {accountStatus === 'active'
                ? t('settings.status_active')
                : t('settings.status_inactive')}
            </span>
          </div>
        </SettingsCard>

        <SettingsCard>
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('settings.field_name')}
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder={t('settings.placeholder_name')}
              />
            </div>
            <div>
              <label htmlFor="profile-mobile" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('settings.field_mobile')}
              </label>
              <input
                id="profile-mobile"
                type="text"
                readOnly
                value={formatMobileDisplay(mobileDigits)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">{t('settings.mobile_readonly_hint')}</p>
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('settings.field_email')}
              </label>
              <input
                id="profile-email"
                type="email"
                inputMode="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder={t('settings.placeholder_email')}
              />
            </div>
          </div>
        </SettingsCard>

        <button
          type="submit"
          className="w-full rounded-xl bg-green-600 py-4 text-base font-semibold text-white shadow-md active:bg-green-700"
        >
          {t('common.save')}
        </button>
      </form>
    </SettingsSubScreenLayout>
  );
}
