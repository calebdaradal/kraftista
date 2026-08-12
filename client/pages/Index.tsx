import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandBanner } from "@/components/home/BrandBanner";
import { PromoBanner } from "@/components/home/PromoBanner";
import { AboutPreview } from "@/components/home/AboutPreview";

export default function Index() {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProducts />
      <BrandBanner />
      <PromoBanner />
      <AboutPreview />
    </Layout>
  );
}
