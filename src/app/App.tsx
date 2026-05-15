import { useState, useRef, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import { BottomNav } from './components/BottomNav';
import { Dashboard, type InventoryFocus } from './components/Dashboard';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ShopStaffHubScreen } from './components/ShopStaffHubScreen';
import { SaleProductsHubScreen, type SaleProductsHubTab } from './components/SaleProductsHubScreen';
import { SaleUndoBar } from './components/SaleUndoBar';
import { useStore } from './store';
import { useAuthStore } from './authStore';
import { AuthFlow } from './components/AuthFlow';
import { toast } from 'sonner';

const UNDO_WINDOW_SECONDS = 10;

export default function App() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const undoLastTransaction = useStore((s) => s.undoLastTransaction);
  const [activeTab, setActiveTab] = useState<
    'home' | 'shop' | 'history' | 'business' | 'settings'
  >('home');
  const [shopHubTab, setShopHubTab] = useState<SaleProductsHubTab>('sell');
  const [inventoryFocus, setInventoryFocus] = useState<InventoryFocus | null>(null);
  const [isUndoBarVisible, setIsUndoBarVisible] = useState(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(UNDO_WINDOW_SECONDS);
  const undoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearUndoTimer = useCallback(() => {
    if (undoIntervalRef.current) {
      clearInterval(undoIntervalRef.current);
      undoIntervalRef.current = null;
    }
  }, []);

  const dismissUndoBar = useCallback(() => {
    clearUndoTimer();
    setIsUndoBarVisible(false);
  }, [clearUndoTimer]);

  const startUndoWindow = useCallback(() => {
    clearUndoTimer();
    setUndoSecondsLeft(UNDO_WINDOW_SECONDS);
    setIsUndoBarVisible(true);
    undoIntervalRef.current = setInterval(() => {
      setUndoSecondsLeft((prev) => {
        if (prev <= 1) {
          if (undoIntervalRef.current) {
            clearInterval(undoIntervalRef.current);
            undoIntervalRef.current = null;
          }
          setIsUndoBarVisible(false);
          return UNDO_WINDOW_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearUndoTimer]);

  useEffect(() => () => clearUndoTimer(), [clearUndoTimer]);

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

  const handleViewProducts = (focus?: InventoryFocus) => {
    setInventoryFocus(focus ?? null);
    setShopHubTab('inventory');
    setActiveTab('shop');
  };

  const handleViewAlerts = () => {
    setActiveTab('shop');
    setShopHubTab('alerts');
  };

  const handleOpenProductFromAlert = (productId: string) => {
    const alert = useStore.getState().stockAlerts.find(
      (a) => a.productId === productId && a.status === 'PENDING',
    );
    setInventoryFocus({
      productId,
      stockFilter: alert?.type === 'OUT_OF_STOCK' ? 'out' : 'low',
    });
    setShopHubTab('inventory');
    setActiveTab('shop');
  };

  const handleOpenProductFromHistory = (productId: string) => {
    setInventoryFocus({ productId });
    setShopHubTab('inventory');
    setActiveTab('shop');
  };

  const handleSaleComplete = () => {
    setActiveTab('home');
    startUndoWindow();
  };

  const handleUndoLastSale = () => {
    const ok = undoLastTransaction();
    if (ok) {
      toast.success(t('sales.toast_sale_undone'));
      dismissUndoBar();
      setShopHubTab('sell');
      setActiveTab('shop');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="size-full flex flex-col bg-gray-50">
        <Toaster position="top-center" richColors />
        <AuthFlow />
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-gray-50">
      <Toaster position="top-center" richColors />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'home' && (
          <Dashboard
            onNewSale={handleNewSale}
            onViewProducts={handleViewProducts}
            onViewAlerts={handleViewAlerts}
            onViewHistory={() => setActiveTab('history')}
          />
        )}
        {activeTab === 'shop' && (
          <SaleProductsHubScreen
            hubTab={shopHubTab}
            onHubTabChange={setShopHubTab}
            onSaleComplete={handleSaleComplete}
            inventoryFocus={inventoryFocus}
            onInventoryFocusConsumed={() => setInventoryFocus(null)}
            onOpenProductFromAlert={handleOpenProductFromAlert}
          />
        )}
        {activeTab === 'history' && (
          <HistoryScreen onOpenProduct={handleOpenProductFromHistory} />
        )}
        {activeTab === 'business' && <ShopStaffHubScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleMainTabChange} />

      {isUndoBarVisible && (
        <SaleUndoBar secondsLeft={undoSecondsLeft} onUndo={handleUndoLastSale} />
      )}
    </div>
  );
}
