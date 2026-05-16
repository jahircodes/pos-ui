import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product } from '../store';
import { X, Plus, Minus } from 'lucide-react';
import { formatWeight, formatLitres } from '../utils/formatWeight';

interface QuantityModalProps {
  product: Product;
  onConfirm: (quantity: number) => void;
  onClose: () => void;
}

export function QuantityModal({ product, onConfirm, onClose }: QuantityModalProps) {
  const { t } = useTranslation();
  const isDecimalBased = product.unit === 'kg' || product.unit === 'litre';
  const [internalValue, setInternalValue] = useState<number>(isDecimalBased ? 0.5 : 1);

  const quickSelects = isDecimalBased
    ? [0.25, 0.5, 1, 2]
    : [1, 2, 5, 10];

  const increment = isDecimalBased ? 0.25 : 1;

  const formatForDisplay = (value: number): string => {
    if (product.unit === 'kg') {
      return formatWeight(value);
    } else if (product.unit === 'litre') {
      return formatLitres(value);
    }
    return value.toString();
  };

  const parseFromDisplay = (text: string): number | null => {
    if (!isDecimalBased) {
      const num = parseInt(text);
      return isNaN(num) ? null : num;
    }

    const unitLarge = product.unit === 'kg' ? 'kg' : 'L';
    const unitSmall = product.unit === 'kg' ? 'g' : 'ml';

    let total = 0;

    const largeMatch = text.match(new RegExp(`(\\d+)\\s*${unitLarge}`, 'i'));
    if (largeMatch) {
      total += parseFloat(largeMatch[1]);
    }

    const smallMatch = text.match(new RegExp(`(\\d+)\\s*${unitSmall}`, 'i'));
    if (smallMatch) {
      total += parseFloat(smallMatch[1]) / 1000;
    }

    if (total === 0) {
      const num = parseFloat(text);
      if (!isNaN(num)) {
        total = num;
      }
    }

    return total > 0 ? total : null;
  };

  const handleIncrement = () => {
    const newVal = internalValue + increment;
    setInternalValue(newVal);
  };

  const handleDecrement = () => {
    const newVal = Math.max(increment, internalValue - increment);
    setInternalValue(newVal);
  };

  const handleQuickSelect = (value: number) => {
    setInternalValue(value);
  };

  const handleInputChange = (value: string) => {
    const parsed = parseFromDisplay(value);
    if (parsed !== null) {
      setInternalValue(parsed);
    }
  };

  const handleConfirm = () => {
    if (internalValue > 0) {
      onConfirm(internalValue);
    }
  };

  const total = internalValue * product.price;
  const displayValue = formatForDisplay(internalValue);

  const hintKey =
    product.unit === 'kg'
      ? t('sales.quantity_hint_kg')
      : product.unit === 'litre'
        ? t('sales.quantity_hint_litre')
        : t('sales.quantity_hint_piece');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              ₹{product.price}/{product.priceUnit || product.unit || t('sales.unit_item')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('sales.quantity_modal_title')}
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {quickSelects.map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickSelect(value)}
                  className={`py-3 rounded-xl font-semibold text-sm transition-colors ${
                    internalValue === value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  {formatForDisplay(value)}
                </button>
              ))}
            </div>

            <input
              type="text"
              inputMode={isDecimalBased ? 'text' : 'numeric'}
              value={displayValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-14 h-14 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200"
              >
                <Minus className="w-6 h-6" />
              </button>
              <p className="flex-1 text-sm text-center text-gray-600 font-semibold tabular-nums">
                {displayValue}
              </p>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-14 h-14 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              {isDecimalBased ? t('sales.quantity_hint_decimal', { hint: hintKey }) : hintKey}
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="text-sm text-gray-600 mb-1">{t('sales.total_price')}</div>
            <div className="text-3xl font-bold text-green-600">₹{total.toFixed(2)}</div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={internalValue <= 0}
            className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-lg active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('common.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
