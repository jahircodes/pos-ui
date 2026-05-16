/**
 * Stock level helpers aligned with inventory.min_stock_level (default when unset).
 */
import type { Product } from '../store';

export const DEFAULT_MIN_STOCK_LEVEL = 10;

export type StockLevel = 'ok' | 'low' | 'out';

/** Resolves per-product minimum stock threshold. */
export function getMinStockLevel(product: Pick<Product, 'minStockLevel'>): number {
  const min = product.minStockLevel;
  if (min === undefined || min === null || Number.isNaN(min)) {
    return DEFAULT_MIN_STOCK_LEVEL;
  }
  return Math.max(0, min);
}

/** Classifies current stock vs minimum for filters and alerts. */
export function getStockLevel(product: Pick<Product, 'stock' | 'minStockLevel'>): StockLevel {
  if (product.stock <= 0) {
    return 'out';
  }
  if (product.stock < getMinStockLevel(product)) {
    return 'low';
  }
  return 'ok';
}

/** Status dot shown in inventory and alerts (matches product list). */
export function getStockStatusDot(level: StockLevel): string {
  if (level === 'out') return '🔴';
  if (level === 'low') return '🟡';
  return '🟢';
}
