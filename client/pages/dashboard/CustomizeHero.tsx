import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useCustomization } from "@/context/CustomizationContext";
import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import type { HeroStat } from "@shared/customization";
import { toast } from "sonner";

export default function CustomizeHero() {
  const { hero, updateHero, resetHero } = useCustomization();
  const [formData, setFormData] = useState(hero);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHero(formData);
      toast.success("Hero section saved!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setConfirmReset(false);
    try {
      await resetHero();
      setFormData(hero);
      toast.success("Hero section reset to defaults.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset.");
    }
  };

  const addStat = () => {
    const newStat: HeroStat = {
      id: Date.now().toString(),
      value: "100+",
      label: "New Stat",
      enabled: true,
    };
    setFormData((prev) => ({ ...prev, stats: [...prev.stats, newStat] }));
  };

  const updateStat = (id: string, field: keyof HeroStat, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const deleteStat = (id: string) => {
    setFormData((prev) => ({ ...prev, stats: prev.stats.filter((s) => s.id !== id) }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Customize Hero Section</h1>
            <p className="text-sm text-muted-foreground">
              Edit the homepage hero banner headline and social proof stats
            </p>
          </div>
          <div className="flex gap-2">
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

        <div className="space-y-6">
          {/* Headline */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-foreground text-lg">Hero Headline</h2>
            <div>
              <label className="text-sm font-medium text-foreground">Headline Text</label>
              <textarea
                value={formData.headline}
                onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
                rows={3}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background font-mono text-sm"
                placeholder={"Discover Handcrafted\nTreasures"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use a new line to split the headline into two lines. The second line will be highlighted in your primary color.
              </p>
            </div>

            {/* Live Preview */}
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Preview</p>
              <h1 className="font-display text-3xl font-bold text-foreground leading-tight">
                {(formData.headline || "").split("\n").map((line, i) => (
                  <span key={i} className={i === 1 ? "text-primary" : undefined}>
                    {line}
                    <br />
                  </span>
                ))}
              </h1>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-lg">Social Proof Stats</h2>
              <div className="flex items-center gap-3">
                {/* Stats section toggle */}
                <div className="flex items-center gap-2">
                  {formData.statsEnabled ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">Show stats</span>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, statsEnabled: !prev.statsEnabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.statsEnabled ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        formData.statsEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              These numbers appear below the hero headline. Toggle individual stats on or off, or hide all stats at once.
            </p>

            <div className="space-y-3">
              {formData.stats.map((stat) => (
                <div
                  key={stat.id}
                  className={`border rounded-lg p-4 transition-opacity ${
                    stat.enabled ? "border-border" : "border-border opacity-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Enabled toggle */}
                    <button
                      type="button"
                      onClick={() => updateStat(stat.id, "enabled", !stat.enabled)}
                      className={`mt-1 relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                        stat.enabled ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                      title={stat.enabled ? "Disable stat" : "Enable stat"}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                          stat.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>

                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Value</label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) => updateStat(stat.id, "value", e.target.value)}
                          placeholder="2500+"
                          className="w-full mt-1 px-2 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => updateStat(stat.id, "label", e.target.value)}
                          placeholder="Happy Customers"
                          className="w-full mt-1 px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => deleteStat(stat.id)}
                      className="mt-1 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addStat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:bg-muted transition-colors text-sm text-muted-foreground w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Stat
            </button>

            {/* Stats Preview */}
            {formData.statsEnabled && formData.stats.some((s) => s.enabled) && (
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Preview</p>
                <div className="flex items-center gap-8">
                  {formData.stats
                    .filter((s) => s.enabled)
                    .map((stat) => (
                      <div key={stat.id}>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={confirmReset}
        title="Reset Hero Section?"
        message="This will restore the headline and stats to their default values."
        confirmLabel="Reset to Defaults"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </DashboardLayout>
  );
}
