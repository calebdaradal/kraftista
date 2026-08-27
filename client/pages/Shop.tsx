import { Layout } from "@/components/layout/Layout";
import { ShoppingCart, Heart, Star, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";

export default function Shop() {
  const isImageSource = (src: string) => src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCollection, setSelectedCollection] = useState("All");
  const [storefrontProducts, setStorefrontProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    api.products
      .list({ active: true })
      .then(setStorefrontProducts)
      .catch(() => setStorefrontProducts([]))
      .finally(() => setIsLoadingProducts(false));
  }, []);

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(storefrontProducts.map((product) => product.category).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...dynamic];
  }, [storefrontProducts]);

  const collections = useMemo(() => {
    const dynamic = Array.from(
      new Set(storefrontProducts.map((product) => product.collection).filter((c): c is string => Boolean(c)))
    ).sort((a, b) => a.localeCompare(b));
    return ["All", ...dynamic];
  }, [storefrontProducts]);

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (!collections.includes(selectedCollection)) {
      setSelectedCollection("All");
    }
  }, [collections, selectedCollection]);

  const filteredProducts = storefrontProducts.filter(
    (p) =>
      (selectedCategory === "All" || p.category === selectedCategory) &&
      (selectedCollection === "All" || p.collection === selectedCollection)
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-secondary/20 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Shop
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover our complete collection of handcrafted products
          </p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Collection Filter */}
          {collections.length > 1 && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold text-foreground">Collection</p>
              <div className="overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {collections.map((collection) => (
                    <button
                      key={collection}
                      onClick={() => setSelectedCollection(collection)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                        selectedCollection === collection
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {collection}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-12">
            <p className="mb-2 text-sm font-semibold text-foreground">Category</p>
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoadingProducts ? (
            <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading products...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg flex flex-col h-full"
              >
                {/* Product Image */}
                <div className="relative h-64 bg-transparent flex items-center justify-center overflow-hidden">
                  {isImageSource(product.image) ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                      {product.image}
                    </div>
                  )}

                  {product.originalPrice && (
                    <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
                      Sale
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="bg-white text-foreground p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors mt-2">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? "fill-primary text-primary"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({product.reviewCount})
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                    {product.shortDescription}
                  </p>

                  {/* Price */}
                  <div className="mt-4 mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="w-full mt-auto py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    View Product
                  </button>
                </div>
              </Link>
            ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
