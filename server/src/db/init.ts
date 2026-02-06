import { getDb } from "./connection.js";

const db = getDb();

db.exec(`
  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    base_unit TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
  );

  CREATE TABLE IF NOT EXISTS shopping_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS shopping_list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopping_list_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity_requested REAL NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
  );

  CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Seed data if empty
const vendorCount = db.prepare("SELECT COUNT(*) as n FROM vendors").get() as { n: number };
if (vendorCount.n === 0) {
  db.exec(`
    INSERT INTO vendors (name) VALUES ('Sysco'), ('US Foods'), ('Restaurant Depot');
    INSERT INTO ingredients (name, base_unit) VALUES ('Eggs', 'dozen'), ('Butter', 'lb'), ('Chicken breast', 'lb');
    INSERT INTO products (vendor_id, ingredient_id, name, quantity, unit, price) VALUES
      (1, 1, 'Large eggs 15-dozen case', 15, 'dozen', 42.00),
      (1, 1, 'Large eggs flat', 2.5, 'dozen', 8.50),
      (2, 1, 'Large Grade A eggs', 1, 'dozen', 3.20),
      (2, 1, 'Organic large eggs', 1, 'dozen', 5.80),
      (3, 1, 'Large eggs case', 30, 'dozen', 78.00),
      (1, 2, 'Butter salted 1lb', 1, 'lb', 5.50),
      (2, 2, 'Butter unsalted 1lb', 1, 'lb', 5.90),
      (3, 2, 'Butter 5lb block', 5, 'lb', 24.00);
  `);
  console.log("Seed data inserted.");
}

console.log("Database schema initialized.");
