import "./db/init.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { vendorsRouter } from "./routes/vendors.js";
import { ingredientsRouter } from "./routes/ingredients.js";
import { productsRouter } from "./routes/products.js";
import { shoppingListsRouter } from "./routes/shoppingLists.js";
import { purchaseOrdersRouter } from "./routes/purchaseOrders.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT ?? 3001;

app.use("/api/vendors", vendorsRouter);
app.use("/api/ingredients", ingredientsRouter);
app.use("/api/products", productsRouter);
app.use("/api/shopping-lists", shoppingListsRouter);
app.use("/api/purchase-orders", purchaseOrdersRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
