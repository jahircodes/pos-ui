import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react';

const STEP_KG = 0.25;

interface WeightQuantityInputProps {
  onConfirm: (kg: number) => void;
  onClose: () => void;
  productName: string;
  pricePerKg: number;
}

export function WeightQuantityInput({
  onConfirm,
  onClose,
  productName,
  pricePerKg,
}: WeightQuantityInputProps) {
  const { t } = useTranslation();
  const [kg, setKg] = useState('0');
  const [grams, setGrams] = useState('');

  const predefinedOptions = useMemo(
    () =>
      [
        { labelKey: 'sales.preset_250_g', kg: 0.25 },
        { labelKey: 'sales.preset_500_g', kg: 0.5 },
        { labelKey: 'sales.preset_1_kg', kg: 1 },
        { labelKey: 'sales.preset_2_kg', kg: 2 },
      ] as const,
    [],
  );

  const getTotalKg = (): number => {
    const k = parseInt(kg) || 0;
    const g = parseInt(grams) || 0;
    return k + g / 1000;
  };

  /** Sync kg + grams fields from a single total weight in kg. */
  const setTotalFromValue = (value: number) => {
    if (value <= 0) {
      setKg('0');
      setGrams('');
      return;
    }
    if (value < 1) {
      setKg('0');
      setGrams((value * 1000).toString());
    } else {
      const wholeKg = Math.floor(value);
      const remainderGrams = Math.round((value - wholeKg) * 1000);
      setKg(wholeKg.toString());
      setGrams(remainderGrams > 0 ? remainderGrams.toString() : '');
    }
  };

  const handlePredefinedClick = (value: number) => {
    setTotalFromValue(value);
  };

  const handleIncrement = () => {
    setTotalFromValue(getTotalKg() + STEP_KG);
  };

  const handleDecrement = () => {
    const current = getTotalKg();
    if (current <= STEP_KG) {
      setTotalFromValue(0);
      return;
    }
    setTotalFromValue(current - STEP_KG);
  };

  const handleKgChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setKg(value === '' ? '0' : value);
    }
  };

  const handleGramsChange = (value: string) => {
    if (value === '') {
      setGrams('');
      return;
    }

    if (!/^\d+$/.test(value)) return;

    const gramsValue = parseInt(value);

    if (gramsValue >= 1000) {
      const additionalKg = Math.floor(gramsValue / 1000);
      const remainderGrams = gramsValue % 1000;
      const currentKg = parseInt(kg) || 0;
      setKg((currentKg + additionalKg).toString());
      setGrams(remainderGrams > 0 ? remainderGrams.toString() : '');
    } else {
      setGrams(value);
    }
  };

  const getDisplayText = (): string => {
    const totalKg = getTotalKg();
    if (totalKg < 1) {
      return `${Math.round(totalKg * 1000)} g`;
    }
    const k = Math.floor(totalKg);
    const g = Math.round((totalKg - k) * 1000);
    if (g === 0) {
      return `${k} kg`;
    }
    return `${k} kg ${g} g`;
  };

  const total = getTotalKg() * pricePerKg;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{productName}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('sales.per_kg_short', { price: pricePerKg })}</p>
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
                  onClick={() => handlePredefinedClick(option.kg)}
                  className={`py-3 rounded-xl font-semibold text-sm transition-colors ${
                    getTotalKg() === option.kg
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
                <label className="block text-xs text-gray-500 mb-1">{t('sales.kilograms')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={kg}
                  onChange={(e) => handleKgChange(e.target.value)}
                  className="w-full h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">{t('sales.grams_range')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={grams}
                  onChange={(e) => handleGramsChange(e.target.value)}
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
            onClick={() => getTotalKg() > 0 && onConfirm(getTotalKg())}
            disabled={getTotalKg() <= 0}
            className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-lg active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('common.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
