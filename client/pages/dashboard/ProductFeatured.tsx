import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ProductFeatured() {
  const [products, setProducts] = useState<Product[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const token = localStorage.getItem("craft_auth_token") || "";

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      setProducts(await api.products.list());
    } catch {
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const featuredCount = useMemo(() => products.filter((product) => product.featured).length, [products]);

  const toggleFeatured = async (product: Product) => {
    if (!token) return;
    setSavingId(product.id);
    try {
      const updated = await api.products.update(product.id, { ...product, featured: !product.featured }, token);
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Featured Products</h1>
          <p className="text-muted-foreground">
            Set storefront featured products. Currently featured: <span className="font-semibold">{featuredCount}</span>
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Featured</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingProducts && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading products...
                    </span>
                  </td>
                </tr>
              )}
              {!isLoadingProducts && products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={savingId === product.id}
                        onClick={() => toggleFeatured(product)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                          product.featured ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        {savingId === product.id ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          product.featured ? "Featured" : "Not featured"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoadingProducts && products.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
