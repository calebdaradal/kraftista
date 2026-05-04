import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconSelector } from "@/components/IconSelector";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useCustomization } from "@/context/CustomizationContext";
import { useState, type ComponentType } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  Loader2,
  ArrowRight,
  ImageIcon,
} from "lucide-react";
import type { ServicesBullet } from "@shared/customization";
import { DEFAULT_SERVICES_CUSTOMIZATION } from "@shared/customization";
import { api, resolveAssetUrl } from "@/lib/api";
import { toast } from "sonner";
import * as Icons from "lucide-react";

function getIconComponent(iconName: string) {
  const key = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const Icon = (Icons as Record<string, unknown>)[key];
  return (typeof Icon === "function" ? Icon : Icons.Star) as ComponentType<{ className?: string }>;
}

function cacheBustResolved(path: string | undefined, storageRef: string | undefined) {
  const base = resolveAssetUrl(path || "");
  if (!base) return "";
  if (!storageRef) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${encodeURIComponent(storageRef)}`;
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
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateServices(formData);
      toast.success("Services page saved!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setConfirmReset(false);
    try {
      await resetServices();
      setFormData({ ...DEFAULT_SERVICES_CUSTOMIZATION });
      toast.success("Services page reset to defaults.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reset.");
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

  const deleteBullet = async (id: string) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }
    try {
      await api.customization.deleteServicesBullet(id, token);
      setFormData((prev) => ({
        ...prev,
        bullets: prev.bullets.filter((b) => b.id !== id),
      }));
      toast.success("Bullet removed.");
    } catch {
      toast.error("Failed to delete bullet.");
    }
  };

  const handleCarouselUpload = async (bulletId: string, file: File) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      toast.error("You must be logged in to upload.");
      return;
    }
    setUploadingKey(`${bulletId}-carousel`);
    try {
      const res = await api.customization.uploadServicesBulletCarousel(bulletId, file, token);
      setFormData((prev) => ({
        ...prev,
        bullets: prev.bullets.map((b) =>
          b.id === bulletId
            ? { ...b, carouselImage: res.carousel_image, carouselImageUrl: res.carousel_image_url }
            : b,
        ),
      }));
      toast.success("Carousel image saved.");
    } catch {
      toast.error(
        "Failed to upload carousel image. If you just added this bullet, click Save Changes first, then try again.",
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const handleCarouselRemove = async (bulletId: string) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) return;
    try {
      await api.customization.deleteServicesBulletCarousel(bulletId, token);
      setFormData((prev) => ({
        ...prev,
        bullets: prev.bullets.map((b) =>
          b.id === bulletId ? { ...b, carouselImage: undefined, carouselImageUrl: undefined } : b,
        ),
      }));
      toast.success("Carousel image removed.");
    } catch {
      toast.error("Failed to remove carousel image.");
    }
  };

  const handleIconUpload = async (bulletId: string, file: File) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      toast.error("You must be logged in.");
      return;
    }
    setUploadingKey(`${bulletId}-icon`);
    try {
      const res = await api.customization.uploadServicesBulletIcon(bulletId, file, token);
      setFormData((prev) => ({
        ...prev,
        bullets: prev.bullets.map((b) =>
          b.id === bulletId ? { ...b, bulletImage: res.bullet_image, bulletImageUrl: res.bullet_image_url } : b,
        ),
      }));
      toast.success("Custom icon saved.");
    } catch {
      toast.error(
        "Failed to upload icon. If you just added this bullet, click Save Changes first, then try again.",
      );
    } finally {
      setUploadingKey(null);
    }
  };

  const handleIconRemove = async (bulletId: string) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) return;
    try {
      await api.customization.deleteServicesBulletIcon(bulletId, token);
      setFormData((prev) => ({
        ...prev,
        bullets: prev.bullets.map((b) =>
          b.id === bulletId ? { ...b, bulletImage: undefined, bulletImageUrl: undefined } : b,
        ),
      }));
      toast.success("Custom icon removed.");
    } catch {
      toast.error("Failed to remove icon.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Customize Services Page
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Bullets sync with carousel slides — set a carousel image per feature.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

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
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Title Highlight (second line)</label>
              <input
                type="text"
                value={formData.titleHighlight}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, titleHighlight: e.target.value }))
                }
                placeholder="Made for You"
                className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Subtitle</label>
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              rows={3}
              placeholder="Explore our handcrafted collection…"
              className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Main body</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              placeholder="Optional longer text shown under the subtitle. Press Enter for new paragraphs."
              className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y whitespace-pre-wrap"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Line breaks you add here appear on the public Services page.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Preview</p>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {formData.title ? (
                <span className="block leading-tight text-foreground">{formData.title}</span>
              ) : null}
              {formData.titleHighlight ? (
                <span
                  className={`block text-[0.6em] text-primary font-bold leading-tight ${formData.title ? "mt-1" : ""}`}
                >
                  {formData.titleHighlight}
                </span>
              ) : null}
            </h1>
            {formData.subtitle && (
              <p className="mt-2 text-base text-muted-foreground max-w-prose">{formData.subtitle}</p>
            )}
            {formData.description && (
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line max-w-prose">{formData.description}</p>
            )}
          </div>
        </div>

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
            </div>
          </div>
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

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-lg">Feature Bullets &amp; Carousel</h2>
            <Toggle
              value={formData.bulletsEnabled}
              onChange={(v) => setFormData((prev) => ({ ...prev, bulletsEnabled: v }))}
              label="Show section"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Each enabled bullet appears as a card; visitors click a card to jump to its carousel slide. Upload a
            transparent PNG for the small icon, and a larger image for the carousel (also supports PNG with alpha).
            <span className="block mt-2 font-medium text-foreground">
              After adding a new bullet, click Save Changes once before uploading images for it.
            </span>
          </p>

          <div className="space-y-4">
            {formData.bullets.map((bullet) => {
              const BulletIcon = getIconComponent(bullet.icon);
              const iconPreview = cacheBustResolved(bullet.bulletImageUrl, bullet.bulletImage);
              const carouselPreview = cacheBustResolved(bullet.carouselImageUrl, bullet.carouselImage);
              const busyCar = uploadingKey === `${bullet.id}-carousel`;
              const busyIcon = uploadingKey === `${bullet.id}-icon`;

              return (
                <div
                  key={bullet.id}
                  className={`border rounded-xl p-4 transition-opacity ${
                    bullet.enabled ? "border-border" : "border-border opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
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

                    <div className="flex-1 space-y-4 min-w-0">
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Lucide fallback</label>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                              {bullet.bulletImageUrl && bullet.bulletImage && iconPreview ? (
                                <img src={iconPreview} alt="" className="max-w-full max-h-full object-contain" />
                              ) : (
                                <BulletIcon className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <IconSelector
                              value={bullet.icon}
                              onChange={(icon) => updateBullet(bullet.id, "icon", icon)}
                            />
                          </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Title</label>
                            <input
                              type="text"
                              value={bullet.title}
                              onChange={(e) => updateBullet(bullet.id, "title", e.target.value)}
                              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Description</label>
                            <input
                              type="text"
                              value={bullet.description}
                              onChange={(e) => updateBullet(bullet.id, "description", e.target.value)}
                              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-border p-3 space-y-2">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" /> Custom bullet image
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={busyIcon}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleIconUpload(bullet.id, f);
                                  e.target.value = "";
                                }}
                              />
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted">
                                {busyIcon ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                Upload
                              </span>
                            </label>
                            {bullet.bulletImageUrl && (
                              <button
                                type="button"
                                onClick={() => handleIconRemove(bullet.id)}
                                className="text-xs text-destructive hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg border border-border p-3 space-y-2">
                          <p className="text-xs font-semibold text-foreground">Carousel slide</p>
                          {carouselPreview ? (
                            <div className="relative rounded-md overflow-hidden border border-border bg-muted/40 max-h-32">
                              <img src={carouselPreview} alt="" className="w-full h-28 object-contain" />
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No slide image — optional placeholder on site.</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={busyCar}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleCarouselUpload(bullet.id, f);
                                  e.target.value = "";
                                }}
                              />
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted">
                                {busyCar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                Upload / replace
                              </span>
                            </label>
                            {bullet.carouselImageUrl && (
                              <button
                                type="button"
                                onClick={() => handleCarouselRemove(bullet.id)}
                                className="text-xs text-destructive hover:underline"
                              >
                                Remove from carousel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteBullet(bullet.id)}
                      className="mt-1 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                      title="Delete bullet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addBullet}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:bg-muted transition-colors text-sm text-muted-foreground w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Bullet
          </button>

          {formData.bulletsEnabled && formData.bullets.some((b) => b.enabled) && (
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Preview order</p>
              <div className="flex flex-wrap gap-2">
                {formData.bullets
                  .filter((b) => b.enabled)
                  .map((bullet) => {
                    const BIcon = getIconComponent(bullet.icon);
                    const ip = cacheBustResolved(bullet.bulletImageUrl, bullet.bulletImage);
                    return (
                      <div
                        key={bullet.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                      >
                        <div className="w-7 h-7 flex items-center justify-center overflow-hidden">
                          {ip ? (
                            <img src={ip} alt="" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <BIcon className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[140px]">{bullet.title}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-2">
          <h2 className="font-semibold text-foreground text-lg">Legacy / SEO</h2>
          <p className="text-sm text-muted-foreground">
            If you still use the old single “services” image in your data, it appears as the first slide when a bullet has
            no carousel image. Alt text below applies to that legacy image and as a general fallback label.
          </p>
          <label className="text-sm font-medium text-foreground">Default / legacy image alt text</label>
          <input
            type="text"
            value={formData.imageAlt}
            onChange={(e) => setFormData((prev) => ({ ...prev, imageAlt: e.target.value }))}
            className="w-full mt-1.5 px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="Reset Services Page?"
        message="This restores default text and bullets to the server. Custom images in storage are cleaned up automatically."
        confirmLabel="Reset to Defaults"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </DashboardLayout>
  );
}
