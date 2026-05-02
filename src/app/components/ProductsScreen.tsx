import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore, Product } from '../store';
import { Plus, Edit, Trash2, Search, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ProductModal } from './ProductModal';
import { formatQuantityDisplay } from '../utils/formatWeight';
import { ListLoadMoreFooter, LOAD_MORE_CHUNK } from './ListLoadMoreFooter';
import { applyInventoryRows, parseInventoryCsv } from '../utils/inventoryCsv';

type StockFilterTab = 'all' | 'low' | 'out';

export function ProductsScreen() {
  const { t } = useTranslation();
  const products = useStore((state) => state.products);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productPendingDelete, setProductPendingDelete] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilterTab, setStockFilterTab] = useState<StockFilterTab>('all');
  const [visibleProductCount, setVisibleProductCount] = useState(LOAD_MORE_CHUNK);
  const inventoryFileInputRef = useRef<HTMLInputElement>(null);

  const stockFilterCounts = useMemo(() => {
    let lowStockCount = 0;
    let outOfStockCount = 0;
    for (const product of products) {
      if (product.stock === 0) {
        outOfStockCount += 1;
      } else if (product.stock < 10) {
        lowStockCount += 1;
      }
    }
    return { lowStockCount, outOfStockCount };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStockFilter =
        stockFilterTab === 'all'
          ? true
          : stockFilterTab === 'low'
            ? product.stock > 0 && product.stock < 10
            : product.stock === 0;
      return matchesSearch && matchesStockFilter;
    });
  }, [products, searchQuery, stockFilterTab]);

  const listTotalCount = filteredProducts.length;

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleProductCount);
  }, [filteredProducts, visibleProductCount]);

  useEffect(() => {
    setVisibleProductCount(LOAD_MORE_CHUNK);
  }, [searchQuery, stockFilterTab]);

  const handleLoadMoreProducts = () => {
    setVisibleProductCount((n) => n + LOAD_MORE_CHUNK);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteClick = (product: Product) => {
    setProductPendingDelete(product);
  };

  const handleConfirmDelete = () => {
    if (!productPendingDelete) return;
    deleteProduct(productPendingDelete.id);
    toast.success(t('inventory.toast_deleted'));
    setProductPendingDelete(null);
  };

  const getStockStatus = useCallback(
    (product: Product) => {
      if (product.stock === 0) {
        return { text: t('inventory.out_of_stock_status'), color: 'text-red-600', dot: '🔴' };
      }
      if (product.stock < 10) {
        return { text: t('inventory.low_stock_status'), color: 'text-orange-500', dot: '🟡' };
      }
      return { text: t('inventory.in_stock_status'), color: 'text-green-600', dot: '🟢' };
    },
    [t],
  );

  const handleInventoryUploadClick = () => {
    inventoryFileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const templateCsv = [
      'name,price,stock,unit,priceUnit,id',
      'Apple,120,25,kg,kg,',
      'Milk,60,40,litre,litre,',
      'Soap,35,100,piece,piece,',
    ].join('\n');

    const blob = new Blob([templateCsv], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'inventory-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
    toast.success(t('inventory.toast_template_downloaded'));
  };

  const handleInventoryFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const { rows, errors } = parseInventoryCsv(text);
      if (rows.length === 0) {
        toast.error(errors[0] ?? t('inventory.toast_no_valid_rows'));
        return;
      }
      const { added, updated } = applyInventoryRows(rows);
      if (errors.length > 0) {
        toast.success(t('inventory.toast_inventory_updated', { added, updated }), {
          description: `${t('inventory.toast_lines_skipped', { count: errors.length })} ${errors.slice(0, 3).join(' · ')}`,
        });
      } else {
        toast.success(t('inventory.toast_inventory_updated', { added, updated }));
      }
    };
    reader.onerror = () => toast.error(t('inventory.toast_read_file_error'));
    reader.readAsText(file, 'UTF-8');
  };

  const stockChips = useMemo(
    () =>
      [
        {
          id: 'all' as const,
          label: t('inventory.all'),
          count: products.length,
          activeClass: 'border-green-300 bg-green-50 text-green-800',
        },
        {
          id: 'low' as const,
          label: t('inventory.low_stock'),
          count: stockFilterCounts.lowStockCount,
          activeClass: 'border-orange-300 bg-orange-100 text-orange-800',
        },
        {
          id: 'out' as const,
          label: t('inventory.out_of_stock'),
          count: stockFilterCounts.outOfStockCount,
          activeClass: 'border-red-200 bg-red-50 text-red-800',
        },
      ] as const,
    [t, products.length, stockFilterCounts.lowStockCount, stockFilterCounts.outOfStockCount],
  );

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 pb-16">
      <div className="shrink-0 p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-3">{t('inventory.title')}</h1>
        <div className="flex items-stretch gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('inventory.search_products')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <input
            ref={inventoryFileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleInventoryFileChange}
          />
          <button
            type="button"
            onClick={handleDownloadTemplate}
            aria-label={t('inventory.aria_download_template')}
            className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-blue-700 active:bg-gray-100"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleInventoryUploadClick}
            aria-label={t('inventory.aria_upload_csv')}
            className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-green-700 active:bg-gray-100"
          >
            <Upload className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2" role="group" aria-label={t('inventory.filter_stock_aria')}>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
            {stockChips.map((chip) => {
              const isSelected = stockFilterTab === chip.id;
              const inactiveClass = 'border-gray-200 bg-white text-gray-600 active:bg-gray-50';

              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setStockFilterTab(chip.id)}
                  className={`inline-flex shrink-0 min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition active:scale-[0.98] ${
                    isSelected ? chip.activeClass : inactiveClass
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0 text-xs font-semibold ${
                      isSelected ? 'bg-white/60 text-current' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
          {stockFilterTab === 'low' ? (
            <p className="mt-1.5 text-xs text-gray-500">{t('inventory.hint_low_tab')}</p>
          ) : null}
          {stockFilterTab === 'out' ? (
            <p className="mt-1.5 text-xs text-gray-500">{t('inventory.hint_out_tab')}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {visibleProducts.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <p>
                {stockFilterTab === 'all'
                  ? t('inventory.empty_all')
                  : stockFilterTab === 'low'
                    ? t('inventory.empty_low')
                    : t('inventory.empty_out')}
              </p>
            </div>
          ) : (
            visibleProducts.map((product) => {
              const status = getStockStatus(product);
              const stockDisplay = product.unit === 'piece'
                ? product.stock.toString()
                : formatQuantityDisplay(product.stock, product.unit);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        ₹{product.price} / {product.priceUnit || product.unit}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {t('inventory.stock_label', { value: stockDisplay })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`text-sm font-medium ${status.color} flex items-center gap-1`}>
                        <span>{status.dot}</span>
                        <span>{status.text}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center active:bg-blue-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center active:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <ListLoadMoreFooter
          totalCount={listTotalCount}
          visibleCount={visibleProductCount}
          onLoadMore={handleLoadMoreProducts}
        />
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center active:bg-green-700 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <ProductModal product={editingProduct} onClose={handleCloseModal} />
      )}

      {productPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full rounded-t-3xl bg-white p-4 shadow-xl sm:max-w-sm sm:rounded-2xl">
            <h2 className="text-lg font-bold text-gray-900">{t('inventory.delete_title')}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('inventory.delete_confirm', { name: productPendingDelete.name })}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProductPendingDelete(null)}
                className="rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 active:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-500 py-3 font-semibold text-white active:bg-red-600"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
