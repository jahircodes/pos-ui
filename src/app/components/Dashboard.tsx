import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePendingAlerts, useStore } from '../store';
import { useAuthStore } from '../authStore';
import { Bell, ChevronRight, IndianRupee, ShoppingBag, FileText, TrendingUp, X } from 'lucide-react';
import { getAppLocale } from '../../i18n.js';
import { AlertsSheet } from './AlertsSheet';

export type InventoryFocus = {
  stockFilter?: 'low' | 'out';
  productId?: string;
};

interface DashboardProps {
  onNewSale: () => void;
  onViewProducts: (focus?: InventoryFocus) => void;
  onViewAlerts: () => void;
  onViewHistory: () => void;
}

function paymentMethodLabel(method: string, t: (key: string) => string) {
  if (method === 'cash') return t('sales.payment_cash');
  if (method === 'upi') return t('sales.payment_upi');
  return method;
}

export function Dashboard({
  onNewSale,
  onViewProducts,
  onViewAlerts,
  onViewHistory,
}: DashboardProps) {
  const { t } = useTranslation();
  const shopName = useAuthStore((s) => s.shopName);
  const transactions = useStore((state) => state.transactions);
  const pendingAlerts = usePendingAlerts();
  const dismissAllPendingAlerts = useStore((s) => s.dismissAllPendingAlerts);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const lowCount = pendingAlerts.filter((a) => a.type === 'LOW_STOCK').length;
  const outCount = pendingAlerts.filter((a) => a.type === 'OUT_OF_STOCK').length;

  const dashboardTitle = shopName.trim() || t('dashboard.title');
  const dateLocale = getAppLocale();

  const todaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions
      .filter((tx) => new Date(tx.timestamp) >= today)
      .reduce((sum, tx) => sum + tx.total, 0);
  }, [transactions]);

  const yesterdaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return transactions
      .filter((tx) => {
        const transactionDate = new Date(tx.timestamp);
        return transactionDate >= yesterday && transactionDate < today;
      })
      .reduce((sum, tx) => sum + tx.total, 0);
  }, [transactions]);

  const todaysProfit = useMemo(() => Math.round(todaysSales * 0.15), [todaysSales]);
  const yesterdaysProfit = useMemo(() => Math.round(yesterdaysSales * 0.15), [yesterdaysSales]);

  const recentTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions
      .filter((tx) => new Date(tx.timestamp) >= today)
      .slice(0, 5);
  }, [transactions]);

  const handleOpenProductFromAlert = (productId: string) => {
    const alert = pendingAlerts.find((a) => a.productId === productId);
    onViewProducts({
      productId,
      stockFilter: alert?.type === 'OUT_OF_STOCK' ? 'out' : 'low',
    });
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <DashboardHeader title={dashboardTitle} subtitle={t('dashboard.subtitle')} />

      <div className="flex-1 space-y-4 overflow-y-auto p-4 pb-20">
        {pendingAlerts.length > 0 ? (
          <AlertsSummaryCard
            lowCount={lowCount}
            outCount={outCount}
            onViewAll={onViewAlerts}
            onDismissAll={dismissAllPendingAlerts}
            t={t}
          />
        ) : null}

        <SalesSummaryCard
          todaysSales={todaysSales}
          yesterdaysSales={yesterdaysSales}
          t={t}
        />

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <ProfitCardHeader t={t} />
          <div className="mt-4 space-y-3">
            <div className="flex items-baseline justify-between gap-3 border-b border-gray-100 pb-3">
              <span className="text-sm text-gray-500">{t('common.today')}</span>
              <span className="text-xl font-bold tabular-nums text-gray-900">₹{todaysProfit}</span>
            </div>
            <ProfitYesterdayRow yesterdaysProfit={yesterdaysProfit} t={t} />
          </div>
        </div>

        <button
          type="button"
          onClick={onNewSale}
          className="w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white shadow-lg active:bg-green-700"
        >
          {t('dashboard.new_sale')}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onViewProducts()}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
          >
            <ShoppingBag className="mb-2 h-6 w-6 text-green-600" />
            <div className="text-sm font-semibold text-gray-900">{t('dashboard.products')}</div>
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
          >
            <FileText className="mb-2 h-6 w-6 text-green-600" />
            <div className="text-sm font-semibold text-gray-900">{t('dashboard.reports')}</div>
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">{t('dashboard.recent_sales')}</h2>
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
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
                  <PaymentLabel method={transaction.paymentMethod} t={t} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {isAlertsOpen ? (
        <AlertsSheet
          onClose={() => setIsAlertsOpen(false)}
          onOpenProduct={handleOpenProductFromAlert}
        />
      ) : null}
    </div>
  );
}

function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  );
}

function AlertsSummaryCard({
  lowCount,
  outCount,
  onViewAll,
  onDismissAll,
  t,
}: {
  lowCount: number;
  outCount: number;
  onViewAll: () => void;
  onDismissAll: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-black/[0.03]">
      <button
        type="button"
        onClick={onViewAll}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left active:bg-gray-50/80"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Bell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-gray-900">{t('alerts.dashboard_title')}</p>
          <p className="text-[11px] leading-tight text-gray-500">{t('alerts.dashboard_hint')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {outCount > 0 ? (
            <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-red-700">
              {outCount} {t('alerts.badge_out_short')}
            </span>
          ) : null}
          {lowCount > 0 ? (
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-800">
              {lowCount} {t('alerts.badge_low_short')}
            </span>
          ) : null}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDismissAll}
        aria-label={t('alerts.action_dismiss_all')}
        className="flex shrink-0 items-center justify-center border-l border-gray-100 px-3 text-gray-500 active:bg-gray-50"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function SalesSummaryCard({
  todaysSales,
  yesterdaysSales,
  t,
}: {
  todaysSales: number;
  yesterdaysSales: number;
  t: (key: string) => string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg shadow-green-900/10">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2 text-white/90">
          <SalesIcon />
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
  );
}

function SalesIcon() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
      <IndianRupee className="h-5 w-5" />
    </div>
  );
}

function ProfitCardHeader({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50">
        <TrendingUp className="h-5 w-5 text-green-600" />
      </div>
      <span className="text-sm font-semibold text-gray-900">{t('dashboard.estimated_profit')}</span>
      <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
        {t('common.percent_approx')}
      </span>
    </div>
  );
}

function ProfitYesterdayRow({
  yesterdaysProfit,
  t,
}: {
  yesterdaysProfit: number;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-gray-500">{t('common.yesterday')}</span>
      <span className="text-lg font-semibold tabular-nums text-gray-600">₹{yesterdaysProfit}</span>
    </div>
  );
}

function PaymentLabel({ method, t }: { method: string; t: (key: string) => string }) {
  return (
    <div className="text-xs font-medium uppercase text-gray-600">
      {paymentMethodLabel(method, t)}
    </div>
  );
}
