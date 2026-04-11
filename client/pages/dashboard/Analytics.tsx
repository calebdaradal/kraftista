import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BarChart3, TrendingUp, Users, ShoppingCart } from "lucide-react";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your store's performance and customer insights
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-12 text-center space-y-6">
          <div className="flex justify-center">
            <BarChart3 className="w-16 h-16 text-primary/40" />
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Analytics Coming Soon
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building powerful analytics to help you understand your customers
              and grow your business. Check back soon for detailed insights, charts, and
              performance metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                Coming Soon
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                Coming Soon
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Customers</p>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                Coming Soon
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Conversion</p>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                Coming Soon
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Features coming in Q2 2024
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
