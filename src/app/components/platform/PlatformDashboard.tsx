/**
 * Platform (super admin) shell: sidebar layout, KPIs, shops table, plans, payments, alerts.
 */
import { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Search } from 'lucide-react';
import { Sidebar, type PlatformNavId } from './Sidebar';
import { Topbar } from './Topbar';
import { MetricCard } from './MetricCard';
import { Table } from './Table';
import { Badge } from './Badge';
import { AlertCard } from './AlertCard';

interface ShopRow {
  shopId: string;
  shopName: string;
  ownerName: string;
  plan: string;
  status: 'active' | 'suspended';
}

interface PlanRow {
  planId: string;
  name: string;
  price: string;
  maxProducts: number;
  maxStaff: number;
}

interface PaymentRow {
  paymentId: string;
  shopName: string;
  amount: string;
  status: 'success' | 'failed';
  date: string;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  meta?: string;
}

/** Use `[]` to preview the “No shops yet” empty state. */
const MOCK_SHOPS: ShopRow[] = [
  {
    shopId: '1',
    shopName: 'Fresh Mart Koramangala',
    ownerName: 'Anita Rao',
    plan: 'Pro',
    status: 'active',
  },
  {
    shopId: '2',
    shopName: 'City Grocery JP Nagar',
    ownerName: 'Vikram Mehta',
    plan: 'Starter',
    status: 'active',
  },
  {
    shopId: '3',
    shopName: 'Quick Stop Indiranagar',
    ownerName: 'Sarah Khan',
    plan: 'Pro',
    status: 'suspended',
  },
];

const MOCK_PLANS: PlanRow[] = [
  { planId: 'p1', name: 'Starter', price: '₹499/mo', maxProducts: 200, maxStaff: 2 },
  { planId: 'p2', name: 'Pro', price: '₹999/mo', maxProducts: 2000, maxStaff: 10 },
  { planId: 'p3', name: 'Enterprise', price: 'Custom', maxProducts: 99999, maxStaff: 999 },
];

const MOCK_PAYMENTS: PaymentRow[] = [
  {
    paymentId: 'pay1',
    shopName: 'Fresh Mart Koramangala',
    amount: '₹999.00',
    status: 'success',
    date: '30 Apr 2026',
  },
  {
    paymentId: 'pay2',
    shopName: 'City Grocery JP Nagar',
    amount: '₹499.00',
    status: 'failed',
    date: '29 Apr 2026',
  },
  {
    paymentId: 'pay3',
    shopName: 'Quick Stop Indiranagar',
    amount: '₹999.00',
    status: 'success',
    date: '28 Apr 2026',
  },
];

/** Use `[]` to preview the “No alerts” empty state. */
const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'a1',
    title: 'Failed renewal payment',
    description: 'City Grocery JP Nagar — card declined after 3 retries.',
    severity: 'high',
    meta: '29 Apr 2026 · Auto-retry in 24h',
  },
  {
    id: 'a2',
    title: 'Subscription expiring soon',
    description: 'Fresh Mart Koramangala — Pro plan ends in 5 days.',
    severity: 'medium',
    meta: 'Renews 5 May 2026',
  },
];

const PAGE_TITLES: Record<PlatformNavId, string> = {
  dashboard: 'Dashboard',
  shops: 'Shops',
  subscriptions: 'Subscriptions',
  payments: 'Payments',
  alerts: 'Alerts',
  settings: 'Settings',
};

/** Decorative bar chart placeholder for revenue (no real data). */
function RevenueChartPlaceholder() {
  const barHeights = [40, 65, 45, 80, 55, 70, 50];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md sm:rounded-xl sm:p-6 sm:shadow-sm">
      <p className="text-base font-semibold text-gray-900 sm:text-sm">Revenue trend</p>
      <p className="mt-1 text-sm text-gray-500 sm:mt-0.5 sm:text-xs">Placeholder · last 7 days</p>
      <div className="mt-5 flex h-32 items-end justify-between gap-1.5 px-0.5 sm:mt-6 sm:h-36 sm:gap-2 sm:px-1">
        {barHeights.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-emerald-500/90"
              style={{ height: `${h}%` }}
              title={`Day ${i + 1}`}
            />
            <span className="text-[10px] text-gray-400">D{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full platform admin layout and views (UI only). */
export function PlatformDashboard() {
  const [activeNav, setActiveNav] = useState<PlatformNavId>('dashboard');
  const [shopSearch, setShopSearch] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const shops = MOCK_SHOPS;
  const alerts = MOCK_ALERTS;

  const filteredShops = useMemo(() => {
    const q = shopSearch.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (s) =>
        s.shopName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q),
    );
  }, [shops, shopSearch]);

  const handleLogout = () => {
    toast.message('Logout (UI only)', { description: 'Connect to your auth flow here.' });
  };

  const handleNavigate = (id: PlatformNavId) => {
    setActiveNav(id);
    setIsMobileNavOpen(false);
  };

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileNavOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Toaster position="top-center" richColors />
      <div className="relative flex min-h-0 flex-1">
        <button
          type="button"
          aria-label="Close menu"
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
            isMobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setIsMobileNavOpen(false)}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,90vw)] max-w-full flex-col shadow-2xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
            isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar
            activeId={activeNav}
            onNavigate={handleNavigate}
            onRequestClose={() => setIsMobileNavOpen(false)}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col lg:min-h-screen">
          <Topbar
            title={PAGE_TITLES[activeNav]}
            onLogout={handleLogout}
            onMenuClick={() => setIsMobileNavOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {activeNav === 'dashboard' && (
              <div className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                  <MetricCard label="Total shops" value={128} />
                  <MetricCard label="Active subscriptions" value={112} hint="Excludes suspended" />
                  <MetricCard label="Monthly revenue" value="₹4.2L" hint="Approx. MRR" />
                  <MetricCard label="New signups (7d)" value={14} />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <RevenueChartPlaceholder />
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md sm:rounded-xl sm:p-6 sm:shadow-sm">
                    <p className="text-base font-semibold text-gray-900 sm:text-sm">Quick pulse</p>
                    <ul className="mt-4 space-y-0 text-base text-gray-600 sm:space-y-1 sm:text-sm">
                      <li className="flex min-h-12 items-center justify-between gap-3 border-b border-gray-100 py-2 sm:min-h-0 sm:py-2">
                        <span className="min-w-0 flex-1 leading-snug">Failed payments (24h)</span>
                        <span className="shrink-0 text-lg font-semibold tabular-nums text-red-600 sm:text-base">
                          3
                        </span>
                      </li>
                      <li className="flex min-h-12 items-center justify-between gap-3 border-b border-gray-100 py-2 sm:min-h-0 sm:py-2">
                        <span className="min-w-0 flex-1 leading-snug">Expiring in 7 days</span>
                        <span className="shrink-0 text-lg font-semibold tabular-nums text-amber-700 sm:text-base">
                          8
                        </span>
                      </li>
                      <li className="flex min-h-12 items-center justify-between gap-3 py-2 sm:min-h-0 sm:py-2">
                        <span className="min-w-0 flex-1 leading-snug">Trials ending</span>
                        <span className="shrink-0 text-lg font-semibold tabular-nums text-gray-900 sm:text-base">
                          5
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeNav === 'shops' && (
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search shops, owner, plan…"
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-base outline-none ring-emerald-500/20 focus:ring-2 sm:min-h-0 sm:py-2.5 sm:text-sm"
                  />
                </div>
                {shops.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center shadow-md sm:rounded-xl sm:py-16 sm:shadow-sm">
                    <p className="text-base font-medium text-gray-900">No shops yet</p>
                    <p className="mt-1 text-sm text-gray-500">When shops onboard, they will appear here.</p>
                  </div>
                ) : (
                  <Table<ShopRow>
                    getRowKey={(row) => row.shopId}
                    emptyMessage="No shops match your search."
                    data={filteredShops}
                    columns={[
                      { key: 'shopName', header: 'Shop Name' },
                      { key: 'ownerName', header: 'Owner Name' },
                      { key: 'plan', header: 'Plan' },
                      {
                        key: 'status',
                        header: 'Status',
                        render: (row) => (
                          <Badge variant={row.status === 'active' ? 'success' : 'danger'}>
                            {row.status === 'active' ? 'Active' : 'Suspended'}
                          </Badge>
                        ),
                      },
                      {
                        key: 'shopId',
                        header: 'Actions',
                        className: 'text-right',
                        render: (row) => (
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={() => toast.message('View shop', { description: row.shopName })}
                              className="min-h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:min-h-0 sm:py-1.5"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                toast.message('Suspend shop (UI only)', { description: row.shopName })
                              }
                              className="min-h-10 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 sm:min-h-0 sm:py-1.5"
                            >
                              Suspend
                            </button>
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
              </div>
            )}

            {activeNav === 'subscriptions' && (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md sm:rounded-xl sm:shadow-sm">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-900">Plans</h2>
                    <p className="text-xs text-gray-500">Subscription tiers shown to shops</p>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {MOCK_PLANS.map((plan) => (
                      <li
                        key={plan.planId}
                        className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-500">
                            {plan.price} · Max {plan.maxProducts.toLocaleString()} products · Max{' '}
                            {plan.maxStaff} staff
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toast.message('Edit plan (UI only)', { description: plan.name })}
                          className="min-h-11 w-full shrink-0 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 sm:min-h-0 sm:w-auto sm:py-2"
                        >
                          Edit Plan
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeNav === 'payments' && (
              <Table<PaymentRow>
                getRowKey={(row) => row.paymentId}
                data={MOCK_PAYMENTS}
                columns={[
                  { key: 'shopName', header: 'Shop Name' },
                  { key: 'amount', header: 'Amount' },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (row) => (
                      <Badge variant={row.status === 'success' ? 'success' : 'danger'}>
                        {row.status === 'success' ? 'Success' : 'Failed'}
                      </Badge>
                    ),
                  },
                  { key: 'date', header: 'Date' },
                ]}
              />
            )}

            {activeNav === 'alerts' && (
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center shadow-md sm:rounded-xl sm:py-16 sm:shadow-sm">
                    <p className="text-base font-medium text-gray-900">No alerts</p>
                    <p className="mt-1 text-sm text-gray-500">You are all caught up.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((a) => (
                      <AlertCard
                        key={a.id}
                        title={a.title}
                        description={a.description}
                        severity={a.severity}
                        meta={a.meta}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeNav === 'settings' && (
              <div className="max-w-2xl space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md sm:rounded-xl sm:p-6 sm:shadow-sm">
                  <h2 className="text-base font-semibold text-gray-900 sm:text-sm">Platform settings</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500 sm:mt-1">
                    Placeholder for billing webhooks, email templates, and feature flags.
                  </p>
                  <button
                    type="button"
                    onClick={() => toast.message('Settings (UI only)')}
                    className="mt-4 min-h-11 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:min-h-0 sm:w-auto sm:py-2"
                  >
                    Open settings
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
