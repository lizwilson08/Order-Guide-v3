import { Router } from "express";
import { getDb } from "../db/connection.js";

export const purchaseOrdersRouter = Router();
const db = getDb();

purchaseOrdersRouter.get("/", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT po.id, po.vendor_id as vendorId, po.status, po.created_at as createdAt, v.name as vendorName
       FROM purchase_orders po
       JOIN vendors v ON v.id = po.vendor_id
       ORDER BY po.created_at DESC`
    )
    .all();
  res.json(rows);
});

purchaseOrdersRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const po = db
    .prepare(
      `SELECT po.id, po.vendor_id as vendorId, po.status, po.created_at as createdAt, v.name as vendorName
       FROM purchase_orders po
       JOIN vendors v ON v.id = po.vendor_id
       WHERE po.id = ?`
    )
    .get(id) as { id: number; vendorId: number; status: string; createdAt: string; vendorName: string } | undefined;
  if (!po) return res.status(404).json({ error: "Purchase order not found" });
  const items = db
    .prepare(
      `SELECT poi.id, poi.purchase_order_id as purchaseOrderId, poi.product_id as productId, poi.quantity, poi.unit_price as unitPrice,
              p.name as productName, p.unit
       FROM purchase_order_items poi
       JOIN products p ON p.id = poi.product_id
       WHERE poi.purchase_order_id = ?`
    )
    .all(id);
  res.json({ ...po, items });
});

purchaseOrdersRouter.post("/from-shopping-list", (req, res) => {
  const { shoppingListId } = req.body as { shoppingListId: number };
  if (!shoppingListId) return res.status(400).json({ error: "shoppingListId is required" });
  const items = db
    .prepare(
      `SELECT sli.id, sli.product_id as productId, sli.quantity_requested as quantityRequested, p.vendor_id as vendorId, p.price as unitPrice
       FROM shopping_list_items sli
       JOIN products p ON p.id = sli.product_id
       WHERE sli.shopping_list_id = ?`
    )
    .all(shoppingListId) as Array<{ productId: number; quantityRequested: number; vendorId: number; unitPrice: number }>;
  if (!items.length) return res.status(400).json({ error: "Shopping list has no items" });
  const byVendor = new Map<number, Array<{ productId: number; quantity: number; unitPrice: number }>>();
  for (const item of items) {
    const list = byVendor.get(item.vendorId) ?? [];
    list.push({ productId: item.productId, quantity: item.quantityRequested, unitPrice: item.unitPrice });
    byVendor.set(item.vendorId, list);
  }
  const insertPo = db.prepare("INSERT INTO purchase_orders (vendor_id, status) VALUES (?, 'draft')");
  const insertItem = db.prepare(
    "INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)"
  );
  const created = db.transaction(() => {
    const ids: number[] = [];
    for (const [vendorId, vendorItems] of byVendor) {
      const result = insertPo.run(vendorId);
      const poId = result.lastInsertRowid as number;
      ids.push(poId);
      for (const it of vendorItems) {
        insertItem.run(poId, it.productId, it.quantity, it.unitPrice);
      }
    }
    return ids;
  })();
  const rows = created.map((id) =>
    db.prepare(
      `SELECT po.id, po.vendor_id as vendorId, po.status, po.created_at as createdAt, v.name as vendorName
       FROM purchase_orders po JOIN vendors v ON v.id = po.vendor_id WHERE po.id = ?`
    ).get(id)
  );
  res.status(201).json(rows);
});

purchaseOrdersRouter.post("/", (req, res) => {
  const { vendorId, items } = req.body as {
    vendorId: number;
    items: Array<{ productId: number; quantity: number; unitPrice: number }>;
  };
  if (!vendorId || !items?.length) return res.status(400).json({ error: "vendorId and items array required" });
  const insertPo = db.prepare("INSERT INTO purchase_orders (vendor_id, status) VALUES (?, 'draft')");
  const insertItem = db.prepare(
    "INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)"
  );
  const run = db.transaction(() => {
    const result = insertPo.run(vendorId);
    const poId = result.lastInsertRowid as number;
    for (const item of items) {
      insertItem.run(poId, item.productId, item.quantity, item.unitPrice);
    }
    return poId;
  });
  const poId = run();
  const row = db
    .prepare(
      `SELECT po.id, po.vendor_id as vendorId, po.status, po.created_at as createdAt, v.name as vendorName
       FROM purchase_orders po JOIN vendors v ON v.id = po.vendor_id WHERE po.id = ?`
    )
    .get(poId);
  res.status(201).json(row);
});

purchaseOrdersRouter.patch("/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!status || !["draft", "sent", "confirmed"].includes(status))
    return res.status(400).json({ error: "status must be draft, sent, or confirmed" });
  const result = db.prepare("UPDATE purchase_orders SET status = ? WHERE id = ?").run(status, id);
  if (result.changes === 0) return res.status(404).json({ error: "Purchase order not found" });
  const row = db
    .prepare(
      `SELECT po.id, po.vendor_id as vendorId, po.status, po.created_at as createdAt, v.name as vendorName
       FROM purchase_orders po JOIN vendors v ON v.id = po.vendor_id WHERE po.id = ?`
    )
    .get(id);
  res.json(row);
});
