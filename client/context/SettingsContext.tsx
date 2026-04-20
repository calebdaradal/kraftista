import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

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
  faviconUrl?: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  uploadFavicon: (file: File) => Promise<string>;
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await api.settings.get();
        if (cancelled) return;
        if (remote.data) {
          const merged = { ...defaultSettings, ...remote.data } as SiteSettings;
          setSettings(merged);
          localStorage.setItem("craft_site_settings", JSON.stringify(merged));
        }
      } catch {
        // fall back to localStorage/defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = settings.siteName || "Craft";

    const applyFavicon = (href?: string) => {
      if (!href) return;
      const absoluteHref = href.startsWith("http")
        ? href
        : href.startsWith("/")
          ? `http://127.0.0.1:8000${href}`
          : href;
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = `${absoluteHref}${absoluteHref.includes("?") ? "&" : "?"}v=${Date.now()}`;
    };

    applyFavicon(settings.faviconUrl);
  }, [settings.siteName, settings.faviconUrl]);

  const hexToHsl = (hex: string): string | null => {
    const normalized = hex.trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
    const r = parseInt(normalized.slice(0, 2), 16) / 255;
    const g = parseInt(normalized.slice(2, 4), 16) / 255;
    const b = parseInt(normalized.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r:
          h = ((g - b) / delta) % 6;
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        default:
          h = (r - g) / delta + 4;
      }
      h *= 60;
      if (h < 0) h += 360;
    }
    const hs = Math.round(h);
    const ss = Math.round(s * 100);
    const ls = Math.round(l * 100);
    return `${hs} ${ss}% ${ls}%`;
  };

  useEffect(() => {
    const primary = hexToHsl(settings.primaryColor);
    const secondary = hexToHsl(settings.secondaryColor);
    const root = document.documentElement;
    if (primary) {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--sidebar-primary", primary);
      root.style.setProperty("--accent", primary);
    }
    if (secondary) {
      root.style.setProperty("--secondary", secondary);
    }
  }, [settings.primaryColor, settings.secondaryColor]);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("craft_site_settings", JSON.stringify(updated));

    const token = localStorage.getItem("craft_auth_token");
    if (token) {
      try {
        await api.settings.update(updated, token);
      } catch (error) {
        console.error("Failed to save settings to server:", error);
      }
    }
  };

  const uploadFavicon = async (file: File) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) throw new Error("Not authenticated");
    const res = await api.settings.uploadFavicon(file, token);
    await updateSettings({ faviconUrl: res.favicon_url });
    return res.favicon_url;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, uploadFavicon }}>
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
