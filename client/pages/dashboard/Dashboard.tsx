import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { BarChart3, Package, Users, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";

export default function Dashboard() {
  const isImageSource = (src: string) => src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://");
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    api.products.list().then(setProducts).catch(() => setProducts([]));
  }, []);

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Sales",
      value: "$12,450",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Active Users",
      value: "342",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Growth",
      value: "+12.5%",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const recentProducts = products.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="min-w-0">
          <h1 className="mb-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Welcome to your Craft admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Products */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
                Recent Products
              </h2>
              <p className="text-sm text-muted-foreground">
                Your latest product additions
              </p>
            </div>
            <Link
              to="/dashboard/products"
              className="shrink-0 text-sm font-semibold text-primary hover:text-primary/80"
            >
              View All →
            </Link>
          </div>

          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {recentProducts.map((product) => (
              <li
                key={product.id}
                className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                  {isImageSource(product.image) ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl" aria-hidden>{product.image}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm text-foreground">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-muted-foreground">{product.category}</span>
                    <span className="font-semibold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={
                        product.inStock ? "font-medium text-green-600" : "text-destructive"
                      }
                    >
                      Stock: {product.stockCount}
                    </span>
                  </div>
                  <Link
                    to={`/dashboard/products/${product.id}/edit`}
                    className="mt-2 inline-block text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-foreground text-sm">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground text-sm">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground text-sm">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground text-sm">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                          {isImageSource(product.image) ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-2xl">{product.image}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {product.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted-foreground text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-foreground text-sm">
                        ${product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          product.inStock
                            ? "text-green-600"
                            : "text-destructive"
                        }`}
                      >
                        {product.stockCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/products/${product.id}/edit`}
                        className="text-primary hover:text-primary/80 font-semibold text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          <div className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-4 sm:p-6">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                View Analytics
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Track your sales and customer insights
              </p>
            </div>
            <Link
              to="/dashboard/analytics"
              className="inline-flex min-h-[2.5rem] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Go to Analytics
            </Link>
          </div>

          <div className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-4 sm:p-6">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Add Product
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create a new product listing
              </p>
            </div>
            <Link
              to="/dashboard/products/new"
              className="inline-flex min-h-[2.5rem] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              New Product
            </Link>
          </div>

          <div className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-4 sm:p-6">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Customize Site
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Edit your branding and settings
              </p>
            </div>
            <Link
              to="/dashboard/settings"
              className="inline-flex min-h-[2.5rem] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
