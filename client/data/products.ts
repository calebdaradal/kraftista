/** Design / style options: image + absolute price per design */
export interface PrimaryVariationOption {
  id: string;
  label: string;
  image: string; // data URL from upload, or empty string
  price: number;
}

export interface PrimaryVariation {
  collectionName: string;
  options: PrimaryVariationOption[];
}

/** Color swatches — no price */
export interface SecondaryColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface SecondaryVariation {
  collectionName: string;
  options: SecondaryColorOption[];
}

/** Text + add-on to price */
export interface TertiaryVariationOption {
  id: string;
  label: string;
  additionalPrice: number;
}

export interface TertiaryVariation {
  collectionName: string;
  options: TertiaryVariationOption[];
}

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  image: string;
  gallery?: string[];
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  sku: string;
  dimensions?: {
    width: string;
    height: string;
    depth: string;
  };
  weight?: string;
  material?: string[];
  care?: string[];
  primaryVariation?: PrimaryVariation;
  secondaryVariation?: SecondaryVariation;
  tertiaryVariation?: TertiaryVariation;
  /** When false, product is hidden from the storefront */
  active: boolean;
}

export function variationTierNamesRequiringSelection(product: Product): string[] {
  const out: string[] = [];
  if (product.primaryVariation?.options?.length)
    out.push(product.primaryVariation.collectionName);
  if (product.secondaryVariation?.options?.length)
    out.push(product.secondaryVariation.collectionName);
  if (product.tertiaryVariation?.options?.length)
    out.push(product.tertiaryVariation.collectionName);
  return out;
}

export function computeVariantLinePrice(
  product: Product,
  selected: Record<string, string>
): number {
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

export function resolveLineImageForCart(
  product: Product,
  selected: Record<string, string>
): string {
  const pv = product.primaryVariation;
  if (pv?.options?.length) {
    const label = selected[pv.collectionName];
    const opt = pv.options.find((o) => o.label === label);
    if (opt?.image) return opt.image;
  }
  return product.image;
}

export function isVariationSelectionComplete(
  product: Product,
  selected: Record<string, string>
): boolean {
  return variationTierNamesRequiringSelection(product).every((name) => Boolean(selected[name]));
}

export function firstMissingVariationName(
  product: Product,
  selected: Record<string, string>
): string | undefined {
  return variationTierNamesRequiringSelection(product).find((name) => !selected[name]);
}

/** Named tiers with no options until the seller adds designs, colors, or add-ons */
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

/** Single default instance (e.g. new product form); use `cloneEmptyTierVariations` when each product needs its own copy */
export const EMPTY_TIER_VARIATIONS = cloneEmptyTierVariations();

export function getStorefrontProducts(): Product[] {
  return products.filter((p) => p.active);
}

export const products: Product[] = [
  {
    id: "1",
    name: "Handwoven Ceramic Vase",
    shortDescription: "Elegant ceramic vase perfect for any interior",
    fullDescription:
      "This stunning handwoven ceramic vase is crafted by skilled artisans using traditional pottery techniques passed down through generations. Each piece is unique, featuring natural clay from sustainable sources. The vase showcases beautiful glazing that catches the light beautifully, making it a perfect centerpiece for any room. Perfect for displaying fresh flowers or dried arrangements.",
    price: 89.99,
    originalPrice: 120.0,
    image: "🏺",
    category: "Ceramics",
    tags: ["handmade", "ceramic", "vase", "home-decor", "artisan"],
    rating: 4.8,
    reviewCount: 127,
    inStock: true,
    stockCount: 12,
    sku: "VASE-001",
    dimensions: { width: "15 cm", height: "25 cm", depth: "15 cm" },
    weight: "1.2 kg",
    material: ["Ceramic", "Natural Glaze"],
    care: ["Hand wash only", "Keep away from direct heat", "Dry upright"],
    ...cloneEmptyTierVariations(),
    active: true,
  },
  {
    id: "2",
    name: "Artisan Wood Bowl",
    shortDescription: "Sustainably sourced wooden serving bowl",
    fullDescription:
      "Handcrafted from sustainably harvested wood, this artisan bowl combines functionality with natural beauty. The wood grain pattern is unique to each piece, making it a one-of-a-kind addition to your kitchen. Perfect for serving salads, fruits, or other dishes, this bowl is both durable and elegant. The smooth finish is achieved through careful hand-sanding and natural oil treatment.",
    price: 54.99,
    image: "🪵",
    category: "Woodcraft",
    tags: ["wood", "bowl", "kitchen", "sustainable", "artisan"],
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    stockCount: 18,
    sku: "BOWL-002",
    dimensions: { width: "25 cm", height: "10 cm", depth: "25 cm" },
    weight: "0.8 kg",
    material: ["Reclaimed Wood", "Natural Oil Finish"],
    care: ["Hand wash only", "Oil seasonally", "Do not microwave"],
    ...cloneEmptyTierVariations(),
    active: true,
  },
  {
    id: "3",
    name: "Hand-Dyed Textile",
    shortDescription: "Vibrant hand-dyed fabric perfect for décor",
    fullDescription:
      "This beautiful hand-dyed textile is created using traditional indigo and natural dyeing techniques. The vibrant colors and unique patterns make each piece truly one-of-a-kind. Perfect for wall hangings, throw blankets, or fabric accents in your home. The natural dyes ensure that no two pieces are exactly alike, celebrating the imperfect beauty of artisan work.",
    price: 39.99,
    originalPrice: 55.0,
    image: "🎨",
    category: "Textiles",
    tags: ["textile", "hand-dyed", "wall-art", "home-decor", "natural-dye"],
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    stockCount: 25,
    sku: "TEXT-003",
    dimensions: { width: "90 cm", height: "120 cm", depth: "0.5 cm" },
    weight: "0.4 kg",
    material: ["100% Cotton", "Natural Plant Dyes"],
    care: ["Hand wash in cold water", "Air dry in shade", "Avoid direct sunlight"],
    ...cloneEmptyTierVariations(),
    active: true,
  },
  {
    id: "4",
    name: "Leather Artisan Bag",
    shortDescription: "Premium handcrafted leather shoulder bag",
    fullDescription:
      "This premium leather shoulder bag is handcrafted by experienced leather artisans using full-grain leather. The bag features traditional stitching techniques and is designed to improve with age, developing a beautiful patina over time. With multiple compartments and a comfortable shoulder strap, it's perfect for daily use while making a stylish statement. Each bag is individually crafted and signed by its maker.",
    price: 199.99,
    image: "👜",
    category: "Leather",
    tags: ["leather", "bag", "shoulder-bag", "handmade", "accessory"],
    rating: 4.9,
    reviewCount: 234,
    inStock: true,
    stockCount: 8,
    sku: "BAG-004",
    dimensions: { width: "30 cm", height: "25 cm", depth: "10 cm" },
    weight: "1.5 kg",
    material: ["Full-Grain Leather", "Brass Hardware"],
    care: ["Condition monthly with leather oil", "Protect from water", "Store in cool dry place"],
    ...cloneEmptyTierVariations(),
    active: true,
  },
  {
    id: "5",
    name: "Copper Handmade Jewelry",
    shortDescription: "Unique copper and gemstone jewelry pieces",
    fullDescription:
      "Each piece of this handmade copper jewelry is individually crafted with semi-precious gemstones. The copper is hand-forged and finished to create unique patterns and textures. Perfect as a gift or personal statement piece, these jewelry items combine traditional metalworking with modern design sensibilities. The gemstones are carefully selected for their quality and beauty.",
    price: 74.99,
    image: "💎",
    category: "Jewelry",
    tags: ["jewelry", "copper", "gemstone", "handmade", "wearable-art"],
    rating: 4.6,
    reviewCount: 92,
    inStock: true,
    stockCount: 15,
    sku: "JEW-005",
    dimensions: { width: "4 cm", height: "8 cm", depth: "1 cm" },
    weight: "0.15 kg",
    material: ["Copper", "Amethyst Gemstone", "Brass Findings"],
    care: ["Avoid water and moisture", "Store in airtight container", "Polish gently"],
    ...cloneEmptyTierVariations(),
    active: true,
  },
  {
    id: "6",
    name: "Natural Soap Set",
    shortDescription: "Handcrafted organic soap collection",
    fullDescription:
      "This luxurious set of handcrafted soaps is made with organic oils and natural ingredients. Each bar is cold-processed to preserve the beneficial properties of the ingredients. The collection includes four different scents, each blended with essential oils and complementary botanical ingredients. Perfect for personal use or as a thoughtful gift for soap enthusiasts.",
    price: 34.99,
    image: "🧼",
    category: "Personal Care",
    tags: ["soap", "organic", "natural", "handmade", "self-care"],
    rating: 4.8,
    reviewCount: 178,
    inStock: true,
    stockCount: 30,
    sku: "SOAP-006",
    dimensions: { width: "10 cm", height: "8 cm", depth: "8 cm" },
    weight: "0.6 kg",
    material: ["Olive Oil", "Coconut Oil", "Shea Butter", "Essential Oils"],
    care: ["Store in cool dry place", "Use with soap dish", "Keep away from heat"],
    ...cloneEmptyTierVariations(),
    active: true,
  },
  {
    id: "7",
    name: "Terracotta Plant Pot",
    shortDescription: "Hand-shaped terracotta for your plants",
    fullDescription:
      "This beautiful hand-shaped terracotta pot is perfect for showcasing your favorite plants or succulents. Crafted from natural terracotta clay, each pot is individually shaped and fired. The porous nature of terracotta provides excellent drainage and airflow for healthy plant growth. These pots develop a beautiful weathered patina over time, adding character and charm to any space.",
    price: 44.99,
    image: "🪴",
    category: "Gardening",
    tags: ["pot", "terracotta", "plant", "handmade", "garden"],
    rating: 4.7,
    reviewCount: 113,
    inStock: true,
    stockCount: 22,
    sku: "POT-007",
    dimensions: { width: "20 cm", height: "20 cm", depth: "20 cm" },
    weight: "1.0 kg",
    material: ["Natural Terracotta"],
    care: ["Drainage hole included", "Water plants inside", "Protect from frost"],
    ...cloneEmptyTierVariations(),
    active: true,
  },
  {
    id: "8",
    name: "Bamboo Kitchen Set",
    shortDescription: "Eco-friendly bamboo utensil collection",
    fullDescription:
      "This comprehensive bamboo kitchen set includes essential utensils for all your cooking needs. Crafted from sustainable bamboo, these tools are lightweight, durable, and eco-friendly. The natural wood grain and finish make them beautiful enough to display on your counter. Perfect for both traditional and non-stick cookware, these utensils won't scratch your pans.",
    price: 59.99,
    image: "🥢",
    category: "Kitchen",
    tags: ["kitchen", "bamboo", "utensils", "eco-friendly", "cookware"],
    rating: 4.8,
    reviewCount: 145,
    inStock: true,
    stockCount: 16,
    sku: "KIT-008",
    dimensions: { width: "8 cm", height: "30 cm", depth: "8 cm" },
    weight: "0.4 kg",
    material: ["100% Bamboo", "Stainless Steel Accents"],
    care: ["Hand wash only", "Air dry standing up", "Oil occasionally"],
    ...cloneEmptyTierVariations(),
    active: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const currentProduct = getProductById(productId);
  if (!currentProduct) return [];

  return products
    .filter(
      (p) =>
        p.id !== productId &&
        p.category === currentProduct.category &&
        p.active
    )
    .slice(0, limit);
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids.map((id) => getProductById(id)).filter((p) => p !== undefined) as Product[];
}
