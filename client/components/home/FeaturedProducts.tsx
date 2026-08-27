import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api, type PublicCategory } from "@/lib/api";

export function FeaturedProducts() {
  const isImageSource = (src?: string | null) =>
    !!src && (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://"));
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.products
      .listPublicCategories()
      .then((data) => setCategories(data.filter((c) => c.product_count > 0)))
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            SHOP BY CATEGORIES
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our handcrafted collections by category
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading categories...
            </span>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-muted-foreground">
            No categories available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${encodeURIComponent(category.name)}`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg flex flex-col"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden group-hover:bg-primary/20 transition-colors">
                  {isImageSource(category.image_url) ? (
                    <img
                      src={category.image_url as string}
                      alt={category.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      🧺
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 text-center">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <span className="mt-2 inline-block text-sm font-semibold text-primary">
                    Shop Now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Shop More Button */}
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-block px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
          >
            Shop More
          </Link>
        </div>
      </div>
    </section>
  );
}
