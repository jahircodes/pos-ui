/**
 * Full-screen cash checkout: sale total, tendered amount, change due, and confirm.
 */
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

interface CashPaymentSheetProps {
  /** Bill total in shop currency */
  cartTotal: number;
  /** Called when staff confirms a sufficient tender */
  onConfirm: () => void;
  /** Close without completing */
  onClose: () => void;
}

/** Parses a loose decimal string; returns null if empty or invalid */
function parseTenderedAmount(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '');
  if (trimmed === '') return null;
  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function CashPaymentSheet({ cartTotal, onConfirm, onClose }: CashPaymentSheetProps) {
  const { t } = useTranslation();
  const [tenderedInput, setTenderedInput] = useState('');

  useEffect(() => {
    setTenderedInput('');
  }, [cartTotal]);

  const tenderedAmount = useMemo(() => parseTenderedAmount(tenderedInput), [tenderedInput]);

  const isTenderSufficient =
    tenderedAmount !== null && tenderedAmount + 1e-6 >= cartTotal;

  const changeToReturn =
    tenderedAmount !== null && tenderedAmount > cartTotal
      ? Math.round((tenderedAmount - cartTotal) * 100) / 100
      : 0;

  const shortfall =
    tenderedAmount !== null && tenderedAmount < cartTotal
      ? Math.round((cartTotal - tenderedAmount) * 100) / 100
      : null;

  const handleTenderedChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTenderedInput(value);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-gray-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cash-payment-title"
    >
      <header className="shrink-0 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 active:bg-gray-200"
          aria-label={t('sales.cash_payment_back_aria')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 id="cash-payment-title" className="text-lg font-bold text-gray-900">
          {t('sales.cash_payment_title')}
        </h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500">{t('common.total')}</div>
          <div className="mt-1 text-3xl font-bold text-green-600">₹{cartTotal.toFixed(2)}</div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <label htmlFor="tendered-amount" className="text-sm font-medium text-gray-700">
            {t('sales.amount_customer_paid')}
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:ring-2 focus-within:ring-green-500">
            <span className="text-lg font-semibold text-gray-600">₹</span>
            <input
              id="tendered-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              value={tenderedInput}
              onChange={(e) => handleTenderedChange(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          {isTenderSufficient ? (
            <>
              <div className="text-sm font-medium text-gray-500">{t('sales.change_to_return')}</div>
              <div
                className={`mt-1 text-2xl font-bold ${changeToReturn > 0 ? 'text-amber-700' : 'text-gray-700'}`}
              >
                ₹{changeToReturn.toFixed(2)}
              </div>
            </>
          ) : shortfall !== null && shortfall > 0 ? (
            <>
              <div className="text-sm font-medium text-gray-500">{t('sales.amount_still_needed')}</div>
              <div className="mt-1 text-2xl font-bold text-red-600">₹{shortfall.toFixed(2)}</div>
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-gray-500">{t('sales.change_to_return')}</div>
              <div className="mt-1 text-2xl font-bold text-gray-400">₹0.00</div>
            </>
          )}
        </div>

        <div className="mt-auto pb-6">
          <button
            type="button"
            disabled={!isTenderSufficient}
            onClick={onConfirm}
            className="w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition-colors active:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {t('sales.complete_cash_sale')}
          </button>
        </div>
      </div>
    </div>
  );
}
