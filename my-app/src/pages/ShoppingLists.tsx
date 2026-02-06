import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { ShoppingList } from "../types";
import { Card, Button, Input, Heading, Caption, Loading } from "../components";
import styles from "./ShoppingLists.module.css";

export function ShoppingLists() {
  const [lists, setLists] = useState<Pick<ShoppingList, "id" | "name" | "createdAt">[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => {
    api.shoppingLists
      .list()
      .then(setLists)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = () => {
    if (!newName.trim()) return;
    setCreating(true);
    api.shoppingLists
      .create({ name: newName.trim() })
      .then(() => {
        setNewName("");
        load();
      })
      .catch((e) => alert(e instanceof Error ? e.message : "Failed to create"))
      .finally(() => setCreating(false));
  };

  if (loading) return <div className={styles.page}><Loading /></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>Error: {error}</p></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>← Order Guide</Link>
        <Heading as="h1">Shopping lists</Heading>
        <Caption>Create lists and turn them into purchase orders</Caption>
      </header>
      <Card title="New list" className={styles.createCard}>
        <div className={styles.createRow}>
          <Input
            placeholder="List name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
          />
          <Button onClick={create} disabled={!newName.trim() || creating}>
            Create
          </Button>
        </div>
      </Card>
      <section className={styles.section}>
        <Heading as="h2">Your lists</Heading>
        {lists.length === 0 ? (
          <p className={styles.empty}>No shopping lists yet.</p>
        ) : (
          <ul className={styles.list}>
            {lists.map((list) => (
              <li key={list.id}>
                <Link to={`/shopping-lists/${list.id}`} className={styles.listLink}>
                  <Card>{list.name}</Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
