/**
 * Sell + inventory + alerts hub: tabbed screens under the Shop bottom-nav item.
 */
import { useTranslation } from 'react-i18next';
import { SaleScreen } from './SaleScreen';
import { ProductsScreen } from './ProductsScreen';
import { AlertsScreen } from './AlertsScreen';
import type { InventoryFocus } from './Dashboard';
import { usePendingAlertCount } from '../store';

export type SaleProductsHubTab = 'sell' | 'inventory' | 'alerts';

interface SaleProductsHubScreenProps {
  hubTab: SaleProductsHubTab;
  onHubTabChange: (tab: SaleProductsHubTab) => void;
  onSaleComplete: () => void;
  inventoryFocus?: InventoryFocus | null;
  onInventoryFocusConsumed?: () => void;
  onOpenProductFromAlert: (productId: string) => void;
}

export function SaleProductsHubScreen({
  hubTab,
  onHubTabChange,
  onSaleComplete,
  inventoryFocus,
  onInventoryFocusConsumed,
  onOpenProductFromAlert,
}: SaleProductsHubScreenProps) {
  const { t } = useTranslation();
  const pendingAlertCount = usePendingAlertCount();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
      <header className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white">
        <div className="p-4 pb-3">
          <h1 className="text-2xl font-bold text-gray-900">{t('sales_hub.title')}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{t('sales_hub.subtitle')}</p>
        </div>
        <div className="flex gap-1 px-4 pb-4">
          <button
            type="button"
            onClick={() => onHubTabChange('sell')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
              hubTab === 'sell'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {t('sales_hub.tab_sell')}
          </button>
          <button
            type="button"
            onClick={() => onHubTabChange('inventory')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
              hubTab === 'inventory'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {t('sales_hub.tab_inventory')}
          </button>
          <button
            type="button"
            onClick={() => onHubTabChange('alerts')}
            className={`relative flex-1 rounded-xl py-2.5 text-sm font-semibold ${
              hubTab === 'alerts'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {t('sales_hub.tab_alerts')}
            {pendingAlertCount > 0 ? (
              <span
                className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  hubTab === 'alerts' ? 'bg-white text-green-700' : 'bg-red-500 text-white'
                }`}
              >
                {pendingAlertCount > 9 ? '9+' : pendingAlertCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      {hubTab === 'sell' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <SaleScreen onComplete={onSaleComplete} />
        </div>
      ) : hubTab === 'inventory' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ProductsScreen
            inventoryFocus={inventoryFocus}
            onInventoryFocusConsumed={onInventoryFocusConsumed}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <AlertsScreen onOpenProduct={onOpenProductFromAlert} />
        </div>
      )}
    </div>
  );
}
