/**
 * Sell + inventory hub: tabbed Sell (default) and Products, single bottom-nav destination.
 */
import { useTranslation } from 'react-i18next';
import { SaleScreen } from './SaleScreen';
import { ProductsScreen } from './ProductsScreen';

export type SaleProductsHubTab = 'sell' | 'products';

interface SaleProductsHubScreenProps {
  hubTab: SaleProductsHubTab;
  onHubTabChange: (tab: SaleProductsHubTab) => void;
  onSaleComplete: () => void;
}

export function SaleProductsHubScreen({
  hubTab,
  onHubTabChange,
  onSaleComplete,
}: SaleProductsHubScreenProps) {
  const { t } = useTranslation();

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
            onClick={() => onHubTabChange('products')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
              hubTab === 'products'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {t('sales_hub.tab_products')}
          </button>
        </div>
      </header>

      {hubTab === 'sell' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <SaleScreen onComplete={onSaleComplete} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <ProductsScreen />
        </div>
      )}
    </div>
  );
}
