import React, { createContext, useContext, useState, useEffect } from "react";
import type { AboutCustomization, FooterCustomization } from "@shared/customization";
import { DEFAULT_ABOUT_CUSTOMIZATION, DEFAULT_FOOTER_CUSTOMIZATION } from "@shared/customization";

interface CustomizationContextType {
  about: AboutCustomization;
  footer: FooterCustomization;
  updateAbout: (about: AboutCustomization) => void;
  updateFooter: (footer: FooterCustomization) => void;
  resetAbout: () => void;
  resetFooter: () => void;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  about: "craft_customization_about",
  footer: "craft_customization_footer",
};

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const [about, setAbout] = useState<AboutCustomization>(DEFAULT_ABOUT_CUSTOMIZATION);
  const [footer, setFooter] = useState<FooterCustomization>(DEFAULT_FOOTER_CUSTOMIZATION);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedAbout = localStorage.getItem(STORAGE_KEYS.about);
      const savedFooter = localStorage.getItem(STORAGE_KEYS.footer);
      
      if (savedAbout) setAbout(JSON.parse(savedAbout));
      if (savedFooter) setFooter(JSON.parse(savedFooter));
    } catch (error) {
      console.error("Failed to load customizations from localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  const updateAbout = (newAbout: AboutCustomization) => {
    setAbout(newAbout);
    try {
      localStorage.setItem(STORAGE_KEYS.about, JSON.stringify(newAbout));
    } catch (error) {
      console.error("Failed to save about customization:", error);
    }
  };

  const updateFooter = (newFooter: FooterCustomization) => {
    setFooter(newFooter);
    try {
      localStorage.setItem(STORAGE_KEYS.footer, JSON.stringify(newFooter));
    } catch (error) {
      console.error("Failed to save footer customization:", error);
    }
  };

  const resetAbout = () => {
    updateAbout(DEFAULT_ABOUT_CUSTOMIZATION);
  };

  const resetFooter = () => {
    updateFooter(DEFAULT_FOOTER_CUSTOMIZATION);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <CustomizationContext.Provider value={{ about, footer, updateAbout, updateFooter, resetAbout, resetFooter }}>
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
