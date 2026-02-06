import { Router } from "express";
import { getDb } from "../db/connection.js";

export const vendorsRouter = Router();
const db = getDb();

vendorsRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT id, name, created_at as createdAt FROM vendors ORDER BY name").all();
  res.json(rows);
});

vendorsRouter.get("/:id", (req, res) => {
  const row = db.prepare("SELECT id, name, created_at as createdAt FROM vendors WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "Vendor not found" });
  res.json(row);
});

vendorsRouter.post("/", (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name is required" });
  const result = db.prepare("INSERT INTO vendors (name) VALUES (?)").run(name.trim());
  const row = db.prepare("SELECT id, name, created_at as createdAt FROM vendors WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(row);
});
