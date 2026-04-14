import type { Product } from "@/types/product";

const defaultApiBase =
  typeof window !== "undefined" ? `${window.location.origin}/api` : "http://127.0.0.1:8000/api";
const API_BASE = (import.meta.env.VITE_API_URL || defaultApiBase).replace(/\/$/, "");

type UserRole = "customer" | "admin" | "editor";

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip_code?: string | null;
  address_country?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface FrontendUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const request = async <T>(path: string, init: RequestInit = {}, token?: string): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
};

const normalizeProduct = (raw: any): Product => ({
  id: raw.id,
  name: raw.name,
  shortDescription: raw.short_description ?? "",
  fullDescription: raw.full_description ?? "",
  price: Number(raw.price),
  originalPrice: raw.original_price != null ? Number(raw.original_price) : undefined,
  image: raw.image_url || raw.gallery_urls?.[0] || "🛍️",
  gallery: raw.gallery_urls ?? [],
  category: raw.category ?? "Uncategorized",
  tags: raw.tags ?? [],
  rating: Number(raw.rating ?? 0),
  reviewCount: Number(raw.review_count ?? 0),
  inStock: Boolean(raw.in_stock),
  stockCount: Number(raw.stock_count ?? 0),
  sku: raw.sku,
  dimensions: raw.dimensions,
  weight: raw.weight != null ? String(raw.weight) : undefined,
  material: raw.materials ?? [],
  care: raw.care_instructions ?? [],
  active: Boolean(raw.active),
  primaryVariation: undefined,
  secondaryVariation: undefined,
  tertiaryVariation: undefined,
});

const getImageSourceForPayload = (payload: Product): string | null => {
  const source = payload.image || payload.gallery?.[0] || null;
  if (!source) return null;
  // DB column image_url is short text for URL-like value; keep long data URLs in gallery JSON instead.
  if (source.length > 500) return null;
  return source;
};

const toFrontendUser = (raw: ApiUser): FrontendUser => ({
  id: raw.id,
  email: raw.email,
  name: raw.full_name,
  role: raw.role,
  phone: raw.phone ?? undefined,
  address:
    raw.address_street || raw.address_city || raw.address_state || raw.address_zip_code || raw.address_country
      ? {
          street: raw.address_street ?? "",
          city: raw.address_city ?? "",
          state: raw.address_state ?? "",
          zipCode: raw.address_zip_code ?? "",
          country: raw.address_country ?? "",
        }
      : undefined,
});

const toApiUserUpdate = (payload: Partial<FrontendUser>) => ({
  full_name: payload.name,
  phone: payload.phone,
  address: payload.address
    ? {
        street: payload.address.street,
        city: payload.address.city,
        state: payload.address.state,
        zip_code: payload.address.zipCode,
        country: payload.address.country,
      }
    : undefined,
});

export const api = {
  products: {
    async list(params?: { category?: string; active?: boolean; q?: string }) {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category);
      if (params?.active !== undefined) query.set("active", String(params.active));
      if (params?.q) query.set("q", params.q);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      const data = await request<any[]>(`/products${suffix}`);
      return data.map(normalizeProduct);
    },
    async getById(id: string) {
      return normalizeProduct(await request<any>(`/products/${id}`));
    },
    async create(payload: Product, token: string) {
      const imageSource = getImageSourceForPayload(payload);
      return normalizeProduct(
        await request<any>(
          "/products",
          {
            method: "POST",
            body: JSON.stringify({
              name: payload.name,
              sku: payload.sku,
              short_description: payload.shortDescription,
              full_description: payload.fullDescription,
              category: payload.category,
              active: payload.active,
              price: payload.price,
              original_price: payload.originalPrice,
              in_stock: payload.inStock,
              stock_count: payload.stockCount,
              image_url: imageSource,
              gallery_urls: payload.gallery ?? [],
              tags: payload.tags ?? [],
              rating: payload.rating ?? 0,
              review_count: payload.reviewCount ?? 0,
              dimensions: payload.dimensions,
              weight: payload.weight ? Number(payload.weight) : null,
              materials: payload.material ?? [],
              care_instructions: payload.care ?? [],
            }),
          },
          token
        )
      );
    },
    async update(id: string, payload: Product, token: string) {
      const imageSource = getImageSourceForPayload(payload);
      return normalizeProduct(
        await request<any>(
          `/products/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name: payload.name,
              sku: payload.sku,
              short_description: payload.shortDescription,
              full_description: payload.fullDescription,
              category: payload.category,
              active: payload.active,
              price: payload.price,
              original_price: payload.originalPrice,
              in_stock: payload.inStock,
              stock_count: payload.stockCount,
              image_url: imageSource,
              gallery_urls: payload.gallery ?? [],
              tags: payload.tags ?? [],
              dimensions: payload.dimensions,
              weight: payload.weight ? Number(payload.weight) : null,
              materials: payload.material ?? [],
              care_instructions: payload.care ?? [],
            }),
          },
          token
        )
      );
    },
    async remove(id: string, token: string) {
      await request<void>(`/products/${id}`, { method: "DELETE" }, token);
    },
  },
  auth: {
    async login(email: string, password: string) {
      const data = await request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return { token: data.access_token, user: toFrontendUser(data.user) };
    },
    async register(name: string, email: string, password: string, role: UserRole = "customer") {
      const data = await request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ full_name: name, email, password, role }),
      });
      return { token: data.access_token, user: toFrontendUser(data.user) };
    },
    async me(token: string) {
      return toFrontendUser(await request<ApiUser>("/auth/me", {}, token));
    },
  },
  users: {
    async updateProfile(userId: string, payload: Partial<FrontendUser>, token: string) {
      const data = await request<ApiUser>(
        `/users/${userId}`,
        { method: "PATCH", body: JSON.stringify(toApiUserUpdate(payload)) },
        token
      );
      return toFrontendUser(data);
    },
  },
  customer: {
    async getCart(token: string) {
      return request<any>("/customer/cart", {}, token);
    },
    async upsertCartItem(payload: any, token: string) {
      return request<any>("/customer/cart/items", { method: "POST", body: JSON.stringify(payload) }, token);
    },
    async removeCartItem(itemId: string, token: string) {
      return request<any>(`/customer/cart/items/${itemId}`, { method: "DELETE" }, token);
    },
    async checkout(payload: any, token: string) {
      return request<any>("/customer/checkout", { method: "POST", body: JSON.stringify(payload) }, token);
    },
    async listOrders(token: string) {
      return request<any[]>("/customer/orders", {}, token);
    },
  },
};
