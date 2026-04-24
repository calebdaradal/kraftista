import { Layout } from "@/components/layout/Layout";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <div className="text-7xl md:text-8xl font-display font-bold text-primary">
              404
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Page Not Found
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Sorry! We couldn't find the page you're looking for. It might have been moved or deleted.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Return Home
              </Link>
              <Link
                to="/shop"
                className="inline-block px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
              >
                Browse Shop
              </Link>
            </div>

            <p className="text-sm text-muted-foreground pt-4">
              Need help? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
