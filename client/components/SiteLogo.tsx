import { Link } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";

export function resolveAssetUrl(assetPath?: string): string {
  if (!assetPath) return "";
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://") || assetPath.startsWith("data:")) {
    return assetPath;
  }
  const apiBase =
    typeof window === "undefined"
      ? "http://127.0.0.1:8000/api"
      : import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : `${window.location.origin}/api`);
  const base = apiBase.replace(/\/api\/?$/, "");
  return `${base}${assetPath.startsWith("/") ? "" : "/"}${assetPath}`;
}

interface SiteLogoProps {
  /** Text shown next to the square logo (ignored in wide mode) */
  label?: string;
  /** Subtitle shown below label (ignored in wide mode) */
  sublabel?: string;
  /** Extra classes applied to the outer wrapper div */
  className?: string;
  /** Classes applied to the text/label container (e.g. "hidden sm:block" for header) */
  labelClassName?: string;
  /** Wide logo max-height class — default "max-h-10" */
  wideImgClass?: string;
  /** Square logo size class — default "w-10 h-10" */
  squareImgClass?: string;
  /** Wrap with a <Link to="/"> — default true */
  asLink?: boolean;
}

/**
 * Renders the site logo respecting the admin-selected `logoMode`:
 * - "wide": shows only the wide/rectangular logo image
 * - "square" (default): shows the square logo + optional label/sublabel text
 */
export function SiteLogo({
  label,
  sublabel,
  className = "",
  labelClassName = "",
  wideImgClass = "max-h-10 w-auto max-w-[12rem]",
  squareImgClass = "w-10 h-10",
  asLink = true,
}: SiteLogoProps) {
  const { settings } = useSettings();

  const isWideMode = settings.logoMode === "wide" && !!settings.wideLogoUrl;

  const inner = (
    <div className={`flex items-center gap-2 ${className}`}>
      {isWideMode ? (
        <img
          src={resolveAssetUrl(settings.wideLogoUrl)}
          alt={settings.siteName || label || "Logo"}
          className={`${wideImgClass} object-contain flex-shrink-0`}
        />
      ) : (
        <>
          {settings.logoUrl ? (
            <img
              src={resolveAssetUrl(settings.logoUrl)}
              alt={settings.siteName || label || "Logo"}
              className={`${squareImgClass} object-contain rounded-lg flex-shrink-0`}
            />
          ) : (
            <div
              className={`${squareImgClass} bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white font-display font-bold text-sm">
                {(settings.siteName || label || "C").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {(label || sublabel) && (
            <div className={labelClassName}>
              {label && <div className="font-display font-bold text-foreground">{label}</div>}
              {sublabel && <div className="text-xs text-muted-foreground">{sublabel}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );

  if (asLink) {
    return <Link to="/">{inner}</Link>;
  }
  return inner;
}
