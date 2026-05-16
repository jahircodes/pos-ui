/**
 * Shop POS client state: products, sales, stock movements, and stock alerts.
 */
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { getMinStockLevel, getStockLevel } from './utils/stockStatus';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStockLevel?: number;
  unit?: 'kg' | 'litre' | 'piece';
  priceUnit?: string;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  createdAt: Date;
  stockAfter?: number;
}

export type StockAlertType = 'LOW_STOCK' | 'OUT_OF_STOCK';
export type StockAlertStatus = 'PENDING' | 'SENT';

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  type: StockAlertType;
  message: string;
  status: StockAlertStatus;
  createdAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'upi';
  timestamp: Date;
}

interface StoreState {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  stockAlerts: StockAlert[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  recordStockMovement: (
    productId: string,
    type: StockMovementType,
    quantity: number,
    reason?: string,
  ) => boolean;
  syncStockAlerts: () => void;
  dismissAlert: (alertId: string) => void;
  dismissAllPendingAlerts: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: 'cash' | 'upi') => void;
  undoLastTransaction: () => boolean;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Milk', price: 60, stock: 50, minStockLevel: 10, unit: 'litre', priceUnit: 'L' },
  { id: '2', name: 'Bread', price: 40, stock: 30, minStockLevel: 10, unit: 'piece', priceUnit: 'PCS' },
  { id: '3', name: 'Rice', price: 80, stock: 100, minStockLevel: 15, unit: 'kg', priceUnit: 'KG' },
  { id: '4', name: 'Sugar', price: 50, stock: 4, minStockLevel: 10, unit: 'kg', priceUnit: 'KG' },
  { id: '5', name: 'Tea Powder', price: 120, stock: 40, minStockLevel: 8, unit: 'kg', priceUnit: 'KG' },
  { id: '6', name: 'Biscuits', price: 25, stock: 0, minStockLevel: 10, unit: 'piece', priceUnit: 'PCS' },
];

/** Builds alert message text for a product stock level. */
function buildAlertMessage(product: Product, type: StockAlertType): string {
  const min = getMinStockLevel(product);
  if (type === 'OUT_OF_STOCK') {
    return `${product.name} is out of stock. Restock to continue selling.`;
  }
  return `${product.name} is low (${product.stock} left, minimum ${min}).`;
}

/** Rebuilds PENDING alerts from current product stock (keeps SENT history). */
function computeStockAlerts(products: Product[], existing: StockAlert[]): StockAlert[] {
  const sent = existing.filter((a) => a.status === 'SENT');
  const pending: StockAlert[] = [];
  const now = new Date();

  for (const product of products) {
    const level = getStockLevel(product);
    if (level === 'ok') continue;

    const type: StockAlertType = level === 'out' ? 'OUT_OF_STOCK' : 'LOW_STOCK';
    const prior = existing.find(
      (a) => a.productId === product.id && a.type === type && a.status === 'PENDING',
    );

    pending.push({
      id: prior?.id ?? `alert-${product.id}-${type}`,
      productId: product.id,
      productName: product.name,
      type,
      message: buildAlertMessage(product, type),
      status: 'PENDING',
      createdAt: prior?.createdAt ?? now,
    });
  }

  return [...pending, ...sent];
}

/** Zustand selector: pending alerts, out-of-stock first. */
export function selectPendingAlerts(state: StoreState): StockAlert[] {
  return state.stockAlerts
    .filter((a) => a.status === 'PENDING')
    .sort(
      (a, b) =>
        (a.type === 'OUT_OF_STOCK' ? 0 : 1) - (b.type === 'OUT_OF_STOCK' ? 0 : 1) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export const useStore = create<StoreState>((set, get) => ({
  products: INITIAL_PRODUCTS,
  cart: [],
  transactions: [],
  stockMovements: [],
  stockAlerts: computeStockAlerts(INITIAL_PRODUCTS, []),

  addProduct: (product) =>
    set((state) => {
      const newProduct = { ...product, id: Date.now().toString() };
      const products = [...state.products, newProduct];
      const stockAlerts = computeStockAlerts(products, state.stockAlerts);

      // Log opening stock so the movement ledger matches inventory on create.
      if (newProduct.stock <= 0) {
        return { products, stockAlerts };
      }

      const movement: StockMovement = {
        id: `mov-init-${newProduct.id}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'IN',
        quantity: newProduct.stock,
        reason: 'Initial stock',
        createdAt: new Date(),
        stockAfter: newProduct.stock,
      };

      return {
        products,
        stockAlerts,
        stockMovements: [movement, ...state.stockMovements],
      };
    }),

  updateProduct: (id, updates) =>
    set((state) => {
      const products = state.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const stockAlerts = computeStockAlerts(products, state.stockAlerts);
      return { products, stockAlerts };
    }),

  deleteProduct: (id) =>
    set((state) => {
      const products = state.products.filter((p) => p.id !== id);
      const stockAlerts = state.stockAlerts.filter((a) => a.productId !== id);
      return { products, stockAlerts };
    }),

  recordStockMovement: (productId, type, quantity, reason) => {
    if (quantity <= 0 || Number.isNaN(quantity)) {
      return false;
    }

    const state = get();
    const product = state.products.find((p) => p.id === productId);
    if (!product) {
      return false;
    }

    let nextStock = product.stock;
    if (type === 'IN') {
      nextStock += quantity;
    } else if (type === 'OUT') {
      nextStock -= quantity;
    } else {
      nextStock = quantity;
    }

    if (nextStock < 0) {
      return false;
    }

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type,
      quantity: type === 'ADJUSTMENT' ? Math.abs(nextStock - product.stock) : quantity,
      reason: reason?.trim() || undefined,
      createdAt: new Date(),
      stockAfter: nextStock,
    };

    const products = state.products.map((p) =>
      p.id === productId ? { ...p, stock: nextStock } : p,
    );
    const stockAlerts = computeStockAlerts(products, state.stockAlerts);

    set({
      products,
      stockMovements: [movement, ...state.stockMovements],
      stockAlerts,
    });
    return true;
  },

  syncStockAlerts: () =>
    set((state) => ({
      stockAlerts: computeStockAlerts(state.products, state.stockAlerts),
    })),

  dismissAlert: (alertId) =>
    set((state) => ({
      stockAlerts: state.stockAlerts.map((a) =>
        a.id === alertId ? { ...a, status: 'SENT' as const } : a,
      ),
    })),

  /** Marks every pending alert as SENT so the dashboard banner clears. */
  dismissAllPendingAlerts: () =>
    set((state) => ({
      stockAlerts: state.stockAlerts.map((a) =>
        a.status === 'PENDING' ? { ...a, status: 'SENT' as const } : a,
      ),
    })),

  addToCart: (product) =>
    set((state) => {
      const defaultQty = product.unit === 'kg' || product.unit === 'litre' ? 0.5 : 1;
      const existingItem = state.cart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + defaultQty }
              : item,
          ),
        };
      }
      return { cart: [...state.cart, { product, quantity: defaultQty }] };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),

  updateCartQuantity: (productId, quantity) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((item) => item.product.id !== productId)
          : state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item,
            ),
    })),

  clearCart: () => set({ cart: [] }),

  completeSale: (paymentMethod) =>
    set((state) => {
      const total = state.cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );
      const transaction: Transaction = {
        id: Date.now().toString(),
        items: state.cart,
        total,
        paymentMethod,
        timestamp: new Date(),
      };

      const movements: StockMovement[] = [];
      const updatedProducts = state.products.map((product) => {
        const cartItem = state.cart.find((item) => item.product.id === product.id);
        if (!cartItem) {
          return product;
        }
        const nextStock = product.stock - cartItem.quantity;
        movements.push({
          id: `mov-sale-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          type: 'OUT',
          quantity: cartItem.quantity,
          reason: 'Sale',
          createdAt: new Date(),
          stockAfter: nextStock,
        });
        return { ...product, stock: nextStock };
      });

      const stockAlerts = computeStockAlerts(updatedProducts, state.stockAlerts);

      return {
        transactions: [transaction, ...state.transactions],
        cart: [],
        products: updatedProducts,
        stockMovements: [...movements, ...state.stockMovements],
        stockAlerts,
      };
    }),

  undoLastTransaction: () => {
    const state = get();
    if (state.transactions.length === 0) {
      return false;
    }
    const [lastTransaction, ...restTransactions] = state.transactions;

    const movements: StockMovement[] = [];
    const restoredProducts = state.products.map((product) => {
      const line = lastTransaction.items.find((item) => item.product.id === product.id);
      if (line) {
        const nextStock = product.stock + line.quantity;
        movements.push({
          id: `mov-undo-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          type: 'IN',
          quantity: line.quantity,
          reason: 'Sale undone',
          createdAt: new Date(),
          stockAfter: nextStock,
        });
        return { ...product, stock: nextStock };
      }
      return product;
    });

    const restoredCart = lastTransaction.items.map((item) => {
      const fresh = restoredProducts.find((p) => p.id === item.product.id);
      return {
        product: fresh ? { ...fresh } : { ...item.product },
        quantity: item.quantity,
      };
    });

    const stockAlerts = computeStockAlerts(restoredProducts, state.stockAlerts);

    set({
      transactions: restTransactions,
      products: restoredProducts,
      cart: restoredCart,
      stockMovements: [...movements, ...state.stockMovements],
      stockAlerts,
    });
    return true;
  },
}));

/** Subscribes to pending alerts with shallow compare (avoids new-array re-render loops). */
export function usePendingAlerts(): StockAlert[] {
  return useStore(useShallow(selectPendingAlerts));
}

/** Count of pending alerts (primitive selector — stable snapshot). */
export function usePendingAlertCount(): number {
  return useStore((state) => state.stockAlerts.filter((a) => a.status === 'PENDING').length);
}
