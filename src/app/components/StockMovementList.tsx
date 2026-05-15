/**
 * Scrollable stock movement ledger (shop-wide or single product).
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownCircle, ArrowUpCircle, SlidersHorizontal } from 'lucide-react';
import { useStore, type StockMovement, type StockMovementType } from '../store';
import { formatQuantityDisplay } from '../utils/formatWeight';
import { getAppLocale } from '../../i18n.js';

const typeIcon: Record<StockMovementType, typeof ArrowUpCircle> = {
  IN: ArrowDownCircle,
  OUT: ArrowUpCircle,
  ADJUSTMENT: SlidersHorizontal,
};

const typeColor: Record<StockMovementType, string> = {
  IN: 'text-green-600 bg-green-50',
  OUT: 'text-red-600 bg-red-50',
  ADJUSTMENT: 'text-amber-700 bg-amber-50',
};

function movementTypeLabel(type: StockMovementType, t: (key: string) => string) {
  if (type === 'IN') return t('stock.type_in');
  if (type === 'OUT') return t('stock.type_out');
  return t('stock.type_adjustment');
}

function movementReasonLabel(reason: string | undefined, t: (key: string) => string) {
  if (!reason) return undefined;
  if (reason === 'Initial stock') return t('stock.reason_initial');
  if (reason === 'Sale') return t('stock.reason_sale');
  if (reason === 'Sale undone') return t('stock.reason_sale_undone');
  return reason;
}

interface StockMovementListProps {
  productId?: string | null;
  onOpenProduct?: (productId: string) => void;
  className?: string;
}

export function StockMovementList({
  productId = null,
  onOpenProduct,
  className = '',
}: StockMovementListProps) {
  const { t } = useTranslation();
  const movements = useStore((s) => s.stockMovements);
  const products = useStore((s) => s.products);
  const dateLocale = getAppLocale();

  const filteredMovements = useMemo(() => {
    const list = productId
      ? movements.filter((m) => m.productId === productId)
      : [...movements];
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [movements, productId]);

  const formatQty = (movement: StockMovement) => {
    const p = products.find((x) => x.id === movement.productId);
    return formatQuantityDisplay(movement.quantity, p?.unit ?? 'piece');
  };

  if (filteredMovements.length === 0) {
    return (
      <p className={`py-12 text-center text-sm text-gray-500 ${className}`}>
        {t('stock.history_empty')}
      </p>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {filteredMovements.map((movement) => {
        const Icon = typeIcon[movement.type];
        const color = typeColor[movement.type];
        const signedQty =
          movement.type === 'OUT'
            ? `−${formatQty(movement)}`
            : movement.type === 'IN'
              ? `+${formatQty(movement)}`
              : formatQty(movement);

        return (
          <div
            key={movement.id}
            className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
          >
            <div className="flex gap-3">
              <MovementTypeIcon Icon={Icon} color={color} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-gray-900">
                    {movementTypeLabel(movement.type, t)}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-gray-800">
                    {signedQty}
                  </span>
                </div>
                {!productId && onOpenProduct ? (
                  <button
                    type="button"
                    onClick={() => onOpenProduct(movement.productId)}
                    className="mt-0.5 truncate text-left text-sm font-medium text-green-700 active:underline"
                  >
                    {movement.productName}
                  </button>
                ) : !productId ? (
                  <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                    {movement.productName}
                  </p>
                ) : null}
                {movement.reason ? (
                  <p className="mt-0.5 text-xs text-gray-600">
                    {movementReasonLabel(movement.reason, t)}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(movement.createdAt).toLocaleString(dateLocale, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {movement.stockAfter !== undefined
                    ? ` · ${t('stock.balance_after', { value: movement.stockAfter })}`
                    : null}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MovementTypeIcon({
  Icon,
  color,
}: {
  Icon: typeof ArrowUpCircle;
  color: string;
}) {
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}
