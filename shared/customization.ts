/**
 * Customization types for About page and Footer
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
  previewImageAlt: string;
  previewEmoji: string;
  previewTitle: string;
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

export interface SiteCustomization {
  about: AboutCustomization;
  footer: FooterCustomization;
}

// Default customizations
export const DEFAULT_ABOUT_CUSTOMIZATION: AboutCustomization = {
  heroTitle: "Our Story",
  heroSubtitle: "Craft was founded on the belief that handmade products carry a special soul. We're dedicated to bringing authentic artisan work to people who appreciate quality and craftsmanship.",
  
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
  previewImageAlt: "Crafted with Care",
  previewEmoji: "🪄",
  previewTitle: "Crafted with Care",
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
