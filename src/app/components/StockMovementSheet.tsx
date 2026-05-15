/**
 * Bottom sheet: stock movement ledger for one product or shop-wide.
 */
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useStore } from '../store';
import { StockMovementList } from './StockMovementList';

interface StockMovementSheetProps {
  productId: string | null;
  onClose: () => void;
  onOpenProduct?: (productId: string) => void;
}

export function StockMovementSheet({
  productId,
  onClose,
  onOpenProduct,
}: StockMovementSheetProps) {
  const { t } = useTranslation();
  const products = useStore((s) => s.products);
  const product = productId ? products.find((p) => p.id === productId) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <button type="button" className="absolute inset-0" aria-label={t('common.close')} onClick={onClose} />
      <SheetPanel
        title={
          product
            ? t('stock.history_product', { name: product.name })
            : t('stock.history_all')
        }
        subtitle={product ? t('stock.history_product_hint') : t('stock.history_all_hint')}
        onClose={onClose}
        closeLabel={t('common.close')}
      >
        <div className="max-h-[min(60vh,420px)] overflow-y-auto -mx-1 px-1">
          <StockMovementList
            productId={productId}
            onOpenProduct={onOpenProduct}
          />
        </div>
      </SheetPanel>
    </div>
  );
}

function SheetPanel({
  title,
  subtitle,
  onClose,
  closeLabel,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  closeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative z-10 w-full max-h-[85vh] overflow-hidden rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
    </div>
  );
}
