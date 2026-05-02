import { useState } from 'react';
import { Toaster } from 'sonner';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ShopStaffHubScreen } from './components/ShopStaffHubScreen';
import { SaleProductsHubScreen, type SaleProductsHubTab } from './components/SaleProductsHubScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'shop' | 'history' | 'business' | 'settings'
  >('home');
  const [shopHubTab, setShopHubTab] = useState<SaleProductsHubTab>('sell');

  const handleMainTabChange = (tab: 'home' | 'shop' | 'history' | 'business' | 'settings') => {
    if (tab === 'shop' && activeTab !== 'shop') {
      setShopHubTab('sell');
    }
    setActiveTab(tab);
  };

  const handleNewSale = () => {
    setShopHubTab('sell');
    setActiveTab('shop');
  };

  const handleViewProducts = () => {
    setShopHubTab('inventory');
    setActiveTab('shop');
  };

  const handleSaleComplete = () => {
    setActiveTab('home');
  };

  return (
    <div className="size-full flex flex-col bg-gray-50">
      <Toaster position="top-center" richColors />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'home' && (
          <Dashboard
            onNewSale={handleNewSale}
            onViewProducts={handleViewProducts}
            onViewHistory={() => setActiveTab('history')}
          />
        )}
        {activeTab === 'shop' && (
          <SaleProductsHubScreen
            hubTab={shopHubTab}
            onHubTabChange={setShopHubTab}
            onSaleComplete={handleSaleComplete}
          />
        )}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'business' && <ShopStaffHubScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleMainTabChange} />
    </div>
  );
}
