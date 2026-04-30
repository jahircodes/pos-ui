import { useMemo } from 'react';
import { useStore } from '../store';
import { TrendingUp, IndianRupee, ShoppingBag, FileText } from 'lucide-react';

interface DashboardProps {
  onNewSale: () => void;
  onViewProducts: () => void;
  onViewHistory: () => void;
}

export function Dashboard({ onNewSale, onViewProducts, onViewHistory }: DashboardProps) {
  const transactions = useStore((state) => state.transactions);

  const todaysSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions
      .filter((t) => new Date(t.timestamp) >= today)
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  const todaysProfit = useMemo(() => {
    return Math.round(todaysSales * 0.15);
  }, [todaysSales]);

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
        <h1 className="text-2xl font-bold text-gray-900">My Shop</h1>
        <p className="text-sm text-gray-600">Dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 p-4 space-y-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Today's Sales</span>
          </div>
          <div className="text-4xl font-bold">₹{todaysSales.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Estimated Profit</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹{todaysProfit}</div>
        </div>

        <button
          onClick={onNewSale}
          className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-lg shadow-lg active:bg-green-700 transition-colors"
        >
          + New Sale
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onViewProducts}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-sm font-semibold text-gray-900">Products</div>
          </button>
          <button
            onClick={onViewHistory}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-sm font-semibold text-gray-900">Reports</div>
          </button>
        </div>

        {recentTransactions.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Recent Sales</h2>
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">₹{transaction.total}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-600 uppercase">
                    {transaction.paymentMethod}
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
