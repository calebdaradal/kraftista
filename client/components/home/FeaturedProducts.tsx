import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { getProductsByIds } from "@/data/products";
import { useSettings } from "@/context/SettingsContext";

export function FeaturedProducts() {
  const { settings } = useSettings();
  const featuredProducts = getProductsByIds(settings.featuredProductIds);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked items showcasing the finest in artisan craftsmanship
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg flex flex-col h-full"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden group-hover:bg-primary/20 transition-colors">
                <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                  {product.image}
                </div>

                {product.originalPrice && (
                  <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold">
                    Sale
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="bg-white text-foreground p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
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
                <div className="mt-4 mb-3 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Quick View Button */}
                <button
                  onClick={(e) => e.preventDefault()}
                  className="w-full mt-auto py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  View Product
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-block px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
