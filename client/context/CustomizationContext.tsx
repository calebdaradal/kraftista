import React, { createContext, useContext, useState, useEffect } from "react";
import type { AboutCustomization, FooterCustomization, HeroCustomization, ServicesCustomization } from "@shared/customization";
import {
  DEFAULT_ABOUT_CUSTOMIZATION,
  DEFAULT_FOOTER_CUSTOMIZATION,
  DEFAULT_HERO_CUSTOMIZATION,
  DEFAULT_SERVICES_CUSTOMIZATION,
} from "@shared/customization";
import { api } from "@/lib/api";

interface CustomizationContextType {
  about: AboutCustomization;
  footer: FooterCustomization;
  hero: HeroCustomization;
  services: ServicesCustomization;
  updateAbout: (about: AboutCustomization) => Promise<void>;
  updateFooter: (footer: FooterCustomization) => Promise<void>;
  updateHero: (hero: HeroCustomization) => Promise<void>;
  updateServices: (services: ServicesCustomization) => Promise<void>;
  resetAbout: () => Promise<void>;
  resetFooter: () => Promise<void>;
  resetHero: () => Promise<void>;
  resetServices: () => Promise<void>;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  about: "craft_customization_about",
  footer: "craft_customization_footer",
  hero: "craft_customization_hero",
  services: "craft_customization_services",
};

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const [about, setAbout] = useState<AboutCustomization>(DEFAULT_ABOUT_CUSTOMIZATION);
  const [footer, setFooter] = useState<FooterCustomization>(DEFAULT_FOOTER_CUSTOMIZATION);
  const [hero, setHero] = useState<HeroCustomization>(DEFAULT_HERO_CUSTOMIZATION);
  const [services, setServices] = useState<ServicesCustomization>(DEFAULT_SERVICES_CUSTOMIZATION);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await api.customization.get();
        if (cancelled) return;
        if (remote.about) {
          setAbout(remote.about);
          localStorage.setItem(STORAGE_KEYS.about, JSON.stringify(remote.about));
        }
        if (remote.footer) {
          setFooter(remote.footer);
          localStorage.setItem(STORAGE_KEYS.footer, JSON.stringify(remote.footer));
        }
        if (remote.hero) {
          setHero(remote.hero);
          localStorage.setItem(STORAGE_KEYS.hero, JSON.stringify(remote.hero));
        }
        if (remote.services) {
          setServices(remote.services);
          localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(remote.services));
        }
      } catch {
        try {
          const savedAbout = localStorage.getItem(STORAGE_KEYS.about);
          const savedFooter = localStorage.getItem(STORAGE_KEYS.footer);
          const savedHero = localStorage.getItem(STORAGE_KEYS.hero);
          const savedServices = localStorage.getItem(STORAGE_KEYS.services);
          if (savedAbout) setAbout(JSON.parse(savedAbout));
          if (savedFooter) setFooter(JSON.parse(savedFooter));
          if (savedHero) setHero(JSON.parse(savedHero));
          if (savedServices) setServices(JSON.parse(savedServices));
        } catch (error) {
          console.error("Failed to load customizations:", error);
        }
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateAbout = async (newAbout: AboutCustomization) => {
    setAbout(newAbout);
    try {
      localStorage.setItem(STORAGE_KEYS.about, JSON.stringify(newAbout));
    } catch (error) {
      console.error("Failed to save about customization:", error);
    }
    const token = localStorage.getItem("craft_auth_token");
    if (token) {
      try {
        await api.customization.updateAbout(newAbout, token);
      } catch (error) {
        console.error("Failed to save about customization to server:", error);
      }
    }
  };

  const updateFooter = async (newFooter: FooterCustomization) => {
    setFooter(newFooter);
    try {
      localStorage.setItem(STORAGE_KEYS.footer, JSON.stringify(newFooter));
    } catch (error) {
      console.error("Failed to save footer customization:", error);
    }
    const token = localStorage.getItem("craft_auth_token");
    if (token) {
      try {
        await api.customization.updateFooter(newFooter, token);
      } catch (error) {
        console.error("Failed to save footer customization to server:", error);
      }
    }
  };

  const updateHero = async (newHero: HeroCustomization) => {
    setHero(newHero);
    try {
      localStorage.setItem(STORAGE_KEYS.hero, JSON.stringify(newHero));
    } catch (error) {
      console.error("Failed to save hero customization:", error);
    }
    const token = localStorage.getItem("craft_auth_token");
    if (token) {
      try {
        await api.customization.updateHero(newHero, token);
      } catch (error) {
        console.error("Failed to save hero customization to server:", error);
      }
    }
  };

  const updateServices = async (newServices: ServicesCustomization) => {
    setServices(newServices);
    try {
      localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(newServices));
    } catch (error) {
      console.error("Failed to save services customization:", error);
    }
    const token = localStorage.getItem("craft_auth_token");
    if (token) {
      try {
        await api.customization.updateServices(newServices, token);
      } catch (error) {
        console.error("Failed to save services customization to server:", error);
      }
    }
  };

  const resetAbout = async () => updateAbout(DEFAULT_ABOUT_CUSTOMIZATION);
  const resetFooter = async () => updateFooter(DEFAULT_FOOTER_CUSTOMIZATION);
  const resetHero = async () => updateHero(DEFAULT_HERO_CUSTOMIZATION);
  const resetServices = async () => updateServices(DEFAULT_SERVICES_CUSTOMIZATION);

  if (!isLoaded) {
    return null;
  }

  return (
    <CustomizationContext.Provider
      value={{ about, footer, hero, services, updateAbout, updateFooter, updateHero, updateServices, resetAbout, resetFooter, resetHero, resetServices }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error("useCustomization must be used within CustomizationProvider");
  }
  return context;
}
