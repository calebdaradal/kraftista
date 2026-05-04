/**
 * Customization types for About page, Footer, and Hero section
 */

export interface AboutValue {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface AboutMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface AboutTeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
}

export interface AboutCustomization {
  // Section visibility
  heroEnabled?: boolean;
  valuesEnabled?: boolean;
  milestonesEnabled?: boolean;
  teamEnabled?: boolean;
  previewSectionEnabled?: boolean;

  heroTitle: string;
  heroSubtitle: string;

  valuesTitle: string;
  valuesDescription?: string;
  values: AboutValue[];

  milestonesTitle: string;
  milestonesDescription?: string;
  milestones: AboutMilestone[];

  teamTitle: string;
  teamDescription?: string;
  team: AboutTeamMember[];

  previewImage?: string;
  previewImageUrl?: string;
  previewImageAlt: string;
  previewTitle: string;
}

export interface HeroStat {
  id: string;
  value: string;
  label: string;
  enabled: boolean;
}

export interface HeroCustomization {
  headline: string;
  statsEnabled: boolean;
  stats: HeroStat[];
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterCustomization {
  brandName: string;
  brandTagline: string;
  brandEmoji?: string;

  sections: FooterSection[];

  socialLinks: Array<{
    id: string;
    platform: "facebook" | "instagram" | "twitter" | "linkedin" | "email";
    url: string;
  }>;

  bottomText: string;
  policyLinks: Array<{
    id: string;
    label: string;
    href: string;
  }>;
}

export interface ServicesBullet {
  id: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  /** Small graphic (PNG with transparency OK); Supabase URI in persisted data */
  bulletImage?: string;
  bulletImageUrl?: string;
  /** Full-width carousel slide for this bullet when enabled */
  carouselImage?: string;
  carouselImageUrl?: string;
}

export interface ServicesCustomization {
  title: string;
  titleHighlight: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bulletsEnabled: boolean;
  bullets: ServicesBullet[];
  /** @deprecated Legacy single-page image — use bullet carousel slides */
  image?: string;
  imageUrl?: string;
  imageAlt: string;
}

export interface SiteCustomization {
  about: AboutCustomization;
  footer: FooterCustomization;
  hero?: HeroCustomization;
  services?: ServicesCustomization;
}

// Default customizations
export const DEFAULT_ABOUT_CUSTOMIZATION: AboutCustomization = {
  heroEnabled: true,
  valuesEnabled: true,
  milestonesEnabled: true,
  teamEnabled: true,
  previewSectionEnabled: true,

  heroTitle: "Our Story",
  heroSubtitle:
    "Craft was founded on the belief that handmade products carry a special soul. We're dedicated to bringing authentic artisan work to people who appreciate quality and craftsmanship.",

  valuesTitle: "Our Values",
  values: [
    { id: "1", icon: "heart", title: "Passion", description: "We care deeply about what we do" },
    { id: "2", icon: "leaf", title: "Sustainability", description: "Eco-friendly practices always" },
    { id: "3", icon: "award", title: "Quality", description: "Excellence in every detail" },
    { id: "4", icon: "users", title: "Community", description: "Supporting artisans worldwide" },
  ],

  milestonesTitle: "Our Journey",
  milestones: [
    { id: "1", year: "2020", title: "Founded", description: "Started with a vision" },
    { id: "2", year: "2021", title: "100 Artisans", description: "Connected our first 100" },
    { id: "3", year: "2023", title: "10k+ Customers", description: "Reached global audience" },
  ],

  teamTitle: "Meet the Team",
  team: [
    { id: "1", name: "Emma", role: "Founder & Creative Director" },
    { id: "2", name: "James", role: "Artisan Relations" },
    { id: "3", name: "Sofia", role: "Product Curator" },
  ],

  previewImage: undefined,
  previewImageUrl: undefined,
  previewImageAlt: "Crafted with Care",
  previewTitle: "Crafted with Care",
};

export const DEFAULT_HERO_CUSTOMIZATION: HeroCustomization = {
  headline: "Discover Handcrafted\nTreasures",
  statsEnabled: true,
  stats: [
    { id: "1", value: "2500+", label: "Happy Customers", enabled: true },
    { id: "2", value: "800+", label: "Products", enabled: true },
  ],
};

export const DEFAULT_SERVICES_CUSTOMIZATION: ServicesCustomization = {
  title: "Timeless Craft,",
  titleHighlight: "Made for You",
  subtitle: "Explore our handcrafted collection, where tradition meets artistry. Each piece is thoughtfully made using the finest materials and time-honored techniques.",
  description: "",
  buttonText: "Inquire now",
  buttonLink: "/contact",
  bulletsEnabled: true,
  bullets: [
    {
      id: "1",
      icon: "award",
      title: "Premium Quality",
      description: "Finest materials and meticulous craftsmanship.",
      enabled: true,
    },
    {
      id: "2",
      icon: "hand",
      title: "Handmade with Care",
      description: "Every piece is uniquely crafted by skilled artisans.",
      enabled: true,
    },
    {
      id: "3",
      icon: "package",
      title: "Worldwide Delivery",
      description: "Secure packaging and reliable global shipping.",
      enabled: true,
    },
  ],
  image: undefined,
  imageUrl: undefined,
  imageAlt: "Our craftsmanship",
};

export const DEFAULT_FOOTER_CUSTOMIZATION: FooterCustomization = {
  brandName: "Craft",
  brandTagline: "Discover beautifully handcrafted products made with passion and care.",
  brandEmoji: undefined,

  sections: [
    {
      id: "1",
      title: "Shop",
      links: [
        { id: "1", label: "All Products", href: "/shop" },
        { id: "2", label: "New Arrivals", href: "/shop" },
        { id: "3", label: "Best Sellers", href: "/shop" },
      ],
    },
    {
      id: "2",
      title: "Company",
      links: [
        { id: "1", label: "About Us", href: "/about" },
        { id: "2", label: "Contact", href: "/contact" },
        { id: "3", label: "Blog", href: "#" },
      ],
    },
    {
      id: "3",
      title: "Connect",
      links: [],
    },
  ],

  socialLinks: [
    { id: "1", platform: "facebook", url: "#" },
    { id: "2", platform: "instagram", url: "#" },
    { id: "3", platform: "twitter", url: "#" },
    { id: "4", platform: "email", url: "#" },
  ],

  bottomText: "© {year} Craft. All rights reserved.",
  policyLinks: [
    { id: "1", label: "Privacy Policy", href: "#" },
    { id: "2", label: "Terms of Service", href: "#" },
    { id: "3", label: "Cookie Policy", href: "#" },
  ],
};
