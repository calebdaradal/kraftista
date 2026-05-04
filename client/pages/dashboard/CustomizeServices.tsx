import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconSelector } from "@/components/IconSelector";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useCustomization } from "@/context/CustomizationContext";
import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import type { ServicesBullet } from "@shared/customization";
import { api } from "@/lib/api";
import { toast } from "sonner";
import * as Icons from "lucide-react";

const apiBase =
  typeof window === "undefined"
    ? "http://127.0.0.1:8000/api"
    : import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : `${window.location.origin}/api`);
const assetBase = apiBase.replace(/\/api\/?$/, "");
const resolveUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:"))
    return path;
  return `${assetBase}${path.startsWith("/") ? "" : "/"}${path}`;
};

function getIconComponent(iconName: string) {
  const key = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const Icon = (Icons as Record<string, any>)[key];
  return Icon || Icons.Star;
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {value ? (
        <Eye className="w-4 h-4 text-primary" />
      ) : (
        <EyeOff className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  );
}

export default function CustomizeServices() {
  const { services, updateServices, resetServices } = useCustomization();
  const [formData, setFormData] = useState(services);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  // Separate display URL so we can add a cache-buster after replacement
  // without polluting the data that gets saved.
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(
    services.imageUrl ? resolveUrl(services.imageUrl) : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateServices(formData);
      toast.success("Services page saved!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setConfirmReset(false);
    try {
      await resetServices();
      setFormData(services);
      setDisplayImageUrl(null);
      toast.success("Services page reset to defaults.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset.");
    }
  };

  const handleImageUpload = async (file: File) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      toast.error("You must be logged in to upload images.");
      return;
    }
    setUploadingImage(true);
    try {
      const result = await api.customization.uploadServicesImage(file, token);
      // The upload endpoint already persists the Supabase URI to the DB.
      // We only store the stable API path in formData so the save round-trip
      // doesn't accidentally overwrite the Supabase URI (the backend PUT now
      // guards this too). A timestamp cache-buster is kept in displayImageUrl
      // so the browser actually re-fetches the new image.
      const cacheBustedUrl = `${resolveUrl(result.image_url)}?t=${Date.now()}`;
      setDisplayImageUrl(cacheBustedUrl);
      setFormData((prev) => ({
        ...prev,
        image: result.image_url,
        imageUrl: result.image_url,
      }));
      toast.success("Image uploaded!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addBullet = () => {
    const newBullet: ServicesBullet = {
      id: Date.now().toString(),
      icon: "star",
      title: "New Feature",
      description: "Describe this feature here.",
      enabled: true,
    };
    setFormData((prev) => ({ ...prev, bullets: [...prev.bullets, newBullet] }));
  };

  const updateBullet = (id: string, field: keyof ServicesBullet, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      bullets: prev.bullets.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    }));
  };

  const deleteBullet = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      bullets: prev.bullets.filter((b) => b.id !== id),
    }));
  };

  const imagePreviewUrl = displayImageUrl;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Customize Services Page
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edit the Services page shown between Home and Shop in the navigation
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-semibold text-foreground text-lg">Title &amp; Subtitle</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title (first line)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Timeless Craft,"
                className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Displayed in the default text color
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Title Highlight (second line)
              </label>
              <input
                type="text"
                value={formData.titleHighlight}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, titleHighlight: e.target.value }))
                }
                placeholder="Made for You"
                className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Displayed in your primary brand color
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Subtitle</label>
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              rows={3}
              placeholder="Explore our handcrafted collection…"
              className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
            />
          </div>

          {/* Live Preview */}
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Preview</p>
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
              {formData.title && <span>{formData.title}</span>}
              {formData.titleHighlight && (
                <>
                  {formData.title && <br />}
                  <span className="text-primary">{formData.titleHighlight}</span>
                </>
              )}
            </h1>
            {formData.subtitle && (
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">{formData.subtitle}</p>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Call-to-Action Button</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Button Text</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData((prev) => ({ ...prev, buttonText: e.target.value }))}
                placeholder="Inquire now"
                className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Button Link</label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                placeholder="/contact"
                className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use a path like /contact or a full URL
              </p>
            </div>
          </div>

          {/* Button Preview */}
          {formData.buttonText && (
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Preview</p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm">
                {formData.buttonText}
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          )}
        </div>

        {/* Feature Bullets */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-lg">Feature Bullets</h2>
            <Toggle
              value={formData.bulletsEnabled}
              onChange={(v) => setFormData((prev) => ({ ...prev, bulletsEnabled: v }))}
              label="Show bullets"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Icon cards shown between the CTA button and the image. Toggle the section or individual
            bullets on/off.
          </p>

          <div className="space-y-3">
            {formData.bullets.map((bullet) => {
              const BulletIcon = getIconComponent(bullet.icon);
              return (
                <div
                  key={bullet.id}
                  className={`border rounded-xl p-4 transition-opacity ${
                    bullet.enabled ? "border-border" : "border-border opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Enabled toggle */}
                    <button
                      type="button"
                      onClick={() => updateBullet(bullet.id, "enabled", !bullet.enabled)}
                      className={`mt-1 relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                        bullet.enabled ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                      title={bullet.enabled ? "Hide bullet" : "Show bullet"}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                          bullet.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        {/* Icon picker */}
                        <div className="flex-shrink-0">
                          <label className="text-xs font-medium text-muted-foreground block mb-1">
                            Icon
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BulletIcon className="w-5 h-5 text-primary" />
                            </div>
                            <IconSelector
                              value={bullet.icon}
                              onChange={(icon) => updateBullet(bullet.id, "icon", icon)}
                            />
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Title
                            </label>
                            <input
                              type="text"
                              value={bullet.title}
                              onChange={(e) => updateBullet(bullet.id, "title", e.target.value)}
                              placeholder="Feature title"
                              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Description
                            </label>
                            <input
                              type="text"
                              value={bullet.description}
                              onChange={(e) =>
                                updateBullet(bullet.id, "description", e.target.value)
                              }
                              placeholder="Short description"
                              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteBullet(bullet.id)}
                      className="mt-1 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addBullet}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:bg-muted transition-colors text-sm text-muted-foreground w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Bullet
          </button>

          {/* Bullets Preview */}
          {formData.bulletsEnabled && formData.bullets.some((b) => b.enabled) && (
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Preview</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {formData.bullets
                  .filter((b) => b.enabled)
                  .map((bullet) => {
                    const BIcon = getIconComponent(bullet.icon);
                    return (
                      <div key={bullet.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{bullet.title}</p>
                          <p className="text-xs text-muted-foreground">{bullet.description}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Page Image</h2>
          <p className="text-sm text-muted-foreground">
            Full-width image displayed at the bottom of the Services page with rounded corners.
            Shown at its natural resolution and aspect ratio.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />

          {imagePreviewUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img
                  src={imagePreviewUrl}
                  alt={formData.imageAlt || "Services image"}
                  className="w-full h-auto max-w-full block"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, image: undefined, imageUrl: undefined }));
                    setDisplayImageUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium disabled:opacity-60"
              >
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploadingImage ? "Uploading…" : "Replace Image"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors gap-3 disabled:opacity-60"
            >
              {uploadingImage ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {uploadingImage ? "Uploading…" : "Click to upload image"}
              </span>
              <span className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</span>
            </button>
          )}

          <div>
            <label className="text-sm font-medium text-foreground">Image Alt Text</label>
            <input
              type="text"
              value={formData.imageAlt}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageAlt: e.target.value }))}
              placeholder="Our craftsmanship"
              className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Describes the image for screen readers and SEO
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="Reset Services Page?"
        message="This will restore all Services page content to its default values."
        confirmLabel="Reset to Defaults"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </DashboardLayout>
  );
}
