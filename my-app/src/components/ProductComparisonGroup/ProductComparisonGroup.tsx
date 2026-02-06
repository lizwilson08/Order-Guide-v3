import { useState, type ReactNode } from "react";
import styles from "./ProductComparisonGroup.module.css";

export interface ProductRow {
  id: number;
  name: string;
  vendorName?: string;
  quantity: number;
  unit: string;
  price: number;
  unitPrice: number;
  unitPriceDisplay: string;
  isBestPrice?: boolean;
}

export interface ProductComparisonGroupProps {
  ingredientName: string;
  ingredientImageUrl?: string | null;
  products: ProductRow[];
  productIdLabel?: (row: ProductRow) => string;
  onEdit?: () => void;
  onProductAction?: (row: ProductRow) => void;
  /** When provided with onToggleProduct, shows a checkbox column for multi-select (e.g. add to list). */
  selectedProductIds?: Set<number>;
  onToggleProduct?: (productId: number) => void;
  children?: ReactNode;
}

const CHEVRON_UP_ICON_SRC = "/images/icons/chevron-up.png";
const CHEVRON_DOWN_ICON_SRC = "/images/icons/chevron-down.png";
const EDIT_ICON_SRC = "/images/icons/edit.png";
const MORE_ICON_SRC = "/images/icons/more.png";

export function ProductComparisonGroup({
  ingredientName,
  ingredientImageUrl,
  products,
  productIdLabel,
  onEdit,
  onProductAction,
  selectedProductIds,
  onToggleProduct,
  children,
}: ProductComparisonGroupProps) {
  const showCheckboxes = selectedProductIds != null && onToggleProduct != null;
  const [expanded, setExpanded] = useState(true);

  const bestUnitPrice = products.length > 0 ? Math.min(...products.map((p) => p.unitPrice)) : 0;
  const sortedByPrice = [...products].sort((a, b) => a.unitPrice - b.unitPrice);
  const nextPriceAfterBest = sortedByPrice[1]?.unitPrice;

  function getPriceChange(row: ProductRow): {
    primary: string;
    secondary: string;
    isBest: boolean;
  } | null {
    if (row.unitPrice <= 0) return null;
    if (row.isBestPrice && nextPriceAfterBest != null && nextPriceAfterBest > 0) {
      const percentBetter = Math.round(((nextPriceAfterBest - bestUnitPrice) / nextPriceAfterBest) * 100);
      return {
        primary: `Best by ${percentBetter}%`,
        secondary: `${percentBetter}% decrease`,
        isBest: true,
      };
    }
    if (!row.isBestPrice && bestUnitPrice > 0) {
      const percentAbove = Math.round(((row.unitPrice - bestUnitPrice) / bestUnitPrice) * 100);
      return {
        primary: `${percentAbove}% above best`,
        secondary: `${percentAbove}% increase`,
        isBest: false,
      };
    }
    return null;
  }

  return (
    <div className={styles.card}>
      {expanded ? (
        <div className={styles.body}>
          {children}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.headerRow}>
                  <th className={styles.headerIngredientCell} colSpan={showCheckboxes ? 2 : 1}>
                    <div className={styles.headerIngredient}>
                      <button
                        type="button"
                        className={styles.chevron}
                        onClick={() => setExpanded(false)}
                        aria-expanded={true}
                        aria-label="Collapse"
                      >
                        <img src={CHEVRON_UP_ICON_SRC} alt="" className={styles.chevronIcon} />
                      </button>
                      {ingredientImageUrl ? (
                        <img src={ingredientImageUrl} alt="" className={styles.ingredientImage} />
                      ) : (
                        <div className={styles.ingredientImagePlaceholder} aria-hidden />
                      )}
                      <h3 className={styles.ingredientName}>{ingredientName}</h3>
                    </div>
                  </th>
                  <th className={`${styles.colVendor} ${styles.columnHeader}`}>Vendor</th>
                  <th className={`${styles.colRight} ${styles.columnHeader}`}>Sold by price</th>
                  <th className={`${styles.colRight} ${styles.columnHeader}`}>Per unit</th>
                  <th className={`${styles.colPriceChange} ${styles.columnHeader}`}>Price change</th>
                  <th className={styles.colActions}>
                    {onEdit && (
                      <button type="button" className={styles.editButton} onClick={onEdit} aria-label="Edit list">
                        <img src={EDIT_ICON_SRC} alt="" className={styles.actionIcon} />
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((row) => (
                  <tr key={row.id}>
                    {showCheckboxes && (
                      <td className={styles.colCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedProductIds!.has(row.id)}
                          onChange={() => onToggleProduct!(row.id)}
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                    )}
                    <td className={styles.colProduct}>
                      <div className={styles.productNameCell}>
                        <span className={styles.productName}>{row.name}</span>
                        {productIdLabel && (
                          <span className={styles.productId}>{productIdLabel(row)}</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.colVendor}>
                      <span className={styles.vendorPrimary}>{row.vendorName ?? "—"}</span>
                    </td>
                    <td className={styles.colRight}>
                      <span className={styles.priceMain}>${row.price.toFixed(2)}/{row.unit}</span>
                      <span className={styles.priceSub}>{row.quantity} {row.unit}</span>
                    </td>
                    <td className={styles.colRight}>
                      <span className={styles.priceMain}>{row.unitPriceDisplay}</span>
                    </td>
                    <td className={styles.colPriceChange}>
                      {(() => {
                        const change = getPriceChange(row);
                        if (!change) return "—";
                        return (
                          <div className={styles.priceChangeCell}>
                            <span
                              className={
                                change.isBest
                                  ? styles.priceChangePrimaryBest
                                  : styles.priceChangePrimaryAbove
                              }
                            >
                              {change.primary}
                            </span>
                            <span
                              className={
                                change.isBest
                                  ? styles.priceChangeSecondaryBest
                                  : styles.priceChangeSecondaryAbove
                              }
                            >
                              {change.isBest ? "↓ " : "↑ "}
                              {change.secondary}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className={styles.colActions}>
                      {onProductAction && (
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => onProductAction(row)}
                          aria-label="More options"
                        >
                          <img src={MORE_ICON_SRC} alt="" className={styles.actionIcon} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <header className={styles.header}>
          <button
            type="button"
            className={styles.chevron}
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-label="Expand"
          >
            <img src={CHEVRON_DOWN_ICON_SRC} alt="" className={styles.chevronIcon} />
          </button>
          {ingredientImageUrl ? (
            <img src={ingredientImageUrl} alt="" className={styles.ingredientImage} />
          ) : (
            <div className={styles.ingredientImagePlaceholder} aria-hidden />
          )}
          <h3 className={styles.ingredientName}>{ingredientName}</h3>
        </header>
      )}
    </div>
  );
}
