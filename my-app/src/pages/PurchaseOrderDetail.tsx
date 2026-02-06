import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import type { PurchaseOrder, PurchaseOrderItem } from "../types";
import { Card, Table, Button, Badge, Heading, Caption, Loading } from "../components";
import styles from "./PurchaseOrderDetail.module.css";

export function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.purchaseOrders
      .get(Number(id))
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = (status: "draft" | "sent" | "confirmed") => {
    if (!id) return;
    setUpdating(true);
    api.purchaseOrders
      .updateStatus(Number(id), status)
      .then(setOrder)
      .catch((e) => alert(e instanceof Error ? e.message : "Failed to update"))
      .finally(() => setUpdating(false));
  };

  if (!id) return null;
  if (loading) return <div className={styles.page}><Loading /></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>Error: {error}</p></div>;
  if (!order) return null;

  const items = order.items ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/purchase-orders" className={styles.back}>← Purchase orders</Link>
        <div className={styles.titleRow}>
          <Heading as="h1">{order.vendorName ?? `Vendor #${order.vendorId}`}</Heading>
          <Badge variant={order.status === "confirmed" ? "success" : order.status === "sent" ? "primary" : "default"}>
            {order.status}
          </Badge>
        </div>
        <Caption>Created {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</Caption>
      </header>
      <Card
        title="Line items"
        footer={
          (order.status === "draft" || order.status === "sent") && (
            <div className={styles.actions}>
              {order.status === "draft" && (
                <Button onClick={() => updateStatus("sent")} disabled={updating}>
                  Mark as sent
                </Button>
              )}
              <Button variant="secondary" onClick={() => updateStatus("confirmed")} disabled={updating}>
                Mark as confirmed
              </Button>
            </div>
          )
        }
      >
        {items.length === 0 ? (
          <p className={styles.empty}>No line items.</p>
        ) : (
          <Table<PurchaseOrderItem & { productName?: string; unit?: string }>
            columns={[
              { key: "productName", header: "Product", render: (row) => row.productName ?? row.productId },
              { key: "quantity", header: "Qty" },
              { key: "unit", header: "Unit", render: (row) => row.unit ?? "" },
              {
                key: "unitPrice",
                header: "Unit price",
                render: (row) => `$${row.unitPrice.toFixed(2)}`,
              },
              {
                key: "total",
                header: "Total",
                render: (row) => `$${(row.quantity * row.unitPrice).toFixed(2)}`,
              },
            ]}
            data={items}
            keyExtractor={(row) => row.id}
          />
        )}
      </Card>
    </div>
  );
}
