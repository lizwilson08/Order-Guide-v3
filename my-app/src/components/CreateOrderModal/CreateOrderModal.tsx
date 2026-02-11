import { useState } from "react";
import { Modal } from "../Modal/Modal";
import { Button, Heading, Checkbox } from "../index";
import type { OrderLineItem } from "../OrderDetailModal/OrderDetailModal";
import orderDetailStyles from "../OrderDetailModal/OrderDetailModal.module.css";
import {
  VENDORS_CREATE_ORDER,
  RECENT_PRODUCTS_BY_VENDOR,
  PRICE_CHANGES_BY_VENDOR,
  type CreateOrderVendor,
  type CatalogProduct,
  type PriceChangeProduct,
} from "../../data/createOrderData";
import { SearchProductsModal } from "../SearchProductsModal/SearchProductsModal";
import styles from "./CreateOrderModal.module.css";

const CLOSE_ICON_SRC = "/images/icons/X.png";
const BACK_ICON_SRC = "/images/icons/back-arrow.png";
const MORE_ICON_SRC = "/images/icons/more.png";

export interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSaveDraft?: (vendor: CreateOrderVendor, items: OrderLineItem[]) => void;
  onSend?: (vendor: CreateOrderVendor, items: OrderLineItem[]) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function toLineItem(p: CatalogProduct | PriceChangeProduct, quantity: number = 1): OrderLineItem {
  const unitPrice = p.unitPrice;
  const unit = p.unit;
  return {
    productName: p.productName,
    quantity,
    unit,
    unitPrice,
    lineTotal: quantity * unitPrice,
  };
}

export function CreateOrderModal({
  open,
  onClose,
  onSaveDraft,
  onSend,
}: CreateOrderModalProps) {
  const [step, setStep] = useState<"vendor" | "products" | "preview">("vendor");
  const [selectedVendor, setSelectedVendor] = useState<CreateOrderVendor | null>(null);
  const [draftLineItems, setDraftLineItems] = useState<OrderLineItem[]>([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedRecentIds, setSelectedRecentIds] = useState<Set<number>>(new Set());
  const [selectedPriceChangeIds, setSelectedPriceChangeIds] = useState<Set<string>>(new Set());
  const [searchAddedItems, setSearchAddedItems] = useState<OrderLineItem[]>([]);

  if (!open) return null;

  function handleClose() {
    setStep("vendor");
    setSelectedVendor(null);
    setDraftLineItems([]);
    setSearchModalOpen(false);
    setSelectedRecentIds(new Set());
    setSelectedPriceChangeIds(new Set());
    setSearchAddedItems([]);
    onClose();
  }

  function handleSelectVendor(vendor: CreateOrderVendor) {
    setSelectedVendor(vendor);
    setDraftLineItems([]);
    setSelectedRecentIds(new Set());
    setSelectedPriceChangeIds(new Set());
    setSearchAddedItems([]);
    setStep("products");
  }

  function handleBackToProducts() {
    setDraftLineItems([]);
    setSelectedRecentIds(new Set());
    setSelectedPriceChangeIds(new Set());
    setSearchAddedItems([]);
    setStep("products");
  }

  function handleAddFromSearch(items: OrderLineItem[]) {
    setSearchAddedItems((prev) => [...prev, ...items]);
    setSearchModalOpen(false);
  }

  function toggleRecent(i: number) {
    setSelectedRecentIds((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function togglePriceChange(id: string) {
    setSelectedPriceChangeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleReviewOrder() {
    const fromRecent = recentProducts
      .filter((_, i) => selectedRecentIds.has(i))
      .map((p) => toLineItem(p, 1));
    const fromPriceChange = priceChanges
      .filter((p) => selectedPriceChangeIds.has(p.id))
      .map((p) => toLineItem(p, 1));
    setDraftLineItems([...fromRecent, ...fromPriceChange, ...searchAddedItems]);
    setStep("preview");
  }

  const recentProducts = selectedVendor ? RECENT_PRODUCTS_BY_VENDOR[selectedVendor.id] ?? [] : [];
  const priceChanges = selectedVendor ? PRICE_CHANGES_BY_VENDOR[selectedVendor.id] ?? [] : [];
  const productsStepItemCount =
    selectedRecentIds.size + selectedPriceChangeIds.size + searchAddedItems.length;
  const total = draftLineItems.reduce((sum, line) => sum + line.lineTotal, 0);

  return (
    <>
      <Modal open={open} onClose={handleClose} variant="fullPage" aria-label="Create order">
        <div className={styles.wrapper}>
          {/* Step 1: Vendor selection (Figma) */}
          {step === "vendor" && (
            <>
              <header className={styles.header}>
                <Button
                  type="button"
                  variant="secondary"
                  shape="circle"
                  onClick={handleClose}
                  aria-label="Close"
                  className={styles.closeButton}
                >
                  <img src={CLOSE_ICON_SRC} alt="" className={styles.closeIcon} />
                </Button>
                <div className={styles.headerRight} aria-hidden />
              </header>
              <div className={styles.contentScroll}>
                <div className={styles.vendorContent}>
                  <h1 className={styles.vendorTitle}>Select vendor</h1>
                  <div className={styles.vendorGrid} role="list">
                    {VENDORS_CREATE_ORDER.map((vendor) => (
                      <button
                        key={vendor.id}
                        type="button"
                        className={styles.vendorCard}
                        onClick={() => handleSelectVendor(vendor)}
                        role="listitem"
                        aria-label={`Select ${vendor.name}`}
                      >
                        <img
                          src={vendor.logoPath}
                          alt=""
                          className={styles.vendorLogo}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Products (Figma: Create order title, vendor logo, Top price changes, Regulars rows) */}
          {step === "products" && selectedVendor && (
            <>
              <header className={styles.header}>
                <Button
                  type="button"
                  variant="secondary"
                  shape="circle"
                  onClick={handleClose}
                  aria-label="Close"
                  className={styles.closeButton}
                >
                  <img src={CLOSE_ICON_SRC} alt="" className={styles.closeIcon} />
                </Button>
                <Heading as="h1" className={styles.title}>
                  Create order
                </Heading>
                <Button
                  variant="primary"
                  onClick={handleReviewOrder}
                  disabled={productsStepItemCount === 0}
                >
                  Review order
                </Button>
              </header>
              <div className={styles.contentScroll}>
                <div className={styles.productsContent}>
                  <div className={styles.vendorLogoWrap}>
                    <img
                      src={selectedVendor.logoPath}
                      alt=""
                      className={styles.vendorLogoInContent}
                    />
                  </div>

                  <section>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>Top price changes</h2>
                      <button type="button" className={styles.cardMoreButton} aria-label="More options">
                        <img src={MORE_ICON_SRC} alt="" className={styles.cardMoreIcon} />
                      </button>
                    </div>
                    <ul className={styles.productList}>
                      {priceChanges.length === 0 ? (
                        <li className={styles.draftSummary}>No price changes for this vendor.</li>
                      ) : (
                        priceChanges.map((p) => (
                          <li key={p.id} className={styles.productRow}>
                            <Checkbox
                              id={`price-${p.id}`}
                              checked={selectedPriceChangeIds.has(p.id)}
                              onChange={() => togglePriceChange(p.id)}
                              className={styles.productRowCheckbox}
                              aria-label={`Select ${p.productName}`}
                            />
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" className={styles.productRowImg} />
                            ) : (
                              <div className={styles.productRowImg} aria-hidden />
                            )}
                            <div className={styles.productRowBody}>
                              <span className={styles.productRowName}>{p.productName}</span>
                              <span className={styles.productRowPacker}>Packer | {p.packerId}</span>
                            </div>
                            <div className={styles.productRowPriceBlock}>
                              <span className={styles.productRowPrice}>{p.priceDisplay}</span>
                              <span className={p.isIncrease ? styles.productRowUp : styles.productRowDown}>
                                {p.changePercent}% {p.isIncrease ? "increase" : "decrease"}
                              </span>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </section>

                  <section>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>Regulars</h2>
                      <button type="button" className={styles.cardMoreButton} aria-label="More options">
                        <img src={MORE_ICON_SRC} alt="" className={styles.cardMoreIcon} />
                      </button>
                    </div>
                    <ul className={styles.productList}>
                      {recentProducts.length === 0 ? (
                        <li className={styles.draftSummary}>No regulars for this vendor.</li>
                      ) : (
                        recentProducts.map((p, i) => {
                          const priceDisp = p.priceDisplay ?? `${formatCurrency(p.unitPrice)}/${p.unit}`;
                          const packerLine = p.packerId ? `Packer | ${p.packerId}` : "Regular";
                          const changePercent = p.changePercent ?? 0;
                          const isIncrease = p.isIncrease ?? false;
                          return (
                            <li key={i} className={styles.productRow}>
                              <Checkbox
                                id={`recent-${i}`}
                                checked={selectedRecentIds.has(i)}
                                onChange={() => toggleRecent(i)}
                                className={styles.productRowCheckbox}
                                aria-label={`Select ${p.productName}`}
                              />
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt="" className={styles.productRowImg} />
                              ) : (
                                <div className={styles.productRowImg} aria-hidden />
                              )}
                              <div className={styles.productRowBody}>
                                <span className={styles.productRowName}>{p.productName}</span>
                                <span className={styles.productRowPacker}>{packerLine}</span>
                              </div>
                              <div className={styles.productRowPriceBlock}>
                                <span className={styles.productRowPrice}>{priceDisp}</span>
                                <span className={isIncrease ? styles.productRowUp : styles.productRowDown}>
                                  {changePercent}% {isIncrease ? "increase" : "decrease"}
                                </span>
                              </div>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </section>

                  <button
                    type="button"
                    className={styles.searchLink}
                    onClick={() => setSearchModalOpen(true)}
                  >
                    Search all products
                  </button>

                  {productsStepItemCount > 0 && (
                    <p className={styles.draftSummary}>
                      {productsStepItemCount} item{productsStepItemCount !== 1 ? "s" : ""} in order
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Preview (matches OrderDetailModal) */}
          {step === "preview" && selectedVendor && (
            <>
              <header className={orderDetailStyles.header}>
                <Button
                  type="button"
                  variant="secondary"
                  shape="circle"
                  onClick={handleBackToProducts}
                  aria-label="Back to products"
                  className={orderDetailStyles.closeButton}
                >
                  <img src={BACK_ICON_SRC} alt="" className={orderDetailStyles.closeIcon} />
                </Button>
                <Heading as="h1" className={orderDetailStyles.title}>
                  Create order – {selectedVendor.name}
                </Heading>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onSaveDraft?.(selectedVendor, draftLineItems);
                      handleClose();
                    }}
                  >
                    Save draft
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      onSend?.(selectedVendor, draftLineItems);
                      handleClose();
                    }}
                  >
                    Send
                  </Button>
                </div>
              </header>
              <div className={orderDetailStyles.contentScroll}>
                <div className={orderDetailStyles.content}>
                  <div className={orderDetailStyles.orderSummaryCard}>
                    <div className={orderDetailStyles.orderSummaryRow}>
                      <span className={orderDetailStyles.orderSummaryLabel}>Vendor</span>
                      <span className={orderDetailStyles.orderSummaryValue}>
                        {selectedVendor.name}
                      </span>
                    </div>
                    <div className={orderDetailStyles.orderSummaryRow}>
                      <span className={orderDetailStyles.orderSummaryLabel}>Total</span>
                      <span className={orderDetailStyles.orderSummaryValueBold}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <div className={orderDetailStyles.orderSummaryRow}>
                      <span className={orderDetailStyles.orderSummaryLabel}>Status</span>
                      <span className={orderDetailStyles.orderSummaryValue}>Draft</span>
                    </div>
                  </div>
                  <section className={orderDetailStyles.section}>
                    <div className={orderDetailStyles.tableWrap}>
                      <table className={orderDetailStyles.table}>
                        <thead>
                          <tr>
                            <th className={orderDetailStyles.colProduct}>Product</th>
                            <th className={orderDetailStyles.colRight}>Quantity</th>
                            <th className={orderDetailStyles.colRight}>Unit</th>
                            <th className={orderDetailStyles.colRight}>Unit cost</th>
                            <th className={orderDetailStyles.colRight}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {draftLineItems.map((line, i) => (
                            <tr key={i}>
                              <td className={orderDetailStyles.colProduct}>{line.productName}</td>
                              <td className={orderDetailStyles.colRight}>{line.quantity}</td>
                              <td className={orderDetailStyles.colRight}>{line.unit}</td>
                              <td className={orderDetailStyles.colRight}>
                                {formatCurrency(line.unitPrice)}
                              </td>
                              <td className={orderDetailStyles.colRight}>
                                {formatCurrency(line.lineTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                  <section className={orderDetailStyles.totalSection}>
                    <span className={orderDetailStyles.totalLabel}>Total</span>
                    <span className={orderDetailStyles.totalValue}>{formatCurrency(total)}</span>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <SearchProductsModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        vendorId={selectedVendor?.id ?? ""}
        vendorName={selectedVendor?.name ?? ""}
        onAddToOrder={handleAddFromSearch}
      />
    </>
  );
}
