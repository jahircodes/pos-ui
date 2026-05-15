/**
 * Add/edit product with stock movement (IN / OUT / ADJUSTMENT) and min stock level.
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, Product, type StockMovementType } from '../store';
import { History, X } from 'lucide-react';
import { toast } from 'sonner';
import { StockMovementSheet } from './StockMovementSheet';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const MOVEMENT_TYPES: StockMovementType[] = ['IN', 'OUT', 'ADJUSTMENT'];

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { t } = useTranslation();
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);
  const recordStockMovement = useStore((state) => state.recordStockMovement);

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [stock, setStock] = useState(product?.stock.toString() || '');
  const [minStockLevel, setMinStockLevel] = useState(
    product?.minStockLevel?.toString() ?? '10',
  );
  const [unit, setUnit] = useState<'kg' | 'litre' | 'piece'>(product?.unit || 'piece');
  const [priceUnit, setPriceUnit] = useState(product?.priceUnit || '');
  const [movementType, setMovementType] = useState<StockMovementType>('IN');
  const [movementQty, setMovementQty] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setMinStockLevel(product.minStockLevel?.toString() ?? '10');
      setUnit(product.unit || 'piece');
      setPriceUnit(product.priceUnit || '');
      setMovementType('IN');
      setMovementQty('');
      setMovementReason('');
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price || (!product && !stock)) {
      toast.error(t('inventory.toast_fill_all'));
      return;
    }

    const priceNum = parseFloat(price);
    const minLevel = parseFloat(minStockLevel);
    const initialStock = parseFloat(stock) || 0;
    const qty = parseFloat(movementQty);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error(t('inventory.toast_invalid_price'));
      return;
    }

    if (isNaN(minLevel) || minLevel < 0) {
      toast.error(t('inventory.toast_invalid_min_stock'));
      return;
    }

    if (product) {
      updateProduct(product.id, {
        name,
        price: priceNum,
        minStockLevel: minLevel,
        unit,
        priceUnit,
      });

      if (movementQty.trim() !== '' && !isNaN(qty) && qty > 0) {
        const ok =
          movementType === 'ADJUSTMENT'
            ? recordStockMovement(product.id, 'ADJUSTMENT', qty, movementReason)
            : recordStockMovement(product.id, movementType, qty, movementReason);
        if (!ok) {
          toast.error(t('stock.toast_movement_failed'));
          return;
        }
        toast.success(t('stock.toast_movement_recorded'));
      } else {
        toast.success(t('inventory.toast_product_updated'));
      }
    } else {
      if (initialStock < 0) {
        toast.error(t('inventory.toast_negative_stock'));
        return;
      }
      addProduct({
        name,
        price: priceNum,
        stock: initialStock,
        minStockLevel: minLevel,
        unit,
        priceUnit,
      });
      toast.success(t('inventory.toast_product_added'));
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 sm:items-center">
        <ModalPanel>
          <div className="mb-6 flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              {product ? t('inventory.modal_edit') : t('inventory.modal_add')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto pr-1">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('inventory.field_product_name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('inventory.placeholder_product_name')}
                autoFocus
              />
            </div>

            <UnitFields
              unit={unit}
              priceUnit={priceUnit}
              onUnitChange={(newUnit) => {
                setUnit(newUnit);
                if (newUnit === 'kg') setPriceUnit('KG');
                else if (newUnit === 'litre') setPriceUnit('L');
                else setPriceUnit('PCS');
              }}
              onPriceUnitChange={setPriceUnit}
              t={t}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('inventory.field_price')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('inventory.field_min_stock')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {product ? (
              <StockSection
                stock={stock}
                movementType={movementType}
                movementQty={movementQty}
                movementReason={movementReason}
                onMovementTypeChange={setMovementType}
                onMovementQtyChange={setMovementQty}
                onMovementReasonChange={setMovementReason}
                onOpenHistory={() => setIsHistoryOpen(true)}
                t={t}
              />
            ) : (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('inventory.field_initial_stock')}
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white active:bg-green-700"
            >
              {product ? t('inventory.submit_update') : t('inventory.submit_add')}
            </button>
          </form>
        </ModalPanel>
      </div>

      {isHistoryOpen && product ? (
        <StockMovementSheet
          productId={product.id}
          onClose={() => setIsHistoryOpen(false)}
        />
      ) : null}
    </>
  );
}

function ModalPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full max-w-md animate-slide-up rounded-t-3xl bg-white p-6 sm:rounded-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function UnitFields({
  unit,
  priceUnit,
  onUnitChange,
  onPriceUnitChange,
  t,
}: {
  unit: 'kg' | 'litre' | 'piece';
  priceUnit: string;
  onUnitChange: (u: 'kg' | 'litre' | 'piece') => void;
  onPriceUnitChange: (v: string) => void;
  t: (key: string) => string;
}) {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('inventory.field_unit_type')}
        </label>
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as 'kg' | 'litre' | 'piece')}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="piece">{t('inventory.unit_piece')}</option>
          <option value="kg">{t('inventory.unit_kg')}</option>
          <option value="litre">{t('inventory.unit_litre')}</option>
        </select>
      </div>
      <PriceUnitField priceUnit={priceUnit} onChange={onPriceUnitChange} t={t} />
    </>
  );
}

function PriceUnitField({
  priceUnit,
  onChange,
  t,
}: {
  priceUnit: string;
  onChange: (v: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {t('inventory.field_price_unit')}
      </label>
      <input
        type="text"
        value={priceUnit}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder={t('inventory.placeholder_price_unit')}
      />
    </div>
  );
}

function StockSection({
  stock,
  movementType,
  movementQty,
  movementReason,
  onMovementTypeChange,
  onMovementQtyChange,
  onMovementReasonChange,
  onOpenHistory,
  t,
}: {
  stock: string;
  movementType: StockMovementType;
  movementQty: string;
  movementReason: string;
  onMovementTypeChange: (type: StockMovementType) => void;
  onMovementQtyChange: (qty: string) => void;
  onMovementReasonChange: (reason: string) => void;
  onOpenHistory: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-700">{t('inventory.field_current_stock')}</p>
          <p className="text-2xl font-bold text-gray-900">{stock}</p>
        </div>
        <button
          type="button"
          onClick={onOpenHistory}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 active:bg-gray-50"
        >
          <History className="h-4 w-4" />
          {t('stock.view_history')}
        </button>
      </div>

      <p className="text-sm font-medium text-gray-800">{t('stock.record_movement')}</p>
      <div className="flex gap-1 rounded-xl bg-white p-1 border border-gray-200">
        {MOVEMENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onMovementTypeChange(type)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold ${
              movementType === type
                ? 'bg-green-600 text-white'
                : 'text-gray-600 active:bg-gray-100'
            }`}
          >
            {type === 'IN'
              ? t('stock.type_in')
              : type === 'OUT'
                ? t('stock.type_out')
                : t('stock.type_adjustment')}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">
          {movementType === 'ADJUSTMENT'
            ? t('stock.field_new_stock_level')
            : t('stock.field_quantity')}
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={movementQty}
          onChange={(e) => onMovementQtyChange(e.target.value)}
          placeholder={movementType === 'ADJUSTMENT' ? stock : '0'}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">
          {t('stock.field_reason')}
        </label>
        <input
          type="text"
          value={movementReason}
          onChange={(e) => onMovementReasonChange(e.target.value)}
          placeholder={t('stock.placeholder_reason')}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );
}
