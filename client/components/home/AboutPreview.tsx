import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCustomization } from "@/context/CustomizationContext";
import { useSettings } from "@/context/SettingsContext";
import * as Icons from "lucide-react";

const apiBase =
  typeof window === "undefined"
    ? "http://127.0.0.1:8000/api"
    : import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : `${window.location.origin}/api`);
const assetBase = apiBase.replace(/\/api\/?$/, "");
const resolveUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${assetBase}${path.startsWith("/") ? "" : "/"}${path}`;
};

function getIconComponent(iconName: string) {
  const Icon = (Icons as Record<string, any>)[iconName];
  return Icon || Icons.Star;
}

export function AboutPreview() {
  const { about } = useCustomization();
  const { settings } = useSettings();

  // Respect the toggle — if disabled, render nothing
  if (about.previewSectionEnabled === false) return null;

  const previewValues = about.values.slice(0, 3);
  const imageUrl = resolveUrl(about.previewImageUrl || about.previewImage);

  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Image or placeholder */}
          <div className="hidden md:flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={about.previewImageAlt || "About preview"}
                className="max-h-96 w-auto max-w-full object-contain"
              />
            ) : (
              <div className="w-full max-w-xs aspect-square rounded-2xl bg-muted/30 border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
                No preview image set
              </div>
            )}
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                About {settings.siteName || "Craft"}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {about.heroSubtitle.split("\n")[0]}
              </p>
              <p className="text-muted-foreground">
                {about.heroSubtitle.split("\n").slice(1).join(" ")}
              </p>
            </div>

            {/* Values Preview */}
            <div className="space-y-4">
              {previewValues.map((value) => {
                const Icon = getIconComponent(value.icon);
                return (
                  <div key={value.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Learn More About Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
