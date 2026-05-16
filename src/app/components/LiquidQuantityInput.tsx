import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';

const STEP_LITRES = 0.25;

interface LiquidQuantityInputProps {
  onConfirm: (litres: number) => void;
  onClose: () => void;
  productName: string;
  pricePerLitre: number;
}

export function LiquidQuantityInput({
  onConfirm,
  onClose,
  productName,
  pricePerLitre,
}: LiquidQuantityInputProps) {
  const { t } = useTranslation();
  const [litres, setLitres] = useState('0');
  const [ml, setMl] = useState('');

  const predefinedOptions = useMemo(
    () =>
      [
        { labelKey: 'sales.preset_250_ml', litres: 0.25 },
        { labelKey: 'sales.preset_500_ml', litres: 0.5 },
        { labelKey: 'sales.preset_1_l', litres: 1 },
        { labelKey: 'sales.preset_2_l', litres: 2 },
      ] as const,
    [],
  );

  const getTotalLitres = (): number => {
    const l = parseInt(litres) || 0;
    const m = parseInt(ml) || 0;
    return l + m / 1000;
  };

  /** Sync litres + ml fields from a single total volume in litres. */
  const setTotalFromValue = (value: number) => {
    if (value <= 0) {
      setLitres('0');
      setMl('');
      return;
    }
    if (value < 1) {
      setLitres('0');
      setMl((value * 1000).toString());
    } else {
      const wholeLitres = Math.floor(value);
      const remainderMl = Math.round((value - wholeLitres) * 1000);
      setLitres(wholeLitres.toString());
      setMl(remainderMl > 0 ? remainderMl.toString() : '');
    }
  };

  const handlePredefinedClick = (value: number) => {
    setTotalFromValue(value);
  };

  const handleIncrement = () => {
    setTotalFromValue(getTotalLitres() + STEP_LITRES);
  };

  const handleDecrement = () => {
    const current = getTotalLitres();
    if (current <= STEP_LITRES) {
      setTotalFromValue(0);
      return;
    }
    setTotalFromValue(current - STEP_LITRES);
  };

  const handleLitresChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setLitres(value === '' ? '0' : value);
    }
  };

  const handleMlChange = (value: string) => {
    if (value === '') {
      setMl('');
      return;
    }

    if (!/^\d+$/.test(value)) return;

    const mlValue = parseInt(value);

    if (mlValue >= 1000) {
      const additionalLitres = Math.floor(mlValue / 1000);
      const remainderMl = mlValue % 1000;
      const currentLitres = parseInt(litres) || 0;
      setLitres((currentLitres + additionalLitres).toString());
      setMl(remainderMl > 0 ? remainderMl.toString() : '');
    } else {
      setMl(value);
    }
  };

  const getDisplayText = (): string => {
    const totalLitres = getTotalLitres();
    if (totalLitres < 1) {
      return `${Math.round(totalLitres * 1000)} ml`;
    }
    const l = Math.floor(totalLitres);
    const m = Math.round((totalLitres - l) * 1000);
    if (m === 0) {
      return `${l} L`;
    }
    return `${l} L ${m} ml`;
  };

  const total = getTotalLitres() * pricePerLitre;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{productName}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('sales.per_litre_short', { price: pricePerLitre })}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('sales.quick_select')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {predefinedOptions.map((option) => (
                <button
                  key={option.labelKey}
                  onClick={() => handlePredefinedClick(option.litres)}
                  className={`py-3 rounded-xl font-semibold text-sm transition-colors ${
                    getTotalLitres() === option.litres
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('sales.manual_input')}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t('sales.litres')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={litres}
                  onChange={(e) => handleLitresChange(e.target.value)}
                  className="w-full h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t('sales.ml_range')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ml}
                  onChange={(e) => handleMlChange(e.target.value)}
                  className="w-full h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-14 h-14 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200"
              >
                <Minus className="w-6 h-6" />
              </button>
              <p className="flex-1 text-sm text-center text-gray-600 font-semibold">
                {getDisplayText()}
              </p>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-14 h-14 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="text-sm text-gray-600 mb-1">{t('sales.total_price')}</div>
            <div className="text-3xl font-bold text-green-600">₹{total.toFixed(2)}</div>
          </div>

          <button
            onClick={() => getTotalLitres() > 0 && onConfirm(getTotalLitres())}
            disabled={getTotalLitres() <= 0}
            className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-lg active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('common.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
