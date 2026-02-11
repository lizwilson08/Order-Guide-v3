import { useState, useMemo } from "react";
import { Modal } from "../Modal/Modal";
import { Button, Input, Checkbox, Heading } from "../index";
import type { OrderLineItem } from "../OrderDetailModal/OrderDetailModal";
import { VENDOR_CATALOG_DUMMY, type CatalogProduct } from "../../data/createOrderData";
import styles from "./SearchProductsModal.module.css";

const CLOSE_ICON_SRC = "/images/icons/X.png";

export interface SearchProductsModalProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
  onAddToOrder: (items: OrderLineItem[]) => void;
}

function toLineItem(p: CatalogProduct, quantity: number = 1): OrderLineItem {
  return {
    productName: p.productName,
    quantity,
    unit: p.unit,
    unitPrice: p.unitPrice,
    lineTotal: quantity * p.unitPrice,
  };
}

export function SearchProductsModal({
  open,
  onClose,
  vendorId,
  vendorName,
  onAddToOrder,
}: SearchProductsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const catalog = VENDOR_CATALOG_DUMMY[vendorId] ?? [];
  const catalogWithIds = useMemo(
    () => catalog.map((p, i) => ({ ...p, id: i })),
    [catalog]
  );
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return catalogWithIds;
    const q = searchQuery.trim().toLowerCase();
    return catalogWithIds.filter((p) => p.productName.toLowerCase().includes(q));
  }, [catalogWithIds, searchQuery]);

  function toggleProduct(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddToOrder() {
    const items = catalogWithIds
      .filter((p) => selectedIds.has(p.id))
      .map((p) => toLineItem(p, 1));
    onAddToOrder(items);
    setSearchQuery("");
    setSelectedIds(new Set());
    onClose();
  }

  function handleClose() {
    setSearchQuery("");
    setSelectedIds(new Set());
    onClose();
  }

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      variant="partialTop"
      aria-label={`Search ${vendorName} products`}
      zIndex={1100}
    >
      <div className={styles.content}>
        <header className={styles.searchHeader}>
          <Heading as="h2" className={styles.searchTitle}>
            Search all products
          </Heading>
          <Button
            type="button"
            variant="secondary"
            shape="circle"
            onClick={handleClose}
            aria-label="Close"
          >
            <img src={CLOSE_ICON_SRC} alt="" width={20} height={20} />
          </Button>
        </header>
        <div className={styles.searchWrap}>
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Search products"
          />
        </div>
        <ul className={styles.productList}>
          {filtered.length === 0 ? (
            <li style={{ padding: "var(--space-4)", color: "var(--color-text-muted)" }}>
              No products found.
            </li>
          ) : (
            filtered.map((p) => (
              <li key={p.id} className={styles.productRow}>
                <Checkbox
                  id={`search-product-${p.id}`}
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className={styles.productCheckbox}
                  aria-label={`Add ${p.productName}`}
                />
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{p.productName}</span>
                  <span className={styles.productMeta}>
                    {" "}
                    {p.unit} · ${p.unitPrice.toFixed(2)}/ea
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddToOrder}
            disabled={selectedIds.size === 0}
          >
            Add to order ({selectedIds.size})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
