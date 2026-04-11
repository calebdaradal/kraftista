import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 md:p-16">
          {/* Background pattern */}
          <div className={"absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"white\"/></svg>')]"}></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-white flex-1">
              <h3 className="font-display text-3xl md:text-4xl font-bold">
                Spring Collection
              </h3>
              <p className="text-lg opacity-90 max-w-lg">
                Discover fresh new designs perfect for refreshing your home or finding the ideal gift for someone special.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-opacity-90 transition-all hover:gap-3 flex-shrink-0"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
