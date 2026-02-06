import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { PurchaseOrder } from "../types";
import { Card, Badge, Heading, Caption, Loading } from "../components";
import styles from "./PurchaseOrderList.module.css";

export function PurchaseOrderList() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.purchaseOrders
      .list()
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.page}><Loading /></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>Error: {error}</p></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Order Guide</Link>
        <Heading as="h1">Purchase orders</Heading>
        <Caption>View and manage orders by vendor</Caption>
      </header>
      {orders.length === 0 ? (
        <p className={styles.empty}>No purchase orders yet. Create one from a shopping list.</p>
      ) : (
        <ul className={styles.list}>
          {orders.map((po) => (
            <li key={po.id}>
              <Link to={`/purchase-orders/${po.id}`} className={styles.link}>
                <Card>
                  <div className={styles.row}>
                    <span className={styles.vendor}>{po.vendorName ?? `Vendor #${po.vendorId}`}</span>
                    <Badge variant={po.status === "confirmed" ? "success" : po.status === "sent" ? "primary" : "default"}>
                      {po.status}
                    </Badge>
                  </div>
                  <Caption>Created {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : ""}</Caption>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
