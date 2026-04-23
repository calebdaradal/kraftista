import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export function HeroSection() {
  const { settings } = useSettings();
  return (
    <section className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/10"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                ✨ Handcrafted Excellence
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {(settings.headline || "").split("\n").map((line, i) => (
                <span key={i} className={i === 1 ? "text-primary" : undefined}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Discover unique, carefully handcrafted products created by talented artisans. Each piece tells a story of tradition, skill, and passion.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
              >
                Learn Our Story
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-foreground">2500+</div>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">800+</div>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full aspect-square">
              {/* Featured Product Visual */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl"></div>
              <div className="absolute inset-4 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <p className="font-semibold text-foreground">Premium Craftsmanship</p>
                  <p className="text-sm text-muted-foreground">Explore our curated collection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
