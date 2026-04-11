import { Layout } from "@/components/layout/Layout";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, getRelatedProducts } from "@/data/products";
import { Heart, ShoppingCart, Star, Check, X, Truck, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState<"details" | "care" | "reviews">(
    "details"
  );

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = product ? getRelatedProducts(id) : [];

  if (!product) {
    return (
      <Layout>
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Product Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The product you're looking for doesn't exist.
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Back to Shop
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const canAddToCart =
    !product.variations ||
    product.variations.every(
      (variation) => selectedVariations[variation.id]
    );

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addToCart({
      productId: product.id,
      quantity,
      selectedVariations,
      price: product.price,
      image: product.image,
      name: product.name,
    });

    // Show success feedback
    alert("Product added to cart!");
    setQuantity(1);
    setSelectedVariations({});
  };

  return (
    <Layout>
      {/* Product Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
            {/* Product Image */}
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                <div className="text-9xl">{product.image}</div>
                {product.originalPrice && (
                  <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
                    -{discount}%
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    SKU: {product.sku}
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground">
                {product.shortDescription}
              </p>

              {/* Price Section */}
              <div className="border-t border-b border-border py-6 space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {product.inStock ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        In Stock ({product.stockCount} available)
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-destructive" />
                      <span className="text-sm font-semibold text-destructive">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Variations */}
              {product.variations && product.variations.length > 0 && (
                <div className="space-y-4 border-t border-b border-border py-4">
                  {product.variations.map((variation) => (
                    <div key={variation.id}>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        {variation.name}
                        <span className="text-destructive ml-1">*</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {variation.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() =>
                              setSelectedVariations({
                                ...selectedVariations,
                                [variation.id]: option.label,
                              })
                            }
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                              selectedVariations[variation.id] === option.label
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-foreground hover:border-primary"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      −
                    </button>
                    <span className="px-6 py-2 font-semibold border-l border-r border-border">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stockCount, quantity + 1))
                      }
                      className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      isFavorite
                        ? "bg-destructive/10 border-destructive text-destructive"
                        : "border-border text-foreground hover:border-primary"
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={isFavorite ? "current" : "none"} />
                  </button>
                </div>

                {!canAddToCart && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">
                        Please select all options
                      </p>
                      <p className="text-xs text-yellow-700">
                        You must choose a {product.variations?.find(v => !selectedVariations[v.id])?.name.toLowerCase()} before adding to cart
                      </p>
                    </div>
                  </div>
                )}

                <button
                  disabled={!product.inStock || !canAddToCart}
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>

                <button
                  disabled
                  className="w-full py-4 border-2 border-primary text-primary rounded-lg font-semibold text-lg hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title="This feature is coming soon"
                >
                  🎁 Gift This Item (Coming Soon)
                </button>
              </div>

              {/* Shipping Info */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      Free Shipping
                    </p>
                    <p className="text-muted-foreground">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">
                      30-Day Returns
                    </p>
                    <p className="text-muted-foreground">
                      Not satisfied? Return it easily
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-border pt-12">
            <div className="flex gap-8 border-b border-border mb-8">
              {["details", "care", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`pb-4 font-semibold border-b-2 transition-colors ${
                    activeTab === tab
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {tab === "details" && "Product Details"}
                  {tab === "care" && "Care Instructions"}
                  {tab === "reviews" && "Reviews"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                {activeTab === "details" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        Description
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {product.fullDescription}
                      </p>
                    </div>

                  </div>
                )}

                {activeTab === "care" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        Care & Maintenance
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        To ensure your product lasts for years to come, please
                        follow these care instructions:
                      </p>
                    </div>

                    {product.care && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">
                          Instructions
                        </h4>
                        <ul className="space-y-2">
                          {product.care.map((instruction, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-semibold flex-shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-muted-foreground">
                                {instruction}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Customer Reviews
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {product.reviewCount} customers have rated this product
                        an average of {product.rating} out of 5 stars.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="pb-4 border-b border-border last:border-0"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-foreground">
                                Customer Review
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Verified Purchase
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className="w-4 h-4 fill-primary text-primary"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            This is a great product! Highly recommend to anyone
                            looking for quality handcrafted items.
                          </p>
                        </div>
                      ))}
                    </div>

                    <button className="mt-4 px-6 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors">
                      Load More Reviews
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-32">
                  <h4 className="font-semibold text-foreground">
                    Product Information
                  </h4>

                  {product.material && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Material
                      </p>
                      <p className="text-sm text-foreground">
                        {product.material.join(", ")}
                      </p>
                    </div>
                  )}

                  {product.dimensions && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                        Dimensions
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Width:</span>{" "}
                          {product.dimensions.width}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Height:</span>{" "}
                          {product.dimensions.height}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Depth:</span>{" "}
                          {product.dimensions.depth}
                        </p>
                      </div>
                    </div>
                  )}

                  {product.weight && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Weight
                      </p>
                      <p className="text-sm text-foreground">
                        {product.weight}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 pt-12 border-t border-border">
              <h2 className="font-display text-3xl font-bold text-foreground mb-8">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden group-hover:bg-primary/20 transition-colors">
                      <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                        {relatedProduct.image}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-primary mt-3">
                        ${relatedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
