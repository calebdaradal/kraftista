import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Trash2, Edit, ChevronDown, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import type { TaxonomyItem } from "@/lib/api";

export default function Products() {
  const isImageSource = (src: string) => src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  useEffect(() => {
    api.products
      .list()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoadingProducts(false));
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      setIsLoadingCategories(false);
      return;
    }
    api.products
      .listCategories(token)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsLoadingCategories(false));
  }, []);

  const categoryOptions = ["All", ...categories.map((item) => item.name)];

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      return b.stockCount - a.stockCount;
    });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const token = localStorage.getItem("craft_auth_token");
      if (!token) {
        navigate("/login");
        return;
      }
      setDeletingProductId(id);
      api.products
        .remove(id, token)
        .then(() => setProducts((prev) => prev.filter((p) => p.id !== id)))
        .catch((err) => alert(err.message || "Failed to delete product"))
        .finally(() => setDeletingProductId(null));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="mb-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Products
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage all {products.length} products in your store
            </p>
          </div>
          <Link
            to="/dashboard/products/new"
            className="inline-flex min-h-[2.75rem] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          >
            <Plus className="h-5 w-5 shrink-0" />
            Add Product
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-3 sm:p-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={isLoadingCategories}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "price" | "stock")
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Results */}
            <div className="flex items-end sm:col-span-2 md:col-span-1">
              <p className="text-sm text-muted-foreground">
                {isLoadingProducts ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading products...
                  </span>
                ) : (
                  <>
                    Showing <span className="font-semibold">{filteredProducts.length}</span> of{" "}
                    <span className="font-semibold">{products.length}</span> products
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Products: mobile cards */}
        <div className="md:hidden">
          {isLoadingProducts ? (
            <div className="rounded-xl border border-border bg-card px-4 py-12 text-center">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading products...
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-4 py-12 text-center">
              <p className="text-muted-foreground">
                No products found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      {isImageSource(product.image) ? (
                        <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl" aria-hidden>{product.image}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{product.name}</p>
                        {!product.active && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Off
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                        <span className="text-muted-foreground">{product.category}</span>
                        <span className="font-semibold text-foreground">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                            product.inStock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Stock {product.stockCount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Rating{" "}
                          <span className="font-semibold text-foreground">{product.rating}</span>
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                        <Link
                          to={`/dashboard/products/${product.id}/edit`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 py-2 text-sm font-semibold text-primary"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingProductId === product.id}
                          className="inline-flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-destructive"
                          title="Delete product"
                        >
                          {deletingProductId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Products Table — md+ */}
        <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground">
                    Category
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-foreground">
                    Price
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-foreground">
                    Stock
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-foreground">
                    Rating
                  </th>
                  <th className="text-center px-6 py-4 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProducts ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading products...
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                          {isImageSource(product.image) ? (
                            <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-3xl">{product.image}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{product.name}</p>
                            {!product.active && (
                              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                Off
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-foreground">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          ${product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          product.inStock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stockCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-foreground">
                        {product.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/dashboard/products/${product.id}/edit`}
                          className="p-2 hover:bg-muted rounded-lg transition-colors text-primary"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingProductId === product.id}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                          title="Delete product"
                        >
                          {deletingProductId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>

          {!isLoadingProducts && filteredProducts.length === 0 && (
            <div className="px-4 py-12 text-center sm:px-6">
              <p className="text-muted-foreground">
                No products found. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
