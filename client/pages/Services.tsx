import { Layout } from "@/components/layout/Layout";
import { PromoCtaBanner } from "@/components/PromoCtaBanner";
import { useCustomization } from "@/context/CustomizationContext";
import { resolveAssetUrl } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ServicesBullet } from "@shared/customization";
import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";

function getIconComponent(iconName: string) {
  const key = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const Icon = (Icons as Record<string, unknown>)[key];
  return (typeof Icon === "function" ? Icon : Icons.Star) as ComponentType<{ className?: string }>;
}

function cacheBustResolved(path: string | undefined, storageRef: string | undefined) {
  const base = resolveAssetUrl(path || "");
  if (!base) return null;
  if (!storageRef) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${encodeURIComponent(storageRef)}`;
}

/** Legacy single services image URLs (first slide fallback). */
function legacySlideSrc(services: {
  imageUrl?: string;
  image?: string;
}): string | null {
  if (!services.imageUrl) return null;
  const base =
    services.imageUrl.startsWith("http") || services.imageUrl.startsWith("//")
      ? services.imageUrl
      : resolveAssetUrl(services.imageUrl);
  if (!base) return null;
  if (services.image) {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}v=${encodeURIComponent(services.image)}`;
  }
  return base;
}

function slideImageForBullet(
  bullet: ServicesBullet,
  index: number,
  services: {
    imageUrl?: string;
    image?: string;
    imageAlt: string;
  },
): { src: string | null; alt: string } {
  if (bullet.carouselImageUrl && bullet.carouselImage) {
    return { src: cacheBustResolved(bullet.carouselImageUrl, bullet.carouselImage), alt: bullet.title };
  }
  if (index === 0) {
    const leg = legacySlideSrc(services);
    if (leg) return { src: leg, alt: services.imageAlt || bullet.title };
  }
  return { src: null, alt: bullet.title };
}

function bulletThumbnailSrc(bullet: ServicesBullet): string | null {
  return cacheBustResolved(bullet.bulletImageUrl, bullet.bulletImage);
}

export default function Services() {
  const { services } = useCustomization();
  const enabledBullets = useMemo(() => services.bullets.filter((b) => b.enabled), [services.bullets]);
  const showBulletsSection = services.bulletsEnabled && enabledBullets.length > 0;
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setActiveIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("reInit", onSelect);
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  const scrollToSlide = useCallback(
    (i: number) => {
      carouselApi?.scrollTo(i);
    },
    [carouselApi],
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-5xl">
        <section className="mb-8 md:mb-10">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-3">
            {services.title ? (
              <span className="block leading-tight text-foreground">{services.title}</span>
            ) : null}
            {services.titleHighlight ? (
              <span
                className={`block text-[0.6em] text-primary font-bold leading-tight ${services.title ? "mt-1" : ""}`}
              >
                {services.titleHighlight}
              </span>
            ) : null}
          </h1>

          {services.subtitle && (
            <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {services.subtitle}
            </p>
          )}

          {services.description ? (
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl whitespace-pre-line leading-relaxed">
              {services.description}
            </p>
          ) : null}

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

        {showBulletsSection && (
          <section className="mb-8 md:mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {enabledBullets.map((bullet, i) => {
                const thumb = bulletThumbnailSrc(bullet);
                const BulletIcon = getIconComponent(bullet.icon);
                const isActive = activeIndex === i;
                return (
                  <button
                    key={bullet.id}
                    type="button"
                    onClick={() => scrollToSlide(i)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      isActive ? "bg-primary/15 ring-2 ring-primary shadow-sm" : "bg-muted/30 hover:bg-muted/50 hover:ring-1 hover:ring-primary/30"
                    }`}
                  >
                    <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <BulletIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-sm text-foreground">{bullet.title}</h3>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground opacity-70"}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{bullet.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {showBulletsSection && (
          <section className="mb-10 md:mb-14">
            <div className="relative w-full">
              <Carousel opts={{ loop: true }} setApi={setCarouselApi} className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {enabledBullets.map((bullet, i) => {
                    const { src, alt } = slideImageForBullet(bullet, i, services);
                    return (
                      <CarouselItem key={bullet.id} className="pl-2 md:pl-4 basis-full">
                        <div className="rounded-2xl overflow-hidden shadow-md min-h-[300px] sm:min-h-[380px] md:min-h-[420px] flex items-center justify-center">
                          {src ? (
                            <img
                              src={src}
                              alt={alt || services.imageAlt || "Services"}
                              className="w-full h-auto max-h-[min(88vh,760px)] max-w-full object-contain"
                            />
                          ) : (
                            <div className="text-center text-muted-foreground space-y-2 py-16 px-6">
                              <p className="font-medium text-foreground">{bullet.title}</p>
                              <p className="text-sm">Add a carousel image for this feature in Customize Services.</p>
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="left-3 md:left-4 top-1/2 -translate-y-1/2 h-10 w-10 border-border bg-background/95 shadow-md backdrop-blur-sm hover:bg-background disabled:opacity-40" />
                <CarouselNext className="right-3 md:right-4 top-1/2 -translate-y-1/2 h-10 w-10 border-border bg-background/95 shadow-md backdrop-blur-sm hover:bg-background disabled:opacity-40" />
              </Carousel>
            </div>
          </section>
        )}

      </div>

      <PromoCtaBanner
        title="Ready when you are"
        description="Reach out to book—we would love to hear from you."
        ctaHref="/contact"
        ctaLabel="Book now"
      />
    </Layout>
  );
}
