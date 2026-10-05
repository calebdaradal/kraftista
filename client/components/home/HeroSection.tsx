import { useCustomization } from "@/context/CustomizationContext";
import { resolveAssetUrl } from "@/lib/api";

export function HeroSection() {
  const { hero } = useCustomization();
  const isDefaultImage = !hero.imageUrl
    || hero.imageUrl === "/HeaderImage.png"
    || hero.imageUrl === "/HeaderImage.jpg";
  const baseImageUrl = isDefaultImage
    ? "/HeaderImage.jpg"
    : hero.imageUrl.startsWith("/api/")
      ? resolveAssetUrl(hero.imageUrl)
      : hero.imageUrl;
  const imageUrl = hero.image
    ? `${baseImageUrl}${baseImageUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(hero.image)}`
    : baseImageUrl;

  return (
    <section className="w-full overflow-hidden" aria-label="Kraftista hero banner">
      <picture>
        {isDefaultImage && (
          <source media="(max-width: 1023px)" srcSet="/mobile-HeaderImage.jpg" />
        )}
        <img
          src={imageUrl}
          alt={hero.imageAlt || "Kraftista handcrafted and personalized gifts"}
          className="block h-auto w-full"
        />
      </picture>
    </section>
  );
}
