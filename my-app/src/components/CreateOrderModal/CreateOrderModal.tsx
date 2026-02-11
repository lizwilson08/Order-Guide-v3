import { useState, useRef, useEffect } from "react";
import { Modal } from "../Modal/Modal";
import { Button, Heading } from "../index";
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
const SEARCH_ICON_SRC = "/images/icons/search.png";
const FORK_KNIFE_ICON_SRC = "/images/icons/fork-knife.png";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [recentQuantities, setRecentQuantities] = useState<Record<number, number>>({});
  const [priceChangeQuantities, setPriceChangeQuantities] = useState<Record<string, number>>({});
  const [searchAddedItems, setSearchAddedItems] = useState<OrderLineItem[]>([]);
  const [expandedStepper, setExpandedStepper] = useState<string | null>(null);
  const stepperContainerRef = useRef<HTMLDivElement | null>(null);

  if (!open) return null;

  useEffect(() => {
    if (step !== "products" || !expandedStepper) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        stepperContainerRef.current &&
        !stepperContainerRef.current.contains(e.target as Node)
      ) {
        setExpandedStepper(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [step, expandedStepper]);

  function handleClose() {
    setStep("vendor");
    setSelectedVendor(null);
    setDraftLineItems([]);
    setSearchModalOpen(false);
    setSearchQuery("");
    setCategoryFilter("all");
    setRecentQuantities({});
    setPriceChangeQuantities({});
    setSearchAddedItems([]);
    setExpandedStepper(null);
    onClose();
  }

  function handleSelectVendor(vendor: CreateOrderVendor) {
    setSelectedVendor(vendor);
    setDraftLineItems([]);
    setRecentQuantities({});
    setPriceChangeQuantities({});
    setSearchAddedItems([]);
    setExpandedStepper(null);
    setStep("products");
  }

  function handleBackToProducts() {
    setDraftLineItems([]);
    setRecentQuantities({});
    setPriceChangeQuantities({});
    setSearchAddedItems([]);
    setExpandedStepper(null);
    setStep("products");
  }

  function handleAddFromSearch(items: OrderLineItem[]) {
    setSearchAddedItems((prev) => [...prev, ...items]);
    setSearchModalOpen(false);
  }

  function setRecentQuantity(index: number, quantity: number) {
    setRecentQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[index];
      else next[index] = quantity;
      return next;
    });
  }

  function setPriceChangeQuantity(id: string, quantity: number) {
    setPriceChangeQuantities((prev) => {
      const next = { ...prev };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }

  function handleReviewOrder() {
    const fromRecent = recentProducts.flatMap((p, i) => {
      const qty = recentQuantities[i] ?? 0;
      return qty > 0 ? [toLineItem(p, qty)] : [];
    });
    const fromPriceChange = priceChanges.flatMap((p) => {
      const qty = priceChangeQuantities[p.id] ?? 0;
      return qty > 0 ? [toLineItem(p, qty)] : [];
    });
    setDraftLineItems([...fromRecent, ...fromPriceChange, ...searchAddedItems]);
    setStep("preview");
  }

  const recentProducts = selectedVendor ? RECENT_PRODUCTS_BY_VENDOR[selectedVendor.id] ?? [] : [];
  const priceChanges = selectedVendor ? PRICE_CHANGES_BY_VENDOR[selectedVendor.id] ?? [] : [];
  const q = searchQuery.trim().toLowerCase();
  const filteredPriceChanges =
    q === ""
      ? priceChanges
      : priceChanges.filter((p) => p.productName.toLowerCase().includes(q));
  const filteredRecentIndices =
    q === ""
      ? recentProducts.map((_, i) => i)
      : recentProducts
          .map((_, i) => i)
          .filter((i) => recentProducts[i].productName.toLowerCase().includes(q));
  const productsStepItemCount =
    Object.values(recentQuantities).reduce((a, b) => a + b, 0) +
    Object.values(priceChangeQuantities).reduce((a, b) => a + b, 0) +
    searchAddedItems.length;
  const total = draftLineItems.reduce((sum, line) => sum + line.lineTotal, 0);

  /** Subtotal for the products step (current cart), and line count for "X products" */
  const productsStepSubtotal =
    recentProducts.reduce((sum, p, i) => sum + (recentQuantities[i] ?? 0) * p.unitPrice, 0) +
    priceChanges.reduce((sum, p) => sum + (priceChangeQuantities[p.id] ?? 0) * p.unitPrice, 0) +
    searchAddedItems.reduce((s, line) => s + line.lineTotal, 0);
  const productsStepLineCount =
    Object.values(recentQuantities).filter((q) => (q ?? 0) > 0).length +
    Object.keys(priceChangeQuantities).filter((id) => (priceChangeQuantities[id] ?? 0) > 0).length +
    searchAddedItems.length;
  const minimumOrder = selectedVendor?.minimumOrder ?? 0;
  const percentToMinimum =
    minimumOrder > 0 ? Math.min(100, Math.round((productsStepSubtotal / minimumOrder) * 100)) : 100;

  return (
    <>
      <Modal open={open} onClose={handleClose} variant="fullPage" aria-label="Create order" zIndex={9999}>
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
                  <div className={styles.productsToolbar}>
                    <div className={styles.vendorLogoRowWrap}>
                      <img
                        src={selectedVendor.logoPath}
                        alt=""
                        className={styles.vendorLogoRow}
                      />
                    </div>
                    <div className={styles.searchFilterRow} role="search">
                      <div className={styles.searchFieldWrap}>
                        <img src={SEARCH_ICON_SRC} alt="" className={styles.searchIcon} aria-hidden />
                        <input
                          type="search"
                          className={styles.searchInput}
                          placeholder="Search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          aria-label="Search products"
                        />
                      </div>
                      <div className={styles.filterButton}>
                        <span className={styles.filterButtonVisual} aria-hidden>
                          <span className={styles.filterButtonLabel}>Item type</span>{" "}
                          <span className={styles.filterButtonValue}>
                            {categoryFilter === "all" ? "All" : categoryFilter}
                          </span>
                        </span>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className={styles.filterButtonSelect}
                          aria-label="Item type filter"
                        >
                          <option value="all">All</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <section>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>Top price changes</h2>
                      <button type="button" className={styles.cardMoreButton} aria-label="More options">
                        <img src={MORE_ICON_SRC} alt="" className={styles.cardMoreIcon} />
                      </button>
                    </div>
                    {filteredPriceChanges.length === 0 ? (
                      <p className={styles.draftSummary}>
                        {priceChanges.length === 0
                          ? "No price changes for this vendor."
                          : "No price changes match your search."}
                      </p>
                    ) : (
                      <div className={styles.productTableWrap}>
                        <table className={styles.productTable}>
                          <thead>
                            <tr>
                              <th className={styles.productTableColProduct}>Product</th>
                              <th className={styles.productTableColDate}>Last ordered</th>
                              <th className={styles.productTableColCost}>Price</th>
                              <th className={styles.productTableColAction} aria-label="Add to order" />
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPriceChanges.map((p) => (
                              <tr key={p.id}>
                                <td className={styles.productTableColProduct}>
                                  <div className={styles.productTableProduct}>
                                    {p.imageUrl ? (
                                      <img src={p.imageUrl} alt="" className={styles.productTableImg} />
                                    ) : (
                                      <div className={styles.productTableImg} aria-hidden />
                                    )}
                                    <div className={styles.productTableProductText}>
                                      <span className={styles.productTableName}>{p.productName}</span>
                                      <span className={styles.productTableMeta}>
                                        {selectedVendor.name} | ID {p.packerId}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className={styles.productTableColDate}>
                                  <div className={styles.productTableDateBlock}>
                                    <span className={styles.productTableDate}>
                                      {p.lastOrderedDate ?? "—"}
                                    </span>
                                    {p.orderFrequency && (
                                      <span className={styles.productTableFrequency}>
                                        {p.orderFrequency}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className={styles.productTableColCost}>
                                  <div className={styles.productTablePriceBlock}>
                                    <span className={styles.productTableCost}>{p.priceDisplay}</span>
                                    <span className={styles.productRowChangeMuted}>
                                      {p.changePercent}% {p.isIncrease ? "increase" : "decrease"}
                                    </span>
                                  </div>
                                </td>
                                <td className={styles.productTableColAction}>
                                  {(priceChangeQuantities[p.id] ?? 0) === 0 ? (
                                    <button
                                      type="button"
                                      className={styles.productRowPlusButton}
                                      onClick={() => setPriceChangeQuantity(p.id, 1)}
                                      aria-label={`Add ${p.productName} to order`}
                                    >
                                      +
                                    </button>
                                  ) : expandedStepper === `price-${p.id}` ? (
                                    <div
                                      ref={stepperContainerRef}
                                      className={styles.stepper}
                                      role="group"
                                      aria-label={`Quantity for ${p.productName}`}
                                    >
                                      <button
                                        type="button"
                                        className={styles.stepperBtn}
                                        onClick={() => setPriceChangeQuantity(p.id, (priceChangeQuantities[p.id] ?? 1) - 1)}
                                        aria-label="Decrease quantity"
                                      >
                                        −
                                      </button>
                                      <span className={styles.stepperValue}>{priceChangeQuantities[p.id] ?? 1}</span>
                                      <button
                                        type="button"
                                        className={styles.stepperBtn}
                                        onClick={() => setPriceChangeQuantity(p.id, (priceChangeQuantities[p.id] ?? 0) + 1)}
                                        aria-label="Increase quantity"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className={styles.productRowPlusButton}
                                      onClick={() => setExpandedStepper(`price-${p.id}`)}
                                      aria-label={`${p.productName} quantity: ${priceChangeQuantities[p.id] ?? 1}, click to change`}
                                    >
                                      <span className={styles.productRowPlusButtonQuantity}>
                                        {priceChangeQuantities[p.id] ?? 1}
                                      </span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section>
                    <div className={styles.sectionHeader}>
                      <h2 className={styles.sectionTitle}>Regulars</h2>
                      <button type="button" className={styles.cardMoreButton} aria-label="More options">
                        <img src={MORE_ICON_SRC} alt="" className={styles.cardMoreIcon} />
                      </button>
                    </div>
                    {filteredRecentIndices.length === 0 ? (
                      <p className={styles.draftSummary}>
                        {recentProducts.length === 0
                          ? "No regulars for this vendor."
                          : "No regulars match your search."}
                      </p>
                    ) : (
                      <div className={styles.productTableWrap}>
                        <table className={styles.productTable}>
                          <thead>
                            <tr>
                              <th className={styles.productTableColProduct}>Product</th>
                              <th className={styles.productTableColDate}>Last ordered</th>
                              <th className={styles.productTableColCost}>Price</th>
                              <th className={styles.productTableColAction} aria-label="Add to order" />
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRecentIndices.map((origIndex) => {
                              const p = recentProducts[origIndex];
                              const priceDisp = p.priceDisplay ?? `${formatCurrency(p.unitPrice)}/${p.unit}`;
                              const changePercent = p.changePercent ?? 0;
                              const isIncrease = p.isIncrease ?? false;
                              return (
                                <tr key={origIndex}>
                                  <td className={styles.productTableColProduct}>
                                    <div className={styles.productTableProduct}>
                                      {p.imageUrl ? (
                                        <img src={p.imageUrl} alt="" className={styles.productTableImg} />
                                      ) : (
                                        <div className={styles.productTableImg} aria-hidden />
                                      )}
                                      <div className={styles.productTableProductText}>
                                        <span className={styles.productTableName}>{p.productName}</span>
                                        <span className={styles.productTableMeta}>
                                          {selectedVendor.name} | ID {p.packerId ?? "—"}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className={styles.productTableColDate}>
                                    <div className={styles.productTableDateBlock}>
                                      <span className={styles.productTableDate}>
                                        {p.lastOrderedDate ?? "—"}
                                      </span>
                                      {p.orderFrequency && (
                                        <span className={styles.productTableFrequency}>
                                          {p.orderFrequency}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className={styles.productTableColCost}>
                                    <div className={styles.productTablePriceBlock}>
                                      <span className={styles.productTableCost}>{priceDisp}</span>
                                      <span className={styles.productRowChangeMuted}>
                                        {changePercent}% {isIncrease ? "increase" : "decrease"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className={styles.productTableColAction}>
                                    {(recentQuantities[origIndex] ?? 0) === 0 ? (
                                      <button
                                        type="button"
                                        className={styles.productRowPlusButton}
                                        onClick={() => setRecentQuantity(origIndex, 1)}
                                        aria-label={`Add ${p.productName} to order`}
                                      >
                                        +
                                      </button>
                                    ) : expandedStepper === `recent-${origIndex}` ? (
                                      <div
                                        ref={stepperContainerRef}
                                        className={styles.stepper}
                                        role="group"
                                        aria-label={`Quantity for ${p.productName}`}
                                      >
                                        <button
                                          type="button"
                                          className={styles.stepperBtn}
                                          onClick={() => setRecentQuantity(origIndex, (recentQuantities[origIndex] ?? 1) - 1)}
                                          aria-label="Decrease quantity"
                                        >
                                          −
                                        </button>
                                        <span className={styles.stepperValue}>{recentQuantities[origIndex] ?? 1}</span>
                                        <button
                                          type="button"
                                          className={styles.stepperBtn}
                                          onClick={() => setRecentQuantity(origIndex, (recentQuantities[origIndex] ?? 0) + 1)}
                                          aria-label="Increase quantity"
                                        >
                                          +
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        className={styles.productRowPlusButton}
                                        onClick={() => setExpandedStepper(`recent-${origIndex}`)}
                                        aria-label={`${p.productName} quantity: ${recentQuantities[origIndex] ?? 1}, click to change`}
                                      >
                                        <span className={styles.productRowPlusButtonQuantity}>
                                          {recentQuantities[origIndex] ?? 1}
                                        </span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <div className={styles.searchAllCard}>
                    <img
                      src={FORK_KNIFE_ICON_SRC}
                      alt=""
                      className={styles.searchAllCardIcon}
                      aria-hidden
                    />
                    <div className={styles.searchAllCardCopy}>
                      <h3 className={styles.searchAllCardHeading}>Looking for something new?</h3>
                      <p className={styles.searchAllCardText}>
                        Search the {selectedVendor.name} catalog for 1000+ products.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setSearchModalOpen(true)}
                      className={styles.searchAllCardButton}
                    >
                      Search all products
                    </Button>
                  </div>
                </div>
              </div>

              <footer className={styles.bottomBar} aria-live="polite">
                <div className={styles.bottomBarInner}>
                  <span className={styles.bottomBarProducts}>
                    {productsStepLineCount} product{productsStepLineCount !== 1 ? "s" : ""}
                  </span>
                  <div className={styles.bottomBarRight}>
                    <span className={styles.bottomBarSubtotal}>
                      Subtotal: {formatCurrency(productsStepSubtotal)}
                    </span>
                    <span className={styles.bottomBarMinimum}>
                      {percentToMinimum >= 100
                        ? "Minimum met"
                        : `${percentToMinimum}% to minimum`}
                    </span>
                  </div>
                </div>
              </footer>
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
