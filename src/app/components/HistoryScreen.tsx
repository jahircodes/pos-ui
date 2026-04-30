/**
 * Sales history with Today / This week / This month / Custom filters, export (UI-only), and invoice detail.
 */
import { useState, useMemo, useEffect } from 'react';
import { useStore, Transaction } from '../store';
import { Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceModal } from './InvoiceModal';

type HistoryFilter = 'today' | 'week' | 'month' | 'custom';

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateInputLocal(value: string): Date {
  const [y, mo, day] = value.split('-').map(Number);
  return new Date(y, mo - 1, day, 0, 0, 0, 0);
}

function endOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfCurrentMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function rollingWeekStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

const FILTER_CHIPS: { id: HistoryFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'custom', label: 'Custom' },
];

export function HistoryScreen() {
  const transactions = useStore((state) => state.transactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(
    null,
  );
  const [filter, setFilter] = useState<HistoryFilter>('today');
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(null);
  const [customDraftFrom, setCustomDraftFrom] = useState(() => toDateInputValue(new Date()));
  const [customDraftTo, setCustomDraftTo] = useState(() => toDateInputValue(new Date()));
  const [isCustomSheetOpen, setIsCustomSheetOpen] = useState(false);
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);

  useEffect(() => {
    if (filter !== 'custom') {
      setIsCustomSheetOpen(false);
    }
  }, [filter]);

  const filterSummaryLabel = useMemo(() => {
    switch (filter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This week (last 7 days)';
      case 'month':
        return 'This month';
      case 'custom':
        if (customRange) {
          const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
          return `${customRange.from.toLocaleDateString('en-IN', opts)} – ${customRange.to.toLocaleDateString('en-IN', opts)}`;
        }
        return 'Custom (set dates)';
      default:
        return '';
    }
  }, [filter, customRange]);

  const filteredTransactions = useMemo(() => {
    const list = transactions.filter((t) => {
      const transactionDate = new Date(t.timestamp);
      switch (filter) {
        case 'today':
          return transactionDate >= startOfToday();
        case 'week':
          return transactionDate >= rollingWeekStart();
        case 'month':
          return transactionDate >= startOfCurrentMonth();
        case 'custom': {
          if (!customRange) return false;
          const from = parseDateInputLocal(toDateInputValue(customRange.from));
          const to = endOfDayLocal(parseDateInputLocal(toDateInputValue(customRange.to)));
          return transactionDate >= from && transactionDate <= to;
        }
        default:
          return true;
      }
    });
    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [transactions, filter, customRange]);

  const handleFilterChipClick = (id: HistoryFilter) => {
    setFilter(id);
    if (id === 'custom') {
      if (customRange) {
        setCustomDraftFrom(toDateInputValue(customRange.from));
        setCustomDraftTo(toDateInputValue(customRange.to));
      } else {
        const t = new Date();
        setCustomDraftFrom(toDateInputValue(t));
        setCustomDraftTo(toDateInputValue(t));
      }
      setIsCustomSheetOpen(true);
    }
  };

  const handleApplyCustomRange = () => {
    const from = parseDateInputLocal(customDraftFrom);
    const to = parseDateInputLocal(customDraftTo);
    if (from.getTime() > to.getTime()) {
      toast.error('From date must be before or equal to To date');
      return;
    }
    setCustomRange({ from, to });
    setIsCustomSheetOpen(false);
    toast.success('Date range applied');
  };

  const handleExportDownloadClick = () => {
    toast.message('Download coming soon', {
      description: 'CSV export will be available in a future update.',
    });
    setIsExportSheetOpen(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 pb-16">
      <div className="shrink-0 border-b border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">Sales History</h1>
          <button
            type="button"
            onClick={() => setIsExportSheetOpen(true)}
            aria-label="Export report"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-green-700 active:bg-gray-100"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleFilterChipClick(chip.id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                filter === chip.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {filter === 'custom' && !customRange ? (
          <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <p className="font-medium text-gray-700">Choose a date range</p>
            <p className="mt-1 text-sm text-gray-500">
              Tap Custom again or set dates to see sales in that period.
            </p>
            <button
              type="button"
              onClick={() => setIsCustomSheetOpen(true)}
              className="mt-4 w-full rounded-xl bg-green-600 py-3 font-semibold text-white active:bg-green-700"
            >
              Set dates
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="mt-12 text-center text-gray-500">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() => setSelectedTransaction(transaction)}
                className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm active:bg-gray-50"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="text-xl font-bold text-gray-900">
                    ₹{transaction.total.toFixed(2)}
                  </div>
                  <div className="rounded bg-gray-100 px-2 py-1 text-xs font-medium uppercase text-gray-600">
                    {transaction.paymentMethod}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(transaction.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {transaction.items.length} item(s)
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isCustomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-w-md sm:rounded-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Custom range</h2>
              <button
                type="button"
                onClick={() => setIsCustomSheetOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="history-from" className="mb-1.5 block text-sm font-medium text-gray-700">
                  From
                </label>
                <input
                  id="history-from"
                  type="date"
                  value={customDraftFrom}
                  onChange={(e) => setCustomDraftFrom(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="history-to" className="mb-1.5 block text-sm font-medium text-gray-700">
                  To
                </label>
                <input
                  id="history-to"
                  type="date"
                  value={customDraftTo}
                  onChange={(e) => setCustomDraftTo(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCustomSheetOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-800 active:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomRange}
                className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white active:bg-green-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {isExportSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-w-md sm:rounded-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Export report</h2>
              <button
                type="button"
                onClick={() => setIsExportSheetOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              <span className="font-medium text-gray-800">Scope:</span> {filterSummaryLabel}
            </p>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 text-sm font-medium text-gray-900">Format</div>
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white p-3">
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-green-600 bg-green-600"
                  aria-hidden
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="text-sm font-medium text-gray-900">CSV</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setIsExportSheetOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-800 active:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExportDownloadClick}
                className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white active:bg-green-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <InvoiceModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
