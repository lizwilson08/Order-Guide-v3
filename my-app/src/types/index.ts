export interface Vendor {
  id: number;
  name: string;
  createdAt?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  baseUnit: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  vendorId: number;
  ingredientId: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  vendorName?: string;
}

export interface ProductWithUnitPrice extends Product {
  unitPrice: number;
  unitPriceDisplay: string;
  isBestPrice?: boolean;
}

export interface ShoppingList {
  id: number;
  name: string;
  createdAt?: string;
  items?: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: number;
  shoppingListId: number;
  productId: number;
  quantityRequested: number;
  productName?: string;
  productQuantity?: number;
  unit?: string;
  price?: number;
  vendorName?: string;
}

export interface PurchaseOrder {
  id: number;
  vendorId: number;
  status: string;
  createdAt?: string;
  vendorName?: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  productName?: string;
  unit?: string;
}
