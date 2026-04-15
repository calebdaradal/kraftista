export interface PrimaryVariationOption {
  id: string;
  label: string;
  image: string;
  price: number;
}

export interface PrimaryVariation {
  collectionName: string;
  options: PrimaryVariationOption[];
}

export interface SecondaryColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface SecondaryVariation {
  collectionName: string;
  options: SecondaryColorOption[];
}

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
  featured: boolean;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  sku: string;
  dimensions?: {
    widthCm?: number;
    heightCm?: number;
    lengthCm?: number;
  };
  weightKg?: number;
  material?: string[];
  care?: string[];
  primaryVariation?: PrimaryVariation;
  secondaryVariation?: SecondaryVariation;
  tertiaryVariation?: TertiaryVariation;
  active: boolean;
}
