/**
 * Parses a simple inventory CSV and applies rows to the product list (add or update by id/name).
 */
import { useStore, type Product } from '../store';

export interface InventoryCsvRow {
  name: string;
  price: number;
  stock: number;
  unit: NonNullable<Product['unit']>;
  priceUnit?: string;
  id?: string;
}

const ALLOWED_UNITS = new Set(['kg', 'litre', 'piece']);

function normalizeHeader(cell: string): string {
  return cell.trim().replace(/^\ufeff/, '').toLowerCase();
}

function normalizeUnit(raw: string | undefined): NonNullable<Product['unit']> {
  if (!raw || !raw.trim()) return 'piece';
  const u = raw.trim().toLowerCase();
  if (u === 'l' || u === 'liter' || u === 'litre' || u === 'ltr') return 'litre';
  if (u === 'kg' || u === 'kilogram') return 'kg';
  if (u === 'pc' || u === 'pcs' || u === 'piece' || u === 'unit') return 'piece';
  if (ALLOWED_UNITS.has(u as 'kg')) return u as 'kg';
  if (ALLOWED_UNITS.has(u as 'litre')) return 'litre';
  return 'piece';
}

/**
 * Parses CSV text; expects a header row with name, price, stock (optional: unit, priceUnit, id).
 */
export function parseInventoryCsv(text: string): {
  rows: InventoryCsvRow[];
  errors: string[];
} {
  const errors: string[] = [];
  const rows: InventoryCsvRow[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    errors.push('File is empty');
    return { rows, errors };
  }

  const headerCells = lines[0].split(',').map((c) => normalizeHeader(c));
  const idx = (key: string) => headerCells.indexOf(key);

  const nameI = idx('name');
  const priceI = idx('price');
  const stockI = idx('stock');
  const unitI = idx('unit');
  const priceUnitI = idx('priceunit');
  const idI = idx('id');

  if (nameI === -1 || priceI === -1 || stockI === -1) {
    errors.push('CSV must include headers: name, price, stock');
    return { rows, errors };
  }

  for (let lineNum = 2; lineNum <= lines.length; lineNum++) {
    const cells = lines[lineNum - 1].split(',').map((c) => c.trim());
    const name = cells[nameI]?.trim() || '';
    if (!name) {
      errors.push(`Line ${lineNum}: missing name`);
      continue;
    }
    const price = parseFloat(cells[priceI] || '');
    const stock = parseFloat(cells[stockI] || '');
    if (Number.isNaN(price) || price <= 0) {
      errors.push(`Line ${lineNum}: invalid price`);
      continue;
    }
    if (Number.isNaN(stock) || stock < 0) {
      errors.push(`Line ${lineNum}: invalid stock`);
      continue;
    }
    const unit = normalizeUnit(unitI !== -1 ? cells[unitI] : undefined);
    const priceUnit =
      priceUnitI !== -1 && cells[priceUnitI] ? cells[priceUnitI].trim() : undefined;
    const id = idI !== -1 && cells[idI] ? cells[idI].trim() : undefined;

    rows.push({
      name,
      price,
      stock,
      unit,
      priceUnit: priceUnit || undefined,
      id: id || undefined,
    });
  }

  return { rows, errors };
}

export interface ApplyInventoryResult {
  added: number;
  updated: number;
}

/**
 * Merges parsed rows into the zustand store (match by id, then by case-insensitive name).
 * Re-reads products each row so multiple rows in one file stay consistent.
 */
export function applyInventoryRows(parsedRows: InventoryCsvRow[]): ApplyInventoryResult {
  let added = 0;
  let updated = 0;

  for (const row of parsedRows) {
    const { products, updateProduct, addProduct } = useStore.getState();
    const byId = row.id ? products.find((p) => p.id === row.id) : undefined;
    const byName = products.find(
      (p) => p.name.trim().toLowerCase() === row.name.trim().toLowerCase(),
    );
    const match = byId || byName;

    const payload = {
      name: row.name,
      price: row.price,
      stock: row.stock,
      unit: row.unit,
      priceUnit: row.priceUnit,
    };

    if (match) {
      updateProduct(match.id, payload);
      updated++;
    } else {
      addProduct(payload);
      added++;
    }
  }

  return { added, updated };
}
