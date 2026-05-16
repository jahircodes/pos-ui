/**
 * Full-screen stock alerts list (LOW_STOCK, OUT_OF_STOCK).
 */
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { usePendingAlerts, useStore } from '../store';
import { AlertsListRows } from './AlertsListRows';

interface AlertsScreenProps {
  onOpenProduct: (productId: string) => void;
}

export function AlertsScreen({ onOpenProduct }: AlertsScreenProps) {
  const { t } = useTranslation();
  const pendingAlerts = usePendingAlerts();
  const dismissAlert = useStore((s) => s.dismissAlert);
  const dismissAllPendingAlerts = useStore((s) => s.dismissAllPendingAlerts);

  const lowCount = pendingAlerts.filter((a) => a.type === 'LOW_STOCK').length;
  const outCount = pendingAlerts.filter((a) => a.type === 'OUT_OF_STOCK').length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50 pb-16">
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900">{t('alerts.screen_title')}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{t('alerts.screen_subtitle')}</p>
          </div>
          {pendingAlerts.length > 0 ? (
            <button
              type="button"
              onClick={dismissAllPendingAlerts}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 active:bg-gray-100"
            >
              {t('alerts.action_clear_all')}
            </button>
          ) : null}
        </div>
        {pendingAlerts.length > 0 ? (
          <p className="mt-2 text-xs font-medium text-gray-600">
            {t('alerts.dashboard_summary', { low: lowCount, out: outCount })}
          </p>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {pendingAlerts.length === 0 ? (
          <div className="mt-16 text-center">
            <Bell className="mx-auto h-9 w-9 text-gray-300" strokeWidth={1.5} aria-hidden />
            <p className="mt-3 text-sm font-medium text-gray-900">{t('alerts.sheet_empty')}</p>
            <p className="mt-1 text-xs text-gray-500">{t('alerts.screen_empty_hint')}</p>
          </div>
        ) : (
          <AlertsListRows
            alerts={pendingAlerts}
            onViewProduct={onOpenProduct}
            onDismiss={dismissAlert}
            viewAriaLabel={t('alerts.action_view_product')}
            dismissAriaLabel={t('alerts.action_dismiss')}
          />
        )}
      </div>
    </div>
  );
}
