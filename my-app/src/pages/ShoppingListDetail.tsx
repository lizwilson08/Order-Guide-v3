import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { ShoppingList, ShoppingListItem } from "../types";
import { Card, Table, Button, Heading, Caption, Loading } from "../components";
import styles from "./ShoppingListDetail.module.css";

export function ShoppingListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPo, setCreatingPo] = useState(false);

  const load = () => {
    if (!id) return;
    api.shoppingLists
      .get(Number(id))
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const removeItem = (itemId: number) => {
    api.shoppingLists.updateItems(Number(id), { remove: [itemId] }).then(load).catch(alert);
  };

  const createPurchaseOrders = () => {
    if (!id) return;
    setCreatingPo(true);
    api.purchaseOrders
      .createFromShoppingList(Number(id))
      .then((orders) => {
        if (Array.isArray(orders) && orders.length > 0) {
          navigate("/purchase-orders");
        }
        load();
      })
      .catch((e) => alert(e instanceof Error ? e.message : "Failed to create POs"))
      .finally(() => setCreatingPo(false));
  };

  if (!id) return null;
  if (loading) return <div className={styles.page}><Loading /></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>Error: {error}</p></div>;
  if (!list) return null;

  const items = list.items ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/shopping-lists" className={styles.back}>← Shopping lists</Link>
        <Heading as="h1">{list.name}</Heading>
        <Caption>Add items from the Order Guide, then create purchase orders</Caption>
      </header>
      <Card
        title="Items"
        footer={
          <Button
            onClick={createPurchaseOrders}
            disabled={items.length === 0 || creatingPo}
          >
            {creatingPo ? "Creating…" : "Create purchase orders (by vendor)"}
          </Button>
        }
      >
        {items.length === 0 ? (
          <p className={styles.empty}>No items. Add products from an ingredient comparison page.</p>
        ) : (
          <Table<ShoppingListItem & { productName?: string; price?: number; vendorName?: string }>
            columns={[
              { key: "productName", header: "Product", render: (row) => row.productName ?? row.productId },
              { key: "vendorName", header: "Vendor", render: (row) => row.vendorName ?? "" },
              {
                key: "quantityRequested",
                header: "Qty",
                render: (row) => (
                  <span>{row.quantityRequested}</span>
                ),
              },
              {
                key: "price",
                header: "Unit price",
                render: (row) => (row.price != null ? `$${row.price.toFixed(2)}` : "—"),
              },
              {
                key: "actions",
                header: "",
                render: (row) => (
                  <Button variant="ghost" size="small" onClick={() => removeItem(row.id)}>
                    Remove
                  </Button>
                ),
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
