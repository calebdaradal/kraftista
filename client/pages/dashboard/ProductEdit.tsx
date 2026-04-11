import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, products } from "@/data/products";
import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { ProductImageUpload } from "@/components/ProductImageUpload";

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";
  const product = id && id !== "new" ? getProductById(id) : null;

  const [formData, setFormData] = useState(
    product || {
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
      variations: [],
    }
  );

  const [newTag, setNewTag] = useState("");
  const [newCare, setNewCare] = useState("");
  const [images, setImages] = useState<string[]>(product?.gallery || []);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, make API call to save product
    alert(`Product ${isNew ? "created" : "updated"} successfully!`);
    navigate("/dashboard/products");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/products")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                {isNew ? "Create Product" : "Edit Product"}
              </h1>
              <p className="text-muted-foreground">
                {isNew
                  ? "Add a new product to your store"
                  : `Editing: ${product?.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-semibold text-foreground text-lg">
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
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-lg">
              Product Images
            </h2>
            <ProductImageUpload
              images={images}
              thumbnailIndex={thumbnailIndex}
              onChange={handleImagesChange}
            />
          </div>

          {/* Pricing & Stock */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-semibold text-foreground text-lg">
              Pricing & Stock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Sale
                </label>
                <div className="space-y-3">
                  {/* Toggle buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSaleType("price")}
                      className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-colors ${
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
                      className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-colors ${
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
                </div>
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="flex items-end">
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
          </div>

          {/* Tags & Features */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <h2 className="font-semibold text-foreground text-lg">
              Tags & Features
            </h2>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
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
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCare}
                  onChange={(e) => setNewCare(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCare()}
                  placeholder="Add care instruction..."
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddCare}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
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
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Save className="w-5 h-5" />
              {isNew ? "Create Product" : "Save Changes"}
            </button>
            <Link
              to="/dashboard/products"
              className="px-6 py-3 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
