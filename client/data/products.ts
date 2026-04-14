export type {
  PrimaryVariationOption,
  PrimaryVariation,
  SecondaryColorOption,
  SecondaryVariation,
  TertiaryVariationOption,
  TertiaryVariation,
  Product,
} from "@/types/product";
export {
  variationTierNamesRequiringSelection,
  computeVariantLinePrice,
  resolveLineImageForCart,
  isVariationSelectionComplete,
  firstMissingVariationName,
  getProductGallerySlides,
  cloneEmptyTierVariations,
  EMPTY_TIER_VARIATIONS,
} from "@/lib/product-helpers";
