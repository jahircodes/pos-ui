/**
 * Shops and staff hub: tabbed Staff / Shops, per-shop staff lists, and active shop switching.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, ChevronDown, MoreVertical, Plus, Store, Trash2 } from 'lucide-react';
import { Button, Modal, StaffPanel, type StaffMember } from './StaffScreen';

export interface Shop {
  shopId: string;
  shopName: string;
  address: string;
  phone: string;
}

const DEFAULT_SHOP_ID = 'shop-1';

const INITIAL_SHOPS: Shop[] = [
  {
    shopId: DEFAULT_SHOP_ID,
    shopName: 'Main Store',
    address: '12 Market Road, Bengaluru',
    phone: '08041234567',
  },
];

const INITIAL_STAFF_BY_SHOP: Record<string, StaffMember[]> = {
  [DEFAULT_SHOP_ID]: [
    { staffId: 'staff-1', name: 'Ravi Kumar', mobileNumber: '9876543210', role: 'admin' },
    { staffId: 'staff-2', name: 'Neha Singh', mobileNumber: '9123456780', role: 'staff' },
  ],
};

interface ShopCardProps {
  shop: Shop;
  isActive: boolean;
  isMenuOpen: boolean;
  onSelectShop: () => void;
  onToggleMenu: () => void;
  onOpenEdit: () => void;
  onOpenRemove: () => void;
}

interface ShopFormModalProps {
  isOpen: boolean;
  initialShop: Shop | null;
  onClose: () => void;
  onSave: (input: Omit<Shop, 'shopId'>, editingShopId?: string) => void;
}

interface RemoveShopModalProps {
  isOpen: boolean;
  selectedShop: Shop | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Bottom-nav destination: tabs for staff (per active shop) and shop directory with add/edit/remove.
 */
export function ShopStaffHubScreen() {
  const { t } = useTranslation();
  const [hubTab, setHubTab] = useState<'staff' | 'shops'>('staff');
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [activeShopId, setActiveShopId] = useState(DEFAULT_SHOP_ID);
  const [isShopPickerOpen, setIsShopPickerOpen] = useState(false);
  const [staffByShopId, setStaffByShopId] = useState<Record<string, StaffMember[]>>(INITIAL_STAFF_BY_SHOP);

  const [activeMenuShopId, setActiveMenuShopId] = useState('');
  const [isShopFormOpen, setIsShopFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [isRemoveShopOpen, setIsRemoveShopOpen] = useState(false);
  const [selectedShopForRemove, setSelectedShopForRemove] = useState<Shop | null>(null);

  const activeShop = useMemo(
    () => shops.find((shop) => shop.shopId === activeShopId) ?? shops[0],
    [shops, activeShopId]
  );

  const staffListForActiveShop = staffByShopId[activeShopId] ?? [];

  const handleStaffListChange = (nextList: StaffMember[]) => {
    setStaffByShopId((previous) => ({ ...previous, [activeShopId]: nextList }));
  };

  useEffect(() => {
    if (!activeMenuShopId) {
      return;
    }
    const handleCloseMenu = () => setActiveMenuShopId('');
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, [activeMenuShopId]);

  const handleSaveShop = (input: Omit<Shop, 'shopId'>, editingShopId?: string) => {
    if (editingShopId) {
      setShops((previous) =>
        previous.map((shop) => (shop.shopId === editingShopId ? { ...shop, ...input } : shop))
      );
      return;
    }
    const newShopId = `shop-${Date.now()}`;
    setShops((previous) => [...previous, { shopId: newShopId, ...input }]);
    setStaffByShopId((previous) => ({ ...previous, [newShopId]: [] }));
    setActiveShopId(newShopId);
  };

  const handleConfirmRemoveShop = () => {
    if (!selectedShopForRemove || shops.length <= 1) {
      return;
    }
    const removedId = selectedShopForRemove.shopId;
    setShops((previous) => previous.filter((shop) => shop.shopId !== removedId));
    setStaffByShopId((previous) => {
      const next = { ...previous };
      delete next[removedId];
      return next;
    });
    if (activeShopId === removedId) {
      const remaining = shops.filter((shop) => shop.shopId !== removedId);
      setActiveShopId(remaining[0]?.shopId ?? DEFAULT_SHOP_ID);
    }
    setIsRemoveShopOpen(false);
    setSelectedShopForRemove(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
      <header className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white">
        <div className="p-4 pb-3">
          <h1 className="text-2xl font-bold text-gray-900">{t('business.title')}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{t('business.subtitle')}</p>
        </div>

        <div className="relative px-4 pb-3">
          <button
            type="button"
            onClick={() => setIsShopPickerOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left active:bg-gray-100"
            aria-expanded={isShopPickerOpen}
            aria-haspopup="listbox"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t('business.active_shop')}</p>
              <p className="truncate text-base font-semibold text-gray-900">{activeShop.shopName}</p>
              <p className="truncate text-sm text-gray-500">{activeShop.address}</p>
            </div>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${isShopPickerOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isShopPickerOpen ? (
            <div
              className="absolute left-4 right-4 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
              role="listbox"
            >
              {shops.map((shop) => (
                <button
                  key={shop.shopId}
                  type="button"
                  role="option"
                  aria-selected={shop.shopId === activeShopId}
                  onClick={() => {
                    setActiveShopId(shop.shopId);
                    setIsShopPickerOpen(false);
                  }}
                  className={`flex w-full flex-col items-start px-4 py-3 text-left text-sm active:bg-gray-50 ${
                    shop.shopId === activeShopId ? 'bg-green-50 font-medium text-green-900' : 'text-gray-800'
                  }`}
                >
                  <span className="font-semibold">{shop.shopName}</span>
                  <span className="text-xs text-gray-500">{shop.phone}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {isShopPickerOpen ? (
          <button
            type="button"
            aria-label={t('business.aria_close_picker')}
            className="fixed inset-0 z-[15] bg-black/20"
            onClick={() => setIsShopPickerOpen(false)}
          />
        ) : null}

        <div className="flex gap-1 px-4 pb-4">
          <button
            type="button"
            onClick={() => setHubTab('staff')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
              hubTab === 'staff' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {t('business.tab_staff')}
          </button>
          <button
            type="button"
            onClick={() => setHubTab('shops')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
              hubTab === 'shops' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {t('business.tab_shops')}
          </button>
        </div>
      </header>

      {hubTab === 'staff' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <StaffPanel
            staffList={staffListForActiveShop}
            onStaffListChange={handleStaffListChange}
            activeShopName={activeShop.shopName}
          />
        </div>
      ) : (
        <ShopsTabContent
          shops={shops}
          activeShopId={activeShopId}
          activeMenuShopId={activeMenuShopId}
          onSelectShop={(shopId) => setActiveShopId(shopId)}
          onToggleMenu={(shopId) =>
            setActiveMenuShopId((current) => (current === shopId ? '' : shopId))
          }
          onOpenAddShop={() => {
            setEditingShop(null);
            setIsShopFormOpen(true);
          }}
          onOpenEditShop={(shop) => {
            setActiveMenuShopId('');
            setEditingShop(shop);
            setIsShopFormOpen(true);
          }}
          onOpenRemoveShop={(shop) => {
            setActiveMenuShopId('');
            setSelectedShopForRemove(shop);
            setIsRemoveShopOpen(true);
          }}
        />
      )}

      <ShopFormModal
        isOpen={isShopFormOpen}
        initialShop={editingShop}
        onClose={() => {
          setIsShopFormOpen(false);
          setEditingShop(null);
        }}
        onSave={handleSaveShop}
      />

      <RemoveShopModal
        isOpen={isRemoveShopOpen}
        selectedShop={selectedShopForRemove}
        onCancel={() => {
          setIsRemoveShopOpen(false);
          setSelectedShopForRemove(null);
        }}
        onConfirm={handleConfirmRemoveShop}
        canRemove={shops.length > 1}
      />
    </div>
  );
}

interface ShopsTabContentProps {
  shops: Shop[];
  activeShopId: string;
  activeMenuShopId: string;
  onSelectShop: (shopId: string) => void;
  onToggleMenu: (shopId: string) => void;
  onOpenAddShop: () => void;
  onOpenEditShop: (shop: Shop) => void;
  onOpenRemoveShop: (shop: Shop) => void;
}

function ShopsTabContent({
  shops,
  activeShopId,
  activeMenuShopId,
  onSelectShop,
  onToggleMenu,
  onOpenAddShop,
  onOpenEditShop,
  onOpenRemoveShop,
}: ShopsTabContentProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        {shops.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm">
            <Store className="mb-3 h-12 w-12 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">{t('business.no_shops')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('business.no_shops_hint')}</p>
            <Button label={t('business.add_shop')} icon={Plus} onClick={onOpenAddShop} className="mt-4 w-full sm:w-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <ShopCard
                key={shop.shopId}
                shop={shop}
                isActive={shop.shopId === activeShopId}
                isMenuOpen={activeMenuShopId === shop.shopId}
                onSelectShop={() => onSelectShop(shop.shopId)}
                onToggleMenu={() => onToggleMenu(shop.shopId)}
                onOpenEdit={() => onOpenEditShop(shop)}
                onOpenRemove={() => onOpenRemoveShop(shop)}
              />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-20 left-0 right-0 px-4">
        <Button
          label={t('business.add_shop_fab')}
          onClick={onOpenAddShop}
          className="w-full shadow-lg"
          variant="primary"
        />
      </div>
    </div>
  );
}

function ShopCard({
  shop,
  isActive,
  isMenuOpen,
  onSelectShop,
  onToggleMenu,
  onOpenEdit,
  onOpenRemove,
}: ShopCardProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`relative rounded-xl border bg-white p-3 shadow-sm ${
        isActive ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-100'
      }`}
    >
      <button
        type="button"
        onClick={onSelectShop}
        className="flex w-full items-center gap-3 rounded-xl p-1 text-left active:bg-gray-50"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold text-gray-900">{shop.shopName}</p>
            {isActive ? (
              <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                {t('common.active')}
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm text-gray-600">{shop.address}</p>
          <p className="text-sm text-gray-500">{shop.phone}</p>
        </div>
      </button>

      <button
        type="button"
        aria-label={t('business.aria_shop_actions')}
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu();
        }}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 active:bg-gray-200"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isMenuOpen ? (
        <div
          className="absolute right-3 top-14 z-10 min-w-36 rounded-xl border border-gray-100 bg-white p-1 shadow-md"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onOpenEdit}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 active:bg-gray-100"
          >
            {t('common.edit')}
          </button>
          <button
            type="button"
            onClick={onOpenRemove}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 active:bg-red-50"
          >
            {t('common.remove')}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ShopFormModal({ isOpen, initialShop, onClose, onSave }: ShopFormModalProps) {
  const { t } = useTranslation();
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setShopName(initialShop?.shopName ?? '');
    setAddress(initialShop?.address ?? '');
    setPhone(initialShop?.phone ?? '');
  }, [isOpen, initialShop]);

  const isSaveDisabled = !shopName.trim() || !address.trim() || !phone.trim();

  return (
    <Modal isOpen={isOpen} title={initialShop ? t('business.modal_edit_shop') : t('business.modal_add_shop')} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (isSaveDisabled) {
            return;
          }
          onSave(
            {
              shopName: shopName.trim(),
              address: address.trim(),
              phone: phone.trim(),
            },
            initialShop?.shopId
          );
          onClose();
        }}
      >
        <div>
          <label htmlFor="shop-name" className="mb-1 block text-sm font-medium text-gray-700">
            {t('business.field_shop_name')}
          </label>
          <input
            id="shop-name"
            type="text"
            value={shopName}
            onChange={(event) => setShopName(event.target.value)}
            placeholder={t('business.placeholder_shop_name')}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label htmlFor="shop-address" className="mb-1 block text-sm font-medium text-gray-700">
            {t('business.field_address')}
          </label>
          <textarea
            id="shop-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder={t('business.placeholder_address')}
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label htmlFor="shop-phone" className="mb-1 block text-sm font-medium text-gray-700">
            {t('business.field_phone')}
          </label>
          <input
            id="shop-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t('business.placeholder_shop_phone')}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-green-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button label={t('common.cancel')} variant="secondary" onClick={onClose} />
          <Button label={t('common.save')} type="submit" disabled={isSaveDisabled} />
        </div>
      </form>
    </Modal>
  );
}

function RemoveShopModal({
  isOpen,
  selectedShop,
  onCancel,
  onConfirm,
  canRemove,
}: RemoveShopModalProps & { canRemove: boolean }) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} title={t('business.remove_shop_title')} onClose={onCancel}>
      {!canRemove ? (
        <p className="text-sm text-gray-600">{t('business.remove_shop_need_one')}</p>
      ) : (
        <p className="text-sm text-gray-600">
          {t('business.remove_shop_confirm')}
          {selectedShop ? t('business.remove_shop_name_suffix', { name: selectedShop.shopName }) : ''}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button label={t('common.cancel')} variant="secondary" onClick={onCancel} />
        <Button
          label={t('common.remove')}
          variant="danger"
          icon={Trash2}
          onClick={onConfirm}
          disabled={!canRemove}
        />
      </div>
    </Modal>
  );
}
