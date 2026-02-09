import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Ingredient } from "../types";
import type { ProductRow } from "../components/ProductComparisonGroup";
import { ProductComparisonGroup } from "../components/ProductComparisonGroup";
import { Button, Select, Heading, Input, Loading, Badge, Table } from "../components";
import type { Column } from "../components/Table/Table";
import styles from "./OrderGuideHome.module.css";

const PRINT_ICON_SRC = "/images/icons/print.png";
const SEARCH_ICON_SRC = "/images/icons/search.png";
const INGREDIENTS_IMAGE_BASE = "/images/ingredients";

/** Map ingredient names to image filenames in the ingredients folder */
function getIngredientImageUrl(ingredientName: string): string | null {
  const name = ingredientName.trim();
  if (!name) return null;
  const map: Record<string, string> = {
    Eggs: "Eggs-brown.png",
    Butter: "Butter.png",
    "Chicken breast": "Chicken.png",
    Asparagus: "Asparagus.png",
    "Bell peppers": "Bell-peppers.png",
    "Black pepper": "Black-pepper.png",
    "Gouda cheese": "Cheese-gouda.png",
    "Parmesan cheese": "Cheese-parmesan.png",
    "Parmesan grated": "Cheese-parmesan-grated.png",
    Cherries: "Cherries.png",
    "Chia seeds": "Chia-seeds.png",
    Chicken: "Chicken.png",
    Cornmeal: "Cornmeal.png",
    "Liquid eggs": "Eggs-liquid.png",
    "Egg whites": "Eggs-white.png",
    "Flax seeds": "Flax-Seeds.png",
    "Green pepper": "Green-pepper.png",
    "Ground beef": "Ground-Beef.png",
    "Hemp seeds": "Hemp-seeds.png",
    Kale: "Kale.png",
    Lettuce: "Lettuce.png",
    Milk: "Milk.png",
    Oats: "Oats.png",
    "Pasta large": "Pasta-Lg.png",
    "Pasta small": "Pasta-Sm.png",
    "Pumpkin seeds": "Pumpkin-seeds.png",
    Ravioli: "Ravioli.png",
    Rosemary: "Rosemary.png",
    Salmon: "Salmon.png",
    Salt: "Salt.png",
    "Sesame seeds": "Sesame-seeds.png",
    Cardamom: "Spice-Cardamom.png",
    Cinnamon: "Spice-Cinnamon.png",
    Nutmeg: "Spice-Nutmeg.png",
    Paprika: "Spice-Paprika.png",
    Turmeric: "Spice-turmeric.png",
    Strawberries: "Strawberries.png",
    "Sunflower seeds": "Sunflower-seeds.png",
    Thyme: "Thyme.png",
    Tomatoes: "Tomatoes.png",
    "Tomatoes bowl": "Tomatoes-bowl.png",
    Tortillas: "Tortillas.png",
  };
  if (map[name]) return `${INGREDIENTS_IMAGE_BASE}/${map[name]}`;
  const slug = name.replace(/\s+/g, "-");
  return `${INGREDIENTS_IMAGE_BASE}/${slug}.png`;
}

interface IngredientWithProducts {
  ingredient: Ingredient;
  products: ProductRow[];
}

/** Dummy favorites for now: Eggs, Bell peppers, Salmon */
const FAVORITES_DUMMY: { ingredientName: string; products: ProductRow[] }[] = [
  {
    ingredientName: "Eggs",
    products: [
      { id: 101, name: "Large eggs 15-dozen case", vendorName: "Sysco", quantity: 15, unit: "dozen", price: 42, unitPrice: 2.8, unitPriceDisplay: "$2.80/dozen", isBestPrice: true },
      { id: 102, name: "Large Grade A eggs", vendorName: "US Foods", quantity: 1, unit: "dozen", price: 3.2, unitPrice: 3.2, unitPriceDisplay: "$3.20/dozen", isBestPrice: false },
      { id: 103, name: "Organic large eggs", vendorName: "US Foods", quantity: 1, unit: "dozen", price: 5.8, unitPrice: 5.8, unitPriceDisplay: "$5.80/dozen", isBestPrice: false },
    ],
  },
  {
    ingredientName: "Bell peppers",
    products: [
      { id: 201, name: "Bell peppers green 1.5 lb bag", vendorName: "Sysco", quantity: 1, unit: "bag", price: 4.5, unitPrice: 3, unitPriceDisplay: "$3.00/lb", isBestPrice: true },
      { id: 202, name: "Tri-color bell peppers case", vendorName: "US Foods", quantity: 12, unit: "each", price: 38, unitPrice: 3.17, unitPriceDisplay: "$3.17/ea", isBestPrice: false },
      { id: 203, name: "Organic bell peppers", vendorName: "Restaurant Depot", quantity: 1, unit: "lb", price: 4.25, unitPrice: 4.25, unitPriceDisplay: "$4.25/lb", isBestPrice: false },
    ],
  },
  {
    ingredientName: "Salmon",
    products: [
      { id: 301, name: "Sockeye salmon whole fresh", vendorName: "Sysco", quantity: 10, unit: "lb", price: 62.5, unitPrice: 6.25, unitPriceDisplay: "$6.25/lb", isBestPrice: true },
      { id: 302, name: "Atlantic salmon fillet", vendorName: "US Foods", quantity: 5, unit: "lb", price: 35, unitPrice: 7, unitPriceDisplay: "$7.00/lb", isBestPrice: false },
      { id: 303, name: "Salmon portion 6 oz", vendorName: "Restaurant Depot", quantity: 24, unit: "each", price: 72, unitPrice: 8, unitPriceDisplay: "$8.00/ea", isBestPrice: false },
    ],
  },
];

/** Dummy products for Chicken breast in All products */
const CHICKEN_BREAST_DUMMY_PRODUCTS: ProductRow[] = [
  { id: 401, name: "Chicken breast boneless skinless", vendorName: "Sysco", quantity: 10, unit: "lb", price: 28.5, unitPrice: 2.85, unitPriceDisplay: "$2.85/lb", isBestPrice: true },
  { id: 402, name: "Chicken breast IQF", vendorName: "US Foods", quantity: 5, unit: "lb", price: 16, unitPrice: 3.2, unitPriceDisplay: "$3.20/lb", isBestPrice: false },
  { id: 403, name: "Organic chicken breast", vendorName: "Restaurant Depot", quantity: 6, unit: "lb", price: 24, unitPrice: 4, unitPriceDisplay: "$4.00/lb", isBestPrice: false },
];

/** Extra groups for All products: Lettuce, Tomatoes, Ground beef */
const ALL_PRODUCTS_EXTRA: IngredientWithProducts[] = [
  {
    ingredient: { id: -1, name: "Lettuce", baseUnit: "lb" },
    products: [
      { id: 501, name: "Romaine lettuce case", vendorName: "Sysco", quantity: 24, unit: "head", price: 32, unitPrice: 1.33, unitPriceDisplay: "$1.33/head", isBestPrice: true },
      { id: 502, name: "Mixed greens 5 lb", vendorName: "US Foods", quantity: 5, unit: "lb", price: 18, unitPrice: 3.6, unitPriceDisplay: "$3.60/lb", isBestPrice: false },
      { id: 503, name: "Iceberg lettuce case", vendorName: "Restaurant Depot", quantity: 18, unit: "head", price: 22, unitPrice: 1.22, unitPriceDisplay: "$1.22/head", isBestPrice: false },
    ],
  },
  {
    ingredient: { id: -2, name: "Tomatoes", baseUnit: "lb" },
    products: [
      { id: 601, name: "Roma tomatoes 25 lb case", vendorName: "Sysco", quantity: 25, unit: "lb", price: 28, unitPrice: 1.12, unitPriceDisplay: "$1.12/lb", isBestPrice: true },
      { id: 602, name: "Vine tomatoes 10 lb", vendorName: "US Foods", quantity: 10, unit: "lb", price: 14, unitPrice: 1.4, unitPriceDisplay: "$1.40/lb", isBestPrice: false },
      { id: 603, name: "Cherry tomatoes pint", vendorName: "Restaurant Depot", quantity: 1, unit: "pint", price: 3.5, unitPrice: 3.5, unitPriceDisplay: "$3.50/pint", isBestPrice: false },
    ],
  },
  {
    ingredient: { id: -3, name: "Ground beef", baseUnit: "lb" },
    products: [
      { id: 701, name: "Ground beef 80/20", vendorName: "Sysco", quantity: 10, unit: "lb", price: 42, unitPrice: 4.2, unitPriceDisplay: "$4.20/lb", isBestPrice: true },
      { id: 702, name: "Ground beef 85/15", vendorName: "US Foods", quantity: 5, unit: "lb", price: 24, unitPrice: 4.8, unitPriceDisplay: "$4.80/lb", isBestPrice: false },
      { id: 703, name: "Organic ground beef", vendorName: "Restaurant Depot", quantity: 3, unit: "lb", price: 18, unitPrice: 6, unitPriceDisplay: "$6.00/lb", isBestPrice: false },
    ],
  },
];

/** Active order row for Orders tab (vendor, product count, total, status) */
interface ActiveOrderRow {
  id: string;
  vendorName: string;
  productCount: number;
  total: number;
  status: "pending" | "draft";
}
const ACTIVE_ORDERS_DUMMY: ActiveOrderRow[] = [
  { id: "1", vendorName: "JD Foods", productCount: 36, total: 287.17, status: "pending" },
  { id: "2", vendorName: "Farmer Brothers", productCount: 80, total: 287.17, status: "draft" },
  { id: "3", vendorName: "Sysco", productCount: 80, total: 287.17, status: "draft" },
];

/** Price change row for Orders tab */
interface PriceChangeRow {
  id: string;
  productName: string;
  packerId: string;
  priceDisplay: string;
  changePercent: number;
  isIncrease: boolean;
  imageUrl: string | null;
}
const PRICE_CHANGES_DUMMY: PriceChangeRow[] = [
  { id: "1", productName: "Lettuce Spring Mix Sweet Pillow", packerId: "2321452", priceDisplay: "$22.47/cs", changePercent: 2.4, isIncrease: false, imageUrl: "/images/ingredients/Lettuce.png" },
  { id: "2", productName: "Atlantic Salmon, Fillet, Frozen", packerId: "8845210", priceDisplay: "$12.50/lb", changePercent: 2.4, isIncrease: false, imageUrl: "/images/ingredients/Salmon.png" },
  { id: "3", productName: "Shell Eggs, Large, Grade A, 15-dozen case", packerId: "4451234", priceDisplay: "$42.00/cs", changePercent: 4.6, isIncrease: true, imageUrl: "/images/ingredients/Eggs-brown.png" },
];

/** Past order row for Orders tab table */
interface PastOrderRow {
  id: number;
  orderId: number;
  status: string;
  vendor: string;
  total: string;
}
const PAST_ORDERS_DUMMY: PastOrderRow[] = [
  { id: 125, orderId: 125, status: "Completed", vendor: "Sysco", total: "$1,289.00" },
  { id: 124, orderId: 124, status: "Completed", vendor: "US Foods", total: "$938.00" },
  { id: 123, orderId: 123, status: "Cancelled", vendor: "Meat Market", total: "$445.00" },
  { id: 122, orderId: 122, status: "Completed", vendor: "Farmer Brothers", total: "$612.50" },
  { id: 121, orderId: 121, status: "Completed", vendor: "Fishmonger", total: "$320.00" },
];

const PAST_ORDERS_COLUMNS: Column<PastOrderRow>[] = [
  { key: "orderId", header: "Order" },
  { key: "status", header: "Status" },
  { key: "vendor", header: "Vendor" },
  { key: "total", header: "Total" },
];

export function OrderGuideHome() {
  const [ingredientsWithProducts, setIngredientsWithProducts] = useState<IngredientWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profitability" | "orders">("profitability");
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [sortByFilter, setSortByFilter] = useState("best");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.ingredients
      .list()
      .then((ingredients) => {
        return Promise.all(
          ingredients.map((ingredient) =>
            api.ingredients.getProducts(ingredient.id).then((products) => ({
              ingredient,
              products: products as ProductRow[],
            }))
          )
        );
      })
      .then(setIngredientsWithProducts)
      .catch(() => {
        // No API (e.g. Vercel preview): show page with dummy/empty data
        setIngredientsWithProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredForSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ingredientsWithProducts;
    return ingredientsWithProducts.filter(
      (item) =>
        item.ingredient.name.toLowerCase().includes(q) ||
        item.products.some(
          (p) => p.name.toLowerCase().includes(q) || (p.vendorName?.toLowerCase().includes(q) ?? false)
        )
    );
  }, [ingredientsWithProducts, searchQuery]);

  const allProducts = useMemo(() => {
    const withoutEggs = filteredForSearch.filter((item) => item.ingredient.name !== "Eggs");
    const withChickenDummy = withoutEggs.map((item) =>
      item.ingredient.name === "Chicken breast"
        ? { ...item, products: item.products.length ? item.products : CHICKEN_BREAST_DUMMY_PRODUCTS }
        : item
    );
    return [...withChickenDummy, ...ALL_PRODUCTS_EXTRA];
  }, [filteredForSearch]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Heading as="h1">Order guide</Heading>
        <div className={styles.headerActions}>
          <Button
            type="button"
            variant="ghost"
            shape="circle"
            className={styles.printButton}
            aria-label="Print"
            onClick={() => {}}
          >
            <img src={PRINT_ICON_SRC} alt="" className={styles.printIcon} />
          </Button>
          <div className={styles.actionsSelectWrap}>
            <Select
              options={[
                { value: "", label: "Actions" },
                { value: "export", label: "Export" },
                { value: "favorites", label: "Manage favorites" },
              ]}
              value=""
              onChange={() => {}}
              aria-label="Actions"
            />
          </div>
          <Button variant="primary" onClick={() => {}}>
            Create order
          </Button>
        </div>
      </header>

      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === "profitability" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActiveTab("profitability")}
          aria-selected={activeTab === "profitability"}
        >
          Profitability
        </button>
        <button
          type="button"
          className={activeTab === "orders" ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActiveTab("orders")}
          aria-selected={activeTab === "orders"}
        >
          Orders
        </button>
      </div>

      {activeTab === "profitability" && (
        <>
          <div className={styles.toolbar}>
            {searchExpanded ? (
              <div className={styles.searchWrap}>
                <img src={SEARCH_ICON_SRC} alt="" className={styles.searchIconImg} aria-hidden />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search products or ingredients"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => setSearchExpanded(false)}
                  className={styles.searchInput}
                  aria-label="Search products or ingredients"
                  autoFocus
                />
              </div>
            ) : (
              <button
                type="button"
                className={styles.searchTrigger}
                onClick={() => {
                  setSearchExpanded(true);
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                }}
                aria-label="Search products or ingredients"
              >
                <img src={SEARCH_ICON_SRC} alt="" className={styles.searchTriggerIcon} />
              </button>
            )}
            <div className={styles.filterPills}>
              <div className={styles.filterButton}>
                <span className={styles.filterButtonVisual} aria-hidden>
                  <span className={styles.filterButtonLabel}>Vendor</span>{" "}
                  <span className={styles.filterButtonValue}>
                    {vendorFilter === "all" ? "All" : vendorFilter}
                  </span>
                </span>
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className={styles.filterButtonSelect}
                  aria-label="Vendor filter"
                >
                  <option value="all">All</option>
                </select>
              </div>
              <div className={styles.filterButton}>
                <span className={styles.filterButtonVisual} aria-hidden>
                  <span className={styles.filterButtonLabel}>Item type</span>{" "}
                  <span className={styles.filterButtonValue}>
                    {itemTypeFilter === "all" ? "All" : itemTypeFilter}
                  </span>
                </span>
                <select
                  value={itemTypeFilter}
                  onChange={(e) => setItemTypeFilter(e.target.value)}
                  className={styles.filterButtonSelect}
                  aria-label="Item type filter"
                >
                  <option value="all">All</option>
                </select>
              </div>
              <div className={styles.filterButton}>
                <span className={styles.filterButtonVisual} aria-hidden>
                  <span className={styles.filterButtonLabel}>Sort by</span>{" "}
                  <span className={styles.filterButtonValue}>
                    {sortByFilter === "best" ? "Best price" : sortByFilter === "name" ? "Name" : "Best price"}
                  </span>
                </span>
                <select
                  value={sortByFilter}
                  onChange={(e) => setSortByFilter(e.target.value)}
                  className={styles.filterButtonSelect}
                  aria-label="Sort by"
                >
                  <option value="best">Best price</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>

          <main className={styles.main}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Favorites</h2>
                <button type="button" className={styles.editLink} onClick={() => {}}>
                  Edit
                </button>
              </div>
              <div className={styles.sectionList}>
                {FAVORITES_DUMMY.map((item, index) => (
                  <ProductComparisonGroup
                    key={`favorite-${item.ingredientName}-${index}`}
                    ingredientName={item.ingredientName}
                    ingredientImageUrl={getIngredientImageUrl(item.ingredientName)}
                    products={item.products}
                    productIdLabel={(row) => `ID ${row.id}`}
                    onEdit={() => {}}
                    onProductAction={() => {}}
                  />
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>All products</h2>
              <div className={styles.sectionList}>
                {allProducts.length === 0 ? (
                  <p className={styles.placeholder}>No ingredient groups yet. Add ingredients and products via the API.</p>
                ) : (
                  allProducts.map((item) => (
                    <ProductComparisonGroup
                      key={item.ingredient.id}
                      ingredientName={item.ingredient.name}
                      ingredientImageUrl={getIngredientImageUrl(item.ingredient.name)}
                      products={item.products}
                      productIdLabel={(row) => `ID ${row.id}`}
                      onEdit={() => {}}
                      onProductAction={() => {}}
                    />
                  ))
                )}
              </div>
            </section>
          </main>
        </>
      )}

      {activeTab === "orders" && (
        <main className={styles.main}>
          <div className={styles.ordersTopRow}>
            <section className={styles.ordersCard}>
              <h3 className={styles.ordersCardTitle}>Active orders</h3>
              <ul className={styles.activeOrdersList}>
                {ACTIVE_ORDERS_DUMMY.map((row) => (
                  <li key={row.id}>
                    <Link to="/purchase-orders/1" className={styles.activeOrderLink}>
                      <div className={styles.activeOrderMain}>
                        <span className={styles.activeOrderVendor}>{row.vendorName}</span>
                        <span className={styles.activeOrderMeta}>
                          {row.productCount} products | ${row.total.toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.activeOrderRight}>
                        <Badge variant={row.status === "pending" ? "warning" : "default"}>
                          {row.status === "pending" ? "Pending" : "Draft"}
                        </Badge>
                        <span className={styles.activeOrderArrow} aria-hidden>→</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <section className={styles.ordersCard}>
              <div className={styles.ordersCardHeader}>
                <h3 className={styles.ordersCardTitle}>Price changes</h3>
                <button type="button" className={styles.ordersCardMore}>More</button>
              </div>
              <ul className={styles.priceChangesList}>
                {PRICE_CHANGES_DUMMY.map((row) => (
                  <li key={row.id} className={styles.priceChangeRow}>
                    {row.imageUrl && (
                      <img src={row.imageUrl} alt="" className={styles.priceChangeImg} />
                    )}
                    <div className={styles.priceChangeBody}>
                      <span className={styles.priceChangeName}>{row.productName}</span>
                      <span className={styles.priceChangePacker}>Packer | {row.packerId}</span>
                      <span className={styles.priceChangePrice}>{row.priceDisplay}</span>
                    </div>
                    <span className={row.isIncrease ? styles.priceChangeUp : styles.priceChangeDown}>
                      {row.changePercent}% {row.isIncrease ? "increase" : "decrease"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Past orders</h2>
              <button type="button" className={styles.editLink} onClick={() => {}}>Edit</button>
            </div>
            <div className={styles.pastOrdersTableWrap}>
              <Table<PastOrderRow>
                columns={PAST_ORDERS_COLUMNS}
                data={PAST_ORDERS_DUMMY}
                keyExtractor={(row) => row.id}
              />
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

