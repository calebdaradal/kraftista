import { ConfirmModal } from "@/components/ConfirmModal";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCustomization } from "@/context/CustomizationContext";
import { api, resolveAssetUrl } from "@/lib/api";
import { DEFAULT_HERO_CUSTOMIZATION } from "@shared/customization";
import { ImageIcon, Loader2, RotateCcw, Save, Upload } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function getHeroImageUrl(imageUrl: string, imageRef?: string) {
  const resolved = imageUrl.startsWith("/api/") ? resolveAssetUrl(imageUrl) : imageUrl;
  if (!imageRef || !resolved) return resolved;
  return `${resolved}${resolved.includes("?") ? "&" : "?"}v=${encodeURIComponent(imageRef)}`;
}

export default function CustomizeHero() {
  const { hero, updateHero } = useCustomization();
  const [formData, setFormData] = useState(hero);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setFormData(hero), [hero]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHero(formData);
      toast.success("Hero image settings saved.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save hero settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      toast.error("You must be logged in to upload a hero image.");
      return;
    }

    setUploading(true);
    try {
      const result = await api.customization.uploadHeroImage(file, token);
      const next = { ...formData, image: result.image, imageUrl: result.image_url };
      setFormData(next);
      await updateHero(next);
      toast.success("Hero image replaced.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload hero image.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    setConfirmReset(false);
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      toast.error("You must be logged in to reset the hero image.");
      return;
    }

    setResetting(true);
    try {
      await api.customization.deleteHeroImage(token);
      await updateHero(DEFAULT_HERO_CUSTOMIZATION);
      setFormData(DEFAULT_HERO_CUSTOMIZATION);
      toast.success("Default hero image restored.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to restore the default hero image.");
    } finally {
      setResetting(false);
    }
  };

  const previewUrl = getHeroImageUrl(formData.imageUrl || "/HeaderImage.png", formData.image);
  const busy = saving || uploading || resetting;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Customize Hero Image</h1>
            <p className="text-sm text-muted-foreground">Manage the full-width image shown at the top of the homepage.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Restore Default
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>

        <section className="space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Homepage Banner</h2>
              <p className="text-sm text-muted-foreground">PNG, JPG, WebP, GIF, or SVG. Maximum file size: 5 MB.</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {formData.image ? "Replace Image" : "Upload Image"}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
            {previewUrl ? (
              <img src={previewUrl} alt={formData.imageAlt} className="block h-auto w-full" />
            ) : (
              <div className="flex aspect-[16/7] items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="hero-alt" className="text-sm font-medium text-foreground">Image description</label>
            <input
              id="hero-alt"
              type="text"
              value={formData.imageAlt}
              onChange={(event) => setFormData((current) => ({ ...current, imageAlt: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Describe the banner for screen readers"
            />
          </div>
        </section>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="Restore Default Hero Image?"
        message="The uploaded image will be removed and HeaderImage.png will be restored."
        confirmLabel="Restore Default"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </DashboardLayout>
  );
}
