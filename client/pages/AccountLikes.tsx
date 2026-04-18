import { Layout } from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";

export default function AccountLikes() {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("craft_customer_token");
    if (!user || !token) return;

    setIsLoading(true);
    Promise.all([api.customer.listLikes(token), api.products.list()])
      .then(([likes, allProducts]) => {
        const ids = likes.map((like) => like.product_id);
        setProducts(allProducts.filter((product) => ids.includes(product.id)));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load liked products."))
      .finally(() => setIsLoading(false));
  }, [user]);

  const empty = useMemo(() => !isLoading && products.length === 0, [isLoading, products.length]);

  if (!user) return <Navigate to="/" replace />;

  const handleUnlike = async (productId: string) => {
    const token = localStorage.getItem("craft_customer_token");
    if (!token) return;
    try {
      await api.customer.removeLike(productId, token);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove product from likes.");
    }
  };

  return (
    <Layout>
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Likes</h1>
            <p className="text-sm text-muted-foreground md:text-base">Products you saved for later.</p>
          </div>

          {error ? <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}
          {isLoading ? <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading likes...</div> : null}
          {empty ? <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">No liked products yet.</div> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
                  {product.image.startsWith("http://") || product.image.startsWith("https://") || product.image.startsWith("data:") ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl">{product.image}</div>
                  )}
                </div>
                <h2 className="line-clamp-1 font-semibold text-foreground">{product.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{product.category}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">${product.price.toFixed(2)}</p>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/product/${product.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleUnlike(product.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
