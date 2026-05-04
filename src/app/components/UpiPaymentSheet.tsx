/**
 * UPI checkout: show scannable QR for the bill total and confirm when payment is received.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

/** Replace with your shop’s VPA when you add merchant settings */
const PLACEHOLDER_MERCHANT_UPI_ID = 'yourstore@upi';

interface UpiPaymentSheetProps {
  cartTotal: number;
  onConfirm: () => void;
  onClose: () => void;
}

/** Builds a UPI intent URL for QR scanners */
function buildUpiPayUri(amount: number, payeeAddress: string): string {
  const am = amount.toFixed(2);
  const params = new URLSearchParams({
    pa: payeeAddress,
    pn: 'POS Shop',
    am,
    cu: 'INR',
    tn: 'Purchase',
  });
  return `upi://pay?${params.toString()}`;
}

export function UpiPaymentSheet({ cartTotal, onConfirm, onClose }: UpiPaymentSheetProps) {
  const { t } = useTranslation();

  const upiUri = useMemo(
    () => buildUpiPayUri(cartTotal, PLACEHOLDER_MERCHANT_UPI_ID),
    [cartTotal],
  );

  const qrImageSrc = useMemo(() => {
    const encoded = encodeURIComponent(upiUri);
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encoded}`;
  }, [upiUri]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-gray-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upi-payment-title"
    >
      <header className="shrink-0 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 active:bg-gray-200"
          aria-label={t('sales.upi_payment_back_aria')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 id="upi-payment-title" className="text-lg font-bold text-gray-900">
          {t('sales.upi_payment_title')}
        </h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-500">{t('common.total')}</div>
          <div className="mt-1 text-3xl font-bold text-blue-600">₹{cartTotal.toFixed(2)}</div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-center text-sm text-gray-600">{t('sales.upi_scan_hint')}</p>
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-inner">
            <img
              src={qrImageSrc}
              alt=""
              width={280}
              height={280}
              className="size-[280px] max-w-full"
              decoding="async"
            />
          </div>
          <p className="mt-4 max-w-full break-all text-center text-xs text-gray-400">{upiUri}</p>
        </div>

        <div className="mt-auto pb-6">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors active:bg-blue-700"
          >
            {t('sales.complete_upi_sale')}
          </button>
        </div>
      </div>
    </div>
  );
}
