import { Building2, Home, ShoppingCart, Package, History, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BottomNavProps {
  activeTab: 'home' | 'sale' | 'products' | 'history' | 'business' | 'settings';
  onTabChange: (tab: 'home' | 'sale' | 'products' | 'history' | 'business' | 'settings') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home' as const, icon: Home, labelKey: 'nav.home' },
    { id: 'sale' as const, icon: ShoppingCart, labelKey: 'nav.sale' },
    { id: 'products' as const, icon: Package, labelKey: 'nav.products' },
    { id: 'history' as const, icon: History, labelKey: 'nav.history' },
    { id: 'business' as const, icon: Building2, labelKey: 'nav.business' },
    { id: 'settings' as const, icon: Settings, labelKey: 'nav.settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="grid h-16 grid-cols-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
