/**
 * Edit active shop details (name, address, phone).
 */
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '../authStore';
import { SettingsCard } from './SettingsScreen';
import { SettingsSubScreenLayout } from './SettingsSubScreenLayout';

interface ShopInfoSettingsScreenProps {
  onBack: () => void;
}

export function ShopInfoSettingsScreen({ onBack }: ShopInfoSettingsScreenProps) {
  const { t } = useTranslation();
  const shopName = useAuthStore((s) => s.shopName);
  const shopAddress = useAuthStore((s) => s.shopAddress);
  const shopPhone = useAuthStore((s) => s.shopPhone);
  const updateShopInfo = useAuthStore((s) => s.updateShopInfo);

  const [name, setName] = useState(shopName);
  const [address, setAddress] = useState(shopAddress);
  const [phone, setPhone] = useState(shopPhone);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) {
      toast.error(t('settings.toast_shop_fill_all'));
      return;
    }
    updateShopInfo({
      shopName: name,
      shopAddress: address,
      shopPhone: phone,
    });
    toast.success(t('settings.toast_shop_saved'));
    onBack();
  };

  return (
    <SettingsSubScreenLayout title={t('settings.shop_info_title')} onBack={onBack}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">{t('settings.shop_info_subtitle')}</p>
        <SettingsCard>
          <div className="space-y-4">
            <div>
              <label htmlFor="shop-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('business.field_shop_name')}
              </label>
              <input
                id="shop-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder={t('business.placeholder_shop_name')}
              />
            </div>
            <div>
              <label htmlFor="shop-address" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('business.field_address')}
              </label>
              <textarea
                id="shop-address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder={t('business.placeholder_address')}
              />
            </div>
            <div>
              <label htmlFor="shop-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('business.field_phone')}
              </label>
              <input
                id="shop-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder={t('business.placeholder_shop_phone')}
              />
            </div>
          </div>
        </SettingsCard>
        <button
          type="submit"
          className="w-full rounded-xl bg-green-600 py-4 text-base font-semibold text-white shadow-md active:bg-green-700"
        >
          {t('common.save')}
        </button>
      </form>
    </SettingsSubScreenLayout>
  );
}
