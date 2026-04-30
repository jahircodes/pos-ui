/**
 * Invoice detail modal with screen layout and browser print (Phase 1: window.print + print CSS).
 */
import { Transaction } from '../store';
import { X, Receipt, Printer } from 'lucide-react';
import { formatQuantityDisplay } from '../utils/formatWeight';

interface InvoiceModalProps {
  transaction: Transaction;
  onClose: () => void;
}

/** Opens the system print dialog for the invoice content in #invoice-print-area. */
function handlePrintInvoice() {
  window.print();
}

export function InvoiceModal({ transaction, onClose }: InvoiceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div
        id="invoice-print-area"
        className="max-h-[80vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-w-md sm:rounded-2xl"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Receipt className="h-6 w-6 shrink-0 text-green-600 print:text-black" />
            <h2 className="text-xl font-bold text-gray-900 print:text-black">Invoice</h2>
          </div>
          <div className="flex shrink-0 gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrintInvoice}
              aria-label="Print invoice"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
            >
              <Printer className="h-5 w-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="space-y-4 text-gray-900 print:text-black">
          <div className="border-b border-gray-200 pb-3 print:border-gray-400">
            <div className="text-sm text-gray-600 print:text-gray-700">Date</div>
            <div className="font-medium">
              {new Date(transaction.timestamp).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-medium">Items</div>
            <div className="space-y-2">
              {transaction.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between border-b border-gray-100 py-2 last:border-0 print:border-gray-300"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-gray-600 print:text-gray-700">
                      ₹{item.product.price} ×{' '}
                      {formatQuantityDisplay(item.quantity, item.product.unit)}
                    </div>
                  </div>
                  <div className="shrink-0 font-semibold">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-gray-900 pt-3 print:border-black">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Total</div>
              <div className="text-2xl font-bold text-green-600 print:text-black">
                ₹{transaction.total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 print:border print:border-gray-300 print:bg-white">
            <div className="text-sm text-gray-600 print:text-gray-700">Payment Method</div>
            <div className="font-medium uppercase">{transaction.paymentMethod}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
