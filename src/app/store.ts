import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit?: 'kg' | 'litre' | 'piece';
  priceUnit?: string;
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
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: 'cash' | 'upi') => void;
}

export const useStore = create<StoreState>((set, get) => ({
  products: [
    { id: '1', name: 'Milk', price: 60, stock: 50, unit: 'litre', priceUnit: 'L' },
    { id: '2', name: 'Bread', price: 40, stock: 30, unit: 'piece', priceUnit: 'PCS' },
    { id: '3', name: 'Rice', price: 80, stock: 100, unit: 'kg', priceUnit: 'KG' },
    { id: '4', name: 'Sugar', price: 50, stock: 75, unit: 'kg', priceUnit: 'KG' },
    { id: '5', name: 'Tea Powder', price: 120, stock: 40, unit: 'kg', priceUnit: 'KG' },
    { id: '6', name: 'Biscuits', price: 25, stock: 60, unit: 'piece', priceUnit: 'PCS' },
  ],
  cart: [],
  transactions: [],

  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, { ...product, id: Date.now().toString() }],
    })),

  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),

  addToCart: (product) =>
    set((state) => {
      const defaultQty = (product.unit === 'kg' || product.unit === 'litre') ? 0.5 : 1;
      const existingItem = state.cart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + defaultQty }
              : item
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
              item.product.id === productId ? { ...item, quantity } : item
            ),
    })),

  clearCart: () => set({ cart: [] }),

  completeSale: (paymentMethod) =>
    set((state) => {
      const total = state.cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const transaction: Transaction = {
        id: Date.now().toString(),
        items: state.cart,
        total,
        paymentMethod,
        timestamp: new Date(),
      };

      const updatedProducts = state.products.map((product) => {
        const cartItem = state.cart.find((item) => item.product.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      });

      return {
        transactions: [transaction, ...state.transactions],
        cart: [],
        products: updatedProducts,
      };
    }),
}));
