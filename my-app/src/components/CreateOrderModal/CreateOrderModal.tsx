import { useState, useRef, useEffect, useMemo } from "react";
import { Modal } from "../Modal/Modal";
import { Button, Heading } from "../index";
import type { OrderLineItem, OrderDetail } from "../OrderDetailModal/OrderDetailModal";
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
const TRASH_ICON_SRC = "/images/icons/Trashcan.png";

export interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, modal opens in edit mode: products step with this order's vendor and line items */
  editOrder?: OrderDetail | null;
  onSaveDraft?: (vendor: CreateOrderVendor, items: OrderLineItem[], existingOrderId?: string | number) => void;
  onSend?: (vendor: CreateOrderVendor, items: OrderLineItem[], existingOrderId?: string | number) => void;
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
  editOrder = null,
  onSaveDraft,
  onSend,
}: CreateOrderModalProps) {
  const [step, setStep] = useState<"vendor" | "products" | "preview">("vendor");
  const [selectedVendor, setSelectedVendor] = useState<CreateOrderVendor | null>(null);
  const [draftLineItems, setDraftLineItems] = useState<OrderLineItem[]>([]);
  /** When editing a draft, this is the editable list shown in the products step */
  const [orderLineItems, setOrderLineItems] = useState<OrderLineItem[]>([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [recentQuantities, setRecentQuantities] = useState<Record<number, number>>({});
  const [priceChangeQuantities, setPriceChangeQuantities] = useState<Record<string, number>>({});
  const [searchAddedItems, setSearchAddedItems] = useState<OrderLineItem[]>([]);
  const [expandedStepper, setExpandedStepper] = useState<string | null>(null);
  const stepperContainerRef = useRef<HTMLDivElement | null>(null);

  const isEditMode = open && editOrder != null;

  useEffect(() => {
    if (!open || !editOrder) return;
    const vendor =
      VENDORS_CREATE_ORDER.find((v) => v.name === editOrder.vendorName) ??
      ({ id: "unknown", name: editOrder.vendorName, logoPath: "" } as CreateOrderVendor);
    setSelectedVendor(vendor);
    setStep("products");
    setOrderLineItems([...editOrder.lineItems]);
    setRecentQuantities({});
    setPriceChangeQuantities({});
    setSearchAddedItems([]);
    setDraftLineItems([]);
  }, [open, editOrder?.orderId]);

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
    setOrderLineItems([]);
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
    if (isEditMode) {
      setOrderLineItems((prev) => [...prev, ...items]);
    } else {
      setSearchAddedItems((prev) => [...prev, ...items]);
    }
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

  function setOrderLineItemQuantity(index: number, quantity: number) {
    if (quantity <= 0) {
      setOrderLineItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setOrderLineItems((prev) =>
      prev.map((line, i) =>
        i === index ? { ...line, quantity, lineTotal: quantity * line.unitPrice } : line
      )
    );
  }

  function removeOrderLineItem(index: number) {
    setOrderLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addProductToOrder(item: OrderLineItem) {
    setOrderLineItems((prev) => [...prev, item]);
  }

  /** Remove one line item matching this product (for Edit order Quantity stepper) */
  function removeOneFromOrder(product: CatalogProduct | PriceChangeProduct) {
    setOrderLineItems((prev) => {
      const idx = prev.findIndex(
        (l) => l.productName === product.productName && l.unit === product.unit && l.unitPrice === product.unitPrice
      );
      if (idx === -1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }

  /** Count how many of this product are in orderLineItems (Edit order) */
  function getQuantityInOrder(product: CatalogProduct | PriceChangeProduct): number {
    return orderLineItems.filter(
      (l) => l.productName === product.productName && l.unit === product.unit && l.unitPrice === product.unitPrice
    ).length;
  }

  function handleReviewOrder() {
    if (isEditMode) {
      setDraftLineItems([...orderLineItems]);
    } else {
      const fromRecent = recentProducts.flatMap((p, i) => {
        const qty = recentQuantities[i] ?? 0;
        return qty > 0 ? [toLineItem(p, qty)] : [];
      });
      const fromPriceChange = priceChanges.flatMap((p) => {
        const qty = priceChangeQuantities[p.id] ?? 0;
        return qty > 0 ? [toLineItem(p, qty)] : [];
      });
      setDraftLineItems([...fromRecent, ...fromPriceChange, ...searchAddedItems]);
    }
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
  const productsStepItemCount = isEditMode
    ? orderLineItems.length
    : Object.values(recentQuantities).reduce((a, b) => a + b, 0) +
      Object.values(priceChangeQuantities).reduce((a, b) => a + b, 0) +
      searchAddedItems.length;
  const total = draftLineItems.reduce((sum, line) => sum + line.lineTotal, 0);

  /** Subtotal for the products step (current cart), and line count for "X products" */
  const productsStepSubtotal = isEditMode
    ? orderLineItems.reduce((s, line) => s + line.lineTotal, 0)
    : recentProducts.reduce((sum, p, i) => sum + (recentQuantities[i] ?? 0) * p.unitPrice, 0) +
      priceChanges.reduce((sum, p) => sum + (priceChangeQuantities[p.id] ?? 0) * p.unitPrice, 0) +
      searchAddedItems.reduce((s, line) => s + line.lineTotal, 0);
  const productsStepLineCount = isEditMode
    ? orderLineItems.length
    : Object.values(recentQuantities).filter((q) => (q ?? 0) > 0).length +
      Object.keys(priceChangeQuantities).filter((id) => (priceChangeQuantities[id] ?? 0) > 0).length +
      searchAddedItems.length;
  const minimumOrder = selectedVendor?.minimumOrder ?? 0;
  const percentToMinimum =
    minimumOrder > 0 ? Math.min(100, Math.round((productsStepSubtotal / minimumOrder) * 100)) : 100;

  /** Single combined list for "Add to order" table in edit mode (price changes + regulars) */
  const combinedAddToOrderProducts = useMemo(() => {
    if (!isEditMode) return [];
    const fromPrice = filteredPriceChanges.map((p) => ({ key: `price-${p.id}`, product: p }));
    const fromRecent = filteredRecentIndices.map((origIndex) => ({
      key: `recent-${origIndex}`,
      product: recentProducts[origIndex],
    }));
    return [...fromPrice, ...fromRecent];
  }, [isEditMode, filteredPriceChanges, filteredRecentIndices, recentProducts]);

  return (
    <>
      <Modal open={open} onClose={handleClose} variant="fullPage" aria-label={isEditMode ? "Edit order" : "Create order"} zIndex={9999}>
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
                  {isEditMode ? "Edit order" : "Create order"}
                </Heading>
                <Button
                  variant="primary"
                  onClick={handleReviewOrder}
                  disabled={productsStepLineCount === 0}
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

                  {isEditMode && (
                    <section>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Order items</h2>
                      </div>
                      {orderLineItems.length === 0 ? (
                        <p className={styles.draftSummary}>No items. Add products from the sections below or search.</p>
                      ) : (
                        <div className={styles.productTableWrap}>
                          <table className={orderDetailStyles.table}>
                            <thead>
                              <tr>
                                <th className={orderDetailStyles.colProduct}>Product</th>
                                <th className={orderDetailStyles.colRight}>Quantity</th>
                                <th className={orderDetailStyles.colRight}>Unit</th>
                                <th className={orderDetailStyles.colRight}>Unit cost</th>
                                <th className={orderDetailStyles.colRight}>Total</th>
                                <th className={styles.productTableColAction} aria-label="Remove" />
                              </tr>
                            </thead>
                            <tbody>
                              {orderLineItems.map((line, index) => (
                                <tr key={`${line.productName}-${index}`}>
                                  <td className={orderDetailStyles.colProduct}>{line.productName}</td>
                                  <td className={orderDetailStyles.colRight}>
                                    {expandedStepper === `order-${index}` ? (
                                      <div
                                        ref={stepperContainerRef}
                                        className={styles.stepper}
                                        role="group"
                                        aria-label={`Quantity for ${line.productName}`}
                                      >
                                        <button
                                          type="button"
                                          className={styles.stepperBtn}
                                          onClick={() => setOrderLineItemQuantity(index, line.quantity - 1)}
                                          aria-label="Decrease quantity"
                                        >
                                          −
                                        </button>
                                        <span className={styles.stepperValue}>{line.quantity}</span>
                                        <button
                                          type="button"
                                          className={styles.stepperBtn}
                                          onClick={() => setOrderLineItemQuantity(index, line.quantity + 1)}
                                          aria-label="Increase quantity"
                                        >
                                          +
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        className={styles.productRowPlusButton}
                                        onClick={() => setExpandedStepper(`order-${index}`)}
                                        aria-label={`${line.productName} quantity: ${line.quantity}, click to change`}
                                      >
                                        <span className={styles.productRowPlusButtonQuantity}>{line.quantity}</span>
                                      </button>
                                    )}
                                  </td>
                                  <td className={orderDetailStyles.colRight}>{line.unit}</td>
                                  <td className={orderDetailStyles.colRight}>{formatCurrency(line.unitPrice)}</td>
                                  <td className={orderDetailStyles.colRight}>{formatCurrency(line.lineTotal)}</td>
                                  <td className={styles.productTableColAction}>
                                    <button
                                      type="button"
                                      className={styles.productRowRemoveButton}
                                      onClick={() => removeOrderLineItem(index)}
                                      aria-label={`Remove ${line.productName} from order`}
                                    >
                                      <img src={TRASH_ICON_SRC} alt="" className={styles.productRowRemoveIcon} aria-hidden />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  )}

                  {isEditMode ? (
                    <section>
                      <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Add to order</h2>
                      </div>
                      {combinedAddToOrderProducts.length === 0 ? (
                        <p className={styles.draftSummary}>
                          {priceChanges.length === 0 && recentProducts.length === 0
                            ? "No products for this vendor."
                            : "No products match your search."}
                        </p>
                      ) : (
                        <div className={styles.productTableWrap}>
                          <table className={styles.productTable}>
                            <thead>
                              <tr>
                                <th className={styles.productTableColProduct}>Product</th>
                                <th className={styles.productTableColDate}>Last ordered</th>
                                <th className={styles.productTableColCost}>Price</th>
                                <th className={styles.productTableColAction}>Quantity</th>
                                <th className={styles.productTableColTotal}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {combinedAddToOrderProducts.map(({ key, product: p }) => {
                                const priceDisp = p.priceDisplay ?? `${formatCurrency(p.unitPrice)}/${p.unit}`;
                                const changePercent = p.changePercent ?? 0;
                                const isIncrease = p.isIncrease ?? false;
                                const qty = getQuantityInOrder(p);
                                const lineTotal = qty * p.unitPrice;
                                return (
                                  <tr key={key}>
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
                                      {qty === 0 ? (
                                        <button
                                          type="button"
                                          className={styles.productRowPlusButton}
                                          onClick={() => addProductToOrder(toLineItem(p, 1))}
                                          aria-label={`Add ${p.productName} to order`}
                                        >
                                          +
                                        </button>
                                      ) : expandedStepper === `add-${key}` ? (
                                        <div
                                          ref={stepperContainerRef}
                                          className={styles.stepper}
                                          role="group"
                                          aria-label={`Quantity for ${p.productName}`}
                                        >
                                          <button
                                            type="button"
                                            className={styles.stepperBtn}
                                            onClick={() => removeOneFromOrder(p)}
                                            aria-label="Decrease quantity"
                                          >
                                            −
                                          </button>
                                          <span className={styles.stepperValue}>{qty}</span>
                                          <button
                                            type="button"
                                            className={styles.stepperBtn}
                                            onClick={() => addProductToOrder(toLineItem(p, 1))}
                                            aria-label="Increase quantity"
                                          >
                                            +
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          className={styles.productRowPlusButton}
                                          onClick={() => setExpandedStepper(`add-${key}`)}
                                          aria-label={`${p.productName} quantity: ${qty}, click to change`}
                                        >
                                          <span className={styles.productRowPlusButtonQuantity}>{qty}</span>
                                        </button>
                                      )}
                                    </td>
                                    <td className={styles.productTableColTotal}>
                                      <div className={styles.productTablePriceBlock}>
                                        <span className={styles.productTableCost}>
                                          {qty === 0 ? "—" : formatCurrency(lineTotal)}
                                        </span>
                                        {qty > 0 && (
                                          <span className={styles.productRowChangeMuted}>
                                            {qty} {p.unit}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  ) : (
                    <>
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
                          <ul className={styles.priceChangeCardGrid} role="list">
                            {filteredPriceChanges.map((p) => (
                              <li key={p.id} className={styles.priceChangeCard}>
                                <div className={styles.priceChangeCardInner}>
                                  {p.imageUrl ? (
                                    <img
                                      src={p.imageUrl}
                                      alt=""
                                      className={styles.priceChangeCardImg}
                                    />
                                  ) : (
                                    <div className={styles.priceChangeCardImgPlaceholder} aria-hidden />
                                  )}
                                  <div className={styles.priceChangeCardBody}>
                                    <span className={styles.priceChangeCardMeta}>
                                      ID {p.packerId}
                                    </span>
                                    <span className={styles.priceChangeCardName}>{p.productName}</span>
                                    <span className={styles.priceChangeCardPriceLine}>
                                      {p.priceDisplay} | {p.changePercent}% {p.isIncrease ? "increase" : "decrease"}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
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
                                  <th className={styles.productTableColAction}>Quantity</th>
                                  <th className={styles.productTableColTotal}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredRecentIndices.map((origIndex) => {
                                  const p = recentProducts[origIndex];
                                  const priceDisp = p.priceDisplay ?? `${formatCurrency(p.unitPrice)}/${p.unit}`;
                                  const changePercent = p.changePercent ?? 0;
                                  const isIncrease = p.isIncrease ?? false;
                                  const qty = recentQuantities[origIndex] ?? 0;
                                  const lineTotal = qty * p.unitPrice;
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
                                        {qty === 0 ? (
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
                                              onClick={() => setRecentQuantity(origIndex, qty - 1)}
                                              aria-label="Decrease quantity"
                                            >
                                              −
                                            </button>
                                            <span className={styles.stepperValue}>{qty}</span>
                                            <button
                                              type="button"
                                              className={styles.stepperBtn}
                                              onClick={() => setRecentQuantity(origIndex, qty + 1)}
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
                                            aria-label={`${p.productName} quantity: ${qty}, click to change`}
                                          >
                                            <span className={styles.productRowPlusButtonQuantity}>{qty}</span>
                                          </button>
                                        )}
                                      </td>
                                      <td className={styles.productTableColTotal}>
                                        <div className={styles.productTablePriceBlock}>
                                          <span className={styles.productTableCost}>
                                            {qty === 0 ? "—" : formatCurrency(lineTotal)}
                                          </span>
                                          {qty > 0 && (
                                            <span className={styles.productRowChangeMuted}>
                                              {qty} {p.unit}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </section>
                    </>
                  )}

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
                  {isEditMode ? "Edit order" : "Create order"} – {selectedVendor.name}
                </Heading>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onSaveDraft?.(selectedVendor, draftLineItems, editOrder?.orderId);
                      handleClose();
                    }}
                  >
                    Save draft
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      onSend?.(selectedVendor, draftLineItems, editOrder?.orderId);
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
