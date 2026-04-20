import React, { createContext, useContext, useState, useEffect } from "react";
import type { AboutCustomization, FooterCustomization } from "@shared/customization";
import { DEFAULT_ABOUT_CUSTOMIZATION, DEFAULT_FOOTER_CUSTOMIZATION } from "@shared/customization";
import { api } from "@/lib/api";

interface CustomizationContextType {
  about: AboutCustomization;
  footer: FooterCustomization;
  updateAbout: (about: AboutCustomization) => Promise<void>;
  updateFooter: (footer: FooterCustomization) => Promise<void>;
  resetAbout: () => Promise<void>;
  resetFooter: () => Promise<void>;
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

  // Load from API first; fall back to localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await api.customization.get();
        if (cancelled) return;
        if (remote.about) setAbout(remote.about);
        if (remote.footer) setFooter(remote.footer);
        if (remote.about) localStorage.setItem(STORAGE_KEYS.about, JSON.stringify(remote.about));
        if (remote.footer) localStorage.setItem(STORAGE_KEYS.footer, JSON.stringify(remote.footer));
      } catch {
        try {
          const savedAbout = localStorage.getItem(STORAGE_KEYS.about);
          const savedFooter = localStorage.getItem(STORAGE_KEYS.footer);
          if (savedAbout) setAbout(JSON.parse(savedAbout));
          if (savedFooter) setFooter(JSON.parse(savedFooter));
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

  const resetAbout = async () => {
    await updateAbout(DEFAULT_ABOUT_CUSTOMIZATION);
  };

  const resetFooter = async () => {
    await updateFooter(DEFAULT_FOOTER_CUSTOMIZATION);
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
