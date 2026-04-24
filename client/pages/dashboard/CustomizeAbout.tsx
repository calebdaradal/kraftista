import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconSelector } from "@/components/IconSelector";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useCustomization } from "@/context/CustomizationContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef } from "react";
import { Trash2, Plus, Upload, X, Eye, EyeOff, Loader2 } from "lucide-react";
import type { AboutValue, AboutMilestone, AboutTeamMember } from "@shared/customization";
import { api } from "@/lib/api";
import { toast } from "sonner";

const apiBase =
  typeof window === "undefined"
    ? "http://127.0.0.1:8000/api"
    : import.meta.env.VITE_API_URL ||
      (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : `${window.location.origin}/api`);
const assetBase = apiBase.replace(/\/api\/?$/, "");
const resolveUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return `${assetBase}${path.startsWith("/") ? "" : "/"}${path}`;
};

type Tab = "hero" | "values" | "milestones" | "team" | "preview";

export default function CustomizeAbout() {
  const { about, updateAbout, resetAbout } = useCustomization();
  const { user } = useAuth();
  const [formData, setFormData] = useState(about);
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAbout(formData);
      toast.success("About page saved!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setConfirmReset(false);
    try {
      await resetAbout();
      setFormData(about);
      toast.success("About page reset to defaults.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset.");
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreviewImageUpload = async (file: File) => {
    const token = localStorage.getItem("craft_auth_token");
    if (!token) {
      toast.error("You must be logged in to upload images.");
      return;
    }
    setUploadingImage(true);
    try {
      const result = await api.customization.uploadPreviewImage(file, token);
      setFormData((prev) => ({
        ...prev,
        previewImage: result.preview_image_url,
        previewImageUrl: resolveUrl(result.preview_image_url),
      }));
      toast.success("Preview image uploaded!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Values
  const updateValue = (id: string, field: keyof AboutValue, value: string) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    }));
  };
  const deleteValue = (id: string) =>
    setFormData((prev) => ({ ...prev, values: prev.values.filter((v) => v.id !== id) }));
  const addValue = () => {
    const newValue: AboutValue = {
      id: Date.now().toString(),
      icon: "star",
      title: "New Value",
      description: "Add description here",
    };
    setFormData((prev) => ({ ...prev, values: [...prev.values, newValue] }));
  };

  // Milestones
  const updateMilestone = (id: string, field: keyof AboutMilestone, value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };
  const deleteMilestone = (id: string) =>
    setFormData((prev) => ({ ...prev, milestones: prev.milestones.filter((m) => m.id !== id) }));
  const addMilestone = () => {
    const newMilestone: AboutMilestone = {
      id: Date.now().toString(),
      year: new Date().getFullYear().toString(),
      title: "New Milestone",
      description: "Add description here",
    };
    setFormData((prev) => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
  };

  // Team
  const updateTeamMember = (id: string, field: keyof AboutTeamMember, value: string) => {
    setFormData((prev) => ({
      ...prev,
      team: prev.team.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };
  const deleteTeamMember = (id: string) =>
    setFormData((prev) => ({ ...prev, team: prev.team.filter((m) => m.id !== id) }));
  const addTeamMember = () => {
    const newMember: AboutTeamMember = {
      id: Date.now().toString(),
      name: "New Member",
      role: "Job Title",
    };
    setFormData((prev) => ({ ...prev, team: [...prev.team, newMember] }));
  };

  const SectionToggle = ({
    field,
    label,
  }: {
    field: "heroEnabled" | "valuesEnabled" | "milestonesEnabled" | "teamEnabled" | "previewSectionEnabled";
    label: string;
  }) => {
    const enabled = formData[field] !== false;
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 mb-4">
        <div className="flex items-center gap-2">
          {enabled ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <button
          type="button"
          onClick={() => handleFieldChange(field, !enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Customize About Page</h1>
            <p className="text-sm text-muted-foreground">Edit the content, layout, and visuals of your about page</p>
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

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          {(["hero", "values", "milestones", "team", "preview"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-xl border border-border bg-card p-6">
          {/* Hero Section */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <SectionToggle field="heroEnabled" label="Show Hero Section on About page" />
              <div>
                <label className="text-sm font-medium text-foreground">Hero Title</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => handleFieldChange("heroTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Hero Subtitle</label>
                <textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => handleFieldChange("heroSubtitle", e.target.value)}
                  rows={4}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
          )}

          {/* Values Section */}
          {activeTab === "values" && (
            <div className="space-y-6">
              <SectionToggle field="valuesEnabled" label="Show Values Section on About page" />
              <div>
                <label className="text-sm font-medium text-foreground">Section Title</label>
                <input
                  type="text"
                  value={formData.valuesTitle}
                  onChange={(e) => handleFieldChange("valuesTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Values</h3>
                  <button
                    onClick={addValue}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Value
                  </button>
                </div>
                {formData.values.map((value) => (
                  <div key={value.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Icon</label>
                          <IconSelector value={value.icon} onChange={(icon) => updateValue(value.id, "icon", icon)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={value.title}
                            onChange={(e) => updateValue(value.id, "title", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Description</label>
                          <textarea
                            value={value.description}
                            onChange={(e) => updateValue(value.id, "description", e.target.value)}
                            rows={2}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteValue(value.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones Section */}
          {activeTab === "milestones" && (
            <div className="space-y-6">
              <SectionToggle field="milestonesEnabled" label="Show Milestones Section on About page" />
              <div>
                <label className="text-sm font-medium text-foreground">Section Title</label>
                <input
                  type="text"
                  value={formData.milestonesTitle}
                  onChange={(e) => handleFieldChange("milestonesTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Milestones</h3>
                  <button
                    onClick={addMilestone}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Milestone
                  </button>
                </div>
                {formData.milestones.map((milestone) => (
                  <div key={milestone.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Year</label>
                          <input
                            type="text"
                            value={milestone.year}
                            onChange={(e) => updateMilestone(milestone.id, "year", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Description</label>
                          <textarea
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                            rows={2}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMilestone(milestone.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Section */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <SectionToggle field="teamEnabled" label="Show Team Section on About page" />
              <div>
                <label className="text-sm font-medium text-foreground">Section Title</label>
                <input
                  type="text"
                  value={formData.teamTitle}
                  onChange={(e) => handleFieldChange("teamTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Team Members</h3>
                  <button
                    onClick={addTeamMember}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </button>
                </div>
                {formData.team.map((member) => (
                  <div key={member.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(member.id, "name", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Role</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => updateTeamMember(member.id, "role", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTeamMember(member.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              <SectionToggle field="previewSectionEnabled" label="Show About Preview on Homepage" />

              {/* Preview Image Upload */}
              <div>
                <label className="text-sm font-medium text-foreground">Preview Image</label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  This image appears in the About preview section on the homepage. It will be displayed as-is with no background decoration.
                </p>

                {formData.previewImageUrl || formData.previewImage ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={resolveUrl(formData.previewImageUrl || formData.previewImage)}
                        alt={formData.previewImageAlt || "Preview"}
                        className="h-40 w-40 object-contain rounded-lg border border-border bg-muted/20"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, previewImage: undefined, previewImageUrl: undefined }))
                        }
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Replace Image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground w-full justify-center"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Preview Image
                      </>
                    )}
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.gif,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePreviewImageUpload(file);
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Preview Title</label>
                <input
                  type="text"
                  value={formData.previewTitle}
                  onChange={(e) => handleFieldChange("previewTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Image Alt Text</label>
                <input
                  type="text"
                  value={formData.previewImageAlt}
                  onChange={(e) => handleFieldChange("previewImageAlt", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={confirmReset}
        title="Reset About Page?"
        message="This will restore all About page content to its default values. This cannot be undone."
        confirmLabel="Reset to Defaults"
        variant="danger"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </DashboardLayout>
  );
}
