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
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function OrderDetailModal({ open, onClose, order }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Modal open={open} onClose={onClose} variant="fullPage" aria-label="Order details">
      <div className={styles.content}>
        <header className={styles.header}>
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
            <div className={styles.titleBlock}>
              <Heading as="h1" className={styles.title}>
                Order #{order.orderId}
              </Heading>
              <Badge variant={order.status === "Cancelled" ? "default" : "default"}>
                {order.status}
              </Badge>
            </div>
          </div>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vendor</h2>
          <div className={styles.vendorDetails}>
            <p className={styles.vendorName}>{order.vendorName}</p>
            {order.vendorContact && (
              <p className={styles.vendorContact}>{order.vendorContact}</p>
            )}
            {order.vendorEmail && (
              <p className={styles.vendorEmail}>{order.vendorEmail}</p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Products</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colProduct}>Product</th>
                  <th className={styles.colRight}>Quantity</th>
                  <th className={styles.colRight}>Unit</th>
                  <th className={styles.colRight}>Unit price</th>
                  <th className={styles.colRight}>Line total</th>
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
      </div>
    </Modal>
  );
}
