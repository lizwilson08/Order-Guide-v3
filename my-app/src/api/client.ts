const API_BASE = "/api";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json") || text.trimStart().startsWith("<")) {
    throw new Error("API unavailable");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("API unavailable");
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { ...init } = options ?? {};
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) {
    const err = await parseJson<{ error?: string }>(res).catch(() => ({ error: res.statusText }));
    throw new Error(err?.error ?? res.statusText);
  }
  return parseJson<T>(res);
}

export const api = {
  vendors: {
    list: () => request<{ id: number; name: string; createdAt: string }[]>("/vendors"),
    get: (id: number) => request<{ id: number; name: string; createdAt: string }>(`/vendors/${id}`),
    create: (body: { name: string }) =>
      request<{ id: number; name: string; createdAt: string }>("/vendors", { method: "POST", body: JSON.stringify(body) }),
  },
  ingredients: {
    list: () =>
      request<{ id: number; name: string; baseUnit: string; createdAt: string }[]>("/ingredients"),
    get: (id: number) =>
      request<{ id: number; name: string; baseUnit: string; createdAt: string }>(`/ingredients/${id}`),
    getProducts: (id: number) =>
      request<
        Array<{
          id: number;
          vendorId: number;
          ingredientId: number;
          name: string;
          quantity: number;
          unit: string;
          price: number;
          vendorName: string;
          unitPrice: number;
          unitPriceDisplay: string;
          isBestPrice: boolean;
        }>
      >(`/ingredients/${id}/products`),
    create: (body: { name: string; baseUnit: string }) =>
      request<{ id: number; name: string; baseUnit: string; createdAt: string }>("/ingredients", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  products: {
    list: (params?: { ingredientId?: number; vendorId?: number }) => {
      const search =
        params && (params.ingredientId != null || params.vendorId != null)
          ? new URLSearchParams(
              Object.fromEntries(
                Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
              )
            ).toString()
          : "";
      return request<
        Array<{
          id: number;
          vendorId: number;
          ingredientId: number;
          name: string;
          quantity: number;
          unit: string;
          price: number;
          vendorName: string;
        }>
      >(`/products${search ? `?${search}` : ""}`);
    },
    create: (body: {
      vendorId: number;
      ingredientId: number;
      name: string;
      quantity: number;
      unit: string;
      price: number;
    }) =>
      request<{ id: number; vendorId: number; ingredientId: number; name: string; quantity: number; unit: string; price: number }>(
        "/products",
        { method: "POST", body: JSON.stringify(body) }
      ),
  },
  shoppingLists: {
    list: () =>
      request<{ id: number; name: string; createdAt: string }[]>("/shopping-lists"),
    get: (id: number) =>
      request<{
        id: number;
        name: string;
        createdAt: string;
        items: Array<{
          id: number;
          shoppingListId: number;
          productId: number;
          quantityRequested: number;
          productName: string;
          productQuantity: number;
          unit: string;
          price: number;
          vendorName: string;
        }>;
      }>(`/shopping-lists/${id}`),
    create: (body: { name: string }) =>
      request<{ id: number; name: string; createdAt: string }>("/shopping-lists", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    updateItems: (
      id: number,
      body: {
        add?: Array<{ productId: number; quantityRequested?: number }>;
        remove?: number[];
      }
    ) =>
      request<{ items: unknown[] }>(`/shopping-lists/${id}/items`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },
  purchaseOrders: {
    list: () =>
      request<
        Array<{ id: number; vendorId: number; status: string; createdAt: string; vendorName: string }>
      >("/purchase-orders"),
    get: (id: number) =>
      request<{
        id: number;
        vendorId: number;
        status: string;
        createdAt: string;
        vendorName: string;
        items: Array<{
          id: number;
          purchaseOrderId: number;
          productId: number;
          quantity: number;
          unitPrice: number;
          productName: string;
          unit: string;
        }>;
      }>(`/purchase-orders/${id}`),
    createFromShoppingList: (shoppingListId: number) =>
      request<unknown[]>("/purchase-orders/from-shopping-list", {
        method: "POST",
        body: JSON.stringify({ shoppingListId }),
      }),
    create: (body: {
      vendorId: number;
      items: Array<{ productId: number; quantity: number; unitPrice: number }>;
    }) =>
      request<{ id: number; vendorId: number; status: string; createdAt: string; vendorName: string }>(
        "/purchase-orders",
        { method: "POST", body: JSON.stringify(body) }
      ),
    updateStatus: (id: number, status: "draft" | "sent" | "confirmed") =>
      request<{ id: number; vendorId: number; status: string; createdAt: string; vendorName: string }>(
        `/purchase-orders/${id}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) }
      ),
  },
};
