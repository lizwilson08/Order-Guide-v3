/**
 * Converts product price to price per ingredient base unit.
 * Uses common conversion factors; same unit means factor 1.
 */

const CONVERSIONS: Record<string, Record<string, number>> = {
  each: { each: 1, dozen: 1 / 12 },
  dozen: { each: 12, dozen: 1 },
  lb: { lb: 1, oz: 1 / 16 },
  oz: { lb: 16, oz: 1 },
  carton: { each: 1, dozen: 1 / 12 }, // assume carton = 12 for eggs; override per-ingredient if needed
  case: { each: 1 }, // case -> each 1:1 unless we have case size
};

export function pricePerBaseUnit(
  price: number,
  quantity: number,
  productUnit: string,
  baseUnit: string
): number {
  const productUnitNorm = productUnit.toLowerCase().trim();
  const baseUnitNorm = baseUnit.toLowerCase().trim();

  if (productUnitNorm === baseUnitNorm) {
    return quantity !== 0 ? price / quantity : 0;
  }

  const fromMap = CONVERSIONS[productUnitNorm];
  const toMap = CONVERSIONS[baseUnitNorm];
  let factor = 1;

  if (fromMap && fromMap[baseUnitNorm] !== undefined) {
    factor = fromMap[baseUnitNorm];
  } else if (toMap && toMap[productUnitNorm] !== undefined) {
    factor = 1 / toMap[productUnitNorm];
  }
  // else: unknown unit, treat as 1:1

  const quantityInBaseUnit = quantity * factor;
  return quantityInBaseUnit !== 0 ? price / quantityInBaseUnit : 0;
}

export function formatUnitPrice(pricePerBase: number, baseUnit: string): string {
  return `$${pricePerBase.toFixed(2)}/${baseUnit}`;
}
