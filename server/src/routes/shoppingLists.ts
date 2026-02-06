import { Router } from "express";
import { getDb } from "../db/connection.js";

export const shoppingListsRouter = Router();
const db = getDb();

shoppingListsRouter.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT id, name, created_at as createdAt FROM shopping_lists ORDER BY created_at DESC")
    .all();
  res.json(rows);
});

shoppingListsRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const list = db
    .prepare("SELECT id, name, created_at as createdAt FROM shopping_lists WHERE id = ?")
    .get(id) as { id: number; name: string; createdAt: string } | undefined;
  if (!list) return res.status(404).json({ error: "Shopping list not found" });
  const items = db
    .prepare(
      `SELECT sli.id, sli.shopping_list_id as shoppingListId, sli.product_id as productId, sli.quantity_requested as quantityRequested,
              p.name as productName, p.quantity as productQuantity, p.unit, p.price, v.name as vendorName
       FROM shopping_list_items sli
       JOIN products p ON p.id = sli.product_id
       JOIN vendors v ON v.id = p.vendor_id
       WHERE sli.shopping_list_id = ?`
    )
    .all(id) as Array<{
    id: number;
    shoppingListId: number;
    productId: number;
    quantityRequested: number;
    productName: string;
    productQuantity: number;
    unit: string;
    price: number;
    vendorName: string;
  }>;
  res.json({ ...list, items });
});

shoppingListsRouter.post("/", (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
  const result = db.prepare("INSERT INTO shopping_lists (name) VALUES (?)").run(name.trim());
  const row = db
    .prepare("SELECT id, name, created_at as createdAt FROM shopping_lists WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(row);
});

shoppingListsRouter.patch("/:id/items", (req, res) => {
  const listId = Number(req.params.id);
  const list = db.prepare("SELECT id FROM shopping_lists WHERE id = ?").get(listId);
  if (!list) return res.status(404).json({ error: "Shopping list not found" });
  const { add, remove } = req.body as {
    add?: Array<{ productId: number; quantityRequested?: number }>;
    remove?: number[];
  };
  if (add?.length) {
    const stmt = db.prepare(
      "INSERT INTO shopping_list_items (shopping_list_id, product_id, quantity_requested) VALUES (?, ?, ?)"
    );
    for (const item of add) {
      stmt.run(listId, item.productId, item.quantityRequested ?? 1);
    }
  }
  if (remove?.length) {
    const stmt = db.prepare("DELETE FROM shopping_list_items WHERE id = ?");
    for (const id of remove) stmt.run(id);
  }
  const items = db
    .prepare(
      `SELECT sli.id, sli.shopping_list_id as shoppingListId, sli.product_id as productId, sli.quantity_requested as quantityRequested,
              p.name as productName, p.quantity, p.unit, p.price, v.name as vendorName
       FROM shopping_list_items sli
       JOIN products p ON p.id = sli.product_id
       JOIN vendors v ON v.id = p.vendor_id
       WHERE sli.shopping_list_id = ?`
    )
    .all(listId);
  res.json({ items });
});
