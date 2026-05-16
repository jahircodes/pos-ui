/**
 * Compact alert rows: stock status dot, product name, view and dismiss actions.
 */
import { Eye, X } from 'lucide-react';
import type { StockAlert, StockAlertType } from '../store';
import { getStockStatusDot, type StockLevel } from '../utils/stockStatus';

function alertTypeToLevel(type: StockAlertType): StockLevel {
  return type === 'OUT_OF_STOCK' ? 'out' : 'low';
}

interface AlertsListRowsProps {
  alerts: StockAlert[];
  onViewProduct: (productId: string) => void;
  onDismiss: (alertId: string) => void;
  viewAriaLabel: string;
  dismissAriaLabel: string;
}

/** Renders pending alerts as a single divided list (inventory-style status dots). */
export function AlertsListRows({
  alerts,
  onViewProduct,
  onDismiss,
  viewAriaLabel,
  dismissAriaLabel,
}: AlertsListRowsProps) {
  return (
    <ul className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {alerts.map((alert, index) => {
        const dot = getStockStatusDot(alertTypeToLevel(alert.type));
        const isLast = index === alerts.length - 1;

        return (
          <li
            key={alert.id}
            className={`flex items-center gap-3 px-3 py-2.5 ${isLast ? '' : 'border-b border-gray-100'}`}
          >
            <span className="shrink-0 text-sm leading-none" aria-hidden>
              {dot}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
              {alert.productName}
            </p>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => onViewProduct(alert.productId)}
                aria-label={viewAriaLabel}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-green-700 active:bg-green-50"
              >
                <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                aria-label={dismissAriaLabel}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 active:bg-gray-100"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
