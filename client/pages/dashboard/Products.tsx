import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { products } from "@/data/products";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Filter,
  ChevronDown,
} from "lucide-react";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");

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
      // In a real app, make API call to delete
      alert(`Product ${id} deleted (simulated)`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Products
            </h1>
            <p className="text-muted-foreground">
              Manage all {products.length} products in your store
            </p>
          </div>
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10"
                >
                  {categories.map((cat) => (
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
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold">{filteredProducts.length}</span> of{" "}
                <span className="font-semibold">{products.length}</span> products
              </p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{product.image}</span>
                        <div>
                          <p className="font-semibold text-foreground">
                            {product.name}
                          </p>
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
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="px-6 py-12 text-center">
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
