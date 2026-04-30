import { useState } from 'react';
import { Toaster } from 'sonner';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { SaleScreen } from './components/SaleScreen';
import { ProductsScreen } from './components/ProductsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { StaffScreen } from './components/StaffScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'sale' | 'products' | 'history' | 'staff' | 'settings'
  >('home');

  const handleNewSale = () => {
    setActiveTab('sale');
  };

  const handleSaleComplete = () => {
    setActiveTab('home');
  };

  return (
    <div className="size-full flex flex-col bg-gray-50">
      <Toaster position="top-center" richColors />

      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && (
          <Dashboard
            onNewSale={handleNewSale}
            onViewProducts={() => setActiveTab('products')}
            onViewHistory={() => setActiveTab('history')}
          />
        )}
        {activeTab === 'sale' && <SaleScreen onComplete={handleSaleComplete} />}
        {activeTab === 'products' && <ProductsScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'staff' && <StaffScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
