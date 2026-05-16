/**
 * Shared header + scroll body layout for settings sub-screens.
 */
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SettingsSubScreenLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function SettingsSubScreenLayout({ title, onBack, children }: SettingsSubScreenLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={onBack}
            aria-label={t('common.go_back')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  );
}
