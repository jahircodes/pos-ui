/**
 * Full-screen stock alerts list (LOW_STOCK, OUT_OF_STOCK).
 */
import { useTranslation } from 'react-i18next';
import { AlertTriangle, PackageX } from 'lucide-react';
import { usePendingAlerts, useStore, type StockAlert, type StockAlertType } from '../store';

interface AlertsScreenProps {
  onOpenProduct: (productId: string) => void;
}

function alertIcon(type: StockAlertType) {
  return type === 'OUT_OF_STOCK' ? PackageX : AlertTriangle;
}

function alertStyles(type: StockAlertType) {
  if (type === 'OUT_OF_STOCK') {
    return { border: 'border-red-200', bg: 'bg-red-50', icon: 'text-red-600' };
  }
  return { border: 'border-orange-200', bg: 'bg-orange-50', icon: 'text-orange-600' };
}

export function AlertsScreen({ onOpenProduct }: AlertsScreenProps) {
  const { t } = useTranslation();
  const pendingAlerts = usePendingAlerts();
  const dismissAlert = useStore((s) => s.dismissAlert);

  const lowCount = pendingAlerts.filter((a) => a.type === 'LOW_STOCK').length;
  const outCount = pendingAlerts.filter((a) => a.type === 'OUT_OF_STOCK').length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50 pb-16">
      <div className="shrink-0 border-b border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold text-gray-900">{t('alerts.screen_title')}</h2>
        <p className="mt-0.5 text-sm text-gray-500">{t('alerts.screen_subtitle')}</p>
        {pendingAlerts.length > 0 ? (
          <p className="mt-2 text-sm font-medium text-amber-800">
            {t('alerts.dashboard_summary', { low: lowCount, out: outCount })}
          </p>
        ) : null}
      </div>

      <AlertsList
        pendingAlerts={pendingAlerts}
        t={t}
        onOpenProduct={onOpenProduct}
        dismissAlert={dismissAlert}
      />
    </div>
  );
}

function AlertsList({
  pendingAlerts,
  t,
  onOpenProduct,
  dismissAlert,
}: {
  pendingAlerts: StockAlert[];
  t: (key: string, opts?: Record<string, unknown>) => string;
  onOpenProduct: (productId: string) => void;
  dismissAlert: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {pendingAlerts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <PackageX className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-900">{t('alerts.sheet_empty')}</p>
          <p className="mt-1 text-sm text-gray-500">{t('alerts.screen_empty_hint')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pendingAlerts.map((alert) => {
            const Icon = alertIcon(alert.type);
            const styles = alertStyles(alert.type);
            return (
              <li
                key={alert.id}
                className={`rounded-xl border p-4 shadow-sm ${styles.border} ${styles.bg}`}
              >
                <div className="flex gap-3">
                  <AlertIconBadge Icon={Icon} iconClass={styles.icon} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {alert.type === 'OUT_OF_STOCK'
                        ? t('alerts.type_out')
                        : t('alerts.type_low')}
                    </p>
                    <p className="mt-0.5 font-medium text-gray-800">{alert.productName}</p>
                    <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenProduct(alert.productId)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white active:bg-green-700"
                      >
                        {t('alerts.action_view_product')}
                      </button>
                      <button
                        type="button"
                        onClick={() => dismissAlert(alert.id)}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 active:bg-gray-50"
                      >
                        {t('alerts.action_dismiss')}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AlertIconBadge({
  Icon,
  iconClass,
}: {
  Icon: typeof AlertTriangle;
  iconClass: string;
}) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/90 ${iconClass}`}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}
