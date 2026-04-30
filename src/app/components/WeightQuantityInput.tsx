import { useState } from 'react';

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
  const [kg, setKg] = useState('0');
  const [grams, setGrams] = useState('');

  const predefinedOptions = [
    { label: '250 g', kg: 0.25 },
    { label: '500 g', kg: 0.5 },
    { label: '1 kg', kg: 1 },
    { label: '2 kg', kg: 2 },
  ];

  const getTotalKg = (): number => {
    const k = parseInt(kg) || 0;
    const g = parseInt(grams) || 0;
    return k + g / 1000;
  };

  const handlePredefinedClick = (value: number) => {
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
            <p className="text-sm text-gray-600 mt-1">₹{pricePerKg}/KG</p>
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
              Quick Select
            </label>
            <div className="grid grid-cols-4 gap-2">
              {predefinedOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handlePredefinedClick(option.kg)}
                  className={`py-3 rounded-xl font-semibold text-sm transition-colors ${
                    getTotalKg() === option.kg
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Manual Input
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Kilograms</label>
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
                <label className="block text-xs text-gray-500 mb-1">g (0-999)</label>
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
            <p className="text-sm text-center text-gray-600 mt-3 font-semibold">
              {getDisplayText()}
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="text-sm text-gray-600 mb-1">Total Price</div>
            <div className="text-3xl font-bold text-green-600">₹{total.toFixed(2)}</div>
          </div>

          <button
            onClick={() => getTotalKg() > 0 && onConfirm(getTotalKg())}
            disabled={getTotalKg() <= 0}
            className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-lg active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
