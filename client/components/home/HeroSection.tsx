import { useCustomization } from "@/context/CustomizationContext";
import { resolveAssetUrl } from "@/lib/api";

export function HeroSection() {
  const { hero } = useCustomization();
  const baseImageUrl = hero.imageUrl?.startsWith("/api/")
    ? resolveAssetUrl(hero.imageUrl)
    : hero.imageUrl || "/HeaderImage.png";
  const imageUrl = hero.image
    ? `${baseImageUrl}${baseImageUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(hero.image)}`
    : baseImageUrl;

  return (
    <section className="w-full overflow-hidden" aria-label="Kraftista hero banner">
      <img
        src={imageUrl}
        alt={hero.imageAlt || "Kraftista handcrafted and personalized gifts"}
        className="block h-auto w-full"
      />
    </section>
  );
}
