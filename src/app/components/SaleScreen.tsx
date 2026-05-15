import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, Product } from '../store';
import { Search, Plus, Minus, Trash2, Banknote, Smartphone, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { LiquidQuantityInput } from './LiquidQuantityInput';
import { WeightQuantityInput } from './WeightQuantityInput';
import { QuantityModal } from './QuantityModal';
import { formatQuantityDisplay } from '../utils/formatWeight';
import { getStockLevel } from '../utils/stockStatus';
import { ListLoadMoreFooter, LOAD_MORE_CHUNK } from './ListLoadMoreFooter';
import { CashPaymentSheet } from './CashPaymentSheet';
import { UpiPaymentSheet } from './UpiPaymentSheet';
import { ConfirmationModal } from './SettingsScreen';

interface SaleScreenProps {
  onComplete: () => void;
}

export function SaleScreen({ onComplete }: SaleScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [visibleProductCount, setVisibleProductCount] = useState(LOAD_MORE_CHUNK);
  const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false);
  const [isUpiPaymentOpen, setIsUpiPaymentOpen] = useState(false);
  const [isCartCollapsed, setIsCartCollapsed] = useState(true);
  const [isClearCartConfirmOpen, setIsClearCartConfirmOpen] = useState(false);
  const products = useStore((state) => state.products);
  const cart = useStore((state) => state.cart);
  const updateCartQuantity = useStore((state) => state.updateCartQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const clearCart = useStore((state) => state.clearCart);
  const completeSale = useStore((state) => state.completeSale);

  const getStockStatus = useCallback(
    (product: Product) => {
      const level = getStockLevel(product);
      if (level === 'out') {
        return { text: t('sales.out_of_stock'), color: 'text-red-600', dot: '🔴' };
      }
      if (level === 'low') {
        return { text: t('sales.low_stock'), color: 'text-orange-500', dot: '🟡' };
      }
      return { text: t('sales.in_stock'), color: 'text-green-600', dot: '🟢' };
    },
    [t],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const listTotalCount = filteredProducts.length;

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleProductCount);
  }, [filteredProducts, visibleProductCount]);

  useEffect(() => {
    setVisibleProductCount(LOAD_MORE_CHUNK);
  }, [searchQuery]);

  useEffect(() => {
    if (cart.length === 0) {
      setIsCartCollapsed(true);
      setIsClearCartConfirmOpen(false);
      setIsCashPaymentOpen(false);
      setIsUpiPaymentOpen(false);
    }
  }, [cart.length]);

  const handleLoadMoreProducts = () => {
    setVisibleProductCount((n) => n + LOAD_MORE_CHUNK);
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const handleCompleteSale = (paymentMethod: 'cash' | 'upi') => {
    if (cart.length === 0) {
      toast.error(t('sales.toast_cart_empty'));
      return;
    }
    completeSale(paymentMethod);
    toast.success(t('sales.toast_sale_complete'));
    onComplete();
  };

  const handleOpenCashPayment = () => {
    if (cart.length === 0) {
      toast.error(t('sales.toast_cart_empty'));
      return;
    }
    setIsCashPaymentOpen(true);
  };

  const handleConfirmCashSale = () => {
    handleCompleteSale('cash');
    setIsCashPaymentOpen(false);
  };

  const handleOpenUpiPayment = () => {
    if (cart.length === 0) {
      toast.error(t('sales.toast_cart_empty'));
      return;
    }
    setIsUpiPaymentOpen(true);
  };

  const handleConfirmUpiSale = () => {
    handleCompleteSale('upi');
    setIsUpiPaymentOpen(false);
  };

  const handleClearCart = () => {
    if (cart.length === 0) {
      return;
    }
    setIsClearCartConfirmOpen(true);
  };

  const handleConfirmClearCart = () => {
    clearCart();
    setIsClearCartConfirmOpen(false);
    toast.success(t('sales.toast_cart_cleared'));
  };

  const handleCancelClearCart = () => {
    setIsClearCartConfirmOpen(false);
  };

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleConfirmQuantity = (quantity: number) => {
    if (selectedProduct) {
      const existingItem = cart.find((item) => item.product.id === selectedProduct.id);
      if (existingItem) {
        updateCartQuantity(selectedProduct.id, existingItem.quantity + quantity);
      } else {
        const tempCart = [...cart, { product: selectedProduct, quantity }];
        useStore.setState({ cart: tempCart });
      }
      setSelectedProduct(null);
      toast.success(t('sales.toast_added_cart'));
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 pb-16">
      <div className="shrink-0 p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-3">{t('sales.new_sale')}</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('sales.search_products')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
          {visibleProducts.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <p>{t('sales.no_products_found')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {visibleProducts.map((product) => {
                const status = getStockStatus(product);
                const isOutOfStock = getStockLevel(product) === 'out';
                const unitLabel = product.priceUnit || product.unit || t('sales.unit_item');

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(product)}
                    className={`min-h-[5.5rem] w-full rounded-xl border p-3 text-left shadow-sm transition-colors active:scale-[0.98] ${
                      isOutOfStock
                        ? 'cursor-not-allowed border-gray-100 bg-gray-100 opacity-60'
                        : 'border-gray-100 bg-white active:bg-green-50'
                    }`}
                  >
                    <div className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                      {product.name}
                    </div>
                    <div className="mt-1.5 text-xs text-gray-600">
                      ₹{product.price}
                      <span className="text-gray-400"> / {unitLabel}</span>
                    </div>
                    <div
                      className={`mt-2 flex items-center gap-1 text-[11px] font-medium leading-none ${status.color}`}
                    >
                      <span aria-hidden>{status.dot}</span>
                      <span className="truncate">{status.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <ListLoadMoreFooter
          totalCount={listTotalCount}
          visibleCount={visibleProductCount}
          onLoadMore={handleLoadMoreProducts}
        />
      </div>

      {cart.length > 0 && (
        <>
          {isCartCollapsed ? (
            <div className="shrink-0 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 py-3">
              <button
                type="button"
                onClick={() => setIsCartCollapsed(false)}
                className="w-full flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3 active:bg-gray-200"
                aria-expanded={false}
              >
                <div className="min-w-0 text-left">
                  <div className="font-semibold text-gray-900 truncate">
                    {t('sales.cart')} ({cart.length})
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('common.total')}: ₹{cartTotal.toFixed(2)}
                  </div>
                </div>
                <div className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-gray-800">
                  {t('sales.show_items')}
                  <ChevronUp className="w-4 h-4" />
                </div>
              </button>
            </div>
          ) : (
            <div className="shrink-0 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
                <div className="font-semibold text-gray-900">
                  {t('sales.cart')} ({cart.length})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 active:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('sales.clear_cart')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCartCollapsed(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-800 active:bg-gray-200"
                    aria-expanded
                  >
                    {t('sales.hide_items')}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto p-4 space-y-2">
                {cart.map((item) => {
                  const unitLabel = item.product.priceUnit || item.product.unit || t('sales.unit_item');
                  return (
                    <div
                      key={item.product.id}
                      className="grid grid-cols-[1fr_auto_5rem] items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </div>
                        <div className="mt-0.5 text-sm text-gray-600 truncate">
                          ₹{item.product.price} / {unitLabel}
                        </div>
                      </div>

                      <div className="grid grid-cols-[2rem_4.25rem_2rem_2rem] items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const decrement = (item.product.unit === 'kg' || item.product.unit === 'litre') ? 0.25 : 1;
                            updateCartQuantity(item.product.id, Math.max(decrement, item.quantity - decrement));
                          }}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:bg-gray-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 text-sm tabular-nums">
                            {formatQuantityDisplay(item.quantity, item.product.unit)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const increment = (item.product.unit === 'kg' || item.product.unit === 'litre') ? 0.25 : 1;
                            updateCartQuantity(item.product.id, item.quantity + increment);
                          }}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:bg-gray-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center active:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="shrink-0 text-right font-semibold text-gray-900 tabular-nums">
                        ₹{(item.product.price * item.quantity).toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">{t('common.total')}</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenCashPayment}
                    className="bg-green-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 active:bg-green-700 transition-colors"
                  >
                    <Banknote className="w-5 h-5" />
                    {t('sales.cash')}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenUpiPayment}
                    className="bg-blue-600 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 active:bg-blue-700 transition-colors"
                  >
                    <Smartphone className="w-5 h-5" />
                    {t('sales.upi')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedProduct && selectedProduct.unit === 'litre' && (
        <LiquidQuantityInput
          productName={selectedProduct.name}
          pricePerLitre={selectedProduct.price}
          onConfirm={handleConfirmQuantity}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {selectedProduct && selectedProduct.unit === 'kg' && (
        <WeightQuantityInput
          productName={selectedProduct.name}
          pricePerKg={selectedProduct.price}
          onConfirm={handleConfirmQuantity}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {selectedProduct && selectedProduct.unit === 'piece' && (
        <QuantityModal
          product={selectedProduct}
          onConfirm={handleConfirmQuantity}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {isCashPaymentOpen && (
        <CashPaymentSheet
          cartTotal={cartTotal}
          onClose={() => setIsCashPaymentOpen(false)}
          onConfirm={handleConfirmCashSale}
        />
      )}

      {isUpiPaymentOpen && (
        <UpiPaymentSheet
          cartTotal={cartTotal}
          onClose={() => setIsUpiPaymentOpen(false)}
          onConfirm={handleConfirmUpiSale}
        />
      )}

      <ConfirmationModal
        isOpen={isClearCartConfirmOpen}
        title={t('sales.clear_cart')}
        description={t('sales.confirm_clear_cart')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmClearCart}
        onCancel={handleCancelClearCart}
      />
    </div>
  );
}
