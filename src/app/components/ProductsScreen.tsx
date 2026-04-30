import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore, Product } from '../store';
import { Plus, Edit, Trash2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ProductModal } from './ProductModal';
import { formatQuantityDisplay } from '../utils/formatWeight';
import { ListLoadMoreFooter, LOAD_MORE_CHUNK } from './ListLoadMoreFooter';
import { applyInventoryRows, parseInventoryCsv } from '../utils/inventoryCsv';

export function ProductsScreen() {
  const products = useStore((state) => state.products);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleProductCount, setVisibleProductCount] = useState(LOAD_MORE_CHUNK);
  const inventoryFileInputRef = useRef<HTMLInputElement>(null);

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

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { text: 'Out of stock', color: 'text-red-600', dot: '🔴' };
    }
    if (product.stock < 10) {
      return { text: 'Low stock', color: 'text-orange-500', dot: '🟡' };
    }
    return { text: 'In stock', color: 'text-green-600', dot: '🟢' };
  };

  const handleInventoryUploadClick = () => {
    inventoryFileInputRef.current?.click();
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
        toast.error(errors[0] ?? 'No valid rows to import');
        return;
      }
      const { added, updated } = applyInventoryRows(rows);
      if (errors.length > 0) {
        toast.success(`Inventory updated: ${added} added, ${updated} updated`, {
          description: `${errors.length} line(s) skipped. ${errors.slice(0, 3).join(' · ')}`,
        });
      } else {
        toast.success(`Inventory updated: ${added} added, ${updated} updated`);
      }
    };
    reader.onerror = () => toast.error('Could not read file');
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50 pb-16">
      <div className="shrink-0 p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Products</h1>
        <div className="flex items-stretch gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
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
            onClick={handleInventoryUploadClick}
            aria-label="Upload inventory CSV"
            className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-green-700 active:bg-gray-100"
          >
            <Upload className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {visibleProducts.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <p>No products found</p>
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
                        Stock: {stockDisplay}
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
                          onClick={() => deleteProduct(product.id)}
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
    </div>
  );
}
