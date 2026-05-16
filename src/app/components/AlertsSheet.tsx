/**
 * Bottom sheet: pending stock alerts (LOW_STOCK, OUT_OF_STOCK).
 */
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { usePendingAlerts, useStore } from '../store';
import { AlertsListRows } from './AlertsListRows';

interface AlertsSheetProps {
  onClose: () => void;
  onOpenProduct: (productId: string) => void;
}

export function AlertsSheet({ onClose, onOpenProduct }: AlertsSheetProps) {
  const { t } = useTranslation();
  const pendingAlerts = usePendingAlerts();
  const dismissAlert = useStore((s) => s.dismissAlert);

  const handleViewProduct = (productId: string) => {
    onOpenProduct(productId);
    onClose();
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

        <div className="max-h-[min(60vh,420px)] overflow-y-auto">
          {pendingAlerts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{t('alerts.sheet_empty')}</p>
          ) : (
            <AlertsListRows
              alerts={pendingAlerts}
              onViewProduct={handleViewProduct}
              onDismiss={dismissAlert}
              viewAriaLabel={t('alerts.action_view_product')}
              dismissAriaLabel={t('alerts.action_dismiss')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
