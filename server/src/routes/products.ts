import { Router } from "express";
import { getDb } from "../db/connection.js";

export const productsRouter = Router();
const db = getDb();

productsRouter.get("/", (req, res) => {
  const ingredientId = req.query.ingredientId as string | undefined;
  const vendorId = req.query.vendorId as string | undefined;
  let sql = `
    SELECT p.id, p.vendor_id as vendorId, p.ingredient_id as ingredientId, p.name, p.quantity, p.unit, p.price,
           v.name as vendorName
    FROM products p
    JOIN vendors v ON v.id = p.vendor_id
    WHERE 1=1
  `;
  const params: number[] = [];
  if (ingredientId) {
    sql += " AND p.ingredient_id = ?";
    params.push(Number(ingredientId));
  }
  if (vendorId) {
    sql += " AND p.vendor_id = ?";
    params.push(Number(vendorId));
  }
  sql += " ORDER BY p.name";
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

productsRouter.post("/", (req, res) => {
  const { vendorId, ingredientId, name, quantity, unit, price } = req.body;
  if (!vendorId || !ingredientId || !name || quantity == null || !unit || price == null)
    return res.status(400).json({ error: "vendorId, ingredientId, name, quantity, unit, price are required" });
  const result = db
    .prepare(
      "INSERT INTO products (vendor_id, ingredient_id, name, quantity, unit, price) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(Number(vendorId), Number(ingredientId), String(name).trim(), Number(quantity), String(unit).trim(), Number(price));
  const row = db
    .prepare(
      "SELECT id, vendor_id as vendorId, ingredient_id as ingredientId, name, quantity, unit, price FROM products WHERE id = ?"
    )
    .get(result.lastInsertRowid);
  res.status(201).json(row);
});

productsRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Product not found" });
  const { name, quantity, unit, price } = req.body;
  const updates: string[] = [];
  const values: unknown[] = [];
  if (name !== undefined) {
    updates.push("name = ?");
    values.push(String(name).trim());
  }
  if (quantity !== undefined) {
    updates.push("quantity = ?");
    values.push(Number(quantity));
  }
  if (unit !== undefined) {
    updates.push("unit = ?");
    values.push(String(unit).trim());
  }
  if (price !== undefined) {
    updates.push("price = ?");
    values.push(Number(price));
  }
  if (updates.length === 0) {
    const row = db.prepare("SELECT id, vendor_id as vendorId, ingredient_id as ingredientId, name, quantity, unit, price FROM products WHERE id = ?").get(id);
    return res.json(row);
  }
  values.push(id);
  db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  const row = db.prepare("SELECT id, vendor_id as vendorId, ingredient_id as ingredientId, name, quantity, unit, price FROM products WHERE id = ?").get(id);
  res.json(row);
});
