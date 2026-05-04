import { useState, useRef, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ShopStaffHubScreen } from './components/ShopStaffHubScreen';
import { SaleProductsHubScreen, type SaleProductsHubTab } from './components/SaleProductsHubScreen';
import { SaleUndoBar } from './components/SaleUndoBar';
import { useStore } from './store';
import { toast } from 'sonner';

const UNDO_WINDOW_SECONDS = 10;

export default function App() {
  const { t } = useTranslation();
  const undoLastTransaction = useStore((s) => s.undoLastTransaction);
  const [activeTab, setActiveTab] = useState<
    'home' | 'shop' | 'history' | 'business' | 'settings'
  >('home');
  const [shopHubTab, setShopHubTab] = useState<SaleProductsHubTab>('sell');
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

  const handleViewProducts = () => {
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

      {isUndoBarVisible && (
        <SaleUndoBar secondsLeft={undoSecondsLeft} onUndo={handleUndoLastSale} />
      )}
    </div>
  );
}
