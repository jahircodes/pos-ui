import { useState, useEffect } from 'react';
import { useStore, Product } from '../store';
import { X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const addProduct = useStore((state) => state.addProduct);
  const updateProduct = useStore((state) => state.updateProduct);

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [stock, setStock] = useState(product?.stock.toString() || '');
  const [stockAdjustment, setStockAdjustment] = useState('0');
  const [unit, setUnit] = useState<'kg' | 'litre' | 'piece'>(product?.unit || 'piece');
  const [priceUnit, setPriceUnit] = useState(product?.priceUnit || '');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setStockAdjustment('0');
      setUnit(product.unit || 'piece');
      setPriceUnit(product.priceUnit || '');
    }
  }, [product]);

  const handleStockAdjustment = (amount: number) => {
    const currentStock = parseFloat(stock) || 0;
    const adjustment = parseFloat(stockAdjustment) || 0;
    const newAdjustment = adjustment + amount;
    setStockAdjustment(newAdjustment.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price || !stock) {
      toast.error('Please fill all fields');
      return;
    }

    const priceNum = parseFloat(price);
    const baseStock = parseFloat(stock) || 0;
    const adjustment = parseFloat(stockAdjustment) || 0;
    const finalStock = baseStock + adjustment;

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (finalStock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    if (product) {
      updateProduct(product.id, { name, price: priceNum, stock: finalStock, unit, priceUnit });
      toast.success('Product updated successfully');
    } else {
      addProduct({ name, price: priceNum, stock: finalStock, unit, priceUnit });
      toast.success('Product added successfully');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter product name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Type
            </label>
            <select
              value={unit}
              onChange={(e) => {
                const newUnit = e.target.value as 'kg' | 'litre' | 'piece';
                setUnit(newUnit);
                if (newUnit === 'kg') setPriceUnit('KG');
                else if (newUnit === 'litre') setPriceUnit('L');
                else setPriceUnit('PCS');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="piece">Pieces (PCS)</option>
              <option value="kg">Kilograms (KG)</option>
              <option value="litre">Litres (L)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Unit (e.g., KG, L, PCS, pack, bottle)
            </label>
            <input
              type="text"
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="KG"
            />
          </div>

          {product ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <div className="text-2xl font-bold text-gray-900 px-4 py-3">
                  {stock}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjust Stock
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStockAdjustment(-10)}
                    className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center active:bg-red-100"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={stockAdjustment}
                    onChange={(e) => setStockAdjustment(e.target.value)}
                    className="flex-1 h-12 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => handleStockAdjustment(10)}
                    className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center active:bg-green-100"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  New stock will be: {(parseFloat(stock) + parseFloat(stockAdjustment || '0')).toFixed(2)}
                </p>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Stock
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold active:bg-green-700 transition-colors"
          >
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
