import { Layout } from "@/components/layout/Layout";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getStorefrontProducts } from "@/data/products";

const categories = [
  "All",
  "Ceramics",
  "Woodcraft",
  "Textiles",
  "Leather",
  "Jewelry",
  "Personal Care",
  "Gardening",
  "Kitchen",
];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const storefrontProducts = getStorefrontProducts();

  const filteredProducts =
    selectedCategory === "All"
      ? storefrontProducts
      : storefrontProducts.filter((p) => p.category === selectedCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-secondary/20 to-primary/10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Shop
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover our complete collection of handcrafted products
          </p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="mb-12 overflow-x-auto">
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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

                  {/* Variations */}
                  <div className="mt-3 space-y-2">
                    {/* Primary Variation - Square Images with Labels */}
                    {product.primaryVariation && product.primaryVariation.options.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">
                          {product.primaryVariation.collectionName}
                        </p>
                        <div className="flex gap-1">
                          {product.primaryVariation.options.slice(0, 2).map((option) => (
                            <div
                              key={option.id}
                              className="flex-1"
                              title={option.label}
                            >
                              <div className="aspect-square rounded-md border border-border overflow-hidden bg-muted/40 flex items-center justify-center hover:border-primary/50 transition-colors">
                                {option.image && option.image.startsWith("data:") ? (
                                  <img
                                    src={option.image}
                                    alt={option.label}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg text-muted-foreground">—</span>
                                )}
                              </div>
                              <p className="text-xs text-foreground mt-1 truncate text-center font-medium">
                                {option.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Secondary Variation - Color Swatches with Labels */}
                    {product.secondaryVariation && product.secondaryVariation.options.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">
                          {product.secondaryVariation.collectionName}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {product.secondaryVariation.options.slice(0, 3).map((option) => (
                            <div key={option.id} className="flex flex-col items-center">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-border hover:border-primary transition-colors shadow-sm"
                                style={{ backgroundColor: option.hex }}
                                title={option.label}
                              />
                              <p className="text-xs text-foreground mt-1 text-center font-medium max-w-12 truncate">
                                {option.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tertiary Variation - Text Labels */}
                    {product.tertiaryVariation && product.tertiaryVariation.options.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">
                          {product.tertiaryVariation.collectionName}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {product.tertiaryVariation.options.slice(0, 2).map((option) => (
                            <span
                              key={option.id}
                              className="px-2 py-1 bg-muted text-foreground text-xs rounded font-medium border border-border hover:border-primary/50 transition-colors"
                            >
                              {option.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
        </div>
      </section>
    </Layout>
  );
}
