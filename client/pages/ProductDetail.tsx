import { Layout } from "@/components/layout/Layout";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getProductGallerySlides,
  computeVariantLinePrice,
  resolveLineImageForCart,
  isVariationSelectionComplete,
  firstMissingVariationName,
} from "@/data/products";
import {
  Heart,
  ShoppingCart,
  Star,
  Check,
  X,
  Truck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { api, type PublicReview } from "@/lib/api";
import type { Product } from "@/types/product";
import { toast } from "sonner";

function ProductSlideContent({ src, variant }: { src: string; variant: "main" | "thumb" }) {
  const t = src.trim();
  if (t.startsWith("data:") || t.startsWith("http://") || t.startsWith("https://")) {
    return (
      <img
        src={t}
        alt=""
        loading={variant === "thumb" ? "lazy" : "eager"}
        decoding="async"
        className={
          variant === "main"
            ? "max-h-[85%] max-w-[85%] rounded-lg object-contain shadow-md"
            : "h-full w-full object-cover"
        }
      />
    );
  }
  if (variant === "main") {
    return (
      <div
        className="flex max-h-[85%] max-w-[85%] select-none items-center justify-center text-8xl md:text-9xl leading-none"
        aria-hidden
      >
        {t}
      </div>
    );
  }
  return (
    <div
      className="flex h-full w-full select-none items-center justify-center text-2xl leading-none"
      aria-hidden
    >
      {t}
    </div>
  );
}

const isImageSource = (src: string) => src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://");

/** Clicking the active option again clears that tier (back to default pricing / hero preview). */
function toggleTierSelection(
  prev: Record<string, string>,
  collectionName: string,
  optionLabel: string
): Record<string, string> {
  if (prev[collectionName] === optionLabel) {
    const next = { ...prev };
    delete next[collectionName];
    return next;
  }
  return { ...prev, [collectionName]: optionLabel };
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useUser();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState<"details" | "care" | "reviews">(
    "details"
  );
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsHasMore, setReviewsHasMore] = useState(true);
  const REVIEWS_LIMIT = 5;

  const slides = useMemo(
    () => (product ? getProductGallerySlides(product) : []),
    [product]
  );
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setGalleryIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const pv = product.primaryVariation;
    if (!pv?.options?.length) return;
    const label = selectedVariations[pv.collectionName];
    if (!label) return;
    const opt = pv.options.find((o) => o.label === label);
    const img = opt?.image?.trim();
    if (!img) return;
    const idx = slides.indexOf(img);
    if (idx >= 0) setGalleryIndex(idx);
  }, [selectedVariations, product, slides]);

  useEffect(() => {
    const el = thumbRefs.current[galleryIndex];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [galleryIndex]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setIsNotFound(false);
    setProduct(null);
    api.products
      .getById(id)
      .then((fetched) => {
        setProduct(fetched);
        return api.products.list({ active: true, category: fetched.category });
      })
      .then((list) => {
        setRelatedProducts(list.filter((item) => item.id !== id).slice(0, 4));
        setIsLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setIsNotFound(true);
        setRelatedProducts([]);
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviews([]);
    setReviewsPage(1);
    setReviewsHasMore(true);
    setReviewsLoading(true);
    api.products
      .listReviews(id, 1, REVIEWS_LIMIT)
      .then((fetched) => {
        setReviews(fetched);
        setReviewsHasMore(fetched.length === REVIEWS_LIMIT);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const loadMoreReviews = async () => {
    if (!id || reviewsLoading || !reviewsHasMore) return;
    const nextPage = reviewsPage + 1;
    setReviewsLoading(true);
    try {
      const fetched = await api.products.listReviews(id, nextPage, REVIEWS_LIMIT);
      setReviews((prev) => [...prev, ...fetched]);
      setReviewsPage(nextPage);
      setReviewsHasMore(fetched.length === REVIEWS_LIMIT);
    } catch {
      // ignore
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("craft_customer_token");
    if (!id || !user || !token) {
      setIsFavorite(false);
      return;
    }
    api.customer
      .listLikes(token)
      .then((likes) => setIsFavorite(likes.some((like) => like.product_id === id)))
      .catch(() => setIsFavorite(false));
  }, [id, user]);
  const handleToggleLike = async () => {
    const token = localStorage.getItem("craft_customer_token");
    if (!id || !user || !token) {
      navigate("/");
      return;
    }

    try {
      if (isFavorite) {
        await api.customer.removeLike(id, token);
        setIsFavorite(false);
      } else {
        await api.customer.addLike(id, token);
        setIsFavorite(true);
      }
    } catch {
      // Intentionally keep a silent fail here to avoid interrupting checkout flow UX.
    }
  };


  if (isLoading) {
    return (
      <Layout>
        <section className="py-20 text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Loading Product...
            </h1>
            <p className="text-muted-foreground mb-8">
              Fetching latest product details.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  if (isNotFound || !product) {
    return (
      <Layout>
        <section className="py-20 text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!product.active) {
    return (
      <Layout>
        <section className="py-20 text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Product unavailable
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              This product is not listed in the shop right now. Check back later or browse our
              collection.
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

  const hasVariationTiers =
    (product.primaryVariation?.options?.length ?? 0) > 0 ||
    (product.secondaryVariation?.options?.length ?? 0) > 0 ||
    (product.tertiaryVariation?.options?.length ?? 0) > 0;

  const canAddToCart =
    !hasVariationTiers || isVariationSelectionComplete(product, selectedVariations);

  const linePrice = computeVariantLinePrice(product, selectedVariations);
  const missingVariationName = firstMissingVariationName(product, selectedVariations);

  const activeSlideSrc = slides[galleryIndex] ?? product.image;
  const goPrevImage = () => {
    if (slides.length <= 1) return;
    setGalleryIndex((i) => (i - 1 + slides.length) % slides.length);
  };
  const goNextImage = () => {
    if (slides.length <= 1) return;
    setGalleryIndex((i) => (i + 1) % slides.length);
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addToCart({
      productId: product.id,
      quantity,
      selectedVariations,
      price: linePrice,
      image: resolveLineImageForCart(product, selectedVariations),
      name: product.name,
    });

    toast.success("Added to cart!", { description: product.name });
    setQuantity(1);
    setSelectedVariations({});
  };

  return (
    <Layout>
      {/* Product Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start md:grid-cols-2 gap-8 md:gap-12 mb-12">
            {/* Product gallery — main image + thumbnail strip with arrows */}
            <div className="flex w-full max-w-xl flex-col gap-3 md:sticky md:top-24 md:z-10 md:self-start">
              <div className="relative flex aspect-square w-full items-center justify-center rounded-2xl bg-transparent">
                <ProductSlideContent src={activeSlideSrc} variant="main" />
                {product.originalPrice && (
                  <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
                    -{discount}%
                  </div>
                )}
              </div>

              {slides.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrevImage}
                    aria-label="Previous image"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-2 overflow-x-auto scroll-smooth py-0.5 [scrollbar-width:thin]">
                      {slides.map((src, i) => (
                        <button
                          key={`${product.id}-slide-${i}`}
                          type="button"
                          ref={(el) => {
                            thumbRefs.current[i] = el;
                          }}
                          onClick={() => setGalleryIndex(i)}
                          className={cn(
                            "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted/40 transition-colors",
                            i === galleryIndex
                              ? "border-primary ring-2 ring-primary/25"
                              : "border-border hover:border-primary/50"
                          )}
                          aria-label={`View image ${i + 1} of ${slides.length}`}
                          aria-current={i === galleryIndex ? "true" : undefined}
                        >
                          <ProductSlideContent src={src} variant="thumb" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={goNextImage}
                    aria-label="Next image"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
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
                    ${linePrice.toFixed(2)}
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

              {/* Variations — primary / secondary / tertiary */}
              {hasVariationTiers && (
                <div className="space-y-6 border-t border-b border-border py-4">
                  {product.primaryVariation &&
                    product.primaryVariation.options.length > 0 && (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-foreground">
                          {product.primaryVariation.collectionName}
                          <span className="ml-1 text-destructive">*</span>
                        </label>
                        <p className="mb-3 text-xs text-muted-foreground">
                          Each option has its own price; your selection updates the price above.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.primaryVariation.options.map((option) => {
                            const name = product.primaryVariation!.collectionName;
                            const selected = selectedVariations[name] === option.label;
                            const raw = option.image?.trim();
                            // Accept both data-URLs and signed https:// URLs from Supabase
                            const hasUploadedImage = Boolean(raw && isImageSource(raw));
                            const hasVisual = Boolean(raw);

                            return hasVisual ? (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariations((prev) =>
                                    toggleTierSelection(prev, name, option.label)
                                  )
                                }
                                className={`flex flex-col items-center gap-1 transition-colors ${
                                  selected ? "opacity-100" : "opacity-75 hover:opacity-100"
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-lg border-2 overflow-hidden flex items-center justify-center bg-muted/40 transition-colors ${
                                  selected
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-border hover:border-primary/50"
                                }`}>
                                  {hasUploadedImage ? (
                                    <img
                                      src={option.image}
                                      alt={option.label}
                                      loading="lazy"
                                      decoding="async"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-2xl leading-none" aria-hidden>
                                      {raw}
                                    </span>
                                  )}
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-semibold text-foreground">{option.label}</p>
                                  <p className="text-xs font-medium text-primary">${option.price.toFixed(2)}</p>
                                </div>
                              </button>
                            ) : (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariations((prev) =>
                                    toggleTierSelection(prev, name, option.label)
                                  )
                                }
                                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border text-foreground hover:border-primary/50"
                                }`}
                              >
                                {option.label}
                                <span className="ml-1.5 text-xs opacity-90">
                                  (${option.price.toFixed(2)})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {product.secondaryVariation &&
                    product.secondaryVariation.options.length > 0 && (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-foreground">
                          {product.secondaryVariation.collectionName}
                          <span className="ml-1 text-destructive">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {product.secondaryVariation.options.map((option) => {
                            const name = product.secondaryVariation!.collectionName;
                            const selected = selectedVariations[name] === option.label;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariations((prev) =>
                                    toggleTierSelection(prev, name, option.label)
                                  )
                                }
                                className={`flex items-center gap-2 rounded-full border-2 py-2 pl-2 pr-4 text-sm font-medium transition-colors ${
                                  selected
                                    ? "border-primary bg-primary/10 ring-2 ring-primary/25"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <span
                                  className="h-8 w-8 shrink-0 rounded-full border border-border shadow-inner"
                                  style={{ backgroundColor: option.hex }}
                                />
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {product.tertiaryVariation &&
                    product.tertiaryVariation.options.length > 0 && (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-foreground">
                          {product.tertiaryVariation.collectionName}
                          <span className="ml-1 text-destructive">*</span>
                        </label>
                        <p className="mb-3 text-xs text-muted-foreground">
                          Extra amounts are added on top of the design price.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.tertiaryVariation.options.map((option) => {
                            const name = product.tertiaryVariation!.collectionName;
                            const selected = selectedVariations[name] === option.label;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariations((prev) =>
                                    toggleTierSelection(prev, name, option.label)
                                  )
                                }
                                className={`rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                                  selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border text-foreground hover:border-primary"
                                }`}
                              >
                                {option.label}
                                {option.additionalPrice > 0 && (
                                  <span className="ml-1.5 text-xs opacity-90">
                                    (+${option.additionalPrice.toFixed(2)})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                    onClick={handleToggleLike}
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
                        {missingVariationName
                          ? `Select “${missingVariationName}” and any other required options.`
                          : "Choose all required options before adding to cart."}
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
                        {product.reviewCount > 0
                          ? `${product.reviewCount} customer${product.reviewCount > 1 ? "s" : ""} rated this product an average of ${Number(product.rating).toFixed(1)} out of 5 stars.`
                          : "No reviews yet. Be the first to review this product!"}
                      </p>
                    </div>

                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="pb-4 border-b border-border last:border-0"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-foreground">
                                  Verified Purchase
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-4 h-4 ${s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment ? (
                              <p className="text-muted-foreground text-sm">{review.comment}</p>
                            ) : (
                              <p className="text-muted-foreground/60 text-sm italic">No comment provided.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : !reviewsLoading ? (
                      <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                        No approved reviews yet for this product.
                      </div>
                    ) : null}

                    {reviewsLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading reviews…
                      </div>
                    )}

                    {reviewsHasMore && !reviewsLoading && reviews.length > 0 && (
                      <button
                        onClick={loadMoreReviews}
                        className="mt-2 px-6 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                      >
                        Load More Reviews
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-32">
                  <h4 className="font-semibold text-foreground">
                    Product Info
                  </h4>

                  {product.material && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Materials
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
                          {product.dimensions.widthCm ?? "—"} cm
                        </p>
                        <p>
                          <span className="text-muted-foreground">Height:</span>{" "}
                          {product.dimensions.heightCm ?? "—"} cm
                        </p>
                        <p>
                          <span className="text-muted-foreground">Length:</span>{" "}
                          {product.dimensions.lengthCm ?? "—"} cm
                        </p>
                      </div>
                    </div>
                  )}

                  {product.weightKg != null && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Weight
                      </p>
                      <p className="text-sm text-foreground">
                        {product.weightKg} kg
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
                    <div className="relative h-64 bg-transparent flex items-center justify-center overflow-hidden">
                      {isImageSource(relatedProduct.image) ? (
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                          {relatedProduct.image}
                        </div>
                      )}
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
