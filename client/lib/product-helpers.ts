import type { Product } from "@/types/product";

export function variationTierNamesRequiringSelection(product: Product): string[] {
  const out: string[] = [];
  if (product.primaryVariation?.options?.length) out.push(product.primaryVariation.collectionName);
  if (product.secondaryVariation?.options?.length) out.push(product.secondaryVariation.collectionName);
  if (product.tertiaryVariation?.options?.length) out.push(product.tertiaryVariation.collectionName);
  return out;
}

export function computeVariantLinePrice(product: Product, selected: Record<string, string>): number {
  let price = product.price;
  const pv = product.primaryVariation;
  if (pv?.options?.length) {
    const label = selected[pv.collectionName];
    const opt = pv.options.find((o) => o.label === label);
    if (opt) price = opt.price;
  }
  const tv = product.tertiaryVariation;
  if (tv?.options?.length) {
    const label = selected[tv.collectionName];
    const opt = tv.options.find((o) => o.label === label);
    if (opt) price += opt.additionalPrice;
  }
  return Math.round(price * 100) / 100;
}

export function resolveLineImageForCart(product: Product, selected: Record<string, string>): string {
  const pv = product.primaryVariation;
  if (pv?.options?.length) {
    const label = selected[pv.collectionName];
    const opt = pv.options.find((o) => o.label === label);
    if (opt?.image) return opt.image;
  }
  return product.image;
}

export function isVariationSelectionComplete(product: Product, selected: Record<string, string>): boolean {
  return variationTierNamesRequiringSelection(product).every((name) => Boolean(selected[name]));
}

export function firstMissingVariationName(product: Product, selected: Record<string, string>): string | undefined {
  return variationTierNamesRequiringSelection(product).find((name) => !selected[name]);
}

export function getProductGallerySlides(product: Product): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (raw?: string) => {
    const s = raw?.trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  push(product.image);
  for (const g of product.gallery ?? []) push(g);
  for (const o of product.primaryVariation?.options ?? []) push(o.image);
  return out;
}

export function cloneEmptyTierVariations(): Pick<
  Product,
  "primaryVariation" | "secondaryVariation" | "tertiaryVariation"
> {
  return {
    primaryVariation: { collectionName: "Design", options: [] },
    secondaryVariation: { collectionName: "Color", options: [] },
    tertiaryVariation: { collectionName: "Size", options: [] },
  };
}

export const EMPTY_TIER_VARIATIONS = cloneEmptyTierVariations();
