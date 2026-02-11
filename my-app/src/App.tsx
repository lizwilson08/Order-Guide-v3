import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { OrderGuideHome } from "./pages/OrderGuideHome";
import { IngredientComparison } from "./pages/IngredientComparison";
import { ShoppingLists } from "./pages/ShoppingLists";
import { ShoppingListDetail } from "./pages/ShoppingListDetail";
import { PurchaseOrderList } from "./pages/PurchaseOrderList";
import { PurchaseOrderDetail } from "./pages/PurchaseOrderDetail";
import { DesignSystemShowcase } from "./pages/DesignSystemShowcase";
import styles from "./App.module.css";

const ICONS = {
  search: "/images/icons/search.png",
  backArrow: "/images/icons/back-arrow.png",
  chevronDown: "/images/icons/chevron-down-button.png",
  bell: "/images/icons/Bell.png",
  message: "/images/icons/Message-multiple.png",
  clipboard: "/images/icons/Clipboard.png",
  help: "/images/icons/Question-mark-circle.png",
  star: "/images/icons/Four-pointed-star.png",
  person: "/images/icons/person.png",
};

function AppLayout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSearch}>
          <img src={ICONS.search} alt="" className={styles.sidebarSearchIcon} aria-hidden />
          <input type="search" placeholder="Search" className={styles.sidebarSearchInput} aria-label="Search" />
        </div>
        <div className={styles.sidebarHeader}>
          <button type="button" className={styles.sidebarBack} aria-label="Back">
            <img src={ICONS.backArrow} alt="" />
          </button>
          <span className={styles.sidebarHeaderTitle}>Items & menus</span>
        </div>
        <nav className={styles.sidebarNav}>
          <button type="button" className={styles.sidebarNavItem}>
            Items
            <img src={ICONS.chevronDown} alt="" className={styles.sidebarNavChevron} />
          </button>
          <button type="button" className={styles.sidebarNavItem}>
            Menus
            <img src={ICONS.chevronDown} alt="" className={styles.sidebarNavChevron} />
          </button>
          <button type="button" className={styles.sidebarNavItem}>
            Inventory management
            <img src={ICONS.chevronDown} alt="" className={styles.sidebarNavChevron} />
          </button>
          <NavLink to="/" className={({ isActive }) => (isActive ? `${styles.sidebarNavItem} ${styles.sidebarNavItemActive}` : styles.sidebarNavItem)} end>
            Order guide
          </NavLink>
          <Link to="/vendors" className={styles.sidebarNavItem}>
            Vendors
          </Link>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarIcons}>
            <button type="button" className={styles.sidebarIconBtn} aria-label="Notifications">
              <img src={ICONS.bell} alt="" />
            </button>
            <button type="button" className={styles.sidebarIconBtn} aria-label="Messages">
              <img src={ICONS.message} alt="" />
            </button>
            <button type="button" className={styles.sidebarIconBtn} aria-label="Tasks">
              <img src={ICONS.clipboard} alt="" />
            </button>
            <button type="button" className={styles.sidebarIconBtn} aria-label="Help">
              <img src={ICONS.help} alt="" />
            </button>
            <button type="button" className={styles.sidebarIconBtn} aria-label="Favorites">
              <img src={ICONS.star} alt="" />
            </button>
          </div>
          <Link to="/design-system" className={styles.sidebarAccount} aria-label="Design System">
            <img src={ICONS.person} alt="" className={styles.sidebarAccountIcon} />
            <span className={styles.sidebarAccountName}>Square, Inc</span>
          </Link>
        </div>
      </aside>
      <div className={styles.content}>
          <Routes>
            <Route path="/" element={<OrderGuideHome />} />
            <Route path="/ingredients/:id" element={<IngredientComparison />} />
            <Route path="/shopping-lists" element={<ShoppingLists />} />
            <Route path="/shopping-lists/:id" element={<ShoppingListDetail />} />
            <Route path="/purchase-orders" element={<PurchaseOrderList />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
            <Route path="/design-system" element={<DesignSystemShowcase />} />
          </Routes>
        </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
