import { Layout } from "@/components/layout/Layout";
import { useCustomization } from "@/context/CustomizationContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

function getIconComponent(iconName: string) {
  const key = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const Icon = (Icons as Record<string, any>)[key];
  return Icon || Icons.Star;
}

const API_BASE =
  typeof window === "undefined"
    ? "http://127.0.0.1:8000/api"
    : import.meta.env.DEV
      ? "http://127.0.0.1:8000/api"
      : `${window.location.origin}/api`;

export default function Services() {
  const { services } = useCustomization();

  const enabledBullets = services.bullets.filter((b) => b.enabled);
  const showBullets = services.bulletsEnabled && enabledBullets.length > 0;

  const imageUrl = services.imageUrl
    ? services.imageUrl.startsWith("http")
      ? services.imageUrl
      : `${API_BASE.replace(/\/api$/i, "")}/api/customization/services/image`
    : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-5xl">
        {/* CTA Section */}
        <section className="mb-8 md:mb-10">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-foreground mb-3">
            {services.title && (
              <span>{services.title}</span>
            )}
            {services.titleHighlight && (
              <>
                {services.title && <br />}
                <span className="text-primary">{services.titleHighlight}</span>
              </>
            )}
          </h1>

          {services.subtitle && (
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              {services.subtitle}
            </p>
          )}

          {services.description && (
            <p className="mt-3 text-sm text-muted-foreground max-w-lg">
              {services.description}
            </p>
          )}

          {services.buttonText && (
            <div className="mt-6">
              <Link
                to={services.buttonLink || "/contact"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all"
              >
                {services.buttonText}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>

        {/* Bullets Section */}
        {showBullets && (
          <section className="mb-8 md:mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {enabledBullets.map((bullet) => {
                const BulletIcon = getIconComponent(bullet.icon);
                return (
                  <div
                    key={bullet.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BulletIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{bullet.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {bullet.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Image Section */}
        {imageUrl && (
          <section className="mt-2">
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src={imageUrl}
                alt={services.imageAlt || "Services"}
                className="w-full h-64 sm:h-80 md:h-[420px] object-cover"
              />
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
