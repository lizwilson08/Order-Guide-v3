import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import type { ProductWithUnitPrice } from "../types";
import { ProductComparisonGroup } from "../components/ProductComparisonGroup";
import { Button, Select, Heading, Caption, Loading } from "../components";
import styles from "./IngredientComparison.module.css";

export function IngredientComparison() {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<ProductWithUnitPrice[]>([]);
  const [ingredientName, setIngredientName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shoppingLists, setShoppingLists] = useState<{ id: number; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;
    api.ingredients
      .get(Number(id))
      .then((ing) => {
        setIngredientName(ing.name);
        return api.ingredients.getProducts(Number(id));
      })
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.shoppingLists.list().then(setShoppingLists).catch(() => {});
  }, []);

  const toggleProduct = (productId: number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const addSelectedToList = () => {
    if (!selectedListId || selectedProductIds.size === 0) return;
    const add = Array.from(selectedProductIds).map((productId) => ({ productId, quantityRequested: 1 }));
    api.shoppingLists
      .updateItems(Number(selectedListId), { add })
      .then(() => setSelectedProductIds(new Set()))
      .catch((e) => alert(e instanceof Error ? e.message : "Failed to add"));
  };

  if (!id) return null;
  if (loading) return <div className={styles.page}><Loading /></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>Error: {error}</p></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Order Guide</Link>
        <Heading as="h1">{ingredientName}</Heading>
        <Caption>Compare unit prices across vendors</Caption>
      </header>

      {products.length > 0 ? (
        <ProductComparisonGroup
          ingredientName={ingredientName}
          products={products}
          productIdLabel={(row) => `${row.id}`}
          onProductAction={() => {}}
          selectedProductIds={selectedProductIds}
          onToggleProduct={toggleProduct}
          children={
            <div className={styles.actions}>
              <Select
                label="Add to shopping list"
                options={[
                  { value: "", label: "Select a list..." },
                  ...shoppingLists.map((l) => ({ value: String(l.id), label: l.name })),
                ]}
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
              />
              <Button
                size="small"
                variant="secondary"
                onClick={addSelectedToList}
                disabled={!selectedListId || selectedProductIds.size === 0}
              >
                Add selected ({selectedProductIds.size})
              </Button>
            </div>
          }
        />
      ) : (
        <p className={styles.empty}>No products for this ingredient yet.</p>
      )}
    </div>
  );
}
