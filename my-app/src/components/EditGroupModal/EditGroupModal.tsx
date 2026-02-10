import { useState, useEffect } from "react";
import { Modal } from "../Modal/Modal";
import { Button, Heading, Checkbox } from "../index";
import type { ProductRow } from "../ProductComparisonGroup/ProductComparisonGroup";
import styles from "./EditGroupModal.module.css";

const BACK_ICON_SRC = "/images/icons/back-arrow.png";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export interface EditGroupModalProps {
  open: boolean;
  onClose: () => void;
  /** Group being edited: id, name, products. When open, this is the initial data. */
  group: { id: string; ingredientName: string; products: ProductRow[] } | null;
  /** Whether this group is currently in favorites (for "Add to favorites" checkbox) */
  isFavorite: boolean;
  onSave: (payload: {
    id: string;
    ingredientName: string;
    products: ProductRow[];
    addToFavorites: boolean;
  }) => void;
  /** All products available to add (e.g. for "Add" product picker). Optional for now. */
  allProductsPool?: ProductRow[];
}

export function EditGroupModal({
  open,
  onClose,
  group,
  isFavorite,
  onSave,
}: EditGroupModalProps) {
  const [name, setName] = useState("");
  const [addToFavorites, setAddToFavorites] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    if (group && open) {
      setName(group.ingredientName);
      setAddToFavorites(isFavorite);
      setProducts([...group.products]);
    }
  }, [group, isFavorite, open]);

  function handleSave() {
    if (!group) return;
    onSave({
      id: group.id,
      ingredientName: name.trim() || group.ingredientName,
      products,
      addToFavorites,
    });
    onClose();
  }

  function handleRemoveProduct(productId: number) {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  if (!group) return null;

  return (
    <Modal open={open} onClose={onClose} variant="partialTop" aria-label="Edit group">
      <div className={styles.modalContent}>
        <header className={styles.header}>
          <Button
            type="button"
            variant="secondary"
            shape="circle"
            onClick={onClose}
            aria-label="Back"
            className={styles.backButton}
          >
            <img src={BACK_ICON_SRC} alt="" className={styles.backIcon} />
          </Button>
          <Heading as="h1" className={styles.title}>
            Edit group
          </Heading>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </header>

        <div className={styles.fieldGroup}>
          <label htmlFor="edit-group-name" className={styles.fieldLabel}>
            Name
          </label>
          <input
            id="edit-group-name"
            type="text"
            className={styles.nameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
          />
        </div>

        <div className={styles.addToFavoritesWrap}>
          <Checkbox
            id="edit-group-favorites"
            label="Add to favorites"
            checked={addToFavorites}
            onChange={(e) => setAddToFavorites(e.target.checked)}
          />
        </div>

        <div className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h2 className={styles.productsTitle}>Products</h2>
            <Button variant="secondary" size="small" onClick={() => {}}>
              Add
            </Button>
          </div>
          <div className={styles.productList}>
            {products.map((product) => (
              <div key={product.id} className={styles.productRow}>
                <div className={styles.productMain}>
                  <span className={styles.productName} title={product.name}>
                    {product.name}
                  </span>
                  <span className={styles.productId}>{product.id}</span>
                </div>
                <div className={styles.productVendor}>
                  {product.vendorName && (
                    <span className={styles.productVendorLine}>{product.vendorName}</span>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleRemoveProduct(product.id)}
                  aria-label={`Remove ${product.name}`}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
