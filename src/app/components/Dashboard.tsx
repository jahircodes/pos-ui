import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { TrendingUp, IndianRupee, ShoppingBag, FileText } from 'lucide-react';
import { getAppLocale } from '../../i18n.js';

interface DashboardProps {
  onNewSale: () => void;
  onViewProducts: () => void;
  onViewHistory: () => void;
}

function paymentMethodLabel(method: string, t: (key: string) => string) {
  if (method === 'cash') return t('sales.payment_cash');
  if (method === 'upi') return t('sales.payment_upi');
  return method;
}

export function Dashboard({ onNewSale, onViewProducts, onViewHistory }: DashboardProps) {
  const { t } = useTranslation();
  const transactions = useStore((state) => state.transactions);
  const dateLocale = getAppLocale();

  const todaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions
      .filter((t) => new Date(t.timestamp) >= today)
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  const yesterdaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= yesterday && transactionDate < today;
      })
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  const todaysProfit = useMemo(() => {
    return Math.round(todaysSales * 0.15);
  }, [todaysSales]);

  const yesterdaysProfit = useMemo(() => {
    return Math.round(yesterdaysSales * 0.15);
  }, [yesterdaysSales]);

  const recentTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions
      .filter((t) => new Date(t.timestamp) >= today)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 p-4 space-y-4">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg shadow-green-900/10">
          <div className="p-5 pb-4">
            <div className="flex items-center gap-2 text-white/90">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <IndianRupee className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold tracking-wide">{t('dashboard.sales')}</span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/70">
              {t('common.today')}
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
              ₹{todaysSales.toFixed(2)}
            </p>
          </div>
          <div className="border-t border-white/20 bg-black/10 px-5 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/80">{t('common.yesterday')}</span>
              <span className="text-base font-semibold tabular-nums text-white">
                ₹{yesterdaysSales.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-900">{t('dashboard.estimated_profit')}</span>
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              {t('common.percent_approx')}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-baseline justify-between gap-3 border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-500">{t('common.today')}</span>
              <span className="text-xl font-bold tabular-nums text-gray-900">₹{todaysProfit}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-gray-500">{t('common.yesterday')}</span>
              <span className="text-lg font-semibold tabular-nums text-gray-600">₹{yesterdaysProfit}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onNewSale}
          className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-lg shadow-lg active:bg-green-700 transition-colors"
        >
          {t('dashboard.new_sale')}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onViewProducts}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-sm font-semibold text-gray-900">{t('dashboard.products')}</div>
          </button>
          <button
            onClick={onViewHistory}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-sm font-semibold text-gray-900">{t('dashboard.reports')}</div>
          </button>
        </div>

        {recentTransactions.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">{t('dashboard.recent_sales')}</h2>
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">₹{transaction.total}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.timestamp).toLocaleTimeString(dateLocale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-600 uppercase">
                    {paymentMethodLabel(transaction.paymentMethod, t)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
