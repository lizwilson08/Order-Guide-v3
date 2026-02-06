import { Router } from "express";
import { getDb } from "../db/connection.js";
import { pricePerBaseUnit, formatUnitPrice } from "../services/unitConversion.js";

export const ingredientsRouter = Router();
const db = getDb();

ingredientsRouter.get("/", (_req, res) => {
  const rows = db
    .prepare(
      "SELECT id, name, base_unit as baseUnit, created_at as createdAt FROM ingredients ORDER BY name"
    )
    .all();
  res.json(rows);
});

ingredientsRouter.get("/:id", (req, res) => {
  const row = db
    .prepare(
      "SELECT id, name, base_unit as baseUnit, created_at as createdAt FROM ingredients WHERE id = ?"
    )
    .get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "Ingredient not found" });
  res.json(row);
});

ingredientsRouter.get("/:id/products", (req, res) => {
  const ingredientId = Number(req.params.id);
  const ingredient = db
    .prepare("SELECT id, name, base_unit as baseUnit FROM ingredients WHERE id = ?")
    .get(ingredientId) as { id: number; name: string; baseUnit: string } | undefined;
  if (!ingredient) return res.status(404).json({ error: "Ingredient not found" });

  const rows = db
    .prepare(
      `SELECT p.id, p.vendor_id as vendorId, p.ingredient_id as ingredientId, p.name, p.quantity, p.unit, p.price,
              v.name as vendorName
       FROM products p
       JOIN vendors v ON v.id = p.vendor_id
       WHERE p.ingredient_id = ?
       ORDER BY p.price`
    )
    .all(ingredientId) as Array<{
    id: number;
    vendorId: number;
    ingredientId: number;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    vendorName: string;
  }>;

  const baseUnit = ingredient.baseUnit;
  const withUnitPrice = rows.map((r) => {
    const unitPrice = pricePerBaseUnit(r.price, r.quantity, r.unit, baseUnit);
    return {
      ...r,
      unitPrice,
      unitPriceDisplay: formatUnitPrice(unitPrice, baseUnit),
    };
  });
  const sorted = withUnitPrice.sort((a, b) => a.unitPrice - b.unitPrice);
  const minPrice = sorted[0]?.unitPrice;
  const withBest = sorted.map((r) => ({
    ...r,
    isBestPrice: minPrice != null && r.unitPrice === minPrice,
  }));
  res.json(withBest);
});

ingredientsRouter.post("/", (req, res) => {
  const { name, baseUnit } = req.body;
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
  if (!baseUnit || typeof baseUnit !== "string") return res.status(400).json({ error: "baseUnit is required" });
  const result = db
    .prepare("INSERT INTO ingredients (name, base_unit) VALUES (?, ?)")
    .run(name.trim(), baseUnit.trim());
  const row = db
    .prepare("SELECT id, name, base_unit as baseUnit, created_at as createdAt FROM ingredients WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(row);
});
