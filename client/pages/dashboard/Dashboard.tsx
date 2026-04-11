import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { products } from "@/data/products";
import { BarChart3, Package, Users, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to your Craft admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="font-display text-3xl font-bold text-foreground mt-1">
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
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Recent Products
              </h2>
              <p className="text-muted-foreground text-sm">
                Your latest product additions
              </p>
            </div>
            <Link
              to="/dashboard/products"
              className="text-primary hover:text-primary/80 font-semibold text-sm"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
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
                        <span className="text-2xl">{product.image}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 space-y-4">
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
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Go to Analytics
            </Link>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 space-y-4">
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
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              New Product
            </Link>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 space-y-4">
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
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
