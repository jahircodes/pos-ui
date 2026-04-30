export function formatWeight(kg: number): string {
  if (kg < 1) {
    const grams = Math.round(kg * 1000);
    return `${grams} g`;
  }

  const wholeKg = Math.floor(kg);
  const remainderGrams = Math.round((kg - wholeKg) * 1000);

  if (remainderGrams === 0) {
    return `${wholeKg} kg`;
  }

  return `${wholeKg} kg ${remainderGrams} g`;
}

export function formatLitres(litres: number): string {
  if (litres < 1) {
    const ml = Math.round(litres * 1000);
    return `${ml} ml`;
  }

  const wholeLitres = Math.floor(litres);
  const remainderMl = Math.round((litres - wholeLitres) * 1000);

  if (remainderMl === 0) {
    return `${wholeLitres} L`;
  }

  return `${wholeLitres} L ${remainderMl} ml`;
}

export function formatQuantityDisplay(quantity: number, unit?: 'kg' | 'litre' | 'piece'): string {
  if (unit === 'kg') {
    return formatWeight(quantity);
  }
  if (unit === 'litre') {
    return formatLitres(quantity);
  }
  return quantity.toString();
}
