/** Vendors shown in create-order vendor selection (matches public/images/logos) */
export interface CreateOrderVendor {
  id: string;
  name: string;
  logoPath: string;
  /** Minimum order amount in USD; used for "X% to minimum" in the products step bar */
  minimumOrder?: number;
}

/** Bump when logo assets in public/images/logos are updated so browsers load the latest */
const LOGO_VERSION = "4";

export const VENDORS_CREATE_ORDER: CreateOrderVendor[] = [
  { id: "sysco", name: "Sysco", logoPath: `/images/logos/sysco.png?v=${LOGO_VERSION}`, minimumOrder: 350 },
  { id: "odeko", name: "Odeko", logoPath: `/images/logos/odeko.png?v=${LOGO_VERSION}`, minimumOrder: 75 },
  { id: "baldor", name: "Baldor", logoPath: `/images/logos/baldor.png?v=${LOGO_VERSION}`, minimumOrder: 250 },
  { id: "challenge", name: "Challenge", logoPath: `/images/logos/challenge.png?v=${LOGO_VERSION}`, minimumOrder: 100 },
  { id: "meat-market", name: "Meat Market", logoPath: `/images/logos/meat-market.png?v=${LOGO_VERSION}`, minimumOrder: 150 },
  { id: "saladinos", name: "Saladinos", logoPath: `/images/logos/saladinos.png?v=${LOGO_VERSION}`, minimumOrder: 200 },
  { id: "farmer-bros", name: "Farmer Brothers", logoPath: `/images/logos/farmer-bros.png?v=${LOGO_VERSION}`, minimumOrder: 50 },
  { id: "costco", name: "Costco", logoPath: `/images/logos/costco.png?v=${LOGO_VERSION}`, minimumOrder: 250 },
];

/** Minimal product row for "recently ordered" and catalog. Optional fields for row display (Figma: image, packer, price change). */
export interface CatalogProduct {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  packerId?: string;
  priceDisplay?: string;
  changePercent?: number;
  isIncrease?: boolean;
  imageUrl?: string | null;
}

/** "Regulars" / recently ordered products per vendor (for step 2). Same row format as Top price changes. */
export const RECENT_PRODUCTS_BY_VENDOR: Record<string, CatalogProduct[]> = {
  sysco: [
    { productName: "Lettuce Spring Mix Sweet Pillow", quantity: 1, unit: "cs", unitPrice: 22.47, lineTotal: 22.47, packerId: "2321452", priceDisplay: "$22.47/cs", changePercent: 2.4, isIncrease: false, imageUrl: "/images/ingredients/Lettuce.png" },
    { productName: "Atlantic Salmon, Fillet, Frozen", quantity: 1, unit: "lb", unitPrice: 12.5, lineTotal: 12.5, packerId: "8845210", priceDisplay: "$12.50/lb", changePercent: 2.4, isIncrease: false, imageUrl: "/images/ingredients/Salmon.png" },
    { productName: "Shell Eggs, Large, Grade A, 15-dozen case", quantity: 1, unit: "cs", unitPrice: 42, lineTotal: 42, packerId: "4451234", priceDisplay: "$42.00/cs", changePercent: 4.6, isIncrease: true, imageUrl: "/images/ingredients/Eggs-brown.png" },
    { productName: "Organic Milk, Whole, 1-gallon jug", quantity: 1, unit: "gal", unitPrice: 3.49, lineTotal: 3.49, packerId: "7788123", priceDisplay: "$3.49/gal", changePercent: 2.1, isIncrease: true, imageUrl: "/images/ingredients/Milk.png" },
    { productName: "Whole Wheat Bread, 20 oz loaves", quantity: 1, unit: "loaf", unitPrice: 2.99, lineTotal: 2.99, packerId: "3344556", priceDisplay: "$2.99/loaf", changePercent: 1.5, isIncrease: false, imageUrl: null },
    { productName: "Fresh Strawberries, 1 lb containers", quantity: 1, unit: "lb", unitPrice: 4.99, lineTotal: 4.99, packerId: "6677890", priceDisplay: "$4.99/lb", changePercent: 5, isIncrease: true, imageUrl: "/images/ingredients/Strawberries.png" },
  ],
  "farmer-bros": [
    { productName: "Whole Bean Coffee", quantity: 4, unit: "lb", unitPrice: 8.99, lineTotal: 35.96, packerId: "551234", priceDisplay: "$8.99/lb", changePercent: 1.2, isIncrease: true },
    { productName: "Half & Half", quantity: 8, unit: "gal", unitPrice: 28.5, lineTotal: 228, priceDisplay: "$28.50/gal", changePercent: 0, isIncrease: false },
    { productName: "Tea Bags English Breakfast", quantity: 5, unit: "cs", unitPrice: 18, lineTotal: 90, priceDisplay: "$18.00/cs", changePercent: 0.5, isIncrease: false },
  ],
  "meat-market": [
    { productName: "Ribeye Steak", quantity: 20, unit: "lb", unitPrice: 14.99, lineTotal: 299.8, packerId: "991234", priceDisplay: "$14.99/lb", changePercent: 3, isIncrease: true },
    { productName: "Pork Chops", quantity: 15, unit: "lb", unitPrice: 9.67, lineTotal: 145.05, priceDisplay: "$9.67/lb", changePercent: 0, isIncrease: false },
  ],
  odeko: [
    { productName: "Organic Milk", quantity: 4, unit: "gal", unitPrice: 18, lineTotal: 72, priceDisplay: "$18.00/gal", changePercent: 0, isIncrease: false },
    { productName: "Butter", quantity: 10, unit: "lb", unitPrice: 5.5, lineTotal: 55, priceDisplay: "$5.50/lb", changePercent: 0, isIncrease: false },
  ],
  baldor: [
    { productName: "Roma Tomatoes", quantity: 25, unit: "lb", unitPrice: 1.12, lineTotal: 28, priceDisplay: "$1.12/lb", changePercent: 2, isIncrease: true, imageUrl: "/images/ingredients/Tomatoes.png" },
    { productName: "Mixed Greens", quantity: 10, unit: "cs", unitPrice: 28, lineTotal: 280, priceDisplay: "$28.00/cs", changePercent: 0, isIncrease: false, imageUrl: "/images/ingredients/Lettuce.png" },
  ],
  challenge: [
    { productName: "Baking Flour", quantity: 50, unit: "lb", unitPrice: 0.42, lineTotal: 21, priceDisplay: "$0.42/lb", changePercent: 1.5, isIncrease: false },
    { productName: "Sugar", quantity: 25, unit: "lb", unitPrice: 0.55, lineTotal: 13.75, priceDisplay: "$0.55/lb", changePercent: 0, isIncrease: false },
  ],
  saladinos: [
    { productName: "Olive Oil", quantity: 12, unit: "bts", unitPrice: 24.5, lineTotal: 294, priceDisplay: "$24.50/bts", changePercent: 0.8, isIncrease: true },
    { productName: "Balsamic Vinegar", quantity: 6, unit: "bts", unitPrice: 23.83, lineTotal: 142.98, priceDisplay: "$23.83/bts", changePercent: 0, isIncrease: false },
  ],
  costco: [
    { productName: "Paper Towels", quantity: 24, unit: "pk", unitPrice: 18, lineTotal: 432, priceDisplay: "$18.00/pk", changePercent: 0, isIncrease: false },
    { productName: "Disinfectant", quantity: 4, unit: "gal", unitPrice: 12, lineTotal: 48, priceDisplay: "$12.00/gal", changePercent: 0, isIncrease: false },
  ],
};

/** Price change row for create-order step 2 */
export interface PriceChangeProduct {
  id: string;
  productName: string;
  packerId: string;
  priceDisplay: string;
  changePercent: number;
  isIncrease: boolean;
  unit: string;
  unitPrice: number;
  vendorId: string;
  imageUrl?: string | null;
}

export const PRICE_CHANGES_BY_VENDOR: Record<string, PriceChangeProduct[]> = {
  sysco: [
    { id: "s1", productName: "Lettuce Spring Mix Sweet Pillow", packerId: "2321452", priceDisplay: "$22.47/cs", changePercent: 2.4, isIncrease: false, unit: "cs", unitPrice: 22.47, vendorId: "sysco", imageUrl: "/images/ingredients/Lettuce.png" },
    { id: "s2", productName: "Atlantic Salmon, Fillet, Frozen", packerId: "8845210", priceDisplay: "$12.50/lb", changePercent: 2.4, isIncrease: false, unit: "lb", unitPrice: 12.5, vendorId: "sysco", imageUrl: "/images/ingredients/Salmon.png" },
    { id: "s3", productName: "Shell Eggs, Large, Grade A, 15-dozen case", packerId: "4451234", priceDisplay: "$42.00/cs", changePercent: 4.6, isIncrease: true, unit: "cs", unitPrice: 42, vendorId: "sysco", imageUrl: "/images/ingredients/Eggs-brown.png" },
    { id: "s4", productName: "Spinach, Fresh, 16 oz bags", packerId: "5566778", priceDisplay: "$1.99/bag", changePercent: 4.4, isIncrease: true, unit: "bag", unitPrice: 1.99, vendorId: "sysco", imageUrl: "/images/ingredients/Kale.png" },
  ],
  "farmer-bros": [
    { id: "f1", productName: "Whole Bean Coffee", packerId: "551234", priceDisplay: "$8.99/lb", changePercent: 1.2, isIncrease: true, unit: "lb", unitPrice: 8.99, vendorId: "farmer-bros" },
    { id: "f2", productName: "Decaf Coffee", packerId: "551235", priceDisplay: "$9.50/lb", changePercent: 0.5, isIncrease: false, unit: "lb", unitPrice: 9.5, vendorId: "farmer-bros" },
  ],
  "meat-market": [
    { id: "m1", productName: "Ribeye Steak", packerId: "991234", priceDisplay: "$14.99/lb", changePercent: 3, isIncrease: true, unit: "lb", unitPrice: 14.99, vendorId: "meat-market" },
  ],
  odeko: [
    { id: "o1", productName: "Organic Milk", packerId: "441234", priceDisplay: "$18.00/gal", changePercent: 0, isIncrease: false, unit: "gal", unitPrice: 18, vendorId: "odeko" },
  ],
  baldor: [
    { id: "b1", productName: "Roma Tomatoes", packerId: "771234", priceDisplay: "$1.12/lb", changePercent: 2, isIncrease: true, unit: "lb", unitPrice: 1.12, vendorId: "baldor" },
  ],
  challenge: [
    { id: "c1", productName: "Baking Flour", packerId: "331234", priceDisplay: "$0.42/lb", changePercent: 1.5, isIncrease: false, unit: "lb", unitPrice: 0.42, vendorId: "challenge" },
  ],
  saladinos: [
    { id: "sal1", productName: "Olive Oil", packerId: "661234", priceDisplay: "$24.50/bts", changePercent: 0.8, isIncrease: true, unit: "bts", unitPrice: 24.5, vendorId: "saladinos" },
  ],
  costco: [
    { id: "co1", productName: "Paper Towels", packerId: "881234", priceDisplay: "$18.00/pk", changePercent: 0, isIncrease: false, unit: "pk", unitPrice: 18, vendorId: "costco" },
  ],
};

/** Full catalog per vendor for search modal */
export const VENDOR_CATALOG_DUMMY: Record<string, CatalogProduct[]> = {
  sysco: [
    ...(RECENT_PRODUCTS_BY_VENDOR.sysco ?? []),
    { productName: "Organic Tomatoes", quantity: 1, unit: "cs", unitPrice: 18.5, lineTotal: 18.5 },
    { productName: "Romaine Lettuce", quantity: 1, unit: "cs", unitPrice: 10.89, lineTotal: 10.89 },
    { productName: "Olive Oil", quantity: 1, unit: "bts", unitPrice: 24.5, lineTotal: 24.5 },
  ],
  "farmer-bros": [
    ...(RECENT_PRODUCTS_BY_VENDOR["farmer-bros"] ?? []),
    { productName: "Sugar Packets", quantity: 1, unit: "cs", unitPrice: 4.5, lineTotal: 4.5 },
    { productName: "Creamer Powder", quantity: 1, unit: "lb", unitPrice: 12, lineTotal: 12 },
    { productName: "Hot Chocolate Mix", quantity: 1, unit: "lb", unitPrice: 8.25, lineTotal: 8.25 },
  ],
  "meat-market": [...(RECENT_PRODUCTS_BY_VENDOR["meat-market"] ?? [])],
  odeko: [...(RECENT_PRODUCTS_BY_VENDOR.odeko ?? [])],
  baldor: [...(RECENT_PRODUCTS_BY_VENDOR.baldor ?? [])],
  challenge: [...(RECENT_PRODUCTS_BY_VENDOR.challenge ?? [])],
  saladinos: [...(RECENT_PRODUCTS_BY_VENDOR.saladinos ?? [])],
  costco: [...(RECENT_PRODUCTS_BY_VENDOR.costco ?? [])],
};
