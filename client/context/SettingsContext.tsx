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
  logoUrl?: string;
  featuredProductIds: string[];
  faviconUrl?: string;
  hasLogoPrevious?: boolean;
  hasFaviconPrevious?: boolean;
  reviewMinDays?: number;
  reviewMaxDays?: number;
  logoMode?: "square" | "wide";
  wideLogoUrl?: string;
  hasWideLogoPrevious?: boolean;
}

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  uploadFavicon: (file: File) => Promise<string>;
  uploadLogo: (file: File) => Promise<string>;
  undoLogo: () => Promise<string>;
  undoFavicon: () => Promise<string>;
  uploadWideLogo: (file: File) => Promise<string>;
  undoWideLogo: () => Promise<string>;
  refreshSettings: () => Promise<void>;
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

const apiBase =
  typeof window === "undefined"
    ? "http://127.0.0.1:8000/api"
    : import.meta.env.DEV
      ? "http://127.0.0.1:8000/api"
      : `${window.location.origin}/api`;
const apiOrigin = apiBase.replace(/\/api\/?$/, "");

const toAssetUrl = (assetPath?: string) => {
  if (!assetPath) return "";
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://") || assetPath.startsWith("data:")) {
    return assetPath;
  }
  return `${apiOrigin}${assetPath.startsWith("/") ? "" : "/"}${assetPath}`;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const stored = localStorage.getItem("craft_site_settings");
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const loadRemote = async () => {
    const remote = await api.settings.get();
    if (remote.data) {
      const merged = { ...defaultSettings, ...remote.data } as SiteSettings;
      setSettings(merged);
      localStorage.setItem("craft_site_settings", JSON.stringify(merged));
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadRemote();
      } catch {
        // fall back to localStorage/defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.title = settings.siteName || defaultSettings.siteName;

    const applyFavicon = (href?: string) => {
      if (!href) return;
      const absoluteHref = toAssetUrl(href);
      const rels = ["icon", "shortcut icon", "apple-touch-icon"];
      for (const rel of rels) {
        let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
        if (!link) {
          link = document.createElement("link");
          link.rel = rel;
          document.head.appendChild(link);
        }
        link.href = absoluteHref;
      }
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

  const refreshSettings = async () => {
    await loadRemote();
  };

  const uploadFavicon = async (file: File) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) throw new Error("Not authenticated");
    const res = await api.settings.uploadFavicon(file, token);
    await refreshSettings();
    return res.favicon_url;
  };

  const uploadLogo = async (file: File) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) throw new Error("Not authenticated");
    const res = await api.settings.uploadLogo(file, token);
    await refreshSettings();
    return res.logo_url;
  };

  const undoLogo = async () => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) throw new Error("Not authenticated");
    const res = await api.settings.undoLogo(token);
    await refreshSettings();
    return res.logo_url;
  };

  const undoFavicon = async () => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) throw new Error("Not authenticated");
    const res = await api.settings.undoFavicon(token);
    await refreshSettings();
    return res.favicon_url;
  };

  const uploadWideLogo = async (file: File) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) throw new Error("Not authenticated");
    const res = await api.settings.uploadWideLogo(file, token);
    await refreshSettings();
    return res.wide_logo_url;
  };

  const undoWideLogo = async () => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) throw new Error("Not authenticated");
    const res = await api.settings.undoWideLogo(token);
    await refreshSettings();
    return res.wide_logo_url;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        uploadFavicon,
        uploadLogo,
        undoLogo,
        undoFavicon,
        uploadWideLogo,
        undoWideLogo,
        refreshSettings,
      }}
    >
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
