import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCustomization } from "@/context/CustomizationContext";
import { useSettings } from "@/context/SettingsContext";
import * as Icons from "lucide-react";

function getIconComponent(iconName: string) {
  const Icon = (Icons as Record<string, any>)[iconName];
  return Icon || Icons.Star;
}

export function AboutPreview() {
  const { about } = useCustomization();
  const { settings } = useSettings();
  
  // Use first 3 values for preview
  const previewValues = about.values.slice(0, 3);

  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left - Visual */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-12 flex items-center justify-center aspect-square">
                <div className="text-center space-y-4">
                  <div className="text-7xl">{about.previewEmoji}</div>
                  <p className="font-semibold text-foreground text-lg">{about.previewTitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                About {settings.siteName || "Craft"}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                {about.heroSubtitle.split('\n')[0]}
              </p>
              <p className="text-muted-foreground">
                {about.heroSubtitle.split('\n').slice(1).join(' ')}
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
