import { createContext, useContext, useState, ReactNode } from "react";

export interface SiteSettings {
  siteName: string;
  headline: string;
  email: string;
  phone: string;
  address: string;
  aboutText: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  featuredProductIds: string[];
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const defaultSettings: SiteSettings = {
  siteName: "Craft",
  headline: "Artisan-Made with Purpose",
  email: "hello@craft.com",
  phone: "+1 (555) 123-4567",
  address: "123 Artisan Street, Portland, OR 97201",
  aboutText: "We believe in the power of handmade...",
  primaryColor: "#c46c1a",
  secondaryColor: "#d4a574",
  logo: "🏺",
  featuredProductIds: ["1", "2", "3", "4"],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const stored = localStorage.getItem("craft_site_settings");
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("craft_site_settings", JSON.stringify(updated));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
