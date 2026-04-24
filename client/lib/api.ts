import type { Product } from "@/types/product";
import type { AboutCustomization, FooterCustomization, HeroCustomization } from "@shared/customization";

const defaultApiBase =
  typeof window === "undefined"
    ? "http://127.0.0.1:8000/api"
    : import.meta.env.DEV
      ? "http://127.0.0.1:8000/api"
      : `${window.location.origin}/api`;
const API_BASE = (import.meta.env.VITE_API_URL || defaultApiBase).replace(/\/$/, "");
const buildApiCandidates = (path: string): string[] => {
  const candidates: string[] = [];
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pushUnique = (value: string) => {
    if (!candidates.includes(value)) candidates.push(value);
  };

  pushUnique(`${API_BASE}${normalizedPath}`);

  if (/\/api$/i.test(API_BASE)) {
    // If base already ends with /api, also try stripped base for deployments
    // where a reverse proxy already injects/removes the /api prefix.
    pushUnique(`${API_BASE.replace(/\/api$/i, "")}${normalizedPath}`);
  } else {
    // If base does not end with /api, also try the /api-prefixed variant.
    pushUnique(`${API_BASE}/api${normalizedPath}`);
  }

  return candidates;
};

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

export interface TaxonomyItem {
  id: string;
  name: string;
  slug: string;
  product_count: number;
}

export interface CustomerOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  selected_variations: Record<string, string>;
  unit_price: number;
  line_total: number;
  product_name: string;
  image_url?: string | null;
}

export interface CustomerOrder {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment_method: string;
  order_note?: string | null;
  shipping_address: Record<string, string>;
  tracking_reference?: string | null;
  delivered_at?: string | null;
  created_at: string;
  items: CustomerOrderItem[];
}

export interface ProductLike {
  id: string;
  product_id: string;
  created_at: string;
}

export interface PendingReviewItem {
  order_id: string;
  order_item_id: string;
  product_id: string;
  product_name: string;
  image_url?: string | null;
  delivered_at?: string | null;
}

export interface ProductReview {
  id: string;
  order_id: string;
  order_item_id: string;
  product_id: string;
  product_name: string;
  image_url?: string | null;
  rating: number;
  comment?: string | null;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewNotification {
  pending_count: number;
}

export interface SellerOrder extends CustomerOrder {}

const request = async <T>(path: string, init: RequestInit = {}, token?: string): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
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
  featured: Boolean(raw.featured),
  rating: Number(raw.rating ?? 0),
  reviewCount: Number(raw.review_count ?? 0),
  inStock: Boolean(raw.in_stock),
  stockCount: Number(raw.stock_count ?? 0),
  sku: raw.sku,
  dimensions:
    raw.dimension_width_cm != null || raw.dimension_height_cm != null || raw.dimension_length_cm != null
      ? {
          widthCm: raw.dimension_width_cm != null ? Number(raw.dimension_width_cm) : undefined,
          heightCm: raw.dimension_height_cm != null ? Number(raw.dimension_height_cm) : undefined,
          lengthCm: raw.dimension_length_cm != null ? Number(raw.dimension_length_cm) : undefined,
        }
      : undefined,
  weightKg: raw.weight_kg != null ? Number(raw.weight_kg) : undefined,
  material: raw.materials ?? [],
  care: raw.care_instructions ?? [],
  active: Boolean(raw.active),
  primaryVariation: raw.primary_variation ?? undefined,
  secondaryVariation: raw.secondary_variation ?? undefined,
  tertiaryVariation: raw.tertiary_variation ?? undefined,
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
    async list(params?: { category?: string; active?: boolean; featured?: boolean; q?: string }) {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category);
      if (params?.active !== undefined) query.set("active", String(params.active));
      if (params?.featured !== undefined) query.set("featured", String(params.featured));
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
              category: payload.category?.trim() ? payload.category : null,
              featured: payload.featured,
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
              dimension_width_cm: payload.dimensions?.widthCm ?? null,
              dimension_height_cm: payload.dimensions?.heightCm ?? null,
              dimension_length_cm: payload.dimensions?.lengthCm ?? null,
              weight_kg: payload.weightKg ?? null,
              materials: payload.material ?? [],
              care_instructions: payload.care ?? [],
              primary_variation: payload.primaryVariation ?? null,
              secondary_variation: payload.secondaryVariation ?? null,
              tertiary_variation: payload.tertiaryVariation ?? null,
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
              category: payload.category?.trim() ? payload.category : null,
              featured: payload.featured,
              active: payload.active,
              price: payload.price,
              original_price: payload.originalPrice,
              in_stock: payload.inStock,
              stock_count: payload.stockCount,
              image_url: imageSource,
              gallery_urls: payload.gallery ?? [],
              tags: payload.tags ?? [],
              dimension_width_cm: payload.dimensions?.widthCm ?? null,
              dimension_height_cm: payload.dimensions?.heightCm ?? null,
              dimension_length_cm: payload.dimensions?.lengthCm ?? null,
              weight_kg: payload.weightKg ?? null,
              materials: payload.material ?? [],
              care_instructions: payload.care ?? [],
              primary_variation: payload.primaryVariation ?? null,
              secondary_variation: payload.secondaryVariation ?? null,
              tertiary_variation: payload.tertiaryVariation ?? null,
            }),
          },
          token
        )
      );
    },
    async remove(id: string, token: string) {
      await request<void>(`/products/${id}`, { method: "DELETE" }, token);
    },
    async listCategories(token: string) {
      return request<TaxonomyItem[]>("/products/categories", {}, token);
    },
    async createCategory(name: string, token: string) {
      return request<TaxonomyItem>("/products/categories", { method: "POST", body: JSON.stringify({ name }) }, token);
    },
    async updateCategory(id: string, name: string, token: string) {
      return request<TaxonomyItem>(`/products/categories/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }, token);
    },
    async getCategoryImpact(id: string, token: string) {
      return request<{ product_count: number }>(`/products/categories/${id}/impact`, {}, token);
    },
    async deleteCategory(id: string, token: string) {
      await request<void>(`/products/categories/${id}`, { method: "DELETE" }, token);
    },
    async listTags(token: string) {
      return request<TaxonomyItem[]>("/products/tags", {}, token);
    },
    async createTag(name: string, token: string) {
      return request<TaxonomyItem>("/products/tags", { method: "POST", body: JSON.stringify({ name }) }, token);
    },
    async updateTag(id: string, name: string, token: string) {
      return request<TaxonomyItem>(`/products/tags/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }, token);
    },
    async getTagImpact(id: string, token: string) {
      return request<{ product_count: number }>(`/products/tags/${id}/impact`, {}, token);
    },
    async deleteTag(id: string, token: string) {
      await request<void>(`/products/tags/${id}`, { method: "DELETE" }, token);
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
      return request<CustomerOrder>("/customer/checkout", { method: "POST", body: JSON.stringify(payload) }, token);
    },
    async listOrders(token: string) {
      return request<CustomerOrder[]>("/customer/orders", {}, token);
    },
    async getOrder(orderId: string, token: string) {
      return request<CustomerOrder>(`/customer/orders/${orderId}`, {}, token);
    },
    async listLikes(token: string) {
      return request<ProductLike[]>("/customer/likes", {}, token);
    },
    async addLike(productId: string, token: string) {
      return request<ProductLike>("/customer/likes", { method: "POST", body: JSON.stringify({ product_id: productId }) }, token);
    },
    async removeLike(productId: string, token: string) {
      return request<void>(`/customer/likes/${productId}`, { method: "DELETE" }, token);
    },
    async listPendingReviews(token: string) {
      return request<PendingReviewItem[]>("/customer/reviews/pending", {}, token);
    },
    async submitReview(payload: { order_item_id: string; rating: number; comment?: string }, token: string) {
      return request<ProductReview>("/customer/reviews", { method: "POST", body: JSON.stringify(payload) }, token);
    },
    async listReviews(token: string) {
      return request<ProductReview[]>("/customer/reviews", {}, token);
    },
    async getReviewNotifications(token: string) {
      return request<ReviewNotification>("/customer/notifications/reviews", {}, token);
    },
  },
  orders: {
    async list(token: string) {
      return request<SellerOrder[]>("/orders", {}, token);
    },
    async get(orderId: string, token: string) {
      return request<SellerOrder>(`/orders/${orderId}`, {}, token);
    },
    async updateTracking(orderId: string, tracking_reference: string | null, token: string) {
      return request<SellerOrder>(
        `/orders/${orderId}/tracking`,
        { method: "PATCH", body: JSON.stringify({ tracking_reference }) },
        token
      );
    },
    async updateStatus(orderId: string, status: "processing" | "shipped" | "delivered", token: string) {
      return request<SellerOrder>(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
    },
    async moderateReview(
      reviewId: string,
      payload: { moderation_status: "approved" | "rejected"; moderation_note?: string },
      token: string
    ) {
      return request<ProductReview>(`/orders/reviews/${reviewId}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
    },
    async listReviews(token: string, moderation_status?: "pending" | "approved" | "rejected") {
      const suffix = moderation_status ? `?moderation_status=${moderation_status}` : "";
      return request<ProductReview[]>(`/orders/reviews/list${suffix}`, {}, token);
    },
  },
  customization: {
    async get() {
      return request<{ about: AboutCustomization | null; footer: FooterCustomization | null; hero: HeroCustomization | null }>("/customization");
    },
    async updateAbout(payload: AboutCustomization, token: string) {
      await request<void>("/customization/about", { method: "PUT", body: JSON.stringify({ data: payload }) }, token);
    },
    async updateFooter(payload: FooterCustomization, token: string) {
      await request<void>("/customization/footer", { method: "PUT", body: JSON.stringify({ data: payload }) }, token);
    },
    async updateHero(payload: HeroCustomization, token: string) {
      await request<void>("/customization/hero", { method: "PUT", body: JSON.stringify({ data: payload }) }, token);
    },
    async uploadPreviewImage(file: File, token: string) {
      const form = new FormData();
      form.append("file", file);
      const endpoints = buildApiCandidates("/customization/about/preview-image");
      let lastErrorMessage = "Request failed";
      let lastStatus = 500;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        });
        if (response.ok) {
          return (await response.json()) as { preview_image_url: string };
        }
        lastStatus = response.status;
        lastErrorMessage = await response.text();
        if (response.status !== 404) {
          throw new Error(lastErrorMessage || `Request failed (${response.status})`);
        }
      }
      throw new Error(lastErrorMessage || `Request failed (${lastStatus})`);
    },
  },
  settings: {
    async get() {
      return request<{ data: any | null }>("/settings");
    },
    async update(payload: any, token: string) {
      await request<void>("/settings", { method: "PUT", body: JSON.stringify({ data: payload }) }, token);
    },
    async uploadFavicon(file: File, token: string) {
      const form = new FormData();
      form.append("file", file);
      const endpoints = buildApiCandidates("/settings/favicon");
      let lastErrorMessage = "Request failed";
      let lastStatus = 500;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        });
        if (response.ok) {
          return (await response.json()) as { favicon_url: string };
        }
        lastStatus = response.status;
        lastErrorMessage = await response.text();
        if (response.status !== 404) {
          throw new Error(lastErrorMessage || `Request failed (${response.status})`);
        }
      }
      throw new Error(lastErrorMessage || `Request failed (${lastStatus})`);
    },
    async uploadLogo(file: File, token: string) {
      const form = new FormData();
      form.append("file", file);
      const endpoints = buildApiCandidates("/settings/logo");
      let lastErrorMessage = "Request failed";
      let lastStatus = 500;
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form,
        });
        if (response.ok) {
          return (await response.json()) as { logo_url: string };
        }
        lastStatus = response.status;
        lastErrorMessage = await response.text();
        if (response.status !== 404) {
          throw new Error(lastErrorMessage || `Request failed (${response.status})`);
        }
      }
      throw new Error(lastErrorMessage || `Request failed (${lastStatus})`);
    },
    async undoLogo(token: string) {
      return request<{ logo_url: string }>("/settings/logo/undo", { method: "POST" }, token);
    },
    async undoFavicon(token: string) {
      return request<{ favicon_url: string }>("/settings/favicon/undo", { method: "POST" }, token);
    },
  },
};
