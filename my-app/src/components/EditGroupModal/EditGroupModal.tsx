import { useState, useEffect } from "react";
import { Modal } from "../Modal/Modal";
import { Button, Heading, Checkbox, Input } from "../index";
import type { ProductRow } from "../ProductComparisonGroup/ProductComparisonGroup";
import styles from "./EditGroupModal.module.css";

const BACK_ICON_SRC = "/images/icons/back-arrow.png";
const CLOSE_ICON_SRC = "/images/icons/X.png";
const TRASHCAN_ICON_SRC = "/images/icons/Trashcan.png";

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
  /** When true, show X (close) in top left; when false, show back arrow. Use X when opened from main page pencil. */
  useCloseButton?: boolean;
  /** When true, use compact header: title on same line as buttons, Heading 2. Use when opened from Edit Favorites (drilled in). */
  compactHeader?: boolean;
}

export function EditGroupModal({
  open,
  onClose,
  group,
  isFavorite,
  onSave,
  useCloseButton = false,
  compactHeader = false,
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
        <header
          className={
            compactHeader
              ? `${styles.header} ${styles.headerCompact}`
              : useCloseButton
                ? `${styles.header} ${styles.headerRegular}`
                : styles.header
          }
        >
          {compactHeader ? (
            <>
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
              <Heading as="h2" className={styles.titleCompact}>
                Edit group
              </Heading>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
            </>
          ) : useCloseButton ? (
            <>
              <div className={styles.headerLeft}>
                <Button
                  type="button"
                  variant="secondary"
                  shape="circle"
                  onClick={onClose}
                  aria-label="Close"
                  className={styles.closeButton}
                >
                  <img src={CLOSE_ICON_SRC} alt="" className={styles.closeIcon} />
                </Button>
                <Heading as="h1" className={styles.headline}>
                  Edit group
                </Heading>
              </div>
              <div className={styles.headerActions}>
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.headerButtonRow}>
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
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>
              </div>
              <Heading as="h1" className={styles.title}>
                Edit group
              </Heading>
            </>
          )}
        </header>

        <div className={styles.fieldGroup}>
          <Input
            id="edit-group-name"
            type="text"
            label="Name"
            labelPosition="inside"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mozzarella Cheese"
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
            <Button variant="secondary" onClick={() => {}}>
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
                  <img src={TRASHCAN_ICON_SRC} alt="" className={styles.deleteIcon} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
