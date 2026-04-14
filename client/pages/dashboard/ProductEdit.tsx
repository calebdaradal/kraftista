import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useParams, useNavigate, Link } from "react-router-dom";
import { EMPTY_TIER_VARIATIONS } from "@/data/products";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { ProductImageUpload } from "@/components/ProductImageUpload";
import { ProductVariationsForm } from "@/components/ProductVariationsForm";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";

function mergeProductWithTiers(p: Product | null): Product {
  const tiers = EMPTY_TIER_VARIATIONS;
  if (!p) {
    return {
      id: "",
      name: "",
      shortDescription: "",
      fullDescription: "",
      price: 0,
      originalPrice: undefined,
      image: "🎨",
      category: "Ceramics",
      tags: [],
      rating: 4.5,
      reviewCount: 0,
      inStock: true,
      stockCount: 0,
      sku: "",
      dimensions: undefined,
      weight: "",
      material: [],
      care: [],
      active: true,
      ...EMPTY_TIER_VARIATIONS,
    };
  }
  return {
    ...p,
    active: p.active !== false,
    primaryVariation: p.primaryVariation ?? tiers.primaryVariation,
    secondaryVariation: p.secondaryVariation ?? tiers.secondaryVariation,
    tertiaryVariation: p.tertiaryVariation ?? tiers.tertiaryVariation,
  };
}

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Product>(() =>
    mergeProductWithTiers(null)
  );

  const [newTag, setNewTag] = useState("");
  const [newCare, setNewCare] = useState("");
  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    if (isNew || !id) return;
    api.products
      .getById(id)
      .then((p) => {
        setProduct(p);
        setFormData(mergeProductWithTiers(p));
        setImages(p.gallery || []);
      })
      .catch(() => navigate("/dashboard/products"));
  }, [id, isNew, navigate]);

  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [saleType, setSaleType] = useState<"price" | "percentage">("price");
  const [saleValue, setSaleValue] = useState<number | "">(formData.originalPrice || "");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "number"
          ? parseFloat(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    });
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((_, i) => i !== index),
    });
  };

  const handleAddCare = () => {
    if (newCare.trim()) {
      setFormData({
        ...formData,
        care: [...(formData.care || []), newCare],
      });
      setNewCare("");
    }
  };

  const handleRemoveCare = (index: number) => {
    setFormData({
      ...formData,
      care: (formData.care || []).filter((_, i) => i !== index),
    });
  };

  const handleImagesChange = (newImages: string[], newThumbnailIndex: number) => {
    setImages(newImages);
    setThumbnailIndex(newThumbnailIndex);
    // Update gallery in formData
    setFormData({
      ...formData,
      gallery: newImages,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      alert("Please login again.");
      return;
    }
    try {
      if (isNew) {
        await api.products.create(formData, token);
      } else if (id) {
        await api.products.update(id, formData, token);
      }
      navigate("/dashboard/products");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="mt-0.5 shrink-0 rounded-lg p-2 transition-colors hover:bg-muted sm:mt-0"
              aria-label="Back to products"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {isNew ? "Create Product" : "Edit Product"}
              </h1>
              <p className="truncate text-sm text-muted-foreground sm:text-base">
                {isNew
                  ? "Add a new product to your store"
                  : `Editing: ${product?.name ?? ""}`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:justify-end">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="product-active" className="text-sm font-semibold text-foreground">
                Storefront
              </Label>
              <p className="text-xs text-muted-foreground">
                {formData.active ? "Visible in shop" : "Hidden from customers"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${formData.active ? "text-green-600" : "text-muted-foreground"}`}
              >
                {formData.active ? "Active" : "Off"}
              </span>
              <Switch
                id="product-active"
                checked={formData.active}
                onCheckedChange={(active) =>
                  setFormData((prev) => ({ ...prev, active }))
                }
                aria-label={formData.active ? "Product active in storefront" : "Product disabled"}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Short Description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Full Description
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Product Images */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Product Images
            </h2>
            <ProductImageUpload
              images={images}
              thumbnailIndex={thumbnailIndex}
              onChange={handleImagesChange}
            />
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Pricing & Stock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column: Price and Category */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Ceramics</option>
                    <option>Woodcraft</option>
                    <option>Textiles</option>
                    <option>Leather</option>
                    <option>Jewelry</option>
                    <option>Personal Care</option>
                    <option>Gardening</option>
                    <option>Kitchen</option>
                  </select>
                </div>
              </div>

              {/* Middle column: Stock Count and In Stock */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Stock Count
                  </label>
                  <input
                    type="number"
                    name="stockCount"
                    value={formData.stockCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <span
                    className="block text-sm font-semibold text-foreground mb-2 invisible select-none"
                    aria-hidden
                  >
                    Category
                  </span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-border bg-input"
                    />
                    <span className="font-semibold text-foreground">In Stock</span>
                  </label>
                </div>
              </div>

              {/* Right column: Sale */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Sale
                </label>
                <div className="space-y-3 flex-1 flex flex-col">
                  {/* Toggle buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSaleType("price")}
                      className={`min-h-[2.75rem] min-w-0 flex-1 px-2 py-2 text-sm font-semibold transition-colors sm:px-3 sm:text-base rounded-lg ${
                        saleType === "price"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      Sale price
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaleType("percentage")}
                      className={`min-h-[2.75rem] min-w-0 flex-1 px-2 py-2 text-sm font-semibold transition-colors sm:px-3 sm:text-base rounded-lg ${
                        saleType === "percentage"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      Sale %
                    </button>
                  </div>
                  {/* Input field */}
                  <input
                    type="number"
                    value={saleValue}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : parseFloat(e.target.value);
                      setSaleValue(value);
                      setFormData({
                        ...formData,
                        originalPrice: value === "" ? undefined : value,
                      });
                    }}
                    step={saleType === "percentage" ? "1" : "0.01"}
                    min="0"
                    max={saleType === "percentage" ? "100" : undefined}
                    placeholder={saleType === "percentage" ? "Enter percentage (0-100)" : "Enter sale price"}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  {/* Price preview - Fixed height container */}
                  <div className="mt-auto min-h-24 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    {saleValue !== "" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Regular price:</span>
                          <span className="font-semibold text-foreground">${formData.price.toFixed(2)}</span>
                        </div>
                        {saleType === "percentage" && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Discount:</span>
                            <span className="font-semibold text-primary">{saleValue}% off</span>
                          </div>
                        )}
                        {saleType === "price" &&
                          typeof saleValue === "number" &&
                          !Number.isNaN(saleValue) && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Discount:</span>
                              <span className="font-semibold text-primary">
                                {formData.price > 0
                                  ? (() => {
                                      const pct =
                                        ((formData.price - saleValue) / formData.price) * 100;
                                      if (pct <= 0) return "0% off";
                                      const rounded =
                                        pct >= 99.95 ? 100 : Math.round(pct * 10) / 10;
                                      const label =
                                        rounded % 1 === 0
                                          ? String(rounded)
                                          : rounded.toFixed(1);
                                      return `${label}% off`;
                                    })()
                                  : "—"}
                              </span>
                            </div>
                          )}
                        <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                          <span className="text-sm font-semibold text-foreground">Final price:</span>
                          <span className="text-lg font-bold text-primary">
                            ${(
                              saleType === "percentage"
                                ? formData.price * (1 - saleValue / 100)
                                : saleValue
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        Enter a sale value to see preview
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variations (3 tiers) */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Variations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Three levels: <strong>Primary</strong> (designs with photos &amp; their own price),{" "}
                <strong>Secondary</strong> (usually colors), and <strong>Tertiary</strong> (text with an
                extra fee). Leave a section empty if you don&apos;t need it.
              </p>
            </div>
            <ProductVariationsForm
              basePrice={formData.price}
              primaryVariation={formData.primaryVariation!}
              secondaryVariation={formData.secondaryVariation!}
              tertiaryVariation={formData.tertiaryVariation!}
              onPrimaryChange={(primaryVariation) =>
                setFormData((prev) => ({ ...prev, primaryVariation }))
              }
              onSecondaryChange={(secondaryVariation) =>
                setFormData((prev) => ({ ...prev, secondaryVariation }))
              }
              onTertiaryChange={(tertiaryVariation) =>
                setFormData((prev) => ({ ...prev, tertiaryVariation }))
              }
            />
          </div>

          {/* Tags & Features */}
          <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Tags & Features
            </h2>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tags
              </label>
              <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Add a tag..."
                  className="min-h-[2.75rem] min-w-0 flex-1 rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 sm:min-w-[5rem]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.tags || []).map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(i)}
                      className="hover:text-primary/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Care Instructions */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Care Instructions
              </label>
              <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  type="text"
                  value={newCare}
                  onChange={(e) => setNewCare(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCare()}
                  placeholder="Add care instruction..."
                  className="min-h-[2.75rem] min-w-0 flex-1 rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddCare}
                  className="shrink-0 whitespace-nowrap rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 sm:min-w-[5rem]"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {(formData.care || []).map((care, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <span className="text-sm text-foreground">{care}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCare(i)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="submit"
              className="inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              <Save className="h-5 w-5 shrink-0" />
              {isNew ? "Create Product" : "Save Changes"}
            </button>
            <Link
              to="/dashboard/products"
              className="inline-flex min-h-[2.75rem] w-full items-center justify-center whitespace-nowrap rounded-lg border-2 border-border px-6 py-3 text-center font-semibold text-foreground transition-colors hover:bg-muted sm:w-auto"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
