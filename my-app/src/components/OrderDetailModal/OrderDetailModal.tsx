import { Modal } from "../Modal/Modal";
import { Button, Heading, Badge } from "../index";
import styles from "./OrderDetailModal.module.css";

const CLOSE_ICON_SRC = "/images/icons/X.png";

export interface OrderLineItem {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetail {
  orderId: string | number;
  vendorName: string;
  vendorContact?: string;
  vendorEmail?: string;
  status: string;
  total: number;
  lineItems: OrderLineItem[];
}

export interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderDetail | null;
  /** Called when user clicks Edit on a draft order */
  onEdit?: (order: OrderDetail) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function OrderDetailModal({ open, onClose, order, onEdit }: OrderDetailModalProps) {
  if (!open) return null;

  const orderIdDisplay = order != null ? `Order #${order.orderId}` : "Order details";
  const isDraft = order != null && order.status.toLowerCase() === "draft";

  return (
    <Modal open={open} onClose={onClose} variant="fullPage" aria-label="Order details">
      <div className={styles.wrapper} data-order-modal="full-page-v2">
        <header className={styles.header}>
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
          <Heading as="h1" className={styles.title}>
            {orderIdDisplay}
          </Heading>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            {isDraft && onEdit && order && (
              <Button variant="secondary" onClick={() => onEdit(order)}>
                Edit
              </Button>
            )}
            <Button variant="secondary" onClick={() => {}}>
              Send
            </Button>
          </div>
        </header>

        <div className={styles.contentScroll}>
          <div className={styles.content}>
            {order ? (
              <>
                <div className={styles.orderSummaryCard}>
                  <div className={styles.orderSummaryRow}>
                    <span className={styles.orderSummaryLabel}>Vendor</span>
                    <span className={styles.orderSummaryValue}>{order.vendorName}</span>
                  </div>
                  <div className={styles.orderSummaryRow}>
                    <span className={styles.orderSummaryLabel}>Total</span>
                    <span className={styles.orderSummaryValueBold}>{formatCurrency(order.total)}</span>
                  </div>
                  <div className={styles.orderSummaryRow}>
                    <span className={styles.orderSummaryLabel}>Status</span>
                    <Badge variant={order.status === "Cancelled" ? "default" : "warning"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <section className={styles.section}>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.colProduct}>Product</th>
                          <th className={styles.colRight}>Quantity</th>
                          <th className={styles.colRight}>Unit</th>
                          <th className={styles.colRight}>Unit cost</th>
                          <th className={styles.colRight}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.lineItems.map((line, i) => (
                          <tr key={i}>
                            <td className={styles.colProduct}>{line.productName}</td>
                            <td className={styles.colRight}>{line.quantity}</td>
                            <td className={styles.colRight}>{line.unit}</td>
                            <td className={styles.colRight}>{formatCurrency(line.unitPrice)}</td>
                            <td className={styles.colRight}>{formatCurrency(line.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className={styles.totalSection}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalValue}>{formatCurrency(order.total)}</span>
                </section>
              </>
            ) : (
              <p className={styles.emptyMessage}>Order not found.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
