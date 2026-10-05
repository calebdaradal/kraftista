export function BrandBanner() {
  return (
    <section aria-label="About Kraftista" className="w-full overflow-hidden">
      <picture>
        <source media="(max-width: 1023px)" srcSet="/mobile-Banner.jpg" />
        <img
          src="/Banner.jpg"
          alt="Kraftista handmade products and brand story"
          className="block h-auto w-full"
          loading="lazy"
          decoding="async"
        />
      </picture>
    </section>
  );
}
