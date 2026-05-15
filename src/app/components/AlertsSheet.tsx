/**
 * Bottom sheet: pending stock alerts (LOW_STOCK, OUT_OF_STOCK).
 */
import { useTranslation } from 'react-i18next';
import { AlertTriangle, PackageX, X } from 'lucide-react';
import { usePendingAlerts, useStore, type StockAlert, type StockAlertType } from '../store';

interface AlertsSheetProps {
  onClose: () => void;
  onOpenProduct: (productId: string) => void;
}

function alertIcon(type: StockAlertType) {
  return type === 'OUT_OF_STOCK' ? PackageX : AlertTriangle;
}

function alertStyles(type: StockAlertType) {
  if (type === 'OUT_OF_STOCK') {
    return {
      border: 'border-red-200',
      bg: 'bg-red-50',
      icon: 'text-red-600',
    };
  }
  return {
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
  };
}

export function AlertsSheet({ onClose, onOpenProduct }: AlertsSheetProps) {
  const { t } = useTranslation();
  const pendingAlerts = usePendingAlerts();
  const dismissAlert = useStore((s) => s.dismissAlert);

  const handleDismiss = (alert: StockAlert) => {
    dismissAlert(alert.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <button type="button" className="absolute inset-0" aria-label={t('common.close')} onClick={onClose} />
      <div
        className="relative z-10 w-full max-h-[85vh] overflow-hidden rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900">{t('alerts.sheet_title')}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{t('alerts.sheet_subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto -mx-1 space-y-2 px-1">
          {pendingAlerts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{t('alerts.sheet_empty')}</p>
          ) : (
            pendingAlerts.map((alert) => {
              const Icon = alertIcon(alert.type);
              const styles = alertStyles(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-3 ${styles.border} ${styles.bg}`}
                >
                  <div className="flex gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 ${styles.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {alert.type === 'OUT_OF_STOCK'
                          ? t('alerts.type_out')
                          : t('alerts.type_low')}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-700">{alert.message}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenProduct(alert.productId);
                            onClose();
                          }}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white active:bg-green-700"
                        >
                          {t('alerts.action_view_product')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismiss(alert)}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 active:bg-gray-50"
                        >
                          {t('alerts.action_dismiss')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

