/**
 * Full-page stock movement tab content inside History.
 */
import { useTranslation } from 'react-i18next';
import { StockMovementList } from './StockMovementList';

interface StockMovementPanelProps {
  onOpenProduct?: (productId: string) => void;
}

export function StockMovementPanel({ onOpenProduct }: StockMovementPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="mb-3 shrink-0 text-sm text-gray-500">{t('stock.history_all_hint')}</p>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StockMovementList onOpenProduct={onOpenProduct} />
      </div>
    </div>
  );
}
