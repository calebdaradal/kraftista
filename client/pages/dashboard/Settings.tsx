import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useEffect, useState } from "react";
import { Save, Undo2, Loader2 } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { toast } from "sonner";

export default function Settings() {
  const { settings: globalSettings, updateSettings, uploadFavicon, uploadLogo, undoLogo, undoFavicon, uploadWideLogo, undoWideLogo } = useSettings();
  const [settings, setSettings] = useState(globalSettings);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingWideLogoFile, setPendingWideLogoFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [undoingLogo, setUndoingLogo] = useState(false);
  const [undoingFavicon, setUndoingFavicon] = useState(false);
  const [undoingWideLogo, setUndoingWideLogo] = useState(false);

  const [confirmReset, setConfirmReset] = useState<{ open: boolean; type: "logo" | "favicon" | "wide-logo" | null }>({
    open: false,
    type: null,
  });

  const DEFAULT_PRIMARY = "#c46c1a";
  const DEFAULT_SECONDARY = "#d4a574";

  const apiBase =
    typeof window === "undefined"
      ? "http://127.0.0.1:8000/api"
      : import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : `${window.location.origin}/api`);
  const assetBase = apiBase.replace(/\/api\/?$/, "");
  const resolveAssetUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    return `${assetBase}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  const [activeTab, setActiveTab] = useState<"general" | "branding" | "content" | "colors">("general");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextSettings = { ...settings };
      if (pendingLogoFile) {
        const logoUrl = await uploadLogo(pendingLogoFile);
        nextSettings.logoUrl = logoUrl;
        setPendingLogoFile(null);
      }
      if (pendingWideLogoFile) {
        const wideLogoUrl = await uploadWideLogo(pendingWideLogoFile);
        nextSettings.wideLogoUrl = wideLogoUrl;
        setPendingWideLogoFile(null);
      }
      await updateSettings(nextSettings);
      setSettings(nextSettings);
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleUndoWideLogo = async () => {
    setUndoingWideLogo(true);
    try {
      await undoWideLogo();
      toast.success("Wide logo reverted to previous.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to undo wide logo.");
    } finally {
      setUndoingWideLogo(false);
      setConfirmReset({ open: false, type: null });
    }
  };

  const handleFaviconUpload = async (file: File, inputEl: HTMLInputElement) => {
    setUploadingFavicon(true);
    try {
      await uploadFavicon(file);
      toast.success("Favicon uploaded!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload favicon.");
    } finally {
      setUploadingFavicon(false);
      inputEl.value = "";
    }
  };

  const handleUndoLogo = async () => {
    setUndoingLogo(true);
    try {
      await undoLogo();
      toast.success("Logo reverted to previous.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to undo logo.");
    } finally {
      setUndoingLogo(false);
      setConfirmReset({ open: false, type: null });
    }
  };

  const handleUndoFavicon = async () => {
    setUndoingFavicon(true);
    try {
      await undoFavicon();
      toast.success("Favicon reverted to previous.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to undo favicon.");
    } finally {
      setUndoingFavicon(false);
      setConfirmReset({ open: false, type: null });
    }
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "branding", label: "Branding" },
    { id: "content", label: "Content" },
    { id: "colors", label: "Colors" },
    { id: "reviews", label: "Reviews" },
  ] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your store's branding, content, and appearance</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* General */}
            {activeTab === "general" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">General Settings</h2>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-sm text-muted-foreground">
                  Hero headline and stats are managed in{" "}
                  <a href="/dashboard/customize/hero" className="text-primary font-semibold hover:underline">
                    Customize → Hero Section
                  </a>
                  .
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={settings.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={settings.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Branding */}
            {activeTab === "branding" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">Branding</h2>

                {/* Logo Mode Toggle */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-foreground">Logo Display Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["square", "wide"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSettings({ ...settings, logoMode: mode })}
                        className={[
                          "rounded-xl border-2 p-4 text-left transition-all",
                          (settings.logoMode ?? "square") === mode
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30",
                        ].join(" ")}
                      >
                        <p className="font-semibold text-foreground capitalize text-sm">{mode}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {mode === "square"
                            ? "1:1 logo with site name and subtitle"
                            : "Wide/rectangular logo without text"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    {(settings.logoMode ?? "square") === "wide" ? "Square Logo (fallback)" : "Logo"}
                  </label>
                  {settings.logoUrl && (
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={resolveAssetUrl(settings.logoUrl)}
                        alt="Current logo"
                        className="h-12 w-auto max-w-[8rem] object-contain rounded border border-border bg-muted/20 p-1"
                      />
                      {settings.hasLogoPrevious && (
                        <button
                          type="button"
                          onClick={() => setConfirmReset({ open: true, type: "logo" })}
                          disabled={undoingLogo}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          {undoingLogo ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Undo2 className="w-3.5 h-3.5" />
                          )}
                          Undo
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.gif,.svg"
                      onChange={(e) => {
                        const inputEl = e.currentTarget;
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setPendingLogoFile(file);
                        inputEl.value = "";
                      }}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a square logo (1:1 ratio, max 2MB). Saved when you click Save Settings.
                  </p>
                  {pendingLogoFile && (
                    <p className="text-xs text-primary">Selected: {pendingLogoFile.name}</p>
                  )}
                </div>

                {/* Wide Logo (shown only in wide mode) */}
                {(settings.logoMode ?? "square") === "wide" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">Wide Logo</label>
                    {settings.wideLogoUrl && (
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={resolveAssetUrl(settings.wideLogoUrl)}
                          alt="Current wide logo"
                          className="h-10 w-auto max-w-[12rem] object-contain rounded border border-border bg-muted/20 p-1"
                        />
                        {settings.hasWideLogoPrevious && (
                          <button
                            type="button"
                            onClick={() => setConfirmReset({ open: true, type: "wide-logo" })}
                            disabled={undoingWideLogo}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            {undoingWideLogo ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Undo2 className="w-3.5 h-3.5" />
                            )}
                            Undo
                          </button>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.gif,.svg"
                        onChange={(e) => {
                          const inputEl = e.currentTarget;
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setPendingWideLogoFile(file);
                          inputEl.value = "";
                        }}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a wide/horizontal logo (max 2MB). Saved when you click Save Settings.
                    </p>
                    {pendingWideLogoFile && (
                      <p className="text-xs text-primary">Selected: {pendingWideLogoFile.name}</p>
                    )}
                  </div>
                )}

                {/* Favicon */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Favicon</label>
                  {settings.faviconUrl && (
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={resolveAssetUrl(settings.faviconUrl)}
                        alt="Current favicon"
                        className="h-10 w-10 object-contain rounded border border-border bg-muted/20 p-1"
                      />
                      {settings.hasFaviconPrevious && (
                        <button
                          type="button"
                          onClick={() => setConfirmReset({ open: true, type: "favicon" })}
                          disabled={undoingFavicon}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          {undoingFavicon ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Undo2 className="w-3.5 h-3.5" />
                          )}
                          Undo
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".ico,.png,.jpg,.jpeg,.webp,.gif,.svg"
                      disabled={uploadingFavicon}
                      onChange={async (e) => {
                        const inputEl = e.currentTarget;
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await handleFaviconUpload(file, inputEl);
                      }}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
                    />
                    {uploadingFavicon && <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">Uploaded immediately on file selection (max 2MB).</p>
                </div>

                <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                  Featured products are managed under Products → Featured.
                </p>
              </div>
            )}

            {/* Content */}
            {activeTab === "content" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">Content</h2>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">About Us Text</label>
                  <textarea
                    name="aboutText"
                    value={settings.aboutText}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">This text appears on your About page</p>
                </div>
              </div>
            )}

            {/* Colors */}
            {activeTab === "colors" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">Color Palette</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="primaryColor"
                        value={settings.primaryColor}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        name="primaryColor"
                        value={settings.primaryColor}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="secondaryColor"
                        value={settings.secondaryColor}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        name="secondaryColor"
                        value={settings.secondaryColor}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        primaryColor: DEFAULT_PRIMARY,
                        secondaryColor: DEFAULT_SECONDARY,
                      }))
                    }
                    className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Revert to Default Colors
                  </button>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Color changes are reflected across the entire site after saving.
                  </p>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <div>
                  <h2 className="font-semibold text-foreground text-lg">Review Settings</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Control when customers can submit product reviews after delivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      Minimum days before review
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      How many days after delivery before a customer can submit a review.
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      name="reviewMinDays"
                      value={settings.reviewMinDays ?? 3}
                      onChange={(e) =>
                        setSettings({ ...settings, reviewMinDays: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      Review window (days)
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      The last day a customer can submit a review after delivery. After this, the option disappears.
                    </p>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      name="reviewMaxDays"
                      value={settings.reviewMaxDays ?? 7}
                      onChange={(e) =>
                        setSettings({ ...settings, reviewMaxDays: Math.max(1, Number(e.target.value)) })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                  <strong className="text-foreground">Example:</strong> With the current settings, customers can review
                  from day {settings.reviewMinDays ?? 3} up to day {settings.reviewMaxDays ?? 7} after their order is
                  marked as delivered.
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-6 space-y-4">
            <h2 className="font-semibold text-foreground">Preview</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Site Name</p>
                <p className="text-lg font-bold text-foreground">{settings.siteName}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Logo</p>
                {settings.logoUrl ? (
                  <img
                    src={resolveAssetUrl(settings.logoUrl)}
                    alt={`${settings.siteName} logo`}
                    className="max-h-16 w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="text-4xl">{settings.logo}</div>
                )}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Primary Color</p>
                <div
                  className="w-full h-12 rounded-lg border-2 border-border"
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <p className="text-xs text-muted-foreground mt-1 font-mono">{settings.primaryColor}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Undo Confirm Modal */}
      <ConfirmModal
        open={confirmReset.open}
        title={`Revert ${confirmReset.type === "logo" ? "Logo" : confirmReset.type === "wide-logo" ? "Wide Logo" : "Favicon"}?`}
        message={`This will replace the current ${confirmReset.type === "wide-logo" ? "wide logo" : confirmReset.type} with the previous one and delete the current file from storage.`}
        confirmLabel="Yes, Revert"
        cancelLabel="Keep Current"
        variant="warning"
        onConfirm={
          confirmReset.type === "logo"
            ? handleUndoLogo
            : confirmReset.type === "wide-logo"
              ? handleUndoWideLogo
              : handleUndoFavicon
        }
        onCancel={() => setConfirmReset({ open: false, type: null })}
      />
    </DashboardLayout>
  );
}
